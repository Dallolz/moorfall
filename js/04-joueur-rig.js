'use strict';
/* ---------- joueur ---------- */
const player={pos:V3(0,0,126),vel:V3(0,0,0),mass:80,radius:0.45,hp:100,
  facing:0,moveTarget:null,targetEnemy:null,pendingNpc:null,attack:null,dash:null,grab:null,
  cdR:0,invuln:0,stagger:0,dead:false,mesh:null};
let capeLight=null;
function npc(id,nom,role,x,z,peau,habit){
  const my=terrainH(x,z);
  const m=humanoide({peau,habit});
  attachRig(m,'npc:'+id);
  m.position.set(x,my,z);m.rotation.y=rand(0,6.28);scene.add(m);
  const marker=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.4,4),new THREE.MeshBasicMaterial({color:0xd8c26a}));
  marker.position.set(x,my+2.5,z);marker.rotation.x=Math.PI;scene.add(marker);
  const n={id,nom,role,x,z,my,mesh:m,marker};npcs.push(n);return n;
}
function citoyen(x,z){
  const m=humanoide({peau:0x8f8068,habit:[0x33302a,0x3a2e28,0x2c3230][irand(0,2)]});
  attachRig(m,'villager');
  m.position.set(x,terrainH(x,z),z);scene.add(m);
  citizens.push({mesh:m,pos:m.position,home:{x,z},t:rand(0,4),wander:null,phase:rand(0,6)});
}

/* ==================================================================
   VISUELS RIGGÉS — écosystème Quaternius « Universal Rig » (CC0)
   Un squelette partagé (65 bones, style Unreal : pelvis, spine_01…)
   par entité ; les pièces de tenue (SkinnedMesh) sont RE-LIÉES sur ce
   squelette par nom de bone → tenues modulaires, loot visible par slot.
   Les clips viennent de bibliothèques séparées (UAL1+UAL2) et ciblent
   les bones par nom — locomotion zombie pour les Creux, épée, sorts.
   Fallback : sans réseau ni loaders, personnages procéduraux d'origine.
   Désactivable via ?norig
   Sources (CC0 1.0, Quaternius — quaternius.com) servies depuis
   github.com/Dallolz/moorfall-assets :
   - Universal Base Characters (corps Superhero M/F)
   - Modular Character Outfits Fantasy (Peasant + Ranger, par pièce)
   - Universal Animation Library 1 & 2 (86 clips partagés)
   ================================================================== */
const RIG_ON=(typeof THREE.GLTFLoader==='function')&&!!THREE.SkeletonUtils
  &&typeof THREE.SkeletonUtils.clone==='function'&&!/norig/.test(location.search);
const RIG_DEBUG={on:RIG_ON,loaded:[],failed:[],rigs:0};window.RIG_DEBUG=RIG_DEBUG;
if(!RIG_ON)console.warn('[RIG] désactivé — GLTFLoader:',typeof THREE.GLTFLoader,
  '| SkeletonUtils:',typeof THREE.SkeletonUtils,'| ?norig:',/norig/.test(location.search));
else console.info('[RIG] actif — chargement des modèles Quaternius (CC0) en arrière-plan…');
const _MFA='https://raw.githubusercontent.com/Dallolz/moorfall-assets/main/';
const RIG_FILES={
 ual1:_MFA+'animations/UAL1.glb',ual2:_MFA+'animations/UAL2.glb',
 m:_MFA+'characters/Superhero_Male.glb',f:_MFA+'characters/Superhero_Female.glb',
 Peasant_m:_MFA+'outfits/Male_Peasant.glb',Peasant_f:_MFA+'outfits/Female_Peasant.glb',
 Ranger_m:_MFA+'outfits/Male_Ranger.glb',Ranger_f:_MFA+'outfits/Female_Ranger.glb',
 Hair_Beard:_MFA+'hair/Hair_Beard.glb',Hair_Buns:_MFA+'hair/Hair_Buns.glb',
 Hair_Buzzed:_MFA+'hair/Hair_Buzzed.glb',Hair_BuzzedFemale:_MFA+'hair/Hair_BuzzedFemale.glb',
 Hair_Long:_MFA+'hair/Hair_Long.glb',Hair_SimpleParted:_MFA+'hair/Hair_SimpleParted.glb'};
