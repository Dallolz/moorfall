'use strict';
/* ---------- sous-classes (niveau 50, chaîne de quêtes du Maître d'armes) ---------- */
const SUBCLASSES={
 ecorcheur:[
  {id:'berserker',nom:'Berserker',ic:'😡',d:'+20% dégâts, +10% vitesse, mais +10% dégâts subis. La rage rend rapide et imprudent.',
   dmg:0.2,spd:0.1,dr:-0.1},
  {id:'colossegu',nom:'Colosse de guerre',ic:'⚔',d:'Espadon à deux mains : mêlée +20%, PV +15%, -5% vitesse. Chaque coup est une phrase complète.',
   tg:{melee:1.2},hp:0.15,spd:-0.05}],
 briseroc:[
  {id:'juge',nom:'Juge-Marteau',ic:'⚖',d:'Mêlée +30%, critique +5%. Une cible, une sentence.',tg:{melee:1.3},crit:0.05},
  {id:'tellurgiste',nom:'Tellurgiste',ic:'🌍',d:'Contrôle +30%, zones +15%, impact +15%. La croûte terrestre est votre arme.',
   tg:{ctrl:1.3,aoe:1.15},impact:0.15}],
 arbaletriere:[
  {id:'couleuvrine',nom:'Couleuvrinière',ic:'💣',d:'Arbalète de siège à deux mains : projectiles +35%, mais recharges +15%. Lent. Définitif.',
   tg:{proj:1.35},cdr:-0.15},
  {id:'jumelles',nom:'Jumelles',ic:'🔫',d:'Une petite arbalète dans chaque main : recharges -18%, vitesse +5%, dégâts -8%. Un déluge continu.',
   cdr:0.18,spd:0.05,dmg:-0.08}],
 flagellant:[
  {id:'geolier',nom:'Geôlier',ic:'🔒',d:'Contrôle +35%, impact +20%. Personne ne quitte la cour.',tg:{ctrl:1.35},impact:0.2},
  {id:'derviche',nom:'Derviche écarlate',ic:'🌪',d:'Mêlée +15%, recharges -10%, vol de vie +4%. La toupie qui saigne.',
   tg:{melee:1.15},cdr:0.1,ls:0.04}],
 cendremage:[
  {id:'fournaise',nom:'Cœur de fournaise',ic:'🔥',d:'Zones +25%, projectiles +15%. Le feu n\'a pas d\'opinion, seulement un appétit.',
   tg:{aoe:1.25,proj:1.15}},
  {id:'tempestaire',nom:'Tempestaire',ic:'🌀',d:'Cônes +35%, impact +35%, recharges -10%. Le vent décide qui reste debout.',
   tg:{cone:1.35},impact:0.35,cdr:0.1}],
 ossuaire:[
  {id:'tombes',nom:'Seigneur des Tombes',ic:'⚰',d:'Serviteurs +40%, deux serviteurs de plus. Vous ne marchez plus jamais seul.',
   minion:1.4,maxMin:2},
  {id:'moissonneur',nom:'Moissonneur',ic:'🌾',d:'Mêlée +25%, zones +15%, vol de vie +5%. La faux revient toujours pleine.',
   tg:{melee:1.25,aoe:1.15},ls:0.05}]};
