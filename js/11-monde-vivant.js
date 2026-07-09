'use strict';
/* ---------- butin au sol ---------- */
const groundLoot=[];
function spawnLoot(it,x,z){
  const col=RAR_COLORS[it.rar];
  const g=new THREE.Group();
  const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.17),
    new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.55}));
  gem.position.y=0.4;g.add(gem);g.userData.gem=gem;
  if(it.rar>=3){
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.18,7,8),
      new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.26,depthWrite:false}));
    beam.position.y=3.5;g.add(beam);}
  g.position.set(x+rand(-0.9,0.9),0,z+rand(-0.9,0.9));
  g.position.y=terrainH(g.position.x,g.position.z);
  scene.add(g);
  const lbl=document.createElement('div');
  lbl.className='lootlbl '+RARITES[it.rar].c;lbl.textContent=it.nom;
  document.body.appendChild(lbl);
  groundLoot.push({it,mesh:g,el:lbl,x:g.position.x,z:g.position.z,bob:rand(0,6)});
  if(it.rar===4){sfx('legdrop');toast('☄ Un légendaire est tombé','Sa lueur perce la brume — ramassez-le');}
  else if(it.rar>=2)sfx('loot');
}
function updateLoot(dt,now){
  for(let i=groundLoot.length-1;i>=0;i--){
    const L=groundLoot[i];
    L.mesh.userData.gem.position.y=0.4+Math.sin(now/400+L.bob)*0.09;
    L.mesh.userData.gem.rotation.y+=dt*1.6;
    const d=dist2D(player.pos,L);
    if(d<1.5&&!player.dead){
      if(G.inv.length>=40){if(!L.full){L.full=true;toast('Sac plein','Vendez (I) puis revenez');}continue;}
      G.inv.push({...L.it,fresh:true});
      toast('Ramassé : '+L.it.nom,RARITES[L.it.rar].n+' · tranche '+((Math.ceil(L.it.ilvl/10)-1)*10+1)+'-'+(Math.ceil(L.it.ilvl/10)*10)+' · T'+L.it.tier);
      if(L.it.rar>=1)sfx('loot');
      scene.remove(L.mesh);L.el.remove();groundLoot.splice(i,1);save();continue;}
    if(d>48){L.el.style.opacity=0;continue;}
    const v=V3(L.x,L.mesh.position.y+0.9,L.z).project(camera);
    if(v.z>1){L.el.style.opacity=0;continue;}
    L.el.style.opacity=1;
    L.el.style.left=((v.x+1)/2*innerWidth)+'px';
    L.el.style.top=((-v.y+1)/2*innerHeight)+'px';
  }
}
/* ---------- objets de quête au sol : ramasser plutôt que faucher ---------- */
const QOBJ={
 fragment:{nom:"Fragment d'os",col:0xd8d2be},
 corde:{nom:'Corde de pendu',col:0xb08d4a},
 insigne:{nom:'Insigne des anciens',col:0x9a4ad8},
 lanterne:{nom:'Lanterne engloutie',col:0xd8b45a},
 clou:{nom:'Clou de cercueil',col:0x9a9aa8}};
const QZONE={epreuve:'foret'};
const questItems=[];
function collectQuestActive(cible){
  return QUESTS.find(q=>q.type==='collect'&&q.cible===cible&&qState(q.id).state==='active');
}
function spawnQuestItem(cible,zoneId){
  const z=ZONES.find(x=>x.id===zoneId)||ZONES[0];
  let x=z.x,zz=z.z;
  for(let i=0;i<20;i++){
    const a=rand(0,Math.PI*2),d=rand(z.r*0.15,z.r*0.7);
    x=z.x+Math.cos(a)*d;zz=z.z+Math.sin(a)*d;
    if(!enSecurite({x,z:zz}))break;}
  const def=QOBJ[cible];
  const g=new THREE.Group();
  const gem=new THREE.Mesh(new THREE.TetrahedronGeometry(0.28),
    new THREE.MeshStandardMaterial({color:def.col,emissive:def.col,emissiveIntensity:0.7}));
  gem.position.y=0.5;g.add(gem);g.userData.gem=gem;
  const halo=new THREE.PointLight(def.col,0.55,4);halo.position.y=0.9;g.add(halo);
  g.position.set(x,terrainH(x,zz),zz);
  scene.add(g);
  const lbl=document.createElement('div');
  lbl.className='lootlbl';lbl.style.color='#'+def.col.toString(16).padStart(6,'0');
  lbl.textContent=def.nom;
  document.body.appendChild(lbl);
  questItems.push({cible,mesh:g,el:lbl,x,z:zz,bob:rand(0,6)});
}
function removeQuestItem(i){
  const Q=questItems[i];scene.remove(Q.mesh);Q.el.remove();questItems.splice(i,1);
}
function syncQuestItems(){
  for(let i=questItems.length-1;i>=0;i--){
    if(!collectQuestActive(questItems[i].cible))removeQuestItem(i);}
  QUESTS.forEach(q=>{
    if(q.type!=='collect')return;
    const s=qState(q.id);if(s.state!=='active')return;
    const want=Math.min(q.nb-s.n,8);
    const have=questItems.filter(Q=>Q.cible===q.cible).length;
    for(let i=have;i<want;i++)spawnQuestItem(q.cible,QZONE[q.zone]||q.zone);});
}
function questItemsTick(dt,now){
  for(let i=questItems.length-1;i>=0;i--){
    const Q=questItems[i];
    Q.mesh.userData.gem.position.y=0.5+Math.sin(now/380+Q.bob)*0.1;
    Q.mesh.userData.gem.rotation.y+=dt*2.2;
    const d=dist2D(player.pos,Q);
    if(d<1.6&&!player.dead){
      if(!collectQuestActive(Q.cible))continue;
      spawnPart(Q.x,0.6,Q.z,12,{col:QOBJ[Q.cible].col,spd:2.5,up:3,life:0.5});
      toast('Ramassé : '+QOBJ[Q.cible].nom,'');
      sfx('or');
      removeQuestItem(i);
      questProgress('collect',Q.cible);
      continue;}
    if(d>48){Q.el.style.opacity=0;continue;}
    const v=V3(Q.x,Q.mesh.position.y+1.1,Q.z).project(camera);
    if(v.z>1){Q.el.style.opacity=0;continue;}
    Q.el.style.opacity=1;
    Q.el.style.left=((v.x+1)/2*innerWidth)+'px';
    Q.el.style.top=((-v.y+1)/2*innerHeight)+'px';
  }
}
/* ---------- inventaire : icônes, comparaison, objets non-vus ---------- */
const SLOT_GLYPH={arme:'⚔',tete:'🪖',torse:'🛡',jambes:'👢',amulette:'📿'};
const TIER_ROM=['','Ⅰ','Ⅱ','Ⅲ'];
/* Icônes procédurales : silhouette par emplacement (variante selon le nom de base),
   fond teinté par rareté, étoile pour les pouvoirs légendaires. Rendues une fois
   par combinaison puis mises en cache en data-URL. */
