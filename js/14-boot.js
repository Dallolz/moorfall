'use strict';
/* ---------- construction du monde ---------- */
function initMonde(){
  buildSol();
  solRay=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.MeshBasicMaterial({visible:false}));
  solRay.rotation.x=-Math.PI/2;scene.add(solRay);
  for(let i=0;i<18;i++){
    const a=i/18*Math.PI*2+rand(-0.1,0.1),r=rand(375,450);
    const m=new THREE.Mesh(new THREE.ConeGeometry(rand(40,75),rand(45,100),5),
      new THREE.MeshBasicMaterial({color:0x0d100c}));
    m.position.set(Math.cos(a)*r,0,Math.sin(a)*r);scene.add(m);}
  hutte(-6,184,0.4);hutte(6,185,-0.5);hutte(0,172,3.1);
  torche(-2.5,181);torche(3,180.5);torche(-1,175.5);torche(5,174);
  for(let i=0;i<9;i++){const a=i/9*6.28;pilier(RUINES.x+Math.cos(a)*8,RUINES.z+Math.sin(a)*8,rand(1.5,5));}
  const dalle=new THREE.Mesh(new THREE.CylinderGeometry(9,9,0.3,24),mat(0x2c2f29));
  dalle.position.set(RUINES.x,0.15,RUINES.z);dalle.receiveShadow=true;scene.add(dalle);
  torche(RUINES.x-3,RUINES.z);torche(RUINES.x+3,RUINES.z);
  for(let i=0;i<105;i++){const a=rand(0,6.28),d=rand(21,132);
    const x=Math.cos(a)*d,z=180+Math.sin(a)*d*0.8;
    if(dist2D({x,z},RUINES)<18||dist2D({x,z},MORFAILLE)<18)continue;arbreMort(x,z);}
  for(let i=0;i<20;i++)mare(225+rand(-90,90),90+rand(-75,75),rand(2.5,6));
  for(let i=0;i<40;i++){const x=225+rand(-105,105),z=90+rand(-90,90);
    if(dist2D({x,z},{x:158,z:68})<12)continue;arbreMort(x,z,rand(3,5));}
  for(let i=0;i<82;i++){const x=-240+rand(-105,105),z=-60+rand(-90,90);
    if(dist2D({x,z},{x:-172,z:-38})<12)continue;
    if(Math.random()<0.22)pendu(x,z);else arbreMort(x,z,rand(5,9));}
  for(let i=0;i<45;i++)rocher(90+rand(-105,105),-255+rand(-90,82),rand(0.6,2.2));
  for(let i=0;i<30;i++)tasOs(90+rand(-97,97),-255+rand(-82,75));
  for(let i=0;i<12;i++)pilier(90+rand(-75,75),-255+rand(-67,67),rand(4,9),rand(0.7,1.1));
  for(let i=0;i<40;i++)rocher(rand(-365,365),rand(-365,365)*0.4-180,rand(0.5,1.4));
  for(let i=0;i<20;i++){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(rand(14,36),rand(9,18)),
      new THREE.MeshBasicMaterial({color:0x39413a,transparent:true,opacity:0.05,depthWrite:false}));
    m.rotation.x=-Math.PI/2;m.position.set(rand(-330,330),rand(0.3,1.2),rand(-330,330));
    m.userData.v=rand(0.15,0.5);scene.add(m);brumes.push(m);}
  construireCapitale();
  npc('maud','Maud la Veilleuse','Gardienne des quêtes — elle ne cligne pas des yeux',-2,182,0x9a8a70,0x4a3d2a);
  npc('osric','Osric','Colporteur — il compte vos pièces des yeux',4,182.5,0x8f7d64,0x2e3a30);
  npc('ivane','Sénéchale Ivane','La voix de Valcierge — froide comme ses murs',0,-37,0x9a8a72,0x3a2c3a);
  npc('grivel','Grivel','Marchand de la capitale — tout a un prix, il les connaît tous',-8,-24,0x8f7d64,0x2c3a34);
  npc('berthe','Berthe','Maîtresse des montures de Valcierge',12,-36,0x93826a,0x40342a);
  npc('maitre',"Maître d'armes Aldren","Il n'enseigne qu'aux éprouvés (niveau 50)",8,-22,0x8a7a66,0x33302c);
  npc('sarment','Le Vieux Sarment','Ermite — il enterre ce que les autres vendent',-45,225,0x8a8068,0x2c3226);
  npc('noyee','La Noyée','Elle est remontée. Pas eux.',255,42,0x8a9488,0x2a3834);
  npc('cordier','Le Cordier','Chaque corde de cette forêt est passée par ses mains',-210,-87,0x8f8270,0x33302a);
  npc('muet','Le Frère Muet','Il ne dira rien. Sur les Crêtes, c\'est une sagesse.',120,-222,0x9a9280,0x38362e);
  npc('ferraille',"Ferraille l'Ossier","Forgeron d'os — il retrempe ce que la lande abandonne",-14,-40,0x8a7a62,0x3c342a);
  torche(-45,227,1.4);torche(255,44,1.4);torche(-210,-85,1.4);torche(120,-220,1.4);
  npc('lom','Padre Lom','Prêtre du camp de la Fange — sa croix penche',158,68,0x8a7a62,0x3a3226);
  npc('ashka','Veuve Ashka','Elle vit là où les arbres portent',-172,-38,0x9a8a78,0x2a2a32);
  npc('ossian','Frère Ossian','Il prie au pied des grands os',52,-195,0x9a927c,0x38342a);
  torche(158,70,1.6);torche(-172,-36,1.6);torche(52,-193,1.6);
  const g1=humanoide({peau:0x8a7a62,habit:0x3a3e46,arme:'marteau'});g1.position.set(-2.5,0,-5.5);scene.add(g1);
  const g2=humanoide({peau:0x8a7a62,habit:0x3a3e46,arme:'marteau'});g2.position.set(2.5,0,-5.5);g2.rotation.y=Math.PI;scene.add(g2);
  for(let i=0;i<8;i++)citoyen(rand(-12,12),-30+rand(-8,14));
  buildReliefs();
  buildSecret();
  buildNature();
  buildDecorGLB();
  buildMurailles();
  buildNodes();
  spawnCritters();
  for(let t=1;t<=3;t++)montureMeshes[t]=meshMonture(t);
  SPAWN_DATA.forEach(sd=>{const sp={...sd,alive:0,respawnT:0};spawners.push(sp);
    for(let i=0;i<sp.n;i++){spawnEnemy(sp.type,sp.lvl,sp.x+rand(-sp.r,sp.r),sp.z+rand(-sp.r,sp.r),sp);sp.alive++;}});
}

