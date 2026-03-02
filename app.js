// ═══════════════════════════════════════
// COLLAPSE↑ — APP LOGIC v3.5
// ═══════════════════════════════════════

// ─── STATE ───
let lang          = localStorage.getItem('cu_lang') || 'en';
let visited       = localStorage.getItem('cu_v35');
let totalObs      = parseInt(localStorage.getItem('cu_obs') || '0');
let stateObs      = JSON.parse(localStorage.getItem('cu_sobs') || '{}');
let curStep       = 0;
let collapseStage = 0;
let curStateName  = '';
let breathCycle   = 0;
let breathTimers  = [];
let breathRunning = false;
let largeFnt      = false;
let stillT        = null;
let audioCtx      = null;
let droneNodes    = [];
let stepReady     = true; // debounce guard for initiation steps

// ─── AUDIO ───
function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}
function tryDrone() {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') { audioCtx.resume().then(playDrone); return; }
  playDrone();
}
function playDrone() {
  if (!audioCtx || droneNodes.length) return;
  [432, 216, 144, 108].forEach((f, i) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.022 - i * 0.004, audioCtx.currentTime + 3);
    o.connect(g); g.connect(audioCtx.destination); o.start();
    droneNodes.push({ o, g });
  });
}
function playCollapseSound() {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(220, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 1);
  g.gain.setValueAtTime(0, audioCtx.currentTime);
  g.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.2);
  g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.6);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + 2);
  const b = audioCtx.createOscillator(), bg = audioCtx.createGain();
  b.type = 'sine'; b.frequency.value = 1320;
  bg.gain.setValueAtTime(0, audioCtx.currentTime + 0.75);
  bg.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.85);
  bg.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.5);
  b.connect(bg); bg.connect(audioCtx.destination);
  b.start(audioCtx.currentTime + 0.75); b.stop(audioCtx.currentTime + 4);
}

// ─── BREATH TIMER HELPERS ───
function bDelay(fn, ms) {
  const t = setTimeout(fn, ms);
  breathTimers.push(t);
  return t;
}
function clearAllBreath() {
  breathTimers.forEach(t => clearTimeout(t));
  breathTimers = [];
  breathRunning = false;
}

// ─── PARTICLES ───
const cv = document.getElementById('particleCanvas');
const cx = cv.getContext('2d');
let pts = [];
function rsz() { cv.width = innerWidth; cv.height = innerHeight; }
window.addEventListener('resize', rsz); rsz();
class Pt {
  constructor() { this.reset(); }
  reset() {
    this.x  = Math.random() * cv.width;
    this.y  = Math.random() * cv.height;
    this.vx = (Math.random() - .5) * .20;
    this.vy = (Math.random() - .5) * .20 - .06;
    this.r  = Math.random() * 1.0 + .2;
    this.op = Math.random() * .28 + .06;
    this.life = 0;
    this.ml = Math.random() * 260 + 130;
  }
  update() { this.x += this.vx; this.y += this.vy; this.life++; if (this.life > this.ml || this.y < -10) this.reset(); }
  draw() {
    const a = this.op * (1 - (this.life / this.ml) ** 2);
    cx.beginPath(); cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    cx.fillStyle = `rgba(201,169,110,${a})`; cx.fill();
  }
}
function initPts() { pts = Array.from({ length: 48 }, () => new Pt()); }
function animPts() { cx.clearRect(0, 0, cv.width, cv.height); pts.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animPts); }
initPts(); animPts();

// ─── SCREEN TRANSITIONS ───
// Fully clears all inline styles on both screens after transition
// so CSS classes (.screen / .screen.active) have complete authority
function crossFade(fromId, toId, dur, cb) {
  const from = document.getElementById(fromId);
  const to   = document.getElementById(toId);
  if (!from || !to) return;

  // Fade out the leaving screen
  from.style.transition    = `opacity ${dur}s ease`;
  from.style.opacity       = '0';
  from.style.pointerEvents = 'none';

  setTimeout(() => {
    // Fully reset leaving screen — CSS (.screen = opacity:0, pointer-events:none) takes over
    from.classList.remove('active');
    from.style.transition    = '';
    from.style.opacity       = '';
    from.style.pointerEvents = '';

    // Prepare arriving screen
    to.style.opacity    = '0';
    to.style.transition = 'none';
    to.classList.add('active');

    requestAnimationFrame(() => requestAnimationFrame(() => {
      to.style.transition    = `opacity ${dur}s ease`;
      to.style.opacity       = '1';
      to.style.pointerEvents = 'all';

      setTimeout(() => {
        // Fully reset arriving screen — CSS (.screen.active = opacity:1, pointer-events:all) takes over
        to.style.transition    = '';
        to.style.opacity       = '';
        to.style.pointerEvents = '';
        if (cb) cb();
      }, dur * 1000);
    }));
  }, dur * 500);
}

