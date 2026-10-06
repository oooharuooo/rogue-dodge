extends SceneTree

const TestGame = preload("res://tests/test_game.gd")
const Mastery = preload("res://scripts/weapon_upgrade_catalog.gd")
const Saves = preload("res://scripts/save_manager.gd")
const Moves = preload("res://scripts/moveset_catalog.gd")
var game
var checks := 0
var failures: Array[String] = []

func _initialize() -> void:
	call_deferred("_run")

func check(condition: bool, message: String) -> void:
	checks += 1
	if not condition:
		failures.append(message)
		push_error("FAIL: " + message)

func reset_combat(weapon: String = "katana") -> void:
	game._clear_secondary_threats()
	game.current_weapon_id = weapon
	game.weapon_upgrades.clear()
	game.skill_levels.clear()
	game.flow = 0
	game.perfect_count = 0
	game.dagger_hit_bank = 0
	game.greatsword_charge = 0
	game.bow_aim = 0
	game.dev_test_active = true
	game.hp = 3
	game.enemy_index = 0
	game.enemy_max_hp = 10000
	game.enemy_hp = 10000
	game.guardian_charges = 0
	game.run_active = true
	game.attack_side = "left"
	game.dodge_locked_until = 0.0
	game.last_dodge_direction = ""
	game.last_counter_damage = 0
	game._hide_update_popup()
	for overlay in [game.dev_overlay, game.collection_overlay, game.weapon_overlay, game.weapon_upgrade_overlay, game.choice_overlay, game.map_overlay]:
		overlay.visible = false

func counter(perfect: bool) -> int:
	var preview: int = game._preview_counter_damage(perfect)
	if perfect:
		game.flow += 1
		game.perfect_count += 1
	var actual: int = game._counter_damage(perfect)
	check(preview == actual, "%s preview %d matches actual %d" % [game.current_weapon_id, preview, actual])
	return actual

func sequence(weapon: String, inputs: Array, expected: Array, upgrades: Array = []) -> void:
	reset_combat(weapon)
	for upgrade in upgrades:
		game.weapon_upgrades.append(str(upgrade))
	for i in inputs.size():
		check(counter(bool(inputs[i])) == int(expected[i]), "%s %s counter %d expected %d" % [weapon, str(upgrades), i, expected[i]])

func _run() -> void:
	root.size = Vector2i(540, 960)
	game = TestGame.new()
	root.add_child(game)
	await process_frame
	await process_frame
	_test_secondary_schedule()
	_test_weapons()
	_test_preview_matrix()
	_test_mastery()
	_test_skills()
	_test_resolution_and_input()
	_test_boss_and_catalogs()
	await _test_real_attacks()
	_test_touch()
	await _test_routes()
	_test_saves()
	await _test_layout()
	print("REGRESSION: %d checks, %d failures" % [checks, failures.size()])
	for failure in failures:
		print("FAIL: " + failure)
	game.queue_free()
	await process_frame
	quit(0 if failures.is_empty() else 1)

func _test_weapons() -> void:
	sequence("katana", [false, true, true, true], [1, 2, 2, 2])
	sequence("katana", [true, true, true, true], [2, 2, 4, 2], ["iaido"])
	sequence("katana", [true, true, true, false], [2, 2, 3, 2], ["flow_edge"])
	sequence("daggers", [false, false, true, true, true], [1, 2, 1, 2, 2])
	sequence("daggers", [true, true], [2, 2], ["flurry"])
	sequence("daggers", [false, false], [1, 3], ["serrated"])
	sequence("greatsword", [false, false, false, true, true, true], [1, 1, 1, 3, 1, 2])
	sequence("greatsword", [false, false, false, true], [1, 1, 1, 4], ["deep_charge"])
	sequence("greatsword", [false, false, true], [1, 1, 4], ["crushing_release"])
	sequence("bow", [true, true, true, true, false], [1, 1, 3, 1, 2])
	sequence("bow", [true, true], [1, 3], ["steady_aim"])
	sequence("bow", [true, false], [1, 3], ["piercing_shot"])
	print("PASS: four weapons and eight upgrades, fixed expected damage sequences")

