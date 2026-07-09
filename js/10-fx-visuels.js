'use strict';
/* ---------- effets de lancement (télégraphes) ---------- */
function fxPush(mesh,dur,mode){mesh.position.y=Math.max(mesh.position.y,0.04);scene.add(mesh);
  fxTemp.push({mesh,t:0,dur,mode});}
function fxSector(pos,facing,range,halfAngle,color){
  const g=new THREE.CircleGeometry(range,26,(facing-Math.PI/2)-halfAngle,halfAngle*2);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.3,side:THREE.DoubleSide,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.set(pos.x,terrainH(pos.x,pos.z)+0.05,pos.z);fxPush(m,0.32,'fade');}
function fxBurst(x,z,r,color){
  const m=new THREE.Mesh(new THREE.CircleGeometry(r,26),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.32,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.set(x,terrainH(x,z)+0.05,z);m.scale.setScalar(0.25);fxPush(m,0.3,'grow');}
function fxImplode(x,z,r,color){
  const m=new THREE.Mesh(new THREE.RingGeometry(r*0.8,r,26),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.5,side:THREE.DoubleSide,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.set(x,terrainH(x,z)+0.06,z);fxPush(m,0.35,'shrink');}
function fxFlash(pos,facing,color){
  const m=new THREE.Mesh(new THREE.CircleGeometry(0.5,10),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.6,depthWrite:false}));
  m.rotation.x=-Math.PI/2;
  m.position.set(pos.x+Math.sin(facing)*1.1,1.25,pos.z+Math.cos(facing)*1.1);
  fxPush(m,0.14,'fade');}

/* ---------- système de particules ---------- */
const PMAX=900;
const pPos=new Float32Array(PMAX*3),pCol=new Float32Array(PMAX*3);
const pVel=new Float32Array(PMAX*3),pLife=new Float32Array(PMAX),pGrav=new Float32Array(PMAX),pDrag=new Float32Array(PMAX);
for(let i=0;i<PMAX;i++)pPos[i*3+1]=-100;
const pGeo=new THREE.BufferGeometry();
pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
pGeo.setAttribute('color',new THREE.BufferAttribute(pCol,3));
const pMat=new THREE.PointsMaterial({size:0.17,vertexColors:true,transparent:true,opacity:0.95,depthWrite:false,sizeAttenuation:true});
const pPoints=new THREE.Points(pGeo,pMat);
pPoints.frustumCulled=false;scene.add(pPoints);
let pIdx=0;
const _pc=new THREE.Color();
function spawnPart(x,y,z,n,o={}){
  _pc.setHex(o.col===undefined?0xffffff:o.col);
  const sp=o.spd===undefined?3:o.spd;
  for(let k=0;k<n;k++){
    const i=pIdx;pIdx=(pIdx+1)%PMAX;
    pPos[i*3]=x+rand(-0.16,0.16);pPos[i*3+1]=y+rand(-0.16,0.16);pPos[i*3+2]=z+rand(-0.16,0.16);
    const a=rand(0,Math.PI*2),r=rand(0.2,1);
    pVel[i*3]=Math.cos(a)*sp*r+(o.dx||0);
    pVel[i*3+1]=(o.up===undefined?sp*0.7:o.up)*rand(0.3,1);
    pVel[i*3+2]=Math.sin(a)*sp*r+(o.dz||0);
    pLife[i]=(o.life||0.6)*rand(0.7,1.15);
    pGrav[i]=o.grav===undefined?9:o.grav;
    pDrag[i]=o.drag===undefined?0.88:o.drag;
    const vr=rand(0.7,1.2);
    pCol[i*3]=Math.min(1,_pc.r*vr);pCol[i*3+1]=Math.min(1,_pc.g*vr);pCol[i*3+2]=Math.min(1,_pc.b*vr);
  }
}
function updateParts(dt){
  const dr8=dt*8;
  for(let i=0;i<PMAX;i++){
    if(pLife[i]<=0)continue;
    pLife[i]-=dt;
    if(pLife[i]<=0){pPos[i*3+1]=-100;continue;}
    pVel[i*3+1]-=pGrav[i]*dt;
    const d=Math.pow(pDrag[i],dr8);
    pVel[i*3]*=d;pVel[i*3+2]*=d;
    pPos[i*3]+=pVel[i*3]*dt;pPos[i*3+1]+=pVel[i*3+1]*dt;pPos[i*3+2]+=pVel[i*3+2]*dt;
    if(pPos[i*3+1]<0.03&&pVel[i*3+1]<0){pPos[i*3+1]=0.03;pVel[i*3+1]*=-0.28;pVel[i*3]*=0.6;pVel[i*3+2]*=0.6;}
  }
  pGeo.attributes.position.needsUpdate=true;
  pGeo.attributes.color.needsUpdate=true;
}
/* ---------- onomatopées : dégâts PHYSIQUES (collisions, chutes, murs) ---------- */
const PHY_WORDS=['CRAC !','BAM !','PAF !','VLAN !','BOUM !'];
function dmgPhy(pos,word){
  const d=document.createElement('div');d.className='dmg phy';
  d.textContent=word||pickR(PHY_WORDS);
  d.style.setProperty('--rot',rand(-14,14).toFixed(0)+'deg');
  document.body.appendChild(d);
  dmgNums.push({el:d,p:pos.clone().add(V3(rand(-.3,.3),2.1,0)),t:0.85,vy:2.1});
}
/* ---------- anneau de cible ---------- */
const targetRing=new THREE.Mesh(new THREE.RingGeometry(0.5,0.66,24),
  new THREE.MeshBasicMaterial({color:0xc84a2c,transparent:true,opacity:0.85,side:THREE.DoubleSide,depthWrite:false}));
