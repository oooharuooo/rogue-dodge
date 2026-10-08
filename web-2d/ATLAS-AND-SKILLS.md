# Atlas and skill presentation

The nine-room campaign is defined in `CAMPAIGN_ROUTE`. Early rooms are combat-only. The first rest is room 4, the shop is room 5, and treasure appears at room 6. `routeConnected()` defines the legal adjacent branches; the renderer and game use the same graph. Chapter depth increases normal enemy HP by 15% per chapter. Elite HP also receives the existing 25% multiplier. Existing five-room checkpoints retain their route until the player starts a new run.

Drafts use the same component for starter skills, rewards, shops and shrines. `CampaignGame.offerSkills()` samples at most three unique eligible skills once per decision and persists the offers. Changing card selection, Gold or screen size does not reroll them. Cards preview the selected effect; the confirmation button commits one choice. Fewer eligible skills produce fewer centered cards, with no repeated or fabricated options.

`SKILL_VISUALS` owns each skill's palette, native title, category, short description and motif. `skillIconMarkup()` produces original SVG artwork. `ElementFX` shares that vocabulary with timed smoke, crescents, sparks and skill-specific effects. It accepts age in seconds and natural actor coordinates; it never changes combat timing or hitboxes. `drawSkills()` attenuates effects during enemy windups. The preview effect gallery uses the same runtime functions as combat.

`map-art.js` owns original reusable terrain and node symbols. The atlas has forest, mountain and ruin layers. `route-map.js` draws visited paths, legal next paths and future paths, and recenters after layout or viewport changes. Terrain stays decorative; buttons and route legality remain normal DOM/game controls.

All art in these modules is original code/vector artwork. External reference packs informed the visual vocabulary; their files and animations are not bundled or traced.
