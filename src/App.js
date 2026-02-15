import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import Prism from "prismjs";
import DOMPurify from "dompurify";
import { saveAs } from "file-saver";
import htmlDocx from "html-docx-js/dist/html-docx";

import HelpModal from "./HelpModal";
import "prismjs/themes/prism-tomorrow.css";
import "./App.css";
import { defaultText } from "./defaultMarkdown";

marked.setOptions({ breaks: true, gfm: true });

const CURRENT_VERSION = "v1.0";

const App = () => {
  // ------------------------------------------------------
  // 1. STATE & REFS
  // ------------------------------------------------------
  const [showHelp, setShowHelp] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
  const fileInputRef = useRef(null); // <--- NEW: Ref for the hidden file input

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

  // --- Drag & Drop Logic ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    readFile(file);
  };

  // --- NEW: File Picker Logic ---
  const triggerFileSelect = () => {
    fileInputRef.current.click(); // Triggers the hidden input
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    readFile(file);
  };

  // Shared function to read files (used by both Drop and Picker)
  const readFile = (file) => {
    if (
      file &&
      (file.name.endsWith(".md") ||
        file.name.endsWith(".txt") ||
        file.type === "text/plain")
    ) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(event.target.result);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid Markdown (.md) or Text (.txt) file.");
    }
  };

  // --- Exports ---
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "readme.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadDoc = () => {
    const htmlString = marked(content);
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${htmlString}</body></html>`;
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
    navigator.clipboard.writeText(rawMarkup).then(() => alert("HTML copied!"));
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
          {/* --- NEW: Hidden Input + Visible Button --- */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".md,.txt"
            onChange={handleFileSelect}
          />
          <button
            onClick={triggerFileSelect}
            className="btn"
            style={{
              backgroundColor: "#e67e22",
              color: "white",
              marginRight: "5px",
            }}
            title="Open File"
          >
            Upload your file
          </button>
          {/* ------------------------------------------- */}

          <button
            onClick={() => setShowHelp(true)}
            className="btn"
            style={{ color: "black", fontSize: "0.9rem", marginRight: "10px" }}
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
          >
            Word
          </button>
          <button onClick={handleDownload} className="btn btn-primary">
            MD
          </button>
        </div>
      </header>

      <main className="editor-container">
        <section
          className={`pane editor-pane ${isDragging ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="toolbar">
            <button onClick={() => insertMarkdown("**", "**")}>B</button>
            <button onClick={() => insertMarkdown("_", "_")}>I</button>
            <button onClick={() => insertMarkdown("~~", "~~")}>S</button>
            <span className="separator">|</span>
            <button onClick={() => insertMarkdown("# ", "")}>H1</button>
            <button onClick={() => insertMarkdown("## ", "")}>H2</button>
            <span className="separator">|</span>
            <button onClick={() => insertMarkdown("`", "`")}>&lt;/&gt;</button>
            <button
              onClick={() => insertMarkdown("```\n", "\n```")}
            >{`{ }`}</button>
            <span className="separator">|</span>
            <button onClick={() => insertMarkdown("- ", "")}>• List</button>
            <button onClick={() => insertMarkdown("> ", "")}>“ Quote</button>
          </div>

          <textarea
            ref={textAreaRef}
            id="editor"
            value={content}
            onChange={handleChange}
            onScroll={handleScroll}
            placeholder="Type your markdown here, or drag & drop a file..."
          />
        </section>

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

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default App;