func _test_preview_matrix() -> void:
	for weapon in ["katana", "daggers", "greatsword", "bow"]:
		var upgrades: Array = Mastery.upgrades_for(weapon)
		for mask in range(4):
			for perfect in [false, true]:
				for state in range(4):
					for skill_level in range(3):
						reset_combat(weapon)
						for i in range(2):
							if mask & (1 << i):
								game.weapon_upgrades.append(str(upgrades[i].id))
							game.flow = state
							game.perfect_count = state
							game.dagger_hit_bank = state
							game.greatsword_charge = mini(state, game._greatsword_max_charge())
							game.bow_aim = mini(state, 2)
							game.skill_levels = {"momentum": skill_level, "bloodlust": skill_level, "flame_counter": skill_level}
							var before := [game.flow, game.perfect_count, game.dagger_hit_bank, game.greatsword_charge, game.bow_aim]
							game._preview_counter_damage(perfect)
							check(before == [game.flow, game.perfect_count, game.dagger_hit_bank, game.greatsword_charge, game.bow_aim], "preview has no state changes")
							counter(perfect)
	print("PASS: HUD preview matrix across weapon states, upgrades and skill levels")

func _test_mastery() -> void:
	for pair in [[0,1], [7,1], [8,2], [19,2], [20,3], [100,3]]:
		check(Mastery.mastery_level(pair[0]) == pair[1], "mastery XP boundary %d" % pair[0])
	reset_combat()
	game.dev_test_active = false
	game.meta_data = Saves.default_data()
	game.run_weapon_mastery_level = 1
	game._add_weapon_mastery_xp(7)
	check(game._available_weapon_upgrades().is_empty(), "no upgrades before 8 XP")
	game._add_weapon_mastery_xp()
	check(game._weapon_mastery_xp("katana") == 8, "counter grants one XP")
	check(game._available_weapon_upgrades().size() == 1, "8 XP upgrade available during current run")
	game._add_weapon_mastery_xp(12)
	check(game._available_weapon_upgrades().size() == 2, "20 XP offers both upgrades")
	check(game._weapon_mastery_xp("bow") == 0, "mastery isolated per weapon")
	game.dev_test_active = true
	game._add_weapon_mastery_xp(100)
	check(game._weapon_mastery_xp("katana") == 20, "Dev Test grants no XP")
	game.weapon_upgrades.append("iaido")
	check(game._available_weapon_upgrades().size() == 1, "owned upgrade excluded")
	print("PASS: mastery boundaries, in-run unlocks and Dev isolation")

func _test_skills() -> void:
	reset_combat()
	game.skill_levels = {"flame_counter": 1}
	check(counter(true) == 2, "flame level 1 first perfect")
	check(counter(true) == 3, "flame level 1 second perfect")
	game.skill_levels = {"flame_counter": 2}
	check(counter(true) == 3, "flame level 2 every perfect")
	for skill in ["momentum", "bloodlust"]:
		for level in [1, 2]:
			reset_combat("bow")
			game.skill_levels = {skill: level}
			var threshold: int = (3 if level == 1 else 2) if skill == "momentum" else (4 if level == 1 else 3)
			game.flow = threshold - 2
			check(counter(true) == 1, "skill below threshold")
			game.flow = threshold - 1
			check(counter(true) == 2, "skill triggers on perfect reaching threshold")
	reset_combat()
	var enemy: Dictionary = game.enemies[0]
	game.skill_levels = {"focus": 1}
	check(is_equal_approx(game._effective_perfect_window(enemy), 0.26), "focus level 1 window")
	game.skill_levels = {"focus": 2}
	check(is_equal_approx(game._effective_perfect_window(enemy), 0.30), "focus level 2 window")
	game.meta_data = Saves.default_data()
	game.unlocked_skills = game.SkillCatalog.default_unlocked_ids()
	game.dev_test_active = false
	for spec in [["perfect_dodges",12,"momentum"], ["no_damage_encounters",3,"guardian"], ["elite_no_damage_clears",1,"bloodlust"]]:
		game._add_meta_progress(spec[0], spec[1] - 1)
		check(spec[2] not in game.unlocked_skills, "skill locked before threshold")
		game._add_meta_progress(spec[0])
		check(spec[2] in game.unlocked_skills, "skill permanently unlocked at threshold")
	var saved: Dictionary = game.meta_data.duplicate(true)
	game.dev_test_active = true
	game._add_meta_progress("perfect_dodges", 100)
	check(saved == game.meta_data, "Dev Test grants no collection progress")
	print("PASS: all five skills, level effects and permanent unlock thresholds")

