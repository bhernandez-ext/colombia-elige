const APP_CONFIG = window.ColombiaEligeConfig || {};
const MULTI_READY = Boolean(window.supabase && APP_CONFIG.supabaseUrl && APP_CONFIG.supabaseAnonKey);
const GEOJSON_URL = 'https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd5b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json';
const sb = MULTI_READY ? window.supabase.createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseAnonKey) : null;
const PORTRAITS = {};
const MULTI_SAFE_EVENT_TYPES = new Set(['descuento','descuento_fijo','bonus_candidato_afin','valor_doble','descuento_fijo_depts','costo_mixto','bonus_territorio','valor_boost']);
const customState = { respuestas: [], preguntaActual: 0, candidato: null, perfil: null };

async function loadPortraits() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const names = ['cepeda', 'abelardo', 'paloma', 'fajardo', 'claudia'];
      const pw = img.width / names.length;
      names.forEach((name, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = 260;
        canvas.height = 340;
        const ctx = canvas.getContext('2d');
        const insetX = Math.max(6, Math.round(pw * 0.025));
        const insetY = Math.max(8, Math.round(img.height * 0.02));
        ctx.drawImage(
          img,
          index * pw + insetX,
          insetY,
          pw - insetX * 2,
          img.height - insetY * 2,
          0,
          0,
          canvas.width,
          canvas.height
        );
        PORTRAITS[name] = canvas.toDataURL('image/jpeg', 0.9);
      });
      resolve();
    };
    img.onerror = () => resolve();
    img.src = './assets/candidates-source.png';
  });
}

// ═══════════════════════════════════════════════════
const TOTAL_VOTES = 21500000;
function fmtV(pct){const v=pct*TOTAL_VOTES/100;return v>=1e6?(v/1e6).toFixed(2)+'M':(v/1e3).toFixed(0)+'K';}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function firstLetter(name){return (name||'?').trim().charAt(0).toUpperCase()||'?';}
function hashString(str){
  let h=2166136261;
  for(let i=0;i<str.length;i++){
    h^=str.charCodeAt(i);
    h=Math.imul(h,16777619);
  }
  return h>>>0;
}
function portraitFor(id){
  if(PORTRAITS[id])return PORTRAITS[id];
  const cand=CANDS[id]||{short:'?',color:'#7A849C'};
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${cand.color}"/><stop offset="100%" stop-color="#1A2038"/></linearGradient></defs><rect width="120" height="120" rx="18" fill="#EEF2FB"/><circle cx="60" cy="60" r="34" fill="url(#g)"/><text x="60" y="70" text-anchor="middle" font-family="Barlow Condensed, Arial, sans-serif" font-size="36" font-weight="700" fill="#fff">${firstLetter(cand.short)}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function ideologicDistance(profileA,profileB){
  return Math.abs(profileA.e-profileB.e)+Math.abs(profileA.s-profileB.s)+Math.abs(profileA.c-profileB.c)+Math.abs(profileA.v-profileB.v)+Math.abs(profileA.t-profileB.t);
}

function isNeutralLockedGroup(groupId){
  return GP[groupId]?.special==='voto_blanco';
}

function getClosestGroups(candidate,limit=3){
  return Object.entries(GP)
    .filter(([id])=>!isNeutralLockedGroup(id))
    .map(([id,group])=>({id,group,dist:ideologicDistance(candidate.p,group.p)}))
    .sort((a,b)=>a.dist-b.dist||a.group.n.localeCompare(b.group.n,'es'))
    .slice(0,limit);
}

function getAxisDescriptors(candidate){
  const axes=[
    {key:'e',labelNeg:'transición energética',labelPos:'extractivismo'},
    {key:'s',labelNeg:'negociación y paz',labelPos:'seguridad dura'},
    {key:'c',labelNeg:'reforma rural',labelPos:'propiedad y orden territorial'},
    {key:'v',labelNeg:'apertura en valores',labelPos:'conservadurismo en valores'},
    {key:'t',labelNeg:'Estado activo',labelPos:'mercado y austeridad'},
  ];
  return axes
    .map(axis=>({ ...axis, value:candidate.p[axis.key], strength:Math.abs(candidate.p[axis.key]) }))
    .sort((a,b)=>b.strength-a.strength)
    .filter(axis=>axis.strength>0);
}

function buildCandidateSummary(candidate){
  const topAxes=getAxisDescriptors(candidate);
  const closestGroups=getClosestGroups(candidate,3);
  const line1=topAxes.length
    ? `Perfil: ${topAxes.slice(0,2).map(axis=>axis.value<0?axis.labelNeg:axis.labelPos).join(' · ')}`
    : 'Perfil: centro pragmático en los cinco ejes.';
  const line2=closestGroups.length
    ? `Grupos cercanos: ${closestGroups.slice(0,2).map(item=>item.group.n).join(', ')}`
    : 'Grupos cercanos: afinidad amplia y repartida.';
  const line3=closestGroups.length>2
    ? `También conecta con ${closestGroups[2].group.n.toLowerCase()}.`
    : 'También puede tender puentes con sectores moderados.';
  return [line1,line2,line3];
}

const totalRaw=DRAW.reduce((s,d)=>s+d.w,0);
const DEPTS={};
DRAW.forEach(d=>{DEPTS[d.id]={...d,weight:d.w/totalRaw*100,groups:d.g.map(g=>({...g,owner:null,reinforced:false,pending:false}))};});

const gs={
  round:1,turn:1,maxTurns:10,timeLeft:120,timerInt:null,
  pId:null,activeIds:[],eliminatedIds:[],
  pCP:20,pCR:100,aiCP:{},
  selDept:null,isPlayerTurn:false,
  elimToProcess:[],r2top2:null,
  mode:'single',setupMode:'single',
  roomCode:'',pendingJoinCode:'',
  gameId:null,playerId:null,realtimeChannel:null,
  boardStarted:false,turnActions:[],
  multiPlayers:[],lastResolvedTurn:0,
  boosts:{},sondeoUsados:[],eventosUsados:[],eventThisTurn:null,coaliciones:[],
  _sondeoCallback:null,_coaliCallback:null,
  focusId:null,activityFeed:[],
  isHost:false,aiSlots:new Set(),
};

const undoStack=[];
let svgSel,pathGen;
let lobbyPollInt=null;
let turnWaitPollInt=null;
const coordCache={};

function el(id){return document.getElementById(id);}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}

function normKey(s){return s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z\s]/g,'').replace(/\s+/g,' ').trim();}
function geoMatch(name){
  const n=normKey(name);
  if(n.includes('NORTE')&&n.includes('SANTANDER'))return 'nortesder';
  if(n.includes('BOGOTA'))return 'bogota';
  if(n.includes('ANDRES')||n.includes('ARCHIPIELAGO'))return 'sanandres';
  const M={ANTIOQUIA:'antioquia',VALLE:'valle',CUNDINAMARCA:'cundinamarca',ATLANTICO:'atlantico',BOLIVAR:'bolivar',SANTANDER:'santander',CORDOBA:'cordoba',NARINO:'narino',TOLIMA:'tolima',BOYACA:'boyaca',CAUCA:'cauca',HUILA:'huila',META:'meta',MAGDALENA:'magdalena',RISARALDA:'risaralda',CESAR:'cesar',CALDAS:'caldas',SUCRE:'sucre',GUAJIRA:'guajira',QUINDIO:'quindio',CHOCO:'choco',PUTUMAYO:'putumayo',CAQUETA:'caqueta',CASANARE:'casanare',ARAUCA:'arauca',AMAZONAS:'amazonas',GUAINIA:'guainia',VAUPES:'vaupes',VICHADA:'vichada',GUAVIARE:'guaviare'};
  for(const [k,v] of Object.entries(M))if(n.includes(k))return v;
  return null;
}

function resetDeptState(){
  Object.values(DEPTS).forEach(dept=>{
    dept.groups=dept.g.map(g=>({...g,owner:null,reinforced:false,pending:false}));
  });
}

function resetCampaignExtras(){
  gs.boosts={};
  gs.sondeoUsados=[];
  gs.eventosUsados=[];
  gs.eventThisTurn=null;
  gs.coaliciones=[];
  gs._sondeoCallback=null;
  gs._coaliCallback=null;
  gs.activityFeed=[];
}

function getSharedTurnSeed(kind){
  return `${gs.gameId||gs.roomCode||'local'}:${kind}:r${gs.round}:t${gs.turn}`;
}

function getMultiplayerSondeo(){
  return SONDEOS[hashString(getSharedTurnSeed('poll'))%SONDEOS.length];
}

function getMultiplayerEvento(){
  const pool=EVENTOS.filter(evento=>MULTI_SAFE_EVENT_TYPES.has(evento.tipo));
  const hash=hashString(getSharedTurnSeed('event'));
  if((hash%10)>=4)return null;
  return pool[hash%pool.length];
}

function clearTimers(){
  clearInterval(gs.timerInt);
  gs.timerInt=null;
}

function startTurnTimer(){
  clearTimers();
  const t=el('tring');
  t.textContent=gs.timeLeft;
  t.classList.toggle('hot',gs.timeLeft<=20);
  gs.timerInt=setInterval(()=>{
    gs.timeLeft--;
    t.textContent=gs.timeLeft;
    t.classList.toggle('hot',gs.timeLeft<=20);
    if(gs.timeLeft<=0)endPlayerTurn();
  },1000);
}

function clearUndo(){
  undoStack.length=0;
  el('undobtn').disabled=true;
}

function resetTurnActions(){
  gs.turnActions=[];
}

function queueTurnAction(action){
  if(gs.mode!=='multi')return;
  gs.turnActions.push(action);
}

function saveState(){
  const snap={pCP:gs.pCP,pCR:gs.pCR,groups:{},turnActions:gs.turnActions.map(action=>({...action}))};
  Object.entries(DEPTS).forEach(([id,dept])=>{snap.groups[id]=dept.groups.map(g=>({...g}));});
  undoStack.push(snap);
  el('undobtn').disabled=false;
}

function undoAction(){
  if(!gs.isPlayerTurn||!undoStack.length)return;
  const prev=undoStack.pop();
  gs.pCP=prev.pCP;
  gs.pCR=prev.pCR;
  gs.turnActions=prev.turnActions.map(action=>({...action}));
  Object.entries(prev.groups).forEach(([id,groups])=>{DEPTS[id].groups=groups.map(g=>({...g}));});
  if(!undoStack.length)el('undobtn').disabled=true;
  updateUI();
  updateMap();
  if(gs.selDept)renderPanel(gs.selDept);
  const n=el('undo-notice');
  n.classList.add('vis');
  setTimeout(()=>n.classList.remove('vis'),2000);
}

function isMultiMode(){
  return gs.mode==='multi';
}

function hasHumanTurn(){
  return gs.activeIds.includes(gs.pId);
}

