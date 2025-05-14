const mirrorState = {};

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
    mirrorState[tab.id] = true;
    chrome.action.setBadgeText({ tabId: tab.id, text: "ON" });
  }
});

chrome.action.onClicked.addListener((tab) => {
  const tabId = tab.id;
  const isRunning = mirrorState[tabId];

  if (isRunning) {
    chrome.tabs.sendMessage(tabId, { action: "stop-mirror" });
    mirrorState[tabId] = false;
    chrome.action.setBadgeText({ tabId, text: "" });
  } else {
    chrome.tabs.sendMessage(tabId, { action: "start-mirror" });
    mirrorState[tabId] = true;
    chrome.action.setBadgeText({ tabId, text: "ON" });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "mirror-stopped" && sender.tab && sender.tab.id) {
    mirrorState[sender.tab.id] = false;
    chrome.action.setBadgeText({ tabId: sender.tab.id, text: "" });
  }
});
