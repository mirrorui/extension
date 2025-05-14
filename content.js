let hoverBox;
let mirrorLabel;
let previewWrapper;

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
  mirrorLabel.style.background = "rgba(255, 255, 255, 0.5)";
  mirrorLabel.style.backdropFilter = 'blur(4px)';
  mirrorLabel.style.color = "#000000";
  mirrorLabel.style.padding = "8px 16px";
  mirrorLabel.style.borderRadius = "8px";
  mirrorLabel.style.fontFamily = "monospace";
  mirrorLabel.style.fontSize = "14px";
  mirrorLabel.style.border = "1px solid #ccc";
  mirrorLabel.style.display = "flex";
  mirrorLabel.style.alignItems = "center";
  mirrorLabel.style.gap = "12px";
  mirrorLabel.style.pointerEvents = "none";
  mirrorLabel.style.userSelect = "none";

  const closeBtn = document.createElement("span");
  closeBtn.innerText = "✕";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.marginLeft = "8px";
  closeBtn.style.color = "#000000";
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

function showToast(message) {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.style.position = "fixed";
  toast.style.top = "10px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%) translateY(-20px)";
  toast.style.background = "rgba(255, 255, 255, 0.5)";
  toast.style.backdropFilter = 'blur(4px)';
  toast.style.color = "#000000";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "8px";
  toast.style.border = "1px solid #ccc";
  toast.style.fontFamily = "monospace";
  toast.style.fontSize = "14px";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  toast.style.zIndex = "999999";
  toast.style.pointerEvents = "none";

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
    toast.addEventListener("transitionend", () => toast.remove());
  }, 2000);
}

function showPreview(html) {
  const SNAP_PADDING = 4;

  const previewContent = document.createElement("div");
  previewContent.innerHTML = html;

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.bottom = "80px";
  wrapper.style.right = "20px";
  
  wrapper.style.background = "rgba(255, 255, 255, 0.5)";
  wrapper.style.backdropFilter = 'blur(4px)';
  wrapper.style.border = "1px solid #ccc";
  wrapper.style.borderRadius = "8px";
  wrapper.style.zIndex = "999999";
  wrapper.style.fontFamily = "monospace";
  wrapper.style.fontSize = "12px";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.resize = "both";
  wrapper.style.overflow = "hidden";
  wrapper.style.minWidth = "200px";
  wrapper.style.minHeight = "100px";

  const header = document.createElement("div");
  header.style.position = "relative";
  header.style.padding = "12px 32px 20px 12px";
  header.style.borderBottom = "1px solid #ccc";
  header.style.background = "rgba(255, 255, 255, 0.5)";
  wrapper.style.backdropFilter = 'blur(16px)';
  header.style.cursor = "move";
  header.style.userSelect = "none";

  const closeBtn = document.createElement("div");
  closeBtn.innerText = "✕";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "6px";
  closeBtn.style.right = "10px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "14px";
  closeBtn.style.color = "#999";
  closeBtn.style.zIndex = "1000000";
  closeBtn.style.background = "#fff";
  closeBtn.style.borderRadius = "50%";
  closeBtn.style.border = "1px solid #ccc";
  closeBtn.style.width = "20px";
  closeBtn.style.height = "20px";
  closeBtn.style.display = "flex";
  closeBtn.style.alignItems = "center";
  closeBtn.style.justifyContent = "center";
  closeBtn.onclick = () => {
    cleanupSelection();
    chrome.runtime.sendMessage({ action: "mirror-stopped" });
  };

  header.appendChild(closeBtn);

  const scrollable = document.createElement("div");
  scrollable.style.overflowY = "auto";
  scrollable.style.overflowX = "hidden";
  scrollable.style.flex = "1";
  scrollable.style.padding = "12px";
  scrollable.appendChild(previewContent);

  wrapper.appendChild(header);
  wrapper.appendChild(scrollable);
  document.body.appendChild(wrapper);
  previewWrapper = wrapper;

  let isDragging = false;
  let startX, startY, startLeft, startTop;

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = wrapper.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = startLeft + dx;
    let newTop = startTop + dy;

    const { innerWidth, innerHeight } = window;
    const rect = wrapper.getBoundingClientRect();

    if (newLeft <= SNAP_PADDING) newLeft = 0;

    if (newLeft + rect.width >= innerWidth - SNAP_PADDING) {
      newLeft = innerWidth - rect.width;
    }

    if (newTop <= SNAP_PADDING) newTop = 0;

    if (newTop + rect.height >= innerHeight - SNAP_PADDING) {
      newTop = innerHeight - rect.height;
    }

    wrapper.style.left = `${newLeft}px`;
    wrapper.style.top = `${newTop}px`;
    wrapper.style.right = "auto";
    wrapper.style.bottom = "auto";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "";
  });
}

function handleCloseLabel(e) {
  e.preventDefault();
  e.stopPropagation();
  cleanupSelection();
  chrome.runtime.sendMessage({ action: "mirror-stopped" });
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

  cleanupSelection();
  showPreview(result);
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
  if (previewWrapper) {
  previewWrapper.remove();
  previewWrapper = null;
  }

  document.removeEventListener("mouseover", handleHover);
  document.removeEventListener("click", handleLeftClick, { once: true });
  document.removeEventListener("contextmenu", handleRightClick, { once: true });
}

function stopmirrorSelection() {
  cleanupSelection();
  showToast("Mirror stopped");
  chrome.runtime.sendMessage({ action: "mirror-stopped" });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start-mirror") {
    startmirrorSelection();
  } else if (request.action === "stop-mirror") {
    stopmirrorSelection();
  }
});
