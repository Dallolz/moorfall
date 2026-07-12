'use strict';
/* ---------- peuplement : tables par zone + générateur déterministe ----------
   Module PARTAGÉ client/serveur : script classique côté navigateur (globales),
   require() CJS côté Node (module.exports en bas). Données + maths pures,
   aucune dépendance THREE ni DOM. Même graine => même monde des deux côtés. */
const SPAWN_SEED=20260709;
/* monde ×1.5 (v25) : toutes les coordonnées monde sont agrandies d'un facteur
   1,5 — les packs respirent, on ne tire plus 3 groupes d'un coup. */
/* packs fixes : sites de quêtes et boss (positions historiques ×1.5) */
const SPAWN_FIXED=[
 {type:'creux',lvl:3,x:-36,z:156,n:5,r:11},
 {type:'creux',lvl:12,x:93,z:237,n:4,r:8},
 {type:'berger',lvl:14,x:105,z:225,n:1,r:2},
 {type:'mere',lvl:38,x:282,z:111,n:1,r:2},
 {type:'pendeur',lvl:58,x:-303,z:-93,n:1,r:2},
 {type:'roi',lvl:70,x:93,z:-312,n:1,r:2},
 /* vouivres en maraude autour du Nid (150,-132) — le nid lui-même reste vierge */
 {type:'vouivre',lvl:68,x:171,z:-153,n:1,r:4},
 {type:'vouivre',lvl:69,x:126,z:-156,n:1,r:4}];
/* par zone : centre/rayon, tranche de niveaux, nombre de packs,
   types pondérés [type, poids]. Niveau croissant en s'éloignant de la capitale. */
const SPAWN_ZONES=[
 {id:'lande',x:0,z:180,r:142,lvl:[2,19],packs:66,
  types:[['creux',20],['traqueur',13],['rodeuse',11],['brule',9],
         ['loup',14],['cerf',8],['limon',12],['chancre',13]]},
 {id:'fange',x:225,z:90,r:120,lvl:[21,37],packs:46,
  types:[['noyeur',15],['gonfle',10],['sangsue',11],['porteur',7],
         ['crapaud',12],['glub',10],['fille',8],['limon_pique',10],['taureau',7],['mycomage',8],['mycon',6]]},
 {id:'foret',x:-240,z:-60,r:120,lvl:[41,57],packs:46,
  types:[['pendu',16],['hurleur',9],['echassier',11],['veuve',11],
         ['spectre',14],['crane',11],['chancre_mur',10],['renard',8],['loup_noir',5],['roi_chancre',8]]},
 {id:'cretes',x:90,z:-255,r:120,lvl:[60,70],packs:44,
  types:[['ossature',14],['colosse',9],['moine',11],['choeur',9],
         ['gargouille',12],['demon',10],['demon_cendre',8],['ogre',9],['goule',9],['loup_cendre',5],['blafard',6]]}];
/* sites thématiques : des tanières denses, graduées en couleur/niveau/rareté —
   la même famille de créatures, adaptée à son coin de monde. */
const SPAWN_SITES=[
 {id:'spores',x:285,z:60,r:24, // le Rond des Spores — sud-est de la Fange
  packs:[
   {type:'mycon',lvl:22,n:[3,5]},{type:'mycon',lvl:23,n:[3,5]},
   {type:'mycon_rouge',lvl:26,n:[2,4]},{type:'mycon_rouge',lvl:27,n:[2,3]},
   {type:'mycomage',lvl:29,n:[2,3]},
   {type:'mycon_noir',lvl:31,n:[2,3],elite:1},
   {type:'patriarche',lvl:34,n:[1,1],elite:1}]},
 {id:'taniere',x:-96,z:246,r:20, // la Tanière — nord-ouest de la Lande
  packs:[
   {type:'loup',lvl:8,n:[3,5]},{type:'loup',lvl:10,n:[3,5]},
   {type:'cerf',lvl:7,n:[2,4]},{type:'loup',lvl:12,n:[2,4]},
   {type:'loup',lvl:14,n:[2,3],elite:1}]},
 {id:'meute_pendue',x:-268,z:-130,r:18, // les loups noirs de la Forêt
  packs:[
   {type:'loup_noir',lvl:46,n:[3,4]},{type:'loup_noir',lvl:49,n:[2,4]},
   {type:'loup_noir',lvl:52,n:[2,3],elite:1}]},
 {id:'meute_cendre',x:150,z:-300,r:18, // les loups cendrés des Crêtes
  packs:[
   {type:'loup_cendre',lvl:62,n:[3,4]},{type:'loup_cendre',lvl:65,n:[2,4]},
   {type:'loup_cendre',lvl:68,n:[2,3],elite:1}]}];
