'use strict';
/* ---------- Three.js : scène, ciel, horizon ---------- */
const canvas=el('scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.toneMapping=THREE.LinearToneMapping;
renderer.toneMappingExposure=1.45;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x121711);
scene.fog=new THREE.FogExp2(0x181d16,0.0095);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.1,1300);
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
addEventListener('resize',resize);resize();

const lune=new THREE.DirectionalLight(0xb8c4a8,0.75);
lune.position.set(-30,50,-20);lune.castShadow=true;
lune.shadow.mapSize.set(1024,1024);
lune.shadow.camera.left=-45;lune.shadow.camera.right=45;lune.shadow.camera.top=45;lune.shadow.camera.bottom=-45;
scene.add(lune);scene.add(lune.target);
scene.add(new THREE.AmbientLight(0x2c342a,2.1));
scene.add(new THREE.HemisphereLight(0x3c4838,0x181510,1.2));

function skyTexture(){
  const c=document.createElement('canvas');c.width=64;c.height=512;const x=c.getContext('2d');
  const gr=x.createLinearGradient(0,0,0,512);
  gr.addColorStop(0,'#0a0e14');gr.addColorStop(0.45,'#151d18');gr.addColorStop(0.75,'#223027');gr.addColorStop(1,'#2b3a30');
  x.fillStyle=gr;x.fillRect(0,0,64,512);
  for(let i=0;i<90;i++){x.fillStyle=`rgba(200,210,190,${rand(.15,.6)})`;
    x.fillRect(rand(0,64),rand(0,260),rand(.5,1.4),rand(.5,1.4));}
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.repeat.set(6,1);return t;
}
const ciel=new THREE.Mesh(new THREE.SphereGeometry(620,24,16),
  new THREE.MeshBasicMaterial({map:skyTexture(),side:THREE.BackSide,fog:false}));
scene.add(ciel);
const moon=new THREE.Mesh(new THREE.CircleGeometry(22,26),new THREE.MeshBasicMaterial({color:0x9aa88c,fog:false}));
moon.position.set(-260,205,-470);moon.lookAt(0,0,0);scene.add(moon);
const moonHalo=new THREE.Mesh(new THREE.CircleGeometry(38,26),
  new THREE.MeshBasicMaterial({color:0x3a4436,transparent:true,opacity:0.3,fog:false}));
moonHalo.position.set(-261,205,-473);moonHalo.lookAt(0,0,0);scene.add(moonHalo);

