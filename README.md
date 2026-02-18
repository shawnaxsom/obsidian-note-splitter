# Obsidian Note Splitter

An Obsidian plugin that transforms selected lines into wikilinks with sanitized, cross-platform filenames and date stamps.

## Features

- **Split Lines into Wikilinks**: Select multiple lines and convert them into `[[wikilink]]` format
- **Filename Sanitization**: Automatically removes illegal filesystem characters (`, `, `:`, `*`, `?`, `"`, `<`, `>`, `|`)
- **Date Stamps**: Appends current date to each filename (configurable format)
- **Cross-Platform**: Works on Windows, macOS, Linux, iOS, and Android
- **Configurable**: Customize date format, replacement character, and max filename length

## Usage

1. Select multiple lines of text in your note
2. Open the command palette (Ctrl/Cmd + P)
3. Search for "Split selected lines into linked notes"
4. Press Enter

The selected lines will be replaced with wikilinks. For example:

**Before:**
```
Task One
Task Two
Task Three
```

**After:**
```
[[Task One 2025-01-15]]
[[Task Two 2025-01-15]]
[[Task Three 2025-01-15]]
```

Empty lines are automatically skipped.

### Character Sanitization

The plugin automatically sanitizes filenames by replacing illegal characters:

**Before:**
```
My/File
What?
Note:Test
```

**After:**
```
[[My-File 2025-01-15]]
[[What- 2025-01-15]]
[[Note-Test 2025-01-15]]
```

## Installation

### From GitHub Releases (Recommended)

1. Download the latest release from the [Releases page](https://github.com/yourusername/obsidian-note-splitter/releases)
2. Extract the files into your vault's `.obsidian/plugins/note-splitter/` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Manual Installation

1. Clone this repository or download the source code
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Copy `main.js` and `manifest.json` to your vault's `.obsidian/plugins/note-splitter/` folder
5. Reload Obsidian
6. Enable the plugin in Settings → Community Plugins

## Settings

Access settings via Settings → Note Splitter:

- **Date Format**: Choose between `YYYY-MM-DD`, `YYYYMMDD`, or no date
- **Replacement Character**: Character used to replace illegal filename characters (default: `-`)
- **Maximum Filename Length**: Maximum length for filenames before date is added (default: 200)

## Development

```bash
# Install dependencies
npm install

# Build in watch mode (auto-rebuilds on file changes)
npm run dev

# Build for production
npm run build
```

## Testing

To test the plugin during development:

1. Build the plugin with `npm run dev` or `npm run build`
2. Create a symbolic link from your vault's plugins folder to this repository:
   ```bash
   ln -s /path/to/obsidian-note-splitter /path/to/vault/.obsidian/plugins/note-splitter
   ```
3. Reload Obsidian and enable the plugin

### Test Cases

- **Basic functionality**: Select 3 lines and verify they become wikilinks
- **Character sanitization**: Test with special characters like `/`, `?`, `:`, `*`
- **Empty lines**: Verify empty lines are skipped
- **Long lines**: Test with 300+ character lines (should be truncated)
- **Settings**: Change date format and verify it applies

## License

MIT

## Credits

Built with the [Obsidian Plugin Template](https://github.com/obsidianmd/obsidian-sample-plugin)
