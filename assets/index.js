const iframe = document.getElementById('editor');
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  
  doc.open();
  doc.write('<html><body><div id="editor-field" style="height:100%; outline:none; border:none;" contenteditable="true"></div></body></html>');
  doc.close();

 const htmlCode = document.getElementById("htmlCode");
  const cssCode = document.getElementById("cssCode");
  const jsCode = document.getElementById("jsCode");
  
htmlCode.addEventListener('paste', (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString();
  if (selectedText.length === htmlCode.value.length && htmlCode.value.length > 0) {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const tempDiv = document.createElement('html');
    tempDiv.innerHTML = pastedText;

    let headContent = '';
    let bodyContent = '';
    const styleTags = tempDiv.querySelectorAll('style');
    let cssContent = '';
    styleTags.forEach(style => {
      cssContent += formatCSS(style.textContent.trim()) + '\n\n';
      style.remove();
    });

    const scriptTags = tempDiv.querySelectorAll('script');
    let jsContent = '';
    scriptTags.forEach(script => {
      if (!script.hasAttribute('src')) {
        jsContent += formatJS(script.textContent.trim()) + '\n\n';
        script.remove();
      } else {
        script.remove();
      }
    });

    const title = tempDiv.querySelector('title');
    if (title) {
      headContent += formatNode(title, 2);
      title.remove();
    }

    const pastedHead = tempDiv.querySelector('head');
    if (pastedHead) headContent += formatNode(pastedHead, 2);

    const pastedBody = tempDiv.querySelector('body') || tempDiv;
    bodyContent += formatNode(pastedBody, 2);

    if(bodyContent.length > 1) {
      const finalHTML =
        `<!DOCTYPE html>\n<html>\n<head>\n<title>${headContent.trim()}</title>\n</head>\n<body>\n${bodyContent.trim()}\n</body>\n</html>`;
      htmlCode.value = finalHTML.trim();
      cssCode.value = cssContent.trim();
      jsCode.value = jsContent.trim();
      updateOutput();
    }
  }
});
  
  function formatNode(node, indent = 2) {
    let formatted = '';
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagOpen = child.outerHTML.split(">")[0] + ">";
        const closingTag = `</${child.tagName.toLowerCase()}>`;
        formatted += " ".repeat(indent) + tagOpen + "\n";
        formatted += formatNode(child, indent + 2);
        formatted += " ".repeat(indent) + closingTag + "\n";
      } else if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim()) {
        formatted += " ".repeat(indent) + child.nodeValue.trim() + "\n";
      }
    });
    return formatted;
  }
  
  function formatCSS(css) {
    return css
      .split('}')
      .map(rule => rule.trim())
      .filter(Boolean)
      .map(rule => {
        const [selector, body] = rule.split('{');
        return `${selector.trim()} {\n  ${body.trim().split(';').filter(Boolean).map(line => line.trim() + ';').join('\n  ')}\n}`;
      }).join('\n\n');
  }
  
  function formatJS(js) {
    return js
      .split(';')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => line + ';')
      .join('\n');
  }

  function resetIframe() {
    const oldFrame = document.getElementById("outputFrame");
    const newFrame = oldFrame.cloneNode(false); // false to clone without children
    oldFrame.parentNode.replaceChild(newFrame, oldFrame);
    return newFrame;
  }
cssCode.addEventListener('input', updateOutput);
  function updateOutput() {
    
    const rawHTML = document.getElementById("htmlCode").value;
    const css = document.getElementById("cssCode").value;
    const js = document.getElementById("jsCode").value;
  
    const iframe = resetIframe();
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  
    // Extract and remove <script> tags from HTML
    let html = rawHTML;
    let scriptMatches = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
    let extractedScript = scriptMatches.map(m => m[1]).join("\n");
  
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ""); 
    document.getElementById("consoleOutput").innerHTML = "";
  
    const output = `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            // Capture errors
            window.onerror = function(msg, url, line, col, error) {
              parent.postMessage({
                type: "error",
                message: (error && error.stack) || (msg + " at line " + line + ":" + col)
              }, "*");
            };
  
            // Override all console types
            ['log', 'error', 'warn', 'info'].forEach((type) => {
              const original = console[type];
              console[type] = (...args) => {
                parent.postMessage({
                  type: type,
                  message: args.map(a => {
                    try {
                      return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
                    } catch (e) {
                      return String(a);
                    }
                  }).join(' ')
                }, "*");
                original.apply(console, args); // Still show in real browser console
              };
            });
  
            try {
              ${extractedScript.replace(/<\/script>/g, "<\\/script>")}
              ${js.replace(/<\/script>/g, "<\\/script>")}
            } catch (e) {
              parent.postMessage({ type: "error", message: e.message }, "*");
            }
          <\/script>
        </body>
      </html>
    `;
  
    iframeDoc.open();
    iframeDoc.write(output);
    iframeDoc.close();
  }
  
const PreHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Developer Darpan</title>
</head>
<body>
  <div class="card">
    <a href="https://darpanadhikari.com.np">
      <img draggable="false" src="https://darpanadhikari.com.np/addition/images/darpan.png" class="avatar" />
    </a>
    <div class="name">Darpan Adhikari</div>
    <div class="role">Software Developer | Web • App • Python</div>
    <button class="btn-toggle" onclick="toggleTheme()">Toggle Theme</button>
  </div>
</body>
</html>`;
const PreCss = `
 :root {
  --bg-light: #c3cfe2;
  --bg-dark: #1f1c2c;
  --bg-dark-secondary: #928dab;
  --text-light: #000;
  --text-dark: #fff;
  --text-muted: #555;
  --text-muted-dark: #ccc;
  --card-bg-light: rgba(255, 255, 255, 0.1);
  --card-bg-dark: rgba(255, 255, 255, 0.05);
  --btn-light-bg: #000;
  --btn-light-color: #fff;
  --btn-dark-bg: #fff;
  --btn-dark-color: #000;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, var(--bg-light), var(--bg-light));
  transition: background 0.3s;
  color: var(--text-light);
}

.card {
  background: var(--card-bg-light);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  width: 300px;
  text-align: center;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
  color: var(--text-light);
  transition: 0.3s;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 1rem;
  object-fit: cover;
}

.name {
  font-size: 1.4rem;
  font-weight: 600;
}

