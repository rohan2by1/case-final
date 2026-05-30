# Case Tracker Chrome Extension - Complete Documentation & Code

![Version](https://img.shields.io/badge/version-1.1-blue) ![Manifest](https://img.shields.io/badge/manifest-v3-green)

A specialized productivity tool designed to track work case URLs, manage queues, and analyze performance metrics with a modern, dark-themed dashboard.

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation Guide](#installation-guide)
4. [Features](#features)
5. [File Structure](#file-structure)
6. [Complete Source Code](#complete-source-code)
7. [API Reference](#api-reference)
8. [Usage Guide](#usage-guide)

---

## Overview

**Case Tracker** is a Chrome extension built for Amazon Paragon work case management. It automates case capturing, provides real-time analytics, and tracks productivity metrics like Average Handling Time (AHT).

### Key Metrics Tracked:
- **Queue Load**: Current backlog of pending cases
- **Total Completed**: Cases finished with abort count separated
- **Average Handling Time (AHT)**: Time between case open and completion
- **Trend Analysis**: 30-day completion trend chart

### Core Benefits:
✅ Auto-capture case URLs from Paragon pages  
✅ Smart duplicate prevention  
✅ Real-time performance analytics  
✅ CSV export with date filtering  
✅ Dark-themed UI optimized for long working hours  
✅ Lightweight and fast  

---

## Architecture

### Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+ Modules)
- **Charting**: Chart.js v4.4.1
- **Storage**: Chrome Local Storage API
- **Styling**: CSS3 with Glassmorphism effects
- **Manifest**: Chrome Extension Manifest v3

### Data Flow

```
┌─────────────────┐
│ Content Script  │ (Captures URLs from Paragon pages)
└────────┬────────┘
         │
         ├─ CAPTURE_LINK message
         │
         ▼
┌─────────────────┐
│ Service Worker  │ (Background process)
│ (background.js) │ ◄────────────────────┐
└────────┬────────┘                      │
         │                               │
         ├─ Stores in Chrome Storage    │
         ├─ Handles events              │
         └─ Processes messages          │
                   │                     │
         ┌─────────┴────────┐           │
         │                  │           │
         ▼                  ▼           │
    ┌─────────┐         ┌────────┐     │
    │  Queue  │         │History │     │
    │ Storage │         │Storage │     │
    └─────────┘         └────────┘     │
         │                  │           │
         └──────────┬───────┘           │
                    │                   │
    ┌───────────────▼──────────────┐   │
    │  UI Pages                    │───┘
    ├─ queued.html (New Tab)       │
    ├─ history.html               │
    ├─ performance.html (Charts)   │
    └─ settings.html (Export)      │
```

---

## Installation Guide

### Prerequisites
1. **Google Chrome** (v95+)
2. **Chart.js UMD Bundle** (Download from: https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js)

### Steps

1. **Clone/Download** the repository:
   ```bash
   git clone https://github.com/rohan2by1/case-final.git
   cd case-final
   ```

2. **Download Chart.js**:
   - Download `chart.umd.min.js` from the CDN link above
   - Place it in the root folder as `chart.js`

3. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable **Developer Mode** (top-right toggle)
   - Click **Load unpacked**
   - Select the `case-final` folder
   - Click **Open**

4. **Verify Installation**:
   - Icon should appear in Chrome toolbar
   - New Tab page should show "Case Tracker" queue dashboard
   - Visit a Paragon case page to test auto-capture

---

## Features

### 1. Workflow Automation
- **Auto-Capture**: Automatically detects case detail pages on `https://paragon-eu.amazon.com` and adds them to the queue
- **Queue Management**: Replaces Chrome New Tab with your active queue
- **Duplicate Prevention**: Smart logic prevents duplicate entries
- **Default Case Types**: Pre-configured with common case types

### 2. Case Management
- **Actionable Queue**: Open cases directly from the dashboard
- **Inline Autocomplete**: Type case type with smart suggestions
- **Type Tagging**: Categorize cases (Claim Reason, Counterfeit, Abort-PIV, etc.)
- **Mark Complete**: Move cases from queue to history with timestamps
- **History Tracking**: Complete logs with open/close times

### 3. Performance Analytics (AHT)
- **Visual Dashboard**: Powered by Chart.js
- **Key Metrics**:
  - Queue Load (current backlog)
  - Total Completed (with abort count)
  - Average Handling Time (AHT)
- **Abort Logic**: Automatically excludes "Abort-*" cases from AHT
- **Multiple Charts**:
  - Doughnut chart by case type
  - 30-day trend chart
  - Detailed breakdown bar chart
- **Date Range Filter**: Custom date filtering for all stats

### 4. Data Management
- **CSV Export**: Download complete reports with timestamps
- **Queue Format**: URL, Case Type, Opened At
- **History Format**: URL, Case Type, Opened, Completed, Time Taken (auto-calculated)
- **Custom Case Types**: Add/remove types dynamically from Settings

---

## File Structure

```
case-final/
├── manifest.json                 # Chrome extension configuration
├── background.js                 # Service worker (core logic)
├── utils.js                      # Shared utility functions
├── chart.js                      # Chart.js library (download separately)
│
├── assets/
│   └── icon.png                  # Extension icon (128x128)
│
├── styles/
│   └── main.css                  # Global Dark Slate theme
│
├── pages/                        # UI HTML files
│   ├── queued.html               # Queue dashboard (New Tab)
│   ├── history.html              # Completed cases log
│   ├── performance.html          # Analytics & charts
│   └── settings.html             # Settings & export
│
├── scripts/                      # Page-specific JavaScript
│   ├── queued.js                 # Queue page logic
│   ├── history.js                # History page logic
│   ├── performance.js            # Charts & analytics logic
│   └── settings.js               # Settings & export logic
│
└── content/
    └── capture.js                # Content script (auto-capture)
```

---

## Complete Source Code

### 1. manifest.json

```json
{
  "name": "Case Tracker",
  "description": "Track case links, history, queue, performance",
  "version": "1.1",
  "manifest_version": 3,
  "author": "rohan2by1",
  "homepage_url": "https://www.github.com/rohan2by1",

  "permissions": [
    "tabs",
    "storage",
    "activeTab",
    "scripting"
  ],

  "host_permissions": [
    "https://paragon-eu.amazon.com/*",
    "https://paragon-na.amazon.com/*"
  ],

  "chrome_url_overrides": {
    "newtab": "pages/queued.html"
  },

  "background": {
    "service_worker": "background.js"
  },

  "icons": {
    "16": "assets/icon.png",
    "48": "assets/icon.png",
    "128": "assets/icon.png"
  },

  "action": {
    "default_title": "Case Tracker",
    "default_icon": "assets/icon.png"
  },

  "options_page": "pages/settings.html",

  "content_scripts": [
    {
      "matches": [
        "https://paragon-na.amazon.com/hz/entity?entityType*",
        "https://paragon-eu.amazon.com/hz/entity?entityType*"
      ],
      "js": ["content/capture.js"],
      "run_at": "document_start"
    }
  ]
}
```

### 2. background.js

Service worker handling all data operations and event listeners.

```javascript
const QUEUE_KEY = "queue";
const HISTORY_KEY = "history";
const TYPES_KEY = "caseTypes";

async function get(key) {
  const r = await chrome.storage.local.get([key]);
  return r[key] || null;
}

async function set(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

async function init() {
  const q = await get(QUEUE_KEY);
  const h = await get(HISTORY_KEY);
  const t = await get(TYPES_KEY);
  if (!Array.isArray(q)) await set(QUEUE_KEY, []);
  if (!Array.isArray(h)) await set(HISTORY_KEY, []);
  if (!Array.isArray(t)) await set(TYPES_KEY, ["Other", "Claim Reason", "Counterfeit", "Seller Status", "MSS Check", "ASIN Check", "Return Request", "Abort-PIV", "Abort-MULTI", "Abort-NEW" ]);
}

function nowIso() {
  return new Date().toISOString();
}

async function addToQueueIfUnique(url, openedAt) {
  const [queue, history] = await Promise.all([get(QUEUE_KEY), get(HISTORY_KEY)]);
  const exists = (Array.isArray(queue) ? queue : []).some(x => x.url === url) || (Array.isArray(history) ? history : []).some(x => x.url === url);
  if (exists) return false;
  const item = { url, openedAt, caseType: "" };
  const next = (Array.isArray(queue) ? queue : []);
  next.push(item);
  await set(QUEUE_KEY, next);
  return true;
}

async function updateCaseType(url, caseType) {
  const queue = await get(QUEUE_KEY);
  const history = await get(HISTORY_KEY);
  let updated = false;
  if (Array.isArray(queue)) {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].url === url) {
        queue[i].caseType = caseType;
        updated = true;
        break;
      }
    }
    if (updated) await set(QUEUE_KEY, queue);
  }
  if (!updated && Array.isArray(history)) {
    for (let i = 0; i < history.length; i++) {
      if (history[i].url === url) {
        history[i].caseType = caseType;
        updated = true;
        break;
      }
    }
    if (updated) await set(HISTORY_KEY, history);
  }
  return updated;
}

async function markCompleted(url) {
  const queue = await get(QUEUE_KEY);
  const history = await get(HISTORY_KEY);
  if (!Array.isArray(queue)) return false;
  const idx = queue.findIndex(x => x.url === url);
  if (idx === -1) return false;
  const item = queue[idx];
  if (!item.caseType || !item.caseType.trim()) return false;
  queue.splice(idx, 1);
  const completedAt = nowIso();
  const nextHistory = Array.isArray(history) ? history : [];
  nextHistory.push({ ...item, completedAt });
  await Promise.all([set(QUEUE_KEY, queue), set(HISTORY_KEY, nextHistory)]);
  return true;
}

async function removeQueueItem(url) {
  const queue = await get(QUEUE_KEY);
  if (!Array.isArray(queue)) return false;
  const next = queue.filter(x => x.url !== url);
  const changed = next.length !== queue.length;
  if (changed) await set(QUEUE_KEY, next);
  return changed;
}

async function removeHistoryItem(url, openedAt) {
  const history = await get(HISTORY_KEY);
  if (!Array.isArray(history)) return false;
  
  // Remove item that matches both URL and OpenedAt (for precision)
  const next = history.filter(x => !(x.url === url && x.openedAt === openedAt));
  
  const changed = next.length !== history.length;
  if (changed) await set(HISTORY_KEY, next);
  return changed;
}

async function addCaseType(name) {
  const types = await get(TYPES_KEY);
  const arr = Array.isArray(types) ? types : [];
  if (arr.includes(name)) return false;
  arr.push(name);
  await set(TYPES_KEY, arr);
  return true;
}

async function removeCaseType(name) {
  const types = await get(TYPES_KEY);
  const arr = Array.isArray(types) ? types : [];
  const next = arr.filter(x => x !== name);
  const changed = next.length !== arr.length;
  if (changed) await set(TYPES_KEY, next);
  return changed;
}

chrome.runtime.onInstalled.addListener(() => {
  init();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handle = async () => {
    if (message.type === "CAPTURE_LINK") {
      const url = message.url;
      const openedAt = message.openedAt || nowIso();
      const added = await addToQueueIfUnique(url, openedAt);
      return { ok: true, added };
    }
    if (message.type === "UPDATE_CASE_TYPE") {
      const updated = await updateCaseType(message.url, message.caseType);
      return { ok: updated };
    }
    if (message.type === "MARK_COMPLETED") {
      const done = await markCompleted(message.url);
      return { ok: done };
    }
    if (message.type === "REMOVE_QUEUE_ITEM") {
      const done = await removeQueueItem(message.url);
      return { ok: done };
    }
    if (message.type === "REMOVE_HISTORY_ITEM") {
      const done = await removeHistoryItem(message.url, message.openedAt);
      return { ok: done };
    }
    if (message.type === "ADD_CASE_TYPE") {
      const ok = await addCaseType(message.name);
      return { ok };
    }
    if (message.type === "REMOVE_CASE_TYPE") {
      const ok = await removeCaseType(message.name);
      return { ok };
    }
    if (message.type === "CLEAR_HISTORY") {
      await set(HISTORY_KEY, []);
      return { ok: true };
    }
    if (message.type === "GET_DATA") {
      const [queue, history, caseTypes] = await Promise.all([
        get(QUEUE_KEY),
        get(HISTORY_KEY),
        get(TYPES_KEY)
      ]);
      return { queue: queue || [], history: history || [], caseTypes: caseTypes || [] };
    }
    return { ok: false };
  };
  handle().then(r => sendResponse(r));
  return true;
});

chrome.action.onClicked.addListener(() => {
  const url = chrome.runtime.getURL("pages/queued.html");
  
  // Check if tab is already open
  chrome.tabs.query({ url }, (tabs) => {
    if (tabs && tabs.length > 0) {
      // If found, highlight the first one
      const tab = tabs[0];
      chrome.tabs.update(tab.id, { active: true });
      chrome.windows.update(tab.windowId, { focused: true });
    } else {
      // If not found, open a new one
      chrome.tabs.create({ url });
    }
  });
});
```

### 3. utils.js

Shared utility functions for all pages.

```javascript
// scripts/utils.js

export async function send(message) {
  return await chrome.runtime.sendMessage(message);
}

export function fmt(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return new Intl.DateTimeFormat("default", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(d);
}

// Re-use tabs
export async function openOrFocusTab(url) {
  const tabs = await chrome.tabs.query({ url });
  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    chrome.tabs.create({ url });
  }
}

export function fmtDuration(openedAt, completedAt) {
  if (!openedAt || !completedAt) return "";
  const start = Date.parse(openedAt);
  const end = Date.parse(completedAt);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "";
  const ms = end - start;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
```

### 4. content/capture.js

Content script that runs on Paragon case pages to auto-capture URLs.

```javascript
(() => {
  // Guard clause to prevent duplicate execution
  if (window.hasCapturedLink) return;
  window.hasCapturedLink = true;

  const url = location.href;
  
  chrome.runtime.sendMessage({ 
    type: "CAPTURE_LINK", 
    url, 
    openedAt: new Date().toISOString() 
  });
})();
```

### 5. pages/queued.html

Queue dashboard (becomes default New Tab page).

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Queued</title>
  <link rel="stylesheet" href="../styles/main.css">
</head>
<body>
  <header>
    <h1>Case Tracker</h1>
    <nav>
      <a class="active" href="queued.html">Queued</a>
      <a href="history.html">History</a>
      <a href="performance.html">Performance</a>
      <a href="settings.html">Settings</a>
    </nav>
  </header>
  <div class="container">
    <div class="toolbar">
      <span class="muted">New tab opens here by default</span>
      <div style="flex-grow: 1;"></div>
      <button id="refresh" class="btn btn-secondary">Refresh Queue</button>
    </div>
    <table id="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Link</th>
          <th>Opened</th>
          <th>Case Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
  <datalist id="caseTypes"></datalist>
  
  <script src="../utils.js" type="module"></script>
  <script src="queued.js" type="module"></script>
</body>
</html>
```

### 6. pages/queued.js

Logic for the queue page with autocomplete functionality.

```javascript
import { send, fmt, openOrFocusTab } from '../utils.js';

async function load() {
  const r = await send({ type: "GET_DATA" });
  const tbody = document.querySelector("#table tbody");
  tbody.innerHTML = "";
  
  const list = r.queue || [];
  const types = r.caseTypes || []; 

  // 1. Populate the global Datalist (Hidden list of options)
  const datalist = document.getElementById("caseTypes");
  datalist.innerHTML = ""; 
  types.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    datalist.appendChild(opt);
  });

  list.forEach((item, i) => {
    const tr = document.createElement("tr");
    
    // Index
    const tdIndex = document.createElement("td");
    tdIndex.textContent = String(i + 1);
    
    // Link
    const tdLink = document.createElement("td");
    const displayUrl = item.url.length > 50 ? "..." + item.url.slice(50) : item.url;
    tdLink.textContent = displayUrl;
    tdLink.title = item.url;
    
    // Opened
    const tdOpened = document.createElement("td");
    tdOpened.textContent = fmt(item.openedAt);
    
    // --- INPUT: SEARCH SELECTION ---
    const tdType = document.createElement("td");
    const input = document.createElement("input");
    
    // Connects input to the datalist above
    input.setAttribute("list", "caseTypes"); 
    input.className = "custom-input"; // Uses your new CSS class
    input.value = item.caseType || "";
    input.placeholder = "Type to select...";

    const tdActions = document.createElement("td");
    tdActions.className = "actions";

    const btnComplete = document.createElement("button");
    btnComplete.textContent = "Complete";
    btnComplete.className = "btn btn-success";
    // Check if initial value is valid to enable button
    btnComplete.disabled = !item.caseType || !types.includes(item.caseType);

    // --- LOGIC: INLINE AUTO-COMPLETE ---
    input.addEventListener("input", (e) => {
        const val = input.value;
        
        // Only run auto-complete if user is typing (not deleting)
        if (!e.inputType || e.inputType === "insertText" || e.inputType === "insertFromPaste") {
            if (val.length > 0) {
                // Find the first Case Type that starts with what was typed (Case Insensitive)
                const match = types.find(t => t.toLowerCase().startsWith(val.toLowerCase()));
                
                if (match) {
                    // Fill the input with the full match
                    input.value = match;
                    
                    // Highlight the part the user hasn't typed yet
                    // (e.g. Typed "AS", system adds "IN CHECK", highlights "IN CHECK")
                    input.setSelectionRange(val.length, match.length);
                }
            }
        }

        // Enable "Complete" button immediately if the text matches a valid type
        btnComplete.disabled = !types.includes(input.value);
    });

    // Save change when user clicks away or hits Enter
    input.addEventListener("change", async () => {
        if (types.includes(input.value)) {
            await send({ type: "UPDATE_CASE_TYPE", url: item.url, caseType: input.value });
        }
    });
    
    // UX: Select all text when clicking into the box (easier to replace)
    input.addEventListener("focus", () => input.select());

    tdType.appendChild(input);

    const btnOpen = document.createElement("button");
    btnOpen.textContent = "Open";
    btnOpen.className = "btn btn-info"; 
    btnOpen.addEventListener("click", () => openOrFocusTab(item.url));
    
    btnComplete.addEventListener("click", async () => {
      if (input.value && types.includes(input.value)) {
        // Ensure the latest value is saved before completing
        await send({ type: "UPDATE_CASE_TYPE", url: item.url, caseType: input.value });
        await send({ type: "MARK_COMPLETED", url: item.url });
        await load(); // Refresh list
      } else {
        alert("Please select a valid Case Type.");
      }
    });
    
    const btnRemove = document.createElement("button");
    btnRemove.className = "btn btn-danger btn-icon"; 
    btnRemove.innerHTML = "&#10006;";
    btnRemove.title = "Remove from queue";
    
    btnRemove.addEventListener("click", async () => {
      if (confirm("Are you sure you want to remove this item?")) {
        await send({ type: "REMOVE_QUEUE_ITEM", url: item.url });
        await load();
      }
    });

    tdActions.appendChild(btnOpen);
    tdActions.appendChild(btnComplete);
    tdActions.appendChild(btnRemove);
    
    tr.appendChild(tdIndex);
    tr.appendChild(tdLink);
    tr.appendChild(tdOpened);
    tr.appendChild(tdType);
    tr.appendChild(tdActions);
    
    tbody.appendChild(tr);
  });

  // --- AUTO-FOCUS LOGIC ---
  // Find the first input box and focus it so you can type immediately
  const firstInput = document.querySelector(".custom-input");
  if (firstInput) {
    firstInput.focus();
  }
}

document.getElementById("refresh").addEventListener("click", load);
load();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.queue || changes.caseTypes)) load();
});
```

### 7. pages/history.html

Completed cases log.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cases History</title>
  <link rel="stylesheet" href="../styles/main.css">
</head>
<body>
  <header>
    <h1>Case Tracker</h1>
    <nav>
      <a href="queued.html">Queued</a>
      <a class="active" href="history.html">History</a>
      <a href="performance.html">Performance</a>
      <a href="settings.html">Settings</a>
    </nav>
  </header>
  <div class="container">
    <div class="toolbar">
      <input id="filter" placeholder="Filter by case type..." style="width: 250px;">
      <div style="flex-grow: 1;"></div> 
      <button id="refresh" class="btn btn-secondary">Refresh</button>
      <button id="clearHistory" class="btn btn-danger">Clear History</button>
    </div>
    <table id="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Link</th>
          <th>Opened</th>
          <th>Case Type</th>
          <th>Completed</th>
          <th>Time Taken</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
  
  <script src="../utils.js" type="module"></script>
  <script src="history.js" type="module"></script>
</body>
</html>
```

