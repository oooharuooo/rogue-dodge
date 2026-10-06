extends RefCounted

const VERSION := "v0.4.2"
const BUILD_NAME := "Mobile Swipe Hotfix"

const CHANGES := [
	"Fixed a Godot parse error in the mobile swipe-down input handler that caused a blank gray screen.",
	"DUCK remains available with S/Down Arrow on PC and swipe down on mobile.",
	"Cache-safe Web deployment remains enabled.",
	"GitHub Actions now fails automatically if Godot reports a script parse error, preventing broken builds from being deployed as successful."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
