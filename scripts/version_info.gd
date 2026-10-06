extends RefCounted

const VERSION := "v0.5.2"
const BUILD_NAME := "Combat Telegraph Animation"

const CHANGES := [
	"Added a visible placeholder weapon to every enemy for readable attack telegraphs.",
	"Left and Right attacks now use mirrored body lean and weapon wind-up poses before striking.",
	"High attacks now raise the weapon overhead, then sweep across the player's head level.",
	"Delayed attacks visibly hold their pose longer and pulse before impact.",
	"Quick follow-ups use a more urgent weapon cue.",
	"Fake attacks now visibly retract back to neutral before the real follow-up.",
	"Reduced the prominence of debug attack text so animation becomes the primary signal.",
	"Kept the dedicated DUCK button, swipe-down fallback and v0.5.0 moveset system."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