/* zones interdites : villages, sites de quêtes, arènes (FLATS du terrain) + marge */
const SPAWN_EXCL=[
 {x:0,z:-30,r:78},{x:0,z:180,r:36},{x:105,z:225,r:33},
 {x:158,z:68,r:27},{x:-172,z:-38,r:27},{x:52,z:-195,r:27},
 {x:-45,z:225,r:24},{x:255,z:42,r:24},{x:-210,z:-87,r:24},{x:120,z:-222,r:24},
 {x:282,z:111,r:33},{x:-303,z:-93,r:33},{x:93,z:-312,r:33},
 {x:-312,z:321,r:36},{x:339,z:336,r:57},{x:150,z:-132,r:24}];
/* taille de pack par type (défaut 3-6) */
const SPAWN_PACK_N={colosse:[2,3],gonfle:[3,4],porteur:[2,3],moine:[2,3],choeur:[2,3],
 hurleur:[2,3],veuve:[3,4],
 cerf:[2,4],taureau:[1,2],fille:[2,3],mycomage:[2,3],roi_chancre:[1,1],
 demon_cendre:[2,3],ogre:[2,3],blafard:[1,2],vouivre:[1,1],default:[3,6]};
function spawnRng(seed){ /* mulberry32 */
  let a=seed>>>0;
  return function(){a|=0;a=(a+0x6D2B79F5)|0;
    let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return((t^(t>>>14))>>>0)/4294967296;};
}
function genSpawnData(seed){
  const rng=spawnRng(seed||SPAWN_SEED);
  const out=SPAWN_FIXED.map(sd=>({...sd}));
  const hyp=(ax,az,bx,bz)=>Math.hypot(ax-bx,az-bz);
  /* sites d'abord : les packs de zone garderont leurs distances (22 u) */
  for(const st of SPAWN_SITES){
    for(const pk of st.packs){
      let x=st.x,z=st.z;
      for(let k=0;k<80;k++){
        const a=rng()*Math.PI*2,rad=Math.sqrt(rng())*st.r;
        const tx=Math.round(st.x+Math.cos(a)*rad),tz=Math.round(st.z+Math.sin(a)*rad);
        if(!out.some(p=>hyp(tx,tz,p.x,p.z)<14)){x=tx;z=tz;break;}
      }
      const n=pk.n[0]+Math.floor(rng()*(pk.n[1]-pk.n[0]+1));
      out.push({type:pk.type,lvl:pk.lvl,x,z,n,r:5,elite:pk.elite||0,site:st.id});
    }
  }
  for(const zn of SPAWN_ZONES){
    /* niveau ∝ distance à la capitale (0,-30) : le fond de zone est plus dur */
    let dMin=1e9,dMax=0;
    for(let a=0;a<16;a++){
      const d=hyp(zn.x+Math.cos(a)*zn.r*0.85,zn.z+Math.sin(a)*zn.r*0.85,0,-30);
      dMin=Math.min(dMin,d);dMax=Math.max(dMax,d);
    }
    const wTot=zn.types.reduce((s,t)=>s+t[1],0);
    let placed=0,tries=0;
    while(placed<zn.packs&&tries<zn.packs*240){
      tries++;
      const ang=rng()*Math.PI*2,rad=Math.sqrt(rng())*zn.r*0.88;
      const x=Math.round(zn.x+Math.cos(ang)*rad),z=Math.round(zn.z+Math.sin(ang)*rad);
      if(SPAWN_EXCL.some(f=>hyp(x,z,f.x,f.z)<f.r))continue;
      /* 22 u entre packs : hors de portée d'aggro l'un de l'autre */
      if(out.some(p=>hyp(x,z,p.x,p.z)<22))continue;
      let w=rng()*wTot,type=zn.types[0][0];
      for(const t of zn.types){w-=t[1];if(w<=0){type=t[0];break;}}
      const t01=Math.max(0,Math.min(1,(hyp(x,z,0,-30)-dMin)/(dMax-dMin||1)));
      const lvl=Math.max(1,Math.round(zn.lvl[0]+(zn.lvl[1]-zn.lvl[0])*t01+(rng()*2-1)));
      const nn=SPAWN_PACK_N[type]||SPAWN_PACK_N.default;
      const n=nn[0]+Math.floor(rng()*(nn[1]-nn[0]+1));
      /* ~8% de packs élites : plus rares, plus durs, meilleur butin */
      const elite=rng()<0.08?1:0;
      /* packs resserrés (6-9 u) : un groupe se lit comme un groupe */
      out.push({type,lvl:lvl+(elite?2:0),x,z,n:elite?Math.max(nn[0],n-1):n,
        r:Math.round(6+rng()*3),elite});
      placed++;
    }
  }
  return out;
}
if(typeof module!=='undefined'&&module.exports)
  module.exports={SPAWN_SEED,genSpawnData,SPAWN_ZONES,SPAWN_FIXED,SPAWN_SITES};
