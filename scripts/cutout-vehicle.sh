#!/bin/zsh
# cutout-vehicle.sh IN OUT.webp [--spokes]: a vehicle on flat light grey (art-brief §3) → scene-ready webp.
# The background goes (flood fill from the corners, low tolerance so beige paint survives); the soft grey
# contact shadow under the wheels turns into a translucent black one, so it darkens any ground instead of
# leaving a light smear. --spokes also clears grey enclosed by wheels and frames (bikes, scooters).
# White or cream bodies (boats, jets): FUZZ=3.5 PALE=1, or the flood fill eats the shaded hull and the
# shadow rule takes the pale underside for ground (the four luxury toys, 2026-10-13).
IN=$1; OUT=$2
FUZZ=${FUZZ:-7}
W=$(magick identify -format '%w' $IN); H=$(magick identify -format '%h' $IN)
TMP=$(mktemp -d)
EXTRA=()
[[ $3 == --spokes ]] && EXTRA=(-fuzz 3% -transparent "$(magick $IN -format '%[pixel:p{5,5}]' info:)")
magick $IN -alpha set -fuzz ${FUZZ}% -fill none \
  -draw "color 0,0 floodfill" -draw "color $((W-1)),0 floodfill" \
  -draw "color 0,$((H-1)) floodfill" -draw "color $((W-1)),$((H-1)) floodfill" \
  $EXTRA $TMP/a.png
# Shadow = light grey in the bottom 30% of what is left (high enough to catch the ground seen between
# the wheels) with nothing solid below it in its column. Grey with paint or tyre under it is the car
# itself: a chrome bumper, a hubcap.
BAND=$(magick $TMP/a.png -alpha extract -threshold 50% -format '%@' info: | awk -F'[x+]' '{print int($4+$2*0.7)}')
# Grey, or light with a tint: bright paint colours the ground next to the car.
GREY="((saturation<0.12 && lightness>0.3) || (saturation<0.6 && lightness>0.7))"
[[ -n $PALE ]] && GREY="(saturation<0.12 && lightness>0.3 && lightness<0.80)"
magick $TMP/a.png -channel RGBA -fx "(a>0.5 && !$GREY) ? 1 : 0" -alpha off -colorspace Gray \
  -morphology Dilate "1x${H}+0+$((H-1)):$(printf '1,%.0s' {2..$H})1" $TMP/solid-below.png
magick $TMP/a.png -channel RGBA -fx "(a>0 && j>=$BAND && $GREY) ? 1 : 0" -alpha off -colorspace Gray \
  $TMP/solid-below.png -compose Minus_Src -composite -threshold 50% $TMP/shadow.png
# In the shadow: black, as opaque as the grey was dark. Elsewhere: the picture as it is.
magick $TMP/a.png -alpha off -fx "1-min(1,max(0,(0.84-lightness)*2.4))" -colorspace Gray $TMP/shadow.png \
  -compose Multiply -composite -negate \( $TMP/a.png -alpha extract \) -compose Multiply -composite $TMP/alpha.png
magick $TMP/a.png -alpha off \( $TMP/shadow.png -negate \) -compose Multiply -composite \
  $TMP/alpha.png -compose CopyOpacity -composite \
  -channel A -morphology Erode Disk:1 -blur 0x0.7 +channel -trim +repage \
  -resize '900x900>' -quality 82 -define webp:alpha-quality=90 $OUT
rm -rf $TMP
