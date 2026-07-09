'use strict';
/* ---------- utilitaires ---------- */
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const rand=(a,b)=>a+Math.random()*(b-a);
const irand=(a,b)=>Math.floor(rand(a,b+1));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist2D=(a,b)=>{const dx=a.x-b.x,dz=a.z-b.z;return Math.sqrt(dx*dx+dz*dz);};
const el=id=>document.getElementById(id);
const pickR=a=>a[irand(0,a.length-1)];
/* ---------- conteneurs partagés ---------- */
const obstacles=[],torches=[],brumes=[],npcs=[],citizens=[];
const enemies=[],corpses=[],allies=[],projectiles=[],decals=[],anneaux=[],dmgNums=[],zonesFx=[],buffs=[],fxTemp=[];
const spawners=[];
const montureMeshes=[null,null,null,null];
/* ---------- stockage ---------- */
const store=(()=>{
  try{
    localStorage.setItem('mf-probe','1');localStorage.removeItem('mf-probe');
    return{
      persistant:true,
      async get(k){const v=localStorage.getItem(k);if(v===null)throw new Error('nokey');return{key:k,value:v};},
      async set(k,v){localStorage.setItem(k,String(v));return{key:k,value:v};},
      async delete(k){localStorage.removeItem(k);return{key:k,deleted:true};}};
  }catch(e){}
  if(window.storage&&window.storage.get)return Object.assign(Object.create(window.storage),{persistant:true});
  const mem={};return{
    persistant:false,
    async get(k){if(!(k in mem))throw new Error('nokey');return{key:k,value:mem[k]};},
    async set(k,v){mem[k]=v;return{key:k,value:v};},
    async delete(k){delete mem[k];return{key:k,deleted:true};}};
})();
const SAVE_KEY='moorfall-save-v8'; // ancien slot unique, migré vers la liste
const LIST_KEY='moorfall-persos-v1';
const charKey=id=>'moorfall-perso-'+id;
const newCharId=()=>'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
/* ---------- classes ---------- */
const CLASSES={
 ecorcheur:{nom:'Écorcheur',ic:'🪓',peau:0x8a7a62,habit:0x3a3226,arme:'hache',
  hp0:100,hpL:14,dmg0:10,dmgL:3.0,speed:6.0,mass:85,range:2.3,ranged:false,
  desc:'Hache lourde, arcs brutaux. Le corps-à-corps de référence.',phys:'Charges et ondes qui projettent en cercle.'},
 briseroc:{nom:'Brise-Roc',ic:'🔨',peau:0x7d7264,habit:0x2c3038,arme:'marteau',
  hp0:132,hpL:18,dmg0:9,dmgL:2.6,speed:5.2,mass:130,range:2.5,ranged:false,
  desc:'Un mur avec un marteau. Lent, massif, inarrêtable.',phys:'Envoie les corps au ciel, ou les attire tous vers lui.'},
 arbaletriere:{nom:'Arbalétrière',ic:'🏹',peau:0x93826a,habit:0x33402e,arme:'arbalete',
  hp0:85,hpL:11,dmg0:11,dmgL:3.2,speed:6.3,mass:70,range:14,ranged:true,projCol:0xb8a878,
  desc:'Carreaux de guerre à distance. Fragile mais mortelle.',phys:'Chaque carreau a une masse : les corps reculent, transpercés.'},
 flagellant:{nom:'Flagellant',ic:'⛓',peau:0x8f7d68,habit:0x40262a,arme:'fouet',
  hp0:95,hpL:13,dmg0:9,dmgL:2.8,speed:6.4,mass:75,range:3.2,ranged:false,
  desc:'Chaînes et lanières. Contrôle les corps comme des pantins.',phys:'Attrape un ennemi vivant et le jette sur les autres.'},
 cendremage:{nom:'Cendremage',ic:'🔥',peau:0x9a8a70,habit:0x2a2230,arme:'baton',
  hp0:78,hpL:10,dmg0:12,dmgL:3.4,speed:5.8,mass:65,range:13,ranged:true,projCol:0xd8783a,
  desc:'La cendre obéit. Explosions et bourrasques à distance.',phys:'Déflagrations qui soufflent les rangs entiers.'},
 ossuaire:{nom:'Ossuaire',ic:'💀',peau:0xa79b82,habit:0x22261e,arme:'os',
  hp0:88,hpL:12,dmg0:9,dmgL:2.7,speed:5.8,mass:68,range:12,ranged:true,projCol:0xd8d2be,
  desc:'Les morts lui doivent encore quelque chose.',phys:'Relève les cadavres en serviteurs, ou les fait détoner.'}};
