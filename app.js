'use strict';

const STORAGE_KEY = 'since-when-start-date';

const setupSection  = document.getElementById('setup');
const counterSection = document.getElementById('counter');
const startDateInput = document.getElementById('start-date');
const startBtn       = document.getElementById('start-btn');
const resetBtn       = document.getElementById('reset-btn');
const sinceLabel     = document.getElementById('since-label');

const elYears   = document.getElementById('years');
const elDays    = document.getElementById('days');
const elHours   = document.getElementById('hours');
const elMinutes = document.getElementById('minutes');
const elSeconds = document.getElementById('seconds');

const elTotalDays    = document.getElementById('total-days');
const elTotalHours   = document.getElementById('total-hours');
const elTotalMinutes = document.getElementById('total-minutes');

let intervalId = null;
let startTs = null;

// ---- Start / reset ---------------------------------------------------------

startBtn.addEventListener('click', () => {
  const val = startDateInput.value;
  if (!val) return;
  const ts = new Date(val).getTime();
  if (isNaN(ts)) return;
  saveAndStart(ts);
});

resetBtn.addEventListener('click', () => {
  clearInterval(intervalId);
  intervalId = null;
  startTs = null;
  localStorage.removeItem(STORAGE_KEY);
  showSetup();
});

// ---- Core logic ------------------------------------------------------------

function saveAndStart(ts) {
  startTs = ts;
  localStorage.setItem(STORAGE_KEY, String(ts));
  showCounter(ts);
  tick();
  intervalId = setInterval(tick, 1000);
}

function tick() {
  if (startTs === null) return;
  const now = Date.now();
  const elapsed = Math.max(0, now - startTs);
  renderElapsed(elapsed);
}

function renderElapsed(ms) {
  const totalSeconds  = Math.floor(ms / 1000);
  const totalMinutes  = Math.floor(ms / 60_000);
  const totalHours    = Math.floor(ms / 3_600_000);
  const totalDays     = Math.floor(ms / 86_400_000);

  // Break into years / remainder-days / hh / mm / ss
  const years         = Math.floor(totalDays / 365);
  const remDays       = totalDays - years * 365;
  const hours         = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes       = Math.floor((ms % 3_600_000) / 60_000);
  const seconds       = Math.floor((ms % 60_000) / 1000);

  elYears.textContent   = years;
  elDays.textContent    = remDays;
  elHours.textContent   = pad(hours);
  elMinutes.textContent = pad(minutes);
  elSeconds.textContent = pad(seconds);

  elTotalDays.textContent    = totalDays.toLocaleString();
  elTotalHours.textContent   = totalHours.toLocaleString();
  elTotalMinutes.textContent = totalMinutes.toLocaleString();
}

// ---- UI helpers ------------------------------------------------------------

function showSetup() {
  setupSection.classList.remove('hidden');
  counterSection.classList.add('hidden');
}

function showCounter(ts) {
  setupSection.classList.add('hidden');
  counterSection.classList.remove('hidden');

  const d = new Date(ts);
  sinceLabel.textContent = `Since ${d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })}`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function toLocalDatetimeString(d) {
  const yyyy = d.getFullYear();
  const mm   = pad(d.getMonth() + 1);
  const dd   = pad(d.getDate());
  const hh   = pad(d.getHours());
  const min  = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

// ---- Restore saved date on load --------------------------------------------

(function init() {
  startDateInput.value = '2026-02-26T18:30';

  const saved = localStorage.getItem(STORAGE_KEY);
  const ts = saved ? Number(saved) : new Date('2026-02-26T18:30').getTime();
  if (!isNaN(ts) && ts > 0) {
    saveAndStart(ts);
  }
})();

// ---- Service worker registration -------------------------------------------

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
