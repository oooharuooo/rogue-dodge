extends RefCounted

const VERSION := "v0.9.2"
const BUILD_NAME := "Dev Test Mode"

const CHANGES := [
	"Rebuilt weapon selection cards with wrapped labels and separate SELECT buttons so descriptions no longer clip off-screen.",
	"Added DEV MODE as an isolated combat sandbox for testing stats without affecting real progression.",
	"Added Turn-Based Test: enemy performs one attack only when NEXT ATTACK is pressed.",
	"Added Auto Dodge to automatically choose the correct movement during Dev tests.",
	"Added Force Perfect so Auto Dodge can always land inside the Perfect timing window.",
	"Added God Mode so mistakes do not remove player HP while testing.",
	"Dev Mode lets you choose weapon, enemy and custom Enemy Test HP from 5 to 100.",
	"Dev tests do not award Gold, route rewards, achievements or permanent unlock progress.",
	"Weapon debug stats still show Enemy HP, Normal/Perfect Counter ATK, Last Counter Damage and live Hits/Charge/Aim.",
	"Reserved future Dev test slots for Weapon Mastery XP, status effects, projectiles, multi-enemy encounters, boss phases and balance logs."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