const ICO_CACHE=new Map();
const rarHex=r=>'#'+RAR_COLORS[r].toString(16).padStart(6,'0');
function icoBase(it){const i=(BASES[it.slot]||[]).findIndex(b=>it.nom.startsWith(b));return i<0?0:i;}
function icoURL(it){
  const base=icoBase(it);
  const key=it.slot+'|'+base+'|'+it.rar+'|'+(it.leg?1:0);
  if(ICO_CACHE.has(key))return ICO_CACHE.get(key);
  const S=88,cv=document.createElement('canvas');cv.width=cv.height=S;
  const c=cv.getContext('2d'),rc=rarHex(it.rar);
  const bg=c.createRadialGradient(S*0.5,S*0.38,6,S*0.5,S*0.5,S*0.72);
  bg.addColorStop(0,'#242019');bg.addColorStop(1,'#100e0a');
  c.fillStyle=bg;c.fillRect(0,0,S,S);
  c.globalAlpha=0.16;c.fillStyle=rc;c.fillRect(0,0,S,S);c.globalAlpha=1;
  const metal=c.createLinearGradient(0,S*0.15,0,S*0.9);
  metal.addColorStop(0,'#c8c0ae');metal.addColorStop(0.55,'#8d8574');metal.addColorStop(1,'#57503f');
  c.fillStyle=metal;c.strokeStyle='#2a2418';c.lineWidth=2;c.lineJoin='round';
  if(it.rar>=2){c.shadowColor=rc;c.shadowBlur=10;}
  const P=p=>{c.beginPath();p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fill();c.stroke();};
  if(it.slot==='arme'){
    if(base===0){P([[30,14],[56,14],[62,44],[52,56],[36,56]]);c.fillStyle='#4a3d28';c.fillRect(41,56,7,20);c.strokeRect(41,56,7,20);}
    else if(base===1){c.beginPath();c.moveTo(28,16);c.quadraticCurveTo(66,26,58,66);c.quadraticCurveTo(52,42,26,26);c.closePath();c.fill();c.stroke();c.fillStyle='#4a3d28';c.fillRect(52,62,16,7);}
    else if(base===2){P([[44,10],[52,50],[44,60],[36,50]]);c.fillStyle='#4a3d28';c.fillRect(40,58,8,18);c.strokeRect(40,58,8,18);}
    else{c.fillStyle='#4a3d28';c.fillRect(24,50,8,26);c.strokeRect(24,50,8,26);c.strokeStyle='#8d8574';c.lineWidth=3;c.beginPath();c.moveTo(30,50);c.quadraticCurveTo(42,34,54,32);c.stroke();c.strokeStyle='#2a2418';c.lineWidth=2;c.fillStyle=metal;c.beginPath();c.arc(58,30,11,0,7);c.fill();c.stroke();c.fillStyle='#2a2418';[[58,22],[66,30],[58,38],[50,30]].forEach(s=>{c.beginPath();c.arc(s[0],s[1],1.8,0,7);c.fill();});}
  }else if(it.slot==='tete'){
    if(base===0){c.beginPath();c.arc(44,40,20,Math.PI,0);c.lineTo(64,58);c.lineTo(24,58);c.closePath();c.fill();c.stroke();c.fillStyle='#191510';c.fillRect(28,42,32,5);}
    else if(base===1){P([[44,12],[62,42],[58,62],[30,62],[26,42]]);c.fillStyle='#12100b';c.beginPath();c.ellipse(44,48,10,12,0,0,7);c.fill();}
    else if(base===2){P([[26,58],[26,34],[35,46],[44,26],[53,46],[62,34],[62,58]]);}
    else{c.beginPath();c.ellipse(44,42,17,23,0,0,7);c.fill();c.stroke();c.fillStyle='#12100b';c.beginPath();c.ellipse(37,38,4.5,6,0,0,7);c.ellipse(51,38,4.5,6,0,0,7);c.fill();c.beginPath();c.moveTo(44,48);c.lineTo(40,56);c.lineTo(48,56);c.closePath();c.fill();}
  }else if(it.slot==='torse'){
    P([[28,18],[60,18],[66,34],[62,64],[44,70],[26,64],[22,34]]);
    if(base===0){c.strokeStyle='#57503f';c.beginPath();c.moveTo(44,22);c.lineTo(44,66);c.moveTo(30,38);c.quadraticCurveTo(44,46,58,38);c.stroke();}
    else if(base===1){c.fillStyle='#57503f';for(let y=26;y<62;y+=8)for(let x=30+(y%16===2?4:0);x<60;x+=8){c.beginPath();c.arc(x,y,2,0,7);c.fill();}}
    else if(base===2){c.strokeStyle='#57503f';c.beginPath();for(let x=26;x<64;x+=9){c.moveTo(x,22);c.quadraticCurveTo(x+3,44,x-2,66);}c.stroke();}
    else{c.strokeStyle='#3a3226';c.lineWidth=3;c.beginPath();c.moveTo(44,18);c.lineTo(44,70);c.moveTo(28,26);c.quadraticCurveTo(44,38,60,26);c.moveTo(24,42);c.quadraticCurveTo(44,54,64,42);c.stroke();}
  }else if(it.slot==='jambes'){
    P([[28,16],[60,16],[58,34],[52,34],[50,72],[40,72],[41,40],[38,40],[34,72],[24,72],[26,34]]);
    if(base===2||base===3){c.fillStyle='#3a3226';c.fillRect(26,48,12,5);c.fillRect(42,48,12,5);}
    if(base===1){c.strokeStyle='#57503f';c.beginPath();c.moveTo(30,24);c.lineTo(56,24);c.stroke();}
  }else{ /* amulette */
    c.strokeStyle='#4a3d28';c.lineWidth=3;c.beginPath();c.moveTo(24,14);c.quadraticCurveTo(44,34,64,14);c.stroke();
    c.strokeStyle='#2a2418';c.lineWidth=2;
    if(base===1){c.fillStyle=metal;c.save();c.translate(44,50);c.rotate(0.5);c.fillRect(-4,-16,8,32);c.strokeRect(-4,-16,8,32);c.beginPath();c.arc(-2,-16,5,0,7);c.arc(2,-16,5,0,7);c.arc(-2,16,5,0,7);c.arc(2,16,5,0,7);c.fill();c.restore();}
    else if(base===2){P([[44,32],[58,50],[44,68],[30,50]]);c.fillStyle=rc;c.globalAlpha=0.55;P([[44,38],[53,50],[44,62],[35,50]]);c.globalAlpha=1;}
    else if(base===3){c.fillStyle=metal;c.beginPath();c.arc(44,42,9,0,7);c.fill();c.stroke();c.fillRect(40,50,8,16);c.strokeRect(40,50,8,16);c.beginPath();c.moveTo(40,54);c.lineTo(30,62);c.moveTo(48,54);c.lineTo(58,62);c.strokeStyle='#57503f';c.lineWidth=3;c.stroke();}
    else{c.fillStyle=metal;c.beginPath();c.arc(44,48,14,0,7);c.fill();c.stroke();c.fillStyle=rc;c.globalAlpha=0.6;c.beginPath();c.arc(44,48,7,0,7);c.fill();c.globalAlpha=1;}
  }
  c.shadowBlur=0;
  if(it.leg){c.fillStyle='#f0c96a';c.save();c.translate(70,18);c.beginPath();
    for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?3:8;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
    c.closePath();c.fill();c.restore();}
  const url=cv.toDataURL();ICO_CACHE.set(key,url);return url;
}
function itemIco(it,fresh,up){
  return `<div class="item-ico ${RARITES[it.rar].c} ${fresh?'fresh':''}" style="border-color:currentColor">
    <img src="${icoURL(it)}" alt="${SLOT_NOMS[it.slot]}"><span class="tr2">${TIER_ROM[it.tier||1]}</span>${up?'<span class="up">▲</span>':''}</div>`;
}
/* Lignes sémantiques de l'infobulle */
function afLignes(it){
  return Object.entries(it.af).map(([k,v])=>{
    const a=AFFIXES.find(x=>x.k===k);if(!a)return '';
    return `<div class="tt-af">+${a.pct?(v*100).toFixed(1)+'%':Math.round(v)} ${a.n}</div>`;}).join('');
}
function legLigne(it){
  if(!it.leg)return '';
  if(it.leg==='relique'){const R=RELIQUES[it.cls]||{d:''};
    return `<div class="tt-leg">★ Relique de ${CLASSES[it.cls]?CLASSES[it.cls].nom:'classe'} : ${RELIQUE_D}.</div><div class="tt-flav">${R.d}</div>`;}
  const L=LEGENDS.find(x=>x.k===it.leg);
  return L?`<div class="tt-leg">★ ${L.n} : ${L.d}</div>`:'';
}
/* Comparaison : rappel atténué de l'objet porté, puis deltas filtrés du bruit
   (moins de 0,5 en valeur plate, moins de 0,05 point de % — un troc égal reste muet). */