/* clips one-shot par intention de combat (résolus dans UAL1+UAL2) */
const RIG_ATK={slash:['Sword_Attack','Melee_Hook'],smash:['Sword_Attack'],
 sweep:['Sword_Regular_C'],spin:['Sword_Regular_Combo'],
 cast:['Spell_Simple_Shoot'],summon:['Spell_Simple_Enter'],shoot:['Pistol_Shoot'],
 roll:['Roll'],eatk:['Zombie_Scratch','Melee_Hook','Punch_Cross'],eshoot:['Spell_Simple_Shoot']};
/* jeux de locomotion : humains, morts qui marchent, bêtes voûtées */
const RIG_LOCO={
 human:{idle:'Idle_Loop',walk:'Walk_Loop',run:'Jog_Fwd_Loop',sit:'Sitting_Idle_Loop',wTS:1.6,rTS:4.5},
 zombie:{idle:'Zombie_Idle_Loop',walk:'Zombie_Walk_Fwd_Loop',run:'Zombie_Walk_Fwd_Loop',wTS:1.1,rTS:2.0},
 crouch:{idle:'Crouch_Idle_Loop',walk:'Crouch_Fwd_Loop',run:'Crouch_Fwd_Loop',wTS:1.3,rTS:2.4}};
/* pièces canoniques (sans préfixe de genre) — ordre : préfixes longs d'abord */
const RIG_PIECES=['Ranger_Acc_Pauldron','Ranger_Arms_Bracer','Ranger_Body_Belt_1',
 'Ranger_Body_Belt_2','Ranger_Head_Hood','Ranger_Arms','Ranger_Body','Ranger_Feet',
 'Ranger_Legs','Peasant_Arms','Peasant_Body','Peasant_Feet','Peasant_Legs'];
/* silhouettes de classe : corps + pièces + cheveux (le loot remplace ces défauts) */
const RIG_CLASS={
 ecorcheur:{g:'m',h:1.92,pieces:['Peasant_Body','Peasant_Arms','Peasant_Legs','Peasant_Feet'],
   hairs:[['Hair_Buzzed',0x3a2c1c],['Hair_Beard',0x3a2c1c]]},
 briseroc:{g:'m',h:1.95,pieces:['Ranger_Body','Ranger_Arms','Ranger_Legs','Ranger_Feet',
   'Ranger_Body_Belt_1','Ranger_Acc_Pauldron'],hairs:[['Hair_Buzzed',0x55504a]]},
 arbaletriere:{g:'f',h:1.8,pieces:['Ranger_Body','Ranger_Arms','Ranger_Legs','Ranger_Feet',
   'Ranger_Head_Hood','Ranger_Arms_Bracer'],hairs:[]},
 flagellant:{g:'m',h:1.85,pieces:['Peasant_Body','Peasant_Arms','Peasant_Legs','Peasant_Feet',
   'Ranger_Head_Hood'],hairs:[],tint:{Ranger_Head_Hood:0x9a6a6e}},
 cendremage:{g:'f',h:1.8,pieces:['Peasant_Body','Peasant_Arms','Peasant_Legs','Peasant_Feet',
   'Ranger_Head_Hood'],hairs:[],tint:{Ranger_Head_Hood:0x9a8ac0,Peasant_Body:0xa89ec4}},
 ossuaire:{g:'m',h:1.85,pieces:['Peasant_Body','Peasant_Arms','Peasant_Legs','Peasant_Feet',
   'Ranger_Head_Hood'],hairs:[['Hair_Beard',0xb8b09a]],tint:{Ranger_Head_Hood:0xa8ae96,Peasant_Body:0xa8ae96},
   atk:{slash:['Melee_Hook','Punch_Cross']}},
 voleur:{g:'m',h:1.82,pieces:['Ranger_Body','Ranger_Arms','Ranger_Legs','Ranger_Feet',
   'Ranger_Head_Hood','Ranger_Body_Belt_1'],hairs:[],
   tint:{Ranger_Body:0x8a95a8,Ranger_Head_Hood:0x707a8c,Ranger_Legs:0x8a95a8,Ranger_Arms:0x9aa2b0},
   atk:{slash:['Sword_Regular_A','Sword_Regular_B','Melee_Hook']}}};