.role {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.btn-toggle {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 30px;
  background: var(--btn-light-bg);
  color: var(--btn-light-color);
  cursor: pointer;
  transition: 0.3s;
}

.dark {
  background: linear-gradient(135deg, var(--bg-dark), var(--bg-dark-secondary));
  color: var(--text-dark);
}

.dark .card {
  background: var(--card-bg-dark);
  color: var(--text-dark);
}

.dark .role {
  color: var(--text-muted-dark);
}

.dark .btn-toggle {
  background: var(--btn-dark-bg);
  color: var(--btn-dark-color);
}`;
const PreJs = `function toggleTheme(){
  document.body.classList.toggle('dark');
}
console.info("This is console");`;
document.getElementById("htmlCode").value = PreHtml;
document.getElementById("cssCode").value = formatCSS(PreCss);
document.getElementById("jsCode").value = formatJS(PreJs);
updateOutput();

const tabButtons = document.querySelectorAll(".tab-button");
const codeEditors = document.querySelectorAll(".code-editor");
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    codeEditors.forEach((editor) => editor.classList.remove("active"));
    button.classList.add("active");
    const tabName = button.getAttribute("data-tab");
    document.getElementById(`${tabName}Code`).classList.add("active");
  });
});

document.querySelectorAll("textarea").forEach((field) => {
  field.addEventListener("input", () => {
    const pos = field.selectionStart;
    const value = field.value;
    const char = value[pos - 1];
    const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };

    // --- Auto-close HTML tags like <div> → </div> ---
    const match = value.slice(0, pos).match(/<(\w+)>$/);
    if (match) {
      const tag = match[1];
      const voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'];

      if (!voidTags.includes(tag)) {
        const openTags = (value.match(new RegExp(`<${tag}(\\s[^>]*)?>`, "g")) || []).length;
        const closeTags = (value.match(new RegExp(`</${tag}>`, "g")) || []).length;

        if (openTags > closeTags) {
          const before = value.slice(0, pos);
          const after = value.slice(pos);
          field.value = before + `</${tag}>` + after;
          field.selectionStart = field.selectionEnd = pos;
          if (field.id === "cssCode") {
          updateOutput();
          }
          return;
        }
      }
    }

    if (pairs[char] && field.selectionStart === field.selectionEnd) {
      const closing = pairs[char];
      const before = value.slice(0, pos - 1);
      const after = value.slice(pos);
      const nextChar = after[0];
      const shouldInsert = !nextChar || (nextChar !== closing && !/\w/.test(nextChar));

      if (shouldInsert) {
        field.value = before + char + closing + after;
        field.selectionStart = field.selectionEnd = pos;
         if (field.id === "cssCode") {
          updateOutput();
          }
        return;
      }
    }
  });
});

document.getElementById("compileBtn").addEventListener("click", () => {
  document.getElementById("consoleOutput").innerHTML = "";
  updateOutput();
});

const converter = document.getElementById("converter");
converter.addEventListener("click", (e) => {
  let popup = document.getElementById("popup");
  popup.style.display = "block";
  doc.getElementById("editor-field").focus();
});
document.addEventListener("click", function (event) {
  let popup = document.getElementById("popup");
  if (!popup.contains(event.target) && event.target !== converter) {
    popup.style.display = "none";
  }
});
document.getElementById("finish").addEventListener("click", function () {
  const htmlContent = doc.getElementById("editor-field").innerHTML;
  popup.style.display = "none";
  doc.getElementById("editor-field").innerHTML = '';

  const bodyContent = new DOMParser().parseFromString(htmlContent, "text/html").body.innerHTML.trim();
  if (bodyContent) {
    extractInlineStylesAndScripts(htmlContent);
  }
});
function extractInlineStylesAndScripts(htmlContent) {
  const htmlInput = document.getElementById("htmlCode");
  const cssOutput = document.getElementById("cssCode");
  const jsOutput = document.getElementById("jsCode");
  let parser = new DOMParser();
  let doc = parser.parseFromString(htmlContent.trim(), "text/html");
  let cssContent = "";
  let jsContent = "";
  let elementCount = 1;
  doc.querySelectorAll("[style]").forEach(element => {
      let className = `drp_element_${elementCount}`;
      element.className = className;
      let formattedStyle = element.getAttribute("style")
        .split(";")
        .map(line => line.trim())
        .filter(line => line)
        .map(line => `  ${line};`) 
        .join("\n");
      cssContent += `.${className} {\n${formattedStyle}\n}\n\n`;
      element.removeAttribute("style");
      elementCount++;
  });
  doc.querySelectorAll("[onclick], [onmouseover], [onmouseout], [onchange], [oninput]").forEach(element => {
      let className = `drp_element_${elementCount}`;
      element.classList.add(className);
      Array.from(element.attributes).forEach(attr => {
          if (attr.name.startsWith("on")) {
              let formattedJs = attr.value
                .split(";")
                .map(line => line.trim())
                .filter(line => line)
                .map(line => `  ${line};`) 
                .join("\n");
              jsContent += `document.querySelector('.${className}').${attr.name} = function() {\n${formattedJs}\n};\n\n`;
              element.removeAttribute(attr.name);
          }
      });
      elementCount++;
  });
  function formatHTML(node, indent = 2) {
      let formattedHtml = "";
      node.childNodes.forEach(child => {
          if (child.nodeType === Node.ELEMENT_NODE) {
              let tag = child.outerHTML.split(">")[0] + ">";
              let closingTag = `</${child.tagName.toLowerCase()}>`;
              formattedHtml += " ".repeat(indent) + tag + "\n";
              formattedHtml += formatHTML(child, indent + 2);
              formattedHtml += " ".repeat(indent) + closingTag + "\n";
          } else if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim()) {
              formattedHtml += " ".repeat(indent) + child.nodeValue.trim() + "\n";
          }
      });
      return formattedHtml;
  }
  let formattedHtml = formatHTML(doc.body, 2);
  let html = `<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n${formattedHtml}</body>\n</html>`;
  htmlInput.value = html;
  cssOutput.value = cssContent.trim();
  jsOutput.value = jsContent.trim();
  updateOutput();
}
async function downloadHTML() {
  const html = document.getElementById("htmlCode").value.trim();
  const css = document.getElementById("cssCode").value.trim();
  const js = document.getElementById("jsCode").value.trim();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  let finalCSS = css;
  let finalJS = js;

  // 1. Extract internal <style> tags
  doc.querySelectorAll("style").forEach(style => {
    finalCSS += "\n" + style.innerHTML;
    style.remove();
  });

  // 2. Extract internal <script> tags
  doc.querySelectorAll("script").forEach(script => {
    if (!script.src) {
      finalJS += "\n" + script.innerHTML;
      script.remove();
    }
  });

  // 3. Convert inline styles to external CSS with unique classes
  let styleIndex = 0;
  doc.querySelectorAll("*[style]").forEach(el => {
    const styleContent = el.getAttribute("style");
    const className = `auto_drp_style_${styleIndex++}`;
    finalCSS += `\n.${className} { ${styleContent} }`;
    el.classList.add(className);
    el.removeAttribute("style");
  });

  // 4. Generate final HTML
  const finalHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated HTML</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  ${doc.body.innerHTML}
  <script src="assets/script.js"></script>
</body>
</html>`;
  const animatedConsoleJS = `
const colors = ["blue", "purple", "red", "green", "orange", "grey", "white", "black"];
let index = 0;
function animateConsoleLog() {
  console.clear();
  console.log("%chttps://darpanadhikari.com.np",
    "font-size: 40px; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.4); " +
    "background: " + colors[index] + "; padding: 10px;"
  );
  index = (index + 1) % colors.length;
  setTimeout(animateConsoleLog, 500);
}
animateConsoleLog();\n\n${finalJS}
`;

  const zip = new JSZip();
  zip.file("index.html", finalHTML);
  zip.folder("assets").file("style.css", finalCSS);
  zip.folder("assets").file("script.js", animatedConsoleJS);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "drp__template.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    if (confirm("Do you want to download the file?")) {
      document.getElementById('download').click(); 
    }
  }
});

