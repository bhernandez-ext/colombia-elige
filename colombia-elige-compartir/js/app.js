const APP_CONFIG = window.ColombiaEligeConfig || {};
const MULTI_READY = Boolean(window.supabase && APP_CONFIG.supabaseUrl && APP_CONFIG.supabaseAnonKey);
const GEOJSON_URL = 'https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd5b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json';
const sb = MULTI_READY ? window.supabase.createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseAnonKey) : null;
const PORTRAITS = {};

async function loadPortraits() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const names = ['cepeda', 'abelardo', 'paloma', 'fajardo', 'claudia'];
      const pw = img.width / names.length;
      names.forEach((name, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, index * pw, 0, pw, img.height, 0, 0, 240, 300);
        PORTRAITS[name] = canvas.toDataURL('image/jpeg', 0.85);
      });
      resolve();
    };
    img.onerror = () => resolve();
    img.src = './assets/candidates.jpg';
  });
}

// ═══════════════════════════════════════════════════
const TOTAL_VOTES = 21500000;
function fmtV(pct){const v=pct*TOTAL_VOTES/100;return v>=1e6?(v/1e6).toFixed(2)+'M':(v/1e3).toFixed(0)+'K';}

const GP = {
  clase_media:    {n:'Clase Media',              i:'🏙️', p:{e:0,  s:0,  c:0,  v:0,  t:0 }},
  jovenes:        {n:'Jóvenes Urbanos',          i:'👥', p:{e:-1, s:-1, c:-1, v:-2, t:-1}},
  gremios:        {n:'Gremios Empresariales',    i:'💼', p:{e:1,  s:1,  c:0,  v:0,  t:2 }},
  fecode:         {n:'Magisterio / FECODE',      i:'📚', p:{e:-1, s:-2, c:-1, v:-1, t:-2}},
  sindicatos:     {n:'Sindicatos',               i:'✊', p:{e:-1, s:-1, c:-1, v:-1, t:-2}},
  cafeteros:      {n:'Cafeteros',                i:'☕', p:{e:0,  s:1,  c:1,  v:1,  t:0 }},
  ganaderos:      {n:'Ganaderos',                i:'🐄', p:{e:1,  s:2,  c:2,  v:1,  t:1 }},
  militares:      {n:'Fuerzas Militares',        i:'⚔️', p:{e:0,  s:2,  c:0,  v:1,  t:1 }},
  iglesia_cat:    {n:'Iglesia Católica',         i:'⛪', p:{e:0,  s:1,  c:0,  v:2,  t:0 }},
  iglesia_ev:     {n:'Iglesias Evangélicas',     i:'🙏', p:{e:0,  s:1,  c:0,  v:2,  t:1 }},
  indigenas:      {n:'Comunidades Indígenas',    i:'🌿', p:{e:-2, s:-2, c:-2, v:0,  t:-2}},
  afros:          {n:'Comunidades Afro',         i:'✊', p:{e:-1, s:-1, c:-1, v:-1, t:-1}},
  victimas:       {n:'Víctimas del Conflicto',   i:'🕊️', p:{e:-1, s:-2, c:-1, v:0,  t:-1}},
  petroleros:     {n:'Sector Minero-Energético', i:'⛽', p:{e:2,  s:1,  c:0,  v:0,  t:1 }},
  campesinos:     {n:'Campesinos',               i:'🌾', p:{e:-1, s:-1, c:-2, v:0,  t:-2}},
  adultos_mayores:{n:'Adultos Mayores',          i:'👴', p:{e:0,  s:1,  c:0,  v:1,  t:0 }},
  p_liberal:      {n:'Partido Liberal',          i:'🔴', p:{e:0,  s:0,  c:0,  v:0,  t:0 }},
  p_conservador:  {n:'Partido Conservador',      i:'🔵', p:{e:1,  s:1,  c:1,  v:2,  t:0 }},
  cambio_radical: {n:'Cambio Radical',           i:'🟡', p:{e:1,  s:1,  c:0,  v:1,  t:1 }},
  p_u:            {n:'Partido de la U',          i:'🟢', p:{e:0,  s:1,  c:0,  v:1,  t:0 }},
  alianza_verde:  {n:'Alianza Verde',            i:'💚', p:{e:-1, s:-1, c:-1, v:-1, t:-1}},
};

