'use strict';
/* ---------- ennemis ---------- */
const ENEMY_DEF={
 creux:{nom:'Creux',peau:0x6d6f5e,habit:0x3f4234,scale:1,mass:70,speed:2.7,aggro:9},
 traqueur:{nom:'Traqueur',peau:0x5a5548,habit:0x2c2a22,scale:0.85,mass:42,speed:4.6,aggro:12,sp:'lunge'},
 noyeur:{nom:'Noyeur',peau:0x4e6054,habit:0x2a3830,scale:1.05,mass:85,speed:3.4,aggro:10,sp:'grasp'},
 gonfle:{nom:'Gonflé',peau:0x7a6f4a,habit:0x5a5138,scale:1.3,mass:160,speed:1.6,aggro:8,explose:true},
 pendu:{nom:'Pendu',peau:0x5c5a52,habit:0x33313a,scale:1.15,mass:110,speed:3.8,aggro:11,strangle:true},
 hurleur:{nom:'Hurleur',peau:0x6a5c50,habit:0x3a2c2a,scale:0.95,mass:60,speed:2.4,aggro:16,tir:true,sp:'scream'},
 ossature:{nom:'Ossature',peau:0xb0a890,habit:0x4a463a,scale:1,mass:55,speed:4.2,aggro:12,tirAlt:true},
 colosse:{nom:"Colosse d'os",peau:0x9a927c,habit:0x3c382e,scale:1.8,mass:340,speed:2.4,aggro:10,sp:'slam'},
 berger:{nom:'Le Berger Creux',peau:0x585c4e,habit:0x2a2d24,scale:2.1,mass:420,speed:2.2,aggro:14,boss:true,arme:'baton'},
 mere:{nom:'Mère Saumâtre',peau:0x5a6e52,habit:0x2e3c30,scale:2.3,mass:520,speed:1.9,aggro:14,boss:true},
 pendeur:{nom:'Le Pendeur',peau:0x50505a,habit:0x26262e,scale:2.4,mass:480,speed:2.6,aggro:15,boss:true,arme:'fouet'},
 roi:{nom:'Le Roi-Charnier',peau:0xb8b094,habit:0x38342a,scale:2.7,mass:640,speed:2.3,aggro:16,boss:true,arme:'os'},
 absent:{nom:'Absent',peau:0x14161c,habit:0x0a0c10,scale:1.25,mass:95,speed:4.6,aggro:20,sp:'blink'},
 rodeuse:{nom:'Rôdeuse',peau:0x5c5244,habit:0x33291f,scale:0.75,mass:38,speed:5.4,aggro:13,beast:true,sp:'lunge'},
 brule:{nom:'Brûlé',peau:0x3a2c24,habit:0x241a14,scale:1.05,mass:88,speed:2.9,aggro:9,sp:'bomber'},
 sangsue:{nom:'Sangsue',peau:0x4a5a48,habit:0x2c3a2c,scale:0.9,mass:70,speed:3.0,aggro:9,beast:true,leech:true},
 porteur:{nom:'Porteur de lanterne',peau:0x6a6a58,habit:0x3a3a2c,scale:1.1,mass:100,speed:2.4,aggro:12,tir:true},
 echassier:{nom:'Échassier',peau:0x565048,habit:0x2e2a24,scale:1.05,mass:60,speed:5.0,aggro:13,beast:true,sp:'lunge'},
 veuve:{nom:'Veuve des branches',peau:0x3c3a44,habit:0x26242c,scale:1.15,mass:120,speed:3.6,aggro:12,beast:true,tir:true,webs:true},
 moine:{nom:'Moine d\'os',peau:0xb0a890,habit:0x3c382c,scale:1,mass:60,speed:2.6,aggro:15,tir:true,sp:'heal'},
 choeur:{nom:'Chœur creux',peau:0xc0b89e,habit:0x403c30,scale:0.95,mass:55,speed:2.2,aggro:16,tir:true,shots:3}};