function cmpBlock(it){
  const eq=G.equip[it.slot];
  if(!eq)return `<div class="tt-cmp"><div class="tt-cmp-h">Emplacement vide</div><div class="tt-gain">Tout est un gain.</div></div>`;
  let h=`<div class="tt-cmp"><div class="tt-cmp-h">Porté actuellement</div>
    <div class="tt-dim"><div class="tn2 ${RARITES[eq.rar].c}">${eq.nom}</div>
    <div class="tt-sub"><span>${RARITES[eq.rar].n} · T${eq.tier||1} · niv.${eq.ilvl}</span><span>Puissance ${itemScore(eq)}</span></div>
    ${afLignes(eq)}</div>
    <div class="tt-cmp-h">Si vous équipez</div>`;
  const keys=new Set([...Object.keys(it.af),...Object.keys(eq.af)]);
  const deltas=[];
  keys.forEach(k=>{
    const a=AFFIXES.find(x=>x.k===k);if(!a)return;
    const d=(it.af[k]||0)-(eq.af[k]||0);
    if(Math.abs(d)<(a.pct?0.0005:0.5))return;
    deltas.push(`<div class="${d>0?'tt-gain':'tt-perte'}">${d>0?'+':'−'}${a.pct?(Math.abs(d)*100).toFixed(1)+'%':Math.round(Math.abs(d))} ${a.n}</div>`);});
  const dp=itemScore(it)-itemScore(eq);
  h+=deltas.length?deltas.join(''):`<div class="tt-sub"><span>Équivalent à l'objet porté</span></div>`;
  if(Math.abs(dp)>=1&&deltas.length)h+=`<div class="${dp>0?'tt-gain':'tt-perte'}" style="margin-top:2px">Puissance ${dp>0?'+':'−'}${Math.abs(dp)}</div>`;
  return h+'</div>';
}
function ack(id,elm){
  const it=G.inv.find(x=>x.id===id);
  if(it&&it.fresh){it.fresh=false;if(elm)elm.classList.remove('fresh');save();}
}
/* ---------- journal de quêtes (J) ---------- */
const ZONE_NOMS={lande:'Lande de Cendrefiel',fange:"Fange d'Ychor",foret:'Forêt des Pendus',cretes:"Crêtes de l'Ossuaire",capitale:'Valcierge',epreuve:"L'Épreuve"};
function objTxt(q,s){
  if(q.type==='reach')return 'Rejoindre '+(q.dest==='capitale'?'Valcierge':giverNom(q.dest));
  const noms={fragment:'Fragments',corde:'Cordes',insigne:'Insignes',lanterne:'Lanternes',clou:'Clous de fer'};
  if(q.type==='collect')return `${noms[q.cible]||q.cible} : ${s.n}/${q.nb}`;
  return `${q.cible==='any'?'Créatures':(ENEMY_DEF[q.cible]?ENEMY_DEF[q.cible].nom+'s':q.cible)} : ${s.n}/${q.nb}`;
}
function ouvrirJournal(){
  const actives=QUESTS.filter(q=>['active','ready'].includes(qState(q.id).state));
  const faites=QUESTS.filter(q=>!q.repeat&&qState(q.id).state==='done');
  let html=`<h2>Journal de veillée</h2>
  <div class="role">${faites.length} quête${faites.length>1?'s':''} accomplie${faites.length>1?'s':''} · ${actives.length} en cours
  — les portes des zones s'ouvrent à ceux qui ont assez donné.</div>`;
  const parZone={};
  actives.forEach(q=>{(parZone[q.zone||'lande']=parZone[q.zone||'lande']||[]).push(q);});
  Object.entries(parZone).forEach(([z,qs])=>{
    html+=`<h3>${ZONE_NOMS[z]||z}</h3>`;
    qs.forEach(q=>{const s=qState(q.id);
      html+=`<div style="margin-bottom:10px">
      <div style="font-family:var(--f-display);font-size:15px">${q.nom} ${q.repeat?'<span class="d">(répétable)</span>':''}
      ${s.state==='ready'?'<span style="color:#9db07f">— accomplie, à rendre</span>':''}</div>
      <div class="d" style="font-style:italic;margin:2px 0">${q.txt}</div>
      <div class="d">${s.state==='ready'?'✓ Retourner voir '+giverNom(q.giver):objTxt(q,s)+' — donneur : '+giverNom(q.giver)}</div></div>`;});});
  if(!actives.length)html+=`<p>Aucune quête en cours. Les donneurs portent un marqueur doré.</p>`;
  if(faites.length){
    html+=`<h3>Accomplies</h3><div class="d" style="line-height:1.7">${faites.map(q=>q.nom).join(' · ')}</div>`;}
  html+=`<br><button class="btn ghost" onclick="MOOR.fermer()">Fermer (J)</button>`;
  pan.innerHTML=html;pan.style.display='block';panOuvert='journal';
}
/* ---------- reliefs : crêtes à franchir ou survoler ---------- */
function crete(x,z,h){
  const m=new THREE.Mesh(new THREE.ConeGeometry(h*0.45,h,5),mat(0x24261e));
  m.position.set(x,terrainH(x,z)-0.4,z);m.rotation.y=rand(0,6.28);scene.add(m);
  obstacles.push({x,z,r:h*0.34});
}
function buildReliefs(){
  // arête entre Valcierge et la Fange — un seul col au sol, survol direct en Vouivre
  for(let i=0;i<14;i++){const t=i/13;
    if(t>0.42&&t<0.58)continue;
    crete(46+t*76+rand(-3,3),4+t*40+rand(-3,3),rand(9,16));}
  // arête barrant l'approche des Crêtes — col unique à l'est
  for(let i=0;i<16;i++){const t=i/15;
    if(t>0.68&&t<0.8)continue;
    crete(-4+t*118+rand(-3,3),-112+rand(-4,4),rand(10,18));}
  // aiguilles isolées — repères de vol
  [[-70,60,22],[-180,120,26],[150,-60,24],[200,180,20],[-60,-190,25]].forEach(([x,z,h])=>crete(x,z,h));
  // le Nid de la Vouivre : seul le vol y mène
  const flch=new THREE.Mesh(new THREE.ConeGeometry(4.5,30,6),mat(0x2a2c24));
  flch.position.set(NID.x,0,NID.z);scene.add(flch);
  obstacles.push({x:NID.x,z:NID.z,r:3.4});
  const nid=new THREE.Mesh(new THREE.TorusGeometry(2.2,0.55,6,12),mat(0x3a301e));
  nid.position.set(NID.x,15.4,NID.z);nid.rotation.x=Math.PI/2;scene.add(nid);
  const lueur=new THREE.PointLight(0xd8b45a,0.8,14);
  lueur.position.set(NID.x,16,NID.z);scene.add(lueur);
}
const NID={x:100,z:-88};
/* ---------- le secret : le Cercle Éteint et l'Envers ---------- */
const CERCLE={x:-208,z:214},ENVERS={x:226,z:224},PORTE={x:226,z:241},RETOUR={x:218,z:216};
const secretTorches=[];
const CHUCHOTS=['…une bouche s\'éveille…','…deux… le sang se souvient…','…trois… elles avaient un nom…',
 '…quatre… qui compte encore ?…','…cinq… presque assez…','…six… la pierre a soif…','…SEPT. Montez sur la dalle.'];