function groundTexture(){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  x.fillStyle='#151810';x.fillRect(0,0,512,512);
  for(let i=0;i<9000;i++){const s=rand(0.5,2.2);
    x.fillStyle=`rgba(${irand(14,42)},${irand(18,46)},${irand(10,26)},${rand(.25,.7)})`;
    x.fillRect(rand(0,512),rand(0,512),s,s);}
  for(let i=0;i<160;i++){x.strokeStyle=`rgba(${irand(40,64)},${irand(44,62)},${irand(24,36)},.5)`;
    const px=rand(0,512),py=rand(0,512);
    x.beginPath();x.moveTo(px,py);x.lineTo(px+rand(-4,4),py-rand(3,8));x.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(39,39);return t;
}
function mat(c,rough=0.9){return new THREE.MeshStandardMaterial({color:c,roughness:rough});}

/* ---------- zones (monde ×1.5 au v25) ---------- */
const ZONES=[
 {id:'lande', nom:'Lande de Cendrefiel', tranche:'niveaux 1–20', x:0,z:180,r:142, tint:0x1a1d14},
 {id:'capitale', nom:'Valcierge, la Capitale', tranche:'sanctuaire', x:0,z:-30,r:54, tint:0x1e1c16},
 {id:'fange', nom:"Fange d'Ychor", tranche:'niveaux 20–40', x:225,z:90,r:120, tint:0x161e14},
 {id:'foret', nom:'Forêt des Pendus', tranche:'niveaux 40–60', x:-240,z:-60,r:120, tint:0x14161a},
 {id:'cretes', nom:"Crêtes de l'Ossuaire", tranche:'niveaux 60–70', x:90,z:-255,r:120, tint:0x1c1c1a}];
const CAPITALE=ZONES[1], MORFAILLE={x:0,z:180}, RUINES={x:105,z:225};
function zoneAt(p){let best=ZONES[0],bd=1e9;
  ZONES.forEach(z=>{const d=dist2D(p,z)/z.r;if(d<bd){bd=d;best=z;}});return best;}
/* sanctuaires : aucune créature n'y aggro ni n'y pénètre — capitale,
   villages et chaque camp de quêtes */
const SAFE_ZONES=[
 {x:0,z:-30,r:54},          // Valcierge
 {x:0,z:180,r:26},          // Morfaille
 {x:158,z:68,r:16},         // camp du Padre Lom (Fange)
 {x:-172,z:-38,r:16},       // Veuve Ashka (Forêt)
 {x:52,z:-195,r:16},        // Frère Ossian (Crêtes)
 {x:-45,z:225,r:14},        // le Vieux Sarment
 {x:255,z:42,r:14},         // la Noyée
 {x:-210,z:-87,r:14},       // le Cordier
 {x:120,z:-222,r:14}];      // le Frère Muet
function enSecurite(p){
  for(let i=0;i<SAFE_ZONES.length;i++)if(dist2D(p,SAFE_ZONES[i])<SAFE_ZONES[i].r)return true;
  return false;
}

/* ---------- constructeurs de décor ---------- */
function arbreMort(x,z,h0){
  const g=new THREE.Group();const h=h0||rand(4,7);
  const tronc=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.3,h,5),mat(0x1c150d));
  tronc.position.y=h/2;tronc.castShadow=true;g.add(tronc);
  for(let i=0,nb=irand(2,4);i<nb;i++){
    const bl=rand(1.2,2.4);
    const b=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.1,bl,4),mat(0x1c150d));
    b.position.y=rand(h*0.5,h*0.95);
    b.rotation.z=rand(0.6,1.3)*(Math.random()<.5?1:-1);b.rotation.y=rand(0,6.28);
    b.translateY(bl/2);g.add(b);}
  g.position.set(x,terrainH(x,z),z);g.rotation.y=rand(0,6.28);g.rotation.x=rand(-0.06,0.06);
  scene.add(g);obstacles.push({x,z,r:0.45});return g;
}
function pendu(x,z){ // arbre + corps suspendu qui oscille
  const g=arbreMort(x,z,rand(6,8));
  const corde=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,1.6,4),mat(0x3a3226));
  corde.position.y=-0.8;
  const corps=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.9,0.25),mat(0x2c2a24));
  corps.position.y=-2;
  const piv=new THREE.Group();piv.position.set(rand(-0.8,0.8),rand(4.5,6),rand(-0.5,0.5));
  piv.add(corde,corps);g.add(piv);
  piv.userData.ph=rand(0,6.28);pendus.push(piv);
}
const pendus=[];
function rocher(x,z,s){
  const r=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),mat(0x2a2d28));
  r.position.set(x,terrainH(x,z)+s*0.5,z);r.rotation.set(rand(0,3),rand(0,3),rand(0,3));r.castShadow=true;
  scene.add(r);obstacles.push({x,z,r:s*0.9});
}
function tasOs(x,z){
  for(let i=0;i<irand(3,6);i++){
    const o=new THREE.Mesh(new THREE.ConeGeometry(rand(0.06,0.14),rand(0.4,1),4),mat(0xb8b09a,0.7));
    o.position.set(x+rand(-0.8,0.8),terrainH(x,z)+0.1,z+rand(-0.8,0.8));
    o.rotation.set(rand(1.2,1.9),rand(0,6),0);scene.add(o);}
}
function mare(x,z,r){
  const m=new THREE.Mesh(new THREE.CircleGeometry(r,18),
    new THREE.MeshStandardMaterial({color:0x0d1a14,roughness:0.15,metalness:0.4}));
  m.rotation.x=-Math.PI/2;m.position.set(x,terrainH(x,z)+0.03,z);scene.add(m);
  for(let i=0;i<irand(4,8);i++){
    const ro=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.03,rand(0.8,1.6),4),mat(0x2c3320));
    ro.position.set(x+Math.cos(rand(0,6.28))*r*rand(.8,1.15),0.5,z+Math.sin(rand(0,6.28))*r*rand(.8,1.15));
    ro.rotation.z=rand(-0.15,0.15);scene.add(ro);}
}
function hutte(x,z,rot){
  const g=new THREE.Group();
  const murs=new THREE.Mesh(new THREE.BoxGeometry(4.5,2.6,4),mat(0x2b241a));murs.position.y=1.3;murs.castShadow=true;g.add(murs);
  const toit=new THREE.Mesh(new THREE.ConeGeometry(3.6,2,4),mat(0x17130c));toit.position.y=3.4;toit.rotation.y=Math.PI/4;toit.castShadow=true;g.add(toit);
  const porte=new THREE.Mesh(new THREE.BoxGeometry(0.9,1.6,0.1),mat(0x0d0a07));porte.position.set(0,0.8,2.02);g.add(porte);
  g.position.set(x,terrainH(x,z),z);g.rotation.y=rot;scene.add(g);obstacles.push({x,z,r:3.1});
}
function torche(x,z,intens=1.4,portee=12){
  const p=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.07,1.8,5),mat(0x241a10));
  const ty=terrainH(x,z);
  p.position.set(x,ty+0.9,z);scene.add(p);
  const flamme=new THREE.Mesh(new THREE.SphereGeometry(0.13,6,6),new THREE.MeshBasicMaterial({color:0xd88a3a}));
  flamme.position.set(x,ty+1.9,z);scene.add(flamme);
  const l=new THREE.PointLight(0xcf7a2e,intens,portee,2);l.position.set(x,ty+2.1,z);scene.add(l);
  torches.push({l,flamme,base:intens});
}
function pilier(x,z,h,ray=0.6){
  const p=new THREE.Mesh(new THREE.CylinderGeometry(ray*0.85,ray,h,7),mat(0x33362f));
  p.position.set(x,terrainH(x,z)+h/2,z);p.rotation.z=rand(-0.06,0.06);p.castShadow=true;scene.add(p);
  obstacles.push({x,z,r:ray+0.2});
}
/* ---------- mobilier de ville et de camp (v28) ---------- */
const cheminees=[],feux=[],patrouilles=[];
function maison(x,z,rot,w=5,d=4.4,h=3){
  const g=new THREE.Group();const ty=terrainH(x,z);
  const murs=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(0x37342c));
  murs.position.y=h/2;murs.castShadow=murs.receiveShadow=true;g.add(murs);
  const sous=new THREE.Mesh(new THREE.BoxGeometry(w+0.3,0.5,d+0.3),mat(0x2a2a26));
  sous.position.y=0.25;g.add(sous);
  [-1,1].forEach(s=>{const pan=new THREE.Mesh(new THREE.BoxGeometry(w+0.9,0.16,d*0.66),mat(0x1a160f));
    pan.position.set(0,h+d*0.17,s*d*0.24);pan.rotation.x=-s*0.6;pan.castShadow=true;g.add(pan);});
  const porte=new THREE.Mesh(new THREE.BoxGeometry(0.9,1.7,0.08),mat(0x14100a));
  porte.position.set(w*0.18,0.85,d/2+0.05);g.add(porte);
  const fen=new THREE.Mesh(new THREE.PlaneGeometry(0.72,0.6),
    new THREE.MeshBasicMaterial({color:0xc9903a}));
  fen.position.set(-w*0.24,1.7,d/2+0.06);g.add(fen);
  const chem=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.3,0.5),mat(0x2e2e28));
  chem.position.set(-w*0.32,h+0.8,-d*0.18);g.add(chem);
  g.position.set(x,ty,z);g.rotation.y=rot;scene.add(g);
  obstacles.push({x,z,r:Math.max(w,d)*0.64});
  const co=Math.cos(rot),si=Math.sin(rot),ox=-w*0.32,oz=-d*0.18;
  cheminees.push({x:x+ox*co+oz*si,y:ty+h+1.5,z:z-ox*si+oz*co});
  return g;
}
function caisse(x,z,rot=0,s=0.8){
  const c=new THREE.Mesh(_hgeo('caisse',()=>new THREE.BoxGeometry(1,1,1)),_hmat(0x4a3d28,0.95));
  c.scale.setScalar(s);c.position.set(x,terrainH(x,z)+s/2,z);c.rotation.y=rot;c.castShadow=true;scene.add(c);
  obstacles.push({x,z,r:s*0.7});
}
function tonneau(x,z){
  const t=new THREE.Mesh(_hgeo('tonneau',()=>new THREE.CylinderGeometry(0.34,0.38,0.9,9)),_hmat(0x3c3222,0.9));
  t.position.set(x,terrainH(x,z)+0.45,z);t.castShadow=true;scene.add(t);
  obstacles.push({x,z,r:0.45});
}
function puits(x,z){
  const ty=terrainH(x,z);
  const mur=new THREE.Mesh(new THREE.CylinderGeometry(0.95,1.05,0.9,10),mat(0x3a3a34));
  mur.position.set(x,ty+0.45,z);mur.castShadow=true;scene.add(mur);
  const eau=new THREE.Mesh(new THREE.CircleGeometry(0.8,10),
    new THREE.MeshStandardMaterial({color:0x101c18,roughness:0.15,metalness:0.4}));
  eau.rotation.x=-Math.PI/2;eau.position.set(x,ty+0.7,z);scene.add(eau);
  [-1,1].forEach(s=>{const pt=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.07,2,5),mat(0x241a10));
    pt.position.set(x+s*0.85,ty+1.4,z);scene.add(pt);});
  const toit=new THREE.Mesh(new THREE.ConeGeometry(1.3,0.8,4),mat(0x17130c));
  toit.position.set(x,ty+2.7,z);toit.rotation.y=Math.PI/4;scene.add(toit);
  obstacles.push({x,z,r:1.2});
}
function charrette(x,z,rot=0){
  const g=new THREE.Group();
  const caisseC=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.5,2.2),mat(0x3c3222));
  caisseC.position.y=0.75;g.add(caisseC);
  [-1,1].forEach(s=>{const roue=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.1,10),mat(0x241a10));
    roue.rotation.z=Math.PI/2;roue.position.set(s*0.8,0.45,0.3);g.add(roue);});
  const brancard=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.08,1.6),mat(0x241a10));
  brancard.position.set(0.3,0.5,-1.7);brancard.rotation.x=0.3;g.add(brancard);
  g.position.set(x,terrainH(x,z),z);g.rotation.y=rot;g.rotation.z=-0.05;scene.add(g);
  obstacles.push({x,z,r:1.2});
}
/* feu de camp : émissif seulement — pas de PointLight, l'éclairage forward
   de r128 plie déjà sous les torches existantes */
