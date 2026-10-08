# Language, collection and combat skill preview

Language: pause menu > Controls and settings > Language. vi/en saved in rogue-language. Main UI text and accessibility labels use the reusable NFC-normalized catalog. Old development changelog entries remain reference notes in Vietnamese.

Collection: four weapon tabs and Battle Arts (Chiến kỹ). Mastery unlocks at 8/20 permanent XP. Common unlocks: Momentum 12 Perfects; Guardian 3 encounters without HP loss; Bloodlust 1 Elite without HP loss. Focus and Flame Counter available initially. Opening a skill adds it to the available pool; it must be chosen in a run. Existing starter loan behavior retained.

Test Mode > Skill FX · Demo uses real combat against Iron Bear with Flame Counter rank 2, Momentum rank 1, Flow starting at 2 and automatic Perfect dodges. The normal damage/event paths produce the effects. No metadata reward is awarded. Damage effects happen on counter hit; Focus only confirms the expanded Perfect window; Guardian confirms an absorbed hit.

Preview: http://127.0.0.1:8771/?show=collection
Settings: http://127.0.0.1:8771/?show=settings
Combat: http://127.0.0.1:8771/?show=combat
Font/cards: http://127.0.0.1:8771/?show=shop

Verified: locale reload persistence and both directions, font computed as Segoe UI/Arial, 335 px viewport tabs without overflow, actual combat procs/damage, unchanged Test Mode meta. Tests collection-locale, campaign, atlas-design and checkpoint-campaign passed.
