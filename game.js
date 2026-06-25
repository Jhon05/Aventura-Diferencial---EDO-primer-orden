(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const TILE = 32;
  const TYPES = {
    grass:0, path:1, water:2, forest:3, cliff:4, bridge:5, flower:6, stone:7, sand:8,
    floor:9, wall:10, lava:11, ice:12, cracked:13, dark:14, current:15, ash:16, snow:17, pit:18, ladder:19
  };
  const SOLID = new Set([TYPES.water, TYPES.forest, TYPES.cliff, TYPES.stone, TYPES.wall, TYPES.lava, TYPES.pit]);
  const TOPICS = ['pvi','separables','exactas','lineales','aplicaciones'];
  const SCORE_CORRECT = 0.1;
  const SCORE_WRONG = -0.1;

  const els = {
    root: document.getElementById('game-root'),
    menu: document.getElementById('main-menu'),
    startBtn: document.getElementById('startBtn'),
    howToBtn: document.getElementById('howToBtn'),
    closeHowTo: document.getElementById('closeHowTo'),
    howToPanel: document.getElementById('howToPanel'),
    routeBtn: document.getElementById('routeBtn'),
    closeRoute: document.getElementById('closeRoute'),
    routePanel: document.getElementById('routePanel'),
    hud: document.getElementById('hud'),
    hearts: document.getElementById('hearts'), // V13: oculto/sin vidas
    gradeText: document.getElementById('gradeText'),
    sealsText: document.getElementById('sealsText'),
    correctText: document.getElementById('correctText'),
    wrongText: document.getElementById('wrongText'),
    chapterText: document.getElementById('chapterText'),
    hintText: document.getElementById('hintText'),
    compass: document.getElementById('compass'),
    compassArrow: document.getElementById('compassArrow'),
    compassLabel: document.getElementById('compassLabel'),
    worldRestartBox: document.getElementById('worldRestartBox'),
    worldRestartBtn: document.getElementById('worldRestartBtn'),
    finishGameBtn: document.getElementById('finishGameBtn'),
    toast: document.getElementById('toast'),
    securityPanel: document.getElementById('securityPanel'),
    securityMessageText: document.getElementById('securityMessageText'),
    securitySignalsText: document.getElementById('securitySignalsText'),
    teacherPasswordInput: document.getElementById('teacherPasswordInput'),
    unlockSecurityBtn: document.getElementById('unlockSecurityBtn'),
    qModal: document.getElementById('questionModal'),
    qTopic: document.getElementById('qTopic'),
    qType: document.getElementById('qType'),
    qTitle: document.getElementById('qTitle'),
    qPrompt: document.getElementById('qPrompt'),
    qAnswerArea: document.getElementById('qAnswerArea'),
    hintBtn: document.getElementById('hintBtn'),
    submitAnswer: document.getElementById('submitAnswer'),
    closeQuestionBtn: document.getElementById('closeQuestionBtn'),
    qHint: document.getElementById('qHint'),
    qFeedback: document.getElementById('qFeedback'),
    reportPanel: document.getElementById('reportPanel'),
    reportBody: document.getElementById('reportBody'),
    continueBtn: document.getElementById('continueBtn'),
    printBtn: document.getElementById('printBtn'),
    restartBtn: document.getElementById('restartBtn'),
    downloadJsonBtn: document.getElementById('downloadJsonBtn'),
    rescuePanel: document.getElementById('rescuePanel'),
    rescueRestartBtn: document.getElementById('rescueRestartBtn'),
    victoryPanel: document.getElementById('victoryPanel'),
    victoryReportBtn: document.getElementById('victoryReportBtn'),
    mobileControls: document.getElementById('mobileControls'),
    mobileAction: document.getElementById('mobileAction'),
    mobileMap: document.getElementById('mobileMap'),
    studentName: document.getElementById('studentName'),
    controlMode: document.getElementById('controlMode')
  };

  const state = {
    mode:'menu',
    scene:null,
    world:null,
    player:{x:10*TILE,y:42*TILE,w:21,h:24,dir:'down',speed:120,step:0,sliding:false,slideVx:0,slideVy:0,slideLock:0},
    keys:{},
    touch:{up:false,down:false,left:false,right:false},
    camera:{x:0,y:0},
    grade:0,
    lives:3,
    seals:[],
    inventory:[],
    correct:0,
    wrong:0,
    answered:[],
    usedQuestions:{},
    currentQuestion:null,
    currentEntity:null,
    currentTopic:'pvi',
    returnPoint:{x:10*TILE,y:42*TILE},
    showMap:false,
    mobile:false,
    toastTimer:0,
    rngSeed:123456789,
    startTime:null,
    elapsed:0,
    studentName:'Estudiante',
    brokenFloors:new Set(),
    onBoat:false,
    currentBoat:null,
    autoSubmitting:false,
    trapped:false,
    trapTile:null,
    trapTopic:null,
    lastSafe:{x:10*TILE,y:42*TILE},
    trapAttempts:0,
    trapLadderVisible:false,
    seaCurrentTimer:0,
    seaCurrentAnchor:null,
    firePenaltyCooldown:0,
    stuckReason:'',
    pendingQuestionOutcome:null,
    bossFailureCount:0,
    reportDownloaded:false,
    gameCompleted:false,
    teacherUnlocked:false,
    securityLocked:false,
    securityMessage:'',
    securitySignals:0,
    quizInvalidated:false,
    worldScoreGain:{},
    securityUnlockRequired:false,
    lastSecuritySignalAt:0
  };

  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function lerp(a,b,t){return a+(b-a)*t;}
  function rand(){state.rngSeed=(1664525*state.rngSeed+1013904223)>>>0;return state.rngSeed/4294967296;}
  function choose(arr){return arr[Math.floor(rand()*arr.length)];}
  function tileAt(scene,tx,ty){if(!scene||tx<0||ty<0||tx>=scene.w||ty>=scene.h)return TYPES.wall;return scene.tiles[ty][tx];}
  function setTile(scene,tx,ty,val){if(tx>=0&&ty>=0&&tx<scene.w&&ty<scene.h)scene.tiles[ty][tx]=val;}
  function rectsOverlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
  function center(e){return {x:e.x+e.w/2,y:e.y+e.h/2};}

  function resize(){
    const ratio=window.devicePixelRatio||1;
    const w=window.innerWidth,h=window.innerHeight;
    canvas.width=Math.round(w*ratio); canvas.height=Math.round(h*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.imageSmoothingEnabled=false;
  }

  function init(){
    resize();
    window.addEventListener('resize',resize);
    bindControls();
    state.world=buildWorld();
    state.scene=state.world;
    updateHUD();
    requestAnimationFrame(loop);
  }

  function bindControls(){
    window.addEventListener('keydown',e=>{
      const k=e.key.toLowerCase();
      if(e.ctrlKey && e.altKey && k==='d'){
        e.preventDefault();
        promptTeacherAccess('Acceso docente');
        return;
      }
      if(shouldBlockShortcut(e) && !state.teacherUnlocked){
        e.preventDefault();
        showToast('Acción bloqueada durante la actividad.',2.2);
        return;
      }
      if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' ','e','m','r','escape','printscreen'].includes(k)) e.preventDefault();
      state.keys[k]=true;
      if(state.mode!=='menu' && !!state.startTime && !state.teacherUnlocked && k==='escape'){
        triggerSecurityLock('Bloqueo por salida con Escape.', 'Actividad bloqueada. Presionaste Escape; escriba la contraseña docente para continuar.');
        closeTopPanel();
        return;
      }
      if(state.mode!=='menu' && !!state.startTime && !state.teacherUnlocked && k==='printscreen'){
        triggerSecurityLock('Bloqueo por pantallazo.', 'Actividad bloqueada por intento de pantallazo; escriba la contraseña docente para continuar.');
        return;
      }
      if(state.mode==='playing' && !state.securityLocked){
        if(k==='e'||k===' ') interact();
        if(k==='m'){state.showMap=!state.showMap;showToast(state.showMap?'Mapa abierto.':'Mapa cerrado.');}
        if(k==='r') showReport(false);
      }
      if(k==='escape') closeTopPanel();
    });
    window.addEventListener('keyup',e=>{state.keys[e.key.toLowerCase()]=false;});
    document.addEventListener('contextmenu',e=>{
      if(state.mode!=='menu' && !!state.startTime && !state.teacherUnlocked){
        e.preventDefault();
        triggerSecurityLock('Bloqueo por clic derecho.', 'Actividad bloqueada por clic derecho; escriba la contraseña docente para continuar.');
      }
    });
    ['dragstart','selectstart'].forEach(evt=>document.addEventListener(evt,e=>{
      if(state.mode!=='menu' && !state.teacherUnlocked){
        e.preventDefault();
      }
    }));
    ['copy','cut','paste'].forEach(evt=>document.addEventListener(evt,e=>{
      if(state.mode!=='menu' && !state.teacherUnlocked && e.target!==els.studentName){
        e.preventDefault();
        showToast('Acción bloqueada durante la actividad.',1.8);
      }
    }));

    els.startBtn.addEventListener('click',startGame);
    els.howToBtn.addEventListener('click',()=>els.howToPanel.classList.remove('hidden'));
    els.closeHowTo.addEventListener('click',()=>els.howToPanel.classList.add('hidden'));
    els.routeBtn.addEventListener('click',()=>els.routePanel.classList.remove('hidden'));
    els.closeRoute.addEventListener('click',()=>els.routePanel.classList.add('hidden'));
    els.closeQuestionBtn.addEventListener('click',e=>{
      e.preventDefault();
      if(state.pendingQuestionOutcome){ resolveQuestionOutcome(); return; }
      showToast('Debes responder la pregunta para poder continuar.',2.5);
    });
    els.hintBtn.addEventListener('click',showQuestionHint);
    els.submitAnswer.addEventListener('click',submitAnswer);
    els.continueBtn.addEventListener('click',()=>{els.reportPanel.classList.add('hidden');state.mode='playing';});
    els.printBtn.addEventListener('click',()=>{if(requireTeacherAccess('Imprimir o guardar informe')) window.print();});
    els.restartBtn.addEventListener('click',()=>{if(requireTeacherAccess('Reiniciar la actividad')) location.reload();});
    els.downloadJsonBtn.addEventListener('click',()=>{if(requireTeacherAccess('Descargar JSON del informe')) downloadReportJson();});
    els.rescueRestartBtn.addEventListener('click',()=>restartCurrentDungeonPenalty('Reinicio manual del mundo'));
    els.worldRestartBtn.addEventListener('click',()=>restartCurrentDungeonPenalty('Reinicio manual del mundo'));
    els.finishGameBtn.addEventListener('click',()=>{if(requireTeacherAccess('Finalizar juego')) finishGameManually();});
    els.victoryReportBtn.addEventListener('click',finalizeVictoryReport);
    els.mobileAction.addEventListener('click',interact);
    els.mobileMap.addEventListener('click',()=>{state.showMap=!state.showMap;showToast(state.showMap?'Mapa abierto.':'Mapa cerrado.');});
    document.querySelectorAll('.dpad button').forEach(btn=>{
      const dir=btn.dataset.dir;
      const set=v=>{state.touch[dir]=v;};
      btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);set(true);});
      btn.addEventListener('pointerup',e=>{e.preventDefault();set(false);});
      btn.addEventListener('pointercancel',()=>set(false));
      btn.addEventListener('pointerleave',()=>set(false));
    });
  }

  function closeTopPanel(){
    if(!els.qModal.classList.contains('hidden')) {showToast('Debes responder la pregunta para poder continuar.',2.5); return;}
    if(!els.rescuePanel.classList.contains('hidden')) return;
    if(!els.reportPanel.classList.contains('hidden')){els.reportPanel.classList.add('hidden');state.mode='playing';return;}
    if(!els.howToPanel.classList.contains('hidden')){els.howToPanel.classList.add('hidden');return;}
    if(!els.routePanel.classList.contains('hidden')){els.routePanel.classList.add('hidden');return;}
  }

  function startGame(){
    requestGameFullscreen();
    state.studentName=els.studentName.value.trim()||'Estudiante';
    const mode=els.controlMode.value;
    state.mobile=mode==='mobile'||(mode==='auto'&&(matchMedia('(pointer:coarse)').matches||window.innerWidth<760));
    els.mobileControls.classList.toggle('hidden',!state.mobile);
    els.menu.classList.add('hidden');
    els.hud.classList.remove('hidden');
    els.compass.classList.remove('hidden');
    els.worldRestartBox.classList.add('hidden');
    els.root.classList.remove('menu-mode');
    state.mode='playing';
    state.startTime=Date.now();
    state.player.x=10*TILE; state.player.y=42*TILE;
    state.lastSafe={x:state.player.x,y:state.player.y};
    state.scene=state.world;
    resetSeaCurrentTracker();
    SCORM?.init?.();
    showToast('Explora el reino. Las rutas tienen trampas: responde preguntas o empuja piedras para construir pasos seguros.');
    updateHUD();
    handleSecurityState();
  }

  function requestGameFullscreen(){
    const el=document.documentElement;
    if(!document.fullscreenElement && el.requestFullscreen){
      el.requestFullscreen().catch(()=>showToast('Para una experiencia de examen, activa pantalla completa si el navegador lo solicita.',3));
    }
  }

  function shouldBlockShortcut(e){
    const k=(e.key||'').toLowerCase();
    return e.key==='F12' || (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(k)) || (e.ctrlKey && ['u','s','p'].includes(k)) || (e.metaKey && ['s','p'].includes(k));
  }

  function militaryPassword(date=new Date()){
    return `${String(date.getHours()).padStart(2,'0')}${String(date.getMinutes()).padStart(2,'0')}`;
  }

  function validTeacherPasswords(){
    return Array.from(new Set([-1,0,1].map(offset=>militaryPassword(new Date(Date.now()+offset*60000)))));
  }

  function promptTeacherAccess(reason='Acción docente'){
    const raw=window.prompt(`${reason}
Acceso restringido.`);
    if(raw===null) return false;
    const attempt=String(raw).trim().replace(/\s+/g,'');
    if(validTeacherPasswords().includes(attempt)){
      state.teacherUnlocked=true;
      showToast('Acceso docente concedido.',2.2);
      return true;
    }
    showToast('Contraseña docente incorrecta.',2.5);
    return false;
  }

  function requireTeacherAccess(reason){
    return state.teacherUnlocked || promptTeacherAccess(reason);
  }

  function shouldSecurityLock(){
    return !!state.securityLocked;
  }

  function addSecuritySignal(reason){
    if(state.mode==='menu' || !state.startTime || state.teacherUnlocked || state.quizInvalidated) return false;
    const now=Date.now();
    if(now-state.lastSecuritySignalAt<1200) return false;
    state.lastSecuritySignalAt=now;
    state.securitySignals++;
    state.securityMessage = `${reason} Señal ${state.securitySignals}/5.`;
    updateSecurityPanel();
    if(state.securitySignals>5){
      invalidateQuiz('Superaste el máximo de 5 señales de bloqueo.');
    }
    return true;
  }

  function triggerSecurityLock(reason, message){
    const counted=addSecuritySignal(reason);
    if(state.quizInvalidated) return;
    state.securityLocked=true;
    state.securityUnlockRequired=true;
    state.securityMessage = message || 'Actividad bloqueada. Escriba la contraseña docente para continuar.';
    updateSecurityPanel();
    if(counted) showToast(state.securityMessage,3);
  }

  function invalidateQuiz(reason){
    state.quizInvalidated=true;
    state.securityLocked=true;
    state.securityUnlockRequired=true;
    state.grade=0;
    state.securityMessage=`${reason} El quiz fue anulado con nota 0.`;
    updateHUD();
    updateSecurityPanel();
    SCORM?.saveScore?.(state.grade,state.answered);
    SCORM?.finish?.();
    showToast('Quiz anulado: superaste el máximo de señales de bloqueo. Nota 0.',5);
  }

  function updateSecurityPanel(){
    if(!els.securityPanel) return;
    els.securityPanel.classList.toggle('hidden', !state.securityLocked);
    els.securityPanel.classList.toggle('quiz-invalidated', !!state.quizInvalidated);
    els.securityMessageText.textContent=state.securityMessage || 'Actividad bloqueada. Escriba la contraseña docente para continuar.';
    els.securitySignalsText.textContent=`${Math.min(state.securitySignals,6)}/5`;
  }

  function unlockSecurityWithPassword(){
    if(state.quizInvalidated){
      showToast('El quiz ya fue anulado con nota 0. No se puede continuar.',3);
      return;
    }
    const attempt=(els.teacherPasswordInput?.value||'').trim().replace(/\s+/g,'');
    if(validTeacherPasswords().includes(attempt)){
      state.securityLocked=false;
      state.securityUnlockRequired=false;
      state.securityMessage='';
      els.teacherPasswordInput.value='';
      updateSecurityPanel();
      showToast('Validación docente correcta. Puedes continuar.',2.2);
    } else {
      addSecuritySignal('Contraseña docente incorrecta.');
      if(!state.quizInvalidated){
        state.securityLocked=true;
        state.securityUnlockRequired=true;
        state.securityMessage='Contraseña incorrecta. Escriba la contraseña docente para continuar.';
        updateSecurityPanel();
        showToast('Contraseña docente incorrecta.',2.5);
      }
    }
  }

  function handleSecurityState(){
    updateSecurityPanel();
  }

  function finishGameManually(){
    if(state.gameCompleted || state.grade>=5){
      showReport(true);
    } else {
      showToast('Finalizaste el intento. Se generará el informe con la nota actual.',2.5);
      showReport(false);
    }
  }

  function newScene(id,name,w,h,fill,element='world'){
    return {id,name,w,h,element,tiles:Array.from({length:h},()=>Array.from({length:w},()=>fill)),entities:[],particles:[],decor:[],kind:'world'};
  }

  function buildWorld(){
    const s=newScene('world','Reino del Primer Corte',88,58,TYPES.grass);
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){
      if(rand()<.06)s.decor.push({x:x*TILE+4+Math.floor(rand()*24),y:y*TILE+4+Math.floor(rand()*24)});
      if(rand()<.012)setTile(s,x,y,TYPES.flower);
    }
    for(let x=0;x<s.w;x++){setTile(s,x,0,TYPES.cliff);setTile(s,x,1,TYPES.cliff);setTile(s,x,s.h-1,TYPES.forest);}
    for(let y=0;y<s.h;y++){setTile(s,0,y,TYPES.cliff);setTile(s,1,y,TYPES.cliff);setTile(s,s.w-1,y,TYPES.cliff);}
    for(let x=12;x<76;x++)for(let y=2;y<7;y++)if(rand()>.16)setTile(s,x,y,TYPES.cliff);

    // río y lago
    for(let y=8;y<54;y++){
      const cx=55+Math.round(Math.sin(y/4.8)*3+Math.sin(y/2.5)*1.4);
      for(let dx=-2;dx<=2;dx++)setTile(s,cx+dx,y,TYPES.water);
    }
    for(let x=62;x<82;x++)for(let y=35;y<51;y++){
      if(Math.hypot((x-72)/1.5,(y-43))<8.2)setTile(s,x,y,TYPES.water);
    }
    for(let y=25;y<=29;y++)for(let x=52;x<=59;x++)setTile(s,x,y,TYPES.bridge);
    for(let x=67;x<=71;x++)for(let y=40;y<=42;y++)setTile(s,x,y,TYPES.bridge);

    path(s,[[10,42],[18,39],[22,32],[25,24],[22,18]],2);
    path(s,[[22,32],[34,34],[43,34],[52,28],[66,22]],2);
    path(s,[[43,34],[42,27],[41,18],[41,10]],2);
    path(s,[[43,34],[50,44],[66,44],[73,43]],2);
    path(s,[[10,42],[10,50],[26,50],[44,50],[60,46],[73,43]],2);

    forestBlob(s,16,19,8,8); forestBlob(s,30,32,8,6); forestBlob(s,14,53,10,4);
    forestBlob(s,76,18,8,8); forestBlob(s,78,54,12,6); forestBlob(s,7,9,5,5);
    sandPatch(s,22,18,8,6); sandPatch(s,66,22,9,6); sandPatch(s,73,43,9,6);
    sandPatch(s,41,10,9,6); sandPatch(s,43,34,8,5);

    // zonas elementales decorativas
    for(let x=17;x<28;x++)for(let y=15;y<24;y++)if(Math.hypot((x-22)/1.3,(y-19))<5)setTile(s,x,y,TYPES.grass);
    for(let x=62;x<72;x++)for(let y=18;y<26;y++)if(Math.hypot((x-66)/1.4,(y-22))<4.7)setTile(s,x,y,TYPES.ash);
    for(let x=68;x<80;x++)for(let y=39;y<48;y++)if(Math.hypot((x-73)/1.5,(y-43))<5.2)setTile(s,x,y,TYPES.snow);

    clearArea(s,10,42,5,4,TYPES.path);
    clearArea(s,22,18,5,4,TYPES.path);
    clearArea(s,43,34,5,4,TYPES.path);
    clearArea(s,66,22,5,4,TYPES.path);
    clearArea(s,73,43,5,4,TYPES.path);
    clearArea(s,41,10,5,4,TYPES.path);

    s.entities.push(
      npc('npc_intro',12,42,'Guía del Reino','pvi','Cada sello tiene una región con trampas. Empuja piedras, evita pisos que se rompen y usa la brújula.'),
      entrance('d_pvi',10,42,'Bosque del PVI','pvi',0),
      entrance('d_sep',22,18,'Mar de Variables Separables','separables',1),
      entrance('d_exact',43,34,'Cueva Exacta','exactas',2),
      entrance('d_lin',66,22,'Volcán Lineal','lineales',3),
      entrance('d_app',73,43,'Cielo de Aplicaciones','aplicaciones',4),
      entrance('d_boss',41,10,'Pirámide Central del Primer Parcial','boss',5),
      sign('sign1',16,45,'Ruta: Bosque → Mar → Cueva → Volcán → Cielo → Pirámide central del Primer Parcial.'),
      sign('sign2',50,30,'La brújula indica el objetivo, pero debes resolver el camino.'),
      chest('world_chest',15,40,'pvi')
    );
    return s;
  }

  function path(scene,pts,r=1){
    for(let i=0;i<pts.length-1;i++){
      const [x0,y0]=pts[i], [x1,y1]=pts[i+1];
      const steps=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2;
      for(let s=0;s<=steps;s++){
        const t=s/steps; const x=Math.round(lerp(x0,x1,t)), y=Math.round(lerp(y0,y1,t));
        for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)if(Math.hypot(dx,dy)<=r+.4)setTile(scene,x+dx,y+dy,TYPES.path);
      }
    }
  }
  function forestBlob(scene,cx,cy,rx,ry){for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){const d=Math.hypot((x-cx)/rx,(y-cy)/ry);if(d<1&&rand()>.1&&![TYPES.path,TYPES.bridge].includes(tileAt(scene,x,y)))setTile(scene,x,y,TYPES.forest);}}
  function sandPatch(scene,cx,cy,rx,ry){for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){const d=Math.hypot((x-cx)/rx,(y-cy)/ry);if(d<1&&![TYPES.water,TYPES.bridge].includes(tileAt(scene,x,y)))setTile(scene,x,y,TYPES.sand);}}
  function clearArea(scene,cx,cy,rx,ry,type){for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++)setTile(scene,x,y,type);}
  function placeTrapField(scene, coords){ coords.forEach(([x,y])=>{ if(tileAt(scene,x,y)!==TYPES.wall && tileAt(scene,x,y)!==TYPES.water && tileAt(scene,x,y)!==TYPES.forest && tileAt(scene,x,y)!==TYPES.cliff && tileAt(scene,x,y)!==TYPES.lava && tileAt(scene,x,y)!==TYPES.ice){ setTile(scene,x,y,TYPES.cracked); } }); }
  function groundTileForScene(scene){
    if(scene.topic==='separables') return TYPES.sand;
    if(scene.topic==='exactas') return TYPES.dark;
    if(scene.topic==='lineales') return TYPES.ash;
    if(scene.topic==='aplicaciones') return TYPES.snow;
    if(scene.topic==='pvi') return TYPES.path;
    return TYPES.floor;
  }
  function trapLattice(scene, x0,y0,x1,y1, skip=3){
    const coords=[];
    for(let y=y0;y<=y1;y++){
      for(let x=x0;x<=x1;x++){
        const t=tileAt(scene,x,y);
        if([TYPES.path,TYPES.floor,TYPES.ash,TYPES.dark,TYPES.snow,TYPES.sand].includes(t) && ((x*2+y)%skip===0)) coords.push([x,y]);
      }
    }
    placeTrapField(scene, coords);
  }

  function trapLine(scene,x0,y0,x1,y1){
    const coords=[];
    const steps=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));
    for(let i=0;i<=steps;i++){
      const t=steps?i/steps:0;
      coords.push([Math.round(lerp(x0,x1,t)),Math.round(lerp(y0,y1,t))]);
    }
    placeTrapField(scene, coords);
  }

  function trapBox(scene,x0,y0,x1,y1){
    const coords=[];
    for(let x=x0;x<=x1;x++){ coords.push([x,y0],[x,y1]); }
    for(let y=y0+1;y<=y1-1;y++){ coords.push([x0,y],[x1,y]); }
    placeTrapField(scene, coords);
  }

  function isPushableGround(t){
    return [TYPES.path,TYPES.floor,TYPES.ash,TYPES.dark,TYPES.snow,TYPES.sand,TYPES.grass,TYPES.bridge].includes(t);
  }

  function hasBoulderAt(scene,tx,ty){
    return scene.entities.some(e=>e.active&&e.type==='boulder'&&Math.floor((e.x+e.w/2)/TILE)===tx&&Math.floor((e.y+e.h/2)/TILE)===ty);
  }

  function addBoulderIfUseful(scene,id,tx,ty,topic){
    const t=tileAt(scene,tx,ty);
    if(!isPushableGround(t) || t===TYPES.cracked || t===TYPES.pit || hasBoulderAt(scene,tx,ty)) return false;
    scene.entities.push(boulder(id,tx,ty,topic));
    return true;
  }

  function fortifyChallenge(scene,topic,type,x,y,index){
    // V15: ahora TODOS los cofres, bestias mitológicas y jefes quedan más protegidos.
    // Se forman dobles anillos y pequeñas barreras de acceso, de modo que el estudiante
    // deba responder preguntas o cubrir trampas con piedras antes de pasar.
    const rx=type==='boss'?4:3;
    const ry=type==='boss'?4:3;
    const ox=rx+1;
    const oy=ry+1;
    trapBox(scene,x-rx,y-ry,x+rx,y+ry);
    trapBox(scene,x-ox,y-oy,x+ox,y+oy);
    trapLine(scene,x-ox,y,x-rx,y);
    trapLine(scene,x+rx,y,x+ox,y);
    trapLine(scene,x,y-oy,x,y-ry);
    trapLine(scene,x,y+ry,x,y+oy);
    placeTrapField(scene,[
      [x-2,y-1],[x-1,y-2],[x+1,y-2],[x+2,y-1],
      [x-2,y+1],[x-1,y+2],[x+1,y+2],[x+2,y+1],
      [x-rx+1,y],[x+rx-1,y],[x,y-ry+1],[x,y+ry-1],
      [x-rx,y-1],[x-rx,y+1],[x+rx,y-1],[x+rx,y+1],
      [x-1,y-ry],[x+1,y-ry],[x-1,y+ry],[x+1,y+ry],
      [x-ox+1,y],[x+ox-1,y],[x,y-oy+1],[x,y+oy-1]
    ]);
    setTile(scene,x,y,groundTileForScene(scene));

    // Piedras de solución: más opciones para que se puedan usar de forma estratégica,
    // pero sin dejar el acceso trivial.
    const b=[
      [x-ox-1,y], [x+ox+1,y], [x,y-oy-1], [x,y+oy+1],
      [x-ox-1,y-1], [x+ox+1,y+1], [x-ox,y+oy+1], [x+ox,y-oy-1]
    ];
    b.forEach((p,j)=>addBoulderIfUseful(scene,`gate_${topic}_${index}_${j}`,p[0],p[1],topic));
  }

  function baseEntity(id,type,tx,ty,topic){return {id,type,topic,x:tx*TILE+4,y:ty*TILE+4,w:24,h:24,active:true,solved:false,t:rand()*10};}
  function npc(id,tx,ty,name,topic,text){return {...baseEntity(id,'npc',tx,ty,topic),name,text};}
  function chest(id,tx,ty,topic){return {...baseEntity(id,'chest',tx,ty,topic)};}
  function mythicKind(topic){
    return ({pvi:'griffin',separables:'kraken',exactas:'medusa',lineales:'dragon',aplicaciones:'yeti',boss:'chimera'})[topic] || 'griffin';
  }
  function monster(id,tx,ty,topic){return {...baseEntity(id,'monster',tx,ty,topic),phase:rand()*6.28,kind:mythicKind(topic)};}
  function boss(id,tx,ty,topic){return {...baseEntity(id,'boss',tx,ty,topic),w:40,h:38,kind:mythicKind(topic)};}
  function sealDoor(id,tx,ty,topic,sealTopic,order){return {...baseEntity(id,'sealdoor',tx,ty,topic),w:28,h:30,sealTopic,order,name:TOPIC_META[sealTopic]?.seal||sealTopic};}
  function entrance(id,tx,ty,name,topic,required){return {...baseEntity(id,'entrance',tx,ty,topic),w:32,h:34,name,required};}
  function exitDoor(id,tx,ty,topic){return {...baseEntity(id,'exit',tx,ty,topic),w:30,h:30};}
  function sign(id,tx,ty,text){return {...baseEntity(id,'sign',tx,ty,'pvi'),text};}
  function boulder(id,tx,ty,topic){return {...baseEntity(id,'boulder',tx,ty,topic),pushCooldown:0,moved:false};}
  function boat(id,tx,ty,topic,targetX,targetY,label='Barco',vehicle='boat'){return {...baseEntity(id,'boat',tx,ty,topic),w:32,h:24,targetX:targetX*TILE,targetY:targetY*TILE,label,vehicle,navigable:true};}

  function buildDungeon(topic){
    const meta=TOPIC_META[topic];
    const element=meta.element;
    const s=newScene('d_'+topic,meta.name,64,38,TYPES.floor,element);
    s.kind='dungeon'; s.topic=topic; s.required = topic==='boss'?1:3;
    const baseTile = topic==='aplicaciones'?TYPES.snow:topic==='lineales'?TYPES.ash:topic==='exactas'?TYPES.dark:TYPES.floor;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){
      setTile(s,x,y,baseTile);
      if(x<2||y<2||x>s.w-3||y>s.h-3)setTile(s,x,y,TYPES.wall);
    }

    if(topic==='pvi') buildForestPuzzle(s);
    else if(topic==='separables') buildSeaPuzzle(s);
    else if(topic==='exactas') buildCavePuzzle(s);
    else if(topic==='lineales') buildVolcanoPuzzle(s);
    else if(topic==='aplicaciones') buildAirPuzzle(s);
    else buildBossPuzzle(s);

    s.entities.push(exitDoor('exit_'+topic,4,33,topic));
    s.entities.push(npc('guide_'+topic,5,31,'Guardián',topic,dungeonHint(topic)));
    s.entities.push(sign('sign_'+topic,7,33,'Resuelve 3 retos del sello. Si te atoras, sigue la brújula y revisa el tipo de piso.'));

    placeChallenges(s,topic);
    sanitizeSpawn(s);
    return s;
  }

  function sanitizeSpawn(s){
    const safe = s.topic==='aplicaciones' ? TYPES.snow :
      s.topic==='lineales' ? TYPES.ash :
      s.topic==='exactas' ? TYPES.dark :
      s.topic==='separables' ? TYPES.sand :
      s.topic==='pvi' ? TYPES.path : TYPES.floor;
    clearArea(s,5,33,5,3,safe);
    clearArea(s,4,33,2,2,safe);
  }

  function dungeonHint(topic){
    const map={
      pvi:'Bosque: ahora los corredores tienen barreras de trampas; empuja piedras para taparlas o responde preguntas para cruzar.',
      separables:'Mar: ahora hay más corrientes y más trampas alrededor de cofres y guardianes. Usa puentes, barco y piedras con cuidado.',
      exactas:'Cueva: los accesos a cada reto están cerrados por trampas; piensa antes de empujar las piedras.',
      lineales:'Volcán: los pisos agrietados forman barreras. Usa piedras para construir pasos seguros entre lava y ceniza.',
      aplicaciones:'Cielo: entra al espacio aéreo y usa un avión para viajar entre islas tipo nube; si una trampa te bloquea, el mundo se reinicia con penalización.',
      boss:'Templo final: combina todos los acertijos y preguntas del corte.'
    };
    return map[topic]||'Resuelve los acertijos antes de responder.';
  }

  function buildForestPuzzle(s){
    // Bosque: ya no es un campo abierto. La mayor parte es bosque sólido
    // y el estudiante debe seguir corredores con trampas y piedras.
    fill(s,TYPES.forest); border(s,TYPES.forest);

    // Salas y corredores obligatorios.
    clearArea(s,5,33,5,3,TYPES.path);
    clearArea(s,14,8,4,3,TYPES.path);
    clearArea(s,55,9,4,3,TYPES.path);
    clearArea(s,55,27,4,3,TYPES.path);
    clearArea(s,42,25,4,3,TYPES.path);

    path(s,[[5,33],[10,31],[14,28],[18,24],[22,20],[28,20],[35,16],[43,16],[55,9]],2);
    path(s,[[22,20],[20,14],[14,8]],2);
    path(s,[[35,16],[39,20],[42,25],[48,26],[55,27]],2);

    // Bordes de bosque muy cerrados: evitar bordear por fuera.
    for(let x=2;x<s.w-2;x++){ setTile(s,x,2,TYPES.forest); setTile(s,x,3,TYPES.forest); setTile(s,x,s.h-3,TYPES.forest); }
    for(let y=2;y<s.h-2;y++){ setTile(s,2,y,TYPES.forest); setTile(s,3,y,TYPES.forest); setTile(s,s.w-3,y,TYPES.forest); }

    // Trampas densas en los corredores. El patrón deja huecos pequeños,
    // pero muchas zonas requieren tapar trampas con piedras.
    trapLattice(s,7,28,24,34,2);
    trapLattice(s,12,18,32,23,2);
    trapLattice(s,30,14,48,18,2);
    trapLattice(s,39,22,58,29,2);
    trapLattice(s,12,7,20,13,2);
    trapLattice(s,50,7,59,12,2);

    // Barreras extra del Bosque del PVI: ya no se puede cruzar el corredor
    // por una línea libre; cada tramo exige pregunta o piedra.
    [[7,31,13,31],[10,29,16,29],[13,26,20,26],[17,23,24,23],
     [20,20,28,20],[28,18,36,18],[35,16,45,16],[46,13,54,13],
     [16,14,22,14],[12,10,18,10],[39,24,47,24],[47,26,57,26],
     [42,28,56,28],[51,9,59,9]].forEach(([x0,y0,x1,y1])=>trapLine(s,x0,y0,x1,y1));

    // Piedras estratégicas para tapar trampas y abrir rutas.
    const rocks=[
      [8,32],[10,30],[12,29],[15,27],[17,25],[19,23],
      [21,21],[24,20],[27,20],[31,19],[34,17],[37,16],
      [41,16],[45,16],[50,12],[53,10],
      [18,14],[16,11],[14,10],
      [41,23],[44,25],[48,26],[52,27],
      // V14: piedras adicionales junto a barreras largas.
      [7,32],[11,30],[15,28],[18,25],[22,22],[29,19],
      [36,17],[44,17],[49,14],[54,12],[18,15],[13,11],
      [40,25],[46,25],[50,27],[56,27]
    ];
    rocks.forEach((p,i)=>s.entities.push(boulder('fb'+i,p[0],p[1],'pvi')));

    // Reabrir puntos exactos de retos para que siempre sean alcanzables,
    // pero rodeados de trampas.
    [[14,8],[55,9],[55,27],[42,25],[5,33]].forEach(([x,y])=>clearArea(s,x,y,1,1,TYPES.path));
  }

  function buildSeaPuzzle(s){
    // Región del mar: ahora tiene más trampas de isla y más zonas de corriente.
    fill(s,TYPES.water); border(s,TYPES.wall);

    // Isla de inicio: segura y amplia.
    clearArea(s,6,33,6,3,TYPES.sand);
    clearArea(s,14,31,4,2,TYPES.sand);
    for(let x=9;x<=17;x++) setTile(s,x,31,TYPES.bridge);

    // Isla central con cofre.
    clearArea(s,30,24,5,4,TYPES.sand);
    clearArea(s,34,20,3,2,TYPES.sand);

    // Isla del guardián morado: ahora es accesible en barco.
    clearArea(s,51,26,5,4,TYPES.sand);
    clearArea(s,56,23,3,3,TYPES.sand);

    // Isla norte de reto y salida secundaria.
    clearArea(s,48,9,6,3,TYPES.sand);
    clearArea(s,18,9,5,3,TYPES.sand);

    // Muelles de madera.
    for(let x=17;x<=21;x++) setTile(s,x,31,TYPES.bridge);
    for(let x=46;x<=51;x++) setTile(s,x,26,TYPES.bridge);
    for(let y=23;y<=31;y++) setTile(s,51,y,TYPES.bridge);
    for(let y=11;y<=20;y++) setTile(s,50,y,TYPES.bridge);
    for(let x=42;x<=50;x++) setTile(s,x,11,TYPES.bridge);
    for(let x=18;x<=28;x++) setTile(s,x,11,TYPES.current);

    // Corrientes como puzzle: más densas para que el océano exija mejor planeación.
    for(let x=20;x<=30;x++) setTile(s,x,27,TYPES.current);
    for(let x=35;x<=45;x++) setTile(s,x,21,TYPES.current);
    for(let x=14;x<=24;x++) setTile(s,x,19,TYPES.current);
    for(let y=15;y<=25;y++) setTile(s,40,y,TYPES.current);
    for(let x=23;x<=40;x++) setTile(s,x,31,TYPES.current);
    for(let x=26;x<=38;x++) setTile(s,x,15,TYPES.current);
    for(let x=44;x<=58;x++) setTile(s,x,16,TYPES.current);
    for(let y=8;y<=18;y++) setTile(s,28,y,TYPES.current);
    for(let y=24;y<=32;y++) setTile(s,58,y,TYPES.current);
    for(let x=8;x<=20;x++) setTile(s,x,24,TYPES.current);

    // Piedras marinas pequeñas que no bloquean, solo decoración en islas.
    [[32,22],[34,26],[53,28],[56,26],[50,10],[20,10]].forEach(([x,y],i)=>setTile(s,x,y,TYPES.stone));

    // Barcos: quedan flotando en el mar y solo pueden navegar sobre agua/corrientes.
    setTile(s,22,31,TYPES.water); setTile(s,49,26,TYPES.water);
    s.entities.push(boat('boat_to_guardian',22,31,'separables',49,26,'Barco del muelle'));
    s.entities.push(boat('boat_return',49,26,'separables',22,31,'Barco de regreso'));
    s.entities.push(sign('sea_sign',12,34,'El guardián morado está en una isla. Usa el barco y navega solo por el mar para llegar.'));
    // Trampas densas en islas y muelles: ahora se refuerzan alrededor de cofres y bestias.
    placeTrapField(s, [
      [28,24],[29,25],[30,22],[30,26],[32,24],[33,23],[34,25],[36,20],
      [50,27],[51,28],[52,26],[53,25],[54,27],[55,24],[56,25],
      [48,9],[49,10],[51,9],[52,11],[19,10],[18,9],[16,9],[15,10],
      [13,31],[12,32],[9,33],[10,34],[45,10],[46,11],
      [27,23],[28,26],[31,22],[33,21],[35,23],[35,26],[36,24],
      [49,24],[50,24],[53,24],[54,24],[57,24],[58,25],[58,27],[55,29],
      [46,8],[47,8],[50,8],[52,8],[54,9],[54,11],[21,8],[20,8],[18,8],[17,11],[15,11]
    ]);
    // Barreras de muelle/isla: obligan a navegar con cuidado y no solo caminar.
    trapLine(s,27,24,35,24); trapLine(s,30,27,36,27);
    trapLine(s,49,25,58,25); trapLine(s,50,29,56,29);
    trapLine(s,47,10,54,10); trapLine(s,16,9,23,9);
    trapLine(s,29,22,35,22); trapLine(s,50,24,58,24);
    trapLine(s,46,8,53,8); trapLine(s,15,11,22,11);
    [[29,23],[33,26],[52,28],[55,26],[49,8],[18,11],[12,31],
     [27,25],[35,25],[50,24],[57,26],[46,9],[22,10],
     [28,22],[34,27],[51,24],[58,26],[47,7],[15,8],[21,11],[54,29]].forEach((p,i)=>s.entities.push(boulder('sb'+i,p[0],p[1],'separables')));
  }
  function buildCavePuzzle(s){
    fill(s,TYPES.dark); border(s,TYPES.wall);
    for(let x=8;x<56;x++){setTile(s,x,10,TYPES.wall);setTile(s,x,22,TYPES.wall);}
    for(let y=6;y<32;y++){setTile(s,22,y,TYPES.wall);setTile(s,42,y,TYPES.wall);}
    [[22,10],[42,10],[14,10],[34,10],[52,10],[22,22],[42,22],[14,22],[34,22],[52,22],[22,16],[42,16]].forEach(([x,y])=>clearArea(s,x,y,1,1,TYPES.dark));
    clearArea(s,5,33,5,3,TYPES.dark);
    // roca-puzzle tipo cueva
    const rocks = [[12,28],[14,28],[16,28],[18,28],[20,28],[12,26],[16,26],[20,26],[30,18],[32,18],[34,18],[36,18],[30,16],[34,16],[46,8],[48,8],[50,8],[52,8]];
    rocks.forEach((p,i)=>s.entities.push(boulder('cb'+i,p[0],p[1],'exactas')));
    placeTrapField(s, [[10,28],[11,27],[12,24],[14,20],[15,18],[18,16],[20,14],[22,28],[24,24],[26,18],[28,14],[30,14],[32,18],[34,14],[36,16],[38,18],[40,18],[44,12],[46,12],[48,14],[50,12],[52,14],[54,16],[46,24],[42,24],[38,24],[36,24],[32,24],[28,24],[26,24],[20,24],[14,12]]);
    [[9,28,20,28],[24,24,40,24],[28,18,38,18],[44,12,54,12],[12,12,20,12],[30,14,36,14]].forEach(([x0,y0,x1,y1])=>trapLine(s,x0,y0,x1,y1));
    [[11,29],[13,27],[17,25],[23,23],[29,17],[31,15],[35,15],[39,19],[45,13],[49,13],[47,25],[37,25],
     [9,29],[21,27],[27,23],[41,25],[43,13],[55,13],[19,13]].forEach((p,i)=>s.entities.push(boulder('ctb'+i,p[0],p[1],'exactas')));
  }
  function buildVolcanoPuzzle(s){
    fill(s,TYPES.ash); border(s,TYPES.wall);
    for(let y=5;y<31;y++)for(let x=9;x<56;x++) if(rand()<.08) setTile(s,x,y,TYPES.lava);
    path(s,[[5,33],[14,30],[22,26],[30,22],[40,18],[54,10]],1);
    path(s,[[30,22],[30,10],[18,8]],1);
    path(s,[[40,18],[48,28],[56,28]],1);
    for(let y=8;y<30;y+=3) for(let x=12;x<55;x+=5) if(tileAt(s,x,y)===TYPES.ash) setTile(s,x,y,TYPES.cracked);
    clearArea(s,5,33,5,3,TYPES.ash); clearArea(s,18,8,3,3,TYPES.ash); clearArea(s,54,10,3,3,TYPES.ash); clearArea(s,56,28,3,3,TYPES.ash);

    // V21: refuerzo de fuego para volver el volcán más estratégico.
    const lavaClusters=[
      [11,31],[12,31],[13,30],[15,29],[17,28],[19,27],[21,26],[23,25],[25,24],[27,23],[29,22],[31,21],[33,20],[35,19],[37,18],[39,18],[41,18],[43,19],[45,20],[47,22],[49,24],[51,26],[53,27],[55,28],
      [28,11],[30,11],[32,10],[26,9],[24,8],[22,9],[20,9],[44,11],[46,12],[48,13],[50,14],[52,15],[53,11],[54,12],
      [51,9],[52,9],[53,9],[55,10],[55,11],[53,12],[51,12],
      [28,23],[29,24],[30,24],[31,23],[40,19],[41,20],[42,20],[43,20],[44,21],
      [47,27],[48,27],[49,28],[50,28],[52,28],[54,28],
      [16,9],[17,9],[18,10],[18,11],[19,10]
    ];
    lavaClusters.forEach(([x,y])=>{ if(tileAt(s,x,y)===TYPES.ash) setTile(s,x,y,TYPES.lava); });
    [[10,30,16,30],[18,28,26,24],[28,22,36,18],[40,18,48,22],[48,25,56,28],[20,8,30,8],[44,10,55,10]].forEach(([x0,y0,x1,y1])=>{
      for(let y=Math.min(y0,y1); y<=Math.max(y0,y1); y++) for(let x=Math.min(x0,x1); x<=Math.max(x0,x1); x++){
        if(tileAt(s,x,y)===TYPES.ash && rand()>.35) setTile(s,x,y,TYPES.lava);
      }
    });

    [[24,24],[28,22],[36,20],[42,18],[45,25],[16,29]].forEach((p,i)=>s.entities.push(boulder('vb'+i,p[0],p[1],'lineales')));
    placeTrapField(s, [[10,31],[12,30],[14,29],[16,28],[18,27],[20,26],[22,25],[24,24],[26,23],[28,22],[30,21],[31,20],[33,19],[34,18],[36,18],[38,18],[40,18],[42,18],[44,19],[46,20],[48,22],[50,24],[52,26],[54,27],[56,28],[30,12],[30,10],[28,10],[26,10],[24,9],[22,8],[20,8],[44,10],[46,11],[48,12],[50,13],[52,14]]);
    [[10,31,18,28],[20,26,30,22],[32,20,44,18],[44,19,56,28],[24,9,30,12],[44,10,52,14]].forEach(([x0,y0,x1,y1])=>trapLine(s,x0,y0,x1,y1));
    [[11,30],[15,28],[19,26],[23,24],[27,22],[32,20],[37,18],[43,19],[49,23],[53,26],[29,11],[25,9],[47,12],
     [13,31],[21,27],[31,21],[39,19],[46,21],[55,27],[31,10],[51,13]].forEach((p,i)=>s.entities.push(boulder('vtb'+i,p[0],p[1],'lineales')));
  }
  function buildAirPuzzle(s){
    fill(s,TYPES.water); border(s,TYPES.wall);
    // Mundo 5: espacio aéreo. El avatar debe usar un avión para cruzar entre nubes.
    clearArea(s,5,33,5,3,TYPES.snow);
    clearArea(s,12,31,4,2,TYPES.snow);
    clearArea(s,15,9,4,3,TYPES.snow);
    clearArea(s,30,25,5,4,TYPES.snow);
    clearArea(s,48,9,4,3,TYPES.snow);
    clearArea(s,52,26,4,3,TYPES.snow);
    clearArea(s,55,18,3,2,TYPES.snow);
    clearArea(s,24,15,3,2,TYPES.snow);

    // Puentes de nubes y corrientes de aire.
    for(let x=14;x<=20;x++) setTile(s,x,31,TYPES.bridge);
    for(let x=26;x<=34;x++) setTile(s,x,26,TYPES.current);
    for(let x=34;x<=44;x++) setTile(s,x,18,TYPES.current);
    for(let x=18;x<=28;x++) setTile(s,x,15,TYPES.current);
    for(let y=11;y<=22;y++) setTile(s,40,y,TYPES.current);
    for(let y=20;y<=30;y++) setTile(s,47,y,TYPES.current);
    for(let x=45;x<=53;x++) setTile(s,x,26,TYPES.bridge);
    for(let x=46;x<=52;x++) setTile(s,x,10,TYPES.bridge);

    // Trampas en nubes y accesos.
    placeTrapField(s, [[12,30],[13,31],[16,31],[17,30],[14,9],[15,10],[17,9],[18,10],[29,25],[31,24],[33,26],[34,24],[47,9],[49,10],[50,9],[52,10],[51,26],[53,27],[54,26],[49,26],[24,15],[25,16],[55,18],[56,19]]);
    [[12,30,18,30],[14,10,18,10],[29,24,35,24],[46,10,53,10],[49,26,55,26]].forEach(([x0,y0,x1,y1])=>trapLine(s,x0,y0,x1,y1));

    // Rocas/piedras de nube.
    [[13,30],[18,10],[32,24],[48,10],[52,26],[24,14],[55,17],[30,26],[50,25],[46,9]].forEach((p,i)=>s.entities.push(boulder('airb'+i,p[0],p[1],'aplicaciones')));

    // Aviones que vuelan por el cielo. Siempre quedan aviones de reserva en distintas islas.
    setTile(s,21,31,TYPES.water);
    setTile(s,45,26,TYPES.water);
    setTile(s,17,10,TYPES.water);
    setTile(s,32,24,TYPES.water);
    setTile(s,49,10,TYPES.water);
    setTile(s,54,18,TYPES.water);
    s.entities.push(boat('plane_to_clouds',21,31,'aplicaciones',45,26,'Avión de nubes','plane'));
    s.entities.push(boat('plane_return',45,26,'aplicaciones',21,31,'Avión de regreso','plane'));
    s.entities.push(boat('plane_reserve_north',17,10,'aplicaciones',45,26,'Avión de reserva','plane'));
    s.entities.push(boat('plane_reserve_central',32,24,'aplicaciones',21,31,'Avión de reserva','plane'));
    s.entities.push(boat('plane_reserve_east',49,10,'aplicaciones',52,26,'Avión de reserva','plane'));
    s.entities.push(boat('plane_reserve_mid',54,18,'aplicaciones',21,31,'Avión de reserva','plane'));
    s.entities.push(sign('air_sign',9,34,'Sube al avión para cruzar el espacio aéreo. Siempre hay aviones de reserva en varias islas. Puede volar sobre todas las islas y aterrizar en casi cualquier zona, excepto junto a cofres o monstruos protegidos por escudos.'));
  }
  function buildBossPuzzle(s){
    fill(s,TYPES.floor); border(s,TYPES.wall);
    // Pirámide final: cinco muros con cinco puertas de sello, y trampas de todos los mundos.
    clearArea(s,4,31,8,4,TYPES.floor);
    clearArea(s,10,15,48,7,TYPES.floor);
    clearArea(s,48,12,8,8,TYPES.floor);

    // Cinco murallas verticales: cada puerta se abre colocando el sello del mundo respectivo.
    const gates=[
      ['pvi',14,18],['separables',22,18],['exactas',30,18],['lineales',38,18],['aplicaciones',46,18]
    ];
    gates.forEach(([sealTopic,x,doorY],i)=>{
      for(let y=10;y<=27;y++) setTile(s,x,y,TYPES.wall);
      setTile(s,x,doorY,TYPES.wall);
      s.entities.push(sealDoor('seal_'+sealTopic,x,doorY,'boss',sealTopic,i+1));
    });

    // Rutas y zonas mixtas para que el camino hacia el monstruo sea ceremonial y peligroso.
    for(let x=5;x<=58;x++) setTile(s,x,18,TYPES.floor);
    for(let x=5;x<=58;x+=2) if(x<14 || x>46) setTile(s,x,19,TYPES.cracked);
    for(let x=16;x<=45;x+=3) setTile(s,x,16,TYPES.cracked);
    for(let x=16;x<=55;x+=4) setTile(s,x,20,TYPES.lava);
    for(let x=17;x<=43;x+=5) setTile(s,x,14,TYPES.ice);
    for(let x=18;x<=52;x+=6) setTile(s,x,22,TYPES.current);
    for(let x=10;x<=56;x+=4){ setTile(s,x,24,TYPES.cracked); setTile(s,x+1,25,TYPES.lava); }
    for(let x=50;x<=57;x++) for(let y=12;y<=23;y++) if((x+y)%3===0) setTile(s,x,y,TYPES.cracked); else if((x+y)%4===0) setTile(s,x,y,TYPES.lava);

    // Trampas alrededor del monstruo final: de bosque/cueva/volcán/cielo/mar.
    trapBox(s,49,11,58,24);
    placeTrapField(s, [[50,13],[51,14],[52,15],[53,16],[54,17],[55,18],[56,19],[57,20],[49,21],[50,22],[52,23],[54,23],[56,22],[58,21],[49,12],[53,12],[57,12]]);
    [[50,20],[52,16],[54,14],[56,18],[58,22],[47,18],[44,16],[40,20],[34,22],[28,16],[20,20]].forEach((p,i)=>s.entities.push(boulder('pb'+i,p[0],p[1],'boss')));
    // El monstruo queda detrás de las cinco puertas de sello.
    s.entities.push(sign('boss_sign',8,33,'Pirámide central: abre las cinco puertas colocando los sellos obtenidos en cada mundo. Luego enfrenta al monstruo final.'));
  }
  function fill(s,t){for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++)setTile(s,x,y,t);}
  function border(s,t){for(let x=0;x<s.w;x++){setTile(s,x,0,t);setTile(s,x,1,t);setTile(s,x,s.h-1,t);setTile(s,x,s.h-2,t);}for(let y=0;y<s.h;y++){setTile(s,0,y,t);setTile(s,1,y,t);setTile(s,s.w-1,y,t);setTile(s,s.w-2,y,t);}}

  function placeChallenges(s,topic){
    let data;
    if(topic==='pvi'){
      data=[{type:'monster',x:14,y:8},{type:'chest',x:55,y:9},{type:'monster',x:55,y:27},{type:'chest',x:42,y:25}];
    } else if(topic==='separables'){
      // En el mar los retos quedan en islas diferentes. El guardián morado se alcanza usando barco.
      data=[{type:'chest',x:31,y:24},{type:'monster',x:54,y:27},{type:'chest',x:49,y:9},{type:'monster',x:18,y:9}];
    } else if(topic==='exactas'){
      data=[{type:'monster',x:14,y:8},{type:'chest',x:52,y:10},{type:'monster',x:30,y:18},{type:'chest',x:14,y:22}];
    } else if(topic==='lineales'){
      data=[{type:'monster',x:18,y:8},{type:'chest',x:54,y:10},{type:'monster',x:56,y:28},{type:'chest',x:30,y:22}];
    } else if(topic==='aplicaciones'){
      data=[{type:'monster',x:15,y:9},{type:'chest',x:48,y:9},{type:'monster',x:52,y:26},{type:'chest',x:32,y:26}];
    } else {
      data=[{type:'boss',x:54,y:17}];
    }
    data.forEach((e,i)=>{
      if(s.kind==='dungeon') fortifyChallenge(s,topic,e.type,e.x,e.y,i);
      if(e.type==='monster') s.entities.push(monster(topic+'_m'+i,e.x,e.y,topic));
      if(e.type==='chest') s.entities.push(chest(topic+'_c'+i,e.x,e.y,topic));
      if(e.type==='boss') s.entities.push(boss(topic+'_boss',e.x,e.y,topic));
    });
  }

  function update(dt){
    if(state.mode!=='menu') handleSecurityState();
    if(state.quizInvalidated){ updateHUD(); updateSecurityPanel(); return; }
    if(state.mode==='playing'){
      state.elapsed=state.startTime?Math.floor((Date.now()-state.startTime)/1000):0;
      if(state.securityLocked){
        updateHUD();
      } else {
        state.firePenaltyCooldown=Math.max(0,state.firePenaltyCooldown-dt);
        movePlayer(dt);
        checkStuckRestart(dt);
        updateEntities(dt);
        updateCamera();
        updateHUD();
        const bossPending = state.scene?.topic==='boss' && !state.gameCompleted;
        if(state.grade>=5 && !bossPending) showReport(true);
      }
    } else if(state.mode==='menu') {
      state.player.step += dt;
      updateCamera();
    }
    if(state.toastTimer>0){state.toastTimer-=dt;if(state.toastTimer<=0)els.toast.classList.add('hidden');}
  }

  function inputVector(){
    let vx=0,vy=0;
    if(state.keys.arrowup||state.keys.w||state.touch.up)vy-=1;
    if(state.keys.arrowdown||state.keys.s||state.touch.down)vy+=1;
    if(state.keys.arrowleft||state.keys.a||state.touch.left)vx-=1;
    if(state.keys.arrowright||state.keys.d||state.touch.right)vx+=1;
    if(vx||vy){const len=Math.hypot(vx,vy);vx/=len;vy/=len;}
    return {vx,vy};
  }

  function movePlayer(dt){
    const p=state.player;
    if(state.trapped){
      return;
    }
    if(state.onBoat){
      const {vx,vy}=inputVector();
      if(vx||vy){
        if(Math.abs(vx)>Math.abs(vy)) p.dir=vx>0?'right':'left'; else p.dir=vy>0?'down':'up';
        const sp=p.speed*1.35*dt;
        attemptBoatMove(vx*sp,0); attemptBoatMove(0,vy*sp);
        p.step += dt*7;
      }
      return;
    }
    if(p.sliding){
      const sp=p.speed*1.65*dt;
      const ok=attemptMove(p.slideVx*sp,0,true) & attemptMove(0,p.slideVy*sp,true);
      p.step += dt*10;
      p.slideLock=Math.max(0,p.slideLock-dt);
      if(!ok || ![TYPES.ice,TYPES.current].includes(tileUnderPlayer()) || p.slideLock<=0){p.sliding=false;p.slideVx=0;p.slideVy=0;}
      return;
    }
    const {vx,vy}=inputVector();
    if(vx||vy){
      if(Math.abs(vx)>Math.abs(vy)) p.dir=vx>0?'right':'left'; else p.dir=vy>0?'down':'up';
      const sp=p.speed*dt;
      attemptMove(vx*sp,0,false); attemptMove(0,vy*sp,false);
      p.step += dt*8;
      const t=tileUnderPlayer();
      if(t===TYPES.ice || t===TYPES.current){
        p.sliding=true;
        if(t===TYPES.current){
          p.slideVx = 1; p.slideVy = 0;
          p.slideLock = 1.6;
          showToast('Corriente marina: te arrastra hacia la derecha. Usa islas y puentes.',1.8);
        } else {
          p.slideVx=Math.abs(vx)>Math.abs(vy)?Math.sign(vx):0;
          p.slideVy=p.slideVx===0?Math.sign(vy):0;
          if(!p.slideVx&&!p.slideVy) p.slideVy=1;
          p.slideLock=2.5;
          showToast('Hielo: te deslizas hasta chocar. Calcula la ruta.',1.8);
        }
      }
      if(t===TYPES.cracked){
        const tx=Math.floor((p.x+p.w/2)/TILE), ty=Math.floor((p.y+p.h/2)/TILE);
        triggerTrap(tx,ty);
      } else if(isSafeStandingTile(t)) {
        state.lastSafe={x:p.x,y:p.y};
      }
    }
  }

  function attemptBoatMove(dx,dy){
    const p=state.player;
    const nx=p.x+dx, ny=p.y+dy;
    const box={x:nx+2,y:ny+8,w:p.w+6,h:p.h+2};
    const x0=Math.floor(box.x/TILE),y0=Math.floor(box.y/TILE),x1=Math.floor((box.x+box.w-1)/TILE),y1=Math.floor((box.y+box.h-1)/TILE);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const t=tileAt(state.scene,x,y);
      if(!boatCanMoveTile(t)) return false;
    }
    p.x=nx; p.y=ny;
    return true;
  }

  function attemptMove(dx,dy,sliding){
    const p=state.player;
    const nx=p.x+dx,ny=p.y+dy;
    const box={x:nx+4,y:ny+9,w:p.w-8,h:p.h-9};
    const b=getBoulderCollision(box);
    if(b&&!sliding){
      const dirX=Math.abs(dx)>Math.abs(dy)?Math.sign(dx):0;
      const dirY=dirX===0?Math.sign(dy):0;
      if((dirX||dirY)&&tryPushBoulder(b,dirX,dirY)&&!collides(box)){p.x=nx;p.y=ny;return true;}
      return false;
    } else if(b&&sliding) return false;
    if(touchesTile(box,TYPES.lava)){
      applyFirePenalty();
      return false;
    }
    if(!collides(box)){p.x=nx;p.y=ny;return true;}
    return false;
  }

  function touchesTile(box,type){
    const x0=Math.floor(box.x/TILE),y0=Math.floor(box.y/TILE),x1=Math.floor((box.x+box.w-1)/TILE),y1=Math.floor((box.y+box.h-1)/TILE);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++) if(tileAt(state.scene,x,y)===type) return true;
    return false;
  }

  function applyFirePenalty(){
    if(state.firePenaltyCooldown>0) return;
    state.firePenaltyCooldown=0.65;
    state.grade=clamp(+(state.grade+SCORE_WRONG).toFixed(2),0,5);
    sparkle(state.player.x+state.player.w/2,state.player.y+state.player.h/2,'#ff8c42');
    updateHUD();
    showToast('¡Tocaste fuego! Pierdes 0.1 en la nota.',2.2);
    SCORM?.saveScore?.(state.grade,state.answered);
  }

  function collides(box,ignore=null){
    const x0=Math.floor(box.x/TILE),y0=Math.floor(box.y/TILE),x1=Math.floor((box.x+box.w-1)/TILE),y1=Math.floor((box.y+box.h-1)/TILE);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=tileAt(state.scene,x,y);if(SOLID.has(t))return true;}
    for(const e of state.scene.entities){if(e===ignore||!e.active)continue;if(e.type==='boulder'&&rectsOverlap(box,e))return true;}
    return false;
  }
  function getBoulderCollision(box){return state.scene.entities.find(e=>e.type==='boulder'&&e.active&&rectsOverlap(box,e))||null;}
  function tryPushBoulder(e,dirX,dirY){
    if(e.pushCooldown>0)return false;
    const targetTx=Math.floor((e.x+e.w/2)/TILE)+dirX;
    const targetTy=Math.floor((e.y+e.h/2)/TILE)+dirY;
    const targetTile=tileAt(state.scene,targetTx,targetTy);

    // Acertijo principal: si empujas una piedra sobre una trampa/hueco,
    // la piedra lo tapa y crea camino seguro. Así no basta con esquivar:
    // hay zonas donde debes cubrir huecos para avanzar.
    if(targetTile===TYPES.cracked || targetTile===TYPES.pit){
      const safe=groundTileForScene(state.scene);
      setTile(state.scene,targetTx,targetTy,safe);
      e.active=false;
      e.solved=true;
      sparkle(targetTx*TILE+16,targetTy*TILE+16,'#d0d6d9');
      showToast('La piedra tapó la trampa y creó un camino seguro.',2.3);
      return true;
    }

    const next={x:e.x+dirX*TILE,y:e.y+dirY*TILE,w:e.w,h:e.h};
    if(collides(next,e))return false;
    e.x+=dirX*TILE; e.y+=dirY*TILE; e.pushCooldown=.12; e.moved=true;
    sparkle(e.x+e.w/2,e.y+e.h/2,'#d0d6d9');
    return true;
  }
  function resetSeaCurrentTracker(){
    state.seaCurrentTimer=0;
    state.seaCurrentAnchor=null;
    state.stuckReason='';
    if(els.rescuePanel) els.rescuePanel.classList.add('hidden');
    if(state.mode==='rescue') state.mode='playing';
  }

  function canEscapeDirection(cx,cy,dx,dy){
    const tx=cx+dx, ty=cy+dy;
    const t=tileAt(state.scene,tx,ty);
    const blocker=[TYPES.wall,TYPES.forest,TYPES.cliff,TYPES.water,TYPES.lava,TYPES.pit].includes(t);
    const b=hasBoulderAt(state.scene,tx,ty);
    if(b){
      const ntx=tx+dx, nty=ty+dy;
      const nt=tileAt(state.scene,ntx,nty);
      if(hasBoulderAt(state.scene,ntx,nty)) return false;
      if([TYPES.wall,TYPES.forest,TYPES.cliff,TYPES.water,TYPES.lava].includes(nt)) return false;
      return true;
    }
    if(blocker) return false;
    if(t===TYPES.cracked) return false;
    return true;
  }

  function isAvatarHardBlocked(){
    if(state.scene?.kind!=='dungeon') return false;
    const cx=Math.floor((state.player.x+state.player.w/2)/TILE);
    const cy=Math.floor((state.player.y+state.player.h/2)/TILE);
    const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    return !dirs.some(([dx,dy])=>canEscapeDirection(cx,cy,dx,dy));
  }

  function checkStuckRestart(dt){
    if(state.mode!=='playing') return;
    if(state.scene?.kind!=='dungeon' || state.onBoat || state.trapped){
      resetSeaCurrentTracker();
      return;
    }
    const tile=tileUnderPlayer();
    const blocked=isAvatarHardBlocked();
    const inDangerFlow=tile===TYPES.current;
    if(!blocked && !inDangerFlow){
      resetSeaCurrentTracker();
      return;
    }
    const px=state.player.x+state.player.w/2;
    const py=state.player.y+state.player.h/2;
    if(!state.seaCurrentAnchor){
      state.seaCurrentAnchor={x:px,y:py};
      state.seaCurrentTimer=0;
      state.stuckReason=blocked?'Bloqueado por una trampa':'Atrapado en una corriente';
      return;
    }
    const dist=Math.hypot(px-state.seaCurrentAnchor.x,py-state.seaCurrentAnchor.y);
    if(dist>TILE*0.6){
      state.seaCurrentAnchor={x:px,y:py};
      state.seaCurrentTimer=0;
      state.stuckReason=blocked?'Bloqueado por una trampa':'Atrapado en una corriente';
      return;
    }
    state.seaCurrentTimer+=dt;
    if(state.seaCurrentTimer>=1.8){
      restartCurrentDungeonPenalty(state.stuckReason || (blocked?'Bloqueado por una trampa':'Atrapado en una corriente'));
    }
  }

  function restartCurrentDungeonPenalty(reason='Bloqueado por una trampa'){
    const topic=state.scene?.topic || state.currentTopic;
    if(!topic || state.scene?.kind!=='dungeon'){
      if(els.rescuePanel) els.rescuePanel.classList.add('hidden');
      state.mode='playing';
      return;
    }
    state.grade=clamp(+(state.grade+SCORE_WRONG).toFixed(2),0,5);
    state.scene=buildDungeon(topic);
    state.currentTopic=topic;
    state.player.x=5*TILE;
    state.player.y=33*TILE;
    state.player.sliding=false;
    state.player.slideVx=0;
    state.player.slideVy=0;
    state.player.slideLock=0;
    state.onBoat=false;
    state.currentBoat=null;
    state.trapped=false;
    state.trapTile=null;
    state.trapLadderVisible=false;
    state.lastSafe={x:state.player.x,y:state.player.y};
    state.showMap=false;
    state.brokenFloors=new Set();
    state.mode='playing';
    if(els.rescuePanel) els.rescuePanel.classList.add('hidden');
    resetSeaCurrentTracker();
    updateHUD();
    SCORM?.saveScore?.(state.grade,state.answered);
    showToast(`${reason}. Este mundo se reinició y perdiste 0.1 en la nota.`,4.2);
  }

  function tileUnderPlayer(){return tileAt(state.scene,Math.floor((state.player.x+state.player.w/2)/TILE),Math.floor((state.player.y+state.player.h/2)/TILE));}

  function isSafeStandingTile(t){
    return [TYPES.floor,TYPES.path,TYPES.grass,TYPES.sand,TYPES.bridge,TYPES.snow,TYPES.ash,TYPES.dark,TYPES.ladder].includes(t);
  }

  function triggerTrap(tx,ty){
    if(state.trapped || state.mode==='question') return;
    state.trapped=true;
    state.trapTile={x:tx,y:ty};
    state.trapTopic=state.scene.topic || state.currentTopic || 'pvi';
    state.trapAttempts=0;
    state.trapLadderVisible=true;
    setTile(state.scene,tx,ty,TYPES.pit);
    sparkle(tx*TILE+16,ty*TILE+16,'#111111');
    showToast('¡Caíste en una trampa! Hay una escalera en el hueco, pero solo podrás usarla si respondes bien.',3.8);
    setTimeout(()=>askTrapQuestion(), 450);
  }

  function askTrapQuestion(){
    if(!state.trapped) return;
    const topic=state.trapTopic || state.scene.topic || 'pvi';
    const q=pickQuestion(topic);
    state.mode='question';
    state.currentQuestion={...q, trap:true};
    state.currentEntity={type:'trap',topic,x:state.trapTile.x*TILE,y:state.trapTile.y*TILE,w:TILE,h:TILE,active:true,solved:false};
    els.qModal.classList.remove('hidden');
    els.qHint.classList.add('hidden');
    els.qFeedback.classList.add('hidden');
    els.qFeedback.className='feedback hidden';
    els.submitAnswer.disabled=false;
    els.hintBtn.disabled=false;
    state.pendingQuestionOutcome=null;
    els.closeQuestionBtn.textContent='Continuar jugando';
    els.closeQuestionBtn.classList.add('hidden');
    els.qTopic.textContent=TOPIC_META[topic]?.topicLabel || topic;
    els.qType.textContent='Pregunta de liberación';
    els.qTitle.textContent='Trampa matemática';
    els.qPrompt.innerHTML=q.prompt;
    renderAnswerArea(q);
    if(window.MathJax?.typesetPromise)MathJax.typesetPromise([els.qModal]).catch(()=>{});
  }

  function expandTrap(){
    if(!state.trapTile) return;
    const {x,y}=state.trapTile;
    const radius = Math.min(3, 1 + state.trapAttempts);
    for(let dy=-radius; dy<=radius; dy++){
      for(let dx=-radius; dx<=radius; dx++){
        if(Math.abs(dx)+Math.abs(dy) <= radius){
          const tx=x+dx, ty=y+dy;
          const t=tileAt(state.scene,tx,ty);
          if([TYPES.floor,TYPES.path,TYPES.ash,TYPES.dark,TYPES.snow,TYPES.cracked,TYPES.sand].includes(t)){
            setTile(state.scene,tx,ty,TYPES.pit);
          }
        }
      }
    }
    sparkle(x*TILE+16,y*TILE+16,'#2b1b16');
  }

  function createEscapeLadder(){
    if(!state.trapTile) return;
    const {x,y}=state.trapTile;

    // En la pirámide final aparecen pocas escaleras; en los otros mundos se conserva
    // una salida amplia para no dejar bloqueado al estudiante.
    const radius = state.scene?.topic==='boss' ? 1 : Math.max(2, Math.min(4, 1 + (state.trapAttempts||0)));
    for(let dy=-radius; dy<=radius; dy++){
      for(let dx=-radius; dx<=radius; dx++){
        const tx=x+dx, ty=y+dy;
        const t=tileAt(state.scene,tx,ty);
        if(t===TYPES.pit || t===TYPES.cracked || (Math.abs(dx)+Math.abs(dy)<=radius && [TYPES.floor,TYPES.path,TYPES.ash,TYPES.dark,TYPES.snow,TYPES.sand].includes(t))){
          setTile(state.scene,tx,ty,TYPES.ladder);
        }
      }
    }

    // Extiende una pasarela en las cuatro direcciones hasta encontrar suelo seguro.
    const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    dirs.forEach(([dx,dy])=>{
      for(let k=1;k<=(state.scene?.topic==='boss'?2:6);k++){
        const tx=x+dx*k, ty=y+dy*k;
        const t=tileAt(state.scene,tx,ty);
        if(t===TYPES.pit || t===TYPES.cracked || t===TYPES.ladder){
          setTile(state.scene,tx,ty,TYPES.ladder);
        } else if(isSafeStandingTile(t)) {
          if(k>1) setTile(state.scene,x+dx*(k-1),y+dy*(k-1),TYPES.ladder);
          break;
        } else if([TYPES.wall,TYPES.forest,TYPES.water,TYPES.lava,TYPES.cliff].includes(t)) {
          break;
        }
      }
    });
    sparkle(x*TILE+16,y*TILE+16,'#f0c36b');
  }

  function releaseTrap(){
    const tx=state.trapTile?.x;
    const ty=state.trapTile?.y;
    createEscapeLadder();
    state.trapped=false;
    state.trapTopic=null;
    state.trapAttempts=0;
    state.trapLadderVisible=false;
    state.player.sliding=false;
    if(Number.isFinite(tx) && Number.isFinite(ty)){
      state.player.x=tx*TILE+5;
      state.player.y=ty*TILE+4;
      state.lastSafe={x:state.player.x,y:state.player.y};
    } else {
      state.player.x=state.lastSafe?.x ?? 5*TILE;
      state.player.y=state.lastSafe?.y ?? 33*TILE;
    }
    state.trapTile=null;
    showToast(state.scene?.topic==='boss' ? 'Respuesta correcta. Aparecieron pocas escaleras: sal con cuidado.' : 'Respuesta correcta. Aparecieron varias escaleras: ahora puedes cruzar el hueco hacia el otro lado.',3.2);
  }

  function updateEntities(dt){
    state.scene.entities.forEach(e=>{
      e.t += dt;
      if(e.pushCooldown)e.pushCooldown=Math.max(0,e.pushCooldown-dt);
      if(e.type==='monster'&&e.active){
        e.x += Math.sin(e.t*1.6+e.phase)*dt*7;
        e.y += Math.cos(e.t*1.25+e.phase)*dt*4;
      }
    });
  }

  function updateCamera(){
    const w=window.innerWidth,h=window.innerHeight;
    const maxX=Math.max(0,state.scene.w*TILE-w), maxY=Math.max(0,state.scene.h*TILE-h);
    state.camera.x=clamp(state.player.x-w/2,0,maxX);
    state.camera.y=clamp(state.player.y-h/2,0,maxY);
  }

  function interact(){
    if(state.mode!=='playing')return;
    if(state.onBoat){ disembarkBoat(); return; }
    const target=nearestEntity();
    if(!target){showToast('No hay nada para interactuar aquí. Sigue la brújula o busca cofres, enemigos, señales y entradas.');return;}
    if(target.type==='npc'){showToast(target.text||'Sigue la ruta de los sellos.');return;}
    if(target.type==='sign'){showToast(target.text);return;}
    if(target.type==='exit'){leaveDungeon();return;}
    if(target.type==='boat'){useBoat(target);return;}
    if(target.type==='sealdoor'){openSealDoor(target);return;}
    if(target.type==='entrance'){
      if(state.seals.length<target.required){showToast(`Necesitas ${target.required} sello(s) para entrar a ${target.name}.`);return;}
      enterDungeon(target.topic,target);return;
    }
    if(['chest','monster','boss'].includes(target.type)) askQuestion(target.topic,target);
  }


  function openSealDoor(e){
    if(!state.seals.includes(e.sealTopic)){
      showToast(`Esta puerta exige ${TOPIC_META[e.sealTopic]?.seal||e.sealTopic}.`,2.4);
      return;
    }
    const tx=Math.floor((e.x+e.w/2)/TILE), ty=Math.floor((e.y+e.h/2)/TILE);
    setTile(state.scene,tx,ty,TYPES.floor);
    e.active=false; e.solved=true;
    sparkle(e.x+14,e.y+16,'#ffe17a');
    showToast(`Colocaste ${TOPIC_META[e.sealTopic].seal}. Puerta ${e.order}/5 abierta.`,2.6);
  }


  function nearestEntity(){
    const p={x:state.player.x+state.player.w/2,y:state.player.y+state.player.h/2};
    let best=null,bestD=Infinity;
    for(const e of state.scene.entities){
      if(!e.active||e.solved||e.type==='boulder')continue;
      const c=center(e); const d=Math.hypot(c.x-p.x,c.y-p.y);
      if(d<58&&d<bestD){best=e;bestD=d;}
    }
    return best;
  }

  function useBoat(e){
    state.onBoat = true;
    state.currentBoat = e;
    state.player.sliding = false;
    state.player.x = e.x;
    state.player.y = e.y - 4;
    e.active = false;
    state.scene.boatUsed = true;
    sparkle(state.player.x+14,state.player.y+18,'#aeeaff');
    showToast(e.vehicle==='plane' ? 'Subiste al avión. Ahora vuela con las flechas/WASD por el espacio aéreo. Presiona E junto a una nube para aterrizar.' : 'Subiste al barco. Ahora muévelo con las flechas/WASD por el agua. Presiona E junto a una orilla para desembarcar.',4.2);
  }

  function disembarkBoat(){
    const p = state.player;
    const cx = Math.floor((p.x+p.w/2)/TILE);
    const cy = Math.floor((p.y+p.h/2)/TILE);
    const plane = state.currentBoat?.vehicle==='plane';
    const spots = plane ? [[0,0],[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1],[0,2],[2,0],[-2,0],[0,-2]] : [[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1],[0,2],[2,0],[-2,0],[0,-2]];
    for(const [dx,dy] of spots){
      const tx=cx+dx, ty=cy+dy;
      const t=tileAt(state.scene,tx,ty);
      if(plane ? canPlaneLandAt(tx,ty) : isLandableTile(t)){
        const boat = state.currentBoat;
        if(boat){
          boat.x = cx*TILE+4;
          boat.y = cy*TILE+6;
          boat.active = true;
        }
        state.onBoat = false;
        state.currentBoat = null;
        state.player.x = tx*TILE+5;
        state.player.y = ty*TILE+4;
        sparkle(state.player.x+12,state.player.y+12,'#fff2a5');
        if(plane){
          const landedTile=tileAt(state.scene,tx,ty);
          showToast('Aterrizaste en una nube o zona aérea. Sigue la brújula hacia el reto.',2.4);
          if(landedTile===TYPES.cracked){
            setTimeout(()=>triggerTrap(tx,ty),120);
          }
        } else {
          showToast('Desembarcaste en la isla. Sigue la brújula hacia el reto.',2.4);
        }
        return;
      }
    }
    showToast(plane ? 'El avión puede aterrizar en casi cualquier isla, incluso sobre trampas, pero los escudos de cofres y monstruos lo rechazan.' : 'Acerca el barco a una orilla, muelle o isla para poder desembarcar.',2.8);
  }

  function isLandableTile(t){
    return [TYPES.sand,TYPES.bridge,TYPES.floor,TYPES.path,TYPES.grass,TYPES.snow,TYPES.ash,TYPES.dark].includes(t);
  }

  function canPlaneLandAt(tx,ty){
    const t=tileAt(state.scene,tx,ty);
    if([TYPES.wall,TYPES.forest,TYPES.cliff,TYPES.water,TYPES.lava,TYPES.pit].includes(t)) return false;
    const targetBox={x:tx*TILE+5,y:ty*TILE+4,w:21,h:24};
    const shielded=state.scene.entities.some(e=>e.active&&!e.solved&&['monster','chest','boss'].includes(e.type) && rectsOverlap(targetBox,{x:e.x-10,y:e.y-10,w:e.w+20,h:e.h+20}));
    if(shielded) return false;
    return true;
  }

  function boatCanMoveTile(t){
    if(state.currentBoat?.vehicle==='plane') return t!==TYPES.wall;
    return [TYPES.water,TYPES.current].includes(t);
  }

  function enterDungeon(topic,entranceEntity){
    state.returnPoint={x:entranceEntity.x,y:entranceEntity.y+TILE};
    state.scene=buildDungeon(topic);
    state.currentTopic=topic;
    state.player.x=5*TILE; state.player.y=33*TILE;
    state.player.sliding=false;
    state.onBoat=false;
    state.currentBoat=null;
    state.trapped=false;
    state.trapTile=null;
    state.trapLadderVisible=false;
    state.trapLadderVisible=false;
    state.lastSafe={x:state.player.x,y:state.player.y};
    state.showMap=false;
    state.brokenFloors=new Set();
    resetSeaCurrentTracker();
    showToast(topic==='boss' ? 'Entraste a la Pirámide Central. Coloca simbólicamente los 5 sellos y responde las 3 preguntas finales integradoras de verdadero/falso.' : `Entraste a ${TOPIC_META[topic].name}. Elemento: ${TOPIC_META[topic].element}. ${dungeonHint(topic)}`);
  }

  function leaveDungeon(){
    const topic=state.scene.topic;
    const solved=countSolvedDungeon();
    const needed=state.scene.required||3;
    if(solved<needed&&!state.seals.includes(topic)){
      showToast(`Necesitas resolver ${needed} retos para reclamar el sello. Llevas ${solved}.`);
      return;
    }
    if(!state.seals.includes(topic)){
      state.seals.push(topic);
      state.inventory.push(TOPIC_META[topic].item);
      showToast(`¡Obtuviste ${TOPIC_META[topic].seal}! Objeto: ${TOPIC_META[topic].item}.`);
    }
    if(topic==='boss'){showReport(true);return;}
    state.scene=state.world;
    state.player.x=state.returnPoint.x; state.player.y=state.returnPoint.y;
    state.player.sliding=false;
    state.onBoat=false;
    state.currentBoat=null;
    state.trapped=false;
    state.trapTile=null;
    state.trapLadderVisible=false;
    state.trapLadderVisible=false;
    state.lastSafe={x:state.player.x,y:state.player.y};
    resetSeaCurrentTracker();
    els.worldRestartBox.classList.add('hidden');
  }
  function countSolvedDungeon(){return state.scene.entities.filter(e=>e.solved&&['chest','monster','boss'].includes(e.type)).length;}
  function nextTopic(){for(const t of TOPICS) if(!state.seals.includes(t)) return t; return 'boss';}

  function askQuestion(topic,entity){
    const q=pickQuestion(topic);
    if(!q){showToast('No quedan preguntas nuevas de este tema. Puedes continuar.');return;}
    state.mode='question';
    state.currentQuestion=q;
    state.currentEntity=entity;
    els.qModal.classList.remove('hidden');
    els.qHint.classList.add('hidden');
    els.qFeedback.classList.add('hidden');
    els.qFeedback.className='feedback hidden';
    els.submitAnswer.disabled=false;
    els.hintBtn.disabled=false;
    state.pendingQuestionOutcome=null;
    els.closeQuestionBtn.textContent='Continuar jugando';
    els.closeQuestionBtn.classList.add('hidden');
    els.qTopic.textContent=TOPIC_META[topic]?.topicLabel||topic;
    els.qType.textContent=questionTypeLabel(q.type);
    els.qTitle.textContent=entityLabel(entity);
    els.qPrompt.innerHTML=q.prompt;
    renderAnswerArea(q);
    if(window.MathJax?.typesetPromise)MathJax.typesetPromise([els.qModal]).catch(()=>{});
  }

  function questionTypeLabel(type){
    return ({mcq6:'Opción múltiple', 'tf-dropdown':'Verdadero/Falso', statements:'Verdadero/Falso por afirmaciones', integer:'Valor entero'})[type]||'Pregunta';
  }
  function entityLabel(e){
    if(e.type==='chest')return 'Cofre matemático';
    if(e.type==='monster')return 'Enemigo del método';
    if(e.type==='boss')return 'Pirámide final del Primer Parcial';
    if(e.type==='trap')return 'Trampa matemática';
    return 'Reto diferencial';
  }
  function pickQuestion(topic){
    if(topic!=='boss'){
      const roll=rand();
      if(roll<0.35){
        return prepareQuestion(generateSolutionCheckQuestion(topic),topic);
      }
      if(roll<0.70){
        return prepareQuestion(generateDynamicQuestion(topic),topic);
      }
    }
    const bank=QUESTION_BANK[topic]||QUESTION_BANK.pvi;
    state.usedQuestions[topic] ||= [];
    const unused=bank.map((q,i)=>({q,i})).filter(o=>!state.usedQuestions[topic].includes(o.i));
    const picked=topic==='boss'
      ? (unused.length ? unused[0] : {q:bank[bank.length-1],i:-1})
      : (unused.length ? choose(unused) : {q:choose(bank),i:-1});
    if(picked.i>=0) state.usedQuestions[topic].push(picked.i);
    return prepareQuestion(picked.q,topic);
  }

  function shuffleArray(arr){
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }

  function prepareQuestion(q,topic){
    const clone=JSON.parse(JSON.stringify(q));
    clone.topic=topic;
    // Evita que las opciones correctas queden siempre en la misma letra.
    if(clone.type==='mcq6' && Array.isArray(clone.choices)){
      const pairs=clone.choices.map((choice,i)=>({choice,correct:i===clone.answer}));
      const shuffled=shuffleArray(pairs);
      clone.choices=shuffled.map(o=>o.choice);
      clone.answer=shuffled.findIndex(o=>o.correct);
    }
    // Cambia el patrón de V/F reordenando afirmaciones y respuestas.
    if(clone.type==='statements' && Array.isArray(clone.statements) && Array.isArray(clone.answers)){
      const pairs=clone.statements.map((statement,i)=>({statement,answer:clone.answers[i]}));
      const shuffled=shuffleArray(pairs);
      clone.statements=shuffled.map((o,i)=>o.statement.replace(/^\s*(I{1,3}|IV|V|\d+)\.\s*/,'') );
      clone.statements=clone.statements.map((s,i)=>`${i+1}. ${s}`);
      clone.answers=shuffled.map(o=>o.answer);
    }
    return clone;
  }

  function signedTerm(n,body){
    return n>=0 ? `+${n}${body}` : `${n}${body}`;
  }

  function generateSolutionCheckQuestion(topic){
    const rint=(a,b)=>a+Math.floor(rand()*(b-a+1));
    if(topic==='pvi'){
      const a=2*rint(1,5), c=rint(1,9), half=a/2;
      return {
        type:'mcq6', level:'Comprobar solución',
        prompt:`Dado el PVI $y^{\\prime}=${a}x,\\; y(0)=${c}$, ¿cuál de las siguientes funciones es solución del problema?`,
        choices:[
          `$y=${half}x^2+${c}$`,
          `$y=${a}x^2+${c}$`,
          `$y=${half}x^2-${c}$`,
          `$y=${half}x+${c}$`,
          `$y=${c}e^{${a}x}$`,
          `$y=${half}x^2+C$`
        ],
        answer:0,
        hint:'Deriva cada candidata y verifica además la condición inicial.',
        explanation:`La solución correcta cumple simultáneamente $y^{\\prime}=${a}x$ y $y(0)=${c}$. Para $y=${half}x^2+${c}$ se tiene $y^{\\prime}=${a}x$ y al evaluar en $x=0$ resulta $y(0)=${c}$.`
      };
    }
    if(topic==='separables'){
      const k=rint(1,4), y0=rint(2,7);
      return {
        type:'mcq6', level:'Comprobar solución',
        prompt:`Dada la ecuación separable $y^{\\prime}=${k}y$ con $y(0)=${y0}$, ¿cuál función es solución?`,
        choices:[
          `$y=${y0}e^{${k}x}$`,
          `$y=${y0}e^{-${k}x}$`,
          `$y=${y0}+${k}x$`,
          `$y=e^{${k}x}+${y0}$`,
          `$y=${k}e^{${y0}x}$`,
          `$y=${y0}x^{${k}}$`
        ],
        answer:0,
        hint:'Si $y=Ce^{kx}$, entonces $y^{\\prime}=ky$; después usa $y(0)$.',
        explanation:`Para $y=${y0}e^{${k}x}$, se obtiene $y^{\\prime}=${k}\\,${y0}e^{${k}x}=${k}y$ y además $y(0)=${y0}$.`
      };
    }
    if(topic==='exactas'){
      const a=rint(1,4), b=rint(1,5), d=rint(1,4);
      return {
        type:'mcq6', level:'Comprobar solución',
        prompt:`Dada la ecuación exacta $(${2*a}xy+${b})dx+(${a}x^2+${d}\\cos y)dy=0$, ¿cuál familia implícita representa soluciones?`,
        choices:[
          `$${a}x^2y+${b}x+${d}\\sin y=C$`,
          `$${2*a}xy^2+${b}x+${d}\\sin y=C$`,
          `$${a}x^2y+${b}y+${d}\\cos y=C$`,
          `$${a}xy+${b}x-${d}\\sin y=C$`,
          `$${2*a}x^2y+${b}+${d}\\sin y=C$`,
          `$${a}x^2+${b}y+${d}\\sin y=C$`
        ],
        answer:0,
        hint:'Busca $F$ tal que $F_x=M$ y $F_y=N$.',
        explanation:`La familia correcta proviene de $F(x,y)=${a}x^2y+${b}x+${d}\\sin y$. Entonces $F_x=${2*a}xy+${b}$ y $F_y=${a}x^2+${d}\\cos y$, que coinciden con $M$ y $N$.`
      };
    }
    if(topic==='lineales'){
      const k=rint(2,5), B=rint(1,4), diff=rint(2,6), c=B+diff;
      return {
        type:'mcq6', level:'Comprobar solución',
        prompt:`Dada la ecuación lineal $y^{\\prime}+${k}y=${k*B}$ con $y(0)=${c}$, ¿cuál función satisface el PVI?`,
        choices:[
          `$y=${B}+${diff}e^{-${k}x}$`,
          `$y=${B}+${diff}e^{${k}x}$`,
          `$y=${c}e^{-${k}x}$`,
          `$y=${k*B}+${diff}e^{-${k}x}$`,
          `$y=${B}-${diff}e^{-${k}x}$`,
          `$y=${c}+${k*B}x$`
        ],
        answer:0,
        hint:'La solución de equilibrio es $y=${B}$ y el transitorio debe decaer como $e^{-${k}x}$.',
        explanation:`Para $y=${B}+${diff}e^{-${k}x}$ se tiene $y^{\\prime}=-${k*diff}e^{-${k}x}$. Luego $y^{\\prime}+${k}y=-${k*diff}e^{-${k}x}+${k}(${B}+${diff}e^{-${k}x})=${k*B}$ y $y(0)=${B}+${diff}=${c}.`
      };
    }
    const k=rint(1,4), p0=rint(3,9);
    return {
      type:'mcq6', level:'Comprobar solución',
      prompt:`En un modelo poblacional $P^{\\prime}=${k}P$ con $P(0)=${p0}$, ¿cuál de las siguientes funciones es solución?`,
      choices:[
        `$P(t)=${p0}e^{${k}t}$`,
        `$P(t)=${p0}e^{-${k}t}$`,
        `$P(t)=${p0}+${k}t$`,
        `$P(t)=e^{${k}t}+${p0}$`,
        `$P(t)=${k}e^{${p0}t}$`,
        `$P(t)=${p0}t^{${k}}$`
      ],
      answer:0,
      hint:'Verifica que $P^{\\prime}$ sea exactamente ${k} veces $P$.',
      explanation:`Para $P(t)=${p0}e^{${k}t}$ se cumple $P^{\\prime}(t)=${k}\\,${p0}e^{${k}t}=${k}P(t)$ y $P(0)=${p0}.`
    };
  }

  function generateDynamicQuestion(topic){
    const rint=(a,b)=>a+Math.floor(rand()*(b-a+1));
    if(topic==='pvi'){
      const a=2*rint(1,4), c=rint(1,9), x0=rint(0,2);
      return {type:'integer',level:'PVI parametrizado',prompt:`Para el PVI $y^{\\prime}=${a}x$, $y(${x0})=${c}$, la solución es $y=\\frac{${a}}{2}x^2+C$. ¿Cuál es el valor entero de $C$?`,answer:c-(a*x0*x0)/2,hint:'Sustituye el dato inicial en la familia de soluciones.',explanation:`Se evalúa $${c}=\\left(\\frac{${a}}{2}\\right)(${x0})^2+C$, por tanto $C=${c-(a*x0*x0)/2}$.`};
    }
    if(topic==='separables'){
      const b=rint(2,6), y0=rint(2,8);
      return {type:'integer',level:'Separable parametrizada',prompt:`Para $y^{\\prime}=\\dfrac{${b}x}{y}$ se obtiene $y^2=${b}x^2+C$. Si $y(0)=${y0}$, ¿cuál es $C$?`,answer:y0*y0,hint:'Evalúa en $x=0$.',explanation:`Como $${y0}^2=C$, entonces $C=${y0*y0}$.`};
    }
    if(topic==='exactas'){
      const a=rint(2,5), b=rint(1,6);
      return {type:'mcq6',level:'Exacta parametrizada',prompt:`Para $(${2*a}xy+${b})dx+(${a}x^2+\\cos y)dy=0$, una función potencial $F$ puede ser:`,choices:[`$F=${a}x^2y+${b}x+\\sin y$`,`$F=${2*a}xy^2+${b}x+\\sin y$`,`$F=${a}x^2y+${b}y+\\cos y$`,`$F=${a}xy+${b}x-\\sin y$`,`$F=${2*a}x^2y+${b}+\\sin y$`,`$F=${a}x^2+${b}y+\\sin y$`],answer:0,hint:'Integra $M$ respecto de $x$ y compara con $N$.',explanation:`Al integrar $M=${2*a}xy+${b}$ respecto de $x$, resulta $F=${a}x^2y+${b}x+g(y)$. Luego $g(y)=\\sin y$.`};
    }
    if(topic==='lineales'){
      const k=rint(2,6);
      return {type:'integer',level:'Lineal parametrizada',prompt:`Para $y^{\\prime}+\\frac{${k}}{x}y=x^2$, con $x>0$, el factor integrante es $\\mu=x^m$. ¿Cuál es $m$?`,answer:k,hint:'Calcula $e^{\\int k/x\\,dx}$.',explanation:`$\\mu=e^{${k}\\ln x}=x^{${k}}$, por tanto $m=${k}$.`};
    }
    const flow=rint(2,6), conc=rint(2,5), vol=[80,100,120,150][rint(0,3)], input=flow*conc;
    return {type:'mcq6',level:'Aplicación parametrizada',prompt:`Un tanque con volumen constante ${vol} L recibe salmuera a ${flow} L/min con concentración ${conc} g/L y sale mezcla a ${flow} L/min. Si $A(t)$ es la sal en gramos, la ecuación correcta es:`,choices:[`$A^{\\prime}=${input}-\\frac{${flow}}{${vol}}A$`,`$A^{\\prime}=${flow}-\\frac{${conc}}{${vol}}A$`,`$A^{\\prime}=${input}+\\frac{${flow}}{${vol}}A$`,`$A^{\\prime}=${conc}-${flow}A$`,`$A^{\\prime}=${vol}A-${input}$`,`$A^{\\prime}=\\frac{${flow}}{${vol}}A-${input}$`],answer:0,hint:'Entrada = flujo por concentración. Salida = flujo por concentración interna.',explanation:`Entra $${flow}\\cdot ${conc}=${input}$ g/min. Sale $${flow}\\left(A/${vol}\\right)$.`};
  }

  function renderAnswerArea(q){
    els.qAnswerArea.innerHTML='';
    els.submitAnswer.classList.toggle('hidden', q.type==='mcq6');
    if(q.type==='mcq6'){
      const wrap=document.createElement('div'); wrap.className='choices';
      q.choices.forEach((c,i)=>{
        const btn=document.createElement('button');
        btn.className='choice'; btn.dataset.choice=String(i);
        btn.innerHTML=`<span class="letter">${String.fromCharCode(65+i)}.</span> ${c}`;
        btn.addEventListener('click',()=>{
          if(state.autoSubmitting || btn.disabled) return;
          wrap.querySelectorAll('.choice').forEach(b=>b.classList.remove('selected','autosend'));
          btn.classList.add('selected','autosend');
          els.qAnswerArea.dataset.answer=String(i);
          state.autoSubmitting = true;
          wrap.querySelectorAll('.choice').forEach(b=>b.disabled=true);
          setTimeout(()=>submitAnswer(), 320);
        });
        wrap.appendChild(btn);
      });
      els.qAnswerArea.appendChild(wrap);
    } else if(q.type==='tf-dropdown'){
      const row=document.createElement('div'); row.className='drop-row';
      row.innerHTML=`<span>Selecciona el valor de verdad:</span>
        <select id="tfSelect"><option value="">Seleccionar...</option><option value="true">Verdadero</option><option value="false">Falso</option></select>`;
      els.qAnswerArea.appendChild(row);
    } else if(q.type==='statements'){
      const wrap=document.createElement('div'); wrap.className='drop-grid';
      q.statements.forEach((st,i)=>{
        const row=document.createElement('div'); row.className='drop-row';
        row.innerHTML=`<span>${st}</span>
        <select data-statement="${i}"><option value="">Seleccionar...</option><option value="true">Verdadero</option><option value="false">Falso</option></select>`;
        wrap.appendChild(row);
      });
      els.qAnswerArea.appendChild(wrap);
    } else if(q.type==='integer'){
      const box=document.createElement('div'); box.className='integer-box';
      box.innerHTML=`<label>Respuesta entera <input id="integerAnswer" type="number" step="1" placeholder="Ej. 3"></label>`;
      els.qAnswerArea.appendChild(box);
      setTimeout(()=>document.getElementById('integerAnswer')?.focus(),50);
    }
    if(window.MathJax?.typesetPromise)MathJax.typesetPromise([els.qAnswerArea]).catch(()=>{});
  }

  function showQuestionHint(){
    const q=state.currentQuestion;
    if(!q)return;
    els.qHint.innerHTML=`<b>Pista:</b> ${q.hint||'Identifica primero el tipo de ecuación y luego el método.'}`;
    els.qHint.classList.remove('hidden');
    els.hintBtn.disabled=true;
    if(window.MathJax?.typesetPromise)MathJax.typesetPromise([els.qHint]).catch(()=>{});
  }

  function readAnswer(q){
    if(q.type==='mcq6'){
      const v=els.qAnswerArea.dataset.answer;
      return v===''||v===undefined?null:Number(v);
    }
    if(q.type==='tf-dropdown'){
      const v=document.getElementById('tfSelect')?.value;
      if(!v)return null;
      return v==='true';
    }
    if(q.type==='statements'){
      const selects=[...els.qAnswerArea.querySelectorAll('select[data-statement]')];
      const vals=selects.map(s=>s.value);
      if(vals.some(v=>!v))return null;
      return vals.map(v=>v==='true');
    }
    if(q.type==='integer'){
      const v=document.getElementById('integerAnswer')?.value;
      if(v===''||v===undefined)return null;
      return Number(v);
    }
    return null;
  }

  function answerIsCorrect(q,ans){
    if(ans===null)return null;
    if(q.type==='statements') return ans.length===q.answers.length && ans.every((v,i)=>v===q.answers[i]);
    if(q.type==='integer') return Number(ans)===Number(q.answer);
    return ans===q.answer;
  }

  function submitAnswer(){
    const q=state.currentQuestion,e=state.currentEntity;
    if(!q||!e)return;
    const ans=readAnswer(q);
    const correct=answerIsCorrect(q,ans);
    if(correct===null){showToast('Selecciona o escribe una respuesta antes de enviar.');return;}
    els.submitAnswer.disabled=true;
    els.hintBtn.disabled=true;

    const isTrapQuestion = state.trapped || q.trap || e.type==='trap';
    const isBossQuestion = q.topic==='boss' && e.type==='boss';
    let delta;
    let worldCapReached=false;
    if(isBossQuestion){
      // En el monstruo final no se ganan décimas por responder bien.
      // Un error reinicia la pirámide y resta 0.5.
      delta=correct?0:-0.5;
    } else if(q.topic==='boss'){
      // Preguntas de trampa dentro de la pirámide: correcto no suma, error resta 0.3.
      delta=correct?0:-0.3;
    } else if(correct){
      state.worldScoreGain[q.topic] ||= 0;
      const remaining=+(1.0-state.worldScoreGain[q.topic]).toFixed(2);
      if(remaining<=0){
        delta=0;
        worldCapReached=true;
      } else {
        delta=Math.min(SCORE_CORRECT, remaining);
        state.worldScoreGain[q.topic]=+(state.worldScoreGain[q.topic]+delta).toFixed(2);
      }
    } else {
      delta=SCORE_WRONG;
    }
    state.grade=clamp(+(state.grade+delta).toFixed(2),0,5);

    if(correct){
      state.correct++;
      if(isTrapQuestion){
        sparkle((state.trapTile?.x||0)*TILE+16,(state.trapTile?.y||0)*TILE+16,'#f4c15d');
      } else if(isBossQuestion){
        sparkle(e.x+e.w/2,e.y+e.h/2,'#7cf7b1');
      } else {
        e.solved=true; e.active=false;
        sparkle(e.x+e.w/2,e.y+e.h/2,'#f4c15d');
      }
    } else {
      state.wrong++;
      if(isTrapQuestion){
        state.trapAttempts++;
        expandTrap();
      } else {
        sparkle(e.x+e.w/2,e.y+e.h/2,'#ff6b6b');
      }
    }

    decorateAnswers(q,correct,ans);
    state.answered.push({time:new Date().toISOString(),topic:q.topic,type:q.type,prompt:stripHTML(q.prompt),answer:serializeAnswer(ans),correct,delta,grade:state.grade,trap:isTrapQuestion,worldCapReached});
    els.qFeedback.className='feedback '+(correct?'correct':'wrong');
    els.qFeedback.innerHTML=buildFeedbackHTML(q,{correct,isBossQuestion,worldCapReached,delta});
    els.qFeedback.classList.remove('hidden');

    const totalBoss=(QUESTION_BANK.boss||[]).length;
    const answeredBoss=(state.usedQuestions.boss||[]).length;
    state.pendingQuestionOutcome={
      isTrapQuestion,
      isBossQuestion,
      correct,
      nextLabel: isTrapQuestion
        ? (correct ? 'Continuar jugando' : 'Seguir intentando salir')
        : (isBossQuestion ? (correct ? (answeredBoss<totalBoss ? 'Continuar a la siguiente defensa final' : 'Derrotar monstruo final') : 'Reiniciar pirámide final') : 'Continuar jugando')
    };
    els.closeQuestionBtn.textContent=state.pendingQuestionOutcome.nextLabel;
    els.closeQuestionBtn.classList.remove('hidden');
    state.mode='question';

    updateHUD();
    SCORM?.saveScore?.(state.grade,state.answered);
    if(window.MathJax?.typesetPromise)MathJax.typesetPromise([els.qFeedback]).catch(()=>{});
  }

  function resolveQuestionOutcome(){
    const outcome=state.pendingQuestionOutcome;
    const e=state.currentEntity;
    if(!outcome) return;
    closeQuestion();
    if(outcome.isTrapQuestion){
      if(outcome.correct){
        releaseTrap();
      } else {
        showToast('Respuesta incorrecta: el hueco se hizo más grande. La escalera sigue ahí, pero solo funciona con una respuesta correcta.',3.0);
        setTimeout(()=>askTrapQuestion(),220);
      }
      return;
    }
    if(outcome.isBossQuestion){
      if(!outcome.correct){
        state.bossFailureCount++;
        showToast('El monstruo final se fortaleció. La pirámide se reinicia desde lejos y la próxima defensa será más difícil.',4.0);
        setTimeout(()=>restartPyramidAfterBossFailure(),400);
        return;
      }
      const totalBoss=(QUESTION_BANK.boss||[]).length;
      const answeredBoss=(state.usedQuestions.boss||[]).length;
      if(answeredBoss<totalBoss){
        showToast(`Continúas con la defensa final ${answeredBoss+1}/${totalBoss}.`,2.6);
        setTimeout(()=>askQuestion('boss',e),220);
      } else {
        if(e){ e.solved=true; e.active=false; }
        if(!state.seals.includes('boss')){
          state.seals.push('boss');
          state.inventory.push(TOPIC_META.boss.item);
        }
        state.grade=5.0;
        state.gameCompleted=true;
        updateHUD();
        SCORM?.saveScore?.(state.grade,state.answered);
        showVictory();
      }
      return;
    }
    if(outcome.correct&&state.scene.kind==='dungeon'){
      const solved=countSolvedDungeon(), needed=state.scene.required||3;
      if(solved>=needed) showToast('Ya puedes volver a la salida para reclamar el sello. La brújula apunta hacia la salida.');
    }
  }

  function restartPyramidAfterBossFailure(){
    state.scene=buildDungeon('boss');
    state.currentTopic='boss';
    state.player.x=5*TILE;
    state.player.y=33*TILE;
    state.player.sliding=false;
    state.player.slideVx=0; state.player.slideVy=0; state.player.slideLock=0;
    state.onBoat=false; state.currentBoat=null;
    state.trapped=false; state.trapTile=null; state.trapLadderVisible=false;
    state.lastSafe={x:state.player.x,y:state.player.y};
    state.showMap=false;
    state.mode='playing';
    resetSeaCurrentTracker();
    updateHUD();
  }

  function serializeAnswer(ans){return Array.isArray(ans)?ans.map(v=>v?'V':'F').join(','):ans;}
  function latexWrap(value){
    return `\\(${String(value)}\\)`;
  }
  function feedbackPrefixHTML(q,{correct,isBossQuestion,worldCapReached,delta}){
    if(isBossQuestion){
      return correct
        ? `<b>Correcto.</b> No sumas décimas en el monstruo final, pero avanzas hacia la derrota del guardián.`
        : `<b>Incorrecto.</b> Pierdes ${latexWrap('-0.5')} y la pirámide final se reiniciará desde el inicio.`;
    }
    if(q.topic==='boss'){
      return correct
        ? `<b>Correcto.</b> En la pirámide final no sumas décimas, pero puedes seguir avanzando.`
        : `<b>Incorrecto.</b> En la pirámide final pierdes ${latexWrap('-0.3')}.`;
    }
    if(correct && worldCapReached) return `<b>Correcto.</b> Ya alcanzaste el máximo de ${latexWrap('1.0')} unidad de puntaje en este mundo; esta respuesta no suma más nota hasta pasar al siguiente mundo.`;
    return correct
      ? `<b>Correcto.</b> Sumas ${latexWrap(delta>0?`+${delta.toFixed(1)}`:'+0.0')}.`
      : `<b>Incorrecto.</b> Pierdes ${latexWrap('-0.1')}, pero puedes seguir intentando.`;
  }
  function buildFeedbackHTML(q,{correct,isBossQuestion,worldCapReached=false,delta=0}){
    const prefix=feedbackPrefixHTML(q,{correct,isBossQuestion,worldCapReached,delta});
    const answer=correct ? '' : `<div class="feedback-answer">${correctAnswerText(q)}</div>`;
    const explanation=q.explanation ? `<div class="feedback-math">${q.explanation}</div>` : '';
    return `<div class="feedback-prefix">${prefix}</div>${answer}${explanation}`;
  }
  function correctAnswerText(q){
    if(q.type==='mcq6')return `Respuesta correcta: <b>${String.fromCharCode(65+q.answer)}</b>.`;
    if(q.type==='tf-dropdown')return `Respuesta correcta: ${latexWrap(q.answer?'\\text{Verdadero}':'\\text{Falso}')}.`;
    if(q.type==='statements')return `Respuesta correcta: ${latexWrap(q.answers.map(v=>v?'V':'F').join(', '))}.`;
    if(q.type==='integer')return `Respuesta correcta: ${latexWrap(q.answer)}.`;
    return '';
  }
  function decorateAnswers(q,correct,ans){
    if(q.type==='mcq6'){
      const buttons=[...els.qAnswerArea.querySelectorAll('.choice')];
      buttons.forEach((b,i)=>{b.disabled=true;if(i===q.answer)b.classList.add('correct');if(i===ans&&!correct)b.classList.add('wrong');});
    } else {
      els.qAnswerArea.querySelectorAll('input,select').forEach(el=>el.disabled=true);
    }
  }
  function closeQuestion(){
    state.autoSubmitting=false;
    els.submitAnswer.classList.remove('hidden');
    els.closeQuestionBtn.classList.add('hidden');
    els.closeQuestionBtn.textContent='Continuar jugando';
    els.qModal.classList.add('hidden');
    if(state.mode==='question')state.mode='playing';
    state.currentQuestion=null; state.currentEntity=null;
    state.pendingQuestionOutcome=null;
    els.qAnswerArea.innerHTML='';
    delete els.qAnswerArea.dataset.answer;
  }

  function updateHUD(){
    if(els.hearts) els.hearts.innerHTML='';
    els.gradeText.textContent=state.grade.toFixed(1);
    els.sealsText.textContent=`${state.seals.filter(s=>s!=='boss').length}/5`;
    els.correctText.textContent=state.correct;
    els.wrongText.textContent=state.wrong;
    els.chapterText.textContent=state.scene?.name||'Reino del Primer Corte';
    const showRestart = state.scene?.kind==='dungeon' && ['playing','question','rescue'].includes(state.mode);
    els.worldRestartBox.classList.toggle('hidden', !showRestart);
    if(state.mode==='rescue'){
      els.hintText.textContent='Atrapado: puedes reiniciar el mundo actual (-0.1).';
    }
    if(state.mode==='playing'){
      const target=nearestEntity();
      const objective=currentObjective();
      els.hintText.textContent=target?hintFor(target):`${objective.label} · ${formatTime(state.elapsed)}`;
      updateCompass(objective);
    }
  }

  function currentObjective(){
    if(state.trapped){return {label:'Atrapado: responde bien para salir',target:null};}
    if(state.onBoat){
      const next=state.scene.entities.filter(e=>e.active&&!e.solved&&['monster','chest','boss'].includes(e.type)).sort((a,b)=>distanceToPlayer(a)-distanceToPlayer(b))[0];
      return {label: state.currentBoat?.vehicle==='plane' ? 'Vuela y aterriza en cualquier isla' : 'Navega y desembarca en una isla', target:next};
    }
    if(state.scene.kind==='dungeon'){
      const solved=countSolvedDungeon(), needed=state.scene.required||3;
      if(solved>=needed){const exit=state.scene.entities.find(e=>e.type==='exit');return {label:'Vuelve a la salida y reclama sello',target:exit};}
      if(state.scene.topic==='separables' && !state.scene.boatUsed && solved>=1){
        const b=state.scene.entities.find(e=>e.type==='boat'&&e.id==='boat_to_guardian');
        if(b) return {label:'Usa el barco hacia la isla',target:b};
      }
      if(state.scene.topic==='aplicaciones' && !state.scene.boatUsed){
        const b=state.scene.entities.find(e=>e.type==='boat'&&e.vehicle==='plane'&&e.active);
        if(b) return {label:'Usa un avión hacia las nubes',target:b};
      }
      const next=state.scene.entities.filter(e=>e.active&&!e.solved&&['monster','chest','boss'].includes(e.type)).sort((a,b)=>distanceToPlayer(a)-distanceToPlayer(b))[0];
      if(state.scene.topic==='boss'){
        const totalFinal=(QUESTION_BANK.boss||[]).length;
        const progress=Math.min((state.usedQuestions.boss||[]).length,totalFinal);
        return {label:`Pirámide final: pregunta ${Math.min(progress+1,totalFinal)}/${totalFinal}`,target:next};
      }
      return {label:`Busca reto ${solved+1}/${needed}`,target:next};
    }
    const next=nextTopic();
    const ent=state.world.entities.find(e=>e.type==='entrance'&&e.topic===next);
    return {label: ent?`Ve hacia ${ent.name}`:'Explora el mapa', target:ent};
  }
  function distanceToPlayer(e){if(!e)return Infinity;const c=center(e);return Math.hypot(c.x-(state.player.x+state.player.w/2),c.y-(state.player.y+state.player.h/2));}
  function updateCompass(obj){
    if(!obj||!obj.target){els.compassLabel.textContent='Explora';els.compassArrow.style.transform='rotate(0deg)';return;}
    els.compassLabel.textContent=obj.label;
    const pc={x:state.player.x+state.player.w/2,y:state.player.y+state.player.h/2}, tc=center(obj.target);
    const angle=Math.atan2(tc.y-pc.y,tc.x-pc.x)*180/Math.PI;
    els.compassArrow.style.transform=`rotate(${angle}deg)`;
  }
  function hintFor(e){
    if(e.type==='entrance')return `E: entrar a ${e.name}`;
    if(e.type==='exit')return 'E: salir / reclamar sello';
    if(e.type==='boat')return e.vehicle==='plane' ? 'E: subir al avión y volar' : 'E: subir al barco y manejarlo';
    if(e.type==='sealdoor')return `E: colocar ${TOPIC_META[e.sealTopic]?.seal||'sello'}`;
    if(e.type==='chest')return 'E: abrir cofre con pregunta';
    if(e.type==='monster')return 'E: enfrentar enemigo';
    if(e.type==='boss')return 'E: reto del jefe final';
    if(e.type==='npc')return 'E: hablar';
    if(e.type==='sign')return 'E: leer señal';
    return 'E: interactuar';
  }
  function heartSVG(full){const fill=full?'#ff5b68':'#33424a';return `<svg viewBox="0 0 32 32" width="100%" height="100%"><path fill="#421217" d="M16 29S3 20 3 10c0-5 5-8 9-5 2 1 4 4 4 4s2-3 4-4c4-3 9 0 9 5 0 10-13 19-13 19z"/><path fill="${fill}" d="M16 26S6 18.7 6 10.7c0-3.4 3.4-5.3 6-3.2 1.8 1.3 4 4.2 4 4.2s2.2-2.9 4-4.2c2.6-2.1 6-.2 6 3.2 0 8-10 15.3-10 15.3z"/></svg>`;}

  function showToast(msg,seconds=4){
    els.toast.innerHTML=msg;
    els.toast.classList.remove('hidden');
    state.toastTimer=seconds;
    if(window.MathJax?.typesetPromise)MathJax.typesetPromise([els.toast]).catch(()=>{});
  }
  function sparkle(x,y,color){for(let i=0;i<22;i++)state.scene.particles.push({x,y,vx:(rand()-.5)*90,vy:(rand()-.8)*90,life:.7+rand()*.4,color});}

  function draw(){
    const w=window.innerWidth,h=window.innerHeight;
    ctx.clearRect(0,0,w,h);
    drawScene(ctx,state.scene,state.camera.x,state.camera.y,w,h);
    drawTrapLadder(ctx);
    drawEntities(ctx,state.scene);
    drawPlayer(ctx,state.player.x-state.camera.x,state.player.y-state.camera.y,state.player.dir,state.player.step);
    drawParticles(ctx,state.scene);
    if(state.showMap)drawMiniMap(ctx,w,h);
    if(state.mode==='menu')drawTitleGlow(ctx,w,h);
    if(state.securityLocked) drawSecurityOverlay(ctx,w,h);
  }
  function drawSecurityOverlay(ctx,w,h){
    ctx.fillStyle='rgba(2,8,12,.66)';
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(8,18,22,.92)';
    roundedRect(ctx,w/2-270,h/2-88,540,176,22,true);
    ctx.strokeStyle='rgba(244,193,93,.92)';
    ctx.lineWidth=3;
    roundedRect(ctx,w/2-270,h/2-88,540,176,22,false);
    ctx.fillStyle='#fff3ca';
    ctx.textAlign='center';
    ctx.font='bold 28px system-ui';
    ctx.fillText('Actividad bloqueada',w/2,h/2-28);
    ctx.font='18px system-ui';
    wrapCenteredText(ctx,state.securityMessage||'Regresa a pantalla completa para continuar.',w/2,h/2+10,470,24);
    ctx.font='15px system-ui';
    ctx.fillStyle='#ffd98a';
    ctx.fillText('Mantén la ventana visible y en pantalla completa.',w/2,h/2+58);
    ctx.textAlign='left';
  }

  function drawScene(ctx,scene,camX,camY,w,h){
    const x0=Math.floor(camX/TILE)-1,y0=Math.floor(camY/TILE)-1,x1=Math.ceil((camX+w)/TILE)+1,y1=Math.ceil((camY+h)/TILE)+1;
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)drawTile(ctx,tileAt(scene,x,y),x*TILE-camX,y*TILE-camY,x,y);
    scene.decor.forEach(d=>{const sx=d.x-camX,sy=d.y-camY;if(sx<-10||sy<-10||sx>w+10||sy>h+10)return;ctx.fillStyle='rgba(233,255,171,.45)';ctx.fillRect(sx,sy,2,5);ctx.fillRect(sx+3,sy+2,2,4);});
  }
  function drawTrapLadder(ctx){
    if(!state.trapLadderVisible || !state.trapTile) return;
    const sx = state.trapTile.x*TILE - state.camera.x;
    const sy = state.trapTile.y*TILE - state.camera.y;
    if(sx<-40||sy<-40||sx>window.innerWidth+40||sy>window.innerHeight+40) return;
    // Escalera de salida dentro del hueco.
    ctx.fillStyle='rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(sx+16,sy+20,12,6,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#e8c06c';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(sx+9,sy+7); ctx.lineTo(sx+9,sy+27);
    ctx.moveTo(sx+23,sy+7); ctx.lineTo(sx+23,sy+27);
    for(let yy=10; yy<=25; yy+=5){ ctx.moveTo(sx+9,sy+yy); ctx.lineTo(sx+23,sy+yy); }
    ctx.stroke();
    ctx.strokeStyle='rgba(62,35,14,.8)';
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(sx+11,sy+8); ctx.lineTo(sx+11,sy+27);
    ctx.moveTo(sx+25,sy+8); ctx.lineTo(sx+25,sy+27);
    ctx.stroke();
  }

  function drawTile(ctx,t,sx,sy,x,y){
    switch(t){
      case TYPES.grass: tileGrass(ctx,sx,sy,x,y); break;
      case TYPES.path: tilePath(ctx,sx,sy,x,y); break;
      case TYPES.water: tileWater(ctx,sx,sy,x,y); break;
      case TYPES.bridge: tileBridge(ctx,sx,sy,x,y); break;
      case TYPES.forest: tileForest(ctx,sx,sy,x,y); break;
      case TYPES.cliff: tileCliff(ctx,sx,sy,x,y); break;
      case TYPES.flower: tileGrass(ctx,sx,sy,x,y); drawFlower(ctx,sx,sy,x,y); break;
      case TYPES.stone: tileGrass(ctx,sx,sy,x,y); drawRock(ctx,sx+5,sy+7,22,17); break;
      case TYPES.sand: tileSand(ctx,sx,sy,x,y); break;
      case TYPES.floor: tileFloor(ctx,sx,sy,x,y); break;
      case TYPES.wall: tileWall(ctx,sx,sy,x,y); break;
      case TYPES.lava: tileLava(ctx,sx,sy,x,y); break;
      case TYPES.ice: tileIce(ctx,sx,sy,x,y); break;
      case TYPES.cracked: tileCracked(ctx,sx,sy,x,y); break;
      case TYPES.dark: tileDark(ctx,sx,sy,x,y); break;
      case TYPES.current: tileCurrent(ctx,sx,sy,x,y); break;
      case TYPES.ash: tileAsh(ctx,sx,sy,x,y); break;
      case TYPES.snow: tileSnow(ctx,sx,sy,x,y); break;
      case TYPES.pit: tilePit(ctx,sx,sy,x,y); break;
      case TYPES.ladder: tileLadder(ctx,sx,sy,x,y); break;
      default: tileGrass(ctx,sx,sy,x,y);
    }
  }
  function bevel(ctx,sx,sy,light='rgba(255,255,255,.16)',dark='rgba(0,0,0,.16)'){ctx.fillStyle=light;ctx.fillRect(sx+1,sy+1,TILE-2,3);ctx.fillRect(sx+1,sy+1,3,TILE-2);ctx.fillStyle=dark;ctx.fillRect(sx,sy+TILE-4,TILE,4);ctx.fillRect(sx+TILE-4,sy,4,TILE);}
  function tileGrass(ctx,sx,sy,x,y){ctx.fillStyle=((x+y)&1)?'#39b969':'#47cc79';ctx.fillRect(sx,sy,TILE,TILE);bevel(ctx,sx,sy);const n=(x*19+y*7)%23;ctx.fillStyle='rgba(244,255,196,.55)';if(n%3===0)ctx.fillRect(sx+8,sy+10,2,2);if(n%5===0)ctx.fillRect(sx+22,sy+18,2,2);}
  function tilePath(ctx,sx,sy,x,y){ctx.fillStyle='#d5a95c';ctx.fillRect(sx,sy,TILE,TILE);bevel(ctx,sx,sy,'rgba(255,245,180,.25)','rgba(96,54,24,.18)');ctx.fillStyle='rgba(73,39,17,.18)';for(let i=0;i<8;i++){ctx.fillRect(sx+((x*11+y*5+i*7)%28),sy+((x*5+y*13+i*3)%28),3,2);}}
  function tileSand(ctx,sx,sy,x,y){ctx.fillStyle='#e2c778';ctx.fillRect(sx,sy,TILE,TILE);bevel(ctx,sx,sy,'rgba(255,255,220,.18)','rgba(119,84,35,.2)');for(let i=0;i<6;i++){ctx.fillStyle='rgba(119,84,35,.2)';ctx.fillRect(sx+((x*7+i*5)%30),sy+((y*9+i*7)%30),2,2);}}
  function tileWater(ctx,sx,sy,x,y){ctx.fillStyle=((x+y)&1)?'#2e89c9':'#2d76b9';ctx.fillRect(sx,sy,TILE,TILE);bevel(ctx,sx,sy,'rgba(255,255,255,.18)','rgba(0,20,75,.18)');ctx.fillStyle='rgba(170,233,255,.62)';ctx.fillRect(sx+4+(x*3+y)%7,sy+10,15,2);ctx.fillRect(sx+13,sy+22,12,2);}
  function tileCurrent(ctx,sx,sy,x,y){tileWater(ctx,sx,sy,x,y);ctx.fillStyle='rgba(255,255,255,.82)';ctx.fillRect(sx+8,sy+14,16,2);ctx.fillRect(sx+16,sy+18,7,2);}
  function tileBridge(ctx,sx,sy,x,y){tileWater(ctx,sx,sy,x,y);ctx.fillStyle='#9f6233';ctx.fillRect(sx,sy+7,TILE,TILE-14);ctx.fillStyle='#d6934d';for(let i=0;i<4;i++)ctx.fillRect(sx+i*8+1,sy+7,4,TILE-14);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(sx,sy+TILE-8,TILE,3);}
  function tileForest(ctx,sx,sy,x,y){ctx.fillStyle='#123b34';ctx.fillRect(sx,sy,TILE,TILE);ctx.fillStyle='#5a3925';ctx.fillRect(sx+13,sy+16,7,14);ctx.fillStyle='#0b5c45';ctx.beginPath();ctx.arc(sx+12,sy+13,11,0,Math.PI*2);ctx.arc(sx+22,sy+13,11,0,Math.PI*2);ctx.arc(sx+17,sy+7,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(157,235,113,.30)';ctx.fillRect(sx+9,sy+6,5,3);ctx.fillRect(sx+17,sy+3,4,3);bevel(ctx,sx,sy,'rgba(255,255,255,.06)','rgba(0,0,0,.22)');}
  function tileCliff(ctx,sx,sy,x,y){ctx.fillStyle='#435f57';ctx.fillRect(sx,sy,TILE,TILE);ctx.fillStyle='#8a9779';ctx.fillRect(sx,sy,TILE,10);ctx.fillStyle='rgba(255,255,220,.15)';ctx.fillRect(sx+2,sy+2,TILE-4,3);ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(sx,sy+22,TILE,10);ctx.fillStyle='#273d3b';for(let i=0;i<4;i++)ctx.fillRect(sx+((x*3+i*8)%26),sy+11+i*4,7,2);}
  function tileFloor(ctx,sx,sy,x,y){ctx.fillStyle=((x+y)&1)?'#706852':'#7a7158';ctx.fillRect(sx,sy,TILE,TILE);bevel(ctx,sx,sy,'rgba(255,239,173,.12)','rgba(0,0,0,.22)');ctx.strokeStyle='rgba(0,0,0,.18)';ctx.strokeRect(sx+.5,sy+.5,TILE-1,TILE-1);}
  function tileWall(ctx,sx,sy,x,y){ctx.fillStyle='#2f3744';ctx.fillRect(sx,sy,TILE,TILE);ctx.fillStyle='#5a6674';ctx.fillRect(sx,sy,TILE,9);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(sx,sy+23,TILE,9);ctx.strokeStyle='rgba(255,255,255,.08)';ctx.strokeRect(sx+.5,sy+.5,TILE-1,TILE-1);}
  function tileLava(ctx,sx,sy,x,y){ctx.fillStyle='#80201e';ctx.fillRect(sx,sy,TILE,TILE);bevel(ctx,sx,sy,'rgba(255,175,60,.18)','rgba(0,0,0,.22)');ctx.fillStyle='#ffab3c';ctx.fillRect(sx+3+(x+y)%5,sy+9,18,3);ctx.fillRect(sx+12,sy+22,15,3);}
  function tileAsh(ctx,sx,sy,x,y){ctx.fillStyle=((x+y)&1)?'#5d554b':'#655d52';ctx.fillRect(sx,sy,TILE,TILE);bevel(ctx,sx,sy,'rgba(255,213,145,.1)','rgba(0,0,0,.22)');ctx.fillStyle='rgba(35,20,15,.22)';ctx.fillRect(sx+((x*7)%24),sy+((y*11)%24),5,2);}
  function tileIce(ctx,sx,sy,x,y){ctx.fillStyle=((x+y)&1)?'#aeeaf4':'#c7f6ff';ctx.fillRect(sx,sy,TILE,TILE);bevel(ctx,sx,sy,'rgba(255,255,255,.42)','rgba(40,95,120,.18)');ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(sx+5,sy+7,16,2);ctx.fillRect(sx+13,sy+19,12,2);}
  function tileSnow(ctx,sx,sy,x,y){ctx.fillStyle=((x+y)&1)?'#e4f3f7':'#d7ebf3';ctx.fillRect(sx,sy,TILE,TILE);bevel(ctx,sx,sy,'rgba(255,255,255,.38)','rgba(80,110,125,.12)');ctx.fillStyle='rgba(120,165,180,.25)';ctx.fillRect(sx+8,sy+10,3,2);ctx.fillRect(sx+22,sy+20,3,2);}
  function tileCracked(ctx,sx,sy,x,y){tileAsh(ctx,sx,sy,x,y);ctx.strokeStyle='#261515';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx+8,sy+6);ctx.lineTo(sx+15,sy+14);ctx.lineTo(sx+12,sy+25);ctx.moveTo(sx+17,sy+14);ctx.lineTo(sx+25,sy+10);ctx.moveTo(sx+15,sy+14);ctx.lineTo(sx+24,sy+24);ctx.stroke();}
  function tileDark(ctx,sx,sy,x,y){ctx.fillStyle=((x+y)&1)?'#3c352e':'#463d34';ctx.fillRect(sx,sy,TILE,TILE);bevel(ctx,sx,sy,'rgba(255,225,160,.07)','rgba(0,0,0,.28)');ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(sx+((x*5)%25),sy+((y*7)%25),6,2);}
  function tilePit(ctx,sx,sy,x,y){ctx.fillStyle='#120c0b';ctx.fillRect(sx,sy,TILE,TILE);ctx.fillStyle='rgba(0,0,0,.72)';ctx.beginPath();ctx.ellipse(sx+16,sy+17,14,11,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,180,80,.18)';ctx.fillRect(sx+4,sy+5,23,3);ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(sx+3,sy+24,26,5);}
  function tileLadder(ctx,sx,sy,x,y){
    ctx.fillStyle='#2a1a10';ctx.fillRect(sx,sy,TILE,TILE);
    ctx.fillStyle='rgba(255,220,120,.18)';ctx.fillRect(sx+2,sy+2,TILE-4,4);
    ctx.strokeStyle='#f0c36b';ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(sx+8,sy+4);ctx.lineTo(sx+8,sy+28);
    ctx.moveTo(sx+24,sy+4);ctx.lineTo(sx+24,sy+28);
    for(let yy=8; yy<=26; yy+=6){ctx.moveTo(sx+8,sy+yy);ctx.lineTo(sx+24,sy+yy);}
    ctx.stroke();
    ctx.strokeStyle='rgba(70,38,15,.85)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(sx+10,sy+5);ctx.lineTo(sx+10,sy+28);ctx.moveTo(sx+26,sy+5);ctx.lineTo(sx+26,sy+28);ctx.stroke();
  }
  function drawFlower(ctx,sx,sy,x,y){const px=sx+8+((x*9+y*4)%12),py=sy+8+((x*3+y*7)%12);ctx.fillStyle='#fff5d2';ctx.fillRect(px,py,3,3);ctx.fillStyle='#ff6fa3';ctx.fillRect(px+3,py,3,3);ctx.fillRect(px-3,py,3,3);ctx.fillRect(px,py-3,3,3);ctx.fillRect(px,py+3,3,3);}
  function drawRock(ctx,x,y,w,h){ctx.fillStyle='#7f9da1';ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.22)';ctx.fillRect(x+4,y+3,w/2,3);ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(x+3,y+h-4,w-6,3);}
  function drawEntities(ctx,scene){[...scene.entities].sort((a,b)=>a.y-b.y).forEach(e=>{if(!e.active&&e.type!=='entrance')return;const sx=e.x-state.camera.x,sy=e.y-state.camera.y;if(sx<-90||sy<-90||sx>window.innerWidth+90||sy>window.innerHeight+90)return;if(e.type==='npc')drawNPC(ctx,sx,sy,e);if(e.type==='chest')drawChest(ctx,sx,sy,e.solved);if(e.type==='monster')drawMonster(ctx,sx,sy,e);if(e.type==='boss')drawBoss(ctx,sx,sy,e);if(e.type==='entrance')drawEntrance(ctx,sx,sy,e);if(e.type==='exit')drawExit(ctx,sx,sy);if(e.type==='sign')drawSign(ctx,sx,sy);if(e.type==='boulder')drawBoulder(ctx,sx,sy,e);if(e.type==='boat')drawBoat(ctx,sx,sy,e);if(e.type==='sealdoor')drawSealDoor(ctx,sx,sy,e);});}
  function shadow(ctx,x,y,w=26,h=7){ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);ctx.fill();}
  function drawNPC(ctx,x,y,e){shadow(ctx,x,y+22,24,6);ctx.fillStyle='#573b2b';ctx.fillRect(x+9,y+12,8,13);ctx.fillStyle='#f6b26b';ctx.fillRect(x+6,y+6,14,12);ctx.fillStyle='#5a88df';ctx.fillRect(x+5,y+17,16,11);ctx.fillStyle='#1a130e';ctx.fillRect(x+9,y+10,2,2);ctx.fillRect(x+16,y+10,2,2);ctx.fillStyle='#f9e6a0';ctx.fillRect(x+8,y+3,13,4);}
  function drawChest(ctx,x,y,open){shadow(ctx,x,y+20,26,7);ctx.fillStyle='#64391e';ctx.fillRect(x+3,y+9,24,16);ctx.fillStyle=open?'#96704b':'#b7652e';ctx.fillRect(x+3,y+6,24,8);ctx.fillStyle='#f5c55d';ctx.fillRect(x+13,y+9,5,9);ctx.fillRect(x+4,y+15,22,2);if(open){ctx.fillStyle='#fff3a0';ctx.fillRect(x+6,y+2,18,5);}}
  function drawMonster(ctx,x,y,e){
    const bob=Math.sin(e.t*5)*2;
    if(e.kind==='dragon') return drawDragon(ctx,x,y+bob,false);
    if(e.kind==='medusa') return drawMedusa(ctx,x,y+bob,false);
    if(e.kind==='kraken') return drawKraken(ctx,x,y+bob,false);
    if(e.kind==='yeti') return drawYeti(ctx,x,y+bob,false);
    if(e.kind==='chimera') return drawChimera(ctx,x,y+bob,false);
    return drawGriffin(ctx,x,y+bob,false);
  }
  function drawBoss(ctx,x,y,e){
    const bob=Math.sin(e.t*3)*2;
    if(e.kind==='dragon') return drawDragon(ctx,x,y+bob,true);
    if(e.kind==='medusa') return drawMedusa(ctx,x,y+bob,true);
    if(e.kind==='kraken') return drawKraken(ctx,x,y+bob,true);
    if(e.kind==='yeti') return drawYeti(ctx,x,y+bob,true);
    return drawChimera(ctx,x,y+bob,true);
  }

  function drawGriffin(ctx,x,y,big){
    const s=big?1.35:1; shadow(ctx,x,y+24*s,30*s,8*s);
    ctx.fillStyle='#c99134'; ctx.fillRect(x+5*s,y+9*s,20*s,16*s);
    ctx.fillStyle='#f0d07b'; ctx.fillRect(x+10*s,y+4*s,13*s,11*s);
    ctx.fillStyle='#7b4d20'; ctx.fillRect(x+1*s,y+12*s,8*s,7*s); ctx.fillRect(x+23*s,y+12*s,8*s,7*s);
    ctx.fillStyle='#fff'; ctx.fillRect(x+13*s,y+8*s,3*s,3*s); ctx.fillRect(x+20*s,y+8*s,3*s,3*s);
    ctx.fillStyle='#1b130c'; ctx.fillRect(x+14*s,y+9*s,2*s,2*s); ctx.fillRect(x+21*s,y+9*s,2*s,2*s);
    ctx.fillStyle='#ffdf60'; ctx.fillRect(x+17*s,y+12*s,6*s,3*s);
  }
  function drawDragon(ctx,x,y,big){
    const s=big?1.35:1; shadow(ctx,x,y+26*s,34*s,9*s);
    ctx.fillStyle='#8e2233'; ctx.fillRect(x+5*s,y+10*s,24*s,18*s);
    ctx.fillStyle='#d13d39'; ctx.fillRect(x+8*s,y+5*s,19*s,15*s);
    ctx.fillStyle='#ffb347'; ctx.fillRect(x+3*s,y+6*s,6*s,10*s); ctx.fillRect(x+26*s,y+6*s,6*s,10*s);
    ctx.fillStyle='#fff'; ctx.fillRect(x+12*s,y+10*s,4*s,4*s); ctx.fillRect(x+22*s,y+10*s,4*s,4*s);
    ctx.fillStyle='#111'; ctx.fillRect(x+13*s,y+11*s,2*s,2*s); ctx.fillRect(x+23*s,y+11*s,2*s,2*s);
    ctx.fillStyle='#ffd45a'; ctx.fillRect(x+11*s,y+1*s,5*s,6*s); ctx.fillRect(x+23*s,y+1*s,5*s,6*s);
  }
  function drawMedusa(ctx,x,y,big){
    const s=big?1.35:1; shadow(ctx,x,y+25*s,30*s,8*s);
    ctx.fillStyle='#2d8f6f'; ctx.fillRect(x+7*s,y+10*s,21*s,17*s);
    ctx.fillStyle='#d7b077'; ctx.fillRect(x+9*s,y+6*s,17*s,13*s);
    ctx.fillStyle='#1b6b4f';
    for(let i=0;i<6;i++){ ctx.fillRect(x+(5+i*4)*s,y+(1+(i%2)*2)*s,4*s,7*s); }
    ctx.fillStyle='#fff'; ctx.fillRect(x+12*s,y+10*s,3*s,3*s); ctx.fillRect(x+21*s,y+10*s,3*s,3*s);
    ctx.fillStyle='#111'; ctx.fillRect(x+13*s,y+11*s,2*s,2*s); ctx.fillRect(x+22*s,y+11*s,2*s,2*s);
  }
  function drawKraken(ctx,x,y,big){
    const s=big?1.35:1; shadow(ctx,x,y+25*s,32*s,8*s);
    ctx.fillStyle='#6233a6'; ctx.fillRect(x+7*s,y+7*s,22*s,17*s);
    ctx.fillStyle='#8d59df'; ctx.fillRect(x+10*s,y+4*s,16*s,14*s);
    ctx.fillStyle='#4b267f';
    for(let i=0;i<4;i++) ctx.fillRect(x+(3+i*8)*s,y+20*s,5*s,10*s);
    ctx.fillStyle='#fff'; ctx.fillRect(x+13*s,y+9*s,4*s,4*s); ctx.fillRect(x+21*s,y+9*s,4*s,4*s);
    ctx.fillStyle='#111'; ctx.fillRect(x+14*s,y+10*s,2*s,2*s); ctx.fillRect(x+22*s,y+10*s,2*s,2*s);
  }
  function drawYeti(ctx,x,y,big){
    const s=big?1.35:1; shadow(ctx,x,y+25*s,31*s,8*s);
    ctx.fillStyle='#dbeef7'; ctx.fillRect(x+6*s,y+9*s,24*s,18*s);
    ctx.fillStyle='#ffffff'; ctx.fillRect(x+9*s,y+4*s,18*s,14*s);
    ctx.fillStyle='#9cc6d8'; ctx.fillRect(x+4*s,y+15*s,6*s,8*s); ctx.fillRect(x+28*s,y+15*s,6*s,8*s);
    ctx.fillStyle='#1a2a33'; ctx.fillRect(x+13*s,y+9*s,3*s,3*s); ctx.fillRect(x+22*s,y+9*s,3*s,3*s);
    ctx.fillStyle='#7fa9bd'; ctx.fillRect(x+15*s,y+15*s,10*s,3*s);
  }
  function drawChimera(ctx,x,y,big){
    const s=big?1.35:1; shadow(ctx,x,y+27*s,38*s,10*s);
    ctx.fillStyle='#73316f'; ctx.fillRect(x+4*s,y+11*s,30*s,19*s);
    ctx.fillStyle='#d19033'; ctx.fillRect(x+8*s,y+6*s,14*s,13*s);
    ctx.fillStyle='#8e2233'; ctx.fillRect(x+20*s,y+6*s,14*s,13*s);
    ctx.fillStyle='#fff'; ctx.fillRect(x+11*s,y+10*s,3*s,3*s); ctx.fillRect(x+25*s,y+10*s,3*s,3*s);
    ctx.fillStyle='#111'; ctx.fillRect(x+12*s,y+11*s,2*s,2*s); ctx.fillRect(x+26*s,y+11*s,2*s,2*s);
    ctx.fillStyle='#ffd45a'; ctx.fillRect(x+7*s,y+2*s,5*s,5*s); ctx.fillRect(x+30*s,y+2*s,5*s,5*s);
  }
  function drawSealDoor(ctx,x,y,e){
    shadow(ctx,x,y+26,30,7);
    ctx.fillStyle='#4b2d1f'; ctx.fillRect(x+2,y+2,28,30);
    ctx.fillStyle='#d9b35a'; ctx.fillRect(x+5,y+5,22,5); ctx.fillRect(x+5,y+14,22,5); ctx.fillRect(x+5,y+23,22,5);
    ctx.fillStyle=['#40d983','#3c99d9','#b388ff','#ff7043','#d9f3fb'][Math.max(0,(e.order||1)-1)]||'#ffd866';
    ctx.fillRect(x+12,y+11,8,10);
    ctx.fillStyle='#22140d'; ctx.fillRect(x+14,y+13,4,6);
  }
  function drawEntrance(ctx,x,y,e){shadow(ctx,x-2,y+29,36,8);const locked=state.seals.length<e.required;ctx.fillStyle=locked?'#56605d':'#38514c';ctx.fillRect(x,y+7,32,27);ctx.fillStyle=locked?'#2b3132':'#16272a';ctx.fillRect(x+7,y+13,18,21);ctx.fillStyle='#caa65b';ctx.fillRect(x+2,y+4,28,6);ctx.fillRect(x+6,y,20,5);if(locked){ctx.fillStyle='#f2d66d';ctx.fillRect(x+12,y+20,8,8);ctx.fillStyle='#45341c';ctx.fillRect(x+14,y+23,4,5);}}
  function drawExit(ctx,x,y){shadow(ctx,x,y+24,28,7);ctx.fillStyle='#86d98a';ctx.fillRect(x+6,y+8,18,18);ctx.fillStyle='#f7e99e';ctx.fillRect(x+10,y+13,10,8);ctx.fillStyle='#5b3927';ctx.fillRect(x+5,y+24,20,4);}
  function drawSign(ctx,x,y){shadow(ctx,x,y+20,24,6);ctx.fillStyle='#6e4527';ctx.fillRect(x+11,y+14,5,13);ctx.fillStyle='#d9954a';ctx.fillRect(x+3,y+4,22,12);ctx.fillStyle='#6e4527';ctx.fillRect(x+6,y+7,16,2);ctx.fillRect(x+6,y+11,12,2);}
  function drawBoulder(ctx,x,y,e){shadow(ctx,x,y+22,26,7);ctx.fillStyle='#71828a';ctx.beginPath();ctx.ellipse(x+13,y+14,12,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#9ba9af';ctx.beginPath();ctx.ellipse(x+10,y+10,7,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.26)';ctx.fillRect(x+8,y+7,8,2);ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(x+5,y+18,14,3);}
  function drawPlane(ctx,x,y,e){
    shadow(ctx,x,y+18,36,8);
    ctx.fillStyle='#cfd9e6'; ctx.fillRect(x+8,y+8,20,10);
    ctx.fillStyle='#9fb4c8'; ctx.fillRect(x+16,y+4,7,18);
    ctx.fillStyle='#e8f2fb'; ctx.fillRect(x+4,y+11,8,4); ctx.fillRect(x+24,y+11,8,4);
    ctx.fillStyle='#6fa7d8'; ctx.fillRect(x+25,y+9,7,3);
    ctx.fillStyle='#f0b24d'; ctx.fillRect(x+7,y+9,3,8);
  }
  function drawBoat(ctx,x,y,e){
    if(e?.vehicle==='plane') return drawPlane(ctx,x,y,e);
    shadow(ctx,x-2,y+22,38,9);
    ctx.fillStyle='#6e3f21'; ctx.fillRect(x+1,y+12,34,12);
    ctx.fillStyle='#a96a35'; ctx.fillRect(x+5,y+8,26,9);
    ctx.fillStyle='#f1d37a'; ctx.fillRect(x+16,y,3,16);
    ctx.fillStyle='#f7efe0'; ctx.beginPath(); ctx.moveTo(x+19,y+1); ctx.lineTo(x+31,y+10); ctx.lineTo(x+19,y+13); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(x+7,y+10,19,2);
  }
  function drawPlayer(ctx,x,y,dir,step){
    const bob=Math.sin(step)*2;
    if(state.onBoat){
      drawBoat(ctx,x-5,y+7,state.currentBoat||{});
      ctx.fillStyle='#e28b39'; ctx.fillRect(x+8,y+7+bob,14,12);
      ctx.fillStyle='#fff0c2'; ctx.fillRect(x+11,y+13+bob,8,6);
      ctx.fillStyle='#17110c'; ctx.fillRect(x+11,y+10+bob,2,2); ctx.fillRect(x+18,y+10+bob,2,2);
      return;
    }
    shadow(ctx,x-2,y+25,28,7);ctx.fillStyle='#b55d22';ctx.fillRect(x+5,y+9+bob,18,18);ctx.fillStyle='#e28b39';ctx.fillRect(x+6,y+5+bob,16,13);ctx.fillStyle='#e28b39';ctx.fillRect(x+5,y+1+bob,5,8);ctx.fillRect(x+18,y+1+bob,5,8);ctx.fillStyle='#fff0c2';ctx.fillRect(x+10,y+13+bob,8,8);ctx.fillStyle='#17110c';ctx.fillRect(x+9,y+10+bob,2,2);ctx.fillRect(x+17,y+10+bob,2,2);ctx.fillStyle='#f2c65d';ctx.fillRect(x+4,y+20+bob,20,8);ctx.fillStyle='#5f3e2a';if(dir==='left')ctx.fillRect(x-4,y+13+bob,8,6);else if(dir==='right')ctx.fillRect(x+20,y+13+bob,8,6);else ctx.fillRect(x+19,y+15+bob,8,6);
  }
  function drawParticles(ctx,scene){for(let i=scene.particles.length-1;i>=0;i--){const p=scene.particles[i];p.life-=1/60;p.x+=p.vx/60;p.y+=p.vy/60;p.vy+=60/60;ctx.fillStyle=p.color;ctx.globalAlpha=clamp(p.life,0,1);ctx.fillRect(p.x-state.camera.x,p.y-state.camera.y,4,4);ctx.globalAlpha=1;if(p.life<=0)scene.particles.splice(i,1);}}
  function drawMiniMap(ctx,w,h){const mapW=270,mapH=190,x=w-mapW-18,y=170;ctx.fillStyle='rgba(5,15,19,.88)';roundedRect(ctx,x,y,mapW,mapH,14,true);ctx.strokeStyle='rgba(244,193,93,.75)';ctx.lineWidth=2;roundedRect(ctx,x,y,mapW,mapH,14,false);const sc=state.world,sx=mapW/(sc.w*TILE),sy=mapH/(sc.h*TILE);for(let yy=0;yy<sc.h;yy+=2)for(let xx=0;xx<sc.w;xx+=2){const t=tileAt(sc,xx,yy);ctx.fillStyle=t===TYPES.water?'#3c99d9':t===TYPES.path?'#d6a65a':t===TYPES.forest?'#103f34':t===TYPES.cliff?'#637069':t===TYPES.snow?'#d9f3fb':t===TYPES.ash?'#6a5148':'#43c66f';ctx.fillRect(x+xx*TILE*sx,y+yy*TILE*sy,Math.ceil(TILE*2*sx),Math.ceil(TILE*2*sy));}state.world.entities.filter(e=>e.type==='entrance').forEach(e=>{ctx.fillStyle=state.seals.includes(e.topic)?'#f4c15d':'#fff';ctx.fillRect(x+e.x*sx-2,y+e.y*sy-2,5,5);});ctx.fillStyle='#ff6b6b';ctx.fillRect(x+state.player.x*sx-3,y+state.player.y*sy-3,6,6);ctx.fillStyle='#fff4c4';ctx.font='12px system-ui';ctx.fillText('Mapa · puntos blancos = regiones',x+10,y+mapH-10);}
  function roundedRect(ctx,x,y,w,h,r,fill){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();fill?ctx.fill():ctx.stroke();}
  function wrapCenteredText(ctx,text,cx,y,maxWidth,lineHeight){
    const words=String(text).split(/\s+/); let line=''; const lines=[];
    for(const word of words){ const test=line?`${line} ${word}`:word; if(ctx.measureText(test).width>maxWidth && line){ lines.push(line); line=word; } else { line=test; } }
    if(line) lines.push(line);
    lines.forEach((ln,i)=>ctx.fillText(ln,cx,y+i*lineHeight));
  }
  function drawTitleGlow(ctx,w,h){ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(0,0,w,h);}

  function showVictory(){
    state.mode='victory';
    els.victoryPanel.classList.remove('hidden');
    els.worldRestartBox.classList.add('hidden');
  }

  function finalizeVictoryReport(){
    els.victoryPanel.classList.add('hidden');
    showReport(true);
  }

  function showReport(finished){
    state.mode='report';
    const r=buildReportData(finished);
    els.reportBody.innerHTML=renderReportHTML(r);
    els.reportPanel.classList.remove('hidden');
    els.continueBtn.classList.toggle('hidden', !!finished);
    SCORM?.saveScore?.(state.grade,state.answered);
    if(finished)SCORM?.finish?.();
    // Al terminar o finalizar, se descarga automáticamente un informe HTML.
    if(!state.reportDownloaded || finished){
      downloadReportHTML(r);
      state.reportDownloaded=true;
    }
    if(window.MathJax?.typesetPromise)MathJax.typesetPromise([els.reportBody]).catch(()=>{});
  }
  function buildReportData(finished){
    const byTopic={}; Object.keys(TOPIC_META).forEach(t=>byTopic[t]={topic:t,name:TOPIC_META[t].topicLabel,total:0,correct:0});
    state.answered.forEach(a=>{byTopic[a.topic] ||= {topic:a.topic,name:a.topic,total:0,correct:0};byTopic[a.topic].total++;if(a.correct)byTopic[a.topic].correct++;});
    const total=state.answered.length, correct=state.correct;
    const weak=Object.values(byTopic).filter(t=>t.total>0&&t.correct/t.total<.7).map(t=>t.name);
    return {student:state.studentName,date:new Date().toLocaleString('es-CO'),finished,
      invalidated:state.quizInvalidated,
      securitySignals:state.securitySignals,grade:+state.grade.toFixed(2),total,correct,wrong:state.wrong,accuracy:total?correct/total:0,time:formatTime(state.elapsed),seals:[...state.seals],inventory:[...state.inventory],byTopic:Object.values(byTopic),weak,answers:state.answered,completed:state.gameCompleted};
  }
  function renderReportHTML(r){
    const rows=r.byTopic.filter(t=>t.total>0).map(t=>`<tr><td>${t.name}</td><td>${t.correct}/${t.total}</td><td>${t.total?Math.round(100*t.correct/t.total):0}%</td></tr>`).join('')||'<tr><td colspan="3">Aún no hay respuestas.</td></tr>';
    const rec=r.weak.length?`Reforzar: ${r.weak.join(', ')}. Identifica primero la forma de la ecuación, el método y luego ejecuta el procedimiento.`:'Buen desempeño en los temas respondidos. Continúa con ejercicios integradores.';
    return `<div class="report-grid">
      <div class="report-metric"><span>Estudiante</span><strong style="font-size:1.05rem">${escapeHTML(r.student)}</strong></div>
      <div class="report-metric"><span>Nota</span><strong>${r.grade.toFixed(1)}</strong></div>
      <div class="report-metric"><span>Precisión</span><strong>${Math.round(r.accuracy*100)}%</strong></div>
      <div class="report-metric"><span>Tiempo</span><strong>${r.time}</strong></div>
    </div>
    <p><b>Fecha:</b> ${r.date}. <b>Aciertos:</b> ${r.correct}. <b>Errores:</b> ${r.wrong}. <b>Sellos:</b> ${r.seals.filter(s=>s!=='boss').length}/5.</p>${r.invalidated?'<p><b>Estado:</b> quiz anulado por superar las señales de bloqueo. Nota: <b>0.0</b>.</p>':(r.finished?'<p><b>Estado:</b> juego finalizado. Si derrotó el monstruo final, la nota definitiva quedó fijada en <b>5.0</b>.</p>':'')}<p><b>Señales de bloqueo:</b> ${r.securitySignals}/5.</p>
    <table class="report-table"><thead><tr><th>Tema</th><th>Aciertos</th><th>Rendimiento</th></tr></thead><tbody>${rows}</tbody></table>
    <p><b>Objetos obtenidos:</b> ${r.inventory.length?r.inventory.join(', '):'ninguno todavía'}.</p>
    <p><b>Plan de mejora:</b> ${rec}</p>
    <details><summary>Historial de respuestas</summary><table class="report-table"><thead><tr><th>#</th><th>Tema</th><th>Tipo</th><th>Resultado</th><th>Nota</th></tr></thead><tbody>${r.answers.map((a,i)=>`<tr><td>${i+1}</td><td>${TOPIC_META[a.topic]?.topicLabel||a.topic}</td><td>${questionTypeLabel(a.type)}</td><td>${a.correct?'Correcta':'Incorrecta'}</td><td>${a.grade.toFixed(1)}</td></tr>`).join('')}</tbody></table></details>`;
  }

  function reportStatusLabel(r){
    if(r.completed) return 'Monstruo final derrotado';
    if(r.finished) return 'Partida finalizada por el estudiante';
    return 'Partida registrada';
  }

  function reportMath(tex){
    return `\\(${tex}\\)`;
  }

  function reportEscapeMathText(s){
    return escapeHTML(String(s)).replace(/\n/g,'<br>');
  }

  function reportDisplayAnswer(a){
    const value=String(a.answer);
    if(value==='true') return reportMath('\\text{Verdadero}');
    if(value==='false') return reportMath('\\text{Falso}');
    if(/^[VF](,[VF])*$/.test(value)) return reportMath(value.split(',').join(',\\;'));
    if(/^-?\d+(\.\d+)?$/.test(value)) return reportMath(value);
    return reportEscapeMathText(value);
  }

  function buildFullReportHTML(r){
    const rows=r.byTopic.filter(t=>t.total>0).map(t=>`<tr><td>${escapeHTML(t.name)}</td><td>${t.correct}/${t.total}</td><td>${t.total?Math.round(100*t.correct/t.total):0}%</td></tr>`).join('')||'<tr><td colspan="3">Aún no hay respuestas.</td></tr>';
    const rec=r.weak.length?`<ul>${r.weak.map(w=>`<li><strong>${escapeHTML(w)}:</strong> repasa el método, la interpretación y las condiciones de aplicación.</li>`).join('')}<li>Antes de responder, clasifica la ecuación y escribe el procedimiento esperado.</li></ul>`:'<p>Buen desempeño general. Continúa con ejercicios integradores y problemas donde se combinen varios métodos.</p>';
    const detail=r.answers.map((a,i)=>`<article class="question-card"><div class="qtop"><span>${i+1}</span><div><h3>${escapeHTML(TOPIC_META[a.topic]?.topicLabel||a.topic)} · ${escapeHTML(questionTypeLabel(a.type))}</h3><p>${escapeHTML(a.trap?'Pregunta de liberación':'Reto del juego')}</p></div><b class="${a.correct?'ok':'bad'}">${a.correct?'Correcta':'Incorrecta'} · ${a.delta>0?'+':''}${a.delta}</b></div><div class="latex">${reportEscapeMathText(a.prompt)}</div><div class="twocol"><div><h4>Respuesta del estudiante</h4><div class="latex">${reportDisplayAnswer(a)}</div></div><div><h4>Nota después de responder</h4><div class="latex">${reportMath(Number(a.grade).toFixed(1))}</div></div></div></article>`).join('')||'<p>No se registraron preguntas.</p>';
    const mjConfig = `<script>window.MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']],processEscapes:true},svg:{fontCache:'global'},startup:{typeset:true}};<\/script><script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"><\/script>`;
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Informe Aventura Diferencial</title>${mjConfig}<style>*{box-sizing:border-box}body{margin:0;background:#f5f8ff;color:#10243d;font-family:Georgia,'Times New Roman',serif;line-height:1.58}.page{width:min(1040px,calc(100% - 24px));margin:22px auto 56px}.hero,.section,.question-card{background:white;border:1px solid #dfe8f5;border-radius:22px;padding:24px;margin:20px 0;box-shadow:0 10px 28px rgba(8,35,74,.07)}.hero{background:linear-gradient(145deg,#06184c,#112f7a);color:white;text-align:center}.hero h1{font-size:clamp(2rem,5vw,4rem);margin:8px 0;color:#ffd866}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.metric{background:#082d76;color:white;border-radius:16px;padding:16px}.metric b{display:block;font-size:1.7rem;color:#ffd866}h2{color:#062f8a;border-bottom:3px solid #dfe8f5;padding-bottom:8px}.latex,.solution{background:#f7fbff;border:1px solid #dfe8f5;border-radius:14px;padding:13px;margin:10px 0;overflow-x:auto}table{width:100%;border-collapse:collapse;background:white;border-radius:14px;overflow:hidden}td,th{border-bottom:1px solid #e7edf5;padding:10px;text-align:left}th{background:#062f8a;color:white}.qtop{display:flex;gap:12px;align-items:center}.qtop span{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#062f8a;color:white;font-weight:900}.qtop h3{margin:0;color:#062f8a}.qtop p{margin:2px 0 0;color:#5c6f8c}.qtop b{margin-left:auto;padding:8px 13px;border-radius:999px}.ok{background:#e4f8ee;color:#0b754f}.bad{background:#ffe7ed;color:#a80f32}.twocol,.formula-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.formula-block{background:#fbfdff;border:1px solid #dfe8f5;border-radius:16px;padding:14px}.formula-block h3{margin:0 0 10px;color:#0a357d}.formula-block ul{margin:0;padding-left:18px}.formula-block li{margin:8px 0}.footer{text-align:right;color:#667}mjx-container{font-size:118% !important}.latex mjx-container,.solution mjx-container{font-size:122% !important}.formula-block .latex{font-size:1.05rem}@media(max-width:760px){.metrics,.twocol,.formula-grid{grid-template-columns:1fr}.hero,.section,.question-card{padding:16px}}</style></head><body><main class="page"><section class="hero"><div style="font-size:58px">🐉📐</div><h1>Informe Aventura Diferencial</h1><p>Primer corte · Ecuaciones Diferenciales</p><p>${escapeHTML(r.date)}</p></section><section class="section"><h2>Resumen</h2><div class="metrics"><div class="metric"><b>${r.grade.toFixed(2)}</b><span>Nota final / 5.0</span></div><div class="metric"><b>${r.correct}/${r.total}</b><span>Aciertos</span></div><div class="metric"><b>${r.seals.filter(s=>s!=='boss').length}/5</b><span>Sellos</span></div><div class="metric"><b>${r.time}</b><span>Tiempo</span></div></div><p><strong>Estado:</strong> ${reportStatusLabel(r)} · <strong>Errores:</strong> ${r.wrong} · <strong>Precisión:</strong> ${Math.round(r.accuracy*100)}%</p></section><section class="section"><h2>Desempeño por tema</h2><table><tr><th>Tema</th><th>Aciertos</th><th>Porcentaje</th></tr>${rows}</table></section><section class="section"><h2>Plan de mejora</h2>${rec}</section><section class="section"><h2>Formulario teórico en LaTeX</h2><p>Resumen de fórmulas importantes de los temas evaluados en la partida.</p><div class="formula-grid"><div class="formula-block"><h3>PVI</h3><ul><li class="latex">${reportMath('y^{\\prime}=f(x,y),\\quad y(x_0)=y_0')}</li><li>La unicidad local se garantiza con hipótesis suficientes sobre ${reportMath('f')} y ${reportMath('f_y')}.</li></ul></div><div class="formula-block"><h3>Separables</h3><ul><li class="latex">${reportMath('y^{\\prime}=g(x)h(y)\\quad\\Longrightarrow\\quad \\frac{dy}{h(y)}=g(x)\\,dx')}</li></ul></div><div class="formula-block"><h3>Exactas</h3><ul><li class="latex">${reportMath('M(x,y)\\,dx+N(x,y)\\,dy=0,\\quad M_y=N_x')}</li><li>Se busca ${reportMath('F')} con ${reportMath('F_x=M')} y ${reportMath('F_y=N')}.</li></ul></div><div class="formula-block"><h3>Lineales</h3><ul><li class="latex">${reportMath('y^{\\prime}+p(x)y=q(x),\\quad \\mu(x)=e^{\\int p(x)\\,dx}')}</li></ul></div><div class="formula-block"><h3>Aplicaciones</h3><ul><li>Mezclas: ${reportMath('A^{\\prime}(t)=\\text{entrada}-\\text{salida}')}.</li><li>Trayectorias ortogonales: ${reportMath('m_{\\perp}=-\\frac{1}{m}')}.</li></ul></div></div></section><section class="section"><h2>Detalle de preguntas</h2>${detail}</section><p class="footer">Generado automáticamente por Aventura Diferencial 2D.</p></main></body></html>`;
  }

  function downloadReportHTML(data=null){
    const r=data||buildReportData(false);
    const html=buildFullReportHTML(r);
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`informe-aventura-diferencial-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadReportJson(){const data=buildReportData(false);const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`informe_aventura_diferencial_${Date.now()}.json`;a.click();URL.revokeObjectURL(url);}

  function stripHTML(s){return String(s).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();}
  function escapeHTML(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function formatTime(sec){const m=Math.floor(sec/60),s=sec%60;return `${m}:${String(s).padStart(2,'0')}`;}

  function loop(ts){if(!loop.last)loop.last=ts;const dt=Math.min(.05,(ts-loop.last)/1000);loop.last=ts;update(dt);draw();requestAnimationFrame(loop);}
  init();
})();
