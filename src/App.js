import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import Prism from "prismjs";
import DOMPurify from "dompurify";

// Import Components and Styles
import HelpModal from "./HelpModal"; // <--- New Import
import "prismjs/themes/prism-tomorrow.css";
import "./App.css";
import { defaultText } from "./defaultMarkdown";

// Configure marked options.
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Version control for default text
const CURRENT_VERSION = "v1.0";

const App = () => {
  // ------------------------------------------------------
  // 1. STATE & REFS
  // ------------------------------------------------------

  // App State
  const [showHelp, setShowHelp] = useState(false); // <--- New State for Modal

  // Content State (Load from LocalStorage)
  const [content, setContent] = useState(() => {
    const savedVersion = localStorage.getItem("app-version");
    const savedContent = localStorage.getItem("markdown-content");

    if (savedVersion !== CURRENT_VERSION) {
      localStorage.setItem("app-version", CURRENT_VERSION);
      return defaultText;
    }
    return savedContent || defaultText;
  });

  // Refs for Scrolling & Cursor
  const textAreaRef = useRef(null);
  const previewRef = useRef(null);

  // ------------------------------------------------------
  // 2. EFFECTS
  // ------------------------------------------------------

  useEffect(() => {
    localStorage.setItem("markdown-content", content);
    Prism.highlightAll();
  }, [content]);

  // ------------------------------------------------------
  // 3. HANDLERS
  // ------------------------------------------------------

  const handleChange = (e) => setContent(e.target.value);

  // Synchronized Scrolling
  const handleScroll = () => {
    const editor = textAreaRef.current;
    const preview = previewRef.current;
    if (editor && preview) {
      const scrollPercentage =
        editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      preview.scrollTop =
        scrollPercentage * (preview.scrollHeight - preview.clientHeight);
    }
  };

  // Insert Formatting (Bold, Italic, etc.)
  const insertMarkdown = (prefix, suffix) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;

    const before = text.substring(0, start);
    const select = text.substring(start, end);
    const after = text.substring(end);

    setContent(before + prefix + select + suffix + after);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Download File
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "readme.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Reset Editor
  const resetEditor = () => {
    if (window.confirm("Are you sure? This will delete your current text.")) {
      setContent(defaultText);
    }
  };

  // Copy HTML
  const copyHtml = () => {
    const rawMarkup = marked(content);
    navigator.clipboard.writeText(rawMarkup).then(() => {
      alert("HTML copied to clipboard!");
    });
  };

  // Convert to HTML safely
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
          {/* Help Button */}
          <button
            onClick={() => setShowHelp(true)}
            className="btn"
            style={{ color: "#aaa", fontSize: "1.2rem", marginRight: "10px" }}
            title="Cheat Sheet"
          >
            ?
          </button>

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

      {/* Render Modal if 'showHelp' is true */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default App;
