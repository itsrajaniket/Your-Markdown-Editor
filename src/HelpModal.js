import React from "react";
import "./App.css";

const HelpModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Markdown Cheat Sheet</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <h3>Basic Syntax</h3>
          <div className="cheat-row">
            <code># Header</code> <span>H1 Header</span>
          </div>
          <div className="cheat-row">
            <code>## Header</code> <span>H2 Header</span>
          </div>
          <div className="cheat-row">
            <code>**Bold**</code> <strong>Bold Text</strong>
          </div>
          <div className="cheat-row">
            <code>_Italic_</code> <em>Italic Text</em>
          </div>
          <div className="cheat-row">
            <code>~~Strike~~</code> <strike>Strikethrough</strike>
          </div>
          <div className="cheat-row">
            <code> Quote</code> <blockquote>Blockquote</blockquote>
          </div>
          <div className="cheat-row">
            <code>- Item</code> <span>List Item</span>
          </div>
          <div className="cheat-row">
            <code>`Code`</code> <code>Inline Code</code>
          </div>

          <h3>Extended Syntax</h3>
          <div className="cheat-row">
            {/* --- FIX IS BELOW: Changed href="#" to a real URL --- */}
            <code>[Link](url)</code>
            <a href="https://example.com" target="_blank" rel="noreferrer">
              Link
            </a>
          </div>
          <div className="cheat-row">
            <code>![Alt](img)</code> <span>Image</span>
          </div>
          <div className="cheat-row">
            <code>```js code ```</code> <span>Code Block</span>
          </div>
          <div className="cheat-row">
            <code>---</code> <span>Horizontal Rule</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