/* ---------- sauvegarde ---------- */
async function save(){
  try{
    if(!G.charId)G.charId=newCharId();
    const data={id:G.charId,name:G.name,classe:G.classe,lvl:G.lvl,xp:G.xp,gold:G.gold,potions:G.potions,
      mounts:G.mounts,quests:G.quests,kills:G.kills,playTime:Math.round(G.playTime),
      visited:G.visited,camMode:G.camMode,spec:G.spec,slots:G.slots,inv:G.inv,equip:G.equip,tpl:G.tpl,talents:G.talents,subclass:G.subclass,secret:G.secret,mats:G.mats,showHp:G.showHp,wstyle:G.wstyle,
      pos:{x:Math.round(player.pos.x),z:Math.round(player.pos.z)},hp:Math.round(player.hp)};
    if(MP.on){
      mpSend({t:'save',blob:data});
      el('save-ind').textContent='— consigné au serveur —';
      setTimeout(()=>el('save-ind').textContent='',1800);
      return;
    }
    await store.set(charKey(G.charId),JSON.stringify(data));
    const list=await loadList();
    const meta={id:G.charId,name:G.name,classe:G.classe,lvl:G.lvl,maj:Date.now()};
    const i=list.findIndex(p=>p.id===G.charId);
    if(i>=0)list[i]=meta;else list.push(meta);
    await store.set(LIST_KEY,JSON.stringify(list));
    el('save-ind').textContent='— veillée consignée —';
    setTimeout(()=>el('save-ind').textContent='',1800);
  }catch(e){}
}
async function loadList(){
  try{const l=JSON.parse((await store.get(LIST_KEY)).value);return Array.isArray(l)?l:[];}catch(e){return[];}
}
async function loadChar(id){
  try{return JSON.parse((await store.get(charKey(id))).value);}catch(e){return null;}
}
async function supprimerPerso(id){
  try{await store.delete(charKey(id));}catch(e){}
  try{const l=(await loadList()).filter(p=>p.id!==id);await store.set(LIST_KEY,JSON.stringify(l));}catch(e){}
}
async function migrerAncienneSauvegarde(){
  try{
    const d=JSON.parse((await store.get(SAVE_KEY)).value);
    if(d&&d.name){
      d.id=newCharId();
      await store.set(charKey(d.id),JSON.stringify(d));
      const list=await loadList();
      list.push({id:d.id,name:d.name,classe:d.classe||'ecorcheur',lvl:d.lvl||1,maj:Date.now()});
      await store.set(LIST_KEY,JSON.stringify(list));}
    await store.delete(SAVE_KEY);
  }catch(e){}
}
function construireJoueur(){
  if(player.mesh)scene.remove(player.mesh);
  const c=CL();
  player.mesh=humanoide({peau:c.peau,habit:c.habit,yeux:0x1a1a14});
  classKit(player.mesh,G.classe);
  attachRig(player.mesh,'c:'+G.classe);
  scene.add(player.mesh);
  if(!capeLight){capeLight=new THREE.PointLight(0x8a7448,0.35,7);scene.add(capeLight);}
}
function demarrer(data){
  if(data){
    G.charId=data.id||newCharId();
    G.name=data.name;G.classe=data.classe||'ecorcheur';G.lvl=data.lvl;G.xp=data.xp;
    G.gold=data.gold;G.potions=data.potions;
    G.mounts=data.mounts||G.mounts;G.quests=data.quests||{};G.kills=data.kills||0;
    G.playTime=data.playTime||0;G.visited=data.visited||G.visited;G.camMode=data.camMode||'arpg';
    G.spec=data.spec||null;G.inv=data.inv||[];G.equip=data.equip||G.equip;G.tpl=data.tpl||G.tpl;
    G.talents=data.talents||{};G.subclass=data.subclass||null;
    G.secret=data.secret||G.secret;
    G.mats=data.mats||G.mats;
    G.wstyle=data.wstyle||'w1';
    G.dashCharge=dashDef().n;
    if(data.showHp!==undefined)G.showHp=data.showHp;
    while(G.slots.length<6)G.slots.push(null);
    G.slots=(data.slots&&data.slots.some(x=>x))?data.slots:null;
    let mx=0;[...G.inv,...Object.values(G.equip)].forEach(it=>{
      if(it&&it.id){const n=parseInt(it.id.slice(2));if(n>mx)mx=n;}});
    itemSeq=mx+1;
    if(!G.slots){G.slots=[null,null,null,null];defaultSlots();}
    if(data.pos)player.pos.set(data.pos.x,0,data.pos.z);
    construireJoueur();recomputeEQ();majApparence();
    player.hp=data.hp||maxHp();
  }else{
    construireJoueur();defaultSlots();recomputeEQ();majApparence();
    player.hp=maxHp();
  }
  G.started=true;
  el('titre').style.display='none';
  majSkillBar();majHud();majTracker();syncQuestItems();
  audioInit();
  toast(data?'Bon retour, '+G.name:'La Lande de Cendrefiel',
    data?'La veillée reprend. ZQSD/WASD pour marcher.':'ZQSD/WASD pour marcher · cliquez les ennemis pour les frapper · Maud porte un marqueur doré');
}
/* ---------- multijoueur ---------- */
// Servi par le serveur Node (local ou Fly.io) : la même origine est utilisée.
// Sur GitHub Pages ou en file:// : on vise le serveur de production ci-dessous.
const MP_SERVER_OVERRIDE='wss://moorfall.fly.dev/ws';
function mpUrl(){
  if(location.protocol.startsWith('http')&&!location.host.endsWith('github.io'))
    return (location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws';
  return MP_SERVER_OVERRIDE||null;
}
const MP={on:false,ws:null,myId:null,chars:[],remotes:new Map(),sendT:0,pseudo:'',
  mobs:new Map(),owned:new Set(),shared:false,tp:0,party:[]};
let mpAwait=null;
function mpSend(m){if(MP.ws&&MP.ws.readyState===1)MP.ws.send(JSON.stringify(m));}
function mpExpect(types){return new Promise((res,rej)=>{mpAwait={types,res,rej};});}
function mpConnect(){
  return new Promise((res,rej)=>{
    const url=mpUrl();
    if(!url)return rej(new Error('serveur non configuré pour cet hébergement'));
    const ws=new WebSocket(url);
    // 15 s : laisse au serveur mutualisé le temps d'un démarrage à froid
    const to=setTimeout(()=>{try{ws.close();}catch(e){}rej(new Error('serveur injoignable'));},15000);
    ws.onopen=()=>{clearTimeout(to);MP.ws=ws;res(ws);};
    ws.onerror=()=>{clearTimeout(to);rej(new Error('serveur injoignable'));};
    ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(err){return;}mpHandle(m);};
    ws.onclose=()=>{
      MP.ws=null;
      if(MP.on){MP.on=false;mpClearRemotes();
        MP.mobs.forEach(e=>{e.owned=true;});
        if(G.started)toast('Connexion perdue','La partie continue hors-ligne, sans sauvegarde. Recharge la page pour te reconnecter.');}
    };
  });
}
function mpHandle(m){
  if(mpAwait&&(mpAwait.types.includes(m.t)||m.t==='err')){
    const w=mpAwait;mpAwait=null;
    if(m.t==='err')w.rej(new Error(m.msg||m.code));else w.res(m);
    return;
  }
  if(m.t==='join')mpSpawnRemote(m.p);
  else if(m.t==='leave')mpRemoveRemote(m.id);
  else if(m.t==='snap')m.ps.forEach(p=>{
    const r=MP.remotes.get(p.id);
    if(r){r.tgt.x=p.x;r.tgt.z=p.z;r.tgt.f=p.f;r.hp=p.hp;r.anim=p.anim;
      if(p.mhp)r.mhp=p.mhp;
      if(p.atk&&p.atk!==r.lastAtk){r.lastAtk=p.atk;r.atkObj={anim:p.atk,type:'slash',t:0.2,dur:0.5,left:0.5};}
      if(!p.atk)r.lastAtk='';}
    else mpSpawnRemote({...p,name:'?'});});
  else if(m.t==='eworld'){mpMobsReset();MP.shared=true;mpSetOwned(m.owned||[]);(m.ents||[]).forEach(mpMobSpawn);}
  else if(m.t==='eown')mpSetOwned(m.owned||[]);
  else if(m.t==='esnap')(m.ents||[]).forEach(u=>{
    const e=MP.mobs.get(u.id);
    if(!e)mpMobSpawn(u);
    else if(!e.owned&&e.state!=='dead'){
      /* coup porté par un autre joueur : baisse de PV vue dans le flux →
         éclat visuel local (sauf si c'est notre propre coup optimiste) */
      if(u.hp<e.hp-0.5&&e.mesh.visible&&performance.now()-(e._optT||0)>400){
        e.hitFlash=0.1;e.punch=Math.max(e.punch||0,0.1);
        sang(e.pos.x,e.pos.z,0.8);
        spawnPart(e.pos.x,1.2,e.pos.z,8,{col:0x6e1812,spd:3,life:0.45});}
      e.net.x=u.x;e.net.z=u.z;e.net.f=u.f;e.net.st=u.st;
      e.hp=u.hp;e.maxHp=u.mhp||e.maxHp;}});
  else if(m.t==='fx')mpFx(m);
  else if(m.t==='ehitf')mpApplyRemoteHit(m);
  else if(m.t==='ehitp'){if(G.started&&!player.dead)hurtPlayer(m.dmg,V3(m.fx,0,m.fz),m.force||200);}
  else if(m.t==='edie')mpRemoteDeath(m);
  else if(m.t==='pinvited'){
    toast('Invitation de groupe',m.from+' t\'invite — tape /accept dans le chat');
    mpChatLine('⚔',m.from+' t\'invite dans son groupe. Tape /accept pour rejoindre.',1);
  }
  else if(m.t==='pupdate'){MP.party=m.members||[];majGroupe();mpRetagRemotes();
    if(MP.party.length<2)mpChatLine('⚔','Groupe dissous.',1);}
  else if(m.t==='chat')mpChatMsg(m);
  else if(m.t==='err')toast('Serveur',m.msg||m.code);
}
/* --- écho des effets visuels des autres clients --- */
function mpFx(m){
  if(!G.started)return;
  if(m.eid){ // tir/télégraphe d'un mob simulé par son owner
    const e=MP.mobs.get(m.eid);if(!e||e.state==='dead'||!e.mesh.visible)return;
    if(m.k==='econe'){fxSector(e.pos,m.f||0,7,0.7,0x8e2a1c);return;}
    const n=m.n||1;
    for(let si=0;si<n;si++){
      const aa=m.k==='estorm'?si/n*6.283:(m.f||0)+(si-(n-1)/2)*0.2;
      tirer({from:e.pos,dir:V3(Math.sin(aa),0,Math.cos(aa)),dmg:0,force:0,ally:false,ghost:true,
        col:m.k==='estorm'?0xd8d2be:(m.s?0x8a94c8:0x8a5c4a),speed:16});}
    return;}
  const r=MP.remotes.get(m.id);if(!r)return;
  const pos=V3(r.cur.x,0,r.cur.z);
  if(dist2D(pos,player.pos)>75)return; // hors de vue, on économise
  pos.y=terrainH(pos.x,pos.z);
  const cfx=CLASSFX[r.classe]||CLASSFX.ecorcheur;
  const facing=m.f!==undefined?m.f:r.cur.f;
  if(m.k==='dash'){fxImplode(pos.x,pos.z,1.6,cfx.light);
    spawnPart(pos.x,1,pos.z,12,{col:cfx.light,spd:2,life:0.4});return;}
  if(m.k==='shot'){const c=CLASSES[r.classe]||{};
    tirer({from:pos,dir:V3(Math.sin(facing),0,Math.cos(facing)),dmg:0,force:0,ally:true,ghost:true,
      col:c.projCol||0xd8c26a,speed:28});return;}
  if(m.k==='cast'&&m.i){const sp=spellById(m.i);if(sp)fxRemoteCast(sp,pos,facing,cfx,r.classe);}
}
/* --- groupes --- */
function mpChatCommand(v){
  if(v.startsWith('/invite ')){mpSend({t:'pinvite',name:v.slice(8).trim()});return;}
  if(v==='/accept'){mpSend({t:'paccept'});return;}
  if(v==='/leave'){mpSend({t:'pleave'});return;}
  if(v.startsWith('/p ')){mpSend({t:'chat',msg:v.slice(3).slice(0,200),ch:'p'});return;}
  const monde=v.match(/^\/(monde|m) (.+)/);
  if(monde){mpSend({t:'chat',msg:monde[2].slice(0,200),ch:'world'});return;}
  const murmure=v.match(/^\/t (\S+) (.+)/);
  if(murmure){mpSend({t:'chat',msg:murmure[2].slice(0,200),ch:'w',to:murmure[1]});return;}
  if(v.startsWith('/r ')){
    if(!MP.lastFrom){mpChatLine('⚔','Personne ne t\'a murmuré.',1);return;}
    mpSend({t:'chat',msg:v.slice(3).slice(0,200),ch:'w',to:MP.lastFrom});return;}
  if(v==='/afk'||v.startsWith('/afk ')){mpSend({t:'afk',msg:v.slice(5)});return;}
  if(v.startsWith('/')){mpChatLine('⚔','Commandes : /invite <pseudo> · /accept · /leave · /p <msg> · /monde <msg> · /t <pseudo> <msg> · /r <msg> · /afk',1);return;}
  mpSend({t:'chat',msg:v.slice(0,200)});
}
/* canaux : say (proximité, bulle), world, w (murmure), p (groupe) */
function mpChatMsg(m){
  const ch=m.ch||(m.p?'p':'say');
  if(ch==='w'){
    if(m.self)mpChatLine('À '+m.to,m.msg,0,'#c98ad8');
    else{MP.lastFrom=m.from;mpChatLine('De '+m.from,m.msg,0,'#c98ad8');}
  }else if(ch==='world')mpChatLine('[Monde] '+m.from,m.msg,0,'#8fb8d8');
  else if(ch==='p')mpChatLine(m.from,m.msg,1);
  else{mpChatLine(m.from,m.msg);if(m.id)mpBulle(m.id,m.msg);}
}
function mpBulle(id,msg){
  const mesh=id===G.charId?player.mesh:(MP.remotes.get(id)||{}).mesh;
  if(!mesh)return;
  if(mesh.userData.bulle){mesh.remove(mesh.userData.bulle);clearTimeout(mesh.userData.bulleT);}
  const cv=document.createElement('canvas');cv.width=512;cv.height=96;
  const g=cv.getContext('2d');g.font='500 24px Georgia,serif';g.textAlign='center';
  const txt=msg.length>44?msg.slice(0,43)+'…':msg;
  const w=Math.min(492,g.measureText(txt).width+30);
  g.fillStyle='rgba(20,18,12,0.82)';g.fillRect(256-w/2,20,w,44);
  g.strokeStyle='#5d5949';g.strokeRect(256-w/2,20,w,44);
  g.fillStyle='#e8dfc8';g.fillText(txt,256,49);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:false}));
  s.scale.set(6,1.125,1);s.position.y=3.4;s.renderOrder=9;
  mesh.add(s);mesh.userData.bulle=s;
  mesh.userData.bulleT=setTimeout(()=>{mesh.remove(s);mesh.userData.bulle=null;},5000);
}
function majGroupe(){
  let box=el('mp-party');
  if(!MP.party||MP.party.length<2){if(box)box.remove();return;}
  if(!box){box=document.createElement('div');box.id='mp-party';
    box.style.cssText='position:fixed;left:12px;top:132px;z-index:55;display:flex;flex-direction:column;gap:5px;font-size:12px;color:#e8dfc8;text-shadow:0 1px 2px #000';
    document.body.appendChild(box);}
  box.innerHTML='';
  MP.party.forEach(mb=>{
    const row=document.createElement('div');
    row.style.cssText='background:rgba(12,11,7,0.65);border:1px solid #3a3226;border-left:2px solid #c8a84a;padding:4px 8px;min-width:132px';
    const nm=document.createElement('div');
    nm.textContent=mb.name+(mb.id===G.charId?' (toi)':'');
    const lv=document.createElement('span');lv.style.color='#8a8570';lv.textContent=' niv '+mb.lvl;
    nm.appendChild(lv);
    const barBg=document.createElement('div');
    barBg.style.cssText='height:4px;background:#241d12;margin-top:3px';
    const bar=document.createElement('div');
    bar.dataset.pid=mb.id;
    bar.style.cssText='height:100%;width:100%;background:#5a7a3f';
    barBg.appendChild(bar);
    row.append(nm,barBg);box.appendChild(row);
  });
}
function majGroupeHp(){
  const box=el('mp-party');if(!box)return;
  box.querySelectorAll('[data-pid]').forEach(bar=>{
    const pid=bar.dataset.pid;let pct=1;
    if(pid===G.charId)pct=player.hp/maxHp();
    else{const r=MP.remotes.get(pid);if(r&&r.mhp)pct=r.hp/r.mhp;}
    pct=Math.max(0,Math.min(1,pct));
    bar.style.width=(pct*100)+'%';
    bar.style.background=pct>0.5?'#5a7a3f':(pct>0.25?'#c8a84a':'#b05a4a');
  });
}
function mpRetagRemotes(){
  const ids=new Set((MP.party||[]).map(m=>m.id));
  MP.remotes.forEach(r=>{
    const gold=ids.has(r.id);
    if(r.gold===gold)return;
    r.gold=gold;
    if(r.tag)r.mesh.remove(r.tag);
    r.tag=mpNameTag(r.name||'?',gold?'#e8c05a':'#e8dfc8');
    r.mesh.add(r.tag);
  });
}
/* --- mobs partagés : le serveur assigne un « owner » par pack qui simule
   l'IA localement et streame ; les autres clients rendent + relaient leurs
   coups via le serveur --- */
