// SEE v4.2 — app.js
'use strict';
let curScreen='s-splash',noteStep='sense',noteData={};
let stormIdx=0,stormLog=[],stormMode='tap',stormAuto=null;
let guidedDur=1,guidedSpeed=7,guidedInterval=null,guidedNotes=[],guidedPromptIdx=0,guidedPromptTimer=null;
let verbalRec=null,verbalOn=false;
let lastX=innerWidth/2,lastY=innerHeight/2;
let anchorOrbRAF=null,anchorBreathClock=0,anchorOrbR=10,anchorOrbLast=null,anchorOrbRipples=[];
let anchorState='idle';
let activeDroneStop=null;
const INHALE=5000,HOLD=900,EXHALE=6000,REST=700,CYCLE=INHALE+HOLD+EXHALE+REST;

document.addEventListener('touchstart',e=>{lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;},{passive:true});
document.addEventListener('mousedown',e=>{lastX=e.clientX;lastY=e.clientY;},{passive:true});

// ── RIPPLE ──
const rCanvas=document.getElementById('rippleCanvas');
const rCtx=rCanvas?rCanvas.getContext('2d'):null;
let ripples=[];
function resizeCanvas(){if(!rCanvas)return;const d=devicePixelRatio||1;rCanvas.width=innerWidth*d;rCanvas.height=innerHeight*d;rCanvas.style.width=innerWidth+'px';rCanvas.style.height=innerHeight+'px';if(rCtx){rCtx.setTransform(1,0,0,1,0,0);rCtx.scale(d,d);}}
window.addEventListener('resize',resizeCanvas);resizeCanvas();
function spawnRipple(x,y,rgb,size){const m=Math.max(innerWidth,innerHeight);const maxR=size==='xl'?m*.90:size==='large'?m*.62:size==='medium'?m*.40:m*.22;ripples.push({x,y,r:2,maxR,rgb,alpha:.78});}
(function loop(){requestAnimationFrame(loop);if(!rCtx)return;rCtx.clearRect(0,0,innerWidth,innerHeight);ripples=ripples.filter(r=>r.alpha>0.004);ripples.forEach(rp=>{rp.r+=(rp.maxR-rp.r)*.018;rp.alpha=Math.max(0,rp.alpha-.005);for(let i=0;i<3;i++){const ringR=rp.r*(1-i*.20);if(ringR<1)continue;const a=rp.alpha*(1-i*.28);rCtx.save();rCtx.beginPath();rCtx.arc(rp.x,rp.y,ringR,0,Math.PI*2);rCtx.strokeStyle=`rgba(${rp.rgb},${a.toFixed(3)})`;rCtx.lineWidth=Math.max(1.5,4-i*1.2);rCtx.shadowColor=`rgba(${rp.rgb},${(a*.55).toFixed(3)})`;rCtx.shadowBlur=16+(2-i)*10;rCtx.stroke();rCtx.restore();}});})();

// ── AUDIO ──
let audioCtx=null;
function initAudio(){try{if(!audioCtx||audioCtx.state==='closed')audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}catch(e){}}
// Resume on every interaction — critical for iOS
['touchstart','touchend','click','pointerdown'].forEach(ev=>document.addEventListener(ev,()=>{if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();},{passive:true}));
document.addEventListener('touchstart',initAudio,{passive:true,once:true});
document.addEventListener('click',initAudio,{passive:true,once:true});
window.addEventListener('pageshow',()=>{initAudio();if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();});
window.addEventListener('focus',()=>{if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();});
// Poll audio context every 2s - keeps iOS from suspending
setInterval(()=>{if(audioCtx&&audioCtx.state==='suspended'){audioCtx.resume().catch(()=>{});}},2000);

function tone(freq,gain,dur){
  initAudio();if(!audioCtx)return;
  try{const o=audioCtx.createOscillator(),g=audioCtx.createGain(),lp=audioCtx.createBiquadFilter();
    lp.type='lowpass';lp.frequency.value=900;o.type='sine';o.frequency.value=freq;
    const t=audioCtx.currentTime;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.08);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(lp);lp.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+dur+.1);}catch(e){}}