function feuCamp(x,z){
  const ty=terrainH(x,z);
  for(let i=0;i<5;i++){const a=i/5*6.28;
    const p=new THREE.Mesh(_hgeo('pierre',()=>new THREE.DodecahedronGeometry(0.16,0)),_hmat(0x3a3a34));
    p.position.set(x+Math.cos(a)*0.55,ty+0.1,z+Math.sin(a)*0.55);scene.add(p);}
  for(let i=0;i<3;i++){const b=new THREE.Mesh(_hgeo('buche',()=>new THREE.CylinderGeometry(0.06,0.07,0.8,5)),_hmat(0x241a10));
    b.position.set(x,ty+0.16,z);b.rotation.set(1.2,i*2.1,0);scene.add(b);}
  const flamme=new THREE.Mesh(_hgeo('flammeC',()=>new THREE.ConeGeometry(0.22,0.55,6)),_hbasic(0xd8862e));
  flamme.position.set(x,ty+0.45,z);scene.add(flamme);
  const lueur=new THREE.Mesh(new THREE.CircleGeometry(1.5,14),
    new THREE.MeshBasicMaterial({color:0xc9702a,transparent:true,opacity:0.16,depthWrite:false}));
  lueur.rotation.x=-Math.PI/2;lueur.position.set(x,ty+0.05,z);scene.add(lueur);
  feux.push({x,y:ty,z,flamme,lueur});
}
function tente(x,z,rot=0){
  const t=new THREE.Mesh(new THREE.ConeGeometry(1.9,2.3,4),mat(0x342e22,0.98));
  t.position.set(x,terrainH(x,z)+1,z);t.rotation.y=rot;t.castShadow=true;scene.add(t);
  obstacles.push({x,z,r:1.5});
}
function campement(x,z){
  const a=rand(0,6.28);
  tente(x+Math.cos(a)*3.2,z+Math.sin(a)*3.2,rand(0,6.28));
  feuCamp(x+Math.cos(a+2.4)*2.4,z+Math.sin(a+2.4)*2.4);
  caisse(x+Math.cos(a+4.2)*2.6,z+Math.sin(a+4.2)*2.6,rand(0,1.5),0.7);
  tonneau(x+Math.cos(a+4.9)*3,z+Math.sin(a+4.9)*3);
}
function garde(x,z,pts){
  const m=humanoide({peau:0x8a7a62,habit:0x3a3e46,arme:'marteau'});
  m.position.set(x,terrainH(x,z),z);scene.add(m);
  patrouilles.push({mesh:m,pts,i:0,ph:rand(0,6)});
}

