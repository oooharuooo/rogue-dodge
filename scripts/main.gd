extends Control

const MAX_HP := 3
const DODGE_COMMIT_SECONDS := 0.35

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
	{"name":"Swordsman","counters":1,"windup":1.50,"dodge_window":0.68,"perfect_window":0.21,"cue_before":0.43},
	{"name":"Heavy Knight","counters":2,"windup":2.35,"dodge_window":0.72,"perfect_window":0.22,"cue_before":0.47},
	{"name":"Rogue","counters":2,"windup":1.05,"dodge_window":0.52,"perfect_window":0.17,"cue_before":0.33}
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

var audio_players: Dictionary = {}

func _ready() -> void:
	_build_ui()
	_load_audio()
	_reset_run(false)

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
	progress_label = _stat(stats, "ENEMY", "1 / 3")

	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 8)
	column.add_child(header)

	var info := VBoxContainer.new()
	info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(info)
	enemy_name_label = _label("Combat Sandbox", 22, C.text)
	info.add_child(enemy_name_label)
	enemy_counter_label = _label("Left / Right only", 14, C.muted)
	info.add_child(enemy_counter_label)

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

	hint_label = _label("Keyboard: A/D or arrows. Phone: tap left/right half.", 14, C.muted)
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

	var left_hint := _label("TAP LEFT\nA / ←", 17, C.muted)
	left_hint.position = Vector2(18, 405)
	left_hint.size = Vector2(150, 66)
	left_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	arena.add_child(left_hint)

	var right_hint := _label("TAP RIGHT\nD / →", 17, C.muted)
	right_hint.position = Vector2(372, 405)
	right_hint.size = Vector2(150, 66)
	right_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	arena.add_child(right_hint)

	message_label = _label("Start the run and learn the telegraphs.", 18, C.text)
	message_label.custom_minimum_size = Vector2(0, 48)
	message_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	message_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	message_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	column.add_child(message_label)

	restart_button = Button.new()
	restart_button.text = "START RUN"
	restart_button.custom_minimum_size = Vector2(0, 54)
	restart_button.pressed.connect(func(): _reset_run(true))
	column.add_child(restart_button)

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