### 8. pages/history.js

Logic for history page with filtering.

```javascript
import { send, fmt, fmtDuration, openOrFocusTab } from '../utils.js';

async function load() {
  const r = await send({ type: "GET_DATA" });
  const filter = document.getElementById("filter").value.trim().toLowerCase();
  const tbody = document.querySelector("#table tbody");
  tbody.innerHTML = "";
  
  let list = r.history || [];
  if (filter.length) list = list.filter(x => (x.caseType || "").toLowerCase().includes(filter));
  
  // Sort history newest first
  list.reverse(); 

  list.forEach((item, i) => {
    const tr = document.createElement("tr");
    
    const tdIndex = document.createElement("td");
    tdIndex.textContent = String(i + 1);
    
    // Link (Modified to trim first 50 chars)
    const tdLink = document.createElement("td");
    const displayUrl = item.url.length > 50 ? "..." + item.url.slice(50) : item.url;
    tdLink.textContent = displayUrl;
    tdLink.title = item.url; // Hover to see full URL
    
    const tdOpened = document.createElement("td");
    tdOpened.textContent = fmt(item.openedAt);
    
    const tdType = document.createElement("td");
    tdType.textContent = item.caseType || "";
    
    const tdCompleted = document.createElement("td");
    tdCompleted.textContent = fmt(item.completedAt);
    
    const tdTimeTaken = document.createElement("td");
    tdTimeTaken.textContent = fmtDuration(item.openedAt, item.completedAt);
    
    const tdActions = document.createElement("td");
    tdActions.className = "actions";
    
    // Open Button -> Blue
    const btnOpen = document.createElement("button");
    btnOpen.textContent = "Open";
    btnOpen.className = "btn btn-info";
    btnOpen.addEventListener("click", () => openOrFocusTab(item.url));
    
    // Remove Button -> Red Icon
    const btnRemove = document.createElement("button");
    btnRemove.className = "btn btn-danger btn-icon"; 
    btnRemove.innerHTML = "&#10006;"; // Cross symbol
    btnRemove.title = "Permanently delete";
    
    btnRemove.addEventListener("click", async () => {
      if (confirm("Are you sure you want to permanently delete this record from history?")) {
        await send({ 
            type: "REMOVE_HISTORY_ITEM", 
            url: item.url, 
            openedAt: item.openedAt 
        });
        await load();
      }
    });

    tdActions.appendChild(btnOpen);
    tdActions.appendChild(btnRemove);
    
    tr.appendChild(tdIndex);
    tr.appendChild(tdLink);
    tr.appendChild(tdOpened);
    tr.appendChild(tdType);
    tr.appendChild(tdCompleted);
    tr.appendChild(tdTimeTaken);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

document.getElementById("refresh").addEventListener("click", load);
document.getElementById("filter").addEventListener("input", load);
document.getElementById("clearHistory").addEventListener("click", async () => {
  if (confirm("This will permanently clear all case history. Proceed?")) {
    await send({ type: "CLEAR_HISTORY" });
  }
});

load();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.history) load();
});
```

