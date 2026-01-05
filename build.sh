#!/bin/bash

# Build script for Basecamp Markdown Renderer Chrome Extension

VERSION=$(grep '"version"' manifest.json | sed 's/.*: "\(.*\)".*/\1/')
FILENAME="basecamp-markdown-v${VERSION}.zip"

# Remove old build if exists
rm -f "$FILENAME"

# Create zip with only essential files
zip -r "$FILENAME" \
  manifest.json \
  content.js \
  styles.css \
  lib/ \
  icons/ \
  -x "*.DS_Store"

echo "Built: $FILENAME"
echo "Ready to upload to Chrome Web Store"
