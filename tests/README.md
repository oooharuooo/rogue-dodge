# Gameplay regression checks

Run with Godot 4.7.2:

```sh
godot --headless --path . --script tests/regression.gd
```

The deployment workflow runs this suite before exporting. It rejects a nonzero exit,
script/runtime errors, failed assertions or a missing completion summary.
Test scripts are excluded from the Web export.

The harness inherits the production game methods and builds the real UI. It replaces
only save access, audio playback, random pattern scheduling and exchange scheduling.
Player progress is never read or written. Save round-trip tests use a disposable file
inside `tests/` and remove that file after checking it.

Coverage:

- Independent expected damage sequences for all four weapons and eight upgrades.
- 384 state combinations comparing HUD preview and actual counter damage, including
  weapon resources, upgrade combinations and level 0/1/2 damage skills.
- Mastery boundaries at 7/8 and 19/20 XP, per-weapon isolation, same-run upgrade
  availability, exclusion of owned upgrades and no progression in Dev Test.
- All five skills, timing-window changes and permanent collection unlock thresholds.
- Normal/perfect/failed timing, four dodge directions, commitment lock, keyboard,
  center click/touch zones, side taps, swipe thresholds and short-drag suppression.
- 100 actual timed melee/projectile attacks across all five enemies with normal and
  perfect auto dodge. These use shortened test windups without changing damage rules.
- Feints, boss phase boundaries, old-combo cancellation, interrupted enemy loading
  and pausing/resuming an in-flight attack while reading What's New.
- Route selection, future-floor guards, rest, shrine, shop refunds, normal rewards,
  Dev KO isolation, fatal damage, retry and victory UI.
- Save round trips, legacy/missing keys, invalid JSON and wrong-shaped fields.
- Real changelog overflow, vertical scroll, fixed Continue button and modal pause.

Browser verification is also necessary for the Web shell, wheel routing, glyphs,
rendering, dropdowns and visible layout. Physical Android touch latency, audio and
device-specific performance require separate device testing.
