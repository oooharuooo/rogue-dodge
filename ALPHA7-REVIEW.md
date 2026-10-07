# Alpha 0.7 integrated review

- CombatGame reuses FullGame damage, mastery, rewards and checkpoint storage. Full clean chains counter once; passive bait dodges never grant Perfect. Every hit is committed before its cue.
- Test Mode: optional turn/hit HUD, 1–4 hits, melee/ranged/mixed presets, weapon/enemy/boss/mastery/skill controls, completed-chain history. Test mode never writes permanent progression.
- Boss chain lengths vary by phase and identity. Ground slams require Jump; ranged two-lane coverage has one safe lane. Later melee hits independently include outer bait lanes. Original 0.9-second dodge recovers to center, with at least 0.5 seconds before the next cue starts.
- Humanoid enemies keep registered package hand/weapon grips and family-specific offhand/body motion. Dread Wolf uses a separate procedural quadruped rig with individually replaceable parts and armor, and a connected radial slam.
- Portrait one-thumb input supports left/right hand, 44px touch targets, hidden debug UI, scrollable drawers and vertical route graph. Route choices have reward/HP context and commit only after confirmation.
- Skill procs retain distinct texts/colors/shapes and synthesized audio; activation happens on counter impact, not damage prediction.

Validation: legacy gameplay/art suites, new production combo integration, Normal/Perfect FPS and checkpoint tests, 11,616 integrated melee pose samples and 786 quadruped renders. Browser previews cover each task and 320px portrait touch bounds. Full auto dungeon and production live checks are recorded separately in the task artifacts.

Limits: Auto reads attack data and cannot establish human animation readability. Procedural wolf artwork still needs visual approval. Combo timings are deliberately conservative; balance and audio quality require physical-device playtesting.
