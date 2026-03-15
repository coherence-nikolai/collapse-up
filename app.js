// SEE v4 — app.js
let curScreen='s-splash',noteStep='sense',noteData={},anchorState='idle';
let stormIdx=0,stormLog=[],stormMode='tap',stormAuto=null;
let guidedDur=1,guidedTimer=null,guidedInterval=null,guidedNotes=[],guidedPromptIdx=0,guidedPromptTimer=null;
let verbalRec=null,verbalOn=false;
let lastX=innerWidth/2,lastY=innerHeight/2;
let anchorOrbRAF=null,anchorBreathClock=0,anchorOrbR=10,anchorOrbLast=null,anchorOrbRipples=[];
let breathTimer=null,activeDroneStop=null;
const ANCHOR_INHALE=5000,ANCHOR_HOLD=900,ANCHOR_EXHALE=6000,ANCHOR_REST=700;
const ANCHOR_CYCLE=ANCHOR_INHALE+ANCHOR_HOLD+ANCHOR_EXHALE+ANCHOR_REST;

document.addEventListener('touchstart',e=>{lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;},{passive:true});
document.addEventListener('mousedown',e=>{lastX=e.clientX;lastY=e.clientY;},{passive:true});

// RIPPLE
const canvas=document.getElementById('rippleCanvas');
const ctx=canvas?canvas.getContext('2d'):null;
let ripples=[];
function resize(){if(!canvas)return;const dpr=devicePixelRatio||1;canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';if(ctx){ctx.setTransform(1,0,0,1,0,0);ctx.scale(dpr,dpr);}}
window.addEventListener('resize',resize);resize();
function spawnRipple(x,y,rgb,size){const maxR=size==='xl'?Math.max(innerWidth,innerHeight)*.90:size==='large'?Math.max(innerWidth,innerHeight)*.62:size==='medium'?Math.max(innerWidth,innerHeight)*.40:Math.max(innerWidth,innerHeight)*.22;ripples.push({x,y,r:2,maxR,rgb,alpha:.78});}
(function loop(){requestAnimationFrame(loop);if(!ctx)return;ctx.clearRect(0,0,innerWidth,innerHeight);ripples=ripples.filter(r=>r.alpha>0.004);ripples.forEach(rp=>{rp.r+=(rp.maxR-rp.r)*.018;rp.alpha=Math.max(0,rp.alpha-.005);for(let i=0;i<3;i++){const ringR=rp.r*(1-i*.20);if(ringR<1)continue;const a=rp.alpha*(1-i*.28);ctx.save();ctx.beginPath();ctx.arc(rp.x,rp.y,ringR,0,Math.PI*2);ctx.strokeStyle=`rgba(${rp.rgb},${a.toFixed(3)})`;ctx.lineWidth=Math.max(1.5,4-i*1.2);ctx.shadowColor=`rgba(${rp.rgb},${(a*.55).toFixed(3)})`;ctx.shadowBlur=16+(2-i)*10;ctx.stroke();ctx.restore();}});})();

// AUDIO
let audioCtx=null;
function initAudio(){try{if(!audioCtx||audioCtx.state==='closed')audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});}catch(e){}}
document.addEventListener('touchstart',initAudio,{passive:true,once:true});
document.addEventListener('click',initAudio,{passive:true,once:true});
window.addEventListener('pageshow',()=>{if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});});
function tone(freq,gain,dur){initAudio();if(!audioCtx)return;try{const o=audioCtx.createOscillator(),g=audioCtx.createGain(),lp=audioCtx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;o.type='sine';o.frequency.value=freq;const t0=audioCtx.currentTime;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(gain,t0+.08);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(lp);lp.connect(g);g.connect(audioCtx.destination);o.start(t0);o.stop(t0+dur+.1);}catch(e){}}
function startDrone(freq,gain){initAudio();if(!audioCtx)return()=>{};try{const o=audioCtx.createOscillator(),g=audioCtx.createGain(),lp=audioCtx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=500;o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,audioCtx.currentTime);g.gain.linearRampToValueAtTime(gain,audioCtx.currentTime+2.5);o.connect(lp);lp.connect(g);g.connect(audioCtx.destination);o.start();return()=>{try{g.gain.linearRampToValueAtTime(0,audioCtx.currentTime+1.5);o.stop(audioCtx.currentTime+1.6);}catch(e){}};}catch(e){return()=>{};}}
function setDrone(freq,gain){if(activeDroneStop){activeDroneStop();activeDroneStop=null;}if(freq)activeDroneStop=startDrone(freq,gain||.022);}

