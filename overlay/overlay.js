// overlay.js — open overlay on button click, populate and allow live edit + save/export

// --- OPTIONAL: teamsData fallback (use your images names in /images/) ---
const teamsData = {
  t1: { id:'t1', name:'Rising Stars', logo:'images/t1.png' },
  t2: { id:'t2', name:'Balouch Raiders', logo:'images/t2.png' },
  t3: { id:'t3', name:'Flying Eagles', logo:'images/t3.png' },
  t4: { id:'t4', name:'Haidari Legends', logo:'images/t4.png' },
  t5: { id:'t5', name:'Super Kings', logo:'images/t5.png' },
  t6: { id:'t6', name:'Sultan Tigers', logo:'images/t6.png' }
};

// Utilities
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const overlay = $('#scoreOverlay');
const backdrop = $('#overlayBackdrop');
const closeBtn = $('#overlayClose');
const btnApply = $('#btnApply');
const btnSaveLocal = $('#btnSaveLocal');
const btnExport = $('#btnExport');

// elements to populate
const teamAName = $('#teamAName'), teamBName = $('#teamBName');
const teamALogo = $('#teamALogo'), teamBLogo = $('#teamBLogo');
const scoreAel = $('#scoreA'), scoreBel = $('#scoreB');
const wktAel = $('#wktA'), wktBel = $('#wktB');
const ovAel = $('#ovA'), ovBel = $('#ovB');
const resultEl = $('#resultLine');
const liveTicker = $('#liveBatsman');
const topScorers = $('#topScorers'), bowlers = $('#bowlers');

// inputs
const inpRunsA = $('#inpRunsA'), inpRunsB = $('#inpRunsB');
const inpWktsA = $('#inpWktsA'), inpWktsB = $('#inpWktsB');
const inpOvA = $('#inpOvA'), inpOvB = $('#inpOvB');
const inpTicker = $('#inpTicker'), inpResult = $('#inpResult');

// open function — pass team ids and optional initial data
function openOverlay(opts = {}) {
  const {teamA='t1', teamB='t4', matchId='manual', initial={}} = opts;
  const a = teamsData[teamA] || {name: teamA, logo:'images/placeholder.png'};
  const b = teamsData[teamB] || {name: teamB, logo:'images/placeholder.png'};

  // populate teams
  teamAName.textContent = a.name; teamALogo.src = a.logo;
  teamBName.textContent = b.name; teamBLogo.src = b.logo;

  // load either initial or defaults or saved localStorage
  const key = 'cfl_overlay_' + matchId;
  const saved = localStorage.getItem(key);
  let data = saved ? JSON.parse(saved) : (Object.keys(initial).length ? initial : {
    runsA: inpRunsA.value, wktsA: inpWktsA.value, ovA: inpOvA.value,
    runsB: inpRunsB.value, wktsB: inpWktsB.value, ovB: inpOvB.value,
    ticker: inpTicker.value, result: inpResult.value
  });

  // set display & inputs
  scoreAel.textContent = data.runsA || inpRunsA.value;
  wktAel.textContent = data.wktsA || inpWktsA.value;
  ovAel.textContent = data.ovA || inpOvA.value;

  scoreBel.textContent = data.runsB || inpRunsB.value;
  wktBel.textContent = data.wktsB || inpWktsB.value;
  ovBel.textContent = data.ovB || inpOvB.value;

  liveTicker.textContent = data.ticker || inpTicker.value;
  resultEl.textContent = data.result || inpResult.value;

  // update input fields
  inpRunsA.value = data.runsA || inpRunsA.value;
  inpWktsA.value = data.wktsA || inpWktsA.value;
  inpOvA.value = data.ovA || inpOvA.value;

  inpRunsB.value = data.runsB || inpRunsB.value;
  inpWktsB.value = data.wktsB || inpWktsB.value;
  inpOvB.value = data.ovB || inpOvB.value;

  inpTicker.value = data.ticker || inpTicker.value;
  inpResult.value = data.result || inpResult.value;

  // show overlay
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden','false');

  // attach currentMatch key for save/export
  overlay.currentMatchKey = key;
}

// close overlay
function closeOverlay() {
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden','true');
}

// apply button (live update)
btnApply.addEventListener('click', () => {
  scoreAel.textContent = inpRunsA.value || '0';
  wktAel.textContent = inpWktsA.value || '0';
  ovAel.textContent = inpOvA.value || '0.0';

  scoreBel.textContent = inpRunsB.value || '0';
  wktBel.textContent = inpWktsB.value || '0';
  ovBel.textContent = inpOvB.value || '0.0';

  liveTicker.textContent = inpTicker.value || '';
  resultEl.textContent = inpResult.value || '';
});

// save locally
btnSaveLocal.addEventListener('click', () => {
  const key = overlay.currentMatchKey || ('cfl_overlay_manual');
  const payload = {
    runsA: inpRunsA.value, wktsA: inpWktsA.value, ovA: inpOvA.value,
    runsB: inpRunsB.value, wktsB: inpWktsB.value, ovB: inpOvB.value,
    ticker: inpTicker.value, result: inpResult.value
  };
  localStorage.setItem(key, JSON.stringify(payload));
  alert('Saved locally in browser.');
});

// export json (copy to clipboard)
btnExport.addEventListener('click', async () => {
  const key = overlay.currentMatchKey || ('cfl_overlay_manual');
  const s = localStorage.getItem(key);
  if (!s) { alert('No saved data found. Click Save Local first.'); return; }
  try {
    await navigator.clipboard.writeText(s);
    alert('Score JSON copied to clipboard. Paste into repo or store as file.');
  } catch (e) {
    alert('Copy failed — open console/localStorage to get data.');
  }
});

// close handlers
closeBtn.addEventListener('click', closeOverlay);
backdrop.addEventListener('click', closeOverlay);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlay(); });

// --- Hookup: attach to any "View Scorecard" buttons that have data attributes
function attachViewButtons() {
  const buttons = document.querySelectorAll('[data-scoreview]');
  buttons.forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const teamA = btn.getAttribute('data-teamA') || 't1';
      const teamB = btn.getAttribute('data-teamB') || 't4';
      const matchId = btn.getAttribute('data-match') || ('manual_' + Date.now());
      openOverlay({teamA, teamB, matchId});
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  attachViewButtons();
});
                                
