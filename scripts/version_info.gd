extends RefCounted

const VERSION := "v0.9.1"
const BUILD_NAME := "Weapon Debug Readability"

const CHANGES := [
	"Replaced unsupported star rating glyphs with plain numeric 1-5 weapon style ratings.",
	"Shortened weapon descriptions so the selection cards fit cleanly on Web and mobile.",
	"Enemy combat status now shows Enemy HP as current / max instead of the vague counter-needed value.",
	"Added live Counter ATK preview for the next Normal and Perfect counter.",
	"Added Last Counter Damage so weapon effects can be verified directly after every successful counter.",
	"Weapon state such as Daggers Hits, Greatsword Charge and Bow Aim continues to update live.",
	"These are debug/readability changes; the v0.9.0 weapon mechanics are unchanged."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
