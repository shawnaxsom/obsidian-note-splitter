interface ParsedEvent {
	person: string | null;
	eventDescription: string;
	date: string | null;
	originalFilename: string;
	originalIndex: number;
}

/**
 * Parses a filename to extract person name, event description, and date.
 * Expected format: "[Person] [Event Description] [Date]"
 * Example: "Jacob one-on-one 2026-02-18" -> {person: "Jacob", eventDescription: "one-on-one", date: "2026-02-18"}
 */
function parseEventFilename(filename: string, index: number): ParsedEvent {
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
			originalFilename: filename,
			originalIndex: index
		};
	}

	// No person detected, treat the whole thing as an event description
	return {
		person: null,
		eventDescription: withoutDate,
		date,
		originalFilename: filename,
		originalIndex: index
	};
}

/**
 * Combines multiple events for the same person and date into a single wikilink.
 * Preserves the original order of events - combined events appear at the position
 * of the first occurrence.
 * Example:
 *   Input: ["Event 1", "[[Jacob one-on-one 2026-02-18]]", "Event 2", "[[Jacob Career Discussion 2026-02-18]]", "Event 3"]
 *   Output: ["Event 1", "[[Jacob one-on-one and Career Discussion 2026-02-18]]", "Event 2", "Event 3"]
 */
export function combineEvents(wikilinks: string[]): string[] {
	// Parse all wikilinks with their original indices
	const parsed = wikilinks.map((link, index) => parseEventFilename(link, index));

	// Group by person + date (only for events with a detected person)
	const groups = new Map<string, ParsedEvent[]>();

	for (const event of parsed) {
		if (event.person && event.date) {
			const key = `${event.person}|${event.date}`;
			if (!groups.has(key)) {
				groups.set(key, []);
			}
			groups.get(key)!.push(event);
		}
	}

	// Create a map to track which indices should be skipped (subsequent occurrences in groups)
	const indicesToSkip = new Set<number>();

	// Create a map from first occurrence index to combined event
	const combinedEvents = new Map<number, string>();

	for (const [key, events] of groups.entries()) {
		if (events.length > 1) {
			// Multiple events for same person + date
			const person = events[0].person!;
			const date = events[0].date!;
			const eventDescriptions = events.map(e => e.eventDescription);
			const combined = eventDescriptions.join(' and ');
			const combinedWikilink = `[[${person} ${combined} ${date}]]`;

			// Place combined event at the position of the first occurrence
			combinedEvents.set(events[0].originalIndex, combinedWikilink);

			// Mark subsequent occurrences to be skipped
			for (let i = 1; i < events.length; i++) {
				indicesToSkip.add(events[i].originalIndex);
			}
		}
	}

	// Build result array preserving original order
	const result: string[] = [];

	for (let i = 0; i < parsed.length; i++) {
		if (indicesToSkip.has(i)) {
			// Skip subsequent occurrences of grouped events
			continue;
		}

		if (combinedEvents.has(i)) {
			// Use the combined event at this position
			result.push(combinedEvents.get(i)!);
		} else {
			// Use the original event
			result.push(parsed[i].originalFilename);
		}
	}

	return result;
}