// ─── LANG & FONT ───
function setLang(l) {
  lang = l;
  localStorage.setItem('cu_lang', l);
  document.getElementById('langBtn').textContent = l === 'en' ? 'EN / ES' : 'ES / EN';
  updateLabels();
}
function updateLabels() {
  const labels = document.querySelectorAll('.glyph-label');
  if (labels.length >= 2) {
    labels[0].textContent = lang === 'en' ? 'still'   : 'quieto';
    labels[1].textContent = lang === 'en' ? 'observe' : 'observar';
  }
  const rev = document.getElementById('revisitBtn');
  if (rev) rev.textContent = lang === 'en' ? 'revisit introduction' : 'revisitar introducción';
}
document.getElementById('langBtn').addEventListener('click', () => {
  setLang(lang === 'en' ? 'es' : 'en');
  const active = document.querySelector('.screen.active');
  if (active && active.id === 's-field') buildField();
  if (active && active.id === 's-init')  buildInit();
});
document.getElementById('fontBtn').addEventListener('click', () => {
  largeFnt = !largeFnt;
  document.body.classList.toggle('large', largeFnt);
  document.getElementById('fontBtn').textContent = largeFnt ? 'A−' : 'A+';
});

// ─── SIGIL SEQUENCE ───
//
// NEW SEQUENCE:
// 1. Arrow fades in and crystallizes (with sound)
// 2. Arrow holds, glowing
// 3. Arrow slowly dissolves
// 4. Where it pointed — the particle materialises at screen centre
// 5. Wordmark fades in beneath
// 6. Advance to next screen
//
function runSigil() {
  const arrow = document.getElementById('sigilArrow');
  const wm    = document.getElementById('sigilWm');
  const sp    = document.getElementById('sigilParticle');

  const fast  = !!visited;

  if (fast) {
    // Returning users — condensed 4s version, still beautiful
    setTimeout(() => {
      arrow.classList.add('crystallized');
      initAudio();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().then(playCollapseSound);
      else playCollapseSound();
    }, 400);

    setTimeout(() => { arrow.classList.add('dissolving'); }, 1800);

    setTimeout(() => {
      sp.classList.add('visible');
      setTimeout(() => { sp.style.transition = ''; }, 2200);
    }, 2600);

    setTimeout(() => { wm.style.opacity = '1'; }, 3000);

    setTimeout(() => {
      tryDrone();
      // Hide particle before field — field has no particle
      sp.style.transition = 'opacity 0.8s ease';
      sp.style.opacity    = '0';
      buildField();
      crossFade('s-sigil', 's-field', 1.2);
    }, 4200);

  } else {
    // First-time users — full ceremony
    setTimeout(() => {
      arrow.classList.add('crystallized');
      initAudio();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().then(playCollapseSound);
      else playCollapseSound();
    }, 800);

    // Arrow holds for ~2s after crystallizing, then dissolves
    setTimeout(() => { arrow.classList.add('dissolving'); }, 3200);

    // Particle materialises at screen centre where arrow was pointing
    setTimeout(() => {
      sp.classList.add('visible');
      // Clear any inline transition after opacity settles so spGlow animation runs clean
      setTimeout(() => { sp.style.transition = ''; }, 2200);
    }, 4400);

    setTimeout(() => { wm.style.opacity = '1'; }, 5000);

    // Transition to initiation — particle fades out as init screen fades in
    // (init screen has its own particle in the same visual region)
    setTimeout(() => {
      buildInit();
      sp.style.transition = 'opacity 1.4s ease';
      sp.style.opacity    = '0';
      crossFade('s-sigil', 's-init', 1.4);
    }, 7000);
  }
}

