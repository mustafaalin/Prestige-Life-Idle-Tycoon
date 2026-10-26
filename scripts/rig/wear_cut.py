"""Outfit parts cut straight from the outfit pictures, without see-through.

Each wear picture is the mannequin with one garment added (art/pilot/18-rig/wear-<outfit>-<part>.png),
so the garment is where the picture differs from the mannequin. Legs and feet do not move in the rig,
so nothing hidden behind them has to be drawn; only the hands hang over the trousers: the arms are
taken out of the garment (they are their own layers) and the trousers behind them are filled in from
around, for when the near arm is raised.
Tops are split three ways like see-through's hoodie layers: each garment pixel goes to the
mannequin part it lies on or nearest to (near arm, which is in front, then torso, then far arm); each
sleeve carries its hand (the bare arms are hidden when a top is worn); the body behind the near arm,
and the far sleeve behind the body, are filled in from around (they show when the arms move).
Writes art/pilot/18-rig/rig-dressed/<outfit>-<part>/<layer>.png on see-through's 1280 canvas, like
project_layers.py, with the layer names gen3.py reads (bottomwear, footwear; for tops
00-handwear-l = far sleeve, 05-topwear = body, 06-handwear-r = near sleeve).
Usage: python3 scripts/rig/wear_cut.py [outfit ...]   (default: all six)
"""
import os, sys
import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from sans_cut import cut

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
R = os.path.join(ROOT, "art/pilot/18-rig/")
OUTFITS = ["work", "smart", "coat", "suit", "threepiece", "tux"]
PARTS = {"bottom": "bottomwear", "shoes": "footwear"}
TOP_LAYERS = {"far": "00-handwear-l", "body": "05-topwear", "near": "06-handwear-r"}
H, OX = 1280, 213          # see-through's canvas: the picture fitted by height, centred
BG = np.array([213.0, 213.0, 212.0])
ARMS = ["00-handwear-l", "05-handwear-r"]


def canvas(name):
    im = Image.open(R + name).convert("RGB").resize((round(1024 * H / 1536), H), Image.LANCZOS)
    c = Image.new("RGB", (1280, 1280), tuple(int(v) for v in BG))
    c.paste(im, (OX, 0))
    return np.asarray(c)


manken = canvas("manken.png").astype(int)
arms = np.zeros((1280, 1280), np.uint8)
for a in ARMS:
    arms |= (np.asarray(Image.open(f"{R}seethrough-manken/layers/{a}.png"))[..., 3] > 40).astype(np.uint8)
arms = cv2.dilate(arms, np.ones((5, 5), np.uint8))
def manken_layer(name, cut_=40):
    return (np.asarray(Image.open(f"{R}seethrough-manken/layers/{name}.png"))[..., 3] > cut_).astype(np.uint8)
# Trousers cover the shorts wherever the tank top does not: those pixels belong to the trousers even
# where a dark pair barely differs from the dark shorts.
SHORTS = manken_layer("04-bottomwear") & (1 - manken_layer("06-topwear")) & (1 - arms)
FEET_FROM = 1050   # canvas row: shoes are looked for below it only
NEAR, FAR, TANK = manken_layer("05-handwear-r"), manken_layer("00-handwear-l"), manken_layer("06-topwear")
HEAD = manken_layer("08-face") | manken_layer("19-front hair") | manken_layer("01-back hair") | manken_layer("07-ears")
DISK = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))


def clean(m, min_area=800):
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, DISK(6))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    m = np.isin(lab, [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= min_area]).astype(np.uint8)
    ff = m.copy(); cv2.floodFill(ff, None, (0, 0), 1)
    return m | (1 - ff)


# px: how far a sleeve reaches out from the bare arm under it, on the arm's outer side and on the side
# toward the body (there the jacket's body starts right away; the far sleeve shows only a sliver
# beside the body, wider it takes the breast pocket)
SLEEVE = {"near": (34, 6), "far": (12, 0)}
WRIST = {"near": 622, "far": 642}  # canvas rows (gen3 JOINTS): below them a sleeve takes no garment,
                                   # only its hand (a coat's skirt hangs beside the hand)


def fill(rgb, src, hidden):
    """hidden pixels take the colour of the nearest pixel of src (the part itself, not the
    background), softened a little."""
    _, idx = cv2.distanceTransformWithLabels((1 - src).astype(np.uint8), cv2.DIST_L2, 5,
                                             labelType=cv2.DIST_LABEL_PIXEL)
    ys, xs = np.nonzero(src)
    lut = np.zeros((idx.max() + 1, 3), np.uint8)
    lut[idx[ys, xs]] = rgb[ys, xs]
    near = lut[idx]
    near = cv2.GaussianBlur(near, (0, 0), 3)
    out = rgb.copy()
    out[hidden > 0] = near[hidden > 0]
    return out


