'use strict';
/* ---------- peuplement : tables par zone + générateur déterministe ----------
   Module PARTAGÉ client/serveur : script classique côté navigateur (globales),
   require() CJS côté Node (module.exports en bas). Données + maths pures,
   aucune dépendance THREE ni DOM. Même graine => même monde des deux côtés. */
const SPAWN_SEED=20260709;
/* packs fixes : sites de quêtes et boss (positions historiques) */
const SPAWN_FIXED=[
 {type:'creux',lvl:3,x:-24,z:104,n:5,r:11},
 {type:'creux',lvl:12,x:62,z:158,n:4,r:8},
 {type:'berger',lvl:14,x:70,z:150,n:1,r:2},
 {type:'mere',lvl:38,x:188,z:74,n:1,r:2},
 {type:'pendeur',lvl:58,x:-202,z:-62,n:1,r:2},
 {type:'roi',lvl:70,x:62,z:-208,n:1,r:2}];
/* par zone : centre/rayon, tranche de niveaux, nombre de packs,
   types pondérés [type, poids]. Niveau croissant en s'éloignant de la capitale. */
const SPAWN_ZONES=[
 {id:'lande',x:0,z:120,r:95,lvl:[2,19],packs:72,
  types:[['creux',34],['traqueur',24],['rodeuse',24],['brule',18]]},
 {id:'fange',x:150,z:60,r:80,lvl:[21,37],packs:64,
  types:[['noyeur',28],['gonfle',20],['sangsue',25],['porteur',15],['creux',12]]},
 {id:'foret',x:-160,z:-40,r:80,lvl:[41,57],packs:64,
  types:[['pendu',30],['hurleur',18],['echassier',26],['veuve',26]]},
 {id:'cretes',x:60,z:-170,r:80,lvl:[60,70],packs:62,
  types:[['ossature',32],['colosse',18],['moine',26],['choeur',24]]}];
/* zones interdites : villages, sites de quêtes, arènes (FLATS du terrain) + marge */
const SPAWN_EXCL=[
 {x:0,z:-20,r:52},{x:0,z:120,r:24},{x:70,z:150,r:22},
 {x:105,z:45,r:18},{x:-115,z:-25,r:18},{x:35,z:-130,r:18},
 {x:-30,z:150,r:16},{x:170,z:28,r:16},{x:-140,z:-58,r:16},{x:80,z:-148,r:16},
 {x:188,z:74,r:22},{x:-202,z:-62,r:22},{x:62,z:-208,r:22},
 {x:-208,z:214,r:24},{x:226,z:224,r:38},{x:100,z:-88,r:16}];
/* taille de pack par type (défaut 3-6) */
const SPAWN_PACK_N={colosse:[2,3],gonfle:[3,4],porteur:[2,3],moine:[2,3],choeur:[2,3],
 hurleur:[2,3],veuve:[3,4],default:[3,6]};
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
  for(const zn of SPAWN_ZONES){
    /* niveau ∝ distance à la capitale (0,-20) : le fond de zone est plus dur */
    let dMin=1e9,dMax=0;
    for(let a=0;a<16;a++){
      const d=hyp(zn.x+Math.cos(a)*zn.r*0.85,zn.z+Math.sin(a)*zn.r*0.85,0,-20);
      dMin=Math.min(dMin,d);dMax=Math.max(dMax,d);
    }
    const wTot=zn.types.reduce((s,t)=>s+t[1],0);
    let placed=0,tries=0;
    while(placed<zn.packs&&tries<zn.packs*60){
      tries++;
      const ang=rng()*Math.PI*2,rad=Math.sqrt(rng())*zn.r*0.88;
      const x=Math.round(zn.x+Math.cos(ang)*rad),z=Math.round(zn.z+Math.sin(ang)*rad);
      if(SPAWN_EXCL.some(f=>hyp(x,z,f.x,f.z)<f.r))continue;
      if(out.some(p=>hyp(x,z,p.x,p.z)<13))continue;
      let w=rng()*wTot,type=zn.types[0][0];
      for(const t of zn.types){w-=t[1];if(w<=0){type=t[0];break;}}
      const t01=Math.max(0,Math.min(1,(hyp(x,z,0,-20)-dMin)/(dMax-dMin||1)));
      const lvl=Math.max(1,Math.round(zn.lvl[0]+(zn.lvl[1]-zn.lvl[0])*t01+(rng()*2-1)));
      const nn=SPAWN_PACK_N[type]||SPAWN_PACK_N.default;
      const n=nn[0]+Math.floor(rng()*(nn[1]-nn[0]+1));
      out.push({type,lvl,x,z,n,r:Math.round(7+rng()*5)});
      placed++;
    }
  }
  return out;
}
if(typeof module!=='undefined'&&module.exports)
  module.exports={SPAWN_SEED,genSpawnData,SPAWN_ZONES,SPAWN_FIXED};
