"""Unpack the Kaggle see-through PSDs into the layer folders project_layers.py reads.

The Kaggle run works at 1024 px; the ModelScope layers the rig was built on are 1280. Both fit the
1024x1536 picture into the square by height, centred, so 1024 -> 1280 is a plain 1.25x scale.
Writes art/pilot/18-rig/seethrough-<picture>/layers/NN-<layer>.png (PSD order, bottom first),
for every PSD in the output folder.
Usage: python3 scripts/rig/kaggle/import_psd.py [art/pilot/18-rig/kaggle/out-outfits/out]
"""
import glob, os, sys
from PIL import Image
from psd_tools import PSDImage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
R = os.path.join(ROOT, "art/pilot/18-rig/")
SRC = sys.argv[1] if len(sys.argv) > 1 else R + "kaggle/out-outfits/out"
SIZE = 1280

for f in sorted(glob.glob(f"{SRC}/wear-*.psd")):
    if f.endswith("_depth.psd"):
        continue
    psd = PSDImage.open(f)
    out = f"{R}seethrough-{os.path.basename(f)[len('wear-'):-4]}/layers/"
    os.makedirs(out, exist_ok=True)
    for old in glob.glob(out + "*.png"):
        os.remove(old)
    for i, layer in enumerate(psd):
        canvas = Image.new("RGBA", psd.size, (0, 0, 0, 0))
        canvas.paste(layer.topil().convert("RGBA"), layer.bbox[:2])
        canvas.resize((SIZE, SIZE), Image.LANCZOS).save(f"{out}{i:02d}-{layer.name}.png")
    print(os.path.basename(f), len(psd), "layers")