/* ---------- la capitale Valcierge ---------- */
function construireCapitale(){
  const cx=CAPITALE.x,cz=CAPITALE.z,R=38;
  // dalles de la place
  const place=new THREE.Mesh(new THREE.CylinderGeometry(R-1,R-1,0.25,42),mat(0x26251f));
  place.position.set(cx,0.12,cz);place.receiveShadow=true;scene.add(place);
  // remparts : segments avec porte au sud
  const SEG=25;
  for(let i=0;i<SEG;i++){
    const a=i/SEG*Math.PI*2;
    if(a>Math.PI/2-0.24&&a<Math.PI/2+0.24)continue; // porte sud (+z)
    const wx=cx+Math.cos(a)*R,wz=cz+Math.sin(a)*R;
    const w=new THREE.Mesh(new THREE.BoxGeometry(9.9,6,1.6),mat(0x3a3a34));
    w.position.set(wx,3,wz);w.rotation.y=-a+Math.PI/2;w.castShadow=true;w.receiveShadow=true;scene.add(w);
    const cren=new THREE.Mesh(new THREE.BoxGeometry(9.9,0.7,2),mat(0x2e2e28));
    cren.position.set(wx,6.3,wz);cren.rotation.y=-a+Math.PI/2;scene.add(cren);
    obstacles.push({x:wx,z:wz,r:2.6});
    obstacles.push({x:cx+Math.cos(a+0.08)*R,z:cz+Math.sin(a+0.08)*R,r:2.6});
    obstacles.push({x:cx+Math.cos(a-0.08)*R,z:cz+Math.sin(a-0.08)*R,r:2.6});
  }
  // tours
  [[0.9],[2.2],[4.0],[5.4]].forEach(([a])=>{
    const tx=cx+Math.cos(a)*R,tz=cz+Math.sin(a)*R;
    const t=new THREE.Mesh(new THREE.CylinderGeometry(2,2.4,11,9),mat(0x34342e));
    t.position.set(tx,5.5,tz);t.castShadow=true;scene.add(t);
    const toit=new THREE.Mesh(new THREE.ConeGeometry(2.6,3,9),mat(0x1c1a14));
    toit.position.set(tx,13,tz);scene.add(toit);
    obstacles.push({x:tx,z:tz,r:2.6});
    const fen=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.8,0.1),new THREE.MeshBasicMaterial({color:0xc98a3a}));
    fen.position.set(tx+Math.cos(a)*2.05,7.5,tz+Math.sin(a)*2.05);fen.lookAt(tx+Math.cos(a)*8,7.5,tz+Math.sin(a)*8);scene.add(fen);
  });
  // porte : deux piliers + braseros
  pilier(cx-4.5,cz+R,7,0.9);pilier(cx+4.5,cz+R,7,0.9);
  const linteau=new THREE.Mesh(new THREE.BoxGeometry(10.5,1.4,1.6),mat(0x2e2e28));
  linteau.position.set(cx,7.4,cz+R);scene.add(linteau);
  torche(cx-3,cz+R+1.5,2,16);torche(cx+3,cz+R+1.5,2,16);
  /* quartiers d'habitation : deux arcs de maisons le long des remparts,
     fenêtres allumées, cheminées qui fument */
  [[3.7,0.55],[4.35,0.5],[5.0,0.5],[5.65,0.5],[0.35,0.55],[2.45,0.5],[2.95,0.45],[1.05,0.5]].forEach(([a],i)=>{
    const hx=cx+Math.cos(a)*(R-8.5),hz=cz+Math.sin(a)*(R-8.5);
    maison(hx,hz,-a-Math.PI/2,4.6+(i%3)*0.7,4.2+(i%2)*0.6,2.8+(i%3)*0.3);});
  // ruelles : caisses, tonneaux, charrettes
  caisse(cx-13,cz+13,0.4);caisse(cx-12.2,cz+13.8,1.1,0.6);tonneau(cx-13.9,cz+12.6);
  caisse(cx+15,cz+9,0.8);tonneau(cx+15.8,cz+9.6);tonneau(cx+16.2,cz+8.7);
  charrette(cx+8,cz+18,2.2);charrette(cx-18,cz-2,1.0);
  puits(cx-9,cz+9);
  // gardes en patrouille sur la place
  garde(cx-12,cz+10,[{x:cx-14,z:cz+12},{x:cx+14,z:cz+12},{x:cx+16,z:cz-12},{x:cx-16,z:cz-12}]);
  garde(cx+10,cz-14,[{x:cx+16,z:cz-12},{x:cx+14,z:cz+12},{x:cx-14,z:cz+12},{x:cx-16,z:cz-12}]);
  garde(cx,cz+24,[{x:cx-6,z:cz+30},{x:cx+6,z:cz+30},{x:cx+6,z:cz+20},{x:cx-6,z:cz+20}]);
  // cathédrale du Cierge (nord de la place)
  const catX=cx,catZ=cz-20;
  const nef=new THREE.Mesh(new THREE.BoxGeometry(11,8,15),mat(0x3c3a32));
  nef.position.set(catX,4,catZ);nef.castShadow=true;scene.add(nef);
  const toitN=new THREE.Mesh(new THREE.ConeGeometry(8.5,5,4),mat(0x1a1812));
  toitN.position.set(catX,10.5,catZ);toitN.rotation.y=Math.PI/4;toitN.scale.z=1.5;scene.add(toitN);
  const tour=new THREE.Mesh(new THREE.BoxGeometry(4.5,15,4.5),mat(0x3c3a32));
  tour.position.set(catX,7.5,catZ+8.5);tour.castShadow=true;scene.add(tour);
  const fleche=new THREE.Mesh(new THREE.ConeGeometry(3.4,7,4),mat(0x181610));
  fleche.position.set(catX,18.5,catZ+8.5);fleche.rotation.y=Math.PI/4;scene.add(fleche);
  obstacles.push({x:catX,z:catZ,r:8},{x:catX,z:catZ+8.5,r:3.4});
  // vitraux qui luisent
  [[-3,0],[3,0],[0,7.5]].forEach(([ox,oz])=>{
    const v=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.6),
      new THREE.MeshBasicMaterial({color:0xc9973a,transparent:true,opacity:0.85}));
    v.position.set(catX+ox,4.5,catZ+ (ox===0?oz+2.3:oz+7.6));
    if(ox!==0)v.position.set(catX+ox*1.86,4.5,catZ);
    if(ox<0)v.rotation.y=-Math.PI/2;else if(ox>0)v.rotation.y=Math.PI/2;
    scene.add(v);});
  const lueurCat=new THREE.PointLight(0xc9973a,1.2,20);lueurCat.position.set(catX,5,catZ+4);scene.add(lueurCat);
  // fontaine centrale
  const bassin=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.8,0.8,16),mat(0x3a3a34));
  bassin.position.set(cx,0.4,cz+2);scene.add(bassin);
  const eau=new THREE.Mesh(new THREE.CircleGeometry(2.3,16),
    new THREE.MeshStandardMaterial({color:0x14241e,roughness:0.1,metalness:0.5}));
  eau.rotation.x=-Math.PI/2;eau.position.set(cx,0.75,cz+2);scene.add(eau);
  const stele=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.4,2.6,7),mat(0x44443c));
  stele.position.set(cx,1.9,cz+2);scene.add(stele);
  const cierge=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,8),new THREE.MeshBasicMaterial({color:0xe8c06a}));
  cierge.position.set(cx,3.4,cz+2);scene.add(cierge);
  const lF=new THREE.PointLight(0xd8a84a,1.6,15);lF.position.set(cx,3.6,cz+2);scene.add(lF);
  obstacles.push({x:cx,z:cz+2,r:3});
  // étals du marché — une vraie halle en arc autour de la fontaine
  [[-8,6,0.4,0x4a2c22],[-11,1,1.2,0x2c3a34],[8,7,-0.5,0x4a2c22],
   [11,2,-1.1,0x3a3050],[-6,12,0.2,0x2c3a34],[6,13,-0.3,0x4a3a22],[12,-4,-1.4,0x4a2c22]].forEach(([ox,oz,rot,tissu])=>{
    const table=new THREE.Mesh(new THREE.BoxGeometry(2.6,0.9,1.2),mat(0x2e2418));
    table.position.set(cx+ox,0.45,cz+oz);table.rotation.y=rot;scene.add(table);
    const auvent=new THREE.Mesh(new THREE.PlaneGeometry(3,1.8),
      new THREE.MeshStandardMaterial({color:tissu,side:THREE.DoubleSide,roughness:1}));
    auvent.position.set(cx+ox,2.1,cz+oz);auvent.rotation.set(-0.4,rot,0);scene.add(auvent);
    const marchandise=new THREE.Mesh(_hgeo('marchandise',()=>new THREE.BoxGeometry(0.5,0.3,0.4)),
      _hmat([0x6a5a3a,0x5a6a4a,0x6a4a3a][Math.floor(Math.random()*3)],0.95));
    marchandise.position.set(cx+ox+rand(-0.6,0.6),1.05,cz+oz+rand(-0.2,0.2));
    marchandise.rotation.y=rand(0,1);scene.add(marchandise);
    obstacles.push({x:cx+ox,z:cz+oz,r:1.5});});
  // bannières le long des murs intérieurs
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2+0.4;
    const bx=cx+Math.cos(a)*(R-3),bz=cz+Math.sin(a)*(R-3);
    const mât=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,5,4),mat(0x241a10));
    mât.position.set(bx,2.5,bz);scene.add(mât);
    const ban=new THREE.Mesh(new THREE.PlaneGeometry(0.9,2),
      new THREE.MeshStandardMaterial({color:0x4a1e18,side:THREE.DoubleSide,roughness:1}));
    ban.position.set(bx,3.6,bz);ban.rotation.y=a;scene.add(ban);banniers.push(ban);}
  // torches de rue
  torche(cx-6,cz+10);torche(cx+6,cz+10);torche(cx-10,cz-4);torche(cx+10,cz-4);torche(cx,cz+22,1.8,14);
  // lampadaires braseros
  [[-20,-12],[20,-12],[-20,14],[20,14]].forEach(([ox,oz])=>torche(cx+ox,cz+oz,1.6,13));
}
const banniers=[];

