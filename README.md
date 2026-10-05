# Rogue Dodge — Godot Prototype v0.2

Production prototype for the core combat loop.

## Current gameplay
- Left / Right dodge only.
- 3 HP.
- Enemy wind-up + audio cue.
- Normal Dodge and Perfect Dodge timing windows.
- Successful dodge auto-counters.
- Flow increases on Perfect Dodge and resets when hit.
- Three enemy timings: Swordsman, Heavy Knight, Rogue.
- PC + mobile touch input from the same codebase.

## PC controls
- `A` or `Left Arrow`: Dodge Left
- `D` or `Right Arrow`: Dodge Right
- `R`: Restart

## Mobile controls
- Tap left half of screen: Dodge Left
- Tap right half of screen: Dodge Right

Duck and Jump are intentionally not implemented yet.

## Rendering / platform strategy
The project uses Godot's `gl_compatibility` renderer so the same project can target:
- Windows/macOS/Linux for fast development testing
- Web for fixed-link testing on a phone
- Native Android for final touch/audio latency testing

## Export presets
`export_presets.cfg` contains:
- `Web` → `build/web/index.html`
- `Android Debug` → `build/android/rogue_dodge_debug.apk`

Godot export templates must be installed locally before exporting.
For Android export from desktop, configure OpenJDK 17 and the Android SDK in Godot.

## Fixed mobile test URL with GitHub Pages
A GitHub Actions workflow is included at:

`.github/workflows/deploy_web.yml`

Once this project is in a GitHub repository:
1. Use `main` as the default branch.
2. Open the repository's **Settings → Pages**.
3. Under Build and deployment, choose **GitHub Actions**.
4. Push to `main`.
5. The workflow exports the Godot Web build and publishes it to GitHub Pages.
6. Save that Pages URL on your phone.

After that, future updates only require refreshing the same URL.

## Native Android testing
Web is for rapid iteration. Native Android should still be tested periodically because touch latency, audio latency and frame pacing can differ from a mobile browser.


<!-- pages-trigger: enabled -->
