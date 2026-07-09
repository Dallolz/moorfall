'use strict';
/* ---------- panneaux ---------- */
const pan=el('panneau');
let panOuvert=null;
function fermerPanneau(){pan.style.display='none';pan.innerHTML='';panOuvert=null;
  if(typeof tipHide==='function')tipHide(1);
  if(pan._carteInt){clearInterval(pan._carteInt);pan._carteInt=null;}}
function togglePanneau(nom,fn){if(panOuvert===nom){fermerPanneau();return;}fermerPanneau();panOuvert=nom;fn();}
function ouvrirQueteur(n){
  let html=`<h2>${n.nom}</h2><div class="role">${n.role}</div>`;
  const prets=questsPretes(n.id),dispo=questsDisponibles(n.id);
  if(!prets.length&&!dispo.length)html+=`<p>« Rien pour l'instant. Reviens plus aguerri — ou plus tard. »</p>`;
  prets.forEach(q=>{
    const r=q.repeat?questRewRepeat():q.rew;
    html+=`<p><b style="font-family:var(--f-display)">${q.nom}</b> — accomplie.${q.fin?'<br><i style="color:var(--os-dim)">'+q.fin+'</i>':''}</p>
    <div class="rec">Récompense : ${r.xp||0} XP, ${r.or||0} or${r.potions?', '+r.potions+' fioles':''}</div>
    <button class="btn" onclick="MOOR.rendreQuete('${q.id}')">Rendre la quête</button>`;});
  dispo.forEach(q=>{
    html+=`<p><b style="font-family:var(--f-display)">${q.nom}</b>${q.repeat?' <i style="color:var(--os-dim)">(répétable)</i>':''}<br>${q.txt}</p>
    <button class="btn" onclick="MOOR.accepterQuete('${q.id}')">Accepter</button>`;});
  html+=`<br><button class="btn ghost" onclick="MOOR.fermer()">Partir</button>`;
  pan.innerHTML=html;pan.style.display='block';panOuvert='pnj';
}
function ouvrirMarchand(n){
  let html=`<h2>${n.nom}</h2><div class="role">${n.role}</div>
  <p>« Tout se paie, voyageur. Même ici. Surtout ici. »</p>
  <div class="item-ligne"><div><div class="n">Fiole de sang épais</div><div class="d">Rend 50% de vos points de vie (touche R)</div></div>
    <div class="prix">8 or <button class="btn" onclick="MOOR.acheter('potion')">Acheter</button></div></div>
  <p style="margin-top:10px">« Un ballot d'équipement, jamais déballé. Choisis la pièce — la brume choisit le reste. »</p>
  <div class="d" style="color:var(--os-dim);font-size:11.5px;margin-bottom:6px">80% blanc · 15% vert · 4,5% bleu · 0,5% légendaire — objet de votre niveau</div>`;
  SLOTS_IT.forEach(s=>{
    html+=`<div class="item-ligne"><div><div class="n">${SLOT_NOMS[s]} sous toile</div></div>
    <div class="prix">${gambPrix()} or <button class="btn" ${G.gold>=gambPrix()?'':'disabled'} onclick="MOOR.gamble('${s}')">Déballer</button></div></div>`;});
  html+=`<p style="margin-top:10px">« Ton butin ? Ouvre ton sac (touche I), j'achète tout ce qui ne saigne plus. »</p>
  <button class="btn" onclick="MOOR.ouvrirInv()">Ouvrir le sac</button>
  <button class="btn ghost" onclick="MOOR.fermer()">Partir</button>`;
  pan.innerHTML=html;pan.style.display='block';panOuvert='pnj';
}
function gambPrix(){return Math.round(30+G.lvl*3);}
function gambleRar(){
  const r=Math.random();
  return r<0.005?4:r<0.05?2:r<0.20?1:0;
}
function gamble(slot){
  if(!SLOTS_IT.includes(slot)||G.gold<gambPrix())return;
  G.gold-=gambPrix();
  const it=genItem(G.lvl,false,{rar:gambleRar(),slot});
  if(G.inv.length>=40)spawnLoot(it,player.pos.x,player.pos.z);
  else{G.inv.push({...it,fresh:true});
    toast('Déballé : '+it.nom,RARITES[it.rar].n+(it.rar>=2?' — la brume était généreuse':''));}
  if(it.rar===4)sfx('legdrop');else sfx(it.rar>=1?'loot':'or');
  majHud();save();
  const m=npcs.find(x=>(x.id==='osric'||x.id==='grivel')&&dist2D(player.pos,x)<7);
  if(m)ouvrirMarchand(m);
}
function ouvrirEcuyer(n){
  let html=`<h2>${n.nom}</h2><div class="role">${n.role} — l'enclos derrière elle est presque vide</div>
  <p>« Les bêtes d'ici ne portent pas n'importe qui. Reviens quand la lande t'aura reconnu. »</p>`;
  [1,2,3].forEach(tier=>{
    const d=MOUNT_DEF[tier],owned=G.mounts['t'+tier],can=G.lvl>=d.lvl;
    html+=`<div class="item-ligne"><div><div class="n">${d.nom} ${owned?'✓':''}</div><div class="d">${d.desc} — requiert niveau ${d.lvl}</div></div>
    <div class="prix">${d.prix} or ${owned?'':`<button class="btn" ${can&&G.gold>=d.prix?'':'disabled'} onclick="MOOR.acheterMonture(${tier})">Dresser</button>`}</div></div>`;});
  html+=`<br><button class="btn ghost" onclick="MOOR.fermer()">Partir</button>`;
  pan.innerHTML=html;pan.style.display='block';panOuvert='pnj';
}
function interagir(n){
  if(n.id==='errant'){ouvrirErrant();return;}
  if(n.id==='ferraille'){ouvrirForge();return;}
  if(['maud','ivane','lom','ashka','ossian','maitre','sarment','noyee','cordier','muet'].includes(n.id))ouvrirQueteur(n);
  else if(n.id==='berthe')ouvrirEcuyer(n);
  else ouvrirMarchand(n);
}
function acheter(quoi){
  if(quoi==='potion'){if(G.gold<8){toast("Pas assez d'or",'');return;}G.gold-=8;G.potions++;sfx('or');}
  majHud();save();
  const m=npcs.find(x=>(x.id==='osric'||x.id==='grivel')&&dist2D(player.pos,x)<7);
  if(m)ouvrirMarchand(m);
}
function acheterMonture(tier){
  const d=MOUNT_DEF[tier];
  if(G.lvl<d.lvl||G.gold<d.prix)return;
  G.gold-=d.prix;G.mounts['t'+tier]=true;sfx('lvl');
  toast(d.nom+(tier===3?' dressée':' dressé'),"Touche F pour l'appeler");
  majHud();ouvrirEcuyer(npcs.find(x=>x.id==='berthe'));save();
}
function accepterQuete(id){G.quests[id]={state:'active',n:0};majTracker();syncQuestItems();
  const q=QUESTS.find(x=>x.id===id);
  if(q.type==='collect'&&QOBJ[q.cible])toast(QOBJ[q.cible].nom+' — '+q.nb+' à trouver','Ils luisent dans la zone. Ramassez-les — ou prenez-les sur les morts.');
  ouvrirQueteur(npcs.find(x=>x.id===q.giver));save();}
