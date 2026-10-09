# Preview 18 — Deflect and counter recovery
## Before / after
- Hero sword aimed at the previous frame boss tip; enemy was rendered after hero. Enemy now renders first, so the hero contact target comes from this same frame.
- Removed the artificial enemy displacement driven by hero Deflect travel; boss no longer reverses direction when the hero snaps into guard.
- Hero reaches guard in maximum 40 ms; timing validation remains 200 ms, audio at impact.
- Previously a clean chain launched the counter immediately as the boss retreated. Counter now waits 420 ms for retreat/recentering before hero approach.
- Enemy cannot start a new chain until 1.55 s after chain completion, or 1.00 s with daggers. Daggers' optional follow-up can overlap the next windup; dodging cancels remaining extras.
- Damage, health, phase thresholds, three Deflect recordings and their quieter gain remain unchanged.
## Review
- Player: normal counter has room for approach/contact/return; dagger greed starts overlapping the next tell without making damage unavoidable (normal enemy windup remains).
- Tester: reset/load clears recovery; no next chain during recovery; delayed counter/guard restoration still complete; missed chain cannot instantly restart.
- Viewer: same-frame weapon contact and no enemy displacement competing with hero movement.
- Audio: release/contact cues follow delayed shot timestamps; three distinct Deflect samples follow their event beat index.
## Validation
15 recovery cases at 30/60/120 FPS including cancelling follow-ups; 41 major-one checks/full Dungeon 1; 10 Deflect checks; interrupt art and weapon audio ledger pass. Browser has no logged errors and p95 frame around 16.8 ms during preview.
Screenshot: test-screenshots/18-deflect-current-frame.jpg.
Preview: http://127.0.0.1:8776/18-counter-recovery/?weapon=katana&enemy=executioner
Subjective smoothness still needs user verification on phone. Tune recovery values after that review rather than increasing damage.

## Preview 19 — upper-lane movement only
Upper Deflect no longer finishes its vertical movement early and holds a stationary height before impact. It uses a fast exponential rise that settles continuously until the impact timestamp. Horizontal contact, middle/lower trajectories, return timing, validation, sound and counter rest unchanged.
Regression: 10 Deflect cases at 30/60/120 FPS now assert upper rise still progresses before contact and reaches exact lane at contact; 15 recovery cases passed.
Player review: compare upper beat with middle/lower in Test: Deflect đúng 3 lane. Perceived smoothness remains a user verification item.
Preview 19 revision 6: user still perceived upper arrival ~100 ms late. Replaced long exponential rise with 16 ms upper vertical arrival (one 60 Hz frame); middle/lower, horizontal approach, impact/audio/validation unchanged. Regression requires full upper lane by 17 ms.
Preview 19 revision 7: upper lane immediately reached on first rendered input frame, no vertical arrival tween. Return remains smooth; damage validation and sound stay at impact. Middle/lower unchanged.
Preview 19 revision 8: upper horizontal approach shortened from max 40 ms to 12 ms; immediate vertical placement retained. Middle/lower unchanged. Test asserts upper full horizontal contact by 13 ms.
Preview 19 revision 9: lower Deflect now matches approved upper lane: immediate vertical placement, max 12 ms horizontal approach; center remains max 40 ms. Return, validation and sound unchanged. Regression covers both outer lanes.