// SCREENS
function showScreen(id){const prev=document.querySelector('.screen.active'),next=document.getElementById(id);if(!next)return;if(prev&&prev.id===id)return;if(prev){prev.style.opacity='0';setTimeout(()=>prev.classList.remove('active'),480);}setTimeout(()=>{next.classList.add('active');next.style.opacity='';curScreen=id;},prev?260:0);}

// SETTINGS
function openSettings(){setDrone(null);showScreen('s-settings');document.getElementById('chrome').style.display='none';}
function closeSettings(){showScreen('s-home');document.getElementById('chrome').style.display='none';}
function saveKey(){const inp=document.getElementById('apiInput');if(inp&&inp.value.trim()){localStorage.setItem('f2_api_key',inp.value.trim());inp.value='';inp.placeholder='saved ✓';setTimeout(()=>inp.placeholder='Anthropic API key (optional)',2000);}}
function clearKey(){localStorage.removeItem('f2_api_key');const inp=document.getElementById('apiInput');if(inp)inp.placeholder='Anthropic API key (optional)';}

// HOME
function goHome(){stopVerbal();clearBreathTimers();stopAnchorOrb();stopGuidedSession();setDrone(null);spawnRipple(lastX,lastY,'240,238,232','large');showScreen('s-home');document.getElementById('chrome').style.display='none';tone(396,.010,2.5);}

// AI
async function ai(prompt,system){const key=localStorage.getItem('f2_api_key');if(!key)return null;try{const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:80,system,messages:[{role:'user',content:prompt}]})});const d=await res.json();return d.content?.[0]?.text?.trim()||null;}catch(e){return null;}}
function showAI(id,text,dur=5000){const el=document.getElementById(id);if(!el)return;el.textContent=text;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),dur);}

// ── NOTING ──
function startNoting(){noteStep='sense';noteData={};renderStep();showScreen('s-noting');document.getElementById('chrome').style.display='flex';setDrone(396,.020);tone(432,.010,2);}
function renderStep(){
  const lbl=document.getElementById('stepLbl'),title=document.getElementById('stepTitle'),grid=document.getElementById('chipGrid'),aiEl=document.getElementById('noteAI');
  if(aiEl){aiEl.textContent='';aiEl.classList.remove('show');}
  if(noteStep==='sense'){
    if(lbl)lbl.textContent='what are you noticing?';
    if(title)title.textContent='sense door';
    if(grid){grid.className='sense-grid';grid.innerHTML='';
      SENSE_DOORS.en.forEach((item,i)=>{
        const btn=document.createElement('button');btn.className='sense-btn';
        btn.style.background=SENSE_COLORS[item].h;
        btn.innerHTML=`<span class="sense-icon">${SENSE_ICONS[item]}</span>${item}`;
        btn.addEventListener('pointerdown',e=>{e.preventDefault();noteData.sense=item;noteData.senseEN=item;
          spawnRipple(e.clientX,e.clientY,SENSE_COLORS[item].rgb,'medium');tone(528,.009,1.4);
          btn.style.pointerEvents='none';setTimeout(()=>{noteStep='vedana';renderStep();},1100);});
        grid.appendChild(btn);});}
  } else if(noteStep==='vedana'){
    if(lbl)lbl.textContent='what is its tone?';
    if(title)title.textContent='feeling tone';
    if(grid){grid.className='vedana-grid';grid.innerHTML='';
      VEDANA.en.forEach((item,i)=>{
        const btn=document.createElement('button');btn.className='vedana-btn';
        btn.style.background=VEDANA_COLORS[item].h;btn.textContent=item;
        btn.addEventListener('pointerdown',e=>{e.preventDefault();noteData.vedana=item;noteData.vedanaEN=item;noteData.vedanaRGB=VEDANA_COLORS[item].rgb;
          spawnRipple(e.clientX,e.clientY,VEDANA_COLORS[item].rgb,'medium');tone(528,.009,1.4);
          btn.style.pointerEvents='none';setTimeout(()=>{noteStep='emotion';renderStep();},1100);});
        grid.appendChild(btn);});}
  } else {
    if(lbl)lbl.textContent='any emotion present?';
    if(title)title.textContent='emotion';
    if(grid){grid.className='emotion-grid';grid.innerHTML='';
      EMOTIONS.en.forEach((item,i)=>{
        const btn=document.createElement('button');btn.className='emotion-btn';
        btn.style.background=EMOTION_COLORS[item].h;btn.textContent=item;
        btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.style.pointerEvents='none';noteData.emotion=item;
          spawnRipple(e.clientX,e.clientY,EMOTION_COLORS[item].rgb,'medium');tone(528,.009,1.4);
          setTimeout(()=>completeNote(e.clientX,e.clientY,EMOTION_COLORS[item].rgb),600);});
        grid.appendChild(btn);});}
  }
}
function completeNote(x,y,rgb){spawnRipple(x||lastX,y||lastY,rgb||'240,238,232','xl');tone(639,.012,2.5);const key=localStorage.getItem('f2_api_key');if(key)ai(`Noted: ${noteData.senseEN} · ${noteData.vedanaEN} · ${noteData.emotion}.`,NOTING_SYSTEM).then(res=>{if(res)showAI('noteAI',res,5000);});setTimeout(()=>{noteStep='sense';noteData={};renderStep();},2200);}

