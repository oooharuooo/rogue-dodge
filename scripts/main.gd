extends Control

const MAX_HP := 3
const DODGE_COMMIT_SECONDS := 0.35
const SWIPE_DOWN_THRESHOLD := 28.0
const SWIPE_UP_THRESHOLD := 32.0
const TOUCH_MOUSE_SUPPRESS_MS := 1200
const SkillCatalog = preload("res://scripts/skill_catalog.gd")
const MovesetCatalog = preload("res://scripts/moveset_catalog.gd")
const DungeonCatalog = preload("res://scripts/dungeon_catalog.gd")
const SaveManager = preload("res://scripts/save_manager.gd")
const WeaponCatalog = preload("res://scripts/weapon_catalog.gd")
const WeaponUpgradeCatalog = preload("res://scripts/weapon_upgrade_catalog.gd")
const VersionInfo = preload("res://scripts/version_info.gd")

const C := {
	"bg": Color("111318"),
	"panel": Color("1b1f27"),
	"panel2": Color("232936"),
	"text": Color("f3f4f6"),
	"muted": Color("9ca3af"),
	"accent": Color("e3b341"),
	"danger": Color("e25555"),
	"good": Color("67c587"),
	"perfect": Color("73c8ff"),
	"player": Color("d7dde8"),
	"enemy": Color("a75c62")
}

var enemies := [
	{"id":"swordsman","name":"Swordsman","counters":1,"windup":1.50,"dodge_window":0.68,"perfect_window":0.21,"cue_before":0.43},
	{"id":"heavy_knight","name":"Heavy Knight","counters":2,"windup":2.35,"dodge_window":0.72,"perfect_window":0.22,"cue_before":0.47},
	{"id":"rogue","name":"Rogue","counters":2,"windup":1.05,"dodge_window":0.52,"perfect_window":0.17,"cue_before":0.33},
	{"id":"duelist","name":"Duelist","counters":3,"windup":1.20,"dodge_window":0.50,"perfect_window":0.16,"cue_before":0.31},
	{"id":"executioner","name":"Executioner","counters":4,"windup":1.85,"dodge_window":0.56,"perfect_window":0.17,"cue_before":0.36}
]

var hp := MAX_HP
var flow := 0
var enemy_index := 0
var enemy_counters_left := 1
var enemy_max_hp := 1
var last_counter_damage := 0
var run_active := false
var attack_side := ""
var attack_resolve_time := 0.0
var last_dodge_direction := ""
var last_dodge_time := -99.0
var dodge_locked_until := 0.0
var attack_generation := 0
var skill_levels: Dictionary = {}
var perfect_count := 0
var guardian_charges := 0
var current_weapon_id := ""
var dagger_hit_bank := 0
var greatsword_charge := 0
var bow_aim := 0
var weapon_upgrades: Array[String] = []
var run_weapon_mastery_level := 1
var dev_test_active := false
var dev_auto_dodge := false
var dev_force_perfect := false
var dev_god_mode := false
var dev_turn_based := false
var dev_enemy_hp := 20
var choice_mode := ""
var dungeon_floor := 0
var current_floor_number := 0
var gold := 0
var current_node_type := ""
var current_gold_reward := 0
var route_history: Dictionary = {}
var meta_data: Dictionary = {}
var unlocked_skills: Array[String] = []
var run_unlocked_pool: Array[String] = []
var encounter_took_damage := false
var pending_unlock_notice := ""
var current_pattern: Array[String] = []
var current_pattern_name := ""
var last_pattern_name := ""
var pattern_step_index := 0
var current_attack_step := ""
var touch_start_pos := Vector2.ZERO
var touch_tracking := false
var touch_action_fired := false
var touch_had_drag := false
var touch_down_accum := 0.0
var touch_up_accum := 0.0
var last_touch_event_ms := -10000

var hp_label: Label
var flow_label: Label
var progress_label: Label
var enemy_name_label: Label
var enemy_counter_label: Label
var state_label: Label
var enemy_body: ColorRect
var enemy_weapon: ColorRect
var weapon_indicator: Label
var player_body: ColorRect
var message_label: Label
var timing_bar: ProgressBar
var hint_label: Label
var restart_button: Button
var arena: Panel
var build_label: Label
var combat_stat_label: Label
var choice_overlay: ColorRect
var choice_title: Label
var choice_buttons: Array[Button] = []
var version_button: Button
var update_overlay: ColorRect
var duck_touch_zone: PanelContainer
var jump_touch_zone: PanelContainer
var map_overlay: ColorRect
var map_status_label: Label
var map_resource_label: Label
var map_buttons: Dictionary = {}
var collection_button: Button
var collection_overlay: ColorRect
var collection_list: VBoxContainer
var collection_summary_label: Label
var weapon_overlay: ColorRect
var weapon_buttons: Array[Button] = []
var weapon_mastery_labels: Dictionary = {}
var weapon_upgrade_overlay: ColorRect
var weapon_upgrade_buttons: Array[Button] = []
var dev_button: Button
var dev_step_button: Button
var dev_overlay: ColorRect
var dev_weapon_select: OptionButton
var dev_enemy_select: OptionButton
var dev_upgrade_select: OptionButton
var dev_hp_spin: SpinBox
var dev_auto_toggle: CheckButton
var dev_perfect_toggle: CheckButton
var dev_god_toggle: CheckButton
var dev_turn_toggle: CheckButton
var dev_status_label: Label

var audio_players: Dictionary = {}

func _ready() -> void:
	_load_meta_progress()
	_build_ui()
	_load_audio()
	_reset_run(false)
	_refresh_collection()
	_show_update_popup()

func _build_ui() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

	var bg := ColorRect.new()
	bg.color = C.bg
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)

	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 18)
	margin.add_theme_constant_override("margin_right", 18)
	margin.add_theme_constant_override("margin_top", 20)
	margin.add_theme_constant_override("margin_bottom", 20)
	add_child(margin)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 14)
	margin.add_child(column)

	var stats := HBoxContainer.new()
	stats.add_theme_constant_override("separation", 8)
	column.add_child(stats)
	hp_label = _stat(stats, "HP", "3 / 3")
	flow_label = _stat(stats, "FLOW", "x0")
	progress_label = _stat(stats, "FLOOR", "0 / 5")

	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 8)
	column.add_child(header)

	var info := VBoxContainer.new()
	info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(info)
	enemy_name_label = _label("Combat Sandbox", 22, C.text)
	info.add_child(enemy_name_label)
	enemy_counter_label = _label("Left / Right + Duck + Jump", 14, C.muted)
	info.add_child(enemy_counter_label)
	build_label = _label("Build: none", 12, C.perfect)
	build_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	info.add_child(build_label)

	combat_stat_label = _label("Counter ATK: N 1 / P 1  •  Last: -", 12, C.accent)
	combat_stat_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	info.add_child(combat_stat_label)

	state_label = _label("READY", 14, C.accent)
	state_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	state_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(state_label)

	arena = Panel.new()
	arena.custom_minimum_size = Vector2(0, 510)
	arena.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_style_panel(arena, C.panel)
	column.add_child(arena)

	timing_bar = ProgressBar.new()
	timing_bar.position = Vector2(22, 24)
	timing_bar.size = Vector2(460, 16)
	timing_bar.max_value = 1.0
	timing_bar.show_percentage = false
	arena.add_child(timing_bar)

	hint_label = _label("A/D dodge • S/↓ duck • W/↑ jump • Phone: use center buttons.", 14, C.muted)
	hint_label.position = Vector2(22, 52)
	hint_label.size = Vector2(460, 28)
	hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	arena.add_child(hint_label)

	weapon_indicator = _label("", 17, C.muted)
	weapon_indicator.position = Vector2(45, 130)
	weapon_indicator.size = Vector2(450, 42)
	weapon_indicator.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	arena.add_child(weapon_indicator)

	enemy_body = ColorRect.new()
	enemy_body.color = C.enemy
	enemy_body.position = Vector2(210, 185)
	enemy_body.size = Vector2(120, 120)
	arena.add_child(enemy_body)
	var enemy_text := _label("ENEMY", 18, C.text)
	enemy_text.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	enemy_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	enemy_text.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	enemy_body.add_child(enemy_text)

	enemy_weapon = ColorRect.new()
	enemy_weapon.color = Color("d8c17c")
	enemy_weapon.size = Vector2(14, 112)
	enemy_weapon.position = Vector2(300, 180)
	enemy_weapon.pivot_offset = Vector2(7, 98)
	enemy_weapon.rotation = deg_to_rad(18.0)
	enemy_weapon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	arena.add_child(enemy_weapon)

	player_body = ColorRect.new()
	player_body.color = C.player
	player_body.position = Vector2(235, 280)
	player_body.size = Vector2(70, 90)
	arena.add_child(player_body)
	var player_text := _label("YOU", 16, C.bg)
	player_text.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	player_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	player_text.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	player_body.add_child(player_text)

	var left_hint := _label("TAP LEFT\nA / ←", 16, C.muted)
	left_hint.position = Vector2(18, 405)
	left_hint.size = Vector2(150, 66)
	left_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	arena.add_child(left_hint)

	var right_hint := _label("TAP RIGHT\nD / →", 16, C.muted)
	right_hint.position = Vector2(372, 405)
	right_hint.size = Vector2(150, 66)
	right_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	arena.add_child(right_hint)

	jump_touch_zone = PanelContainer.new()
	jump_touch_zone.position = Vector2(165, 386)
	jump_touch_zone.size = Vector2(210, 48)
	jump_touch_zone.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var jump_style := StyleBoxFlat.new()
	jump_style.bg_color = Color(0.20, 0.34, 0.24, 0.94)
	jump_style.border_width_left = 2
	jump_style.border_width_top = 2
	jump_style.border_width_right = 2
	jump_style.border_width_bottom = 2
	jump_style.border_color = C.good
	jump_style.corner_radius_top_left = 12
	jump_style.corner_radius_top_right = 12
	jump_style.corner_radius_bottom_left = 12
	jump_style.corner_radius_bottom_right = 12
	jump_touch_zone.add_theme_stylebox_override("panel", jump_style)
	arena.add_child(jump_touch_zone)

	var jump_hint := _label("JUMP  ↑   •   W / ↑   •   swipe up", 13, C.text)
	jump_hint.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	jump_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	jump_hint.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	jump_hint.mouse_filter = Control.MOUSE_FILTER_IGNORE
	jump_touch_zone.add_child(jump_hint)

	duck_touch_zone = PanelContainer.new()
	duck_touch_zone.position = Vector2(165, 442)
	duck_touch_zone.size = Vector2(210, 54)
	duck_touch_zone.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var duck_style := StyleBoxFlat.new()
	duck_style.bg_color = Color(0.18, 0.30, 0.42, 0.92)
	duck_style.border_width_left = 2
	duck_style.border_width_top = 2
	duck_style.border_width_right = 2
	duck_style.border_width_bottom = 2
	duck_style.border_color = C.perfect
	duck_style.corner_radius_top_left = 14
	duck_style.corner_radius_top_right = 14
	duck_style.corner_radius_bottom_left = 14
	duck_style.corner_radius_bottom_right = 14
	duck_touch_zone.add_theme_stylebox_override("panel", duck_style)
	arena.add_child(duck_touch_zone)

	var duck_hint := _label("DUCK  ↓   •   S / ↓   •   swipe down", 13, C.text)
	duck_hint.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	duck_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	duck_hint.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	duck_hint.mouse_filter = Control.MOUSE_FILTER_IGNORE
	duck_touch_zone.add_child(duck_hint)

	message_label = _label("Start the run and learn the telegraphs.", 18, C.text)
	message_label.custom_minimum_size = Vector2(0, 48)
	message_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	message_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	message_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	column.add_child(message_label)

	var utility_row := HBoxContainer.new()
	utility_row.add_theme_constant_override("separation", 8)
	column.add_child(utility_row)

	dev_button = Button.new()
	dev_button.text = "DEV MODE"
	dev_button.custom_minimum_size = Vector2(0, 38)
	dev_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	dev_button.add_theme_font_size_override("font_size", 12)
	dev_button.pressed.connect(_show_dev_overlay)
	utility_row.add_child(dev_button)

	dev_step_button = Button.new()
	dev_step_button.text = "NEXT ATTACK"
	dev_step_button.custom_minimum_size = Vector2(0, 38)
	dev_step_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	dev_step_button.add_theme_font_size_override("font_size", 12)
	dev_step_button.visible = false
	dev_step_button.pressed.connect(_dev_next_attack)
	utility_row.add_child(dev_step_button)

	collection_button = Button.new()
	collection_button.text = "COLLECTION %d/%d" % [unlocked_skills.size(), SkillCatalog.SKILLS.size()]
	collection_button.custom_minimum_size = Vector2(0, 38)
	collection_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	collection_button.add_theme_font_size_override("font_size", 12)
	collection_button.pressed.connect(_show_collection)
	utility_row.add_child(collection_button)

	version_button = Button.new()
	version_button.text = VersionInfo.VERSION + "  •  WHAT'S NEW"
	version_button.custom_minimum_size = Vector2(0, 38)
	version_button.add_theme_font_size_override("font_size", 13)
	version_button.pressed.connect(_show_update_popup)
	column.add_child(version_button)

	restart_button = Button.new()
	restart_button.text = "START RUN"
	restart_button.custom_minimum_size = Vector2(0, 54)
	restart_button.pressed.connect(_begin_new_run)
	column.add_child(restart_button)

	_build_weapon_overlay()
	_build_weapon_upgrade_overlay()
	_build_choice_overlay()
	_build_dungeon_map()
	_build_collection_overlay()
	_build_dev_overlay()
	_build_update_overlay()

