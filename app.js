'use strict';

const DEFAULT_TS = new Date('2026-02-26T23:30:00Z').getTime(); // Feb 26 2026, 6:30 PM EST

const setupSection   = document.getElementById('setup');
const counterSection = document.getElementById('counter');
const startDateInput = document.getElementById('start-date');
const startBtn       = document.getElementById('start-btn');
const sinceLabel     = document.getElementById('since-label');

const elDays    = document.getElementById('days');
const elHours   = document.getElementById('hours');
const elMinutes = document.getElementById('minutes');
const elSeconds = document.getElementById('seconds');

const elTotalDays    = document.getElementById('total-days');
const elTotalHours   = document.getElementById('total-hours');
const elTotalMinutes = document.getElementById('total-minutes');

let intervalId = null;
let startTs    = null;

// ---- Start button ----------------------------------------------------------

startBtn.addEventListener('click', () => {
  const val = startDateInput.value;
  if (!val) return;
  const ts = new Date(val).getTime();
  if (isNaN(ts)) return;
  begin(ts);
});

// ---- Core logic ------------------------------------------------------------

function begin(ts) {
  if (intervalId) clearInterval(intervalId);
  startTs = ts;
  showCounter(ts);
  tick();
  intervalId = setInterval(tick, 1000);
}

function tick() {
  const elapsed = Math.max(0, Date.now() - startTs);
  const totalMinutes = Math.floor(elapsed / 60_000);
  const totalHours   = Math.floor(elapsed / 3_600_000);
  const totalDays    = Math.floor(elapsed / 86_400_000);
  const hours        = Math.floor((elapsed % 86_400_000) / 3_600_000);
  const minutes      = Math.floor((elapsed % 3_600_000) / 60_000);
  const seconds      = Math.floor((elapsed % 60_000) / 1000);

  elDays.textContent    = totalDays;
  elHours.textContent   = pad(hours);
  elMinutes.textContent = pad(minutes);
  elSeconds.textContent = pad(seconds);

  elTotalDays.textContent    = totalDays.toLocaleString();
  elTotalHours.textContent   = totalHours.toLocaleString();
  elTotalMinutes.textContent = totalMinutes.toLocaleString();
}

// ---- UI helpers ------------------------------------------------------------

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

// ---- Auto-start on load ----------------------------------------------------

startDateInput.value = '2026-02-26T18:30';
begin(DEFAULT_TS);

// ---- Service worker --------------------------------------------------------

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const reg = await navigator.serviceWorker.register('sw.js').catch(() => null);
    if (!reg) return;
    reg.update();
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  });
}
