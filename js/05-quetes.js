'use strict';
/* ---------- quêtes ---------- */
const QUESTS=[
/* ————— LANDE DE CENDREFIEL ————— */
 {id:'m1',giver:'maud',zone:'lande',nom:'Ce qui marche encore',type:'kill',cible:'creux',nb:10,
  txt:"« Ils reviennent parce que quelqu'un, quelque part, prononce encore leur nom. Abats-en dix. Et ne demande pas si c'est un meurtre ou une délivrance — la lande ne fait pas la différence, elle. »",
  fin:"« Dix noms de moins dans la bouche des vivants. Tu verras : on s'habitue. C'est ça, le pire. »",rew:{xp:30,or:20}},
 {id:'m2',giver:'maud',zone:'lande',nom:'Reliques mâchées',type:'collect',cible:'fragment',nb:8,apres:'m1',
  txt:"« Dans leurs poitrines, des os qui ne leur appartiennent pas. Ils dévorent pour se souvenir d'avoir eu faim. Rapporte huit fragments — je les rends aux familles. Les familles paient. Juge-moi si tu veux. »",
  fin:"« Une veuve m'a demandé si l'os avait souffert. J'ai dit non. J'ai menti. On ment beaucoup, ici. »",rew:{xp:42,or:25,potions:1}},
 {id:'m3',giver:'maud',zone:'lande',nom:'Ceux qui courent',type:'kill',cible:'traqueur',nb:8,apres:'m2',
  txt:"« Les Traqueurs courent plus vite que les vivants. On dit qu'ils fuient quelque chose, pas qu'ils chassent. Ça ne change rien pour les enfants qu'ils rattrapent. Huit. »",
  fin:"« Tu as vu leurs yeux ? Moi non plus. C'est peut-être pour ça qu'on arrive encore à dormir. »",rew:{xp:52,or:32}},
 {id:'m4',giver:'maud',zone:'lande',nom:'La dîme des brumes',type:'kill',cible:'any',nb:15,apres:'m3',
  txt:"« Il n'y a pas de héros ici, seulement de l'entretien. La brume dépose ses créatures comme la marée dépose ses noyés. Fauche. Quinze. C'est un travail, pas une gloire. »",
  fin:"« Bien. Demain il y en aura autant. C'est ça, tenir un village : perdre lentement. »",rew:{xp:58,or:35}},
 {id:'m5',giver:'maud',zone:'lande',nom:'Le Berger sans visage',type:'kill',cible:'berger',nb:1,apres:'m4',
  txt:"« Il les mène, et il n'a plus de visage. On raconte qu'il était berger de son vivant — de vraies bêtes, de vrais matins. Il continue son métier avec ce qu'on lui laisse. Tue-le dans les ruines, à l'est. Et demande-toi qui, de vous deux, aura été le plus fidèle à ce qu'il est. »",
  fin:"« Le troupeau se disperse. Il se rassemblera sous un autre. Il y a toujours un autre. »",rew:{xp:180,or:120}},
 {id:'m6',giver:'maud',zone:'lande',nom:'La route de Valcierge',type:'reach',dest:'capitale',nb:1,apres:'m5',
  txt:"« Va à Valcierge, au nord. Cherche la Sénéchale Ivane. Là-bas, les murs sont hauts et les consciences bien rangées. Tu me manqueras — enfin, tes bras me manqueront. »",
  fin:'',rew:{xp:40,or:20}},
 {id:'v1',giver:'sarment',zone:'lande',nom:'Regarde-les hésiter',type:'kill',cible:'creux',nb:8,minLvl:3,
  txt:"« Avant de frapper, regarde. Certains Creux hésitent — un demi-pas, un tremblement. C'est le reste d'une habitude : céder le passage, s'excuser. Tue-les quand même. Mais note lesquels. Quelqu'un doit tenir le compte de ce qui reste d'humain. »",
  fin:"« Trois ont hésité, n'est-ce pas ? Toujours trois sur huit. J'ignore ce que ce chiffre veut dire. Ça me tient éveillé. »",rew:{xp:36,or:22}},
 {id:'v2',giver:'sarment',zone:'lande',nom:'Rendre à la terre',type:'collect',cible:'fragment',nb:6,apres:'v1',
  txt:"« Maud vend les os aux familles. Moi je les enterre. Même geste, autre prix. Apporte-m'en six — pas pour l'argent : pour qu'au moins six morts n'aient pas servi deux fois. »",
  fin:"« C'est fait. Six petites tombes sans nom. La différence entre elle et moi ? Aucune, sans doute. On se console comme on peut. »",rew:{xp:46,or:18,potions:2}},
 {id:'v3',giver:'sarment',zone:'lande',nom:'La miséricorde est une lame',type:'kill',cible:'traqueur',nb:10,apres:'v2',
  txt:"« On m'a demandé un jour si tuer ces choses était une miséricorde. J'ai répondu : la miséricorde est une lame — tout dépend de qui la tient, et de ce qu'il regrette. Dix Traqueurs. Tiens-la bien. »",
  fin:"« Tu ne regrettes rien ? Alors ce n'était pas de la miséricorde. Reviens quand tu regretteras. »",rew:{xp:62,or:42}},
 {id:'mR',giver:'maud',zone:'lande',nom:"L'entretien du monde",type:'kill',cible:'any',nb:15,apres:'m1',repeat:true,
  txt:"« Tant que tu tiens debout, fauche. Je paierai. Chaque nuit, s'il le faut. »",fin:'',rew:{}},
/* ————— VALCIERGE ————— */
 {id:'i1',giver:'ivane',zone:'capitale',nom:'Le recensement des absents',type:'kill',cible:'any',nb:20,need:6,minLvl:8,
  txt:"« Valcierge tient ses registres : chaque créature abattue hors les murs est un nom rayé quelque part. Vingt. La ville n'a pas besoin de savoir qui ils furent — moi, je note tout. Quelqu'un doit porter la comptabilité de l'oubli. »",
  fin:"« Vingt lignes. Mon registre pèse plus lourd que les remparts. Un jour il faudra le brûler, ou le lire. Je ne sais pas ce qui serait le plus cruel. »",rew:{xp:64,or:45}},
 {id:'c1',giver:'ivane',zone:'capitale',nom:"Le sel et l'ychor",type:'reach',dest:'lom',nb:1,need:8,minLvl:15,
  txt:"« Tu as assez donné à la Lande — elle ne t'en saura aucun gré. À l'est, la Fange d'Ychor avale nos convois et recrache autre chose. Le Padre Lom y tient un camp et une foi qui prend l'eau. Porte-lui mes registres. Niveaux 20 à 40 : n'y va pas en touriste. »",
  fin:'',rew:{xp:50,or:35}},
 {id:'c2',giver:'ivane',zone:'capitale',nom:'Les arbres qui portent',type:'reach',dest:'ashka',nb:1,need:16,minLvl:35,
  txt:"« À l'ouest, la Forêt des Pendus. La Veuve Ashka y vit, seule, depuis que son mari a rejoint les branches. Elle dit que quelqu'un doit habiter les endroits que tout le monde fuit — sinon ils cessent d'être des endroits. Niveaux 40 à 60. »",
  fin:'',rew:{xp:90,or:60}},
 {id:'c3',giver:'ivane',zone:'capitale',nom:'Là où finissent les os',type:'reach',dest:'ossian',nb:1,need:24,minLvl:55,
  txt:"« Au nord, les Crêtes de l'Ossuaire. Le Frère Ossian y prie ce qui n'écoute plus. C'est le bout du monde, et le monde le sait : il n'y envoie que ceux qui ne comptent plus lui revenir. Niveaux 60 à 70. Adieu, donc — au sens propre. »",
  fin:'',rew:{xp:140,or:90}},
/* ————— FANGE D'YCHOR ————— */
 {id:'f1',giver:'lom',zone:'fange',nom:"Ce que l'eau recrache",type:'kill',cible:'noyeur',nb:10,minLvl:18,
  txt:"« Les Noyeurs sortent des mares en tenant encore la vase, comme on tient une main. J'ai baptisé certains d'entre eux, autrefois. L'eau qui sauve et l'eau qui garde, c'est la même. Je n'arrive plus à finir mes prières. Dix. »",
  fin:"« Merci. Ne me dis pas s'il y avait Ancel parmi eux. Surtout, ne me le dis pas. »",rew:{xp:92,or:60}},
 {id:'f2',giver:'lom',zone:'fange',nom:'Les lanternes du fond',type:'collect',cible:'lanterne',nb:6,apres:'f1',
  txt:"« Ils remontent avec des lanternes accrochées au corps — celles des convois engloutis. Elles brûlent encore, sous l'eau, contre toute doctrine. Rapporte-m'en six. Je veux savoir si c'est un miracle ou une moquerie. »",
  fin:"« Elles s'éteignent dès qu'on les sort de la Fange. Comme quoi : même la lumière, ici, a choisi son camp. »",rew:{xp:112,or:70,potions:2}},
 {id:'f3',giver:'lom',zone:'fange',nom:'Les outres',type:'kill',cible:'gonfle',nb:8,apres:'f2',
  txt:"« Les Gonflés éclatent quand on les ouvre. Ils sont pleins de ce que la Fange digère : convois, bétail, lettres jamais lues. Huit. Recule vite. Et si tu vois flotter du papier — laisse. Certaines choses doivent rester illisibles. »",
  fin:"« Tu as lu, n'est-ce pas ? Tout le monde lit. C'est notre malédiction la plus honnête. »",rew:{xp:132,or:85}},
 {id:'f4',giver:'lom',zone:'fange',nom:'Mère Saumâtre',type:'kill',cible:'mere',nb:1,apres:'f3',
  txt:"« Quelque chose pond au fond de la Fange. Je l'ai appelée Mère parce qu'il faut bien nommer ce qu'on hait — sinon on finit par le prier. Elle est au cœur des eaux, à l'est. Tue-la. Et si elle te semble triste, tue-la quand même. La tristesse n'excuse rien, ici. »",
  fin:"« La Fange est plus silencieuse. Ce n'est pas un soulagement. Le silence, ici, c'est juste la prochaine chose qui attend. »",rew:{xp:400,or:250}},
 {id:'y1',giver:'noyee',zone:'fange',nom:'Ils m\'appellent encore',type:'kill',cible:'noyeur',nb:8,minLvl:20,
  txt:"« Je me suis noyée il y a onze ans. Je suis remontée. Eux non — et ils m'appellent, la nuit, avec ma propre voix. Fais-les taire. Huit. Ce n'est pas de la vengeance : c'est du sevrage. »",
  fin:"« Cette nuit, une voix de moins. On guérit par soustraction, par ici. »",rew:{xp:96,or:62}},
 {id:'y2',giver:'noyee',zone:'fange',nom:'Ce qui brûle sous l\'eau',type:'collect',cible:'lanterne',nb:5,apres:'y1',
  txt:"« Lom collectionne les lanternes pour interroger Dieu. Moi je veux les éteindre une par une. Cinq. Chacune est un espoir que quelqu'un a refusé de lâcher en coulant. L'espoir, à ce stade, c'est de la cruauté. »",
  fin:"« Soufflées. Tu trouves ça froid ? Attends d'avoir espéré onze ans. »",rew:{xp:118,or:72}},
 {id:'y3',giver:'noyee',zone:'fange',nom:'Le sevrage',type:'kill',cible:'gonfle',nb:6,apres:'y2',
  txt:"« Les Gonflés gardent dans leur ventre les affaires des noyés. Tant que ces choses existent, les vivants viennent fouiller la boue, et la Fange en prend un sur trois. Détruis les outres. Qu'il ne reste rien à chercher. »",
  fin:"« Plus rien à repêcher. Les veuves haïront ton nom, et vivront. C'est un marché honnête. »",rew:{xp:142,or:92}},
 {id:'fR',giver:'lom',zone:'fange',nom:'Assécher l\'inépuisable',type:'kill',cible:'any',nb:15,minLvl:18,repeat:true,
  txt:"« Chaque créature rendue à la boue est une prière exaucée. Je paie les prières. »",fin:'',rew:{}},
/* ————— FORÊT DES PENDUS ————— */
 {id:'p1',giver:'ashka',zone:'foret',nom:'Décrocher les fruits',type:'kill',cible:'pendu',nb:10,minLvl:38,
  txt:"« Ils descendent des branches quand on ne regarde pas. Mon mari est là-haut, quelque part — je ne cherche plus lequel. Abats-en dix. Chacun est le mari de quelqu'un, tu sais. C'est pour ça que je dis 'décrocher', pas 'tuer'. Les mots, c'est tout ce qui me reste à adoucir. »",
  fin:"« Dix branches allégées. La forêt ne pèse pas moins. C'est moi qui pèse moins, peut-être. »",rew:{xp:172,or:110}},
 {id:'p2',giver:'ashka',zone:'foret',nom:'Le chanvre des morts',type:'collect',cible:'corde',nb:6,apres:'p1',
  txt:"« Six longueurs de leur corde. Je tisse — un manteau, je crois, ou un linceul, on verra lequel il devient. Ne les mets pas autour de ton cou, même pour rire. La corde a de la mémoire, et elle est rancunière. »",
  fin:"« Le tissage avance. Si c'est un manteau, je te le donnerai. Si c'est un linceul… je te le donnerai aussi. »",rew:{xp:202,or:130,potions:2}},
 {id:'p3',giver:'ashka',zone:'foret',nom:'Ceux qui préviennent',type:'kill',cible:'hurleur',nb:8,apres:'p2',
  txt:"« Les Hurleurs crient avant de frapper. Longtemps, j'ai cru à de la cruauté. Puis j'ai compris : ils préviennent. C'est la dernière politesse qui leur reste, et elle tue quand même. Huit. Tu vois — on peut être poli et damné. »",
  fin:"« Le silence entre les arbres est revenu. Je ne sais plus si je le préfère. »",rew:{xp:232,or:150}},
 {id:'p4',giver:'ashka',zone:'foret',nom:'Le Pendeur',type:'kill',cible:'pendeur',nb:1,apres:'p3',
  txt:"« Celui qui noue. Il connaît le poids exact de chaque homme — c'était son métier, la justice, avant que la justice ne devienne un arbre. Il est au fond de la forêt, à l'ouest. Quand tu le tueras, il te remerciera peut-être. Ne le laisse pas finir sa phrase. »",
  fin:"« Il a essayé de te remercier, n'est-ce pas ? Ils essaient tous, à la fin. C'est ce qui rend ce monde impardonnable. »",rew:{xp:700,or:450}},
 {id:'d1',giver:'cordier',zone:'foret',nom:'Le compte des nœuds',type:'kill',cible:'pendu',nb:8,minLvl:40,
  txt:"« J'étais cordier. Chaque corde de cette forêt est sortie de mes mains — je reconnais mes nœuds de loin. On me dit : tu n'es pas coupable de l'usage. Huit Pendus. Aide-moi à défaire ce que je n'ai jamais noué, mais que j'ai rendu possible. »",
  fin:"« Huit nœuds défaits. Reste-t-il une différence entre fabriquer la corde et la tendre ? J'ai bâti ma vie sur ce 'oui'. Il s'effiloche. »",rew:{xp:182,or:115}},
 {id:'d2',giver:'cordier',zone:'foret',nom:'La matière du remords',type:'collect',cible:'corde',nb:5,apres:'d1',
  txt:"« Rapporte-moi cinq de mes cordes. Pas pour les brûler — le feu, c'est de l'oubli, et l'oubli est un luxe de coupable. Je vais les exposer devant ma hutte. Que chacun voie ce que mes mains ont fait de bien, devenu mal. »",
  fin:"« Elles pendent à ma porte, désormais. Les gens détournent les yeux. C'est exactement l'inverse de ce que je voulais. Comme toujours. »",rew:{xp:212,or:135}},
 {id:'d3',giver:'cordier',zone:'foret',nom:'Faire taire l\'écho',type:'kill',cible:'hurleur',nb:6,apres:'d2',
  txt:"« Les Hurleurs répètent les derniers mots entendus sous les branches. Certains crient les miens — le prix, le poids, la longueur. Six. Fais taire mon écho. Un homme devrait avoir le droit de ne pas s'entendre. »",
  fin:"« Merci. La forêt ne parle plus avec ma voix. Il ne reste que la mienne, dans ma tête. C'est déjà trop. »",rew:{xp:242,or:145}},
 {id:'pR',giver:'ashka',zone:'foret',nom:'Éclaircir la futaie',type:'kill',cible:'any',nb:15,minLvl:38,repeat:true,
  txt:"« La forêt repousse. Ce qui y marche aussi. »",fin:'',rew:{}},
/* ————— CRÊTES DE L'OSSUAIRE ————— */
 {id:'o1',giver:'ossian',zone:'cretes',nom:'Ossatures',type:'kill',cible:'ossature',nb:10,minLvl:58,
  txt:"« Là-haut, les os se souviennent d'avoir été des hommes — c'est tout ce dont ils se souviennent, et ils y tiennent. Dix Ossatures. Prie en frappant, si tu sais encore. Sinon, frappe : ici, c'est la même chose. »",
  fin:"« Dix squelettes rendus au repos. Le repos les reprendra-t-il ? Rien ne reprend rien, sur les Crêtes. Tout s'accumule. »",rew:{xp:282,or:180}},
 {id:'o2',giver:'ossian',zone:'cretes',nom:'Les clous du reliquaire',type:'collect',cible:'clou',nb:6,apres:'o1',
  txt:"« Les Colosses portent des cages thoraciques assemblées avec des clous de cercueil. Six clous. Je reconstruis le reliquaire du monastère — non pour y mettre des reliques : pour qu'il y ait, quelque part, une boîte vide qui attend encore quelque chose de saint. »",
  fin:"« Le reliquaire est refait. Vide. Magnifiquement vide. C'est la chose la plus honnête que j'aie bâtie. »",rew:{xp:322,or:200,potions:3}},
 {id:'o3',giver:'ossian',zone:'cretes',nom:'Les porteurs',type:'kill',cible:'colosse',nb:6,apres:'o2',
  txt:"« Les Colosses portent les os des autres — des dizaines d'autres. Je me demande s'ils se croient charitables. Porter les morts, c'est mon métier aussi. Six. Et pendant que tu frappes, demande-toi ce que toi, tu portes, et depuis quand. »",
  fin:"« Ils sont tombés, et tous les os qu'ils portaient avec eux. Une avalanche de dettes. Personne ne les remboursera. C'est peut-être ça, la paix. »",rew:{xp:382,or:230}},
 {id:'o4',giver:'ossian',zone:'cretes',nom:'Le Roi-Charnier',type:'kill',cible:'roi',nb:1,apres:'o3',
  txt:"« Tout ce qui marche ici descend de lui. Il trône au sommet, patient comme seuls les morts savent l'être. Va. Finis la veillée. Et souviens-toi : un roi de charnier reste un roi — il te regardera avec l'ennui de celui qui a déjà vu mourir tout ce qui compte. Ne cherche pas son respect. Prends sa couronne. »",
  fin:"« C'est fini. Le sommet est à toi, avec tout ce qu'il surplombe : rien. Redescends vite — les hommes qui restent en haut deviennent des rois, et tu as vu ce que ça donne. »",rew:{xp:1200,or:800}},
 {id:'u1',giver:'muet',zone:'cretes',nom:'✕',type:'kill',cible:'ossature',nb:8,minLvl:60,
  txt:"(Le Frère Muet trace huit croix dans la cendre, puis désigne les silhouettes blanches sur la crête. Son regard est une phrase entière.)",
  fin:"(Il efface les croix une à une, lentement, comme on ferme des paupières.)",rew:{xp:302,or:185}},
 {id:'u2',giver:'muet',zone:'cretes',nom:'✕✕',type:'collect',cible:'clou',nb:5,apres:'u1',
  txt:"(Il ouvre sa main : une cicatrice en forme de clou. Il montre les Colosses, puis sa paume, puis vous. Cinq doigts.)",
  fin:"(Il enfonce les cinq clous dans la poutre de son abri, sans un bruit. On dirait qu'il cloue quelque chose d'invisible pour qu'il ne s'échappe plus.)",rew:{xp:342,or:205}},
 {id:'u3',giver:'muet',zone:'cretes',nom:'✕✕✕',type:'kill',cible:'colosse',nb:5,apres:'u2',
  txt:"(Il pose sa main sur votre poitrine. Puis il désigne les Colosses. Il ne dit rien. Il n'a jamais rien dit. Sur les Crêtes, on comprend pourquoi : certaines choses ne survivent pas au fait d'être nommées.)",
  fin:"(Il incline la tête, une fois. De sa gorge sort un son — un seul, bref, rouillé. Peut-être 'merci'. Peut-être un nom. Vous ne le saurez jamais, et c'est un cadeau.)",rew:{xp:402,or:225}},
 {id:'oR',giver:'ossian',zone:'cretes',nom:'La dîme des crêtes',type:'kill',cible:'any',nb:15,minLvl:58,repeat:true,
  txt:"« L'Ossuaire est sans fond. Ma bourse, presque. »",fin:'',rew:{}},
/* ————— L'ÉPREUVE (sous-classe, niveau 50) ————— */
 {id:'s1',giver:'maitre',zone:'epreuve',nom:"L'épreuve du fer",type:'kill',cible:'pendu',nb:10,minLvl:50,
  txt:"« Tu veux dépasser ta forme ? Prouve que tu la maîtrises. Dix Pendus, dans la forêt. Reviens entier — pas indemne : entier. La différence, tu la comprendras là-bas. »",
  fin:"« Entier. Bien. La plupart reviennent indemnes, et c'est bien pire. »",rew:{xp:300,or:200}},
 {id:'s2',giver:'maitre',zone:'epreuve',nom:'Les insignes des anciens',type:'collect',cible:'insigne',nb:5,apres:'s1',
  txt:"« Ceux qui ont marché ta voie avant toi sont morts dans l'ouest et le nord. Rapporte cinq de leurs insignes. Ils te reconnaîtront — les morts reconnaissent toujours leurs remplaçants. »",
  fin:"« Cinq insignes. Cinq manières d'échouer que tu n'auras pas à inventer. C'est ça, l'héritage. »",rew:{xp:400,or:250}},
 {id:'s3',giver:'maitre',zone:'epreuve',nom:'Le maître déchu',type:'kill',cible:'pendeur',nb:1,apres:'s2',
  txt:"« Le Pendeur fut Maître d'armes avant moi. Il pesait les hommes de son vivant déjà — il a seulement continué. Tue-le, et ce qu'il savait passera en toi. Alors seulement, tu choisiras ce que tu deviens. Choisis en sachant qu'on ne choisit qu'une fois ce genre de chose. »",
  fin:"« C'est fait. Son savoir est en toi, avec tout ce qu'il pèse. Viens — il est temps de choisir ta voie. »",rew:{xp:900,or:600}}];