func _stat(parent: HBoxContainer, title: String, value: String) -> Label:
	var box := PanelContainer.new()
	box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	box.custom_minimum_size = Vector2(0, 72)
	_style_panel(box, C.panel2)
	parent.add_child(box)
	var vb := VBoxContainer.new()
	vb.alignment = BoxContainer.ALIGNMENT_CENTER
	box.add_child(vb)
	var t := _label(title, 12, C.muted)
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vb.add_child(t)
	var v := _label(value, 20, C.text)
	v.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vb.add_child(v)
	return v

func _label(value: String, size: int, color: Color) -> Label:
	var label := Label.new()
	label.text = value
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	return label

func _style_panel(control: Control, color: Color) -> void:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.corner_radius_top_left = 14
	style.corner_radius_top_right = 14
	style.corner_radius_bottom_left = 14
	style.corner_radius_bottom_right = 14
	control.add_theme_stylebox_override("panel", style)

func _build_dungeon_map() -> void:
	map_overlay = ColorRect.new()
	map_overlay.color = Color(0.025, 0.03, 0.045, 0.985)
	map_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	map_overlay.visible = false
	map_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(map_overlay)

	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 20)
	margin.add_theme_constant_override("margin_right", 20)
	margin.add_theme_constant_override("margin_top", 34)
	margin.add_theme_constant_override("margin_bottom", 34)
	map_overlay.add_child(margin)

	var panel := PanelContainer.new()
	_style_panel(panel, C.panel)
	margin.add_child(panel)

	var inner := MarginContainer.new()
	inner.add_theme_constant_override("margin_left", 18)
	inner.add_theme_constant_override("margin_right", 18)
	inner.add_theme_constant_override("margin_top", 18)
	inner.add_theme_constant_override("margin_bottom", 18)
	panel.add_child(inner)

	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 10)
	inner.add_child(box)

	var title := _label("DUNGEON MAP", 26, C.text)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(title)

	map_resource_label = _label("", 13, C.perfect)
	map_resource_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(map_resource_label)

	map_status_label = _label("Choose your route.", 13, C.muted)
	map_status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	map_status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(map_status_label)

	var separator := HSeparator.new()
	box.add_child(separator)

	for floor_index in range(DungeonCatalog.floor_count() - 1, -1, -1):
		var floor_title := _label("FLOOR %d" % (floor_index + 1), 11, C.muted)
		floor_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		box.add_child(floor_title)

		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		row.alignment = BoxContainer.ALIGNMENT_CENTER
		box.add_child(row)

		for node in DungeonCatalog.nodes_for_floor(floor_index):
			var button := Button.new()
			var node_id := str(node.id)
			button.text = str(node.label)
			button.custom_minimum_size = Vector2(0, 62)
			button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			button.add_theme_font_size_override("font_size", 13)
			button.pressed.connect(_select_map_node.bind(floor_index, node_id))
			row.add_child(button)
			map_buttons["%d:%s" % [floor_index, node_id]] = button

func _show_dungeon_map(status_text: String = "Choose your route.") -> void:
	run_active = false
	attack_generation += 1
	if map_overlay != null:
		map_overlay.visible = false
	if choice_overlay != null:
		choice_overlay.visible = false
	if weapon_overlay != null:
		weapon_overlay.visible = false
	attack_side = ""
	timing_bar.value = 0.0
	weapon_indicator.text = ""
	map_status_label.text = status_text
	var map_weapon := "none" if current_weapon_id == "" else WeaponCatalog.display_name(current_weapon_id)
	map_resource_label.text = "HP %d/%d   •   GOLD %d   •   %s   •   BUILD %d   •   COLLECTION %d/%d" % [hp, MAX_HP, gold, map_weapon, skill_levels.size(), unlocked_skills.size(), SkillCatalog.SKILLS.size()]

	for floor_index in range(DungeonCatalog.floor_count()):
		for node in DungeonCatalog.nodes_for_floor(floor_index):
			var node_id := str(node.id)
			var key := "%d:%s" % [floor_index, node_id]
			var button: Button = map_buttons[key]
			var completed := route_history.has(floor_index)
			button.disabled = floor_index != dungeon_floor
			if completed:
				var picked := str(route_history[floor_index]) == node_id
				button.text = ("✓ " if picked else "· ") + str(node.label)
				button.modulate = Color(0.75, 0.75, 0.75, 0.72)
			else:
				button.text = str(node.label)
				button.modulate = Color.WHITE if floor_index == dungeon_floor else Color(0.62, 0.62, 0.62, 0.58)

	map_overlay.visible = true
	map_overlay.move_to_front()
	_update_hud()

func _select_map_node(floor_index: int, node_id: String) -> void:
	if floor_index != dungeon_floor:
		return

	var node := DungeonCatalog.node_by_id(floor_index, node_id)
	if node.is_empty():
		return

	route_history[floor_index] = node_id
	current_floor_number = floor_index + 1
	dungeon_floor = floor_index + 1
	current_node_type = str(node.type)
	current_gold_reward = int(node.get("gold", 0))
	map_overlay.visible = false
	_update_hud()

	match current_node_type:
		"normal", "elite", "boss":
			enemy_index = int(node.enemy_index)
			run_active = true
			restart_button.text = "RUNNING"
			restart_button.disabled = true
			if collection_button != null:
				collection_button.disabled = true
			message_label.text = "Entering %s..." % current_node_type.to_upper()
			_load_enemy()
		"rest":
			var before := hp
			hp = mini(MAX_HP, hp + 1)
			flow = 0
			_show_dungeon_map("REST: healed %d HP. Flow reset." % (hp - before))
		"shrine":
			if _owned_upgrade_candidates().is_empty():
				gold += 1
				_show_dungeon_map("SHRINE: no owned skill can upgrade. Converted to +1 Gold.")
			else:
				_show_skill_choices("upgrade")
		"shop":
			if gold >= 2:
				gold -= 2
				_show_skill_choices("shop")
			else:
				_show_dungeon_map("SHOP: need 2 Gold. You move on without buying.")
		_:
			_show_dungeon_map("Unknown node.")

func _owned_upgrade_candidates() -> Array[String]:
	var candidates: Array[String] = []
	for id in skill_levels.keys():
		var skill_id := str(id)
		if int(skill_levels[skill_id]) < SkillCatalog.max_level(skill_id):
			candidates.append(skill_id)
	return candidates

func _load_meta_progress() -> void:
	meta_data = SaveManager.load_data()
	unlocked_skills.clear()

	var saved_unlocked: Array = meta_data.get("unlocked_skills", [])
	for id in saved_unlocked:
		var skill_id := str(id)
		if SkillCatalog.SKILLS.has(skill_id) and skill_id not in unlocked_skills:
			unlocked_skills.append(skill_id)

	for skill_id in SkillCatalog.default_unlocked_ids():
		if skill_id not in unlocked_skills:
			unlocked_skills.append(skill_id)

	unlocked_skills.sort()
	meta_data["unlocked_skills"] = unlocked_skills.duplicate()
	_save_meta_progress()

func _save_meta_progress() -> void:
	meta_data["unlocked_skills"] = unlocked_skills.duplicate()
	SaveManager.save_data(meta_data)

func _weapon_mastery_xp(weapon_id: String) -> int:
	var mastery: Dictionary = meta_data.get("weapon_mastery", {})
	return int(mastery.get(weapon_id, 0))

func _weapon_mastery_level(weapon_id: String) -> int:
	return WeaponUpgradeCatalog.mastery_level(_weapon_mastery_xp(weapon_id))

