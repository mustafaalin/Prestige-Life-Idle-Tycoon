"""
Outfit sprite sheet → animated WebP converter
Usage:
  python3 scripts/convert_outfit.py <outfit_number> <idle_spritesheet> <celebrate_spritesheet>

Example:
  python3 scripts/convert_outfit.py 2 ~/Downloads/ch2-idle.png ~/Downloads/ch2-celebrate.png

Assumptions:
  - Idle sheet:     6 columns × 6 rows = 36 frames, 2.5s animation
  - Celebrate sheet: 5 columns × 5 rows = 25 frames, 2s animation
  - Output goes to: public/assets/outfits/
"""

import sys
import os
from PIL import Image

OUTFITS_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'outfits')


def slice_sheet(path, cols, rows):
    img = Image.open(path).convert('RGBA')
    fw = img.width // cols
    fh = img.height // rows
    return [
        img.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh))
        for r in range(rows)
        for c in range(cols)
    ]


def save_webp(frames, output_path, duration_ms, quality=75):
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
    print(f"  ✓ {os.path.basename(output_path)}  →  {size_kb}KB")


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)

    outfit_num  = sys.argv[1]
    idle_path   = os.path.expanduser(sys.argv[2])
    celeb_path  = os.path.expanduser(sys.argv[3])

    if not os.path.exists(idle_path):
        print(f"ERROR: idle file not found: {idle_path}")
        sys.exit(1)
    if not os.path.exists(celeb_path):
        print(f"ERROR: celebrate file not found: {celeb_path}")
        sys.exit(1)

    print(f"\nOutfit {outfit_num}")
    print(f"  Idle:      {idle_path}")
    print(f"  Celebrate: {celeb_path}\n")

    # IDLE — 36 frames, her 2. kare alınır (18 frame), 7fps
    all_idle = slice_sheet(idle_path, cols=6, rows=6)
    idle_frames = all_idle[::2]   # 36 → 18 frame
    idle_out = os.path.join(OUTFITS_DIR, f'ch-{outfit_num}-idle.webp')
    save_webp(idle_frames, idle_out, duration_ms=139, quality=75)

    # CELEBRATE — 25 frames, tamamı kullanılır, 12.5fps
    celeb_frames = slice_sheet(celeb_path, cols=5, rows=5)
    celeb_out = os.path.join(OUTFITS_DIR, f'ch-{outfit_num}-celebrate.webp')
    save_webp(celeb_frames, celeb_out, duration_ms=80, quality=80)

    print("\nDone! Dosyaları projeye ekle ve git push et.")


if __name__ == '__main__':
    main()
