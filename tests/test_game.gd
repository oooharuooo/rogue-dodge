extends "res://scripts/main.gd"

var pattern_starts := 0

# Real gameplay methods, isolated from the player's persistent save and automatic attacks.
func _ready() -> void:
	meta_data = SaveManager.default_data()
	unlocked_skills = SkillCatalog.default_unlocked_ids()
	_build_ui()
	_reset_run(false)
	_refresh_collection()

func _save_meta_progress() -> void:
	meta_data["unlocked_skills"] = unlocked_skills.duplicate()

func _play(_sound_name: String) -> void:
	pass

func _start_pattern() -> void:
	pattern_starts += 1

func _advance_pattern_after_exchange(_delay: float) -> void:
	pattern_step_index += 1
