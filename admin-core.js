// admin-core.js — Auth, router, save/load, helpers, icon picker

// ═══ ICON PICKER ENGINE ═══
const POPULAR_LUCIDE = [
  'user','heart','star','search','home','settings','mail','phone','map-pin','globe',
  'brain','eye','zap','flame','sun','moon','cloud','compass','target','award',
  'bookmark','camera','film','music','mic','headphones','monitor','smartphone','tablet','laptop',
  'code','terminal','database','server','wifi','bluetooth','cpu','hard-drive','usb','battery',
  'lock','unlock','shield','key','fingerprint','scan','alert-triangle','info','help-circle','check-circle',
  'x-circle','plus-circle','minus-circle','arrow-right','arrow-left','arrow-up','arrow-down','chevron-right','chevron-down','external-link',
  'link','paperclip','scissors','copy','clipboard','file','file-text','folder','image','video',
  'calendar','clock','timer','alarm-clock','hourglass','refresh-cw','rotate-cw','download','upload','share',
  'send','inbox','archive','trash-2','edit-3','pen-tool','type','bold','italic','list',
  'grid','layout','layers','box','package','gift','shopping-cart','shopping-bag','credit-card','dollar-sign',
  'trending-up','trending-down','bar-chart','pie-chart','activity','pulse','thermometer','droplet','wind','umbrella',
  'map','navigation','flag','anchor','truck','car','bike','plane','rocket','ship',
  'users','user-plus','user-check','message-circle','message-square','at-sign','hash','tag','bell','megaphone',
  'thumbs-up','thumbs-down','smile','frown','meh','laugh','angry','coffee','utensils','wine',
  'dumbbell','trophy','medal','crown','gem','sparkles','wand-2','palette','brush','pen',
  'book','book-open','graduation-cap','lightbulb','lamp','flashlight','binoculars','microscope','telescope','atom',
  'hexagon','circle','square','triangle','pentagon','octagon','diamond','crop','maximize','minimize',
  'move','hand','mouse-pointer','crosshair','aperture','focus','scan-line','qr-code','barcode','fingerprint'
];
const POPULAR_EMOJI = [
  '👤','👥','🧠','💡','🔍','🔎','🌍','🌎','🌏','🗺️',
  '⚡','🔥','✨','💫','🌟','⭐','❤️','💙','💚','💜',
  '🎯','🏆','🎬','📸','🎵','🎤','🖥️','📱','💻','🖊️',
  '📧','✉️','📞','☎️','📍','📌','🏠','🏢','🏗️','🏛️',
  '🚀','✈️','🚗','🚲','🛳️','🚊','🎓','📚','📖','📝',
  '🔬','🔭','⚗️','🧬','⚙️','🔧','🔨','🛠️','🔐','🔑',
  '🛡️','💰','💳','📊','📈','📉','🗓️','⏰','⏱️','⌛',
  '🎨','🖌️','✂️','📎','🔗','📂','🗃️','📁','🗂️','📋',
  '🤝','🤸','🏋️','🎭','🎪','🌀','🧩','♟️','🎲','🎮',
  '🍕','☕','🍷','🌱','🌿','🌳','🦋','🐾','🌈','☀️',
  '🌙','⛅','🌊','💧','❄️','🔔','📣','💬','💭','🗨️'
];

let _ipTarget = null;
let _ipSelected = '';
let _ipTab = 'lucide';
let _ipLucideNames = null;

function getAllLucideNames(){
  if(_ipLucideNames) return _ipLucideNames;
  if(window.lucide && window.lucide.icons){
    _ipLucideNames = Object.keys(window.lucide.icons).sort();
    return _ipLucideNames;
  }
  return POPULAR_LUCIDE;
}

