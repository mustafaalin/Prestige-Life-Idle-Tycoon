#!/bin/zsh
# cutout.sh IN OUT [stripPx]: flat light-grey background → transparent (flood fill from the corners,
# low tolerance so grey clothes survive), then the soft contact shadow in the bottom strip
# (bright, unsaturated pixels) → transparent. Trims the result.
IN=$1; OUT=$2; STRIP=${3:-160}
W=$(sips -g pixelWidth $IN|awk '/pixel/{print $2}'); H=$(sips -g pixelHeight $IN|awk '/pixel/{print $2}')
TOP=$((H-STRIP))
magick $IN -alpha set -fuzz 7% -fill none \
  -draw "color 0,0 floodfill" -draw "color $((W-1)),0 floodfill" \
  -draw "color 0,$((H-1)) floodfill" -draw "color $((W-1)),$((H-1)) floodfill" \
  -channel A -fx "(j>=$TOP && saturation<0.15 && lightness>0.5) ? 0 : a" \
  -morphology Erode Disk:1 -blur 0x0.7 +channel -trim +repage $OUT
