// ═══════════════════════════════════════
// COLLAPSE↑ — APP LOGIC v3.2
// ═══════════════════════════════════════

let lang = localStorage.getItem('cu_lang') || 'en';
let visited = localStorage.getItem('cu_v32');
let totalObs = parseInt(localStorage.getItem('cu_obs') || '0');
let stateObs = JSON.parse(localStorage.getItem('cu_sobs') || '{}');
let curStep = 0;
let collapseStage = 0;
let curStateName = '';
let breathCycle = 0;
let breathTimeout = null;
let breathRunning = false;
let largeFnt = false;
let holdT = null;
let stillT = null;
let audioCtx = null;
let droneNodes = [];

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
  [432,216,144,108].forEach((f,i) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.022 - i*0.004, audioCtx.currentTime + 3);
    o.connect(g); g.connect(audioCtx.destination); o.start();
    droneNodes.push({o,g});
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
  bg.gain.setValueAtTime(0.06, audioCtx.currentTime + 0.75);
  bg.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.5);
  b.connect(bg); bg.connect(audioCtx.destination);
  b.start(audioCtx.currentTime + 0.75); b.stop(audioCtx.currentTime + 4);
}

// ─── PARTICLES ───
const cv = document.getElementById('particleCanvas');
const cx = cv.getContext('2d');
let pts = [];
function rsz() { cv.width = innerWidth; cv.height = innerHeight; }
window.addEventListener('resize', rsz); rsz();
class Pt {
  constructor() { this.reset(); }
  reset() { this.x=Math.random()*cv.width; this.y=Math.random()*cv.height; this.vx=(Math.random()-.5)*.22; this.vy=(Math.random()-.5)*.22-.07; this.r=Math.random()*1.1+.2; this.op=Math.random()*.3+.07; this.life=0; this.ml=Math.random()*260+130; }
  update() { this.x+=this.vx; this.y+=this.vy; this.life++; if(this.life>this.ml||this.y<-10)this.reset(); }
  draw() { const a=this.op*(1-(this.life/this.ml)**2); cx.beginPath(); cx.arc(this.x,this.y,this.r,0,Math.PI*2); cx.fillStyle=`rgba(201,169,110,${a})`; cx.fill(); }
}
function initPts() { pts=Array.from({length:50},()=>new Pt()); }
function animPts() { cx.clearRect(0,0,cv.width,cv.height); pts.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(animPts); }
initPts(); animPts();

// ─── SCREEN TRANSITIONS — all faded ───
function crossFade(fromId, toId, dur, cb) {
  const from = document.getElementById(fromId);
  const to = document.getElementById(toId);
  if (!from || !to) return;
  from.style.transition = `opacity ${dur}s ease`;
  from.style.opacity = '0';
  from.style.pointerEvents = 'none';
  setTimeout(() => {
    from.classList.remove('active');
    from.style.opacity = '';
    from.style.transition = '';
    to.style.opacity = '0';
    to.style.transition = 'none';
    to.classList.add('active');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      to.style.transition = `opacity ${dur}s ease`;
      to.style.opacity = '1';
      to.style.pointerEvents = 'all';
      setTimeout(() => {
        to.style.transition = '';
        to.style.opacity = '';
        if (cb) cb();
      }, dur * 1000);
    }));
  }, dur * 500);
}

// ─── LANG ───
function setLang(l) {
  lang = l;
  localStorage.setItem('cu_lang', l);
  document.getElementById('langBtn').textContent = l === 'en' ? 'EN / ES' : 'ES / EN';
}
document.getElementById('langBtn').addEventListener('click', () => {
  setLang(lang === 'en' ? 'es' : 'en');
  const active = document.querySelector('.screen.active');
  if (active && active.id === 's-field') buildField();
  if (active && active.id === 's-init') buildInit();
});
document.getElementById('fontBtn').addEventListener('click', () => {
  largeFnt = !largeFnt;
  document.body.classList.toggle('large', largeFnt);
  document.getElementById('fontBtn').textContent = largeFnt ? 'A−' : 'A+';
});

