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