/* ---------- fabrique d'humanoïdes ---------- */
/* géométries unitaires et matériaux partagés : des centaines d'humanoïdes
   coexistent, l'échelle passe par un Group interne, pas par la géométrie.
   Conséquence assumée : le flash de dégât (emissive) est partagé entre
   silhouettes de même teinte — visible seulement en fallback sans rig. */
const _HGEO={},_HMAT={};
function _hgeo(k,mk){return _HGEO[k]||(_HGEO[k]=mk());}
function _hmat(c,rough=0.9){const k=c+'|'+rough;return _HMAT[k]||(_HMAT[k]=mat(c,rough));}
function _hbasic(c){const k='b'+c;return _HMAT[k]||(_HMAT[k]=new THREE.MeshBasicMaterial({color:c}));}
function humanoide(o){
  const g=new THREE.Group();const s=o.scale||1;
  const inner=new THREE.Group();inner.scale.setScalar(s);g.add(inner);
  const peau=_hmat(o.peau),habit=_hmat(o.habit||o.peau);
  const torse=new THREE.Mesh(_hgeo('torse',()=>new THREE.BoxGeometry(0.62,0.75,0.34)),habit);torse.position.y=1.05;torse.castShadow=true;
  const tete=new THREE.Mesh(_hgeo('tete',()=>new THREE.BoxGeometry(0.34,0.38,0.34)),peau);tete.position.y=1.65;tete.castShadow=true;
  const yeux=new THREE.Mesh(_hgeo('yeux',()=>new THREE.BoxGeometry(0.26,0.05,0.02)),_hbasic(o.yeux||0x050505));
  yeux.position.set(0,1.68,0.18);
  const mkBras=side=>{const b=new THREE.Mesh(_hgeo('bras',()=>{
      const bg=new THREE.BoxGeometry(0.16,0.7,0.16);bg.translate(0,-0.3,0);return bg;}),peau);
    b.position.set(0.42*side,1.38,0);b.castShadow=true;return b;};
  const mkJambe=side=>{const j=new THREE.Mesh(_hgeo('jambe',()=>{
      const jg=new THREE.BoxGeometry(0.2,0.72,0.2);jg.translate(0,-0.34,0);return jg;}),habit);
    j.position.set(0.16*side,0.7,0);j.castShadow=true;return j;};
  const brasG=mkBras(-1),brasD=mkBras(1),jambeG=mkJambe(-1),jambeD=mkJambe(1);
  inner.add(torse,tete,yeux,brasG,brasD,jambeG,jambeD);
  if(o.arme){
    const arme=new THREE.Group();
    arme.scale.setScalar(1/s); // dimensions ci-dessous déjà en *s, parent déjà scalé
    if(o.arme==='hache'){
      const m1=new THREE.Mesh(new THREE.CylinderGeometry(0.035*s,0.035*s,0.95*s,5),mat(0x241a10));m1.position.y=-0.65*s;
      const lame=new THREE.Mesh(new THREE.BoxGeometry(0.3*s,0.34*s,0.05*s),mat(0x6e6f6a,0.4));lame.position.y=-1.05*s;
      arme.add(m1,lame);
    }else if(o.arme==='marteau'){
      const m1=new THREE.Mesh(new THREE.CylinderGeometry(0.045*s,0.045*s,1.05*s,5),mat(0x241a10));m1.position.y=-0.7*s;
      const tete2=new THREE.Mesh(new THREE.BoxGeometry(0.42*s,0.26*s,0.26*s),mat(0x54544c,0.5));tete2.position.y=-1.2*s;
      arme.add(m1,tete2);
    }else if(o.arme==='arbalete'){
      const corps=new THREE.Mesh(new THREE.BoxGeometry(0.1*s,0.5*s,0.08*s),mat(0x2e2216));corps.position.y=-0.5*s;
      const arc=new THREE.Mesh(new THREE.BoxGeometry(0.55*s,0.06*s,0.05*s),mat(0x3c2c1a));arc.position.y=-0.72*s;
      arme.add(corps,arc);
    }else if(o.arme==='fouet'){
      const m1=new THREE.Mesh(new THREE.CylinderGeometry(0.03*s,0.03*s,0.4*s,4),mat(0x2e2216));m1.position.y=-0.45*s;
      const lan=new THREE.Mesh(new THREE.CylinderGeometry(0.015*s,0.025*s,0.9*s,4),mat(0x3a2c26));
      lan.position.y=-1*s;lan.rotation.z=0.3;
      arme.add(m1,lan);
    }else if(o.arme==='baton'){
      const m1=new THREE.Mesh(new THREE.CylinderGeometry(0.035*s,0.035*s,1.5*s,5),mat(0x241a10));m1.position.y=-0.4*s;
      const orbe=new THREE.Mesh(new THREE.SphereGeometry(0.1*s,7,7),new THREE.MeshBasicMaterial({color:0xd8783a}));
      orbe.position.y=0.4*s;arme.add(m1,orbe);
    }else if(o.arme==='os'){
      const m1=new THREE.Mesh(new THREE.CylinderGeometry(0.04*s,0.04*s,1.3*s,5),mat(0xb8b09a,0.7));m1.position.y=-0.4*s;
      const crane=new THREE.Mesh(new THREE.BoxGeometry(0.18*s,0.16*s,0.16*s),mat(0xc8c0a8,0.6));
      crane.position.y=0.32*s;arme.add(m1,crane);
    }
    brasD.add(arme);
  }
  g.userData.parts={torse,tete,brasG,brasD,jambeG,jambeD};
  return g;
}