// ─── SIGIL ───
function runSigil() {
  const g1=document.getElementById('sg1'), g2=document.getElementById('sg2'), g3=document.getElementById('sg3');
  const main=document.getElementById('smain'), wm=document.getElementById('sigilWm');

  // ghosts materialise — opacity+blur only, all centred
  setTimeout(() => {
    g1.style.transition='opacity 1.4s ease,filter 1.4s ease';
    g2.style.transition='opacity 1.8s ease,filter 1.8s ease';
    g3.style.transition='opacity 1.6s ease,filter 1.6s ease';
    g1.style.opacity='0.22'; g1.style.filter='blur(6px)';
    g2.style.opacity='0.16'; g2.style.filter='blur(9px)';
    g3.style.opacity='0.19'; g3.style.filter='blur(7px)';
  }, 600);

  // crystallize — ghosts dissolve, main sharpens
  setTimeout(() => {
    ['g1','g2','g3'].forEach(id => {
      const el=document.getElementById('s'+id.replace('g','g'));
      const g=document.getElementById(id==='g1'?'sg1':id==='g2'?'sg2':'sg3');
      g.style.transition='opacity 1.0s ease,filter 1.0s ease';
      g.style.opacity='0'; g.style.filter='blur(0)';
    });
    // fix: reference directly
    [g1,g2,g3].forEach(g => {
      g.style.transition='opacity 1.0s ease,filter 1.0s ease';
      g.style.opacity='0'; g.style.filter='blur(0)';
    });
    main.style.transition='opacity 1.4s ease,filter 1.4s ease';
    main.style.opacity='1'; main.style.filter='blur(0)';
    main.style.textShadow='0 0 40px rgba(240,204,136,.65),0 0 100px rgba(201,169,110,.35),0 0 160px rgba(255,232,176,.18)';
    initAudio();
    if (audioCtx && audioCtx.state==='suspended') audioCtx.resume().then(playCollapseSound);
    else playCollapseSound();
  }, 2800);

  // wordmark
  setTimeout(() => {
    wm.style.transition='opacity 1.6s ease';
    wm.style.opacity='1';
  }, 4400);

  // transition to next screen
  setTimeout(() => {
    if (visited) { tryDrone(); buildField(); crossFade('s-sigil','s-field',1.4); }
    else { buildInit(); crossFade('s-sigil','s-init',1.4); }
  }, 6400);
}

// ─── INITIATION ───
function buildInit() {
  const steps=STEPS[lang];
  const body=document.getElementById('initBody');
  body.innerHTML='';
  steps.forEach((s,i) => {
    const div=document.createElement('div');
    div.className='step'+(i===0?' on':'');
    div.dataset.i=i;
    let h=`<div class="s-label">${s.label}</div>`;
    if(s.big) h+=`<div class="s-big">${s.big.replace(/\n/g,'<br>')}</div>`;
    if(s.eq) h+=`<div class="eq-box"><div class="eq">${s.eq}</div><div class="eq-sub">${s.eqSub}</div></div>`;
    if(s.small) h+=`<div class="s-small">${s.small.replace(/\n/g,'<br>')}</div>`;
    if(s.note) h+=`<div class="s-note">${s.note}</div>`;
    if(s.isLast) h+=`<button class="ready-btn" id="readyBtn">${TRANSLATIONS[lang].readyBtn}</button>`;
    div.innerHTML=h;
    if(s.isLast) div.querySelector('#readyBtn').addEventListener('click',enterField);
    body.appendChild(div);
  });
  const dots=document.getElementById('sdots');
  dots.innerHTML='';
  steps.forEach((_,i)=>{const d=document.createElement('div');d.className='sdot'+(i===0?' on':'');dots.appendChild(d);});
  document.getElementById('taph').textContent=TRANSLATIONS[lang].tapHint;
  curStep=0;
  setPcore(steps[0].ps);
  setTimeout(()=>{const f=document.querySelector('.step.on');if(f){f.style.opacity='0';f.style.transition='opacity 0.8s ease';requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.opacity='1';}));}},100);
}

