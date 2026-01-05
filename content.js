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
  const RENDERED_CLASS = 'md-rendered';
  const RAW_CLASS = 'md-raw';

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

    // Create wrapper for rendered content
    const wrapper = document.createElement('div');
    wrapper.className = RENDERED_CLASS;
    wrapper.innerHTML = marked.parse(originalContent);
    wrapper.title = 'Click to toggle raw markdown';

    // Apply syntax highlighting to code blocks
    wrapper.querySelectorAll('pre code').forEach(function(block) {
      hljs.highlightElement(block);
    });

    // Hide the original pre and insert rendered content
    preElement.style.display = 'none';
    preElement.classList.add(RAW_CLASS);
    preElement.parentNode.insertBefore(wrapper, preElement.nextSibling);

    // Add click handler for toggling
    wrapper.addEventListener('click', function(e) {
      // Don't toggle if clicking on a link
      if (e.target.tagName === 'A') return;

      toggleMarkdown(preElement, wrapper);
    });

    preElement.addEventListener('click', function() {
      toggleMarkdown(preElement, wrapper);
    });
  }

  // Toggle between rendered and raw markdown
  function toggleMarkdown(preElement, wrapper) {
    const isShowingRaw = preElement.style.display !== 'none';

    if (isShowingRaw) {
      // Show rendered
      preElement.style.display = 'none';
      wrapper.style.display = 'block';
    } else {
      // Show raw
      preElement.style.display = '';
      wrapper.style.display = 'none';
    }
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

  // Initialize
  function init() {
    processAllPres();
    setupObserver();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