function eHp(l,boss){return Math.round((60+l*26)*(boss?6:1));}
function eDmg(l,boss){return Math.round((8+l*2.6)*(boss?1.8:1));}
function eXp(l,boss){return Math.max(1,Math.round((0.4+l*0.18)*(boss?8:1)));}
function spawnEnemy(type,lvl,x,z,spawner){
  const d=ENEMY_DEF[type];
  const m=humanoide({peau:d.peau,habit:d.habit,scale:d.scale,arme:d.arme,yeux:d.boss?0x8e2a1c:0x0a0a0a});
  m.position.set(x,terrainH(x,z),z);scene.add(m);
  if(type==='berger'||type==='roi'){
    [-1,1].forEach(s=>{const c=new THREE.Mesh(new THREE.ConeGeometry(0.1,1.1,4),mat(0x4a4436));
      c.position.set(0.35*s*d.scale,1.9*d.scale,0);c.rotation.z=-0.6*s;m.add(c);});}
  const e={type,def:d,lvl,mesh:m,pos:m.position,vel:V3(0,0,0),mass:d.mass,radius:0.4*d.scale,
    hp:eHp(lvl,d.boss),maxHp:eHp(lvl,d.boss),dmg:eDmg(lvl,d.boss),
    state:'idle',t:rand(0,3),atkT:0,home:{x,z},spawner,twitch:rand(0,10),slowT:0,hitFlash:0,dot:null};
  if(type==='porteur'){const ll=new THREE.PointLight(0xd8b45a,0.75,7);ll.position.y=1.7;m.add(ll);
    const lan=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.2,0.14),
      new THREE.MeshStandardMaterial({color:0x8a6a2a,emissive:0xc89a3a,emissiveIntensity:0.9}));
    lan.position.set(0.4,1.1,0.2);m.add(lan);}
  if(type==='brule'){const em=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.3,0.04),
    new THREE.MeshBasicMaterial({color:0xd8622a}));em.position.set(0,1.05*d.scale,0.18*d.scale);m.add(em);}
  if(type==='echassier')m.scale.y=1.5;
  if(type==='rodeuse')m.scale.y=0.7;
  if(type==='sangsue')m.userData.parts.tete.scale.setScalar(0.5);
  if(type==='veuve')[-1,1].forEach(sd=>{const b=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.7,0.12),mat(d.peau));
    b.position.set(0.48*sd,1.35,0);b.rotation.z=1.1*sd;m.add(b);});
  if(type==='moine'){const cap=new THREE.Mesh(new THREE.ConeGeometry(0.26,0.4,5),mat(0x3c382c));
    cap.position.y=1.75;m.add(cap);}
  if(type==='choeur')[-0.3,0.3].forEach(xx=>{const cr=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.15,0.15),mat(0xc8c0a8,0.6));
    cr.position.set(xx,1.9,0);m.add(cr);});
  const tele=new THREE.Mesh(new THREE.CircleGeometry(1.7*d.scale,18),
    new THREE.MeshBasicMaterial({color:0x8e2a1c,transparent:true,opacity:0,depthWrite:false}));
  tele.rotation.x=-Math.PI/2;tele.position.y=0.04;tele.userData.keep=1;m.add(tele);e.tele=tele;
  attachRig(m,'e:'+type,{scale:d.scale});
  enemies.push(e);return e;
}
const SPAWN_DATA=[
 {type:'creux',lvl:3,x:-24,z:104,n:5,r:11},{type:'creux',lvl:5,x:22,z:142,n:5,r:11},
 {type:'creux',lvl:7,x:-14,z:158,n:5,r:10},{type:'traqueur',lvl:9,x:-42,z:132,n:4,r:12},
 {type:'traqueur',lvl:12,x:40,z:106,n:4,r:12},{type:'creux',lvl:12,x:RUINES.x-8,z:RUINES.z+8,n:4,r:8},
 {type:'berger',lvl:14,x:RUINES.x,z:RUINES.z,n:1,r:2},
 {type:'noyeur',lvl:23,x:122,z:44,n:5,r:12},{type:'noyeur',lvl:27,x:150,z:26,n:5,r:12},
 {type:'noyeur',lvl:30,x:132,z:80,n:4,r:11},{type:'gonfle',lvl:28,x:168,z:52,n:4,r:11},
 {type:'gonfle',lvl:34,x:150,z:96,n:4,r:11},{type:'mere',lvl:38,x:188,z:74,n:1,r:2},
 {type:'pendu',lvl:43,x:-132,z:-24,n:5,r:12},{type:'pendu',lvl:48,x:-160,z:-8,n:5,r:12},
 {type:'pendu',lvl:52,x:-178,z:-42,n:4,r:11},{type:'hurleur',lvl:47,x:-146,z:-56,n:3,r:12},
 {type:'hurleur',lvl:54,x:-186,z:-20,n:3,r:12},{type:'pendeur',lvl:58,x:-202,z:-62,n:1,r:2},
 {type:'ossature',lvl:62,x:36,z:-148,n:5,r:12},{type:'ossature',lvl:66,x:78,z:-158,n:5,r:12},
 {type:'colosse',lvl:65,x:52,z:-182,n:3,r:11},{type:'colosse',lvl:69,x:88,z:-190,n:3,r:11},
 {type:'roi',lvl:70,x:62,z:-208,n:1,r:2},
 {type:'rodeuse',lvl:6,x:-40,z:100,n:4,r:11},{type:'brule',lvl:10,x:30,z:160,n:4,r:11},
 {type:'rodeuse',lvl:15,x:55,z:135,n:4,r:11},
 {type:'sangsue',lvl:22,x:120,z:70,n:5,r:11},{type:'porteur',lvl:31,x:160,z:20,n:3,r:10},
 {type:'sangsue',lvl:35,x:175,z:95,n:4,r:11},
 {type:'echassier',lvl:45,x:-120,z:-10,n:4,r:11},{type:'veuve',lvl:50,x:-170,z:-55,n:4,r:11},
 {type:'echassier',lvl:55,x:-195,z:-30,n:4,r:11},
 {type:'moine',lvl:63,x:20,z:-165,n:3,r:10},{type:'choeur',lvl:67,x:95,z:-140,n:3,r:10},
 {type:'moine',lvl:69,x:45,z:-195,n:3,r:10}];
