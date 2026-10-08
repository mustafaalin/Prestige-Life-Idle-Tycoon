#!/bin/sh
# `npm run backup`: copies the local-only folders (kept out of git, see .gitignore) to Google Drive
# via Drive for desktop: My Drive/Prestige Life yedek/. Only new or changed files are copied.
set -e
cd "$(dirname "$0")/.."
DRIVE=$(ls -d "$HOME"/Library/CloudStorage/GoogleDrive-*/"My Drive" 2>/dev/null | head -1)
if [ -z "$DRIVE" ]; then
  echo "Google Drive (Drive for desktop) bulunamadı: uygulamayı açıp giriş yap." >&2
  exit 1
fi
TARGET="$DRIVE/Prestige Life yedek"
mkdir -p "$TARGET"
rsync -a --exclude .DS_Store art gpt-astra-inceleme "rich inc oyun görselleri" "$TARGET/"
echo "Yedeklendi: $TARGET"
