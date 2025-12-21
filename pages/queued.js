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