function candidateIdsForBoard(){
  return isMultiMode()&&gs.activeIds.length?gs.activeIds:Object.keys(CANDS);
}

function trackActivity(candidateId,text){
  if(!candidateId)return;
  gs.activityFeed.unshift({candidateId,text,turn:gs.turn,round:gs.round});
  if(gs.activityFeed.length>80)gs.activityFeed.length=80;
}

function setFocusCandidate(candidateId){
  gs.focusId=candidateId;
  document.querySelectorAll('.rank-row').forEach(row=>row.classList.toggle('focus',row.dataset.id===candidateId));
  document.querySelectorAll('.cand-chip').forEach(row=>row.classList.toggle('focus',row.dataset.id===candidateId));
  renderFocusCard();
}

function countCandidateGroups(candidateId){
  let groups=0;
  let reinforced=0;
  let deptsLed=0;
  Object.values(DEPTS).forEach(dept=>{
    let deptOwned=0;
    let deptTop=0;
    let deptLeader=null;
    dept.groups.forEach(g=>{
      if(g.owner===candidateId){
        groups++;
        deptOwned+=g.w;
        if(g.reinforced)reinforced++;
      }
      if(g.owner){
        const weight=dept.groups.filter(x=>x.owner===g.owner).reduce((sum,x)=>sum+x.w,0);
        if(weight>deptTop){
          deptTop=weight;
          deptLeader=g.owner;
        }
      }
    });
    if(deptLeader===candidateId&&deptOwned>0)deptsLed++;
  });
  return {groups,reinforced,deptsLed};
}

function getPartyNetworkSummary(candidateId){
  const keys=['p_liberal','p_conservador','cambio_radical','p_u','alianza_verde'];
  return keys.map(key=>{
    let owned=0;
    Object.values(DEPTS).forEach(dept=>dept.groups.forEach(g=>{if(g.id===key&&g.owner===candidateId)owned++;}));
    return `${GP[key].n.replace('Partido ','').replace('Alianza ','')}: ${owned}`;
  }).join(' · ');
}

function renderCandidateStrip(){
  const box=el('candidateStrip');
  if(!box)return;
  box.innerHTML='';
  candidateIdsForBoard().forEach(id=>{
    const c=CANDS[id];
    const lines=buildCandidateSummary(c);
    const chip=document.createElement('button');
    chip.className=`cand-chip ${gs.focusId===id?'focus':''}`;
    chip.dataset.id=id;
    chip.style.setProperty('--cand-color',c.color);
    chip.innerHTML=`
      <span class="cand-chip-avatar"><img src="${portraitFor(id)}" alt="${c.short}"></span>
      <span class="cand-chip-main">
        <span class="cand-chip-name">${c.short}</span>
        <span class="cand-chip-party">${lines[1]}</span>
      </span>
      <span class="cand-chip-pct">${getPct(id).toFixed(1)}%</span>`;
    chip.onclick=()=>setFocusCandidate(id);
    box.appendChild(chip);
  });
}

function renderFocusCard(){
  const box=el('focusCard');
  if(!box)return;
  const focusId=gs.focusId&&CANDS[gs.focusId]?gs.focusId:(gs.pId||candidateIdsForBoard()[0]);
  if(!focusId){box.innerHTML='';return;}
  gs.focusId=focusId;
  const c=CANDS[focusId];
  const stats=countCandidateGroups(focusId);
  const cp=focusId===gs.pId?gs.pCP:(gs.aiCP[focusId]??'—');
  const cr=focusId===gs.pId?gs.pCR:'—';
  const boost=gs.boosts[focusId]||0;
  const acts=gs.activityFeed.filter(item=>item.candidateId===focusId).slice(0,4);
  box.innerHTML=`
    <div class="focus-card" style="--focus-color:${c.color}">
      <div class="focus-head">
        <div class="focus-avatar"><img src="${portraitFor(focusId)}" alt="${c.short}"></div>
        <div>
          <div class="focus-name">${c.n}</div>
          <div class="focus-party">${buildCandidateSummary(c)[0]}</div>
        </div>
      </div>
      <div class="focus-metrics">
        <div class="focus-metric"><span>Voto</span><strong>${getPct(focusId).toFixed(1)}%</strong></div>
        <div class="focus-metric"><span>CP</span><strong>${cp}</strong></div>
        <div class="focus-metric"><span>Impulso</span><strong>${boost>0?'+':''}${boost.toFixed(1)}%</strong></div>
        <div class="focus-metric"><span>CR</span><strong>${cr}</strong></div>
      </div>
      <div class="focus-line">Grupos: <b>${stats.groups}</b> · Reforzados: <b>${stats.reinforced}</b> · Departamentos liderados: <b>${stats.deptsLed}</b></div>
      <div class="focus-line">Partidos: ${getPartyNetworkSummary(focusId)}</div>
      <div class="focus-log">
        ${acts.length?acts.map(item=>`<div class="focus-log-item">T${item.turn}: ${item.text}</div>`).join(''):'<div class="focus-log-empty">Sin movimientos visibles todavía.</div>'}
      </div>
    </div>`;
}

function updateModeUI(){
  el('modepill').textContent=isMultiMode()?'Sala 1v1':'1 vs IA';
  el('roomchip').classList.toggle('on',isMultiMode()&&Boolean(gs.roomCode));
  el('roomcodeview').textContent=gs.roomCode||'------';
}

function setupPlayerCard(){
  const pc=CANDS[gs.pId];
  el('pcard').style.borderColor=pc.color+'44';
  el('pname').textContent=pc.n;
  el('pname').style.color=pc.color;
  el('pparty').textContent=pc.party;
  el('pavatar').style.borderColor=pc.color;
  el('pimg').src=portraitFor(gs.pId);
  el('pcp').style.color=pc.color;
}

function showBoard(){
  el('home').style.display='none';
  el('setup').classList.remove('on');
  el('game').classList.add('on');
  gs.focusId=gs.pId;
  setupPlayerCard();
  updateModeUI();
  buildRankings();
  renderCandidateStrip();
  renderFocusCard();
  buildVoteBar();
  if(!svgSel)loadMap();
  else updateMap();
  updateUI();
}

function initHome(){
  if(!MULTI_READY){
    ['homeMultiBtn','homeMultiBtnMobile','homeMultiBtnDesk'].forEach(id=>{
      const node=el(id);
      if(!node)return;
      node.disabled=true;
      node.style.opacity='.55';
      node.style.cursor='not-allowed';
    });
    el('multiStatusText').textContent='Activa tu URL y anon key de Supabase en js/config.js para abrir salas en tiempo real.';
  }
}

function goHome(){
  clearTimers();
  stopLobbyPoll();
  stopTurnWaitPoll();
  hideWaitModal();
  closeMultiModal();
  closeLobbyModal();
  ['sondeomodal','coalimodal','custommodal','howmodal','r2modal','vmodal','homemodal'].forEach(id=>el(id)?.classList.remove('on'));
  el('game').classList.remove('on');
  el('setup').classList.remove('on');
  el('home').style.display='flex';
  if(gs.realtimeChannel){gs.realtimeChannel.unsubscribe();gs.realtimeChannel=null;}
  gs.gameId=null;gs.playerId=null;gs.roomCode='';gs.isHost=false;
  gs.boardStarted=false;gs.aiSlots=new Set();gs.multiPlayers=[];
}

function goSetup(mode='single'){
  gs.setupMode=mode;
  closeMultiModal();
  buildSetup();
  el('home').style.display='none';
  el('setup').classList.add('on');
  updateSetupMode();
}

function updateSetupMode(){
  const label=el('setupModeLabel');
  const hint=el('setupRoomHint');
  const sub=el('setupSub');
  const start=el('sbtn');
  start.disabled=!gs.pId;
  if(gs.setupMode==='multi-create'){
    label.textContent='Crear sala';
    hint.textContent='Elige tu candidato para generar el codigo.';
    sub.textContent='Crearas una sala 1v1. Cuando el segundo jugador entre, ambos veran el mismo tablero y enviaran sus turnos en simultaneo.';
    start.textContent='Crear sala';
  }else if(gs.setupMode==='multi-join'){
    label.textContent='Unirse a sala';
    hint.textContent=`Codigo ${gs.pendingJoinCode||'------'}`;
    sub.textContent='Vas a entrar a una sala ya existente. Elige un candidato libre y espera a que la partida quede activa.';
    start.textContent='Unirse a sala';
  }else{
    label.textContent='1 vs IA';
    hint.textContent='Campana clasica con segunda vuelta.';
    sub.textContent='Activa grupos de interes en los 33 departamentos, administra capital politico y empuja a tu candidato hasta el 50%+1.';
    start.textContent='Iniciar campana';
  }
  if(gs.pId&&CANDS[gs.pId]){
    start.classList.add('ready');
    start.style.background=CANDS[gs.pId].color;
  }else{
    start.classList.remove('ready');
    start.style.background='';
  }
}

function renderCandidatePhoto(c){
  if(PORTRAITS[c.id]){
    return `<div class="cand-photo"><img src="${portraitFor(c.id)}" alt="${c.n}"></div>`;
  }
  return `<div class="cand-photo placeholder"><div class="cand-photo-initial" style="background:${c.color}">${firstLetter(c.short)}</div></div>`;
}

function renderCandidateSummary(candidate){
  const lines=buildCandidateSummary(candidate);
  return `<div class="cand-summary">${lines.map(line=>`<div class="cand-summary-line">${line}</div>`).join('')}</div>`;
}

function resetSetupSelection(){
  gs.pId=null;
  const start=el('sbtn');
  start.classList.remove('ready');
  start.disabled=true;
  start.style.background='';
  document.querySelectorAll('.cand-card').forEach(node=>node.classList.remove('selected'));
}

function selectCandidate(candidateId){
  const cand=CANDS[candidateId];
  if(!cand)return;
  gs.pId=candidateId;
  document.querySelectorAll('.cand-card').forEach(node=>node.classList.toggle('selected',node.dataset.id===candidateId));
  const start=el('sbtn');
  start.disabled=false;
  start.classList.add('ready');
  start.style.background=cand.color;
}