const SUBSPELLS={
 berserker:[
  {i:'sb01',sc:'berserker',n:'Rage rouge',ic:'😡',l:50,cd:20,tg:['melee'],t:'buff',p:{k:'dmg',m:1.5,dur:8},d:'+50% dégâts, 8 s'},
  {i:'sb02',sc:'berserker',n:'Moulinet furieux',ic:'🌪',l:55,cd:9,tg:['melee','aoe'],t:'melee',p:{r:4,m:1.9,f:520,arc:-1},d:'360° enragé'},
  {i:'sb03',sc:'berserker',n:'Carnage',ic:'🩸',l:60,cd:14,tg:['melee','dot'],t:'melee',p:{r:3,m:4.5,f:800,dot:1},d:'×4,5 — le sol boit'}],
 colossegu:[
  {i:'sc01',sc:'colossegu',n:'Taille de l\'espadon',ic:'⚔',l:50,cd:8,tg:['melee','cone'],t:'cone',p:{r:6,m:2.4,f:800},d:'Fauche un demi-cercle'},
  {i:'sc02',sc:'colossegu',n:'Choc du colosse',ic:'💥',l:55,cd:12,tg:['aoe'],t:'aoe',p:{r:6,m:2,f:900,up:1},d:'Tout décolle'},
  {i:'sc03',sc:'colossegu',n:'Verdict',ic:'⚖',l:60,cd:16,tg:['melee'],t:'melee',p:{r:3.2,m:5,f:1200,up:0.8},d:'×5. Sans appel.'}],
 juge:[
  {i:'sj01',sc:'juge',n:'Sentence',ic:'⚖',l:50,cd:10,tg:['melee'],t:'melee',p:{r:3,m:4,f:900},d:'×4 sur une cible'},
  {i:'sj02',sc:'juge',n:'Marteau-comète',ic:'☄',l:55,cd:13,tg:['aoe'],t:'aoe',p:{r:4.5,m:3,f:900,off:6,up:0.8},d:'Impact à distance'},
  {i:'sj03',sc:'juge',n:'Jugement dernier',ic:'🔨',l:60,cd:18,tg:['melee'],t:'melee',p:{r:3.4,m:6,f:1400,up:1.4},d:'×6 — orbite basse garantie'}],
 tellurgiste:[
  {i:'st01',sc:'tellurgiste',n:'Faille',ic:'🌋',l:50,cd:12,tg:['aoe','ctrl'],t:'zone',p:{off:5,r:4,dur:6,m:0.8,f:300,slow:2},d:'Le sol s\'ouvre'},
  {i:'st02',sc:'tellurgiste',n:'Mâchoire de pierre',ic:'🧲',l:55,cd:15,tg:['ctrl'],t:'pull',p:{r:18,m:0.8,f:1000},d:'Attraction continentale'},
  {i:'st03',sc:'tellurgiste',n:'Continent brisé',ic:'🌍',l:60,cd:20,tg:['aoe'],t:'aoe',p:{r:10,m:2.6,f:1100,up:0.9},d:'La carte change'}],
 couleuvrine:[
  {i:'sk01',sc:'couleuvrine',n:'Carreau de bombarde',ic:'💣',l:50,cd:10,tg:['proj'],t:'proj',p:{m:5,f:1400,sp:26,pierce:2},d:'Un obus. Lent. Terminal.'},
  {i:'sk02',sc:'couleuvrine',n:'Mise en batterie',ic:'🎯',l:55,cd:20,tg:['proj'],t:'buff',p:{k:'dmg',m:1.5,dur:6},d:'+50% dégâts, 6 s'},
  {i:'sk03',sc:'couleuvrine',n:'Perce-monde',ic:'🌐',l:60,cd:18,tg:['proj'],t:'proj',p:{m:7,f:1800,sp:30,pierce:12},d:'×7, traverse douze corps'}],
 jumelles:[
  {i:'sm01',sc:'jumelles',n:'Double gâchette',ic:'🔫',l:50,cd:3,tg:['proj'],t:'proj',p:{m:1.2,f:300,sp:32,count:3,spread:0.05},d:'Trois carreaux, recharge courte'},
  {i:'sm02',sc:'jumelles',n:'Déluge de fer',ic:'🌧',l:55,cd:10,tg:['proj'],t:'proj',p:{m:0.8,f:340,sp:30,count:10,spread:0.14},d:'Dix carreaux'},
  {i:'sm03',sc:'jumelles',n:'Danse des gâchettes',ic:'💃',l:60,cd:16,tg:['proj'],t:'buff',p:{k:'dmg',m:1.3,dur:8},d:'+30% dégâts, 8 s'}],
 geolier:[
  {i:'sg01',sc:'geolier',n:'Rafle',ic:'🪤',l:50,cd:11,tg:['ctrl'],t:'pull',p:{r:10,m:0.5,f:800,slow:3},d:'Tous au centre, entravés'},
  {i:'sg02',sc:'geolier',n:'Cage de chaînes',ic:'🔒',l:55,cd:15,tg:['ctrl'],t:'zone',p:{r:6,dur:8,m:0.5,f:150,slow:3},d:'Personne ne sort'},
  {i:'sg03',sc:'geolier',n:'Pendaison',ic:'🪢',l:60,cd:8,tg:['ctrl'],t:'grab',p:{v:50},d:'Le corps part comme un boulet'}],
 derviche:[
  {i:'sd01',sc:'derviche',n:'Toupie sanglante',ic:'🌪',l:50,cd:5,tg:['melee','aoe','dot'],t:'melee',p:{r:3.6,m:1.6,f:380,arc:-1,dot:1},d:'360° rapide, saigne'},
  {i:'sd02',sc:'derviche',n:'Ouragan pourpre',ic:'🩸',l:55,cd:10,tg:['melee','aoe','dot'],t:'melee',p:{r:5,m:2,f:480,arc:-1,dot:1},d:'Large et affamé'},
  {i:'sd03',sc:'derviche',n:'Saignée totale',ic:'💉',l:60,cd:13,tg:['cone','dot'],t:'cone',p:{r:7,m:2.4,f:500,dot:1},d:'Le cône qui vide'}],
 fournaise:[
  {i:'sf01',sc:'fournaise',n:'Boule de magma',ic:'🌋',l:50,cd:9,tg:['proj','aoe'],t:'proj',p:{m:3.5,f:700,sp:16,explode:{r:4,m:2,f:900}},d:'Lente, catastrophique'},
  {i:'sf02',sc:'fournaise',n:'Colonne de feu',ic:'🔥',l:55,cd:13,tg:['aoe'],t:'aoe',p:{r:4,m:3.2,f:800,off:7,up:1},d:'Le ciel descend'},
  {i:'sf03',sc:'fournaise',n:'Soleil mourant',ic:'☀',l:60,cd:22,tg:['aoe'],t:'aoe',p:{r:12,m:3.5,f:1300,up:0.9},d:'Douze mètres de fin du monde'}],
 tempestaire:[
  {i:'sv01',sc:'tempestaire',n:'Cisaille de vent',ic:'🌬',l:50,cd:8,tg:['cone','ctrl'],t:'cone',p:{r:8,m:1.2,f:1100},d:'Cône qui balaie tout'},
  {i:'sv02',sc:'tempestaire',n:'Œil du cyclone',ic:'🌀',l:55,cd:13,tg:['ctrl'],t:'pull',p:{r:10,m:0.4,f:700},d:'Le calme au centre, c\'est vous'},
  {i:'sv03',sc:'tempestaire',n:'Ouragan',ic:'🌪',l:60,cd:18,tg:['aoe','ctrl'],t:'zone',p:{r:7,dur:8,m:0.6,f:500,slow:1.5},d:'Zone de vents violents'}],
 tombes:[
  {i:'sq01',sc:'tombes',n:'Ost funèbre',ic:'⚰',l:50,cd:14,tg:['invoc'],t:'raise',p:{count:3},d:'Trois cadavres se lèvent'},
  {i:'sq02',sc:'tombes',n:'Communion',ic:'🕯',l:55,cd:20,tg:['invoc'],t:'heal',p:{pct:0.25},d:'Les morts vous soignent : 25% PV'},
  {i:'sq03',sc:'tombes',n:'Réveil du charnier',ic:'💀',l:60,cd:22,tg:['invoc'],t:'raise',p:{count:4,strong:1},d:'Quatre serviteurs renforcés'}],
 moissonneur:[
  {i:'sw01',sc:'moissonneur',n:'Grande Faux',ic:'🌾',l:50,cd:7,tg:['melee','aoe'],t:'melee',p:{r:4.5,m:2,f:500,arc:-1},d:'Moisson large'},
  {i:'sw02',sc:'moissonneur',n:'Récolte',ic:'🌙',l:55,cd:11,tg:['melee','aoe','dot'],t:'melee',p:{r:5.5,m:2.6,f:600,arc:-1,dot:1},d:'Rien ne repousse'},
  {i:'sw03',sc:'moissonneur',n:'L\'Heure due',ic:'⏳',l:60,cd:16,tg:['aoe'],t:'aoe',p:{r:8,m:3,f:900,up:0.7},d:'Tout le monde paie'}]};