// ─── INITIATION ───
function buildInit() {
  // Show the fixed quantum particle
  const ip = document.getElementById('initParticle');
  if (ip) { ip.style.transition = 'opacity 1.2s ease'; ip.classList.add('visible'); }
  const steps = STEPS[lang];
  const body  = document.getElementById('initBody');
  body.innerHTML = '';
  stepReady = false; // lock until first step renders
  setTimeout(() => { stepReady = true; }, 1500);

  steps.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'step' + (i === 0 ? ' on' : '');
    div.dataset.i = i;

    // Build clean, single-voice content — no labels, no colour chaos
    let h = '';

    if (s.big)   h += `<div class="s-main">${s.big.replace(/\n/g,'<br>').replace(/<em>/g,'<b>').replace(/<\/em>/g,'</b>')}</div>`;
    if (s.eq)    h += `<div class="s-eq">${s.eq}<br><span style="color:rgba(201,169,110,.32);font-size:.85em">${s.eqSub}</span></div>`;
    if (s.small) h += `<div class="s-sup">${s.small.replace(/\n/g,'<br>').replace(/<em>/g,'<b>').replace(/<\/em>/g,'</b>')}</div>`;
    if (s.note)  h += `<div class="s-note">${s.note.replace(/<span>/g,'<b>').replace(/<\/span>/g,'</b>')}</div>`;
    if (s.isLast) h += `<button class="ready-btn" id="readyBtn">${TRANSLATIONS[lang].readyBtn}</button>`;

    div.innerHTML = h;
    if (s.isLast) div.querySelector('#readyBtn').addEventListener('click', enterField);
    body.appendChild(div);
  });

  // Dots
  const dots = document.getElementById('sdots');
  dots.innerHTML = '';
  steps.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'sdot' + (i === 0 ? ' on' : '');
    dots.appendChild(d);
  });

  document.getElementById('taph').textContent = TRANSLATIONS[lang].tapHint;
  curStep = 0;
}

function advanceStep() {
  if (!stepReady) return; // debounce — ignore tap until step has settled
  const steps = STEPS[lang];
  if (curStep >= steps.length - 1) return;

  const cur = document.querySelector('.step.on');
  if (!cur) return;

  stepReady = false; // lock during transition

  // Dissolve current step
  cur.style.transition = 'opacity 0.7s ease';
  cur.style.opacity    = '0';

  setTimeout(() => {
    cur.classList.remove('on');
    cur.style.opacity    = '';
    cur.style.transition = '';
    curStep++;

    const next = document.querySelector(`.step[data-i="${curStep}"]`);
    if (next) {
      next.style.opacity    = '0';
      next.style.transition = 'none';
      next.classList.add('on');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        next.style.transition = 'opacity 0.8s ease';
        next.style.opacity    = '1';
        setTimeout(() => {
          next.style.transition = '';
          next.style.opacity    = '';
          // Unlock after step has had time to breathe — 1.5s dwell minimum
          setTimeout(() => { stepReady = true; }, 1500);
        }, 800);
      }));
    }

    // Update dots
    document.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('on', i <= curStep));

    // Update hint on last step
    document.getElementById('taph').textContent =
      steps[curStep].isLast ? TRANSLATIONS[lang].tapHintLast : TRANSLATIONS[lang].tapHint;

  }, 700);
}

document.getElementById('s-init').addEventListener('click', e => {
  if (e.target.id === 'readyBtn' || e.target.classList.contains('ready-btn')) return;
  if (e.target.closest('#chrome')) return;
  advanceStep();
});

// ─── FIELD ───
function buildField() {
  const t = TRANSLATIONS[lang];
  document.getElementById('fline').textContent     = t.fieldLine;
  document.getElementById('stillTxt').innerHTML    = t.stillTxt.replace(/\n/g, '<br>');
  document.getElementById('stillBack').textContent = t.stillBack;
  document.getElementById('obsCt').textContent     = totalObs > 0 ? t.obsCount(totalObs) : '';
  updateLabels();

  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  STATES[lang].forEach(st => {
    const o   = document.createElement('div');
    o.className = 'orb';
    const len  = st.name.length;
    const size = len <= 5  ? 'var(--fwm)'
               : len <= 7  ? 'clamp(22px,5.5vw,30px)'
               : len <= 9  ? 'clamp(18px,4.6vw,25px)'
               :              'clamp(15px,3.8vw,20px)';
    o.innerHTML = `<div class="oname" style="font-size:${size}">${st.name}</div>`;
    const go = () => selectState(st);
    o.addEventListener('click', go);
    o.addEventListener('touchend', e => { e.preventDefault(); go(); });
    grid.appendChild(o);
  });

  document.querySelectorAll('.al').forEach(l => l.classList.add('on'));
}

// ─── REVISIT INITIATION ───
document.getElementById('revisitBtn').addEventListener('click', () => {
  buildInit();
  crossFade('s-field', 's-init', 1.0);
});

