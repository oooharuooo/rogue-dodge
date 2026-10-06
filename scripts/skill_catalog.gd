extends RefCounted

const SKILLS := {
	"flame_counter": {
		"name": "Flame Counter",
		"max_level": 2,
		"level_1": "Every 2nd Perfect Dodge deals +1 counter damage.",
		"level_2": "Every Perfect Dodge deals +1 counter damage."
	},
	"momentum": {
		"name": "Momentum",
		"max_level": 2,
		"level_1": "At Flow x3+, successful dodges deal +1 counter damage.",
		"level_2": "Momentum activates at Flow x2+."
	},
	"guardian": {
		"name": "Guardian",
		"max_level": 2,
		"level_1": "Gain 1 shield charge for this run. It blocks one hit.",
		"level_2": "Refresh 1 shield charge at the start of every enemy."
	},
	"focus": {
		"name": "Focus",
		"max_level": 2,
		"level_1": "Perfect Dodge timing window is slightly wider.",
		"level_2": "Perfect Dodge timing window is widened further."
	},
	"bloodlust": {
		"name": "Bloodlust",
		"max_level": 2,
		"level_1": "At Flow x4+, counters deal +1 damage.",
		"level_2": "Bloodlust activates at Flow x3+."
	}
}

static func display_name(id: String) -> String:
	return str(SKILLS[id]["name"])

static func max_level(id: String) -> int:
	return int(SKILLS[id]["max_level"])

static func description(id: String, level: int) -> String:
	return str(SKILLS[id]["level_%d" % level])
