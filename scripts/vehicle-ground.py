#!/usr/bin/env python3
"""vehicle-ground.py IN.webp OUT.webp [x0,y0,x1,y1 ...]: clears the light grey ground left around a cut vehicle's wheels.

cutout-vehicle.sh keeps grey that has something solid below it, and the dark contact shadow counts as
solid, so the ground seen beside and between the wheels can stay as light patches (scene board,
2026-10-21: pickup, executive sedan, grand car). Here such grey turns into the same translucent black
as the shadow when it touches the outside or the shadow. Grey hubcaps and rims stay: the tyre's dark
ring closes them off. A grey wedge walled in by the opaque shadow under a tyre is not reached that way;
boxes given after OUT (pixels of IN) clear every grey in them. MARK=1 and ONLY_BOXES=1: see below. Run on 2026-10-21:
  vehicle-10 720,430,850,475 95,370,160,410 330,455,410,505 · vehicle-pickup 730,490,860,545 · vehicle-6 735,455,800,482
  vehicle-2, -3, -4, -5, -8 without boxes · ONLY_BOXES=1: vehicle-1 0,585,85,632 136,612,170,694 ·
  vehicle-motorcycle 412,710,446,758 · vehicle-7 108,370,150,404 734,466,756,490 (spokes, chrome, silver paint)
Check the result on a coloured background: a box too big also eats grey chrome (the sedan's lower grille). Needs ImageMagick (`magick`) for webp in and out.
"""
import colorsys
import os
import subprocess
import sys
from collections import deque

SRC, OUT = sys.argv[1], sys.argv[2]
W, H = (int(v) for v in subprocess.check_output(['magick', 'identify', '-format', '%w %h', SRC]).split())
px = bytearray(subprocess.check_output(['magick', SRC, '-depth', '8', 'rgba:-']))


def at(x, y):
    i = (y * W + x) * 4
    return px[i], px[i + 1], px[i + 2], px[i + 3]


solid_rows = [y for y in range(H) if any(at(x, y)[3] > 200 for x in range(0, W, 2))]
band = solid_rows[0] + int((solid_rows[-1] - solid_rows[0]) * 0.55)
BOXES = [tuple(int(v) for v in box.split(',')) for box in sys.argv[3:]]
# MARK=1 paints what would be cleared bright red instead, to check it before the real run.
# ONLY_BOXES=1 clears nothing outside the boxes (for bodies with chrome or silver paint near the ground).
MARK = os.environ.get('MARK') == '1'
ONLY_BOXES = os.environ.get('ONLY_BOXES') == '1'


def boxed(x, y):
    return any(x0 <= x <= x1 and y0 <= y <= y1 for x0, y0, x1, y1 in BOXES)


def ground(x, y):
    """Light grey; in a box also the mid grey of a shaded wedge (a tyre is far darker)."""
    r, g, b, a = at(x, y)
    if a < 20 or y < band:
        return False
    hue, light, sat = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    return sat < 0.18 and light > (0.2 if boxed(x, y) else 0.33)


def open_edge(x, y):
    """Next to the outside or to the shadow (translucent)."""
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if not (0 <= nx < W and 0 <= ny < H):
            return True
        r, g, b, a = at(nx, ny)
        if a < 230:
            return True
    return False


seen = bytearray(W * H)
queue = deque()
for y in range(band, H):
    for x in range(W):
        if ground(x, y) and (boxed(x, y) or (not ONLY_BOXES and open_edge(x, y))):
            seen[y * W + x] = 1
            queue.append((x, y))
while queue:
    x, y = queue.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < W and band <= ny < H and not seen[ny * W + nx] and ground(nx, ny) and (not ONLY_BOXES or boxed(nx, ny)):
            seen[ny * W + nx] = 1
            queue.append((nx, ny))

changed = 0
for index, flag in enumerate(seen):
    if flag:
        i = index * 4
        light = (px[i] + px[i + 1] + px[i + 2]) / 765
        # As cutout-vehicle.sh's shadow: black, as opaque as the grey was dark.
        changed += 1
        if MARK:
            px[i], px[i + 1], px[i + 2], px[i + 3] = 255, 0, 0, 255
            continue
        px[i] = px[i + 1] = px[i + 2] = 0
        px[i + 3] = round(255 * min(1, max(0, (0.84 - light) * 2.4)))

subprocess.run(
    ['magick', '-size', f'{W}x{H}', '-depth', '8', 'rgba:-', '-quality', '82', '-define', 'webp:alpha-quality=90', OUT],
    input=bytes(px),
    check=True,
)
print(f'{SRC}: {changed} px of ground cleared')