targetRing.rotation.x=-Math.PI/2;targetRing.visible=false;scene.add(targetRing);
/* ---------- ciblage magnétique : le clic « colle » à l'ennemi proche du curseur ---------- */
function pick(cx,cy){
  mouse.x=(cx/innerWidth)*2-1;mouse.y=-(cy/innerHeight)*2+1;
  ray.setFromCamera(mouse,camera);
  const meshes=enemies.filter(e=>e.mesh.visible).map(e=>e.mesh);
  const hitE=ray.intersectObjects(meshes,true)[0];
  if(hitE){let m=hitE.object;while(m.parent&&!meshes.includes(m))m=m.parent;
    const e=enemies.find(x=>x.mesh===m);if(e)return{enemy:e};}
  // rattrapage écran : ennemi le plus proche du curseur (rayon 48 px)
  let best=null,bd=48;
  enemies.forEach(e=>{
    if(!e.mesh.visible||e.state==='dead')return;
    const v=e.pos.clone().add(V3(0,1,0)).project(camera);
    if(v.z>1)return;
    const sx=(v.x+1)/2*innerWidth,sy=(-v.y+1)/2*innerHeight;
    const d=Math.hypot(sx-cx,sy-cy);
    if(d<bd){bd=d;best=e;}});
  if(best)return{enemy:best};
  const nm=npcs.map(n=>n.mesh);
  const hitN=ray.intersectObjects(nm,true)[0];
  if(hitN){let m=hitN.object;while(m.parent&&!nm.includes(m))m=m.parent;
    const n=npcs.find(x=>x.mesh===m);if(n)return{npc:n};}
  const hitS=ray.intersectObject(solRay)[0];
  if(hitS)return{ground:hitS.point};
  return{};
}
/* ---------- clic : cibler / frapper / interagir — le déplacement est au clavier ---------- */
let touchVec=null;
function clic(cx,cy,shift){
  if(!G.started||player.dead)return;
  audioInit();
  const p=pick(cx,cy);
  if(p.enemy){
    player.targetEnemy=p.enemy;
    if(G.activeMount>0&&!G.flying)demonter();
    const d=dist2D(player.pos,p.enemy.pos);
    const portee=CL().ranged?CL().range:2.4;
    if(shift||d<=portee){
      player.facing=Math.atan2(p.enemy.pos.x-player.pos.x,p.enemy.pos.z-player.pos.z);
      attaqueBase();}
    return;}
  if(p.npc){
    player.targetEnemy=null;
    if(dist2D(player.pos,p.npc)<3.8)interagir(p.npc);
    else toast(p.npc.nom,'Approchez-vous — ZQSD / WASD');
    return;}
  if(p.ground){
    player.targetEnemy=null;
    player.facing=Math.atan2(p.ground.x-player.pos.x,p.ground.z-player.pos.z);
    attaqueBase();}
}
/* ---------- physique renforcée : les corps sont des armes ---------- */
function collideCircles(a,b){
  if(a.state==='grabbed'||b.state==='grabbed')return;
  const dx=b.pos.x-a.pos.x,dz=b.pos.z-a.pos.z;
  const d=Math.hypot(dx,dz),min=a.radius+b.radius;
  if(d<min&&d>0.0001){
    const nx=dx/d,nz=dz/d,pen=min-d,tm=a.mass+b.mass;
    a.pos.x-=nx*pen*(b.mass/tm);a.pos.z-=nz*pen*(b.mass/tm);
    b.pos.x+=nx*pen*(a.mass/tm);b.pos.z+=nz*pen*(a.mass/tm);
    const rvx=b.vel.x-a.vel.x,rvz=b.vel.z-a.vel.z;
    const vn=rvx*nx+rvz*nz;
    if(vn<0){const e2=0.42,j=-(1+e2)*vn/(1/a.mass+1/b.mass);
      a.vel.x-=j*nx/a.mass;a.vel.z-=j*nz/a.mass;
      b.vel.x+=j*nx/b.mass;b.vel.z+=j*nz/b.mass;
      const imp=Math.abs(vn);
      if(imp>3.5){if(b!==player&&b.state!=='dead')b.state='stagger';
        if(a!==player&&a.state!=='dead')a.state='stagger';}
      if(imp>5.5&&a!==player&&b!==player){
        const dg=Math.round(imp*2.2);
        const mx=(a.pos.x+b.pos.x)/2,mz=(a.pos.z+b.pos.z)/2;
        spawnPart(mx,1.1,mz,12,{col:0xd8d2be,spd:4.5,life:0.5});
        [a,b].forEach(x=>{if(x.hp!==undefined&&x.state!=='dead'){
          x.hp-=dg;dmgPhy(x.pos);sang(x.pos.x,x.pos.z);
          x.punch=Math.max(x.punch||0,0.12);
          if(x.hp<=0&&enemies.includes(x))tueEnemy(x,V3(nx,0,nz),260);}});
        sfx('hit',1.2);hitstop=Math.max(hitstop,0.06);shake=Math.max(shake,0.3);}
    }
  }
}
function collideObstacles(ent){
  if(G.flying&&ent===player)return;
  for(let i=0;i<obstacles.length;i++){
    const o=obstacles[i];
    const dx=ent.pos.x-o.x,dz=ent.pos.z-o.z;
    if(Math.abs(dx)>o.r+1||Math.abs(dz)>o.r+1)continue;
    const d=Math.hypot(dx,dz),min=o.r+ent.radius;
    if(d<min&&d>0.001){const nx=dx/d,nz=dz/d;
      ent.pos.x=o.x+nx*min;ent.pos.z=o.z+nz*min;
      const vn=ent.vel.x*nx+ent.vel.z*nz;
      if(vn<0){
        // percuter un mur, un arbre ou un pilier à grande vitesse fait mal
        if(-vn>8&&ent!==player&&enemies.includes(ent)&&ent.state!=='dead'){
          const dg=Math.round(-vn*2.4);
          ent.hp-=dg;dmgPhy(ent.pos,'CLONK !');
          sang(ent.pos.x,ent.pos.z);
          spawnPart(ent.pos.x,1,ent.pos.z,14,{col:0x9a927c,spd:5,life:0.5});
          sfx('hit',1.3);shake=Math.max(shake,0.25);
          ent.punch=Math.max(ent.punch||0,0.12);
          if(ent.hp<=0){tueEnemy(ent,V3(nx,0,nz),220);return;}}
        ent.vel.x-=vn*nx*1.5;ent.vel.z-=vn*nz*1.5;}}}
}