func _add_weapon_mastery_xp(amount: int = 1) -> void:
	if dev_test_active or current_weapon_id == "":
		return

	var mastery: Dictionary = meta_data.get("weapon_mastery", {})
	var old_xp := int(mastery.get(current_weapon_id, 0))
	var old_level := WeaponUpgradeCatalog.mastery_level(old_xp)
	var new_xp := old_xp + amount
	mastery[current_weapon_id] = new_xp
	meta_data["weapon_mastery"] = mastery

	var new_level := WeaponUpgradeCatalog.mastery_level(new_xp)
	if new_level > old_level:
		var notice := "%s MASTERY Lv.%d unlocked" % [WeaponCatalog.display_name(current_weapon_id).to_upper(), new_level]
		pending_unlock_notice = notice if pending_unlock_notice == "" else pending_unlock_notice + "\n" + notice

	_save_meta_progress()
	_refresh_weapon_mastery_ui()

func _refresh_weapon_mastery_ui() -> void:
	for weapon_id in weapon_mastery_labels.keys():
		var label: Label = weapon_mastery_labels[weapon_id]
		label.text = WeaponUpgradeCatalog.mastery_progress_text(_weapon_mastery_xp(str(weapon_id)))

func _meta_progress_value(key: String) -> int:
	var progress: Dictionary = meta_data.get("progress", {})
	return int(progress.get(key, 0))

func _add_meta_progress(key: String, amount: int = 1) -> void:
	if dev_test_active:
		return
	var progress: Dictionary = meta_data.get("progress", {})
	progress[key] = int(progress.get(key, 0)) + amount
	meta_data["progress"] = progress
	_check_permanent_unlocks()
	_save_meta_progress()

func _is_skill_unlocked(skill_id: String) -> bool:
	return skill_id in unlocked_skills

func _check_permanent_unlocks() -> void:
	var newly_unlocked: Array[String] = []
	for raw_id in SkillCatalog.SKILLS.keys():
		var skill_id := str(raw_id)
		if _is_skill_unlocked(skill_id):
			continue
		var requirement := SkillCatalog.unlock_type(skill_id)
		var target := SkillCatalog.unlock_target(skill_id)
		if requirement == "default":
			continue
		if _meta_progress_value(requirement) >= target:
			unlocked_skills.append(skill_id)
			newly_unlocked.append(skill_id)

	if newly_unlocked.is_empty():
		return

	unlocked_skills.sort()
	var names: Array[String] = []
	for skill_id in newly_unlocked:
		names.append(SkillCatalog.display_name(skill_id))
	var notice := "PERMANENT UNLOCK: " + ", ".join(names)
	pending_unlock_notice = notice if pending_unlock_notice == "" else pending_unlock_notice + "\n" + notice
	_refresh_collection()

func _build_collection_overlay() -> void:
	collection_overlay = ColorRect.new()
	collection_overlay.color = Color(0.025, 0.03, 0.045, 0.985)
	collection_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	collection_overlay.visible = false
	collection_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(collection_overlay)

	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 22)
	margin.add_theme_constant_override("margin_right", 22)
	margin.add_theme_constant_override("margin_top", 42)
	margin.add_theme_constant_override("margin_bottom", 42)
	collection_overlay.add_child(margin)

	var panel := PanelContainer.new()
	_style_panel(panel, C.panel)
	margin.add_child(panel)

	var inner := MarginContainer.new()
	inner.add_theme_constant_override("margin_left", 18)
	inner.add_theme_constant_override("margin_right", 18)
	inner.add_theme_constant_override("margin_top", 18)
	inner.add_theme_constant_override("margin_bottom", 18)
	panel.add_child(inner)

	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 10)
	inner.add_child(box)

	var title := _label("PERMANENT COLLECTION", 24, C.text)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(title)

	collection_summary_label = _label("", 12, C.perfect)
	collection_summary_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(collection_summary_label)

	var note := _label("Unlock = permanent collection. Acquire/upgrade = current run only.", 12, C.muted)
	note.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	note.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(note)

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.custom_minimum_size = Vector2(0, 560)
	box.add_child(scroll)

	collection_list = VBoxContainer.new()
	collection_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	collection_list.add_theme_constant_override("separation", 8)
	scroll.add_child(collection_list)

	var close := Button.new()
	close.text = "CLOSE"
	close.custom_minimum_size = Vector2(0, 48)
	close.pressed.connect(_hide_collection)
	box.add_child(close)

func _refresh_collection() -> void:
	if collection_list == null:
		return

	for child in collection_list.get_children():
		child.queue_free()

	var skill_ids: Array[String] = []
	for raw_id in SkillCatalog.SKILLS.keys():
		skill_ids.append(str(raw_id))
	skill_ids.sort()

	for skill_id in skill_ids:
		var unlocked := _is_skill_unlocked(skill_id)
		var card := PanelContainer.new()
		_style_panel(card, C.panel2)
		collection_list.add_child(card)

		var card_margin := MarginContainer.new()
		card_margin.add_theme_constant_override("margin_left", 12)
		card_margin.add_theme_constant_override("margin_right", 12)
		card_margin.add_theme_constant_override("margin_top", 10)
		card_margin.add_theme_constant_override("margin_bottom", 10)
		card.add_child(card_margin)

		var vb := VBoxContainer.new()
		vb.add_theme_constant_override("separation", 4)
		card_margin.add_child(vb)

		var status := "UNLOCKED" if unlocked else "LOCKED"
		var title := _label("%s  •  %s  •  %s" % [SkillCatalog.display_name(skill_id), SkillCatalog.rarity(skill_id), status], 15, C.good if unlocked else C.muted)
		vb.add_child(title)

		var desc := _label(SkillCatalog.description(skill_id, 1), 12, C.text if unlocked else C.muted)
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		vb.add_child(desc)

		if not unlocked:
			var key := SkillCatalog.unlock_type(skill_id)
			var current := _meta_progress_value(key)
			var target := SkillCatalog.unlock_target(skill_id)
			var req := _label("%s  [%d / %d]" % [SkillCatalog.unlock_text(skill_id), mini(current, target), target], 12, C.accent)
			req.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
			vb.add_child(req)
		else:
			var req := _label(SkillCatalog.unlock_text(skill_id), 11, C.muted)
			req.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
			vb.add_child(req)

	collection_summary_label.text = "Unlocked %d / %d  •  Progress saves locally on this device/browser" % [unlocked_skills.size(), SkillCatalog.SKILLS.size()]
	if collection_button != null:
		collection_button.text = "COLLECTION %d/%d" % [unlocked_skills.size(), SkillCatalog.SKILLS.size()]

func _show_collection() -> void:
	if run_active:
		return
	_refresh_collection()
	collection_overlay.visible = true
	collection_overlay.move_to_front()

func _hide_collection() -> void:
	if collection_overlay != null:
		collection_overlay.visible = false

func _consume_unlock_notice(prefix: String = "") -> String:
	if pending_unlock_notice == "":
		return prefix
	var result := pending_unlock_notice if prefix == "" else prefix + "\n" + pending_unlock_notice
	pending_unlock_notice = ""
	return result

func _build_dev_overlay() -> void:
	dev_overlay = ColorRect.new()
	dev_overlay.color = Color(0.02, 0.025, 0.035, 0.99)
	dev_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dev_overlay.visible = false
	dev_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(dev_overlay)

	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 26)
	margin.add_theme_constant_override("margin_right", 26)
	margin.add_theme_constant_override("margin_top", 36)
	margin.add_theme_constant_override("margin_bottom", 36)
	dev_overlay.add_child(margin)

	var panel := PanelContainer.new()
	_style_panel(panel, C.panel)
	margin.add_child(panel)

	var inner := MarginContainer.new()
	inner.add_theme_constant_override("margin_left", 18)
	inner.add_theme_constant_override("margin_right", 18)
	inner.add_theme_constant_override("margin_top", 18)
	inner.add_theme_constant_override("margin_bottom", 18)
	panel.add_child(inner)

	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 10)
	inner.add_child(box)

	var title := _label("DEV TEST MODE", 24, C.text)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(title)

	var warning := _label("Isolated sandbox: no Gold, achievements, permanent unlocks or route rewards.", 12, C.accent)
	warning.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	warning.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(warning)

	var weapon_row := HBoxContainer.new()
	weapon_row.add_theme_constant_override("separation", 8)
	box.add_child(weapon_row)
	var weapon_label := _label("Weapon", 13, C.muted)
	weapon_label.custom_minimum_size = Vector2(110, 0)
	weapon_row.add_child(weapon_label)
	dev_weapon_select = OptionButton.new()
	dev_weapon_select.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	for weapon_id in ["katana", "daggers", "greatsword", "bow"]:
		dev_weapon_select.add_item(WeaponCatalog.display_name(weapon_id))
	weapon_row.add_child(dev_weapon_select)

	var enemy_row := HBoxContainer.new()
	enemy_row.add_theme_constant_override("separation", 8)
	box.add_child(enemy_row)
	var enemy_label := _label("Enemy", 13, C.muted)
	enemy_label.custom_minimum_size = Vector2(110, 0)
	enemy_row.add_child(enemy_label)
	dev_enemy_select = OptionButton.new()
	dev_enemy_select.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	for enemy in enemies:
		dev_enemy_select.add_item(str(enemy.name))
	enemy_row.add_child(dev_enemy_select)

	var hp_row := HBoxContainer.new()
	hp_row.add_theme_constant_override("separation", 8)
	box.add_child(hp_row)
	var hp_text := _label("Enemy Test HP", 13, C.muted)
	hp_text.custom_minimum_size = Vector2(110, 0)
	hp_row.add_child(hp_text)
	dev_hp_spin = SpinBox.new()
	dev_hp_spin.min_value = 5
	dev_hp_spin.max_value = 100
	dev_hp_spin.step = 1
	dev_hp_spin.value = 20
	dev_hp_spin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hp_row.add_child(dev_hp_spin)

	dev_turn_toggle = CheckButton.new()
	dev_turn_toggle.text = "Turn-Based Test — one attack per NEXT ATTACK"
	dev_turn_toggle.button_pressed = true
	box.add_child(dev_turn_toggle)

	dev_auto_toggle = CheckButton.new()
	dev_auto_toggle.text = "Auto Dodge — automatically choose the correct movement"
	dev_auto_toggle.button_pressed = true
	box.add_child(dev_auto_toggle)

	dev_perfect_toggle = CheckButton.new()
	dev_perfect_toggle.text = "Force Perfect — Auto Dodge always lands inside Perfect window"
	dev_perfect_toggle.button_pressed = false
	box.add_child(dev_perfect_toggle)

	dev_god_toggle = CheckButton.new()
	dev_god_toggle.text = "God Mode — mistakes do not remove player HP"
	dev_god_toggle.button_pressed = true
	box.add_child(dev_god_toggle)

	dev_status_label = _label("Recommended for weapon testing: Turn-Based ON + Auto Dodge ON.", 12, C.perfect)
	dev_status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	dev_status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(dev_status_label)

	var future := _label("Future test slots: Weapon Mastery XP, status effects, projectiles, multi-enemy, boss phases, DPS/balance logs.", 11, C.muted)
	future.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	future.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(future)

	var start := Button.new()
	start.text = "START DEV TEST"
	start.custom_minimum_size = Vector2(0, 48)
	start.pressed.connect(_start_dev_test)
	box.add_child(start)

	var close := Button.new()
	close.text = "CLOSE"
	close.custom_minimum_size = Vector2(0, 42)
	close.pressed.connect(_hide_dev_overlay)
	box.add_child(close)

