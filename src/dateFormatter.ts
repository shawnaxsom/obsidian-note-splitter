export function formatDate(format: 'YYYY-MM-DD' | 'YYYYMMDD'): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');

	if (format === 'YYYY-MM-DD') {
		return `${year}-${month}-${day}`;
	} else {
		return `${year}${month}${day}`;
	}
}

export function appendDateToFilename(filename: string, dateFormat: 'YYYY-MM-DD' | 'YYYYMMDD'): string {
	const date = formatDate(dateFormat);
	return `${filename} ${date}`;
}
