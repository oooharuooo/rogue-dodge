extends RefCounted

const VERSION := "v0.13.0"
const BUILD_NAME := "Projectile Attack System"

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
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