func resolve_case(action: String, dodge: String, early: float) -> void:
	game.attack_side = action
	game.last_dodge_direction = dodge
	game.attack_resolve_time = 100.0
	game.last_dodge_time = 100.0 - early
	game._resolve_attack()

func _test_resolution_and_input() -> void:
	for action in ["left", "right", "high", "low"]:
		reset_combat()
		var correct: String = game._dev_correct_action(action)
		resolve_case(action, correct, 0.1)
		check(game.hp == 3 and game.flow == 1 and game.enemy_hp == 9998, "perfect counter for " + action)
		reset_combat()
		resolve_case(action, correct, 0.4)
		check(game.hp == 3 and game.flow == 0 and game.enemy_hp == 9999, "normal counter for " + action)
		reset_combat()
		resolve_case(action, correct, 0.9)
		check(game.hp == 2 and game.enemy_hp == 10000, "too early dodge fails for " + action)
		reset_combat()
		resolve_case(action, "invalid", 0.1)
		check(game.hp == 2, "wrong direction fails for " + action)
	reset_combat()
	game.guardian_charges = 1
	game.flow = 4
	resolve_case("left", "invalid", 0.1)
	check(game.hp == 3 and game.guardian_charges == 0 and game.flow == 0, "Guardian blocks once and resets Flow")
	reset_combat()
	game.dev_god_mode = true
	resolve_case("left", "invalid", 0.1)
	check(game.hp == 3, "Dev God Mode prevents HP loss")
	game.dev_god_mode = false
	for key_pair in [[KEY_A,"left"], [KEY_D,"right"], [KEY_W,"jump"], [KEY_S,"duck"], [KEY_LEFT,"left"], [KEY_RIGHT,"right"], [KEY_UP,"jump"], [KEY_DOWN,"duck"]]:
		reset_combat()
		var event := InputEventKey.new()
		event.keycode = key_pair[0]
		event.pressed = true
		game._input(event)
		check(game.last_dodge_direction == key_pair[1], "keyboard mapping " + key_pair[1])
	reset_combat()
	game._try_action("left")
	game._try_action("right")
	check(game.last_dodge_direction == "left", "commit lock prevents spam")
	for overlay in [game.map_overlay, game.choice_overlay, game.dev_overlay, game.collection_overlay, game.weapon_overlay, game.weapon_upgrade_overlay]:
		reset_combat()
		overlay.visible = true
		var event := InputEventKey.new()
		event.keycode = KEY_R
		event.pressed = true
		game._input(event)
		check(game.run_active, "modal blocks restart hotkey")
		overlay.visible = false
	reset_combat()
	var click := InputEventMouseButton.new()
	click.button_index = MOUSE_BUTTON_LEFT
	click.pressed = true
	click.position = game.dev_button.get_global_rect().get_center()
	game._input(click)
	check(game.last_dodge_direction == "", "utility button click does not dodge")
	game._start_dev_test()
	check(game.dev_test_active and game.run_active and game.dev_step_button.visible, "Dev setup starts turn-based test")
	game._show_dev_overlay()
	game._hide_dev_overlay()
	check(not game.run_active and not game.collection_button.disabled and not game.restart_button.disabled, "closing stopped Dev Test enables collection and new run")
	for zone_pair in [[game.jump_touch_zone,"jump"], [game.duck_touch_zone,"duck"]]:
		reset_combat()
		click.position = zone_pair[0].get_global_rect().get_center()
		game._input(click)
		check(game.last_dodge_direction == zone_pair[1], "center mouse zone " + zone_pair[1])
	print("PASS: timing, all directions, keyboard, click zones, modal and commit guards")

func _test_boss_and_catalogs() -> void:
	reset_combat()
	game.enemy_index = 4
	game.enemy_max_hp = 18
	for pair in [[18,1], [12,1], [11,2], [6,2], [5,3], [1,3]]:
		game.enemy_hp = pair[0]
		check(game._boss_phase_for_hp() == pair[1], "boss phase at HP %d" % pair[0])
	game.boss_phase = 1
	game.enemy_hp = 11
	game.current_pattern.append("left")
	var generation: int = game.attack_generation
	check(game._check_boss_phase_transition(), "boss transitions to phase 2")
	check(game.boss_phase == 2 and game.current_pattern.is_empty() and game.attack_generation > generation, "phase cancels old combo")
	game.enemy_hp = 5
	check(game._check_boss_phase_transition() and game.boss_phase == 3, "boss transitions to phase 3")
	for enemy in game.enemies:
		for phase in [1,2,3]:
			for pattern in Moves.patterns_for(enemy.id, phase):
				for step in pattern.steps:
					check(Moves.base_action(step) in ["left","right","high","low"], "moveset step maps to valid action")
	for step in ["projectile_left","projectile_right","projectile_high","projectile_low","quick_projectile_left"]:
		check(Moves.is_projectile(step), "projectile classified " + step)
	check(Moves.is_fake("fake_high") and not Moves.is_projectile("fake_high"), "feint classified")
	check(is_equal_approx(Moves.windup_multiplier("quick_projectile_left"), 0.58), "quick projectile speed")
	print("PASS: boss thresholds, combo cancellation, every moveset and projectile mapping")