/* ---------- identité visuelle par classe : palette des sorts ---------- */
const CLASSFX={
 ecorcheur:   {arc:0xc85a30,cone:0xc85a30,burst:0xb0452c,pull:0x8a5a3a,light:0xd86a3a},
 briseroc:    {arc:0xd8b45a,cone:0xcaa64a,burst:0xc89a4a,pull:0x8a94a8,light:0xd8b45a},
 arbaletriere:{arc:0x9ab87a,cone:0x9ab87a,burst:0xa8c47a,pull:0x7a9a6a,light:0xb8d48a},
 flagellant:  {arc:0xc83a4a,cone:0xc83a4a,burst:0xb02a3a,pull:0xd84a5a,light:0xd84a5a},
 cendremage:  {arc:0xe8853a,cone:0xd8783a,burst:0xe8963a,pull:0x8a6ad8,light:0xf0a04a},
 ossuaire:    {arc:0xc8d4b0,cone:0xb8c4a0,burst:0xa8b890,pull:0x8a9a78,light:0xc8d4a8}};
function CFX(){return CLASSFX[G.classe]||CLASSFX.ecorcheur;}
const castLight=new THREE.PointLight(0xffffff,0,7);
castLight.position.y=1.6;scene.add(castLight);
/* ---------- armes de héros : une pièce maîtresse par classe ---------- */
function buildWeapon(classe){
  const w=new THREE.Group();
  const bois=mat(0x241a10),fer=mat(0x6e6f6a,0.35),cuir=mat(0x3a2a1a);
  if(classe==='ecorcheur'){
    const manche=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.05,1.15,6),bois);manche.position.y=-0.7;
    const grip=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,0.22,6),cuir);grip.position.y=-0.45;
    [-1,1].forEach(sd=>{
      const lame=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.4,0.05),fer);
      lame.position.set(0.19*sd,-1.12,0);lame.rotation.z=0.25*sd;w.add(lame);});
    const pointe=new THREE.Mesh(new THREE.ConeGeometry(0.045,0.16,4),fer);pointe.position.y=-1.34;pointe.rotation.x=Math.PI;
    w.add(manche,grip,pointe);
  }else if(classe==='briseroc'){
    const manche=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.065,1.3,6),bois);manche.position.y=-0.75;
    const bloc=new THREE.Mesh(new THREE.BoxGeometry(0.52,0.34,0.34),mat(0x54544c,0.55));bloc.position.y=-1.3;
    const rune=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.02),
      new THREE.MeshStandardMaterial({color:0xd8b45a,emissive:0x8a6a20,emissiveIntensity:0.8}));
    rune.position.set(0,-1.3,0.18);
    [-1,1].forEach(sd=>{const cercle=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.36,0.36),fer);
      cercle.position.set(0.25*sd,-1.3,0);w.add(cercle);});
    w.add(manche,bloc,rune);
  }else if(classe==='arbaletriere'){
    const fut=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.62,0.1),mat(0x2e2216));fut.position.y=-0.55;
    const crosse=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.2,0.14),cuir);crosse.position.y=-0.28;
    [-1,1].forEach(sd=>{const bras=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.05,0.04),mat(0x3c2c1a));
      bras.position.set(0.2*sd,-0.85,0);bras.rotation.z=-0.35*sd;w.add(bras);});
    const carreau=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.5,4),mat(0xb8a878));
    carreau.position.set(0,-0.62,0.06);
    const pointe=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.09,4),fer);pointe.position.set(0,-0.92,0.06);pointe.rotation.x=Math.PI;
    w.add(fut,crosse,carreau,pointe);
  }else if(classe==='flagellant'){
    const poignee=new THREE.Mesh(new THREE.CylinderGeometry(0.032,0.032,0.34,5),cuir);poignee.position.y=-0.48;
    let py=-0.68;
    for(let k=0;k<5;k++){
      const maille=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.13,0.03),mat(0x4a4a50,0.4));
      maille.position.set(Math.sin(k*1.2)*0.05,py,Math.cos(k*0.9)*0.04);
      maille.rotation.z=Math.sin(k)*0.4;w.add(maille);py-=0.14;}
    const barb=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.14,4),fer);barb.position.y=py-0.02;barb.rotation.x=Math.PI;
    w.add(poignee,barb);
  }else if(classe==='cendremage'){
    const fut=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.045,1.6,6),bois);fut.position.y=-0.35;
    const garde=new THREE.Mesh(new THREE.TorusGeometry(0.09,0.02,5,10),fer);garde.position.y=0.42;
    const braise=new THREE.Mesh(new THREE.OctahedronGeometry(0.12),
      new THREE.MeshStandardMaterial({color:0xe8853a,emissive:0xc85a10,emissiveIntensity:1}));
    braise.position.y=0.44;
    const lum=new THREE.PointLight(0xd8783a,0.55,3.2);lum.position.y=0.44;
    w.add(fut,garde,braise,lum);
    w.userData.orbe=braise;
  }else if(classe==='ossuaire'){
    const femur=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.05,1.25,5),mat(0xb8b09a,0.75));femur.position.y=-0.4;
    [[-1.0,-1],[0.22,1]].forEach(([yy])=>{});
    [-1.0,0.22].forEach(yy=>{const noeud=new THREE.Mesh(new THREE.SphereGeometry(0.075,6,6),mat(0xc8c0a8,0.7));
      noeud.position.y=yy;w.add(noeud);});
    const faux=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.1,0.04),mat(0xd8d2be,0.6));
    faux.position.set(0.2,0.3,0);faux.rotation.z=-0.5;
    w.add(femur,faux);
  }
  return w;
}
/* ---------- tenue distinctive de classe (personnage joueur) ---------- */
function classKit(mesh,classe,styleId){
  const P=mesh.userData.parts;if(!P)return;
  const add=(parent,m)=>parent.add(m);
  if(classe==='ecorcheur'){
    const col=new THREE.Mesh(new THREE.BoxGeometry(0.72,0.16,0.44),mat(0x3a2c1c,0.95));
    col.position.y=0.42;add(P.torse,col); // col de fourrure
    const tablier=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.55,0.04),mat(0x4a2018,0.9));
    tablier.position.set(0,-0.2,0.19);add(P.torse,tablier); // tablier taché
    const sangle=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.85,0.05),mat(0x241a10));
    sangle.position.set(0,0.05,0.2);sangle.rotation.z=0.7;add(P.torse,sangle);
  }else if(classe==='briseroc'){
    P.torse.scale.set(1.28,1.02,1.22); // carrure
    [-1,1].forEach(sd=>{
      const ep=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.22,0.4),mat(0x54544c,0.6));
      ep.position.set(0.44*sd,0.36,0);ep.rotation.z=-0.22*sd;add(P.torse,ep);});
    const ceinture=new THREE.Mesh(new THREE.BoxGeometry(0.68,0.12,0.4),mat(0x3a3228));
    ceinture.position.y=-0.36;add(P.torse,ceinture);
    const boucle=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.1,0.03),mat(0xd8b45a,0.5));
    boucle.position.set(0,-0.36,0.21);add(P.torse,boucle);
  }else if(classe==='arbaletriere'){
    const cape=new THREE.Mesh(new THREE.BoxGeometry(0.56,0.85,0.05),mat(0x2c3a24,0.95));
    cape.position.set(0,-0.08,-0.23);add(P.torse,cape); // cape verte
    const carquois=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.07,0.5,6),mat(0x3a2a1a));
    carquois.position.set(0.2,0.2,-0.26);carquois.rotation.z=0.4;add(P.torse,carquois);
    for(let k=0;k<3;k++){const c2=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.3,4),mat(0xb8a878));
      c2.position.set(0.24+k*0.035,0.5,-0.26);c2.rotation.z=0.4;add(P.torse,c2);}
    const capu=new THREE.Mesh(new THREE.ConeGeometry(0.26,0.34,5),mat(0x2c3a24,0.95));
    capu.position.y=0.2;add(P.tete,capu); // capuche
  }else if(classe==='flagellant'){
    for(let k=0;k<3;k++){ // bandages
      const b=new THREE.Mesh(new THREE.BoxGeometry(0.66,0.09,0.38),mat(0xa89a84,0.98));
      b.position.y=0.25-k*0.2;b.rotation.y=(k%2?0.12:-0.12);add(P.torse,b);}
    const chains=[];
    [-0.2,0,0.2].forEach(xx=>{ // chaînes suspendues à la ceinture
      const ch=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.42,0.03),mat(0x4a4a50,0.4));
      ch.geometry.translate(0,-0.21,0);
      ch.position.set(xx,-0.35,0.17);add(P.torse,ch);chains.push(ch);});
    mesh.userData.chains=chains;
    const cagoule=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.42,0.38),mat(0x40262a,0.95));
    cagoule.position.y=0.02;add(P.tete,cagoule);
  }else if(classe==='cendremage'){
    const robe=new THREE.Mesh(new THREE.ConeGeometry(0.44,0.95,7),mat(0x2a2230,0.95));
    robe.position.y=-0.6;add(P.torse,robe); // longue robe
    const brode=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.02,4,12),mat(0xe8853a,0.5));
    brode.rotation.x=Math.PI/2;brode.position.y=-0.3;add(P.torse,brode);
    const calotte=new THREE.Mesh(new THREE.ConeGeometry(0.24,0.34,6),mat(0x2a2230,0.95));
    calotte.position.y=0.24;add(P.tete,calotte);
    const bord=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.03,10),mat(0x221a28,0.95));
    bord.position.y=0.1;add(P.tete,bord); // chapeau à larges bords
  }else if(classe==='ossuaire'){
    for(let k=0;k<3;k++){ // cage thoracique portée
      const cote=new THREE.Mesh(new THREE.BoxGeometry(0.58-k*0.06,0.045,0.4),mat(0xd8d2be,0.7));
      cote.position.y=0.25-k*0.16;add(P.torse,cote);}
    const masque=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.24,0.05),mat(0xd8d2be,0.65));
    masque.position.set(0,-0.02,0.18);add(P.tete,masque); // masque d'os
    [-0.14,0.14].forEach(xx=>{const orb=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.02),
      new THREE.MeshBasicMaterial({color:0x1a1a14}));orb.position.set(xx,0.02,0.21);add(P.tete,orb);});
    [-0.22,0.22].forEach(xx=>{const charme=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.14,4),mat(0xc8c0a8,0.7));
      charme.position.set(xx,-0.42,0.15);add(P.torse,charme);});
  }else if(classe==='voleur'){
    const capu=new THREE.Mesh(new THREE.ConeGeometry(0.25,0.32,5),mat(0x22262c,0.95));
    capu.position.y=0.2;add(P.tete,capu);
    const masque=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.14,0.05),mat(0x1a1d22,0.95));
    masque.position.set(0,-0.08,0.17);add(P.tete,masque);
    const demiCape=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.7,0.04),mat(0x22262c,0.95));
    demiCape.position.set(-0.18,-0.05,-0.21);demiCape.rotation.z=0.1;add(P.torse,demiCape);
    [-0.16,0.06,0.22].forEach(xx=>{const p2=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.12,0.08),mat(0x3a2f22));
      p2.position.set(xx,-0.38,0.18);add(P.torse,p2);});
    const bauds=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.85,0.04),mat(0x2a2018));
    bauds.position.set(0,0.05,0.2);bauds.rotation.z=-0.7;add(P.torse,bauds);
  }
  // des mains, et l'arme dans la main droite (plus incrustée dans le bras)
  const peauM=mat(CLASSES[classe].peau);
  const mainD=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.15,0.18),peauM);
  mainD.position.set(0,-0.7,0.04);P.brasD.add(mainD);
  const mainG=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.15,0.18),peauM);
  mainG.position.set(0,-0.7,0.04);P.brasG.add(mainG);
  attachWeapons(mesh,classe,wsDef(classe,styleId||G.wstyle),P,mainD,mainG);
}
/* ---------- postures d'idle par classe ---------- */
const IDLE_POSE={
 ecorcheur:p=>{p.brasD.rotation.x=-2.45;p.brasD.rotation.z=0.45;p.tete.rotation.z=0.06;},
 briseroc:p=>{p.brasD.rotation.z=0.34;p.brasG.rotation.z=-0.34;p.jambeG.rotation.z=-0.1;p.jambeD.rotation.z=0.1;},
 arbaletriere:p=>{p.brasD.rotation.x=-1.05;p.brasG.rotation.x=-0.95;p.brasG.rotation.z=-0.55;},
 flagellant:p=>{p.brasD.rotation.z=0.16;p.brasG.rotation.z=-0.16;p.tete.rotation.x=0.08;},
 cendremage:p=>{p.brasD.rotation.x=-0.2;p.brasG.rotation.x=-0.65;p.brasG.rotation.z=-0.2;},
 ossuaire:p=>{p.torse.rotation.x=0.15;p.tete.rotation.x=0.12;p.brasD.rotation.x=-0.3;p.brasG.rotation.x=-0.3;}};
