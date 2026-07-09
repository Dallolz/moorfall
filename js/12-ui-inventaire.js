'use strict';
/* ---------- inventaire en grille + infobulle au survol ---------- */
const tt=document.createElement('div');tt.id='tt';document.body.appendChild(tt);
let ttPin=false;
function tip(id,ev){
  const it=G.inv.find(x=>x.id===id)||Object.values(G.equip).find(x=>x&&x.id===id);
  if(!it)return;
  ack(id,ev&&ev.target&&ev.target.closest?ev.target.closest('.item-ico'):null);
  const inBag=G.inv.some(x=>x.id===id);
  tt.innerHTML=`<div class="tn2 ${RARITES[it.rar].c}">${it.nom}</div>
  <div class="tt-sub"><span>${SLOT_NOMS[it.slot]} · ${RARITES[it.rar].n}</span><span>Palier T${it.tier||1}</span></div>
  <div class="tt-ilvl">Niveau d'objet ${it.ilvl} · Puissance ${itemScore(it)}</div>
  ${afLignes(it)}${legLigne(it)}
  <div class="tt-prix">Valeur : ${itemVal(it)} or</div>
  ${inBag?cmpBlock(it)+`
  <button class="btn mini" onclick="MOOR.equipItem('${it.id}');MOOR.tipHide(1)">Équiper</button>
  <button class="btn mini ghost" onclick="MOOR.vendreItem('${it.id}');MOOR.tipHide(1)">Vendre ${itemVal(it)} or</button>
  <div class="tt-hint">Clic : épingler · Clic droit : vente rapide</div>`
  :`<div class="tt-hint">Porté — retirez-le depuis la feuille de personnage (C)</div>`}`;
  tt.style.display='block';
  const w=tt.offsetWidth||280,h=tt.offsetHeight||220;
  const x=clamp((ev?ev.clientX:innerWidth/2)+14,8,Math.max(8,innerWidth-w-8));
  const y=clamp((ev?ev.clientY:innerHeight/2)-10,8,Math.max(8,innerHeight-h-8));
  tt.style.left=x+'px';tt.style.top=y+'px';
}
function tipHide(force){
  if(ttPin&&!force)return;
  tt.style.display='none';ttPin=false;
}
tt.addEventListener('mouseleave',()=>tipHide());
/* ---------- feuille de personnage (C) ---------- */
const STAT_INFO=[
 {k:'hp',n:'Points de vie',fmt:()=>maxHp()},
 {k:'dmg',n:'Dégâts',fmt:()=>baseDmg()},
 {k:'spd',n:'Vitesse',fmt:()=>statSpd().toFixed(1)},
 {k:'crit',n:'Chance critique',fmt:()=>Math.round(statCrit()*100)+'%'},
 {k:'impact',n:'Force d\'impact',fmt:()=>'×'+statImpact().toFixed(2)},
 {k:'cdr',n:'Recharges',fmt:()=>'−'+Math.round((1-cdrMult())*100)+'%'},
 {k:'ls',n:'Vol de vie',fmt:()=>(lsTotal()*100).toFixed(1)+'%'},
 {k:'pui',n:'Puissance équipée',fmt:()=>Object.values(G.equip).filter(x=>x).reduce((s,x)=>s+itemScore(x),0)}];
const STAT_DESC={
 hp:'Ce que la lande devra arracher avant de vous prendre.',
 dmg:'La base de chaque coup, avant les bonus de type (mêlée, zone, projectile…).',
 spd:'Votre vitesse de déplacement, en mètres par seconde.',
 crit:'Chance qu\'un coup inflige des dégâts doublés.',
 impact:'Multiplie la force qui renverse et repousse les ennemis.',
 cdr:'Réduction du temps de recharge de vos sorts (plafond : 55%).',
 ls:'Part des dégâts infligés qui vous revient en points de vie.',
 pui:'Somme des puissances de vos cinq pièces équipées.'};
