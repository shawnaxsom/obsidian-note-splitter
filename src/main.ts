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

		// Skip lines containing "headset" (case-insensitive)
		if (trimmed.toLowerCase().includes('headset')) {
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

	splitLinesToNotes(editor: Editor, view: MarkdownView) {
		// Get selected text
		const selection = editor.getSelection();

		if (!selection) {
			new Notice('No text selected');
			return;
		}

		// Get the current filename (without extension) to extract date if present
		const currentFilename = view.file?.basename || '';

		// Split into lines and process
		const lines = selection.split('\n');

		const wikilinks = lines
			.map(line => line.trim())
			.filter(line => !this.shouldSkipLine(line)) // Skip unwanted lines
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