/* ---------- effets ---------- */
function sang(x,z,s=1){
  const m=new THREE.Mesh(new THREE.CircleGeometry(rand(0.25,0.5)*s,7),
    new THREE.MeshBasicMaterial({color:0x3a0e08,transparent:true,opacity:0.85}));
  m.rotation.x=-Math.PI/2;m.position.set(x+rand(-0.3,0.3),terrainH(x,z)+0.02+decals.length*0.0004,z+rand(-0.3,0.3));
  scene.add(m);decals.push({m});
  if(decals.length>90){const d=decals.shift();scene.remove(d.m);}
}
function onde(x,z,couleur=0x8a7448,taille=1){
  const m=new THREE.Mesh(new THREE.RingGeometry(0.3,0.55,26),
    new THREE.MeshBasicMaterial({color:couleur,transparent:true,opacity:0.7,side:THREE.DoubleSide}));
  m.rotation.x=-Math.PI/2;m.position.set(x,terrainH(x,z)+0.06,z);m.userData.tl=taille;scene.add(m);anneaux.push({m,t:0});
}
let shake=0,hitstop=0;
function dmgNum(pos,txt,cls=''){
  const d=document.createElement('div');d.className='dmg '+cls;d.textContent=txt;
  document.body.appendChild(d);
  dmgNums.push({el:d,p:pos.clone().add(V3(rand(-.3,.3),1.9,0)),t:0.9,vy:1.6});
}
function toast(g,p){el('toast-g').textContent=g;el('toast-p').textContent=p;
  const t=el('toast');t.style.opacity=1;clearTimeout(t._h);t._h=setTimeout(()=>t.style.opacity=0,2800);}