func _test_routes() -> void:
	reset_combat()
	game.dev_test_active = false
	game._begin_new_run()
	check(game.weapon_overlay.visible and game.weapon_upgrades.is_empty(), "new run resets upgrades and chooses weapon")
	game._choose_weapon("katana")
	check(game.choice_overlay.visible and game.choice_mode == "starter", "weapon selection opens starter")
	game._choose_skill("focus")
	check(game.map_overlay.visible and game.dungeon_floor == 0, "starter opens floor 1")
	game._select_map_node(1, "rest")
	check(game.dungeon_floor == 0, "future floor rejected")
	game._select_map_node(0, "swordsman")
	check(game.run_active and game.enemy_hp == 5 and game.current_floor_number == 1, "normal route loads actual enemy HP")
	game.run_active = false
	game.hp = 2
	game._select_map_node(1, "rest")
	check(game.hp == 3 and game.dungeon_floor == 2 and game.map_overlay.visible, "rest heals and advances map")
	game.gold = 2
	game.run_unlocked_pool.clear()
	game.run_unlocked_pool.append("focus")
	game.skill_levels = {"focus":2}
	game._select_map_node(2, "shop")
	check(game.gold == 2 and game.map_overlay.visible, "maxed shop refunds gold")
	game.dungeon_floor = 1
	game._select_map_node(1, "shrine")
	check(game.gold == 3 and game.map_overlay.visible, "maxed shrine converts to gold")
	game.dungeon_floor = 1
	game.skill_levels = {"focus":1}
	game._select_map_node(1, "shrine")
	check(game.choice_mode == "upgrade" and game.choice_overlay.visible, "shrine offers owned skill upgrade")
	game._choose_skill("focus")
	check(game.skill_levels.focus == 2 and game.map_overlay.visible, "shrine applies level 2")
	game.current_node_type = "normal"
	game.current_gold_reward = 2
	game.run_active = true
	game.encounter_took_damage = false
	var before_gold: int = game.gold
	var before_progress: int = game._meta_progress_value("no_damage_encounters")
	game._defeat_enemy()
	check(game.gold == before_gold + 2, "enemy defeat grants route gold")
	check(game._meta_progress_value("no_damage_encounters") == before_progress + 1, "no-damage clear progress")
	await create_timer(0.5).timeout
	game.dev_test_active = true
	game.run_active = true
	before_gold = game.gold
	var before_meta: Dictionary = game.meta_data.duplicate(true)
	game._defeat_enemy()
	check(game.gold == before_gold and game.meta_data == before_meta, "Dev KO grants no rewards")
	game.dev_test_active = false
	game.run_active = true
	game.hp = 1
	resolve_case("left", "invalid", 0.1)
	check(game.hp == 0 and not game.run_active, "fatal hit ends run")
	game.run_active = true
	game._end_run(false)
	check(game.restart_button.text == "TRY AGAIN" and not game.restart_button.disabled, "death enables retry")
	game._end_run(true)
	check(game.state_label.text == "CLEARED", "victory UI")
	print("PASS: run flow, route guards, rest, shrine, shop refund, rewards and retry")