const pct1=v=>(v*100).toFixed(1).replace(/\.0$/,'')+'%';
function statSrc(k){
  const sp=curSpec(),relic=EQ.legs.relique?' <span class="r4">(★ relique ×1,5)</span>':'';
  const L=[];const add=(t,v)=>{if(v)L.push([t,v]);};
  if(k==='hp'){add('Base de classe (niv. '+G.lvl+')',Math.round(CL().hp0+G.lvl*CL().hpL));
    add('Équipement',EQ.hp?'+'+Math.round(EQ.hp):0);
    if(sp.hp)add('Spécialisation'+relic,'+'+pct1(sp.hp));
    if(curSub().hp)add('Sous-classe','+'+pct1(curSub().hp));
    const t=0.03*talRank('e1')+0.02*talRank('e5')+(talRank('e6')?0.12:0);
    if(t)add('Talents','+'+pct1(t));}
  else if(k==='dmg'){add('Base de classe (niv. '+G.lvl+')',Math.round(CL().dmg0+G.lvl*CL().dmgL));
    add('Équipement',EQ.dmg?'+'+Math.round(EQ.dmg):0);
    const t=0.02*talRank('g1')+0.03*talRank('g5')+(talRank('g6')?0.10:0);
    if(t)add('Talents','+'+pct1(t));
    if(curSub().dmg)add('Sous-classe','+'+pct1(curSub().dmg));
    if(wsMod().dmg)add('Style d\'arme','+'+pct1(wsMod().dmg));}
  else if(k==='spd'){add('Base de classe',CL().speed.toFixed(1));
    if(EQ.spd)add('Équipement','+'+pct1(EQ.spd));
    if(sp.spd)add('Spécialisation'+relic,'+'+pct1(sp.spd));
    if(curSub().spd)add('Sous-classe','+'+pct1(curSub().spd));
    if(wsMod().spd)add('Style d\'arme','+'+pct1(wsMod().spd));
    const t=0.02*talRank('r1')+(talRank('r6')?0.08:0);
    if(t)add('Talents','+'+pct1(t));}
  else if(k==='crit'){add('Base','8%');
    if(EQ.crit)add('Équipement','+'+pct1(EQ.crit));
    if(sp.crit)add('Spécialisation'+relic,'+'+pct1(sp.crit));
    if(curSub().crit)add('Sous-classe','+'+pct1(curSub().crit));
    if(wsMod().crit)add('Style d\'arme','+'+pct1(wsMod().crit));
    const t=0.01*talRank('g2')+(talRank('g6')?0.05:0);
    if(t)add('Talents','+'+pct1(t));}
  else if(k==='impact'){add('Base','×1');
    if(EQ.impact)add('Équipement (dont légendaires)','+'+pct1(EQ.impact));
    if(sp.impact)add('Spécialisation'+relic,'+'+pct1(sp.impact));
    if(curSub().impact)add('Sous-classe','+'+pct1(curSub().impact));
    if(talRank('g3'))add('Talents','+'+pct1(0.04*talRank('g3')));}
  else if(k==='cdr'){if(EQ.cdr)add('Équipement','−'+pct1(EQ.cdr));
    if(sp.cdr)add('Spécialisation'+relic,'−'+pct1(sp.cdr));
    if(curSub().cdr)add('Sous-classe','−'+pct1(curSub().cdr));
    if(wsMod().cdr)add('Style d\'arme','−'+pct1(wsMod().cdr));
    const t=0.03*talRank('g4')+0.02*talRank('r3');
    if(t)add('Talents','−'+pct1(t));}
  else if(k==='ls'){if(EQ.ls)add('Équipement (dont légendaires)','+'+pct1(EQ.ls));
    if(sp.ls)add('Spécialisation'+relic,'+'+pct1(sp.ls));
    if(curSub().ls)add('Sous-classe','+'+pct1(curSub().ls));
    if(talRank('r4'))add('Talents','+'+pct1(0.01*talRank('r4')));}
  else if(k==='pui'){SLOTS_IT.forEach(sl=>{const it=G.equip[sl];
    add(SLOT_NOMS[sl],it?String(itemScore(it)):'—');});}
  return L;
}
function statTip(k,ev){
  const s=STAT_INFO.find(x=>x.k===k);if(!s)return;
  const lignes=statSrc(k).map(([t,v])=>`<div class="tt-sub"><span>${t}</span><span style="color:#d8cfae">${v}</span></div>`).join('');
  tt.innerHTML=`<div class="tn2" style="color:var(--laiton)">${s.n}</div>
  <div class="tt-flav" style="margin-bottom:5px">${STAT_DESC[k]||''}</div>
  ${lignes||'<div class="tt-sub"><span>Aucune source pour l\'instant</span></div>'}
  <div class="tt-sub" style="border-top:1px solid #3a3226;margin-top:5px;padding-top:4px"><span>Total</span><span style="color:var(--laiton)">${s.fmt()}</span></div>`;
  tt.style.display='block';
  const w=tt.offsetWidth||280,h=tt.offsetHeight||160;
  tt.style.left=clamp((ev?ev.clientX:innerWidth/2)+14,8,Math.max(8,innerWidth-w-8))+'px';
  tt.style.top=clamp((ev?ev.clientY:innerHeight/2)-10,8,Math.max(8,innerHeight-h-8))+'px';
}
function ouvrirPerso(){
  const sp=G.spec?SPECS[G.classe].find(x=>x.id===G.spec):null;
  const relic=!!EQ.legs.relique;
  let html=`<h2>${CL().ic} ${G.name}</h2>
  <div class="role">Niveau ${G.lvl} · ${CL().nom}${sp?` · <span style="color:var(--laiton)">${sp.ic} ${sp.nom}</span>`:''}${relic?' · <span class="r4">★ relique éveillée</span>':''}</div>
  <h3>Équipement</h3>`;
  SLOTS_IT.forEach(sl=>{
    const it=G.equip[sl];
    html+=`<div class="pd-ligne">
      ${it?`<div onmouseenter="MOOR.tip('${it.id}',event)" onmouseleave="MOOR.tipHide()" onclick="MOOR.tip('${it.id}',event);MOOR.tipPin()">${itemIco(it)}</div>`
          :`<div class="item-ico r0" style="opacity:.3"><span class="gl">${SLOT_GLYPH[sl]}</span></div>`}
      <div class="pd-slot">${SLOT_NOMS[sl]}</div>
      <div class="pd-nom">${it?`<span class="${RARITES[it.rar].c}">${it.nom}</span><div class="d">niv.${it.ilvl} · T${it.tier||1} · Puissance ${itemScore(it)}</div>`:`<span class="d">— vide —</span>`}</div>
      ${it?`<button class="pd-x" onclick="MOOR.desequiper('${sl}')" title="Retirer (va au sac)">✕</button>`:''}</div>`;});
  html+=`<h3>Statistiques <span style="font-size:10px;color:var(--os-dim)">— survolez pour le détail des sources</span></h3><div class="stat-grid">`;
  STAT_INFO.forEach(s=>{html+=`<div class="stat-cell" onmouseenter="MOOR.statTip('${s.k}',event)" onmouseleave="MOOR.tipHide()"><span>${s.n}</span><b>${s.fmt()}</b></div>`;});
  html+=`</div><h3>Voie</h3>`;
  if(sp)html+=`<div class="spec-carte" style="cursor:default"><div class="sn">${sp.ic} ${sp.nom}${relic?' <span class="r4">★</span>':''}</div>
    <div class="sd">${sp.d}${relic?'<br><span class="r4">★ '+RELIQUES[G.classe].nom+' — les dons de la voie sont amplifiés de moitié.</span>':''}</div></div>`;
  else html+=`<p style="font-size:12.5px">Aucune voie choisie${G.lvl<10?' — les voies s\'ouvrent au niveau 10.':'.'} </p>`;
  html+=`<br><button class="btn ghost" onclick="MOOR.ouvrirSac()">Sac (I)</button>
  <button class="btn ghost" onclick="MOOR.ouvrirVoies()">Voies (T)</button>
  <button class="btn ghost" onclick="MOOR.fermer()">Fermer (C)</button>`;
  pan.innerHTML=html;pan.style.display='block';panOuvert='perso';
}
/* ---------- le sac (I) : filtres, recherche, tri ---------- */
let sacF='tout',sacTri='recent',sacQ='';
const SAC_FILTRES=[['tout','Tout'],['arme','Armes'],['armure','Armures'],['amulette','Bijoux'],['mats','Matériaux']];
const MATS_DEF=[['os','🦴','Os anciens'],['cendre','🔥','Cendres vives'],['peau','🐾','Peaux de rôdeuses']];
function sacItems(){
  let l=[...G.inv];
  if(sacF==='arme')l=l.filter(x=>x.slot==='arme');
  else if(sacF==='armure')l=l.filter(x=>['tete','torse','jambes'].includes(x.slot));
  else if(sacF==='amulette')l=l.filter(x=>x.slot==='amulette');
  else if(sacF==='mats')l=[];
  if(sacQ){const q=sacQ.toLowerCase();
    l=l.filter(x=>x.nom.toLowerCase().includes(q)
      ||Object.keys(x.af).some(k=>{const a=AFFIXES.find(y=>y.k===k);return a&&a.n.toLowerCase().includes(q);}));}
  if(sacTri==='recent')l.sort((a,b)=>(b.fresh?1:0)-(a.fresh?1:0)||b.rar-a.rar||b.ilvl-a.ilvl);
  else if(sacTri==='rar')l.sort((a,b)=>b.rar-a.rar||itemScore(b)-itemScore(a));
  else if(sacTri==='pui')l.sort((a,b)=>itemScore(b)-itemScore(a));
  else if(sacTri==='ilvl')l.sort((a,b)=>b.ilvl-a.ilvl||b.rar-a.rar);
  return l;
}
function majSacGrid(){
  const g=el('sac-items');if(!g)return;
  let h='';
  sacItems().forEach(it=>{
    const eq=G.equip[it.slot];
    const up=!eq||itemScore(it)>itemScore(eq);
    h+=`<div onmouseenter="MOOR.tip('${it.id}',event)" onmouseleave="MOOR.tipHide()"
      onclick="MOOR.tip('${it.id}',event);MOOR.tipPin()"
      oncontextmenu="MOOR.vendreItem('${it.id}');return false">${itemIco(it,it.fresh,up)}</div>`;});
  if(sacF==='tout'||sacF==='mats')MATS_DEF.forEach(([k,ic,n])=>{
    if(!sacQ||n.toLowerCase().includes(sacQ.toLowerCase()))
      h+=`<div class="item-ico r0" title="${n} — matériau de forge" style="border-color:currentColor;cursor:default">
        <span class="gl">${ic}</span><span class="mat-badge">${G.mats[k]}</span></div>`;});
  g.innerHTML=h||`<p style="font-size:12.5px;color:var(--os-dim)">${G.inv.length?'Rien ne correspond à ce filtre.':'Vide. La lande finira par donner.'}</p>`;
}
function ouvrirInventaire(){
  const frais=G.inv.filter(x=>x.fresh).length;
  let html=`<h2>Sac</h2>
  <div class="role">${G.inv.length}/40 objets${frais?` · <span style="color:var(--laiton)">${frais} non examiné${frais>1?'s':''} ✦</span>`:''}</div>
  <div class="chips">${SAC_FILTRES.map(([k,n])=>`<span class="chip ${sacF===k?'on':''}" onclick="MOOR.bagFiltre('${k}')">${n}</span>`).join('')}</div>
  <div class="sac-ctl"><input id="sac-q" placeholder="Chercher un nom, un affixe…" value="${sacQ.replace(/"/g,'&quot;')}" oninput="MOOR.bagCherche(this.value)">
  <select onchange="MOOR.bagTri(this.value)">${[['recent','Récents'],['rar','Rareté'],['pui','Puissance'],['ilvl','Niveau']]
    .map(([k,n])=>`<option value="${k}" ${sacTri===k?'selected':''}>${n}</option>`).join('')}</select></div>
  <div class="sac-grid" id="sac-items"></div>
  <div class="d" style="margin-top:8px">Survol : détails et comparaison · Clic : épingler + actions · Clic droit : vente rapide · ▲ : mieux que l'objet porté</div>
  <br><button class="btn ghost" onclick="MOOR.ouvrirPersoBtn()">Personnage (C)</button>
  <button class="btn ghost" onclick="MOOR.fermer()">Fermer (I)</button>`;
  pan.innerHTML=html;pan.style.display='block';panOuvert='inv';
  majSacGrid();
}
function bagFiltre(k){sacF=k;ouvrirInventaire();}
function bagTri(k){sacTri=k;majSacGrid();}
function bagCherche(v){sacQ=v;majSacGrid();}
/* ---------- la forge de Ferraille l'Ossier ---------- */
function ouvrirForge(){
  const M=G.mats;
  let html=`<h2>Ferraille l'Ossier</h2>
  <div class="role">Forgeron d'os et retrempeur — « Tout ce qui a vécu peut servir deux fois. C'est la devise, et le problème, de ce pays. »</div>
  <p>Vos matériaux : 🦴 ${M.os} os anciens · 🔥 ${M.cendre} cendres vives · 🐾 ${M.peau} peaux de rôdeuses</p>
  <h3>Forger</h3>
  <div class="item-ligne"><div><div class="n">Pièce d'os bleue (niv. ${G.lvl})</div>
    <div class="d">Emplacement aléatoire, rareté Bleue garantie — 6 os, 4 cendres, 30 or</div></div>
    <div class="prix"><button class="btn mini" ${M.os>=6&&M.cendre>=4&&G.gold>=30?'':'disabled'} onclick="MOOR.forger(2)">Forger</button></div></div>
  <div class="item-ligne"><div><div class="n">Relique violette (niv. ${G.lvl})</div>
    <div class="d">Emplacement aléatoire, rareté Violette garantie — 10 os, 8 cendres, 6 peaux, 120 or</div></div>
    <div class="prix"><button class="btn mini" ${M.os>=10&&M.cendre>=8&&M.peau>=6&&G.gold>=120?'':'disabled'} onclick="MOOR.forger(3)">Forger</button></div></div>
  <h3>Retremper (palier +1)</h3>
  <div class="d" style="margin-bottom:6px">4 cendres, 2 peaux, 10 or + niveau de l'objet. Les statistiques montent avec le palier.</div>`;
  const cands=[...Object.values(G.equip).filter(x=>x),...G.inv].filter(it=>(it.tier||1)<3);
  if(!cands.length)html+=`<p>Rien à retremper — tout est déjà au palier III, ou le sac est vide.</p>`;
  cands.slice(0,12).forEach(it=>{
    const cout=10+it.ilvl;
    html+=`<div class="item-ligne">${itemIco(it)}<div style="flex:1"><div class="n"><span class="${RARITES[it.rar].c}">${it.nom}</span> <span class="d">T${it.tier||1} → T${(it.tier||1)+1}</span></div></div>
    <div class="prix"><button class="btn mini" ${M.cendre>=4&&M.peau>=2&&G.gold>=cout?'':'disabled'} onclick="MOOR.retremper('${it.id}')">${cout} or</button></div></div>`;});
  html+=`<br><button class="btn ghost" onclick="MOOR.fermer()">Partir</button>`;
  pan.innerHTML=html;pan.style.display='block';panOuvert='forge';
}
function forger(rar){
  const M=G.mats;
  if(rar===2){if(M.os<6||M.cendre<4||G.gold<30)return;M.os-=6;M.cendre-=4;G.gold-=30;}
  else{if(M.os<10||M.cendre<8||M.peau<6||G.gold<120)return;M.os-=10;M.cendre-=8;M.peau-=6;G.gold-=120;}
  const it=genItem(G.lvl,false);it.rar=rar;
  const R=RARITES[rar];
  Object.keys(it.af).forEach(k=>{const a=AFFIXES.find(x=>x.k===k);
    it.af[k]=+(a.b*(G.lvl*0.55+2.2)*R.m*(it.tMult||1)*rand(0.85,1.2)).toFixed(a.pct?4:0);});
  const pool=[...AFFIXES].filter(a=>!(a.k in it.af));
  while(Object.keys(it.af).length<R.naf&&pool.length){
    const a=pool.splice(irand(0,pool.length-1),1)[0];
    it.af[a.k]=+(a.b*(G.lvl*0.55+2.2)*R.m*(it.tMult||1)*rand(0.85,1.2)).toFixed(a.pct?4:0);}
  G.inv.push({...it,fresh:true});
  sfx('legdrop');spawnPart(player.pos.x,1,player.pos.z,20,{col:RAR_COLORS[rar],spd:2.5,up:4,life:0.7});
  toast('Forgé : '+it.nom,R.n+' — « Ne demande pas à qui était l\'os. »');
  majHud();ouvrirForge();save();
}
function retremper(id){
  const it=[...Object.values(G.equip).filter(x=>x),...G.inv].find(x=>x&&x.id===id);
  if(!it||(it.tier||1)>=3)return;
  const cout=10+it.ilvl;
  if(G.mats.cendre<4||G.mats.peau<2||G.gold<cout)return;
  G.mats.cendre-=4;G.mats.peau-=2;G.gold-=cout;
  const TM=[0,1,1.16,1.34];
  const ratio=TM[(it.tier||1)+1]/TM[it.tier||1];
  Object.keys(it.af).forEach(k=>{const a=AFFIXES.find(x=>x.k===k);
    it.af[k]=+(it.af[k]*ratio).toFixed(a&&a.pct?4:0);});
  it.tier=(it.tier||1)+1;
  recomputeEQ();majApparence();
  sfx('lvl');toast('Retrempé : '+it.nom,'Palier T'+it.tier+' — l\'os se souvient de la flamme');
  majHud();ouvrirForge();save();
}

