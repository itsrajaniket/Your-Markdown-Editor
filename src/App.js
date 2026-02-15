import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import Prism from "prismjs";
import DOMPurify from "dompurify";
import { saveAs } from "file-saver";
import htmlDocx from "html-docx-js/dist/html-docx"; // <--- FIX 1: Import the whole object

// Import Components and Styles
import HelpModal from "./HelpModal";
import "prismjs/themes/prism-tomorrow.css";
import "./App.css";
import { defaultText } from "./defaultMarkdown";

// Configure marked options
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

  const [showHelp, setShowHelp] = useState(false);

  const [content, setContent] = useState(() => {
    const savedVersion = localStorage.getItem("app-version");
    const savedContent = localStorage.getItem("markdown-content");

    if (savedVersion !== CURRENT_VERSION) {
      localStorage.setItem("app-version", CURRENT_VERSION);
      return defaultText;
    }
    return savedContent || defaultText;
  });

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

  // Insert Formatting
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

  // Download .md File
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "readme.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // NEW: Download .docx (Word) File
  const handleDownloadDoc = () => {
    const htmlString = marked(content);

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; }
            h1 { font-size: 24pt; color: #2E74B5; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            h2 { font-size: 18pt; color: #2E74B5; margin-top: 20px; }
            h3 { font-size: 14pt; color: #1f4e79; }
            code { font-family: 'Consolas', monospace; background: #e0e0e0; color: #d63384; padding: 2px 4px; border-radius: 3px; }
            pre { background: #f0f0f0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #666; font-style: italic; }
            table { border-collapse: collapse; width: 100%; margin: 15px 0; }
            th { background-color: #f2f2f2; font-weight: bold; text-align: left; }
            th, td { border: 1px solid #ccc; padding: 8px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${htmlString}
        </body>
      </html>
    `;

    // FIX 2: Call asBlob from the imported object
    const converted = htmlDocx.asBlob(fullHtml, {
      orientation: "portrait",
      margins: { top: 720 },
    });

    saveAs(converted, "document.docx");
  };

  const resetEditor = () => {
    if (window.confirm("Are you sure? This will delete your current text.")) {
      setContent(defaultText);
    }
  };

  const copyHtml = () => {
    const rawMarkup = marked(content);
    navigator.clipboard.writeText(rawMarkup).then(() => {
      alert("HTML copied to clipboard!");
    });
  };

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
      <header className="main-header">
        <h1>Markdown Studio</h1>
        <div className="header-actions">
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

          <button
            onClick={handleDownloadDoc}
            className="btn"
            style={{ backgroundColor: "#2b5797", color: "white" }}
            title="Download as Word Document"
          >
            Word
          </button>

          <button onClick={handleDownload} className="btn btn-primary">
            MD
          </button>
        </div>
      </header>

      <main className="editor-container">
        {/* EDITOR PANE */}
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

        {/* PREVIEW PANE */}
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

      {/* Cheat Sheet Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default App;
