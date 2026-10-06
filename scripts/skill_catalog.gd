extends RefCounted

const SKILLS := {
	"flame_counter": {
		"name": "Flame Counter",
		"rarity": "Common",
		"default_unlocked": true,
		"unlock_type": "default",
		"unlock_target": 0,
		"unlock_text": "Starter collection skill.",
		"max_level": 2,
		"level_1": "Every 2nd Perfect Dodge deals +1 counter damage.",
		"level_2": "Every Perfect Dodge deals +1 counter damage."
	},
	"focus": {
		"name": "Focus",
		"rarity": "Common",
		"default_unlocked": true,
		"unlock_type": "default",
		"unlock_target": 0,
		"unlock_text": "Starter collection skill.",
		"max_level": 2,
		"level_1": "Perfect Dodge timing window is slightly wider.",
		"level_2": "Perfect Dodge timing window is widened further."
	},
	"momentum": {
		"name": "Momentum",
		"rarity": "Uncommon",
		"default_unlocked": false,
		"unlock_type": "perfect_dodges",
		"unlock_target": 12,
		"unlock_text": "Land 12 Perfect Dodges across any number of runs.",
		"max_level": 2,
		"level_1": "At Flow x3+, successful dodges deal +1 counter damage.",
		"level_2": "Momentum activates at Flow x2+."
	},
	"guardian": {
		"name": "Guardian",
		"rarity": "Uncommon",
		"default_unlocked": false,
		"unlock_type": "no_damage_encounters",
		"unlock_target": 3,
		"unlock_text": "Win 3 encounters without losing HP.",
		"max_level": 2,
		"level_1": "Gain 1 shield charge for this run. It blocks one hit.",
		"level_2": "Refresh 1 shield charge at the start of every enemy."
	},
	"bloodlust": {
		"name": "Bloodlust",
		"rarity": "Rare",
		"default_unlocked": false,
		"unlock_type": "elite_no_damage_clears",
		"unlock_target": 1,
		"unlock_text": "Defeat an Elite without losing HP in that encounter.",
		"max_level": 2,
		"level_1": "At Flow x4+, counters deal +1 damage.",
		"level_2": "Bloodlust activates at Flow x3+."
	}
}

static func display_name(id: String) -> String:
	return str(SKILLS[id]["name"])

static func rarity(id: String) -> String:
	return str(SKILLS[id]["rarity"])

static func default_unlocked(id: String) -> bool:
	return bool(SKILLS[id]["default_unlocked"])

static func unlock_type(id: String) -> String:
	return str(SKILLS[id]["unlock_type"])

static func unlock_target(id: String) -> int:
	return int(SKILLS[id]["unlock_target"])

static func unlock_text(id: String) -> String:
	return str(SKILLS[id]["unlock_text"])

static func max_level(id: String) -> int:
	return int(SKILLS[id]["max_level"])

static func description(id: String, level: int) -> String:
	return str(SKILLS[id]["level_%d" % level])

static func default_unlocked_ids() -> Array[String]:
	var ids: Array[String] = []
	for id in SKILLS.keys():
		var skill_id := str(id)
		if default_unlocked(skill_id):
			ids.append(skill_id)
	ids.sort()
	return ids
