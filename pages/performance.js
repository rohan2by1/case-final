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