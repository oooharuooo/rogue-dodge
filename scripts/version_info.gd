extends RefCounted

const VERSION := "v0.6.0"
const BUILD_NAME := "Jump & Low Attack"

const CHANGES := [
	"Added JUMP as the fourth combat action.",
	"PC controls: W or Up Arrow = Jump.",
	"Mobile controls: dedicated JUMP button plus swipe-up fallback.",
	"Added Low Sweep attacks that must be jumped over.",
	"Low attacks begin appearing from Heavy Knight onward; Swordsman remains the basic Left/Right trainer.",
	"Heavy Knight, Rogue, Duelist and Executioner now include low attacks in their learnable patterns.",
	"Added a jump animation and a distinct jump sound cue.",
	"Added low-attack wind-up and strike animation near the player's feet.",
	"Moved the player upward slightly so Jump/Duck controls do not hide combat telegraphs.",
	"Jump is temporarily available from the start for prototype testing; permanent unlock rules will be added later."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