// ── ANCHOR ──
function getAnchorBreathP(){const ct=anchorBreathClock%ANCHOR_CYCLE,hEnd=ANCHOR_INHALE+ANCHOR_HOLD,eEnd=hEnd+ANCHOR_EXHALE;if(ct<ANCHOR_INHALE){const x=ct/ANCHOR_INHALE;return 1-Math.pow(1-x,2.5);}if(ct<hEnd)return 1.0;if(ct<eEnd){const x=(ct-hEnd)/ANCHOR_EXHALE;return 1-(x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2);}return 0;}
function getAnchorPhase(){const ct=anchorBreathClock%ANCHOR_CYCLE;if(ct<ANCHOR_INHALE)return'inhale';if(ct<ANCHOR_INHALE+ANCHOR_HOLD)return'hold';if(ct<ANCHOR_INHALE+ANCHOR_HOLD+ANCHOR_EXHALE)return'exhale';return'rest';}
function drawAnchorOrb(ts){
  if(!anchorOrbRAF)return;
  const c=document.getElementById('anchorOrbCanvas');if(!c)return;
  const dt=anchorOrbLast?Math.min(ts-anchorOrbLast,50):16;anchorOrbLast=ts;anchorBreathClock+=dt;
  const cx2=c.getContext('2d'),dpr=devicePixelRatio||1;
  if(c.width!==innerWidth*dpr){c.width=innerWidth*dpr;c.height=innerHeight*dpr;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';cx2.setTransform(1,0,0,1,0,0);cx2.scale(dpr,dpr);}
  const W=innerWidth,H=innerHeight,X=W/2,Y=H/2,maxR=Math.min(W,H)*.30;
  const bp=getAnchorBreathP(),tR=10+(maxR-10)*bp;anchorOrbR+=(tR-anchorOrbR)*.022;
  const r=Math.max(2,anchorOrbR),glow=.85+.65*bp,rgb='90,181,212';
  const phase=getAnchorPhase();
  const lbl=document.getElementById('bLbl');
  if(lbl)lbl.textContent=phase==='inhale'?'in':phase==='exhale'?'out':'';
  cx2.clearRect(0,0,W,H);
  const grad=cx2.createRadialGradient(X,Y,r*.3,X,Y,r*3);
  grad.addColorStop(0,`rgba(${rgb},${(.16*glow).toFixed(3)})`);
  grad.addColorStop(.5,`rgba(${rgb},${(.06*glow).toFixed(3)})`);
  grad.addColorStop(1,'rgba(90,181,212,0)');
  cx2.beginPath();cx2.arc(X,Y,r*3,0,Math.PI*2);cx2.fillStyle=grad;cx2.fill();
  for(let i=3;i>=0;i--){const ringR=r*(1+i*.22),a=(.32-i*.06)*glow;cx2.beginPath();cx2.arc(X,Y,ringR,0,Math.PI*2);cx2.strokeStyle=`rgba(${rgb},${Math.max(0,a).toFixed(3)})`;cx2.lineWidth=Math.max(.5,2-i*.4);cx2.shadowColor=`rgba(${rgb},${(a*.5).toFixed(3)})`;cx2.shadowBlur=10+i*4;cx2.stroke();}
  const cg=cx2.createRadialGradient(X,Y,0,X,Y,r);cg.addColorStop(0,`rgba(${rgb},${(.30*glow).toFixed(3)})`);cg.addColorStop(.6,`rgba(${rgb},${(.10*glow).toFixed(3)})`);cg.addColorStop(1,'rgba(90,181,212,0)');cx2.beginPath();cx2.arc(X,Y,r,0,Math.PI*2);cx2.fillStyle=cg;cx2.fill();
  anchorOrbRipples=anchorOrbRipples.filter(rp=>rp.alpha>0);
  anchorOrbRipples.forEach(rp=>{rp.r+=1.8;rp.alpha-=.010;cx2.beginPath();cx2.arc(X,Y,rp.r,0,Math.PI*2);cx2.strokeStyle=`rgba(${rgb},${Math.max(0,rp.alpha).toFixed(3)})`;cx2.lineWidth=1;cx2.shadowBlur=6;cx2.shadowColor=`rgba(${rgb},${(rp.alpha*.4).toFixed(3)})`;cx2.stroke();});
  if(Math.abs((anchorBreathClock%ANCHOR_CYCLE)-ANCHOR_INHALE)<dt*1.5&&bp>.98)anchorOrbRipples.push({r:r*.8,alpha:.45});
  anchorOrbRAF=requestAnimationFrame(drawAnchorOrb);
}
function startAnchorOrb(){anchorBreathClock=0;anchorOrbR=10;anchorOrbLast=null;anchorOrbRipples=[];anchorOrbRAF=requestAnimationFrame(drawAnchorOrb);}
function stopAnchorOrb(){if(anchorOrbRAF){cancelAnimationFrame(anchorOrbRAF);anchorOrbRAF=null;}const c=document.getElementById('anchorOrbCanvas');if(c){const cx2=c.getContext('2d');cx2.clearRect(0,0,c.width,c.height);}}
function startAnchor(){
  anchorState='instruction';clearBreathTimers();stopAnchorOrb();
  showScreen('s-anchor');document.getElementById('chrome').style.display='flex';
  setDrone(528,.018);tone(432,.010,4.5);
  const instr=document.getElementById('aInstr'),wBtn=document.getElementById('wBtn'),tap=document.getElementById('bOrbTap'),ret=document.getElementById('retTxt');
  if(instr){instr.style.opacity='1';instr.classList.remove('fade');instr.style.display='block';}
  if(wBtn)wBtn.style.display='none';if(tap)tap.style.display='none';if(ret)ret.classList.remove('show');
  setTimeout(()=>{if(instr)instr.classList.add('fade');setTimeout(()=>{if(instr)instr.style.display='none';if(tap)tap.style.display='flex';if(wBtn)wBtn.style.display='block';anchorState='breathing';startAnchorOrb();tone(432,.007,5);},2000);},4500);
}
function orbTap(e){if(anchorState!=='breathing')return;const phase=getAnchorPhase();spawnRipple(e.clientX,e.clientY,phase==='inhale'||phase==='hold'?'90,181,212':'200,200,220','small');tone(528,.006,1.1);}
function mindWandered(e){
  if(anchorState!=='breathing')return;clearBreathTimers();anchorState='wandered';stopAnchorOrb();
  spawnRipple(e.clientX||innerWidth/2,e.clientY||innerHeight/2,'155,111,232','medium');tone(396,.010,2);
  const wBtn=document.getElementById('wBtn'),tap=document.getElementById('bOrbTap');
  if(wBtn)wBtn.style.display='none';if(tap)tap.style.display='none';
  const rw=RETURN_WORDS.en[Math.floor(Math.random()*RETURN_WORDS.en.length)];
  setTimeout(()=>{
    const ret=document.getElementById('retTxt');if(ret){ret.textContent=rw;ret.classList.add('show');}
    spawnRipple(innerWidth/2,innerHeight/2,'90,181,212','medium');tone(528,.012,2.5);
    setTimeout(()=>{if(ret)ret.classList.remove('show');if(tap)tap.style.display='flex';if(wBtn)wBtn.style.display='block';anchorState='breathing';anchorBreathClock=0;startAnchorOrb();},4000);
  },900);
}
function clearBreathTimers(){if(breathTimer){clearTimeout(breathTimer);breathTimer=null;}}

// ── GUIDED ──
function startGuided(){resetGuided();showScreen('s-guided');document.getElementById('chrome').style.display='flex';setDrone(417,.016);tone(432,.008,2);}
function selectDur(btn){document.querySelectorAll('.dur-btn').forEach(b=>b.classList.remove('sel'));btn.classList.add('sel');guidedDur=parseInt(btn.dataset.min);}
function beginGuided(){
  const setup=document.getElementById('guidedSetup'),active=document.getElementById('guidedActive'),result=document.getElementById('guidedResult');
  if(setup)setup.style.display='none';if(result)result.classList.remove('show');if(active)active.classList.add('show');
  guidedNotes=[];guidedPromptIdx=0;const totalSecs=guidedDur*60;let elapsed=0;const prompts=GUIDED_PROMPTS.en;
  showGuidedPrompt(prompts[0]);tone(396,.010,2);
  guidedPromptTimer=setInterval(()=>{guidedPromptIdx=(guidedPromptIdx+1)%prompts.length;showGuidedPrompt(prompts[guidedPromptIdx]);guidedNotes.push(prompts[guidedPromptIdx]);tone(432+guidedPromptIdx*48,.006,1.5);spawnRipple(innerWidth/2,innerHeight/2,'138,191,184','small');},8000);
  guidedInterval=setInterval(()=>{elapsed++;const remaining=totalSecs-elapsed,mins=Math.floor(remaining/60),secs=remaining%60;const te=document.getElementById('guidedTimer'),be=document.getElementById('guidedBar');if(te)te.textContent=`${mins}:${secs.toString().padStart(2,'0')}`;if(be)be.style.width=`${(elapsed/totalSecs)*100}%`;if(remaining<=0)stopGuided();},1000);
}
function showGuidedPrompt(text){const el=document.getElementById('guidedPrompt');if(!el)return;el.classList.remove('show');setTimeout(()=>{el.textContent=text;el.classList.add('show');},200);}
function stopGuided(){
  clearInterval(guidedPromptTimer);clearInterval(guidedInterval);guidedPromptTimer=null;guidedInterval=null;
  const active=document.getElementById('guidedActive'),result=document.getElementById('guidedResult'),rt=document.getElementById('guidedResultText');
  if(active)active.classList.remove('show');spawnRipple(innerWidth/2,innerHeight/2,'138,191,184','xl');tone(528,.012,4);
  if(result)result.classList.add('show');if(rt)rt.textContent='reflecting…';
  const key=localStorage.getItem('f2_api_key');
  if(key&&rt){const sum=`Student completed ${guidedDur} min guided noting.`;ai(sum,GUIDED_SYSTEM).then(res=>{if(res&&rt)rt.textContent=res;else if(rt)rt.textContent='Session complete. Stillness returns.';});}
  else if(rt)rt.textContent='Session complete. Stillness returns.';
}
function stopGuidedSession(){clearInterval(guidedPromptTimer);clearInterval(guidedInterval);guidedPromptTimer=null;guidedInterval=null;}
function resetGuided(){
  stopGuidedSession();
  const setup=document.getElementById('guidedSetup'),active=document.getElementById('guidedActive'),result=document.getElementById('guidedResult'),bar=document.getElementById('guidedBar'),timer=document.getElementById('guidedTimer'),prompt=document.getElementById('guidedPrompt');
  if(setup)setup.style.display='flex';if(active)active.classList.remove('show');if(result)result.classList.remove('show');
  if(bar)bar.style.width='0%';if(timer)timer.textContent='';if(prompt){prompt.textContent='';prompt.classList.remove('show');}
  document.querySelectorAll('.dur-btn').forEach(b=>b.classList.toggle('sel',b.dataset.min==='1'));
  guidedDur=1;guidedNotes=[];
}

// ── VERBAL ──
function startVerbal(){showScreen('s-verbal');document.getElementById('chrome').style.display='flex';setDrone(639,.014);tone(396,.009,2.5);const r=document.getElementById('verbalReflection'),t=document.getElementById('verbalTranscript');if(r){r.textContent='';r.classList.remove('show');}if(t)t.textContent='';const h=document.getElementById('verbalHint');if(h)h.textContent='tap to speak';}
function toggleVerbal(){verbalOn?stopVerbal():startVerbalRec();}
function startVerbalRec(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){const h=document.getElementById('verbalHint');if(h)h.textContent='voice not available on this device';return;}
  const mic=document.getElementById('verbalMic'),hint=document.getElementById('verbalHint'),trans=document.getElementById('verbalTranscript'),refl=document.getElementById('verbalReflection');
  try{verbalRec=new SR();verbalRec.lang='en-US';verbalRec.continuous=false;verbalRec.interimResults=false;
    verbalRec.onstart=()=>{verbalOn=true;if(mic)mic.classList.add('listening');if(hint)hint.textContent='listening…';if(trans)trans.textContent='';if(refl){refl.textContent='';refl.classList.remove('show');}spawnRipple(innerWidth/2,innerHeight/2,'148,120,200','medium');tone(639,.007,2);};
    verbalRec.onresult=e=>{const txt=e.results[0][0].transcript;stopVerbal();if(trans)trans.textContent='"'+txt+'"';spawnRipple(innerWidth/2,innerHeight/2,'148,120,200','large');tone(528,.011,3);const key=localStorage.getItem('f2_api_key');if(key)ai(`Meditator said: "${txt}"`,VERBAL_SYSTEM||NOTING_SYSTEM).then(res=>{if(res&&refl){refl.textContent=res;refl.classList.add('show');}});else if(refl){refl.textContent='noted';refl.classList.add('show');}};
    verbalRec.onerror=()=>stopVerbal();verbalRec.onend=()=>{if(verbalOn)stopVerbal();};verbalRec.start();
  }catch(e){stopVerbal();}
}
function stopVerbal(){verbalOn=false;const mic=document.getElementById('verbalMic'),hint=document.getElementById('verbalHint');try{if(verbalRec)verbalRec.stop();}catch(e){}verbalRec=null;if(mic)mic.classList.remove('listening');if(hint)hint.textContent='tap to speak';}

