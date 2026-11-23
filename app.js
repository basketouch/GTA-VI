// Modo local: todo se guarda en el navegador. Con Supabase (supabase/schema.sql) bastará con
// sustituir load()/save() y las acciones por llamadas a la API.
const KEY="g6state2";
const EMPTY={items:[],votes:{},done:{},visited:[],pts:0,stamps:[]};
let S=load();
let view="explorar",sec="all",zona="all",q="";
function load(){try{return Object.assign({},EMPTY,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){return Object.assign({},EMPTY)}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const TAG={c:["c","CONFIRMADO"],r:["r","RUMOR"],u:["u","JUGADOR"]};
const secN=id=>(SECS.find(s=>s.id===id)||{}).n||"";
const zonN=id=>id==="all"?"Toda la isla":(ZONAS.find(z=>z.id===id)||{}).n||"";
const NIVELES=[[0,"Turista"],[30,"Explorador"],[100,"Local"],[250,"Guía"],[600,"Leyenda de Leonida"]];
function nivel(){let i=0;NIVELES.forEach((n,k)=>{if(S.pts>=n[0])i=k});const a=NIVELES[i],b=NIVELES[i+1];return{nom:a[1],sig:b,pct:b?Math.round((S.pts-a[0])/(b[0]-a[0])*100):100}}
const BADGES=[
 ["Primer aporte","Publica 1 aporte",()=>S.items.length>=1],
 ["Colaborador","Publica 5 aportes",()=>S.items.length>=5],
 ["Explorador","Visita 4 zonas",()=>S.visited.length>=4],
 ["Crítico","Valora 10 aportes",()=>Object.keys(S.votes).length>=10],
 ["Completista","Marca 10 como conseguidos",()=>Object.keys(S.done).length>=10]];
const ad=()=>CFG.ADS_ENABLED?`<div class="ad">Publicidad</div>`:"";
function aff(){
 if(!CFG.AFFILIATE_LINKS.length)return"";
 return `<div class="card aff"><span class="mut">Enlaces de afiliado (ayudan a mantener la guía):</span><br>`+
  CFG.AFFILIATE_LINKS.map(l=>`<a href="${esc(l.url)}" rel="sponsored noopener" target="_blank">${esc(l.texto)}</a>`).join(" · ")+`</div>`;
}
const score=t=>(t.up||0)-(t.down||0);
const head=()=>{$("#pts").textContent=`${S.pts} pts · ${nivel().nom}`};
function setView(v){view=v;document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));render();window.scrollTo(0,0)}
function render(){head();({explorar:vExplorar,nuevo:vNuevo,calc:vCalc,perfil:vPerfil})[view]()}
const all=()=>SEED.map((e,i)=>Object.assign({id:"s"+i},e)).concat(S.items.map(e=>Object.assign({tag:"u"},e)));