// Per-chip tones for sense, vedana, emotion
const SENSE_TONES={Seeing:528,Hearing:440,Smell:396,Taste:462,Sensation:528,Thought:396};
const VEDANA_TONES={Pleasant:528,Unpleasant:396,Neutral:432};
const EMOTION_TONES={Agitation:440,Heaviness:396,Fear:396,Wanting:462,Resistance:440,Openness:528,Joy:528,Confusion:432};

function startDrone(freq,gain){
  initAudio();if(!audioCtx)return()=>{};
  try{const o=audioCtx.createOscillator(),g=audioCtx.createGain(),lp=audioCtx.createBiquadFilter();
    lp.type='lowpass';lp.frequency.value=500;o.type='sine';o.frequency.value=freq;
    g.gain.setValueAtTime(0,audioCtx.currentTime);g.gain.linearRampToValueAtTime(gain,audioCtx.currentTime+2.5);
    o.connect(lp);lp.connect(g);g.connect(audioCtx.destination);o.start();
    return()=>{try{g.gain.linearRampToValueAtTime(0,audioCtx.currentTime+1.5);o.stop(audioCtx.currentTime+1.6);}catch(e){}};}
  catch(e){return()=>{};}
}
function setDrone(freq,gain){if(activeDroneStop){activeDroneStop();activeDroneStop=null;}if(freq)activeDroneStop=startDrone(freq,gain||.022);}

// Ambient hum on splash
let splashDroneStop=null;
function startSplashHum(){if(splashDroneStop)return;initAudio();splashDroneStop=startDrone(174,.008);}
function stopSplashHum(){if(splashDroneStop){splashDroneStop();splashDroneStop=null;}}

// ── SCREENS ──
function showScreen(id){
  const prev=document.querySelector('.screen.active'),next=document.getElementById(id);
  if(!next||prev?.id===id)return;
  if(prev){prev.style.opacity='0';setTimeout(()=>prev.classList.remove('active'),480);}
  setTimeout(()=>{next.classList.add('active');next.style.opacity='';curScreen=id;},prev?260:0);
}

// ── SPLASH ripple ──
function splashRipple(){
  spawnRipple(innerWidth/2,innerHeight/2,'240,238,232','medium');
  setTimeout(splashRipple,4000+Math.random()*3000);
}
window.addEventListener('load',()=>{setTimeout(()=>{startSplashHum();splashRipple();},600);});

// ── SETTINGS ──
function openSettings(){setDrone(null);showScreen('s-settings');document.getElementById('chrome').style.display='none';}
function closeSettings(){showScreen('s-home');document.getElementById('chrome').style.display='none';}
function saveKey(){const inp=document.getElementById('apiInput');if(inp?.value.trim()){localStorage.setItem('f2_api_key',inp.value.trim());inp.value='';inp.placeholder='saved ✓';setTimeout(()=>inp.placeholder='Anthropic API key (optional)',2000);}}
function clearKey(){localStorage.removeItem('f2_api_key');const inp=document.getElementById('apiInput');if(inp)inp.placeholder='Anthropic API key (optional)';}

// ── HOME ──
function goHome(){
  stopVerbal();stopAnchorOrb();stopGuidedSession();setDrone(null);
  spawnRipple(lastX,lastY,'240,238,232','large');
  showScreen('s-home');document.getElementById('chrome').style.display='none';
  tone(396,.010,2.5);
}

// ── AI ──
async function ai(prompt,system){
  const key=localStorage.getItem('f2_api_key');if(!key)return null;
  try{const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:80,system,messages:[{role:'user',content:prompt}]})});
    const d=await res.json();return d.content?.[0]?.text?.trim()||null;}
  catch(e){return null;}
}
function showAI(id,text,dur=5000){const el=document.getElementById(id);if(!el)return;el.textContent=text;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),dur);}

// ── NOTING ──
function startNoting(){noteStep='sense';noteData={};renderStep();showScreen('s-noting');document.getElementById('chrome').style.display='flex';setDrone(396,.018);tone(432,.010,2);}