func _show_dev_overlay() -> void:
	if run_active:
		run_active = false
		attack_generation += 1
		attack_side = ""
		timing_bar.value = 0.0
		message_label.text = "Combat stopped for Dev Mode."
		restart_button.text = "START RUN"
		restart_button.disabled = false
	if dev_step_button != null:
		dev_step_button.visible = false
	dev_test_active = false
	dev_button.text = "DEV MODE"
	dev_overlay.visible = true
	dev_overlay.move_to_front()

func _hide_dev_overlay() -> void:
	if dev_overlay != null:
		dev_overlay.visible = false

func _start_dev_test() -> void:
	attack_generation += 1
	run_active = false
	attack_side = ""
	timing_bar.value = 0.0
	player_body.position = Vector2(235, 280)
	player_body.size = Vector2(70, 90)
	player_body.modulate = Color.WHITE
	_reset_enemy_pose()
	enemy_body.modulate = Color.WHITE

	var weapon_ids := ["katana", "daggers", "greatsword", "bow"]
	var weapon_index := clampi(dev_weapon_select.selected, 0, weapon_ids.size() - 1)
	enemy_index = clampi(dev_enemy_select.selected, 0, enemies.size() - 1)
	current_weapon_id = weapon_ids[weapon_index]
	dev_enemy_hp = int(dev_hp_spin.value)
	dev_turn_based = dev_turn_toggle.button_pressed
	dev_auto_dodge = dev_auto_toggle.button_pressed
	dev_force_perfect = dev_perfect_toggle.button_pressed and dev_auto_dodge
	dev_god_mode = dev_god_toggle.button_pressed
	dev_test_active = true

	skill_levels.clear()
	perfect_count = 0
	guardian_charges = 0
	dagger_hit_bank = 0
	greatsword_charge = 0
	bow_aim = 0
	flow = 0
	hp = MAX_HP
	current_node_type = "dev"
	current_gold_reward = 0
	last_counter_damage = 0
	pending_unlock_notice = ""
	route_history.clear()
	dungeon_floor = 0
	current_floor_number = 0

	if weapon_overlay != null:
		weapon_overlay.visible = false
	if choice_overlay != null:
		choice_overlay.visible = false
	if map_overlay != null:
		map_overlay.visible = false
	if collection_overlay != null:
		collection_overlay.visible = false
	dev_overlay.visible = false

	run_active = true
	restart_button.text = "DEV TEST"
	restart_button.disabled = true
	collection_button.disabled = true
	dev_step_button.visible = dev_turn_based
	dev_step_button.disabled = false
	dev_button.text = "DEV MODE *"
	message_label.text = "DEV TEST: %s vs %s" % [WeaponCatalog.display_name(current_weapon_id), str(enemies[enemy_index].name)]
	_update_hud()
	_load_enemy()

func _dev_next_attack() -> void:
	if not dev_test_active or not dev_turn_based or not run_active:
		return
	if attack_side != "":
		return
	if dev_step_button != null:
		dev_step_button.disabled = true
	if current_pattern.is_empty():
		_start_pattern()
	else:
		_begin_pattern_step()

func _dev_correct_action(action: String) -> String:
	if action == "high":
		return "duck"
	if action == "low":
		return "jump"
	if action == "left":
		return "right"
	return "left"

func _dev_apply_auto_dodge(action: String, enemy: Dictionary) -> void:
	if not dev_test_active or not dev_auto_dodge:
		return

	var correct := _dev_correct_action(action)
	last_dodge_direction = correct
	var perfect_window := _effective_perfect_window(enemy)
	if dev_force_perfect:
		last_dodge_time = attack_resolve_time - maxf(0.01, perfect_window * 0.45)
	else:
		var dodge_window := float(enemy.dodge_window)
		var target_early := perfect_window + maxf(0.04, (dodge_window - perfect_window) * 0.55)
		last_dodge_time = attack_resolve_time - minf(dodge_window * 0.90, target_early)

	if correct == "duck":
		_play("duck")
		_duck_animation()
	elif correct == "jump":
		_play("jump")
		_jump_animation()
	else:
		_play("dodge")
		var target_x := 170.0 if correct == "left" else 300.0
		var tween := create_tween()
		tween.set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
		tween.tween_property(player_body, "position:x", target_x, 0.08)
		tween.set_ease(Tween.EASE_IN)
		tween.tween_property(player_body, "position:x", 235.0, 0.12)

func _build_update_overlay() -> void:
	update_overlay = ColorRect.new()
	update_overlay.color = Color(0.025, 0.03, 0.045, 0.975)
	update_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	update_overlay.visible = false
	update_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(update_overlay)

	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 28)
	margin.add_theme_constant_override("margin_right", 28)
	margin.add_theme_constant_override("margin_top", 80)
	margin.add_theme_constant_override("margin_bottom", 70)
	update_overlay.add_child(margin)

	var panel := PanelContainer.new()
	_style_panel(panel, C.panel)
	margin.add_child(panel)

	var inner := MarginContainer.new()
	inner.add_theme_constant_override("margin_left", 22)
	inner.add_theme_constant_override("margin_right", 22)
	inner.add_theme_constant_override("margin_top", 24)
	inner.add_theme_constant_override("margin_bottom", 24)
	panel.add_child(inner)

	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 14)
	inner.add_child(box)

	var title := _label("ROGUE DODGE  " + VersionInfo.VERSION, 26, C.text)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(title)

	var build := _label(VersionInfo.BUILD_NAME, 15, C.perfect)
	build.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(build)

	var divider := HSeparator.new()
	box.add_child(divider)

	var whats_new := _label("WHAT'S NEW", 16, C.accent)
	box.add_child(whats_new)

	var changes := _label(VersionInfo.changelog_text(), 14, C.text)
	changes.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	changes.size_flags_vertical = Control.SIZE_EXPAND_FILL
	box.add_child(changes)

	var note := _label("If this version number changes after a refresh, your phone has the latest build.", 12, C.muted)
	note.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	note.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(note)

	var close := Button.new()
	close.text = "CONTINUE"
	close.custom_minimum_size = Vector2(0, 52)
	close.pressed.connect(_hide_update_popup)
	box.add_child(close)

func _show_update_popup() -> void:
	if update_overlay == null:
		return
	update_overlay.visible = true
	update_overlay.move_to_front()

func _hide_update_popup() -> void:
	if update_overlay != null:
		update_overlay.visible = false

func _build_weapon_overlay() -> void:
	weapon_overlay = ColorRect.new()
	weapon_overlay.color = Color(0.035, 0.04, 0.055, 0.985)
	weapon_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	weapon_overlay.visible = false
	weapon_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(weapon_overlay)

	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 24)
	margin.add_theme_constant_override("margin_right", 24)
	margin.add_theme_constant_override("margin_top", 28)
	margin.add_theme_constant_override("margin_bottom", 28)
	weapon_overlay.add_child(margin)

	var panel := PanelContainer.new()
	_style_panel(panel, C.panel)
	margin.add_child(panel)

	var inner := MarginContainer.new()
	inner.add_theme_constant_override("margin_left", 16)
	inner.add_theme_constant_override("margin_right", 16)
	inner.add_theme_constant_override("margin_top", 16)
	inner.add_theme_constant_override("margin_bottom", 16)
	panel.add_child(inner)

	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 8)
	inner.add_child(box)

	var title := _label("CHOOSE WEAPON", 25, C.text)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(title)

	var sub := _label("Movement is your only combat input. Weapon changes the automatic counter.", 12, C.muted)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(sub)

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.custom_minimum_size = Vector2(0, 600)
	box.add_child(scroll)

	var list := VBoxContainer.new()
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list.add_theme_constant_override("separation", 10)
	scroll.add_child(list)

	for weapon_id in ["katana", "daggers", "greatsword", "bow"]:
		var card := PanelContainer.new()
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		_style_panel(card, C.panel2)
		list.add_child(card)

		var card_margin := MarginContainer.new()
		card_margin.add_theme_constant_override("margin_left", 12)
		card_margin.add_theme_constant_override("margin_right", 12)
		card_margin.add_theme_constant_override("margin_top", 10)
		card_margin.add_theme_constant_override("margin_bottom", 10)
		card.add_child(card_margin)

		var vb := VBoxContainer.new()
		vb.add_theme_constant_override("separation", 4)
		card_margin.add_child(vb)

		var name_label := _label("%s - %s" % [WeaponCatalog.display_name(weapon_id), WeaponCatalog.tagline(weapon_id)], 16, C.text)
		name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vb.add_child(name_label)

		var stat := _label(WeaponCatalog.stat_line(weapon_id), 12, C.accent)
		stat.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		stat.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		vb.add_child(stat)

		var mastery_label := _label("", 12, C.perfect)
		mastery_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vb.add_child(mastery_label)
		weapon_mastery_labels[weapon_id] = mastery_label

		var desc := _label(WeaponCatalog.description(weapon_id), 12, C.muted)
		desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc.custom_minimum_size = Vector2(0, 38)
		vb.add_child(desc)

		var select := Button.new()
		select.text = "SELECT " + WeaponCatalog.display_name(weapon_id).to_upper()
		select.custom_minimum_size = Vector2(0, 36)
		select.pressed.connect(_choose_weapon.bind(weapon_id))
		vb.add_child(select)
		weapon_buttons.append(select)

func _show_weapon_choices() -> void:
	_refresh_weapon_mastery_ui()
	run_active = false
	attack_generation += 1
	attack_side = ""
	timing_bar.value = 0.0
	weapon_indicator.text = ""
	state_label.text = "LOADOUT"
	state_label.add_theme_color_override("font_color", C.accent)
	restart_button.disabled = true
	if collection_button != null:
		collection_button.disabled = false
	weapon_overlay.visible = true
	weapon_overlay.move_to_front()

func _choose_weapon(weapon_id: String) -> void:
	if not WeaponCatalog.WEAPONS.has(weapon_id):
		return
	current_weapon_id = weapon_id
	run_weapon_mastery_level = _weapon_mastery_level(weapon_id)
	weapon_upgrades.clear()
	dagger_hit_bank = 0
	greatsword_charge = 0
	bow_aim = 0
	weapon_overlay.visible = false
	_update_build_label()
	message_label.text = "%s selected. Choose a starter skill." % WeaponCatalog.display_name(weapon_id)
	_show_skill_choices("starter")