/* ---------- LE VOLEUR : septième classe ---------- */
CLASSES.voleur={nom:'Voleur',ic:'🔪',peau:0x8f8270,habit:0x262b32,arme:'dague',
  hp0:88,hpL:12,dmg0:11,dmgL:3.1,speed:6.6,mass:66,range:2.2,ranged:false,
  desc:'Deux lames, aucun serment. Frappe avant la question.',
  phys:'Esquives multiples, entailles qui saignent, ombres traversantes.'};
SPECS.voleur=[
 {id:'lames',nom:'Maître des lames',ic:'⚔',d:'Mêlée +25%, critique +7%. Deux lames, deux réponses.',tg:{melee:1.25},crit:0.07},
 {id:'ombre',nom:'Ombre',ic:'🌑',d:'Mobilité +30%, contrôle +20%, recharges -10%, +1 esquive. On ne frappe pas ce qu\'on ne voit pas.',tg:{mob:1.3,ctrl:1.2},cdr:0.1,spd:0.08,dash:1},
 {id:'venin',nom:'Vénéneux',ic:'🐍',d:'Saignements et poisons +60%, vol de vie +4%. La mort en différé.',tg:{dot:1.6,melee:1.1},ls:0.04}];
SUBCLASSES.voleur=[
 {id:'spadassin',nom:'Spadassin',ic:'🗡',d:'Deux épées longues : mêlée +25%, critique +5%. L\'escrime comme dernière politesse.',tg:{melee:1.25},crit:0.05},
 {id:'egorgeur',nom:'Égorgeur',ic:'🔪',d:'Deux dagues courtes : recharges -18%, vitesse +8%, critique +8%, dégâts -5%. Vite. Puis plus rien.',cdr:0.18,spd:0.08,crit:0.08,dmg:-0.05}];
