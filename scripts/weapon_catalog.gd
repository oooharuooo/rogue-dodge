extends RefCounted

const WEAPONS := {
	"katana": {
		"name": "Katana",
		"tagline": "Precision",
		"counter_power": 3,
		"hits": 1,
		"perfect_bonus": 5,
		"description": "Perfect: +1 counter damage."
	},
	"daggers": {
		"name": "Daggers",
		"tagline": "Combo",
		"counter_power": 2,
		"hits": 5,
		"perfect_bonus": 3,
		"description": "2 hits normally, 3 on Perfect. Every 4 hits: +1 damage."
	},
	"greatsword": {
		"name": "Greatsword",
		"tagline": "Burst",
		"counter_power": 5,
		"hits": 1,
		"perfect_bonus": 4,
		"description": "Counters build Charge (max 2). Perfect spends it for bonus damage."
	},
	"bow": {
		"name": "Bow",
		"tagline": "Aim",
		"counter_power": 3,
		"hits": 3,
		"perfect_bonus": 4,
		"description": "Perfect stores Aim (max 2). Next normal counter spends it for bonus damage."
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