func _build_weapon_upgrade_overlay() -> void:
	weapon_upgrade_overlay = ColorRect.new()
	weapon_upgrade_overlay.color = Color(0.035, 0.04, 0.055, 0.985)
	weapon_upgrade_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	weapon_upgrade_overlay.visible = false
	weapon_upgrade_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(weapon_upgrade_overlay)

	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 28)
	margin.add_theme_constant_override("margin_right", 28)
	margin.add_theme_constant_override("margin_top", 90)
	margin.add_theme_constant_override("margin_bottom", 90)
	weapon_upgrade_overlay.add_child(margin)

	var panel := PanelContainer.new()
	_style_panel(panel, C.panel)
	margin.add_child(panel)

	var inner := MarginContainer.new()
	inner.add_theme_constant_override("margin_left", 18)
	inner.add_theme_constant_override("margin_right", 18)
	inner.add_theme_constant_override("margin_top", 18)
	inner.add_theme_constant_override("margin_bottom", 18)
	panel.add_child(inner)

	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 12)
	inner.add_child(box)

	var title := _label("ELITE REWARD — WEAPON UPGRADE", 22, C.text)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(title)

	var note := _label("Choose one upgrade unlocked by your permanent Weapon Mastery. It lasts for this run only.", 12, C.muted)
	note.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	note.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(note)

	for i in range(2):
		var button := Button.new()
		button.custom_minimum_size = Vector2(0, 112)
		button.add_theme_font_size_override("font_size", 14)
		button.visible = false
		box.add_child(button)
		weapon_upgrade_buttons.append(button)

func _available_weapon_upgrades() -> Array[Dictionary]:
	if current_weapon_id == "":
		return []
	var result: Array[Dictionary] = []
	for upgrade in WeaponUpgradeCatalog.unlocked_upgrades(current_weapon_id, run_weapon_mastery_level):
		var upgrade_id := str(upgrade["id"])
		if upgrade_id not in weapon_upgrades:
			result.append(upgrade)
	return result

func _show_weapon_upgrade_choices() -> bool:
	var candidates := _available_weapon_upgrades()
	if candidates.is_empty():
		return false

	for i in range(weapon_upgrade_buttons.size()):
		var button := weapon_upgrade_buttons[i]
		for conn in button.pressed.get_connections():
			button.pressed.disconnect(conn.callable)

		if i < candidates.size():
			var upgrade: Dictionary = candidates[i]
			var upgrade_id := str(upgrade["id"])
			button.visible = true
			button.text = "%s\n%s" % [str(upgrade["name"]), str(upgrade["description"])]
			button.pressed.connect(_choose_weapon_upgrade.bind(upgrade_id))
		else:
			button.visible = false

	weapon_upgrade_overlay.visible = true
	weapon_upgrade_overlay.move_to_front()
	return true

func _choose_weapon_upgrade(upgrade_id: String) -> void:
	var data := WeaponUpgradeCatalog.upgrade_by_id(current_weapon_id, upgrade_id)
	if data.is_empty() or upgrade_id in weapon_upgrades:
		return
	weapon_upgrades.append(upgrade_id)
	weapon_upgrade_overlay.visible = false
	_update_build_label()
	message_label.text = "%s acquired for this run." % str(data["name"])
	_show_skill_choices("reward")

func _has_weapon_upgrade(upgrade_id: String) -> bool:
	return upgrade_id in weapon_upgrades

func _build_choice_overlay() -> void:
	choice_overlay = ColorRect.new()
	choice_overlay.color = Color(0.035, 0.04, 0.055, 0.97)
	choice_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	choice_overlay.visible = false
	choice_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(choice_overlay)

	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 24)
	margin.add_theme_constant_override("margin_right", 24)
	margin.add_theme_constant_override("margin_top", 90)
	margin.add_theme_constant_override("margin_bottom", 70)
	choice_overlay.add_child(margin)

	var box := VBoxContainer.new()
	box.alignment = BoxContainer.ALIGNMENT_CENTER
	box.add_theme_constant_override("separation", 14)
	margin.add_child(box)

	choice_title = _label("CHOOSE STARTER SKILL", 24, C.text)
	choice_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(choice_title)

	var sub := _label("Only permanently unlocked collection skills can appear in this run.", 13, C.muted)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(sub)

	for i in range(3):
		var button := Button.new()
		button.custom_minimum_size = Vector2(0, 112)
		button.add_theme_font_size_override("font_size", 16)
		box.add_child(button)
		choice_buttons.append(button)

func _begin_new_run() -> void:
	dev_test_active = false
	dev_auto_dodge = false
	dev_force_perfect = false
	dev_god_mode = false
	dev_turn_based = false
	if dev_step_button != null:
		dev_step_button.visible = false
	if dev_button != null:
		dev_button.text = "DEV MODE"
	_reset_run(false)
	skill_levels.clear()
	perfect_count = 0
	guardian_charges = 0
	last_counter_damage = 0
	current_weapon_id = ""
	dagger_hit_bank = 0
	greatsword_charge = 0
	bow_aim = 0
	dungeon_floor = 0
	current_floor_number = 0
	gold = 0
	current_node_type = ""
	current_gold_reward = 0
	route_history.clear()
	run_unlocked_pool = unlocked_skills.duplicate()
	pending_unlock_notice = ""
	_update_build_label()
	_show_weapon_choices()

func _show_skill_choices(mode: String) -> void:
	run_active = false
	attack_generation += 1
	attack_side = ""
	timing_bar.value = 0.0
	weapon_indicator.text = ""
	choice_mode = mode
	if mode == "starter":
		choice_title.text = "CHOOSE STARTER SKILL"
	elif mode == "upgrade":
		choice_title.text = "UPGRADE ONE OWNED SKILL"
	elif mode == "shop":
		choice_title.text = "SHOP — CHOOSE A RUN SKILL"
	else:
		choice_title.text = "CHOOSE A SKILL"
	state_label.text = "BUILD"
	state_label.add_theme_color_override("font_color", C.perfect)
	restart_button.disabled = true
	if collection_button != null:
		collection_button.disabled = false

	var candidates: Array[String] = []
	if mode == "upgrade":
		candidates = _owned_upgrade_candidates()
	else:
		for skill_id in run_unlocked_pool:
			var current := int(skill_levels.get(skill_id, 0))
			if current < SkillCatalog.max_level(skill_id):
				candidates.append(skill_id)
		candidates.shuffle()

	if candidates.is_empty():
		choice_overlay.visible = false
		restart_button.disabled = false
		if mode == "shop":
			gold += 2
			_show_dungeon_map(_consume_unlock_notice("SHOP: no eligible unlocked skills. 2 Gold refunded."))
		elif mode == "upgrade":
			_show_dungeon_map(_consume_unlock_notice("SHRINE: no owned skill can upgrade."))
		elif mode == "reward":
			gold += 1
			_show_dungeon_map(_consume_unlock_notice("REWARD: build pool maxed. Converted to +1 Gold."))
		return

	for i in range(choice_buttons.size()):
		var button: Button = choice_buttons[i]
		for connection in button.pressed.get_connections():
			button.pressed.disconnect(connection.callable)
		if i < min(3, candidates.size()):
			var skill_id := candidates[i]
			var next_level := int(skill_levels.get(skill_id, 0)) + 1
			var prefix := "NEW" if next_level == 1 else "UPGRADE"
			button.visible = true
			button.text = "%s — %s Lv.%d\n%s" % [prefix, SkillCatalog.display_name(skill_id), next_level, SkillCatalog.description(skill_id, next_level)]
			button.pressed.connect(func(): _choose_skill(skill_id))
		else:
			button.visible = false

	choice_overlay.visible = true

func _choose_skill(skill_id: String) -> void:
	var new_level := int(skill_levels.get(skill_id, 0)) + 1
	skill_levels[skill_id] = new_level

	if skill_id == "guardian" and new_level == 1:
		guardian_charges += 1

	_update_build_label()
	choice_overlay.visible = false
	restart_button.disabled = false

	if choice_mode == "starter":
		restart_button.text = "RUNNING"
		restart_button.disabled = true
		message_label.text = "Starter chosen. Pick a route."
		_show_dungeon_map("Starter chosen. Choose your first route.")
	elif choice_mode == "upgrade":
		message_label.text = "Shrine upgrade complete."
		_show_dungeon_map(_consume_unlock_notice("UPGRADE SHRINE: skill upgraded."))
	elif choice_mode == "shop":
		message_label.text = "Purchase complete."
		_show_dungeon_map(_consume_unlock_notice("SHOP: skill acquired for this run."))
	else:
		message_label.text = "Combat reward chosen."
		_show_dungeon_map(_consume_unlock_notice("Reward acquired. Choose the next route."))

func _greatsword_max_charge() -> int:
	return 3 if _has_weapon_upgrade("deep_charge") else 2

func _bow_max_aim() -> int:
	return 2

func _weapon_upgrade_text() -> String:
	if weapon_upgrades.is_empty() or current_weapon_id == "":
		return ""
	var names: Array[String] = []
	for upgrade_id in weapon_upgrades:
		names.append(WeaponUpgradeCatalog.upgrade_name(current_weapon_id, upgrade_id))
	return ", ".join(names)

func _weapon_state_text() -> String:
	if current_weapon_id == "daggers":
		return "Hits %d/4" % dagger_hit_bank
	if current_weapon_id == "greatsword":
		return "Charge %d/%d" % [greatsword_charge, _greatsword_max_charge()]
	if current_weapon_id == "bow":
		return "Aim %d/%d" % [bow_aim, _bow_max_aim()]
	if current_weapon_id == "katana":
		return "Perfect +1"
	return ""