def top(im):
    """{layer: rgba} for a top: far sleeve, body, near sleeve."""
    g = (np.abs(im.astype(int) - manken).max(axis=2) > 26).astype(np.uint8) | TANK
    g = clean(g) & (1 - HEAD)
    alpha = cut(im, BG)
    # background closed in between an arm and the body: cut() keeps it (not reached from the border)
    dist = np.linalg.norm(im.astype(float) - BG, axis=2)
    n, lab, stats, _ = cv2.connectedComponentsWithStats((dist < 16).astype(np.uint8), connectivity=4)
    holes = np.isin(lab, [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= 60])
    alpha[holes] = 0
    worn = g | NEAR | FAR                          # the sleeves carry the hands
    # label: on the near arm -> near (it is in front); on the torso -> body; else the nearest of
    # the two arms if it is within a sleeve's width of it, otherwise body
    d_near, d_tank, d_far = (cv2.distanceTransform(1 - m, cv2.DIST_L2, 5) for m in (NEAR, TANK, FAR))
    label = np.ones(g.shape, np.uint8)
    rows = np.arange(g.shape[0])[:, None]
    def reach(arm, side):
        """per pixel: the sleeve's reach there (outer or inner side of the arm's centre in that row;
        the near arm is on the body's left, the far arm on its right)."""
        m = NEAR if arm == "near" else FAR
        xs = np.arange(m.shape[1])[None, :]
        cnt = m.sum(axis=1, keepdims=True)
        centre = np.where(cnt > 0, (m * xs).sum(axis=1, keepdims=True) / np.maximum(cnt, 1), -1)
        outer = (xs < centre) if side == "left" else (xs > centre)
        out, inner = SLEEVE[arm]
        return np.where(outer, out, inner)
    label[(d_near < reach("near", "left")) & (d_near <= d_far) & (d_near < d_tank) & (rows < WRIST["near"])] = 0
    label[(d_far < reach("far", "right")) & (d_far < d_near) & (d_far < d_tank) & (rows < WRIST["far"])] = 2
    label[NEAR > 0] = 0
    label[(NEAR == 0) & (TANK > 0)] = 1
    # the hands: skin at a hand below its wrist (the picture's hand differs a little from the
    # mannequin's, so not only the mannequin's hand pixels; not the coat's skirt beside it)
    c = im.astype(int)
    skin = (c[..., 0] > 150) & (c[..., 0] - c[..., 2] > 40)
    label[skin & (rows >= WRIST["near"] - 40) & (d_near < 12)] = 0
    label[skin & (NEAR == 0) & (rows >= WRIST["far"] - 40) & (d_far < 12)] = 2
    out = {}
    for k, name in enumerate(["near", "body", "far"]):
        m = cv2.morphologyEx((worn & (label == k)).astype(np.uint8), cv2.MORPH_OPEN, DISK(2))
        n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
        if n > 1:   # the part itself, without stray bits the split left on its edge
            m = (lab == 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
        # background-grey pixels reached from outside the part (the gap between an arm and the body,
        # lighter than the background, so cut() and the hole test above miss them)
        _, lab = cv2.connectedComponents((((dist < 24) & (m > 0)) | (m == 0)).astype(np.uint8), connectivity=4)
        outside = np.isin(lab, np.unique(lab[m == 0])) & (lab > 0)
        m = (m.astype(bool) & ~outside).astype(np.uint8)
        rgb, a = im.copy(), alpha * m
        hidden = None
        if name == "body":     # behind the near arm: inside the body's outline (its convex hull)
            hull = np.zeros_like(m)
            cv2.fillPoly(hull, [cv2.convexHull(cv2.findNonZero(m))], 1)
            hidden = hull & NEAR & (1 - m)
        if name == "far":      # behind the body, a band along the far sleeve's edge
            hidden = cv2.dilate(m, DISK(30)) & FAR & (1 - m)
        if hidden is not None and hidden.any():
            # colour from a few px inside the part: its very edge is light (anti-aliased background)
            rgb = fill(rgb, cv2.erode((m & (alpha > 0.98)).astype(np.uint8), DISK(4)), hidden)
            a = np.maximum(a, hidden.astype(float))
        out[TOP_LAYERS[name]] = np.dstack([rgb, (a * 255).astype(np.uint8)])
    return out


def garment(im, part):
    """soft mask of the pixels that differ from the mannequin, with the arms taken out and the
    garment under them filled in. White shoes over white socks differ little: a lower threshold
    there (feet only, nothing else changes in that picture)."""
    m = (np.abs(im.astype(int) - manken).max(axis=2) > (26 if part == "bottom" else 12)).astype(np.uint8)
    if part == "bottom":
        m |= SHORTS
    else:
        m[:FEET_FROM] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    m = np.isin(lab, [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= 800]).astype(np.uint8)
    ff = m.copy(); cv2.floodFill(ff, None, (0, 0), 1)
    m |= 1 - ff
    m &= 1 - arms
    # under a hand: close the garment across the arm (only there) and paint it from around
    under = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (61, 61))) & arms
    rgb = im.copy()
    if under.any():
        rgb = cv2.inpaint(np.ascontiguousarray(rgb), under, 9, cv2.INPAINT_TELEA)
    alpha = cut(im, BG) * m
    alpha = np.maximum(alpha, under.astype(float))
    return rgb, alpha


if __name__ == "__main__":
    for o in sys.argv[1:] or OUTFITS:
        os.makedirs(f"{R}rig-dressed/{o}-top", exist_ok=True)
        for layer, rgba in top(canvas(f"wear-{o}-top.png")).items():
            Image.fromarray(rgba).save(f"{R}rig-dressed/{o}-top/{layer}.png")
        for part, layer in PARTS.items():
            im = canvas(f"wear-{o}-{part}.png")
            rgb, a = garment(im, part)
            os.makedirs(f"{R}rig-dressed/{o}-{part}", exist_ok=True)
            Image.fromarray(np.dstack([rgb, (a * 255).astype(np.uint8)])).save(f"{R}rig-dressed/{o}-{part}/{layer}.png")
            ys, xs = np.nonzero(a > 0.5)
            print(o, part, "box", xs.min(), ys.min(), xs.max(), ys.max(), "under-arm px", int((a > 0.5)[arms > 0].sum()))