/* ---------- animation finale : anticipation, respiration, chaînes, postures ---------- */
function animeHumanoide(mesh,phase,speed,attack,pose){
  if(mesh.userData.rig){rigSet(mesh.userData.rig,speed,attack);return;}
  const p=mesh.userData.parts;if(!p)return;
  const sw=Math.min(1,speed/3)*0.72;
  p.jambeG.rotation.x=Math.sin(phase)*sw;
  p.jambeD.rotation.x=-Math.sin(phase)*sw;
  // respiration
  p.torse.scale.y=(p.torse.scale.y||1)*0+((pose&&mesh.userData.baseSy)||1)+0.018*Math.sin(phase*0.55);
  // chaînes du Flagellant qui balancent
  if(mesh.userData.chains)mesh.userData.chains.forEach((c,i)=>{
    c.rotation.x=Math.sin(phase*1.1+i)*0.22+speed*0.06;});
  // braise du bâton qui pulse
  if(mesh.userData.weapon&&mesh.userData.weapon.userData.orbe)
    mesh.userData.weapon.userData.orbe.scale.setScalar(1+0.15*Math.sin(phase*2.2));
  if(!attack){
    if(mesh.userData.weapon)mesh.userData.weapon.rotation.x=mesh.userData.weapon.userData.baseRx||0;
    p.brasG.rotation.x=-Math.sin(phase)*sw*0.8;
    p.brasD.rotation.x=Math.sin(phase)*sw*0.8;
    p.brasG.rotation.z*=0.8;p.brasD.rotation.z*=0.8;
    p.torse.rotation.y*=0.8;p.torse.rotation.x*=0.85;
    p.tete.rotation.x*=0.9;p.tete.rotation.z*=0.9;
    p.jambeG.rotation.z*=0.85;p.jambeD.rotation.z*=0.85;
    // posture de classe, fondue selon la vitesse
    if(pose&&IDLE_POSE[pose]){
      const rest=1-Math.min(1,speed/2.2);
      if(rest>0.05){
        const tmp={brasD:{x:p.brasD.rotation.x,z:p.brasD.rotation.z},brasG:{x:p.brasG.rotation.x,z:p.brasG.rotation.z}};
        const save={bDx:p.brasD.rotation.x,bDz:p.brasD.rotation.z,bGx:p.brasG.rotation.x,bGz:p.brasG.rotation.z,
          tx:p.torse.rotation.x,hx:p.tete.rotation.x,hz:p.tete.rotation.z,
          jGz:p.jambeG.rotation.z,jDz:p.jambeD.rotation.z};
        IDLE_POSE[pose](p);
        p.brasD.rotation.x=save.bDx+(p.brasD.rotation.x-save.bDx)*rest;
        p.brasD.rotation.z=save.bDz+(p.brasD.rotation.z-save.bDz)*rest;
        p.brasG.rotation.x=save.bGx+(p.brasG.rotation.x-save.bGx)*rest;
        p.brasG.rotation.z=save.bGz+(p.brasG.rotation.z-save.bGz)*rest;
        p.torse.rotation.x=save.tx+(p.torse.rotation.x-save.tx)*rest;
        p.tete.rotation.x=save.hx+(p.tete.rotation.x-save.hx)*rest;
        p.tete.rotation.z=save.hz+(p.tete.rotation.z-save.hz)*rest;
        p.jambeG.rotation.z=save.jGz+(p.jambeG.rotation.z-save.jGz)*rest;
        p.jambeD.rotation.z=save.jDz+(p.jambeD.rotation.z-save.jDz)*rest;
      }
    }
    return;
  }
  const a=clamp(attack.t/attack.dur,0,1);
  const anim=attack.anim||'slash';
  const antic=x=>x<0.45?easeOut(x/0.45):1;
  const rel=x=>x<0.45?0:easeOut((x-0.45)/0.55);
  if(anim==='slash'){
    p.brasD.rotation.x=-1.95*antic(a)+2.7*rel(a);
    p.brasD.rotation.z=-0.75*antic(a)+1.3*rel(a);
    p.torse.rotation.y=-0.75*antic(a)+1.3*rel(a);
    p.torse.rotation.x=-0.12*antic(a)+0.3*rel(a);
  }else if(anim==='smash'){
    p.brasD.rotation.x=-2.9*antic(a)+3.4*rel(a);
    p.brasG.rotation.x=-2.9*antic(a)+3.4*rel(a);
    p.torse.rotation.x=-0.4*antic(a)+0.95*rel(a);
    p.tete.rotation.x=-0.2*antic(a)+0.35*rel(a);
  }else if(anim==='shoot'){
    const wp=mesh.userData.weapon;
    if(wp&&wp.userData.baseRx)wp.rotation.x=2.75; // le bâton pointe l'orbe vers l'avant
    p.brasD.rotation.x=-1.52;
    p.brasG.rotation.x=-1.28;p.brasG.rotation.z=-0.4;
    p.torse.rotation.y=0.3;
    if(a>0.35&&a<0.6){p.brasD.rotation.x=-1.52+0.4*(1-(a-0.35)/0.25);p.torse.rotation.y=0.3+0.14;}
  }else if(anim==='sweep'){
    p.brasD.rotation.x=-1.35;p.brasG.rotation.x=-1.35;
    p.brasD.rotation.z=1.5*antic(a)-2.8*rel(a)*antic(a);
    p.brasG.rotation.z=-1.5*antic(a)+2.8*rel(a)*antic(a);
    p.torse.rotation.y=0.55*antic(a)-1.1*rel(a);
  }else if(anim==='cast'){
    p.brasD.rotation.x=-2.6*antic(a)+1.35*rel(a);
    p.brasG.rotation.x=-2.6*antic(a)+1.35*rel(a);
    p.torse.rotation.x=0.22*antic(a)-0.55*rel(a);
    p.tete.rotation.x=-0.15*antic(a)+0.2*rel(a);
  }else if(anim==='summon'){
    p.brasD.rotation.x=-2.7*Math.sin(a*Math.PI);
    p.brasG.rotation.x=-2.7*Math.sin(a*Math.PI);
    p.brasD.rotation.z=0.45*Math.sin(a*Math.PI*2);
    p.brasG.rotation.z=-0.45*Math.sin(a*Math.PI*2);
    p.torse.rotation.x=-0.14*Math.sin(a*Math.PI);
  }else if(anim==='spin'){
    mesh.rotation.y+=easeOut(a)*Math.PI*2;
    p.brasD.rotation.x=-1.45;p.brasG.rotation.x=-1.45;
    p.brasD.rotation.z=1.25;p.brasG.rotation.z=-1.25;
    p.torse.rotation.x=0.1;
  }
}
function easeOut(x){return 1-Math.pow(1-x,2.4);}
/* ---------- objets portés : formes adaptées à la classe ---------- */
function majApparence(){
  playerGear.forEach(g=>{if(g.parent)g.parent.remove(g);});playerGear=[];
  if(!player.mesh)return;
  if(player.mesh.userData.rig){rigPlayerLook(player.mesh.userData.rig);return;}
  const P=player.mesh.userData.parts;if(!P)return;
  const add=(parent,mesh)=>{parent.add(mesh);playerGear.push(mesh);};
  const eq=G.equip;
  const caster=(G.classe==='cendremage'||G.classe==='ossuaire'||G.classe==='arbaletriere');
  if(eq.tete){const m=gearMat(eq.tete.rar);
    if(caster){ // cercle frontal / diadème sur capuche
      const d=new THREE.Mesh(new THREE.TorusGeometry(0.2,0.028,5,12),m);
      d.position.set(0,0.1,0.02);d.rotation.x=0.25;add(P.tete,d);
    }else{ // heaume à cimier
      const h=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.34,0.44),m);h.position.y=0.08;add(P.tete,h);
      const c=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.3,4),m);c.position.set(0,0.33,0);add(P.tete,c);}}
  if(eq.torse){const m=gearMat(eq.torse.rar);
    if(G.classe==='briseroc'){ // sur-épaulières massives
      [-1,1].forEach(s=>{const p2=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.2,0.44),m);
        p2.position.set(0.46*s,0.42,0);p2.rotation.z=-0.24*s;add(P.torse,p2);});
    }else{
      [-1,1].forEach(s=>{const p2=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.15,0.34),m);
        p2.position.set(0.42*s,0.34,0);p2.rotation.z=-0.2*s;add(P.torse,p2);});}
    const pl=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.42,0.1),m);pl.position.set(0,0.08,0.2);add(P.torse,pl);}
  if(eq.jambes){const m=gearMat(eq.jambes.rar);
    [P.jambeG,P.jambeD].forEach(j=>{const s=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.4,0.24),m);
      s.position.set(0,-0.3,0.02);add(j,s);});}
  if(eq.arme){const m=gearMat(eq.arme.rar);
    const g2=new THREE.Mesh(new THREE.OctahedronGeometry(0.1),m);
    g2.position.set(0,-0.45,0.13);add(P.brasD,g2);}
  if(eq.amulette){const m=gearMat(eq.amulette.rar);m.emissive.setHex(RAR_COLORS[eq.amulette.rar]);
    m.emissiveIntensity=0.55;
    const a=new THREE.Mesh(new THREE.OctahedronGeometry(0.085),m);a.position.set(0,0.24,0.22);add(P.torse,a);}
  const hasLeg=Object.values(eq).some(it=>it&&it.rar===4);
  if(hasLeg){const l=new THREE.PointLight(0xe8963a,0.5,4);l.position.set(0,0.4,0.3);add(P.torse,l);}
}