### 9. pages/performance.html

Analytics dashboard with charts.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Performance</title>
  <link rel="stylesheet" href="../styles/main.css">
  <style>
    /* Styling for the datetime inputs */
    input[type="datetime-local"] {
      width: 190px;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <header>
    <h1>Case Tracker</h1>
    <nav>
      <a href="queued.html">Queued</a>
      <a href="history.html">History</a>
      <a class="active" href="performance.html">Performance</a>
      <a href="settings.html">Settings</a>
    </nav>
  </header>
  <div class="container">
    <div class="toolbar">
      <input type="datetime-local" id="startRange" step="1">
      <input type="datetime-local" id="endRange" step="1">
      
      <button id="applyRange" class="btn btn-primary">Apply Range</button>
      <button id="clearRange" class="btn btn-secondary">Clear</button>
    </div>
    
    <div id="stats" style="margin-bottom: 24px;"></div>

    <div id="charts" class="charts-stack">
      <div class="chart-card">
        <h2>By Case Type</h2>
        <div class="chart-wrapper">
            <canvas id="chartByType"></canvas>
        </div>
      </div>
      
      <div class="chart-card">
        <h2>Completed Trend</h2>
        <div class="chart-wrapper">
            <canvas id="chartTrend"></canvas>
        </div>
      </div>
    </div>

    <div class="chart-card">
      <h2>Detailed Breakdown</h2>
      <div class="chart-wrapper">
          <canvas id="chartDetailed"></canvas>
      </div>
    </div>
  </div>
  
  <script src="chart.js"></script>
  <script src="../utils.js" type="module"></script>
  <script src="performance.js" type="module"></script>
</body>
</html>
```

### 10. pages/performance.js

Complete analytics and charting logic.

```javascript
import { send } from '../utils.js';

let chartByTypeInstance = null;
let chartTrendInstance = null;
let chartDetailedInstance = null;

// --- Stats Logic ---
function renderStats(queue, history) {
  const el = document.getElementById("stats");
  const totalQueued = queue.length;
  const totalCompleted = history.length;
  const abortCount = history.filter(x => (x.caseType || "").toLowerCase().includes("abort")).length;

  let totalDurationMs = 0;
  let validCases = 0;

  history.forEach(item => {
    if ((item.caseType || "").toLowerCase().includes("abort")) return;
    if (item.openedAt && item.completedAt) {
      const start = new Date(item.openedAt).getTime();
      const end = new Date(item.completedAt).getTime();
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        totalDurationMs += (end - start);
        validCases++;
      }
    }
  });

  const averageMs = validCases > 0 ? totalDurationMs / validCases : 0;

  const formatAHT = (ms) => {
    if (ms === 0) return "0s";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Queue Load</span>
        <span class="stat-value" style="color: #3b82f6">${totalQueued}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total Completed</span>
        <div style="display: flex; flex-direction: column;">
          <span class="stat-value" style="color: #10b981; line-height: 1;">${totalCompleted}</span>
          <span style="font-size: 11px; color: #ef4444; margin-top: 6px; font-weight: 600;">
            ${abortCount} Aborted
          </span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-label">Avg Handling Time</span>
        <span class="stat-value" style="color: #f59e0b">${formatAHT(averageMs)}</span>
      </div>
    </div>
  `;
}

// --- Charts ---
function renderByType(queue, history) {
  const map = new Map();
  const process = (list, key) => {
    list.forEach(x => {
      const k = x.caseType || "Queued";
      const v = map.get(k) || { queued: 0, completed: 0 };
      v[key]++;
      map.set(k, v);
    });
  };
  process(queue, 'queued');
  process(history, 'completed');

  // --- 1. DOUGHNUT CHART (Sort Descending by total volume) ---
  const descData = Array.from(map.entries()).sort((a, b) => (b[1].queued + b[1].completed) - (a[1].queued + a[1].completed));
  
  const labelsDesc = descData.map(d => d[0]);
  const cDataDesc = descData.map(d => d[1].completed);
  const qDataDesc = descData.map(d => d[1].queued);

  const baseBgColors = ['rgba(255, 99, 132, 0.8)', 'rgba(255, 159, 64, 0.8)', 'rgba(255, 205, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(201, 203, 207, 0.8)'];
  const fadedBgColors = ['rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 205, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(201, 203, 207, 0.2)'];
  
  const bgMain = labelsDesc.map((_, i) => baseBgColors[i % 7]);
  const bgFaded = labelsDesc.map((_, i) => fadedBgColors[i % 7]);

  const ctxDoughnut = document.getElementById("chartByType").getContext('2d');
  if (chartByTypeInstance) chartByTypeInstance.destroy();

  chartByTypeInstance = new Chart(ctxDoughnut, {
    type: 'doughnut',
    data: {
      labels: labelsDesc,
      datasets: [
        { label: 'Completed', data: cDataDesc, backgroundColor: bgMain, borderWidth: 0 },
        { label: 'Queued', data: qDataDesc, backgroundColor: bgFaded, borderWidth: 0, weight: 0.6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '40%',
      plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } }
    }
  });

  // --- 2. DETAILED BREAKDOWN BAR CHART (Vertical, Ascending, Fixed Width, 45deg Text) ---
  const ascData = Array.from(map.entries()).sort((a, b) => (a[1].queued + a[1].completed) - (b[1].queued + b[1].completed));

  const labelsAsc = ascData.map(d => d[0]);
  const cDataAsc = ascData.map(d => d[1].completed);
  const qDataAsc = ascData.map(d => d[1].queued);

  const ctxDetailed = document.getElementById("chartDetailed").getContext('2d');
  if (chartDetailedInstance) chartDetailedInstance.destroy();

  chartDetailedInstance = new Chart(ctxDetailed, {
    type: 'bar',
    data: {
      labels: labelsAsc,
      datasets: [
        { 
          label: 'Completed', 
          data: cDataAsc, 
          backgroundColor: 'rgba(16, 185, 129, 0.7)', 
          borderRadius: 4,
          barThickness: 30 // Fixed Bar Width
        },
        { 
          label: 'Queued', 
          data: qDataAsc, 
          backgroundColor: 'rgba(59, 130, 246, 0.7)', 
          borderRadius: 4,
          barThickness: 30 // Fixed Bar Width
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { 
          grid: { display: false }, 
          ticks: { 
            color: '#94a3b8',
            minRotation: 45, // Force 45 degree angle
            maxRotation: 45 
          } 
        },
        y: { 
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
          ticks: { 
            color: '#94a3b8',
            stepSize: 1 // Integer values
          } 
        }
      },
      plugins: {
        legend: { position: 'top', labels: { color: '#94a3b8' } }
      }
    }
  });
}

function renderTrend(history) {
  const counts = new Map();
  // Group by Date Only for trend chart, even if range is time specific
  const istDateKey = (ts) => new Date(ts).toLocaleDateString("en-CA");

  history.forEach(x => {
    if (!x.completedAt) return;
    const key = istDateKey(x.completedAt);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const days = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) { 
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(istDateKey(d.toISOString()));
  }

  const values = days.map(k => counts.get(k) || 0);
  const displayLabels = days.map(d => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));

  const ctx = document.getElementById("chartTrend").getContext('2d');
  if (chartTrendInstance) chartTrendInstance.destroy();

  chartTrendInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: displayLabels,
      datasets: [{ label: 'Completed', data: values, backgroundColor: 'rgba(59, 130, 246, 0.5)', borderRadius: 4 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
            ticks: { 
                color: '#94a3b8',
                stepSize: 1 
            } 
        },
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

// --- Precise Range Logic ---
let currentRange = null;

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function inRange(ms) {
  if (!currentRange) return true;
  const t = typeof ms === "string" ? Date.parse(ms) : ms;
  return !Number.isNaN(t) && t >= currentRange.start && t <= currentRange.end;
}

function applyRangeFilter(queue, history) {
  if (!currentRange) return { queue, history };
  return {
    queue: queue.filter(x => inRange(x.openedAt)),
    history: history.filter(x => inRange(x.completedAt))
  };
}

function setDefaults() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0); 
  
  document.getElementById("startRange").value = toDatetimeLocal(startOfDay);
  document.getElementById("endRange").value = toDatetimeLocal(now);

  currentRange = {
    start: startOfDay.getTime(),
    end: now.getTime()
  };
  
  document.getElementById("applyRange").textContent = "Active";
}

async function load() {
  const r = await send({ type: "GET_DATA" });
  const f = applyRangeFilter(r.queue || [], r.history || []);
  
  renderStats(f.queue, f.history);
  renderByType(f.queue, f.history);
  renderTrend(r.history || []);
}

setDefaults();
load();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.queue || changes.history)) load();
});

document.getElementById("applyRange").addEventListener("click", () => {
  const startVal = document.getElementById("startRange").value;
  const endVal = document.getElementById("endRange").value;
  
  const s = startVal ? new Date(startVal).getTime() : null;
  const e = endVal ? new Date(endVal).getTime() : null;

  if (s && e && e >= s) {
    currentRange = { start: s, end: e };
    document.getElementById("applyRange").textContent = "Active";
    load();
  } else {
    currentRange = null;
    alert("Invalid Range: End time must be after Start time.");
  }
});

document.getElementById("clearRange").addEventListener("click", () => {
  setDefaults(); 
  load();
});
```

### 11. pages/settings.html

Settings and export page.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Settings</title>
  <link rel="stylesheet" href="../styles/main.css">
  <style>
    /* Add specific style for date inputs */
    input[type="datetime-local"] {
      width: 200px;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <header>
    <h1>Case Tracker</h1>
    <nav>
      <a href="queued.html">Queued</a>
      <a href="history.html">History</a>
      <a href="performance.html">Performance</a>
      <a class="active" href="settings.html">Settings</a>
    </nav>
  </header>
  <div class="container">
    <h2>Case Types Management</h2>
    <div class="toolbar">
      <input id="typeName" placeholder="Enter new case type..." style="width: 300px;">
      <button id="addType" class="btn btn-primary">Add Type</button>
    </div>
    <table id="typesTable">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th style="width: 100px;">Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>

    <h2 style="margin-top: 40px; border-top: 1px solid var(--border); padding-top: 24px;">Data Export</h2>
    <p class="muted" style="margin-top: 0;">Select a date range to filter your export (leave empty to export all).</p>
    
    <div class="toolbar" style="margin-top: 16px;">
      <div style="display: flex; gap: 10px; align-items: center;">
        <span class="muted" style="font-size: 12px;">Range:</span>
        <input type="datetime-local" id="exportStart" step="1">
        <span class="muted">-</span>
        <input type="datetime-local" id="exportEnd" step="1">
      </div>
    </div>

    <div class="toolbar" style="margin-top: 16px;">
      <button id="exportQueue" class="btn btn-secondary">Export Queue (.csv)</button>
      <button id="exportHistory" class="btn btn-secondary">Export History (.csv)</button>
    </div>
  </div>
  
  <script src="../utils.js" type="module"></script>
  <script src="settings.js" type="module"></script>
</body>
</html>
```

### 12. pages/settings.js

Settings management and export logic.

```javascript
import { send, fmt, fmtDuration } from '../utils.js';

function downloadCsv(name, rows) {
  if (!rows.length) {
    alert("No data found for the selected range.");
    return;
  }
  const keys = Object.keys(rows[0]);
  const escape = v => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes("\n") || s.includes("\"")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const header = keys.join(",");
  const body = rows.map(r => keys.map(k => escape(r[k])).join(",")).join("\n");
  const csv = header + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- Helper to generate filename timestamp ---
function getTimestampFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

async function loadTypes() {
  const r = await send({ type: "GET_DATA" });
  const tbody = document.querySelector("#typesTable tbody");
  tbody.innerHTML = "";
  const list = r.caseTypes || [];

  list.forEach((name, i) => {
    const tr = document.createElement("tr");
    const tdIndex = document.createElement("td");
    tdIndex.textContent = String(i + 1);
    
    const tdName = document.createElement("td");
    tdName.textContent = name;
    
    const tdActions = document.createElement("td");
    tdActions.className = "actions";
    
    const btnRemove = document.createElement("button");
    btnRemove.className = "btn btn-danger";
    btnRemove.textContent = "Remove";
    btnRemove.addEventListener("click", async () => {
      await send({ type: "REMOVE_CASE_TYPE", name });
      await loadTypes();
    });
    
    tdActions.appendChild(btnRemove);
    tr.appendChild(tdIndex);
    tr.appendChild(tdName);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

// --- Date Range Helper ---
function getRange() {
  const startVal = document.getElementById("exportStart").value;
  const endVal = document.getElementById("exportEnd").value;
  const s = startVal ? new Date(startVal).getTime() : null;
  const e = endVal ? new Date(endVal).getTime() : null;
  return { start: s, end: e };
}

function inRange(ts, range) {
  if (!ts) return false;
  // If no range selected, return true (export all)
  if (!range.start && !range.end) return true;
  
  const t = new Date(ts).getTime();
  if (isNaN(t)) return false;

  if (range.start && t < range.start) return false;
  if (range.end && t > range.end) return false;
  
  return true;
}

document.getElementById("addType").addEventListener("click", async () => {
  const input = document.getElementById("typeName");
  const name = input.value.trim();
  if (!name) return;
  await send({ type: "ADD_CASE_TYPE", name });
  input.value = "";
  await loadTypes();
});

document.getElementById("exportQueue").addEventListener("click", async () => {
  const r = await send({ type: "GET_DATA" });
  const range = getRange();
  
  // Filter based on 'openedAt' for Queue
  const filtered = (r.queue || []).filter(x => inRange(x.openedAt, range));

  const rows = filtered.map(x => ({
    "URL": x.url,
    "Case Type": x.caseType || "",
    "Opened": fmt(x.openedAt)
  }));
  
  // Naming format: Queue-YYYY-MM-DD_HH-mm-ss.csv
  const fileName = `Queue-${getTimestampFilename()}.csv`;
  downloadCsv(fileName, rows);
});

document.getElementById("exportHistory").addEventListener("click", async () => {
  const r = await send({ type: "GET_DATA" });
  const range = getRange();

  // Filter based on 'completedAt' for History (standard practice)
  const filtered = (r.history || []).filter(x => inRange(x.completedAt || x.openedAt, range));

  const rows = filtered.map(x => ({
    "URL": x.url,
    "Case Type": x.caseType || "",
    "Opened": fmt(x.openedAt),
    "Completed": fmt(x.completedAt),
    "Time Taken": fmtDuration(x.openedAt, x.completedAt)
  }));
  
  // Naming format: Export-YYYY-MM-DD_HH-mm-ss.csv
  const fileName = `Export-${getTimestampFilename()}.csv`;
  downloadCsv(fileName, rows);
});

loadTypes();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.caseTypes) loadTypes();
});
```

### 13. styles/main.css

Complete styling with dark slate theme.

```css
/* Import modern font 'Inter' */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

:root {
  /* Modern Dark Palette */
  --bg-color: #313131;
  --bg-surface: rgba(40, 40, 40, 0.7); 
  --backdrop-blur: 10px;
  --bg-hover: rgba(255, 255, 255, 0.1);
  
  /* Brand Colors */
  --primary: #3b82f6;      /* Blue */
  --success: #10b981;      /* Green */
  --warning: #fbca1f;      /* Yellow */
  --danger: #f63838;       /* Red */
  --neutral: #64748b;      /* Slate/Grey */
  
  --text-main: #f8fafc;
  --text-muted: #a3a3a3;
  --border: rgba(255, 255, 255, 0.1);
  --radius: 8px; 
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  margin: 0;
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
  line-height: 1.4;
  font-size: 13px;
  min-height: 100vh; 
  background-color: var(--bg-color);
  background-image: radial-gradient(rgba(255, 255, 255, 0.171) 2px, transparent 0);
  background-size: 30px 30px;
  background-position: -5px -5px;
}

.container {
  max-width: auto;
  margin: 0 auto;
  padding: 5px;
}

/* --- Header & Nav --- */
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: rgba(35, 35, 35, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

h1 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #fff;
  letter-spacing: 0.5px;
}

nav {
  display: flex;
  gap: 4px;
}

nav a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 50px;
  transition: all 0.2s ease;
}

nav a:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

nav a.active {
  color: #fff;
  background: var(--primary);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
}

/* --- Tables --- */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 16px;
  background: var(--bg-surface);
  backdrop-filter: blur(var(--backdrop-blur));
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  font-size: 13px;
}

th {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  vertical-align: middle; 
}
td {
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  vertical-align: middle; 
}

th {
  background: rgba(20, 20, 20, 0.5);
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background: var(--bg-hover);
}

/* --- Forms & Inputs --- */
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 12px;
}

/* Base input style */
input {
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: 1px solid var(--border);
  padding: 7px 12px;
  border-radius: var(--radius);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: var(--primary);
  background: rgba(0, 0, 0, 0.837);
}

/* --- NEW: Search Selection Input Style --- */
.custom-input {
  width: 100%;
  box-sizing: border-box; /* Ensures padding doesn't widen the table cell */
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 12px;      /* Matches button height better */
  font-size: 13px;
  transition: all 0.2s ease;
}

.custom-input:focus {
  border-color: var(--primary);
  background-color: rgba(0, 0, 0, 0.8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25); /* Glow effect matches buttons */
  outline: none;
}

/* --- Buttons --- */
.btn {
  font-family: inherit;
  padding: 0.6em 1em;
  font-weight: 700;
  font-size: 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 0.4em;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  filter: brightness(1.1);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  filter: grayscale(1);
}

.btn-primary { background: var(--warning); color: #000; border-color: rgba(0,0,0,0.1); }
.btn-info { background: var(--primary); color: white; }
.btn-success { background: var(--success); color: white; }
.btn-danger { background: var(--danger); color: white; }
.btn-secondary { background: var(--neutral); color: white; }

.btn-icon {
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 14px;
}

td.actions { white-space: nowrap; }
td.actions .btn { margin-right: 6px; }
td.actions .btn:last-child { margin-right: 0; }

.muted { color: var(--text-muted); font-size: 12px; }

/* --- Stats & Charts --- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: var(--bg-surface);
  backdrop-filter: blur(var(--backdrop-blur));
  padding: 20px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
}
.stat-label { color: var(--text-muted); font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 6px; }
.stat-value { color: #fff; font-size: 26px; font-weight: 700; }

.charts-stack { display: flex; flex-direction: column; gap: 24px; }
.chart-card {
  flex: 1;
  background: var(--bg-surface);
  backdrop-filter: blur(var(--backdrop-blur));
  padding: 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  height: 300px;
}
.chart-card h2 { margin-top: 0; margin-bottom: 12px; font-size: 13px; color: var(--text-muted); flex-shrink: 0; }
.chart-wrapper { flex-grow: 1; position: relative; width: 100%; min-height: 0; }

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--bg-color); }
::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; border: 2px solid var(--bg-color); }
::-webkit-scrollbar-thumb:hover { background: #777; }
```

---

## API Reference

### Background Worker Message Types

#### CAPTURE_LINK
Captures a new case URL from content script.

**Message:**
```javascript
{
  type: "CAPTURE_LINK",
  url: "https://paragon-eu.amazon.com/hz/entity?entityType=...",
  openedAt: "2026-05-30T17:24:28.000Z"
}
```

**Response:**
```javascript
{
  ok: true,
  added: true  // false if duplicate
}
```

#### UPDATE_CASE_TYPE
Updates the case type for a queued or completed case.

```javascript
{
  type: "UPDATE_CASE_TYPE",
  url: "https://...",
  caseType: "Claim Reason"
}
```

#### MARK_COMPLETED
Marks a queue item as completed (moves to history).

```javascript
{
  type: "MARK_COMPLETED",
  url: "https://..."
}
```

#### GET_DATA
Retrieves all stored data (queue, history, case types).

```javascript
{
  type: "GET_DATA"
}
```

**Response:**
```javascript
{
  queue: [
    { url: "...", openedAt: "...", caseType: "..." }
  ],
  history: [
    { url: "...", openedAt: "...", completedAt: "...", caseType: "..." }
  ],
  caseTypes: ["Claim Reason", "Counterfeit", ...]
}
```

#### REMOVE_QUEUE_ITEM
Removes an item from the queue.

```javascript
{
  type: "REMOVE_QUEUE_ITEM",
  url: "https://..."
}
```

#### REMOVE_HISTORY_ITEM
Removes an item from history.

```javascript
{
  type: "REMOVE_HISTORY_ITEM",
  url: "https://...",
  openedAt: "2026-05-30T17:24:28.000Z"
}
```

#### ADD_CASE_TYPE / REMOVE_CASE_TYPE
Manage custom case types.

```javascript
{
  type: "ADD_CASE_TYPE",
  name: "New Type"
}
```

---

## Usage Guide

### Getting Started

1. **Load the extension** (see Installation Guide)
2. **Open a new tab** - you'll see your Case Tracker queue dashboard
3. **Visit a case page** on Paragon - the URL will auto-capture
4. **Type the case type** in the queue table (autocomplete helps!)
5. **Click "Complete"** to move it to history

### Typical Workflow

```
Visit Case → Auto-Captured → Tag Type → Mark Complete
   ↓              ↓             ↓           ↓
Paragon      In Queue      Dropdown     In History
```

### Using Performance Analytics

1. Go to **Performance** tab
2. Set date range (optional) - defaults to today
3. View **AHT metrics** - excludes "Abort" cases automatically
4. Check **3 charts** for trend and breakdown analysis
5. Click **Clear** to reset to current day

### Exporting Data

1. Go to **Settings** tab
2. Set date range (optional)
3. Click **Export Queue (.csv)** or **Export History (.csv)**
4. Files download with timestamp in filename
5. Open in Excel/Sheets for further analysis

### Managing Case Types

1. Go to **Settings** tab
2. Add custom types in the text input
3. Remove default types as needed
4. Types update immediately in all pages

---

## Key Concepts

### Auto-Capture
Content script runs on Paragon case pages and sends the URL + timestamp to background worker. **Duplicates are prevented** - same URL won't be added twice.

### AHT (Average Handling Time)
Calculated as: `(completedAt - openedAt) / validCases`  
**Abort cases excluded** - any case type containing "abort" (case-insensitive) is excluded.

### Storage
All data stored in **Chrome Local Storage** (not cloud). Data persists across browser sessions but is local to that browser instance.

### Message-Driven Architecture
All communication between pages and service worker happens via `chrome.runtime.sendMessage()`. This ensures proper async handling.

---

## Permissions Breakdown

| Permission | Purpose |
|-----------|---------|
| `tabs` | Open/switch case tabs from dashboard |
| `storage` | Save queue, history, case types locally |
| `activeTab` | Required for content script injection |
| `scripting` | Inject capture.js into Paragon pages |
| `host_permissions` | Limited to Paragon URLs only |

---

## Troubleshooting

### Cases not auto-capturing?
- Check manifest's `content_scripts.matches` patterns
- Ensure you're visiting the exact URL pattern
- Check `chrome://extensions/` for errors

### Charts not showing?
- Verify `chart.js` is in the root folder
- Check browser console for JavaScript errors
- Refresh the Performance page

### Data not persisting?
- Check that storage isn't disabled
- Ensure chrome://extensions/ shows the extension as enabled
- Check DevTools Storage tab

---

## License

Personal Use / Internal Tool

---

**Author:** Sk Md Rohan  
[LinkedIn](https://www.linkedin.com/in/rohan2by1) | [GitHub](https://www.github.com/rohan2by1)
