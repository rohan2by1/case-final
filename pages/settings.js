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