// ─── SELECT STATE ───
function selectState(state) {
  if (navigator.vibrate) navigator.vibrate(38);
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  playCollapseSound();

  const b = document.getElementById('burst');
  b.classList.remove('go'); void b.offsetWidth; b.classList.add('go');

  totalObs++;
  if (!stateObs[state.name]) stateObs[state.name] = 0;
  stateObs[state.name]++;
  localStorage.setItem('cu_obs', totalObs);
  localStorage.setItem('cu_sobs', JSON.stringify(stateObs));
  curStateName = state.name;

  // Ghost state names
  const gh = document.getElementById('ghosts');
  gh.innerHTML = '';
  gh.style.transition = 'opacity 0s';
  gh.style.opacity    = '0';
  const pos = [
    {top:'7%',left:'4%'},{top:'11%',right:'5%'},
    {bottom:'17%',left:'5%'},{bottom:'21%',right:'4%'},
    {top:'43%',left:'2%'},{top:'39%',right:'3%'},
    {top:'23%',left:'46%'},{bottom:'36%',right:'26%'}
  ];
  STATES[lang].filter(s => s.name !== state.name).forEach((s, i) => {
    const g = document.createElement('div');
    g.className   = 'gst';
    g.textContent = s.name;
    Object.assign(g.style, pos[i] || {top:Math.random()*70+'%',left:Math.random()*70+'%'});
    g.style.animationDelay = (i * .3) + 's';
    gh.appendChild(g);
  });

  // Populate all stage content
  const t = TRANSLATIONS[lang];
  const n = stateObs[state.name];

  document.getElementById('cword').textContent      = state.name;
  document.getElementById('cLabel').textContent     = t.cLabel;
  document.getElementById('cSub').textContent       = t.cSub;
  document.getElementById('ceq').textContent        = state.eq;
  document.getElementById('ceqNote').textContent    = t.ceqNote;
  document.getElementById('imagLabel').textContent  = t.imagLabel;
  document.getElementById('imagPrompt').textContent = getImagination(lang, state.name);
  document.getElementById('obsNote').innerHTML      =
    (n === 1 ? t.obsFirst(state.name) : t.obsMany(state.name, n)).replace(/\n/g,'<br>');
  document.getElementById('qlabel').textContent     = t.qlabel;
  document.getElementById('qtext').textContent      = state.question;
  document.getElementById('retBtn').textContent     = t.retBtn;

  // Closing — letter by letter, 2s lead delay
  const closingEl   = document.getElementById('closing');
  const closingText = t.closings[Math.floor(Math.random() * t.closings.length)];
  closingEl.innerHTML = '';
  closingText.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.className         = 'closing-letter';
    span.textContent       = ch;
    span.style.animationDelay = (7.5 + i * 0.045) + 's';
    closingEl.appendChild(span);
  });

  // Reset all stages
  collapseStage = 0;
  document.querySelectorAll('.cp-stage').forEach(s => {
    s.style.transition    = 'none';
    s.classList.remove('on');
    s.style.opacity       = '0';
    s.style.pointerEvents = 'none';
  });
  clearAllBreath();
  document.getElementById('tapNext').textContent = t.tapHint;

  crossFade('s-field', 's-collapse', 1.0, () => {
    gh.style.transition = 'opacity 1.8s ease';
    gh.style.opacity    = '1';
    setTimeout(() => showCollapseStage(1), 200);
  });
}

// ─── COLLAPSE STAGES ───
function showCollapseStage(n) {
  const current = document.querySelector('.cp-stage.on');
  const reveal  = () => {
    collapseStage = n;
    const el = document.getElementById('cs' + n);
    if (!el) return;
    el.style.transition    = 'none';
    el.style.opacity       = '0';
    el.style.pointerEvents = 'none';
    el.classList.add('on');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition    = 'opacity 0.9s ease';
      el.style.opacity       = '1';
      el.style.pointerEvents = 'all';
    }));
    const tapEl = document.getElementById('tapNext');
    tapEl.style.transition = 'opacity 0.7s ease';
    tapEl.style.opacity    = n < 6 ? '1' : '0';
    if (n === 4) startBreath();
  };
  if (current) {
    current.style.transition    = 'opacity 0.7s ease';
    current.style.opacity       = '0';
    current.style.pointerEvents = 'none';
    setTimeout(() => { current.classList.remove('on'); reveal(); }, 700);
  } else {
    reveal();
  }
}

document.getElementById('s-collapse').addEventListener('click', e => {
  if (e.target.id === 'retBtn' || e.target.classList.contains('return-btn')) return;
  if (e.target.closest('#chrome')) return;
  if (collapseStage === 4 && breathRunning) return;
  if (collapseStage < 6) showCollapseStage(collapseStage + 1);
});