function vExplorar(){
 if(zona!=="all"&&!S.visited.includes(zona)){S.visited.push(zona);S.pts+=2;save();head()}
 const secs=[["all","Todo"]].concat(SECS.map(s=>[s.id,s.n]));
 $("#view").innerHTML=`<input type="search" id="q" placeholder="Buscar: coche, misión, dinero…" value="${esc(q)}">
 <div class="chips" id="cs">${secs.map(c=>`<button data-s="${c[0]}" class="${sec===c[0]?"on":""}">${c[1]}</button>`).join("")}</div>
 <select id="zs"><option value="all">Toda la isla</option>${ZONAS.map(z=>`<option value="${z.id}" ${zona===z.id?"selected":""}>${z.n}</option>`).join("")}</select>
 <div id="zinfo"></div><div id="lista"></div>${aff()}`;
 document.querySelectorAll("#cs button").forEach(b=>b.onclick=()=>{sec=b.dataset.s;render()});
 $("#zs").onchange=e=>{zona=e.target.value;render()};
 $("#q").oninput=e=>{q=e.target.value.trim().toLowerCase();lista()};
 lista();
}
function lista(){
 const z=ZONAS.find(z=>z.id===zona);
 $("#zinfo").innerHTML=z?`<div class="card"><h2>${z.n}</h2><div class="base">${z.base}</div></div>`:"";
 let a=all().filter(e=>(sec==="all"||e.s===sec)&&(zona==="all"||e.z===zona||e.z==="all")&&(!q||(e.t+" "+e.x).toLowerCase().includes(q)));
 a.sort((x,y)=>(y.tag==="u"?score(y):0)-(x.tag==="u"?score(x):0));
 const chk=a.filter(e=>(SECS.find(s=>s.id===e.s)||{}).check);
 let h="";
 if(chk.length){const d=chk.filter(e=>S.done[e.id]).length;h+=`<div class="card"><b>Progreso:</b> ${d}/${chk.length} conseguidos<div class="bar"><i style="width:${Math.round(d/chk.length*100)}%"></i></div></div>`}
 a.forEach((e,i)=>{
  const sc=(SECS.find(s=>s.id===e.s)||{}).check;
  h+=`<div class="card"><span class="tag ${TAG[e.tag][0]}">${TAG[e.tag][1]}</span><span class="mut">${secN(e.s)} · ${zonN(e.z)}</span>
  <div><b>${esc(e.t)}</b></div><div>${esc(e.x)}</div>
  <div class="vt">${sc?`<button data-done="${e.id}" class="${S.done[e.id]?"on":""}">${S.done[e.id]?"✓ Conseguido":"Marcar conseguido"}</button>`:""}
  ${e.tag==="u"?`<button data-id="${e.id}" data-vote="1" class="${S.votes[e.id]===1?"on":""}">👍 Funciona</button><button data-id="${e.id}" data-vote="-1" class="${S.votes[e.id]===-1?"on":""}">👎 Falso</button><span class="mut">${score(e)}</span>`:""}</div></div>`;
  if((i+1)%4===0)h+=ad();
 });
 if(!a.length)h+=`<div class="card mut">Aún no hay nada aquí. <b>Sé el primero en aportar</b> desde la pestaña “+ Aportar” y gana puntos.</div>`;
 $("#lista").innerHTML=h;
 document.querySelectorAll("[data-done]").forEach(b=>b.onclick=()=>{const id=b.dataset.done;if(S.done[id])delete S.done[id];else S.done[id]=1;save();render()});
 document.querySelectorAll("[data-vote]").forEach(b=>b.onclick=()=>{
  const id=b.dataset.id,d=+b.dataset.vote,t=S.items.find(x=>x.id===id);if(!t)return;
  const prev=S.votes[id];
  if(prev){prev===1?t.up--:t.down--;delete S.votes[id]}else S.pts+=1;
  if(prev!==d){S.votes[id]=d;d===1?t.up=(t.up||0)+1:t.down=(t.down||0)+1}
  save();render();
 });
}
function vNuevo(){
 $("#view").innerHTML=`<div class="card"><h2>Aportar</h2><p class="mut">+10 puntos por aporte. Los demás lo valoran y los más votados suben.</p>
 <label>Sección</label><select id="s">${SECS.map(s=>`<option value="${s.id}" ${s.id===sec?"selected":""}>${s.n}</option>`).join("")}</select>
 <label>Zona</label><select id="z"><option value="all">Toda la isla</option>${ZONAS.map(z=>`<option value="${z.id}" ${z.id===zona?"selected":""}>${z.n}</option>`).join("")}</select>
 <label>Título</label><input id="t" maxlength="60">
 <label>Detalles</label><textarea id="x" rows="5" maxlength="400" placeholder="Cómo se hace, dónde está, cuánto da… Avisa si hay spoiler."></textarea>
 <p id="err" class="mut"></p><button class="btn" id="go">Publicar</button></div>`;
 const ph=()=>$("#t").placeholder=(SECS.find(s=>s.id===$("#s").value)||{}).ph||"";
 $("#s").onchange=ph;ph();
 $("#go").onclick=()=>{
  const t=$("#t").value.trim(),x=$("#x").value.trim(),now=Date.now();
  S.stamps=S.stamps.filter(s=>now-s<3600000);
  if(t.length<4||x.length<10)return $("#err").textContent="Escribe un título y una explicación un poco más larga.";
  if(S.stamps.length>=5)return $("#err").textContent="Máximo 5 aportes por hora.";
  S.stamps.push(now);
  S.items.push({id:"u"+now,s:$("#s").value,z:$("#z").value,t,x,up:0,down:0});
  S.pts+=10;sec=$("#s").value;zona=$("#z").value;save();setView("explorar");
 };
}
function vCalc(){
 $("#view").innerHTML=`<div class="card"><h2>¿Qué método da más dinero?</h2>
 <p class="mut">Pon tus propios números mientras juegas. Compara dos formas de ganar dinero.</p>
 ${["A","B"].map(k=>`<h3 class="mut">Método ${k}</h3><label>Ganancia por tanda ($)</label><input id="g${k}" type="number" inputmode="decimal" min="0"><label>Minutos por tanda</label><input id="m${k}" type="number" inputmode="decimal" min="0">`).join("")}
 <label>Objetivo ($)</label><input id="obj" type="number" inputmode="decimal" min="0">
 <button class="btn" id="go">Calcular</button><div id="res"></div></div>`;
 $("#go").onclick=()=>{
  const r=["A","B"].map(k=>{const g=+$("#g"+k).value,m=+$("#m"+k).value;return{k,g,m,ph:m>0?g*60/m:0}});
  const obj=+$("#obj").value;
  $("#res").innerHTML=r.map(x=>`<p><b>Método ${x.k}:</b> ${Math.round(x.ph).toLocaleString("es")} $/hora${obj>0&&x.ph>0?` · objetivo en ${(obj/x.ph).toFixed(1)} h`:""}</p>`).join("")+
   (r[0].ph&&r[1].ph?`<p class="mut">Mejor: Método ${r[0].ph>=r[1].ph?"A":"B"}</p>`:"");
 };
}
function vPerfil(){
 const n=nivel();
 $("#view").innerHTML=`<div class="card"><h2>${n.nom}</h2><div class="mut">${S.pts} puntos${n.sig?` · faltan ${n.sig[0]-S.pts} para ${n.sig[1]}`:""}</div><div class="bar"><i style="width:${n.pct}%"></i></div></div>
 <div class="card"><h2>Insignias</h2><div class="badges">${BADGES.map(b=>`<span class="badge ${b[2]()?"":"off"}" title="${b[1]}">${b[0]}</span>`).join("")}</div></div>
 <div class="card"><h2>Cómo se ganan puntos</h2><div class="mut">+10 por aporte · +1 por valorar · +2 por visitar una zona nueva.<br>Próximamente: puntos por votos recibidos, ranking mensual y bote de ingresos.</div></div>
 <div class="card mut">Tus datos se guardan solo en este móvil. Con cuentas viajarán contigo.</div>`;
}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>setView(b.dataset.v));
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
render();