/* armes 3D (Modular Weapons Pack) par classe et style — [modèle, échelle]
   pas d'entrée -> armes procédurales (arbalètes, fouets, bâtons, os) */
const RIG_WEAPONS={
 ecorcheur:{w1:{r:['Axe',0.2]},w2:{r:['Axe_Small',0.2],l:['Axe_Small',0.2]},w3:{r:['Axe_Double',0.2]}},
 briseroc:{w1:{r:['Hammer_Small',0.22],l:['Shield_Round',0.28]},w2:{r:['Hammer_Double',0.22]},
   w3:{r:['Hammer_Small',0.22],l:['Hammer_Small',0.22]}},
 ossuaire:{w1:{r:['Scythe',0.26]}},
 voleur:{w1:{r:['Dagger',0.15],l:['Dagger_2',0.15]},w3:{r:['Claymore',0.17],l:['Dagger',0.15]}}};
['Axe','Axe_Double','Axe_Small','Claymore','Dagger','Dagger_2','Hammer_Double','Hammer_Small',
 'Scythe','Shield_Round'].forEach(n=>{RIG_FILES['W_'+n]=_MFA+'weapons/'+n+'.glb';});
/* bestiaire à rig propre : modèles animés autonomes (clips embarqués, PAS l'UAL).
   h = hauteur monde à scale 1 ; loco/atk/death = noms de clips DU modèle */
const _SQ_LOCO={idle:'Idle',walk:'Walking_A',run:'Running_A',wTS:1.6,rTS:4.2};
const MOB_MODELS={
 sq_minion:{f:'enemies/Skeleton_Minion.glb',h:1.75,loco:_SQ_LOCO,death:'Death_A',
   atk:{eatk:['1H_Melee_Attack_Chop','1H_Melee_Attack_Slice_Diagonal','1H_Melee_Attack_Stab'],
        eshoot:['Spellcast_Shoot']}},
 sq_rogue:{f:'enemies/Skeleton_Rogue.glb',h:1.8,loco:_SQ_LOCO,death:'Death_B',
   atk:{eatk:['1H_Melee_Attack_Stab','1H_Melee_Attack_Slice_Diagonal'],eshoot:['Spellcast_Shoot']}},
 sq_mage:{f:'enemies/Skeleton_Mage.glb',h:1.85,loco:_SQ_LOCO,death:'Death_B',
   atk:{eatk:['1H_Melee_Attack_Chop'],eshoot:['Spellcast_Shoot'],summon:['Spellcast_Raise']}},
 sq_warrior:{f:'enemies/Skeleton_Warrior.glb',h:1.9,loco:_SQ_LOCO,death:'Death_A',
   atk:{eatk:['2H_Melee_Attack_Chop','2H_Melee_Attack_Spin'],eshoot:['Spellcast_Shoot']}}};
