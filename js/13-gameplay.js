'use strict';
/* ---------- esquive (Espace) : chaque classe bouge à sa manière ---------- */
const DASH_DEF={
 ecorcheur:{n:1,cd:6,dist:4,type:'dash'},
 briseroc:{n:1,cd:7,dist:3.5,type:'dash'},
 arbaletriere:{n:3,cd:4,dist:5,type:'dash'},
 flagellant:{n:2,cd:5,dist:4.5,type:'dash'},
 cendremage:{n:2,cd:6,dist:5.5,type:'blink'},
 ossuaire:{n:2,cd:6,dist:5,type:'blink'},
 voleur:{n:3,cd:3.5,dist:4.5,type:'dash'}};
function dashDef(){
  const b=DASH_DEF[G.classe]||DASH_DEF.ecorcheur;
  return{...b,n:b.n+(curSpec().dash||0)};
}
function esquive(){
  if(player.dead||player.grab||G.activeMount>0||!G.started)return;
  const D=dashDef();
  if(G.dashCharge<1)return;
  G.dashCharge-=1;
  player.attack=null; // l'esquive interrompt tout
  let ix=(keysMove.r?1:0)-(keysMove.l?1:0),iz=(keysMove.f?1:0)-(keysMove.b?1:0);
  if(!ix&&!iz&&touchVec){ix=touchVec.x;iz=touchVec.z;}
  let dx,dz;
  if(ix||iz){const yaw=G.camMode==='tps'?camYaw:Math.PI;
    const n=Math.hypot(ix,iz);ix/=n;iz/=n;
    dx=Math.sin(yaw)*iz-Math.cos(yaw)*ix;dz=Math.cos(yaw)*iz+Math.sin(yaw)*ix;}
  else{dx=Math.sin(player.facing);dz=Math.cos(player.facing);}
  player.invuln=Math.max(player.invuln,0.35);
  sfxCast({t:'dash'});
  if(MP.on)mpSend({t:'fx',k:'dash',f:+player.facing.toFixed(3)});
  if(D.type==='blink'){
    fxImplode(player.pos.x,player.pos.z,1.6,CFX().light);
    spawnPart(player.pos.x,1,player.pos.z,14,{col:CFX().light,spd:2,life:0.4});
    player.pos.x=clamp(player.pos.x+dx*D.dist,-373,373);
    player.pos.z=clamp(player.pos.z+dz*D.dist,-373,373);
    collideObstacles(player);
    spawnPart(player.pos.x,1,player.pos.z,14,{col:CFX().light,spd:2,life:0.4});
    onde(player.pos.x,player.pos.z,CFX().light,0.7);
  }else{
    player.dash={t:0,dur:D.dist/30,dir:V3(dx,0,dz),m:0,f:0,evade:true,hit:new Set()};
    rigOneShot(player.mesh,'roll',0.55);
    spawnPart(player.pos.x,0.6,player.pos.z,10,{col:CFX().light,spd:2,life:0.35});
  }
}

/* ---------- particularités du bestiaire ---------- */
function startDash(e,mult){
  const dx=player.pos.x-e.pos.x,dz=player.pos.z-e.pos.z,dd=Math.hypot(dx,dz)||1;
  e.state='edash';
  e.dashDir=V3(dx/dd,0,dz/dd);
  e.castT=Math.min(0.65,dd/15+0.12);
  e.dashHit=false;e.dashMult=mult;
  fxSector(e.pos,Math.atan2(dx,dz),Math.min(dd+1,10),0.14,0x8e2a1c);
  sfx('tir');
}
function trySpecial(e,dP){
  const d=e.def;
  if(d.boss)return bossTry(e,dP);
  if((e.spCd||0)>0)return false;
  if(d.sp==='lunge'&&dP>3.5&&dP<10){e.spCd=5;startDash(e,1.3);return true;}
  if(d.sp==='bomber'&&dP<2.6){e.spCd=99;e.state='fuse';e.castT=0.9;e.vel.x=e.vel.z=0;
    const tm=e.mesh.userData.parts.torse.material;
    tm.emissive&&tm.emissive.setHex(0x8e2a1c);
    return true;}
  if(d.sp==='slam'&&dP<3.8){e.spCd=7;e.state='slam';e.castT=0.9;e.vel.x=e.vel.z=0;return true;}
  if(d.sp==='scream'&&dP<3.2){e.spCd=8;
    onde(e.pos.x,e.pos.z,0xc8b06a,1.2);sfx('slam');
    const dir=V3(player.pos.x-e.pos.x,0,player.pos.z-e.pos.z).normalize();
    hurtPlayer(Math.round(e.dmg*0.5),dir,950);
    return false;}
  if(d.sp==='grasp'&&dP>3&&dP<8){e.spCd=9;
    const dir=V3(e.pos.x-player.pos.x,0,e.pos.z-player.pos.z).normalize();
    impulse(player,dir,720,0.15);addBuff('spd',0.6,1.4);
    fxImplode(e.pos.x,e.pos.z,3.2,0x4e6054);sfx('tir');
    dmgPhy(player.pos,'AGRIPPÉ !');
    return false;}
  if(d.sp==='blink'&&dP<11&&dP>2.4){e.spCd=6;
    onde(e.pos.x,e.pos.z,0x2a2c44,0.8);
    spawnPart(e.pos.x,1,e.pos.z,10,{col:0x2a3050,spd:2,life:0.4});
    const bx=player.pos.x-Math.sin(player.facing)*2.1,bz=player.pos.z-Math.cos(player.facing)*2.1;
    e.pos.x=bx;e.pos.z=bz;
    onde(bx,bz,0x2a2c44,0.8);
    return false;}
  if(d.sp==='heal'){e.spCd=6;let did=false;
    enemies.forEach(o=>{if(o!==e&&o.state!=='dead'&&dist2D(o.pos,e.pos)<9&&o.hp<o.maxHp){
      o.hp=Math.min(o.maxHp,o.hp+o.maxHp*0.08);did=true;}});
    if(did){onde(e.pos.x,e.pos.z,0x7ab06a,1);
      spawnPart(e.pos.x,1.4,e.pos.z,10,{col:0x7ab06a,spd:1.4,up:2,grav:-1,life:0.8});}
    return false;}
  if(d.tirAlt&&dP<12&&dP>5){e.spCd=4;e.forceTir=true;e.state='windup';e.atkT=0;e.vel.x=e.vel.z=0;return true;}
  return false;
}
/* ---------- kits de boss : de vraies mécaniques, et l'anti-kite ---------- */
const BOSS_KIT={
 berger:[{k:'summon',cd:14,t:'creux',n:2},{k:'cone',cd:8},{k:'pull',cd:10,anti:1}],
 mere:[{k:'volley',cd:6,n:3},{k:'summon',cd:16,t:'sangsue',n:2},{k:'lunge',cd:9,anti:1},{k:'slam',cd:12}],
 pendeur:[{k:'pull',cd:8,anti:1},{k:'volley',cd:7,n:2,slow:1},{k:'slam',cd:11}],
 roi:[{k:'storm',cd:9,n:8},{k:'summon',cd:15,t:'ossature',n:2},{k:'lunge',cd:8,anti:1},{k:'slam',cd:13}]};
