/**
 * Processes text to detect and transform one-on-one meeting patterns.
 * Patterns like "Jacob / Shawn" or "Jacob <> Shawn" become "Jacob one-on-one"
 * Patterns with suffixes like "Jacob / Shawn Intro" become "Jacob Intro"
 */
export function processOneOnOneLine(line: string, userName: string): string {
	if (!userName || userName.trim() === '') {
		return line;
	}

	// Escape the username for use in regex (in case it contains special regex characters)
	const escapedUserName = userName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	// Pattern to match one-on-one formats:
	// - "Jacob / Shawn", "Jacob/Shawn", "Shawn / Jacob"
	// - "Jacob <> Shawn", "Shawn <> Jacob"
	// - "Jacob/Shawn 1:1", "Jacob / Shawn 1:1"
	// Optional suffix after the pattern (e.g., "Intro", "Planning")
	//
	// Capture groups:
	// 1. Other person's name (before separator)
	// 2. Separator pattern
	// 3. Optional "1:1" marker
	// 4. Optional suffix after the pattern

	// Pattern 1: userName comes first (e.g., "Shawn / Jacob" or "Shawn <> Jacob Intro")
	const userFirstPattern = new RegExp(
		`^\\s*${escapedUserName}\\s*([/<>]+)\\s*([\\w\\s]+?)(\\s+1:1)?\\s*(.*)$`,
		'i'
	);

	// Pattern 2: userName comes second (e.g., "Jacob / Shawn" or "Jacob <> Shawn Intro")
	const userSecondPattern = new RegExp(
		`^\\s*([\\w\\s]+?)\\s*([/<>]+)\\s*${escapedUserName}(\\s+1:1)?\\s*(.*)$`,
		'i'
	);

	// Try pattern where userName comes first
	let match = line.match(userFirstPattern);
	if (match) {
		const otherPerson = match[2].trim();
		const suffix = match[4].trim();

		if (suffix) {
			// If there's a suffix, use it: "Shawn / Jacob Intro" -> "Jacob Intro"
			return `${otherPerson} ${suffix}`;
		} else {
			// No suffix, use "one-on-one": "Shawn / Jacob" -> "Jacob one-on-one"
			return `${otherPerson} one-on-one`;
		}
	}

	// Try pattern where userName comes second
	match = line.match(userSecondPattern);
	if (match) {
		const otherPerson = match[1].trim();
		const suffix = match[4].trim();

		if (suffix) {
			// If there's a suffix, use it: "Jacob / Shawn Intro" -> "Jacob Intro"
			return `${otherPerson} ${suffix}`;
		} else {
			// No suffix, use "one-on-one": "Jacob / Shawn" -> "Jacob one-on-one"
			return `${otherPerson} one-on-one`;
		}
	}

	// No match found, return original line
	return line;
}