/* ---------- montures ---------- */
function meshMonture(tier){
  const g=new THREE.Group();
  const noir=tier===1?0x2c241a:tier===2?0x14100d:0x3a4038;
  const corps=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.65,1.7),mat(noir));corps.position.y=1.05;corps.castShadow=true;g.add(corps);
  const cou=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.7,0.35),mat(noir));cou.position.set(0,1.55,0.8);cou.rotation.x=0.5;g.add(cou);
  const tete=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.3,0.55),mat(noir));tete.position.set(0,1.85,1.1);g.add(tete);
  const jambes=[];
  [[-0.22,0.6],[0.22,0.6],[-0.22,-0.6],[0.22,-0.6]].forEach(p=>{
    const j=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.85,0.16),mat(noir));
    j.geometry.translate(0,-0.42,0);j.position.set(p[0],0.95,p[1]);j.castShadow=true;g.add(j);jambes.push(j);});
  const queue=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.55,0.08),mat(0x0c0a08));
  queue.geometry.translate(0,-0.25,0);queue.position.set(0,1.2,-0.9);queue.rotation.x=-0.5;g.add(queue);
  if(tier>=2){
    const oe=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.04,0.02),new THREE.MeshBasicMaterial({color:0xd84a1c}));
    oe.position.set(0,1.9,1.38);g.add(oe);
    const pl=new THREE.PointLight(0xc4451a,0.7,4);pl.position.set(0,1.9,1.3);g.add(pl);}
  let ailes=null;
  if(tier===3){ailes=[];
    [-1,1].forEach(side=>{
      const a=new THREE.Mesh(new THREE.PlaneGeometry(1.9,0.9),
        new THREE.MeshStandardMaterial({color:0x707a6c,side:THREE.DoubleSide,transparent:true,opacity:0.85,roughness:0.8}));
      a.geometry.translate(0.95*side,0,0);a.position.set(0.3*side,1.5,0.1);g.add(a);ailes.push(a);});}
  g.userData={jambes,ailes};g.visible=false;scene.add(g);return g;
}
const MOUNT_DEF=[null,
 {nom:'Destrier de Morfaille',mult:1.65,lvl:30,prix:100,desc:'Un cheval qui a vu trop de choses. +65% vitesse.'},
 {nom:'Cauchemar cendré',mult:2.1,lvl:50,prix:400,desc:'Ses yeux couvent encore. +110% vitesse.'},
 {nom:'Vouivre blafarde',mult:2.2,lvl:70,prix:1200,desc:"Elle vole. La lande, en dessous, attend. ▲▼ / Espace-C pour l'altitude."}];

