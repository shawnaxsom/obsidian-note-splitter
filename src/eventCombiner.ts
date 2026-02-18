interface ParsedEvent {
	person: string | null;
	eventDescription: string;
	date: string | null;
	originalFilename: string;
}

/**
 * Parses a filename to extract person name, event description, and date.
 * Expected format: "[Person] [Event Description] [Date]"
 * Example: "Jacob one-on-one 2026-02-18" -> {person: "Jacob", eventDescription: "one-on-one", date: "2026-02-18"}
 */
function parseEventFilename(filename: string): ParsedEvent {
	// Remove any wikilink brackets
	const cleaned = filename.replace(/^\[\[/, '').replace(/\]\]$/, '').trim();

	// Try to extract date from the end (YYYY-MM-DD or YYYYMMDD format)
	const datePatternDash = /(\d{4}-\d{2}-\d{2})$/;
	const datePatternCompact = /(\d{8})$/;

	let date: string | null = null;
	let withoutDate = cleaned;

	const dashMatch = cleaned.match(datePatternDash);
	if (dashMatch) {
		date = dashMatch[1];
		withoutDate = cleaned.substring(0, cleaned.length - date.length).trim();
	} else {
		const compactMatch = cleaned.match(datePatternCompact);
		if (compactMatch) {
			date = compactMatch[1];
			withoutDate = cleaned.substring(0, cleaned.length - date.length).trim();
		}
	}

	// Try to extract person name (first capitalized word)
	// Heuristic: if the text starts with a single capitalized word followed by a space,
	// treat it as a person name
	const personPattern = /^([A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s+(.+)$/;
	const personMatch = withoutDate.match(personPattern);

	if (personMatch) {
		return {
			person: personMatch[1],
			eventDescription: personMatch[2],
			date,
			originalFilename: filename
		};
	}

	// No person detected, treat the whole thing as an event description
	return {
		person: null,
		eventDescription: withoutDate,
		date,
		originalFilename: filename
	};
}

/**
 * Combines multiple events for the same person and date into a single wikilink.
 * Example:
 *   Input: ["[[Jacob one-on-one 2026-02-18]]", "[[Jacob Career Discussion 2026-02-18]]"]
 *   Output: ["[[Jacob one-on-one and Career Discussion 2026-02-18]]"]
 */
export function combineEvents(wikilinks: string[]): string[] {
	// Parse all wikilinks
	const parsed = wikilinks.map(link => parseEventFilename(link));

	// Group by person + date (only for events with a detected person)
	const groups = new Map<string, ParsedEvent[]>();
	const nonGrouped: ParsedEvent[] = [];

	for (const event of parsed) {
		if (event.person && event.date) {
			const key = `${event.person}|${event.date}`;
			if (!groups.has(key)) {
				groups.set(key, []);
			}
			groups.get(key)!.push(event);
		} else {
			// If no person or no date detected, don't group
			nonGrouped.push(event);
		}
	}

	// Combine events in each group
	const result: string[] = [];

	for (const [key, events] of groups.entries()) {
		if (events.length === 1) {
			// Only one event for this person + date, keep as is
			result.push(events[0].originalFilename);
		} else {
			// Multiple events for same person + date, combine them
			const person = events[0].person!;
			const date = events[0].date!;
			const eventDescriptions = events.map(e => e.eventDescription);
			const combined = eventDescriptions.join(' and ');
			result.push(`[[${person} ${combined} ${date}]]`);
		}
	}

	// Add non-grouped events
	for (const event of nonGrouped) {
		result.push(event.originalFilename);
	}

	return result;
}