/* ---------- spécialisations (niveau 10, T) ---------- */
const SPECS={
 ecorcheur:[
  {id:'boucher',nom:'Boucher',ic:'🔪',d:'Mêlée +25%, critique +6%. Le sang appelle le sang.',tg:{melee:1.25},crit:0.06},
  {id:'tectonique',nom:'Tectonique',ic:'🌋',d:'Zones +25%, force d\'impact +20%. La terre frappe avec vous.',tg:{aoe:1.25},impact:0.2},
  {id:'sanglier',nom:'Sanglier',ic:'🐗',d:'Mobilité +30%, vitesse +10%, recharges -8%. Ne s\'arrête jamais.',tg:{mob:1.3},spd:0.1,cdr:0.08}],
 briseroc:[
  {id:'bastion',nom:'Bastion',ic:'🛡',d:'Dégâts subis -20%, PV +15%. Le mur tient.',dr:0.2,hp:0.15},
  {id:'gravite',nom:'Gravité',ic:'🧲',d:'Contrôle +30%, impact +25%. Tout tombe vers vous.',tg:{ctrl:1.3},impact:0.25},
  {id:'marteau',nom:'Marteau',ic:'🔨',d:'Mêlée +25%, critique +4%. Un seul coup suffit souvent.',tg:{melee:1.25},crit:0.04}],
 arbaletriere:[
  {id:'franctireur',nom:'Franc-tireur',ic:'🎯',d:'Projectiles +25%, critique +7%. Une ligne, une mort.',tg:{proj:1.25},crit:0.07},
  {id:'artificiere',nom:'Artificière',ic:'💥',d:'Zones et explosions +30%. Tout finit par sauter.',tg:{aoe:1.3},impact:0.1},
  {id:'traqueuse',nom:'Traqueuse',ic:'🦊',d:'Vitesse +12%, recharges -10%, mobilité +25%.',spd:0.12,cdr:0.1,tg:{mob:1.25}}],
 flagellant:[
  {id:'bourreau',nom:'Bourreau',ic:'🩸',d:'Mêlée +20%, saignements +50%. La douleur dure.',tg:{melee:1.2,dot:1.5}},
  {id:'marionnettiste',nom:'Marionnettiste',ic:'🎭',d:'Contrôle +30%, impact +25%. Les corps sont des outils.',tg:{ctrl:1.3},impact:0.25},
  {id:'ecarlate',nom:'Écarlate',ic:'❣',d:'Vol de vie 8%, dégâts +8%. Ce qui coule vous revient.',ls:0.08,tg:{melee:1.08,ctrl:1.08}}],
 cendremage:[
  {id:'pyrolatre',nom:'Pyrolâtre',ic:'☄',d:'Projectiles +25%, critique +5%. La cendre vise juste.',tg:{proj:1.25},crit:0.05},
  {id:'tempetueux',nom:'Tempétueux',ic:'🌬',d:'Cônes +25%, impact +30%. Le vent décide.',tg:{cone:1.25},impact:0.3},
  {id:'cataclyste',nom:'Cataclyste',ic:'🌋',d:'Zones +30%. Là où vous regardez, plus rien.',tg:{aoe:1.3}}],
 ossuaire:[
  {id:'necrophore',nom:'Nécrophore',ic:'🧟',d:'Serviteurs +60% (dégâts, PV), maximum 4. Le troupeau grandit.',minion:1.6,maxMin:4},
  {id:'detonateur',nom:'Détonateur',ic:'☠',d:'Détonations et zones +30%, impact +15%. La chair est une mèche.',tg:{aoe:1.3},impact:0.15},
  {id:'perceur',nom:'Perceur',ic:'🦴',d:'Projectiles +25%, critique +6%. L\'os traverse tout.',tg:{proj:1.25},crit:0.06}]};
