# Basecamp Markdown Renderer

A Chrome extension that renders markdown content inside Basecamp code blocks as formatted HTML.

Since Basecamp doesn't natively support markdown, this extension lets you write markdown in code blocks (using the Trix editor's preformatted text) and have it rendered as properly formatted content.

## Features

- **Auto-detection**: Automatically finds and renders markdown in `<pre>` tags
- **Click to toggle**: Click rendered content to see raw markdown, click again to re-render
- **Dark mode support**: Respects system dark/light mode preferences
- **Extended markdown**: Supports GitHub Flavored Markdown including:
  - Headers
  - Bold, italic, strikethrough
  - Links and images
  - Ordered and unordered lists
  - Task lists (checkboxes)
  - Code blocks and inline code
  - Blockquotes
  - Tables
  - Horizontal rules

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `basecamp-markdown` folder

### From Chrome Web Store

Coming soon.

## Usage

1. In Basecamp, create a code block (preformatted text) using the Trix editor
2. Paste or type your markdown content inside the code block
3. The extension will automatically render it as formatted HTML
4. Click on the rendered content to toggle back to raw markdown view

## Example

Write this in a Basecamp code block:

```markdown
# Project Update

## Completed Tasks
- [x] Design review
- [x] API implementation
- [ ] Testing

## Notes
This is **important** and needs to be done *soon*.

| Task | Status |
|------|--------|
| Design | Done |
| Dev | In Progress |
```

And it will be rendered as properly formatted HTML with headers, task lists, and tables.

## How It Works

The extension:
1. Scans Basecamp pages for `<pre>` elements (code blocks from Trix editor)
2. Detects content that looks like markdown
3. Renders it using [marked.js](https://github.com/markedjs/marked)
4. Uses a MutationObserver to handle dynamically loaded content

## Browser Support

- Google Chrome
- Brave
- Microsoft Edge (Chromium-based)
- Other Chromium-based browsers

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
