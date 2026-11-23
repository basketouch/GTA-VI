// Modo local: todo se guarda en el navegador. Cuando haya Supabase, solo hay que
// cambiar load()/save() y las acciones por llamadas a la API (ver supabase/schema.sql).
const KEY="g6state";
let S=load();
let view="zonas",zona="all";
function load(){try{return Object.assign({tips:[],votes:{},visited:[],pts:0,stamps:[]},JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){return{tips:[],votes:{},visited:[],pts:0,stamps:[]}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const L={c:"CONFIRMADO",r:"RUMOR"};
const NIVELES=[[0,"Turista"],[30,"Explorador"],[100,"Local"],[250,"Guía"],[600,"Leyenda de Leonida"]];
function nivel(){let i=0;NIVELES.forEach((n,k)=>{if(S.pts>=n[0])i=k});const a=NIVELES[i],b=NIVELES[i+1];return{nom:a[1],sig:b,pct:b?Math.round((S.pts-a[0])/(b[0]-a[0])*100):100}}
const BADGES=[
 ["Primer truco","Publica 1 truco",()=>S.tips.length>=1],
 ["Colaborador","Publica 5 trucos",()=>S.tips.length>=5],
 ["Explorador","Visita 4 zonas",()=>S.visited.length>=4],
 ["Crítico","Valora 10 trucos",()=>Object.keys(S.votes).length>=10]];
function ad(){
 if(!CFG.ADS_ENABLED)return"";
 return `<div class="ad">Publicidad</div>`; // aquí iría el bloque real de la red de anuncios
}
function aff(){
 if(!CFG.AFFILIATE_LINKS.length)return"";
 return `<div class="card aff"><span class="mut">Enlaces de afiliado (nos ayudan a mantener la guía):</span><br>`+
  CFG.AFFILIATE_LINKS.map(l=>`<a href="${esc(l.url)}" rel="sponsored noopener" target="_blank">${esc(l.texto)}</a>`).join(" · ")+`</div>`;
}
function head(){const n=nivel();$("#pts").textContent=`${S.pts} pts · ${n.nom}`}
function setView(v){view=v;document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));render()}
function render(){head();({zonas:vZonas,nuevo:vNuevo,perfil:vPerfil})[view]();window.scrollTo(0,0)}

function vZonas(){
 const chips=[["all","Todas"]].concat(ZONAS.map(z=>[z.id,z.n]));
 const lista=ZONAS.filter(z=>zona==="all"||z.id===zona);
 if(zona!=="all"&&!S.visited.includes(zona)){S.visited.push(zona);S.pts+=2;save();head()}
 $("#view").innerHTML=`<input type="search" id="q" placeholder="Buscar trucos y datos…">
 <div class="chips">${chips.map(c=>`<button data-z="${c[0]}" class="${zona===c[0]?"on":""}">${c[1]}</button>`).join("")}</div>
 <div id="lista">${cards(lista,"")}</div>${aff()}`;
 document.querySelectorAll(".chips button").forEach(b=>b.onclick=()=>{zona=b.dataset.z;render()});
 $("#q").oninput=e=>{$("#lista").innerHTML=cards(lista,e.target.value.trim().toLowerCase());bind()};
 bind();
}
function cards(lista,q){
 let out="",n=0;
 for(const z of lista){
  const tips=S.tips.filter(t=>t.z===z.id).sort((a,b)=>score(b)-score(a));
  const base=z.items.filter(i=>!q||i[1].toLowerCase().includes(q)||z.n.toLowerCase().includes(q));
  const tf=tips.filter(t=>!q||(t.t+" "+t.x+" "+t.c).toLowerCase().includes(q));
  if(q&&!base.length&&!tf.length)continue;
  out+=`<section class="card"><h2>${z.n}</h2><div class="base">${z.base}</div>`+
   base.map(i=>`<div class="it"><span class="tag ${i[0]}">${L[i[0]]}</span>${i[1]}</div>`).join("")+
   tf.map(t=>`<div class="it"><span class="tag u">USUARIO</span><b>${esc(t.t)}</b> <small>${esc(t.c)}</small>${esc(t.x)}
    <div class="vt"><button data-id="${t.id}" data-d="1" class="${S.votes[t.id]===1?"on":""}">👍 Funciona</button>
    <button data-id="${t.id}" data-d="-1" class="${S.votes[t.id]===-1?"on":""}">👎 Falso</button><span class="mut">${score(t)}</span></div></div>`).join("")+`</section>`;
  if(++n%3===0)out+=ad();
 }
 return out||`<div class="card mut">Sin resultados.</div>`;
}
const score=t=>(t.up||0)-(t.down||0);
function bind(){
 document.querySelectorAll(".vt button").forEach(b=>b.onclick=()=>{
  const id=b.dataset.id,d=+b.dataset.d,t=S.tips.find(x=>x.id===id);
  if(!t)return;
  if(S.votes[id]){if(S.votes[id]===1)t.up--;else t.down--;}else S.pts+=1; // +1 por valorar
  if(S.votes[id]===d){delete S.votes[id]}else{S.votes[id]=d;if(d===1)t.up=(t.up||0)+1;else t.down=(t.down||0)+1}
  save();render();
 });
}
function vNuevo(){
 $("#view").innerHTML=`<div class="card"><h2>Dejar un truco</h2><p class="mut">Gana +10 puntos por truco. Los demás lo valoran; los más votados suben.</p>
 <label>Zona</label><select id="z">${ZONAS.map(z=>`<option value="${z.id}" ${z.id===zona?"selected":""}>${z.n}</option>`).join("")}</select>
 <label>Tipo</label><select id="c">${CATS.map(c=>`<option>${c}</option>`).join("")}</select>
 <label>Título</label><input id="t" maxlength="60" placeholder="Ej. Dinero rápido en el puerto">
 <label>Cómo se hace</label><textarea id="x" rows="5" maxlength="400" placeholder="Explícalo en pocas líneas. Marca el spoiler si lo hay."></textarea>
 <p id="err" class="mut"></p><button class="btn" id="go">Publicar</button></div>`;
 $("#go").onclick=()=>{
  const t=$("#t").value.trim(),x=$("#x").value.trim(),now=Date.now();
  S.stamps=S.stamps.filter(s=>now-s<3600000);
  if(t.length<4||x.length<10)return $("#err").textContent="Escribe un título y una explicación un poco más larga.";
  if(S.stamps.length>=5)return $("#err").textContent="Máximo 5 trucos por hora. Inténtalo luego.";
  S.stamps.push(now);
  S.tips.push({id:"t"+now,z:$("#z").value,c:$("#c").value,t,x,up:0,down:0,at:now});
  S.pts+=10;save();zona=$("#z").value;setView("zonas");
 };
}
function vPerfil(){
 const n=nivel();
 $("#view").innerHTML=`<div class="card"><h2>${n.nom}</h2><div class="mut">${S.pts} puntos${n.sig?` · faltan ${n.sig[0]-S.pts} para ${n.sig[1]}`:""}</div>
 <div class="bar"><i style="width:${n.pct}%"></i></div></div>
 <div class="card"><h2>Insignias</h2><div class="badges">${BADGES.map(b=>`<span class="badge ${b[2]()?"":"off"}" title="${b[1]}">${b[0]}</span>`).join("")}</div></div>
 <div class="card"><h2>Cómo se ganan puntos</h2><div class="mut">+10 por truco publicado · +1 por valorar · +2 por visitar una zona nueva.<br>Próximamente: puntos cuando otros votan tus trucos, ranking mensual y bote de ingresos.</div></div>
 <div class="card mut">Ahora mismo tus datos se guardan solo en este móvil. Con cuentas, tus puntos viajarán contigo.</div>`;
}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>setView(b.dataset.v));
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
render();