function curSpec(){
  const s=SPECS[G.classe].find(x=>x.id===G.spec)||{tg:{}};
  if(!EQ.legs.relique)return s;
  const a={...s,tg:{}};
  ['crit','spd','cdr','impact','hp','dr','ls'].forEach(k=>{if(s[k])a[k]=s[k]*1.5;});
  if(s.minion)a.minion=1+(s.minion-1)*1.5;
  if(s.tg)Object.entries(s.tg).forEach(([k,v])=>a.tg[k]=1+(v-1)*1.5);
  return a;
}
function curSub(){if(!G.subclass)return{tg:{}};
  const l=SUBCLASSES[G.classe]||[];return l.find(s=>s.id===G.subclass)||{tg:{}};}
/* ---------- état ---------- */
const G={charId:null,name:'Sans-nom',classe:'ecorcheur',lvl:1,xp:0,gold:15,potions:1,
  mounts:{t1:false,t2:false,t3:false},activeMount:0,flying:false,altitude:0,
  quests:{},kills:0,started:false,muted:false,playTime:0,camMode:'arpg',
  visited:{capitale:false},spec:null,subclass:null,slots:[null,null,null,null,null,null],cds:{},showHp:true,mats:{os:0,cendre:0,peau:0},wstyle:'w1',dashCharge:2,
  inv:[],equip:{arme:null,tete:null,torse:null,jambes:null,amulette:null},tpl:{A:null,B:null},
  talents:{},secret:{lit:0,open:false,whisper:false,peuple:false,porteVue:false,key:false,nid:false}};
const CL=()=>CLASSES[G.classe];
const xpNext=l=>25+l*9;
const XP_RATE=2.25;
/* ---------- talents : aides ---------- */
function talRank(id){return G.talents[id]||0;}
function talSpentCol(col){let s=0;TALENTS[col].forEach(t=>s+=talRank(t.id));return s;}
function talSpent(){return talSpentCol('guerre')+talSpentCol('endurance')+talSpentCol('ruse');}
function talTotal(){return Math.max(0,G.lvl-9);}
function talDispo(){return talTotal()-talSpent();}
/* ---------- objets : 5 raretés, tables graduelles ---------- */
const RARITES=[{n:'Blanc',c:'r0',m:1,naf:1},{n:'Vert',c:'r1',m:1.4,naf:2},{n:'Bleu',c:'r2',m:1.9,naf:3},
  {n:'Violet',c:'r3',m:2.5,naf:4},{n:'Légendaire',c:'r4',m:3.2,naf:5}];
const RAR_COLORS=[0x9a9382,0x4aa54a,0x3a7ad8,0x9a4ad8,0xe8963a];
const SLOTS_IT=['arme','tete','torse','jambes','amulette'];
const SLOT_NOMS={arme:'Arme',tete:'Tête',torse:'Torse',jambes:'Jambes',amulette:'Amulette'};
const BASES={arme:['Fendoir','Croc','Aiguillon','Fléau'],tete:['Heaume','Capuche','Couronne d\'os','Masque'],
  torse:['Cuirasse','Haubert','Suaire','Carapace'],jambes:['Jambières','Chausses','Tibias ferrés','Guêtres'],
  amulette:['Amulette','Phalange','Relique','Fétiche']};
const SUFFIXES=['du Charnier','de la Veillée','des Crêtes','saumâtre','du Pendu','cendré','de Valcierge','de l\'Ychor','blafard','tellurique'];
const AFFIXES=[
 {k:'dmg',n:'Dégâts',b:0.9,pct:false},{k:'hp',n:'Points de vie',b:3.2,pct:false},
 {k:'spd',n:'Vitesse',b:0.0012,pct:true},{k:'crit',n:'Chance critique',b:0.0011,pct:true},
 {k:'impact',n:'Force d\'impact',b:0.0042,pct:true},{k:'cdr',n:'Réduction de recharge',b:0.0018,pct:true},
 {k:'aoe',n:'Dégâts de zone',b:0.0034,pct:true},{k:'proj',n:'Dégâts des projectiles',b:0.0034,pct:true},
 {k:'melee',n:'Dégâts de mêlée',b:0.0034,pct:true},{k:'cone',n:'Dégâts de cône',b:0.0034,pct:true},
 {k:'ctrl',n:'Dégâts de contrôle',b:0.0034,pct:true},{k:'invoc',n:'Puissance des serviteurs',b:0.0034,pct:true},
 {k:'ls',n:'Vol de vie',b:0.0009,pct:true}];
