extends RefCounted

const VERSION := "v0.5.0"
const BUILD_NAME := "Enemy Moveset System"

const CHANGES := [
	"Replaced independent random attacks with named, learnable enemy attack patterns.",
	"Added multi-step combos that chain Left, Right and High attacks.",
	"Added delayed attacks that hold the wind-up longer before impact.",
	"Added quick follow-up attacks inside selected combos.",
	"Added fake/cancel attacks for Rogue, Duelist and Executioner.",
	"Fake attacks can bait an early dodge before a faster real follow-up.",
	"Each enemy now has its own data-driven moveset, making future enemies and bosses easier to expand.",
	"Prototype UI shows the current pattern name for testing; final builds can hide this once animation/audio tells are strong enough."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
