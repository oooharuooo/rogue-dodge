extends RefCounted

const VERSION := "v0.4.1"
const BUILD_NAME := "Cache-Safe Mobile Test"

const CHANGES := [
	"Web test deployment now uses a unique build filename for every commit.",
	"The fixed game URL now checks latest.json with cache disabled before launching.",
	"Mobile testing should no longer require manually clearing browser cache after each update.",
	"Kept DUCK controls: S/Down Arrow on PC and swipe down on mobile.",
	"Kept High Sweep attacks and the v0.3 skill-build system."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
