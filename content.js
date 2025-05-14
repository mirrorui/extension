let hoverBox;
let mirrorLabel;

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

function startmirrorSelection() {
  showmirrorLabel();
  document.addEventListener("mouseover", handleHover);
  document.addEventListener("click", handleLeftClick, { once: true });
  document.addEventListener("contextmenu", handleRightClick, { once: true });
}

function showmirrorLabel() {
  mirrorLabel = document.createElement("div");
  mirrorLabel.innerText = "Mirror Active";
  mirrorLabel.style.position = "fixed";
  mirrorLabel.style.top = "10px";
  mirrorLabel.style.left = "50%";
  mirrorLabel.style.transform = "translateX(-50%) translateY(-20px)";
  mirrorLabel.style.opacity = "0";
  mirrorLabel.style.transition = "transform 0.3s ease, opacity 0.3s ease";
  mirrorLabel.style.zIndex = "999999";
  mirrorLabel.style.background = "#00BFFF";
  mirrorLabel.style.color = "#FFFFFF";
  mirrorLabel.style.padding = "8px 16px";
  mirrorLabel.style.borderRadius = "8px";
  mirrorLabel.style.fontFamily = "monospace";
  mirrorLabel.style.fontSize = "14px";
  mirrorLabel.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  mirrorLabel.style.display = "flex";
  mirrorLabel.style.alignItems = "center";
  mirrorLabel.style.gap = "12px";
  mirrorLabel.style.pointerEvents = "none";
  mirrorLabel.style.userSelect = "none";

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

  mirrorLabel.appendChild(closeBtn);
  document.body.appendChild(mirrorLabel);

  requestAnimationFrame(() => {
    mirrorLabel.style.opacity = "1";
    mirrorLabel.style.transform = "translateX(-50%) translateY(0)";
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
  if (mirrorLabel) {
    mirrorLabel.remove();
    mirrorLabel = null;
  }

  document.removeEventListener("mouseover", handleHover);
  document.removeEventListener("click", handleLeftClick, { once: true });
  document.removeEventListener("contextmenu", handleRightClick, { once: true });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start-mirror") {
    startmirrorSelection();
  }
});
