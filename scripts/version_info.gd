extends RefCounted

const VERSION := "v0.12.0"
const BUILD_NAME := "Executioner Boss Phases"

const CHANGES := [
	"Executioner is now a real three-phase boss driven by HP thresholds.",
	"Phase 1 runs from 100% to 67% HP with slower, readable core patterns.",
	"Phase 2 starts at 66% HP and adds feints plus faster follow-ups.",
	"Phase 3 starts at 33% HP with longer chains and significantly faster wind-ups.",
	"Crossing a phase threshold cancels the old pattern and cleanly starts the new phase moveset.",
	"Boss name and combat state now show the active phase.",
	"Boss phases work in Dev Mode as well, using the custom test HP as the phase scale."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
