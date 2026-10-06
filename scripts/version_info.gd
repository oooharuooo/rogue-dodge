extends RefCounted

const VERSION := "v0.4.3"
const BUILD_NAME := "Duck Input Tuning"

const CHANGES := [
	"Made mobile Duck easier to trigger by reducing the swipe distance required.",
	"Downward diagonal swipes are now accepted instead of requiring an almost perfectly vertical swipe.",
	"Side dodge now only triggers from a true tap with very little finger movement.",
	"A failed/ambiguous drag is ignored instead of accidentally becoming Left or Right.",
	"Kept the cache-safe deployment and CI parse-error protection."
]

static func changelog_text() -> String:
	var lines: Array[String] = []
	for item in CHANGES:
		lines.append("• " + item)
	return "\n".join(lines)
