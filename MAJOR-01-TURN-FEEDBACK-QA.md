# Preview 21 — damage per turn, keywords and action badges

- New fixed-height line displays current turn damage and previous turn damage. Encounter total remains separately available.
- Counter, interrupt, dagger secondary/follow-up and elemental hits are included. Delayed dagger hits retain their original counterKey after the next chain starts. Applied damage is capped at remaining enemy HP, avoiding overkill inflation.
- English keywords retained: Clean Chain means every beat successfully avoided/deflected, not all Perfect Dodge. A guard absorbing an otherwise failed dodge does not qualify. Perfect Dodge means precise dodge timing. Tapping opens short localized help; X, outside click and Escape close it.
- Added tap help for Deflect, Interrupt, Follow-up and Guard Stance.
- Bow/dagger/greatsword and Deflect badges share face/head anchor projection, centered above boss, following both movement and mirrored controls. Badge fades for 180 ms after its window closes. Original enemy-side touch regions unchanged; badges do not intercept lane input.
- Reset clears turn records and badge fade memory. UI avoids rewriting unchanged damage text every frame.

Validation: six ledger cases across 30/60/120 FPS cover delayed follow-ups, no duplicate counting, encounter reset and actual overkill damage. Major-one 41 checks pass. Browser verified keyword opens correct explanation, damage line visible, and action badge follows boss. Original combat timing, damage balance and sound unchanged.

Review: player can distinguish round damage from run total; short explanation distinguishes Clean Chain from Perfect Dodge. Tester checks previous-turn updates even when a delayed dagger hit overlaps the next turn. Viewer sees badge above head rather than a fixed mark chasing from afar.

Preview: http://127.0.0.1:8776/21-turn-feedback/?weapon=katana&enemy=executioner

Project preference: retain recognizable English gameplay keywords with concise tap/click definitions; do not conflate successful chain completion with perfect timing. Continue full major-task QA and report all remaining milestones after each completed task.

Touch regions: dodge zones narrowed to 28% of arena width, transparent idle borders and Up/Jump/Down labels. Pointer feedback uses a translucent teal fill and bright inset border; clears after release/cancel/leave (180 ms), with a 350 ms fallback. Input timing is unchanged.

Review 22: replaced boxed lane labels with inline gold glyphs and small text. Head action cue accepts direct pointer input independently of the enemy-side rectangle; inactive/fading cues reject input. Greatsword visibility is resolved from armor + heavyWindow in the final UI pass. Browser test clicked the visible Heavy cue: Bổ nặng nhận lệnh, armor became 0, heavy_spend shown. Guard is automatic, not a separate tap skill. Regression: 41 major-one checks and 6 turn-ledger cases pass.

Review 24: applies chosen chevron control style. Large translucent 28% lane panels replace boundary lines; pressed panel brightens across the whole region, mirrored for left hand. Guard cue is 30% larger, offset toward viewer-right outside hero silhouette, anchored to the same pose offset/height and counter lunge. No gameplay or audio timings changed.

Review 26: restores explicit Test Mode scenario selector (Perfect, Normal, correct/wrong/early Deflect, bow interrupts, dagger follow-up, greatsword spend/hold). Automation is gated by game.test and never starts on normal load. Deflect input alignment updates when lane rectangles change; DOM hit tests confirm each enemy-side region resolves to its own lane. Dagger icon now uses short broad spearpoint blades with visible grips instead of V-shaped line art.

Review 27: Test Mode controls moved to combat: weapon, enemy, boss, mastery, chain length, HP, scenario, restart/pause. Normal hides all. Deflect timing cue was 600 ms ahead of contact while acceptance was only final 200 ms; cue and acceptance now share a 300 ms window. Correct lane remains required; early attempts still consume the attempt and fail. 72 normal-mode timing/lane/FPS cases pass (30/60/120 FPS), plus 41 baseline checks and input tests.

Review 28: Deflect panels now show actual lane bounds and flash on pointerdown. Low-height arena mapping permits arenaYScale below 1 so bottom lane stays within stage. Browser hit test: top/middle/bottom Deflect all resolve correctly in 309 px arena. Dodge comparison: lane-to-lane gaps are only 0–0.013 px (rounding), horizontal separation between 60% action side and 28% dodge side is 12% (~55 px at 456 px arena width). Space above and below the three combat lane bands remains non-interactive. Phone viewport check shows same negligible lane-to-lane gaps.