function renderStep(){
  const screen=document.getElementById('s-noting');
  const lbl=document.getElementById('stepLbl');
  const title=document.getElementById('stepTitle');
  const hint=document.getElementById('stepHint');
  const grid=document.getElementById('chipGrid');
  const aiEl=document.getElementById('noteAI');
  if(aiEl){aiEl.textContent='';aiEl.classList.remove('show');}
  // Fade out all content
  [lbl,title,hint,grid].forEach(el=>{if(el){el.style.transition='opacity .35s ease';el.style.opacity='0';}});
  setTimeout(()=>{
    _buildStep(lbl,title,hint,grid);
    // Fade back in staggered
    [lbl,title,hint].forEach((el,i)=>{if(el){el.style.opacity='';setTimeout(()=>{el.style.transition='opacity .4s ease';el.style.opacity='1';},i*60);}});
    if(grid){grid.style.opacity='0';setTimeout(()=>{grid.style.transition='opacity .4s ease';grid.style.opacity='1';},120);}
  },380);
}

function _buildStep(lbl,title,hint,grid){
  if(noteStep==='sense'){
    if(lbl)lbl.textContent='what are you noticing?';
    if(title)title.textContent='sense door';
    if(hint)hint.textContent='tap to select';
    if(grid){grid.className='sense-grid';grid.innerHTML='';
      SENSE_DOORS.en.forEach(item=>{
        const btn=document.createElement('button');btn.className='sense-btn';
        btn.style.background=SENSE_COLORS[item].h;
        btn.innerHTML=`<span class="sense-icon">${SENSE_ICONS[item]}</span>${item}`;
        btn.onclick=()=>{
          noteData.sense=item;noteData.senseEN=item;
          spawnRipple(lastX,lastY,SENSE_COLORS[item].rgb,'medium');
          tone(SENSE_TONES[item]||528,.009,1.4);
          btn.style.pointerEvents='none';
          setTimeout(()=>{noteStep='vedana';renderStep();},1100);};
        grid.appendChild(btn);});}
  } else if(noteStep==='vedana'){
    if(lbl)lbl.textContent='what is its tone?';
    if(title)title.textContent='feeling tone';
    if(hint)hint.textContent='pleasant, unpleasant, or neutral';
    if(grid){grid.className='vedana-grid';grid.innerHTML='';
      VEDANA.en.forEach(item=>{
        const btn=document.createElement('button');btn.className='vedana-btn';
        btn.style.background=VEDANA_COLORS[item].h;btn.textContent=item;
        btn.onclick=()=>{
          noteData.vedana=item;noteData.vedanaEN=item;noteData.vedanaRGB=VEDANA_COLORS[item].rgb;
          spawnRipple(lastX,lastY,VEDANA_COLORS[item].rgb,'medium');
          tone(VEDANA_TONES[item]||528,.009,1.4);
          btn.style.pointerEvents='none';
          setTimeout(()=>{noteStep='emotion';renderStep();},1100);};
        grid.appendChild(btn);});}
  } else {
    if(lbl)lbl.textContent='any emotion present?';
    if(title)title.textContent='emotion';
    if(hint)hint.textContent='tap the closest match';
    if(grid){grid.className='emotion-grid';grid.innerHTML='';
      EMOTIONS.en.forEach(item=>{
        const btn=document.createElement('button');btn.className='emotion-btn';
        btn.style.background=EMOTION_COLORS[item].h;btn.textContent=item;
        btn.onclick=()=>{
          btn.style.pointerEvents='none';
          noteData.emotion=item;
          spawnRipple(lastX,lastY,EMOTION_COLORS[item].rgb,'medium');
          tone(EMOTION_TONES[item]||528,.009,1.4);
          setTimeout(()=>completeNote(EMOTION_COLORS[item].rgb),600);};
        grid.appendChild(btn);});}
  }
}

function completeNote(rgb){
  // Big ripple
  spawnRipple(lastX,lastY,rgb||'240,238,232','xl');
  tone(639,.012,2.5);
  // Flash acknowledgement
  const flash=document.getElementById('notedFlash');
  const words=document.getElementById('notedWords');
  if(flash&&words){
    words.textContent=`${noteData.senseEN} · ${noteData.vedanaEN} · ${noteData.emotion}`;
    flash.classList.add('show');
    setTimeout(()=>flash.classList.remove('show'),2000);
  }
  // AI reflection
  const key=localStorage.getItem('f2_api_key');
  if(key)ai(`Noted: ${noteData.senseEN} · ${noteData.vedanaEN} · ${noteData.emotion}.`,NOTING_SYSTEM).then(res=>{if(res)showAI('noteAI',res,5000);});
  setTimeout(()=>{noteStep='sense';noteData={};renderStep();},2300);
}

