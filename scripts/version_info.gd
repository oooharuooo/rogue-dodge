extends RefCounted

const VERSION := "v0.10.1"
const BUILD_NAME := "Scrollable Changelog"

const CHANGES := [
	"Update popup now uses a scrollable changelog area.",
	"CONTINUE stays fixed at the bottom instead of being pushed off-screen by long release notes.",
	"Long update notes can now be read safely on both mobile and desktop.",
	"No gameplay or progression behavior changed in this hotfix."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
