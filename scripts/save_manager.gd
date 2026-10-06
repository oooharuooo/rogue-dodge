extends RefCounted

const SAVE_PATH := "user://rogue_dodge_meta.json"
const SAVE_VERSION := 2

static func default_data() -> Dictionary:
	return {
		"version": SAVE_VERSION,
		"unlocked_skills": ["flame_counter", "focus"],
		"progress": {
			"perfect_dodges": 0,
			"no_damage_encounters": 0,
			"elite_no_damage_clears": 0,
			"boss_clears": 0,
			"runs_completed": 0
		},
		"weapon_mastery": {
			"katana": 0,
			"daggers": 0,
			"greatsword": 0,
			"bow": 0
		}
	}

static func load_data(path: String = SAVE_PATH) -> Dictionary:
	var data := default_data()
	if not FileAccess.file_exists(path):
		return data

	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return data

	var json := JSON.new()
	if json.parse(file.get_as_text()) != OK:
		return data
	var parsed = json.data
	if not (parsed is Dictionary):
		return data

	var parsed_dict: Dictionary = parsed
	var raw_unlocked = parsed_dict.get("unlocked_skills", [])
	var unlocked: Array = raw_unlocked if raw_unlocked is Array else []
	for id in unlocked:
		var skill_id := str(id)
		if skill_id not in data["unlocked_skills"]:
			data["unlocked_skills"].append(skill_id)

	var raw_progress = parsed_dict.get("progress", {})
	var parsed_progress: Dictionary = raw_progress if raw_progress is Dictionary else {}
	var progress: Dictionary = data["progress"]
	for key in progress.keys():
		if parsed_progress.has(key) and (parsed_progress[key] is int or parsed_progress[key] is float):
			progress[key] = maxi(0, int(parsed_progress[key]))

	var raw_mastery = parsed_dict.get("weapon_mastery", {})
	var parsed_mastery: Dictionary = raw_mastery if raw_mastery is Dictionary else {}
	var weapon_mastery: Dictionary = data["weapon_mastery"]
	for weapon_id in weapon_mastery.keys():
		if parsed_mastery.has(weapon_id) and (parsed_mastery[weapon_id] is int or parsed_mastery[weapon_id] is float):
			weapon_mastery[weapon_id] = maxi(0, int(parsed_mastery[weapon_id]))

	data["version"] = SAVE_VERSION
	return data

static func save_data(data: Dictionary, path: String = SAVE_PATH) -> bool:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return false
	file.store_string(JSON.stringify(data))
	return true