SUBSPELLS.spadassin=[
 {i:'sv51',sc:'spadassin',n:'Croix d\'acier',ic:'✝',l:50,cd:8,tg:['melee','cone'],t:'cone',p:{r:5,m:2.2,f:520},d:'Double taille en croix'},
 {i:'sv52',sc:'spadassin',n:'Lame-tempête',ic:'🌪',l:55,cd:10,tg:['melee','aoe'],t:'melee',p:{r:4,m:2.2,f:480,arc:-1},d:'360° à deux épées'},
 {i:'sv53',sc:'spadassin',n:'Estocade finale',ic:'🎯',l:60,cd:14,tg:['melee'],t:'melee',p:{r:3,m:5.5,f:900},d:'×5,5 — une seule phrase'}];
SUBSPELLS.egorgeur=[
 {i:'ve51',sc:'egorgeur',n:'Gorge ouverte',ic:'🩸',l:50,cd:6,tg:['melee','dot'],t:'melee',p:{r:2.4,m:2.6,f:300,dot:1},d:'Rapide, et ça ne se referme pas'},
 {i:'ve52',sc:'egorgeur',n:'Frénésie des dagues',ic:'⚡',l:55,cd:16,tg:['melee'],t:'buff',p:{k:'dmg',m:1.35,dur:8},d:'+35% dégâts, 8 s'},
 {i:'ve53',sc:'egorgeur',n:'Mort par mille',ic:'💮',l:60,cd:6,tg:['melee','aoe','dot'],t:'melee',p:{r:3.6,m:2,f:340,arc:-1,dot:1},d:'360° court, saigne, revient vite'}];