func _preview_counter_damage(perfect: bool) -> int:
	var damage := 1
	var preview_flow := flow + (1 if perfect else 0)

	var momentum_level := int(skill_levels.get("momentum", 0))
	var momentum_threshold := 999
	if momentum_level == 1:
		momentum_threshold = 3
	elif momentum_level >= 2:
		momentum_threshold = 2
	if preview_flow >= momentum_threshold:
		damage += 1

	var bloodlust_level := int(skill_levels.get("bloodlust", 0))
	var bloodlust_threshold := 999
	if bloodlust_level == 1:
		bloodlust_threshold = 4
	elif bloodlust_level >= 2:
		bloodlust_threshold = 3
	if preview_flow >= bloodlust_threshold:
		damage += 1

	if perfect:
		var flame_level := int(skill_levels.get("flame_counter", 0))
		var next_perfect_count := perfect_count + 1
		if flame_level >= 2:
			damage += 1
		elif flame_level == 1 and next_perfect_count % 2 == 0:
			damage += 1

	match current_weapon_id:
		"katana":
			if perfect:
				damage += 1
				var next_perfect_count := perfect_count + 1
				if _has_weapon_upgrade("iaido") and next_perfect_count % 3 == 0:
					damage += 2
			if _has_weapon_upgrade("flow_edge") and preview_flow >= 3:
				damage += 1
		"daggers":
			var added_hits := (4 if _has_weapon_upgrade("flurry") else 3) if perfect else 2
			var triggers := int((dagger_hit_bank + added_hits) / 4)
			if triggers > 0:
				damage += triggers * (2 if _has_weapon_upgrade("serrated") else 1)
		"greatsword":
			if perfect and greatsword_charge > 0:
				damage += greatsword_charge
				if _has_weapon_upgrade("crushing_release") and greatsword_charge >= _greatsword_max_charge():
					damage += 1
		"bow":
			if not perfect and bow_aim > 0:
				damage += bow_aim
				if _has_weapon_upgrade("piercing_shot"):
					damage += 1

	return damage

func _update_combat_stats() -> void:
	if combat_stat_label == null:
		return
	var normal_damage := _preview_counter_damage(false)
	var perfect_damage := _preview_counter_damage(true)
	var last_text := "-" if last_counter_damage <= 0 else str(last_counter_damage)
	combat_stat_label.text = "Counter ATK: Normal %d / Perfect %d  •  Last %s" % [normal_damage, perfect_damage, last_text]

func _update_build_label() -> void:
	var weapon_name := "No Weapon" if current_weapon_id == "" else WeaponCatalog.display_name(current_weapon_id)
	var weapon_state := _weapon_state_text()
	var weapon_text := weapon_name if weapon_state == "" else "%s [%s]" % [weapon_name, weapon_state]
	var upgrade_text := _weapon_upgrade_text()
	if upgrade_text != "":
		weapon_text += " <" + upgrade_text + ">"

	if skill_levels.is_empty():
		build_label.text = "Weapon: %s  •  Skills: none" % weapon_text
		_update_combat_stats()
		return

	var parts: Array[String] = []
	for id in skill_levels:
		parts.append("%s Lv.%d" % [SkillCatalog.display_name(str(id)), int(skill_levels[id])])
	parts.sort()
	build_label.text = "Weapon: %s  •  %s" % [weapon_text, " • ".join(parts)]
	_update_combat_stats()

func _effective_perfect_window(enemy: Dictionary) -> float:
	var bonus := 0.0
	var focus_level := int(skill_levels.get("focus", 0))
	if focus_level == 1:
		bonus = 0.05
	elif focus_level >= 2:
		bonus = 0.09
	return float(enemy.perfect_window) + bonus

func _counter_damage(perfect: bool) -> int:
	var damage := 1

	var momentum_level := int(skill_levels.get("momentum", 0))
	var momentum_threshold := 999
	if momentum_level == 1:
		momentum_threshold = 3
	elif momentum_level >= 2:
		momentum_threshold = 2
	if flow >= momentum_threshold:
		damage += 1

	var bloodlust_level := int(skill_levels.get("bloodlust", 0))
	var bloodlust_threshold := 999
	if bloodlust_level == 1:
		bloodlust_threshold = 4
	elif bloodlust_level >= 2:
		bloodlust_threshold = 3
	if flow >= bloodlust_threshold:
		damage += 1

	if perfect:
		var flame_level := int(skill_levels.get("flame_counter", 0))
		if flame_level >= 2:
			damage += 1
		elif flame_level == 1 and perfect_count % 2 == 0:
			damage += 1

	match current_weapon_id:
		"katana":
			if perfect:
				damage += 1
				if _has_weapon_upgrade("iaido") and perfect_count % 3 == 0:
					damage += 2
			if _has_weapon_upgrade("flow_edge") and flow >= 3:
				damage += 1
		"daggers":
			var added_hits := (4 if _has_weapon_upgrade("flurry") else 3) if perfect else 2
			dagger_hit_bank += added_hits
			var triggers := int(dagger_hit_bank / 4)
			if triggers > 0:
				var trigger_damage := 2 if _has_weapon_upgrade("serrated") else 1
				damage += triggers * trigger_damage
				dagger_hit_bank -= triggers * 4
		"greatsword":
			var max_charge := _greatsword_max_charge()
			if perfect and greatsword_charge > 0:
				damage += greatsword_charge
				if _has_weapon_upgrade("crushing_release") and greatsword_charge >= max_charge:
					damage += 1
				greatsword_charge = 0
			else:
				greatsword_charge = mini(max_charge, greatsword_charge + 1)
		"bow":
			if perfect:
				var aim_gain := 2 if _has_weapon_upgrade("steady_aim") else 1
				bow_aim = mini(_bow_max_aim(), bow_aim + aim_gain)
			elif bow_aim > 0:
				damage += bow_aim
				if _has_weapon_upgrade("piercing_shot"):
					damage += 1
				bow_aim = 0

	_update_build_label()
	return damage

func _load_audio() -> void:
	var tones := {
		"windup":[170.0,0.14,0.30],
		"cue":[760.0,0.07,0.28],
		"dodge":[310.0,0.08,0.22],
		"duck":[240.0,0.09,0.23],
		"jump":[470.0,0.10,0.24],
		"perfect":[980.0,0.14,0.30],
		"hit":[95.0,0.18,0.34],
		"kill":[620.0,0.16,0.28]
	}
	for sound_name in tones:
		var data: Array = tones[sound_name]
		var player := AudioStreamPlayer.new()
		player.stream = _make_tone(float(data[0]), float(data[1]), float(data[2]))
		add_child(player)
		audio_players[sound_name] = player

func _make_tone(freq: float, duration: float, volume: float) -> AudioStreamWAV:
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = 22050
	wav.stereo = false
	var count := int(wav.mix_rate * duration)
	var bytes := PackedByteArray()
	bytes.resize(count * 2)
	for i in range(count):
		var envelope := 1.0 - float(i) / float(max(count - 1, 1))
		var sample := sin(TAU * freq * float(i) / float(wav.mix_rate)) * volume * envelope
		var pcm := int(clamp(sample, -1.0, 1.0) * 32767.0)
		if pcm < 0:
			pcm += 65536
		bytes[i * 2] = pcm & 0xFF
		bytes[i * 2 + 1] = (pcm >> 8) & 0xFF
	wav.data = bytes
	return wav

func _play(name: String) -> void:
	if audio_players.has(name):
		audio_players[name].play()

func _point_is_duck_zone(point: Vector2) -> bool:
	return duck_touch_zone != null and duck_touch_zone.get_global_rect().has_point(point)

func _point_is_jump_zone(point: Vector2) -> bool:
	return jump_touch_zone != null and jump_touch_zone.get_global_rect().has_point(point)

func _input(event: InputEvent) -> void:
	if update_overlay != null and update_overlay.visible:
		return
	if dev_overlay != null and dev_overlay.visible:
		return
	if collection_overlay != null and collection_overlay.visible:
		return
	if weapon_overlay != null and weapon_overlay.visible:
		return

	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_A or event.keycode == KEY_LEFT:
			_try_action("left")
		elif event.keycode == KEY_D or event.keycode == KEY_RIGHT:
			_try_action("right")
		elif event.keycode == KEY_S or event.keycode == KEY_DOWN:
			_try_action("duck")
		elif event.keycode == KEY_W or event.keycode == KEY_UP:
			_try_action("jump")
		elif event.keycode == KEY_R:
			_begin_new_run()

	elif event is InputEventScreenTouch and run_active:
		last_touch_event_ms = Time.get_ticks_msec()
		if event.pressed:
			touch_start_pos = event.position
			touch_tracking = true
			touch_action_fired = false
			touch_had_drag = false
			touch_down_accum = 0.0
			touch_up_accum = 0.0

			if _point_is_jump_zone(event.position):
				touch_action_fired = true
				touch_tracking = false
				_try_action("jump")
				get_viewport().set_input_as_handled()
				return
			elif _point_is_duck_zone(event.position):
				touch_action_fired = true
				touch_tracking = false
				_try_action("duck")
				get_viewport().set_input_as_handled()
				return
		elif touch_tracking:
			if not touch_action_fired:
				if touch_had_drag:
					# Once the finger moved, NEVER reinterpret the gesture as Left/Right.
					message_label.text = "Drag ended — no accidental side dodge."
				else:
					var half := get_viewport_rect().size.x * 0.5
					_try_action("left" if touch_start_pos.x < half else "right")
			touch_tracking = false
			touch_action_fired = false
			touch_had_drag = false
			touch_down_accum = 0.0
			touch_up_accum = 0.0
		get_viewport().set_input_as_handled()

	elif event is InputEventScreenDrag and run_active and touch_tracking and not touch_action_fired:
		last_touch_event_ms = Time.get_ticks_msec()
		touch_had_drag = true

		# Track downward motion in two ways. This is more reliable on mobile Web
		# than trusting the final touch-release position.
		var from_start_down: float = event.position.y - touch_start_pos.y
		var from_start_up: float = touch_start_pos.y - event.position.y
		touch_down_accum += maxf(0.0, event.relative.y)
		touch_up_accum += maxf(0.0, -event.relative.y)
		var downward: float = maxf(from_start_down, touch_down_accum)
		var upward: float = maxf(from_start_up, touch_up_accum)

		if downward >= SWIPE_DOWN_THRESHOLD:
			touch_action_fired = true
			_try_action("duck")
			get_viewport().set_input_as_handled()
		elif upward >= SWIPE_UP_THRESHOLD:
			touch_action_fired = true
			_try_action("jump")
			get_viewport().set_input_as_handled()

	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT and run_active:
		# Desktop/Web fallback. Duck zone always wins over side-tap classification.
		if Time.get_ticks_msec() - last_touch_event_ms > TOUCH_MOUSE_SUPPRESS_MS:
			if _point_is_jump_zone(event.position):
				_try_action("jump")
			elif _point_is_duck_zone(event.position):
				_try_action("duck")
			else:
				var half := get_viewport_rect().size.x * 0.5
				_try_action("left" if event.position.x < half else "right")