func _test_real_attacks() -> void:
	# Exercise the actual async telegraph -> cue -> projectile/melee -> resolution path.
	var original_enemies: Array = game.enemies.duplicate(true)
	for enemy in game.enemies:
		enemy.windup = 0.12
		enemy.cue_before = 0.03
	for enemy_index in range(5):
		for perfect in [false, true]:
			for step in ["left", "right", "high", "low", "projectile_left", "projectile_right", "projectile_high", "projectile_low", "quick_projectile_left", "delay_high"]:
				reset_combat()
				game.enemy_index = enemy_index
				game.boss_phase = 3 if enemy_index == 4 else 1
				game.dev_auto_dodge = true
				game.dev_force_perfect = perfect
				await game._begin_real_step(step)
				check(game.hp == 3 and game.enemy_hp == (9998 if perfect else 9999), "real attack resolution %d %s perfect=%s" % [enemy_index, step, perfect])
	reset_combat()
	game.dev_auto_dodge = true
	game.dev_force_perfect = true
	game._begin_real_step("projectile_high")
	var before_deadline: float = game.attack_resolve_time
	game._show_update_popup()
	await create_timer(0.25).timeout
	check(game.enemy_hp == 10000 and game.hp == 3, "changelog pauses in-flight attack timers")
	game._hide_update_popup()
	check(game.attack_resolve_time >= before_deadline + 0.20, "pause shifts manual dodge deadline")
	await create_timer(0.25).timeout
	check(game.enemy_hp == 9998, "Continue resumes in-flight attack")
	reset_combat()
	game.dev_auto_dodge = true
	game._begin_real_step("left")
	game.attack_generation += 1
	await create_timer(0.25).timeout
	check(game.enemy_hp == 10000, "cancelled attack cannot damage new encounter")
	reset_combat()
	game._load_enemy()
	game.attack_generation += 1
	var starts: int = game.pattern_starts
	await create_timer(0.75).timeout
	check(game.pattern_starts == starts, "cancelled enemy-load timer cannot start a new pattern")
	reset_combat()
	game.dev_turn_based = true
	await game._begin_fake_step("fake_high")
	check(game.hp == 3 and game.enemy_hp == 10000 and game.state_label.text == "WAITING", "feint causes no counter or damage and waits in turn mode")
	game.enemies = original_enemies
	for source in ["minion", "arena"]:
		for action in ["left", "right", "high", "low"]:
			for perfect in [false, true]:
				reset_combat()
				game.dev_auto_dodge = true
				game.dev_force_perfect = perfect
				game.pattern_step_index = 3
				game.active_threat = {"name":"Test source", "source":source, "action":action, "windup":0.12}
				await game._begin_real_step(action)
				check(game.enemy_hp == (9998 if perfect else 9999) and game.hp == 3, "Secondary actual counter %s %s perfect=%s" % [source, action, perfect])
				check(game.pattern_step_index == 3 and game.active_threat.is_empty(), "Secondary returns to unchanged main combo")
	reset_combat()
	game.active_threat = {"name":"Cancelled", "source":"arena", "action":"low", "windup":0.12}
	game._begin_real_step("low")
	game._show_dev_overlay()
	await create_timer(0.2).timeout
	check(game.enemy_hp == 10000 and game.active_threat.is_empty() and not game.secondary_marker.visible, "Stopping Dev cancels secondary impact and visuals")
	game.dev_auto_dodge = false
	game.dev_force_perfect = false
	game.dev_turn_based = false
	print("PASS: 100 timed melee/projectile attacks, pause/resume, cancellation and feints")

func _test_touch() -> void:
	for action in ["jump", "duck", "left", "right"]:
		reset_combat()
		var touch := InputEventScreenTouch.new()
		touch.pressed = true
		if action == "jump":
			touch.position = game.jump_touch_zone.get_global_rect().get_center()
		elif action == "duck":
			touch.position = game.duck_touch_zone.get_global_rect().get_center()
		else:
			touch.position = game.arena.get_global_rect().position + Vector2(30 if action == "left" else 430, 220)
		game._input(touch)
		touch.pressed = false
		game._input(touch)
		check(game.last_dodge_direction == action, "touch tap mapping " + action)
	for distance in [-60.0, 60.0, 10.0]:
		reset_combat()
		var touch := InputEventScreenTouch.new()
		touch.pressed = true
		touch.position = game.arena.get_global_rect().position + Vector2(50, 200)
		game._input(touch)
		var drag := InputEventScreenDrag.new()
		drag.position = touch.position + Vector2(0, distance)
		drag.relative = Vector2(0, distance)
		game._input(drag)
		touch.pressed = false
		game._input(touch)
		var expected := "jump" if distance < -32 else ("duck" if distance >= 28 else "")
		check(game.last_dodge_direction == expected, "swipe threshold and no accidental side dodge")
	game.last_touch_event_ms = -10000
	print("PASS: touch zones, side taps, both swipes and short-drag suppression")

