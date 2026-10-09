# Major Task 3 — Build, skill sources, shops and boss rewards

## Before → after

| Before | After |
| --- | --- |
| Every combat offered a skill | Normal combat gives 2 Gold + 1 encounter XP; a short reward summary offers Continue |
| Elite gave 6 Gold and any eligible skill | Elite gives 6 Gold + 2 XP and upgrades one owned skill, if any is below Lv.2 |
| Skill/new upgrade both cost 2 Gold | Shop: new skill 4 Gold, upgrade 3 Gold, heal one heart 2 Gold; one purchase per visit |
| Paths could miss every shop | Every new D1 route passes the shop at stage 4; first two wins provide 4 Gold |
| Event only traded HP/Gold/protection | Additional Learn option: trade one heart for one unlocked, unowned skill; costs only after confirmation and cannot spend the last heart |
| Boss ended the run immediately | Boss gives 10 Gold + 4 XP, then choose one extra reward: +8 Gold, up to +4 dungeon-qualified XP, or one Starter seal |
| No reward helping the next starter | Starter seal optionally makes the chosen unlocked starter Lv.2 once; max 3 stored; never consumed automatically |

Shrine still upgrades an owned skill for free. Four skill slots and one element remain enforced. Old saves with larger builds retain them but cannot add more skills. Old route v1/v2 saves keep their topology; only new runs use v3. Legacy reward screens remain compatible. No new combat move or element was added.

## Boss reward safeguards

- Choose exactly one; no second claim and no skip bypass.
- Bonus XP obeys Dungeon 1's 24 XP per-weapon cap, uses the current dungeon tier and does not count as another encounter victory.
- XP option is disabled when its cap is reached; seals disabled when holding 3. Gold remains available.
- Pending boss reward is saved; reload resumes the choice without repeating Gold/XP/win count.
- Seal consumption is optional and atomic with accepting the starter. Declining or selecting an unavailable skill consumes nothing.
- Won screen explicitly shows the reward selected. Next-dungeon carry is not implemented here; seals intentionally benefit a subsequent new run.

## Route and timing

New nine-stage route: combat → combat → event/rest/Elite → guaranteed shop → combat → shrine/event/treasure → Elite/combat/shrine → camp/Elite → boss. Branch connectivity remains enforced.

Reward popup waits 0.9 seconds of simulation time after defeat so contact/death animation is visible. No combat animation, attack timer or audio sample was changed. Existing physical attack/contact and deflect sound events remain separate and fire once. Passive skill cards display short briefs, with complete effect details below the selected card.

## Validation

- 23 acquisition/economy tests pass: exact shop prices, no failed-purchase charge, free upgrades, one-heart trade/cancel, slots and elements, boss choices once, capped XP/seals, starter seal use, saved offer identities, pending boss reload and old route preservation.
- Exhaustive branch traversal confirms all v3 paths reach the shop.
- 41 combat checks at 30/60/120 FPS and 29 Mastery checks remain passing.
- Four full new-route D1 simulations pass. Each chosen route has 5 victories, 9 encounter XP, 19 Gold remaining, Focus Lv.2 + Flame Counter Lv.2, and 3 hearts using ideal combat input and a rest before the boss. This is correctness evidence, not a realistic player success-rate estimate.
- Audio event-ledger regression passes.
- Browser: shop shows different new/upgrade prices; purchasing Focus spends exactly 3 Gold (6 → 3). Learning keeps 3 hearts until confirmed, then changes to 2 hearts and 2 skills. Boss choice screen fits 390 × 844 mobile viewport. No JavaScript errors seen.

## Player/tester/viewer review

- Can a fresh player afford a skill? Yes, first two wins fund a new skill; optional early event trades a heart instead.
- Does unlocking equal equipping? No, acquisition is still per-run and must respect weapon/element compatibility.
- Can reload reroll a shop or duplicate a reward? Stored offers and one-time boss claim prevent this.
- Does the reward have current use? Gold and Mastery work immediately; the seal is usable on the next starter. Rare relics/forge are not claimed as implemented.
- Can the initial pool feel narrow? Yes: fresh accounts initially have Focus and Flame Counter. More options come through Mastery/encounter unlocks. Measure early player engagement before adding new starter skills.
- Are rewards exciting enough long-term? These are initial economy rewards. Boss relics/materials/forge remain separate work; gold inflation across repeated runs needs the carry/economy task.
- Are backgrounds approved for this task? No environment changes were made. Existing forest/snow candidates must be shown for user verification before the biome task.
- Duplicate weapon art/Mastery roles (Poise, Follow-through, Rebound) remain queued. No unapproved replacement mechanic was silently introduced.

## Preview

- Normal game: http://127.0.0.1:8776/33-build-rewards/
- Shop fixture: http://127.0.0.1:8776/33-build-rewards/build-lab.html?scene=shop
- Boss fixture: http://127.0.0.1:8776/33-build-rewards/build-lab.html?scene=boss
- Fixture buttons also provide starter/event/Elite and saved-checkpoint reload. Sample profile unlocks skills for viewing; the fresh-profile checkbox uses real initial unlock eligibility. Session-scoped prefixed storage protects the real save. Fixtures are not loaded in normal gameplay.

## All remaining work

1. Mobile combat/timing/audio/FPS QA across major tasks; real-player progression/economy measurement.
2. Weapon art alternatives and skill combo balance; optional new elements only after clear mechanics are tested.
3. Carry build/Gold, checkpoint/gameover and weapon/build switching without deliberate-loss exploits; Gold sinks and reward tuning.
4. Verify the previously approved forest/snow backgrounds, then unify D1's route/combat environments as forest.
5. Full D2 content with snow map/background/enemies/boss/music; then D3–6 each with a consistent biome and new encounters.
6. Rare boss rewards, materials and forge.
7. Rewarded ads and usage limits.
8. Full-run save/localization/audio/performance QA, phone verification and live publish.