SPELLS.voleur=[
 {i:'vo01',n:'Lame vive',ic:'🗡',l:1,cd:2.5,tg:['melee'],t:'melee',p:{r:2.4,m:1.2,f:240},d:'Coup rapide'},
 {i:'vo02',n:'Dague jetée',ic:'🔪',l:1,cd:4,tg:['proj'],t:'proj',p:{m:1.1,f:260,sp:34},d:'Pour ce qui recule'},
 {i:'vo03',n:'Entaille vénéneuse',ic:'🐍',l:3,cd:5,tg:['melee','dot'],t:'melee',p:{r:2.4,m:1,f:200,dot:1},d:'Le poison finit la phrase'},
 {i:'vo04',n:'Pas de côté',ic:'💨',l:5,cd:6,tg:['mob'],t:'dash',p:{dist:6,m:0,f:0},d:'Esquive courte'},
 {i:'vo05',n:'Éventail',ic:'🪭',l:8,cd:8,tg:['proj'],t:'proj',p:{m:0.8,f:240,sp:30,count:5,spread:0.22},d:'Cinq dagues en arc'},
 {i:'vo06',n:'Ombre portée',ic:'🌒',l:12,cd:9,tg:['mob','melee'],t:'dash',p:{dist:9,m:1.2,f:380},d:'Traverse en tranchant'},
 {i:'vo07',n:'Garrot d\'ombre',ic:'🪢',l:14,cd:8,tg:['melee','ctrl'],t:'melee',p:{r:2.6,m:1.6,f:160,slow:3},d:'Entrave et blesse'},
 {i:'vo08',n:'Danse des lames',ic:'🌀',l:16,cd:8,tg:['melee','aoe'],t:'melee',p:{r:2.8,m:1.2,f:280,arc:-1},d:'360° serré'},
 {i:'vo09',n:'Rideau de fumée',ic:'🌫',l:18,cd:12,tg:['ctrl'],t:'zone',p:{r:3.5,dur:5,m:0.2,f:60,slow:2},d:'Ce qui entre ralentit'},
 {i:'vo10',n:'Lancer double',ic:'🔪',l:20,cd:7,tg:['proj'],t:'proj',p:{m:1.4,f:300,sp:34,count:2,spread:0.05},d:'Deux dagues, même gorge'},
 {i:'vo11',n:'Sang froid',ic:'❤',l:22,cd:25,tg:['mob'],t:'heal',p:{pct:0.3},d:'Rend 30% des PV'},
 {i:'vo12',n:'Perce-rein',ic:'🎯',l:25,cd:9,tg:['melee'],t:'melee',p:{r:2.4,m:2.4,f:420},d:'Là où ça compte'},
 {i:'vo13',n:'Voile',ic:'👤',l:28,cd:14,tg:['mob'],t:'buff',p:{k:'spd',m:1.3,dur:5},d:'+30% vitesse, 5 s'},
 {i:'vo14',n:'Pluie d\'acier',ic:'🌧',l:32,cd:11,tg:['proj'],t:'proj',p:{m:0.9,f:280,sp:30,count:7,spread:0.18},d:'Sept lames'},
 {i:'vo15',n:'Toxine vive',ic:'☠',l:36,cd:16,tg:['dot'],t:'buff',p:{k:'dmg',m:1.3,dur:6},d:'+30% dégâts, 6 s'},
 {i:'vo16',n:'Exécution silencieuse',ic:'🤫',l:40,cd:12,tg:['melee'],t:'melee',p:{r:2.6,m:3.2,f:520},d:'×3,2 sans un bruit'},
 {i:'vo17',n:'Nuée de dagues',ic:'✨',l:45,cd:14,tg:['aoe'],t:'zone',p:{off:5,r:4,dur:5,m:0.6,f:180},d:'Zone lacérée'},
 {i:'vo18',n:'Ombre double',ic:'🌘',l:50,cd:11,tg:['mob','melee'],t:'dash',p:{dist:12,m:1.8,f:520},d:'Longue traversée tranchante'},
 {i:'vo19',n:'Mille entailles',ic:'💮',l:55,cd:13,tg:['melee','aoe','dot'],t:'melee',p:{r:3.4,m:2,f:380,arc:-1,dot:1},d:'360° qui saigne longtemps'},
 {i:'vo20',n:'L\'Heure du voleur',ic:'🕛',l:60,cd:22,tg:['melee'],t:'buff',p:{k:'dmg',m:1.5,dur:8},d:'+50% dégâts, 8 s'}];
