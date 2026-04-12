// Taskative — Browser Extension Background Service Worker

const API_BASE = "https://taskativeapp.com";
const FIREBASE_API_KEY = "AIzaSyC5U0sq27tVGbyV9UPP58V7QZeddALVSkI";

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "taskative-add-task",
    title: "Add to Taskative: \"%s\"",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "taskative-add-page",
    title: "Add page to Taskative",
    contexts: ["page", "link"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let title = "";
  let description = "";

  if (info.menuItemId === "taskative-add-task" && info.selectionText) {
    title = info.selectionText.trim().substring(0, 200);
    description = `From: ${tab?.url || ""}`;
  } else if (info.menuItemId === "taskative-add-page") {
    title = tab?.title || "Untitled page";
    description = info.linkUrl || tab?.url || "";
  }

  if (!title) return;

  await createTask(title, description);
});

async function createTask(title, description) {
  try {
    const token = await getValidToken();
    if (!token) {
      notify("Please sign in to Taskative", "Click the extension icon to log in.");
      chrome.action.openPopup?.();
      return;
    }

    const res = await fetch(`${API_BASE}/api/ext/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });

    if (res.ok) {
      notify("Task added to Taskative", title);
    } else if (res.status === 401) {
      // Token expired, try refresh
      const refreshed = await refreshToken();
      if (refreshed) {
        return createTask(title, description);
      }
      notify("Session expired", "Please sign in again from the extension popup.");
    } else {
      notify("Failed to add task", "Please try again.");
    }
  } catch (err) {
    notify("Network error", "Could not reach Taskative.");
  }
}

async function getValidToken() {
  const data = await chrome.storage.local.get(["idToken", "tokenExpiry"]);
  const now = Date.now();
  if (data.idToken && data.tokenExpiry && data.tokenExpiry > now + 60000) {
    return data.idToken;
  }
  // Try to refresh
  return await refreshToken();
}

async function refreshToken() {
  const data = await chrome.storage.local.get(["refreshToken"]);
  if (!data.refreshToken) return null;

  try {
    const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(data.refreshToken)}`,
    });
    const json = await res.json();
    if (json.id_token) {
      await chrome.storage.local.set({
        idToken: json.id_token,
        refreshToken: json.refresh_token,
        tokenExpiry: Date.now() + (parseInt(json.expires_in) * 1000),
      });
      return json.id_token;
    }
  } catch { /* */ }
  return null;
}

function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.png",
    title,
    message,
  });
}
