'use strict';
/* ---------- base de sorts (20 par classe) ---------- */
const SPELLS={
ecorcheur:[
 {i:'ec01',n:'Taillade',ic:'🗡',l:1,cd:3,tg:['melee'],t:'melee',p:{r:2.5,m:1.2,f:300},d:'Coup net, recul franc'},
 {i:'ec02',n:'Pommeau',ic:'🔨',l:1,cd:6,tg:['melee','ctrl'],t:'melee',p:{r:2.2,m:0.7,f:420,slow:2},d:'Sonne la cible, la ralentit'},
 {i:'ec03',n:'Frappe brutale',ic:'🪓',l:3,cd:5,tg:['melee'],t:'melee',p:{r:2.6,m:1.9,f:560},d:'×1,9 dégâts, gros recul'},
 {i:'ec04',n:'Cri de guerre',ic:'📢',l:5,cd:18,tg:['mob'],t:'buff',p:{k:'dmg',m:1.25,dur:8},d:'+25% dégâts, 8 s'},
 {i:'ec05',n:'Onde tellurique',ic:'💥',l:8,cd:9,tg:['aoe'],t:'aoe',p:{r:4.6,m:1.3,f:700,up:0.8},d:'Tout est projeté en l\'air autour de vous'},
 {i:'ec06',n:'Charge',ic:'🐗',l:12,cd:8,tg:['mob','melee'],t:'dash',p:{dist:11,m:1.4,f:520},d:'Ruée qui percute tout sur 11 m'},
 {i:'ec07',n:'Exécution',ic:'⚔',l:14,cd:10,tg:['melee'],t:'melee',p:{r:2.6,m:2.6,f:480},d:'Coup de grâce, ×2,6'},
 {i:'ec08',n:'Tourbillon',ic:'🌀',l:16,cd:8,tg:['melee','aoe'],t:'melee',p:{r:3,m:1.1,f:300,arc:-1},d:'Frappe à 360°'},
 {i:'ec09',n:'Hurlement',ic:'😱',l:18,cd:12,tg:['ctrl','aoe'],t:'aoe',p:{r:5,m:0.2,f:520},d:'Repousse tout, peu de dégâts'},
 {i:'ec10',n:'Fracas',ic:'⛏',l:20,cd:8,tg:['melee'],t:'melee',p:{r:2.6,m:1.6,f:640,up:0.9},d:'La cible décolle'},
 {i:'ec11',n:'Second souffle',ic:'❤',l:22,cd:25,tg:['mob'],t:'heal',p:{pct:0.3},d:'Rend 30% des PV'},
 {i:'ec12',n:'Charge sauvage',ic:'💨',l:25,cd:10,tg:['mob','melee'],t:'dash',p:{dist:15,m:1.7,f:620},d:'Ruée longue et brutale'},
 {i:'ec13',n:'Rupture',ic:'🩸',l:28,cd:9,tg:['melee','dot'],t:'cone',p:{r:5,m:1.4,f:380,dot:1},d:'Cône saignant'},
 {i:'ec14',n:'Séisme',ic:'🌋',l:32,cd:12,tg:['aoe'],t:'aoe',p:{r:6,m:1.6,f:760,up:0.6},d:'Zone large, projection forte'},
 {i:'ec15',n:'Rage du sanglier',ic:'🐗',l:36,cd:16,tg:['mob'],t:'buff',p:{k:'spd',m:1.35,dur:6},d:'+35% vitesse, 6 s'},
 {i:'ec16',n:'Décapitation',ic:'🗡',l:40,cd:12,tg:['melee'],t:'melee',p:{r:2.8,m:3.4,f:700},d:'×3,4 sur une cible'},
 {i:'ec17',n:'Onde fracturante',ic:'💥',l:45,cd:14,tg:['aoe'],t:'aoe',p:{r:7,m:1.8,f:860,up:0.8},d:'Grande onde tellurique'},
 {i:'ec18',n:'Avalanche de coups',ic:'🌪',l:50,cd:10,tg:['melee','aoe'],t:'melee',p:{r:3.6,m:1.5,f:420,arc:-1},d:'360°, plus fort'},
 {i:'ec19',n:'Colère tellurique',ic:'🌋',l:55,cd:16,tg:['aoe'],t:'aoe',p:{r:8,m:2.2,f:980,up:1},d:'La terre se soulève'},
 {i:'ec20',n:'Fin du monde',ic:'☄',l:60,cd:22,tg:['aoe'],t:'aoe',p:{r:9,m:3,f:1200,up:1.2},d:'Tout ce qui est proche cesse de l\'être'}],
briseroc:[
 {i:'br01',n:'Coup de masse',ic:'🔨',l:1,cd:3.5,tg:['melee'],t:'melee',p:{r:2.6,m:1.3,f:420},d:'Frappe lourde'},
 {i:'br02',n:'Garde de pierre',ic:'🛡',l:1,cd:14,tg:['ctrl'],t:'buff',p:{k:'armor',m:1.45,dur:6},d:'-30% dégâts subis, 6 s'},
 {i:'br03',n:'Marteau-pilon',ic:'⚒',l:3,cd:6,tg:['melee'],t:'melee',p:{r:2.8,m:2.2,f:500,up:1.2},d:'La cible décolle littéralement'},
 {i:'br04',n:'Heurt',ic:'🛡',l:5,cd:7,tg:['melee','ctrl'],t:'melee',p:{r:2.4,m:0.8,f:620,slow:2.5},d:'Repousse et ralentit'},
 {i:'br05',n:'Attraction',ic:'🧲',l:8,cd:10,tg:['ctrl'],t:'pull',p:{r:9,m:0.5,f:420},d:'Tire tous les ennemis vers vous'},
 {i:'br06',n:'Tremblement',ic:'🌋',l:12,cd:12,tg:['aoe','ctrl'],t:'aoe',p:{r:6,m:1.5,f:260,up:0.5},d:'Étourdit en zone'},
 {i:'br07',n:'Enclume',ic:'⚒',l:14,cd:8,tg:['melee'],t:'melee',p:{r:2.8,m:2,f:560},d:'Coup écrasant'},
 {i:'br08',n:'Poigne sismique',ic:'🧲',l:16,cd:12,tg:['ctrl'],t:'pull',p:{r:12,m:0.4,f:520},d:'Attraction lointaine'},
 {i:'br09',n:'Rempart',ic:'🏰',l:18,cd:18,tg:['ctrl'],t:'buff',p:{k:'armor',m:1.8,dur:8},d:'-45% dégâts subis, 8 s'},
 {i:'br10',n:'Onde de choc',ic:'💥',l:20,cd:9,tg:['cone','aoe'],t:'cone',p:{r:6,m:1.2,f:680},d:'Cône frontal massif'},
 {i:'br11',n:'Pierre vive',ic:'❤',l:22,cd:26,tg:['ctrl'],t:'heal',p:{pct:0.35},d:'Rend 35% des PV'},
 {i:'br12',n:'Chute de comète',ic:'☄',l:25,cd:12,tg:['aoe'],t:'aoe',p:{r:4,m:2,f:760,off:5,up:0.7},d:'Impact devant vous'},
 {i:'br13',n:'Broyage',ic:'🔨',l:28,cd:11,tg:['melee'],t:'melee',p:{r:2.8,m:2.8,f:640},d:'×2,8 dégâts'},
 {i:'br14',n:'Gravité',ic:'🌑',l:32,cd:14,tg:['ctrl'],t:'pull',p:{r:14,m:0.6,f:680},d:'Tout tombe vers vous'},
 {i:'br15',n:'Peau de granit',ic:'🗿',l:36,cd:20,tg:['ctrl'],t:'buff',p:{k:'armor',m:2,dur:10},d:'-50% dégâts subis, 10 s'},
 {i:'br16',n:'Marteau des abysses',ic:'⚒',l:40,cd:13,tg:['melee'],t:'melee',p:{r:3,m:3.4,f:820,up:1.1},d:'Envoi en orbite basse'},
 {i:'br17',n:'Effondrement',ic:'🌋',l:45,cd:15,tg:['aoe'],t:'aoe',p:{r:8,m:1.9,f:900,up:0.6},d:'Large zone d\'écrasement'},
 {i:'br18',n:'Singularité',ic:'🕳',l:50,cd:16,tg:['ctrl'],t:'pull',p:{r:16,m:0.8,f:900},d:'Attraction extrême — cœur des builds contrôle'},
 {i:'br19',n:'Grand œuvre',ic:'🌋',l:55,cd:18,tg:['aoe'],t:'aoe',p:{r:9,m:2.4,f:1000,up:1},d:'La montagne frappe'},
 {i:'br20',n:'Cœur de montagne',ic:'⛰',l:60,cd:30,tg:['ctrl'],t:'buff',p:{k:'dmg',m:1.5,dur:12},d:'+50% dégâts, 12 s'}],
arbaletriere:[
 {i:'ar01',n:'Tir précis',ic:'🎯',l:1,cd:2.5,tg:['proj'],t:'proj',p:{m:1.3,f:300,sp:32},d:'Carreau rapide'},
 {i:'ar02',n:'Dague',ic:'🗡',l:1,cd:4,tg:['melee'],t:'melee',p:{r:2,m:0.9,f:240},d:'Pour ce qui s\'approche trop'},
 {i:'ar03',n:'Carreau perforant',ic:'➶',l:3,cd:5,tg:['proj'],t:'proj',p:{m:1.7,f:480,sp:34,pierce:3},d:'Transperce 3 ennemis en ligne'},
 {i:'ar04',n:'Roulade',ic:'💨',l:5,cd:6,tg:['mob'],t:'dash',p:{dist:7,m:0,f:0},d:'Esquive rapide'},
 {i:'ar05',n:'Salve',ic:'🏹',l:8,cd:8,tg:['proj'],t:'proj',p:{m:0.9,f:340,sp:30,count:5,spread:0.17},d:'Éventail de 5 carreaux'},
 {i:'ar06',n:'Harpon',ic:'🪝',l:12,cd:10,tg:['proj','ctrl'],t:'proj',p:{m:2.2,f:200,sp:38,pull:1},d:'Empale et tire l\'ennemi jusqu\'à vous'},
 {i:'ar07',n:'Carreau explosif',ic:'💥',l:14,cd:9,tg:['proj','aoe'],t:'proj',p:{m:1.4,f:380,sp:28,explode:{r:3,m:1,f:520}},d:'Explose à l\'impact'},
 {i:'ar08',n:'Pluie de carreaux',ic:'🌧',l:16,cd:14,tg:['aoe'],t:'zone',p:{off:6,r:4,dur:6,m:0.5,f:220},d:'Zone criblée 6 s'},
 {i:'ar09',n:'Piège à mâchoires',ic:'🪤',l:18,cd:12,tg:['ctrl'],t:'zone',p:{r:2.8,dur:8,m:0.3,f:80,slow:2},d:'Zone qui entrave'},
 {i:'ar10',n:'Double détente',ic:'🏹',l:20,cd:7,tg:['proj'],t:'proj',p:{m:1.5,f:360,sp:34,count:2,spread:0.04},d:'Deux carreaux quasi-simultanés'},
 {i:'ar11',n:'Trousse',ic:'❤',l:22,cd:25,tg:['mob'],t:'heal',p:{pct:0.3},d:'Rend 30% des PV'},
 {i:'ar12',n:'Tir de barrage',ic:'🎆',l:25,cd:12,tg:['proj'],t:'proj',p:{m:1,f:380,sp:30,count:7,spread:0.16},d:'Sept carreaux en éventail'},
 {i:'ar13',n:'Carreau de siège',ic:'🏰',l:28,cd:12,tg:['proj'],t:'proj',p:{m:2.8,f:760,sp:36,pierce:5},d:'Perce cinq corps'},
 {i:'ar14',n:'Feu roulant',ic:'🔥',l:32,cd:18,tg:['proj'],t:'buff',p:{k:'dmg',m:1.3,dur:6},d:'+30% dégâts, 6 s'},
 {i:'ar15',n:'Grappin de recul',ic:'🪝',l:36,cd:8,tg:['mob'],t:'dash',p:{dist:7,m:0,f:0,back:1},d:'Bond en arrière'},
 {i:'ar16',n:'Perce-muraille',ic:'🏯',l:40,cd:14,tg:['proj'],t:'proj',p:{m:3.4,f:900,sp:40,pierce:9},d:'Rien ne l\'arrête'},
 {i:'ar17',n:'Déluge',ic:'🌧',l:45,cd:16,tg:['aoe'],t:'zone',p:{off:7,r:5.5,dur:7,m:0.6,f:300},d:'Grande zone criblée'},
 {i:'ar18',n:'Harpon double',ic:'🪝',l:50,cd:12,tg:['proj','ctrl'],t:'proj',p:{m:2,f:220,sp:38,count:2,spread:0.12,pull:1},d:'Deux prises'},
 {i:'ar19',n:'Tir du jugement',ic:'⚡',l:55,cd:16,tg:['proj'],t:'proj',p:{m:4.5,f:1100,sp:45},d:'Un seul carreau. Un verdict.'},
 {i:'ar20',n:'Mille éclats',ic:'✨',l:60,cd:18,tg:['proj','aoe'],t:'proj',p:{m:1.1,f:420,sp:30,count:12,spread:0.15},d:'Douze carreaux'}],
flagellant:[
 {i:'fl01',n:'Coup de lanière',ic:'〰',l:1,cd:3,tg:['melee'],t:'melee',p:{r:3.2,m:1.1,f:260},d:'Portée de fouet'},
 {i:'fl02',n:'Entaille',ic:'🩸',l:1,cd:4,tg:['melee','dot'],t:'melee',p:{r:3,m:0.9,f:200,dot:1},d:'Saigne la cible'},
 {i:'fl03',n:'Lacération',ic:'🌀',l:3,cd:6,tg:['melee','aoe'],t:'melee',p:{r:3.4,m:1.3,f:320,arc:-1},d:'Tourbillon de chaînes à 360°'},
 {i:'fl04',n:'Croc-en-chaîne',ic:'⛓',l:5,cd:6,tg:['ctrl'],t:'melee',p:{r:3.2,m:1,f:200,slow:3},d:'Entrave lourdement'},
 {i:'fl05',n:'Étreinte',ic:'🤝',l:8,cd:10,tg:['ctrl'],t:'grab',p:{v:26},d:'Saisit, fait tournoyer, et JETTE le corps'},
 {i:'fl06',n:'Nerf tranché',ic:'🦵',l:12,cd:9,tg:['cone','ctrl'],t:'cone',p:{r:5,m:1.2,f:180,slow:3.2},d:'Cône qui ralentit'},
 {i:'fl07',n:'Flagellation',ic:'⛓',l:14,cd:8,tg:['melee','dot'],t:'melee',p:{r:3.2,m:1.8,f:300,dot:1},d:'Coups répétés qui saignent'},
 {i:'fl08',n:'Chaînes rampantes',ic:'🐍',l:16,cd:11,tg:['ctrl'],t:'pull',p:{r:8,m:0.4,f:380},d:'Ramène les fuyards'},
 {i:'fl09',n:'Danse des lanières',ic:'💃',l:18,cd:9,tg:['melee','aoe'],t:'melee',p:{r:4,m:1.2,f:360,arc:-1},d:'360° large'},
 {i:'fl10',n:'Garrot',ic:'🪢',l:20,cd:9,tg:['ctrl','dot'],t:'melee',p:{r:3,m:1.4,f:120,slow:4,dot:1},d:'Étrangle : saigne et entrave'},
 {i:'fl11',n:'Sang neuf',ic:'❤',l:22,cd:24,tg:['dot'],t:'heal',p:{pct:0.32},d:'Rend 32% des PV'},
 {i:'fl12',n:'Étreinte broyeuse',ic:'🤜',l:25,cd:9,tg:['ctrl'],t:'grab',p:{v:32},d:'Jet plus violent'},
 {i:'fl13',n:'Cent coups',ic:'🌪',l:28,cd:10,tg:['melee','aoe'],t:'melee',p:{r:3.6,m:1.6,f:300,arc:-1},d:'Une pluie de lanières'},
 {i:'fl14',n:'Fouet de fer',ic:'⚙',l:32,cd:10,tg:['cone'],t:'cone',p:{r:6.5,m:1.5,f:420},d:'Long cône métallique'},
 {i:'fl15',n:'Frénésie',ic:'😤',l:36,cd:16,tg:['mob'],t:'buff',p:{k:'dmg',m:1.3,dur:6},d:'+30% dégâts, 6 s'},
 {i:'fl16',n:'Écorchement',ic:'🔪',l:40,cd:12,tg:['melee','dot'],t:'melee',p:{r:3.4,m:2.8,f:420,dot:1},d:'×2,8 et saignement'},
 {i:'fl17',n:'Toile de chaînes',ic:'🕸',l:45,cd:15,tg:['ctrl'],t:'zone',p:{r:5,dur:6,m:0.4,f:200,slow:2},d:'Zone d\'entraves'},
 {i:'fl18',n:'Grande Étreinte',ic:'🌀',l:50,cd:8,tg:['ctrl'],t:'grab',p:{v:40},d:'Le corps devient un boulet de canon'},
 {i:'fl19',n:'Lacération pourpre',ic:'🩸',l:55,cd:14,tg:['melee','aoe','dot'],t:'melee',p:{r:5,m:2.2,f:520,arc:-1,dot:1},d:'360° sanglant'},
 {i:'fl20',n:'Maître des pantins',ic:'🎭',l:60,cd:18,tg:['ctrl'],t:'pull',p:{r:14,m:0.6,f:700,slow:2.5},d:'Tous les fils se tendent'}],
cendremage:[
 {i:'ce01',n:'Trait de cendre',ic:'☄',l:1,cd:2.5,tg:['proj'],t:'proj',p:{m:1.2,f:300,sp:26},d:'Projectile brûlant'},
 {i:'ce02',n:'Souffle chaud',ic:'🌬',l:1,cd:5,tg:['cone'],t:'cone',p:{r:4,m:0.7,f:320},d:'Repousse à courte portée'},
 {i:'ce03',n:'Braise',ic:'✨',l:3,cd:4,tg:['proj','aoe'],t:'proj',p:{m:1,f:260,sp:24,explode:{r:2,m:0.7,f:360}},d:'Petite explosion'},
 {i:'ce04',n:'Voile de cendre',ic:'🌫',l:5,cd:16,tg:['ctrl'],t:'buff',p:{k:'armor',m:1.4,dur:6},d:'-29% dégâts subis, 6 s'},
 {i:'ce05',n:'Déflagration',ic:'💥',l:8,cd:8,tg:['aoe'],t:'aoe',p:{r:3.6,m:1.6,f:620,off:5.5,up:0.6},d:'Explosion devant vous : les corps volent'},
 {i:'ce06',n:'Rafale hurlante',ic:'🌬',l:12,cd:9,tg:['cone','ctrl'],t:'cone',p:{r:7.5,m:0.4,f:800},d:'Souffle massif, projection énorme'},
 {i:'ce07',n:'Comète de suie',ic:'☄',l:14,cd:8,tg:['proj','aoe'],t:'proj',p:{m:1.8,f:520,sp:20,explode:{r:2.5,m:1,f:480}},d:'Lente mais lourde'},
 {i:'ce08',n:'Cercle de braises',ic:'⭕',l:16,cd:13,tg:['aoe'],t:'zone',p:{r:4,dur:6,m:0.5,f:180},d:'Le sol brûle autour de vous'},
 {i:'ce09',n:'Mur de vent',ic:'🌪',l:18,cd:11,tg:['cone','ctrl'],t:'cone',p:{r:6,m:0.1,f:900},d:'Pur contrôle : tout recule'},
 {i:'ce10',n:'Double trait',ic:'☄',l:20,cd:6,tg:['proj'],t:'proj',p:{m:1.2,f:320,sp:26,count:2,spread:0.06},d:'Deux traits'},
 {i:'ce11',n:'Cendres vives',ic:'❤',l:22,cd:25,tg:['aoe'],t:'heal',p:{pct:0.3},d:'Rend 30% des PV'},
 {i:'ce12',n:'Pluie de braises',ic:'🌧',l:25,cd:14,tg:['aoe'],t:'zone',p:{off:6,r:5,dur:6,m:0.6,f:240},d:'Zone en feu à distance'},
 {i:'ce13',n:'Lance ardente',ic:'🔱',l:28,cd:10,tg:['proj'],t:'proj',p:{m:2.6,f:700,sp:32,pierce:2},d:'Perce trois corps'},
 {i:'ce14',n:'Implosion',ic:'🌑',l:32,cd:12,tg:['ctrl'],t:'pull',p:{r:8,m:0.6,f:600},d:'L\'air aspire vers vous'},
 {i:'ce15',n:'Manteau d\'étincelles',ic:'✨',l:36,cd:18,tg:['proj'],t:'buff',p:{k:'dmg',m:1.3,dur:7},d:'+30% dégâts, 7 s'},
 {i:'ce16',n:'Nova de cendre',ic:'💥',l:40,cd:13,tg:['aoe'],t:'aoe',p:{r:7,m:1.8,f:860,up:0.7},d:'Explosion centrée sur vous'},
 {i:'ce17',n:'Tempête de scories',ic:'🌋',l:45,cd:16,tg:['aoe'],t:'zone',p:{off:7,r:6,dur:8,m:0.7,f:280},d:'Longue tempête au sol'},
 {i:'ce18',n:'Rayon de fournaise',ic:'🔦',l:50,cd:13,tg:['proj'],t:'proj',p:{m:3.2,f:500,sp:50,pierce:9},d:'Une ligne de feu instantanée'},
 {i:'ce19',n:'Éruption',ic:'🌋',l:55,cd:16,tg:['aoe'],t:'aoe',p:{r:5,m:2.6,f:1000,off:6,up:1},d:'Le sol explose là-bas'},
 {i:'ce20',n:'Fin des cendres',ic:'☀',l:60,cd:22,tg:['aoe'],t:'aoe',p:{r:10,m:3,f:1200,up:0.8},d:'Tout brûle. Tout vole.'}],
ossuaire:[
 {i:'os01',n:'Éclat d\'os',ic:'🦴',l:1,cd:2.5,tg:['proj'],t:'proj',p:{m:1.2,f:320,sp:30},d:'Esquille à haute vélocité'},
 {i:'os02',n:'Griffe spectrale',ic:'👻',l:1,cd:4,tg:['melee'],t:'melee',p:{r:2.4,m:1,f:240},d:'Pour le corps-à-corps'},
 {i:'os03',n:'Épine fémorale',ic:'🦴',l:3,cd:5,tg:['proj'],t:'proj',p:{m:1.5,f:420,sp:32},d:'Plus lourd, plus loin'},
 {i:'os04',n:'Pacte mineur',ic:'🧟',l:5,cd:12,tg:['invoc'],t:'raise',p:{},d:'Relève un cadavre en serviteur'},
 {i:'os05',n:'Détonation charnelle',ic:'☠',l:8,cd:9,tg:['aoe'],t:'detonate',p:{r:4.2,m:1.8,f:700},d:'Fait exploser un cadavre proche'},
 {i:'os06',n:'Volée d\'esquilles',ic:'✨',l:12,cd:8,tg:['proj'],t:'proj',p:{m:0.9,f:300,sp:28,count:4,spread:0.14},d:'Quatre éclats'},
 {i:'os07',n:'Peau d\'ivoire',ic:'🛡',l:14,cd:16,tg:['invoc'],t:'buff',p:{k:'armor',m:1.5,dur:7},d:'-33% dégâts subis, 7 s'},
 {i:'os08',n:'Faux d\'os',ic:'🌙',l:16,cd:8,tg:['melee','aoe'],t:'melee',p:{r:3.4,m:1.3,f:340,arc:-1},d:'Moisson circulaire'},
 {i:'os09',n:'Traction sépulcrale',ic:'🧲',l:18,cd:11,tg:['ctrl'],t:'pull',p:{r:9,m:0.4,f:460},d:'La tombe appelle'},
 {i:'os10',n:'Lance de moelle',ic:'🔱',l:20,cd:9,tg:['proj'],t:'proj',p:{m:2.2,f:560,sp:32,pierce:2},d:'Transperce'},
 {i:'os11',n:'Siphon vital',ic:'💉',l:22,cd:14,tg:['cone','dot'],t:'cone',p:{r:5,m:1,f:120,heal:0.12},d:'Cône qui rend 12% de vos PV'},
 {i:'os12',n:'Pacte majeur',ic:'🧟',l:25,cd:12,tg:['invoc'],t:'raise',p:{strong:1},d:'Serviteur renforcé'},
 {i:'os13',n:'Ossements brisés',ic:'💥',l:28,cd:11,tg:['aoe'],t:'aoe',p:{r:5,m:1.5,f:620,up:0.5},d:'Nova d\'esquilles'},
 {i:'os14',n:'Marée d\'esquilles',ic:'🌊',l:32,cd:12,tg:['proj'],t:'proj',p:{m:1,f:340,sp:28,count:7,spread:0.15},d:'Sept éclats'},
 {i:'os15',n:'Couronne du charnier',ic:'👑',l:36,cd:18,tg:['invoc'],t:'buff',p:{k:'dmg',m:1.3,dur:8},d:'+30% dégâts, 8 s'},
 {i:'os16',n:'Grande détonation',ic:'☢',l:40,cd:12,tg:['aoe'],t:'detonate',p:{r:6,m:2.6,f:950},d:'Le cadavre devient une bombe'},
 {i:'os17',n:'Champ d\'os',ic:'⭕',l:45,cd:15,tg:['aoe'],t:'zone',p:{r:5.5,dur:7,m:0.6,f:220},d:'Le sol se hérisse'},
 {i:'os18',n:'Légion',ic:'🧟',l:50,cd:16,tg:['invoc'],t:'raise',p:{count:2},d:'Relève deux cadavres d\'un coup'},
 {i:'os19',n:'Perce-âme',ic:'👁',l:55,cd:14,tg:['proj'],t:'proj',p:{m:3.6,f:900,sp:40,pierce:6},d:'Traverse les rangs entiers'},
 {i:'os20',n:'Danse macabre',ic:'💀',l:60,cd:20,tg:['aoe'],t:'detonate',p:{r:5,m:2.2,f:800,all:1},d:'TOUS les cadavres proches détonent'}]};
