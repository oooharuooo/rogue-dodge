# Weapon balance — preview 20

Implemented locally, awaiting player verification. Dungeon 1 baseline; future Dungeons 2–6 still need their own content and balance.

| Weapon | Before, Lv.1 | After, Lv.1 | Tradeoff |
|---|---|---|---|
| Sword | 8, Deflect drains 2 | Unchanged | Balanced damage; melee-only precise lane/timing; failed guard costs one heart. |
| Daggers | 2+2+4, optional 2+2 = 12 | 2+2+3, optional 1+2 = 10 | One-second enemy rest; follow-up overlaps next tell; dodge cancels unlanded extras. |
| Bow | Counter 6 + interrupt 2 = 8 | Counter 6 + interrupt 1 = 7 | One ranged interruption per chain. Single-beat shots require timing. Missed shot retains dodge option. |
| Greatsword | 6, spend stance for 12 | 6, spend stance for 10 | Keep one block or spend for damage. Another clean chain restores the spent/broken stance. |

Opening doubles base, not follow-ups/interrupt/heavy bonus: Sword 16; Daggers 14 (+3 optional); Bow 12 (+1 shot); Greatsword 12 or 16 when spending. Shared skill values, enemy HP, three-heart player HP and validated animation/timing remain unchanged.

## Mastery damage

- Sword clean chain prepares next-counter +1/+2 at Lv.2/3 (before +2/+3).
- Daggers skipping follow-up prepares +1/+2 at Lv.2/3. Lv.3 adds +1 to follow-up.
- Bow successful interrupt adds +1/+2 at Lv.2/3; baseline reduced by one at all levels.
- Greatsword first broken stance prepares next-counter +1/+2 at Lv.2/3 (before +2/+3), once per encounter.
- Weapon skills retain their small separate bonuses. XP/unlock thresholds are pending progression work; not changed here.

## Validation

- tests/weapon-balance-20.cjs: 448 scenarios covering Mastery 1–3, four melee/ranged/mixed patterns, expert/conservative/synthetic-error strategies, 30/60/120 FPS, combined skill builds. Stable damage across FPS for exact strategies.
- Completed full Dungeon 1 with all four weapons using deterministic successful play. This verifies complete-run behavior, not realistic player win rates.
- 41 major-one, 15 recovery, 12 bow timing and 10 Deflect checks passed; weapon audio cue ledger passed.
- Integer hit damage, original sound/impact timestamps, no additional per-frame audio or elemental stacks on dagger follow-ups.
- Browser verified descriptions, Mastery selection persisting across weapon resets, correct baseline labels, no misleading locked weapon/progression bars in weapon guides.
- Guide checked at 390×844. Screenshots: test-screenshots/20-dagger-balance.jpg and 20-dagger-balance-mobile.jpg.
- Complete simulation results: weapon-balance-20-results.csv.

## Self-review

Player: each weapon has a reason to choose it, with offense/safety tradeoffs. Keeping greatsword stance sacrifices damage. Bow controls one beat without matching sword damage for free. Daggers gain damage only with additional commitment.

Tester: reset/load, guard restoration/consumption, death, full run and fractional-to-integer shot splits covered. Synthetic errors cannot establish difficulty on real phones.

Viewer/audio: approved animations and Deflect motion preserved. Damage changes introduce no new effects obscuring tells; release/contact sounds still follow actual hit timestamps.

Next improvement: phone feedback on dagger greed and single-beat bow timing, then progression and later-dungeon balance based on their actual content.

Preview: http://127.0.0.1:8776/20-weapon-balance/?weapon=katana&enemy=executioner

Use weapon, Mastery and 1/3-beat selectors. Scenarios cover Deflect, dagger follow-up, bow timing, greatsword spending/recovery. Details shows actual play rules and level bonuses. Test Mode saves no XP/Gold.
