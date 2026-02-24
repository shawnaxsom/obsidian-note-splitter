#!/bin/bash

# Deploy script for Obsidian Agenda Linker plugin
# Copies the built plugin files to your Obsidian vault

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if config file exists
if [ ! -f .deploy-config ]; then
    echo -e "${RED}Error: .deploy-config file not found${NC}"
    echo "Please copy .deploy-config.example to .deploy-config and configure your path"
    exit 1
fi

# Source the config file
source .deploy-config

# Check if OBSIDIAN_PLUGIN_DIR is set
if [ -z "$OBSIDIAN_PLUGIN_DIR" ]; then
    echo -e "${RED}Error: OBSIDIAN_PLUGIN_DIR is not set in .deploy-config${NC}"
    exit 1
fi

# Check if the required files exist
if [ ! -f main.js ]; then
    echo -e "${RED}Error: main.js not found. Run 'npm run build' first${NC}"
    exit 1
fi

if [ ! -f manifest.json ]; then
    echo -e "${RED}Error: manifest.json not found${NC}"
    exit 1
fi

# Verify main.js has content
if [ ! -s main.js ]; then
    echo -e "${RED}Error: main.js is empty. Build may have failed.${NC}"
    exit 1
fi

# Create the destination directory if it doesn't exist
echo -e "${YELLOW}Preparing plugin directory...${NC}"
mkdir -p "$OBSIDIAN_PLUGIN_DIR"

# Clean up any non-plugin files from the destination
# Only keep main.js, manifest.json, styles.css, and data.json (user settings)
echo -e "${YELLOW}Cleaning plugin directory (keeping user data)...${NC}"
if [ -d "$OBSIDIAN_PLUGIN_DIR" ]; then
    # Save data.json if it exists (contains user settings)
    if [ -f "$OBSIDIAN_PLUGIN_DIR/data.json" ]; then
        cp "$OBSIDIAN_PLUGIN_DIR/data.json" /tmp/obsidian-plugin-data.json.backup
        echo -e "${BLUE}Backed up data.json${NC}"
    fi

    # Remove everything except data.json
    find "$OBSIDIAN_PLUGIN_DIR" -mindepth 1 -maxdepth 1 ! -name 'data.json' -exec rm -rf {} +

    # Restore data.json if it was backed up
    if [ -f /tmp/obsidian-plugin-data.json.backup ]; then
        mv /tmp/obsidian-plugin-data.json.backup "$OBSIDIAN_PLUGIN_DIR/data.json"
        echo -e "${BLUE}Restored data.json${NC}"
    fi
fi

# Array to track copied files
COPIED_FILES=()

# Copy main.js
echo -e "${BLUE}Copying main.js...${NC}"
cp -f main.js "$OBSIDIAN_PLUGIN_DIR/"
if [ $? -eq 0 ]; then
    COPIED_FILES+=("main.js")
else
    echo -e "${RED}Error: Failed to copy main.js${NC}"
    exit 1
fi

# Copy manifest.json
echo -e "${BLUE}Copying manifest.json...${NC}"
cp -f manifest.json "$OBSIDIAN_PLUGIN_DIR/"
if [ $? -eq 0 ]; then
    COPIED_FILES+=("manifest.json")
else
    echo -e "${RED}Error: Failed to copy manifest.json${NC}"
    exit 1
fi

# Copy styles.css if it exists
if [ -f styles.css ]; then
    echo -e "${BLUE}Copying styles.css...${NC}"
    cp -f styles.css "$OBSIDIAN_PLUGIN_DIR/"
    if [ $? -eq 0 ]; then
        COPIED_FILES+=("styles.css")
    fi
fi

# Copy any additional asset files if they exist
for file in *.json; do
    if [ "$file" != "manifest.json" ] && [ "$file" != "package.json" ] && [ "$file" != "package-lock.json" ] && [ "$file" != "tsconfig.json" ]; then
        if [ -f "$file" ]; then
            echo -e "${BLUE}Copying additional file: $file${NC}"
            cp -f "$file" "$OBSIDIAN_PLUGIN_DIR/"
            COPIED_FILES+=("$file")
        fi
    fi
done

# Verify files were copied successfully
echo -e "${YELLOW}Verifying deployment...${NC}"
for file in "${COPIED_FILES[@]}"; do
    if [ -f "$OBSIDIAN_PLUGIN_DIR/$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file (verification failed)${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Copied ${#COPIED_FILES[@]} file(s) to:"
echo "$OBSIDIAN_PLUGIN_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Reload Obsidian (Ctrl/Cmd + R)"
echo "2. Enable the plugin in Settings → Community Plugins"
echo "3. Check Settings → Agenda Linker to configure"
