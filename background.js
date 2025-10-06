"use strict";

const ICON_ON = {
  16: "icons/icon-on-16.png",
  32: "icons/icon-on-32.png",
  48: "icons/icon-on-48.png",
  128: "icons/icon-on-128.png"
};

const ICON_OFF = {
  16: "icons/icon-off-16.png",
  32: "icons/icon-off-32.png",
  48: "icons/icon-off-48.png",
  128: "icons/icon-off-128.png"
};

const mirrorState = {};

function setIcon(tabId, on) {
  chrome.action.setIcon({ tabId, path: on ? ICON_ON : ICON_OFF });
}

function start(tabId) {
  chrome.tabs.sendMessage(tabId, { action: "start-mirror" });
  mirrorState[tabId] = true;
  setIcon(tabId, true);
}

function stop(tabId) {
  chrome.tabs.sendMessage(tabId, { action: "stop-mirror" });
  mirrorState[tabId] = false;
  setIcon(tabId, false);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "mirror-extract",
    title: "Start Mirror",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "mirror-extract" || !tab?.id) return;
  start(tab.id);
});

chrome.action.onClicked.addListener((tab) => {
  const tabId = tab?.id;
  if (!tabId) return;
  const isRunning = !!mirrorState[tabId];
  isRunning ? stop(tabId) : start(tabId);
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.action !== "mirror-stopped") return;
  const tabId = sender?.tab?.id;
  if (!tabId) return;
  mirrorState[tabId] = false;
  setIcon(tabId, false);
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  setIcon(tabId, !!mirrorState[tabId]);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading" || changeInfo.status === "complete") {
    setIcon(tabId, !!mirrorState[tabId]);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete mirrorState[tabId];
});

if (chrome.runtime.onStartup) {
  chrome.runtime.onStartup.addListener(() => {
    chrome.tabs.query({}, (tabs) => {
      for (const t of tabs) {
        setIcon(t.id, !!mirrorState[t.id]);
      }
    });
  });
}