func _reset_run(start_now: bool) -> void:
	attack_generation += 1
	hp = MAX_HP
	flow = 0
	enemy_index = 0
	enemy_max_hp = 1
	last_counter_damage = 0
	run_active = start_now
	attack_side = ""
	last_dodge_direction = ""
	last_dodge_time = -99.0
	encounter_took_damage = false
	current_pattern.clear()
	current_pattern_name = ""
	last_pattern_name = ""
	pattern_step_index = 0
	current_attack_step = ""
	touch_tracking = false
	touch_action_fired = false
	touch_had_drag = false
	touch_down_accum = 0.0
	touch_up_accum = 0.0
	dodge_locked_until = 0.0
	timing_bar.value = 0.0
	player_body.position = Vector2(235, 280)
	player_body.size = Vector2(70, 90)
	player_body.modulate = Color.WHITE
	_reset_enemy_pose()
	enemy_body.modulate = Color.WHITE
	weapon_indicator.text = ""
	_update_hud()

	choice_overlay.visible = false
	if map_overlay != null:
		map_overlay.visible = false
	if start_now:
		run_active = true
		restart_button.text = "RUNNING"
		restart_button.disabled = true
		message_label.text = "Enemy approaching..."
		_load_enemy()
	else:
		restart_button.text = "START RUN"
		restart_button.disabled = false

func _update_hud() -> void:
	hp_label.text = "%d / %d" % [hp, MAX_HP]
	flow_label.text = "x%d" % flow
	progress_label.text = "%d / %d" % [current_floor_number, DungeonCatalog.floor_count()]
	_update_build_label()

func _load_enemy() -> void:
	if not run_active:
		return
	var enemy: Dictionary = enemies[enemy_index]
	if dev_test_active:
		enemy_counters_left = dev_enemy_hp
		enemy_max_hp = dev_enemy_hp
	else:
		enemy_counters_left = int(enemy.counters)
		enemy_max_hp = int(enemy.counters)
	last_counter_damage = 0
	encounter_took_damage = false
	current_pattern.clear()
	current_pattern_name = ""
	last_pattern_name = ""
	pattern_step_index = 0
	current_attack_step = ""

	if int(skill_levels.get("guardian", 0)) >= 2:
		guardian_charges = max(guardian_charges, 1)

	enemy_name_label.text = str(enemy.name)
	if collection_button != null:
		collection_button.disabled = true
	_update_enemy_pattern_label()
	state_label.text = "READY"
	state_label.add_theme_color_override("font_color", C.accent)
	hint_label.text = "Learn the moveset. Patterns now repeat."
	await get_tree().create_timer(0.65).timeout
	if run_active:
		_start_pattern()

func _update_enemy_pattern_label() -> void:
	var pattern_text := current_pattern_name if current_pattern_name != "" else "..."
	enemy_counter_label.text = "Enemy HP: %d / %d  •  Pattern: %s" % [max(enemy_counters_left, 0), enemy_max_hp, pattern_text]

func _start_pattern() -> void:
	if not run_active:
		return

	var enemy: Dictionary = enemies[enemy_index]
	var patterns: Array = MovesetCatalog.patterns_for(str(enemy.id))
	if patterns.is_empty():
		return

	var selected: Dictionary = patterns[randi() % patterns.size()]
	var attempts := 0
	while patterns.size() > 1 and str(selected.name) == last_pattern_name and attempts < 6:
		selected = patterns[randi() % patterns.size()]
		attempts += 1

	current_pattern_name = str(selected.name)
	last_pattern_name = current_pattern_name
	current_pattern.clear()
	for raw_step in selected.steps:
		current_pattern.append(str(raw_step))
	pattern_step_index = 0
	_update_enemy_pattern_label()

	state_label.text = "PATTERN"
	state_label.add_theme_color_override("font_color", C.accent)
	message_label.text = current_pattern_name
	await get_tree().create_timer(0.28).timeout
	if not run_active:
		return
	if dev_test_active and dev_turn_based:
		state_label.text = "WAITING"
		state_label.add_theme_color_override("font_color", C.perfect)
		message_label.text = current_pattern_name + " — press NEXT ATTACK"
		if dev_step_button != null:
			dev_step_button.disabled = false
		return
	_begin_pattern_step()

func _begin_pattern_step() -> void:
	if not run_active:
		return

	if pattern_step_index >= current_pattern.size():
		state_label.text = "RESET"
		state_label.add_theme_color_override("font_color", C.muted)
		message_label.text = "Pattern complete."
		await get_tree().create_timer(0.52).timeout
		if run_active:
			_start_pattern()
		return

	var step: String = current_pattern[pattern_step_index]
	current_attack_step = step

	if MovesetCatalog.is_fake(step):
		_begin_fake_step(step)
	else:
		_begin_real_step(step)

func _begin_real_step(step: String) -> void:
	if not run_active:
		return

	attack_generation += 1
	var generation := attack_generation
	var enemy: Dictionary = enemies[enemy_index]
	var action: String = MovesetCatalog.base_action(step)
	var windup_multiplier: float = MovesetCatalog.windup_multiplier(step)
	var windup: float = float(enemy.windup) * windup_multiplier

	attack_side = action
	last_dodge_direction = ""
	last_dodge_time = -99.0
	attack_resolve_time = Time.get_ticks_msec() / 1000.0 + windup

	if step.begins_with("delay_"):
		state_label.text = "HOLD"
	elif step.begins_with("quick_"):
		state_label.text = "RUSH"
	else:
		state_label.text = "WIND-UP"
	state_label.add_theme_color_override("font_color", C.accent)

	_show_attack_telegraph(action)
	_play("windup")
	_animate_enemy_windup(action, windup, step)

	timing_bar.value = 0.0
	var bar := create_tween()
	bar.tween_property(timing_bar, "value", 1.0, windup)

	await get_tree().create_timer(max(0.0, windup - float(enemy.cue_before))).timeout
	if not run_active or generation != attack_generation:
		return

	state_label.text = "NOW"
	state_label.add_theme_color_override("font_color", C.danger)
	if action == "high":
		hint_label.text = "DUCK NOW!"
	elif action == "low":
		hint_label.text = "JUMP NOW!"
	else:
		hint_label.text = "NOW!"
	_play("cue")
	_animate_enemy_strike(action, float(enemy.cue_before))
	_dev_apply_auto_dodge(action, enemy)

	await get_tree().create_timer(float(enemy.cue_before)).timeout
	if run_active and generation == attack_generation:
		_resolve_attack()

func _begin_fake_step(step: String) -> void:
	if not run_active:
		return

	attack_generation += 1
	var generation := attack_generation
	var enemy: Dictionary = enemies[enemy_index]
	var action: String = MovesetCatalog.base_action(step)
	var fake_duration: float = maxf(0.42, float(enemy.windup) - float(enemy.cue_before) * 0.70)

	attack_side = "fake_" + action
	last_dodge_direction = ""
	last_dodge_time = -99.0
	state_label.text = "WIND-UP"
	state_label.add_theme_color_override("font_color", C.accent)

	_show_attack_telegraph(action)
	_play("windup")
	_animate_enemy_windup(action, fake_duration, step)

	timing_bar.value = 0.0
	var bar := create_tween()
	bar.tween_property(timing_bar, "value", 0.82, fake_duration)

	await get_tree().create_timer(fake_duration).timeout
	if not run_active or generation != attack_generation:
		return

	var panic_dodged := last_dodge_direction != ""
	attack_side = ""
	timing_bar.value = 0.0
	_animate_enemy_retract()
	weapon_indicator.text = "FEINT"
	state_label.text = "CANCEL"
	state_label.add_theme_color_override("font_color", C.muted)
	hint_label.text = "Fake — next strike may be fast."
	message_label.text = "Panic dodge!" if panic_dodged else "You held your nerve."

	pattern_step_index += 1
	await get_tree().create_timer(0.16).timeout
	if not run_active:
		return
	if dev_test_active and dev_turn_based:
		state_label.text = "WAITING"
		state_label.add_theme_color_override("font_color", C.perfect)
		message_label.text = "Fake resolved — press NEXT ATTACK"
		if dev_step_button != null:
			dev_step_button.disabled = false
		return
	_begin_pattern_step()

func _show_attack_telegraph(action: String) -> void:
	if action == "high":
		weapon_indicator.text = "HIGH SWEEP"
		hint_label.text = "DUCK under it — tap DUCK / S / ↓."
	elif action == "low":
		weapon_indicator.text = "LOW SWEEP"
		hint_label.text = "JUMP over it — tap JUMP / W / ↑."
	else:
		weapon_indicator.text = "ATTACK FROM LEFT" if action == "left" else "ATTACK FROM RIGHT"
		hint_label.text = "Dodge to the OPPOSITE side."

func _reset_enemy_pose() -> void:
	if enemy_body != null:
		enemy_body.position = Vector2(210, 185)
		enemy_body.rotation = 0.0
		enemy_body.scale = Vector2.ONE
		enemy_body.pivot_offset = Vector2(60, 96)
	if enemy_weapon != null:
		enemy_weapon.position = Vector2(300, 180)
		enemy_weapon.size = Vector2(14, 112)
		enemy_weapon.pivot_offset = Vector2(7, 98)
		enemy_weapon.rotation = deg_to_rad(18.0)
		enemy_weapon.modulate = Color.WHITE
		enemy_weapon.visible = true

func _animate_enemy_windup(action: String, windup: float, step: String) -> void:
	_reset_enemy_pose()

	var pose_time: float = min(windup * 0.44, 0.58)
	var body_target := Vector2(210, 185)
	var body_rotation := 0.0
	var weapon_target := Vector2(300, 180)
	var weapon_rotation := deg_to_rad(18.0)

	if action == "left":
		body_target = Vector2(188, 190)
		body_rotation = deg_to_rad(-9.0)
		weapon_target = Vector2(176, 176)
		weapon_rotation = deg_to_rad(-58.0)
	elif action == "right":
		body_target = Vector2(232, 190)
		body_rotation = deg_to_rad(9.0)
		weapon_target = Vector2(350, 176)
		weapon_rotation = deg_to_rad(58.0)
	elif action == "high":
		body_target = Vector2(210, 172)
		body_rotation = deg_to_rad(-3.0)
		weapon_target = Vector2(264, 118)
		weapon_rotation = deg_to_rad(88.0)
	elif action == "low":
		body_target = Vector2(210, 205)
		body_rotation = deg_to_rad(8.0)
		weapon_target = Vector2(330, 278)
		weapon_rotation = deg_to_rad(28.0)

	var wind_tween := create_tween()
	wind_tween.set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	wind_tween.tween_property(enemy_body, "position", body_target, pose_time)
	wind_tween.parallel().tween_property(enemy_body, "rotation", body_rotation, pose_time)
	wind_tween.parallel().tween_property(enemy_weapon, "position", weapon_target, pose_time)
	wind_tween.parallel().tween_property(enemy_weapon, "rotation", weapon_rotation, pose_time)

	if step.begins_with("delay_"):
		enemy_weapon.modulate = C.accent
		var hold_tween := create_tween()
		hold_tween.set_loops(3)
		hold_tween.tween_property(enemy_body, "scale", Vector2(1.035, 0.97), 0.10)
		hold_tween.tween_property(enemy_body, "scale", Vector2.ONE, 0.10)
	elif step.begins_with("quick_"):
		enemy_weapon.modulate = C.danger
	else:
		enemy_weapon.modulate = Color.WHITE

