# _dev

Build sources, not published (GitHub Pages' Jekyll build skips folders starting with `_`).

- `og.html`, `icon.html`: sources for `og-image.png`, `apple-touch-icon.png`, `favicon.ico`.
  Rebuild with `zsh _dev/build-images.sh` from the repo root while the preview server runs.
- `capdeploy_reference.py`: independent reference for the CapDeploy pocket calculator
  (Newton IRR instead of the site's bisection). Run `python3 _dev/capdeploy_reference.py` and
  compare with `window.__capdeploy` in the browser console.
