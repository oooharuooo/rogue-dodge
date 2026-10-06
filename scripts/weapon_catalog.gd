extends RefCounted

const WEAPONS := {
	"katana": {
		"name": "Katana",
		"tagline": "Precision",
		"counter_power": 3,
		"hits": 1,
		"perfect_bonus": 5,
		"description": "Perfect Dodge adds +1 counter damage. Built for precise timing."
	},
	"daggers": {
		"name": "Daggers",
		"tagline": "Combo",
		"counter_power": 2,
		"hits": 5,
		"perfect_bonus": 3,
		"description": "Counters build hit events. Every 4 dagger hits adds +1 counter damage."
	},
	"greatsword": {
		"name": "Greatsword",
		"tagline": "Burst",
		"counter_power": 5,
		"hits": 1,
		"perfect_bonus": 4,
		"description": "Successful counters build Charge. Perfect Dodge consumes Charge for heavy bonus damage."
	},
	"bow": {
		"name": "Bow",
		"tagline": "Aim",
		"counter_power": 3,
		"hits": 3,
		"perfect_bonus": 4,
		"description": "Perfect Dodge stores Aim. The next successful counter consumes Aim for bonus arrow damage."
	}
}

static func ids() -> Array[String]:
	var result: Array[String] = []
	for id in WEAPONS.keys():
		result.append(str(id))
	result.sort()
	return result

static func display_name(id: String) -> String:
	return str(WEAPONS[id]["name"])

static func tagline(id: String) -> String:
	return str(WEAPONS[id]["tagline"])

static func description(id: String) -> String:
	return str(WEAPONS[id]["description"])

static func stat_line(id: String) -> String:
	var data: Dictionary = WEAPONS[id]
	return "Style: Power %d/5  |  Hits %d/5  |  Perfect %d/5" % [
		int(data["counter_power"]),
		int(data["hits"]),
		int(data["perfect_bonus"])
	]
