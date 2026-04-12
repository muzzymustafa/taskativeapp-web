# Taskative Browser Extension

Quickly turn any selected text on a webpage into a Taskative task.

## Features
- Right-click on selected text → "Add to Taskative"
- Right-click on a page → "Add page to Taskative"
- Click extension icon → manual task entry
- Works on Chrome, Edge, Brave, and Chromium-based browsers
- Firefox: requires minor manifest tweak (`browser_specific_settings`)

## Installation (Developer Mode)

### Chrome / Edge / Brave
1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this `extension/` folder
5. The Taskative icon appears in your toolbar

### First-time setup
1. Click the Taskative icon in the toolbar
2. Sign in with your Taskative account (same email/password as the mobile app)
3. Done — context menu now active

## Usage
- **Quick task from selection:** Highlight any text → right-click → "Add to Taskative: ..."
- **Save a webpage:** Right-click anywhere on a page → "Add page to Taskative"
- **Manual entry:** Click extension icon → type task → Enter

## How it works
- Calls `https://taskativeapp.com/api/ext/tasks` with a Firebase ID token
- Token stored in `chrome.storage.local`
- Auto-refreshes when expired

## Files
- `manifest.json` — Chrome MV3 manifest
- `background.js` — Service worker (context menu + API calls)
- `popup.html` / `popup.js` — Login + manual task entry
- `icons/` — Extension icons (16/48/128)
