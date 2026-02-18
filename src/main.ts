import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { NoteSplitterSettings, DEFAULT_SETTINGS } from './settings';
import { NoteSplitterSettingTab } from './settingsTab';
import { sanitizeFilename } from './filenameSanitizer';
import { appendDateToFilename } from './dateFormatter';

export default class NoteSplitterPlugin extends Plugin {
	settings: NoteSplitterSettings;

	async onload() {
		await this.loadSettings();

		// Register main command
		this.addCommand({
			id: 'split-lines-to-notes',
			name: 'Split selected lines into linked notes',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.splitLinesToNotes(editor);
			}
		});

		// Add settings tab
		this.addSettingTab(new NoteSplitterSettingTab(this.app, this));
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

	splitLinesToNotes(editor: Editor) {
		// Get selected text
		const selection = editor.getSelection();

		if (!selection) {
			new Notice('No text selected');
			return;
		}

		// Split into lines and process
		const lines = selection.split('\n');

		const wikilinks = lines
			.map(line => line.trim())
			.filter(line => line.length > 0) // Skip empty lines
			.map(line => {
				// Sanitize the filename
				let filename = sanitizeFilename(line, this.settings);

				// Add date if enabled
				if (this.settings.dateFormat !== 'none') {
					filename = appendDateToFilename(filename, this.settings.dateFormat);
				}

				// Create wikilink
				return `[[${filename}]]`;
			});

		// Check if any valid links were created
		if (wikilinks.length === 0) {
			new Notice('No valid lines to convert');
			return;
		}

		// Join wikilinks with newlines
		const result = wikilinks.join('\n');

		// Replace the selection
		editor.replaceSelection(result);

		// Show success notice
		new Notice(`Created ${wikilinks.length} note link${wikilinks.length === 1 ? '' : 's'}`);
	}
}