func _animate_enemy_strike(action: String, strike_time: float) -> void:
	var duration: float = maxf(0.08, strike_time * 0.82)
	var strike := create_tween()
	strike.set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_IN)

	if action == "left":
		strike.tween_property(enemy_weapon, "position", Vector2(318, 286), duration)
		strike.parallel().tween_property(enemy_weapon, "rotation", deg_to_rad(74.0), duration)
		strike.parallel().tween_property(enemy_body, "position", Vector2(226, 202), duration)
		strike.parallel().tween_property(enemy_body, "rotation", deg_to_rad(7.0), duration)
	elif action == "right":
		strike.tween_property(enemy_weapon, "position", Vector2(208, 286), duration)
		strike.parallel().tween_property(enemy_weapon, "rotation", deg_to_rad(-74.0), duration)
		strike.parallel().tween_property(enemy_body, "position", Vector2(194, 202), duration)
		strike.parallel().tween_property(enemy_body, "rotation", deg_to_rad(-7.0), duration)
	elif action == "high":
		strike.tween_property(enemy_weapon, "position", Vector2(272, 314), duration)
		strike.parallel().tween_property(enemy_weapon, "rotation", deg_to_rad(90.0), duration)
		strike.parallel().tween_property(enemy_body, "position", Vector2(210, 198), duration)
		strike.parallel().tween_property(enemy_body, "scale", Vector2(1.08, 0.94), duration)
	elif action == "low":
		strike.tween_property(enemy_weapon, "position", Vector2(214, 356), duration)
		strike.parallel().tween_property(enemy_weapon, "rotation", deg_to_rad(90.0), duration)
		strike.parallel().tween_property(enemy_body, "position", Vector2(205, 220), duration)
		strike.parallel().tween_property(enemy_body, "rotation", deg_to_rad(-10.0), duration)

func _animate_enemy_retract() -> void:
	var retract := create_tween()
	retract.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	retract.tween_property(enemy_body, "position", Vector2(210, 185), 0.12)
	retract.parallel().tween_property(enemy_body, "rotation", 0.0, 0.12)
	retract.parallel().tween_property(enemy_body, "scale", Vector2.ONE, 0.12)
	retract.parallel().tween_property(enemy_weapon, "position", Vector2(300, 180), 0.12)
	retract.parallel().tween_property(enemy_weapon, "rotation", deg_to_rad(18.0), 0.12)
	retract.parallel().tween_property(enemy_weapon, "modulate", Color.WHITE, 0.12)

func _advance_pattern_after_exchange(delay: float) -> void:
	pattern_step_index += 1
	await get_tree().create_timer(delay).timeout
	if not run_active:
		return
	if dev_test_active and dev_turn_based:
		state_label.text = "WAITING"
		state_label.add_theme_color_override("font_color", C.perfect)
		message_label.text = "Exchange resolved — press NEXT ATTACK"
		if dev_step_button != null:
			dev_step_button.disabled = false
		return
	_begin_pattern_step()

func _try_action(action: String) -> void:
	if not run_active or attack_side == "":
		return

	var now := Time.get_ticks_msec() / 1000.0
	if now < dodge_locked_until:
		message_label.text = "Committed — cannot act again yet."
		return

	dodge_locked_until = now + DODGE_COMMIT_SECONDS
	last_dodge_direction = action
	last_dodge_time = now

	if action == "duck":
		_play("duck")
		_duck_animation()
	elif action == "jump":
		_play("jump")
		_jump_animation()
	else:
		_play("dodge")
		var target_x := 170.0 if action == "left" else 300.0
		var tween := create_tween()
		tween.set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
		tween.tween_property(player_body, "position:x", target_x, 0.11)
		tween.set_ease(Tween.EASE_IN)
		tween.tween_property(player_body, "position:x", 235.0, 0.18)

func _duck_animation() -> void:
	var tween := create_tween()
	tween.set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(player_body, "position:y", 308.0, 0.09)
	tween.parallel().tween_property(player_body, "size:y", 56.0, 0.09)
	tween.set_ease(Tween.EASE_IN)
	tween.tween_property(player_body, "position:y", 280.0, 0.18)
	tween.parallel().tween_property(player_body, "size:y", 90.0, 0.18)

func _jump_animation() -> void:
	var tween := create_tween()
	tween.set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(player_body, "position:y", 198.0, 0.13)
	tween.set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	tween.tween_property(player_body, "position:y", 280.0, 0.18)

func _resolve_attack() -> void:
	if not run_active:
		return
	var enemy: Dictionary = enemies[enemy_index]
	var correct := "duck" if attack_side == "high" else ("jump" if attack_side == "low" else ("right" if attack_side == "left" else "left"))
	var success := false
	var perfect := false

	if last_dodge_direction == correct:
		var early := attack_resolve_time - last_dodge_time
		if early >= 0.0 and early <= float(enemy.dodge_window):
			success = true
			perfect = early <= _effective_perfect_window(enemy)

	attack_side = ""
	timing_bar.value = 0.0
	weapon_indicator.text = ""
	_reset_enemy_pose()

	if success:
		if perfect:
			flow += 1
			perfect_count += 1
			_add_meta_progress("perfect_dodges")
			state_label.text = "PERFECT"
			state_label.add_theme_color_override("font_color", C.perfect)
			var perfect_action := "DUCK" if correct == "duck" else ("JUMP" if correct == "jump" else "DODGE")
			message_label.text = "PERFECT %s — AUTO COUNTER!" % perfect_action
			_play("perfect")
			_flash(player_body, C.perfect)
		else:
			state_label.text = "DODGED"
			state_label.add_theme_color_override("font_color", C.good)
			var action_name := "Duck" if correct == "duck" else ("Jump" if correct == "jump" else "Dodge")
			message_label.text = "%s — Auto Counter" % action_name

		var damage := _counter_damage(perfect)
		last_counter_damage = damage
		enemy_counters_left -= damage
		_update_enemy_pattern_label()
		_update_combat_stats()
		message_label.text += "  [Counter Damage: %d]" % damage
		if damage > 1:
			message_label.text += "  [+%d Bonus]" % (damage - 1)
		_counter_animation()
		_update_hud()

		if enemy_counters_left <= 0:
			await get_tree().create_timer(0.48).timeout
			_defeat_enemy()
		else:
			_advance_pattern_after_exchange(0.24)
	else:
		if guardian_charges > 0:
			guardian_charges -= 1
			flow = 0
			state_label.text = "BLOCKED"
			state_label.add_theme_color_override("font_color", C.perfect)
			message_label.text = "GUARDIAN blocked the hit — Flow lost."
			_play("perfect")
			_flash(player_body, C.perfect)
			_update_hud()
			_advance_pattern_after_exchange(0.30)
		else:
			if dev_test_active and dev_god_mode:
				flow = 0
				state_label.text = "DEV GOD"
				state_label.add_theme_color_override("font_color", C.perfect)
				message_label.text = "Mistake ignored by God Mode."
				_update_hud()
				_advance_pattern_after_exchange(0.20)
				return
			hp -= 1
			encounter_took_damage = true
			flow = 0
			state_label.text = "HIT"
			state_label.add_theme_color_override("font_color", C.danger)
			message_label.text = "HIT — Flow lost."
			_play("hit")
			_flash(player_body, C.danger)
			_update_hud()
			if hp <= 0:
				_end_run(false)
			else:
				_advance_pattern_after_exchange(0.30)

func _counter_animation() -> void:
	var start_y := player_body.position.y
	var tween := create_tween()
	tween.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tween.tween_property(player_body, "position:y", start_y - 34.0, 0.09)
	tween.parallel().tween_property(enemy_body, "modulate", Color(1.8,1.8,1.8,1.0), 0.06)
	tween.tween_property(player_body, "position:y", start_y, 0.13)
	tween.parallel().tween_property(enemy_body, "modulate", Color.WHITE, 0.12)

func _defeat_enemy() -> void:
	if not run_active:
		return

	_play("kill")
	run_active = false
	attack_generation += 1
	attack_side = ""

	if dev_test_active:
		state_label.text = "DEV KO"
		state_label.add_theme_color_override("font_color", C.good)
		message_label.text = "DEV TEST COMPLETE — Enemy HP reached 0. Open DEV MODE to restart or change setup."
		restart_button.text = "DEV TEST"
		restart_button.disabled = true
		if dev_step_button != null:
			dev_step_button.disabled = true
		_update_hud()
		return

	gold += current_gold_reward
	if not encounter_took_damage:
		_add_meta_progress("no_damage_encounters")
		if current_node_type == "elite":
			_add_meta_progress("elite_no_damage_clears")
	_update_hud()

	if current_node_type == "boss":
		_add_meta_progress("boss_clears")
		_add_meta_progress("runs_completed")
		message_label.text = _consume_unlock_notice("BOSS DEFEATED")
		await get_tree().create_timer(0.45).timeout
		_end_run(true)
		return

	if current_node_type == "elite":
		message_label.text = "ELITE KILL — +%d Gold" % current_gold_reward
	else:
		message_label.text = "COUNTER KILL — +%d Gold" % current_gold_reward

	await get_tree().create_timer(0.40).timeout
	_show_skill_choices("reward")

func _end_run(victory: bool) -> void:
	run_active = false
	attack_generation += 1
	attack_side = ""
	weapon_indicator.text = ""
	timing_bar.value = 0.0

	if dev_test_active:
		state_label.text = "DEV END"
		state_label.add_theme_color_override("font_color", C.danger)
		message_label.text = "DEV TEST ENDED — open DEV MODE to restart or change setup."
		restart_button.text = "DEV TEST"
		restart_button.disabled = true
		if dev_step_button != null:
			dev_step_button.disabled = true
		return

	restart_button.text = "TRY AGAIN"
	restart_button.disabled = false
	if collection_button != null:
		collection_button.disabled = false
	if victory:
		state_label.text = "CLEARED"
		state_label.add_theme_color_override("font_color", C.good)
		hint_label.text = "Combat Sandbox complete."
		message_label.text = "RUN CLEARED — core combat is working."
	else:
		state_label.text = "DEAD"
		state_label.add_theme_color_override("font_color", C.danger)
		hint_label.text = "Learn the telegraph. Try again."
		message_label.text = "YOU DIED — press R or Try Again."

func _flash(control: CanvasItem, color: Color) -> void:
	var tween := create_tween()
	tween.tween_property(control, "modulate", color, 0.05)
	tween.tween_property(control, "modulate", Color.WHITE, 0.13)