function bossTry(e,dP){
  const kit=BOSS_KIT[e.type];if(!kit)return false;
  if(!e.bk){e.bk={};kit.forEach((a,i)=>e.bk[i]=rand(2,5));}
  let pick=-1;
  if(dP>7.5)kit.forEach((a,i)=>{if(a.anti&&e.bk[i]<=0&&pick<0)pick=i;});
  if(pick<0)kit.forEach((a,i)=>{if(e.bk[i]<=0&&pick<0&&!(a.anti&&dP<5))pick=i;});
  if(pick<0)return false;
  const a=kit[pick];e.bk[pick]=a.cd;
  if(a.k==='lunge'){startDash(e,1.6);return true;}
  if(a.k==='summon'){
    let proches=0;enemies.forEach(o=>{if(o!==e&&dist2D(o.pos,e.pos)<22)proches++;});
    if(proches>=5){e.bk[pick]=3;return false;}
    for(let i=0;i<a.n;i++){
      const s=spawnEnemy(a.t,Math.max(1,e.lvl-3),e.pos.x+rand(-3.5,3.5),e.pos.z+rand(-3.5,3.5),null);
      s.state='chase';}
    onde(e.pos.x,e.pos.z,0x6a7a5a,1.3);
    toast(e.def.nom,'appelle des serviteurs');
    return false;}
  if(a.k==='volley'||a.k==='storm'){e.state='bcast';e.castT=a.k==='storm'?0.9:0.7;
    e.castK={k:a.k,n:a.n,slow:a.slow};e.vel.x=e.vel.z=0;return true;}
  if(a.k==='slam'){e.state='slam';e.castT=1.0;e.vel.x=e.vel.z=0;return true;}
  if(a.k==='cone'){e.state='bcast';e.castT=0.8;e.castK={k:'cone'};e.vel.x=e.vel.z=0;
    e.mesh.rotation.y=Math.atan2(player.pos.x-e.pos.x,player.pos.z-e.pos.z);
    fxSector(e.pos,e.mesh.rotation.y,7,0.7,0x8e2a1c);
    if(MP.on&&e.sid&&e.owned)mpSend({t:'fx',k:'econe',eid:e.sid,f:+e.mesh.rotation.y.toFixed(3)});
    return true;}
  if(a.k==='pull'){
    const dir=V3(e.pos.x-player.pos.x,0,e.pos.z-player.pos.z).normalize();
    impulse(player,dir,1450,0.25);addBuff('spd',0.55,1.6);
    hurtPlayer(Math.round(e.dmg*0.35),dir.clone().multiplyScalar(-1),80);
    fxImplode(e.pos.x,e.pos.z,Math.min(dP,14),0x8e2a1c);sfx('slam');
    dmgPhy(player.pos,'HAPPÉ !');
    toast(e.def.nom,'vous ramène à lui — pas de fuite');
    return false;}
  return false;
}