function buildSetup(){
  const grid=el('cgrid');
  grid.innerHTML='';
  Object.values(CANDS).forEach(c=>{
    const card=document.createElement('button');
    card.type='button';
    card.className='cand-card';
    card.dataset.id=c.id;
    card.style.borderColor=c.color+'66';
    card.innerHTML=`
      ${renderCandidatePhoto(c)}
      <div class="cand-color-bar" style="background:${c.color}"></div>
      <div class="cand-body">
        <div class="cand-name">${c.n}</div>
        ${renderCandidateSummary(c)}
      </div>
      <div class="sel-check" style="color:${c.color}">✓</div>`;
    card.onclick=()=>selectCandidate(c.id);
    grid.appendChild(card);
  });
  const customCard=document.createElement('button');
  customCard.type='button';
  customCard.className='cand-card custom-cand-card';
  customCard.innerHTML=`
    <div class="cand-photo custom-photo">
      <div class="custom-photo-icon">✦</div>
    </div>
    <div class="cand-color-bar" style="background:linear-gradient(90deg,#CC2222,#1B4DC0,#2C7A4B)"></div>
    <div class="cand-body">
      <div class="cand-name">Crea tu candidato</div>
      <div class="cand-summary">
        <div class="cand-summary-line">Responde el cuestionario ideológico.</div>
        <div class="cand-summary-line">Te sugerimos ejes, grupos cercanos y color.</div>
        <div class="cand-summary-line">Luego lo usas como candidato jugable.</div>
      </div>
    </div>`;
  customCard.onclick=()=>abrirCustomCandidato();
  grid.appendChild(customCard);
  resetSetupSelection();
  updateSetupMode();
}

function calcularPerfil(respuestas){
  const ejes={e:0,s:0,c:0,v:0,t:0};
  const pesos={e:0,s:0,c:0,v:0,t:0};
  respuestas.forEach((respuesta,index)=>{
    const preg=PREGUNTAS_PERFIL[index];
    if(!preg)return;
    if(preg.eje==='mixed'){
      const delta=respuesta.v==='left'?-1:respuesta.v==='right'?1:0;
      ['e','s','c','v','t'].forEach(eje=>{
        ejes[eje]+=delta*0.3;
        pesos[eje]+=0.3;
      });
      return;
    }
    ejes[preg.eje]+=respuesta.v*preg.peso;
    pesos[preg.eje]+=preg.peso;
  });
  const perfil={};
  ['e','s','c','v','t'].forEach(eje=>{
    const raw=pesos[eje]>0?ejes[eje]/pesos[eje]:0;
    perfil[eje]=clamp(Math.round(raw),-2,2);
  });
  return perfil;
}

function generarDiagnostico(perfil,promedio){
  const espectro=promedio<-1?'izquierda':promedio<-0.3?'centroizquierda':promedio<0.3?'centro':promedio<1?'centroderecha':'derecha';
  const rasgos=[];
  if(perfil.e<=-1)rasgos.push('ambientalista');
  if(perfil.e>=1)rasgos.push('pro-extractivismo');
  if(perfil.s<=-1)rasgos.push('dialoguero');
  if(perfil.s>=1)rasgos.push('mano dura');
  if(perfil.v<=-1)rasgos.push('progresista en valores');
  if(perfil.v>=1)rasgos.push('conservador en valores');
  if(perfil.t<=-1)rasgos.push('estatista');
  if(perfil.t>=1)rasgos.push('liberal en economía');
  const rasgoStr=rasgos.length?` con tendencias ${rasgos.slice(0,2).join(' y ')}`:'';
  return `Tu candidato tiene perfil de ${espectro}${rasgoStr}.`;
}

function generarCandidatoCustom(nombre,perfil){
  const promedio=(perfil.e+perfil.s+perfil.c+perfil.v+perfil.t)/5;
  const color=promedio<-0.8?'#8B3A8B':promedio<-0.3?'#CC2222':promedio<0.3?'#2C7A4B':promedio<0.8?'#1B4DC0':'#D4600A';
  return {
    id:'custom',
    n:nombre||'Tu Candidato',
    short:nombre?nombre.split(' ')[0]:'Tú',
    party:'Movimiento Ciudadano',
    color,
    p:perfil,
    isCustom:true,
    diagnostico:generarDiagnostico(perfil,promedio),
  };
}

function renderRadarChart(perfil,containerId){
  const container=el(containerId);
  const size=160,cx=80,cy=80,r=58;
  const ejes=['e','s','c','v','t'];
  const labels=['Extractiv.','Seguridad','Campo','Valores','Estado'];
  const angles=ejes.map((_,i)=>(i/ejes.length)*2*Math.PI-Math.PI/2);
  const valToR=v=>((v+2)/4)*r;
  const puntos=ejes.map((eje,i)=>({
    x:cx+valToR(perfil[eje])*Math.cos(angles[i]),
    y:cy+valToR(perfil[eje])*Math.sin(angles[i]),
  }));
  const polyPoints=puntos.map(p=>`${p.x},${p.y}`).join(' ');
  let gridLines='';
  [-2,-1,0,1,2].forEach(nivel=>{
    const pts=angles.map(a=>{
      const rad=valToR(nivel);
      return `${cx+rad*Math.cos(a)},${cy+rad*Math.sin(a)}`;
    }).join(' ');
    gridLines+=`<polygon points="${pts}" fill="none" stroke="#D8DCE8" stroke-width="${nivel===0?1.5:0.8}"/>`;
  });
  const axisLines=angles.map(a=>`<line x1="${cx}" y1="${cy}" x2="${cx+r*Math.cos(a)}" y2="${cy+r*Math.sin(a)}" stroke="#D8DCE8" stroke-width="0.8"/>`).join('');
  const labelEls=ejes.map((eje,i)=>{
    const lx=cx+(r+14)*Math.cos(angles[i]);
    const ly=cy+(r+14)*Math.sin(angles[i]);
    return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#5A6080" font-family="Barlow Condensed">${labels[i]}</text>`;
  }).join('');
  container.innerHTML=`
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      ${gridLines}${axisLines}
      <polygon points="${polyPoints}" fill="rgba(27,77,192,.2)" stroke="#1B4DC0" stroke-width="2"></polygon>
      ${puntos.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="3" fill="#1B4DC0"></circle>`).join('')}
      ${labelEls}
    </svg>`;
}

function abrirCustomCandidato(){
  customState.respuestas=[];
  customState.preguntaActual=0;
  customState.candidato=null;
  customState.perfil=null;
  el('customNombre').value='';
  el('custommodal').classList.add('on');
  mostrarPreguntaCustom(0);
}

function mostrarPreguntaCustom(idx){
  const preg=PREGUNTAS_PERFIL[idx];
  const total=PREGUNTAS_PERFIL.length;
  customState.preguntaActual=idx;
  el('customProgress').style.width=`${(idx/total)*100}%`;
  el('customStep').textContent=`${idx+1} de ${total}`;
  el('customPregunta').textContent=preg.q;
  const optsEl=el('customOpciones');
  optsEl.innerHTML='';
  preg.opts.forEach(op=>{
    const btn=document.createElement('button');
    btn.className='sondeo-opcion';
    btn.textContent=op.t;
    btn.onclick=()=>{
      customState.respuestas.push(op);
      if(idx+1<total)mostrarPreguntaCustom(idx+1);
      else mostrarResultadoCustom();
    };
    optsEl.appendChild(btn);
  });
  el('customStepper').style.display='block';
  el('customResultado').style.display='none';
}

function mostrarResultadoCustom(){
  const perfil=calcularPerfil(customState.respuestas);
  const candidatoTemp=generarCandidatoCustom('',perfil);
  customState.perfil=perfil;
  customState.candidato=candidatoTemp;
  el('customStepper').style.display='none';
  el('customResultado').style.display='block';
  el('customDiagnostico').textContent=candidatoTemp.diagnostico;
  el('customColorSwatch').style.background=candidatoTemp.color;
  renderRadarChart(perfil,'customRadar');
}

function confirmarCandidatoCustom(){
  if(!customState.perfil)return;
  const nombre=el('customNombre').value.trim()||'Tu Candidato';
  const candidato=generarCandidatoCustom(nombre,customState.perfil);
  CANDS.custom=candidato;
  PORTRAITS.custom='';
  el('custommodal').classList.remove('on');
  buildSetup();
  selectCandidate('custom');
}

function openMultiModal(){
  el('multimodal').classList.add('on');
}

function closeMultiModal(){
  el('multimodal').classList.remove('on');
}

function prepareCreateRoom(){
  if(!MULTI_READY){
    el('multiStatusText').textContent='Configura Supabase en js/config.js para usar salas.';
    return;
  }
  goSetup('multi-create');
}

function prepareJoinRoom(){
  if(!MULTI_READY){
    el('multiStatusText').textContent='Configura Supabase en js/config.js para usar salas.';
    return;
  }
  const code=el('joinCodeInput').value.trim().toUpperCase();
  if(code.length!==6){
    el('multiStatusText').textContent='Ingresa un codigo de seis caracteres.';
    return;
  }
  gs.pendingJoinCode=code;
  goSetup('multi-join');
}

function startTurnWaitPoll(){
  stopTurnWaitPoll();
  let ticks=0;
  turnWaitPollInt=setInterval(async()=>{
    if(!gs.gameId||gs.isPlayerTurn)return;
    const gameRes=await sb.from('games').select('turn,status').eq('id',gs.gameId).single();
    if(!gameRes.data||gameRes.data.status!=='active')return;
    if(gameRes.data.turn!==gs.turn){
      stopTurnWaitPoll();
      await onGameUpdate(gameRes.data);
      return;
    }
    ticks++;
    if(ticks%5===0){
      fetch(`${APP_CONFIG.supabaseUrl}/functions/v1/resolve-turn`,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${APP_CONFIG.supabaseAnonKey}`},
        body:JSON.stringify({game_id:gs.gameId}),
      }).catch(()=>{});
    }
  },2000);
}

function stopTurnWaitPoll(){
  if(turnWaitPollInt){clearInterval(turnWaitPollInt);turnWaitPollInt=null;}
}

function startLobbyPoll(){
  stopLobbyPoll();
  lobbyPollInt=setInterval(async()=>{
    if(!gs.gameId)return;
    await refreshMultiplayerPlayers();
    updateLobbyUI();
    if(!gs.boardStarted){
      const gameRes=await sb.from('games').select('status,turn').eq('id',gs.gameId).single();
      if(gameRes.data?.status==='active'){
        await bootstrapMultiplayerBoard();
      }
    }
  },2000);
}

function stopLobbyPoll(){
  if(lobbyPollInt){clearInterval(lobbyPollInt);lobbyPollInt=null;}
}

function updateLobbyUI(){
  const list=el('lobbyPlayerList');
  if(list){
    const humans=gs.multiPlayers.filter(p=>p.is_human!==false);
    list.innerHTML=humans.map(p=>{
      const c=CANDS[p.candidate_id]||{n:p.candidate_id,color:'#7A849C'};
      return `<div class="lobby-player-row"><span class="lobby-dot" style="background:${c.color}"></span>${c.n}</div>`;
    }).join('');
  }
  const startBtn=el('lobbyStartBtn');
  if(startBtn){
    const humans=gs.multiPlayers.filter(p=>p.is_human!==false);
    startBtn.style.display=gs.isHost?'block':'none';
    startBtn.disabled=humans.length<2;
    startBtn.textContent=`Iniciar partida (${humans.length} jugador${humans.length!==1?'es':''})`;
  }
}

