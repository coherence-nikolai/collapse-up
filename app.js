// ═══════════════════════════════════════
// SEE — App Engine v2.1
// Noting · Anchor · Guided · Verbal · Storm
// ═══════════════════════════════════════

// ── STATE ──
let lang        = localStorage.getItem('see_lang') || 'en';
let curScreen   = 's-home';
let noteStep    = 'sense';
let noteData    = {};
let anchorState = 'idle';
let breathInhale = true;
let breathTimer  = null;
let stormIdx     = 0;
let stormLog     = [];
let voiceRec     = null;
let voiceOn      = false;
let verbalRec    = null;
let verbalOn     = false;
let lastTapX     = innerWidth  / 2;
let lastTapY     = innerHeight / 2;

// Guided noting state
let guidedTimer    = null;
let guidedSecs     = 0;
let guidedPhase    = 0; // 0=sense,1=vedana,2=emotion,3=free
let guidedAnimFrame = null;

// Anchor orb state
let anchorOrbRAF = null;
let anchorOrb    = null;

// Track taps
document.addEventListener('touchstart', e => {
  lastTapX = e.touches[0].clientX;
  lastTapY = e.touches[0].clientY;
}, {passive:true});
document.addEventListener('mousedown', e => {
  lastTapX = e.clientX; lastTapY = e.clientY;
}, {passive:true});

// ── RIPPLE ENGINE ──
const canvas = document.getElementById('rippleCanvas');
const ctx    = canvas ? canvas.getContext('2d') : null;
let ripples  = [];

function resizeCanvas() {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = innerWidth  * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width  = innerWidth  + 'px';
  canvas.style.height = innerHeight + 'px';
  if (ctx) { ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr); }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// col: 'amber'|'coral'|'sage'|'sky'|'violet'|'cream'
function spawnRipple(x, y, col, size, rings) {
  const maxR = size === 'lg' ? Math.max(innerWidth, innerHeight) * 0.72
             : size === 'md' ? Math.max(innerWidth, innerHeight) * 0.44
             :                 Math.max(innerWidth, innerHeight) * 0.24;
  const rgb  = col === 'amber'  ? '212,146,74'
             : col === 'coral'  ? '200,96,96'
             : col === 'sage'   ? '90,181,168'
             : col === 'sky'    ? '90,181,212'
             : col === 'violet' ? '148,120,200'
             :                    '239,229,216';
  ripples.push({ x, y, r:2, maxR, rgb, alpha:0.50, rings: rings||3 });
}