function rendreQuete(id){
  const q=QUESTS.find(x=>x.id===id);const r=q.repeat?questRewRepeat():q.rew;
  if(r.or)G.gold+=r.or;if(r.potions)G.potions+=r.potions;
  G.quests[id]={state:'done',n:0};
  if(r.xp)gainXp(r.xp);
  if(id==='s3')setTimeout(()=>toast('Épreuve accomplie','Touche T : choisissez votre sous-classe'),2600);
  sfx('or');majHud();majTracker();syncQuestItems();ouvrirQueteur(npcs.find(x=>x.id===q.giver));save();
}
/* ---------- grimoire (K) ---------- */
function ouvrirGrimoire(){
  let html=`<h2>Grimoire — ${CL().nom}</h2>
  <div class="role">Cliquez sur 1·2·3·4 pour placer un sort dans la barre. Nouveaux sorts presque à chaque niveau.</div>`;
  SPELLS[G.classe].forEach(s=>{
    const dispo=s.l<=G.lvl;
    const slotOf=G.slots.indexOf(s.i);
    html+=`<div class="sort-ligne ${dispo?'':'verrou'}">
      <div><div class="sn">${s.ic} ${s.n} ${slotOf>=0?'<span style="color:var(--laiton)">[en barre : '+(slotOf+1)+']</span>':''}</div>
      <div class="sd">${dispo?'':'Niveau '+s.l+' — '}${s.d} · recharge ${s.cd} s · <i>${s.tg.join(', ')}</i></div></div>
      <div class="slots">${dispo?[0,1,2,3,4,5].map(k=>`<button class="btn mini" onclick="MOOR.equipSpell('${s.i}',${k})">${k+1}</button>`).join(''):'🔒 '+s.l}</div>
    </div>`;});
  if(G.subclass&&SUBSPELLS[G.subclass]){
    const sc=(SUBCLASSES[G.classe]||[]).find(s=>s.id===G.subclass);
    html+=`<h3>${sc.ic} Sorts de ${sc.nom}</h3>`;
    SUBSPELLS[G.subclass].forEach(s=>{
      const dispo=s.l<=G.lvl;
      const slotOf=G.slots.indexOf(s.i);
      html+=`<div class="sort-ligne ${dispo?'':'verrou'}">
        <div><div class="sn r3">${s.ic} ${s.n} ${slotOf>=0?'<span style="color:var(--laiton)">[en barre : '+(slotOf+1)+']</span>':''}</div>
        <div class="sd">${dispo?'':'Niveau '+s.l+' — '}${s.d} · recharge ${s.cd} s</div></div>
        <div class="slots">${dispo?[0,1,2,3,4,5].map(k=>`<button class="btn mini" onclick="MOOR.equipSpell('${s.i}',${k})">${k+1}</button>`).join(''):'🔒 '+s.l}</div>
      </div>`;});
  }else if(G.lvl>=50){
    html+=`<p style="font-size:12px;color:var(--os-dim)">Une sous-classe (T) ajoutera trois sorts dédiés ici.</p>`;
  }
  html+=`<br><button class="btn ghost" onclick="MOOR.fermer()">Fermer (K)</button>`;
  pan.innerHTML=html;pan.style.display='block';panOuvert='grimoire';
}
/* ---------- spécialisation & modèles (T) ---------- */
function choisirSpec(id){
  if(G.lvl<10)return;
  if(G.spec&&G.spec!==id){
    const cout=25;
    if(G.gold<cout){toast('Respécialisation : '+cout+' or','Pas assez d\'or');return;}
    G.gold-=cout;}
  G.spec=id;sfx('lvl');
  recomputeEQ();majHud();ouvrirSpe();save();
}
function saveTpl(k){G.tpl[k]=[...G.slots];toast('Barre sauvegardée','Emplacement '+k);ouvrirSpe();save();}
function applyTpl(k){
  if(!G.tpl[k]){toast('Emplacement vide','Sauvegardez d\'abord votre barre');return;}
  G.slots=[...G.tpl[k]];majSkillBar();toast('Barre restaurée','Emplacement '+k);save();
}
/* ---------- carte (M) ---------- */
function ouvrirCarte(){
  pan.innerHTML=`<h2>Carte de Cendrefiel</h2><canvas id="carte-cv" width="640" height="640"></canvas>
  <div class="role" style="text-align:center">● vous · ★ Valcierge · ▲ camps de quêtes · ☠ boss</div>
  <div style="text-align:center"><button class="btn ghost" onclick="MOOR.fermer()">Fermer (M)</button></div>`;
  pan.style.display='block';panOuvert='carte';
  const cv=el('carte-cv'),ctx=cv.getContext('2d');
  const W=640,S=W/520,cx=w=>(w+260)*S,cz=w=>(w+260)*S;
  function draw(){
    ctx.fillStyle='#0c0e0a';ctx.fillRect(0,0,W,W);
    // zones
    ZONES.forEach(z=>{
      ctx.beginPath();ctx.arc(cx(z.x),cz(z.z),z.r*S,0,6.28);
      ctx.fillStyle=z.id==='capitale'?'rgba(138,116,72,.18)':'rgba(120,130,110,.08)';
      ctx.fill();ctx.strokeStyle='rgba(138,116,72,.3)';ctx.stroke();
      ctx.fillStyle='#cfc6ae';ctx.font='16px IM Fell English';ctx.textAlign='center';
      ctx.fillText(z.nom,cx(z.x),cz(z.z)-z.r*S-6);
      ctx.fillStyle='#8f8975';ctx.font='11px Alegreya Sans';
      ctx.fillText(z.tranche,cx(z.x),cz(z.z)-z.r*S+8);});
    // routes
    ctx.strokeStyle='rgba(140,130,100,.25)';ctx.setLineDash([4,5]);ctx.lineWidth=2;
    [[MORFAILLE,CAPITALE],[CAPITALE,{x:105,z:45}],[CAPITALE,{x:-115,z:-25}],[CAPITALE,{x:35,z:-130}]].forEach(([a,b])=>{
      ctx.beginPath();ctx.moveTo(cx(a.x),cz(a.z));ctx.lineTo(cx(b.x),cz(b.z));ctx.stroke();});
    ctx.setLineDash([]);
    // marqueurs
    ctx.font='15px sans-serif';ctx.fillStyle='#d8c26a';
    ctx.fillText('★',cx(CAPITALE.x),cz(CAPITALE.z)+5);
    ctx.fillText('⌂',cx(MORFAILLE.x),cz(MORFAILLE.z)+5);
    [[105,45],[-115,-25],[35,-130]].forEach(([x,z])=>ctx.fillText('▲',cx(x),cz(z)+5));
    ctx.fillStyle='#a03424';
    [[RUINES.x,RUINES.z],[188,74],[-202,-62],[62,-208]].forEach(([x,z])=>ctx.fillText('☠',cx(x),cz(z)+5));
    // joueur
    ctx.beginPath();ctx.arc(cx(player.pos.x),cz(player.pos.z),6,0,6.28);
    ctx.fillStyle='#e8ddc4';ctx.fill();ctx.strokeStyle='#8a7448';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx(player.pos.x)+Math.sin(player.facing)*13,cz(player.pos.z)+Math.cos(player.facing)*13);
    ctx.lineTo(cx(player.pos.x)+Math.sin(player.facing+2.6)*7,cz(player.pos.z)+Math.cos(player.facing+2.6)*7);
    ctx.lineTo(cx(player.pos.x)+Math.sin(player.facing-2.6)*7,cz(player.pos.z)+Math.cos(player.facing-2.6)*7);
    ctx.closePath();ctx.fillStyle='#c8b98e';ctx.fill();
  }
  draw();pan._carteInt=setInterval(draw,400);
}
/* ---------- progression ---------- */
function gainXp(n){
  if(G.lvl>=70){majHud();return;}
  G.xp+=Math.round(n*XP_RATE);
  while(G.lvl<70&&G.xp>=xpNext(G.lvl)){
    G.xp-=xpNext(G.lvl);G.lvl++;
    player.hp=maxHp();sfx('lvl');
    onde(player.pos.x,player.pos.z,0xb8a86a);
    spawnPart(player.pos.x,0.5,player.pos.z,40,{col:0xd8b45a,spd:2.5,up:6,grav:7,life:1});
    const nouveaux=SPELLS[G.classe].filter(s=>s.l===G.lvl);
    if(nouveaux.length)toast('Niveau '+G.lvl+' — nouveau sort !',nouveaux.map(s=>s.ic+' '+s.n).join(' · ')+' — grimoire (K)'+(G.lvl>=10?' · +1 talent (P)':''));
    else toast('Niveau '+G.lvl,'Cendrefiel vous endurcit.'+(G.lvl>=10?' +1 point de talent (P)':''));
    if(G.lvl===10)toast('Spécialisation débloquée','Touche T : choisissez votre voie');
    if(G.lvl===20)toast('La Lande vous ennuie déjà',"La Fange d'Ychor (20-40) est à l'est — voyez Ivane à Valcierge");
    if(G.lvl===30)toast('Palier de monture','Berthe, à Valcierge, vend le Destrier (niv. 30)');
    if(G.lvl===40)toast('Nouvelles terres','La Forêt des Pendus (40-60) attend, à l\'ouest');
    if(G.lvl===50)toast('Palier de monture','Le Cauchemar cendré vous attend (niv. 50)');
    if(G.lvl===50)setTimeout(()=>toast('Sous-classes débloquées',"L'épreuve du Maître d'armes Aldren vous attend à Valcierge"),3200);
    if(G.lvl===60)toast('Les hauteurs',"Les Crêtes de l'Ossuaire (60-70), au nord");
    if(G.lvl===70){toast('NIVEAU 70 — le sommet','La Vouivre vous attend chez Berthe. Cendrefiel n\'a plus rien à vous apprendre. Rien d\'indiqué, en tout cas.');G.xp=0;}}
  majHud();
}
function potion(){
  if(player.dead||G.potions<=0||player.cdR>0)return;
  G.potions--;player.cdR=6;
  const soin=Math.round(maxHp()*0.5*(1+0.1*talRank('e3')));
  player.hp=Math.min(maxHp(),player.hp+soin);
  dmgNum(player.pos,'+'+soin,'soin');sfx('or');majHud();
}
/* ---------- HUD ---------- */
function majHud(){
  el('hud-nom').textContent=G.name;
  el('hud-lvl').textContent=G.lvl;
  el('hud-classe').textContent=CL().nom;
  el('hud-spec').textContent=G.spec?('· '+(SPECS[G.classe].find(s=>s.id===G.spec)||{}).nom):'';
  el('hud-or').textContent=G.gold;
  el('hud-pot').textContent=G.potions;
  el('hud-dmg').textContent=baseDmg();
  el('orbe-sang').style.height=(clamp(player.hp/maxHp(),0,1)*100)+'%';
  el('orbe-val').textContent=Math.max(0,Math.round(player.hp));
  el('xpbar').style.width=(G.xp/xpNext(G.lvl)*100)+'%';
  el('xptxt').textContent=G.xp+' / '+xpNext(G.lvl)+' XP — niv. '+G.lvl;
  el('sk-f').classList.toggle('off',!(G.mounts.t1||G.mounts.t2||G.mounts.t3));
  el('pot-cnt').textContent=G.potions;
  el('sk-r').classList.toggle('off',G.potions<=0);
}
function majSkillBar(){
  for(let i=0;i<6;i++){
    const b=el('sk-s'+i),id=G.slots[i],s=id?spellById(id):null;
    b.querySelector('.ico').textContent=s?s.ic:'·';
    b.querySelector('.lbl').textContent=s?s.n.split(' ')[0]:'';
    b.title=s?(s.n+' — '+s.d):'Vide — grimoire (K)';
    b.classList.toggle('off',!s);}
}
function majTracker(){
  const list=el('tracker-list');list.innerHTML='';
  let n=0;
  QUESTS.forEach(q=>{
    const s=qState(q.id);if(s.state!=='active'&&s.state!=='ready')return;
    if(n++>4)return;
    const obj=q.type==='reach'?('Rejoindre '+(q.dest==='capitale'?'Valcierge (nord)':giverNom(q.dest||''))):
      q.type==='collect'?`${({fragment:'Fragments',corde:'Cordes',insigne:'Insignes',lanterne:'Lanternes',clou:'Clous'})[q.cible]||q.cible} : ${s.n}/${q.nb}`:
      `${q.cible==='any'?'Créatures':(ENEMY_DEF[q.cible]?ENEMY_DEF[q.cible].nom+'s':'')} : ${s.n}/${q.nb}`;
    list.innerHTML+=`<div class="q"><div class="t">${q.nom}</div>
      <div class="o ${s.state==='ready'?'done':''}">${s.state==='ready'?'✓ Rendre à '+giverNom(q.giver):obj}</div></div>`;});
}
/* ---------- entrées ---------- */
let camYaw=Math.PI,camPitch=0.34,camDist=6.5,zoomA=16;
const keysMove={f:false,b:false,l:false,r:false};
const volKeys={up:false,dn:false};
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
let solRay=null;
/* pick() et clic() sont définis plus bas (versions vivantes, hoisting) */
let pDown=false,pX=0,pY=0,pMoved=0;
canvas.addEventListener('pointerdown',e=>{pDown=true;pX=e.clientX;pY=e.clientY;pMoved=0;});
canvas.addEventListener('pointermove',e=>{
  if(!pDown)return;
  const dx=e.clientX-pX,dy=e.clientY-pY;
  pMoved+=Math.abs(dx)+Math.abs(dy);
  if(G.camMode==='tps'){
    if(pMoved>8){camYaw-=dx*0.006;camPitch=clamp(camPitch+dy*0.005,0.06,1.15);}
    pX=e.clientX;pY=e.clientY;
  } else {
    if(pMoved>8&&e.pointerType==='touch'){ // le stick n'existe qu'au doigt : à la souris, on ne déplace jamais
      const vx=(e.clientX-pX)/60,vz=-(e.clientY-pY)/60;
      const n2=Math.hypot(vx,vz);
      touchVec=n2>0.2?{x:clamp(vx/Math.max(1,n2),-1,1),z:clamp(vz/Math.max(1,n2),-1,1)}:null;
    }
  }
});
addEventListener('pointerup',e=>{
  if(pDown&&pMoved<8&&e.target===canvas)clic(e.clientX,e.clientY,e.shiftKey);
  pDown=false;touchVec=null;});