// ── ANCHOR CANVAS ORB ──
function getBreathP(){
  const ct=anchorBreathClock%CYCLE,hEnd=INHALE+HOLD,eEnd=hEnd+EXHALE;
  if(ct<INHALE){const x=ct/INHALE;return 1-Math.pow(1-x,2.5);}
  if(ct<hEnd)return 1.0;
  if(ct<eEnd){const x=(ct-hEnd)/EXHALE;return 1-(x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2);}
  return 0;
}
function getBreathPhase(){
  const ct=anchorBreathClock%CYCLE;
  if(ct<INHALE)return'inhale';
  if(ct<INHALE+HOLD)return'hold';
  if(ct<INHALE+HOLD+EXHALE)return'exhale';
  return'rest';
}
function drawAnchorOrb(ts){
  if(!anchorOrbRAF)return;
  const c=document.getElementById('anchorOrbCanvas');if(!c)return;
  const dt=anchorOrbLast?Math.min(ts-anchorOrbLast,50):16;anchorOrbLast=ts;
  if(anchorState==='breathing')anchorBreathClock+=dt;
  const cx=c.getContext('2d'),dpr=devicePixelRatio||1;
  if(c.width!==innerWidth*dpr){c.width=innerWidth*dpr;c.height=innerHeight*dpr;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';cx.setTransform(1,0,0,1,0,0);cx.scale(dpr,dpr);}
  const W=innerWidth,H=innerHeight,X=W/2,Y=H/2,maxR=Math.min(W,H)*.28;
  const bp=getBreathP(),tR=12+(maxR-12)*bp;anchorOrbR+=(tR-anchorOrbR)*.022;
  const r=Math.max(3,anchorOrbR),glow=.85+.65*bp,rgb='90,181,212';
  const phase=getBreathPhase();
  const lbl=document.getElementById('bLbl');
  if(lbl)lbl.textContent=phase==='inhale'?'in':phase==='exhale'?'out':'';
  cx.clearRect(0,0,W,H);
  // Outer glow
  const grad=cx.createRadialGradient(X,Y,r*.3,X,Y,r*3.2);
  grad.addColorStop(0,`rgba(${rgb},${(.18*glow).toFixed(3)})`);
  grad.addColorStop(.5,`rgba(${rgb},${(.06*glow).toFixed(3)})`);
  grad.addColorStop(1,'rgba(90,181,212,0)');
  cx.beginPath();cx.arc(X,Y,r*3.2,0,Math.PI*2);cx.fillStyle=grad;cx.fill();
  // Rings
  for(let i=3;i>=0;i--){const rr=r*(1+i*.24),a=(.32-i*.06)*glow;cx.beginPath();cx.arc(X,Y,rr,0,Math.PI*2);cx.strokeStyle=`rgba(${rgb},${Math.max(0,a).toFixed(3)})`;cx.lineWidth=Math.max(.5,2.2-i*.5);cx.shadowColor=`rgba(${rgb},${(a*.5).toFixed(3)})`;cx.shadowBlur=10+i*5;cx.stroke();}
  // Core
  const cg=cx.createRadialGradient(X,Y,0,X,Y,r);cg.addColorStop(0,`rgba(${rgb},${(.30*glow).toFixed(3)})`);cg.addColorStop(.7,`rgba(${rgb},${(.10*glow).toFixed(3)})`);cg.addColorStop(1,'rgba(90,181,212,0)');cx.beginPath();cx.arc(X,Y,r,0,Math.PI*2);cx.fillStyle=cg;cx.fill();
  // Ripples
  anchorOrbRipples=anchorOrbRipples.filter(rp=>rp.alpha>0);
  anchorOrbRipples.forEach(rp=>{rp.r+=1.8;rp.alpha-=.010;cx.beginPath();cx.arc(X,Y,rp.r,0,Math.PI*2);cx.strokeStyle=`rgba(${rgb},${Math.max(0,rp.alpha).toFixed(3)})`;cx.lineWidth=1;cx.shadowBlur=6;cx.shadowColor=`rgba(${rgb},${(rp.alpha*.4).toFixed(3)})`;cx.stroke();});
  if(Math.abs((anchorBreathClock%CYCLE)-INHALE)<dt*1.5&&bp>.98)anchorOrbRipples.push({r:r*.8,alpha:.45});
  anchorOrbRAF=requestAnimationFrame(drawAnchorOrb);
}
function startAnchorOrb(){anchorBreathClock=0;anchorOrbR=10;anchorOrbLast=null;anchorOrbRipples=[];anchorOrbRAF=requestAnimationFrame(drawAnchorOrb);}
function stopAnchorOrb(){if(anchorOrbRAF){cancelAnimationFrame(anchorOrbRAF);anchorOrbRAF=null;}const c=document.getElementById('anchorOrbCanvas');if(c){const cx=c.getContext('2d');cx.clearRect(0,0,c.width,c.height);}}

function startAnchor(){
  anchorState='instruction';stopAnchorOrb();
  showScreen('s-anchor');document.getElementById('chrome').style.display='flex';
  setDrone(528,.018);tone(432,.010,4.5);
  const instr=document.getElementById('aInstr'),tap=document.getElementById('bOrbTap'),
    tHint=document.getElementById('anchorTapHint'),wBtn=document.getElementById('wBtn'),ret=document.getElementById('retTxt');
  if(instr){instr.style.opacity='1';instr.classList.remove('fade');instr.style.display='block';}
  if(tap)tap.style.display='none';if(tHint)tHint.style.display='none';
  if(wBtn)wBtn.style.display='none';if(ret)ret.classList.remove('show');
  setTimeout(()=>{
    if(instr)instr.classList.add('fade');
    setTimeout(()=>{
      if(instr)instr.style.display='none';
      if(tap)tap.style.display='flex';if(tHint)tHint.style.display='block';
      if(wBtn)wBtn.style.display='block';
      anchorState='breathing';startAnchorOrb();tone(432,.007,5);
    },2000);
  },4500);
}
function orbTap(e){
  if(anchorState!=='breathing')return;
  const phase=getBreathPhase();
  spawnRipple(e.clientX||innerWidth/2,e.clientY||innerHeight/2,phase==='inhale'||phase==='hold'?'90,181,212':'200,200,220','small');
  tone(528,.006,1.1);
}
function mindWandered(e){
  if(anchorState!=='breathing')return;
  anchorState='wandered';stopAnchorOrb();
  spawnRipple(e.clientX||innerWidth/2,e.clientY||innerHeight/2,'155,111,232','medium');
  tone(396,.010,2);
  const tap=document.getElementById('bOrbTap'),tHint=document.getElementById('anchorTapHint'),wBtn=document.getElementById('wBtn');
  if(tap)tap.style.display='none';if(tHint)tHint.style.display='none';if(wBtn)wBtn.style.display='none';
  const rw=RETURN_WORDS.en[Math.floor(Math.random()*RETURN_WORDS.en.length)];
  setTimeout(()=>{
    const ret=document.getElementById('retTxt');if(ret){ret.textContent=rw;ret.classList.add('show');}
    spawnRipple(innerWidth/2,innerHeight/2,'90,181,212','medium');tone(528,.012,2.5);
    setTimeout(()=>{
      if(ret)ret.classList.remove('show');
      if(tap)tap.style.display='flex';if(tHint)tHint.style.display='block';if(wBtn)wBtn.style.display='block';
      anchorState='breathing';anchorBreathClock=0;startAnchorOrb();
    },4000);
  },900);
}

// ── VERBAL ──
function startVerbal(){
  showScreen('s-verbal');document.getElementById('chrome').style.display='flex';
  setDrone(639,.014);tone(396,.009,2.5);
  const r=document.getElementById('verbalReflection'),t=document.getElementById('verbalTranscript');
  if(r){r.textContent='';r.classList.remove('show');}if(t)t.textContent='';
  const h=document.getElementById('verbalHint');if(h)h.textContent='tap to speak';
}
function toggleVerbal(){verbalOn?stopVerbal():startVerbalRec();}
function startVerbalRec(){
  initAudio();// wake audio before mic
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){const h=document.getElementById('verbalHint');if(h)h.textContent='voice not supported on this device';return;}
  const mic=document.getElementById('verbalMic'),hint=document.getElementById('verbalHint'),
    trans=document.getElementById('verbalTranscript'),refl=document.getElementById('verbalReflection');
  try{
    verbalRec=new SR();verbalRec.lang='en-US';verbalRec.continuous=false;verbalRec.interimResults=false;
    verbalRec.onstart=()=>{verbalOn=true;if(mic)mic.classList.add('listening');if(hint)hint.textContent='listening…';if(trans)trans.textContent='';if(refl){refl.textContent='';refl.classList.remove('show');}spawnRipple(innerWidth/2,innerHeight/2,'148,120,200','medium');tone(639,.007,2);};
    verbalRec.onresult=e=>{const txt=e.results[0][0].transcript;stopVerbal();if(trans)trans.textContent='"'+txt+'"';spawnRipple(innerWidth/2,innerHeight/2,'148,120,200','large');tone(528,.011,3);const key=localStorage.getItem('f2_api_key');if(key)ai(`Meditator said: "${txt}"`,VERBAL_SYSTEM).then(res=>{if(res&&refl){refl.textContent=res;refl.classList.add('show');}});else if(refl){refl.textContent='noted';refl.classList.add('show');}};
    verbalRec.onerror=()=>stopVerbal();
    verbalRec.onend=()=>{if(verbalOn)stopVerbal();};
    verbalRec.start();
  }catch(e){stopVerbal();}
}
function stopVerbal(){verbalOn=false;const mic=document.getElementById('verbalMic'),hint=document.getElementById('verbalHint');try{if(verbalRec)verbalRec.stop();}catch(e){}verbalRec=null;if(mic)mic.classList.remove('listening');if(hint)hint.textContent='tap to speak';}

