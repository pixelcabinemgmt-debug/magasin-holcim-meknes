'use strict';
const D=window.HOLCIM_GALLERY;
const A=D.assets;
const byId=new Map(A.map(a=>[a.id,a]));
const $=id=>document.getElementById(id);
const floorKey=a=>a.floor.replaceAll('_','-');
const floors={'RDC':'Rez-de-chaussée','ETAGE':'Étage','MEZ':'Mezzanine existante','RDC-ETAGE':'Liaisons entre niveaux'};
const floorName=a=>floors[floorKey(a)]||a.floor;
const norm=s=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
const alt=a=>a.alt||a.name;
const make=(tag,cl,text)=>{const el=document.createElement(tag); if(cl) el.className=cl; if(text) el.textContent=text; return el;};

const chapters=[
  {id:'rez-de-chaussee',number:'01',title:'Rez-de-chaussée',description:'La réception, les allées de stock et la préparation.',views:['P01','P02','P03','P04'],features:[
    {id:'B02-01',topic:'B02 / Marchandises',title:'La réception des marchandises.',copy:'À l’entrée du magasin, le comptoir est réservé à la réception des marchandises. Les rayonnages proches servent au rangement des pièces.',room:'B02'},
    {id:'G01-01',topic:'G01 / Rayonnages',title:'Chaque famille de pièces a sa place.',copy:'Les travées organisent le stockage. Leurs repères permettent de retrouver les pièces depuis les allées.',room:'G01',dark:true},
    {id:'G03-01',topic:'G03 / Aire moteurs',title:'Une aire dédiée aux moteurs.',copy:'Le marquage jaune distingue la zone de stockage au sol des voies de circulation. Les rangements de préparation bordent l’aire.',room:'G03'},
  ]},
  {id:'etage',number:'02',title:'À l’étage',description:'Les réserves, le hall, l’espace de travail et les archives.',views:['UP01','UP02','UP03','UP04'],features:[
    {id:'STA01-01',topic:'STA01 / Liaison avec le magasin',title:'Deux volées depuis le couloir bleu.',copy:'La première volée s’ouvre sur le couloir. Le palier permet le retour de la seconde volée vers l’étage des réserves.',room:'STA01',dark:true},
    {id:'U01-01',topic:'U01 / Réserves',title:'Les allées des réserves.',copy:'L’étage complète le stockage au rez-de-chaussée. Les pièces sont regroupées dans des réserves desservies par les paliers.',floor:'ETAGE'},
    {id:'UB02-03',topic:'UB02 / Parcours visiteurs',title:'Le hall distribue les espaces de travail.',copy:'L’escalier hélicoïdal dessert le hall depuis l’entrée. En haut, la salle de réunion et les archives occupent les deux côtés du palier.',room:'UB02',dark:true},
  ]},
  {id:'mezzanine',number:'03',title:'Mezzanine existante',description:'Un local et son escalier dédié.',views:['MP01','MP02','MP03','MP04'],features:[
    {id:'M01-03',topic:'M01 / Existant',title:'Un accès à part depuis le magasin.',copy:'La mezzanine existante forme un ensemble distinct des réserves de l’étage. Son escalier longe les rayonnages.',room:'M01'},
  ]},
];
function img(src,a){const el=make('img'); el.src=src; el.alt=alt(a); el.width=a.width;el.height=a.height;el.loading='lazy';el.decoding='async';return el;}
function editorialFigure(id,plate=false){
  const a=byId.get(id), f=make('figure'), b=make('button','image-action');
  b.type='button';b.dataset.view=id;b.setAttribute('aria-label','Agrandir : '+a.name);
  if(plate)b.classList.add('planplate');
  b.append(img(a.kind==='plan'?'editorial/'+id+'.webp':a.large,a));
  const arrow=make('span','enlarge','↗');arrow.setAttribute('aria-hidden','true');b.append(arrow);
  const cap=make('figcaption');cap.append(make('span','',a.name),make('span','',id));f.append(b,cap);return f;
}
function wrap(tag,cl){const section=make(tag,cl),shell=make('div','shell');section.append(shell);return [section,shell];}
for (const ch of chapters){
  const [section,shell]=wrap('section','dark band');section.id=ch.id;section.setAttribute('aria-labelledby',ch.id+'-titre');shell.classList.add('level-layout');
  const copy=make('div');const title=make('h2','',ch.title);title.id=ch.id+'-titre';
  copy.append(make('p','level-number',ch.number),title,make('p','',ch.description));shell.append(copy,editorialFigure(ch.views[0],true));
  const [detail,detailShell]=wrap('section','paper band level-detail');detailShell.append(make('p','eyebrow',ch.title+' / Volumes'),make('h2','','Comprendre les liens entre les espaces.'));
  const pair=make('div','diagram-grid');pair.append(...ch.views.slice(2).map(id=>editorialFigure(id)));detailShell.append(pair);
  const mono=make('details','mono-toggle');mono.append(make('summary','','Lire le plan monochrome'),editorialFigure(ch.views[1]));detailShell.append(mono);
  $('chapters').append(section,detail);
  for(const [i,ft] of ch.features.entries()){
    const [feature,body]=wrap('section','band feature'+(ft.dark?' dark':'')+(i%2?' feature--reverse':''));
    const aside=make('div','feature-copy');aside.append(make('p','eyebrow',ft.topic),make('h2','',ft.title),make('span','lime-rule'),make('p','',ft.copy));
    const link=make('a','underlink','Voir les vues de cet espace ↓');link.href='#collection';link.dataset.room=ft.room||'';link.dataset.floor=ft.floor||'';if(ft.floor)link.textContent='Voir toutes les vues de l’étage ↓';aside.append(link);
    body.append(editorialFigure(ft.id),aside);$('chapters').append(feature);
  }
}

