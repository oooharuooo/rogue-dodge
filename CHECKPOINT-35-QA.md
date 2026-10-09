# Boss reward cards and combat checkpoint — preview 35

## Before and after
- Boss rewards previously used three tall, stacked text boxes. They now use three illustrated cards matching the skill/shop menu. Selecting a card changes its description; only the Receive button claims the reward. The mobile dialog fits 390 × 844 without internal scrolling.
- Combat resume previously discarded the current combo, attack and pending projectiles, and reconstructed enemy stamina. It now restores the current timeline, stamina, opening, spent weapon actions, pending damage, elemental state and recovery limits.
- Resume pauses combat and asks the player to press Continue. Past sound events are marked as already played, while future releases and contacts remain eligible.

## Verification
- Existing suites passed: 41 combat checks, 29 progression checks, 23 build economy checks and four complete Dungeon 1 routes.
- New checkpoint suite passed 35 checks, including 24 weapon/timeline combinations, failed dodges, active Ember, Recovery, boss rage, old-save fallback, Test Mode isolation and audio event priming.
- Browser checked at 390 × 844: reward selection does not claim early; confirmation grants the selected reward. A new page restored the sample with HP 2, Gold 7, enemy HP 42, stamina 7 and the pending Deflect attempt.
- Screenshots: `../test-screenshots/34-boss-cards-mobile.png` and `../test-screenshots/35-checkpoint-mobile.png`.

## Preview and player checks
- Boss menu: http://127.0.0.1:8776/35-combat-checkpoint/build-lab.html?scene=boss
- Checkpoint: http://127.0.0.1:8776/35-combat-checkpoint/build-lab.html?scene=combat
- Select each reward and inspect its explanation, then Receive. In the checkpoint fixture press Save & reload, confirm its readout, then Continue.
- The fixture uses session storage separate from real saves.

## Limits and remaining work
- Periodic saves occur every 0.25 simulation seconds, with lifecycle flushing on normal page exit. An abrupt process crash can lose the last fraction of a second.
- Old saves without a timeline keep their existing fallback behavior. Future random combos are not pre-recorded.
- This is checkpoint groundwork, not completion of cross-dungeon carry or Game Over rules. Dungeon 2–6 content is still unreleased.
- Next: carry Gold/build, retry and weapon-change rules without free build rerolls; then dungeon rewards and difficulty progression.
- Remaining: mobile touch/audio QA; verify approved forest/snow backgrounds before biome work; maps and enemies for Dungeon 2–6; rare rewards/accessories/forge; rewarded ads; final balance, save migration and live release QA.