// ── GUIDED ──
function startGuided(){resetGuided();showScreen('s-guided');document.getElementById('chrome').style.display='flex';setDrone(417,.016);tone(432,.008,2);}
function selectDur(btn){document.querySelectorAll('.dur-btn').forEach(b=>b.classList.remove('sel'));btn.classList.add('sel');guidedDur=parseInt(btn.dataset.min);}
function selectSpd(btn){document.querySelectorAll('.spd-btn').forEach(b=>b.classList.remove('sel'));btn.classList.add('sel');guidedSpeed=parseInt(btn.dataset.sec);}
function beginGuided(){
  const setup=document.getElementById('guidedSetup'),active=document.getElementById('guidedActive'),result=document.getElementById('guidedResult');
  if(setup)setup.style.display='none';if(result)result.classList.remove('show');if(active)active.classList.add('show');
  guidedNotes=[];guidedPromptIdx=0;const totalSecs=guidedDur*60;let elapsed=0;const prompts=GUIDED_PROMPTS.en;
  showGuidedPrompt(prompts[0]);tone(396,.010,2);
  guidedPromptTimer=setInterval(()=>{
    guidedPromptIdx=(guidedPromptIdx+1)%prompts.length;showGuidedPrompt(prompts[guidedPromptIdx]);
    guidedNotes.push(prompts[guidedPromptIdx]);
    tone(432+guidedPromptIdx*48,.006,1.5);spawnRipple(innerWidth/2,innerHeight/2,'138,191,184','small');
  },guidedSpeed*1000);
  guidedInterval=setInterval(()=>{
    elapsed++;const rem=totalSecs-elapsed,mins=Math.floor(rem/60),secs=rem%60;
    const te=document.getElementById('guidedTimer'),be=document.getElementById('guidedBar');
    if(te)te.textContent=`${mins}:${secs.toString().padStart(2,'0')}`;
    if(be)be.style.width=`${(elapsed/totalSecs)*100}%`;
    if(rem<=0)stopGuided();
  },1000);
}
function showGuidedPrompt(text){const el=document.getElementById('guidedPrompt');if(!el)return;el.classList.remove('show');setTimeout(()=>{el.textContent=text;el.classList.add('show');},200);}
function stopGuided(){
  clearInterval(guidedPromptTimer);clearInterval(guidedInterval);guidedPromptTimer=null;guidedInterval=null;
  const active=document.getElementById('guidedActive'),result=document.getElementById('guidedResult'),rt=document.getElementById('guidedResultText');
  if(active)active.classList.remove('show');spawnRipple(innerWidth/2,innerHeight/2,'138,191,184','xl');tone(528,.012,4);
  if(result)result.classList.add('show');if(rt)rt.textContent='reflecting…';
  const key=localStorage.getItem('f2_api_key');
  if(key&&rt)ai(`Student completed ${guidedDur} min guided noting.`,GUIDED_SYSTEM).then(res=>{if(res&&rt)rt.textContent=res;else if(rt)rt.textContent='Session complete. Stillness returns.';});
  else if(rt)rt.textContent='Session complete. Stillness returns.';
}
function stopGuidedSession(){clearInterval(guidedPromptTimer);clearInterval(guidedInterval);guidedPromptTimer=null;guidedInterval=null;}
function resetGuided(){
  stopGuidedSession();
  const setup=document.getElementById('guidedSetup'),active=document.getElementById('guidedActive'),result=document.getElementById('guidedResult'),
    bar=document.getElementById('guidedBar'),timer=document.getElementById('guidedTimer'),prompt=document.getElementById('guidedPrompt');
  if(setup)setup.style.display='flex';if(active)active.classList.remove('show');if(result)result.classList.remove('show');
  if(bar)bar.style.width='0%';if(timer)timer.textContent='';if(prompt){prompt.textContent='';prompt.classList.remove('show');}
  document.querySelectorAll('.dur-btn').forEach(b=>b.classList.toggle('sel',b.dataset.min==='1'));
  document.querySelectorAll('.spd-btn').forEach(b=>b.classList.toggle('sel',b.dataset.sec==='7'));
  guidedDur=1;guidedSpeed=7;guidedNotes=[];
}