function spellById(id){
  for(const c in SPELLS){const s=SPELLS[c].find(x=>x.i===id);if(s)return s;}
  for(const k in SUBSPELLS){const s=SUBSPELLS[k].find(x=>x.i===id);if(s)return s;}
  return null;}
/* ---------- exécuteur de sorts ---------- */
function faceDir(){return V3(Math.sin(player.facing),0,Math.cos(player.facing));}
function viseTarget(){
  if(player.targetEnemy&&enemies.includes(player.targetEnemy)){
    const e=player.targetEnemy;
    player.facing=Math.atan2(e.pos.x-player.pos.x,e.pos.z-player.pos.z);}
}
function dmgFor(sp){return Math.round(baseDmg()*sp.p.m*tagMult(sp.tg));}
function meleeArcX(sp){
  const p=sp.p,fwd=faceDir();let touche=false;
  const arc=p.arc===undefined?0.35:p.arc;
  fxSector(player.pos,player.facing,p.r,arc===-1?Math.PI:1.1,CFX().arc);
  [...enemies].forEach(e=>{
    const d=dist2D(e.pos,player.pos);if(d>p.r)return;
    const to=V3(e.pos.x-player.pos.x,0,e.pos.z-player.pos.z).normalize();
    if(arc>-1&&fwd.dot(to)<arc)return;
    hurtEnemy(e,dmgFor(sp),to,p.f,{up:p.up,slow:p.slow,dot:p.dot});touche=true;});
  return touche;
}
function aoeAt(sp){
  const p=sp.p;
  const c=p.off?player.pos.clone().add(faceDir().multiplyScalar(p.off)):player.pos.clone();
  fxBurst(c.x,c.z,p.r,CFX().burst);
  spawnPart(c.x,0.4,c.z,24,{col:CFX().burst,spd:2.4,up:7.5,grav:8.5,life:0.7});
  onde(c.x,c.z,CFX().burst,1+((p.r||4)/6));sfx('slam');shake=Math.max(shake,0.5+p.f/1500);
  let t=false;
  [...enemies].forEach(e=>{const d=dist2D(e.pos,c);
    if(d<p.r){const dd=V3(e.pos.x-c.x,0,e.pos.z-c.z).normalize();
      hurtEnemy(e,dmgFor(sp),dd,p.f*(1-d/(p.r*2)),{up:p.up});t=true;}});
  hitstop=Math.max(hitstop,t?0.1:0.02);
}
function coneX(sp){
  const p=sp.p,fwd=faceDir();
  fxSector(player.pos,player.facing,p.r,1.25,CFX().cone);
  spawnPart(player.pos.x+fwd.x*1.6,1.2,player.pos.z+fwd.z*1.6,16,
    {col:CFX().cone,spd:1.6,dx:fwd.x*9,dz:fwd.z*9,grav:2,drag:0.92,life:0.42});
  [...enemies].forEach(e=>{const d=dist2D(e.pos,player.pos);if(d>p.r)return;
    const to=V3(e.pos.x-player.pos.x,0,e.pos.z-player.pos.z).normalize();
    if(fwd.dot(to)<0.3)return;
    hurtEnemy(e,dmgFor(sp),to,p.f,{slow:p.slow,dot:p.dot});
    if(p.heal)player.hp=Math.min(maxHp(),player.hp+maxHp()*p.heal*0.34);});
  if(p.f>500)sfx('slam');
}
function pullX(sp){
  const p=sp.p;
  fxImplode(player.pos.x,player.pos.z,p.r,CFX().pull);sfx('slam');
  for(let k=0;k<14;k++){const a2=rand(0,6.28),rr=p.r*rand(0.55,1);
    spawnPart(player.pos.x+Math.cos(a2)*rr,rand(0.3,1.6),player.pos.z+Math.sin(a2)*rr,1,
      {col:CFX().pull,spd:0,dx:-Math.cos(a2)*9,dz:-Math.sin(a2)*9,up:0.4,grav:0,drag:0.93,life:0.4});}
  [...enemies].forEach(e=>{const d=dist2D(e.pos,player.pos);
    if(d<p.r&&d>1.2){const dd=V3(player.pos.x-e.pos.x,0,player.pos.z-e.pos.z).normalize();
      hurtEnemy(e,dmgFor(sp),dd,p.f,{up:0.12,slow:p.slow});}});
}
function projX(sp){
  const p=sp.p,n=p.count||1;
  fxFlash(player.pos,player.facing,CL().projCol||0xd8c26a);
  for(let i=0;i<n;i++){
    const off=n>1?(i-(n-1)/2)*(p.spread||0.15):0;
    const a=player.facing+off;
    tirer({from:player.pos,dir:V3(Math.sin(a),0,Math.cos(a)),dmg:dmgFor(sp),
      force:p.f,ally:true,col:CL().projCol||0xd8c26a,speed:p.sp||28,
      pierce:p.pierce||0,pull:!!p.pull,tags:sp.tg,
      explode:p.explode?{r:p.explode.r,dmg:Math.round(baseDmg()*p.explode.m*tagMult(['aoe'])),f:p.explode.f}:null});}
}
function doZone(sp){
  const p=sp.p;
  const c=p.off?player.pos.clone().add(faceDir().multiplyScalar(p.off)):player.pos.clone();
  fxBurst(c.x,c.z,p.r,CFX().burst);
  const m=new THREE.Mesh(new THREE.RingGeometry(p.r*0.85,p.r,30),
    new THREE.MeshBasicMaterial({color:CFX().burst,transparent:true,opacity:0.4,side:THREE.DoubleSide}));
  m.rotation.x=-Math.PI/2;m.position.set(c.x,terrainH(c.x,c.z)+0.05,c.z);scene.add(m);
  zonesFx.push({x:c.x,z:c.z,r:p.r,t:p.dur,tick:0,dmg:dmgFor(sp),f:p.f,slow:p.slow,mesh:m});
}
function doGrab(sp){
  let best=null,bd=3.8;
  enemies.forEach(e=>{if(e.def.boss||(e.sid&&!e.owned))return;const d=dist2D(e.pos,player.pos);if(d<bd){bd=d;best=e;}});
  if(!best){toast('Personne à saisir','Approchez-vous d\'un ennemi (non-boss)');return false;}
  viseTarget();best.state='grabbed';best.vel.set(0,0,0);
  player.grab={e:best,t:0,v:sp.p.v*statImpact()};return true;
}
function doRaise(sp){
  const maxM=maxMinions(),n=sp.p.count||1;let done=0;
  for(let k=0;k<n;k++){
    if(allies.length>=maxM)break;
    let best=null,bd=9;
    corpses.forEach(c=>{const d=dist2D(c.pos,player.pos);if(d<bd){bd=d;best=c;}});
    if(!best)break;
    releverServiteur(best,sp.p.strong);done++;}
  if(!done){toast(allies.length>=maxM?'Serviteurs au maximum':'Aucun cadavre proche','Faites-en. Vous savez faire.');return false;}
  return true;
}
function doDetonate(sp){
  const p=sp.p;
  const cible=corpses.filter(c=>dist2D(c.pos,player.pos)<(p.all?12:10));
  if(!cible.length){toast('Aucun cadavre proche','La détonation exige de la matière.');return false;}
  (p.all?cible:[cible.sort((a,b)=>dist2D(a.pos,player.pos)-dist2D(b.pos,player.pos))[0]]).forEach(c=>{
    const idx=corpses.indexOf(c);if(idx>=0){scene.remove(c.mesh);corpses.splice(idx,1);}
    fxBurst(c.pos.x,c.pos.z,p.r,0xc84a2c);
    onde(c.pos.x,c.pos.z,0xc84a2c,1.1);sang(c.pos.x,c.pos.z,2);
    [...enemies].forEach(e=>{const d=dist2D(e.pos,c.pos);
      if(d<p.r){const dd=V3(e.pos.x-c.pos.x,0,e.pos.z-c.pos.z).normalize();
        hurtEnemy(e,dmgFor(sp),dd,p.f,{up:0.5});}});});
  sfx('slam');shake=Math.max(shake,0.8);hitstop=Math.max(hitstop,0.1);
  return true;
}
const ANIM_BY_TYPE={melee:'slash',aoe:'smash',cone:'sweep',proj:'shoot',zone:'cast',
  pull:'summon',raise:'summon',detonate:'summon',buff:'summon',heal:'summon'};