TEMPLATES.lames=['vo01','vo12','vo16','vo08'];
TEMPLATES.ombre=['vo04','vo06','vo18','vo09'];
TEMPLATES.venin=['vo03','vo07','vo15','vo19'];
CLASSFX.voleur={arc:0x9aa8b8,cone:0x9aa8b8,burst:0x7ab06a,pull:0x6a7a8a,light:0xaab8c8};
CLASS_SFX.voleur=k=>{ // double glissement d'acier
  nz(0.05,'highpass',3200,0,1,0.16*k);
  nz(0.06,'highpass',2600,0,1,0.14*k,0.05);
  tone2(1250,900,0.05,'triangle',0.06*k,0.02);};
IDLE_POSE.voleur=p=>{p.torse.rotation.x=0.08;p.brasD.rotation.z=0.22;p.brasG.rotation.z=-0.22;
  p.brasD.rotation.x=-0.35;p.brasG.rotation.x=-0.35;p.tete.rotation.z=-0.05;};
ZMUS.lande.mel=ZMUS.lande.mel; // no-op
/* ---------- styles d'armes par classe (granularité d'équipement) ---------- */
const WSTYLES={
 ecorcheur:[
  {id:'w1',nom:'Hache de guerre',d:'Équilibrée',mod:{}},
  {id:'w2',nom:'Haches jumelles',d:'+3% crit, +3% vitesse, -3% dégâts',mod:{crit:0.03,spd:0.03,dmg:-0.03},dual:'hache'},
  {id:'w3',nom:'Grand fendoir',d:'+8% dégâts, -4% vitesse',mod:{dmg:0.08,spd:-0.04},big:1.3}],
 briseroc:[
  {id:'w1',nom:'Marteau & pavois',d:'-8% dégâts subis, -6% dégâts',mod:{dr:0.08,dmg:-0.06},shield:1},
  {id:'w2',nom:'Marteau à deux mains',d:'+8% dégâts, -3% vitesse',mod:{dmg:0.08,spd:-0.03},big:1.3},
  {id:'w3',nom:'Masses jumelles',d:'-6% recharges',mod:{cdr:0.06},dual:'marteau'}],
 arbaletriere:[
  {id:'w1',nom:'Arbalète de guerre',d:'Équilibrée',mod:{}},
  {id:'w2',nom:'Arbalète lourde',d:'+8% projectiles, +5% recharges',mod:{tg:{proj:1.08},cdr:-0.05},big:1.3},
  {id:'w3',nom:'Arbalète de poing & dague',d:'+5% vitesse, +3% crit',mod:{spd:0.05,crit:0.03},off:'dague',small:0.75}],
 flagellant:[
  {id:'w1',nom:'Fouet de fer',d:'Équilibré',mod:{}},
  {id:'w2',nom:'Fouet & crochet',d:'+8% contrôle',mod:{tg:{ctrl:1.08}},off:'crochet'},
  {id:'w3',nom:'Chaînes doubles',d:'+4% vitesse, +4% mêlée',mod:{spd:0.04,tg:{melee:1.04}},dual:'fouet'}],
 cendremage:[
  {id:'w1',nom:'Bâton de cendre',d:'Équilibré',mod:{}},
  {id:'w2',nom:'Sceptre & orbe',d:'-6% recharges',mod:{cdr:0.06},off:'orbe',small:0.6},
  {id:'w3',nom:'Bâton de guerre',d:'+6% dégâts',mod:{dmg:0.06},big:1.15}],
 ossuaire:[
  {id:'w1',nom:'Faux d\'os',d:'Équilibrée',mod:{}},
  {id:'w2',nom:'Fémurs jumeaux',d:'+4% vitesse, +3% crit',mod:{spd:0.04,crit:0.03},dual:'os'},
  {id:'w3',nom:'Crâne-sceptre',d:'Serviteurs +8%',mod:{minionM:1.08},small:0.85,crane:1}],
 voleur:[
  {id:'w1',nom:'Dagues jumelles',d:'-8% recharges, +4% vitesse',mod:{cdr:0.08,spd:0.04},dual:'dague',small:0.8},
  {id:'w2',nom:'Épées jumelles',d:'+8% mêlée, +3% crit',mod:{tg:{melee:1.08},crit:0.03},dual:'epee'},
  {id:'w3',nom:'Épée & dague',d:'+5% crit',mod:{crit:0.05},off:'dague',epee:1}]};
