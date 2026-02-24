import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { AgendaLinkerSettings, DEFAULT_SETTINGS } from './settings';
import { AgendaLinkerSettingTab } from './settingsTab';
import { sanitizeFilename } from './filenameSanitizer';
import { appendDateToFilename } from './dateFormatter';
import { processOneOnOneLine } from './oneOnOneProcessor';
import { combineEvents } from './eventCombiner';

export default class AgendaLinkerPlugin extends Plugin {
	settings: AgendaLinkerSettings;

	async onload() {
		await this.loadSettings();

		// Register main command
		this.addCommand({
			id: 'split-lines-to-notes',
			name: 'Split selected lines into linked notes',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.splitLinesToNotes(editor, view);
			}
		});

		// Add settings tab
		this.addSettingTab(new AgendaLinkerSettingTab(this.app, this));
	}

	onunload() {
		// Cleanup if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Checks if a line should be skipped based on content patterns
	 */
	shouldSkipLine(line: string): boolean {
		const trimmed = line.trim();

		// Skip empty lines
		if (trimmed.length === 0) {
			return true;
		}

		// Skip "All day" lines
		if (trimmed.toLowerCase() === 'all day') {
			return true;
		}

		// Skip lines that are timespan patterns like "7 – 8:05am" or "9:00 - 10:30pm"
		// Matches patterns: digit(s) optional:digit(s) optional(am/pm) separator digit(s) optional:digit(s) optional(am/pm)
		const timespanPattern = /^\d{1,2}(:\d{2})?\s*(am|pm)?\s*[–\-]\s*\d{1,2}(:\d{2})?\s*(am|pm)?$/i;
		if (timespanPattern.test(trimmed)) {
			return true;
		}

		// Skip lines that are location patterns like "Phoenix, AZ" or "City Name, ST"
		// Matches: word(s), space, 2 capital letters
		const locationPattern = /^[\w\s]+,\s+[A-Z]{2}$/;
		if (locationPattern.test(trimmed)) {
			return true;
		}

		// Skip lines that contain URLs (http:// or https://)
		const urlPattern = /https?:\/\//;
		if (urlPattern.test(trimmed)) {
			return true;
		}

		return false;
	}

	/**
	 * Checks if a line contains any filter keyword (with or without markdown formatting)
	 */
	containsFilterKeyword(line: string): boolean {
		const trimmed = line.trim().toLowerCase();

		// Get keywords from settings
		const keywords = this.settings.filterKeywords
			.split(',')
			.map(k => k.trim().toLowerCase())
			.filter(k => k.length > 0);

		// Check if line contains any keyword (with or without underscores for markdown italics)
		return keywords.some(keyword => {
			// Remove markdown formatting (underscores) from the line for comparison
			const lineWithoutFormatting = trimmed.replace(/_/g, '');
			return lineWithoutFormatting.includes(keyword);
		});
	}

	/**
	 * Filters lines based on context, including lines that come after filter keywords
	 */
	filterLinesWithContext(lines: string[]): string[] {
		const result: string[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			// Skip if line matches basic skip patterns
			if (this.shouldSkipLine(line)) {
				continue;
			}

			// Skip if line contains a filter keyword
			if (this.containsFilterKeyword(line)) {
				continue;
			}

			// Check if previous line (i-1) contains a filter keyword
			// If so, skip this line
			if (i > 0 && this.containsFilterKeyword(lines[i - 1])) {
				continue;
			}

			// Check if line 2 positions back (i-2) contains a filter keyword
			// AND the previous line (i-1) is empty/blank
			// If so, skip this line (handles the blank line case)
			if (i > 1) {
				const prevLine = lines[i - 1].trim();
				const twoLinesBack = lines[i - 2];
				if (prevLine.length === 0 && this.containsFilterKeyword(twoLinesBack)) {
					continue;
				}
			}

			// Line passes all filters, include it
			result.push(line);
		}

		return result;
	}

	splitLinesToNotes(editor: Editor, view: MarkdownView) {
		// Get selected text
		const selection = editor.getSelection();

		if (!selection) {
			new Notice('No text selected');
			return;
		}

		// Get the current filename (without extension) to extract date if present
		const currentFilename = view.file?.basename || '';

		// Split into lines and filter with context
		const lines = selection.split('\n');
		const filteredLines = this.filterLinesWithContext(lines);

		const wikilinks = filteredLines
			.map(line => {
				// Process one-on-one patterns first
				let processedLine = processOneOnOneLine(line, this.settings.userName);

				// Sanitize the filename
				let filename = sanitizeFilename(processedLine, this.settings);

				// Add date if enabled
				if (this.settings.dateFormat !== 'none') {
					filename = appendDateToFilename(filename, this.settings.dateFormat, currentFilename);
				}

				// Create wikilink
				return `[[${filename}]]`;
			});

		// Check if any valid links were created
		if (wikilinks.length === 0) {
			new Notice('No valid lines to convert');
			return;
		}

		// Combine events for the same person and date
		const combined = combineEvents(wikilinks);

		// Join wikilinks with newlines
		const result = combined.join('\n');

		// Replace the selection
		editor.replaceSelection(result);

		// Show success notice
		new Notice(`Created ${combined.length} note link${combined.length === 1 ? '' : 's'}`);
	}
}