// ── STORM ──
function startStorm(){stormIdx=0;stormLog=[];const word=document.getElementById('sWord'),wit=document.getElementById('sWit');if(word){word.textContent=STORM_CYCLE[0];word.classList.add('show');}if(wit){wit.textContent='';wit.classList.remove('show');}updateStormHint();showScreen('s-storm');document.getElementById('chrome').style.display='flex';setDrone(174,.016);tone(396,.010,2);if(stormMode==='watch')startStormAuto();}
function setStormMode(mode){stormMode=mode;document.getElementById('stormTapBtn')?.classList.toggle('active',mode==='tap');document.getElementById('stormWatchBtn')?.classList.toggle('active',mode==='watch');updateStormHint();stopStormAuto();if(mode==='watch')startStormAuto();}
function updateStormHint(){const h=document.getElementById('sHint');if(h)h.textContent=stormMode==='tap'?'tap to release':'watching…';}
function startStormAuto(){stopStormAuto();stormAuto=setInterval(()=>{if(curScreen!=='s-storm'){stopStormAuto();return;}stormAdvance(null);},3500);}
function stopStormAuto(){if(stormAuto){clearInterval(stormAuto);stormAuto=null;}}
function stormAdvance(e){
  if(e&&(e.target.closest('.storm-toggle')||e.target.closest('.back-btn')||e.target.closest('.gear-btn')))return;
  const word=document.getElementById('sWord'),wit=document.getElementById('sWit');
  const x=e?e.clientX:innerWidth/2,y=e?e.clientY:innerHeight/2;
  spawnRipple(x,y,'155,111,232','medium');tone(432+(stormIdx%4)*36,.008,.9);
  stormLog.push(STORM_CYCLE[stormIdx%STORM_CYCLE.length]);stormIdx++;
  if(word)word.classList.remove('show');
  setTimeout(()=>{
    if(stormIdx>=STORM_CYCLE.length){stopStormAuto();if(word){word.textContent='·';word.classList.add('show');}spawnRipple(innerWidth/2,innerHeight/2,'155,111,232','xl');setTimeout(()=>spawnRipple(innerWidth/2,innerHeight/2,'245,166,35','large'),300);tone(528,.012,4);const key=localStorage.getItem('f2_api_key');if(key&&wit)ai(`Student cycled: ${stormLog.join(', ')}`,STORM_SYSTEM).then(res=>{if(res){wit.textContent=res;wit.classList.add('show');}});stormIdx=0;stormLog=[];if(stormMode==='watch')setTimeout(()=>startStormAuto(),5000);}
    else{if(word){word.textContent=STORM_CYCLE[stormIdx];word.classList.add('show');}}
  },260);
}
document.addEventListener('click',e=>{if(curScreen!=='s-storm')return;if(stormMode==='tap')stormAdvance(e);});

// INIT
document.addEventListener('DOMContentLoaded',()=>{const img=document.getElementById('splashImg');if(img&&typeof SPLASH_B64!=='undefined')img.src=SPLASH_B64;});