function castSpell(slot){
  if(player.dead||player.grab)return;
  const id=G.slots[slot];if(!id)return;
  const sp=spellById(id);if(!sp)return;
  if((G.cds[id]||0)>0)return;
  if(G.activeMount>0)demonter();
  let ok=true;
  viseTarget();
  castLight.color.setHex(CFX().light);castLight.intensity=1.9;
  castLight.position.set(player.pos.x,1.6,player.pos.z);
  sfxCast(sp);
  const anim=sp.t==='melee'&&sp.p.arc===-1?'spin':
    sp.t==='aoe'&&sp.p.off?'cast':(ANIM_BY_TYPE[sp.t]||'slash');
  switch(sp.t){
    case 'melee':player.attack={t:0,dur:0.42,hitAt:0.2,done:false,anim,fn:()=>meleeArcX(sp)};break;
    case 'aoe':player.attack={t:0,dur:0.55,hitAt:0.3,done:false,anim,fn:()=>aoeAt(sp)};
      if(!sp.p.off)player.vel.y=2.8;break;
    case 'cone':player.attack={t:0,dur:0.45,hitAt:0.22,done:false,anim,fn:()=>coneX(sp)};break;
    case 'proj':player.attack={t:0,dur:0.4,hitAt:0.16,done:false,anim,fn:()=>projX(sp)};break;
    case 'pull':player.attack={t:0,dur:0.5,hitAt:0.24,done:false,anim,fn:()=>pullX(sp)};break;
    case 'dash':{const dir=faceDir();if(sp.p.back)dir.multiplyScalar(-1);
      player.dash={t:0,dur:sp.p.dist/32,dir,m:sp.p.m,f:sp.p.f,tg:sp.tg,hit:new Set()};break;}
    case 'grab':ok=doGrab(sp);break;
    case 'raise':ok=doRaise(sp);
      if(ok)player.attack={t:0,dur:0.6,hitAt:99,done:true,anim:'summon',fn:()=>{}};break;
    case 'detonate':ok=doDetonate(sp);
      if(ok)player.attack={t:0,dur:0.5,hitAt:99,done:true,anim:'summon',fn:()=>{}};break;
    case 'buff':addBuff(sp.p.k,sp.p.m,sp.p.dur);
      player.attack={t:0,dur:0.5,hitAt:99,done:true,anim:'summon',fn:()=>{}};
      fxImplode(player.pos.x,player.pos.z,2.6,sp.p.k==='armor'?0x6a7a8a:0xc8a84a);
      onde(player.pos.x,player.pos.z,sp.p.k==='armor'?0x6a7a8a:0xc8a84a,0.8);break;
    case 'heal':{const soin=Math.round(maxHp()*sp.p.pct*(1+0.1*talRank('e3')));
      player.hp=Math.min(maxHp(),player.hp+soin);dmgNum(player.pos,'+'+soin,'soin');
      player.attack={t:0,dur:0.5,hitAt:99,done:true,anim:'summon',fn:()=>{}};
      fxImplode(player.pos.x,player.pos.z,2.2,0x9db07f);break;}
    case 'zone':player.attack={t:0,dur:0.5,hitAt:0.24,done:false,anim,fn:()=>doZone(sp)};break;
  }
  if(ok){
    if(EQ.legs.echo&&Math.random()<0.15){toast('Écho','Le sort ne consomme pas sa recharge');}
    else G.cds[id]=sp.cd*cdrMult();
    if(MP.on)mpSend({t:'fx',k:'cast',i:sp.i,f:+player.facing.toFixed(3)});
  }
  majHud();
}
/* ---------- écho visuel des sorts des autres joueurs ----------
   Reçu via le relais « fx » du serveur : on rejoue les visuels du sort
   (palette de la classe du lanceur), jamais ses dégâts. */
