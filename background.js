chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "mimic-extract",
    title: "Start Mimic Selection",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "mimic-extract") {
    chrome.tabs.sendMessage(tab.id, { action: "start-mimic" });
  }
});