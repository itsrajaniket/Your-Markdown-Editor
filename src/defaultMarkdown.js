export const defaultText = `
# Welcome to Your Markdown Editor!

This is a live demo. **Change anything on the left**, and see it appear on the right. 

---

## 1. Text Formatting
It's easy to make text look different:
- **Bold**: Wrap text in double asterisks like \`**this**\`.
- _Italic_: Wrap text in underscores like \`_this_\`.
- ~~Strikethrough~~: Wrap text in double tildes like \`~~this~~\`.
- **_Mixed_**: You can combine them!

## 2. Headings
Add \`#\` symbols at the start of a line to make headings.
# Header 1 (One #)
## Header 2 (Two #)
### Header 3 (Three #)

## 3. Lists
### Unordered (Bullets)
- Use a dash \`-\`
* Or an asterisk \`*\`
  - Indent with spaces to create sub-lists.

### Ordered (Numbered)
1. Start with \`1.\`
2. The next item
3. It handles the numbering for you!

## 4. Code Blocks
You can write code inline, like \`const x = 10;\`.

Or write multi-line code blocks with syntax highlighting (using three backticks):

\`\`\`javascript
// This is JavaScript!
function sayHello(name) {
  console.log("Hello, " + name);
}

sayHello("Developer");
\`\`\`

\`\`\`css
/* This is CSS! */
body {
  background-color: #2d2d2d;
  color: white;
}
\`\`\`

## 5. Blockquotes
Use the \`>\` character to create a blockquote:

> "Code is like humor. When you have to explain it, it’s bad."
> — Cory House

## 6. Links & Images
You can create links: [Google](https://google.com)

And you can embed images:
![React Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1920px-React-icon.svg.png)

## 7. Tables (GitHub Flavored)
| Syntax | Description | Status |
| :--- | :---: | ---: |
| Header | Title | Here |
| Paragraph | Text | ✅ |

---
*Happy Coding!*
`;