const CANDS = {
  cepeda:  {id:'cepeda',  n:'Iván Cepeda',              short:'Cepeda',  party:'Pacto Histórico',        color:'#CC2222', p:{e:-2,s:-2,c:-2,v:-2,t:-2}},
  abelardo:{id:'abelardo',n:'Abelardo De la Espriella',  short:'Abelardo',party:'Defensores de la Patria',color:'#D4600A', p:{e:2, s:2, c:0, v:1, t:1 }},
  paloma:  {id:'paloma',  n:'Paloma Valencia',           short:'Paloma',  party:'Centro Democrático',     color:'#1B4DC0', p:{e:2, s:2, c:1, v:2, t:2 }},
  fajardo: {id:'fajardo', n:'Sergio Fajardo',            short:'Fajardo', party:'Independiente',          color:'#1A7A4A', p:{e:0, s:0, c:-1,v:0, t:0 }},
  claudia: {id:'claudia', n:'Claudia López',             short:'Claudia', party:'Alianza Verde',          color:'#6B35B0', p:{e:-1,s:-1,c:-1,v:-2,t:-1}},
};

const DRAW=[
  {id:'bogota',       n:'Bogotá D.C.',       w:18.0,g:[{id:'clase_media',w:22},{id:'jovenes',w:20},{id:'gremios',w:18},{id:'fecode',w:20},{id:'sindicatos',w:20}]},
  {id:'antioquia',    n:'Antioquia',          w:13.0,g:[{id:'gremios',w:25},{id:'cafeteros',w:22},{id:'militares',w:20},{id:'clase_media',w:20},{id:'iglesia_cat',w:13}]},
  {id:'valle',        n:'Valle del Cauca',    w:9.0, g:[{id:'gremios',w:25},{id:'clase_media',w:25},{id:'afros',w:24},{id:'sindicatos',w:26}]},
  {id:'cundinamarca', n:'Cundinamarca',       w:6.0, g:[{id:'campesinos',w:30},{id:'cafeteros',w:26},{id:'clase_media',w:22},{id:'p_conservador',w:22}]},
  {id:'atlantico',    n:'Atlántico',          w:5.0, g:[{id:'gremios',w:28},{id:'clase_media',w:26},{id:'jovenes',w:24},{id:'p_liberal',w:22}]},
  {id:'bolivar',      n:'Bolívar',            w:4.5, g:[{id:'ganaderos',w:27},{id:'afros',w:27},{id:'p_liberal',w:24},{id:'iglesia_cat',w:22}]},
  {id:'santander',    n:'Santander',          w:4.0, g:[{id:'gremios',w:26},{id:'clase_media',w:26},{id:'cafeteros',w:24},{id:'militares',w:24}]},
  {id:'cordoba',      n:'Córdoba',            w:3.5, g:[{id:'ganaderos',w:34},{id:'afros',w:26},{id:'iglesia_ev',w:22},{id:'p_liberal',w:18}]},
  {id:'narino',       n:'Nariño',             w:3.5, g:[{id:'indigenas',w:32},{id:'fecode',w:26},{id:'campesinos',w:24},{id:'victimas',w:18}]},
  {id:'nortesder',    n:'Norte de Santander', w:3.0, g:[{id:'gremios',w:24},{id:'victimas',w:26},{id:'petroleros',w:26},{id:'campesinos',w:24}]},
  {id:'tolima',       n:'Tolima',             w:3.0, g:[{id:'cafeteros',w:28},{id:'campesinos',w:34},{id:'victimas',w:22},{id:'p_conservador',w:16}]},
  {id:'boyaca',       n:'Boyacá',             w:3.0, g:[{id:'campesinos',w:32},{id:'iglesia_cat',w:25},{id:'p_conservador',w:27},{id:'adultos_mayores',w:16}]},
  {id:'cauca',        n:'Cauca',              w:2.5, g:[{id:'indigenas',w:34},{id:'victimas',w:28},{id:'campesinos',w:22},{id:'fecode',w:16}]},
  {id:'huila',        n:'Huila',              w:2.5, g:[{id:'campesinos',w:35},{id:'cafeteros',w:35},{id:'victimas',w:30}]},
  {id:'meta',         n:'Meta',               w:2.5, g:[{id:'ganaderos',w:34},{id:'petroleros',w:34},{id:'militares',w:32}]},
  {id:'magdalena',    n:'Magdalena',          w:2.5, g:[{id:'ganaderos',w:34},{id:'afros',w:34},{id:'p_liberal',w:32}]},
  {id:'risaralda',    n:'Risaralda',          w:2.0, g:[{id:'cafeteros',w:38},{id:'clase_media',w:36},{id:'gremios',w:26}]},
  {id:'cesar',        n:'Cesar',              w:2.0, g:[{id:'ganaderos',w:34},{id:'p_liberal',w:34},{id:'iglesia_ev',w:32}]},
  {id:'caldas',       n:'Caldas',             w:2.0, g:[{id:'cafeteros',w:38},{id:'iglesia_cat',w:30},{id:'adultos_mayores',w:32}]},
  {id:'sucre',        n:'Sucre',              w:1.5, g:[{id:'ganaderos',w:38},{id:'afros',w:34},{id:'p_liberal',w:28}]},
  {id:'guajira',      n:'La Guajira',         w:1.5, g:[{id:'indigenas',w:44},{id:'ganaderos',w:30},{id:'afros',w:26}]},
  {id:'quindio',      n:'Quindío',            w:1.5, g:[{id:'cafeteros',w:44},{id:'clase_media',w:30},{id:'adultos_mayores',w:26}]},
  {id:'choco',        n:'Chocó',              w:1.0, g:[{id:'afros',w:50},{id:'indigenas',w:30},{id:'fecode',w:20}]},
  {id:'putumayo',     n:'Putumayo',           w:0.8, g:[{id:'indigenas',w:40},{id:'victimas',w:34},{id:'campesinos',w:26}]},
  {id:'caqueta',      n:'Caquetá',            w:0.8, g:[{id:'victimas',w:40},{id:'campesinos',w:34},{id:'ganaderos',w:26}]},
  {id:'casanare',     n:'Casanare',           w:0.8, g:[{id:'petroleros',w:44},{id:'ganaderos',w:34},{id:'militares',w:22}]},
  {id:'arauca',       n:'Arauca',             w:0.5, g:[{id:'victimas',w:40},{id:'petroleros',w:34},{id:'indigenas',w:26}]},
  {id:'sanandres',    n:'San Andrés',         w:0.3, g:[{id:'clase_media',w:40},{id:'iglesia_ev',w:34},{id:'adultos_mayores',w:26}]},
  {id:'amazonas',     n:'Amazonas',           w:0.2, g:[{id:'indigenas',w:60},{id:'campesinos',w:40}]},
  {id:'guainia',      n:'Guainía',            w:0.15,g:[{id:'indigenas',w:65},{id:'campesinos',w:35}]},
  {id:'vaupes',       n:'Vaupés',             w:0.1, g:[{id:'indigenas',w:70},{id:'campesinos',w:30}]},
  {id:'vichada',      n:'Vichada',            w:0.1, g:[{id:'indigenas',w:50},{id:'ganaderos',w:50}]},
  {id:'guaviare',     n:'Guaviare',           w:0.2, g:[{id:'victimas',w:40},{id:'campesinos',w:34},{id:'ganaderos',w:26}]},
];

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
};

