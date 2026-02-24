# Obsidian Agenda Linker

An Obsidian plugin that transforms selected lines into wikilinks with sanitized, cross-platform filenames and date stamps.

A primary use case is if copying a list of calendar events into a daily note where you would like to create linked notes for each event.

## Features

- **Split Lines into Wikilinks**: Select multiple lines and convert them into `[[wikilink]]` format
- **Filename Sanitization**: Automatically removes illegal filesystem characters (`, `, `:`, `*`, `?`, `"`, `<`, `>`, `|`)
- **Date Stamps**: Appends current date to each filename (configurable format)
- **Smart Filtering**: Automatically filters out noise like timespans, locations, URLs, and lines preceded by filter keywords
- **Configurable Filter Keywords**: Mark lines to skip by adding keywords like "headset" or "focus-time" - useful for filtering calendar focus blocks
- **Cross-Platform**: Works on Windows, macOS, Linux, iOS, and Android
- **Configurable**: Customize date format, replacement character, max filename length, and filter keywords

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

Empty lines and metadata (timespans, locations, URLs) are automatically skipped.

### Filter Keywords

The plugin can filter out lines that follow specific keywords, which is useful for calendar events you don't want to create notes for (like focus time blocks).

**Example with Google Calendar focus time:**

**Before:**
```
11am – 12pm
Billing Frontend
11 – 11:25am
_headset_

Lunch
11:30am – 12pm
UBB CPR Review
2:30 – 2:55pm
Sam / Shawn
5 – 6:20pm
headset
Reliability Review
```

**After:**
```
[[Billing Frontend 2026-02-24]]
[[UBB CPR Review 2026-02-24]]
[[Sam one-on-one 2026-02-24]]
```

Lines containing "headset" (with or without markdown italics `_headset_`) are removed, along with the line immediately following them (or the line after a blank line). This is configurable in settings.

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

1. Download the latest release from the [Releases page](https://github.com/yourusername/obsidian-agenda-linker/releases)
2. Extract the files into your vault's `.obsidian/plugins/agenda-linker/` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Manual Installation

1. Clone this repository or download the source code
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Copy `main.js` and `manifest.json` to your vault's `.obsidian/plugins/agenda-linker/` folder
5. Reload Obsidian
6. Enable the plugin in Settings → Community Plugins

## Settings

Access settings via Settings → Agenda Linker:

- **Your Name**: Your name for detecting one-on-one meeting patterns (e.g., "Jacob / Shawn" becomes "Jacob one-on-one")
- **Date Format**: Choose between `YYYY-MM-DD`, `YYYYMMDD`, or no date
- **Replacement Character**: Character used to replace illegal filename characters (default: `-`)
- **Maximum Filename Length**: Maximum length for filenames before date is added (default: 200)
- **Filter Keywords**: Comma-separated list of keywords that mark lines to be filtered. When a keyword appears on a line, the following line (or line after a blank) will be filtered out. The keyword line itself is also removed. (default: `headset`)

## Development

```bash
# Install dependencies
npm install

# Build in watch mode (auto-rebuilds on file changes)
npm run dev

# Build for production
npm run build
```

### Deployment

To deploy the plugin to your Obsidian vault:

1. Copy `.deploy-config.example` to `.deploy-config`:
   ```bash
   cp .deploy-config.example .deploy-config
   ```

2. Edit `.deploy-config` and set your plugin directory path:
   ```bash
   OBSIDIAN_PLUGIN_DIR="/path/to/vault/.obsidian/plugins/agenda-linker"
   ```

3. Build and deploy:
   ```bash
   npm run build && ./deploy.sh
   ```

The deployment script will:
- Clean the plugin directory (keeping user settings in `data.json`)
- Copy only the necessary files (`main.js`, `manifest.json`, and `styles.css` if present)
- Verify the deployment was successful

## Testing

To test the plugin during development:

1. Configure your deployment as described above
2. Build and deploy with `npm run build && ./deploy.sh`
3. Reload Obsidian (Ctrl/Cmd + R)
4. Enable the plugin in Settings → Community Plugins

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
