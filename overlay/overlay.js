// overlay.js — CFL Live Score Overlay (TV Broadcast Style)

// --- TEAMS DATA (logos in overlay/images/) ---
const teamsData = {
  t1: { id: 't1', name: 'Rising Stars', logo: 'overlay/images/t1.png' },
  t2: { id: 't2', name: 'Balouch Raiders', logo: 'overlay/images/t2.png' },
  t3: { id: 't3', name: 'Flying Eagles', logo: 'overlay/images/t3.png' },
  t4: { id: 't4', name: 'Haidari Legends', logo: 'overlay/images/t4.png' },
  t5: { id: 't5', name: 'Super Kings', logo: 'overlay/images/t5.png' },
  t6: { id: 't6', name: 'Sultan Tigers', logo: 'overlay/images/t6.png' }
};

// --- UTILITIES ---
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const overlay = $('#scoreOverlay');
const backdrop = $('#overlayBackdrop');
const closeBtn = $('#overlayClose');
const btnApply = $('#btnApply');
const btnSaveLocal = $('#btnSaveLocal');
const btnExport = $('#btnExport');

// display elements
const teamAName = $('#teamAName'), teamBName = $('#teamBName');
const teamALogo = $('#teamALogo'), teamBLogo = $('#teamBLogo');
const scoreAel = $('#scoreA'), scoreBel = $('#scoreB');
const wktAel = $('#wktA'), wktBel = $('#wktB');
const ovAel = $('#ovA'), ovBel = $('#ovB');
const resultEl = $('#resultLine');
const liveTicker = $('#liveBatsman');

// input elements
const inpRunsA = $('#inpRunsA'), inpWktsA = $('#inpWktsA'), inpOvA = $('#inpOvA');
const inpRunsB = $('#inpRunsB'), inpWktsB = $('#inpWktsB'), inpOvB = $('#inpOvB');
const inpTicker = $('#inpTicker'), inpResult = $('#inpResult');

// --- OPEN OVERLAY ---
function openOverlay(opts = {}) {
  const { teamA = 't1', teamB = 't4', matchId = 'manual', initial = {} } = opts;
  const a = teamsData[teamA] || { name: teamA, logo: 'overlay/images/placeholder.png' };
  const b = teamsData[teamB] || { name: teamB, logo: 'overlay/images/placeholder.png' };

  // populate team info
  teamAName.textContent = a.name; teamALogo.src = a.logo;
  teamBName.textContent = b.name; teamBLogo.src = b.logo;

  // load local or initial data
  const key = 'cfl_overlay_' + matchId;
  const saved = localStorage.getItem(key);
  let data = saved ? JSON.parse(saved) : (Object.keys(initial).length ? initial : {
    runsA: 0, wktsA: 0, ovA: 0,
    runsB: 0, wktsB: 0, ovB: 0,
    ticker: '', result: ''
  });

  // set values
  scoreAel.textContent = data.runsA;
  wktAel.textContent = data.wktsA;
  ovAel.textContent = data.ovA;
  scoreBel.textContent = data.runsB;
  wktBel.textContent = data.wktsB;
  ovBel.textContent = data.ovB;
  liveTicker.textContent = data.ticker;
  resultEl.textContent = data.result;

  inpRunsA.value = data.runsA;
  inpWktsA.value = data.wktsA;
  inpOvA.value = data.ovA;
  inpRunsB.value = data.runsB;
  inpWktsB.value = data.wktsB;
  inpOvB.value = data.ovB;
  inpTicker.value = data.ticker;
  inpResult.value = data.result;

  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.currentMatchKey = key;
}

// --- CLOSE ---
function closeOverlay() {
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
}

// --- APPLY (LIVE UPDATE) ---
btnApply.addEventListener('click', () => {
  scoreAel.textContent = inpRunsA.value;
  wktAel.textContent = inpWktsA.value;
  ovAel.textContent = inpOvA.value;
  scoreBel.textContent = inpRunsB.value;
  wktBel.textContent = inpWktsB.value;
  ovBel.textContent = inpOvB.value;
  liveTicker.textContent = inpTicker.value;
  resultEl.textContent = inpResult.value;
});

// --- SAVE LOCAL ---
btnSaveLocal.addEventListener('click', () => {
  const key = overlay.currentMatchKey || 'cfl_overlay_manual';
  const payload = {
    runsA: inpRunsA.value, wktsA: inpWktsA.value, ovA: inpOvA.value,
    runsB: inpRunsB.value, wktsB: inpWktsB.value, ovB: inpOvB.value,
    ticker: inpTicker.value, result: inpResult.value
  };
  localStorage.setItem(key, JSON.stringify(payload));
  alert('Score saved locally ✅');
});

// --- EXPORT (COPY JSON) ---
btnExport.addEventListener('click', async () => {
  const key = overlay.currentMatchKey || 'cfl_overlay_manual';
  const s = localStorage.getItem(key);
  if (!s) { alert('No saved data found.'); return; }
  try {
    await navigator.clipboard.writeText(s);
    alert('Copied JSON to clipboard ✅');
  } catch (e) {
    alert('Copy failed ❌');
  }
});

// --- CLOSE EVENTS ---
closeBtn.addEventListener('click', closeOverlay);
backdrop.addEventListener('click', closeOverlay);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlay(); });

// --- ATTACH "VIEW SCORECARD" BUTTONS ---
function attachViewButtons() {
  const buttons = document.querySelectorAll('[data-scoreview]');
  buttons.forEach(btn => {
    btn.addEventListener('click', ev => {
      ev.preventDefault();
      const teamA = btn.getAttribute('data-teamA') || 't1';
      const teamB = btn.getAttribute('data-teamB') || 't4';
      const matchId = btn.getAttribute('data-match') || ('manual_' + Date.now());
      openOverlay({ teamA, teamB, matchId });
    });
  });
}

document.addEventListener('DOMContentLoaded', attachViewButtons);
