extends RefCounted

const VERSION := "v0.9.0"
const BUILD_NAME := "Weapons & Starter Loadout"

const CHANGES := [
	"Runs now begin with Weapon Selection before choosing a Starter Skill.",
	"Added Katana, Daggers, Greatsword and Bow as four distinct weapon identities.",
	"Katana — Precision: every Perfect Dodge adds +1 counter damage.",
	"Daggers — Combo: normal counters add 2 hit events, Perfect counters add 3; every 4 dagger hits adds +1 counter damage.",
	"Greatsword — Burst: successful counters build up to 2 Charge; a Perfect Dodge consumes stored Charge for heavy bonus counter damage.",
	"Bow — Aim: Perfect Dodges store up to 2 Aim; the next non-Perfect successful counter consumes Aim for bonus arrow damage.",
	"Weapon state is shown live in the build HUD so Hits, Charge and Aim are easy to track.",
	"Weapon choice changes only the automatic counter. There is still no Attack button.",
	"All four weapons are temporarily available for prototype testing. Permanent Weapon Mastery progression will be added in a later update."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
