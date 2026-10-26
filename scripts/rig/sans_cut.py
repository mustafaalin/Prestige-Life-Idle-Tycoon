"""Şans: cut the base pose out of its flat grey background, and probe the picture.
Writes art/pilot/19-sans-rig/rig/sans.png (RGBA) and prints the background colour and the dog's box.
Usage: python3 scripts/rig/sans_cut.py
"""
import os
import cv2
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
D = os.path.join(ROOT, "art/pilot/19-sans-rig/")

def cut(rgb, bg, tol=16, soft=14):
    """alpha: background = pixels connected to the border within `tol` of the background colour;
    the edge gets a soft ramp by colour distance (tol .. tol + soft)."""
    dist = np.linalg.norm(rgb.astype(float) - bg, axis=2)
    near = (dist < tol).astype(np.uint8)
    n, lab = cv2.connectedComponents(near, connectivity=4)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    back = np.isin(lab, list(border))
    # holes inside the dog that look like background stay opaque; the ramp only on the outside edge
    ring = cv2.dilate(back.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool) & ~back
    a = np.ones(dist.shape)
    a[back] = 0
    a[ring] = np.clip((dist[ring] - tol) / soft, 0, 1)
    return a

if __name__ == "__main__":
    im = np.asarray(Image.open(D + "sans-base.png").convert("RGB"))
    corners = np.concatenate([im[:40, :40], im[:40, -40:], im[-40:, :40], im[-40:, -40:]]).reshape(-1, 3)
    bg = np.median(corners, axis=0)
    a = cut(im, bg)
    # unmix the grey from the soft edge (colour = a * fur + (1 - a) * grey), so no light halo
    edge = (a > 0.05) & (a < 1)
    rgb = im.astype(float)
    rgb[edge] = np.clip((rgb[edge] - (1 - a[edge, None]) * bg) / a[edge, None], 0, 255)
    out = np.dstack([rgb.astype(np.uint8), (a * 255).astype(np.uint8)])
    os.makedirs(D + "rig", exist_ok=True)
    Image.fromarray(out).save(D + "rig/sans.png")
    ys, xs = np.nonzero(a > 0.5)
    print("bg", bg, "box", xs.min(), ys.min(), xs.max(), ys.max())