function setPcore(state) {
  const p=document.getElementById('pcore');
  if(!p) return;
  p.className='pcore '+state;
  const rings=document.querySelectorAll('.pring'), cloud=document.querySelector('.pcloud');
  if(state==='stab'){rings.forEach(r=>r.style.opacity='.3');if(cloud)cloud.style.opacity='.45';}
  else if(state==='done'){rings.forEach(r=>r.style.opacity='.07');if(cloud)cloud.style.opacity='.1';}
  else{rings.forEach(r=>r.style.opacity='');if(cloud)cloud.style.opacity='';}
}

function advanceStep() {
  const steps=STEPS[lang];
  if(curStep>=steps.length-1) return;
  const cur=document.querySelector('.step.on');
  if(!cur) return;
  cur.style.transition='opacity 0.6s ease';
  cur.style.opacity='0';
  setTimeout(()=>{
    cur.classList.remove('on');
    cur.style.opacity=''; cur.style.transition='';
    curStep++;
    const next=document.querySelector(`.step[data-i="${curStep}"]`);
    if(next){
      next.style.opacity='0'; next.style.transition='none';
      next.classList.add('on');
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        next.style.transition='opacity 0.7s ease';
        next.style.opacity='1';
        setTimeout(()=>{next.style.transition='';next.style.opacity='';},700);
      }));
    }
    document.querySelectorAll('.sdot').forEach((d,i)=>d.classList.toggle('on',i<=curStep));
    setPcore(steps[curStep].ps);
    document.getElementById('taph').textContent=steps[curStep].isLast?TRANSLATIONS[lang].tapHintLast:TRANSLATIONS[lang].tapHint;
  },600);
}

document.getElementById('s-init').addEventListener('click',e=>{
  if(e.target.id==='readyBtn'||e.target.classList.contains('ready-btn')) return;
  if(e.target.closest('#chrome')) return;
  advanceStep();
});

// ─── FIELD ───
function buildField() {
  const t=TRANSLATIONS[lang];
  document.getElementById('fline').textContent=t.fieldLine;
  document.getElementById('fsub').textContent=t.fieldSub;
  document.getElementById('stillTxt').innerHTML=t.stillTxt.replace(/\n/g,'<br>');
  document.getElementById('stillBack').textContent=t.stillBack;
  document.getElementById('obsCt').textContent=t.obsCount(totalObs);
  const grid=document.getElementById('grid');
  grid.innerHTML='';
  STATES[lang].forEach(st=>{
    const o=document.createElement('div');
    o.className='orb';
    o.innerHTML=`<div class="oname">${st.name}</div>`;
    const go=()=>selectState(st);
    o.addEventListener('click',go);
    o.addEventListener('touchend',e=>{e.preventDefault();go();});
    grid.appendChild(o);
  });
  document.querySelectorAll('.al').forEach(l=>l.classList.add('on'));
}