// ── STORM ──
function startStorm(){
  stormIdx=0;stormLog=[];
  const word=document.getElementById('sWord'),wit=document.getElementById('sWit');
  if(word){word.textContent=STORM_CYCLE[0];word.classList.add('show');}
  if(wit){wit.textContent='';wit.classList.remove('show');}
  updateStormHint();showScreen('s-storm');document.getElementById('chrome').style.display='flex';
  setDrone(174,.016);tone(396,.010,2);
  if(stormMode==='watch')startStormAuto();
}
function setStormMode(mode){stormMode=mode;document.getElementById('stormTapBtn')?.classList.toggle('active',mode==='tap');document.getElementById('stormWatchBtn')?.classList.toggle('active',mode==='watch');updateStormHint();stopStormAuto();if(mode==='watch')startStormAuto();}
function updateStormHint(){const h=document.getElementById('sHint');if(h)h.textContent=stormMode==='tap'?'tap to release':'watching…';}
function startStormAuto(){stopStormAuto();stormAuto=setInterval(()=>{if(curScreen!=='s-storm'){stopStormAuto();return;}stormAdvance(null);},3500);}
function stopStormAuto(){if(stormAuto){clearInterval(stormAuto);stormAuto=null;}}
function stormAdvance(e){
  if(e&&e.target.closest('.storm-toggle'))return;
  const word=document.getElementById('sWord'),wit=document.getElementById('sWit');
  const x=e?e.clientX:innerWidth/2,y=e?e.clientY:innerHeight/2;
  spawnRipple(x,y,'155,111,232','medium');tone(432+(stormIdx%4)*36,.008,.9);
  stormLog.push(STORM_CYCLE[stormIdx%STORM_CYCLE.length]);stormIdx++;
  if(word)word.classList.remove('show');
  setTimeout(()=>{
    if(stormIdx>=STORM_CYCLE.length){
      stopStormAuto();if(word){word.textContent='·';word.classList.add('show');}
      spawnRipple(innerWidth/2,innerHeight/2,'155,111,232','xl');
      setTimeout(()=>spawnRipple(innerWidth/2,innerHeight/2,'245,166,35','large'),300);
      tone(528,.012,4);
      // Witness text even without API key
      const fallbacks=['not self','passing away','already gone','just sensation','impermanent'];
      const key=localStorage.getItem('f2_api_key');
      if(key&&wit)ai(`Student cycled: ${stormLog.join(', ')}`,STORM_SYSTEM).then(res=>{if(wit){wit.textContent=res||fallbacks[Math.floor(Math.random()*fallbacks.length)];wit.classList.add('show');}});
      else if(wit){wit.textContent=fallbacks[Math.floor(Math.random()*fallbacks.length)];wit.classList.add('show');}
      stormIdx=0;stormLog=[];if(stormMode==='watch')setTimeout(()=>startStormAuto(),5000);
    } else {
      if(word){word.textContent=STORM_CYCLE[stormIdx];word.classList.add('show');}
    }
  },260);
}
document.addEventListener('click',e=>{if(curScreen!=='s-storm')return;if(e.target.closest('.storm-toggle')||e.target.closest('#chrome'))return;if(stormMode==='tap')stormAdvance(e);});