const LEGENDS=[
 {k:'echo',n:'Écho',d:'15% de chances de ne pas déclencher la recharge'},
 {k:'moisson',n:'Moisson',d:'Chaque mise à mort réduit vos recharges de 1 s'},
 {k:'nova',n:'Nova',d:'Vos critiques déclenchent une onde de choc'},
 {k:'vampirisme',n:'Vampirisme',d:'+8% de vol de vie'},
 {k:'colosse',n:'Colosse',d:'+25% de force d\'impact'},
 {k:'celerite',n:'Célérité',d:'+12% de vitesse de déplacement'}];
/* Reliques de classe : un butin d'exception, lié à la voie choisie au premier jour.
   Leur pouvoir grandit avec la spécialisation : les dons de la spé sont amplifiés de moitié. */
const RELIQUES={
 ecorcheur:{nom:'Ivresse Rouge',d:'Le premier sang appelle le second.'},
 briseroc:{nom:'Serment du Socle',d:'La montagne se souvient de qui la porte.'},
 arbaletriere:{nom:'Œil de la Veuve Blanche',d:'Une ligne, une mort — jamais deux.'},
 flagellant:{nom:'Pénitence Tressée',d:'Chaque nœud est une dette payée.'},
 cendremage:{nom:'Cœur de Fournaise',d:'La cendre n\'oublie pas d\'avoir brûlé.'},
 ossuaire:{nom:'Vertèbre du Premier Mort',d:'Tout troupeau retourne à son berger.'}};
const RELIQUE_D='Les dons de votre spécialisation sont amplifiés de moitié';
let itemSeq=1;
/* Comme les premières zones de WoW : le blanc domine longtemps, le vert
   apparaît vers le niveau 5, le bleu reste un événement avant le 15,
   le violet n'existe pas avant les zones 30+, le légendaire est un mythe pré-50. */
function rarRoll(mlvl){
  const pLeg =mlvl>=50?clamp((mlvl-49)*0.0004,0,0.008):0;
  const pVio =mlvl>=30?clamp((mlvl-29)*0.0012,0,0.035):0;
  const pBleu=mlvl>=15?clamp((mlvl-14)*0.004,0,0.10):0;
  const pVert=mlvl>=5?clamp((mlvl-4)*0.02,0,0.32):0;
  const r=Math.random();
  if(r<pLeg)return 4;
  if(r<pLeg+pVio)return 3;
  if(r<pLeg+pVio+pBleu)return 2;
  if(r<pLeg+pVio+pBleu+pVert)return 1;
  return 0;
}
function bossMinRar(mlvl){return mlvl>=60?3:mlvl>=30?2:1;}
function genItem(mlvl,boss,force){
  let r=force&&force.rar!==undefined?force.rar:rarRoll(mlvl);
  if(boss){r=Math.max(r,bossMinRar(mlvl));
    if(mlvl>=60&&Math.random()<0.25)r=4;
    else if(mlvl>=45&&Math.random()<0.18)r=Math.max(r,3);}
  const R=RARITES[r],slot=force&&force.slot?force.slot:pickR(SLOTS_IT);
  const tRoll=Math.random(),tier=tRoll<0.6?1:tRoll<0.9?2:3;
  const tMult=[0,1,1.16,1.34][tier];
  const it={id:'it'+(itemSeq++),slot,rar:r,ilvl:mlvl,tier,tMult,af:{},leg:null,
    nom:pickR(BASES[slot])+' '+pickR(SUFFIXES)};
  const pool=[...AFFIXES];
  for(let i=0;i<R.naf&&pool.length;i++){
    const a=pool.splice(irand(0,pool.length-1),1)[0];
    it.af[a.k]=+( a.b*(mlvl*0.55+2.2)*R.m*tMult*rand(0.8,1.2) ).toFixed(a.pct?4:0);}
  if(r===4)it.leg=pickR(LEGENDS).k;
  return it;
}
function genRelique(mlvl){
  const it=genItem(mlvl,false,{rar:4,slot:'amulette'});
  it.leg='relique';it.cls=G.classe;
  it.nom=RELIQUES[G.classe].nom;
  return it;
}
function itemVal(it){return Math.round((it.ilvl*0.8+3)*RARITES[it.rar].m);}
/* Puissance : somme des affixes normalisés par leur base — comparable entre objets,
   croît avec le niveau, la rareté, le palier et la qualité des jets. */
