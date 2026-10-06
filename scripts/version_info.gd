extends RefCounted

const VERSION := "v0.4.0"
const BUILD_NAME := "Duck & High Attack"

const CHANGES := [
	"Unlocked DUCK as the third combat action.",
	"PC controls: S or Down Arrow = Duck.",
	"Mobile controls: swipe down = Duck; tap left/right still dodges.",
	"Added High Sweep enemy attacks that must be ducked instead of side-dodged.",
	"Heavy Knight, Rogue, Duelist and Executioner can now mix High attacks into their patterns.",
	"Added a duck animation and separate duck sound cue.",
	"Executioner now has the highest High Attack chance in the current prototype.",
	"Kept the v0.3 skill-build system and mobile tap fix."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