function fxRemoteCast(sp,pos,facing,cfx,classe){
  const p=sp.p||{};
  const fwd=()=>V3(Math.sin(facing),0,Math.cos(facing));
  switch(sp.t){
    case 'melee':fxSector(pos,facing,p.r||2.5,p.arc===-1?Math.PI:1.1,cfx.arc);break;
    case 'cone':{const f=fwd();
      fxSector(pos,facing,p.r||4,1.25,cfx.cone);
      spawnPart(pos.x+f.x*1.6,1.2,pos.z+f.z*1.6,12,
        {col:cfx.cone,spd:1.6,dx:f.x*9,dz:f.z*9,grav:2,drag:0.92,life:0.42});break;}
    case 'aoe':{const c=p.off?pos.clone().add(fwd().multiplyScalar(p.off)):pos;
      fxBurst(c.x,c.z,p.r||4,cfx.burst);
      spawnPart(c.x,0.4,c.z,20,{col:cfx.burst,spd:2.4,up:7,grav:8.5,life:0.7});
      onde(c.x,c.z,cfx.burst,1+((p.r||4)/6));sfx('slam',0.5);break;}
    case 'proj':{const n=p.count||1,cl=CLASSES[classe]||{};
      fxFlash(pos,facing,cl.projCol||0xd8c26a);
      for(let i=0;i<n;i++){
        const a=facing+(n>1?(i-(n-1)/2)*(p.spread||0.15):0);
        tirer({from:pos,dir:V3(Math.sin(a),0,Math.cos(a)),dmg:0,force:0,ally:true,ghost:true,
          col:cl.projCol||0xd8c26a,speed:p.sp||28});}break;}
    case 'zone':{const c=p.off?pos.clone().add(fwd().multiplyScalar(p.off)):pos.clone();
      fxBurst(c.x,c.z,p.r||4,cfx.burst);
      const mz=new THREE.Mesh(new THREE.RingGeometry((p.r||4)*0.85,p.r||4,30),
        new THREE.MeshBasicMaterial({color:cfx.burst,transparent:true,opacity:0.4,side:THREE.DoubleSide}));
      mz.rotation.x=-Math.PI/2;mz.position.set(c.x,terrainH(c.x,c.z)+0.05,c.z);scene.add(mz);
      zonesFx.push({x:c.x,z:c.z,r:p.r||4,t:p.dur||5,tick:0,dmg:0,f:0,ghost:true,mesh:mz});break;}
    case 'pull':fxImplode(pos.x,pos.z,p.r||8,cfx.pull);sfx('slam',0.4);break;
    case 'buff':fxImplode(pos.x,pos.z,2.6,p.k==='armor'?0x6a7a8a:0xc8a84a);
      onde(pos.x,pos.z,p.k==='armor'?0x6a7a8a:0xc8a84a,0.8);break;
    case 'heal':fxImplode(pos.x,pos.z,2.2,0x9db07f);break;
    case 'raise':onde(pos.x,pos.z,0x8a9a6a);
      spawnPart(pos.x,0.6,pos.z,10,{col:0x8a9a6a,spd:1.4,up:2,grav:-1,life:0.7});break;
    case 'detonate':fxBurst(pos.x,pos.z,p.r||4,0xc84a2c);
      onde(pos.x,pos.z,0xc84a2c,1.1);sfx('slam',0.5);break;
  }
}
function attaqueBase(){
  if(player.attack||player.dash||player.grab)return;
  viseTarget();
  sfxCast({t:'basic'});
  if(CL().ranged){
    player.attack={t:0,dur:0.5,hitAt:0.2,done:false,anim:'shoot',fn:()=>{
      tirer({from:player.pos,dir:faceDir(),dmg:Math.round(baseDmg()*tagMult(['proj'])),
        force:240,ally:true,col:CL().projCol,speed:28,tags:['proj']});
      if(MP.on)mpSend({t:'fx',k:'shot',f:+player.facing.toFixed(3)});}};
  }else{
    player.attack={t:0,dur:0.36,hitAt:0.17,done:false,anim:'slash',fn:()=>{
      const fwd=faceDir();
      [...enemies].forEach(e=>{const d=dist2D(e.pos,player.pos);if(d>CL().range)return;
        const to=V3(e.pos.x-player.pos.x,0,e.pos.z-player.pos.z).normalize();
        if(fwd.dot(to)<0.35)return;
        hurtEnemy(e,Math.round(baseDmg()*tagMult(['melee'])),to,240);});}};
  }
}
/* ---------- templates ---------- */
const TEMPLATES={
 boucher:['ec03','ec07','ec16','ec04'],tectonique:['ec05','ec14','ec17','ec19'],sanglier:['ec06','ec12','ec15','ec03'],
 bastion:['br01','br02','br09','br06'],gravite:['br05','br08','br14','br18'],marteau:['br03','br07','br13','br16'],
 franctireur:['ar01','ar03','ar13','ar16'],artificiere:['ar07','ar08','ar12','ar17'],traqueuse:['ar04','ar05','ar10','ar15'],
 bourreau:['fl02','fl07','fl10','fl16'],marionnettiste:['fl05','fl08','fl06','fl20'],ecarlate:['fl03','fl09','fl13','fl19'],
 pyrolatre:['ce01','ce03','ce13','ce18'],tempetueux:['ce02','ce06','ce09','ce14'],cataclyste:['ce05','ce08','ce16','ce19'],
 necrophore:['os04','os12','os18','os15'],detonateur:['os05','os13','os16','os20'],perceur:['os01','os03','os10','os19']};
