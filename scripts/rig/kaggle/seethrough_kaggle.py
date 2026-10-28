# see-through on a free Kaggle GPU (T4, 16 GB).
# Input: every PNG in the attached dataset. Output: /kaggle/working/seethrough.zip
# (one folder per image: layer PNGs + layered PSD).
import glob
import os
import shutil
import subprocess
import sys

REPO = "/kaggle/working/see-through"
OUT = "/kaggle/working/out"
RESOLUTION = "1024"   # see-through only gives the layer edges here; the colours come from the original


def sh(cmd, cwd=None):
    print("$", cmd, flush=True)
    subprocess.run(cmd, shell=True, check=True, cwd=cwd)


sh("nvidia-smi")
sh(f"git clone -q --depth 1 https://github.com/shitagaki-lab/see-through {REPO}")
# Kaggle's own torch (CUDA) stays; only the model stack is pinned to the repo's versions.
sh(
    "pip install -q diffusers==0.37.0 transformers==5.0.0 huggingface-hub==1.7.2 "
    "accelerate==1.13.0 safetensors==0.7.0 kornia==0.8.2 omegaconf==2.3.0 einops==0.8.2 "
    "'psd-tools[composite]==1.14.2' pycocotools pillow-jxl-plugin==1.3.7 "
    "git+https://github.com/huggingface/pytorch-image-models@6e3fdda39508db30766f9d9e6ec32380ebee8b8c"
)
sh(f"pip install -q --no-deps -e {REPO}/common")
sh("ln -sf common/assets assets", cwd=REPO)

# Images already split by an earlier run are left out (a run stops at Kaggle's 12-hour limit,
# ~70 min per image); empty = every image in the dataset.
ONLY = {f"wear-{n}.png" for n in (
    "coat-shoes", "coat-top", "smart-bottom", "smart-top",
    "suit-bottom", "suit-shoes", "tux-bottom", "tux-shoes",
)}
images = sorted(glob.glob("/kaggle/input/**/*.png", recursive=True))
images = [p for p in images if not ONLY or os.path.basename(p) in ONLY]
print("images:", images, flush=True)
src = "/kaggle/working/in"
os.makedirs(src, exist_ok=True)
for path in images:
    shutil.copy(path, src)

# A T4 has no bf16 attention kernel: torch falls back to the plain one, which holds the whole
# attention matrix (8-20 GB when the layers decode together). Loaded into the inference process
# (sitecustomize): attention runs in fp16, one batch item at a time, on the memory-efficient kernel.
PATCH = "/kaggle/working/patch"
os.makedirs(PATCH, exist_ok=True)
with open(f"{PATCH}/sitecustomize.py", "w") as f:
    f.write('''
import torch
import torch.nn.functional as F
_sdpa = F.scaled_dot_product_attention
def _lean_sdpa(q, k, v, *args, **kwargs):
    if q.dtype != torch.bfloat16 or q.dim() < 3:
        return _sdpa(q, k, v, *args, **kwargs)
    mask = kwargs.pop("attn_mask", args[0] if args else None)
    rest = dict(kwargs)
    out = []
    for i in range(q.shape[0]):
        m = None if mask is None else (mask[i:i + 1] if mask.shape[0] == q.shape[0] else mask)
        m = None if m is None else (m.half() if m.dtype == torch.bfloat16 else m)
        out.append(_sdpa(q[i:i + 1].half(), k[i:i + 1].half(), v[i:i + 1].half(), attn_mask=m, **rest).to(q.dtype))
    return torch.cat(out)
F.scaled_dot_product_attention = _lean_sdpa
torch.nn.functional.scaled_dot_product_attention = _lean_sdpa
print("lean attention on", flush=True)
''')
env = dict(os.environ, PYTHONPATH=f"{PATCH}:{REPO}/common", PYTORCH_CUDA_ALLOC_CONF="expandable_segments:True")
cmd = [
    sys.executable, "inference/scripts/inference_psd.py",
    "--srcp", src, "--save_dir", OUT, "--resolution", RESOLUTION,
    "--save_to_psd", "--tblr_split", "--group_offload", "--disable_progressbar",
]
print("$", " ".join(cmd), flush=True)
subprocess.run(cmd, check=True, cwd=REPO, env=env)

shutil.make_archive("/kaggle/working/seethrough", "zip", OUT)
shutil.rmtree(REPO)
shutil.rmtree(src)
print("done:", os.listdir(OUT))