/* ---------- sons de sorts par classe ---------- */
function nz(dur,fType,f0,f1,q,g0,delay=0){
  if(!AC)return;const t=AC.currentTime+delay;
  const len=Math.ceil(AC.sampleRate*dur),buf=AC.createBuffer(1,len,AC.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
  const src=AC.createBufferSource();src.buffer=buf;
  const f=AC.createBiquadFilter();f.type=fType;f.frequency.setValueAtTime(f0,t);
  if(f1)f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  f.Q.value=q||1;
  const g=AC.createGain();g.gain.setValueAtTime(g0,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  src.connect(f);f.connect(g);g.connect(master);src.start(t);
}
function tone2(f0,f1,dur,type,g0,delay=0){
  if(!AC)return;const t=AC.currentTime+delay;
  const o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f0,t);
  if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(g0,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.05);
}
const CLASS_SFX={
 ecorcheur:k=>{ // souffle charnu de hache
  nz(0.22,'bandpass',420,140,1,0.22*k);
  tone2(95,42,0.18,'triangle',0.16*k);},
 briseroc:k=>{ // grondement tellurique
  tone2(64,26,0.5,'sine',0.3*k);
  nz(0.42,'lowpass',300,80,1,0.16*k);},
 arbaletriere:k=>{ // clac mécanique + vibration de corde
  tone2(1400,850,0.035,'square',0.09*k);
  nz(0.07,'highpass',2400,0,1,0.11*k,0.01);
  tone2(230,175,0.14,'triangle',0.13*k,0.02);},
 flagellant:k=>{ // claquement de fouet + tintement de chaîne
  nz(0.055,'highpass',2800,0,1,0.3*k);
  nz(0.15,'bandpass',900,280,2,0.14*k,0.02);
  tone2(2100,2000,0.04,'sine',0.05*k,0.06);
  tone2(1650,1500,0.04,'sine',0.04*k,0.1);},
 cendremage:k=>{ // souffle de flamme montant + crépitement
  nz(0.45,'bandpass',500,1900,0.8,0.2*k);
  for(let i=0;i<3;i++)tone2(rand(300,900),200,0.03,'square',0.035*k,0.06+i*0.07);},
 ossuaire:k=>{ // cliquetis d'os + nappe spectrale
  [0,0.045,0.1,0.16].forEach((dl,i)=>tone2(rand(420,720),300,0.035,'square',0.06*k,dl));
  tone2(318,255,0.5,'sine',0.045*k,0.05);
  tone2(323,258,0.5,'sine',0.035*k,0.05);}};
function sfxCast(sp){
  if(!AC||G.muted)return;
  const k=sp&&sp.t==='basic'?0.55:1;
  (CLASS_SFX[G.classe]||CLASS_SFX.ecorcheur)(k);
  if(!sp||sp.t==='basic')return;
  if(sp.t==='heal'||sp.t==='buff')tone2(660,920,0.4,'sine',0.06,0.03);
  if(sp.t==='raise'){tone2(180,170,0.6,'sine',0.05,0.05);tone2(214,205,0.6,'sine',0.04,0.05);}
  if(sp.t==='aoe'||sp.t==='detonate')tone2(52,24,0.5,'sine',0.24,0.04);
  if(sp.t==='dash')nz(0.2,'bandpass',700,250,1,0.14);
}
/* ---------- écran titre : aperçu 3D tournant ---------- */
let pRenderer=null,pScene=null,pCam=null,prevMesh=null,phaseP=0,prevCl=null;
function previewSet(cl){
  prevCl=cl;
  if(!pScene)return;
  if(prevMesh)pScene.remove(prevMesh);
  const c=CLASSES[cl];
  prevMesh=humanoide({peau:c.peau,habit:c.habit,yeux:0x1a1a14});
  classKit(prevMesh,cl,selStyle);
  attachRig(prevMesh,'c:'+cl);
  pScene.add(prevMesh);
  audioInit();
  if(AC&&!G.muted)(CLASS_SFX[cl]||CLASS_SFX.ecorcheur)(0.5);
}
function previewInit(){
  const cv=el('preview-cv');if(!cv)return;
  try{
    pRenderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
    pRenderer.setSize(300,340,false);
  }catch(e){cv.style.display='none';return;}
  pScene=new THREE.Scene();
  pCam=new THREE.PerspectiveCamera(38,300/340,0.1,50);
  pCam.position.set(0,1.55,3.6);pCam.lookAt(0,1.05,0);
  pScene.add(new THREE.AmbientLight(0x8a8a7a,0.55));
  const dl=new THREE.DirectionalLight(0xc8b490,0.9);dl.position.set(2,4,3);pScene.add(dl);
  const rim=new THREE.DirectionalLight(0x5a6a8a,0.5);rim.position.set(-3,2,-2);pScene.add(rim);
  const socle=new THREE.Mesh(new THREE.CylinderGeometry(0.9,1,0.12,22),
    new THREE.MeshStandardMaterial({color:0x1c1a14,roughness:0.9}));
  socle.position.y=-0.06;pScene.add(socle);
  previewSet(selClasse);
  (function pLoop(){
    requestAnimationFrame(pLoop);
    if(G.started||!pRenderer)return;
    if(el('titre').style.display==='none')return;
    phaseP+=0.045;
    if(prevMesh){
      prevMesh.rotation.y+=0.011;
      animeHumanoide(prevMesh,phaseP,0,null,prevCl);
    }
    pRenderer.render(pScene,pCam);
  })();
}