addEventListener('wheel',e=>{
  if(G.camMode==='tps')camDist=clamp(camDist+e.deltaY*0.008,3,12);
  else zoomA=clamp(zoomA+e.deltaY*0.012,11,24);
},{passive:true});
addEventListener('keydown',e=>{
  if(!G.started)return;
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
  const c=e.code;
  if(c==='Enter'&&MP.on){e.preventDefault();mpChatOpen();return;}
  if(c==='Digit1')castSpell(0);
  if(c==='Digit2')castSpell(1);
  if(c==='Digit3')castSpell(2);
  if(c==='Digit4')castSpell(3);
  if(c==='Digit5')castSpell(4);
  if(c==='Digit6')castSpell(5);
  if(c==='KeyR')potion();
  if(c==='KeyF')toggleMonture();
  if(c==='KeyV')toggleVue();
  if(c==='KeyM')togglePanneau('carte',ouvrirCarte);
  if(c==='KeyI')togglePanneau('inv',ouvrirInventaire);
  if(c==='KeyK')togglePanneau('grimoire',ouvrirGrimoire);
  if(c==='KeyT')togglePanneau('spe',ouvrirSpe);
  if(c==='KeyP')togglePanneau('tal',ouvrirTalents);
  if(c==='KeyJ')togglePanneau('journal',ouvrirJournal);
  if(c==='KeyH'){G.showHp=!G.showHp;toast(G.showHp?'Barres de vie affichées':'Barres de vie masquées','Touche H');save();}
  if(c==='KeyE')recolter();
  if(c==='Tab'){e.preventDefault();
    const cand=enemies.filter(x=>x.mesh.visible&&x.state!=='dead'&&dist2D(x.pos,player.pos)<22)
      .sort((x,y)=>dist2D(x.pos,player.pos)-dist2D(y.pos,player.pos));
    if(cand.length){const ci=cand.indexOf(player.targetEnemy);
      player.targetEnemy=cand[(ci+1)%cand.length];player.moveTarget=null;}}
  if(c==='Escape'){fermerPanneau();
    player.attack=null;player.targetEnemy=null;
    if(player.dash&&player.dash.evade!==true)player.dash=null;
    if(player.grab){const ge=player.grab.e;
      if(enemies.includes(ge)){ge.state='stagger';ge.mesh.rotation.z=0;}
      player.grab=null;}
  }
  if(c==='Space'){e.preventDefault();if(G.activeMount===3)volKeys.up=true;else esquive();}
  if(c==='ControlLeft')volKeys.dn=true;
  if(c==='KeyC'){if(G.activeMount===3)volKeys.dn=true;else togglePanneau('perso',ouvrirPerso);}
  if(c==='KeyW'||c==='ArrowUp')keysMove.f=true;
  if(c==='KeyS'||c==='ArrowDown')keysMove.b=true;
  if(c==='KeyA'||c==='ArrowLeft')keysMove.l=true;
  if(c==='KeyD'||c==='ArrowRight')keysMove.r=true;
});
addEventListener('keyup',e=>{
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
  const c=e.code;
  if(c==='Space')volKeys.up=false;
  if(c==='KeyC'||c==='ControlLeft')volKeys.dn=false;
  if(c==='KeyW'||c==='ArrowUp')keysMove.f=false;
  if(c==='KeyS'||c==='ArrowDown')keysMove.b=false;
  if(c==='KeyA'||c==='ArrowLeft')keysMove.l=false;
  if(c==='KeyD'||c==='ArrowRight')keysMove.r=false;
});
[0,1,2,3,4,5].forEach(i=>{
  el('sk-s'+i).addEventListener('pointerdown',ev=>{ev.stopPropagation();audioInit();castSpell(i);});});
