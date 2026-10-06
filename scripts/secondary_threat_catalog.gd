extends RefCounted

const THREATS := {
	"heavy_knight": {
		"interval": 3,
		"entries": [
			{"name":"Ground Pulse","source":"arena","action":"low","windup":1.05},
			{"name":"Falling Hammer","source":"arena","action":"left","windup":1.00}
		]
	},
	"rogue": {
		"interval": 2,
		"entries": [
			{"name":"Shadow Archer","source":"minion","action":"left","windup":0.90},
			{"name":"Shadow Archer","source":"minion","action":"right","windup":0.90},
			{"name":"Shadow Archer","source":"minion","action":"high","windup":0.95}
		]
	},
	"duelist": {
		"interval": 2,
		"entries": [
			{"name":"Blade Trap","source":"arena","action":"high","windup":0.95},
			{"name":"Blade Trap","source":"arena","action":"low","windup":0.95},
			{"name":"Side Seal","source":"arena","action":"right","windup":0.90}
		]
	}
}

const EXECUTIONER_PHASE_THREATS := {
	1: {
		"interval": 3,
		"entries": [
			{"name":"Chain Tremor","source":"arena","action":"low","windup":1.05}
		]
	},
	2: {
		"interval": 2,
		"entries": [
			{"name":"Black Guard","source":"minion","action":"left","windup":0.90},
			{"name":"Black Guard","source":"minion","action":"right","windup":0.90}
		]
	},
	3: {
		"interval": 1,
		"entries": [
			{"name":"Death Field","source":"arena","action":"high","windup":0.82},
			{"name":"Death Field","source":"arena","action":"low","windup":0.82},
			{"name":"Black Guard","source":"minion","action":"right","windup":0.78},
			{"name":"Black Guard","source":"minion","action":"left","windup":0.78}
		]
	}
}

static func config_for(enemy_id: String, phase: int = 1) -> Dictionary:
	if enemy_id == "executioner":
		return EXECUTIONER_PHASE_THREATS.get(clampi(phase, 1, 3), {})
	return THREATS.get(enemy_id, {})

static func threat_for_exchange(enemy_id: String, phase: int, exchange_count: int) -> Dictionary:
	var config := config_for(enemy_id, phase)
	if config.is_empty():
		return {}

	var interval := int(config.get("interval", 0))
	if interval <= 0 or exchange_count <= 0 or exchange_count % interval != 0:
		return {}

	var entries: Array = config.get("entries", [])
	if entries.is_empty():
		return {}

	var index := int((exchange_count / interval - 1) % entries.size())
	return Dictionary(entries[index]).duplicate(true)