// ─── BREATH ───
function startBreath() {
  clearAllBreath();
  breathRunning = true;
  breathCycle   = 0;
  const stateName = curStateName;
  const t         = TRANSLATIONS[lang];
  const p         = document.getElementById('bp');
  const ripple    = document.getElementById('bripple');
  const instr     = document.getElementById('binstr');
  const sn        = document.getElementById('bsname');
  const ctr       = document.getElementById('bctr');
  const bend      = document.getElementById('bend');

  p.className      = 'bp neutral';
  sn.style.opacity = '0';
  bend.classList.remove('on');
  bend.innerHTML   = '';
  ripple.classList.remove('expand');

  function fadeText(el, newText) {
    el.style.transition = 'opacity 0.5s ease';
    el.style.opacity    = '0';
    bDelay(() => { el.textContent = newText; el.style.opacity = '1'; }, 500);
  }

  function cycle() {
    if (breathCycle >= 3) {
      breathRunning = false;
      instr.style.transition = 'opacity 0.6s ease';
      instr.style.opacity    = '0';
      bDelay(() => {
        sn.style.transition = 'opacity 1s ease';
        sn.style.opacity    = '1';
        bend.innerHTML      = `<p>${t.breathEnd(stateName).replace(/\n/g,'<br>')}</p>`;
        bend.classList.add('on');
        ctr.textContent     = '';
      }, 600);
      bDelay(() => { if (collapseStage === 4) showCollapseStage(5); }, 4000);
      return;
    }
    breathCycle++;
    ctr.textContent = t.breathCycles(breathCycle, 3);
    fadeText(instr, t.breathInhale);
    sn.style.transition = 'opacity 0.5s ease';
    sn.style.opacity    = '0';
    ripple.classList.remove('expand');
    void ripple.offsetWidth;
    bDelay(() => {
      p.className = 'bp inhaling';
      bDelay(() => {
        p.className = 'bp holding';
        fadeText(instr, t.breathHold);
        bDelay(() => {
          p.className = 'bp exhaling';
          fadeText(instr, t.breathExhale(stateName));
          sn.style.transition = 'opacity 1s ease';
          sn.style.opacity    = '1';
          ripple.classList.remove('expand');
          void ripple.offsetWidth;
          ripple.classList.add('expand');
          bDelay(() => {
            sn.style.opacity = '0';
            p.className      = 'bp neutral';
            bDelay(cycle, 800);
          }, 4400);
        }, 1300);
      }, 4100);
    }, 120);
  }
  cycle();
}

// ─── RETURN TO FIELD ───
document.getElementById('retBtn').addEventListener('click', () => {
  clearAllBreath();
  const gh = document.getElementById('ghosts');
  gh.style.transition = 'opacity 0.8s ease';
  gh.style.opacity    = '0';
  setTimeout(() => { gh.innerHTML = ''; }, 800);
  crossFade('s-collapse', 's-field', 1.0, () => buildField());
});

// ─── STILL MODE ───
document.getElementById('gStill').addEventListener('click', enterStill);
document.getElementById('gStill').addEventListener('touchend', e => { e.preventDefault(); enterStill(); });
function enterStill() {
  clearInterval(stillT);
  let sec = 300;
  const fmt = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  document.getElementById('stillTmr').textContent = fmt(sec);
  crossFade('s-field', 's-still', 1.0);
  stillT = setInterval(() => {
    sec--;
    document.getElementById('stillTmr').textContent = sec > 0 ? fmt(sec) : '';
    if (sec <= 0) clearInterval(stillT);
  }, 1000);
}
document.getElementById('stillBack').addEventListener('click', () => {
  clearInterval(stillT);
  crossFade('s-still', 's-field', 1.0, () => buildField());
});

// ─── BREATH GLYPH ───
document.getElementById('gBreath').addEventListener('click', breathGlyph);
document.getElementById('gBreath').addEventListener('touchend', e => { e.preventDefault(); breathGlyph(); });
function breathGlyph() {
  const st = curStateName
    ? STATES[lang].find(s => s.name === curStateName) || STATES[lang][0]
    : STATES[lang][Math.floor(Math.random() * 8)];
  selectState(st);
}

// ─── ENTER FIELD ───
function enterField() {
  // Hide the initiation particle
  const ip = document.getElementById('initParticle');
  if (ip) { ip.style.transition = 'opacity 0.8s ease'; ip.classList.remove('visible'); }
  tryDrone();
  localStorage.setItem('cu_v35', '1');
  visited = true;
  buildField();
  crossFade('s-init', 's-field', 1.2);
}

// ─── BOOT ───
setLang(lang);
runSigil();
