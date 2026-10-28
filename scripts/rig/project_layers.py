"""Put the original picture's pixels back into its see-through layers.

see-through redraws every layer: a little softer than the original, with an outline along each
layer's edge (a line across the neck, an arc on the shoulder). Here each canvas pixel goes to
the layer that is on top there, and that layer takes the original's colour; see-through's own
pixels stay only where nothing shows them at rest (behind other layers) and on the soft
silhouette edge. At rest the rig then matches the original exactly.

Also fixes two things see-through got wrong for the rig:
- the shorts' waistband was painted into the tank layer (it showed above the jeans);
- the hood's inside was filled dark over the neck; the neck shows there in the original.
And some trousers are drawn a little slimmer than the mannequin's legs; they are widened over
the leg that would show beside them, in the colour of the nearest trouser pixel.

The other outfits' pictures (wear-<outfit>-<part>.png) go the same way once their see-through
layers are in seethrough-<outfit>-<part>/ (scripts/rig/kaggle/import_psd.py); an outfit without
them keeps wear_cut.py's parts.

Usage: python3 scripts/rig/project_layers.py   (writes art/pilot/18-rig/rig-dressed/<source>/<layer>.png)
"""
import glob, os, re, shutil
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
R = os.path.join(ROOT, "art/pilot/18-rig/")
OUT = R + "rig-dressed/"
SOURCES = {"manken": "manken.png", "hoodie": "wear-hoodie.png", "jeans": "wear-jeans.png",
           "sneakers": "wear-sneakers.png"}
# see-through fits the 1024x1536 picture into its 1280 square canvas by height, centred.
H, OX = 1280, 213


def original(name):
    im = Image.open(R + name).convert("RGB").resize((round(1024 * H / 1536), H), Image.LANCZOS)
    canvas = Image.new("RGB", (1280, 1280))
    canvas.paste(im, (OX, 0))
    return np.asarray(canvas)


def project(src, picture):
    files = sorted(glob.glob(f"{R}seethrough-{src}/layers/*.png"))  # PSD order, bottom first
    layers = [np.array(Image.open(f).convert("RGBA")) for f in files]
    orig = original(picture)
    alphas = [a[..., 3].astype(float) / 255 for a in layers]
    # How much of each pixel the layers above a layer cover, and the whole stack covers.
    above = [None] * len(layers)
    cover = np.zeros((1280, 1280))
    for i in range(len(layers) - 1, -1, -1):
        above[i] = cover.copy()
        cover = cover + alphas[i] * (1 - cover)
    inside = cover > 0.98   # off the soft silhouette edge, where the original is mixed with its background
    os.makedirs(OUT + src, exist_ok=True)
    out = {}
    for i, (f, a) in enumerate(zip(files, layers)):
        # Every layer that shows at a pixel, even through a soft edge above it, takes the
        # original's colour there, so the stack adds up to the original with no seam lines.
        take = inside & (alphas[i] > 0) & (above[i] < 0.98)
        a[take, :3] = orig[take]
        out[os.path.basename(f)[:-4]] = a
    return out, orig


def save(src, layers):
    for name, a in layers.items():
        Image.fromarray(a).save(f"{OUT}{src}/{name}.png")


manken, _ = project("manken", SOURCES["manken"])
# Under the eyes the face layer keeps see-through's closed lids (a blink hides the eyes and
# shows them); the original's eye rim, taken in at the eyes' soft edge, would ring them.
eyes = np.zeros((1280, 1280), bool)
for n in ("11-eyewhite-r", "12-eyewhite-l", "13-irides-l", "14-irides-r", "15-eyelash-l", "16-eyelash-r"):
    eyes |= manken[n][..., 3] > 0
eyes = np.array(Image.fromarray((eyes * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
st_face = np.array(Image.open(f"{R}seethrough-manken/layers/08-face.png").convert("RGBA"))
manken["08-face"][eyes] = st_face[eyes]
# Waistband: dark rows at the bottom of the tank layer move into the shorts layer.
tank, shorts = manken["06-topwear"], manken["04-bottomwear"]
lum = tank[..., :3].astype(int).mean(2)
band = np.zeros(lum.shape, bool)
band[545:] = (lum[545:] < 140) & (tank[545:, :, 3] > 0)
band = np.array(Image.fromarray((band * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0
band[:545] = False
moved = tank.copy(); moved[~band] = 0
tank[band, 3] = 0
s = Image.fromarray(shorts); s.alpha_composite(Image.fromarray(moved))
manken["04-bottomwear"] = np.array(s)
save("manken", manken)

hoodie, orig = project("hoodie", SOURCES["hoodie"])
# Hood: open the skin-coloured part inside it so the mannequin's neck (under the hoodie) shows.
top = hoodie["05-topwear"]
r, g, b = (orig[..., k].astype(int) for k in range(3))
# Skin is light; the backpack strap beside it is the same hue but darker.
skin = (r > 180) & (g > 115) & (b > 85) & (r - b > 40) & (r >= g) & (g > b)
zone = np.zeros(skin.shape, bool)
zone[195:300, 580:700] = True
hole = skin & zone & (top[..., 3] > 0)
hole = np.array(Image.fromarray((hole * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))
                .filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1))).astype(float) / 255
top[..., 3] = (top[..., 3] * (1 - hole)).astype(np.uint8)
save("hoodie", hoodie)

for src in ("jeans", "sneakers"):
    save(src, project(src, SOURCES[src])[0])

# see-through filed these trousers under another layer name (gen3.py reads the same one).
TROUSERS = {"tux-bottom": "legwear"}
HEM = 40   # rows above the hem where the leg (sock, ankle) may show below the trousers


def cover_legs(layers, name):
    """Widen the trousers over the mannequin's leg wherever it would show beside them."""
    key = next(k for k in layers if re.sub(r"^\d+-", "", k) == name)
    t = layers[key]
    legs = manken["02-legwear"][..., 3]
    rows = np.where((t[..., 3] > 40).any(1))[0]
    leak = (legs > 8) & (t[..., 3] < np.maximum(legs, 250))   # the leg's soft edge too
    leak[: rows.min()] = False
    leak[rows.max() - HEM:] = False
    if not leak.any():
        return
    _, (iy, ix) = ndimage.distance_transform_edt(t[..., 3] <= 200, return_indices=True)
    t[leak, :3] = t[iy[leak], ix[leak], :3]
    t[leak, 3] = np.maximum(t[leak, 3], legs[leak])
    print(f"  {key}: covered {int(leak.sum())} px of leg")


# Outfits split by see-through replace wear_cut.py's parts for that picture.
for d in sorted(glob.glob(f"{R}seethrough-*-*/layers")):
    src = d.split("seethrough-")[1].split("/")[0]
    shutil.rmtree(OUT + src, ignore_errors=True)
    layers = project(src, f"wear-{src}.png")[0]
    if src.endswith("-bottom"):
        cover_legs(layers, TROUSERS.get(src, "bottomwear"))
    save(src, layers)
    print(src)
print("done")