const RIG_NPC_F=new Set(['maud','ivane','berthe','noyee','ashka']);
const RIG_ENEMY_F=new Set(['rodeuse','veuve','mere']);
const RIG_ENEMY_ROBED=new Set(['moine','choeur','porteur','berger','pendeur']);
const _HAIRS_M=[['Hair_Buzzed',0x3a2c1c],['Hair_SimpleParted',0x4a3826],['Hair_Beard',0x3a2c1c],['Hair_SimpleParted',0x66605a]];
const _HAIRS_F=[['Hair_Long',0x3a2c1c],['Hair_Buns',0x4a3826],['Hair_BuzzedFemale',0x2c241c],['Hair_Long',0x8a7a5a]];
const _CLOTH_TINTS=[0xb0a890,0x9aa88e,0x8e9aa8,0xb09a8a,0xa8a8a0,0x9a8ea0];
function _lighten(hex,f){return new THREE.Color(hex).lerp(new THREE.Color(0xffffff),f).getHex();}
function _rigDefOf(key){
  if(key.slice(0,2)==='c:')return RIG_CLASS[key.slice(2)];
  if(key.slice(0,2)==='e:'){
    const t=key.slice(2),d=ENEMY_DEF[t]||{};
    if(d.model&&MOB_MODELS[d.model])
      return{mob:MOB_MODELS[d.model],h:MOB_MODELS[d.model].h,skin:d.mtint||null};
    const def={g:RIG_ENEMY_F.has(t)?'f':'m',h:1.85,skin:d.peau,
      loco:d.beast?'crouch':'zombie',pieces:[],hairs:[]};
    if(RIG_ENEMY_ROBED.has(t)){
      def.pieces=['Peasant_Body','Peasant_Arms','Peasant_Legs'];
      const hc=_lighten(d.habit||0x3a3a30,0.35);
      def.tint={Peasant_Body:hc,Peasant_Arms:hc,Peasant_Legs:hc};}
    return def;}
  if(key==='villager'){
    const g=Math.random()<0.45?'f':'m';
    return{g,h:1.72+rand(-0.04,0.06),pieces:['Peasant_Body','Peasant_Arms','Peasant_Legs','Peasant_Feet'],
      hairs:[(g==='f'?_HAIRS_F:_HAIRS_M)[irand(0,3)]],
      tint:{Peasant_Body:_CLOTH_TINTS[irand(0,_CLOTH_TINTS.length-1)]}};}
  if(key.slice(0,4)==='npc:'){
    const id=key.slice(4),g=RIG_NPC_F.has(id)?'f':'m';
    return{g,h:1.76,pieces:['Peasant_Body','Peasant_Arms','Peasant_Legs','Peasant_Feet'],
      hairs:[(g==='f'?_HAIRS_F:_HAIRS_M)[id.length%4]]};}
  if(key==='servitor')return{g:'m',h:1.7,skin:0xcfc7ae,loco:'zombie',pieces:[],hairs:[]};
  return null;
}
const _rigCache={},_rigLoader=RIG_ON?new THREE.GLTFLoader():null,_rigs=new Set();
function _rigLoad(url){ /* une seule requête/parse par URL */
  if(_rigCache[url])return _rigCache[url];
  return _rigCache[url]=new Promise((res,rej)=>_rigLoader.load(url,g=>{
    const box=new THREE.Box3().setFromObject(g.scene);
    g.userData={normH:Math.max(0.001,box.max.y-box.min.y)};
    RIG_DEBUG.loaded.push(url.split('/').pop());
    console.info('[RIG] chargé :',url.split('/').pop(),'('+RIG_DEBUG.loaded.length+')');
    res(g);
  },undefined,err=>{
    RIG_DEBUG.failed.push(url.split('/').pop());
    console.warn('[RIG] échec de chargement :',url,err);
    if(RIG_DEBUG.failed.length===1)try{toast('Modèles 3D indisponibles',
      'Réseau bloqué vers raw.githubusercontent.com — visuels procéduraux conservés');}catch(e){}
    rej(err);
  }));
}
let _rigClipsP=null;
function _rigClips(){ /* UAL1+UAL2 fusionnées : nom de clip -> AnimationClip */
  return _rigClipsP||(_rigClipsP=Promise.all([_rigLoad(RIG_FILES.ual1),_rigLoad(RIG_FILES.ual2)])
    .then(libs=>{const m={};libs.forEach(g=>g.animations.forEach(c=>{if(!m[c.name])m[c.name]=c;}));return m;}));
}
function _clipOf(clips,names){for(const n of names){if(clips[n])return clips[n];}return null;}
/* nom canonique d'une pièce : Male_Ranger_Feet_Boots -> Ranger_Feet */
function _pieceKey(name){
  const n=name.replace(/^(Male|Female)_/,'').replace('Acc_Pauldrons','Acc_Pauldron')
    .replace('Feet_Boots','Feet');
  return RIG_PIECES.includes(n)?n:RIG_PIECES.find(k=>n.startsWith(k))||n;
}
/* re-lie un SkinnedMesh source sur le squelette de l'entité, par nom de bone */
function _rigBind(src,bones,root){
  const m=src.clone();
  m.material=src.material.clone();
  m.bind(new THREE.Skeleton(src.skeleton.bones.map(b=>bones[b.name]),src.skeleton.boneInverses),src.bindMatrix);
  m.castShadow=true;m.frustumCulled=false;m.visible=false;
  root.add(m);return m;
}
/* greffe d'un modèle à rig propre : mêmes interfaces que les rigs UAL
   (rigSet/rigOneShot/rigDeath/rigFlash), clips lus dans le GLB lui-même */
