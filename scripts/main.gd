extends Control

const MAX_HP := 3
const DODGE_COMMIT_SECONDS := 0.35
const SWIPE_DOWN_THRESHOLD := 28.0
const TOUCH_MOUSE_SUPPRESS_MS := 1200
const SkillCatalog = preload("res://scripts/skill_catalog.gd")
const MovesetCatalog = preload("res://scripts/moveset_catalog.gd")
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
var choice_mode := ""
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
var last_touch_event_ms := -10000

var hp_label: Label
var flow_label: Label
var progress_label: Label
var enemy_name_label: Label
var enemy_counter_label: Label
var state_label: Label
var enemy_body: ColorRect
var weapon_indicator: Label
var player_body: ColorRect
var message_label: Label
var timing_bar: ProgressBar
var hint_label: Label
var restart_button: Button
var arena: Panel
var build_label: Label
var choice_overlay: ColorRect
var choice_title: Label
var choice_buttons: Array[Button] = []
var version_button: Button
var update_overlay: ColorRect
var duck_touch_zone: PanelContainer

var audio_players: Dictionary = {}

func _ready() -> void:
	_build_ui()
	_load_audio()
	_reset_run(false)
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
	progress_label = _stat(stats, "ENEMY", "1 / 5")

	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 8)
	column.add_child(header)

	var info := VBoxContainer.new()
	info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(info)
	enemy_name_label = _label("Combat Sandbox", 22, C.text)
	info.add_child(enemy_name_label)
	enemy_counter_label = _label("Left / Right + Duck", 14, C.muted)
	info.add_child(enemy_counter_label)
	build_label = _label("Build: none", 12, C.perfect)
	build_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	info.add_child(build_label)

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

	hint_label = _label("A/D = dodge • S/↓ = duck • Phone: tap DUCK or swipe down.", 14, C.muted)
	hint_label.position = Vector2(22, 52)
	hint_label.size = Vector2(460, 28)
	hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	arena.add_child(hint_label)

	weapon_indicator = _label("", 24, C.accent)
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

	player_body = ColorRect.new()
	player_body.color = C.player
	player_body.position = Vector2(235, 380)
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

	duck_touch_zone = PanelContainer.new()
	duck_touch_zone.position = Vector2(165, 438)
	duck_touch_zone.size = Vector2(210, 58)
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

	var duck_hint := _label("DUCK  ↓\nTap here • S / ↓ • swipe down", 14, C.text)
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

	_build_choice_overlay()
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

	var sub := _label("Prototype pool: all 5 skills are temporarily available.", 13, C.muted)
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
	_reset_run(false)
	skill_levels.clear()
	perfect_count = 0
	guardian_charges = 0
	_update_build_label()
	_show_skill_choices("starter")

func _show_skill_choices(mode: String) -> void:
	run_active = false
	attack_generation += 1
	attack_side = ""
	timing_bar.value = 0.0
	weapon_indicator.text = ""
	choice_mode = mode
	choice_title.text = "CHOOSE STARTER SKILL" if mode == "starter" else "CHOOSE A SKILL"
	state_label.text = "BUILD"
	state_label.add_theme_color_override("font_color", C.perfect)
	restart_button.disabled = true

	var candidates: Array[String] = []
	for id in SkillCatalog.SKILLS.keys():
		var current := int(skill_levels.get(id, 0))
		if current < SkillCatalog.max_level(id):
			candidates.append(str(id))
	candidates.shuffle()

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
		run_active = true
		restart_button.text = "RUNNING"
		restart_button.disabled = true
		message_label.text = "Starter chosen. Enemy approaching..."
		_load_enemy()
	else:
		run_active = true
		restart_button.text = "RUNNING"
		restart_button.disabled = true
		message_label.text = "Build upgraded. Next enemy..."
		_load_enemy()

func _update_build_label() -> void:
	if skill_levels.is_empty():
		build_label.text = "Build: none"
		return
	var parts: Array[String] = []
	for id in skill_levels:
		parts.append("%s Lv.%d" % [SkillCatalog.display_name(str(id)), int(skill_levels[id])])
	parts.sort()
	build_label.text = "Build: " + " • ".join(parts)

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

	return damage

