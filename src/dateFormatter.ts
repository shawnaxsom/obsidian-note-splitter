/**
 * Extracts a date from a filename in YYYY-MM-DD or YYYYMMDD format
 * Returns null if no date pattern is found
 */
export function extractDateFromFilename(filename: string): Date | null {
	// Try YYYY-MM-DD format
	const dashMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
	if (dashMatch) {
		const year = parseInt(dashMatch[1], 10);
		const month = parseInt(dashMatch[2], 10) - 1; // JS months are 0-indexed
		const day = parseInt(dashMatch[3], 10);
		return new Date(year, month, day);
	}

	// Try YYYYMMDD format
	const compactMatch = filename.match(/(\d{4})(\d{2})(\d{2})/);
	if (compactMatch) {
		const year = parseInt(compactMatch[1], 10);
		const month = parseInt(compactMatch[2], 10) - 1;
		const day = parseInt(compactMatch[3], 10);
		return new Date(year, month, day);
	}

	return null;
}

export function formatDate(format: 'YYYY-MM-DD' | 'YYYYMMDD', sourceDate?: Date): string {
	const date = sourceDate || new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	if (format === 'YYYY-MM-DD') {
		return `${year}-${month}-${day}`;
	} else {
		return `${year}${month}${day}`;
	}
}

export function appendDateToFilename(
	filename: string,
	dateFormat: 'YYYY-MM-DD' | 'YYYYMMDD',
	currentFilename?: string
): string {
	// Try to extract date from current filename first
	let sourceDate: Date | undefined;
	if (currentFilename) {
		const extractedDate = extractDateFromFilename(currentFilename);
		if (extractedDate) {
			sourceDate = extractedDate;
		}
	}

	const date = formatDate(dateFormat, sourceDate);
	return `${filename} ${date}`;
}