function _attachMobRig(mesh,def,opts){
  const mob=def.mob,sc=(opts&&opts.scale)||1;
  _rigLoad(_MFA+mob.f).then(g=>{
    if(!mesh.parent&&mesh!==player.mesh)return;
    if(mesh.userData.rig)return;
    mesh.traverse(o=>{if(o.isMesh&&!o.userData.keep)o.visible=false;});
    const root=THREE.SkeletonUtils.clone(g.scene);
    root.scale.setScalar(def.h/g.userData.normH*sc);
    const mats=[];
    root.traverse(o=>{if(o.isMesh){
      o.castShadow=true;o.frustumCulled=false;
      o.material=o.material.clone();mats.push(o.material);
      if(def.skin&&o.material.color)o.material.color.multiply(new THREE.Color(def.skin));}});
    mesh.add(root);
    const clips={};g.animations.forEach(c=>{if(!clips[c.name])clips[c.name]=c;});
    const mx=new THREE.AnimationMixer(root);
    const base={idle:clips[mob.loco.idle],walk:clips[mob.loco.walk],
      run:clips[mob.loco.run]||clips[mob.loco.walk],death:clips[mob.death]};
    const rig={mesh,root,mx,clips,def:{atk:mob.atk},loco:mob.loco,mats,base,
      pieces:{},hairs:{},gear:[],bones:{},cur:null,oneshot:null,dead:false,flash:0};
    mx.addEventListener('finished',ev=>{
      if(rig.dead)return;
      if(rig.oneshot&&ev.action===rig.oneshot){rig.oneshot=null;rig.cur=null;}});
    mesh.userData.rig=rig;_rigs.add(rig);RIG_DEBUG.rigs++;
    _rigBase(rig,'idle',1);
  }).catch(err=>{if(err&&err.stack)console.warn('[RIG] mob('+mob.f+') :',err);});
}
function attachRig(mesh,key,opts){
  if(!RIG_ON||!mesh)return;
  const def=_rigDefOf(key);
  if(!def)return;
  if(def.mob)return _attachMobRig(mesh,def,opts);
  const sc=(opts&&opts.scale)||1;
  const sets=new Set(def.pieces.map(p=>p.split('_')[0]));
  if(key.slice(0,2)==='c:'){sets.add('Peasant');sets.add('Ranger');} // le loot peut tout demander
  const cl=key.slice(0,2)==='c:'?key.slice(2):null;
  const wstyle=cl?(mesh===player.mesh?G.wstyle:selStyle):null;
  const wspec=cl&&RIG_WEAPONS[cl]?RIG_WEAPONS[cl][wstyle]:null;
  const wfiles=wspec?[wspec.r,wspec.l].filter(Boolean):[];
  const wants=[_rigLoad(RIG_FILES[def.g]),_rigClips()];
  sets.forEach(s=>wants.push(_rigLoad(RIG_FILES[s+'_'+def.g])));
  def.hairs.forEach(h=>wants.push(_rigLoad(RIG_FILES[h[0]])));
  wfiles.forEach(w=>wants.push(_rigLoad(RIG_FILES['W_'+w[0]])));
  Promise.all(wants).then(([charG,clips,...rest])=>{
    if(!mesh.parent&&mesh!==player.mesh)return;          // entité déjà retirée
    if(mesh.userData.rig)return;                         // déjà greffé
    // 1) masquer TOUTE la géométrie procédurale (boîtes, kit de classe, armes)
    mesh.traverse(o=>{if(o.isMesh&&!o.userData.keep)o.visible=false;});
    // 2) corps de base cloné (squelette + skin propres, géométrie partagée)
    const root=THREE.SkeletonUtils.clone(charG.scene);
    const s=def.h/charG.userData.normH*sc;root.scale.setScalar(s);
    const bones={};root.traverse(o=>{if(o.isBone)bones[o.name]=o;});
    const mats=[];
    root.traverse(o=>{if(o.isMesh){
      o.castShadow=true;o.frustumCulled=false;           // SkinnedMesh + culling r128 = pops
      o.material=o.material.clone();mats.push(o.material);
      if(def.skin&&o.material.color)o.material.color.multiply(new THREE.Color(def.skin));}});
    mesh.add(root);
    // 3) pièces de tenue re-liées sur le squelette commun (montrées par rigSetLook)
    const pieces={};
    const outfits=rest.slice(0,sets.size);
    outfits.forEach(g=>g.scene.traverse(o=>{
      if(o.isSkinnedMesh){const k=_pieceKey(o.name);
        if(!pieces[k])pieces[k]=[];
        const b=_rigBind(o,bones,root);mats.push(b.material);pieces[k].push(b);}}));
    const hairs={};
    rest.slice(sets.size,sets.size+def.hairs.length).forEach((g,i)=>g.scene.traverse(o=>{
      if(o.isSkinnedMesh){const b=_rigBind(o,bones,root);
        b.material=new THREE.MeshStandardMaterial({color:def.hairs[i][1],roughness:0.85,skinning:true});
        mats.push(b.material);hairs[def.hairs[i][0]]=b;}}));
    // 4) mixer + résolution des clips
    const loco=RIG_LOCO[def.loco||'human'];
    const mx=new THREE.AnimationMixer(root);
    const base={idle:clips[loco.idle],walk:clips[loco.walk],run:clips[loco.run],
      sit:loco.sit?clips[loco.sit]:null,death:clips.Death01};
    const rig={mesh,root,mx,clips,def,loco,mats,base,pieces,hairs,gear:[],bones,
      cur:null,oneshot:null,dead:false,flash:0};
    mx.addEventListener('finished',ev=>{
      if(rig.dead)return;
      if(rig.oneshot&&ev.action===rig.oneshot){rig.oneshot=null;rig.cur=null;}});
    mesh.userData.rig=rig;_rigs.add(rig);RIG_DEBUG.rigs++;
    rigSetLook(rig,def.pieces,def.tint||{},def.hairs);
    // 5) armes dans les vraies mains (bones hand_r/hand_l) :
    //    modèles 3D du Modular Weapons Pack, sinon armes procédurales de classe
    if(cl&&bones.hand_r&&bones.hand_l){
      const mkHand=bone=>{const w=new THREE.Group();
        w.rotation.set(Math.PI,0,0);bone.add(w);return w;};
      rig.handR=mkHand(bones.hand_r);rig.handL=mkHand(bones.hand_l);
      rig.weaponMats=[];
      if(wspec){
        const wg=rest.slice(sets.size+def.hairs.length);
        const addW=(g,spec,wrap)=>{
          const w=g.scene.clone(true);
          w.scale.setScalar(spec[1]);
          w.rotation.x=Math.PI;                          // modèles +Y : pointe vers le bas au repos
          w.traverse(o=>{if(o.isMesh){o.castShadow=true;
            o.material=o.material.clone();mats.push(o.material);rig.weaponMats.push(o.material);}});
          wrap.add(w);return w;
        };
        mesh.userData.weapon=addW(wg[0],wspec.r,rig.handR);
        if(wspec.l)addW(wg[1],wspec.l,rig.handL);
      }else{
        attachWeapons(mesh,cl,wsDef(cl,wstyle),null,rig.handR,rig.handL);
      }
    }
    if(mesh===player.mesh)majApparence();
    _rigBase(rig,'idle',1);
  }).catch(err=>{if(err&&err.stack)console.warn('[RIG] attachRig('+key+') :',err);});
}
/* applique une silhouette : pièces visibles + teintes + cheveux */
function rigSetLook(rig,list,tints,hairList){
  rig.gear.forEach(g=>{if(g.parent)g.parent.remove(g);});rig.gear=[];
  Object.keys(rig.pieces).forEach(k=>rig.pieces[k].forEach(p=>{p.visible=false;}));
  list.forEach(k=>{(rig.pieces[k]||[]).forEach(p=>{
    p.visible=true;
    p.material.color.setHex(tints[k]||0xffffff);});});
  Object.keys(rig.hairs).forEach(h=>{rig.hairs[h].visible=false;});
  (hairList||[]).forEach(h=>{if(rig.hairs[h[0]])rig.hairs[h[0]].visible=true;});
}
/* le loot du joueur devient sa tenue : Paysan -> Rôdeur + teintes de rareté */
function rigPlayerLook(rig){
  const L=RIG_CLASS[G.classe]||RIG_CLASS.ecorcheur,eq=G.equip;
  const pieces=new Set(L.pieces),tints=Object.assign({},L.tint||{});
  const swap=(parts,S)=>parts.forEach(p=>{pieces.delete('Peasant_'+p);pieces.delete('Ranger_'+p);pieces.add(S+'_'+p);});
  const rset=r=>r>=2?'Ranger':'Peasant',rcol=r=>_lighten(RAR_COLORS[r],0.55);
  if(eq.torse){const S=rset(eq.torse.rar);
    swap(['Body','Arms'],S);
    if(eq.torse.rar>=2)pieces.add('Ranger_Body_Belt_1');
    if(eq.torse.rar>=3){pieces.add('Ranger_Acc_Pauldron');pieces.add('Ranger_Body_Belt_2');}
    if(eq.torse.rar>=4)pieces.add('Ranger_Arms_Bracer');
    if(eq.torse.rar>=1)tints[S+'_Body']=rcol(eq.torse.rar);}
  if(eq.jambes){const S=rset(eq.jambes.rar);
    swap(['Legs','Feet'],S);
    if(eq.jambes.rar>=1)tints[S+'_Legs']=rcol(eq.jambes.rar);}
  if(eq.tete){pieces.add('Ranger_Head_Hood');
    if(eq.tete.rar>=1)tints.Ranger_Head_Hood=rcol(eq.tete.rar);}
  const hairs=eq.tete?L.hairs.filter(h=>h[0]==='Hair_Beard'):L.hairs; // la capuche couvre
  rigSetLook(rig,[...pieces],tints,hairs);
  if(eq.amulette&&rig.bones.spine_03){
    const m2=gearMat(eq.amulette.rar);m2.emissive.setHex(RAR_COLORS[eq.amulette.rar]);
    m2.emissiveIntensity=0.55;
    const a=new THREE.Mesh(new THREE.OctahedronGeometry(0.055),m2);
    a.position.set(0,0.14,0.13);rig.bones.spine_03.add(a);rig.gear.push(a);}
  if(Object.values(eq).some(it=>it&&it.rar===4)&&rig.bones.spine_03){
    const l=new THREE.PointLight(0xe8963a,0.5,4);
    l.position.set(0,0.2,0.35);rig.bones.spine_03.add(l);rig.gear.push(l);}
  if(rig.weaponMats&&rig.weaponMats.length){ // lueur de rareté sur l'arme
    const glow=[0,0x0a2008,0x0a1830,0x241040,0x553008][eq.arme?eq.arme.rar:0]||0;
    rig.weaponMats.forEach(m=>{if(m.emissive){m.emissive.setHex(glow);m.userData.baseEmi=glow;}});}
}
function _rigBase(rig,name,ts){
  const clip=rig.base[name]||rig.base.idle;if(!clip)return;
  const act=rig.mx.clipAction(clip);
  act.timeScale=ts;
  if(rig.cur===act)return;
  act.reset().setLoop(THREE.LoopRepeat).fadeIn(0.16).play();
  if(rig.cur)rig.cur.fadeOut(0.16);
  rig.cur=act;
}
function rigOneShot(mesh,kind,dur){
  const rig=mesh&&mesh.userData.rig;if(!rig||rig.dead)return;
  const names=(rig.def.atk&&rig.def.atk[kind])||RIG_ATK[kind]||RIG_ATK.slash;
  const clip=_clipOf(rig.clips,Array.isArray(names)?names:[names]);if(!clip)return;
  const act=rig.mx.clipAction(clip);
  act.setLoop(THREE.LoopOnce);act.clampWhenFinished=true;
  act.timeScale=dur?Math.max(0.8,Math.min(2.4,clip.duration/dur)):1.3;
  act.reset().fadeIn(0.06).play();
  if(rig.cur&&rig.cur!==act)rig.cur.fadeOut(0.08);
  rig.cur=null;rig.oneshot=act;
}
function rigDeath(mesh){
  const rig=mesh&&mesh.userData.rig;if(!rig||rig.dead)return;
  rig.dead=true;
  const clip=rig.base.death;if(!clip)return;
  const act=rig.mx.clipAction(clip);
  act.setLoop(THREE.LoopOnce);act.clampWhenFinished=true;act.timeScale=1.4;
  act.reset().fadeIn(0.08).play();
  if(rig.cur)rig.cur.fadeOut(0.08);
  rig.cur=null;rig.oneshot=null;
}
function rigRevive(mesh){
  const rig=mesh&&mesh.userData.rig;if(!rig)return;
  rig.dead=false;rig.cur=null;rig.oneshot=null;rig.mx.stopAllAction();
  _rigBase(rig,'idle',1);
}
function rigFlash(mesh,on){
  const rig=mesh&&mesh.userData.rig;if(!rig)return;
  if(rig.flash===+on)return;rig.flash=+on;
  rig.mats.forEach(m=>{if(m.emissive)m.emissive.setHex(on?0x661414:(m.userData.baseEmi||0x000000));});
}
/* pilotage : animeHumanoide déclare l'état voulu, le mixer avance 1×/frame */
function rigSet(rig,speed,attack){
  if(rig.dead)return;
  if(attack&&rig.lastAtk!==attack){rig.lastAtk=attack;
    rigOneShot(rig.mesh,attack.anim||'slash',attack.dur);return;}
  if(!attack)rig.lastAtk=null;
  if(rig.oneshot)return;                                // laisser finir le one-shot
  if(speed<0.25)_rigBase(rig,'idle',1);
  else if(speed<4.2)_rigBase(rig,'walk',Math.max(0.7,speed/rig.loco.wTS));
  else _rigBase(rig,'run',Math.max(0.8,speed/rig.loco.rTS));
}
let _rigLastT=0;
function rigTickAll(now){
  if(!_rigs.size)return;
  const dt=Math.min(0.05,(now-_rigLastT)/1000);_rigLastT=now;
  _rigs.forEach(r=>{
    let top=r.mesh;while(top.parent)top=top.parent;
    if(!top.isScene){_rigs.delete(r);r.mx.stopAllAction();r.mx.uncacheRoot(r.root);return;}
    r.mx.update(dt);
  });
}
/* préchargement non bloquant : bibliothèques + corps + tenues paysannes */
if(RIG_ON){_rigClips().catch(()=>{});
  ['m','f','Peasant_m','Peasant_f'].forEach(k=>_rigLoad(RIG_FILES[k]).catch(()=>{}));}

