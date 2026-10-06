extends RefCounted

const VERSION := "v0.4.4"
const BUILD_NAME := "Duck Gesture Reliability"

const CHANGES := [
	"Changed mobile gesture classification so any detected drag can never fall back into Left/Right tap.",
	"Reduced Duck swipe distance to 28 px.",
	"Downward movement is now accumulated during the drag, making quick short swipes more reliable.",
	"Increased synthetic mouse-click suppression after touch to reduce accidental Right actions on mobile Web.",
	"Kept cache-safe deployment and CI parse-error protection."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
