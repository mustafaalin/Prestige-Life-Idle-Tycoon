"""Face patches for the angled rig: eye states (blink, half blink, glances) and mouths
(expressions, talking), cut from the side face close-ups.

Each face-*.png close-up is fitted onto the rig's canvas (rotation + scale + shift, SIFT on the
parts of the head that do not change: hair, ears, nose, jaw), then the region around each eye or
the mouth is cut with a soft elliptical edge, kept inside the face layer and colour-matched to the
mannequin's skin around it.
Writes art/pilot/18-rig/rig-dressed/{eyes,mouth}/<state>[-<l|r>].png on the 1280 canvas (same as
the other layers, so gen3.py stacks them with no offsets) and a preview sheet.

Usage: python3 scripts/rig/face_patches.py <preview.png>
"""
import glob, os, sys
import cv2
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
R = os.path.join(ROOT, "art/pilot/18-rig/")
LAYERS = R + "rig-dressed/manken/"
OUT = R + "rig-dressed/"
EYES = ["neutral", "look-left", "look-right", "halfblink", "blink"]
MOUTHS = ["smile", "laugh", "sad", "talk-a", "talk-e", "talk-o"]
PAD = {"r": (10, 9), "l": (8, 9)}  # extra room around each eye's lash box (x, y)
MOUTH_PAD = (14, 9, 12, 20)        # left, top, right, bottom of the mouth layer (laughing opens down)


def layer(name):
    return cv2.imread(glob.glob(LAYERS + f"*-{name}.png")[0], cv2.IMREAD_UNCHANGED)


def canvas():
    c = np.full((1280, 1280, 3), 217, np.float32)
    for f in sorted(glob.glob(LAYERS + "*.png")):
        im = cv2.imread(f, cv2.IMREAD_UNCHANGED).astype(np.float32)
        a = im[..., 3:] / 255
        c = c * (1 - a) + im[..., :3] * a
    return c.astype(np.uint8)


def bbox(alpha):
    ys, xs = np.nonzero(alpha > 0)
    return xs.min(), ys.min(), xs.max(), ys.max()


def eye_box(s):
    x0, y0, x1, y1 = bbox(sum(layer(f"{k}-{s}")[..., 3].astype(int) for k in ("eyelash", "eyewhite")))
    px, py = PAD[s]
    return x0 - px, y0 - py, x1 + px, y1 + py


def mouth_box():
    x0, y0, x1, y1 = bbox(layer("mouth")[..., 3])
    l, t, r, b = MOUTH_PAD
    return x0 - l, y0 - t, x1 + r, y1 + b


CAN = canvas()
FACE = layer("face")[..., 3].astype(np.float32) / 255   # patches stay inside the face outline
BOXES = {"eyes": {s: eye_box(s) for s in "rl"}, "mouth": {"": mouth_box()}}
fx0, fy0, fx1, fy1 = bbox(layer("face")[..., 3])
HEAD = (fx0 - 50, fy0 - 60, fx1 + 50, fy1 + 10)

sift = cv2.SIFT_create()
def keypoints(img, mask):
    return sift.detectAndCompute(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), mask)

hm = np.zeros(CAN.shape[:2], np.uint8)
hm[HEAD[1]:HEAD[3], HEAD[0]:HEAD[2]] = 255
for b in BOXES["eyes"].values():  # eyes and brows change between the close-ups
    hm[b[1] - 25:b[3] + 4, b[0] - 6:b[2] + 6] = 0
b = BOXES["mouth"][""]
hm[b[1]:b[3] + 6, b[0] - 6:b[2] + 6] = 0
big = cv2.resize(CAN, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)  # closer to the close-ups' scale
kc, dc = keypoints(big, cv2.resize(hm, None, fx=3, fy=3, interpolation=cv2.INTER_NEAREST))


def fit(img):
    """Similarity transform close-up -> canvas."""
    k, d = keypoints(img, None)
    m = cv2.BFMatcher().knnMatch(d, dc, k=2)
    good = [a for a, b in m if a.distance < 0.75 * b.distance]
    src = np.float32([k[g.queryIdx].pt for g in good])
    dst = np.float32([kc[g.trainIdx].pt for g in good]) / 3
    M, inl = cv2.estimateAffinePartial2D(src, dst, ransacReprojThreshold=2.0, maxIters=5000)
    return M, int(inl.sum()), len(good)


def soft_mask(w, h, feather):
    m = np.zeros((h, w), np.float32)
    cv2.ellipse(m, (w // 2, h // 2), (int(w / 2 - feather), int(h / 2 - feather)), 0, 0, 360, 1, -1)
    return cv2.GaussianBlur(m, (0, 0), feather / 2)


def cut(w, box, path):
    x0, y0, x1, y1 = box
    crop = w[y0:y1, x0:x1].astype(np.float32)
    base = CAN[y0:y1, x0:x1].astype(np.float32)
    inside = FACE[y0:y1, x0:x1]
    # Match the skin tone at the patch's rim to the mannequin's, so the edge disappears.
    rim = (soft_mask(x1 - x0, y1 - y0, 4) < 0.5) & (inside > 0.99)
    crop += base[rim].mean(0) - crop[rim].mean(0)
    full = np.zeros((1280, 1280, 4), np.uint8)
    full[y0:y1, x0:x1, :3] = np.clip(crop, 0, 255)
    full[y0:y1, x0:x1, 3] = (soft_mask(x1 - x0, y1 - y0, 5) * inside * 255).astype(np.uint8)
    cv2.imwrite(path, full)


report = {}
for st in sorted(set(EYES) | set(MOUTHS)):
    img = cv2.imread(R + f"face-{st}.png")
    M, inl, n = fit(img)
    sc = float(np.hypot(*M[0, :2]))
    report[st] = f"{inl}/{n} inliers, scale {sc:.3f}, rot {np.degrees(np.arctan2(M[1, 0], M[0, 0])):.2f}"
    w = cv2.warpAffine(img, M, (1280, 1280), flags=cv2.INTER_AREA if sc < 1 else cv2.INTER_CUBIC)
    for group, states in (("eyes", EYES), ("mouth", MOUTHS)):
        if st in states:
            os.makedirs(OUT + group, exist_ok=True)
            for s, box in BOXES[group].items():
                cut(w, box, OUT + f"{group}/{st}{'-' + s if s else ''}.png")

for k, v in report.items():
    print(k, v)
print("boxes", BOXES)

# Preview, 4x: the original head, then each state's patches over it.
x0, y0 = BOXES["eyes"]["r"][0] - 30, BOXES["eyes"]["r"][1] - 30
x1, y1 = BOXES["eyes"]["l"][2] + 15, BOXES["mouth"][""][3] + 12
tiles = [CAN[y0:y1, x0:x1]]
for group, states in (("eyes", EYES), ("mouth", MOUTHS)):
    for st in states:
        c = CAN.astype(np.float32)
        for f in glob.glob(OUT + f"{group}/{st}*.png"):
            p = cv2.imread(f, cv2.IMREAD_UNCHANGED).astype(np.float32)
            a = p[..., 3:] / 255
            c = c * (1 - a) + p[..., :3] * a
        tiles.append(c[y0:y1, x0:x1].astype(np.uint8))
tiles = [cv2.resize(t, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC) for t in tiles]
tiles += [np.zeros_like(tiles[0])] * (-len(tiles) % 4)
cv2.imwrite(sys.argv[1], np.vstack([np.hstack(tiles[i:i + 4]) for i in range(0, len(tiles), 4)]))
