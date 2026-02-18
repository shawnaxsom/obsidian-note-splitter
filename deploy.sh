#!/bin/bash

# Deploy script for Obsidian Note Splitter plugin
# Copies the built plugin files to your Obsidian vault

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Create the destination directory if it doesn't exist
echo -e "${YELLOW}Creating plugin directory if needed...${NC}"
mkdir -p "$OBSIDIAN_PLUGIN_DIR"

# Copy files
echo -e "${YELLOW}Copying files to $OBSIDIAN_PLUGIN_DIR${NC}"
cp main.js "$OBSIDIAN_PLUGIN_DIR/"
cp manifest.json "$OBSIDIAN_PLUGIN_DIR/"

# Copy styles.css if it exists
if [ -f styles.css ]; then
    cp styles.css "$OBSIDIAN_PLUGIN_DIR/"
    echo -e "${GREEN}✓ Copied: main.js, manifest.json, styles.css${NC}"
else
    echo -e "${GREEN}✓ Copied: main.js, manifest.json${NC}"
fi

echo -e "${GREEN}Deployment complete!${NC}"
echo "Plugin files have been copied to: $OBSIDIAN_PLUGIN_DIR"