function openLobbyModal(message){
  el('lobbyStatus').textContent=message;
  el('lobbyCode').textContent=gs.roomCode||'------';
  el('lobbymodal').classList.add('on');
  updateLobbyUI();
  startLobbyPoll();
}

function closeLobbyModal(){
  el('lobbymodal').classList.remove('on');
  stopLobbyPoll();
}

function showWaitModal(message){
  el('waitStatus').textContent=message;
  el('waitmodal').classList.add('on');
}

function hideWaitModal(){
  el('waitmodal').classList.remove('on');
}

async function copyRoomCode(){
  if(!gs.roomCode)return;
  if(navigator.clipboard&&navigator.clipboard.writeText){
    await navigator.clipboard.writeText(gs.roomCode);
    el('lobbyStatus').textContent='Codigo copiado. Ya puedes compartirlo.';
  }
}

async function startGame(){
  if(!gs.pId)return;
  const start=el('sbtn');
  start.disabled=true;
  try{
    if(gs.setupMode==='single'){
      startSinglePlayerGame();
    }else{
      await startMultiplayerFlow();
    }
  }catch(error){
    const msg=error?.message||'No pudimos iniciar la partida.';
    const sub=el('setupSub');
    if(sub){sub.textContent='⚠ '+msg;sub.style.color='var(--red)';sub.style.fontWeight='600';}
    const hint=el('setupRoomHint');
    if(hint){hint.textContent=msg;hint.style.background='rgba(204,34,34,.12)';hint.style.color='var(--red)';}
  }finally{
    start.disabled=false;
  }
}

function startSinglePlayerGame(){
  resetDeptState();
  clearUndo();
  resetTurnActions();
  resetCampaignExtras();
  gs.mode='single';
  gs.boardStarted=true;
  gs.round=1;
  gs.turn=1;
  gs.maxTurns=10;
  gs.pCP=20;
  gs.pCR=100;
  gs.roomCode='';
  gs.activeIds=Object.keys(CANDS);
  gs.eliminatedIds=[];
  gs.aiCP={};
  gs.activeIds.forEach(id=>{gs.aiCP[id]=20;});
  showBoard();
  beginPlayerTurn();
}

async function startMultiplayerFlow(){
  if(!MULTI_READY)throw new Error('Supabase no esta configurado.');
  gs.mode='multi';
  resetDeptState();
  clearUndo();
  resetTurnActions();
  resetCampaignExtras();
  gs.boardStarted=false;
  gs.turn=1;
  gs.maxTurns=10;
  gs.round=1;
  gs.eliminatedIds=[];
  gs.pCP=20;
  gs.pCR=100;
  if(gs.setupMode==='multi-create'){
    gs.roomCode=await createGame(gs.pId);
    openLobbyModal('Comparte este codigo y espera a que se una el segundo jugador.');
  }else{
    await joinGame(gs.pendingJoinCode,gs.pId);
    openLobbyModal('Entraste a la sala. Si ya son dos jugadores, la partida arrancara enseguida.');
  }
}

function getToken(){
  let t=localStorage.getItem('ce_token');
  if(!t){
    t=crypto.randomUUID();
    localStorage.setItem('ce_token',t);
  }
  return t;
}

async function createGame(candidateId){
  let game=null;
  for(let attempt=0;attempt<5;attempt++){
    const code=Math.random().toString(36).slice(2,8).toUpperCase();
    const inserted=await sb.from('games').insert({code,max_turns:10,max_players:4,host_token:getToken()}).select().single();
    if(!inserted.error){
      game=inserted.data;
      gs.roomCode=code;
      break;
    }
  }
  if(!game)throw new Error('No pudimos crear la sala.');
  gs.gameId=game.id;
  gs.isHost=true;
  const playerRes=await sb.from('players').insert({
    game_id:gs.gameId,
    candidate_id:candidateId,
    user_token:getToken(),
    cp:20,
    cr:100,
  }).select().single();
  if(playerRes.error)throw playerRes.error;
  gs.playerId=playerRes.data.id;
  subscribeToGame();
  await refreshMultiplayerPlayers();
  return gs.roomCode;
}

async function joinGame(code,candidateId){
  const gameRes=await sb.from('games').select('*').eq('code',code).single();
  if(gameRes.error||!gameRes.data)throw new Error('No encontramos una sala con ese codigo.');
  const game=gameRes.data;
  if(game.status==='active')throw new Error('La partida ya empezó.');
  gs.gameId=game.id;
  gs.roomCode=code;
  gs.isHost=game.host_token===getToken();
  const playersRes=await sb.from('players').select('*').eq('game_id',gs.gameId).eq('is_human',true);
  if(playersRes.error)throw playersRes.error;
  const players=playersRes.data||[];
  if(players.length>=game.max_players)throw new Error('La sala ya esta llena.');
  if(players.some(player=>player.candidate_id===candidateId))throw new Error('Ese candidato ya esta ocupado en la sala.');
  const playerRes=await sb.from('players').insert({
    game_id:gs.gameId,
    candidate_id:candidateId,
    user_token:getToken(),
    cp:20,
    cr:100,
  }).select().single();
  if(playerRes.error)throw playerRes.error;
  gs.playerId=playerRes.data.id;
  subscribeToGame();
  await refreshMultiplayerPlayers();
}

function subscribeToGame(){
  if(gs.realtimeChannel)return;
  gs.realtimeChannel=sb.channel(`game:${gs.gameId}`)
    .on('postgres_changes',{event:'*',schema:'public',table:'game_groups',filter:`game_id=eq.${gs.gameId}`},async()=>{await syncGroups();})
    .on('postgres_changes',{event:'*',schema:'public',table:'games',filter:`id=eq.${gs.gameId}`},async payload=>{await onGameUpdate(payload.new);})
    .on('postgres_changes',{event:'*',schema:'public',table:'players',filter:`game_id=eq.${gs.gameId}`},async()=>{await onPlayersChanged();})
    .subscribe();
}

async function refreshMultiplayerPlayers(){
  if(!gs.gameId)return [];
  const playersRes=await sb.from('players').select('*').eq('game_id',gs.gameId);
  if(playersRes.error)throw playersRes.error;
  gs.multiPlayers=playersRes.data||[];
  gs.activeIds=gs.multiPlayers.map(player=>player.candidate_id);
  gs.aiSlots=new Set(gs.multiPlayers.filter(p=>!p.is_human).map(p=>p.candidate_id));
  gs.multiPlayers.forEach(player=>{
    gs.boosts[player.candidate_id]=player.vote_boost||0;
    if(!player.is_human)gs.aiCP[player.candidate_id]=player.cp||20;
  });
  return gs.multiPlayers;
}

async function refreshOwnPlayerResources(){
  if(!gs.playerId)return;
  const playerRes=await sb.from('players').select('*').eq('id',gs.playerId).single();
  if(playerRes.error||!playerRes.data)return;
  gs.pCP=playerRes.data.cp;
  gs.pCR=playerRes.data.cr;
}

async function hostStartGame(){
  const statusEl=el('lobbyStatus');
  const btn=el('lobbyStartBtn');
  if(!gs.gameId){if(statusEl)statusEl.textContent='Error: sala no encontrada. Recarga.';return;}
  if(!gs.isHost){if(statusEl)statusEl.textContent='Solo el host puede iniciar.';return;}
  if(btn){btn.disabled=true;btn.textContent='Iniciando...';}
  try{
    await refreshMultiplayerPlayers();
    const humanIds=new Set(gs.multiPlayers.filter(p=>p.is_human!==false).map(p=>p.candidate_id));
    const aiCandidates=Object.keys(CANDS).filter(id=>id!=='custom'&&!humanIds.has(id));
    if(aiCandidates.length){
      const res=await sb.from('players').insert(
        aiCandidates.map(id=>({game_id:gs.gameId,candidate_id:id,is_human:false,turn_done:true,cp:20,cr:100}))
      );
      if(res.error)throw res.error;
    }
    const res=await sb.from('games').update({status:'active'}).eq('id',gs.gameId);
    if(res.error)throw res.error;
    await bootstrapMultiplayerBoard();
  }catch(err){
    if(btn){btn.disabled=false;btn.textContent='Reintentar';}
    if(statusEl)statusEl.textContent=err?.message||'Error al iniciar. Intenta de nuevo.';
  }
}

async function onPlayersChanged(){
  await refreshMultiplayerPlayers();
  updateLobbyUI();
}

async function bootstrapMultiplayerBoard(){
  if(gs.boardStarted)return;
  gs.boardStarted=true;
  stopLobbyPoll();
  gs.round=1;
  gs.turn=1;
  gs.maxTurns=10;
  gs.eliminatedIds=[];
  await refreshMultiplayerPlayers();
  await refreshOwnPlayerResources();
  showBoard();
  await syncGroups();
  closeLobbyModal();
  const nHumans=gs.multiPlayers.filter(p=>p.is_human).length;
  log(`Sala ${gs.roomCode} activa · ${nHumans} humano${nHumans!==1?'s':''} + ${gs.aiSlots.size} IA. ¡Que empiece la campaña!`,'s');
  beginPlayerTurn();
}

async function onGameUpdate(game){
  if(!game)return;
  if(game.status==='active'&&!gs.boardStarted){
    await bootstrapMultiplayerBoard();
    return;
  }
  if(!gs.boardStarted)return;
  if(game.turn!==gs.turn){
    await syncGroups();
    if(gs.aiSlots.size>0){
      for(const aiId of gs.aiSlots)await runSingleAI(aiId);
      el('aitag').classList.remove('vis');
      updateUI();
    }
    if(game.turn>gs.maxTurns){
      const winner=checkWin()||getLeader();
      showWin(winner,'multi');
      return;
    }
    gs.turn=game.turn;
    await refreshOwnPlayerResources();
    hideWaitModal();
    beginPlayerTurn();
  }
}

