#!/usr/bin/env bash
# Downloads Microsoft Fluent Emoji 3D icons (MIT) into public/images with app-specific names.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/images
BASE=https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets
mkdir -p "$OUT"

# local-name | repo path (relative to assets/)
ASSETS=(
  "flame-mascot.png|Fire/3D/fire_3d.png"
  "wave.png|Waving hand/Default/3D/waving_hand_3d_default.png"
  "target.png|Bullseye/3D/bullseye_3d.png"
  "plate.png|Fork and knife with plate/3D/fork_and_knife_with_plate_3d.png"
  "protein.png|Flexed biceps/Default/3D/flexed_biceps_3d_default.png"
  "water.png|Droplet/3D/droplet_3d.png"
  "log-meal.png|Camera with flash/3D/camera_with_flash_3d.png"
  "scan-bill.png|Receipt/3D/receipt_3d.png"
  "plan-week.png|Spiral calendar/3D/spiral_calendar_3d.png"
  "recipes.png|Cook/Default/3D/cook_3d_default.png"
  "breakfast.png|Pancakes/3D/pancakes_3d.png"
  "lunch.png|Green salad/3D/green_salad_3d.png"
  "dinner.png|Spaghetti/3D/spaghetti_3d.png"
  "snack.png|Red apple/3D/red_apple_3d.png"
  "search.png|Magnifying glass tilted left/3D/magnifying_glass_tilted_left_3d.png"
)

fail=0
for entry in "${ASSETS[@]}"; do
  name="${entry%%|*}"; path="${entry#*|}"
  url="$BASE/${path// /%20}"
  if curl -fsSL "$url" -o "$OUT/$name" && head -c 8 "$OUT/$name" | od -An -tx1 | tr -d ' \n' | grep -q '^89504e470d0a1a0a$'; then
    echo "ok   $name"
  else
    echo "FAIL $name  <- $path" >&2; rm -f "$OUT/$name"; fail=1
  fi
done

curl -fsSL https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/LICENSE -o "$OUT/LICENSE-fluent-emoji.txt"
exit $fail