// ─── SELECT STATE ───
function selectState(state) {
  if(navigator.vibrate) navigator.vibrate(38);
  initAudio();
  if(audioCtx&&audioCtx.state==='suspended') audioCtx.resume();
  playCollapseSound();
  const b=document.getElementById('burst');
  b.classList.remove('go'); void b.offsetWidth; b.classList.add('go');
  const pc=document.getElementById('pcore');
  if(pc){pc.className='pcore up';setTimeout(()=>{if(pc)pc.className='pcore sp';},1000);}
  totalObs++;
  if(!stateObs[state.name]) stateObs[state.name]=0;
  stateObs[state.name]++;
  localStorage.setItem('cu_obs',totalObs);
  localStorage.setItem('cu_sobs',JSON.stringify(stateObs));
  curStateName=state.name;

  // ghost names
  const gh=document.getElementById('ghosts');
  gh.innerHTML=''; gh.style.transition='opacity 0s'; gh.style.opacity='0';
  const pos=[{top:'7%',left:'4%'},{top:'11%',right:'5%'},{bottom:'17%',left:'5%'},{bottom:'21%',right:'4%'},{top:'43%',left:'2%'},{top:'39%',right:'3%'},{top:'23%',left:'46%'},{bottom:'36%',right:'26%'}];
  STATES[lang].filter(s=>s.name!==state.name).forEach((s,i)=>{
    const g=document.createElement('div'); g.className='gst'; g.textContent=s.name;
    Object.assign(g.style,pos[i]||{top:Math.random()*70+'%',left:Math.random()*70+'%'});
    g.style.animationDelay=(i*.3)+'s'; gh.appendChild(g);
  });

  // fill content
  const t=TRANSLATIONS[lang], n=stateObs[state.name];
  document.getElementById('cword').textContent=state.name;
  document.getElementById('cLabel').textContent=t.cLabel;
  document.getElementById('cSub').textContent=t.cSub;
  document.getElementById('ceq').textContent=state.eq;
  document.getElementById('ceqNote').textContent=t.ceqNote;
  document.getElementById('imagLabel').textContent=t.imagLabel;
  document.getElementById('imagPrompt').textContent=getImagination(lang,state.name);
  document.getElementById('obsNote').innerHTML=(n===1?t.obsFirst(state.name):t.obsMany(state.name,n)).replace(/\n/g,'<br>');
  document.getElementById('qlabel').textContent=t.qlabel;
  document.getElementById('qtext').textContent=state.question;
  document.getElementById('retBtn').textContent=t.retBtn;

  // closing — letter by letter
  const closingEl=document.getElementById('closing');
  const closingText=t.closings[Math.floor(Math.random()*t.closings.length)];
  closingEl.innerHTML='';
  closingText.split('').forEach((ch,i)=>{
    const span=document.createElement('span');
    span.className='closing-letter'; span.textContent=ch;
    span.style.animationDelay=(5.5+i*0.04)+'s';
    closingEl.appendChild(span);
  });

  // reset all stages
  collapseStage=0;
  document.querySelectorAll('.cp-stage').forEach(s=>{
    s.style.transition='none'; s.classList.remove('on');
    s.style.opacity='0'; s.style.pointerEvents='none';
  });
  clearTimeout(breathTimeout); breathRunning=false;
  document.getElementById('tapNext').textContent=t.tapHint;

  crossFade('s-field','s-collapse',1.0,()=>{
    gh.style.transition='opacity 1.8s ease'; gh.style.opacity='1';
    setTimeout(()=>showCollapseStage(1),200);
  });
}

// ─── COLLAPSE STAGES ───
function showCollapseStage(n) {
  const current=document.querySelector('.cp-stage.on');
  const reveal=()=>{
    collapseStage=n;
    const el=document.getElementById('cs'+n);
    if(!el) return;
    el.style.transition='none'; el.style.opacity='0'; el.style.pointerEvents='none';
    el.classList.add('on');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      el.style.transition='opacity 0.9s ease'; el.style.opacity='1'; el.style.pointerEvents='all';
    }));
    const tapEl=document.getElementById('tapNext');
    tapEl.style.transition='opacity 0.7s ease';
    tapEl.style.opacity=(n<6)?'1':'0';
    if(n===4) startBreath();
  };
  if(current){
    current.style.transition='opacity 0.7s ease'; current.style.opacity='0'; current.style.pointerEvents='none';
    setTimeout(()=>{current.classList.remove('on'); reveal();},700);
  } else { reveal(); }
}

document.getElementById('s-collapse').addEventListener('click',e=>{
  if(e.target.id==='retBtn'||e.target.classList.contains('return-btn')) return;
  if(e.target.closest('#chrome')) return;
  if(collapseStage===4&&breathRunning) return;
  if(collapseStage<6) showCollapseStage(collapseStage+1);
});