const undoStack=[];
let svgSel,pathGen;
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
  el('pimg').src=PORTRAITS[gs.pId]||'';
  el('pcp').style.color=pc.color;
}

function showBoard(){
  el('home').style.display='none';
  el('setup').classList.remove('on');
  el('game').classList.add('on');
  setupPlayerCard();
  updateModeUI();
  buildRankings();
  buildVoteBar();
  if(!svgSel)loadMap();
  else updateMap();
  updateUI();
}

function initHome(){
  if(!MULTI_READY){
    ['homeMultiBtn','homeMultiBtnMobile'].forEach(id=>{
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
  hideWaitModal();
  closeMultiModal();
  closeLobbyModal();
  el('game').classList.remove('on');
  el('setup').classList.remove('on');
  el('home').style.display='flex';
}

function goSetup(mode='single'){
  gs.setupMode=mode;
  closeMultiModal();
  el('home').style.display='none';
  el('setup').classList.add('on');
  updateSetupMode();
}

function updateSetupMode(){
  const label=el('setupModeLabel');
  const hint=el('setupRoomHint');
  const sub=el('setupSub');
  const start=el('sbtn');
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
}

function buildSetup(){
  const grid=el('cgrid');
  grid.innerHTML='';
  Object.values(CANDS).forEach(c=>{
    const card=document.createElement('div');
    card.className='cand-card';
    card.dataset.id=c.id;
    card.style.borderColor=c.color+'66';
    card.innerHTML=`
      <div class="cand-photo"><img src="${PORTRAITS[c.id]||''}" alt="${c.n}"></div>
      <div class="cand-color-bar" style="background:${c.color}"></div>
      <div class="cand-body">
        <div class="cand-name">${c.n}</div>
        <div class="cand-party">${c.party}</div>
      </div>
      <div class="sel-check" style="color:${c.color}">✓</div>`;
    card.onclick=()=>{
      document.querySelectorAll('.cand-card').forEach(x=>x.classList.remove('selected'));
      card.classList.add('selected');
      gs.pId=c.id;
      el('sbtn').classList.add('ready');
      el('sbtn').style.background=c.color;
    };
    grid.appendChild(card);
  });
  updateSetupMode();
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

function openLobbyModal(message){
  el('lobbyStatus').textContent=message;
  el('lobbyCode').textContent=gs.roomCode||'------';
  el('lobbymodal').classList.add('on');
}

function closeLobbyModal(){
  el('lobbymodal').classList.remove('on');
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
    log(error?.message||'No pudimos iniciar la partida.','s');
  }finally{
    start.disabled=false;
  }
}

function startSinglePlayerGame(){
  resetDeptState();
  clearUndo();
  resetTurnActions();
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
    const inserted=await sb.from('games').insert({code,max_turns:10}).select().single();
    if(!inserted.error){
      game=inserted.data;
      gs.roomCode=code;
      break;
    }
  }
  if(!game)throw new Error('No pudimos crear la sala.');
  gs.gameId=game.id;
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
  gs.gameId=gameRes.data.id;
  gs.roomCode=code;
  const playersRes=await sb.from('players').select('*').eq('game_id',gs.gameId);
  if(playersRes.error)throw playersRes.error;
  const players=playersRes.data||[];
  if(players.length>=2)throw new Error('La sala ya esta llena.');
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
  await ensureMultiplayerActivation();
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
  return gs.multiPlayers;
}

async function refreshOwnPlayerResources(){
  if(!gs.playerId)return;
  const playerRes=await sb.from('players').select('*').eq('id',gs.playerId).single();
  if(playerRes.error||!playerRes.data)return;
  gs.pCP=playerRes.data.cp;
  gs.pCR=playerRes.data.cr;
}

async function ensureMultiplayerActivation(){
  const players=await refreshMultiplayerPlayers();
  if(players.length<2)return;
  await sb.from('games').update({status:'active'}).eq('id',gs.gameId).eq('status','waiting');
}

async function onPlayersChanged(){
  const players=await refreshMultiplayerPlayers();
  if(players.length>=2){
    await ensureMultiplayerActivation();
  }
}

async function bootstrapMultiplayerBoard(){
  if(gs.boardStarted)return;
  gs.boardStarted=true;
  gs.round=1;
  gs.turn=1;
  gs.maxTurns=10;
  gs.eliminatedIds=[];
  await refreshMultiplayerPlayers();
  await refreshOwnPlayerResources();
  showBoard();
  await syncGroups();
  closeLobbyModal();
  log(`Sala ${gs.roomCode} activa. Los dos jugadores ya pueden mover.`,'s');
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
  const playerUpdate=await sb.from('players').update({cp:gs.pCP,cr:gs.pCR,turn_done:true}).eq('id',gs.playerId);
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

function beginPlayerTurn(){
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
      const hit=Math.random()<(best.g.reinforced?0.3:0.52);
      if(hit){
        best.g.owner=aiId;
        best.g.reinforced=false;
        log(`${ac.short} captura ${GP[best.g.id].n} — ${d.n}`,'la');
      }else{
        log(`${ac.short} falla en ${GP[best.g.id].n} — ${d.n}`,'la');
      }
    }else{
      best.g.owner=aiId;
      log(`${ac.short} activa ${GP[best.g.id].n} — ${d.n}`,'la');
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
    if(g.owner===aiId)return;
    const cost=groupCost(ac,g.id);
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
    if(g.owner===aiId)return;
    if(!g.owner){
      const cost=groupCost(ac,g.id);
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
  beginPlayerTurn();
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
  el('r2sub').textContent=qual?'Clasificaste. Los grupos de eliminados quedan libres.':'No clasificaste. El juego continúa sin ti.';
  el('r2modal').classList.add('on');
}

function continueR2(){
  el('r2modal').classList.remove('on');
  gs.eliminatedIds=[...gs.elimToProcess];
  gs.activeIds=gs.r2top2;
  Object.values(DEPTS).forEach(dept=>dept.groups.forEach(g=>{
    if(g.owner&&gs.eliminatedIds.includes(g.owner)){
      g.owner=null;
      g.reinforced=false;
    }
  }));
  gs.pCP=28;
  gs.activeIds.forEach(id=>{gs.aiCP[id]=28;});
  gs.round=2;
  gs.turn=1;
  gs.maxTurns=5;
  el('ptag').textContent='Segunda Vuelta';
  el('ptag').classList.add('r2');
  const toast=el('roundtoast');
  toast.textContent='SEGUNDA VUELTA';
  toast.classList.add('vis');
  setTimeout(()=>toast.classList.remove('vis'),3000);
  buildRankings();
  buildVoteBar();
  updateMap();
  updateUI();
  if(gs.selDept)renderPanel(gs.selDept);
  log('━━ SEGUNDA VUELTA — Grupos liberados disponibles','s');
  beginPlayerTurn();
}

function groupCost(cand,gId){
  if(!GP[gId])return 7;
  const g=GP[gId].p;
  const c=cand.p;
  const d=Math.abs(c.e-g.e)+Math.abs(c.s-g.s)+Math.abs(c.c-g.c)+Math.abs(c.v-g.v)+Math.abs(c.t-g.t);
  return d<=3?4:d<=7?7:12;
}

function applyPendingMark(group){
  if(isMultiMode())group.pending=true;
}

function activateGroup(deptId,gIdx){
  if(!gs.isPlayerTurn)return;
  const dept=DEPTS[deptId];
  const g=dept.groups[gIdx];
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
  }else if(!g.owner){
    const cost=groupCost(pc,g.id);
    if(gs.pCP<cost){undoStack.pop();log(`CP insuficiente — necesitas ${cost}`,'s');return;}
    g.owner=gs.pId;
    applyPendingMark(g);
    gs.pCP-=cost;
    queueTurnAction({action_type:'activate',dept_id:deptId,group_idx:gIdx});
    log(`✓ Activas ${GP[g.id].n} en ${dept.n} (-${cost} CP)`,'p');
  }else{
    if(gs.pCP<6){undoStack.pop();log('Necesitas 6 CP para atacar','s');return;}
    gs.pCP-=6;
    if(isMultiMode()){
      g.owner=gs.pId;
      g.reinforced=false;
      g.pending=true;
      queueTurnAction({action_type:'attack',dept_id:deptId,group_idx:gIdx});
      log(`⚔ Ataque programado sobre ${GP[g.id].n} en ${dept.n}`,'p');
    }else{
      const hit=Math.random()<(g.reinforced?0.3:0.6);
      if(hit){
        g.owner=gs.pId;
        g.reinforced=false;
        log(`✓ Capturas ${GP[g.id].n} en ${dept.n}`,'p');
      }else{
        log(`✗ Fallas en capturar ${GP[g.id].n}`,'p');
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
  const pc=CANDS[gs.pId];
  const orig=groupCost(pc,g.id);
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
  updateUI();
  renderPanel(deptId);
  updateMap();
}

function getPct(id){
  let total=0;
  Object.values(DEPTS).forEach(dept=>{
    const tw=dept.groups.reduce((s,g)=>s+g.w,0);
    const ow=dept.groups.filter(g=>g.owner===id).reduce((s,g)=>s+g.w,0);
    if(tw>0)total+=(ow/tw)*dept.weight;
  });
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
  const ids=isMultiMode()&&gs.activeIds.length?gs.activeIds:Object.keys(CANDS);
  ids.forEach(id=>{
    const c=CANDS[id];
    const elim=gs.eliminatedIds.includes(id);
    const pct=getPct(id);
    const row=document.createElement('div');
    row.className=`rank-row ${elim?'elim':''}`;
    row.id=`rrow-${id}`;
    row.innerHTML=`<div class="rdot" style="background:${c.color}"></div>
      <div class="rname">${c.short}</div>
      <div class="rbar"><div class="rbarfill" id="rbf-${id}" style="background:${c.color};width:${Math.min(pct/50*100,100)}%"></div></div>
      <div class="rpct" id="rp-${id}" style="color:${c.color}">${pct.toFixed(1)}%</div>
      <div class="rvotes" id="rv-${id}">${fmtV(pct)}</div>`;
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
  Object.keys(CANDS).forEach(id=>{
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
    const isP=g.owner===gs.pId;
    const isFree=!g.owner;
    const ownC=g.owner?CANDS[g.owner]:null;
    const actCost=groupCost(pc,g.id);
    const canPlay=gs.isPlayerTurn;
    const pending=g.pending?' · pendiente':'';
    let st='';
    if(isFree)st=`<span style="color:var(--muted)">Sin representación${pending}</span>`;
    else if(isP)st=`<span style="color:${ownC.color}">● Tuyo${g.reinforced?' · reforzado':''}${pending}</span>`;
    else st=`<span style="color:${ownC.color}">● ${ownC.short}${g.reinforced?' · reforzado':''}${pending}</span>`;
    let btns='';
    if(isFree){
      const ok=gs.pCP>=actCost&&canPlay;
      const okC=gs.pCR>=25&&actCost>4&&gs.pCP>=(actCost-3)&&canPlay;
      btns=`<button class="gbtn act" onclick="activateGroup('${deptId}',${idx})" ${!ok?'disabled':''}>Activar <span class="cbadge">${actCost}</span></button>
        ${actCost>4?`<button class="gbtn con" onclick="makeConc('${deptId}',${idx})" ${!okC?'disabled':''}>Concesión <span class="cbadge">${actCost-3}</span></button>`:''}`;
    }else if(isP){
      const ok=gs.pCP>=3&&!g.reinforced&&canPlay;
      btns=`<button class="gbtn rfz" onclick="activateGroup('${deptId}',${idx})" ${!ok?'disabled':''}>Reforzar <span class="cbadge">3</span></button>`;
    }else{
      const ok=gs.pCP>=6&&canPlay;
      btns=`<button class="gbtn atk" onclick="activateGroup('${deptId}',${idx})" ${!ok?'disabled':''}>Atacar <span class="cbadge">6</span></button>`;
    }
    const card=document.createElement('div');
    card.className='gcard';
    if(ownC)card.style.borderColor=ownC.color+'55';
    card.innerHTML=`<div class="ghead"><div class="gname">${gp.i} ${gp.n}</div><div class="gwt">${Math.round(g.w)}% local</div></div>
      <div class="gstatus">${st}</div><div class="gbtns">${btns}</div>`;
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