function wsList(){return WSTYLES[G.classe]||[{id:'w1',nom:'—',mod:{}}];}
function wsMod(){const l=wsList();return (l.find(s=>s.id===G.wstyle)||l[0]).mod||{};}
function wsDef(cl,id){const l=WSTYLES[cl]||[];return l.find(s=>s.id===id)||l[0]||{mod:{}};}
/* petites armes d'appoint */
function mkDague(sc=1){
  const g=new THREE.Group();
  const lame=new THREE.Mesh(new THREE.BoxGeometry(0.05*sc,0.42*sc,0.02),mat(0x8a8f8a,0.3));lame.position.y=-0.34*sc;
  const garde=new THREE.Mesh(new THREE.BoxGeometry(0.14*sc,0.03,0.04),mat(0x4a4038));garde.position.y=-0.12*sc;
  const poignee=new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.028,0.16*sc,5),mat(0x2a2018));poignee.position.y=-0.03;
  g.add(lame,garde,poignee);return g;
}
function mkEpee(sc=1){
  const g=new THREE.Group();
  const lame=new THREE.Mesh(new THREE.BoxGeometry(0.06*sc,0.9*sc,0.02),mat(0x9a9f9a,0.3));lame.position.y=-0.58*sc;
  const garde=new THREE.Mesh(new THREE.BoxGeometry(0.22*sc,0.035,0.05),mat(0x5a5048));garde.position.y=-0.12*sc;
  const pommeau=new THREE.Mesh(new THREE.SphereGeometry(0.04,5,5),mat(0x5a5048));pommeau.position.y=0.06;
  const poignee=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.18,5),mat(0x2a2018));poignee.position.y=-0.02;
  g.add(lame,garde,pommeau,poignee);return g;
}
function attachWeapons(mesh,classe,style,P,mainD,mainG){
  const st=style||{mod:{}};
  let w;
  if(classe==='voleur'){
    w=st.epee||st.dual==='epee'?mkEpee():mkDague(1.1);
  }else{
    w=buildWeapon(classe);
    if(st.big)w.scale.setScalar(st.big);
    if(st.small)w.scale.setScalar(st.small);
  }
  const GRIP={ecorcheur:0.45,briseroc:0.5,arbaletriere:0.3,flagellant:0.48,cendremage:0.22,ossuaire:0.36,voleur:0.02};
  w.position.set(0,(GRIP[classe]||0.3)*(st.big||1),0.05);
  w.userData.baseRx=(classe==='cendremage'||classe==='ossuaire')?0.16:0;
  w.rotation.x=w.userData.baseRx;
  mainD.add(w);
  mesh.userData.weapon=w;
  // main gauche : arme jumelle, appoint ou pavois
  let off=null;
  if(st.dual){
    off=classe==='voleur'?(st.dual==='epee'?mkEpee():mkDague()):buildWeapon(classe);
    if(classe!=='voleur')off.scale.setScalar(0.85);
    off.position.set(0,(GRIP[classe]||0.3)*0.85,0.05);
  }else if(st.off==='dague')      {off=mkDague(0.9);off.position.set(0,0.02,0.05);}
  else if(st.off==='crochet'){off=new THREE.Group();
    const c2=new THREE.Mesh(new THREE.TorusGeometry(0.12,0.03,5,10,4.2),mat(0x6e6f6a,0.35));
    c2.position.y=-0.28;c2.rotation.z=2.4;off.add(c2);
    const m2=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.3,4),mat(0x2a2018));m2.position.y=-0.1;off.add(m2);}
  else if(st.off==='orbe'){off=new THREE.Mesh(new THREE.SphereGeometry(0.11,8,8),
    new THREE.MeshStandardMaterial({color:0xe8853a,emissive:0xc85a10,emissiveIntensity:0.9}));
    off.position.set(0,-0.15,0.1);}
  else if(st.shield){off=new THREE.Group();
    const pav=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.75,0.07),mat(0x54544c,0.6));
    const umbo=new THREE.Mesh(new THREE.SphereGeometry(0.09,6,6),mat(0xd8b45a,0.5));umbo.position.z=0.06;
    pav.add(umbo);pav.position.set(0,-0.15,0.14);off.add(pav);}
  if(off)mainG.add(off);
  if(st.crane&&classe==='ossuaire'){
    const cr=new THREE.Mesh(new THREE.BoxGeometry(0.24,0.22,0.22),
      new THREE.MeshStandardMaterial({color:0xd8d2be,emissive:0x6a7a4a,emissiveIntensity:0.5}));
    cr.position.y=0.55;w.add(cr);}
}