function buildSecret(){
  // le Cercle Éteint — nulle part indiqué
  for(let i=0;i<7;i++){
    const a=i/7*Math.PI*2;
    const x=CERCLE.x+Math.cos(a)*6,z=CERCLE.z+Math.sin(a)*6;
    const poteau=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.13,2.1,5),mat(0x1c1812));
    poteau.position.set(x,1.05,z);scene.add(poteau);
    secretTorches.push({x,z,poteau,lit:false,l:null,flamme:null});
    obstacles.push({x,z,r:0.3});}
  const dalle=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.4,0.25,9),mat(0x101008));
  dalle.position.set(CERCLE.x,0.12,CERCLE.z);scene.add(dalle);
  // l'Envers — au bout du monde
  const solE=new THREE.Mesh(new THREE.CircleGeometry(26,30),
    new THREE.MeshStandardMaterial({color:0x080a0c,roughness:1}));
  solE.rotation.x=-Math.PI/2;solE.position.set(ENVERS.x,0.02,ENVERS.z);scene.add(solE);
  for(let i=0;i<6;i++){const a=i/6*6.28;
    const p2=new THREE.Mesh(new THREE.BoxGeometry(1.4,rand(7,12),1.4),mat(0x0c0e12));
    p2.position.set(ENVERS.x+Math.cos(a)*17,3.5,ENVERS.z+Math.sin(a)*17);
    p2.rotation.y=a;scene.add(p2);
    obstacles.push({x:p2.position.x,z:p2.position.z,r:1.1});}
  // la Porte Sans Nom
  const porte=new THREE.Mesh(new THREE.BoxGeometry(5,9,0.9),mat(0x06070a));
  porte.position.set(PORTE.x,4.5,PORTE.z);scene.add(porte);
  const seam=new THREE.Mesh(new THREE.BoxGeometry(0.06,7.6,0.06),
    new THREE.MeshBasicMaterial({color:0x8a94c8}));
  seam.position.set(PORTE.x,3.9,PORTE.z-0.48);scene.add(seam);
  obstacles.push({x:PORTE.x,z:PORTE.z,r:2.6});
  // dalle de retour
  const ret=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.5,0.2,8),mat(0x161410));
  ret.position.set(RETOUR.x,0.1,RETOUR.z);scene.add(ret);
}
function allumeTorche(i){
  const t=secretTorches[i];if(!t||t.lit)return;
  t.lit=true;
  t.flamme=new THREE.Mesh(new THREE.ConeGeometry(0.14,0.4,5),
    new THREE.MeshBasicMaterial({color:0x8a94c8}));
  t.flamme.position.set(t.x,2.35,t.z);scene.add(t.flamme);
  t.l=new THREE.PointLight(0x6a74b8,0.9,7);
  t.l.position.set(t.x,2.4,t.z);scene.add(t.l);
}
function secretKill(e){
  if(G.secret.open)return;
  if(dist2D(e.pos,CERCLE)>9)return;
  if(G.secret.lit>=7)return;
  allumeTorche(G.secret.lit);
  G.secret.lit++;
  toast('​',CHUCHOTS[G.secret.lit-1]);
  sfx('mort');
  if(G.secret.lit>=7)G.secret.open=true;
  save();
}
function secretTick(){
  const S=G.secret;
  // chuchotement d'approche
  if(!S.whisper&&dist2D(player.pos,CERCLE)<26){S.whisper=true;
    toast('​','…sept bouches éteintes… le sang les nourrit…');}
  // torches déjà allumées après chargement
  for(let i=0;i<S.lit&&i<7;i++)if(!secretTorches[i].lit)allumeTorche(i);
  // la dalle emporte
  if(S.open&&dist2D(player.pos,CERCLE)<2.3&&!player.dead){
    player.pos.set(ENVERS.x,0,ENVERS.z-16);player.vel.set(0,0,0);
    G.flying=false;G.altitude=0;if(G.activeMount)demonter();
    toast("L'ENVERS",'Ici, même la lune détourne les yeux.');
    if(!S.peuple){S.peuple=true;
      for(let k=0;k<3;k++)spawnEnemy('absent',72,ENVERS.x+rand(-10,10),ENVERS.z+rand(-8,8),null);}
    save();}
  // la dalle ramène
  if(dist2D(player.pos,RETOUR)<1.8&&dist2D(player.pos,ENVERS)<40&&!player.dead){
    player.pos.set(CERCLE.x,0,CERCLE.z+5);player.vel.set(0,0,0);
    toast('Le Cercle Éteint','Les torches sont froides. Elles se souviennent.');}
  // la Porte Sans Nom
  if(dist2D(player.pos,PORTE)<5){
    const absentsRestants=enemies.some(e=>e.type==='absent');
    if(absentsRestants&&!S.porteVue){S.porteVue=true;
      toast('La Porte Sans Nom','Elle ne s\'ouvre pas. Quelque chose ici respire encore à votre place.');}
    else if(!absentsRestants&&S.peuple&&!S.key){S.key=true;
      const clef={id:'it'+(itemSeq++),slot:'amulette',rar:4,ilvl:70,tier:3,
        nom:'La Clef sans dents',af:{dmg:38,crit:0.05,cdr:0.06,hp:110},leg:'echo'};
      G.inv.push({...clef,fresh:true});sfx('legdrop');
      toast('La Clef sans dents','« Elle n\'ouvre pas cette porte. Elle en ouvre une autre, ailleurs, plus tard. »');
      setTimeout(()=>toast('La Porte Sans Nom','La couture de lumière pâlit. Pas encore. Pas ici. — À suivre.'),4200);
      save();}
  }
  // le Nid de la Vouivre
  if(!S.nid&&G.activeMount===3&&G.altitude>13&&dist2D(player.pos,NID)<8){
    S.nid=true;G.gold+=500;
    const tresor=genItem(70,true);tresor.rar=4;tresor.tier=3;tresor.leg=tresor.leg||'colosse';
    G.inv.push({...tresor,fresh:true});
    sfx('legdrop');
    toast('Le Nid de la Vouivre','500 or et une relique que nul marcheur ne verra jamais.');
    save();}
}

