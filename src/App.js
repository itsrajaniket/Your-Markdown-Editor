import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import Prism from "prismjs";
import DOMPurify from "dompurify";

// Import Prism CSS theme
import "prismjs/themes/prism-tomorrow.css";
import "./App.css";
import { defaultText } from "./defaultMarkdown";

// Configure marked options
marked.setOptions({
  breaks: true, // specific to GitHub Flavored Markdown
  gfm: true,
});

// Version control for your default text
const CURRENT_VERSION = "v1.0";

const App = () => {
  // ------------------------------------------------------
  // 1. STATE & REFS
  // ------------------------------------------------------

  // Initialize state with Version Check
  const [content, setContent] = useState(() => {
    const savedVersion = localStorage.getItem("app-version");
    const savedContent = localStorage.getItem("markdown-content");

    // If version changed, load new default text
    if (savedVersion !== CURRENT_VERSION) {
      localStorage.setItem("app-version", CURRENT_VERSION);
      return defaultText;
    }

    return savedContent || defaultText;
  });

  // Refs for Scroll Synchronization and Cursor placement
  const textAreaRef = useRef(null);
  const previewRef = useRef(null);

  // ------------------------------------------------------
  // 2. EFFECTS
  // ------------------------------------------------------

  useEffect(() => {
    // Save to local storage
    localStorage.setItem("markdown-content", content);

    // Highlight code blocks
    Prism.highlightAll();
  }, [content]);

  // ------------------------------------------------------
  // 3. HANDLERS
  // ------------------------------------------------------

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  // Synchronized Scrolling: Editor -> Preview
  const handleScroll = () => {
    const editor = textAreaRef.current;
    const preview = previewRef.current;

    if (editor && preview) {
      // Calculate percentage scrolled
      const scrollPercentage =
        editor.scrollTop / (editor.scrollHeight - editor.clientHeight);

      // Apply percentage to preview
      preview.scrollTop =
        scrollPercentage * (preview.scrollHeight - preview.clientHeight);
    }
  };

  // Formatting Toolbar Logic
  const insertMarkdown = (prefix, suffix) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;

    const before = text.substring(0, start);
    const select = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + select + suffix + after;
    setContent(newText);

    // Reset cursor and focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Download .md file
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "readme.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Copy HTML to Clipboard
  const copyHtml = () => {
    const rawMarkup = marked(content);
    navigator.clipboard.writeText(rawMarkup).then(() => {
      alert("HTML copied to clipboard!");
    });
  };

  // Reset to Default
  const resetEditor = () => {
    if (window.confirm("Are you sure? This will delete your current text.")) {
      setContent(defaultText);
    }
  };

  // Safe HTML Generation
  const getMarkdownText = () => {
    const rawMarkup = marked(content);
    const cleanMarkup = DOMPurify.sanitize(rawMarkup);
    return { __html: cleanMarkup };
  };

  // ------------------------------------------------------
  // 4. RENDER
  // ------------------------------------------------------

  return (
    <div className="app-container">
      {/* Header */}
      <header className="main-header">
        <h1>Markdown Studio</h1>
        <div className="header-actions">
          <button onClick={resetEditor} className="btn btn-danger">
            Reset
          </button>
          <button onClick={handleDownload} className="btn btn-primary">
            Download .md
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="editor-container">
        {/* LEFT PANE: EDITOR */}
        <section className="pane editor-pane">
          <div className="toolbar">
            <button onClick={() => insertMarkdown("**", "**")} title="Bold">
              B
            </button>
            <button onClick={() => insertMarkdown("_", "_")} title="Italic">
              I
            </button>
            <button
              onClick={() => insertMarkdown("~~", "~~")}
              title="Strikethrough"
            >
              S
            </button>
            <span className="separator">|</span>
            <button onClick={() => insertMarkdown("# ", "")} title="Heading 1">
              H1
            </button>
            <button onClick={() => insertMarkdown("## ", "")} title="Heading 2">
              H2
            </button>
            <span className="separator">|</span>
            <button
              onClick={() => insertMarkdown("`", "`")}
              title="Inline Code"
            >
              &lt;/&gt;
            </button>
            <button
              onClick={() => insertMarkdown("```\n", "\n```")}
              title="Code Block"
            >{`{ }`}</button>
            <span className="separator">|</span>
            <button onClick={() => insertMarkdown("- ", "")} title="List">
              • List
            </button>
            <button onClick={() => insertMarkdown("> ", "")} title="Quote">
              “ Quote
            </button>
          </div>

          <textarea
            ref={textAreaRef}
            id="editor"
            value={content}
            onChange={handleChange}
            onScroll={handleScroll}
            placeholder="Type your markdown here..."
          />
        </section>

        {/* RIGHT PANE: PREVIEW */}
        <section className="pane preview-pane">
          <div className="toolbar preview-toolbar">
            <span>Preview</span>
            <button onClick={copyHtml} className="btn-small">
              Copy HTML
            </button>
          </div>

          <div
            ref={previewRef}
            id="preview"
            dangerouslySetInnerHTML={getMarkdownText()}
          />
        </section>
      </main>
    </div>
  );
};

export default App;
