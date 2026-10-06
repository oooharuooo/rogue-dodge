extends RefCounted

const FLOORS := [
	[
		{"id":"swordsman","type":"normal","label":"NORMAL\nSwordsman","enemy_index":0,"gold":2},
		{"id":"heavy_knight","type":"normal","label":"NORMAL\nHeavy Knight","enemy_index":1,"gold":2}
	],
	[
		{"id":"rest","type":"rest","label":"REST\nHeal +1 HP"},
		{"id":"shrine","type":"shrine","label":"UPGRADE SHRINE\nUpgrade owned skill"}
	],
	[
		{"id":"rogue","type":"normal","label":"NORMAL\nRogue","enemy_index":2,"gold":2},
		{"id":"shop","type":"shop","label":"SHOP\n2 Gold to Skill"}
	],
	[
		{"id":"elite","type":"elite","label":"ELITE\nDuelist","enemy_index":3,"gold":4}
	],
	[
		{"id":"boss","type":"boss","label":"BOSS\nExecutioner","enemy_index":4,"gold":0}
	]
]

static func floor_count() -> int:
	return FLOORS.size()

static func nodes_for_floor(index: int) -> Array:
	if index < 0 or index >= FLOORS.size():
		return []
	return FLOORS[index]

static func node_by_id(floor_index: int, node_id: String) -> Dictionary:
	for node in nodes_for_floor(floor_index):
		if str(node.id) == node_id:
			return node
	return {}
