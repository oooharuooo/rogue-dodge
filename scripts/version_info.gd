extends RefCounted

const VERSION := "v0.11.0"
const BUILD_NAME := "Real Enemy HP & Combat Balance"

const CHANGES := [
	"Replaced the old counter requirement with real Enemy HP values.",
	"Added a visible Enemy HP bar in the combat arena.",
	"Initial balance: Swordsman 5 HP, Heavy Knight 8 HP, Rogue 7 HP, Elite Duelist 12 HP and Executioner Boss 18 HP.",
	"Player HP remains 3; stronger builds shorten fights instead of increasing player survivability.",
	"Combat HUD now shows Normal and Perfect Counter ATK plus estimated counters-to-KO for both.",
	"Internal combat state now uses enemy_hp naming so future armor, damage-over-time and boss phase systems can build on real HP cleanly.",
	"Balanced Bow so continuous Perfect play is rewarded: Perfect stores Aim, and a Perfect at full Aim now releases the stored bonus damage.",
	"Normal Bow counters can still spend stored Aim as before.",
	"Dev Mode custom Enemy Test HP remains available for longer damage and upgrade testing."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
