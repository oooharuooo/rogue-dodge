extends RefCounted

const VERSION := "v0.14.0"
const BUILD_NAME := "Multi-Enemy + Environmental Hazards"

const CHANGES := [
	"Added a reusable projectile attack system without adding any new player controls.",
	"Projectile from left/right still uses opposite-side dodge; high projectiles require Duck; low projectiles require Jump.",
	"Added a visible projectile charge and travel animation so ranged attacks read differently from melee swings.",
	"Rogue gained Knife Fan: left, right and high projectiles.",
	"Duelist gained Needle Line: low projectile followed by mixed melee/projectile pressure.",
	"Executioner Phase 2 gained Black Iron Volley.",
	"Executioner Phase 3 gained Death Rain with high, low and fast side projectiles.",
	"Projectile attacks work with Dev Mode Auto Dodge, Force Perfect and Turn-Based testing.",
	"v0.12.0 boss phase system remains active underneath this update."
]

static func changelog_text() -> String:
	var lines: Array[String] = [
		"v0.14.0 - Multi-Enemy + Environmental Hazards",
		"• Minions and arena hazards alternate with main attacks; impacts never require conflicting inputs at the same time.",
		"• Heavy Knight adds Ground Pulse and Falling Hammer; Rogue adds Shadow Archer; Duelist adds Blade Trap and Side Seal.",
		"• Executioner phases add Chain Tremor, Black Guard and Death Field with increasing frequency.",
		"• Each secondary source has its own visible warning and uses Left, Right, Duck or Jump.",
		"• Secondary dodges use the same counter damage, skills and mastery rules. Dev Mode supports Auto Dodge, Force Perfect and NEXT ATTACK.",
		"",
		"v0.13.1 - UI and progression fixes",
		"• Browser wheel scrolling stays inside the game; the page no longer scrolls away from the canvas.",
		"• Control hints use readable arrow-key names.",
		"• What's New pauses combat until CONTINUE is pressed.",
		"• Menu clicks no longer count as dodge inputs. Route and skill menus block combat hotkeys.",
		"• Mastery upgrades earned during a run are available at that run's elite reward.",
		"",
		"v0.13.0 - Projectile Attack System"
	]
	for item in CHANGES:
		lines.append("• " + item)
	lines.append("\nv0.12.0 - Real Boss Phases\n• Executioner changes moveset at 66% and 33% remaining HP. Later phases add feints, quick attacks and projectiles.")
	lines.append("\nv0.11.0 - Enemy HP and Weapon Damage\n• Enemy HP: Swordsman 5, Heavy Knight 8, Rogue 7, Duelist 12 and Executioner 18.\n• ATK N/P previews the next normal/perfect counter. KO N/P estimates use that current damage; later hits may change with Charge, Aim, Hits and skills.\n• Katana: normal 1, perfect 2 before skills/upgrades.\n• Daggers: counters add 2 hits, or 3 on perfect; every 4 hits adds damage.\n• Greatsword: counters store Charge; a perfect counter spends stored Charge.\n• Bow: perfect counters store Aim; a normal counter or a perfect at full Aim releases it.")
	lines.append("\nWeapon Mastery and Collection\n• Every successful counter grants 1 XP to the equipped weapon. Mastery level 2 unlocks at 8 XP; level 3 at 20 XP.\n• Elite rewards offer unlocked weapon upgrades for the current run.\n• Permanent skill unlocks: Momentum after 12 perfect dodges, Guardian after 3 no-damage encounters, Bloodlust after a no-damage elite clear.\n• Dev Test does not grant XP, gold, permanent unlocks or route rewards.")
	return "\n".join(lines)
