"""Eye patches for the angled rig: blink, half blink and gaze, cut from the side face close-ups.

Each face-*.png close-up is fitted onto the rig's canvas (rotation + scale + shift, SIFT on the
parts of the head that do not change: hair, ears, nose, jaw), then the region around each eye is
cut with a soft elliptical edge and colour-matched to the mannequin's skin around it.
Writes art/pilot/18-rig/rig-dressed/eyes/<state>-<l|r>.png on the 1280 canvas (same as the other
layers, so gen3.py stacks them with no offsets) and a preview sheet.

Usage: python3 scripts/rig/eye_patches.py <preview.png>
"""
import glob, os, sys
import cv2
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
R = os.path.join(ROOT, "art/pilot/18-rig/")
LAYERS = R + "rig-dressed/manken/"
OUT = R + "rig-dressed/eyes/"
STATES = ["neutral", "look-left", "look-right", "halfblink", "blink"]
PAD = {"r": (10, 9), "l": (8, 9)}  # extra room around each eye's lash box (x, y)


def layer(name):
    return cv2.imread(glob.glob(LAYERS + f"*-{name}.png")[0], cv2.IMREAD_UNCHANGED)


def canvas():
    c = np.full((1280, 1280, 3), 217, np.float32)
    for f in sorted(glob.glob(LAYERS + "*.png")):
        im = cv2.imread(f, cv2.IMREAD_UNCHANGED).astype(np.float32)
        a = im[..., 3:] / 255
        c = c * (1 - a) + im[..., :3] * a
    return c.astype(np.uint8)


def eye_box(s):
    ys, xs = np.nonzero(sum(layer(f"{k}-{s}")[..., 3] for k in ("eyelash", "eyewhite")) > 0)
    px, py = PAD[s]
    return xs.min() - px, ys.min() - py, xs.max() + px, ys.max() + py


CAN = canvas()
BOXES = {s: eye_box(s) for s in "rl"}
fx0, fy0, fx1, fy1 = cv2.boundingRect(cv2.findNonZero((layer("face")[..., 3] > 0).astype(np.uint8)))
HEAD = (fx0 - 50, fy0 - 60, fx0 + fx1 + 50, fy0 + fy1 + 10)

sift = cv2.SIFT_create()
def keypoints(img, mask):
    return sift.detectAndCompute(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), mask)

hm = np.zeros(CAN.shape[:2], np.uint8)
hm[HEAD[1]:HEAD[3], HEAD[0]:HEAD[2]] = 255
for b in BOXES.values():  # eyes and brows change between the close-ups
    hm[b[1] - 25:b[3] + 4, b[0] - 6:b[2] + 6] = 0
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


os.makedirs(OUT, exist_ok=True)
report, warped = {}, {}
for st in STATES:
    img = cv2.imread(R + f"face-{st}.png")
    M, inl, n = fit(img)
    sc = float(np.hypot(*M[0, :2]))
    report[st] = f"{inl}/{n} inliers, scale {sc:.3f}, rot {np.degrees(np.arctan2(M[1, 0], M[0, 0])):.2f}"
    w = cv2.warpAffine(img, M, (1280, 1280), flags=cv2.INTER_AREA if sc < 1 else cv2.INTER_CUBIC)
    warped[st] = w
    for s, (x0, y0, x1, y1) in BOXES.items():
        crop = w[y0:y1, x0:x1].astype(np.float32)
        base = CAN[y0:y1, x0:x1].astype(np.float32)
        # Match the skin tone at the patch's rim to the mannequin's, so the edge disappears.
        rim = soft_mask(x1 - x0, y1 - y0, 4) < 0.5
        crop += base[rim].mean(0) - crop[rim].mean(0)
        a = soft_mask(x1 - x0, y1 - y0, 5)
        full = np.zeros((1280, 1280, 4), np.uint8)
        full[y0:y1, x0:x1, :3] = np.clip(crop, 0, 255)
        full[y0:y1, x0:x1, 3] = (a * 255).astype(np.uint8)
        cv2.imwrite(OUT + f"{st}-{s}.png", full)

for k, v in report.items():
    print(k, v)
print("boxes", BOXES)

# Preview: original head, then each state's patches over it, 4x.
x0, y0, x1, y1 = BOXES["r"][0] - 30, min(BOXES["r"][1], BOXES["l"][1]) - 30, BOXES["l"][2] + 15, max(BOXES["r"][3], BOXES["l"][3]) + 30
tiles = [CAN[y0:y1, x0:x1]]
for st in STATES:
    c = CAN.astype(np.float32)
    for s in "rl":
        p = cv2.imread(OUT + f"{st}-{s}.png", cv2.IMREAD_UNCHANGED).astype(np.float32)
        a = p[..., 3:] / 255
        c = c * (1 - a) + p[..., :3] * a
    tiles.append(c[y0:y1, x0:x1].astype(np.uint8))
tiles = [cv2.resize(t, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC) for t in tiles]
sheet = np.vstack([np.hstack(tiles[:3]), np.hstack(tiles[3:])])
cv2.imwrite(sys.argv[1], sheet)