const roomNames=new Map();for(const a of A) if(!roomNames.has(a.room)) roomNames.set(a.room,a.zone_name||a.room);
for(const [val,label] of Object.entries(floors)) if(A.some(a=>floorKey(a)===val)) $('floor').add(new Option(label,val));
const c=new Intl.Collator('fr');
function roomsForFloor(){
 const room=$('room'), prev=room.value, floor=$('floor').value;
 room.replaceChildren(new Option('Tous les espaces',''));
 const allowed=new Set(A.filter(a=>!floor||floorKey(a)===floor).map(a=>a.room));
 for(const [roomId,label] of [...roomNames].sort((a,b)=>c.compare(a[1],b[1]))) if(allowed.has(roomId)) room.add(new Option(label,roomId));
 if(allowed.has(prev))room.value=prev;
}
let filtered=[], viewing=[], current=0, opener;
function filter(){
  const f=$('floor').value,r=$('room').value,k=$('kind').value,q=norm($('search').value);
  filtered=A.filter(a=>(!f||floorKey(a)===f)&&(!r||a.room===r)&&(!k||a.kind===k)&&(!q||norm([a.id,a.name,a.zone_name,floorName(a),a.caption,a.alt].join(' ')).includes(q)));
  $('count').textContent=filtered.length+' '+(filtered.length===1?'vue':'vues');$('empty').hidden=!!filtered.length;
  const frag=document.createDocumentFragment();
  for(const a of filtered){
    const b=make('button','tile');b.type='button';b.dataset.view=a.id;b.dataset.kind=a.kind;
    const art=make('span','tile-art');art.append(img(a.preview,a));
    const meta=make('span','tile-meta');meta.append(make('span','',floorName(a)),make('span','',a.id));
    b.append(art,meta,make('span','tile-name',a.name));frag.append(b);
  }
  $('grid').replaceChildren(frag);
}
function read(){
 const a=viewing[current];$('viewer-image').src=a.large;$('viewer-image').alt=alt(a);$('viewer-title').textContent=a.name;
 $('viewer-caption').textContent=[floorName(a),a.zone_name,a.id].filter(Boolean).join(' · ');
 $('viewer-counter').textContent=`${current+1} / ${viewing.length}`;$('download-original').href=a.original;$('download-original').download=a.id+a.extension;
 for(const id of ['previous','next'])$(id).disabled=viewing.length<2;
}
function openView(button){
 const a=byId.get(button.dataset.view);if(!a)return;
 viewing=button.closest('#grid')?filtered:A;current=viewing.findIndex(entry=>entry.id===a.id);opener=button;read();$('viewer').showModal();document.body.classList.add('viewer-open');
}
function step(delta){current=(current+delta+viewing.length)%viewing.length;read();}
$('floor').addEventListener('change',()=>{roomsForFloor();filter();});for(const id of ['room','kind'])$(id).addEventListener('change',filter);
$('search').addEventListener('input',filter);
$('reset').addEventListener('click',()=>{$('floor').value='';$('room').value='';$('kind').value='';$('search').value='';roomsForFloor();filter();});
$('previous').addEventListener('click',()=>step(-1));$('next').addEventListener('click',()=>step(1));$('close').addEventListener('click',()=>$('viewer').close());
$('viewer').addEventListener('close',()=>{document.body.classList.remove('viewer-open');opener?.focus({preventScroll:true});});
$('viewer').addEventListener('click',event=>{if(event.target===$('viewer'))$('viewer').close();});
$('viewer').addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowLeft'?-1:1);}});
document.addEventListener('click',event=>{
 const view=event.target.closest('button[data-view]');if(view)openView(view);
 const link=event.target.closest('a[data-room]');if(!link)return;
 $('floor').value=link.dataset.floor;$('room').value='';$('kind').value='';$('search').value='';roomsForFloor();$('room').value=link.dataset.room;filter();
});
for(const doc of D.documents){const a=make('a','');a.href=doc.file;a.append(make('span','',doc.label),make('span','','↓'));a.lastChild.setAttribute('aria-hidden','true');a.download='';$('document-links').append(a);}
roomsForFloor();filter();
