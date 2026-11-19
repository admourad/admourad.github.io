#!/bin/zsh
# Rebuilds og-image.png, apple-touch-icon.png and favicon.ico from the HTML sources in _dev/.
# Needs Google Chrome and Python with Pillow. Run from the repo root while the preview server is up
# (python3 -m http.server 4173), so the og page can load its Google Fonts.
set -e
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP=$(mktemp -d)
"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=6000 \
  --window-size=1200,630 --screenshot="$PWD/og-image.png" http://127.0.0.1:4173/_dev/og.html
"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=512,512 --screenshot="$TMP/icon.png" http://127.0.0.1:4173/_dev/icon.html
python3 - "$TMP/icon.png" <<'EOF'
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
im.resize((180, 180), Image.LANCZOS).save("apple-touch-icon.png", optimize=True)
im.save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
EOF
python3 -c "from PIL import Image; im=Image.open('og-image.png'); im.convert('RGB').save('og-image.png', optimize=True); print('og', im.size)"
rm -rf "$TMP"
echo done