/* ---------- végétation instanciée ---------- */
function buildNature(){
  const dummy=new THREE.Object3D(),colC=new THREE.Color();
  const tints={lande:0x4a5238,fange:0x3a4a3a,foret:0x323a2c,cretes:0x4a463a,capitale:0x4a5238};
  function scatter(geo,matr,count,y,smin,smax,filter){
    const im=new THREE.InstancedMesh(geo,matr,count);
    let gi=0;
    for(let i=0;i<count*2&&gi<count;i++){
      const x=rand(-242,242),z=rand(-242,242);
      if(dist2D({x,z},CAPITALE)<38)continue;
      if(dist2D({x,z},MORFAILLE)<14)continue;
      if(filter&&!filter(x,z))continue;
      dummy.position.set(x,terrainH(x,z)+y,z);dummy.rotation.y=rand(0,6.28);
      dummy.scale.setScalar(rand(smin,smax));dummy.updateMatrix();
      im.setMatrixAt(gi,dummy.matrix);
      colC.setHex(tints[zoneAt({x,z}).id]||0x4a5238).multiplyScalar(rand(0.65,1.1));
      im.setColorAt(gi,colC);gi++;}
    im.count=gi;
    if(im.instanceColor)im.instanceColor.needsUpdate=true;
    scene.add(im);return im;}
  // herbes
  scatter(new THREE.ConeGeometry(0.07,0.55,3),
    new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}),650,0.24,0.6,1.6);
  // buissons
  scatter(new THREE.IcosahedronGeometry(0.5,0),
    new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}),150,0.3,0.5,1.1);
  // pierraille
  scatter(new THREE.DodecahedronGeometry(0.3,0),
    new THREE.MeshStandardMaterial({color:0x8a8578,roughness:1}),130,0.12,0.5,1.3);
  // champignons blafards de la forêt
  scatter(new THREE.ConeGeometry(0.18,0.22,6),
    new THREE.MeshStandardMaterial({color:0xc8c8b0,emissive:0x3a3a2c,roughness:0.7}),
    36,0.11,0.7,1.4,(x,z)=>dist2D({x,z},{x:-160,z:-40})<80);
  // roseaux de la Fange
  scatter(new THREE.CylinderGeometry(0.02,0.03,1.3,4),
    new THREE.MeshStandardMaterial({color:0x5a6a4a,roughness:1}),
    120,0.6,0.7,1.3,(x,z)=>dist2D({x,z},{x:150,z:60})<78);
}
/* ---------- décor 3D instancié : props GLB (Kenney, CC0) teintés sombre ----------
   Chaque prop = 1-3 InstancedMesh (une par primitive du GLB). La teinte
   d'instance MULTIPLIE la couleur du matériau : on assombrit vers la lande. */
function buildDecorGLB(){
  if(typeof RIG_ON==='undefined'||!RIG_ON)return;   // même garde réseau que les rigs
  const P=[
   {f:'rock_largeA',n:34,s:[2.2,4.4],tint:0x8a887c,col:1.5},
   {f:'rock_largeC',n:30,s:[2.0,4.0],tint:0x8a887c,col:1.5},
   {f:'rock_largeE',n:26,s:[2.2,4.6],tint:0x807d6f,col:1.6},
   {f:'rock_tallB',n:26,s:[2.4,4.4],tint:0x787468,col:1.2,zone:'cretes'},
   {f:'rock_tallE',n:24,s:[2.4,4.8],tint:0x787468,col:1.2,zone:'cretes'},
   {f:'rock_tallH',n:20,s:[2.2,4.2],tint:0x84806f,col:1.1},
   {f:'stone_tallB',n:12,s:[2.6,3.6],tint:0x8f8a74,col:1.0,zone:'lande'},
   {f:'stone_tallD',n:10,s:[2.6,3.8],tint:0x8f8a74,col:1.0,zone:'cretes'},
   {f:'stump_old',n:30,s:[1.8,3.0],tint:0x6a5c48},
   {f:'stump_oldTall',n:22,s:[1.8,3.2],tint:0x80704f,zone:'foret'},
   {f:'log',n:26,s:[1.8,3.2],tint:0x6a5c48},
   {f:'log_large',n:18,s:[2.0,3.4],tint:0x80704f,zone:'foret'},
   {f:'mushroom_redGroup',n:26,s:[1.2,2.4],tint:0xa08a80,zone:'fange'},
   {f:'mushroom_tanGroup',n:26,s:[1.2,2.6],tint:0xa89e88,zone:'foret'},
   {f:'mushroom_tanTall',n:18,s:[1.4,2.8],tint:0x9e947e,zone:'fange'},
   {f:'tree_pineTallA',n:52,s:[4.2,6.6],tint:0x6e7a62,col:0.7,zone:'foret'},
   {f:'tree_pineTallB',n:46,s:[4.0,6.4],tint:0x687458,col:0.7,zone:'foret'},
   {f:'tree_pineTallD',n:40,s:[4.4,7.0],tint:0x606c52,col:0.7,zone:'cretes'},
   {f:'tree_thin_dark',n:34,s:[3.2,5.2],tint:0x5c5a48,col:0.6,zone:'lande'},
   {f:'tree_simple_dark',n:30,s:[3.0,5.0],tint:0x585443,col:0.6,zone:'lande'},
   {f:'plant_bushDetailed',n:60,s:[1.6,3.0],tint:0x74806a}];
  const dummy=new THREE.Object3D(),cc=new THREE.Color();
  P.forEach(p=>{
    _rigLoad(_MFA+'env/'+p.f+'.glb').then(g=>{
      const zn=p.zone?ZONES.find(z=>z.id===p.zone):null;
      const spots=[];
      for(let i=0;i<p.n*4&&spots.length<p.n;i++){
        let x,z;
        if(zn){const a=rand(0,6.28),rr=Math.sqrt(Math.random())*zn.r*0.95;
          x=zn.x+Math.cos(a)*rr;z=zn.z+Math.sin(a)*rr;}
        else{x=rand(-242,242);z=rand(-242,242);}
        if(dist2D({x,z},CAPITALE)<40||dist2D({x,z},MORFAILLE)<14)continue;
        if(p.col&&FLATS.some(f=>dist2D({x,z},f)<f.r+1))continue;
        spots.push({x,z,s:rand(p.s[0],p.s[1]),rot:rand(0,6.28)});
      }
      if(!spots.length)return;
      g.scene.traverse(src=>{
        if(!src.isMesh)return;
        const im=new THREE.InstancedMesh(src.geometry,src.material.clone(),spots.length);
        spots.forEach((sp,i)=>{
          dummy.position.set(sp.x,terrainH(sp.x,sp.z)-0.05,sp.z);
          dummy.rotation.y=sp.rot;dummy.scale.setScalar(sp.s);dummy.updateMatrix();
          im.setMatrixAt(i,dummy.matrix);
          cc.setHex(p.tint).multiplyScalar(rand(0.8,1.12));im.setColorAt(i,cc);
        });
        if(im.instanceColor)im.instanceColor.needsUpdate=true;
        im.castShadow=!!p.col;im.receiveShadow=true;
        scene.add(im);
      });
      if(p.col)spots.forEach(sp=>obstacles.push({x:sp.x,z:sp.z,r:0.35*sp.s*p.col}));
    }).catch(()=>{});
  });
}
/* ---------- animaux non ciblables ---------- */
const critters=[];
function mkCorbeau(x,z){
  const g=new THREE.Group();
  const corps=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.34,5),mat(0x14120e));
  corps.rotation.x=Math.PI/2;g.add(corps);
  const ailes=[];
  [-1,1].forEach(sd=>{const a=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.02,0.12),mat(0x14120e));
    a.position.set(0.17*sd,0.04,0);g.add(a);ailes.push(a);});
  g.position.set(x,terrainH(x,z)+0.15,z);scene.add(g);
  return{kind:'corbeau',mesh:g,ailes,state:'pose',t:rand(0,4),vx:0,vy:0,vz:0};
}
function mkRat(x,z){
  const g=new THREE.Group();
  const corps=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.1,0.12),mat(0x3a342c));g.add(corps);
  const queue=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.02,0.24,4),mat(0x4a4038));
  queue.rotation.x=Math.PI/2;queue.position.z=-0.2;g.add(queue);
  g.position.set(x,terrainH(x,z)+0.06,z);scene.add(g);
  return{kind:'rat',mesh:g,state:'idle',t:rand(0,3),dir:rand(0,6.28)};
}
function spawnCritters(){
  for(let i=0;i<8;i++)critters.push(mkCorbeau(rand(-220,220),rand(-220,220)));
  for(let i=0;i<9;i++)critters.push(mkRat(rand(-200,200),rand(-200,200)));
}
function crittersTick(dt,now){
  critters.forEach(c=>{
    const d=dist2D(c.mesh.position,player.pos);
    if(d>90){c.mesh.visible=false;return;}
    c.mesh.visible=true;c.t-=dt;
    if(c.kind==='corbeau'){
      if(c.state==='pose'){
        if(d<6){c.state='envol';c.vy=rand(3,4.5);
          const a=Math.atan2(c.mesh.position.x-player.pos.x,c.mesh.position.z-player.pos.z);
          c.vx=Math.sin(a)*7;c.vz=Math.cos(a)*7;c.t=5;}
        else if(c.t<=0){c.t=rand(2,5);c.mesh.rotation.y+=rand(-1,1);}
      }else{
        c.mesh.position.x+=c.vx*dt;c.mesh.position.z+=c.vz*dt;
        c.mesh.position.y+=c.vy*dt;c.vy*=Math.pow(0.6,dt);
        c.ailes.forEach((a,i)=>a.rotation.z=(i?1:-1)*Math.sin(now/60)*0.8);
        c.mesh.rotation.y=Math.atan2(c.vx,c.vz);
        if(c.t<=0){ // se repose ailleurs
          c.state='pose';
          const nx2=player.pos.x+rand(-70,70),nz2=player.pos.z+rand(-70,70);
          c.mesh.position.set(nx2,terrainH(nx2,nz2)+0.15,nz2);
          c.ailes.forEach(a=>a.rotation.z=0);}
      }
    }else{ // rat
      if(d<3&&c.state!=='fuite'){c.state='fuite';c.t=1.2;
        c.dir=Math.atan2(c.mesh.position.x-player.pos.x,c.mesh.position.z-player.pos.z);}
      if(c.state==='fuite'||c.state==='trotte'){
        const sp=c.state==='fuite'?4.5:1.6;
        c.mesh.position.x+=Math.sin(c.dir)*sp*dt;
        c.mesh.position.z+=Math.cos(c.dir)*sp*dt;
        c.mesh.rotation.y=c.dir;
        if(c.t<=0)c.state='idle',c.t=rand(1,3);}
      else if(c.t<=0){c.state='trotte';c.t=rand(0.6,1.6);c.dir=rand(0,6.28);}
      c.mesh.position.y=terrainH(c.mesh.position.x,c.mesh.position.z)+0.06;
    }
  });
}
/* ---------- cycle jour / nuit (8 minutes) ---------- */
const sunAmb=new THREE.AmbientLight(0xcabf9e,0);scene.add(sunAmb);
let LBASE=null,FOGC_N=new THREE.Color(0x222720),FOGC_J=new THREE.Color(0x474d44),
    LUNE_N=new THREE.Color(0x9aa4c8),LUNE_J=new THREE.Color(0xcabf9e);