el('sk-r').addEventListener('pointerdown',ev=>{ev.stopPropagation();audioInit();potion();});
el('sk-f').addEventListener('pointerdown',ev=>{ev.stopPropagation();toggleMonture();});
el('sk-v').addEventListener('pointerdown',ev=>{ev.stopPropagation();toggleVue();});
el('sk-m').addEventListener('pointerdown',ev=>{ev.stopPropagation();togglePanneau('carte',ouvrirCarte);});
el('sk-c').addEventListener('pointerdown',ev=>{ev.stopPropagation();togglePanneau('perso',ouvrirPerso);});
el('sk-i').addEventListener('pointerdown',ev=>{ev.stopPropagation();togglePanneau('inv',ouvrirInventaire);});
el('sk-k').addEventListener('pointerdown',ev=>{ev.stopPropagation();togglePanneau('grimoire',ouvrirGrimoire);});
el('sk-t').addEventListener('pointerdown',ev=>{ev.stopPropagation();togglePanneau('spe',ouvrirSpe);});
el('sk-p').addEventListener('pointerdown',ev=>{ev.stopPropagation();togglePanneau('tal',ouvrirTalents);});
el('sk-j').addEventListener('pointerdown',ev=>{ev.stopPropagation();togglePanneau('journal',ouvrirJournal);});
el('vol-up').addEventListener('pointerdown',e=>{e.stopPropagation();volKeys.up=true;});
el('vol-dn').addEventListener('pointerdown',e=>{e.stopPropagation();volKeys.dn=true;});
addEventListener('pointerup',()=>{volKeys.up=false;volKeys.dn=false;});

