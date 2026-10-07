# Alpha 0.6 review

Latest animation correction (supersedes the pre-rendered-enemy and shared-skin notes below): all seven opponents now use the registered Spriter hierarchy and the same validated windup/release/impact pipeline. Variants 1/2/3 retain their original package parts. Rogue carries the package sword; Wraith keeps the staff. Warden's shield tracks the free-hand anchor. Three attack types keep the established combat rules: two-lane crescent from the weapon and continuous three-lane ground wave. Executioner's approved pose grammar is preserved; other opponents vary free-arm bracing and body lean, rather than having wholly independent animation sets. Old jump/slide clips no longer stand in for attacks; unused pre-rendered enemy frames are no longer downloaded.

Validation: 2,961 pose samples across all seven opponents and all three attacks, weapon grip error <=0.096 canvas pixels, projectile origins registered to the weapon, leading edge reaching the hero exactly at impact, two/three-lane coverage and both handed frame margins. Death fading applies to body parts. Existing 107 dungeon/weapon/isolation checks passed. Browser review captures windup and projectile frames for every opponent; the study page reports no JavaScript errors.

Latest game: http://192.168.4.57:8768/review-27-enemy-animation/ . Animation scrubber: http://192.168.4.57:8768/review-27-enemy-animation/poses.html . Older previews remain unchanged.

Portrait arena uses the approved wide spacing. Right-hand layout puts the enemy left and reserves the right 36% for three lane touch regions; left-hand mode mirrors it. Visible controls are ↑ / ◇ / ↓. Boss swords use registered hand/hilt anchors and a continuous ground wave for all-lane attacks. Upper attacks lift only the sword hand; all-lane attacks retain both arms and add a small squat. Ordinary enemies retain package animations. Three boss identities share this rig and differ in pattern, phases, tint and accessories; independent boss sprite sets remain future work.

Melee reaches the opponent at each weapon's damage release time; bow travel reaches the enemy at shot impact. FX use arena coordinates. Down movement has a bottom safe margin. No safe-lane/hazard/timing-answer overlay remains. Input accessibility labels stay intact even though visible labels are icons.

Normal dungeon, save/resume, Test Mode selectors, Auto, Collection and changelog are integrated. Map now runs vertically from T1 at bottom to T5 at top; T2/T3 have three choices and T4 two. All choices connect through a hub to the next tier, matching the existing unrestricted next-tier route logic. Node details require confirmation. Auto-scroll targets the current tier.

Skill notifications appear by the hero, limited to two short messages. Damage bonuses fire at actual hit time. Additional mastery messages cover Iaido, Flow Edge, Piercing Shot and Crushing Release without changing damage formulas.

Validation: 644 model checks, 2,548 hero/weapon bounds samples, 423 sword-grip/edge samples. UI checks include map details/confirmation, resume, Test Mode weapon/boss selection, Auto and hand toggle. Browser viewport readings differ from requested device overrides; observed 325–390 CSS-pixel layouts have no horizontal overflow. Physical-device safe-area, thumb coverage and performance still need human testing. Automated play is timing validation, not evidence of human-readable or balanced difficulty.

Browser normal-run proof: all five floors completed through Swordsman → Rest → Rogue → Elite → Executioner, ending with 17 dodges, 41 damage, 17 XP and 18 Gold. The skill preview displayed Flow Edge +1 DMG and Bloodlust +1 DMG at an actual 5-damage hit. No JavaScript errors were observed in the integrated, combat and skill previews.

Local previews on http://192.168.4.57:8768/:
- review-20-combat/?weapon=katana
- review-21-boss/?enemy=warden
- review-22-dungeon/
- review-23-skills/?weapon=katana&skills=all
- review-24-map/
- review-25-mobile/

The official CraftPix forest download returned 403; the approved temporary forest remains. No claim of original forest-pack integration is made.

Final UI repair: results and reward sheets use a compact bottom popup rather than filling the whole screen. Test completion has a retry button. Review gallery with all six preview links and screenshots: http://192.168.4.57:8768/review-alpha6/.

Publication attempted with prior user authorization. GitHub connector blob writes returned an internal error; local Git push could not authenticate. Public main remains 21f90738. The tested release is retained locally on release-alpha6 for a future authenticated push.

Enemy scale correction: pre-rendered enemy sheets include transparent padding. The old 0.9 multiplier made ordinary enemies roughly half the hero's visible height. Updated fixed scales: Swordsman/Rogue 1.7, Elite 1.75 and Heavy Knight 1.8, anchored at the same feet position. Checked alpha bounds across 207 rendered frames in both handed layouts; all weapons remain inside the frame. Preview: http://192.168.4.57:8768/review-26-enemy-scale/ . Original review-25 preview is retained for comparison.