const wisps=[];
[[150,60,0x9ab86a],[175,90,0x9ab86a],[-160,-40,0x8a94c8]].forEach(([x,z,c])=>{
  const l=new THREE.PointLight(c,0.9,10);l.position.set(x,1.2,z);scene.add(l);
  wisps.push({l,x,z,ph:rand(0,6)});});
let luciole=0;
function cycleTick(dt,now){
  if(LBASE===null)LBASE=lune.intensity;
  const f=0.5-0.5*Math.cos(((G.playTime+120)%480)/480*Math.PI*2); // 0 minuit → 1 midi (départ au matin)
  sunAmb.intensity=0.44+0.30*f; // plancher nocturne : on doit toujours voir la lande
  lune.intensity=LBASE*(1.15+0.4*f);
  lune.color.copy(LUNE_N).lerp(LUNE_J,f);
  if(scene.fog){scene.fog.color.copy(FOGC_N).lerp(FOGC_J,f);
    if(scene.fog.density!==undefined)scene.fog.density=0.0085*(1-0.35*f);}
  if(ciel&&ciel.material)ciel.material.color.setRGB(0.8+0.2*f,0.8+0.2*f,0.84+0.16*f);
  // feux follets qui respirent
  wisps.forEach(w=>{w.l.intensity=(0.5+0.5*Math.sin(now/700+w.ph))*(1-f*0.7)*1.1;
    w.l.position.x=w.x+Math.sin(now/1400+w.ph)*3;
    w.l.position.z=w.z+Math.cos(now/1100+w.ph)*3;});
  // lucioles la nuit
  if(f<0.35){luciole-=dt;
    if(luciole<=0){luciole=0.5;
      spawnPart(player.pos.x+rand(-14,14),rand(0.5,2),player.pos.z+rand(-14,14),1,
        {col:0xd8e29a,spd:0.2,up:0.3,grav:-0.25,drag:0.995,life:3});}}
}
/* ---------- barres de vie des ennemis (touche H) ---------- */
function ensureBar(e){
  if(e.bar)return;
  const d=document.createElement('div');d.className='ebar';
  d.innerHTML='<div class="f"></div><span class="lv"></span>';
  document.body.appendChild(d);
  e.bar={el:d,f:d.firstChild,lv:d.lastChild};
}
function lvlColor(elvl){
  const d=elvl-G.lvl;
  return d<=-8?'#6a675c':d>=5?'#c8503a':d>=2?'#c8863a':d<=-3?'#7da05c':'#cfc7ae';
}
function majBar(e,dLOD){
  const vis=G.showHp&&!e.def.boss&&dLOD<=36&&(e.hp<e.maxHp||player.targetEnemy===e);
  if(!vis){if(e.bar)e.bar.el.style.display='none';return;}
  ensureBar(e);
  const v=e.pos.clone().add(V3(0,2.15*e.def.scale,0)).project(camera);
  if(v.z>1){e.bar.el.style.display='none';return;}
  e.bar.el.style.display='block';
  e.bar.el.style.left=((v.x+1)/2*innerWidth)+'px';
  e.bar.el.style.top=((-v.y+1)/2*innerHeight)+'px';
  e.bar.f.style.width=(clamp(e.hp/e.maxHp,0,1)*100)+'%';
  e.bar.lv.textContent=e.lvl;
  e.bar.lv.style.color=lvlColor(e.lvl);
}
/* ---------- gisements : os anciens & cendre vive ---------- */
const nodes=[];
function mkNode(type,x,z){
  const g=new THREE.Group();
  if(type==='os'){
    for(let k=0;k<3;k++){const o=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,rand(0.5,0.8),4),mat(0xd8d2be,0.7));
      o.rotation.set(rand(0,1.2),rand(0,6.28),Math.PI/2);o.position.set(rand(-0.2,0.2),0.1,rand(-0.2,0.2));g.add(o);}
    const lueur=new THREE.Mesh(new THREE.OctahedronGeometry(0.1),
      new THREE.MeshStandardMaterial({color:0xd8d2be,emissive:0x8a8a6a,emissiveIntensity:0.5}));
    lueur.position.y=0.32;g.add(lueur);
  }else{
    for(let k=0;k<4;k++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(rand(0.1,0.18),0),
      new THREE.MeshStandardMaterial({color:0x3a2c24,emissive:0xc85a1a,emissiveIntensity:rand(0.4,0.9)}));
      b.position.set(rand(-0.25,0.25),0.1,rand(-0.25,0.25));g.add(b);}
  }
  g.position.set(x,terrainH(x,z),z);scene.add(g);
  nodes.push({type,x,z,mesh:g,up:true,t:0});
}
/* ---------- murailles : chaque contrée est un vallon clos.
   Un seul passage par zone, tourné vers Valcierge — le monde se lit comme
   une suite d'actes autour de la capitale, façon hub. ---------- */
