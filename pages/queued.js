import { send, fmt, openOrFocusTab } from '../utils.js';

async function load() {
  const r = await send({ type: "GET_DATA" });
  const tbody = document.querySelector("#table tbody");
  tbody.innerHTML = "";
  
  const list = r.queue || [];
  const types = r.caseTypes || []; 

  list.forEach((item, i) => {
    const tr = document.createElement("tr");
    
    // Index
    const tdIndex = document.createElement("td");
    tdIndex.textContent = String(i + 1);
    
    // Link (Modified to trim first 50 chars)
    const tdLink = document.createElement("td");
    // Check length to avoid error on short strings
    const displayUrl = item.url.length > 50 ? "..." + item.url.slice(50) : item.url;
    tdLink.textContent = displayUrl;
    tdLink.title = item.url; // Hover to see full URL
    
    // Opened
    const tdOpened = document.createElement("td");
    tdOpened.textContent = fmt(item.openedAt);
    
    // --- STYLED DROPDOWN ---
    const tdType = document.createElement("td");
    const select = document.createElement("select");
    select.className = "custom-select"; 
    
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Type...";
    defaultOption.disabled = true;
    if (!item.caseType || !types.includes(item.caseType)) {
        defaultOption.selected = true;
    }
    select.appendChild(defaultOption);

    types.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      if (item.caseType === t) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    const tdActions = document.createElement("td");
    tdActions.className = "actions";

    const btnComplete = document.createElement("button");
    btnComplete.textContent = "Complete";
    btnComplete.className = "btn btn-success";
    btnComplete.disabled = !item.caseType || !types.includes(item.caseType);

    select.addEventListener("change", async (e) => {
        const val = e.target.value;
        await send({ type: "UPDATE_CASE_TYPE", url: item.url, caseType: val });
        btnComplete.disabled = (val === "");
    });

    tdType.appendChild(select);

    const btnOpen = document.createElement("button");
    btnOpen.textContent = "Open";
    btnOpen.className = "btn btn-info"; 
    btnOpen.addEventListener("click", () => openOrFocusTab(item.url));
    
    btnComplete.addEventListener("click", async () => {
      if (select.value && types.includes(select.value)) {
        await send({ type: "MARK_COMPLETED", url: item.url });
        await load();
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
}

document.getElementById("refresh").addEventListener("click", load);
load();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.queue || changes.caseTypes)) load();
});