function animLoop() {
  requestAnimationFrame(animLoop);
  if (!ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ripples = ripples.filter(rp => rp.alpha > 0.004);
  ripples.forEach(rp => {
    rp.r    += (rp.maxR - rp.r) * 0.018;
    rp.alpha = Math.max(0, rp.alpha - 0.004);
    for (let i = 0; i < rp.rings; i++) {
      const ringR = rp.r * (1 - i * 0.20);
      if (ringR < 1) continue;
      const a = rp.alpha * (1 - i * 0.28);
      ctx.save();
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rp.rgb},${a.toFixed(3)})`;
      ctx.lineWidth   = Math.max(0.4, 1.8 - i * 0.45);
      ctx.shadowColor = `rgba(${rp.rgb},${(a*0.4).toFixed(3)})`;
      ctx.shadowBlur  = 14;
      ctx.stroke();
      ctx.restore();
    }
  });
}
animLoop();

// Ambient home ripple
let ambientActive = false;
function startAmbientRipple() {
  if (ambientActive) return;
  ambientActive = true;
  const pulse = () => {
    if (curScreen !== 's-home') { ambientActive = false; return; }
    const x = innerWidth  * (0.25 + Math.random() * 0.5);
    const y = innerHeight * (0.25 + Math.random() * 0.5);
    spawnRipple(x, y, 'amber', 'lg', 2);
    setTimeout(pulse, 5500 + Math.random() * 4000);
  };
  setTimeout(pulse, 1800);
}

// ── AUDIO ──
let audioCtx = null;

function initAudio() {
  try {
    if (!audioCtx || audioCtx.state === 'closed')
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  } catch(e) {}
}
// Init on first user gesture
document.addEventListener('touchstart', initAudio, {passive:true, once:true});
document.addEventListener('click',      initAudio, {passive:true, once:true});
window.addEventListener('pageshow', () => {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
});

function tone(freq, gain, dur, type) {
  // Always try to init/resume first
  initAudio();
  if (!audioCtx) return;
  try {
    const o  = audioCtx.createOscillator();
    const g  = audioCtx.createGain();
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1200;
    o.type = type || 'sine'; o.frequency.value = freq;
    const t0 = audioCtx.currentTime;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(lp); lp.connect(g); g.connect(audioCtx.destination);
    o.start(t0); o.stop(t0 + dur + 0.1);
  } catch(e) {}
}

// Drone — continuous background tone, returns stop function
function startDrone(freq, gain) {
  initAudio();
  if (!audioCtx) return () => {};
  try {
    const o  = audioCtx.createOscillator();
    const g  = audioCtx.createGain();
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + 2.5);
    o.connect(lp); lp.connect(g); g.connect(audioCtx.destination);
    o.start();
    return () => {
      try {
        g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
        o.stop(audioCtx.currentTime + 1.6);
      } catch(e) {}
    };
  } catch(e) { return () => {}; }
}

let activeDroneStop = null;
function setDrone(freq, gain) {
  if (activeDroneStop) { activeDroneStop(); activeDroneStop = null; }
  if (freq) activeDroneStop = startDrone(freq, gain || 0.025);
}

// ── SCREENS ──
function showScreen(id, cb) {
  const prev = document.querySelector('.screen.active');
  const next = document.getElementById(id);
  if (!next || (prev && prev.id === id)) return;
  if (prev) {
    prev.style.transition = 'opacity .55s ease';
    prev.style.opacity = '0';
    setTimeout(() => prev.classList.remove('active'), 550);
  }
  setTimeout(() => {
    next.classList.add('active');
    next.style.opacity = '';
    curScreen = id;
    if (cb) setTimeout(cb, 80);
  }, prev ? 300 : 0);
}

// ── SETTINGS ──
function openSettings() {
  setDrone(null);
  showScreen('s-settings');
  document.getElementById('chrome').style.display = 'none';
}
function closeSettings() {
  showScreen('s-home');
  document.getElementById('chrome').style.display = 'none';
  startAmbientRipple();
}
function saveKey() {
  const inp = document.getElementById('apiInput');
  if (inp && inp.value.trim()) {
    localStorage.setItem('f2_api_key', inp.value.trim());
    inp.value = ''; inp.placeholder = 'saved ✓';
    setTimeout(() => inp.placeholder = 'Anthropic API key (optional)', 2000);
  }
}
function clearKey() {
  localStorage.removeItem('f2_api_key');
  const inp = document.getElementById('apiInput');
  if (inp) inp.placeholder = 'Anthropic API key (optional)';
}

// ── HOME ──
function goHome() {
  stopVerbal();
  stopVoice();
  clearBreathTimers();
  stopAnchorOrb();
  stopGuidedTimer();
  setDrone(null);
  spawnRipple(lastTapX, lastTapY, 'amber', 'lg', 3);
  showScreen('s-home');
  document.getElementById('chrome').style.display = 'none';
  tone(396, 0.009, 2.8);
  startAmbientRipple();
}

// ── AI ──
async function ai(prompt, system) {
  const key = localStorage.getItem('f2_api_key');
  if (!key) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key':key,
        'anthropic-version':'2023-06-01',
        'anthropic-dangerous-direct-browser-access':'true'
      },
      body:JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:80,
        system,
        messages:[{role:'user',content:prompt}]
      })
    });
    const d = await res.json();
    return d.content?.[0]?.text?.trim() || null;
  } catch(e) { return null; }
}

function showAI(elId, text, dur) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur || 5500);
}

// ══════════════════════════════════════
// MODE 1: NOTING
// ══════════════════════════════════════
function startNoting() {
  noteStep = 'sense'; noteData = {};
  renderNoteStep();
  showScreen('s-noting');
  document.getElementById('chrome').style.display = 'flex';
  // Noting drone — 396 Hz (root/grounding)
  setDrone(396, 0.022);
  tone(440, 0.010, 2.2);
}

function renderNoteStep() {
  const lbl   = document.getElementById('noteLbl');
  const title = document.getElementById('noteTitle');
  const grid  = document.getElementById('chipGrid');
  const aiEl  = document.getElementById('noteAI');
  if (aiEl) { aiEl.textContent=''; aiEl.classList.remove('show'); }

  let items=[], lblTxt='', titleTxt='', chipClass='';
  if (noteStep === 'sense') {
    lblTxt   = lang==='en' ? '01 — sense door' : '01 — puerta sensorial';
    titleTxt = lang==='en' ? 'What are you noticing?' : '¿Qué estás notando?';
    items    = SENSE_DOORS[lang]; chipClass='';
  } else if (noteStep === 'vedana') {
    lblTxt   = lang==='en' ? '02 — feeling tone' : '02 — tono';
    titleTxt = lang==='en' ? 'What is its tone?' : '¿Cuál es su tono?';
    items    = VEDANA[lang]; chipClass='vedana';
  } else if (noteStep === 'emotion') {
    lblTxt   = lang==='en' ? '03 — emotion' : '03 — emoción';
    titleTxt = lang==='en' ? 'Any emotion present?' : '¿Hay emoción presente?';
    items    = EMOTIONS[lang]; chipClass='emotion';
  }
  if (lbl)   lbl.textContent   = lblTxt;
  if (title) title.textContent = titleTxt;
  if (grid) {
    grid.innerHTML = '';
    items.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.className = 'chip' + (chipClass ? ' '+chipClass : '');
      btn.textContent = item;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const col = noteStep==='vedana' ? vedanaColor(i) : noteStep==='emotion' ? 'coral' : 'amber';
        spawnRipple(e.clientX, e.clientY, col, 'md', 3);
        tone(528, 0.009, 1.4);
        // Delay advance to let ripple breathe
        btn.style.pointerEvents = 'none';
        setTimeout(() => selectNote(item, i), 1200);
      });
      grid.appendChild(btn);
    });
  }
}

function vedanaColor(idx) {
  return idx===0 ? 'amber' : idx===1 ? 'coral' : 'sage';
}

function selectNote(item, idx) {
  if (noteStep === 'sense') {
    noteData.sense   = item;
    noteData.senseEN = SENSE_DOORS.en[idx];
    noteStep = 'vedana';
    renderNoteStep();
  } else if (noteStep === 'vedana') {
    noteData.vedana    = item;
    noteData.vedanaEN  = VEDANA.en[idx];
    noteData.vedanaIdx = idx;
    noteStep = 'emotion';
    renderNoteStep();
  } else if (noteStep === 'emotion') {
    noteData.emotion   = item;
    noteData.emotionEN = EMOTIONS.en[idx];
    completeNote(lastTapX, lastTapY);
  }
}

function completeNote(x, y) {
  const col = noteData.vedanaIdx===0 ? 'amber' : noteData.vedanaIdx===1 ? 'coral' : 'sage';
  spawnRipple(x||innerWidth/2, y||innerHeight/2, col, 'lg', 5);
  tone(639, 0.012, 3.0);
  const key = localStorage.getItem('f2_api_key');
  if (key) {
    const p = `Meditator noted: ${noteData.senseEN} · ${noteData.vedanaEN} · ${noteData.emotionEN}.`;
    ai(p, NOTING_SYSTEM).then(res => { if (res) showAI('noteAI', res, 6000); });
  }
  setTimeout(() => {
    noteStep = 'sense'; noteData = {};
    renderNoteStep();
  }, 2400);
}

// ══════════════════════════════════════
// MODE 2: ANCHOR — sky blue orb
// ══════════════════════════════════════

// Canvas-drawn sky-blue breathing orb (inspired by Field collapse orb)
class AnchorOrb {
  constructor() {
    this.c      = document.getElementById('anchorOrbCanvas');
    this.cx     = this.c ? this.c.getContext('2d') : null;
    this.phase  = 'inhale'; // inhale | hold | exhale | rest
    this.t      = 0;
    this.INHALE = 5000; this.HOLD = 1000; this.EXHALE = 6000; this.REST = 800;
    this.CYCLE  = this.INHALE + this.HOLD + this.EXHALE + this.REST;
    this.clock  = 0;
    this.dispR  = 10;
    this.maxR   = Math.min(innerWidth, innerHeight) * 0.30;
    this.flickPh = 0;
    this.ripples = [];
    this.alive  = true;
    // Sky blue colour
    this.rgb = '90,181,212';
    this.resize();
  }
  resize() {
    if (!this.c) return;
    const dpr = window.devicePixelRatio || 1;
    this.c.width  = innerWidth  * dpr;
    this.c.height = innerHeight * dpr;
    this.c.style.width  = innerWidth  + 'px';
    this.c.style.height = innerHeight + 'px';
    if (this.cx) { this.cx.setTransform(1,0,0,1,0,0); this.cx.scale(dpr,dpr); }
    this.cx_w = innerWidth; this.cx_h = innerHeight;
    this.maxR = Math.min(innerWidth, innerHeight) * 0.30;
  }
  getBreathP() {
    const ct  = this.clock % this.CYCLE;
    const iEnd = this.INHALE;
    const hEnd = this.INHALE + this.HOLD;
    const eEnd = hEnd + this.EXHALE;
    if (ct < iEnd) {
      const x = ct / iEnd;
      return 1 - Math.pow(1-x, 2.5);
    } else if (ct < hEnd) {
      return 1.0;
    } else if (ct < eEnd) {
      const x = (ct - hEnd) / this.EXHALE;
      return 1 - (x < 0.5 ? 2*x*x : 1-Math.pow(-2*x+2,2)/2);
    } else {
      return 0.0;
    }
  }
  getPhase() {
    const ct  = this.clock % this.CYCLE;
    if (ct < this.INHALE)                            return 'inhale';
    if (ct < this.INHALE + this.HOLD)                return 'hold';
    if (ct < this.INHALE + this.HOLD + this.EXHALE)  return 'exhale';
    return 'rest';
  }
  update(dt) {
    if (!this.alive) return;
    this.clock   += dt;
    this.flickPh += 0.025;
    const bp = this.getBreathP();
    const tR = 10 + (this.maxR - 10) * bp;
    this.dispR += (tR - this.dispR) * 0.022;
    this.ripples = this.ripples.filter(rp => { rp.r += 1.5; rp.alpha -= 0.009; return rp.alpha > 0; });
    // Spawn ripple on peak
    const prevBp = 1 - Math.pow(1-Math.max(0,(this.clock-dt)%this.CYCLE/this.INHALE),2.5);
    if (bp >= 0.995 && prevBp < 0.995) {
      this.ripples.push({r:this.dispR*0.8, alpha:0.45});
    }
  }
  draw() {
    if (!this.cx || !this.alive) return;
    const cx = this.cx;
    const W = this.cx_w, H = this.cx_h;
    const X = W/2, Y = H/2;
    cx.clearRect(0, 0, W, H);
    const r   = Math.max(2, this.dispR);
    const bp  = this.getBreathP();
    const glow = 0.9 + 0.8 * bp + 0.15 * Math.sin(this.flickPh);

    // Outer glow
    const grad = cx.createRadialGradient(X, Y, r*0.3, X, Y, r*2.8);
    grad.addColorStop(0, `rgba(${this.rgb},${(0.18*glow).toFixed(3)})`);
    grad.addColorStop(0.5, `rgba(${this.rgb},${(0.07*glow).toFixed(3)})`);
    grad.addColorStop(1, 'rgba(90,181,212,0)');
    cx.beginPath(); cx.arc(X, Y, r*2.8, 0, Math.PI*2);
    cx.fillStyle = grad; cx.fill();

    // Concentric rings (inspired by Field collapse orb)
    for (let i = 3; i >= 0; i--) {
      const ringR = r * (1 + i * 0.22);
      const ra = (0.35 - i*0.07) * glow;
      cx.beginPath(); cx.arc(X, Y, ringR, 0, Math.PI*2);
      cx.strokeStyle = `rgba(${this.rgb},${Math.max(0,ra).toFixed(3)})`;
      cx.lineWidth   = Math.max(0.4, 1.8 - i*0.35);
      cx.shadowColor = `rgba(${this.rgb},${(ra*0.5).toFixed(3)})`;
      cx.shadowBlur  = 10 + i*4;
      cx.stroke();
    }

    // Core
    const coreGrad = cx.createRadialGradient(X, Y, 0, X, Y, r);
    coreGrad.addColorStop(0, `rgba(${this.rgb},${(0.28*glow).toFixed(3)})`);
    coreGrad.addColorStop(0.6, `rgba(${this.rgb},${(0.10*glow).toFixed(3)})`);
    coreGrad.addColorStop(1, 'rgba(90,181,212,0)');
    cx.beginPath(); cx.arc(X, Y, r, 0, Math.PI*2);
    cx.fillStyle = coreGrad; cx.fill();

    // Emanating ripples from centre
    this.ripples.forEach(rp => {
      cx.beginPath(); cx.arc(X, Y, rp.r, 0, Math.PI*2);
      cx.strokeStyle = `rgba(${this.rgb},${rp.alpha.toFixed(3)})`;
      cx.lineWidth = 1; cx.shadowBlur = 6;
      cx.shadowColor = `rgba(${this.rgb},${(rp.alpha*0.4).toFixed(3)})`;
      cx.stroke();
    });
  }
}

let anchorOrbLast = null;
function anchorOrbTick(ts) {
  if (!anchorOrb || !anchorOrb.alive) return;
  const dt = anchorOrbLast ? Math.min(ts - anchorOrbLast, 50) : 16;
  anchorOrbLast = ts;
  anchorOrb.update(dt);
  anchorOrb.draw();
  // Update label
  const phase = anchorOrb.getPhase();
  const lbl   = document.getElementById('bLbl');
  if (lbl) {
    lbl.textContent = phase==='inhale' ? (lang==='en'?'in':'inhala')
                    : phase==='hold'   ? ''
                    : phase==='exhale' ? (lang==='en'?'out':'exhala')
                    : '';
  }
  anchorOrbRAF = requestAnimationFrame(anchorOrbTick);
}

function startAnchorOrb() {
  stopAnchorOrb();
  anchorOrb     = new AnchorOrb();
  anchorOrbLast = null;
  anchorOrbRAF  = requestAnimationFrame(anchorOrbTick);
}
function stopAnchorOrb() {
  if (anchorOrbRAF) { cancelAnimationFrame(anchorOrbRAF); anchorOrbRAF=null; }
  if (anchorOrb)    { anchorOrb.alive=false; anchorOrb=null; }
  const c = document.getElementById('anchorOrbCanvas');
  if (c) { const cx=c.getContext('2d'); cx.clearRect(0,0,c.width,c.height); }
}

function startAnchor() {
  anchorState = 'instruction';
  clearBreathTimers();
  stopAnchorOrb();
  showScreen('s-anchor');
  document.getElementById('chrome').style.display = 'flex';
  // Anchor drone — 528 Hz (heart/compassion)
  setDrone(528, 0.020);
  tone(432, 0.010, 4.5);

  const instr = document.getElementById('aInstr');
  const wBtn  = document.getElementById('wBtn');
  const ret   = document.getElementById('retTxt');
  const zone  = document.getElementById('anchorTapZone');
  if (instr) { instr.style.opacity='1'; instr.classList.remove('fade'); instr.style.display='block'; }
  if (wBtn)  { wBtn.style.display='none'; }
  if (ret)   ret.classList.remove('show');
  if (zone)  zone.style.display = 'none';

  // After instruction — start orb
  setTimeout(() => {
    if (instr) instr.classList.add('fade');
    setTimeout(() => {
      if (instr) instr.style.display = 'none';
      if (zone)  zone.style.display = 'flex';
      if (wBtn)  wBtn.style.display = 'block';
      anchorState = 'breathing';
      startAnchorOrb();
      tone(432, 0.008, 6);
    }, 2200);
  }, 4500);
}

function orbTap(e) {
  if (anchorState !== 'breathing') return;
  const col = anchorOrb && anchorOrb.getPhase()==='inhale' ? 'sky' : 'cream';
  spawnRipple(e.clientX, e.clientY, col, 'sm', 2);
  tone(528, 0.006, 1.1);
}

function mindWandered(e) {
  if (anchorState !== 'breathing') return;
  clearBreathTimers();
  anchorState = 'wandered';
  stopAnchorOrb();
  spawnRipple(e.clientX||innerWidth/2, e.clientY||innerHeight/2, 'coral', 'md', 3);
  tone(396, 0.010, 2.5);
  const wBtn = document.getElementById('wBtn');
  const zone = document.getElementById('anchorTapZone');
  if (wBtn) wBtn.style.display = 'none';
  if (zone) zone.style.display = 'none';
  const returnWords = RETURN_WORDS[lang];
  const rWord = returnWords[Math.floor(Math.random()*returnWords.length)];
  setTimeout(() => {
    const ret = document.getElementById('retTxt');
    if (ret) { ret.textContent = rWord; ret.classList.add('show'); }
    spawnRipple(innerWidth/2, innerHeight/2, 'sky', 'md', 4);
    tone(528, 0.012, 3.0);
    setTimeout(() => {
      if (ret) ret.classList.remove('show');
      if (zone) zone.style.display = 'flex';
      if (wBtn) wBtn.style.display = 'block';
      anchorState = 'breathing';
      startAnchorOrb();
    }, 4000);
  }, 900);
}

function clearBreathTimers() {
  if (breathTimer) { clearTimeout(breathTimer); breathTimer=null; }
}

// ══════════════════════════════════════
// MODE 3: GUIDED NOTING
// ══════════════════════════════════════
const GUIDED_PHASES = [
  { en:'sense door',  es:'puerta sensorial', dur:90,  instr_en:'Notice what sense is active right now. Seeing, hearing, sensation — just observe.', instr_es:'Nota qué sentido está activo ahora. Ver, oír, sensación — solo observa.' },
  { en:'feeling tone', es:'tono',            dur:90,  instr_en:'Notice the quality of what you sense. Pleasant, unpleasant, or neutral?', instr_es:'Nota la cualidad de lo que sientes. Agradable, desagradable, o neutral.' },
  { en:'emotion',     es:'emoción',           dur:90,  instr_en:'Is any emotion present? Name it gently. No need to change anything.', instr_es:'¿Hay alguna emoción presente? Nómbrala suavemente. No hay que cambiar nada.' },
  { en:'open noting', es:'notar libre',       dur:120, instr_en:'Continue noting freely. Sense, tone, emotion — whatever arises.', instr_es:'Sigue notando libremente. Sentido, tono, emoción — lo que surja.' },
];

function startGuided() {
  guidedPhase = 0;
  guidedSecs  = 0;
  showScreen('s-guided');
  document.getElementById('chrome').style.display = 'flex';
  // Guided drone — 417 Hz (change/clearing)
  setDrone(417, 0.018);
  tone(432, 0.010, 3.5);
  updateGuidedDisplay();
  startGuidedOrb();
  startGuidedTimer();
}

function startGuidedTimer() {
  stopGuidedTimer();
  guidedTimer = setInterval(() => {
    guidedSecs++;
    const phase = GUIDED_PHASES[guidedPhase];
    const timerEl = document.getElementById('guidedTimer');
    // Count up within current phase
    const phaseElapsed = guidedSecs - GUIDED_PHASES.slice(0,guidedPhase).reduce((a,p)=>a+p.dur,0);
    const remaining    = phase.dur - phaseElapsed;
    if (timerEl) {
      const m = Math.floor(Math.abs(remaining)/60);
      const s = Math.abs(remaining) % 60;
      timerEl.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    }
    // Advance phase
    if (remaining <= 0) {
      guidedPhase++;
      if (guidedPhase >= GUIDED_PHASES.length) {
        stopGuidedTimer();
        spawnRipple(innerWidth/2, innerHeight/2, 'sage', 'lg', 5);
        tone(528, 0.012, 3.5);
        const wordEl = document.getElementById('guidedWord');
        if (wordEl) wordEl.textContent = lang==='en' ? 'complete' : 'completo';
        const timerEl2 = document.getElementById('guidedTimer');
        if (timerEl2) timerEl2.textContent = '';
        return;
      }
      updateGuidedDisplay();
      spawnRipple(innerWidth/2, innerHeight/2, 'sage', 'md', 3);
      tone(440, 0.008, 2);
    }
  }, 1000);
}

function updateGuidedDisplay() {
  const phase  = GUIDED_PHASES[guidedPhase];
  const wordEl = document.getElementById('guidedWord');
  const instrEl = document.getElementById('guidedInstr');
  if (wordEl)  wordEl.textContent  = lang==='en' ? phase.en  : phase.es;
  if (instrEl) instrEl.textContent = lang==='en' ? phase.instr_en : phase.instr_es;
}

function stopGuidedTimer() {
  if (guidedTimer) { clearInterval(guidedTimer); guidedTimer=null; }
}

// Guided orb — sage green pulsing rings
let guidedOrbRAF = null;
let guidedOrbT   = 0;
function startGuidedOrb() {
  if (guidedOrbRAF) cancelAnimationFrame(guidedOrbRAF);
  const c  = document.getElementById('guidedCanvas');
  if (!c) return;
  const cx = c.getContext('2d');
  let last = null;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    c.width  = c.offsetWidth  * dpr;
    c.height = c.offsetHeight * dpr;
    cx.setTransform(1,0,0,1,0,0); cx.scale(dpr,dpr);
  }
  resize();
  const tick = (ts) => {
    if (!last) last = ts;
    const dt = Math.min(ts - last, 50); last = ts;
    guidedOrbT += dt * 0.001;
    cx.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
    const W = c.offsetWidth, H = c.offsetHeight;
    const X = W/2, Y = H/2;
    const maxR = Math.min(W,H) * 0.46;
    const bp   = 0.5 + 0.5 * Math.sin(guidedOrbT * 0.45);
    const r    = maxR * (0.55 + 0.45 * bp);
    const glow = 0.8 + 0.4 * bp;
    for (let i = 0; i < 4; i++) {
      const ringR = r * (0.92 + i * 0.08);
      const a = (0.28 - i*0.05) * glow;
      cx.beginPath(); cx.arc(X, Y, ringR, 0, Math.PI*2);
      cx.strokeStyle = `rgba(90,181,168,${Math.max(0,a).toFixed(3)})`;
      cx.lineWidth = Math.max(0.5, 1.6 - i*0.3);
      cx.shadowColor = `rgba(90,181,168,${(a*0.5).toFixed(3)})`;
      cx.shadowBlur  = 12;
      cx.stroke();
    }
    // Progress arc for current phase
    const phase = GUIDED_PHASES[Math.min(guidedPhase, GUIDED_PHASES.length-1)];
    const totalPhaseTime = GUIDED_PHASES.slice(0,guidedPhase).reduce((a,p)=>a+p.dur,0);
    const elapsed = guidedSecs - totalPhaseTime;
    const progress = Math.max(0, Math.min(1, elapsed / phase.dur));
    cx.beginPath();
    cx.arc(X, Y, r*1.1, -Math.PI/2, -Math.PI/2 + progress*2*Math.PI);
    cx.strokeStyle = 'rgba(90,181,168,0.55)';
    cx.lineWidth = 2; cx.shadowBlur = 8;
    cx.shadowColor = 'rgba(90,181,168,0.3)';
    cx.stroke();
    guidedOrbRAF = requestAnimationFrame(tick);
  };
  guidedOrbRAF = requestAnimationFrame(tick);
}

// ══════════════════════════════════════
// MODE 4: VERBAL NOTING
// ══════════════════════════════════════
function startVerbal() {
  showScreen('s-verbal');
  document.getElementById('chrome').style.display = 'flex';
  // Verbal drone — 639 Hz (relationships/connection)
  setDrone(639, 0.016);
  tone(396, 0.009, 2.5);
  const refl = document.getElementById('verbalReflection');
  const trans = document.getElementById('verbalTranscript');
  if (refl)  { refl.textContent=''; refl.classList.remove('show'); }
  if (trans) trans.textContent = '';
  const hint = document.getElementById('verbalHint');
  if (hint) hint.textContent = lang==='en' ? 'tap to speak' : 'toca para hablar';
}

function toggleVerbal() { verbalOn ? stopVerbal() : startVerbalRec(); }

function startVerbalRec() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    const hint = document.getElementById('verbalHint');
    if (hint) hint.textContent = 'voice not available on this device';
    return;
  }
  const mic   = document.getElementById('verbalMic');
  const hint  = document.getElementById('verbalHint');
  const trans = document.getElementById('verbalTranscript');
  const refl  = document.getElementById('verbalReflection');
  try {
    verbalRec = new SR();
    verbalRec.lang = lang==='es' ? 'es-CL' : 'en-US';
    verbalRec.continuous = false; verbalRec.interimResults = false;
    verbalRec.onstart = () => {
      verbalOn = true;
      if (mic)  mic.classList.add('listening');
      if (hint) hint.textContent = lang==='en' ? 'listening...' : 'escuchando...';
      if (trans) trans.textContent = '';
      if (refl)  { refl.textContent=''; refl.classList.remove('show'); }
      spawnRipple(innerWidth/2, innerHeight/2, 'violet', 'md', 3);
      tone(639, 0.008, 2);
    };
    verbalRec.onresult = (e) => {
      const txt = e.results[0][0].transcript;
      stopVerbal();
      if (trans) trans.textContent = '"' + txt + '"';
      spawnRipple(innerWidth/2, innerHeight/2, 'violet', 'lg', 5);
      tone(528, 0.012, 3.0);
      const key = localStorage.getItem('f2_api_key');
      if (key) {
        ai(`Meditator said: "${txt}"`, VOICE_SYSTEM).then(res => {
          if (res && refl) { refl.textContent = res; refl.classList.add('show'); }
        });
      } else {
        // No API key — just echo noting form without AI
        if (refl) { refl.textContent = lang==='en' ? 'noted' : 'notado'; refl.classList.add('show'); }
      }
    };
    verbalRec.onerror = () => stopVerbal();
    verbalRec.onend   = () => { if (verbalOn) stopVerbal(); };
    verbalRec.start();
  } catch(e) { stopVerbal(); }
}

function stopVerbal() {
  verbalOn = false;
  const mic  = document.getElementById('verbalMic');
  const hint = document.getElementById('verbalHint');
  try { if (verbalRec) verbalRec.stop(); } catch(e) {}
  verbalRec = null;
  if (mic)  mic.classList.remove('listening');
  if (hint) hint.textContent = lang==='en' ? 'tap to speak' : 'toca para hablar';
}

// ══════════════════════════════════════
// MODE 5: STORM
// ══════════════════════════════════════
function startStorm() {
  stormIdx = 0; stormLog = [];
  const word = document.getElementById('sWord');
  const wit  = document.getElementById('sWit');
  if (word) { word.textContent = stormWord(0); word.classList.add('show'); }
  if (wit)  { wit.textContent=''; wit.classList.remove('show'); }
  showScreen('s-storm');
  document.getElementById('chrome').style.display = 'flex';
  // Storm drone — 174 Hz (foundation/pain relief) subtle
  setDrone(174, 0.018);
  tone(396, 0.010, 2.2);
}

function stormWord(idx) {
  const arr = lang==='en' ? STORM_CYCLE : STORM_CYCLE_ES;
  return arr[idx % arr.length];
}

function stormTap(e) {
  if (e.target.closest('.back-btn') || e.target.closest('.gear-btn')) return;
  const word = document.getElementById('sWord');
  const wit  = document.getElementById('sWit');
  spawnRipple(e.clientX, e.clientY, 'coral', 'md', 3);
  tone(432 + (stormIdx%5)*28, 0.008, 0.9);
  stormLog.push(stormWord(stormIdx));
  stormIdx++;
  if (word) word.classList.remove('show');
  setTimeout(() => {
    if (stormIdx >= STORM_CYCLE.length) {
      if (word) { word.textContent='·'; word.classList.add('show'); }
      const key = localStorage.getItem('f2_api_key');
      if (key && wit) {
        ai(`Student cycled: ${stormLog.join(', ')}`, STORM_SYSTEM).then(res => {
          if (res) { wit.textContent=res; wit.classList.add('show'); }
        });
      }
      spawnRipple(innerWidth/2, innerHeight/2, 'coral', 'lg', 5);
      setTimeout(() => spawnRipple(innerWidth/2, innerHeight/2, 'amber', 'lg', 4), 400);
      tone(528, 0.012, 4.5);
      stormIdx=0; stormLog=[];
    } else {
      if (word) { word.textContent=stormWord(stormIdx); word.classList.add('show'); }
    }
  }, 240);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  startAmbientRipple();
});
