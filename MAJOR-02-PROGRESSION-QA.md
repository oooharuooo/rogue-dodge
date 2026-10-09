# Major Task 2 · Mastery and unlock progression

## Before → after

- Counter hits granted weapon XP → only winning an encounter grants XP. Normal +1, Elite +2, boss +4. No XP for losses, individual shots, burn, Interrupt, follow-up or Test Mode.
- Mastery 8/20 XP allowed all ranks in D1 → rank 2 requires 36 total XP and 12 XP from D2+; rank 3 requires 96 total XP and 36 XP from D3+.
- Unlimited D1 farming → D1 awards at most 24 XP per weapon lifetime. D1 counter still shows capped reward, no silent XP gain. Encounter counts can still unlock early D1 battle arts.
- Unclear ownership → mastery ranks are permanent. Replaying D1 retains earned rank 2/3. Unlocking a skill adds a choice to the pool; it is not automatically equipped or free at a shop.
- Unlimited new skill additions → max 4 skills, with max 1 element. Upgrading an existing skill does not consume a new slot. Existing oversized saved builds are retained, but cannot add another skill.
- Starter bypass allowed locked Momentum/Steadfast → starter only offers unlocked skills compatible with weapon. Offers remain at most 3; a fresh account starts with two available choices.

## Unlock rules for new progression

| Skill | Requirement |
| --- | --- |
| Focus, Flame Counter | Available from start |
| Weapon technique | 12 encounter XP with that weapon, D1+ |
| Momentum | 18 encounter victories, D1+ |
| Steadfast | 12 encounters without heart loss, D1+ |
| Resolve | 20 encounters without heart loss, D1+ |
| Ember, Spark, Rime | 18 victories in D2+ |
| Second Wind | 30 victories in D2+ |
| Echo | 24 victories in D3+ |

Skill rank 2 is a run upgrade through rewards/shop/shrine, not a permanent rank 2 equipment purchase. Current combat reward skill drops remain; deciding to move them exclusively to special rooms is the next build/economy task.

## Legacy migration

Old XP remains archived in `meta.progression.legacyXP`. Previously earned rank 2/3 and previously unlocked skills are retained. New encounter XP begins at 0 and obeys v2 gates. No player save or Gold is erased. Old ranks mean existing preview testers can still have rank 3 in D1; this is retained ownership, not a new farm exploit. Use the independent progression lab to inspect a fresh account.

Checkpoint saves dungeon identity, encounter reward claimed flag and last reward. Reload after a claimed victory cannot grant the reward a second time. Test Mode does not mutate persistent progression.

## Scope and limitations

Only D1 gameplay is currently authored. Dungeon identity and D2/D3 gates are implemented and tested, but D2–6 are not unlocked as cloned D1 content. The lab simulates future tier XP without writing a save. These thresholds are provisional pacing baselines, to be measured against real D2 difficulty later.

## Verification / self-review

- 41 core combat checks at 30/60/120 FPS remain passing.
- 29 progression checks: nonlethal counter grants no XP, winning grants once, all weapons hit D1 cap, D2/D3 qualification, replay retains rank, Test Mode isolation, max skill slots, legacy ownership, storage reload/claim flag.
- 4 complete D1 simulations: each 6 victories, 10 XP, rank 1, 3 HP with ideal inputs. This measures correctness and XP pacing, not realistic player success rate.
- 96 legal builds across 4 weapons/4 patterns audited; Ember adjusted. See SKILL-AUDIT-31.md and skill-review-31-results.csv.
- No new attack animation or audio trigger in progression: XP is awarded at enemy defeat, not on a projectile release. Existing physical impact, deflect, guard and rage sounds keep event timing.
- Player questions: can I see what is missing for next rank? Collection now shows total XP and qualified dungeon XP separately. Can I grind D1 forever? No. Will old progress vanish? No. Are future dungeons actually playable? No; UI states that clearly.

## Preview

Game: /32-mastery-progression/
Independent fresh-profile lab: /32-mastery-progression/progression-lab.html

## Remaining work

Combat/mobile release QA; weapon technique redesign proposals; build acquisition/economy/element utility; carry build/Gold/checkpoint and gameover decisions; D2 full content and balance, D3–6 content; boss rare rewards/materials/forge; rewarded ads; full runs/audio/localization/performance/saves/live release.