function buildMurailles(){
  ZONES.forEach(z=>{
    if(z.id==='capitale')return;
    const R=z.r*0.94;
    const gap=Math.atan2(CAPITALE.z-z.z,CAPITALE.x-z.x);
    const half=0.22;
    for(let a=0;a<Math.PI*2;a+=4.2/R){
      const da=Math.abs(((a-gap+Math.PI*3)%(Math.PI*2))-Math.PI);
      if(da<half)continue;
      const x=z.x+Math.cos(a)*R,zz=z.z+Math.sin(a)*R;
      if(Math.abs(x)>272||Math.abs(zz)>272)continue;
      rocher(x,zz,rand(2.6,4.2));
    }
    [-1,1].forEach(sgn=>{
      const a=gap+sgn*half;
      const x=z.x+Math.cos(a)*R,zz=z.z+Math.sin(a)*R;
      pilier(x,zz,rand(7,9),1.2);
      torche(x-Math.cos(a)*3,zz-Math.sin(a)*3,1.7,14);});
  });
}
function buildNodes(){
  for(let i=0;i<14;i++)mkNode('os',60+rand(-70,70),-170+rand(-55,50));
  for(let i=0;i<8;i++)mkNode('os',rand(-60,60),120+rand(-60,60));
  for(let i=0;i<10;i++)mkNode('cendre',rand(-70,70),120+rand(-70,50));
  for(let i=0;i<8;i++)mkNode('cendre',150+rand(-60,60),60+rand(-50,50));
  for(let i=0;i<6;i++)mkNode('cendre',-160+rand(-60,60),-40+rand(-50,50));
}
function nodesTick(dt){
  nodes.forEach(n=>{if(!n.up){n.t-=dt;if(n.t<=0){n.up=true;n.mesh.visible=true;}}});
}
function nodeProche(){
  let best=null,bd=2.6;
  nodes.forEach(n=>{if(!n.up)return;const d=dist2D(player.pos,n);if(d<bd){bd=d;best=n;}});
  return best;
}
function recolter(){
  const n=nodeProche();
  if(!n||player.dead)return;
  n.up=false;n.mesh.visible=false;n.t=90;
  const gain=irand(1,2);
  if(n.type==='os'){G.mats.os+=gain;toast('+'+gain+' os ancien'+(gain>1?'s':''),'Ferraille l\'Ossier, à Valcierge, sait quoi en faire');}
  else{G.mats.cendre+=gain;toast('+'+gain+' cendre vive','Encore chaude. Elle ne refroidit jamais vraiment.');}
  spawnPart(n.x,0.5,n.z,14,{col:n.type==='os'?0xd8d2be:0xd8783a,spd:2.5,up:3,life:0.6});
  player.attack={t:0,dur:0.5,hitAt:99,done:true,anim:'summon',fn:()=>{}};
  sfx('or');majHud();save();
}

/* ---------- quêtes errantes : des inconnus accourent vers vous ---------- */
const ZONE_TYPES={lande:['creux','traqueur','rodeuse','brule'],fange:['noyeur','gonfle','sangsue','porteur'],
  foret:['pendu','hurleur','echassier','veuve'],cretes:['ossature','colosse','moine','choeur']};
const SIDE_POOL=[
 {nom:'La dette du fossoyeur',txt:"« J'enterre les gens d'ici depuis trente ans. Cette nuit, j'ai reconnu trois de mes clients debout dans la brume. On ne devrait pas avoir à faire son travail deux fois. Tuez-en {nb} — je paierai de ma retraite. »",
  fin:"« Voilà. S'ils reviennent encore, je creuserai plus profond. C'est tout ce qu'un homme peut promettre : plus profond. »"},
 {nom:'Le troupeau de personne',txt:"« Mon frère gardait des bêtes par ici. Les bêtes sont devenues autre chose, et mon frère aussi, peut-être — je n'ai pas regardé les visages. Abattez {nb} de ces choses. Ne me dites pas si l'une d'elles vous a semblé me ressembler. »",
  fin:"« Merci. Non — ne dites rien. Le doute est la dernière chose que je possède de lui. »"},
 {nom:'La lettre non remise',txt:"« Je porte une lettre depuis onze jours. Le destinataire est mort le troisième jour, la route est infestée depuis le cinquième. Ouvrez-moi un passage — {nb} créatures — que j'aille au moins la lire sur sa tombe. C'est idiot ? Tout ce qui compte l'est. »",
  fin:"« La voie est libre. Je vais lui lire. Il n'entendra pas, et c'est très bien : elle n'était pas gentille, cette lettre. »"},
 {nom:'Le veilleur épuisé',txt:"« Je tiens la garde d'un hameau que vous ne verrez jamais — trois feux, neuf vivants. Je n'ai pas dormi depuis quatre nuits. Fauchez {nb} de ces choses autour de nous et j'irai dormir une heure. Une heure. On ne mesure pas ce que ça vaut. »",
  fin:"« Une heure de sommeil contre du sang. Le taux de change de Cendrefiel. Merci, étranger. »"},
 {nom:'Ce que le chien a rapporté',txt:"« Mon chien rapporte des os. Hier, il a rapporté une main — avec la bague de ma femme, partie depuis l'automne. Tuez {nb} de ces créatures dans les environs. Je ne cherche pas la vérité. Je cherche à ne plus pouvoir la trouver. »",
  fin:"« C'est fait ? Bien. Le chien ne rapportera plus rien. Certains trous doivent rester des trous. »"},
 {nom:'Le prix du silence',txt:"« Je suis cloche-teneur : je sonne pour les morts. Depuis une lune, quelque chose sonne AVANT moi — toujours juste avant. Débarrassez la lande de {nb} créatures. Si la cloche s'arrête, je saurai. Si elle continue… je saurai autre chose. »",
  fin:"« La cloche a sonné cette nuit. Après moi, cette fois. Après moi. Vous ne saurez jamais le soulagement que c'est, d'être en avance sur la mort. »"},
 {nom:'Les mains propres',txt:"« Je n'ai jamais tué. Ni bête, ni homme, ni chose. C'était ma fierté, puis mon luxe, et maintenant ma honte : les autres meurent en me protégeant. Tuez {nb} créatures à ma place — et prenez aussi ma fierté, elle est dans le prix. »",
  fin:"« Voilà. Mes mains sont propres et mon compte est sale. Dites-moi… ça change quoi, la première fois ? Non. Ne dites rien. »"},
 {nom:'L\'inventaire des disparus',txt:"« Je recense les disparus pour Valcierge — un nom, une date, une croix. Il me manque les corps de la page douze. Ils marchent quelque part par ici. Couchez-en {nb} : ce ne sont plus des personnes, mais ce sont encore mes lignes. »",
  fin:"« Page douze : soldée. Vous savez ce qu'il y a de terrible ? Il y a une page treize. Il y a toujours une page treize. »"}];
