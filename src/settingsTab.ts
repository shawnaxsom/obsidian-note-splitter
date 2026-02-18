import { App, PluginSettingTab, Setting } from 'obsidian';
import NoteSplitterPlugin from './main';

export class NoteSplitterSettingTab extends PluginSettingTab {
	plugin: NoteSplitterPlugin;

	constructor(app: App, plugin: NoteSplitterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Note Splitter Settings' });

		new Setting(containerEl)
			.setName('Your name')
			.setDesc('Your name for detecting one-on-one meeting patterns (e.g., "Jacob / Shawn")')
			.addText(text => text
				.setPlaceholder('Shawn')
				.setValue(this.plugin.settings.userName)
				.onChange(async (value) => {
					this.plugin.settings.userName = value || 'Shawn';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Date format')
			.setDesc('Format for the date appended to filenames')
			.addDropdown(dropdown => dropdown
				.addOption('YYYY-MM-DD', 'YYYY-MM-DD (e.g., 2025-01-15)')
				.addOption('YYYYMMDD', 'YYYYMMDD (e.g., 20250115)')
				.addOption('none', 'No date')
				.setValue(this.plugin.settings.dateFormat)
				.onChange(async (value) => {
					this.plugin.settings.dateFormat = value as 'YYYY-MM-DD' | 'YYYYMMDD' | 'none';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Replacement character')
			.setDesc('Character to replace illegal filename characters with')
			.addText(text => text
				.setPlaceholder('-')
				.setValue(this.plugin.settings.replacementChar)
				.onChange(async (value) => {
					// Ensure single character and not an illegal character itself
					const char = value.charAt(0) || '-';
					if (!/[\[\]#^|*"\\/:?<>|]/.test(char)) {
						this.plugin.settings.replacementChar = char;
						await this.plugin.saveSettings();
					}
				}));

		new Setting(containerEl)
			.setName('Maximum filename length')
			.setDesc('Maximum length for filenames (before date is added)')
			.addSlider(slider => slider
				.setLimits(50, 250, 10)
				.setValue(this.plugin.settings.maxFilenameLength)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxFilenameLength = value;
					await this.plugin.saveSettings();
				}));
	}
}
