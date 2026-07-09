'use strict';
/* ---------- audio : musique générative façon WoW ---------- */
let AC=null,master=null,musBus=null,musNext=0,combatHeat=0,curMusZone='lande';
const ZMUS={
 lande:{root:50,sc:[0,2,3,5,7,9,10],prog:[0,5,3,4],bar:4.2,mel:0.45,harp:1,flute:1},
 capitale:{root:48,sc:[0,2,4,5,7,9,11],prog:[0,5,3,4],bar:3.9,mel:0.6,harp:1,flute:1,bell:1},
 fange:{root:52,sc:[0,2,3,5,7,8,10],prog:[0,3,5,4],bar:4.6,mel:0.35,drone:1,harp:1},
 foret:{root:52,sc:[0,1,3,5,7,8,10],prog:[0,1,5,3],bar:4.8,mel:0.3,drone:1,pizz:1},
 cretes:{root:45,sc:[0,2,3,5,7,8,11],prog:[0,5,6,4],bar:4.4,mel:0.4,drone:1,bell:1},
 envers:{root:43,sc:[0,1,3,5,7,8,10],prog:[0,0,1,0],bar:5.6,mel:0.15,drone:1}};
const mtof=m=>440*Math.pow(2,(m-69)/12);
let melPrev=0;
function audioInit(){
  if(G.muted)return;
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    master=AC.createGain();master.gain.value=0.5;master.connect(AC.destination);
    musBus=AC.createGain();musBus.gain.value=0.55;musBus.connect(master);
    const len=AC.sampleRate*3,buf=AC.createBuffer(1,len,AC.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    const src=AC.createBufferSource();src.buffer=buf;src.loop=true;
    const wf=AC.createBiquadFilter();wf.type='bandpass';wf.frequency.value=420;wf.Q.value=0.6;
    const wg=AC.createGain();wg.gain.value=0.016;
    src.connect(wf);wf.connect(wg);wg.connect(master);src.start();
    musNext=AC.currentTime+0.2;
  }catch(e){}
}
function note(freq,t0,dur,type,vol,dest,att=0.02,vib=0){
  const o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.value=freq;
  if(vib>0){const l=AC.createOscillator(),lg=AC.createGain();
    l.frequency.value=5;lg.gain.value=vib;l.connect(lg);lg.connect(o.frequency);
    l.start(t0);l.stop(t0+dur+0.3);}
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(vol,t0+att);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g);g.connect(dest);o.start(t0);o.stop(t0+dur+0.05);
}
function scheduleBar(t0,zm,bi){
  const deg=zm.prog[bi%zm.prog.length];
  const sc=zm.sc,root=zm.root;
  const nd=i=>root+12*Math.floor((deg+i)/sc.length)+sc[(deg+i)%sc.length];
  const chord=[nd(0),nd(2),nd(4)];
  chord.forEach(m=>{[-3,3].forEach(det=>{
    note(mtof(m)*Math.pow(2,det/1200),t0,zm.bar*0.98,'sawtooth',0.018,padLP(),1.3);});});
  note(mtof(chord[0]-12),t0,zm.bar*0.95,'sine',0.05,musBus,0.4);
  if(zm.drone){ // bourdon grave, quinte tenue
    note(mtof(chord[0]-24),t0,zm.bar*1.02,'sine',0.045,musBus,0.9);
    note(mtof(chord[0]-17),t0,zm.bar*1.02,'sine',0.03,musBus,0.9);}
  if(zm.bell){ // cloches lointaines
    [0.12,0.62].forEach((fr,i)=>{if(Math.random()<0.7)
      note(mtof(chord[2]+12+(i?7:0)),t0+fr*zm.bar,1.5,'sine',0.032,musBus,0.005);});}
  if(zm.pizz){ // cordes pincées inquiètes
    [0,0.14,0.3,0.5,0.62,0.82].forEach(fr=>{if(Math.random()<0.6)
      note(mtof(chord[irand(0,2)]),t0+fr*zm.bar,0.1,'triangle',0.045,musBus,0.002);});}
  if(zm.harp)[0,0.18,0.38,0.56,0.74].forEach((fr,i)=>{
    if(Math.random()<0.85)note(mtof(chord[i%3]+12+(i>2?12:0)),t0+fr*zm.bar+rand(-0.02,0.02),0.9,'triangle',0.035,musBus,0.004);});
  if(zm.flute&&Math.random()<zm.mel){
    let cur=melPrev||deg+7;const n=irand(3,5);let tt=t0+rand(0,0.6);
    for(let i=0;i<n;i++){
      cur+=pickR([-2,-1,-1,1,1,2,3]);cur=clamp(cur,4,16);
      const dur=rand(0.45,1.0);
      note(mtof(root+24+12*Math.floor(cur/sc.length)+sc[((cur%sc.length)+sc.length)%sc.length]),
        tt,dur,'sine',0.045,musBus,0.09,3);
      tt+=dur*rand(0.85,1.1);
      if(tt>t0+zm.bar)break;}
    melPrev=cur;}
  if(combatHeat>0.15){
    [[0,1],[zm.bar*0.5,0.7],[zm.bar*0.75,0.4]].forEach(([off,v])=>{
      const t=t0+off;
      const o=AC.createOscillator(),g=AC.createGain();
      o.type='sine';o.frequency.setValueAtTime(85,t);o.frequency.exponentialRampToValueAtTime(38,t+0.18);
      g.gain.setValueAtTime(0.22*v*combatHeat,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
      o.connect(g);g.connect(musBus);o.start(t);o.stop(t+0.25);});}
}
let _padLP=null;
function padLP(){
  if(_padLP)return _padLP;
  _padLP=AC.createBiquadFilter();_padLP.type='lowpass';_padLP.frequency.value=760;
  _padLP.connect(musBus);return _padLP;
}
let barIdx=0;
function musicTick(){
  if(!AC||G.muted)return;
  const zm=ZMUS[curMusZone]||ZMUS.lande;
  while(musNext<AC.currentTime+0.6){scheduleBar(musNext,zm,barIdx++);musNext+=zm.bar;}
}
function sfx(type,mag=1){
  if(!AC||G.muted)return;
  const t=AC.currentTime;
  if(type==='hit'){
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='triangle';o.frequency.setValueAtTime(120+mag*40,t);o.frequency.exponentialRampToValueAtTime(38,t+0.14);
    g.gain.setValueAtTime(0.22*mag,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.16);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+0.18);
    const n=AC.createBufferSource(),nb=AC.createBuffer(1,2200,AC.sampleRate),nd2=nb.getChannelData(0);
    for(let i=0;i<2200;i++)nd2[i]=(Math.random()*2-1)*(1-i/2200);
    n.buffer=nb;const ng=AC.createGain();ng.gain.value=0.12*mag;
    const nf=AC.createBiquadFilter();nf.type='lowpass';nf.frequency.value=900;
    n.connect(nf);nf.connect(ng);ng.connect(master);n.start(t);
  }else if(type==='tir'){
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='square';o.frequency.setValueAtTime(660,t);o.frequency.exponentialRampToValueAtTime(180,t+0.09);
    g.gain.setValueAtTime(0.06,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.1);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+0.12);
  }else if(type==='mort'){
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(30,t+0.7);
    g.gain.setValueAtTime(0.1,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.8);
    const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=300;
    o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+0.85);
  }else if(type==='lvl'){
    [392,523,659,784].forEach((fr,i)=>{const o=AC.createOscillator(),g=AC.createGain();
      o.type='sine';o.frequency.value=fr;g.gain.setValueAtTime(0.001,t+i*0.09);
      g.gain.exponentialRampToValueAtTime(0.09,t+i*0.09+0.03);g.gain.exponentialRampToValueAtTime(0.001,t+i*0.09+0.9);
      o.connect(g);g.connect(master);o.start(t+i*0.09);o.stop(t+i*0.09+1);});
  }else if(type==='or'){
    const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=1180;
    g.gain.setValueAtTime(0.05,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+0.14);
  }else if(type==='slam'){
    const o=AC.createOscillator(),g=AC.createGain();o.type='sine';
    o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(24,t+0.4);
    g.gain.setValueAtTime(0.35,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.5);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+0.55);
  }else if(type==='loot'){
    [880,1174].forEach((fr,i)=>{const o=AC.createOscillator(),g=AC.createGain();
      o.type='triangle';o.frequency.value=fr;
      g.gain.setValueAtTime(0.001,t+i*0.07);g.gain.exponentialRampToValueAtTime(0.06,t+i*0.07+0.02);
      g.gain.exponentialRampToValueAtTime(0.001,t+i*0.07+0.5);
      o.connect(g);g.connect(master);o.start(t+i*0.07);o.stop(t+i*0.07+0.6);});
  }else if(type==='legdrop'){
    [[96,58,1.2,0.28],[144,88,1.1,0.12]].forEach(([f0,f1,du,gg])=>{
      const o=AC.createOscillator(),g=AC.createGain();o.type='sine';
      o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+du);
      g.gain.setValueAtTime(gg,t);g.gain.exponentialRampToValueAtTime(0.001,t+du);
      o.connect(g);g.connect(master);o.start(t);o.stop(t+du+0.05);});
    [1568,1976,2637].forEach((fr,i)=>{
      const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=fr;
      g.gain.setValueAtTime(0.001,t+0.1+i*0.09);
      g.gain.exponentialRampToValueAtTime(0.045,t+0.13+i*0.09);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.9+i*0.09);
      o.connect(g);g.connect(master);o.start(t+0.1+i*0.09);o.stop(t+1.1+i*0.09);});
  }
}
el('mute').onclick=()=>{G.muted=!G.muted;el('mute').textContent=G.muted?'♪̸':'♪';if(master)master.gain.value=G.muted?0:0.5;};