/* ---------- dégâts légers (zones, saignements) ---------- */
function dmgLight(e,dmg,dir,f,slow){
  if(!e||e.state==='dead'||e.state==='retour')return;
  if(e.sid&&!e.owned){
    e._optT=performance.now();
    e.hitFlash=0.08;dmgNum(e.pos,dmg,'');
    mpSend({t:'ehit',id:e.sid,dmg,fx:dir?dir.x:0,fz:dir?dir.z:0,force:f||0,slow:slow||0});
    return;
  }
  if(e.sid&&e.owned)mpSend({t:'ehit',id:e.sid,dmg:0});
  e.hp-=dmg;e.hitFlash=0.08;
  dmgNum(e.pos,dmg,'');
  if(f&&dir)impulse(e,dir,f,0.1);
  if(slow)e.slowT=Math.max(e.slowT,slow);
  if(e.hp<=0)tueEnemy(e,dir||V3(0,0,1),f||150);
}
/* ---------- boucle principale ---------- */
let last=performance.now(),phase=0,uiT=0,saveT=0,curZone=null,moteT=0,stepT=0,fumT=0;
function tick(now){
  requestAnimationFrame(tick);
  let dt=Math.min(0.05,(now-last)/1000);last=now;
  rigTickAll(now);
  if(!G.started){renderer.render(scene,camera);return;}
  if(hitstop>0){hitstop-=dt;renderer.render(scene,camera);return;}
  G.playTime+=dt;
  const mountMult=G.activeMount>0?MOUNT_DEF[G.activeMount].mult:1;
  const maxSp=statSpd()*mountMult;
  const spd=Math.hypot(player.vel.x,player.vel.z);
  phase+=dt*(4+spd*1.6);
  if(spd>4.5&&player.pos.y<0.05&&!G.flying){
    stepT-=dt;
    if(stepT<=0){stepT=0.26;
      spawnPart(player.pos.x,0.12,player.pos.z,3,{col:0x6a6252,spd:1.2,up:1.6,grav:5,life:0.4});}}
  moteT-=dt;
  if(moteT<=0){moteT=0.35;
    spawnPart(player.pos.x+rand(-13,13),rand(0.4,3.2),player.pos.z+rand(-13,13),2,
      {col:0x8a8468,spd:0.3,up:0.4,grav:-0.15,drag:0.99,life:3.5});}
  Object.keys(G.cds).forEach(k=>{G.cds[k]-=dt;if(G.cds[k]<=0)delete G.cds[k];});
  for(let i=buffs.length-1;i>=0;i--){buffs[i].t-=dt;if(buffs[i].t<=0)buffs.splice(i,1);}

  /* --- joueur : intentions (ZQSD/stick uniquement, plus de clic-déplacement) --- */
  if(!player.dead&&player.stagger<=0&&!player.dash&&!player.grab){
    let ix=(keysMove.r?1:0)-(keysMove.l?1:0),iz=(keysMove.f?1:0)-(keysMove.b?1:0);
    if(!ix&&!iz&&touchVec){ix=touchVec.x;iz=touchVec.z;}
    if(ix||iz){
      const yaw=G.camMode==='tps'?camYaw:Math.PI;
      const n=Math.hypot(ix,iz);ix/=n;iz/=n;
      const dx=Math.sin(yaw)*iz-Math.cos(yaw)*ix,dz=Math.cos(yaw)*iz+Math.sin(yaw)*ix;
      if(!player.attack)player.facing=Math.atan2(dx,dz);
      const mv=player.attack?0.72:1; // on peut marcher en attaquant, un peu ralenti
      player.vel.x+=(dx*maxSp*mv-player.vel.x)*Math.min(1,dt*8);
      player.vel.z+=(dz*maxSp*mv-player.vel.z)*Math.min(1,dt*8);
    } else if(!player.attack){player.vel.x*=Math.pow(0.0001,dt);player.vel.z*=Math.pow(0.0001,dt);}
    // cible : l'attaque de base s'enchaîne dès qu'à portée
    if(player.targetEnemy){
      if(player.targetEnemy.state==='dead'||!enemies.includes(player.targetEnemy))player.targetEnemy=null;
      else{const e=player.targetEnemy,d=dist2D(player.pos,e.pos);
        const portee=CL().ranged?CL().range:2.4;
        if(d<=portee)attaqueBase();}}
  }
  player.stagger=Math.max(0,player.stagger-dt);
  player.invuln=Math.max(0,player.invuln-dt);
  player.cdR=Math.max(0,player.cdR-dt);
  G.dashCharge=Math.min(dashDef().n,(G.dashCharge===undefined?2:G.dashCharge)+dt/dashDef().cd);
  if(player.dash){
    const D=player.dash;D.t+=dt;
    player.vel.x=D.dir.x*32;player.vel.z=D.dir.z*32;
    if(D.evade){ // traînée de vitesse
      for(let ti=0;ti<3;ti++)spawnPart(
        player.pos.x-D.dir.x*rand(0.2,1.4)+rand(-0.25,0.25),
        rand(0.3,1.3),
        player.pos.z-D.dir.z*rand(0.2,1.4)+rand(-0.25,0.25),
        1,{col:CFX().light,spd:0.4,up:0,grav:0,drag:0.9,life:0.22});
      if(Math.random()<0.7)spawnPart(
        player.pos.x+rand(-1.6,1.6),rand(0.5,1.6),player.pos.z+rand(-1.6,1.6),
        1,{col:0xd8d2be,spd:1,up:0,grav:0,drag:0.98,life:0.12,
           dx:-D.dir.x*14,dz:-D.dir.z*14});}
    if(D.m>0)enemies.forEach(e=>{if(D.hit.has(e))return;
      if(dist2D(e.pos,player.pos)<1.4){D.hit.add(e);
        hurtEnemy(e,Math.round(baseDmg()*D.m*tagMult(D.tg||['melee'])),
          V3(D.dir.x+rand(-0.4,0.4),0,D.dir.z+rand(-0.4,0.4)).normalize(),D.f||500);}});
    if(D.t>=D.dur){player.dash=null;player.vel.multiplyScalar(0.2);}
  }
  if(player.grab){
    const gb=player.grab;gb.t+=dt;
    const e=gb.e;
    if(!enemies.includes(e)){player.grab=null;}
    else{
      const a=player.facing+gb.t*13;
      e.pos.set(player.pos.x+Math.sin(a)*1.4,player.pos.y+0.9,player.pos.z+Math.cos(a)*1.4);
      e.mesh.rotation.z=gb.t*10;
      if(gb.t>0.55){
        const dir=faceDir();
        e.state='stagger';e.pos.y=0.9;
        e.vel.set(dir.x*gb.v,4.5,dir.z*gb.v);
        e.mesh.rotation.z=0;
        hurtEnemy(e,Math.round(baseDmg()*0.8*tagMult(['ctrl'])),dir,120);
        player.grab=null;shake=Math.max(shake,0.5);
      }}
  }
  if(G.activeMount===3){
    el('vol-ctl').style.display='flex';
    if(volKeys.up)G.altitude=Math.min(24,G.altitude+dt*7);
    if(volKeys.dn)G.altitude=Math.max(0,G.altitude-dt*8);
    G.flying=G.altitude>0.3;
  }
  const gy=terrainH(player.pos.x,player.pos.z);
  if(!G.flying){
    if(player.pos.y>gy||player.vel.y>0)player.vel.y-=22*dt;
    player.pos.y+=player.vel.y*dt;
    if(player.pos.y<gy){player.pos.y=gy;player.vel.y=0;}
    else if(player.vel.y<=0&&player.pos.y-gy<0.6)player.pos.y=gy;
  }else{player.pos.y+=(gy+G.altitude-player.pos.y)*Math.min(1,dt*4);player.vel.y=0;}
  player.pos.x+=player.vel.x*dt;player.pos.z+=player.vel.z*dt;
  player.pos.x=clamp(player.pos.x,-375,375);player.pos.z=clamp(player.pos.z,-375,375);
  collideObstacles(player);
  if(player.stagger>0){player.vel.x*=Math.pow(0.02,dt);player.vel.z*=Math.pow(0.02,dt);}
  if(player.attack){
    player.attack.t+=dt;
    const AA=player.attack;
    if(AA.anim==='slash'||AA.anim==='spin'||AA.anim==='sweep'){
      const prog=AA.t/AA.dur;
      const ang=player.facing+(AA.anim==='spin'?prog*Math.PI*2:(prog-0.45)*2.4);
      spawnPart(player.pos.x+Math.sin(ang)*1.5,1.35,player.pos.z+Math.cos(ang)*1.5,2,
        {col:0xc8b06a,spd:0.5,up:0.3,grav:2,drag:0.95,life:0.26});}
    if(!player.attack.done&&player.attack.t>=player.attack.hitAt){player.attack.done=true;player.attack.fn();}
    if(player.attack.t>=player.attack.dur)player.attack=null;
  }

  /* --- zones au sol --- */
  for(let i=zonesFx.length-1;i>=0;i--){
    const z=zonesFx[i];z.t-=dt;z.tick-=dt;
    if(z.tick<=0){z.tick=0.5;
      if(!z.ghost)[...enemies].forEach(e=>{if(dist2D(e.pos,{x:z.x,z:z.z})<z.r){
        const dd=V3(e.pos.x-z.x,0,e.pos.z-z.z).normalize();
        dmgLight(e,Math.max(1,Math.round(z.dmg*0.4)),dd,z.f*0.4,z.slow);}});}
    z.mesh.material.opacity=0.4*Math.min(1,z.t);
    if(z.t<=0){scene.remove(z.mesh);zonesFx.splice(i,1);}
  }

  /* --- effets temporaires (télégraphes) --- */
  for(let i=fxTemp.length-1;i>=0;i--){
    const f=fxTemp[i];f.t+=dt;const k=f.t/f.dur;
    if(f.mode==='fade')f.mesh.material.opacity*= (1-k*0.12);
    else if(f.mode==='grow'){f.mesh.scale.setScalar(0.25+0.75*Math.min(1,k*1.4));f.mesh.material.opacity=0.32*(1-k);}
    else if(f.mode==='shrink'){f.mesh.scale.setScalar(Math.max(0.12,1-k*0.9));f.mesh.material.opacity=0.5*(1-k);}
    if(f.mode==='fade')f.mesh.material.opacity=(f.mesh.material.opacity)*(1-k)+0.0;
    if(f.t>=f.dur){scene.remove(f.mesh);fxTemp.splice(i,1);}
  }

  /* --- ennemis --- */
  const safe=enSecurite(player.pos);
  let danger=false;
  rigBudget=6;
  enemies.forEach(e=>{
    const dLOD=dist2D(e.pos,player.pos);
    /* 48 u ≈ large marge au-delà du champ de la caméra ; avec le peuplement ×7,
       95 u laissait ~300 rigs actifs. Les mobs possédés (owner MP) simulent à 140. */
    if(dLOD>48){e.mesh.visible=false;if(e.bar)e.bar.el.style.display='none';
      if(!(e.sid&&e.owned)||dLOD>140){
        /* hors de vue et hors simulation : évasion instantanée — le mob gelé
           en pleine poursuite rentrerait sinon jamais au camp */
        if(e.state!=='idle'&&e.state!=='dead'&&e.state!=='grabbed'&&!(e.sid&&!e.owned)){
          e.state='idle';e.hp=e.maxHp;e.pos.x=e.home.x;e.pos.z=e.home.z;
          e.vel.set(0,0,0);e.cible=null;e.aggroCd=1.5;
          e.mesh.position.copy(e.pos);}
        return;}}
    else{e.mesh.visible=true;
      if(e.rigKey&&!e.mesh.userData.rig&&!e.rigAsked&&rigBudget>0){
        e.rigAsked=1;rigBudget--;attachRig(e.mesh,e.rigKey,{scale:e.rigScale});}}
    if(e.sid&&!e.owned){mpMobNetTick(e,dt);return;}
    if(e.state==='grabbed'){e.mesh.position.copy(e.pos);return;}
    e.t+=dt;e.twitch+=dt;e.slowT=Math.max(0,e.slowT-dt);
    e.rageT=Math.max(0,(e.rageT||0)-dt);
    e.spCd=Math.max(0,(e.spCd===undefined?rand(1,3):e.spCd)-dt);
    if(e.bk)for(const bkK in e.bk)e.bk[bkK]=Math.max(0,e.bk[bkK]-dt);
    if(e.dot){e.dot.tick-=dt;e.dot.t-=dt;
      if(e.dot.tick<=0){e.dot.tick=0.5;
        dmgLight(e,Math.max(1,Math.round(e.dot.dps*0.5*((curSpec().tg||{}).dot||1))),null,0);}
      if(e.dot&&e.dot.t<=0)e.dot=null;}
    if(e.tele&&e.state!=='windup')e.tele.material.opacity=0;
    if(e.hitFlash>0){e.hitFlash-=dt;
      e.mesh.userData.parts.torse.material.emissive&&e.mesh.userData.parts.torse.material.emissive.setHex(e.hitFlash>0?0x441111:0x000000);
      rigFlash(e.mesh,e.hitFlash>0);}else rigFlash(e.mesh,false);
    const dP=dLOD,esp=Math.hypot(e.vel.x,e.vel.z);
    const vitesse=e.def.speed*(e.slowT>0?0.45:1);
    if(e.state==='chase'||e.state==='windup')if(dP<26)danger=true;
    if(e.state==='edash'){
      e.castT-=dt;
      e.vel.x=e.dashDir.x*15;e.vel.z=e.dashDir.z*15;
      e.mesh.rotation.y=Math.atan2(e.dashDir.x,e.dashDir.z);
      if(!e.dashHit&&dist2D(e.pos,player.pos)<1.4+e.radius){e.dashHit=true;
        hurtPlayer(Math.round(e.dmg*(e.dashMult||1.3)),e.dashDir,620);
        dmgPhy(player.pos,'BAM !');}
      if(e.castT<=0){e.state='chase';e.vel.x*=0.2;e.vel.z*=0.2;}
    }else if(e.state==='fuse'){
      e.castT-=dt;e.vel.x=e.vel.z=0;
      e.mesh.scale.setScalar(1+0.3*(1-e.castT)+0.08*Math.sin(e.castT*45));
      if(e.castT<=0){
        onde(e.pos.x,e.pos.z,0xc85a1a,1.3);sfx('slam');shake=Math.max(shake,0.5);
        spawnPart(e.pos.x,1,e.pos.z,26,{col:0xd8622a,spd:6,up:4,life:0.6});
        if(dist2D(player.pos,e.pos)<3.4){
          const dxp=V3(player.pos.x-e.pos.x,0,player.pos.z-e.pos.z).normalize();
          hurtPlayer(Math.round(e.dmg*1.8),dxp,780);}
        enemies.forEach(o=>{if(o!==e&&o.state!=='dead'&&dist2D(o.pos,e.pos)<3.4){
          const dd2=V3(o.pos.x-e.pos.x,0,o.pos.z-e.pos.z).normalize();
          hurtEnemy(o,Math.round(e.dmg*1.2),dd2,500);}});
        tueEnemy(e,V3(0,0,1),350);return;}
    }else if(e.state==='slam'){
      e.castT-=dt;e.vel.x=e.vel.z=0;
      e.mesh.userData.parts.torse.rotation.x=-0.7*(1-e.castT);
      if(e.tele){e.tele.material.opacity=0.12+0.35*(1-e.castT);e.tele.scale.setScalar(2.6);}
      if(e.castT<=0){
        e.mesh.userData.parts.torse.rotation.x=0.3;rigOneShot(e.mesh,e.def&&e.def.tir?'eshoot':'eatk',0.5);
        onde(e.pos.x,e.pos.z,0xc89a4a,1.6);sfx('slam');shake=Math.max(shake,0.7);
        spawnPart(e.pos.x,0.4,e.pos.z,24,{col:0x8a7a5a,spd:4,up:5,life:0.6});
        const rS=4.4*(e.def.boss?1.25:1);
        if(dist2D(player.pos,e.pos)<rS){
          const dxp=V3(player.pos.x-e.pos.x,0,player.pos.z-e.pos.z).normalize();
          hurtPlayer(Math.round(e.dmg*1.4),dxp,900);player.vel.y=6;}
        if(e.tele)e.tele.scale.setScalar(1);
        e.state='chase';}
    }else if(e.state==='bcast'){
      e.castT-=dt;e.vel.x=e.vel.z=0;
      e.mesh.userData.parts.brasD.rotation.x=-2.2*(1-e.castT);
      if(e.castT<=0){
        const K=e.castK||{};
        if(K.k==='volley'){
          const baseA=Math.atan2(player.pos.x-e.pos.x,player.pos.z-e.pos.z);
          for(let si=0;si<(K.n||3);si++){
            const aa=baseA+(si-((K.n||3)-1)/2)*0.16;
            tirer({from:e.pos,dir:V3(Math.sin(aa),0,Math.cos(aa)),dmg:e.dmg,force:420,ally:false,
              col:K.slow?0x8a94c8:0x8a5c4a,speed:17,slowP:K.slow});}
          if(MP.on&&e.sid&&e.owned)mpSend({t:'fx',k:'eshot',eid:e.sid,f:+baseA.toFixed(3),n:K.n||3,s:K.slow?1:0});}
        else if(K.k==='storm'){for(let si=0;si<(K.n||8);si++){const aa=si/(K.n||8)*6.283;
          tirer({from:e.pos,dir:V3(Math.sin(aa),0,Math.cos(aa)),dmg:e.dmg,force:420,ally:false,col:0xd8d2be,speed:14});}
          if(MP.on&&e.sid&&e.owned)mpSend({t:'fx',k:'estorm',eid:e.sid,n:K.n||8});}
        else if(K.k==='cone'){
          const fwd=V3(Math.sin(e.mesh.rotation.y),0,Math.cos(e.mesh.rotation.y));
          const to=V3(player.pos.x-e.pos.x,0,player.pos.z-e.pos.z);const dpp=to.length();to.normalize();
          if(dpp<7&&fwd.dot(to)>0.5){hurtPlayer(Math.round(e.dmg*1.1),to,1000);dmgPhy(player.pos,'CRAC !');}}
        e.state='chase';}
    }else if(e.state==='stagger'){
      e.vel.x*=Math.pow(0.04,dt);e.vel.z*=Math.pow(0.04,dt);
      if(esp<1.2&&e.pos.y<=terrainH(e.pos.x,e.pos.z)+0.01)e.state='chase';
    }else if(e.state==='retour'){
      /* désengagé : rentre au camp, insensible, régénère — plus de trains de mobs */
      const dxh=e.home.x-e.pos.x,dzh=e.home.z-e.pos.z,dh=Math.hypot(dxh,dzh);
      if(dh<2){e.state='idle';e.hp=e.maxHp;e.vel.x=e.vel.z=0;e.aggroCd=1.5;}
      else{e.vel.x=dxh/dh*vitesse*1.3;e.vel.z=dzh/dh*vitesse*1.3;
        e.mesh.rotation.y=Math.atan2(dxh,dzh);
        if(e.hp<e.maxHp)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*dt*0.35);}
    }else if(e.state==='idle'){
      e.aggroCd=Math.max(0,(e.aggroCd||0)-dt);
      if(e.def.craintif){ // bête craintive : elle fuit, elle n'attaque que blessée
        if(dP<9&&!player.dead){
          e.wander=V3(e.pos.x+(e.pos.x-player.pos.x)*2,0,e.pos.z+(e.pos.z-player.pos.z)*2);e.t=0;}
      }
      else if(e.aggroCd<=0&&dP<e.def.aggro&&!player.dead&&!G.flying&&!safe&&!enSecurite(e.pos))e.state='chase';
      else if(e.aggroCd<=0&&e.owned&&mpNearestRemote(e,e.def.aggro))e.state='chase';
      if(e.state==='idle'&&e.t>3){e.t=0;
        const wr=e.spawner?Math.max(4,e.spawner.r):5;
        e.wander=Math.random()<0.75?V3(e.home.x+rand(-wr,wr),0,e.home.z+rand(-wr,wr)):null;}
      if(e.wander){const dx=e.wander.x-e.pos.x,dz=e.wander.z-e.pos.z,d=Math.hypot(dx,dz);
        const fuite=e.def.craintif&&dP<14?0.95:0.35;
        if(d>0.5){e.vel.x=dx/d*vitesse*fuite;e.vel.z=dz/d*vitesse*fuite;
          e.mesh.rotation.y=Math.atan2(dx,dz);}else{e.vel.x=e.vel.z=0;e.wander=null;}}
      else{e.vel.x*=Math.pow(0.02,dt);e.vel.z*=Math.pow(0.02,dt);}
    }else if(e.state==='chase'){
      /* laisse : trop loin du camp, ou plus de cible → on rentre */
      const LEASH_E=e.def.boss?46:34;
      let cible=(player.dead||G.flying||safe)?null:player,dc=cible?dP:1e9;
      allies.forEach(al=>{const d2=dist2D(e.pos,al.pos);if(d2<dc*0.7){cible=al;dc=d2;}});
      if(e.owned){const nr=mpNearestRemote(e,dc*0.7);
        if(nr){cible={remote:nr.r,pos:{x:nr.r.cur.x,z:nr.r.cur.z}};dc=nr.d;}}
      /* rageT : venir d'être frappé maintient la poursuite au-delà de la
         portée d'aggro (sinon un archer décroche au premier recul) */
      if(!cible||(dc>e.def.aggro*2.2&&!(e.rageT>0))||dist2D(e.pos,e.home)>LEASH_E){
        e.state='retour';e.vel.x=e.vel.z=0;e.cible=null;}
      else{
        e.cible=cible;
        if(cible===player&&trySpecial(e,dP)){}
        else{
        if(e.def.tir&&dc<15&&dc>4){e.state='windup';e.atkT=0;e.vel.x=e.vel.z=0;}
        else if(dc<1.5+e.radius){e.state='windup';e.atkT=0;e.vel.x=e.vel.z=0;}
        else{const dx=cible.pos.x-e.pos.x,dz=cible.pos.z-e.pos.z;
          e.vel.x=dx/dc*vitesse;e.vel.z=dz/dc*vitesse;
          e.mesh.rotation.y=Math.atan2(dx,dz);}}
        }
    }else if(e.state==='windup'){
      e.atkT+=dt;
      e.mesh.userData.parts.torse.rotation.x=-0.5*Math.min(1,e.atkT/0.55);
      if(e.tele){e.tele.material.opacity=0.06+0.3*Math.min(1,e.atkT/0.55);
        e.tele.scale.setScalar(e.def.tir?0.6:1);}
      if(e.atkT>0.55){
        e.mesh.userData.parts.torse.rotation.x=0.3;rigOneShot(e.mesh,e.def&&e.def.tir?'eshoot':'eatk',0.5);
        const cible=e.cible&&(e.cible===player||allies.includes(e.cible)||e.cible.remote)?e.cible:player;
        if(cible.remote){cible.pos={x:cible.remote.cur.x,z:cible.remote.cur.z};}
        const dC=dist2D(e.pos,cible.pos);
        if(e.def.tir||e.forceTir){e.forceTir=false;
          const nsh=e.def.shots||1;
          const baseA=Math.atan2(cible.pos.x-e.pos.x,cible.pos.z-e.pos.z);
          for(let si=0;si<nsh;si++){
            const aa=baseA+(si-(nsh-1)/2)*0.2;
            tirer({from:e.pos,dir:V3(Math.sin(aa),0,Math.cos(aa)),dmg:e.dmg,force:420,ally:false,
              col:e.def.webs?0x8a94c8:0x8a5c4a,speed:16,slowP:e.def.webs});}
          if(MP.on&&e.sid&&e.owned)mpSend({t:'fx',k:'eshot',eid:e.sid,f:+baseA.toFixed(3),n:nsh,s:e.def.webs?1:0});
        }else if(dC<2.2){
          const dir=V3(cible.pos.x-e.pos.x,0,cible.pos.z-e.pos.z).normalize();
          if(cible===player){hurtPlayer(e.dmg,dir,e.def.boss?620:260);
            if(e.def.strangle)addBuff('spd',0.62,2);}
          else if(cible.remote){mpSend({t:'eatkp',eid:e.sid,pid:cible.remote.id,dmg:e.dmg,
            fx:dir.x,fz:dir.z,force:e.def.boss?620:260});}
          else{cible.hp-=e.dmg;impulse(cible,dir,220);dmgNum(cible.pos,e.dmg,'joueur');}
          if(e.def.leech&&e.state!=='dead'){e.hp=Math.min(e.maxHp,e.hp+e.dmg*2);dmgNum(e.pos,'+'+(e.dmg*2),'soin');}}
        e.state='chase';e.atkT=0;}
    }
    const egy=terrainH(e.pos.x,e.pos.z);
    if(e.pos.y>egy||e.vel.y!==0){e.vel.y-=22*dt;e.pos.y+=e.vel.y*dt;
      if(e.pos.y<egy){e.pos.y=egy;
        if(Math.abs(e.vel.y)>4){sang(e.pos.x,e.pos.z,0.7);shake=Math.max(shake,0.15);
          spawnPart(e.pos.x,0.3,e.pos.z,12,{col:0x7a705c,spd:3.5,up:2.5,grav:6,life:0.5});
          const dgl=Math.round((Math.abs(e.vel.y)-3)*3.2);
          if(dgl>0&&e.state!=='dead'){e.hp-=dgl;dmgPhy(e.pos,'PLOF !');
            if(e.hp<=0)tueEnemy(e,V3(0,0,1),150);}}
        e.vel.y=0;}}
    else e.pos.y=egy;
    e.pos.x+=e.vel.x*dt;e.pos.z+=e.vel.z*dt;
    collideObstacles(e);
    majBar(e,dLOD);
    e.punch=Math.max(0,(e.punch||0)-dt*4);
    e.mesh.scale.setScalar(1+(e.punch||0)*1.6);
    const pt=e.mesh.userData.parts;
    if(Math.sin(e.twitch*7)>0.995)pt.tete.rotation.z=rand(-0.4,0.4);
    pt.tete.rotation.z*=0.94;
    animeHumanoide(e.mesh,phase+e.home.x,esp,null);
  });

  /* --- serviteurs --- */
  for(let i=allies.length-1;i>=0;i--){
    const al=allies[i];al.t-=dt;al.atkCd=Math.max(0,al.atkCd-dt);
    if(al.t<=0||al.hp<=0){onde(al.pos.x,al.pos.z,0x5a6a4a,0.6);scene.remove(al.mesh);allies.splice(i,1);continue;}
    let best=null,bd=14;
    enemies.forEach(e=>{const d=dist2D(e.pos,al.pos);if(d<bd){bd=d;best=e;}});
    let mx=0,mz=0;
    if(best){
      if(bd>1.3){mx=(best.pos.x-al.pos.x)/bd;mz=(best.pos.z-al.pos.z)/bd;}
      else if(al.atkCd<=0){al.atkCd=1.2;
        const dir=V3(best.pos.x-al.pos.x,0,best.pos.z-al.pos.z).normalize();
        hurtEnemy(best,al.dmg,dir,160);}
    }else{const dp=dist2D(player.pos,al.pos);
      if(dp>3){mx=(player.pos.x-al.pos.x)/dp;mz=(player.pos.z-al.pos.z)/dp;}}
    al.vel.x+=(mx*4.6-al.vel.x)*Math.min(1,dt*6);
    al.vel.z+=(mz*4.6-al.vel.z)*Math.min(1,dt*6);
    al.pos.x+=al.vel.x*dt;al.pos.z+=al.vel.z*dt;
    collideObstacles(al);
    al.pos.y=terrainH(al.pos.x,al.pos.z);
    al.mesh.rotation.y=Math.atan2(al.vel.x,al.vel.z);
    animeHumanoide(al.mesh,phase+al.phase,Math.hypot(al.vel.x,al.vel.z),null);
  }

  /* --- projectiles --- */
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i];p.t+=dt;
    p.pos.x+=p.vel.x*dt;p.pos.z+=p.vel.z*dt;
    if(p.ally&&Math.random()<0.7)spawnPart(p.pos.x,p.pos.y,p.pos.z,1,
      {col:p.mesh.material.color.getHex(),spd:0.25,up:0,grav:0.4,drag:0.9,life:0.3});
    let dead=p.t>p.life;
    if(p.ghost){/* écho distant : purement visuel */}
    else if(p.ally){
      for(const e of enemies){
        if(p.hit.has(e))continue;
        if(dist2D(e.pos,p.pos)<e.radius+0.45){
          p.hit.add(e);
          const dir=V3(p.vel.x,0,p.vel.z).normalize();
          hurtEnemy(e,p.dmg,dir,p.force);
          if(p.pull){const dd=V3(player.pos.x-e.pos.x,0,player.pos.z-e.pos.z).normalize();
            impulse(e,dd,760,0.25);}
          if(p.explode){onde(p.pos.x,p.pos.z,0xc8783a,0.9);sfx('slam');
            [...enemies].forEach(o=>{if(o!==e&&dist2D(o.pos,p.pos)<p.explode.r){
              const dd2=V3(o.pos.x-p.pos.x,0,o.pos.z-p.pos.z).normalize();
              hurtEnemy(o,p.explode.dmg,dd2,p.explode.f,{up:0.5});}});
            dead=true;break;}
          if(p.pierce-->0)continue;
          dead=true;break;}}
    }else{
      if(!player.dead&&dist2D(player.pos,p.pos)<0.7){
        const dir=V3(p.vel.x,0,p.vel.z).normalize();
        hurtPlayer(p.dmg,dir,p.force);if(p.slowP)addBuff('spd',0.6,1.6);dead=true;}
    }
    if(dead){scene.remove(p.mesh);projectiles.splice(i,1);}
  }

  /* --- collisions & cadavres --- */
  const bodies=[player,...enemies.filter(e=>e.mesh.visible),...allies];
  for(let i=0;i<bodies.length;i++)
    for(let j=i+1;j<bodies.length;j++)collideCircles(bodies[i],bodies[j]);
  for(let i=corpses.length-1;i>=0;i--){
    const c=corpses[i];c.corpseT-=dt;
    const cgy=terrainH(c.pos.x,c.pos.z);
    if(c.pos.y>cgy||Math.abs(c.vel.y)>0.01){c.vel.y-=22*dt;c.pos.y+=c.vel.y*dt;
      if(c.pos.y<cgy){c.pos.y=cgy;c.vel.y*=-0.32;c.angVel.multiplyScalar(0.6);
        if(Math.abs(c.vel.y)>1.5){sang(c.pos.x,c.pos.z);sfx('hit',0.5);}if(Math.abs(c.vel.y)<0.8)c.vel.y=0;}}
    c.pos.x+=c.vel.x*dt;c.pos.z+=c.vel.z*dt;
    c.vel.x*=Math.pow(0.05,dt);c.vel.z*=Math.pow(0.05,dt);
    c.mesh.rotation.x+=c.angVel.x*dt;c.mesh.rotation.y+=c.angVel.y*dt;c.mesh.rotation.z+=c.angVel.z*dt;
    if(c.pos.y<=cgy+0.01){c.angVel.multiplyScalar(Math.pow(0.02,dt));
      c.mesh.rotation.x+=(Math.PI/2*Math.sign(Math.sin(c.mesh.rotation.x)||1)-c.mesh.rotation.x)*Math.min(1,dt*3);
      c.mesh.position.y=cgy-0.55*(c.def.scale||1)*clamp(1-c.corpseT/14+0.3,0,0.8);}
    if(c.corpseT<2)c.mesh.traverse(o=>{if(o.material&&o.material.opacity!==undefined){o.material.transparent=true;o.material.opacity=Math.max(0,c.corpseT/2);}});
    if(c.corpseT<=0){scene.remove(c.mesh);corpses.splice(i,1);}
  }
  spawners.forEach(sp=>{
    if(sp.alive<sp.n){sp.respawnT-=dt;
      if(sp.respawnT<=0){spawnEnemy(sp.type,sp.lvl,sp.x+rand(-sp.r,sp.r),sp.z+rand(-sp.r,sp.r),sp);sp.alive++;sp.respawnT=16;}}});

  /* --- visuels joueur, monture, monde --- */
  const mm=G.activeMount>0?montureMeshes[G.activeMount]:null;
  montureMeshes.forEach((m,i)=>{if(m)m.visible=(i===G.activeMount);});
  if(mm){
    mm.position.copy(player.pos);mm.rotation.y=player.facing;
    mm.userData.jambes.forEach((leg,i)=>leg.rotation.x=Math.sin(phase*1.4+i*Math.PI/2)*Math.min(1,spd/4)*0.8);
    if(mm.userData.ailes)mm.userData.ailes.forEach((a,i)=>a.rotation.z=(i?1:-1)*(0.25+Math.sin(phase*2.2)*0.5));
    player.mesh.position.copy(player.pos).add(V3(0,1.35,0));
    player.mesh.rotation.y=player.facing;
    const pp=player.mesh.userData.parts;
    pp.jambeG.rotation.x=0.9;pp.jambeD.rotation.x=0.9;pp.jambeG.rotation.z=0.5;pp.jambeD.rotation.z=-0.5;
    const _pr=player.mesh.userData.rig;if(_pr&&!_pr.dead&&!_pr.oneshot)_rigBase(_pr,'sit',1);
  }else{
    player.mesh.position.copy(player.pos);
    player.mesh.rotation.y=player.facing;
    const pp=player.mesh.userData.parts;pp.jambeG.rotation.z=0;pp.jambeD.rotation.z=0;
    animeHumanoide(player.mesh,phase,spd,player.attack,G.classe);
  }
  if(player.targetEnemy&&enemies.includes(player.targetEnemy)){
    const te=player.targetEnemy;
    targetRing.visible=true;
    targetRing.position.set(te.pos.x,te.pos.y+0.06,te.pos.z);
    targetRing.scale.setScalar(te.radius*2.3*(1+0.08*Math.sin(now/140)));
  }else targetRing.visible=false;
  capeLight.position.copy(player.pos).add(V3(0,2.4,0));
  castLight.position.set(player.pos.x,1.6,player.pos.z);
  castLight.intensity=Math.max(0,castLight.intensity-dt*6.5);
  lune.position.set(player.pos.x-30,50,player.pos.z-20);
  lune.target.position.copy(player.pos);
  ciel.position.set(player.pos.x,0,player.pos.z);
  npcs.forEach(n=>{n.marker.rotation.y+=dt*1.5;
    n.marker.position.y=2.5+Math.sin(now/500)*0.12;
    const estQ=['maud','ivane','lom','ashka','ossian','maitre','sarment','noyee','cordier','muet'].includes(n.id);
    n.marker.visible=!estQ||questsDisponibles(n.id).length>0||questsPretes(n.id).length>0;});
  citizens.forEach(c=>{
    if(dist2D(c.pos,player.pos)>70){c.mesh.visible=false;return;}
    c.mesh.visible=true;c.t+=dt;
    if(c.t>4){c.t=0;c.wander=Math.random()<0.7?{x:c.home.x+rand(-9,9),z:c.home.z+rand(-9,9)}:null;}
    if(c.wander){const dx=c.wander.x-c.pos.x,dz=c.wander.z-c.pos.z,d=Math.hypot(dx,dz);
      if(d>0.5){c.pos.x+=dx/d*1.2*dt;c.pos.z+=dz/d*1.2*dt;c.mesh.rotation.y=Math.atan2(dx,dz);
        animeHumanoide(c.mesh,phase+c.phase,1.2,null);}else c.wander=null;}});
  torches.forEach(t=>{t.l.intensity=t.base+Math.sin(now/60+t.l.position.x)*0.35+rand(-0.1,0.1);
    t.flamme.scale.setScalar(0.9+rand(0,0.3));});
  /* gardes en patrouille */
  patrouilles.forEach(p=>{
    if(dist2D(p.mesh.position,player.pos)>80){p.mesh.visible=false;return;}
    p.mesh.visible=true;
    const pt=p.pts[p.i];
    const dx=pt.x-p.mesh.position.x,dz=pt.z-p.mesh.position.z,d=Math.hypot(dx,dz);
    if(d<0.6){p.i=(p.i+1)%p.pts.length;animeHumanoide(p.mesh,phase+p.ph,0,null);return;}
    p.mesh.position.x+=dx/d*1.7*dt;p.mesh.position.z+=dz/d*1.7*dt;
    p.mesh.position.y=terrainH(p.mesh.position.x,p.mesh.position.z);
    p.mesh.rotation.y=Math.atan2(dx,dz);
    animeHumanoide(p.mesh,phase+p.ph,1.7,null);});
  /* fumées de cheminées et feux de camp */
  fumT-=dt;
  if(fumT<=0){fumT=0.4;
    cheminees.forEach(c=>{if(dist2D(c,player.pos)>70)return;
      spawnPart(c.x,c.y,c.z,1,{col:0x50504a,spd:0.15,up:0.75,grav:-0.28,drag:0.985,life:2.8});});
    feux.forEach(f=>{if(dist2D(f,player.pos)>60)return;
      spawnPart(f.x,f.y+0.6,f.z,1,{col:Math.random()<0.5?0xd8862e:0x6a5a48,spd:0.25,up:1.1,grav:-0.4,drag:0.97,life:1.4});});}
  feux.forEach(f=>{f.flamme.scale.set(0.85+rand(0,0.3),0.8+rand(0,0.45),0.85+rand(0,0.3));
    f.lueur.material.opacity=0.13+rand(0,0.07);});
  brumes.forEach(b=>{b.position.x+=b.userData.v*dt;if(b.position.x>365)b.position.x=-365;});
  pendus.forEach(p=>{p.rotation.z=Math.sin(now/900+p.userData.ph)*0.14;});
  banniers.forEach((b,i)=>{b.rotation.x=Math.sin(now/700+i)*0.08;});
  for(let i=anneaux.length-1;i>=0;i--){const a=anneaux[i];a.t+=dt;
    a.m.scale.setScalar((1+a.t*9)*(a.m.userData.tl||1));a.m.material.opacity=0.7*(1-a.t/0.6);
    if(a.t>0.6){scene.remove(a.m);anneaux.splice(i,1);}}
  for(let i=dmgNums.length-1;i>=0;i--){const d=dmgNums[i];d.t-=dt;d.p.y+=d.vy*dt;
    const v=d.p.clone().project(camera);
    d.el.style.left=((v.x+1)/2*innerWidth)+'px';d.el.style.top=((-v.y+1)/2*innerHeight)+'px';
    d.el.style.opacity=Math.min(1,d.t*3);
    if(d.t<=0){d.el.remove();dmgNums.splice(i,1);}}

  /* --- musique dynamique --- */
  combatHeat+=((danger?1:0)-combatHeat)*Math.min(1,dt*(danger?2:0.4));
  musicTick();

  /* --- caméras --- */
  shake=Math.max(0,shake-dt*2.2);
  if(G.camMode==='arpg'){
    const camY=zoomA+player.pos.y*0.7,camZ=zoomA*0.7+player.pos.y*0.15;
    camera.position.lerp(V3(player.pos.x,player.pos.y+camY,player.pos.z+camZ),Math.min(1,dt*4.5));
    camera.position.x+=rand(-1,1)*shake*0.4;camera.position.y+=rand(-1,1)*shake*0.4;
    camera.lookAt(player.pos.x,player.pos.y+1,player.pos.z);
  }else{
    const cp=Math.cos(camPitch),sp2=Math.sin(camPitch);
    const bx=-Math.sin(camYaw)*cp,bz=-Math.cos(camYaw)*cp;
    const rx=Math.cos(camYaw),rz=-Math.sin(camYaw);
    const eye=V3(player.pos.x+bx*camDist+rx*0.55,
      Math.max(player.pos.y+1.7+sp2*camDist,terrainH(player.pos.x,player.pos.z)+0.5),
      player.pos.z+bz*camDist+rz*0.55);
    camera.position.lerp(eye,Math.min(1,dt*9));
    camera.position.x+=rand(-1,1)*shake*0.3;camera.position.y+=rand(-1,1)*shake*0.3;
    camera.lookAt(player.pos.x+Math.sin(camYaw)*2.5,player.pos.y+1.6,player.pos.z+Math.cos(camYaw)*2.5);
  }

  /* --- interface périodique --- */
  uiT-=dt;
  if(uiT<=0){uiT=0.35;
    const z=zoneAt(player.pos);
    curMusZone=z.id;
    if(dist2D(player.pos,ENVERS)<48)curMusZone='envers';
    secretTick();
    if(curZone!==z.id){curZone=z.id;
      toast(z.nom,z.tranche);}
    if(z.id==='capitale'){G.visited.capitale=true;questProgress('reach','capitale');}
    el('bous-zone').textContent=z.nom;
    el('bous-sub').textContent=z.tranche+(nodeProche()?'  ·  ⛏ E : récolter':'');
    const DD=dashDef();let ph='';
    for(let pi=0;pi<DD.n;pi++){
      const f=clamp(G.dashCharge-pi,0,1);
      ph+=`<span class="pip"><span class="pf" style="height:${Math.round(f*100)}%"></span></span>`;}
    el('dashpips').innerHTML=ph;
    ['lom','ashka','ossian'].forEach(id=>{
      const n=npcs.find(x=>x.id===id);
      if(n&&dist2D(player.pos,n)<9)questProgress('reach',id);});
    let boss=null;
    enemies.forEach(e=>{if(e.def.boss&&dist2D(e.pos,player.pos)<30)boss=e;});
    if(boss){el('bossbar').style.display='block';
      el('boss-nom').textContent=boss.def.nom+' — niveau '+boss.lvl;
      el('boss-hp').style.width=(boss.hp/boss.maxHp*100)+'%';}
    else el('bossbar').style.display='none';
    for(let i=0;i<6;i++){
      const s=el('sk-s'+i);let cd=s.querySelector('.cd');
      const rest=G.slots[i]?(G.cds[G.slots[i]]||0):0;
      if(rest>0){if(!cd){cd=document.createElement('div');cd.className='cd';s.appendChild(cd);}cd.textContent=Math.ceil(rest);}
      else if(cd)cd.remove();}
    const sr=el('sk-r');let cdr2=sr.querySelector('.cd');
    if(player.cdR>0){if(!cdr2){cdr2=document.createElement('div');cdr2.className='cd';sr.appendChild(cdr2);}cdr2.textContent=Math.ceil(player.cdR);}
    else if(cdr2)cdr2.remove();
  }
  updateParts(dt);
  updateLoot(dt,now);
  questItemsTick(dt,now);
  crittersTick(dt,now);
  cycleTick(dt,now);
  nodesTick(dt);
  sideTick(dt);
  saveT+=dt;if(saveT>20){saveT=0;save();}
  mpTick(dt,now,phase,spd);
  renderer.render(scene,camera);
}