async function submitTurn(actionsThisTurn){
  if(actionsThisTurn.length){
    const insertRes=await sb.from('actions').insert(actionsThisTurn.map(action=>({
      game_id:gs.gameId,
      player_id:gs.playerId,
      turn:gs.turn,
      ...action,
    })));
    if(insertRes.error)throw insertRes.error;
  }
  const playerUpdate=await sb.from('players').update({cp:gs.pCP,cr:gs.pCR,vote_boost:gs.boosts[gs.pId]||0,turn_done:true}).eq('id',gs.playerId);
  if(playerUpdate.error)throw playerUpdate.error;
  const fnRes=await fetch(`${APP_CONFIG.supabaseUrl}/functions/v1/resolve-turn`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${APP_CONFIG.supabaseAnonKey}`,
    },
    body:JSON.stringify({game_id:gs.gameId}),
  });
  if(!fnRes.ok)throw new Error('No pudimos resolver el turno de la sala.');
}

async function syncGroups(){
  if(!isMultiMode()||!gs.gameId)return;
  resetDeptState();
  const groupsRes=await sb.from('game_groups').select('*').eq('game_id',gs.gameId);
  if(groupsRes.error)throw groupsRes.error;
  (groupsRes.data||[]).forEach(group=>{
    const dept=DEPTS[group.dept_id];
    if(!dept||!dept.groups[group.group_idx])return;
    dept.groups[group.group_idx].owner=group.owner_cand;
    dept.groups[group.group_idx].reinforced=group.reinforced;
    dept.groups[group.group_idx].pending=false;
  });
  updateUI();
  updateMap();
  if(gs.selDept)renderPanel(gs.selDept);
}

function checkSondeo(){
  const turnosSondeo=gs.round===1?[3,6,9]:[2];
  return turnosSondeo.includes(gs.turn);
}

function getSondeoAleatorio(){
  if(isMultiMode())return getMultiplayerSondeo();
  const disponibles=SONDEOS.filter(sondeo=>!gs.sondeoUsados.includes(sondeo.id));
  const pool=disponibles.length?disponibles:SONDEOS;
  const sondeo=pool[Math.floor(Math.random()*pool.length)];
  gs.sondeoUsados.push(sondeo.id);
  return sondeo;
}

function liberarGrupoDeEje(candidatoId,eje){
  const vulnerables=[];
  Object.values(DEPTS).forEach(dept=>{
    dept.groups.forEach(g=>{
      const gp=GP[g.id];
      if(g.owner===candidatoId&&gp&&Math.abs(gp.p[eje]||0)>=1){
        vulnerables.push({dept,g});
      }
    });
  });
  if(!vulnerables.length)return;
  const target=vulnerables[Math.floor(Math.random()*vulnerables.length)];
  target.g.owner=null;
  target.g.reinforced=false;
  target.g.pending=false;
  log('Un grupo aliado te abandonó por la contradicción.','s');
}

function resolverSondeo(sondeo,valorRespuesta,candidatoId){
  const cand=CANDS[candidatoId];
  const valorCandidato=cand.p[sondeo.eje];
  const delta=Math.abs(valorRespuesta-valorCandidato);
  let cpDelta=0;
  let votosDelta=0;
  let nivel='neutro';
  let mensaje='El electorado permanece indiferente.';
  let penalidad=false;
  if(delta===0){
    cpDelta=8; votosDelta=1.5; nivel='positivo';
    mensaje='Respuesta coherente con tu trayectoria. Los medios lo celebran.';
  }else if(delta===1){
    cpDelta=4; votosDelta=0.5; nivel='positivo';
    mensaje='Respuesta moderadamente consistente con tu perfil.';
  }else if(delta===3){
    cpDelta=-4; votosDelta=-0.8; nivel='negativo';
    mensaje='Respuesta contradictoria con tu trayectoria. Críticas en redes sociales.';
  }else if(delta>=4){
    cpDelta=-8; votosDelta=-1.5; nivel='grave'; penalidad=true;
    mensaje='Contradicción grave. Un grupo aliado te cuestiona públicamente.';
  }
  gs.pCP=clamp(gs.pCP+cpDelta,0,70);
  gs.boosts[candidatoId]=clamp((gs.boosts[candidatoId]||0)+votosDelta,-8,8);
  if(penalidad&&!isMultiMode())liberarGrupoDeEje(candidatoId,sondeo.eje);
  return {cpDelta,votosDelta,nivel,mensaje,penalidad};
}

function respuestaIA(sondeo,candidatoId){
  const cand=CANDS[candidatoId];
  const valorCandidato=cand.p[sondeo.eje];
  let mejor=sondeo.opciones[0];
  let deltaMin=Infinity;
  sondeo.opciones.forEach(op=>{
    const delta=Math.abs(op.valor-valorCandidato)+(Math.random()*0.8-.4);
    if(delta<deltaMin){
      deltaMin=delta;
      mejor=op;
    }
  });
  return mejor;
}

function resolverSondeoIA(sondeo,valorRespuesta,candidatoId){
  const cand=CANDS[candidatoId];
  const delta=Math.abs(valorRespuesta-cand.p[sondeo.eje]);
  if(delta===0)return {cpDelta:8,votosDelta:1.5};
  if(delta===1)return {cpDelta:4,votosDelta:0.5};
  if(delta===2)return {cpDelta:0,votosDelta:0};
  if(delta===3)return {cpDelta:-4,votosDelta:-0.8};
  return {cpDelta:-8,votosDelta:-1.5};
}

function aplicarSondeoIAs(sondeo){
  gs.activeIds.filter(id=>id!==gs.pId).forEach(aiId=>{
    const resp=respuestaIA(sondeo,aiId);
    const resultado=resolverSondeoIA(sondeo,resp.valor,aiId);
    gs.aiCP[aiId]=clamp((gs.aiCP[aiId]||0)+resultado.cpDelta,0,70);
    gs.boosts[aiId]=clamp((gs.boosts[aiId]||0)+resultado.votosDelta,-8,8);
  });
}

function mostrarResultadoSondeo(resultado,callback){
  el('sondeoOpciones').style.display='none';
  el('sondeoResultado').style.display='block';
  const iconos={positivo:'✅',neutro:'➖',negativo:'⚠️',grave:'🔴'};
  el('sondeoResIcon').textContent=iconos[resultado.nivel]||'➖';
  el('sondeoResMsg').textContent=resultado.mensaje;
  const vals=el('sondeoResVals');
  vals.innerHTML='';
  if(resultado.cpDelta!==0){
    const v=document.createElement('div');
    v.className=`sondeo-val ${resultado.cpDelta>0?'pos':'neg'}`;
    v.textContent=`${resultado.cpDelta>0?'+':''}${resultado.cpDelta} CP`;
    vals.appendChild(v);
  }
  if(resultado.votosDelta!==0){
    const v=document.createElement('div');
    v.className=`sondeo-val ${resultado.votosDelta>0?'pos':'neg'}`;
    v.textContent=`${resultado.votosDelta>0?'+':''}${resultado.votosDelta.toFixed(1)}%`;
    vals.appendChild(v);
  }
  if(resultado.cpDelta===0&&resultado.votosDelta===0){
    const v=document.createElement('div');
    v.className='sondeo-val neu';
    v.textContent='Sin efecto';
    vals.appendChild(v);
  }
  gs._sondeoCallback=callback;
  updateUI();
  updateMap();
  if(gs.selDept)renderPanel(gs.selDept);
}

function mostrarSondeo(callback){
  const sondeo=getSondeoAleatorio();
  el('sondeoPregunta').textContent=sondeo.pregunta;
  el('sondeoTurnoLabel').textContent=`Turno ${gs.turn} de ${gs.maxTurns}`;
  el('sondeoResultado').style.display='none';
  const opcionesEl=el('sondeoOpciones');
  opcionesEl.style.display='flex';
  opcionesEl.innerHTML='';
  sondeo.opciones.forEach(op=>{
    const btn=document.createElement('button');
    btn.className='sondeo-opcion';
    btn.textContent=op.texto;
    btn.onclick=()=>{
      opcionesEl.querySelectorAll('.sondeo-opcion').forEach(node=>node.classList.remove('selected'));
      btn.classList.add('selected');
      opcionesEl.querySelectorAll('.sondeo-opcion').forEach(node=>{node.disabled=true;});
      const resultado=resolverSondeo(sondeo,op.valor,gs.pId);
      aplicarSondeoIAs(sondeo);
      setTimeout(()=>mostrarResultadoSondeo(resultado,callback),300);
    };
    opcionesEl.appendChild(btn);
  });
  el('sondeomodal').classList.add('on');
}

function cerrarSondeo(){
  el('sondeomodal').classList.remove('on');
  el('sondeoOpciones').style.display='flex';
  if(gs._sondeoCallback){
    const cb=gs._sondeoCallback;
    gs._sondeoCallback=null;
    cb();
  }
}

function sortearEvento(){
  if(isMultiMode()){
    gs.eventThisTurn=getMultiplayerEvento();
    return gs.eventThisTurn;
  }
  if(Math.random()>0.4)return null;
  const disponibles=EVENTOS.filter(evento=>!gs.eventosUsados.includes(evento.id));
  const pool=disponibles.length?disponibles:EVENTOS;
  const evento=pool[Math.floor(Math.random()*pool.length)];
  gs.eventosUsados.push(evento.id);
  gs.eventThisTurn=evento;
  return evento;
}

function getAffinityDistance(candidate,evento){
  return Math.abs((candidate.p[evento.eje]||0)-evento.valorAfin);
}

function eventCostOverride(candidateId,grupoId){
  const ev=gs.eventThisTurn;
  if(!ev||ev.tipo!=='bonus_candidato_afin'||!ev.grupos.includes(grupoId))return null;
  const active=gs.activeIds.length?gs.activeIds:Object.keys(CANDS);
  const ranked=active.map(id=>({id,dist:getAffinityDistance(CANDS[id],ev)})).sort((a,b)=>a.dist-b.dist);
  return ranked[0]?.id===candidateId?0:null;
}

function aplicarEventoAlCosto(candidateId,grupoId,deptId,costoBase){
  const ev=gs.eventThisTurn;
  if(!ev)return costoBase;
  const affinityCost=eventCostOverride(candidateId,grupoId);
  if(affinityCost!==null)return affinityCost;
  if(ev.tipo==='descuento'&&ev.grupos.includes(grupoId))return Math.max(1,Math.round(costoBase*ev.factor));
  if(ev.tipo==='descuento_fijo'&&ev.grupos.includes(grupoId))return ev.costoFijo;
  if(ev.tipo==='descuento_fijo_depts'&&ev.grupos.includes(grupoId)&&ev.depts.includes(deptId))return ev.costoFijo;
  if(ev.tipo==='costo_mixto'){
    if(ev.efectoMixto.descuento.includes(grupoId))return Math.max(1,Math.round(costoBase*0.4));
    if(ev.efectoMixto.encarece.includes(grupoId))return 10;
  }
  return costoBase;
}

function eventVoteFactor(groupId){
  const ev=gs.eventThisTurn;
  if(!ev)return 1;
  if(ev.tipo==='valor_doble'&&ev.grupos.includes(groupId))return 2;
  if(ev.tipo==='valor_boost'&&ev.grupos.includes(groupId))return ev.boostFactor||1;
  return 1;
}

function liberarGruposPorEvento(evento){
  if(!evento||evento.tipo!=='liberar_grupo')return;
  Object.values(DEPTS).forEach(dept=>{
    dept.groups.forEach(g=>{
      if(evento.grupos.includes(g.id)){
        g.owner=null;
        g.reinforced=false;
        g.pending=false;
      }
    });
  });
}

function aplicarBonusEvento(){
  const ev=gs.eventThisTurn;
  if(!ev)return;
  if(ev.tipo==='bonus_territorio'){
    ev.deptsBonus.forEach(bonus=>{
      const conteos={};
      gs.activeIds.forEach(id=>{conteos[id]=0;});
      bonus.depts.forEach(deptId=>{
        const dept=DEPTS[deptId];
        if(!dept)return;
        dept.groups.forEach(g=>{
          if(g.owner&&conteos[g.owner]!==undefined)conteos[g.owner]++;
        });
      });
      const lider=Object.entries(conteos).sort((a,b)=>b[1]-a[1])[0];
      if(lider&&lider[1]>0){
        if(lider[0]===gs.pId){
          gs.pCP=clamp(gs.pCP+bonus.cp,0,70);
          log(`Evento: +${bonus.cp} CP por dominar una región clave.`,`s`);
        }else if(gs.aiCP[lider[0]]!==undefined){
          gs.aiCP[lider[0]]=clamp(gs.aiCP[lider[0]]+bonus.cp,0,70);
        }
      }
    });
  }
}

function mostrarBannerEvento(evento){
  const banner=el('eventbanner');
  if(!banner)return;
  const colores={naranja:'#FF8C00',azul:'#1B4DC0',amarillo:'#E8A800'};
  banner.style.borderColor=colores[evento.color]||'#999';
  banner.innerHTML=`
    <span class="ev-icon">${evento.icono}</span>
    <div class="ev-body">
      <div class="ev-titulo">${evento.titulo}</div>
      <div class="ev-desc">${evento.efecto}</div>
    </div>
    <button class="ev-close" onclick="el('eventbanner').classList.remove('vis')">✕</button>`;
  banner.classList.add('vis');
  setTimeout(()=>banner.classList.remove('vis'),8000);
}

function limpiarEvento(){
  gs.eventThisTurn=null;
  const banner=el('eventbanner');
  if(banner)banner.classList.remove('vis');
}

function beginPlayerTurn(){
  if(checkSondeo()){
    mostrarSondeo(()=>_beginPlayerTurnCore());
    return;
  }
  _beginPlayerTurnCore();
}

function _beginPlayerTurnCore(){
  stopTurnWaitPoll();
  const evento=sortearEvento();
  if(evento){
    liberarGruposPorEvento(evento);
    mostrarBannerEvento(evento);
    aplicarBonusEvento();
  }
  gs.isPlayerTurn=true;
  gs.timeLeft=120;
  clearUndo();
  resetTurnActions();
  const gain=Math.round(10+getPct(gs.pId)/2);
  gs.pCP=Math.min(gs.pCP+gain,70);
  el('endbtn').disabled=false;
  el('aitag').classList.remove('vis');
  log(`— Turno ${gs.turn}/${gs.maxTurns} · Tu turno · +${gain} CP`,'s');
  updateUI();
  startTurnTimer();
}

async function endPlayerTurn(){
  if(!gs.isPlayerTurn)return;
  if(isMultiMode())limpiarEvento();
  clearTimers();
  clearUndo();
  gs.isPlayerTurn=false;
  el('endbtn').disabled=true;
  el('undobtn').disabled=true;
  el('tring').textContent='—';
  el('tring').classList.remove('hot');
  if(isMultiMode()){
    log('→ Turno enviado a la sala','s');
    showWaitModal('Esperando a que el rival termine su jugada…');
    try{
      await submitTurn(gs.turnActions);
      startTurnWaitPoll();
    }catch(error){
      hideWaitModal();
      gs.isPlayerTurn=true;
      el('endbtn').disabled=false;
      startTurnTimer();
      log(error?.message||'No pudimos enviar el turno.','s');
    }
    return;
  }
  log('→ Turno finalizado','s');
  setTimeout(runAllAIs,350);
}

async function runAllAIs(){
  const ais=gs.activeIds.filter(id=>id!==gs.pId);
  for(const aiId of ais){
    await runSingleAI(aiId);
  }
  afterAllAITurns();
}

async function runSingleAI(aiId){
  const ac=CANDS[aiId];
  const gain=Math.round(10+getPct(aiId)/2);
  gs.aiCP[aiId]=Math.min(gs.aiCP[aiId]+gain,70);
  el('aitag').classList.add('vis');
  el('aiwho').textContent=ac.short+' negocia';
  const row=el(`rrow-${aiId}`);
  if(row)row.classList.add('acting');
  const myPct=getPct(aiId);
  const maxRiv=Math.max(...gs.activeIds.filter(x=>x!==aiId).map(getPct));
  const aggressive=myPct<maxRiv-8;
  const sorted=Object.values(DEPTS).map(d=>({d,score:deptScore(d,aiId,aggressive)})).sort((a,b)=>b.score-a.score);
  let actions=0;
  const maxAct=2+Math.floor(Math.random()*3);
  for(const {d} of sorted){
    if(gs.aiCP[aiId]<=0||actions>=maxAct)break;
    const best=findBestAI(d,aiId,aggressive);
    if(!best||gs.aiCP[aiId]<best.cost)continue;
    gs.aiCP[aiId]-=best.cost;
    actions++;
    flashDept(d.id);
    showAIAct(d.id,ac,best);
  if(best.attack){
      const hit=Math.random()<(best.g.reinforced?0.3:0.6);
      if(hit){
        best.g.owner=aiId;
        best.g.reinforced=false;
        log(`${ac.short} captura ${GP[best.g.id].n} — ${d.n}`,'la');
        trackActivity(aiId,`Capturó ${GP[best.g.id].n} en ${d.n}.`);
      }else{
        log(`${ac.short} falla en ${GP[best.g.id].n} — ${d.n}`,'la');
        trackActivity(aiId,`Falló un ataque sobre ${GP[best.g.id].n} en ${d.n}.`);
      }
    }else{
      best.g.owner=aiId;
      log(`${ac.short} activa ${GP[best.g.id].n} — ${d.n}`,'la');
      trackActivity(aiId,`Activó ${GP[best.g.id].n} en ${d.n}.`);
    }
    updateUI();
    if(gs.selDept===d.id)renderPanel(d.id);
    await wait(420);
  }
  if(row)row.classList.remove('acting');
  hideAIAct();
}

function deptScore(d,aiId,agg){
  const ac=CANDS[aiId];
  let score=d.weight*(0.7+Math.random()*.6);
  d.groups.forEach(g=>{
    if(isNeutralLockedGroup(g.id))return;
    if(g.owner===aiId)return;
    const cost=groupCost(ac,g.id,d.id);
    if(!g.owner&&cost<=4)score+=4;
    else if(g.owner&&agg)score+=2;
  });
  return score;
}

function findBestAI(dept,aiId,agg){
  const ac=CANDS[aiId];
  let best=null;
  let bestScore=-Infinity;
  dept.groups.forEach(g=>{
    if(isNeutralLockedGroup(g.id))return;
    if(g.owner===aiId)return;
    if(!g.owner){
      const cost=groupCost(ac,g.id,dept.id);
      if(gs.aiCP[aiId]<cost)return;
      const score=(dept.weight*6)/cost+Math.random()*1.2;
      if(score>bestScore){
        bestScore=score;
        best={g,cost,attack:false};
      }
    }else if(agg){
      const score=(dept.weight*3)/6+Math.random()*1.2;
      if(gs.aiCP[aiId]<6)return;
      if(score>bestScore){
        bestScore=score;
        best={g,cost:6,attack:true};
      }
    }
  });
  return best;
}

function afterAllAITurns(){
  el('aitag').classList.remove('vis');
  updateUI();
  gs.turn++;
  if(gs.turn>gs.maxTurns){
    if(gs.round===1){
      const w=checkWin();
      if(w)showWin(w,'first');
      else showR2Transition();
    }else{
      showWin(getLeader(),'second');
    }
    return;
  }
  if(!hasHumanTurn()){
    limpiarEvento();
    setTimeout(runAllAIs,550);
    return;
  }
  limpiarEvento();
  beginPlayerTurn();
}

function generarMensajeCoalicion(elimId,endosadoId,tasa){
  const pct=Math.round(tasa*100);
  const e=CANDS[elimId].short;
  const n=CANDS[endosadoId].short;
  if(tasa>=0.6)return `${e} hace un endoso sólido a ${n}. Sus bases migran con fuerza (${pct}% de sus grupos transferidos).`;
  if(tasa>=0.35)return `${e} apoya a ${n} con reservas. Transferencia parcial (${pct}% de sus grupos).`;
  return `${e} da un endoso tibio a ${n}. La mayoría de sus bases quedan libres (solo ${pct}% transferidos).`;
}

function resolverCoaliciones(top2,eliminados){
  gs.coaliciones=[];
  eliminados.forEach(elimId=>{
    const elim=CANDS[elimId];
    if(!elim)return;
    const afinidad={};
    top2.forEach(finId=>{
      const fin=CANDS[finId];
      const dist=Math.abs(elim.p.e-fin.p.e)+Math.abs(elim.p.s-fin.p.s)+Math.abs(elim.p.c-fin.p.c)+Math.abs(elim.p.v-fin.p.v)+Math.abs(elim.p.t-fin.p.t);
      afinidad[finId]=20-dist;
    });
    const [cand1,cand2]=top2;
    const ruido=(Math.random()-.5)*3;
    const endosado=(afinidad[cand1]+ruido)>afinidad[cand2]?cand1:cand2;
    const tasaTransferencia=Math.min(0.7,Math.max(0.15,afinidad[endosado]/20));
    let transferidos=0;
    let liberados=0;
    Object.values(DEPTS).forEach(dept=>{
      dept.groups.forEach(g=>{
        if(g.owner!==elimId)return;
        if(Math.random()<tasaTransferencia){
          g.owner=endosado;
          transferidos++;
        }else{
          g.owner=null;
          g.reinforced=false;
          liberados++;
        }
      });
    });
    gs.coaliciones.push({
      eliminado:elimId,
      endosado,
      afinidad:Math.round(afinidad[endosado]),
      tasa:tasaTransferencia,
      transferidos,
      liberados,
      mensaje:generarMensajeCoalicion(elimId,endosado,tasaTransferencia),
    });
  });
}

function mostrarCoaliciones(callback){
  const list=el('coalilist');
  list.innerHTML='';
  gs.coaliciones.forEach(coal=>{
    const elim=CANDS[coal.eliminado];
    const endosado=CANDS[coal.endosado];
    const row=document.createElement('div');
    row.className='coali-row';
    row.innerHTML=`
      <div class="coali-cand">
        <div class="coali-avatar" style="border-color:${elim.color}">
          <img src="${portraitFor(coal.eliminado)}" alt="${elim.short}">
        </div>
        <div class="coali-name" style="color:${elim.color}">${elim.short}</div>
      </div>
      <div class="coali-arrow">→</div>
      <div class="coali-cand">
        <div class="coali-avatar" style="border-color:${endosado.color}">
          <img src="${portraitFor(coal.endosado)}" alt="${endosado.short}">
        </div>
        <div class="coali-name" style="color:${endosado.color}">${endosado.short}</div>
      </div>
      <div class="coali-msg">${coal.mensaje}</div>`;
    list.appendChild(row);
  });
  gs._coaliCallback=callback;
  el('coalimodal').classList.add('on');
}

function cerrarCoaliciones(){
  el('coalimodal').classList.remove('on');
  if(gs._coaliCallback){
    const cb=gs._coaliCallback;
    gs._coaliCallback=null;
    cb();
  }
}

function iniciarSegundaVuelta(){
  gs.eliminatedIds=[...gs.elimToProcess];
  gs.activeIds=[...gs.r2top2];
  gs.boosts={};
  gs.pCP=28;
  gs.activeIds.forEach(id=>{gs.aiCP[id]=28;});
  gs.round=2;
  gs.turn=1;
  gs.maxTurns=5;
  el('ptag').textContent='Segunda Vuelta';
  el('ptag').classList.add('r2');
  el('tnum').textContent='1';
  el('tmax').textContent='5';
  const toast=el('roundtoast');
  toast.textContent='SEGUNDA VUELTA';
  toast.classList.add('vis');
  setTimeout(()=>toast.classList.remove('vis'),3000);
  buildRankings();
  buildVoteBar();
  updateMap();
  updateUI();
  if(gs.selDept)renderPanel(gs.selDept);
  log('━━ SEGUNDA VUELTA — Coaliciones resueltas, grupos liberados disponibles','s');
  if(hasHumanTurn())beginPlayerTurn();
  else setTimeout(runAllAIs,550);
}

function showR2Transition(){
  const ranked=gs.activeIds.map(id=>({id,pct:getPct(id)})).sort((a,b)=>b.pct-a.pct);
  gs.r2top2=ranked.slice(0,2).map(x=>x.id);
  gs.elimToProcess=ranked.slice(2).map(x=>x.id);
  const list=el('r2list');
  list.innerHTML='';
  ranked.forEach((r,i)=>{
    const c=CANDS[r.id];
    const adv=gs.r2top2.includes(r.id);
    const row=document.createElement('div');
    row.className=`r2row ${adv?'adv':'elim'}`;
    row.innerHTML=`<div class="r2rank">${i+1}°</div><div class="r2dot" style="background:${c.color}"></div>
      <div class="r2name">${c.n}</div><div class="r2pct" style="color:${c.color}">${r.pct.toFixed(1)}%</div>
      <div class="r2tag" style="background:${adv?'rgba(232,168,0,.15)':'var(--bg)'};color:${adv?'#A07000':'var(--muted)'}">${adv?'Pasa':'Eliminado'}</div>`;
    list.appendChild(row);
  });
  const qual=gs.r2top2.includes(gs.pId);
  el('r2btn').textContent=qual?'Continuar →':'Ver cómo termina';
  el('r2sub').textContent=qual?'Clasificaste. Ahora entran endosos y reacomodo de bases.':'No clasificaste. Verás cómo se reordenan las coaliciones.';
  el('r2btn').onclick=continueR2;
  el('r2modal').classList.add('on');
}

function continueR2(){
  el('r2modal').classList.remove('on');
  resolverCoaliciones(gs.r2top2,gs.elimToProcess);
  mostrarCoaliciones(()=>iniciarSegundaVuelta());
}

function groupCost(cand,gId,deptId){
  if(isNeutralLockedGroup(gId))return null;
  if(!GP[gId])return 7;
  const g=GP[gId].p;
  const c=cand.p;
  const d=Math.abs(c.e-g.e)+Math.abs(c.s-g.s)+Math.abs(c.c-g.c)+Math.abs(c.v-g.v)+Math.abs(c.t-g.t);
  const costoBase=d<=3?4:d<=7?7:12;
  return aplicarEventoAlCosto(cand.id,gId,deptId,costoBase);
}

function applyPendingMark(group){
  if(isMultiMode())group.pending=true;
}

function activateGroup(deptId,gIdx){
  if(!gs.isPlayerTurn)return;
  const dept=DEPTS[deptId];
  const g=dept.groups[gIdx];
  if(isNeutralLockedGroup(g.id)){log('Ese bloque de voto en blanco no se puede disputar.','s');return;}
  const pc=CANDS[gs.pId];
  saveState();
  if(g.owner===gs.pId){
    if(g.reinforced){undoStack.pop();log('Ya está reforzado','s');return;}
    if(gs.pCP<3){undoStack.pop();log('CP insuficiente','s');return;}
    g.reinforced=true;
    applyPendingMark(g);
    gs.pCP-=3;
    queueTurnAction({action_type:'reinforce',dept_id:deptId,group_idx:gIdx});
    log(`✦ Refuerzas ${GP[g.id].n} en ${dept.n} (-3 CP)`,'p');
    trackActivity(gs.pId,`Reforzó ${GP[g.id].n} en ${dept.n}.`);
  }else if(!g.owner){
    const cost=groupCost(pc,g.id,deptId);
    if(gs.pCP<cost){undoStack.pop();log(`CP insuficiente — necesitas ${cost}`,'s');return;}
    g.owner=gs.pId;
    applyPendingMark(g);
    gs.pCP-=cost;
    queueTurnAction({action_type:'activate',dept_id:deptId,group_idx:gIdx});
    log(`✓ Activas ${GP[g.id].n} en ${dept.n} (-${cost} CP)`,'p');
    trackActivity(gs.pId,`Activó ${GP[g.id].n} en ${dept.n}.`);
  }else{
    if(gs.pCP<6){undoStack.pop();log('Necesitas 6 CP para atacar','s');return;}
    gs.pCP-=6;
    if(isMultiMode()){
      g.owner=gs.pId;
      g.reinforced=false;
      g.pending=true;
      queueTurnAction({action_type:'attack',dept_id:deptId,group_idx:gIdx});
      log(`⚔ Ataque programado sobre ${GP[g.id].n} en ${dept.n}`,'p');
      trackActivity(gs.pId,`Programó un ataque sobre ${GP[g.id].n} en ${dept.n}.`);
    }else{
      const hit=Math.random()<(g.reinforced?0.3:0.6);
      if(hit){
        g.owner=gs.pId;
        g.reinforced=false;
        log(`✓ Capturas ${GP[g.id].n} en ${dept.n}`,'p');
        trackActivity(gs.pId,`Capturó ${GP[g.id].n} en ${dept.n}.`);
      }else{
        log(`✗ Fallas en capturar ${GP[g.id].n}`,'p');
        trackActivity(gs.pId,`Falló un ataque sobre ${GP[g.id].n} en ${dept.n}.`);
      }
    }
  }
  updateUI();
  renderPanel(deptId);
  updateMap();
}

function makeConc(deptId,gIdx){
  if(!gs.isPlayerTurn)return;
  if(gs.pCR<25){log('Credibilidad insuficiente (mín 25)','s');return;}
  const dept=DEPTS[deptId];
  const g=dept.groups[gIdx];
  if(isNeutralLockedGroup(g.id)){log('El voto en blanco no admite concesiones.','s');return;}
  const pc=CANDS[gs.pId];
  const orig=groupCost(pc,g.id,deptId);
  if(orig<=4){log('Este grupo ya es de afinidad natural','s');return;}
  if(g.owner){log('Solo aplica a grupos sin dueño','s');return;}
  const disc=orig-3;
  if(gs.pCP<disc){log(`CP insuficiente (necesitas ${disc})`,'s');return;}
  saveState();
  gs.pCR-=25;
  gs.pCP-=disc;
  g.owner=gs.pId;
  applyPendingMark(g);
  queueTurnAction({action_type:'concession',dept_id:deptId,group_idx:gIdx});
  log(`📣 CONCESIÓN: ${pc.short} apoya ${GP[g.id].n} — ${dept.n} (-${disc} CP, -25 CR)`,'s');
  trackActivity(gs.pId,`Hizo una concesión para ganar ${GP[g.id].n} en ${dept.n}.`);
  updateUI();
  renderPanel(deptId);
  updateMap();
}

function getPct(id){
  let total=0;
  Object.values(DEPTS).forEach(dept=>{
    const tw=dept.groups.reduce((s,g)=>s+g.w*eventVoteFactor(g.id),0);
    const ow=dept.groups.filter(g=>g.owner===id).reduce((s,g)=>s+(g.w*eventVoteFactor(g.id)),0);
    if(tw>0)total+=(ow/tw)*dept.weight;
  });
  total=Math.max(0,total+(gs.boosts[id]||0));
  return total;
}

function checkWin(){
  for(const id of gs.activeIds)if(getPct(id)>50)return id;
  return null;
}

function getLeader(){
  return gs.activeIds.map(id=>({id,pct:getPct(id)})).sort((a,b)=>b.pct-a.pct)[0]?.id;
}

function showWin(wId,phase){
  clearTimers();
  hideWaitModal();
  const c=CANDS[wId];
  const pct=getPct(wId);
  const isP=wId===gs.pId;
  el('vtitle').textContent=isP?'¡Ganaste!':'Perdiste';
  el('vtitle').style.color=isP?'var(--green)':'var(--red)';
  let reason='';
  if(phase==='first'&&pct>50)reason=`${c.n} superó el 50% del electorado al final de la primera vuelta.`;
  else if(phase==='second')reason=`Segunda vuelta finalizada. ${c.n} lidera el conteo.`;
  else if(phase==='multi')reason=`La sala terminó. ${c.n} quedó arriba en el mapa final.`;
  else reason=`${c.n} lidera el resultado final.`;
  el('vsub').textContent=reason;
  el('vcname').textContent=c.n;
  el('vcname').style.color=c.color;
  el('vpct').textContent=`${pct.toFixed(1)}%`;
  el('vpct').style.color=c.color;
  el('vvotes').textContent=`≈ ${fmtV(pct)} votos estimados`;
  el('vmodal').classList.add('on');
}

function buildRankings(){
  const box=el('rankings');
  box.innerHTML='';
  const ids=candidateIdsForBoard();
  ids.forEach(id=>{
    const c=CANDS[id];
    const elim=gs.eliminatedIds.includes(id);
    const pct=getPct(id);
    const row=document.createElement('button');
    row.type='button';
    row.className=`rank-row ${elim?'elim':''} ${gs.focusId===id?'focus':''}`;
    row.id=`rrow-${id}`;
    row.dataset.id=id;
    row.innerHTML=`<div class="rdot" style="background:${c.color}"></div>
      <div class="rname">${c.short}</div>
      <div class="rbar"><div class="rbarfill" id="rbf-${id}" style="background:${c.color};width:${Math.min(pct/50*100,100)}%"></div></div>
      <div class="rpct" id="rp-${id}" style="color:${c.color}">${pct.toFixed(1)}%</div>
      <div class="rvotes" id="rv-${id}">${fmtV(pct)}</div>`;
    row.onclick=()=>setFocusCandidate(id);
    box.appendChild(row);
  });
}

function buildVoteBar(){
  const s=el('tvotes');
  s.innerHTML='';
  gs.activeIds.forEach(id=>{
    const c=CANDS[id];
    const row=document.createElement('div');
    row.className='tv-row';
    row.innerHTML=`<div class="tv-dot" style="background:${c.color}"></div>
      <div class="tv-bar"><div class="tv-fill" id="tvf-${id}" style="background:${c.color};width:0%"></div></div>
      <div class="tv-pct" id="tvp-${id}" style="color:${c.color}">0%</div>
      <div class="tv-name">${c.short}</div>`;
    s.appendChild(row);
  });
}

function updateUI(){
  candidateIdsForBoard().forEach(id=>{
    const pct=getPct(id);
    const rbf=el(`rbf-${id}`);
    const rp=el(`rp-${id}`);
    const rv=el(`rv-${id}`);
    if(rbf)rbf.style.width=`${Math.min(pct/50*100,100)}%`;
    if(rp)rp.textContent=`${pct.toFixed(1)}%`;
    if(rv)rv.textContent=fmtV(pct);
    const tvf=el(`tvf-${id}`);
    const tvp=el(`tvp-${id}`);
    if(tvf)tvf.style.width=`${Math.min(pct,100)}%`;
    if(tvp)tvp.textContent=`${pct.toFixed(1)}%`;
  });
  el('pcp').textContent=gs.pCP;
  el('pcr').textContent=gs.pCR;
  el('crf').style.width=`${gs.pCR}%`;
  el('tnum').textContent=gs.turn;
  el('tmax').textContent=gs.maxTurns;
  updateModeUI();
  renderCandidateStrip();
  renderFocusCard();
}

function log(msg,type='p'){
  const box=el('log');
  const entry=document.createElement('div');
  entry.className=`le l${type}`;
  entry.textContent=msg;
  box.insertBefore(entry,box.firstChild);
  while(box.children.length>60)box.removeChild(box.lastChild);
}

function confirmHome(){el('homemodal').classList.add('on');}
function showHow(){el('howmodal').classList.add('on');}
function closeHow(){el('howmodal').classList.remove('on');}

function renderPanel(deptId){
  const dept=DEPTS[deptId];
  if(!dept)return;
  el('dempty').style.display='none';
  el('ddetail').style.display='block';
  el('ddn').textContent=dept.n;
  el('ddw').textContent=`${dept.weight.toFixed(1)}% del electorado nacional`;
  el('ddv').textContent=`≈ ${Math.round(dept.weight/100*TOTAL_VOTES/1000)}K votos válidos`;
  const pc=CANDS[gs.pId];
  const gl=el('glist');
  gl.innerHTML='';
  dept.groups.forEach((g,idx)=>{
    const gp=GP[g.id];
    if(!gp)return;
    const isLockedNeutral=isNeutralLockedGroup(g.id);
    const isP=g.owner===gs.pId;
    const isFree=!g.owner;
    const ownC=g.owner?CANDS[g.owner]:null;
    const actCost=groupCost(pc,g.id,deptId);
    const canPlay=gs.isPlayerTurn;
    const pending=g.pending?' · pendiente':'';
    const attackChance=g.reinforced?30:60;
    let st='';
    let meta='';
    if(isLockedNeutral){
      st=`<span style="color:var(--muted)">Reserva estructural${pending}</span>`;
      meta='Este bloque representa abstención, indecisos o voto en blanco. Reduce el techo electoral del departamento y no puede ser disputado.';
    }else if(isFree)st=`<span style="color:var(--muted)">Sin representación${pending}</span>`;
    else if(isP)st=`<span style="color:${ownC.color}">● Tuyo${g.reinforced?' · reforzado':''}${pending}</span>`;
    else st=`<button class="owner-link" onclick="setFocusCandidate('${ownC.id}')">● ${ownC.short}${g.reinforced?' · reforzado':''}${pending}</button>`;
    let btns='';
    if(isLockedNeutral){
      btns=`<button class="gbtn locked" disabled>No disputable</button>`;
    }else if(isFree){
      const ok=gs.pCP>=actCost&&canPlay;
      const okC=gs.pCR>=25&&actCost>4&&gs.pCP>=(actCost-3)&&canPlay;
      meta=`Entrada: <b>${actCost} CP</b>${actCost>4?` · Concesión: <b>${actCost-3} CP</b> y <b>-25 CR</b>`:''}`;
      btns=`<button class="gbtn act" onclick="activateGroup('${deptId}',${idx})" ${!ok?'disabled':''}>Activar <span class="cbadge">${actCost} CP</span></button>
        ${actCost>4?`<button class="gbtn con" onclick="makeConc('${deptId}',${idx})" ${!okC?'disabled':''}>Concesión <span class="cbadge">${actCost-3} CP</span></button>`:''}`;
    }else if(isP){
      const ok=gs.pCP>=3&&!g.reinforced&&canPlay;
      meta=g.reinforced?'Blindaje activo. Este grupo ya quedó protegido.':'Blindaje: <b>3 CP</b> para bajar el riesgo de captura rival.';
      btns=`<button class="gbtn rfz" onclick="activateGroup('${deptId}',${idx})" ${!ok?'disabled':''}>Reforzar <span class="cbadge">3 CP</span></button>`;
    }else{
      const ok=gs.pCP>=6&&canPlay;
      meta=`Ataque: <b>6 CP</b> · <b>${attackChance}%</b> de éxito${g.reinforced?' por refuerzo rival':''}.`;
      btns=`<button class="gbtn atk" onclick="activateGroup('${deptId}',${idx})" ${!ok?'disabled':''}>Atacar <span class="cbadge">6 CP</span></button>`;
    }
    const card=document.createElement('div');
    card.className='gcard';
    if(ownC)card.style.borderColor=ownC.color+'55';
    card.innerHTML=`<div class="ghead"><div class="gname">${gp.i} ${gp.n}</div><div class="gwt">${Math.round(g.w)}% local</div></div>
      <div class="gstatus">${st}</div><div class="gmeta">${meta}</div><div class="gbtns">${btns}</div>`;
    gl.appendChild(card);
  });
}

function deptFill(dept){
  const tw=dept.groups.reduce((s,g)=>s+g.w,0);
  const owners={};
  dept.groups.forEach(g=>{if(g.owner)owners[g.owner]=(owners[g.owner]||0)+g.w;});
  const entries=Object.entries(owners);
  if(!entries.length)return '#C8CEDC';
  entries.sort((a,b)=>b[1]-a[1]);
  const [topId,topW]=entries[0];
  const frac=topW/tw;
  const cc=d3.color(CANDS[topId].color);
  const bc=d3.color('#C8CEDC');
  if(!cc||!bc)return '#C8CEDC';
  const t=0.15+frac*.8;
  return `rgb(${Math.round(bc.r+(cc.r-bc.r)*t)},${Math.round(bc.g+(cc.g-bc.g)*t)},${Math.round(bc.b+(cc.b-bc.b)*t)})`;
}

function loadMap(){
  const c=el('mapc');
  const w=c.clientWidth;
  const h=c.clientHeight;
  svgSel=d3.select('#mapsvg').attr('width',w).attr('height',h);
  const scale=Math.min(w/0.19,h/0.265)*.88;
  const proj=d3.geoMercator().center([-74,4]).scale(scale).translate([w*.43,h*.5]);
  pathGen=d3.geoPath().projection(proj);
  const tt=el('mtt');
  d3.json(GEOJSON_URL).then(data=>{
    const feats=data.features||data;
    feats.forEach(f=>{
      const id=geoMatch(f.properties?.NOMBRE_DPT||f.properties?.name||'');
      if(id){
        const [cx,cy]=pathGen.centroid(f);
        coordCache[id]={x:cx,y:cy};
      }
    });
    svgSel.selectAll('.dp').data(feats).enter().append('path')
      .attr('class','dp')
      .attr('d',pathGen)
      .attr('id',d=>{
        const id=geoMatch(d.properties?.NOMBRE_DPT||d.properties?.name||'');
        return id?`p-${id}`:null;
      })
      .attr('fill',d=>{
        const id=geoMatch(d.properties?.NOMBRE_DPT||d.properties?.name||'');
        return id&&DEPTS[id]?deptFill(DEPTS[id]):'#C8CEDC';
      })
      .on('mouseover',(ev,d)=>{
        const n=d.properties?.NOMBRE_DPT||d.properties?.name||'';
        const id=geoMatch(n);
        const dept=id?DEPTS[id]:null;
        tt.innerHTML=`<b>${dept?dept.n:n}</b>${dept?`<span style="opacity:.6;font-size:.7em"> — ${dept.weight.toFixed(1)}% · ≈${Math.round(dept.weight/100*TOTAL_VOTES/1000)}K votos</span>`:''}`;
        tt.style.opacity='1';
        tt.style.left=`${ev.offsetX+14}px`;
        tt.style.top=`${ev.offsetY-36}px`;
      })
      .on('mousemove',ev=>{
        tt.style.left=`${ev.offsetX+14}px`;
        tt.style.top=`${ev.offsetY-36}px`;
      })
      .on('mouseout',()=>tt.style.opacity='0')
      .on('click',(ev,d)=>{
        const n=d.properties?.NOMBRE_DPT||d.properties?.name||'';
        const id=geoMatch(n);
        if(!id||!DEPTS[id])return;
        svgSel.selectAll('.dp').classed('sel',false);
        d3.select(`#p-${id}`).classed('sel',true);
        gs.selDept=id;
        renderPanel(id);
      });
  }).catch(()=>{
    svgSel.append('text').attr('x',w/2).attr('y',h/2).attr('text-anchor','middle').attr('fill','#7A849C').attr('font-size','13').text('Error al cargar el mapa.');
  });
}

function updateMap(){
  if(!svgSel)return;
  svgSel.selectAll('.dp').attr('fill',function(d){
    const id=geoMatch(d.properties?.NOMBRE_DPT||d.properties?.name||'');
    return id&&DEPTS[id]?deptFill(DEPTS[id]):'#C8CEDC';
  });
}

function flashDept(deptId){
  const p=document.getElementById(`p-${deptId}`);
  if(!p)return;
  p.classList.remove('flash');
  void p.offsetWidth;
  p.classList.add('flash');
  setTimeout(()=>p.classList.remove('flash'),700);
  updateMap();
}

function showAIAct(deptId,cand,action){
  const coord=coordCache[deptId];
  if(!coord)return;
  const tag=el('aiaction');
  tag.innerHTML=`<span style="color:${cand.color};font-weight:600">${cand.short}</span> ${action.attack?'ataca':'activa'} ${GP[action.g.id]?.n||''}`;
  tag.style.left=`${coord.x+8}px`;
  tag.style.top=`${coord.y-18}px`;
  tag.classList.add('vis');
}

function hideAIAct(){el('aiaction').classList.remove('vis');}

loadPortraits().then(()=>{
  buildSetup();
  initHome();
  goHome();
});
