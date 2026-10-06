extends RefCounted

const VERSION := "v0.3.1"
const BUILD_NAME := "Roguelike Build"

const CHANGES := [
	"Added starter skill selection before each run.",
	"Added skill/upgrade choice after every defeated enemy.",
	"Added 5 working prototype skills: Flame Counter, Momentum, Guardian, Focus, Bloodlust.",
	"Expanded the run from 3 to 5 enemies; Executioner is the current mini-boss.",
	"Run restart now resets the build and returns to starter selection.",
	"Fixed mobile Web tap input for left/right dodge.",
	"Added in-game version display and What's New popup."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