function mpMobsReset(){
  [...enemies].forEach(e=>{scene.remove(e.mesh);if(e.bar){e.bar.el.remove();e.bar=null;}});
  enemies.length=0;spawners.length=0;
  MP.mobs.clear();MP.owned.clear();
  player.targetEnemy=null;
}
function mpMobSpawn(u){
  if(!u||!u.id||MP.mobs.has(u.id)||!ENEMY_DEF[u.type])return;
  const e=spawnEnemy(u.type,u.lvl,u.x,u.z,null);
  e.sid=u.id;e.owned=MP.owned.has(u.id);
  e.hp=u.hp;if(u.mhp)e.maxHp=u.mhp;
  e.home={x:u.hx!==undefined?u.hx:u.x,z:u.hz!==undefined?u.hz:u.z};
  e.net={x:u.x,z:u.z,f:u.f||0,st:u.st||'idle'};
  MP.mobs.set(u.id,e);
}
function mpSetOwned(list){
  MP.owned=new Set(list);
  MP.mobs.forEach((e,id)=>{
    const was=e.owned;e.owned=MP.owned.has(id);
    if(e.owned&&!was&&e.state!=='dead'){
      e.pos.x=e.net.x;e.pos.z=e.net.z;e.vel.set(0,0,0);
      if(e.state!=='idle'&&e.state!=='chase')e.state='idle';
    }
  });
}
function mpMobNetTick(e,dt){
  const k=Math.min(1,dt*10);
  const dx=e.net.x-e.pos.x,dz=e.net.z-e.pos.z;
  e.pos.x+=dx*k;e.pos.z+=dz*k;
  e.pos.y=terrainH(e.pos.x,e.pos.z);
  let df=e.net.f-e.mesh.rotation.y;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;
  e.mesh.rotation.y+=df*k;
  e.state=e.net.st;
  e.mesh.position.copy(e.pos);
  if(e.hitFlash>0){e.hitFlash-=dt;rigFlash(e.mesh,e.hitFlash>0);}else rigFlash(e.mesh,false);
  if(e.tele)e.tele.material.opacity=(e.state==='windup'||e.state==='slam')?0.28:0;
  const pt=e.mesh.userData.parts;
  if(e.state==='windup'||e.state==='slam')pt.torse.rotation.x=-0.4;
  else pt.torse.rotation.x*=0.9;
  e.punch=Math.max(0,(e.punch||0)-dt*4);
  e.mesh.scale.setScalar(1+(e.punch||0)*1.6);
  majBar(e,dist2D(e.pos,player.pos));
  animeHumanoide(e.mesh,phase+e.home.x,Math.min(Math.hypot(dx,dz)*10,6),null);
}
function mpNearestRemote(e,maxD){
  let best=null,bd=maxD;
  MP.remotes.forEach(r=>{
    if(enSecurite({x:r.cur.x,z:r.cur.z}))return; // sanctuaire : intouchable
    const d=Math.hypot(e.pos.x-r.cur.x,e.pos.z-r.cur.z);
    if(d<bd){bd=d;best=r;}
  });
  return best?{r:best,d:bd}:null;
}
function mpApplyRemoteHit(m){
  const e=MP.mobs.get(m.id);
  if(!e||e.state==='dead'||e.state==='retour'||!e.owned)return;
  const dir=V3(m.fx,0,m.fz);
  e.hp-=m.dmg;e.hitFlash=0.12;
  dmgNum(e.pos,m.dmg,'');
  sang(e.pos.x,e.pos.z);
  impulse(e,dir,m.force||0,m.up);
  if(m.slow)e.slowT=Math.max(e.slowT,m.slow);
  if(m.dot)applyDot(e,Math.max(2,Math.round(m.dmg*0.15)),4);
  if(e.hp<=0)tueEnemy(e,dir,m.force||150);
}
function mpRemoteDeath(m){
  const e=MP.mobs.get(m.id);
  MP.mobs.delete(m.id);
  if(e&&e.state!=='dead')tueEnemy(e,V3(m.fx,0,m.fz),m.force||200,true);
  if(e&&(m.parts||[]).includes(G.charId))recompensesKill(e);
}
function mpNameTag(name,color){
  const cv=document.createElement('canvas');cv.width=256;cv.height=64;
  const g=cv.getContext('2d');g.font='600 26px Georgia,serif';g.textAlign='center';
  const w=Math.min(240,g.measureText(name).width+22);
  g.fillStyle='rgba(10,9,6,0.55)';g.fillRect(128-w/2,12,w,34);
  g.fillStyle=color||'#e8dfc8';g.fillText(name,128,37);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:false}));
  s.scale.set(3,0.75,1);s.position.y=2.7;s.renderOrder=8;
  return s;
}
function mpSpawnRemote(p){
  if(!p||!p.id||p.id===MP.myId||MP.remotes.has(p.id))return;
  const c=CLASSES[p.classe]||CL();
  const mesh=humanoide({peau:c.peau,habit:c.habit,yeux:0x1a1a14});
  classKit(mesh,p.classe,p.wstyle);
  attachRig(mesh,'c:'+p.classe);
  const gold=(MP.party||[]).some(mb=>mb.id===p.id);
  const tag=mpNameTag(p.name||'?',gold?'#e8c05a':'#e8dfc8');
  mesh.add(tag);
  const x=p.x??0,z=p.z??189;
  mesh.position.set(x,terrainH(x,z),z);
  scene.add(mesh);
  MP.remotes.set(p.id,{id:p.id,name:p.name,classe:p.classe,mesh,tag,gold,
    cur:{x,z,f:p.f||0},tgt:{x,z,f:p.f||0},anim:p.anim||'idle',hp:p.hp??100,mhp:p.mhp||100,
    phase:Math.random()*6,spd:0});
}
function mpRemoveRemote(id){const r=MP.remotes.get(id);if(!r)return;scene.remove(r.mesh);MP.remotes.delete(id);}
function mpClearRemotes(){[...MP.remotes.keys()].forEach(mpRemoveRemote);}
function mpTick(dt,now,phase,spd){
  if(!MP.on)return;
  MP.remotes.forEach(r=>{
    const k=Math.min(1,dt*10);
    const dx=r.tgt.x-r.cur.x,dz=r.tgt.z-r.cur.z;
    r.cur.x+=dx*k;r.cur.z+=dz*k;
    let df=r.tgt.f-r.cur.f;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;
    r.cur.f+=df*k;
    r.spd+=(Math.min(Math.hypot(dx,dz)*10,6)-r.spd)*Math.min(1,dt*8);
    r.phase+=dt*(2+r.spd*1.35);
    r.mesh.position.set(r.cur.x,terrainH(r.cur.x,r.cur.z),r.cur.z);
    r.mesh.rotation.y=r.cur.f;
    if(r.atkObj){r.atkObj.left-=dt;if(r.atkObj.left<=0)r.atkObj=null;}
    animeHumanoide(r.mesh,r.phase,r.spd,r.atkObj,r.classe);
  });
  if(G.started&&!player.dead){
    MP.sendT+=dt;
    if(MP.sendT>0.1){MP.sendT=0;
      mpSend({t:'state',x:+player.pos.x.toFixed(2),z:+player.pos.z.toFixed(2),
        f:+player.facing.toFixed(3),hp:Math.round(player.hp),mhp:Math.round(maxHp()),
        anim:spd>0.4?'run':'idle',mnt:G.activeMount|0,
        atk:player.attack?(player.attack.anim||'slash'):'',tp:MP.tp});
      MP.tp=0;
      majGroupeHp();
      if(MP.shared){
        /* n'envoie que ce qui a bougé/changé : avec ~300 mobs possédés,
           streamer tout à 10 Hz coûterait ~180 Ko/s ; l'état serveur persiste */
        const ents=[];
        MP.mobs.forEach(e=>{if(!e.owned||e.state==='dead')return;
          const x=+e.pos.x.toFixed(1),z=+e.pos.z.toFixed(1),
            f=+e.mesh.rotation.y.toFixed(2),st=e.state,hp=Math.round(e.hp);
          const l=e._mpLast||(e._mpLast={});
          if(x===l.x&&z===l.z&&f===l.f&&st===l.st&&hp===l.hp)return;
          l.x=x;l.z=z;l.f=f;l.st=st;l.hp=hp;
          ents.push({id:e.sid,x,z,f,st,hp});});
        if(ents.length)mpSend({t:'epack',ents});
      }}
  }
}
async function mpEnter(id){
  mpSend({t:'enter',charId:id});
  const ok=await mpExpect(['enterok']);
  MP.myId=ok.id;
  (ok.players||[]).forEach(mpSpawnRemote);
  const b=ok.blob||{};
  if(b.name){
    demarrer(b);
  }else{
    const meta=MP.chars.find(c=>c.id===id)||{};
    G.charId=id;G.name=meta.name||'Sans-nom';
    G.classe=b.classe||meta.classe||'ecorcheur';G.wstyle=b.wstyle||'w1';
    G.dashCharge=dashDef().n;
    demarrer(null);
  }
  G.charId=ok.id;
  save();
}
async function mpLogin(register){
  const name=el('mp-pseudo').value.trim(),pass=el('mp-pass').value;
  const st=el('mp-status');
  if(!name||!pass){st.textContent='⚠ Pseudo et mot de passe requis.';return;}
  st.textContent='Connexion…';
  try{
    if(!MP.ws)await mpConnect();
    mpSend({t:register?'register':'auth',name,pass});
    const ok=await mpExpect(['authok']);
    MP.on=true;MP.pseudo=name;MP.chars=ok.chars||[];
    st.textContent='⚔ Connecté en tant que '+name+' — tes personnages vivent sur le serveur.';
    el('mp-form').style.display='none';
    mpChatInit();
    await construireListePersos();
    titreEtape('perso');
  }catch(e){st.textContent='⚠ '+e.message;}
}
/* écran titre en deux étapes : compte d'abord, puis persos/création */
function titreEtape(etape){
  const perso=etape==='perso';
  ['titre-nom','preview-cv','classes','wstyles','persos'].forEach(id=>{
    const e=el(id);if(e)e.style.display=perso?'':'none';});
  el('btn-nouveau').parentElement.style.display=perso?'':'none';
}
function construireConnexion(){
  const box=document.createElement('div');box.id='mp-box';
  box.style.cssText='margin:10px 0;padding:9px 10px;border:1px solid #3a3226;background:#141209';
  const st=document.createElement('div');st.id='mp-status';
  st.style.cssText='font-size:12px;color:var(--os-dim);margin-bottom:6px';
  box.appendChild(st);
  if(mpUrl()){
    st.textContent='Jouer en ligne — un compte garde tes personnages sur le serveur.';
    const f=document.createElement('div');f.id='mp-form';
    f.style.cssText='display:flex;gap:6px;flex-wrap:wrap;align-items:center';
    const ps=document.createElement('input');ps.id='mp-pseudo';ps.maxLength=16;ps.placeholder='Pseudo';ps.style.width='110px';
    const pw=document.createElement('input');pw.id='mp-pass';pw.type='password';pw.maxLength=64;pw.placeholder='Mot de passe';pw.style.width='120px';
    const b1=document.createElement('button');b1.className='btn mini';b1.textContent='Connexion';b1.onclick=()=>mpLogin(false);
    const b2=document.createElement('button');b2.className='btn mini ghost';b2.textContent='Créer un compte';b2.onclick=()=>mpLogin(true);
    const b3=document.createElement('button');b3.className='btn mini ghost';b3.textContent='Jouer hors ligne';
    b3.onclick=()=>{el('mp-form').style.display='none';
      st.textContent='Partie locale — la progression reste dans ce navigateur.';
      titreEtape('perso');};
    pw.addEventListener('keydown',e=>{if(e.key==='Enter')mpLogin(false);});
    f.append(ps,pw,b1,b2,b3);box.appendChild(f);
  }else{
    st.textContent='Mode en ligne indisponible ici (serveur non configuré) — partie locale uniquement.';
  }
  el('persos').before(box);
  titreEtape(mpUrl()?'connexion':'perso');
}
function mpChatInit(){
  if(el('mp-chat'))return;
  const box=document.createElement('div');box.id='mp-chat';
  box.style.cssText='position:fixed;left:12px;bottom:96px;width:320px;max-height:170px;overflow:hidden;font-size:12.5px;color:#e8dfc8;text-shadow:0 1px 2px #000;pointer-events:none;z-index:60';
  document.body.appendChild(box);
  const inp=document.createElement('input');inp.id='mp-chat-in';inp.maxLength=200;
  inp.placeholder='Entrée : parler (proximité) · /monde à tous · /t <pseudo> · Échap pour fermer';
  inp.style.cssText='position:fixed;left:12px;bottom:66px;width:320px;display:none;z-index:61;background:rgba(20,18,12,0.92);border:1px solid #5d5949;color:#e8dfc8;padding:6px 8px;font-size:13px';
  inp.addEventListener('keydown',e=>{
    e.stopPropagation();
    if(e.key==='Enter'){const v=inp.value.trim();if(v)mpChatCommand(v);inp.value='';inp.style.display='none';inp.blur();}
    if(e.key==='Escape'){inp.value='';inp.style.display='none';inp.blur();}
  });
  document.body.appendChild(inp);
}
function mpChatLine(from,msg,party,color){
  const box=el('mp-chat');if(!box)return;
  const d=document.createElement('div');
  d.textContent=(party?'[Groupe] ':'')+from+' : '+msg;
  if(party)d.style.color='#e8c05a';
  else if(color)d.style.color=color;
  box.appendChild(d);
  while(box.children.length>12)box.firstChild.remove();
}
function mpChatOpen(){const i=el('mp-chat-in');if(!i)return;i.style.display='block';i.focus();}
/* ---------- écran titre ---------- */
let selClasse='ecorcheur',selStyle='w1';
function construireTitre(){
  const wrap=el('classes');
  Object.entries(CLASSES).forEach(([id,c])=>{
    const d=document.createElement('div');
    d.className='classe-carte'+(id===selClasse?' sel':'');
    d.innerHTML=`<div class="ic">${c.ic}</div><div class="cn">${c.nom}</div>
      <div class="cd2">${c.desc}</div><div class="cp">${c.phys}</div>`;
    d.onclick=()=>{selClasse=id;selStyle='w1';
      document.querySelectorAll('.classe-carte').forEach(x=>x.classList.remove('sel'));
      d.classList.add('sel');
      construireStyles();
      previewSet(id);};
    wrap.appendChild(d);});
  construireStyles();
}
function construireStyles(){
  const w=el('wstyles');if(!w)return;
  w.innerHTML='<span style="color:var(--os-dim);font-size:12px;margin-right:6px">Style d\'arme :</span>';
  (WSTYLES[selClasse]||[]).forEach(st=>{
    const b=document.createElement('button');
    b.className='btn mini'+(st.id===selStyle?'':' ghost');
    b.textContent=st.nom;b.title=st.d;
    b.onclick=()=>{selStyle=st.id;construireStyles();previewSet(selClasse);};
    w.appendChild(b);});
  const dsc=document.createElement('div');
  dsc.style.cssText='font-size:11.5px;color:var(--os-dim);margin-top:4px';
  dsc.textContent=(wsDef(selClasse,selStyle)||{}).d||'';
  w.appendChild(dsc);
}
construireTitre();
previewInit();
initMonde();
requestAnimationFrame(tick);
async function construireListePersos(){
  const wrap=el('persos');wrap.innerHTML='';
  const list=MP.on?MP.chars.slice().sort((a,b)=>(b.maj||0)-(a.maj||0))
    :(await loadList()).sort((a,b)=>(b.maj||0)-(a.maj||0));
  if(!list.length)return;
  const h=document.createElement('div');h.className='persos-titre';
  h.textContent=MP.on?'Reprendre une veillée (en ligne)':'Reprendre une veillée';wrap.appendChild(h);
  list.forEach(p=>{
    const c=CLASSES[p.classe]||{ic:'❓',nom:'Inconnu'};
    const row=document.createElement('div');row.className='perso-row';
    const ic=document.createElement('span');ic.className='pic';ic.textContent=c.ic;
    const pn=document.createElement('span');pn.className='pn';pn.textContent=p.name;
    const pd=document.createElement('span');pd.className='pd';pd.textContent=c.nom+' · niv. '+p.lvl;
    const bt=document.createElement('button');bt.className='btn mini';bt.textContent='Reprendre';
    bt.onclick=async()=>{
      if(MP.on){try{await mpEnter(p.id);}catch(e){toast('Serveur',e.message);}return;}
      const d=await loadChar(p.id);if(d)demarrer(d);};
    const del=document.createElement('button');del.className='btn mini ghost';del.textContent='✕';
    del.title='Effacer ce personnage';
    del.onclick=async()=>{
      if(!del.dataset.arm){del.dataset.arm='1';del.textContent='Sûr ?';
        setTimeout(()=>{del.dataset.arm='';del.textContent='✕';},2500);return;}
      if(MP.on){
        try{mpSend({t:'delete',charId:p.id});
          const ok=await mpExpect(['authok']);MP.chars=ok.chars||[];}
        catch(e){toast('Serveur',e.message);}
        construireListePersos();return;
      }
      await supprimerPerso(p.id);construireListePersos();
    };
    row.append(ic,pn,pd,bt,del);wrap.appendChild(row);
  });
}
(async()=>{
  const ver=document.createElement('div');
  ver.style.cssText='position:absolute;bottom:8px;right:12px;font-size:11px;color:#5d5949';
  ver.textContent='v24 — multijoueur alpha';
  el('titre').appendChild(ver);
  if(!store.persistant){
    const w=document.createElement('div');
    w.style.cssText='color:#c8503a;font-size:12px;margin:4px 0';
    w.textContent='⚠ Stockage local indisponible : la progression ne survivra pas à la fermeture.';
    el('persos').before(w);}
  await migrerAncienneSauvegarde();
  construireConnexion();
  await construireListePersos();
  el('btn-nouveau').onclick=async()=>{
    const nom=(el('titre-nom').value.trim()||'Sans-nom').slice(0,16);
    if(MP.on){
      try{
        mpSend({t:'create',nom,classe:selClasse,wstyle:selStyle});
        const ok=await mpExpect(['created']);
        MP.chars.unshift(ok.char);
        await mpEnter(ok.char.id);
      }catch(e){toast('Serveur',e.message);}
      return;
    }
    G.charId=newCharId();
    G.name=nom;
    G.classe=selClasse;G.wstyle=selStyle;G.dashCharge=dashDef().n;
    demarrer(null);save();
  };
})();
addEventListener('beforeunload',()=>{if(G.started&&!player.dead)save();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.started&&!player.dead)save();});
window.MOOR={_dbg:()=>({G,player,enemies,npcs,questItems,previewSet,majApparence,demarrer,RIG_CLASS,prevMesh:()=>prevMesh,genItem,genRelique,recomputeEQ,majHud,projectiles,fxTemp,zonesFx,MP}),
  fermer:fermerPanneau,acheter,acheterMonture,gamble,accepterQuete,rendreQuete,respawn,
  equipSpell,equipItem,vendreItem,choisirSpec,applyTemplate,saveTpl,applyTpl,
  talUp,talReset,choisirSub,
  sideAccept,sideDecline,sideDone,forger,retremper,ack,tip,tipHide,
  tipPin:()=>{ttPin=true;},
  desequiper,statTip,bagFiltre,bagTri,bagCherche,
  ouvrirPersoBtn:()=>togglePanneau('perso',ouvrirPerso),
  ouvrirSac:()=>togglePanneau('inv',ouvrirInventaire),
  ouvrirVoies:()=>togglePanneau('spe',ouvrirSpe),
  ouvrirInv:()=>{fermerPanneau();ouvrirInventaire();}};
