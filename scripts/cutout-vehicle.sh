#!/bin/zsh
# cutout-vehicle.sh IN OUT.webp [--spokes]: a vehicle on flat light grey (art-brief §3) → scene-ready webp.
# The background goes (flood fill from the corners, low tolerance so beige paint survives); the soft grey
# contact shadow under the wheels turns into a translucent black one, so it darkens any ground instead of
# leaving a light smear. --spokes also clears grey enclosed by wheels and frames (bikes, scooters).
IN=$1; OUT=$2
W=$(magick identify -format '%w' $IN); H=$(magick identify -format '%h' $IN)
TMP=$(mktemp -d)
EXTRA=()
[[ $3 == --spokes ]] && EXTRA=(-fuzz 3% -transparent "$(magick $IN -format '%[pixel:p{5,5}]' info:)")
magick $IN -alpha set -fuzz 7% -fill none \
  -draw "color 0,0 floodfill" -draw "color $((W-1)),0 floodfill" \
  -draw "color 0,$((H-1)) floodfill" -draw "color $((W-1)),$((H-1)) floodfill" \
  $EXTRA $TMP/a.png
# The shadow band: the bottom 150 px of what is left.
BOTTOM=$(magick $TMP/a.png -alpha extract -threshold 50% -format '%@' info: | awk -F'[x+]' '{print $2+$4}')
SHADOW="(j>=$((BOTTOM-150)) && saturation<0.12 && lightness>0.3)"
magick $TMP/a.png -channel A -fx "$SHADOW ? min(1,max(0,(0.84-lightness)*2.4))*a : a" \
  -channel RGB -fx "$SHADOW ? 0 : u" +channel \
  -channel A -morphology Erode Disk:1 -blur 0x0.7 +channel -trim +repage \
  -resize '900x900>' -quality 82 -define webp:alpha-quality=90 $OUT
rm -rf $TMP
