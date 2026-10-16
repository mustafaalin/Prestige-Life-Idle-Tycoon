#!/bin/zsh
# cutout-pale.sh IN OUT.webp [BAND%]: a luxury craft (boat, yacht, helicopter, jet) on flat light grey →
# webp with no ground shadow (they float or fly; 2026-10-16, replaces cutout-vehicle.sh for them).
# Their bodies are warm (red above blue) even where shaded; the background and its cast shadow are
# neutral grey. Neutral pixels connected to the outside, below BAND% of the height, become transparent.
IN=$1; OUT=$2; BANDP=${3:-30}
W=$(magick identify -format '%w' $IN); H=$(magick identify -format '%h' $IN)
BAND=$((H*BANDP/100))
T=$(mktemp -d)
# Neutral mask: white = neutral grey (r-b small and low saturation).
magick $IN -fx "((r-b)<0.03 && saturation<0.12) ? 1 : 0" -colorspace Gray -threshold 50% $T/n.png
# Outside: neutral connected to the corners (flood fill the white mask with grey from the corners).
magick $T/n.png -fill gray50 -fuzz 1% \
  -draw "color 0,0 floodfill" -draw "color $((W-1)),0 floodfill" \
  -draw "color 0,$((H-1)) floodfill" -draw "color $((W-1)),$((H-1)) floodfill" \
  -fx "(abs(u-0.5)<0.1) ? 1 : 0" $T/out.png
# ENCLOSED=N: also light neutral gaps the outside cannot reach, below N% of the height (between a helicopter's skids).
if [[ -n $ENCLOSED ]]; then
  magick $IN -fx "(j>=$((H*ENCLOSED/100)) && (r-b)<0.03 && saturation<0.12 && lightness>0.5) ? 1 : 0" -colorspace Gray $T/gap.png
  magick $T/out.png $T/gap.png -fx "max(u,v)" -colorspace Gray $T/out2.png && mv $T/out2.png $T/out.png
fi
# Above the band only the flat background goes (classic flood fill), so chrome rails stay.
magick $IN -alpha set -fuzz 4% -fill none \
  -draw "color 0,0 floodfill" -draw "color $((W-1)),0 floodfill" \
  -alpha extract -negate $T/bgtop.png
magick $T/out.png $T/bgtop.png -fx "(j>=$BAND) ? u : v" -negate $T/alpha.png
magick $IN $T/alpha.png -alpha off -compose CopyOpacity -composite \
  -channel A -morphology Open Disk:2 -morphology Erode Disk:1 -blur 0x0.8 +channel -trim +repage \
  -resize '900x900>' -quality 82 -define webp:alpha-quality=90 $OUT
rm -rf $T