// ─── BREATH ───
function startBreath() {
  breathRunning=true; breathCycle=0;
  const stateName=curStateName, t=TRANSLATIONS[lang];
  const p=document.getElementById('bp'), ripple=document.getElementById('bripple');
  const instr=document.getElementById('binstr'), sn=document.getElementById('bsname');
  const ctr=document.getElementById('bctr'), bend=document.getElementById('bend');
  p.className='bp neutral'; sn.style.opacity='0';
  bend.classList.remove('on'); bend.innerHTML='';
  ripple.classList.remove('expand');

  function fadeText(el,newText,delay=0){
    setTimeout(()=>{
      el.style.transition='opacity 0.5s ease'; el.style.opacity='0';
      setTimeout(()=>{el.textContent=newText; el.style.opacity='1';},500);
    },delay);
  }

  function cycle() {
    if(breathCycle>=3){
      breathRunning=false;
      instr.style.transition='opacity 0.6s ease'; instr.style.opacity='0';
      setTimeout(()=>{
        sn.style.transition='opacity 1s ease'; sn.style.opacity='1';
        bend.innerHTML=`<p>${t.breathEnd(stateName).replace(/\n/g,'<br>')}</p>`;
        bend.classList.add('on'); ctr.textContent='';
      },600);
      breathTimeout=setTimeout(()=>{if(collapseStage===4)showCollapseStage(5);},4000);
      return;
    }
    breathCycle++;
    ctr.textContent=t.breathCycles(breathCycle,3);

    // inhale
    fadeText(instr,t.breathInhale);
    sn.style.transition='opacity 0.5s ease'; sn.style.opacity='0';
    ripple.classList.remove('expand'); void ripple.offsetWidth;

    breathTimeout=setTimeout(()=>{
      p.className='bp inhaling';
      // hold — after 4s inhale
      breathTimeout=setTimeout(()=>{
        p.className='bp holding';
        fadeText(instr,t.breathHold);
        // exhale — after 1.3s hold
        breathTimeout=setTimeout(()=>{
          p.className='bp exhaling';
          fadeText(instr,t.breathExhale(stateName));
          sn.style.transition='opacity 1s ease'; sn.style.opacity='1';
          ripple.classList.remove('expand'); void ripple.offsetWidth; ripple.classList.add('expand');
          // next cycle after exhale
          breathTimeout=setTimeout(()=>{
            sn.style.opacity='0';
            p.className='bp neutral';
            breathTimeout=setTimeout(cycle,800);
          },4400);
        },1300);
      },4100);
    },120);
  }
  cycle();
}

// ─── RETURN ───
document.getElementById('retBtn').addEventListener('click',()=>{
  clearTimeout(breathTimeout); breathRunning=false;
  const gh=document.getElementById('ghosts');
  gh.style.transition='opacity 0.8s ease'; gh.style.opacity='0';
  setTimeout(()=>{gh.innerHTML='';},800);
  crossFade('s-collapse','s-field',1.0,()=>buildField());
});

// ─── STILL ───
document.getElementById('gStill').addEventListener('click',enterStill);
document.getElementById('gStill').addEventListener('touchend',e=>{e.preventDefault();enterStill();});
function enterStill(){
  clearInterval(stillT); let sec=300;
  const fmt=s=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  document.getElementById('stillTmr').textContent=fmt(sec);
  crossFade('s-field','s-still',1.0);
  stillT=setInterval(()=>{sec--;document.getElementById('stillTmr').textContent=sec>0?fmt(sec):'';if(sec<=0)clearInterval(stillT);},1000);
}
document.getElementById('stillBack').addEventListener('click',()=>{clearInterval(stillT);crossFade('s-still','s-field',1.0,()=>buildField());});

// ─── BREATH GLYPH ───
document.getElementById('gBreath').addEventListener('click',breathGlyph);
document.getElementById('gBreath').addEventListener('touchend',e=>{e.preventDefault();breathGlyph();});
function breathGlyph(){
  const st=curStateName?STATES[lang].find(s=>s.name===curStateName)||STATES[lang][0]:STATES[lang][Math.floor(Math.random()*8)];
  selectState(st);
}

// ─── WORDMARK HOLD ───
const fwm=document.getElementById('fwm');
const startHold=()=>{fwm.classList.add('holding');holdT=setTimeout(()=>{fwm.classList.remove('holding');if(navigator.vibrate)navigator.vibrate([28,18,28]);buildInit();crossFade('s-field','s-init',1.0);},3000);};
const cancelHold=()=>{clearTimeout(holdT);fwm.classList.remove('holding');};
fwm.addEventListener('mousedown',startHold);
fwm.addEventListener('touchstart',e=>{e.preventDefault();startHold();},{passive:false});
['mouseup','touchend','mouseleave'].forEach(ev=>fwm.addEventListener(ev,cancelHold));

// ─── ENTER FIELD ───
function enterField(){
  tryDrone(); localStorage.setItem('cu_v32','1'); visited=true;
  buildField(); crossFade('s-init','s-field',1.2);
}

// ─── BOOT ───
setLang(lang);
runSigil();