function applyTemplate(specId){
  const ids=(TEMPLATES[specId]||[]).filter(id=>{const s=spellById(id);return s&&s.l<=G.lvl;});
  const base=SPELLS[G.classe].filter(s=>s.l<=G.lvl).map(s=>s.i);
  const six=[...ids];
  base.forEach(id=>{if(six.length<6&&!six.includes(id))six.push(id);});
  G.slots=[];
  for(let i=0;i<6;i++)G.slots.push(six[i]||null);
  majSkillBar();toast('Modèle appliqué','Barre de sorts mise à jour');save();
}
function defaultSlots(){
  const dispo=SPELLS[G.classe].filter(s=>s.l<=G.lvl);
  G.slots=[];
  for(let i=0;i<6;i++)G.slots.push(dispo[i]?dispo[i].i:null);
}
function equipSpell(id,slot){
  const s=spellById(id);if(!s||s.l>G.lvl)return;
  if(s.sc&&s.sc!==G.subclass)return;
  const prev=G.slots.indexOf(id);if(prev>=0)G.slots[prev]=G.slots[slot];
  G.slots[slot]=id;majSkillBar();save();
  ouvrirGrimoire();
}
/* ---------- butin (tables graduelles) ---------- */
function dropLoot(e){
  if(G.lvl>=10&&Math.random()<0.003){spawnLoot(genRelique(Math.max(e.lvl,G.lvl)),e.pos.x,e.pos.z);return;}
  const chance=e.def.boss?1:0.16;
  if(Math.random()>chance)return;
  spawnLoot(genItem(e.lvl,e.def.boss),e.pos.x,e.pos.z);
}
function rafraichirPanneau(){
  if(panOuvert==='inv')ouvrirInventaire();
  else if(panOuvert==='perso')ouvrirPerso();
}
function equipItem(id){
  const idx=G.inv.findIndex(x=>x.id===id);if(idx<0)return;
  const it=G.inv[idx];
  const old=G.equip[it.slot];
  G.equip[it.slot]=it;G.inv.splice(idx,1);
  if(old)G.inv.push(old);
  recomputeEQ();majApparence();player.hp=Math.min(player.hp,maxHp());
  majHud();rafraichirPanneau();save();
}
function desequiper(slot){
  const it=G.equip[slot];if(!it)return;
  if(G.inv.length>=40){toast('Sac plein','Videz une place avant de retirer cette pièce');return;}
  G.equip[slot]=null;G.inv.push(it);
  recomputeEQ();majApparence();player.hp=Math.min(player.hp,maxHp());
  majHud();rafraichirPanneau();save();
}
function vendreItem(id){
  const idx=G.inv.findIndex(x=>x.id===id);if(idx<0)return;
  G.gold+=itemVal(G.inv[idx]);G.inv.splice(idx,1);
  sfx('or');majHud();rafraichirPanneau();save();
}

/* ---------- montures ---------- */
function monter(tier){
  if(player.dead)return;
  G.activeMount=tier;G.flying=false;G.altitude=0;
  toast(MOUNT_DEF[tier].nom,tier===3?"▲ / Espace pour prendre l'air":'En selle.');
  majHud();
}
function demonter(){
  G.activeMount=0;G.flying=false;G.altitude=0;player.pos.y=terrainH(player.pos.x,player.pos.z);
  montureMeshes.forEach(m=>{if(m)m.visible=false;});
  el('vol-ctl').style.display='none';majHud();
}
function toggleMonture(){
  if(G.activeMount>0){demonter();return;}
  const best=G.mounts.t3?3:G.mounts.t2?2:G.mounts.t1?1:0;
  if(best===0){toast('Aucune monture','Voyez Berthe à Valcierge (niv. 30+)');return;}
  monter(best);
}
function toggleVue(){
  G.camMode=G.camMode==='arpg'?'tps':'arpg';
  toast(G.camMode==='tps'?'Vue épaule':'Vue tactique',
    G.camMode==='tps'?'ZQSD/WASD pour marcher, glisser pour tourner':'ZQSD pour marcher · clic gauche pour frapper');
}
