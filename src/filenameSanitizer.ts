import { AgendaLinkerSettings } from './settings';

/**
 * Sanitizes a string to be a valid cross-platform filename
 * Removes or replaces illegal characters: [\]#^|*"\\/:?<>|
 */
export function sanitizeFilename(text: string, settings: AgendaLinkerSettings): string {
	// Trim whitespace
	let sanitized = text.trim();

	// Remove existing wikilink brackets if present
	sanitized = sanitized.replace(/^\[\[/, '').replace(/\]\]$/, '');

	// Replace illegal characters with the replacement character
	// Characters illegal on various platforms: [\]#^|*"\\/:?<>|
	const illegalChars = /[\[\]#^|*"\\/:?<>|]/g;
	sanitized = sanitized.replace(illegalChars, settings.replacementChar);

	// Collapse multiple consecutive replacement characters into single character
	const multipleReplacementChars = new RegExp(`\\${settings.replacementChar}{2,}`, 'g');
	sanitized = sanitized.replace(multipleReplacementChars, settings.replacementChar);

	// Remove leading and trailing dots and spaces (Windows doesn't allow these)
	sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');

	// Remove leading and trailing replacement characters
	const leadingTrailingReplacement = new RegExp(`^\\${settings.replacementChar}+|\\${settings.replacementChar}+$`, 'g');
	sanitized = sanitized.replace(leadingTrailingReplacement, '');

	// If result is empty, use default
	if (!sanitized) {
		return 'untitled';
	}

	// Truncate to max length
	if (sanitized.length > settings.maxFilenameLength) {
		sanitized = sanitized.substring(0, settings.maxFilenameLength);
		// Remove trailing replacement character if truncation created one
		sanitized = sanitized.replace(new RegExp(`\\${settings.replacementChar}+$`), '');
	}

	return sanitized;
}
