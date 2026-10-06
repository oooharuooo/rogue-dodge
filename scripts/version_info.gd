extends RefCounted

const VERSION := "v0.7.0"
const BUILD_NAME := "Dungeon Map & Route Choice"

const CHANGES := [
	"Added a visible 5-floor branching dungeon map between encounters.",
	"Runs now begin with a starter skill, then route through map nodes instead of a fixed enemy sequence.",
	"Floor 1 offers two Normal fights: Swordsman or Heavy Knight.",
	"Floor 2 offers Rest or Upgrade Shrine.",
	"Rest heals 1 HP and resets Flow; Upgrade Shrine only upgrades a skill already owned in the current run.",
	"Floor 3 offers a Rogue fight or Shop.",
	"Normal fights award 2 Gold; Shop spends 2 Gold to acquire or upgrade a current-run skill.",
	"Floor 4 is an Elite Duelist that awards 4 Gold plus a combat reward.",
	"Floor 5 is the Executioner boss; defeating it clears the dungeon.",
	"Completed route nodes remain visible on the map so the chosen path can be reviewed.",
	"No map node permanently unlocks new collection content; all rewards remain current-run only."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
