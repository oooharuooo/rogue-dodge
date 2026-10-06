extends RefCounted

const SAVE_PATH := "user://rogue_dodge_meta.json"
const SAVE_VERSION := 1

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
		}
	}

static func load_data() -> Dictionary:
	var data := default_data()
	if not FileAccess.file_exists(SAVE_PATH):
		return data

	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return data

	var parsed = JSON.parse_string(file.get_as_text())
	if not (parsed is Dictionary):
		return data

	var parsed_dict: Dictionary = parsed
	var unlocked: Array = parsed_dict.get("unlocked_skills", [])
	for id in unlocked:
		var skill_id := str(id)
		if skill_id not in data["unlocked_skills"]:
			data["unlocked_skills"].append(skill_id)

	var parsed_progress: Dictionary = parsed_dict.get("progress", {})
	var progress: Dictionary = data["progress"]
	for key in progress.keys():
		if parsed_progress.has(key):
			progress[key] = int(parsed_progress[key])

	data["version"] = SAVE_VERSION
	return data

static func save_data(data: Dictionary) -> bool:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		return false
	file.store_string(JSON.stringify(data))
	return true