/* ---------- relief : hauteur analytique du terrain ---------- */
const FLATS=[
 {x:0,z:-30,r:69},{x:0,z:180,r:27},{x:RUINES.x,z:RUINES.z,r:24},
 {x:158,z:68,r:18},{x:-172,z:-38,r:18},{x:52,z:-195,r:18},
 {x:-45,z:225,r:15},{x:255,z:42,r:15},{x:-210,z:-87,r:15},{x:120,z:-222,r:15},
 {x:282,z:111,r:21},{x:-303,z:-93,r:21},{x:93,z:-312,r:21},
 {x:-312,z:321,r:24},{x:339,z:336,r:48},{x:150,z:-132,r:15}];
function terrainH(x,z){
  let h=Math.sin(x*0.021)*Math.cos(z*0.017)*1.15
       +Math.sin(x*0.047+z*0.033)*0.6
       +Math.sin((x-z)*0.012)*0.85+1.25;
  const zn=zoneAt({x,z}).id;
  if(zn==='fange')h*=0.32;
  else if(zn==='capitale')h*=0.5;
  else if(zn==='cretes'){h*=1.6;h+=Math.max(0,Math.sin(x*0.06)*Math.sin(z*0.07))*2.4;}
  let m=1;
  for(let i=0;i<FLATS.length;i++){
    const f=FLATS[i],d=dist2D({x,z},f);
    if(d<f.r)m=Math.min(m,clamp((d-f.r*0.45)/(f.r*0.55),0,1));}
  return Math.max(0,h*m);
}
/* ---------- sol vivant : relief + couleurs de vertex par zone ---------- */
function buildSol(){
  const SEG=200;
  const geo=new THREE.PlaneGeometry(840,840,SEG,SEG);
  const pos=geo.attributes.position;
  const cols=new Float32Array(pos.count*3);
  const c=new THREE.Color(),base=new THREE.Color();
  const tints={lande:0x50583c,fange:0x3c503e,foret:0x38402e,cretes:0x565044,capitale:0x4c4f40};
  for(let i=0;i<pos.count;i++){
    const vx=pos.getX(i),vy=pos.getY(i);
    const wx=vx,wz=-vy;
    pos.setZ(i,terrainH(wx,wz));
    base.setHex(tints[zoneAt({x:wx,z:wz}).id]||0x50583c);
    // marbrures : variations lentes + grain
    const mot=0.78+0.22*Math.sin(wx*0.09+wz*0.075)+0.14*Math.sin(wx*0.31)*Math.sin(wz*0.27)+rand(-0.06,0.06);
    c.copy(base).multiplyScalar(clamp(mot,0.55,1.25));
    cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;
  }
  geo.setAttribute('color',new THREE.BufferAttribute(cols,3));
  geo.computeVertexNormals();
  const sol=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:groundTexture(),roughness:1,vertexColors:true}));
  sol.rotation.x=-Math.PI/2;
  sol.receiveShadow=true;
  scene.add(sol);
}