function itemScore(it){
  let s=0;Object.entries(it.af).forEach(([k,v])=>{const a=AFFIXES.find(x=>x.k===k);if(a)s+=v/a.b;});
  return Math.round(s*(it.leg?1.15:1));
}
const EQ={dmg:0,hp:0,spd:0,crit:0,impact:0,cdr:0,aoe:0,proj:0,melee:0,cone:0,ctrl:0,invoc:0,ls:0,legs:{}};
function recomputeEQ(){
  Object.keys(EQ).forEach(k=>{if(k!=='legs')EQ[k]=0;});EQ.legs={};
  Object.values(G.equip).forEach(it=>{if(!it)return;
    Object.entries(it.af).forEach(([k,v])=>EQ[k]+=v);
    if(it.leg)EQ.legs[it.leg]=true;});
  if(EQ.legs.vampirisme)EQ.ls+=0.08;
  if(EQ.legs.colosse)EQ.impact+=0.25;
  if(EQ.legs.celerite)EQ.spd+=0.12;
}
/* ---------- stats dérivées (équipement + spé + sous-classe + talents) ---------- */
const maxHp=()=>Math.round((CL().hp0+G.lvl*CL().hpL+EQ.hp)
  *(1+(curSpec().hp||0)+(curSub().hp||0)+0.03*talRank('e1')+0.02*talRank('e5')+(talRank('e6')?0.12:0)));
const baseDmg=()=>Math.round((CL().dmg0+G.lvl*CL().dmgL+EQ.dmg)
  *(1+0.02*talRank('g1')+0.03*talRank('g5')+(talRank('g6')?0.10:0)+(curSub().dmg||0)+(wsMod().dmg||0)));
const statSpd=()=>CL().speed*(1+EQ.spd+(curSpec().spd||0)+(curSub().spd||0)+(wsMod().spd||0)+0.02*talRank('r1')+(talRank('r6')?0.08:0))*buffMult('spd');
const statCrit=()=>0.08+EQ.crit+(curSpec().crit||0)+(curSub().crit||0)+(wsMod().crit||0)+0.01*talRank('g2')+(talRank('g6')?0.05:0);
const statImpact=()=>(1+EQ.impact+(curSpec().impact||0)+(curSub().impact||0)+0.04*talRank('g3'))*buffMult('impact');
const cdrMult=()=>1-Math.min(0.55,EQ.cdr+(curSpec().cdr||0)+(curSub().cdr||0)+(wsMod().cdr||0)+0.03*talRank('g4')+0.02*talRank('r3'));
const lsTotal=()=>EQ.ls+(curSpec().ls||0)+(curSub().ls||0)+0.01*talRank('r4');
function tagMult(tags){
  let m=buffMult('dmg');const sp=curSpec(),sb=curSub();
  tags.forEach(t=>{
    if(t==='aoe')m*=1+EQ.aoe;if(t==='proj')m*=1+EQ.proj;if(t==='melee')m*=1+EQ.melee;
    if(t==='cone')m*=1+EQ.cone;if(t==='ctrl')m*=1+EQ.ctrl;if(t==='invoc')m*=1+EQ.invoc;
    if(sp.tg&&sp.tg[t])m*=sp.tg[t];
    if(sb.tg&&sb.tg[t])m*=sb.tg[t];
    const wt=wsMod().tg;if(wt&&wt[t])m*=wt[t];});
  return m;
}
function maxMinions(){return (curSpec().maxMin||3)+(curSub().maxMin||0);}
function minionMult(){return (curSpec().minion||1)*(curSub().minion||1)*(wsMod().minionM||1)*(1+0.1*talRank('r5'));}
function addBuff(kind,mult,dur){buffs.push({kind,mult,t:dur});}
function buffMult(kind){let m=1;buffs.forEach(b=>{if(b.kind===kind)m*=b.mult;});return m;}
function dmgReduction(){
  let d=1-(curSpec().dr||0)-(curSub().dr||0)-(wsMod().dr||0)-0.02*talRank('e2')-0.01*talRank('e5')-(talRank('e6')?0.08:0);
  d/=buffMult('armor');return clamp(d,0.2,1.5);}
