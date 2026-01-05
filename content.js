(function() {
  'use strict';

  // Configure marked with GFM options
  marked.setOptions({
    gfm: true,
    breaks: true,
    tables: true
  });

  const PROCESSED_ATTR = 'data-md-processed';
  const ORIGINAL_ATTR = 'data-md-original';
  const CONTAINER_CLASS = 'md-container';
  const RENDERED_CLASS = 'md-rendered';
  const RAW_CLASS = 'md-raw';
  const TOOLBAR_CLASS = 'md-toolbar';

  // Simple heuristic to detect if content looks like markdown
  function looksLikeMarkdown(text) {
    const patterns = [
      /^#{1,6}\s+\S/m,           // Headers
      /\*\*[^*]+\*\*/,           // Bold
      /\*[^*]+\*/,               // Italic
      /`[^`]+`/,                 // Inline code
      /^\s*[-*+]\s+\S/m,         // Unordered lists
      /^\s*\d+\.\s+\S/m,         // Ordered lists
      /\[.+\]\(.+\)/,            // Links
      /^\s*>\s+\S/m,             // Blockquotes
      /^\s*```/m,                // Code blocks
      /\|.+\|/,                  // Tables
      /^\s*-\s*\[\s*[xX ]?\s*\]/m // Task lists
    ];

    let matchCount = 0;
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        matchCount++;
        if (matchCount >= 2) return true;
      }
    }
    return matchCount >= 1;
  }

  // Copy text to clipboard
  function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(function() {
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('md-btn-success');
      setTimeout(function() {
        button.textContent = originalText;
        button.classList.remove('md-btn-success');
      }, 1500);
    });
  }

  // Minimum lines to show bottom toolbar
  const MIN_LINES_FOR_BOTTOM_TOOLBAR = 15;

  // Create a toolbar element
  function createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = TOOLBAR_CLASS;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'md-btn md-btn-toggle';
    toggleBtn.textContent = 'Raw';
    toggleBtn.type = 'button';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'md-btn md-btn-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.type = 'button';

    toolbar.appendChild(toggleBtn);
    toolbar.appendChild(copyBtn);

    return toolbar;
  }

  // Render markdown in a pre element
  function renderMarkdown(preElement) {
    if (preElement.getAttribute(PROCESSED_ATTR)) return;

    // Skip pre elements inside trix-editor (edit mode)
    if (preElement.closest('trix-editor')) return;

    const originalContent = preElement.textContent;

    if (!looksLikeMarkdown(originalContent)) return;

    // Store original content
    preElement.setAttribute(ORIGINAL_ATTR, originalContent);
    preElement.setAttribute(PROCESSED_ATTR, 'true');

    // Check if content is long enough for bottom toolbar
    const lineCount = originalContent.split('\n').length;
    const showBottomToolbar = lineCount >= MIN_LINES_FOR_BOTTOM_TOOLBAR;

    // Create container
    const container = document.createElement('div');
    container.className = CONTAINER_CLASS;

    // Create top toolbar
    const topToolbar = createToolbar();

    // Create wrapper for rendered content
    const wrapper = document.createElement('div');
    wrapper.className = RENDERED_CLASS;
    wrapper.innerHTML = marked.parse(originalContent);

    // Apply syntax highlighting to code blocks
    wrapper.querySelectorAll('pre code').forEach(function(block) {
      hljs.highlightElement(block);
    });

    // Assemble container
    container.appendChild(topToolbar);
    container.appendChild(wrapper);

    // Hide the original pre and insert container
    preElement.style.display = 'none';
    preElement.classList.add(RAW_CLASS);
    preElement.parentNode.insertBefore(container, preElement.nextSibling);

    // Move the pre inside the container (for toggling)
    container.appendChild(preElement);

    // Create bottom toolbar if content is long (after pre so it stays at bottom)
    let bottomToolbar = null;
    if (showBottomToolbar) {
      bottomToolbar = createToolbar();
      container.appendChild(bottomToolbar);
    }

    // Track state
    let showingRaw = false;

    // Get all toggle and copy buttons
    const toggleBtns = container.querySelectorAll('.md-btn-toggle');
    const copyBtns = container.querySelectorAll('.md-btn-copy');

    // Toggle button handler
    function handleToggle() {
      showingRaw = !showingRaw;

      if (showingRaw) {
        wrapper.style.display = 'none';
        preElement.style.display = '';
        toggleBtns.forEach(function(btn) { btn.textContent = 'Preview'; });
      } else {
        wrapper.style.display = '';
        preElement.style.display = 'none';
        toggleBtns.forEach(function(btn) { btn.textContent = 'Raw'; });
      }
    }

    // Copy button handler
    function handleCopy(btn) {
      copyToClipboard(originalContent, btn);
    }

    // Attach handlers to all buttons
    toggleBtns.forEach(function(btn) {
      btn.addEventListener('click', handleToggle);
    });

    copyBtns.forEach(function(btn) {
      btn.addEventListener('click', function() { handleCopy(btn); });
    });
  }

  // Process all pre elements on the page
  function processAllPres() {
    const preElements = document.querySelectorAll('pre:not([' + PROCESSED_ATTR + '])');
    preElements.forEach(renderMarkdown);
  }

  // Set up MutationObserver for dynamic content
  function setupObserver() {
    let debounceTimer = null;

    const observer = new MutationObserver(function(mutations) {
      // Debounce to avoid excessive processing
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        processAllPres();
      }, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Set up Turbo/Hotwire event listeners
  function setupTurboListeners() {
    // Turbo Drive events
    document.addEventListener('turbo:load', processAllPres);
    document.addEventListener('turbo:render', processAllPres);

    // Turbo Frames
    document.addEventListener('turbo:frame-load', processAllPres);
    document.addEventListener('turbo:frame-render', processAllPres);

    // Turbo Streams
    document.addEventListener('turbo:before-stream-render', function() {
      setTimeout(processAllPres, 50);
    });
  }

  // Initialize
  function init() {
    processAllPres();
    setupObserver();
    setupTurboListeners();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
