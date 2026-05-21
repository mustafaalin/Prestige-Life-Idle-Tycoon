"""
Outfit animator → animated WebP converter

İki mod desteklenir:

  1. FRAMES modu — Ludo.ai "Download All Frames" çıktısı (ayrı PNG dosyaları):
     python3 scripts/convert_outfit.py <num> frames <idle_dir> <dur_s> <celebrate_dir> <dur_s>

  2. SHEET modu — Sprite sheet (eski yöntem):
     python3 scripts/convert_outfit.py <num> sheet <idle.png> <cols>x<rows> <dur_s> <celebrate.png> <cols>x<rows> <dur_s>

Örnekler:
  python3 scripts/convert_outfit.py 2 frames ~/Downloads/idle_frames 2.5 ~/Downloads/celeb_frames 2.0
  python3 scripts/convert_outfit.py 3 sheet ~/Downloads/idle.png 6x6 2.5 ~/Downloads/celeb.png 5x5 2.0

Output: public/assets/outfits/ch-<num>-idle.webp + ch-<num>-celebrate.webp
"""

import sys
import os
import glob
from PIL import Image

OUTFITS_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'outfits')


def load_frames_from_dir(dirpath):
    dirpath = os.path.expanduser(dirpath)
    pngs = sorted(glob.glob(os.path.join(dirpath, '*.png')))
    if not pngs:
        print(f"ERROR: No PNG files found in: {dirpath}")
        sys.exit(1)
    frames = [Image.open(p).convert('RGBA') for p in pngs]
    print(f"  Frames dir: {dirpath}")
    print(f"  Found {len(frames)} frames  ({frames[0].width}x{frames[0].height} each)")
    return frames


def slice_sheet(path, cols, rows):
    img = Image.open(os.path.expanduser(path)).convert('RGBA')
    fw = img.width // cols
    fh = img.height // rows
    frames = [
        img.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh))
        for r in range(rows)
        for c in range(cols)
    ]
    print(f"  Sheet: {img.width}x{img.height}  →  {len(frames)} frames ({fw}x{fh} each)")
    return frames


def save_webp(frames, output_path, duration_ms, quality):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration_ms,
        loop=0,
        quality=quality,
        method=6,
    )
    size_kb = os.path.getsize(output_path) // 1024
    print(f"  ✓ {os.path.basename(output_path)}  →  {size_kb}KB  ({len(frames)} frames, {duration_ms}ms/frame)")


def parse_grid(s):
    parts = s.lower().split('x')
    return int(parts[0]), int(parts[1])


def thin_frames(frames, dur_s):
    total = len(frames)
    if total > 20:
        thinned = frames[::2]
        ms = int(dur_s * 1000 / total * 2)
        print(f"  Thinned: {total} → {len(thinned)} frames")
        return thinned, ms
    return frames, int(dur_s * 1000 / total)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    num  = sys.argv[1]
    mode = sys.argv[2] if len(sys.argv) > 2 else ''

    if mode == 'frames':
        # frames <idle_dir> <dur_s> <celeb_dir> <dur_s>
        if len(sys.argv) != 7:
            print(__doc__)
            sys.exit(1)
        idle_dir   = sys.argv[3]
        idle_dur   = float(sys.argv[4])
        celeb_dir  = sys.argv[5]
        celeb_dur  = float(sys.argv[6])

        print(f"\n[Idle]  mode=frames  dur={idle_dur}s")
        idle_frames, idle_ms = thin_frames(load_frames_from_dir(idle_dir), idle_dur)
        save_webp(idle_frames, os.path.join(OUTFITS_DIR, f'ch-{num}-idle.webp'), idle_ms, quality=85)

        print(f"\n[Celebrate]  mode=frames  dur={celeb_dur}s")
        celeb_frames = load_frames_from_dir(celeb_dir)
        celeb_ms = int(celeb_dur * 1000 / len(celeb_frames))
        save_webp(celeb_frames, os.path.join(OUTFITS_DIR, f'ch-{num}-celebrate.webp'), celeb_ms, quality=85)

    elif mode == 'sheet':
        # sheet <idle.png> <cols>x<rows> <dur_s> <celeb.png> <cols>x<rows> <dur_s>
        if len(sys.argv) != 9:
            print(__doc__)
            sys.exit(1)
        idle_path  = sys.argv[3]
        idle_grid  = parse_grid(sys.argv[4])
        idle_dur   = float(sys.argv[5])
        celeb_path = sys.argv[6]
        celeb_grid = parse_grid(sys.argv[7])
        celeb_dur  = float(sys.argv[8])

        print(f"\n[Idle]  mode=sheet  grid={idle_grid[0]}x{idle_grid[1]}  dur={idle_dur}s")
        idle_frames, idle_ms = thin_frames(slice_sheet(idle_path, *idle_grid), idle_dur)
        save_webp(idle_frames, os.path.join(OUTFITS_DIR, f'ch-{num}-idle.webp'), idle_ms, quality=75)

        print(f"\n[Celebrate]  mode=sheet  grid={celeb_grid[0]}x{celeb_grid[1]}  dur={celeb_dur}s")
        celeb_frames = slice_sheet(celeb_path, *celeb_grid)
        celeb_ms = int(celeb_dur * 1000 / len(celeb_frames))
        save_webp(celeb_frames, os.path.join(OUTFITS_DIR, f'ch-{num}-celebrate.webp'), celeb_ms, quality=80)

    else:
        print(__doc__)
        sys.exit(1)

    print("\nDone!")


if __name__ == '__main__':
    main()