func _load_audio() -> void:
	var tones := {
		"windup":[170.0,0.14,0.30],
		"cue":[760.0,0.07,0.28],
		"dodge":[310.0,0.08,0.22],
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

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_A or event.keycode == KEY_LEFT:
			_try_dodge("left")
		elif event.keycode == KEY_D or event.keycode == KEY_RIGHT:
			_try_dodge("right")
		elif event.keycode == KEY_R:
			_reset_run(true)
	elif event is InputEventScreenTouch and event.pressed and run_active:
		var half := get_viewport_rect().size.x * 0.5
		_try_dodge("left" if event.position.x < half else "right")

func _reset_run(start_now: bool) -> void:
	attack_generation += 1
	hp = MAX_HP
	flow = 0
	enemy_index = 0
	run_active = start_now
	attack_side = ""
	last_dodge_direction = ""
	last_dodge_time = -99.0
	dodge_locked_until = 0.0
	timing_bar.value = 0.0
	player_body.position = Vector2(235, 380)
	player_body.modulate = Color.WHITE
	enemy_body.position = Vector2(210, 185)
	enemy_body.modulate = Color.WHITE
	weapon_indicator.text = ""
	_update_hud()

	if start_now:
		restart_button.text = "RESTART RUN"
		message_label.text = "Enemy approaching..."
		_load_enemy()
	else:
		restart_button.text = "START RUN"

func _update_hud() -> void:
	hp_label.text = "%d / %d" % [hp, MAX_HP]
	flow_label.text = "x%d" % flow
	progress_label.text = "%d / %d" % [min(enemy_index + 1, enemies.size()), enemies.size()]

func _load_enemy() -> void:
	if not run_active:
		return
	var enemy: Dictionary = enemies[enemy_index]
	enemy_counters_left = int(enemy.counters)
	enemy_name_label.text = str(enemy.name)
	enemy_counter_label.text = "Counter needed: %d" % enemy_counters_left
	state_label.text = "READY"
	state_label.add_theme_color_override("font_color", C.accent)
	hint_label.text = "Watch the stance. Don't panic-dodge."
	await get_tree().create_timer(0.65).timeout
	if run_active:
		_begin_attack()

func _begin_attack() -> void:
	if not run_active:
		return
	attack_generation += 1
	var generation := attack_generation
	var enemy: Dictionary = enemies[enemy_index]
	attack_side = "left" if randf() < 0.5 else "right"
	last_dodge_direction = ""
	last_dodge_time = -99.0
	attack_resolve_time = Time.get_ticks_msec() / 1000.0 + float(enemy.windup)

	state_label.text = "WIND-UP"
	state_label.add_theme_color_override("font_color", C.accent)
	weapon_indicator.text = "ATTACK FROM LEFT" if attack_side == "left" else "ATTACK FROM RIGHT"
	hint_label.text = "Dodge to the OPPOSITE side."
	_play("windup")

	var target_x := 185.0 if attack_side == "left" else 235.0
	var wind := create_tween()
	wind.set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	wind.tween_property(enemy_body, "position:x", target_x, min(float(enemy.windup) * 0.45, 0.55))

	timing_bar.value = 0.0
	var bar := create_tween()
	bar.tween_property(timing_bar, "value", 1.0, float(enemy.windup))

	await get_tree().create_timer(max(0.0, float(enemy.windup) - float(enemy.cue_before))).timeout
	if not run_active or generation != attack_generation:
		return
	state_label.text = "NOW"
	state_label.add_theme_color_override("font_color", C.danger)
	hint_label.text = "NOW!"
	_play("cue")

	await get_tree().create_timer(float(enemy.cue_before)).timeout
	if run_active and generation == attack_generation:
		_resolve_attack()

func _try_dodge(direction: String) -> void:
	if not run_active or attack_side == "":
		return
	var now := Time.get_ticks_msec() / 1000.0
	if now < dodge_locked_until:
		message_label.text = "Committed — cannot dodge again yet."
		return
	dodge_locked_until = now + DODGE_COMMIT_SECONDS
	last_dodge_direction = direction
	last_dodge_time = now
	_play("dodge")

	var target_x := 170.0 if direction == "left" else 300.0
	var tween := create_tween()
	tween.set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(player_body, "position:x", target_x, 0.11)
	tween.set_ease(Tween.EASE_IN)
	tween.tween_property(player_body, "position:x", 235.0, 0.18)

func _resolve_attack() -> void:
	if not run_active:
		return
	var enemy: Dictionary = enemies[enemy_index]
	var correct := "right" if attack_side == "left" else "left"
	var success := false
	var perfect := false

	if last_dodge_direction == correct:
		var early := attack_resolve_time - last_dodge_time
		if early >= 0.0 and early <= float(enemy.dodge_window):
			success = true
			perfect = early <= float(enemy.perfect_window)

	attack_side = ""
	timing_bar.value = 0.0
	weapon_indicator.text = ""
	enemy_body.position = Vector2(210, 185)

	if success:
		if perfect:
			flow += 1
			state_label.text = "PERFECT"
			state_label.add_theme_color_override("font_color", C.perfect)
			message_label.text = "PERFECT DODGE — AUTO COUNTER!"
			_play("perfect")
			_flash(player_body, C.perfect)
		else:
			state_label.text = "DODGED"
			state_label.add_theme_color_override("font_color", C.good)
			message_label.text = "Dodge — Auto Counter"

		enemy_counters_left -= 1
		enemy_counter_label.text = "Counter needed: %d" % max(enemy_counters_left, 0)
		_counter_animation()
		_update_hud()

		if enemy_counters_left <= 0:
			await get_tree().create_timer(0.48).timeout
			_defeat_enemy()
		else:
			await get_tree().create_timer(0.72).timeout
			if run_active:
				_begin_attack()
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
			await get_tree().create_timer(0.85).timeout
			if run_active:
				_begin_attack()

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
	await get_tree().create_timer(0.65).timeout
	if run_active:
		_load_enemy()

func _end_run(victory: bool) -> void:
	run_active = false
	attack_generation += 1
	attack_side = ""
	weapon_indicator.text = ""
	timing_bar.value = 0.0
	restart_button.text = "TRY AGAIN"
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
