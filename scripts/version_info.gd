extends RefCounted

const VERSION := "v0.10.0"
const BUILD_NAME := "Weapon Mastery & Run Upgrades"

const CHANGES := [
	"Added persistent Weapon Mastery XP for Katana, Daggers, Greatsword and Bow.",
	"Each successful counter in a real run grants +1 Mastery XP to the equipped weapon.",
	"Mastery Lv.2 unlocks at 8 XP and Mastery Lv.3 unlocks at 20 XP.",
	"Mastery opens new run-upgrade options instead of permanently increasing raw damage.",
	"Weapon selection now shows each weapon's saved Mastery level and XP progress.",
	"Elite victories can now offer one weapon upgrade unlocked by the Mastery level snapshotted at the start of that run.",
	"Katana Lv.2: Iaido — every 3rd Perfect counter gains +2 damage.",
	"Katana Lv.3: Flow Edge — at Flow x3+, Katana counters gain +1 damage.",
	"Daggers Lv.2: Flurry — Perfect counters add 4 hits instead of 3.",
	"Daggers Lv.3: Serrated Rhythm — each 4-hit trigger deals +2 damage instead of +1.",
	"Greatsword Lv.2: Deep Charge — maximum Charge increases from 2 to 3.",
	"Greatsword Lv.3: Crushing Release — releasing max Charge on Perfect gains +1 damage.",
	"Bow Lv.2: Steady Aim — Perfect counters gain 2 Aim instead of 1.",
	"Bow Lv.3: Piercing Shot — counters that spend Aim gain +1 extra damage.",
	"Weapon upgrades last only for the current run; Mastery progress is permanent.",
	"Dev Mode now has a Weapon Upgrade selector so every upgrade can be tested without changing save data.",
	"Shortened Dev Mode toggle labels to prevent text clipping."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
