extends RefCounted

const VERSION := "v0.5.1"
const BUILD_NAME := "Dedicated Duck Button"

const CHANGES := [
	"Added a dedicated DUCK touch zone in the bottom-center of the combat arena.",
	"Tapping the DUCK zone triggers Duck immediately on touch-down for faster response.",
	"The DUCK zone now takes priority over Left/Right tap classification, preventing accidental Right dodges.",
	"Swipe down is still supported as a secondary Duck input.",
	"PC controls remain S or Down Arrow for Duck.",
	"Enemy moveset patterns from v0.5.0 are unchanged."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