let sideQ=null,sideT=90;
function sideTick(dt){
  if(!G.started||player.dead)return;
  if(sideQ){
    const n=sideQ;
    if(n.state==='approche'){
      const d=dist2D(n.mesh.position,player.pos);
      if(d>2.6){
        const dx=player.pos.x-n.mesh.position.x,dz=player.pos.z-n.mesh.position.z;
        n.mesh.position.x+=dx/d*4.6*dt;n.mesh.position.z+=dz/d*4.6*dt;
        n.mesh.position.y=terrainH(n.mesh.position.x,n.mesh.position.z);
        n.mesh.rotation.y=Math.atan2(dx,dz);
        animeHumanoide(n.mesh,performance.now()/140,4.6,null);
      }else{n.state='attente';n.x=n.mesh.position.x;n.z=n.mesh.position.z;
        toast('Quelqu\'un accourt vers vous','Un inconnu, essoufflé — il a besoin de vous');
        if(panOuvert===null)ouvrirErrant();}
    }else if(n.state==='depart'){
      n.t-=dt;
      n.mesh.position.x+=Math.sin(n.dir)*3*dt;n.mesh.position.z+=Math.cos(n.dir)*3*dt;
      n.mesh.position.y=terrainH(n.mesh.position.x,n.mesh.position.z);
      n.mesh.rotation.y=n.dir;
      animeHumanoide(n.mesh,performance.now()/160,3,null);
      if(n.t<=0){scene.remove(n.mesh);n.marker&&scene.remove(n.marker);sideQ=null;sideT=rand(180,300);}
    }else{
      animeHumanoide(n.mesh,performance.now()/400,0,null);
      if(n.marker)n.marker.position.y=terrainH(n.x,n.z)+2.5+Math.sin(performance.now()/500)*0.12;
    }
    return;
  }
  sideT-=dt;
  if(sideT<=0){
    sideT=rand(180,300);
    if(G.lvl<5)return;
    const z=zoneAt(player.pos);
    if(z.id==='capitale'||!ZONE_TYPES[z.id])return;
    const tpl=pickR(SIDE_POOL);
    const cible=pickR(ZONE_TYPES[z.id]);
    const nb=irand(6,10);
    const qid='sq'+Date.now();
    const q={id:qid,giver:'errant',zone:z.id,nom:tpl.nom,type:'kill',cible,nb,
      txt:tpl.txt.replace('{nb}',nb),fin:tpl.fin,
      rew:{xp:Math.round(xpNext(G.lvl)*0.22),or:20+G.lvl*2},side:true};
    const a=rand(0,6.28);
    const m=humanoide({peau:0x8f8470,habit:[0x33302a,0x2c3230,0x3a2e28][irand(0,2)]});
    m.position.set(player.pos.x+Math.sin(a)*26,0,player.pos.z+Math.cos(a)*26);
    scene.add(m);
    const marker=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.4,4),new THREE.MeshBasicMaterial({color:0x9ab8d8}));
    marker.rotation.x=Math.PI;scene.add(marker);
    sideQ={mesh:m,marker,q,state:'approche',t:0,dir:0,
      get x(){return this.mesh.position.x;},get z(){return this.mesh.position.z;}};
  }
}
function ouvrirErrant(){
  if(!sideQ)return;
  const q=sideQ.q,s=qState(q.id);
  let html=`<h2>Un errant</h2><div class="role">Il ne donne pas son nom. Personne n'en donne, ici.</div>`;
  if(sideQ.state==='attente'){
    html+=`<p><b style="font-family:var(--f-display)">${q.nom}</b><br>${q.txt}</p>
    <div class="rec">Récompense : ${q.rew.xp} XP, ${q.rew.or} or</div>
    <button class="btn" onclick="MOOR.sideAccept()">Accepter</button>
    <button class="btn ghost" onclick="MOOR.sideDecline()">Refuser</button>`;
  }else if(s.state==='ready'){
    html+=`<p><b style="font-family:var(--f-display)">${q.nom}</b> — accompli.<br><i style="color:var(--os-dim)">${q.fin}</i></p>
    <button class="btn" onclick="MOOR.sideDone()">Recevoir votre dû</button>`;
  }else{
    html+=`<p>« ${q.nb} — c'est le compte. Je ne bouge pas d'ici. Bouger, c'est mourir, par les temps qui courent. » <span class="d">(${s.n}/${q.nb})</span></p>
    <button class="btn ghost" onclick="MOOR.fermer()">Partir</button>`;
  }
  pan.innerHTML=html;pan.style.display='block';panOuvert='errant';
}
function sideAccept(){
  if(!sideQ)return;
  QUESTS.push(sideQ.q);
  G.quests[sideQ.q.id]={state:'active',n:0};
  sideQ.state='actif';
  sideQ.marker.position.set(sideQ.x,terrainH(sideQ.x,sideQ.z)+2.5,sideQ.z);
  majTracker();fermerPanneau();
  toast('Quête errante acceptée','Il vous attendra ici. Journal : J');
}
function sideDecline(){
  if(!sideQ)return;
  sideQ.state='depart';sideQ.t=7;sideQ.dir=rand(0,6.28);
  sideQ.marker&&scene.remove(sideQ.marker);sideQ.marker=null;
  fermerPanneau();
  toast('Il hoche la tête','« Bien sûr. Tout le monde a ses morts à soi. »');
}
function sideDone(){
  if(!sideQ)return;
  const q=sideQ.q;
  G.gold+=q.rew.or;gainXp(q.rew.xp);
  G.quests[q.id]={state:'done',n:0};
  sfx('or');majHud();majTracker();fermerPanneau();
  sideQ.state='depart';sideQ.t=8;sideQ.dir=rand(0,6.28);
  sideQ.marker&&scene.remove(sideQ.marker);sideQ.marker=null;
  toast('L\'errant s\'éloigne','Il ne se retourne pas. C\'est une forme de confiance.');
}