function renderIconHTML(val){
  if(!val) return '';
  if(val.startsWith('lucide:')){
    const name = val.slice(7);
    const icons = window.lucide && window.lucide.icons;
    if(icons && icons[name]){
      const [tag,attrs,children] = icons[name];
      const svgAttrs = Object.entries(attrs).map(([k,v])=>`${k}="${v}"`).join(' ');
      const inner = children.map(([ct,ca])=>{
        const a = Object.entries(ca).map(([k,v])=>`${k}="${v}"`).join(' ');
        return `<${ct} ${a}/>`;
      }).join('');
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${svgAttrs}>${inner}</svg>`;
    }
    return `<i data-lucide="${name}"></i>`;
  }
  return val;
}

function openIconPicker(inputId){
  _ipTarget = document.getElementById(inputId);
  if(!_ipTarget) return;
  _ipSelected = _ipTarget.value || '';
  _ipTab = _ipSelected.startsWith('lucide:') ? 'lucide' : (_ipSelected ? 'emoji' : 'lucide');
  document.querySelectorAll('.ip-tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===_ipTab));
  document.getElementById('ip-search').value='';
  renderIPGrid();
  updateIPPreview();
  document.getElementById('icon-picker-overlay').style.display='flex';
}
function closeIconPicker(){
  document.getElementById('icon-picker-overlay').style.display='none';
  _ipTarget=null;
}
function switchIPTab(tab){
  _ipTab=tab;
  document.querySelectorAll('.ip-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  document.getElementById('ip-search').value='';
  renderIPGrid();
}
function filterIcons(){ renderIPGrid(); }

function renderIPGrid(){
  const grid = document.getElementById('ip-grid');
  const q = (document.getElementById('ip-search')?.value||'').toLowerCase().trim();

  if(_ipTab==='lucide'){
    let names = getAllLucideNames();
    if(q) names = names.filter(n=>n.includes(q));
    else names = names.slice(0, 200);
    grid.innerHTML = names.map(n=>{
      const val = 'lucide:'+n;
      const sel = val===_ipSelected ? ' selected':'';
      const html = renderIconHTML(val);
      return `<div class="ip-item${sel}" data-val="${val}" onclick="pickIcon(this)" title="${n}">${html}</div>`;
    }).join('');
  } else {
    let emojis = POPULAR_EMOJI;
    if(q) emojis = emojis.filter(e=>e.includes(q));
    grid.innerHTML = emojis.map(e=>{
      const sel = e===_ipSelected ? ' selected':'';
      return `<div class="ip-item${sel}" data-val="${e}" onclick="pickIcon(this)" title="${e}"><span class="ip-emoji">${e}</span></div>`;
    }).join('');
  }
}

function pickIcon(el){
  document.querySelectorAll('.ip-item.selected').forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
  _ipSelected = el.dataset.val;
  updateIPPreview();
}
function updateIPPreview(){
  const el = document.getElementById('ip-current');
  if(!_ipSelected){ el.innerHTML='Ничего не выбрано'; return; }
  el.innerHTML = `<span class="ip-preview">${renderIconHTML(_ipSelected)}</span> <span>${_ipSelected}</span>`;
}
function confirmIconPicker(){
  if(_ipTarget && _ipSelected){
    _ipTarget.value = _ipSelected;
    _ipTarget.dispatchEvent(new Event('input',{bubbles:true}));
    const wrap = _ipTarget.closest('.icon-input-wrap');
    if(wrap){
      const prev = wrap.querySelector('.btn-preview');
      if(prev) prev.innerHTML = renderIconHTML(_ipSelected);
    }
  }
  closeIconPicker();
}

// ═══ AUTH & CORE ═══

const auth = firebase.auth();

// ── CURSOR ───────────────────────────────────
const cdot = document.getElementById('cdot');
const cring = document.getElementById('cring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',(e)=>{ mx=e.clientX; my=e.clientY; cdot.style.left=mx+'px'; cdot.style.top=my+'px'; });
(function anim(){ rx+=(mx-rx)*.11; ry+=(my-ry)*.11; cring.style.left=rx+'px'; cring.style.top=ry+'px'; requestAnimationFrame(anim); })();

// ── AUTH (Firebase) ──────────────────────────
async function doLogin() {
  const email = document.getElementById('inp-email').value.trim();
  const pass  = document.getElementById('inp-pass').value;
  const err   = document.getElementById('login-err');
  err.style.display='none';
  if (!email||!pass){ err.textContent='Введите данные'; err.style.display='block'; err.style.animation='none'; err.offsetHeight; err.style.animation=''; return; }
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch(e) {
    const msgs = {
      'auth/user-not-found': 'Пользователь не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/invalid-email': 'Некорректный email',
      'auth/invalid-credential': 'Неверный идентификатор или код',
      'auth/too-many-requests': 'Слишком много попыток — подождите'
    };
    err.textContent = msgs[e.code] || 'Ошибка входа: ' + e.message;
    err.style.display='block';
    err.style.animation='none'; err.offsetHeight; err.style.animation='';
  }
}

let _granted = false;
async function grantAccess(){
  if(_granted) return;
  _granted = true;
  document.getElementById('login-screen').style.display='none';
  document.getElementById('admin-panel').style.display='flex';
  updateAdminLangBtns();
  await showTab('index');
}

async function doLogout(){
  _granted = false;
  await auth.signOut();
  document.getElementById('admin-panel').style.display='none';
  document.getElementById('login-screen').style.display='flex';
}

// ── DATA ─────────────────────────────────────
function deepMerge(base,over){
  if(!over) return base;
  const r=Object.assign({},base);
  for(const k of Object.keys(over)){
    if(Array.isArray(over[k])) r[k]=over[k];
    else if(over[k]&&typeof over[k]==='object') r[k]=deepMerge(base[k]||{},over[k]);
    else r[k]=over[k];
  }
  return r;
}

let adminLang='ru';

function langKey(lang){ return lang==='ru'?'ac_content':'ac_content_'+lang; }

async function getDataForLang(lang){
  let base=JSON.parse(JSON.stringify(window.AC_DEFAULTS));
  if(lang!=='ru'&&window.AC_TRANSLATIONS&&window.AC_TRANSLATIONS[lang]){
    base=deepMerge(base,window.AC_TRANSLATIONS[lang]);
  }
  let ruData = await fsGet('content','ac_content');
  if(ruData){ base=deepMerge(base,ruData); }
  if(lang!=='ru'){
    let langData = await fsGet('content', langKey(lang));
    if(langData){ base=deepMerge(base,langData); }
  }
  if(lang!=='ru'&&window.AC_TRANSLATIONS&&window.AC_TRANSLATIONS[lang]){
    const transNav=window.AC_TRANSLATIONS[lang].global&&window.AC_TRANSLATIONS[lang].global.nav;
    if(transNav&&base.global){
      let adminNav={};
      try{
        const ld = await fsGet('content', langKey(lang)) || {};
        adminNav=(ld.global&&ld.global.nav)||{};
      }catch(e){}
      Object.keys(transNav).forEach(k=>{ if(!adminNav[k]) base.global.nav[k]=transNav[k]; });
    }
  }
  return base;
}

let D={};

// ── LANG SWITCH (admin editor) ────────────────
async function switchAdminLang(lang){
  if(lang===adminLang) return;
  collectCurrent();
  await persistCurrentLang();
  adminLang=lang;
  D=await getDataForLang(lang);
  updateAdminLangBtns();
  const savedCT=CT; CT='';
  showTab(savedCT);
  showToast('// Язык редактора: '+lang.toUpperCase());
}

async function persistCurrentLang(){
  await fsSet('content', langKey(adminLang), JSON.parse(JSON.stringify(D)));
}

function updateAdminLangBtns(){
  document.querySelectorAll('.alb').forEach(b=>b.classList.toggle('active',b.dataset.alang===adminLang));
  const hints={ru:'Русский',uk:'Українська',no:'Norsk'};
  const el=document.getElementById('save-lang');
  if(el) el.textContent=hints[adminLang]||adminLang.toUpperCase();
}

let isDirty=false, autoSec=30;
function markDirty(){
  isDirty=true;
  const btn=document.querySelector('.xbtn.save');
  if(btn && !btn.classList.contains('pulse')) btn.classList.add('pulse');
}

function validateBeforeSave(){
  const w=[];
  if(D.contact&&D.contact.items){
    D.contact.items.forEach((it,i)=>{
      if(!it.href||it.href==='#'||it.href.includes('yourusername')||it.href.includes('your@email')){
        w.push('Контакт «'+(it.label||'#'+(i+1))+'»: заполни настоящую ссылку');
      }
    });
  }
  if(D.videos&&D.videos.items){
    D.videos.items.filter(v=>v.published!==false).forEach((v,i)=>{
      if(!v.title) w.push('Видео #'+(i+1)+': пустой заголовок');
      if(v.type!=='file'&&!v.embedId) w.push('Видео «'+(v.title||'#'+(i+1))+'»: не заполнен ID видео');
    });
  }
  [{k:'about',n:'О себе'},{k:'journey',n:'Мой путь'},{k:'interests',n:'Интересы'},{k:'contact',n:'Контакт'},{k:'videos',n:'Видео'}].forEach(({k,n})=>{
    if(D[k]&&!D[k].pageTitle) w.push('Страница «'+n+'»: пустой заголовок');
  });
  return w;
}

function showValidationWarnings(warns){
  const old=document.getElementById('warn-panel');
  if(old)old.remove();
  if(!warns.length)return;
  const p=document.createElement('div');
  p.id='warn-panel'; p.className='warn-panel';
  p.innerHTML='<div class="warn-panel-hd"><span class="warn-panel-title">⚠ '+warns.length+(warns.length===1?' предупреждение':warns.length<5?' предупреждения':' предупреждений')+' — данные сохранены, но проверь</span>'
    +'<button class="warn-panel-x" onclick="document.getElementById(\'warn-panel\').remove()" title="Закрыть">✕</button></div>'
    +'<ul>'+warns.map(w=>'<li>'+w+'</li>').join('')+'</ul>';
  document.body.appendChild(p);
}

// ── PREVIEW ──────────────────────────────────
function previewSite(){
  collectCurrent();
  const pageMap={
    index:'index.html', about:'about.html', journey:'journey.html',
    interests:'interests.html', videos:'videos.html', contact:'contact.html'
  };
  const file = pageMap[CT] || 'index.html';
  localStorage.setItem('ac_preview', JSON.stringify(D));
  window.open(file+'?preview=1', '_blank');
  showToast('// Предпросмотр → '+file);
}

// ── BACKUPS ──────────────────────────────────
async function pushBackup(){
  try{
    const doc = await fsGet('content','ac_backups');
    const backups = (doc && doc.items) || [];
    const user = auth.currentUser;
    backups.unshift({
      ts:Date.now(),
      lang:adminLang,
      user: user ? user.email : 'unknown',
      data:JSON.stringify(D)
    });
    if(backups.length>10) backups.length=10;
    await fsSet('content','ac_backups',{items:backups});
  }catch(e){ console.warn('Backup save failed',e); }
}

async function renderBackups(){
  try{
    const doc = await fsGet('content','ac_backups');
    const backups = (doc && doc.items) || [];
    if(!backups.length) return '<p style="color:var(--muted);font-size:.85rem;">Сохранений пока нет — появятся после первого нажатия «Сохранить»</p>';
    const fmtDate=ts=>{
      const d=new Date(ts);
      return d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'})+' '+d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
    };
    const hints={ru:'RU',uk:'UK',no:'NO'};
    return backups.map((b,i)=>`<div class="hist-item">
      <div class="hist-meta">
        <span class="hist-date">${fmtDate(b.ts)}</span>
        <div class="hist-info">
          <span class="hist-badge lang">${hints[b.lang]||b.lang}</span>
          ${b.user?'<span class="hist-badge user">'+esc(b.user)+'</span>':''}
        </div>
      </div>
      <button class="xbtn cyan" style="padding:6px 14px;font-size:.7rem;" onclick="restoreBackup(${i})">↩ Откатить</button>
    </div>`).join('');
  }catch(e){ return '<p style="color:var(--danger);font-size:.85rem;">Ошибка чтения истории</p>'; }
}

async function restoreBackup(i){
  try{
    const doc = await fsGet('content','ac_backups');
    const backups = (doc && doc.items) || [];
    const b=backups[i];
    if(!b) return;
    const ts=new Date(b.ts).toLocaleString('ru-RU');
    if(!confirm('Восстановить версию от '+ts+'?\n\nТекущие несохранённые изменения будут потеряны.')) return;
    D=JSON.parse(b.data);
    adminLang=b.lang;
    updateAdminLangBtns();
    await persistCurrentLang();
    showToast('// Версия от '+ts+' восстановлена');
    showTab(CT);
  }catch(e){ alert('Ошибка восстановления: '+e.message); }
}

// ── UNIFIED SAVE PIPELINE ──────────────────────
let _saving = false;

async function saveAll(){
  if(_saving) return;
  _saving = true;
  collectCurrent();
  const st=document.getElementById('save-st');
  try {
    await pushBackup();
    await persistCurrentLang();

    // Collect and save subsidiary data that editors wrote to _pendingSaves
    if(window._pendingSaves){
      for(const {collection, docId, data} of window._pendingSaves){
        await fsSet(collection, docId, data);
      }
      window._pendingSaves = [];
    }

    isDirty=false; autoSec=30;
    document.getElementById('save-auto').textContent='';
    const pulseBtn=document.querySelector('.xbtn.save'); if(pulseBtn) pulseBtn.classList.remove('pulse');
    const hints={ru:'RU',uk:'UK',no:'NO'};
    st.textContent='✓ Сохранено ('+hints[adminLang]+')'; st.className='save-status ok';
    setTimeout(()=>{ st.textContent='Изменения не сохранены'; st.className='save-status'; },3000);
    const warns=validateBeforeSave();
    if(warns.length){
      showValidationWarnings(warns);
      showToast('// Сохранено · ⚠ '+warns.length+' предупреждений');
    } else {
      const old=document.getElementById('warn-panel');
      if(old)old.remove();
      showToast('// Сохранено · '+adminLang.toUpperCase());
    }
  } catch(e) {
    st.textContent='✕ Ошибка сохранения'; st.className='save-status';
    showToast('// Ошибка: '+e.message);
  } finally {
    _saving = false;
  }
}

// Pending saves queue for subsidiary collections (boards, i18n, etc.)
window._pendingSaves = [];

function queueSave(collection, docId, data){
  if(!window._pendingSaves) window._pendingSaves = [];
  // Replace if same collection+docId already queued
  const idx = window._pendingSaves.findIndex(s=>s.collection===collection && s.docId===docId);
  if(idx>=0) window._pendingSaves[idx] = {collection, docId, data};
  else window._pendingSaves.push({collection, docId, data});
}

function showToast(msg, type){
  if (!type) {
    if (msg.includes('Ошибка') || msg.includes('error')) type = 'error';
    else if (msg.includes('Сохранено') || msg.includes('восстановлен') || msg.includes('Обновлён') || msg.includes('скачан')) type = 'success';
    else type = 'info';
  }
  const icons = { success:'✓', error:'✕', info:'›' };
  const container = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = 'toast-item ' + type;
  el.innerHTML = '<span class="toast-icon">' + (icons[type]||'›') + '</span><span class="toast-text">' + msg.replace(/^\/\/\s*/,'') + '</span><div class="toast-progress"></div>';
  container.appendChild(el);
  setTimeout(()=>{ el.classList.add('out'); }, 2600);
  setTimeout(()=>{ el.remove(); }, 3000);
}

// ── HELPERS ──────────────────────────────────
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escTA(s){ return String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function v(id){ const el=document.getElementById(id); return el?el.value:''; }
function inp(id,val){ return `<input class="fi" id="${id}" value="${esc(val)}"/>`; }
function iconInp(id,val){ return `<div class="icon-input-wrap"><input class="fi" id="${id}" value="${esc(val)}"/><button type="button" class="icon-pick-btn" onclick="openIconPicker('${id}')"><span class="btn-preview">${renderIconHTML(val)||'🎯'}</span> Выбрать</button></div>`; }
function dateinp(id,val){ return `<input class="fi" type="date" id="${id}" value="${esc(val)}"/>`; }
function ta(id,val,rows=3){ return `<textarea class="fi" id="${id}" rows="${rows}">${escTA(val)}</textarea>`; }
function fg(label,content,hint){ return `<div class="fg"><label class="flbl">${label}</label>${content}${hint?'<p class="fhint">'+hint+'</p>':''}</div>`; }

// ── WYSIWYG Rich Text Area ──────────────────
function rta(id, val, placeholder) {
  return `<div class="rta-wrap" id="${id}-wrap">
    <div class="rta-toolbar">
      <button class="rta-btn" onclick="rtaCmd('${id}','bold')" title="Жирный"><b>B</b></button>
      <button class="rta-btn" onclick="rtaCmd('${id}','italic')" title="Курсив"><i>I</i></button>
      <button class="rta-btn" onclick="rtaCmd('${id}','underline')" title="Подчёркнутый"><u>U</u></button>
      <div class="rta-sep"></div>
      <button class="rta-btn" onclick="rtaCmd('${id}','formatBlock','H3')" title="Заголовок">H3</button>
      <button class="rta-btn" onclick="rtaCmd('${id}','formatBlock','P')" title="Параграф">P</button>
      <div class="rta-sep"></div>
      <button class="rta-btn" onclick="rtaLink('${id}')" title="Вставить ссылку">🔗</button>
      <button class="rta-btn" onclick="rtaCmd('${id}','unlink')" title="Убрать ссылку">⊘</button>
      <div class="rta-sep"></div>
      <button class="rta-btn" onclick="rtaCmd('${id}','insertUnorderedList')" title="Список">•  List</button>
      <button class="rta-btn" onclick="rtaInsertImage('${id}')" title="Вставить картинку">🖼️</button>
    </div>
    <div class="rta-body" id="${id}" contenteditable="true"
         data-placeholder="${esc(placeholder||'Начните писать...')}"
         oninput="markDirty()">${val||''}</div>
  </div>`;
}

function rtaCmd(id, cmd, val) {
  document.getElementById(id).focus();
  document.execCommand(cmd, false, val||null);
}
function rtaLink(id) {
  const url = prompt('URL ссылки:', 'https://');
  if (url) { document.getElementById(id).focus(); document.execCommand('createLink', false, url); }
}
function rtaInsertImage(id) {
  const url = prompt('URL картинки (или откройте Медиа и скопируйте ссылку):', 'https://');
  if (url) { document.getElementById(id).focus(); document.execCommand('insertImage', false, url); }
}
function rv(id) { const el=document.getElementById(id); return el?el.innerHTML.trim():''; }

function liW(idx,title,fields){
  const n=String(idx+1).padStart(2,'0');
  return `<div class="li-item" data-idx="${idx}">
    <div class="li-hdr" onclick="toggleLI(this)">
      <span class="drag-handle" title="Перетащить">⠿</span>
      <span class="li-idx">${n}</span>
      <span class="li-title">${esc(title)}</span>
      <div class="li-acts">
        <button class="lib" onclick="event.stopPropagation();dupLI(this)" title="Дублировать">⧉</button>
        <button class="lib del" onclick="event.stopPropagation();delLI(this)" title="Удалить">✕</button>
      </div>
    </div>
    <div class="li-body">${fields}</div>
  </div>`;
}

function toggleLI(h){ const body=h.nextElementSibling; body.classList.toggle('open'); h.classList.toggle('open', body.classList.contains('open')); }
function delLI(btn){ if(confirm('Удалить?'))btn.closest('.li-item').remove(); }

function dupLI(btn){
  const li=btn.closest('.li-item'), led=btn.closest('.leditor');
  if(!li||!led) return;
  collectCurrent();
  const items=[...led.querySelectorAll(':scope>.li-item')], pos=items.indexOf(li);
  if(pos<0) return;
  const cloneArr = (arr,i) => arr.splice(i+1,0,JSON.parse(JSON.stringify(arr[i])));
  const map={
    'ls-nc': ()=>{ cloneArr(D.index.navCards,pos);   showTab('index');     },
    'ls-hs': ()=>{ cloneArr(D.index.heroStats,pos);  showTab('index');     },
    'ls-p':  ()=>{ D.about.paragraphs.splice(pos+1,0,D.about.paragraphs[pos]); showTab('about'); },
    'ls-st': ()=>{ cloneArr(D.about.stats,pos);      showTab('about');     },
    'ls-v':  ()=>{ cloneArr(D.about.values,pos);     showTab('about');     },
    'ls-jn': ()=>{ cloneArr(D.journey.items,pos);    showTab('journey');   },
    'ls-in': ()=>{ cloneArr(D.interests.cards,pos);  showTab('interests'); },
    'ls-ci': ()=>{ cloneArr(D.contact.items,pos);    showTab('contact');   },
    'ls-cp': ()=>{ D.contact.textParagraphs.splice(pos+1,0,D.contact.textParagraphs[pos]); showTab('contact'); },
    'ls-tp': ()=>{ D.contact.topics.splice(pos+1,0,D.contact.topics[pos]); showTab('contact'); },
    'ls-vid':()=>{ if(!D.videos)D.videos={items:[]}; cloneArr(D.videos.items,pos); showTab('videos'); },
  };
  if(map[led.id]){ CT=''; map[led.id](); showToast('// Элемент продублирован'); }
}

function toggleAllItems(action){
  const method = action==='open' ? 'add' : 'remove';
  document.querySelectorAll('#adm-main .li-body').forEach(b=>{ b.classList[method]('open'); });
  document.querySelectorAll('#adm-main .li-hdr').forEach(h=>{ h.classList[method]('open'); });
}

function scrollToLast(leditorId){
  setTimeout(()=>{
    const items=document.querySelectorAll('#'+leditorId+' .li-item');
    if(items.length){ items[items.length-1].scrollIntoView({behavior:'smooth',block:'center'}); }
  },80);
}

// ── TABS ─────────────────────────────────────
let CT='index';
async function showTab(tab){
  collectCurrent(); CT=tab;
  document.querySelectorAll('.sb-item').forEach(el=>el.classList.toggle('active',el.dataset.tab===tab));
  const m=document.getElementById('adm-main');
  m.style.animation='none'; m.offsetHeight; m.style.animation='';
  switch(tab){
    case 'index':      m.innerHTML=edIndex();      break;
    case 'about':      m.innerHTML=edAbout();      break;
    case 'journey':    m.innerHTML=edJourney();    break;
    case 'interests':  m.innerHTML=edInterests();  break;
    case 'contact':    m.innerHTML=edContact();    break;
    case 'global':     m.innerHTML=await edGlobal(); break;
    case 'videos':     m.innerHTML=edVideos();     break;
    case 'boards':     m.innerHTML=await edBoards(); break;
    case 'seo':        m.innerHTML=edSEO(); initSeoCounters(); break;
    case 'appearance': m.innerHTML=edAppearance(); break;
    case 'security':   m.innerHTML=edSecurity();   break;
    case 'media':      m.innerHTML=edMedia(); initMediaDrop(); break;
    case 'i18n':       m.innerHTML=await edTranslations(); break;
  }
  initSortables();
}

function initSortables(){
  document.querySelectorAll('.leditor').forEach(el=>{
    if(el._sortable) el._sortable.destroy();
    el._sortable = new Sortable(el, {
      handle: '.drag-handle',
      animation: 200,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      easing: 'cubic-bezier(0.22,1,0.36,1)',
      onEnd: function(){
        markDirty();
        el.querySelectorAll('.li-item').forEach((li,i)=>{
          li.dataset.idx = i;
          const idx = li.querySelector('.li-idx');
          if(idx) idx.textContent = String(i+1).padStart(2,'0');
        });
      }
    });
  });
}

function collectCurrent(){
  switch(CT){
    case 'index':      colIndex();      break;
    case 'about':      colAbout();      break;
    case 'journey':    colJourney();    break;
    case 'interests':  colInterests();  break;
    case 'contact':    colContact();    break;
    case 'global':     colGlobal();     break;
    case 'videos':     colVideos();     break;
    case 'boards':     colBoards();     break;
    case 'seo':        colSEO();        break;
    case 'appearance': colAppearance(); break;
    case 'i18n':       colTranslations(); break;
    case 'security':   break;
    case 'media':      break;
  }
}

// ── KEYBOARD / AUTOSAVE / UNLOAD ─────────────
document.addEventListener('keydown', e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){ e.preventDefault(); saveAll(); }
});

document.addEventListener('input',  markDirty);
document.addEventListener('change', markDirty);

window.addEventListener('beforeunload', e=>{
  if(isDirty){ e.preventDefault(); e.returnValue=''; }
});

setInterval(()=>{
  if(!auth.currentUser||!isDirty) return;
  autoSec--;
  const el=document.getElementById('save-auto');
  if(autoSec<=0){
    saveAll();
    if(el) el.textContent='';
  } else {
    if(el) el.textContent=`Автосохранение через ${autoSec} с`;
  }
},1000);

// ── INIT (Firebase Auth state) ───────────────
auth.onAuthStateChanged(async function(user){
  if(user){
    D = await getDataForLang('ru');
    grantAccess();
  } else {
    document.getElementById('admin-panel').style.display='none';
    document.getElementById('login-screen').style.display='flex';
  }
});
