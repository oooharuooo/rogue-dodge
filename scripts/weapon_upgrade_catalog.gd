extends RefCounted

const LEVEL_2_XP := 8
const LEVEL_3_XP := 20

const UPGRADES := {
	"katana": [
		{
			"id": "iaido",
			"name": "Iaido",
			"unlock_level": 2,
			"description": "Every 3rd Perfect Katana counter gains +2 damage."
		},
		{
			"id": "flow_edge",
			"name": "Flow Edge",
			"unlock_level": 3,
			"description": "At Flow x3+, all Katana counters gain +1 damage."
		}
	],
	"daggers": [
		{
			"id": "flurry",
			"name": "Flurry",
			"unlock_level": 2,
			"description": "Perfect counters add 4 dagger hits instead of 3."
		},
		{
			"id": "serrated",
			"name": "Serrated Rhythm",
			"unlock_level": 3,
			"description": "Each 4-hit trigger deals +2 damage instead of +1."
		}
	],
	"greatsword": [
		{
			"id": "deep_charge",
			"name": "Deep Charge",
			"unlock_level": 2,
			"description": "Greatsword can store up to 3 Charge instead of 2."
		},
		{
			"id": "crushing_release",
			"name": "Crushing Release",
			"unlock_level": 3,
			"description": "Perfect release at max Charge gains +1 extra damage."
		}
	],
	"bow": [
		{
			"id": "steady_aim",
			"name": "Steady Aim",
			"unlock_level": 2,
			"description": "Perfect counters gain 2 Aim instead of 1."
		},
		{
			"id": "piercing_shot",
			"name": "Piercing Shot",
			"unlock_level": 3,
			"description": "An Aim-spending counter gains +1 extra damage."
		}
	]
}

static func mastery_level(xp: int) -> int:
	if xp >= LEVEL_3_XP:
		return 3
	if xp >= LEVEL_2_XP:
		return 2
	return 1

static func mastery_progress_text(xp: int) -> String:
	var level := mastery_level(xp)
	if level >= 3:
		return "Mastery Lv.3 MAX"
	if level == 2:
		return "Mastery Lv.2  %d/%d XP" % [xp, LEVEL_3_XP]
	return "Mastery Lv.1  %d/%d XP" % [xp, LEVEL_2_XP]

static func upgrades_for(weapon_id: String) -> Array:
	return UPGRADES.get(weapon_id, [])

static func unlocked_upgrades(weapon_id: String, mastery_level_value: int) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	for raw_upgrade in upgrades_for(weapon_id):
		var upgrade: Dictionary = raw_upgrade
		if mastery_level_value >= int(upgrade["unlock_level"]):
			result.append(upgrade)
	return result

static func upgrade_by_id(weapon_id: String, upgrade_id: String) -> Dictionary:
	for raw_upgrade in upgrades_for(weapon_id):
		var upgrade: Dictionary = raw_upgrade
		if str(upgrade["id"]) == upgrade_id:
			return upgrade
	return {}

static func upgrade_name(weapon_id: String, upgrade_id: String) -> String:
	var upgrade := upgrade_by_id(weapon_id, upgrade_id)
	return upgrade_id if upgrade.is_empty() else str(upgrade["name"])

static func upgrade_description(weapon_id: String, upgrade_id: String) -> String:
	var upgrade := upgrade_by_id(weapon_id, upgrade_id)
	return "" if upgrade.is_empty() else str(upgrade["description"])