function questRewRepeat(){return{xp:Math.round(6+G.lvl*1.1),or:15+Math.round(G.lvl*1.5)};}
function doneCount(){let n=0;QUESTS.forEach(q=>{if(!q.repeat&&qState(q.id).state==='done')n++;});return n;}
function qState(id){return G.quests[id]||{state:'none',n:0};}
function questsDisponibles(giver){
  return QUESTS.filter(q=>{
    if(q.giver!==giver)return false;
    const s=qState(q.id);
    if(s.state==='done'&&!q.repeat)return false;
    if(s.state==='active'||s.state==='ready')return false;
    if(q.minLvl&&G.lvl<q.minLvl)return false;
    if(q.need&&doneCount()<q.need)return false;
    if(q.apres){const p=qState(q.apres);if(p.state!=='done')return false;}
    return true;});
}
function questsPretes(giver){return QUESTS.filter(q=>q.giver===giver&&qState(q.id).state==='ready');}
function questProgress(type,cible){
  QUESTS.forEach(q=>{
    const s=qState(q.id);if(s.state!=='active')return;
    let ok=false;
    if(q.type==='kill'&&type==='kill'&&(q.cible===cible||q.cible==='any'))ok=true;
    if(q.type==='collect'&&type==='collect'&&q.cible===cible)ok=true;
    if(q.type==='reach'&&type==='reach'&&q.dest===cible)ok=true;
    if(ok){s.n=Math.min(q.nb,s.n+1);
      if(s.n>=q.nb){s.state='ready';toast('Quête accomplie','Retournez voir '+giverNom(q.giver));}
      G.quests[q.id]=s;}});
  majTracker();syncQuestItems();
}
function giverNom(g){return{maud:'Maud la Veilleuse',ivane:'la Sénéchale Ivane',lom:'le Padre Lom',ashka:'la Veuve Ashka',ossian:'le Frère Ossian',maitre:"le Maître d'armes Aldren",sarment:'le Vieux Sarment',noyee:'la Noyée',cordier:'le Cordier',muet:'le Frère Muet'}[g];}
