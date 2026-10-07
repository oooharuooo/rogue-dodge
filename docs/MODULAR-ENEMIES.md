# Enemy art slots

`modular-enemies.js` defines the roster's `pack`, `family`, `outfit`, `weapon`, `fx`, `scale` and `waveColor` independently. The renderer loads each pack's own SCML-derived idle hierarchy; it does not assume another character's bone positions match.

Body armour, apron and belt attach to `Body`; headbands/crowns attach to `Head`; armour plates attach to each arm. The overlays use that slot's pixel coordinates and inherit its transform, alpha and pose. A new costume can therefore keep all existing movement profiles. Original skin, head shape, hands and feet remain package assets.

Weapons mount to the right hand at its grip coordinate. Their inverse scale keeps their visual size bounded when a monster's body is enlarged. Fist profiles hide the equipment slot and launch from the hand. New equipment should define its handle and tip consistently before its move set is added.

Motion families: knife (compact crouch and flick), axe (one-handed diagonal cleave), hammer (two-arm brace and heavy drop), fist (draw-back and punch), mage (staff aim and free-hand cast), charge (body lunge). Executioner's approved original profile remains unchanged.

Knife/charge families now approach substantially during release. Axe, hammer and fist families step into the strike. Casters keep their distance. The telegraph stays at the home position until late wind-up; the opponent returns by normalized time 1.2 so the automatic counter still targets its home position. The next single-lane combo prototype should keep melee opponents close through the full sequence and postpone the counter until the last hit; it is not part of this preview.

Release rotation always faces the hero, even when the weapon is pulled backward in wind-up. The connected projectile's leading contour reaches the two lane centres at impact; the renderer does not simply flip its travel direction or mirror the full scene to repair its artwork.

Each family still has three semantic attacks: low two lanes → Up, upper two lanes → Down, all three ground lanes → Jump. The launch origin is captured once at release; the projectile reaches the hero at the combat impact time. Ice, stone, ember and rune details decorate the same continuous ground front rather than making three disconnected lane effects.

Preview-first rollout: nine additions are selectable in Test Mode; the three new bosses are also available through the existing boss chooser. Normal route enemy nodes keep their existing encounter selection while the new roster's difficulty is reviewed. Test Mode grants no permanent progress.

Checks: `tests/roster-art-2d.cjs` samples 16 opponents × 3 attacks × 141 timeline points for weapon mounting, release origin, impact alignment, lane coverage, alpha composition and camera margins. `tests/full-2d.cjs` completes every weapon/opponent combination and verifies test progress isolation.
