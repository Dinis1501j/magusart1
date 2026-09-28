import {asset,el,json,error} from './shared.js?v=online1';
const container=document.querySelector('#catalog'), title=document.querySelector('#catalog-title'), count=document.querySelector('#catalog-count'), search=document.querySelector('#search');
const dialog=document.querySelector('#lightbox'); let active, photo=0;
function updatePhoto(){const img=document.querySelector('#large-photo');img.src=asset(active.images[photo]);img.alt=active.name+' — fotografia '+(photo+1);document.querySelector('#photo-count').textContent=`${photo+1} / ${active.images.length}`;document.querySelector('#prev-photo').disabled=photo===0;document.querySelector('#next-photo').disabled=photo===active.images.length-1;}
function openPhoto(p){active=p;photo=0;document.querySelector('#photo-title').textContent=p.name;updatePhoto();dialog.showModal();}
document.querySelector('#close-photo').onclick=()=>dialog.close();
document.querySelector('#prev-photo').onclick=()=>{if(photo>0){photo--;updatePhoto();}};
document.querySelector('#next-photo').onclick=()=>{if(photo<active.images.length-1){photo++;updatePhoto();}};
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')document.querySelector('#prev-photo').click();if(e.key==='ArrowRight')document.querySelector('#next-photo').click();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const pieces=n=>`${n} ${n===1?'peça':'peças'}`;
try {
 const data=await json('data/catalog.json');
 function render(){
  const params=new URLSearchParams(location.search), category=params.get('c'), selected=data.categories.find(c=>c.id===category), query=fold(search.value.trim());
  container.replaceChildren(); title.textContent=selected?.name||'Catálogo';document.title=title.textContent+' — Magus Art';
  if(category&&!selected){container.append(el('p',{class:'empty-category'},'Esta categoria não existe.'),el('a',{href:asset('catalogo/'),class:'button'},'Ver categorias'));count.textContent='';return;}
  if(!selected&&!query){const grid=el('div',{class:'catalog-grid'});for(const c of data.categories){const products=data.products.filter(p=>p.category===c.id);const card=el('a',{class:'category-card',href:asset('catalogo/?c='+encodeURIComponent(c.id))});const cover=c.cover||products[0]?.images[0];if(cover)card.append(el('img',{class:'category-cover',src:asset(cover),alt:'',loading:'lazy'}));card.append(el('h3',{},c.name),el('span',{class:'cat-count'},pieces(products.length)));grid.append(card);}container.append(grid);count.textContent=`${data.categories.length} categorias`;return;}
  container.append(el('a',{href:asset('catalogo/'),class:'back-btn'},'← Todas as categorias'));
  const products=data.products.filter(p=>(!selected||p.category===selected.id)&&(!query||fold(p.name+' '+p.subcategory+' '+p.description).includes(query)));
  count.textContent=pieces(products.length);const grid=el('div',{class:'detail-grid'});
  for(const sub of [...new Set(products.map(p=>p.subcategory))]){if(sub){const heading=el('div',{class:'subcategory-title'});heading.append(el('h2',{},sub));grid.append(heading);}for(const p of products.filter(p=>p.subcategory===sub)){const card=el('article',{class:'product-card',id:p.id});const image=el('button',{class:'tile img-tile',type:'button','aria-label':'Ampliar fotografias de '+p.name});image.append(el('img',{src:asset(p.images[0]),alt:p.name,loading:'lazy',decoding:'async',width:'400',height:'500'}));image.onclick=()=>openPhoto(p);const info=el('div',{class:'product-info'});info.append(el('h3',{class:'product-name'},p.name),el('div',{class:'product-price'},p.price));if(p.description)info.append(el('p',{},p.description));info.append(el('a',{class:'button',href:'https://wa.me/351927732127?text='+encodeURIComponent('Olá! Gostava de saber mais sobre '+p.name+'.'),target:'_blank',rel:'noopener'},'Perguntar sobre esta peça'));card.append(image,info);grid.append(card);}}
  container.append(products.length?grid:el('p',{class:'empty-category'},'Não encontrámos peças com essa pesquisa.'));
 }
 search.value=new URLSearchParams(location.search).get('q')||'';
 search.addEventListener('input',()=>{const url=new URL(location.href);if(search.value)url.searchParams.set('q',search.value);else url.searchParams.delete('q');history.replaceState(null,'',url);render();});
 window.addEventListener('popstate',()=>{search.value=new URLSearchParams(location.search).get('q')||'';render();});render();
}catch(e){error(container,e);}
