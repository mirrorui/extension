let hoverBox;
let mimicLabel;

function getComputedCSS(target) {
  if (!(target instanceof Element)) return "";
  const computed = window.getComputedStyle(target);
  let style = "";
  for (const prop of computed) {
    style += `${prop}: ${computed.getPropertyValue(prop)}; `;
  }
  return style.trim();
}

function inlineAllStyles(element) {
  const clone = element.cloneNode(true);

  function applyStyles(source, target) {
    if (!(source instanceof Element) || !(target instanceof Element)) return;
    const computed = window.getComputedStyle(source);
    let style = "";
    for (const prop of computed) {
      style += `${prop}: ${computed.getPropertyValue(prop)}; `;
    }
    target.setAttribute("style", style.trim());
  }

  function recurse(source, target) {
    if (!(source instanceof Element) || !(target instanceof Element)) return;
    applyStyles(source, target);
    for (let i = 0; i < source.children.length; i++) {
      recurse(source.children[i], target.children[i]);
    }
  }

  recurse(element, clone);
  return clone;
}

function startMimicSelection() {
  showMimicLabel();
  document.addEventListener("mouseover", handleHover);
  document.addEventListener("click", handleLeftClick, { once: true });
  document.addEventListener("contextmenu", handleRightClick, { once: true });
}

function showMimicLabel() {
  mimicLabel = document.createElement("div");
  mimicLabel.innerText = "Mimic Active";
  mimicLabel.style.position = "fixed";
  mimicLabel.style.top = "10px";
  mimicLabel.style.left = "50%";
  mimicLabel.style.transform = "translateX(-50%) translateY(-20px)";
  mimicLabel.style.opacity = "0";
  mimicLabel.style.transition = "transform 0.3s ease, opacity 0.3s ease";
  mimicLabel.style.zIndex = "999999";
  mimicLabel.style.background = "#00BFFF";
  mimicLabel.style.color = "#FFFFFF";
  mimicLabel.style.padding = "8px 16px";
  mimicLabel.style.borderRadius = "8px";
  mimicLabel.style.fontFamily = "monospace";
  mimicLabel.style.fontSize = "14px";
  mimicLabel.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  mimicLabel.style.display = "flex";
  mimicLabel.style.alignItems = "center";
  mimicLabel.style.gap = "12px";
  mimicLabel.style.pointerEvents = "none";
  mimicLabel.style.userSelect = "none";

  const closeBtn = document.createElement("span");
  closeBtn.innerText = "✕";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.marginLeft = "8px";
  closeBtn.style.color = "#FFFFFF";
  closeBtn.style.fontSize = "16px";
  closeBtn.style.pointerEvents = "auto";
  closeBtn.style.userSelect = "none";
  closeBtn.title = "Cancel";
  closeBtn.onclick = handleCloseLabel;

  mimicLabel.appendChild(closeBtn);
  document.body.appendChild(mimicLabel);

  requestAnimationFrame(() => {
    mimicLabel.style.opacity = "1";
    mimicLabel.style.transform = "translateX(-50%) translateY(0)";
  });
}


function handleCloseLabel(e) {
  e.preventDefault();
  e.stopPropagation();
  cleanupSelection();
}

function handleHover(e) {
  if (!hoverBox) {
    hoverBox = document.createElement("div");
    hoverBox.style.position = "absolute";
    hoverBox.style.pointerEvents = "none";
    hoverBox.style.border = "2px solid #00BFFF";
    hoverBox.style.zIndex = "999998";
    document.body.appendChild(hoverBox);
  }

  const rect = e.target.getBoundingClientRect();
  hoverBox.style.top = `${rect.top + window.scrollY}px`;
  hoverBox.style.left = `${rect.left + window.scrollX}px`;
  hoverBox.style.width = `${rect.width}px`;
  hoverBox.style.height = `${rect.height}px`;
}

function handleLeftClick(e) {
  e.preventDefault();
  e.stopPropagation();

  const inlined = inlineAllStyles(e.target);
  const container = document.createElement("div");
  container.appendChild(inlined);
  const result = container.innerHTML;

  navigator.clipboard.writeText(result);
  alert("Copied!");

  cleanupSelection();
}

function handleRightClick(e) {
  e.preventDefault();
  cleanupSelection();
}

function cleanupSelection() {
  if (hoverBox) {
    hoverBox.remove();
    hoverBox = null;
  }
  if (mimicLabel) {
    mimicLabel.remove();
    mimicLabel = null;
  }

  document.removeEventListener("mouseover", handleHover);
  document.removeEventListener("click", handleLeftClick, { once: true });
  document.removeEventListener("contextmenu", handleRightClick, { once: true });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start-mimic") {
    startMimicSelection();
  }
});
