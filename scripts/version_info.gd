extends RefCounted

const VERSION := "v0.8.0"
const BUILD_NAME := "Permanent Collection & Save"

const CHANGES := [
	"Added persistent meta progression saved locally on the device/browser.",
	"Added a Permanent Collection screen showing locked/unlocked skills, rarity, requirements and progress.",
	"Flame Counter and Focus are now the two default permanently unlocked starter skills.",
	"Momentum permanently unlocks after 12 total Perfect Dodges across runs.",
	"Guardian permanently unlocks after 3 encounters completed without losing HP.",
	"Bloodlust permanently unlocks after defeating an Elite without losing HP in that encounter.",
	"Each run snapshots the permanent unlocked pool at Start Run, so newly unlocked skills enter rewards starting next run.",
	"Starter, combat reward and Shop choices now only use permanently unlocked skills.",
	"Upgrade Shrine still only upgrades skills already owned in the current run.",
	"Permanent unlocks never come directly from map nodes or normal rewards; they come only from explicit achievement conditions.",
	"Added fallback handling when a run has maxed every eligible skill: rewards convert to Gold and Shop refunds instead of getting stuck."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