function choisirSub(id){
  if(G.lvl<50||qState('s3').state!=='done')return;
  if(G.subclass&&G.subclass!==id){
    if(G.gold<200){toast('Changer de voie : 200 or','Pas assez d\'or');return;}
    G.gold-=200;}
  G.subclass=id;sfx('lvl');
  const sc=(SUBCLASSES[G.classe]||[]).find(s=>s.id===id);
  toast('Sous-classe : '+sc.nom,'Trois sorts dédiés vous attendent au grimoire (K)');
  recomputeEQ();majApparence();majHud();ouvrirSpe();save();
}
/* ---------- arbre de talents (P) : 1 point par niveau dès le 10 ---------- */
const TALENTS={
 guerre:[
  {id:'g1',n:'Brutalité',max:5,d:'+2% dégâts par rang'},
  {id:'g2',n:'Précision',max:5,d:'+1% de critique par rang'},
  {id:'g3',n:'Poigne',max:5,d:'+4% de force d\'impact par rang'},
  {id:'g4',n:'Célérité martiale',max:3,d:'-3% de recharge par rang'},
  {id:'g5',n:'Sauvagerie',max:3,d:'+3% dégâts par rang'},
  {id:'g6',n:'⭑ Exécuteur',max:1,d:'Clé de voûte : +10% dégâts, +5% critique'}],
 endurance:[
  {id:'e1',n:'Vigueur',max:5,d:'+3% PV par rang'},
  {id:'e2',n:'Peau tannée',max:5,d:'-2% dégâts subis par rang'},
  {id:'e3',n:'Sang épais',max:3,d:'Fioles et soins +10% par rang'},
  {id:'e4',n:'Ressac',max:3,d:'Chaque mise à mort rend 1% PV par rang'},
  {id:'e5',n:'Inébranlable',max:3,d:'+2% PV et -1% subis par rang'},
  {id:'e6',n:'⭑ Monolithe',max:1,d:'Clé de voûte : +12% PV, -8% dégâts subis'}],
 ruse:[
  {id:'r1',n:'Pas léger',max:3,d:'+2% vitesse par rang'},
  {id:'r2',n:'Chasseur d\'or',max:3,d:'+5% d\'or par rang'},
  {id:'r3',n:'Maître des sorts',max:5,d:'-2% de recharge par rang'},
  {id:'r4',n:'Vampirique',max:3,d:'+1% de vol de vie par rang'},
  {id:'r5',n:'Meneur d\'ombres',max:3,d:'Serviteurs +10% par rang'},
  {id:'r6',n:'⭑ Opportuniste',max:1,d:'Clé de voûte : +8% vitesse, les kills réduisent vos recharges de 0,5 s'}]};
