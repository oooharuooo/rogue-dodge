extends RefCounted

const MOVESETS := {
	"swordsman": [
		{"name":"Crosscut","steps":["left","right"]},
		{"name":"Return Cut","steps":["right","left"]}
	],
	"heavy_knight": [
		{"name":"Crushing Arc","steps":["left","delay_high"]},
		{"name":"Heavy Return","steps":["right","delay_left"]},
		{"name":"Crown Breaker","steps":["high","right"]}
	],
	"rogue": [
		{"name":"Three Knives","steps":["left","right","left"]},
		{"name":"Slipstream","steps":["right","left","high"]},
		{"name":"Bait & Cut","steps":["fake_left","quick_right"]}
	],
	"duelist": [
		{"name":"False Opening","steps":["fake_left","quick_right"]},
		{"name":"Mirror Feint","steps":["fake_right","quick_left"]},
		{"name":"High Line","steps":["left","high","right"]},
		{"name":"Reverse High","steps":["right","high","left"]}
	],
	"executioner": [
		{"name":"Judgment","steps":["left","delay_high","right"]},
		{"name":"False Mercy","steps":["fake_high","quick_left","right"]},
		{"name":"Headsman Chain","steps":["right","fake_left","quick_high"]},
		{"name":"Final Sentence","steps":["high","left","right","delay_high"]}
	]
}

static func patterns_for(enemy_id: String) -> Array:
	return MOVESETS.get(enemy_id, [])

static func base_action(step: String) -> String:
	for prefix in ["fake_", "delay_", "quick_"]:
		if step.begins_with(prefix):
			return step.trim_prefix(prefix)
	return step

static func is_fake(step: String) -> bool:
	return step.begins_with("fake_")

static func windup_multiplier(step: String) -> float:
	if step.begins_with("delay_"):
		return 1.45
	if step.begins_with("quick_"):
		return 0.58
	return 1.0
