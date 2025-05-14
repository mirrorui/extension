chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "mirror-extract",
    title: "Start Mirror",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "mirror-extract") {
    chrome.tabs.sendMessage(tab.id, { action: "start-mirror" });
  }
});