const TAL_COLS={guerre:'Guerre',endurance:'Endurance',ruse:'Ruse'};
function talUp(col,id){
  const t=TALENTS[col].find(x=>x.id===id);
  const tier=TALENTS[col].indexOf(t);
  if(talDispo()<=0||talRank(id)>=t.max)return;
  if(talSpentCol(col)<tier*3){toast('Rang verrouillé','Dépensez '+(tier*3)+' points dans cette branche d\'abord');return;}
  G.talents[id]=talRank(id)+1;sfx('or');
  majHud();ouvrirTalents();save();
}
function talReset(){
  const cout=10+G.lvl;
  if(G.gold<cout){toast('Réinitialisation : '+cout+' or','Pas assez d\'or');return;}
  G.gold-=cout;G.talents={};sfx('lvl');
  majHud();ouvrirTalents();save();
}
function ouvrirTalents(){
  let html=`<h2>Talents</h2>
  <div class="role">Points disponibles : <b style="color:var(--laiton)">${talDispo()}</b> / ${talTotal()} — 1 point par niveau dès le 10.
  Chaque rangée exige 3 points investis dans la branche.</div><div class="tal-wrap">`;
  Object.entries(TALENTS).forEach(([col,list])=>{
    html+=`<div class="tal-col"><h3>${TAL_COLS[col]} <span style="font-size:11px;color:var(--os-dim)">(${talSpentCol(col)} pts)</span></h3>`;
    list.forEach((t,tier)=>{
      const r=talRank(t.id),locked=talSpentCol(col)<tier*3;
      html+=`<div class="tal-node ${locked?'lock':''} ${r>=t.max?'full':''}">
        <div class="tn">${t.n} <span class="tr">${r}/${t.max}</span></div>
        <div class="td">${t.d}</div>
        ${r<t.max&&!locked&&talDispo()>0?`<button class="btn mini" onclick="MOOR.talUp('${col}','${t.id}')">+1</button>`:''}
        ${locked?`<div class="td" style="color:#6a5c3a">🔒 ${tier*3} pts requis</div>`:''}
      </div>`;});
    html+=`</div>`;});
  html+=`</div><br><button class="btn mini ghost" onclick="MOOR.talReset()">Réinitialiser (${10+G.lvl} or)</button>
  <button class="btn ghost" onclick="MOOR.fermer()">Fermer (P)</button>`;
  pan.innerHTML=html;pan.style.display='block';panOuvert='tal';
}
/* ---------- spécialisation & sous-classe (T) — remplace la version simple ---------- */
function ouvrirSpe(){
  let html=`<h2>Voies du personnage</h2>`;
  if(G.lvl<10){
    html+=`<p>Les spécialisations s'ouvrent au <b>niveau 10</b>. La lande jugera d'abord votre endurance.</p>`;
  }else{
    html+=`<h3>Spécialisation</h3><div class="role">Choix gratuit la première fois — respécialisation : 25 or.</div>`;
    SPECS[G.classe].forEach(s=>{
      html+=`<div class="spec-carte ${G.spec===s.id?'sel':''}" onclick="MOOR.choisirSpec('${s.id}')">
        <div class="sn">${s.ic} ${s.nom} ${G.spec===s.id?'✓':''}</div><div class="sd">${s.d}</div></div>`;});
  }
  html+=`<h3>Sous-classe (niveau 50)</h3>`;
  if(G.lvl<50){
    html+=`<p style="font-size:12.5px">Au niveau 50, le <b>Maître d'armes Aldren</b>, à Valcierge, proposera une épreuve en trois quêtes réservée aux ${CL().nom}s. L'accomplir ouvre deux voies définitives.</p>`;
  }else if(qState('s3').state!=='done'){
    html+=`<p style="font-size:12.5px">⚔ <b>L'épreuve est ouverte.</b> Voyez le Maître d'armes Aldren à Valcierge et achevez sa chaîne de quêtes (${['s1','s2','s3'].filter(q=>qState(q).state==='done').length}/3).</p>`;
  }else{
    (SUBCLASSES[G.classe]||[]).forEach(s=>{
      html+=`<div class="spec-carte ${G.subclass===s.id?'sel':''}" onclick="MOOR.choisirSub('${s.id}')">
        <div class="sn">${s.ic} ${s.nom} ${G.subclass===s.id?'✓':''}</div><div class="sd">${s.d}</div>
        <div class="sd" style="color:var(--laiton)">Sorts dédiés : ${SUBSPELLS[s.id].map(x=>x.ic+' '+x.n).join(' · ')}</div></div>`;});
    if(G.subclass)html+=`<div class="role">Changer de sous-classe coûte 200 or.</div>`;
  }
  if(G.lvl>=10){
    html+=`<h3>Modèles de barre</h3>`;
    SPECS[G.classe].forEach(s=>{
      html+=`<button class="btn mini" onclick="MOOR.applyTemplate('${s.id}')">${s.ic} Build ${s.nom}</button>`;});
    html+=`<h3>Barres personnalisées</h3>
    <button class="btn mini" onclick="MOOR.saveTpl('A')">Sauver en A</button>
    <button class="btn mini" onclick="MOOR.applyTpl('A')">Charger A</button>
    <button class="btn mini" onclick="MOOR.saveTpl('B')">Sauver en B</button>
    <button class="btn mini" onclick="MOOR.applyTpl('B')">Charger B</button>`;
  }
  html+=`<br><button class="btn ghost" onclick="MOOR.fermer()">Fermer (T)</button>`;
  pan.innerHTML=html;pan.style.display='block';panOuvert='spe';
}
/* ---------- apparence : l'équipement s'affiche sur le personnage ---------- */
let playerGear=[];
function gearMat(r){return new THREE.MeshStandardMaterial({color:RAR_COLORS[r],
  roughness:0.45,metalness:0.5,emissive:r===4?0x7a4208:(r===3?0x2a1040:0x000000)});}