/* ---------- physique de combat ---------- */
function impulse(ent,dir,force,up=0.35){
  force*=1.35;
  ent.vel.x+=dir.x*force/ent.mass;
  ent.vel.z+=dir.z*force/ent.mass;
  ent.vel.y+=force*up/ent.mass;
  if(ent!==player&&ent.state!=='dead'&&ent.state!=='grabbed'){
    if(Math.hypot(ent.vel.x,ent.vel.z)>3)ent.state='stagger';
    ent.punch=Math.max(ent.punch||0,0.09);}
}
function xpFalloff(elvl){
  const d=elvl-G.lvl;
  if(d<=-8)return 0; // gris : plus rien à apprendre
  return clamp(1+0.12*d,0.1,1.5);
}
function applyDot(e,dps,dur){e.dot={dps,t:dur,tick:0.5};}
function hurtEnemy(e,dmg,dir,force,opts={}){
  if(!e||e.state==='dead')return;
  if(e.sid&&!e.owned){
    // mob simulé par un autre joueur : visuels optimistes + relais serveur
    const critR=Math.random()<statCrit();if(critR)dmg=Math.round(dmg*1.8);
    e.hitFlash=0.12;dmgNum(e.pos,dmg,critR?'crit':'');
    sang(e.pos.x,e.pos.z);
    spawnPart(e.pos.x,1.2,e.pos.z,critR?24:10,
      {col:critR?0xd8a03a:0x6e1812,spd:critR?6:3.5,dx:dir.x*3.5,dz:dir.z*3.5,life:0.55});
    e.punch=Math.max(e.punch||0,critR?0.16:0.11);
    const _lsR=lsTotal();if(_lsR>0&&!player.dead){player.hp=Math.min(maxHp(),player.hp+dmg*_lsR);}
    sfx('hit',critR?1.4:1);
    hitstop=Math.max(hitstop,critR?0.09:0.05);
    shake=Math.max(shake,force/1000);
    mpSend({t:'ehit',id:e.sid,dmg,fx:dir.x,fz:dir.z,force:force*statImpact(),
      slow:opts.slow||0,dot:opts.dot?1:0,up:opts.up!==undefined?opts.up:0.35});
    return;
  }
  if(e.sid&&e.owned)mpSend({t:'ehit',id:e.sid,dmg:0});
  const crit=Math.random()<statCrit();if(crit)dmg=Math.round(dmg*1.8);
  force*=statImpact();
  e.hp-=dmg;e.hitFlash=0.12;
  dmgNum(e.pos,dmg,crit?'crit':'');
  sang(e.pos.x,e.pos.z);
  spawnPart(e.pos.x,1.2,e.pos.z,crit?24:10,
    {col:crit?0xd8a03a:0x6e1812,spd:crit?6:3.5,dx:dir.x*3.5,dz:dir.z*3.5,life:0.55});
  e.punch=Math.max(e.punch||0,crit?0.16:0.11);
  impulse(e,dir,force*(crit?1.4:1),opts.up!==undefined?opts.up:0.35);
  const _ls=lsTotal();if(_ls>0&&!player.dead){player.hp=Math.min(maxHp(),player.hp+dmg*_ls);}
  if(crit&&EQ.legs.nova){onde(e.pos.x,e.pos.z,0xc8a84a,0.7);
    enemies.forEach(o=>{if(o!==e&&o.state!=='dead'&&dist2D(o.pos,e.pos)<2.6){
      const dd=V3(o.pos.x-e.pos.x,0,o.pos.z-e.pos.z).normalize();
      impulse(o,dd,380);o.hp-=Math.round(dmg*0.25);dmgNum(o.pos,Math.round(dmg*0.25),'');
      if(o.hp<=0)tueEnemy(o,dd,300);}});}
  if(opts.slow)e.slowT=Math.max(e.slowT,opts.slow);
  if(opts.dot)applyDot(e,Math.max(2,Math.round(dmg*0.15)),4);
  sfx('hit',crit?1.4:1);
  hitstop=Math.max(hitstop,crit?0.09:0.05);
  shake=Math.max(shake,force/1000);
  if(e.hp<=0)tueEnemy(e,dir,force);
}
function tueEnemy(e,dir,force,remote){
  if(e.state==='dead')return;
  e.state='dead';sfx('mort');rigDeath(e.mesh);
  if(player.grab&&player.grab.e===e)player.grab=null;
  e.vel.x=dir.x*force/e.mass*1.6;e.vel.z=dir.z*force/e.mass*1.6;e.vel.y=2.4+force/e.mass;
  e.angVel=V3(rand(-4,4),rand(-2,2),rand(-4,4));
  e.corpseT=14;
  spawnPart(e.pos.x,1.1,e.pos.z,26,{col:0x5c1410,spd:5,dx:dir.x*4,dz:dir.z*4,life:0.7});
  corpses.push(e);
  const idx=enemies.indexOf(e);if(idx>=0)enemies.splice(idx,1);
  if(player.targetEnemy===e){
    let nt=null,nd=12;
    enemies.forEach(o=>{if(o.state==='chase'||o.state==='windup'){
      const d2=dist2D(o.pos,player.pos);if(d2<nd){nd=d2;nt=o;}}});
    player.targetEnemy=nt;}
  if(e.spawner){e.spawner.alive--;e.spawner.respawnT=e.def.boss?60:16;}
  if(e.def.explose){
    onde(e.pos.x,e.pos.z,0x6b5a2c);sfx('slam');
    if(!e.sid||e.owned)[...enemies].forEach(o=>{const d=dist2D(o.pos,e.pos);
      if(d<3.6){const dd=V3(o.pos.x-e.pos.x,0,o.pos.z-e.pos.z).normalize();
        hurtEnemy(o,Math.round(e.dmg*1.4),dd,440);}});
    const dp=dist2D(player.pos,e.pos);
    if(dp<3.6){const dd=V3(player.pos.x-e.pos.x,0,player.pos.z-e.pos.z).normalize();
      hurtPlayer(Math.round(e.dmg*0.9),dd,380);}}
  if(e.bar){e.bar.el.remove();e.bar=null;}
  if(e.def.boss)toast(e.def.nom+' est tombé','La lande retient son souffle.');
  if(e.sid){
    // mob partagé : le serveur crédite les participants via « edie »
    if(!MP.on){recompensesKill(e);return;}
    if(e.owned&&!remote)mpSend({t:'edie',id:e.sid,fx:dir.x,fz:dir.z,force:force});
    majHud();
    return;
  }
  recompensesKill(e);
}
function recompensesKill(e){
  const orGain=Math.round((irand(1,3)+e.lvl*0.4)*(1+0.05*talRank('r2')));
  G.gold+=orGain;sfx('or');
  dmgNum(e.pos,'+'+orGain+' or','soin');
  gainXp(Math.round(eXp(e.lvl,e.def.boss)*xpFalloff(e.lvl)));
  G.kills++;
  if(EQ.legs.moisson){Object.keys(G.cds).forEach(k=>G.cds[k]=Math.max(0,G.cds[k]-1));}
  if(talRank('r6'))Object.keys(G.cds).forEach(k=>G.cds[k]=Math.max(0,G.cds[k]-0.5));
  if(talRank('e4')&&!player.dead)player.hp=Math.min(maxHp(),player.hp+maxHp()*0.01*talRank('e4'));
  dropLoot(e);
  questProgress('kill',e.type);
  if(e.type==='creux'&&Math.random()<0.6)questProgress('collect','fragment');
  if(e.type==='pendu'&&Math.random()<0.6)questProgress('collect','corde');
  if((e.type==='pendu'||e.type==='hurleur'||e.type==='ossature')&&Math.random()<0.55)questProgress('collect','insigne');
  if((e.type==='noyeur'||e.type==='gonfle')&&Math.random()<0.6)questProgress('collect','lanterne');
  if((e.type==='ossature'||e.type==='colosse')&&Math.random()<0.6)questProgress('collect','clou');
  secretKill(e);
  if(e.def.beast&&Math.random()<0.45){G.mats.peau++;dmgNum(e.pos,'+1 peau','soin');}
  majHud();
}
function hurtPlayer(dmg,dir,force){
  if(player.invuln>0||player.dead)return;
  if(G.activeMount>0)demonter();
  dmg=Math.round(dmg*dmgReduction());
  player.hp-=dmg;player.invuln=0.5;player.stagger=0.25;
  impulse(player,dir,force,0.2);
  dmgNum(player.pos,'-'+dmg,'joueur');
  spawnPart(player.pos.x,1.3,player.pos.z,10,{col:0x8e2016,spd:3.5,life:0.5});
  el('hurt').style.opacity=1;setTimeout(()=>el('hurt').style.opacity=0,350);
  shake=Math.max(shake,0.5);sfx('hit',1.2);
  if(player.hp<=0)mortJoueur();
  majHud();
}
function mortJoueur(){
  player.dead=true;player.hp=0;player.grab=null;rigDeath(player.mesh);
  el('mort-txt').textContent='La brume vous recouvre. '+G.kills+' créatures fauchées cette veillée.';
  el('mort').style.display='flex';
}
function respawn(){
  player.dead=false;player.hp=Math.round(maxHp()*0.6);rigRevive(player.mesh);
  const pt=(G.visited.capitale&&dist2D(player.pos,CAPITALE)<dist2D(player.pos,MORFAILLE))?
    {x:CAPITALE.x,z:CAPITALE.z+8}:{x:0,z:126};
  player.pos.set(pt.x,0,pt.z);player.vel.set(0,0,0);G.flying=false;G.altitude=0;MP.tp=1;
  const perte=Math.floor(G.gold*0.08);G.gold-=perte;
  if(perte>0)toast('Vous vous relevez','Réparations : -'+perte+' or');
  el('mort').style.display='none';majHud();save();
}
function tirer(o){
  const geo=o.ally?new THREE.BoxGeometry(0.09,0.09,0.5):new THREE.SphereGeometry(0.16,6,6);
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:o.col||0xd8c26a}));
  m.position.copy(o.from).add(V3(0,1.3,0));
  m.lookAt(m.position.clone().add(o.dir));
  scene.add(m);
  projectiles.push({mesh:m,pos:m.position,vel:o.dir.clone().multiplyScalar(o.speed||24),
    dmg:o.dmg,force:o.force||300,ally:!!o.ally,pierce:o.pierce||0,pull:!!o.pull,slowP:!!o.slowP,
    explode:o.explode||null,tags:o.tags||['proj'],t:0,life:o.life||1.6,hit:new Set()});
  sfx('tir');
}
function releverServiteur(c,strong){
  const idx=corpses.indexOf(c);if(idx>=0){scene.remove(c.mesh);corpses.splice(idx,1);}
  const mMult=minionMult()*(strong?1.5:1);
  const m=humanoide({peau:0xb8b09a,habit:0x2c3026,scale:strong?1.05:0.9,yeux:0x8a9a6a});
  attachRig(m,'servitor',{scale:strong?1.05:0.9});
  m.position.set(c.pos.x,0,c.pos.z);scene.add(m);
  allies.push({mesh:m,pos:m.position,vel:V3(0,0,0),mass:55,radius:0.35,
    hp:(40+G.lvl*6)*mMult,dmg:Math.round(baseDmg()*0.5*mMult),t:25,atkCd:0,phase:rand(0,6)});
  onde(c.pos.x,c.pos.z,0x8a9a6a);
}