func _test_saves() -> void:
	var path := "res://tests/.regression-save.json"
	var data: Dictionary = Saves.default_data()
	data.weapon_mastery.katana = 20
	data.progress.perfect_dodges = 12
	data.unlocked_skills.append("momentum")
	check(Saves.save_data(data, path), "save writes isolated test file")
	var loaded: Dictionary = Saves.load_data(path)
	check(loaded == data, "save roundtrip retains mastery, unlocks, counters")
	var file := FileAccess.open(path, FileAccess.WRITE)
	file.store_string('{"version":1,"weapon_mastery":{"katana":-5,"bow":8},"progress":{"perfect_dodges":7}}')
	file.close()
	loaded = Saves.load_data(path)
	check(loaded.weapon_mastery.katana == 0 and loaded.weapon_mastery.bow == 8, "legacy save migrates and clamps negative XP")
	check(loaded.progress.perfect_dodges == 7 and loaded.weapon_mastery.daggers == 0, "missing keys retain defaults")
	file = FileAccess.open(path, FileAccess.WRITE)
	file.store_string("invalid JSON")
	file.close()
	check(Saves.load_data(path) == Saves.default_data(), "invalid JSON recovers default save")
	file = FileAccess.open(path, FileAccess.WRITE)
	file.store_string('{"weapon_mastery":[],"progress":"wrong","unlocked_skills":null}')
	file.close()
	check(Saves.load_data(path) == Saves.default_data(), "wrong-shaped save fields recover safely")
	DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
	print("PASS: save persistence, migration and corrupt JSON recovery")

func _test_layout() -> void:
	game._show_update_popup()
	check(paused and game.update_overlay.process_mode == Node.PROCESS_MODE_ALWAYS, "changelog pauses combat with interactive modal")
	await process_frame
	await process_frame
	var scroll: ScrollContainer = game.update_overlay.find_child("ChangelogScroll", true, false)
	check(scroll != null, "changelog scroll exists")
	check(scroll.horizontal_scroll_mode == ScrollContainer.SCROLL_MODE_DISABLED, "changelog horizontal overflow disabled")
	check(scroll.get_v_scroll_bar().max_value > scroll.get_v_scroll_bar().page, "changelog has real vertical overflow")
	scroll.scroll_vertical = 99999
	await process_frame
	check(scroll.scroll_vertical > 0, "changelog scroll reaches lower content")
	var buttons: Array[Node] = game.update_overlay.find_children("*", "Button", true, false)
	check(buttons.size() == 1 and buttons[0].text == "CONTINUE", "Continue stays outside scrolling content")
	check(game.get_global_rect().encloses(buttons[0].get_global_rect()), "Continue fits viewport")
	game._hide_update_popup()
	check(not paused, "Continue resumes combat")
	print("PASS: changelog overflow, fixed Continue and pause/resume")

func _test_secondary_schedule() -> void:
	for enemy_id in ["swordsman", "heavy_knight", "rogue", "duelist", "executioner"]:
		for phase in range(1, 4):
			for count in range(1, 13):
				var threat: Dictionary = game.SecondaryThreatCatalog.threat_for_exchange(enemy_id, phase, count)
				if threat.is_empty():
					continue
				check(str(threat.action) in ["left", "right", "high", "low"], "Secondary uses existing controls")
				check(float(threat.windup) > game.DODGE_COMMIT_SECONDS, "Secondary allows commitment recovery")
	reset_combat()
	game.enemy_index = 2
	game.pattern_step_index = 0
	game._complete_exchange()
	check(game.pending_threat.is_empty(), "Rogue first main exchange has no minion")
	game._complete_exchange()
	check(str(game.pending_threat.get("source", "")) == "minion", "Rogue second main exchange queues minion")
	game.active_threat = game.pending_threat.duplicate(true)
	game.pending_threat.clear()
	game._show_secondary_source(game.active_threat)
	game._complete_exchange()
	check(game.pattern_step_index == 2 and game.primary_exchanges == 2, "Minion does not consume main combo or recursively schedule")
	check(not game.secondary_marker.visible, "Minion clears after resolution")
	game._clear_secondary_threats()
	check(game.primary_exchanges == 0 and game.pending_threat.is_empty() and game.active_threat.is_empty(), "Lifecycle clears all secondary state")
	print("PASS: secondary schedules, four controls, commitment recovery and combo preservation")