func _load_audio() -> void:
	var tones := {
		"windup":[170.0,0.14,0.30],
		"cue":[760.0,0.07,0.28],
		"dodge":[310.0,0.08,0.22],
		"duck":[240.0,0.09,0.23],
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

func _input(event: InputEvent) -> void:
	if update_overlay != null and update_overlay.visible:
		return

	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_A or event.keycode == KEY_LEFT:
			_try_action("left")
		elif event.keycode == KEY_D or event.keycode == KEY_RIGHT:
			_try_action("right")
		elif event.keycode == KEY_S or event.keycode == KEY_DOWN:
			_try_action("duck")
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

			if _point_is_duck_zone(event.position):
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
		get_viewport().set_input_as_handled()

	elif event is InputEventScreenDrag and run_active and touch_tracking and not touch_action_fired:
		last_touch_event_ms = Time.get_ticks_msec()
		touch_had_drag = true

		# Track downward motion in two ways. This is more reliable on mobile Web
		# than trusting the final touch-release position.
		var from_start: float = event.position.y - touch_start_pos.y
		touch_down_accum += maxf(0.0, event.relative.y)
		var downward: float = maxf(from_start, touch_down_accum)

		if downward >= SWIPE_DOWN_THRESHOLD:
			touch_action_fired = true
			_try_action("duck")
			get_viewport().set_input_as_handled()

	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT and run_active:
		# Desktop/Web fallback. Duck zone always wins over side-tap classification.
		if Time.get_ticks_msec() - last_touch_event_ms > TOUCH_MOUSE_SUPPRESS_MS:
			if _point_is_duck_zone(event.position):
				_try_action("duck")
			else:
				var half := get_viewport_rect().size.x * 0.5
				_try_action("left" if event.position.x < half else "right")

func _reset_run(start_now: bool) -> void:
	attack_generation += 1
	hp = MAX_HP
	flow = 0
	enemy_index = 0
	run_active = start_now
	attack_side = ""
	last_dodge_direction = ""
	last_dodge_time = -99.0
	current_pattern.clear()
	current_pattern_name = ""
	last_pattern_name = ""
	pattern_step_index = 0
	current_attack_step = ""
	touch_tracking = false
	touch_action_fired = false
	touch_had_drag = false
	touch_down_accum = 0.0
	dodge_locked_until = 0.0
	timing_bar.value = 0.0
	player_body.position = Vector2(235, 380)
	player_body.size = Vector2(70, 90)
	player_body.modulate = Color.WHITE
	enemy_body.position = Vector2(210, 185)
	enemy_body.modulate = Color.WHITE
	weapon_indicator.text = ""
	_update_hud()

	choice_overlay.visible = false
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
	progress_label.text = "%d / %d" % [min(enemy_index + 1, enemies.size()), enemies.size()]
	_update_build_label()

func _load_enemy() -> void:
	if not run_active:
		return
	var enemy: Dictionary = enemies[enemy_index]
	enemy_counters_left = int(enemy.counters)
	current_pattern.clear()
	current_pattern_name = ""
	last_pattern_name = ""
	pattern_step_index = 0
	current_attack_step = ""

	if int(skill_levels.get("guardian", 0)) >= 2:
		guardian_charges = max(guardian_charges, 1)

	enemy_name_label.text = str(enemy.name)
	_update_enemy_pattern_label()
	state_label.text = "READY"
	state_label.add_theme_color_override("font_color", C.accent)
	hint_label.text = "Learn the moveset. Patterns now repeat."
	await get_tree().create_timer(0.65).timeout
	if run_active:
		_start_pattern()

func _update_enemy_pattern_label() -> void:
	var pattern_text := current_pattern_name if current_pattern_name != "" else "..."
	enemy_counter_label.text = "Counter needed: %d  •  Pattern: %s" % [max(enemy_counters_left, 0), pattern_text]

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
	if run_active:
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
	_animate_enemy_windup(action, windup)

	timing_bar.value = 0.0
	var bar := create_tween()
	bar.tween_property(timing_bar, "value", 1.0, windup)

	await get_tree().create_timer(max(0.0, windup - float(enemy.cue_before))).timeout
	if not run_active or generation != attack_generation:
		return

	state_label.text = "NOW"
	state_label.add_theme_color_override("font_color", C.danger)
	hint_label.text = "DUCK NOW!" if action == "high" else "NOW!"
	_play("cue")

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
	_animate_enemy_windup(action, fake_duration)

	timing_bar.value = 0.0
	var bar := create_tween()
	bar.tween_property(timing_bar, "value", 0.82, fake_duration)

	await get_tree().create_timer(fake_duration).timeout
	if not run_active or generation != attack_generation:
		return

	var panic_dodged := last_dodge_direction != ""
	attack_side = ""
	timing_bar.value = 0.0
	enemy_body.position = Vector2(210, 185)
	weapon_indicator.text = "FEINT"
	state_label.text = "CANCEL"
	state_label.add_theme_color_override("font_color", C.muted)
	hint_label.text = "Fake — next strike may be fast."
	message_label.text = "Panic dodge!" if panic_dodged else "You held your nerve."

	pattern_step_index += 1
	await get_tree().create_timer(0.10).timeout
	if run_active:
		_begin_pattern_step()

func _show_attack_telegraph(action: String) -> void:
	if action == "high":
		weapon_indicator.text = "HIGH SWEEP"
		hint_label.text = "DUCK under it — tap DUCK / S / ↓ / swipe down."
	else:
		weapon_indicator.text = "ATTACK FROM LEFT" if action == "left" else "ATTACK FROM RIGHT"
		hint_label.text = "Dodge to the OPPOSITE side."

func _animate_enemy_windup(action: String, windup: float) -> void:
	enemy_body.position = Vector2(210, 185)
	var target_x := 210.0
	if action == "left":
		target_x = 185.0
	elif action == "right":
		target_x = 235.0

	var wind := create_tween()
	wind.set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	wind.tween_property(enemy_body, "position:x", target_x, min(windup * 0.45, 0.55))
	if action == "high":
		wind.parallel().tween_property(enemy_body, "position:y", 160.0, min(windup * 0.45, 0.55))

func _advance_pattern_after_exchange(delay: float) -> void:
	pattern_step_index += 1
	await get_tree().create_timer(delay).timeout
	if run_active:
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
	tween.tween_property(player_body, "position:y", 414.0, 0.09)
	tween.parallel().tween_property(player_body, "size:y", 56.0, 0.09)
	tween.set_ease(Tween.EASE_IN)
	tween.tween_property(player_body, "position:y", 380.0, 0.18)
	tween.parallel().tween_property(player_body, "size:y", 90.0, 0.18)

func _resolve_attack() -> void:
	if not run_active:
		return
	var enemy: Dictionary = enemies[enemy_index]
	var correct := "duck" if attack_side == "high" else ("right" if attack_side == "left" else "left")
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
	enemy_body.position = Vector2(210, 185)

	if success:
		if perfect:
			flow += 1
			perfect_count += 1
			state_label.text = "PERFECT"
			state_label.add_theme_color_override("font_color", C.perfect)
			message_label.text = "PERFECT %s — AUTO COUNTER!" % ("DUCK" if correct == "duck" else "DODGE")
			_play("perfect")
			_flash(player_body, C.perfect)
		else:
			state_label.text = "DODGED"
			state_label.add_theme_color_override("font_color", C.good)
			message_label.text = ("%s — Auto Counter" % ("Duck" if correct == "duck" else "Dodge"))

		var damage := _counter_damage(perfect)
		enemy_counters_left -= damage
		_update_enemy_pattern_label()
		if damage > 1:
			message_label.text += "  [+%d BUILD DAMAGE]" % (damage - 1)
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
			hp -= 1
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
	message_label.text = "COUNTER KILL"
	enemy_index += 1
	if enemy_index >= enemies.size():
		_end_run(true)
		return
	await get_tree().create_timer(0.45).timeout
	if run_active:
		_show_skill_choices("reward")

func _end_run(victory: bool) -> void:
	run_active = false
	attack_generation += 1
	attack_side = ""
	weapon_indicator.text = ""
	timing_bar.value = 0.0
	restart_button.text = "TRY AGAIN"
	restart_button.disabled = false
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