const screenSize = document.getElementById('screen-size');
screenSize.addEventListener('click', (e) => {
  const container = document.querySelector('.container');
  container.classList.toggle('split');
  window.scrollTo({
    top: document.body.scrollHeight, // Scroll to the bottom
    behavior: 'smooth' // Smooth scrolling
  });
});

window.addEventListener("message", (event) => {
  if (!event.data || !event.data.type || !event.data.message) return;

  const logContainer = document.getElementById("consoleOutput");
  const div = document.createElement("div");
  div.textContent = `[${event.data.type.toUpperCase()}] ${event.data.message}`;
  div.style.whiteSpace = "pre-wrap";

  switch (event.data.type) {
    case "error":
      div.style.color = "red";
      break;
    case "warn":
      div.style.color = "orange";
      break;
    case "info":
      div.style.color = "cyan";
      break;
    default:
      div.style.color = "lime";
  }

  logContainer.appendChild(div);
  document.getElementById("consoleContainer").scrollTop = document.getElementById("consoleContainer").scrollHeight;
  logContainer.scrollTop = logContainer.scrollHeight;
  updatePopupLogs();
});
let popupWindow = null;

document.getElementById("popupConsole").addEventListener("click", () => {
  // If popup is already open and not closed, bring it to front
  if (popupWindow && !popupWindow.closed) {
    popupWindow.focus();
    return;
  }

  // Hide the main console output
  document.getElementById("consoleContainer").style.display = "none";

  // Open popup
  popupWindow = window.open("", "_blank", "width=600,height=400,scrollbars=yes");

  // Write content to popup
  popupWindow.document.write(`
    <html>
      <head>
        <title>Console Output</title>
        <style>
          body { background: black; color: white; font-family: monospace; white-space: pre-wrap; padding: 10px; }
          div { margin-bottom: 4px; }
        </style>
      </head>
      <body></body>
    </html>
  `);
  popupWindow.document.close();

  // Initial log sync
  updatePopupLogs();

  // Start interval to check if popup is closed
  const checkClosed = setInterval(() => {
    if (popupWindow.closed) {
      clearInterval(checkClosed);
      // Show the main console again
      document.getElementById("consoleContainer").style.display = "block";
      popupWindow = null;
      window.scrollTo({
        top: document.body.scrollHeight, 
        behavior: 'smooth' // Smooth scrolling
      });
    }
  }, 500);
});

function updatePopupLogs() {
  if (popupWindow && !popupWindow.closed) {
    const logs = document.getElementById("consoleOutput").innerHTML;
    popupWindow.document.body.innerHTML = logs;
  }
}
