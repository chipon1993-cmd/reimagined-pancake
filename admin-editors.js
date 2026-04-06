// admin-editors.js — All editor/collector functions for each admin tab

// ── INDEX ────────────────────────────────────
function edIndex(){
  if(!D.index) return '<div class="skeleton skeleton-title"></div><div class="skeleton skeleton-block"></div><div class="skeleton skeleton-input"></div><div class="skeleton skeleton-input"></div><div class="skeleton skeleton-block" style="width:80%"></div>';
  const d=D.index;
  return `<div class="ed-header"><div class="ed-tag">Главная страница</div><h2>Hero & Menu</h2><p>Главный экран, кнопки, карточки навигации и цитата</p></div>
  ${fg('Бейдж',inp('i-badge',d.badge),'Текст в плашке над главным заголовком, напр. «Украина → Мир → Норвегия»')}
  ${fg('Tagline',inp('i-tl',d.tagline),'Главная фраза — первое, что видит посетитель на сайте')}
  ${fg('Подпись под tagline',ta('i-sub',d.sub,2),'Дополнительный текст под основной фразой')}
  <div class="frow">${fg('Кнопка 1 — текст',inp('i-b1t',d.btnPrimary?.text),'Основная кнопка (яркая)')}${fg('Кнопка 1 — ссылка',inp('i-b1h',d.btnPrimary?.href),'Куда ведёт, напр. journey.html')}</div>
  <div class="frow">${fg('Кнопка 2 — текст',inp('i-b2t',d.btnGhost?.text),'Второстепенная кнопка (контур)')}${fg('Кнопка 2 — ссылка',inp('i-b2h',d.btnGhost?.href),'Куда ведёт, напр. about.html')}</div>
  ${fg('Цитата',ta('i-qt',d.quote,3),'Блок с цитатой внизу главной страницы')}
  ${fg('Автор цитаты',inp('i-qa',d.quoteAuthor),'Подпись под цитатой')}
  <div class="fsec">Счётчики (Hero-статистика)</div>
  <div class="leditor" id="ls-hs">
    ${(d.heroStats||[]).map((s,i)=>liW(i,s.num+' '+s.lbl,
      fg('Число / текст',inp(`hs-n-${i}`,s.num))+
      fg('Подпись',inp(`hs-l-${i}`,s.lbl))
    )).join('')}
  </div>
  <button class="add-btn" onclick="addHS()">+ Добавить счётчик</button>
  <div class="fsec">Карточки-меню</div>
  <div class="leditor" id="ls-nc">
    ${(d.navCards||[]).map((c,i)=>liW(i,c.title,
      fg('Иконка',iconInp(`nc-ic-${i}`,c.icon))+
      fg('Заголовок',inp(`nc-ti-${i}`,c.title))+
      fg('Описание',ta(`nc-de-${i}`,c.desc,2))+
      fg('Ссылка',inp(`nc-hr-${i}`,c.href))
    )).join('')}
  </div>
  <button class="add-btn" onclick="addNC()">+ Добавить карточку</button>`;
}
function colIndex(){
  if(!document.getElementById('i-badge'))return;
  D.index.badge=v('i-badge'); D.index.tagline=v('i-tl'); D.index.sub=v('i-sub');
  D.index.btnPrimary={text:v('i-b1t'),href:v('i-b1h')};
  D.index.btnGhost={text:v('i-b2t'),href:v('i-b2h')};
  D.index.quote=v('i-qt'); D.index.quoteAuthor=v('i-qa');
  D.index.heroStats=[...document.querySelectorAll('#ls-hs .li-item')].map(li=>{const i=li.dataset.idx;return{num:document.getElementById(`hs-n-${i}`)?.value||'',lbl:document.getElementById(`hs-l-${i}`)?.value||''};});
  D.index.navCards=[...document.querySelectorAll('#ls-nc .li-item')].map(li=>{const i=li.dataset.idx;return{icon:document.getElementById(`nc-ic-${i}`)?.value||'',title:document.getElementById(`nc-ti-${i}`)?.value||'',desc:document.getElementById(`nc-de-${i}`)?.value||'',href:document.getElementById(`nc-hr-${i}`)?.value||''};});
}
function addNC(){ colIndex(); D.index.navCards.push({icon:'🔗',title:'Новая карточка',desc:'Описание',href:'#'}); CT=''; showTab('index'); scrollToLast('ls-nc'); }
function addHS(){ colIndex(); if(!D.index.heroStats) D.index.heroStats=[]; D.index.heroStats.push({num:'0',lbl:'подпись'}); CT=''; showTab('index'); scrollToLast('ls-hs'); }

// ── ABOUT ────────────────────────────────────
function edAbout(){
  if(!D.about) return '<div class="skeleton skeleton-title"></div><div class="skeleton skeleton-block"></div><div class="skeleton skeleton-input"></div><div class="skeleton skeleton-input"></div>';
  const d=D.about;
  return `<div class="ed-header"><div class="ed-tag">Страница</div><h2>О себе</h2><p>Текст, статистика, ценности</p></div>
  ${fg('Метка раздела',inp('ab-sl',d.sectionLabel||''),'Маленький текст-подпись над заголовком, напр. «Обо мне»')}
  ${fg('Заголовок страницы',inp('ab-t',d.pageTitle),'Крупный жирный текст в начале страницы')}
  ${fg('Подзаголовок',ta('ab-d',d.pageDesc,2),'Описание под заголовком — 1-2 предложения')}
  <div class="fsec">Параграфы</div>
  <div class="leditor" id="ls-p">
    ${(d.paragraphs||[]).map((p,i)=>liW(i,p.replace(/<[^>]+>/g,'').substring(0,50)+'…',fg('Текст',rta(`p-${i}`,p,'Текст параграфа...')))).join('')}
  </div>
  <button class="add-btn" onclick="addPara()">+ Добавить параграф</button>
  <div class="fsec">Статистика</div>
  <div class="leditor" id="ls-st">
    ${(d.stats||[]).map((s,i)=>liW(i,s.num+' — '+s.label,fg('Число',inp(`st-n-${i}`,s.num))+fg('Подпись',inp(`st-l-${i}`,s.label)))).join('')}
  </div>
  <button class="add-btn" onclick="addStat()">+ Добавить карточку</button>
  <div class="fsec">Ценности</div>
  <div class="leditor" id="ls-v">
    ${(d.values||[]).map((vl,i)=>liW(i,vl.title,fg('Иконка',iconInp(`v-ic-${i}`,vl.icon))+fg('Заголовок',inp(`v-ti-${i}`,vl.title))+fg('Описание',ta(`v-de-${i}`,vl.desc,2)))).join('')}
  </div>
  <button class="add-btn" onclick="addVal()">+ Добавить ценность</button>`;
}
function colAbout(){
  if(!document.getElementById('ab-t'))return;
  D.about.sectionLabel=v('ab-sl'); D.about.pageTitle=v('ab-t'); D.about.pageDesc=v('ab-d');
  D.about.paragraphs=[...document.querySelectorAll('#ls-p .li-item')].map(li=>rv(`p-${li.dataset.idx}`));
  D.about.stats=[...document.querySelectorAll('#ls-st .li-item')].map(li=>{const i=li.dataset.idx;return{num:document.getElementById(`st-n-${i}`)?.value||'',label:document.getElementById(`st-l-${i}`)?.value||''};});
  D.about.values=[...document.querySelectorAll('#ls-v .li-item')].map(li=>{const i=li.dataset.idx;return{icon:document.getElementById(`v-ic-${i}`)?.value||'',title:document.getElementById(`v-ti-${i}`)?.value||'',desc:document.getElementById(`v-de-${i}`)?.value||''};});
}
function addPara(){ colAbout(); D.about.paragraphs.push('Новый параграф'); CT=''; showTab('about'); scrollToLast('ls-p'); }
function addStat(){ colAbout(); D.about.stats.push({num:'0',label:'подпись'}); CT=''; showTab('about'); scrollToLast('ls-st'); }
function addVal(){ colAbout(); D.about.values.push({icon:'⭐',title:'Новая ценность',desc:'Описание'}); CT=''; showTab('about'); scrollToLast('ls-v'); }

// ── JOURNEY ──────────────────────────────────
function edJourney(){
  if(!D.journey) return '<div class="skeleton skeleton-title"></div><div class="skeleton skeleton-block"></div><div class="skeleton skeleton-input"></div><div class="skeleton skeleton-input"></div>';
  const d=D.journey;
  return `<div class="ed-header"><div class="ed-tag">Страница</div><h2>Мой путь</h2><p>Таймлайн и блок "Сейчас"</p></div>
  ${fg('Метка раздела',inp('jn-sl',d.sectionLabel||''),'Маленький текст-подпись, напр. «Хронология»')}
  ${fg('Заголовок',inp('jn-t',d.pageTitle),'Крупный текст на странице')}
  ${fg('Подзаголовок',ta('jn-d',d.pageDesc,2),'Описание под заголовком')}
  <div class="fsec">Этапы пути</div>
  <div class="leditor" id="ls-jn">
    ${(d.items||[]).map((it,i)=>liW(i,it.title,
      fg('Период',inp(`jn-y-${i}`,it.year))+fg('Заголовок',inp(`jn-ti-${i}`,it.title))+
      fg('Место',inp(`jn-lo-${i}`,it.location))+fg('Описание',rta(`jn-de-${i}`,it.desc,'Описание этапа...'))+
      fg('Теги (через запятую)',inp(`jn-tg-${i}`,(it.tags||[]).join(', ')))
    )).join('')}
  </div>
  <button class="add-btn" onclick="addJn()">+ Добавить этап</button>
  <div class="fsec">Блок "Где я сейчас"</div>
  ${fg('Заголовок',inp('jn-nt',d.nowTitle))}
  ${fg('Текст',ta('jn-nx',d.nowText,3))}`;
}
function colJourney(){
  if(!document.getElementById('jn-t'))return;
  D.journey.sectionLabel=v('jn-sl'); D.journey.pageTitle=v('jn-t'); D.journey.pageDesc=v('jn-d');
  D.journey.nowTitle=v('jn-nt'); D.journey.nowText=v('jn-nx');
  D.journey.items=[...document.querySelectorAll('#ls-jn .li-item')].map(li=>{const i=li.dataset.idx;return{year:document.getElementById(`jn-y-${i}`)?.value||'',title:document.getElementById(`jn-ti-${i}`)?.value||'',location:document.getElementById(`jn-lo-${i}`)?.value||'',desc:rv(`jn-de-${i}`),tags:(document.getElementById(`jn-tg-${i}`)?.value||'').split(',').map(s=>s.trim()).filter(Boolean)};});
}
function addJn(){ colJourney(); D.journey.items.push({year:'Новый',title:'Заголовок',location:'📍 Место',desc:'Описание',tags:[]}); CT=''; showTab('journey'); scrollToLast('ls-jn'); }

// ── INTERESTS ────────────────────────────────
function edInterests(){
  if(!D.interests) return '<div class="skeleton skeleton-title"></div><div class="skeleton skeleton-block"></div><div class="skeleton skeleton-input"></div><div class="skeleton skeleton-input"></div>';
  const d=D.interests;
  return `<div class="ed-header"><div class="ed-tag">Страница</div><h2>Интересы</h2><p>Карточки интересов</p></div>
  ${fg('Метка раздела',inp('in-sl',d.sectionLabel||''),'Маленький текст-подпись, напр. «Интересы»')}
  ${fg('Заголовок',inp('in-t',d.pageTitle),'Крупный текст на странице')}
  ${fg('Подзаголовок',ta('in-d',d.pageDesc,2),'Описание под заголовком')}
  <div class="fsec">Карточки</div>
  <div class="leditor" id="ls-in">
    ${(d.cards||[]).map((c,i)=>liW(i,c.title,
      fg('Иконка',iconInp(`in-ic-${i}`,c.icon))+fg('Заголовок',inp(`in-ti-${i}`,c.title))+
      fg('Описание',ta(`in-de-${i}`,c.desc,3))+fg('Вопросы (с новой строки)',ta(`in-q-${i}`,(c.questions||[]).join('\n'),3))
    )).join('')}
  </div>
  <button class="add-btn" onclick="addIn()">+ Добавить карточку</button>`;
}
function colInterests(){
  if(!document.getElementById('in-t'))return;
  D.interests.sectionLabel=v('in-sl'); D.interests.pageTitle=v('in-t'); D.interests.pageDesc=v('in-d');
  const iconToId={'🧠':'psychology','🌀':'philosophy','⚡':'tech','🌍':'sociology','🤸':'acrobatics','🚗':'cars'};
  const oldCards=D.interests.cards||[];
  D.interests.cards=[...document.querySelectorAll('#ls-in .li-item')].map((li,idx)=>{const i=li.dataset.idx;const icon=document.getElementById(`in-ic-${i}`)?.value||'';const oldCard=oldCards[idx]||{};return{id:oldCard.id||iconToId[icon]||'interest_'+idx,icon,title:document.getElementById(`in-ti-${i}`)?.value||'',desc:document.getElementById(`in-de-${i}`)?.value||'',questions:(document.getElementById(`in-q-${i}`)?.value||'').split('\n').map(s=>s.trim()).filter(Boolean)};});
}
function addIn(){ colInterests(); D.interests.cards.push({icon:'🌟',title:'Новый интерес',desc:'Описание',questions:[]}); CT=''; showTab('interests'); scrollToLast('ls-in'); }

// ── CONTACT ──────────────────────────────────
function edContact(){
  if(!D.contact) return '<div class="skeleton skeleton-title"></div><div class="skeleton skeleton-block"></div><div class="skeleton skeleton-input"></div><div class="skeleton skeleton-input"></div>';
  const d=D.contact;
  return `<div class="ed-header"><div class="ed-tag">Страница</div><h2>Контакт</h2><p>Ссылки, текст, темы</p></div>
  ${fg('Метка раздела',inp('cn-sl',d.sectionLabel||''),'Маленький текст-подпись, напр. «Контакт»')}
  ${fg('Заголовок',inp('cn-t',d.pageTitle),'Крупный текст на странице')}
  ${fg('Подзаголовок',ta('cn-d',d.pageDesc,2),'Описание под заголовком')}
  <div class="fsec">Контактные ссылки</div>
  <div class="leditor" id="ls-ci">
    ${(d.items||[]).map((it,i)=>liW(i,it.label+': '+it.value,
      fg('Иконка',iconInp(`ci-ic-${i}`,it.icon))+fg('Название',inp(`ci-lb-${i}`,it.label))+
      fg('Значение',inp(`ci-vl-${i}`,it.value))+fg('Ссылка href',inp(`ci-hr-${i}`,it.href))
    )).join('')}
  </div>
  <button class="add-btn" onclick="addCI()">+ Добавить контакт</button>
  <div class="fsec">Текст справа</div>
  ${fg('Заголовок',inp('cn-tt',d.textTitle))}
  <div class="leditor" id="ls-cp">
    ${(d.textParagraphs||[]).map((p,i)=>liW(i,p.replace(/<[^>]+>/g,'').substring(0,50)+'…',fg('Параграф',ta(`cp-${i}`,p,2)))).join('')}
  </div>
  <button class="add-btn" onclick="addCP()">+ Добавить параграф</button>
  <div class="fsec">Теги / Темы</div>
  <div class="leditor" id="ls-tp">
    ${(d.topics||[]).map((t,i)=>liW(i,t,fg('Тема',inp(`tp-${i}`,t)))).join('')}
  </div>
  <button class="add-btn" onclick="addTP()">+ Добавить тему</button>
  <div class="fsec">Форма обратной связи</div>
  ${fg('Web3Forms Access Key',inp('cn-w3key',(d.form&&d.form.web3formsKey)||''),'Получи ключ на <b>web3forms.com</b> (бесплатно) — оставь пустым, чтобы скрыть форму')}`;
}
function colContact(){
  if(!document.getElementById('cn-t'))return;
  D.contact.sectionLabel=v('cn-sl'); D.contact.pageTitle=v('cn-t'); D.contact.pageDesc=v('cn-d'); D.contact.textTitle=v('cn-tt');
  D.contact.items=[...document.querySelectorAll('#ls-ci .li-item')].map(li=>{const i=li.dataset.idx;return{icon:document.getElementById(`ci-ic-${i}`)?.value||'',label:document.getElementById(`ci-lb-${i}`)?.value||'',value:document.getElementById(`ci-vl-${i}`)?.value||'',href:document.getElementById(`ci-hr-${i}`)?.value||''};});
  D.contact.textParagraphs=[...document.querySelectorAll('#ls-cp .li-item')].map(li=>document.getElementById(`cp-${li.dataset.idx}`)?.value||'');
  D.contact.topics=[...document.querySelectorAll('#ls-tp .li-item')].map(li=>document.getElementById(`tp-${li.dataset.idx}`)?.value||'');
  if(!D.contact.form) D.contact.form={};
  D.contact.form.web3formsKey = v('cn-w3key');
}
function addCI(){ colContact(); D.contact.items.push({icon:'🔗',label:'Новый',value:'@username',href:'#'}); CT=''; showTab('contact'); scrollToLast('ls-ci'); }
function addCP(){ colContact(); D.contact.textParagraphs.push('Новый параграф'); CT=''; showTab('contact'); scrollToLast('ls-cp'); }
function addTP(){ colContact(); D.contact.topics.push('🌟 Новая тема'); CT=''; showTab('contact'); scrollToLast('ls-tp'); }

// ── GLOBAL ───────────────────────────────────
async function edGlobal(){
  if(!D.global) return '<div class="skeleton skeleton-title"></div><div class="skeleton skeleton-block"></div><div class="skeleton skeleton-input"></div><div class="skeleton skeleton-input"></div>';
  const g=D.global;
  const backupsHtml = await renderBackups();
  return `<div class="ed-header"><div class="ed-tag">Настройки</div><h2>Общие</h2><p>Навигация, футер и резервные копии</p></div>
  <div class="fsec">Навигация (меню сайта)</div>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:20px;line-height:1.6;">Текст пунктов верхнего меню и ссылок «назад». При переключении языка редактирования (RU / UK / NO) — вводи соответствующие переводы.</p>
  <div class="frow">${fg('О себе',inp('gl-nav-about',(g.nav&&g.nav.about)||''),'Пункт меню → about.html')}${fg('Мой путь',inp('gl-nav-journey',(g.nav&&g.nav.journey)||''),'Пункт меню → journey.html')}</div>
  <div class="frow">${fg('Интересы',inp('gl-nav-interests',(g.nav&&g.nav.interests)||''),'Пункт меню → interests.html')}${fg('Видео',inp('gl-nav-videos',(g.nav&&g.nav.videos)||''),'Пункт меню → videos.html')}</div>
  <div class="frow">${fg('Контакт',inp('gl-nav-contact',(g.nav&&g.nav.contact)||''),'Пункт меню → contact.html')}${fg('← На главную',inp('gl-nav-back',(g.nav&&g.nav.backHome)||''),'Ссылка «назад» на внутренних страницах')}</div>
  ${fg('← К интересам',inp('gl-nav-backi',(g.nav&&g.nav.backInterests)||''),'Ссылка «назад» на странице доски интереса')}
  <div class="fsec">Футер</div>
  ${fg('Футер — левый текст',inp('gl-l',g.footerLeft),'Текст внизу каждой страницы, слева (напр. копирайт)')}
  ${fg('Футер — правый текст',inp('gl-r',g.footerRight),'Текст внизу каждой страницы, справа')}
  <div class="fsec">Аналитика</div>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:16px;line-height:1.6;">
    <b style="color:var(--text)">Plausible Analytics</b> — приватная статистика без cookie-баннера, не замедляет сайт (скрипт 1 KB).<br>
    Зарегистрируй домен на <a href="https://plausible.io" target="_blank" style="color:var(--accent);">plausible.io</a> ($9/мес) или self-host через <a href="https://umami.is" target="_blank" style="color:var(--accent);">umami.is</a> (бесплатно) — и вставь домен ниже.
  </p>
  <div class="frow">
    ${fg('Plausible (домен)',inp('gl-plausible',(g.analytics&&g.analytics.plausible)||''),'Напр.: chepelovskyi.no — без https://')}
    ${fg('Google Analytics (Measurement ID)',inp('gl-ga',(g.analytics&&g.analytics.ga)||''),'Формат: G-XXXXXXXXXX — из analytics.google.com')}
  </div>
  <p style="color:var(--muted);font-size:.78rem;margin-top:-10px;margin-bottom:0;">
    Пустые поля = скрипты не подключены. Можно использовать оба одновременно.
  </p>
  <div class="fsec">Giscus (комментарии)</div>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:16px;line-height:1.6;">
    <b style="color:var(--text)">Giscus</b> — комментарии на досках интересов через GitHub Discussions. Бесплатно, без бэкенда.<br>
    Настрой на <a href="https://giscus.app" target="_blank" style="color:var(--accent);">giscus.app</a> → скопируй 4 значения ниже. Пустые поля = комментарии скрыты.
  </p>
  <div class="frow">${fg('Репо (user/repo)',inp('gl-gc-repo',(g.giscus&&g.giscus.repo)||''),'Напр.: andrii-ch/my-site')}${fg('Repo ID',inp('gl-gc-repoid',(g.giscus&&g.giscus.repoId)||''),'Напр.: R_kgDOxxxxxx')}</div>
  <div class="frow">${fg('Категория',inp('gl-gc-cat',(g.giscus&&g.giscus.category)||''),'Напр.: General')}${fg('Category ID',inp('gl-gc-catid',(g.giscus&&g.giscus.categoryId)||''),'Напр.: DIC_kwDOxxxxxx')}</div>
  <div class="fsec">Newsletter (рассылка)</div>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:16px;line-height:1.6;">
    <b style="color:var(--text)">Buttondown</b> — бесплатная email-рассылка (100 подписчиков). Форма подписки появится внизу главной страницы.<br>
    Зарегистрируйся на <a href="https://buttondown.com" target="_blank" style="color:var(--accent);">buttondown.com</a> → скопируй свой username.
  </p>
  ${fg('Buttondown Username',inp('gl-nl-bd',(g.newsletter&&g.newsletter.buttondownId)||''),'Твой username из buttondown.com — пустое поле = подписка скрыта')}
  <div class="fsec">Резервная копия</div>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:16px;">Скачайте все данные сайта в JSON или восстановите из файла.</p>
  <div class="backup-row">
    <button class="xbtn cyan" onclick="exportJSON()">⬇ Скачать backup.json</button>
    <label class="xbtn cyan imp-label">⬆ Загрузить из файла<input type="file" accept=".json" onchange="importJSON(event)" style="display:none"></label>
  </div>
  <div class="fsec">История изменений (последние 10)</div>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:16px;line-height:1.6;">При каждом «Сохранить» создаётся снимок с датой, языком и автором. Можно откатиться к любой версии.</p>
  <div id="bk-list">${backupsHtml}</div>
  <div class="fsec">Сброс данных</div>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:16px;">Вернуть весь контент к оригинальному состоянию. Необратимо.</p>
  <button class="xbtn red" style="padding:10px 20px;" onclick="resetAll()">⚠ Сбросить все данные</button>`;
}
function colGlobal(){
  if(!document.getElementById('gl-l'))return;
  D.global.footerLeft=v('gl-l'); D.global.footerRight=v('gl-r');
  if(!D.global.analytics)D.global.analytics={};
  D.global.analytics.plausible=v('gl-plausible');
  D.global.analytics.ga=v('gl-ga');
  if(!D.global.newsletter)D.global.newsletter={};
  D.global.newsletter.buttondownId=v('gl-nl-bd');
  if(!D.global.giscus)D.global.giscus={};
  D.global.giscus.repo=v('gl-gc-repo'); D.global.giscus.repoId=v('gl-gc-repoid');
  D.global.giscus.category=v('gl-gc-cat'); D.global.giscus.categoryId=v('gl-gc-catid');
  if(!D.global.nav)D.global.nav={};
  D.global.nav.about=v('gl-nav-about'); D.global.nav.journey=v('gl-nav-journey');
  D.global.nav.interests=v('gl-nav-interests'); D.global.nav.videos=v('gl-nav-videos');
  D.global.nav.contact=v('gl-nav-contact'); D.global.nav.backHome=v('gl-nav-back');
  D.global.nav.backInterests=v('gl-nav-backi');
}
async function resetAll(){
  const hints={ru:'русского',uk:'украинского',no:'норвежского'};
  if(!confirm('Сбросить изменения '+hints[adminLang]+' языка? Необратимо.'))return;
  try { await db.collection('content').doc(langKey(adminLang)).delete(); } catch(e){}
  D=await getDataForLang(adminLang);
  showToast('// Данные сброшены ('+adminLang.toUpperCase()+')');
  showTab(CT);
}
function exportJSON(){
  collectCurrent();
  const blob=new Blob([JSON.stringify(D,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='ac-backup-'+new Date().toISOString().slice(0,10)+'.json';
  a.click(); URL.revokeObjectURL(a.href);
  showToast('// Резервная копия скачана');
}
function importJSON(e){
  const file=e.target.files[0]; if(!file)return;
  const r=new FileReader();
  r.onload=async function(ev){
    try{
      const data=JSON.parse(ev.target.result);
      if(!data.global&&!data.index) throw new Error('Неверный формат файла');
      D=deepMerge(JSON.parse(JSON.stringify(window.AC_DEFAULTS)),data);
      await fsSet('content', langKey(adminLang), JSON.parse(JSON.stringify(D)));
      showToast('// Данные восстановлены из файла ('+adminLang.toUpperCase()+')');
      showTab(CT);
    }catch(err){ alert('Ошибка: '+err.message); }
  };
  r.readAsText(file);
}

// ── VIDEOS ───────────────────────────────────
function edVideos(){
  const d=D.videos||{};
  const items=d.items||[];
  return `<div class="ed-header"><div class="ed-tag">Страница</div><h2>Видео</h2>
    <p>YouTube, Vimeo или прямые ссылки на файлы (mp4, webm). Вставьте URL — тип определится автоматически.</p></div>
  ${fg('Метка раздела',inp('vid-sl',d.sectionLabel||'Контент'),'Маленький текст-подпись, напр. «Контент»')}
  ${fg('Заголовок страницы',inp('vid-t',d.pageTitle||''),'Крупный текст на странице видео')}
  ${fg('Подзаголовок',ta('vid-d',d.pageDesc||'',2),'Описание под заголовком')}
  <div class="fsec">Видео</div>
  <div class="leditor" id="ls-vid">
    ${items.map((v,i)=>liW(i,v.title||'Без названия',videoFields(v,i))).join('')}
  </div>
  <button class="add-btn" onclick="addVideo()">+ Добавить видео</button>`;
}

function videoFields(v,i){
  const typeOpts=[['youtube','YouTube'],['vimeo','Vimeo'],['file','Файл (mp4/webm)']].map(
    ([val,lbl])=>`<option value="${val}"${v.type===val?' selected':''}>${lbl}</option>`
  ).join('');
  return `
    <input type="hidden" id="vid-id-${i}" value="${esc(v.id||('v'+i))}">
    <div class="fg">
      <label class="flbl">URL видео (YouTube / Vimeo / прямая ссылка)</label>
      <div style="display:flex;gap:8px;">
        <input class="fi" id="vid-url-${i}" placeholder="https://youtube.com/watch?v=..." style="flex:1"
          value="" oninput="" onblur="autoFillVideo(${i})">
        <button class="xbtn cyan" onclick="autoFillVideo(${i})" style="white-space:nowrap;padding:8px 14px;flex-shrink:0">↺ Определить</button>
      </div>
    </div>
    <div class="frow">
      ${fg('Тип',`<select class="fi" id="vid-tp-${i}">${typeOpts}</select>`)}
      ${fg('Embed ID или URL файла',inp(`vid-ei-${i}`,v.embedId||''))}
    </div>
    ${fg('Заголовок',inp(`vid-ti-${i}`,v.title||''))}
    ${fg('Описание',ta(`vid-de-${i}`,v.desc||'',2))}
    <div class="frow">
      ${fg('Длительность (напр. 3:24)',inp(`vid-du-${i}`,v.duration||''),'Формат: 3:24')}
      ${fg('Дата публикации',dateinp(`vid-da-${i}`,v.date||''))}
    </div>
    ${fg('Теги (через запятую)',inp(`vid-tg-${i}`,(v.tags||[]).join(', ')))}
    ${fg('Thumbnail (URL картинки, не обязательно для YouTube)',inp(`vid-th-${i}`,v.thumb||''),'Для YouTube заполняется автоматически')}
    <div class="fg">
      <label class="chk-row" style="margin-bottom:10px;">
        <input type="checkbox" id="vid-pub-${i}"${v.published!==false?' checked':''}>
        <span><b>Опубликовано</b> <span style="color:var(--muted);font-size:.88em;font-weight:400;">— снятая галочка = черновик, видео не показывается на сайте</span></span>
      </label>
      <label class="chk-row">
        <input type="checkbox" id="vid-ft-${i}"${v.featured?' checked':''}>
        <span>Избранное — показывать большим баннером вверху страницы</span>
      </label>
    </div>`;
}

function autoFillVideo(i){
  const url=(document.getElementById(`vid-url-${i}`)?.value||'').trim();
  if(!url) return;
  let m=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  if(m){
    document.getElementById(`vid-tp-${i}`).value='youtube';
    document.getElementById(`vid-ei-${i}`).value=m[1];
    showToast('// YouTube ID: '+m[1]); return;
  }
  m=url.match(/vimeo\.com\/(\d+)/);
  if(m){
    document.getElementById(`vid-tp-${i}`).value='vimeo';
    document.getElementById(`vid-ei-${i}`).value=m[1];
    showToast('// Vimeo ID: '+m[1]); return;
  }
  if(url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)){
    document.getElementById(`vid-tp-${i}`).value='file';
    document.getElementById(`vid-ei-${i}`).value=url;
    showToast('// Файл определён'); return;
  }
  showToast('// Формат не распознан — заполните вручную');
}

function colVideos(){
  if(!document.getElementById('vid-t'))return;
  if(!D.videos)D.videos={};
  D.videos.pageTitle=v('vid-t');
  D.videos.pageDesc=v('vid-d');
  D.videos.sectionLabel=v('vid-sl');
  D.videos.items=[...document.querySelectorAll('#ls-vid .li-item')].map(li=>{
    const i=li.dataset.idx;
    return{
      id:document.getElementById(`vid-id-${i}`)?.value||('v'+Date.now()+i),
      type:document.getElementById(`vid-tp-${i}`)?.value||'youtube',
      embedId:document.getElementById(`vid-ei-${i}`)?.value||'',
      title:document.getElementById(`vid-ti-${i}`)?.value||'',
      desc:document.getElementById(`vid-de-${i}`)?.value||'',
      duration:document.getElementById(`vid-du-${i}`)?.value||'',
      date:document.getElementById(`vid-da-${i}`)?.value||'',
      tags:(document.getElementById(`vid-tg-${i}`)?.value||'').split(',').map(s=>s.trim()).filter(Boolean),
      thumb:document.getElementById(`vid-th-${i}`)?.value||'',
      published:!!document.getElementById(`vid-pub-${i}`)?.checked,
      featured:!!document.getElementById(`vid-ft-${i}`)?.checked
    };
  });
}

function addVideo(){
  colVideos();
  if(!D.videos)D.videos={items:[]};
  if(!D.videos.items)D.videos.items=[];
  D.videos.items.push({
    id:'v'+Date.now(), type:'youtube', embedId:'', title:'Новое видео', desc:'',
    duration:'', date:new Date().toISOString().slice(0,10), tags:[], thumb:'', published:true, featured:false
  });
  CT='';
  showTab('videos');
}

// ── BOARDS ───────────────────────────────────
const BOARD_LIST=[
  {id:'psychology', icon:'🧠', label:'Психология мышления'},
  {id:'philosophy', icon:'🌀', label:'Философия языка'},
  {id:'tech',       icon:'⚡', label:'Технологии и ИИ'},
  {id:'sociology',  icon:'🌍', label:'Люди в разных средах'},
  {id:'acrobatics', icon:'🤸', label:'Акробатика'},
  {id:'cars',       icon:'🚗', label:'Механика и системы'},
];
let currentBoard='psychology';

async function loadBoardPosts(id){
  try{
    const doc = await fsGet('boards', id);
    return (doc && doc.posts) || [];
  }catch(e){ return []; }
}

async function edBoards(){
  const meta = BOARD_LIST.find(b=>b.id===currentBoard)||BOARD_LIST[0];
  const posts = await loadBoardPosts(currentBoard);
  const tabs = BOARD_LIST.map(b=>
    `<button class="xbtn ${b.id===currentBoard?'cyan':''}" style="font-size:.78rem" onclick="switchBoard('${b.id}')">${b.icon} ${b.label}</button>`
  ).join('');
  const typeOpts = t => ['note','video','quote','link'].map(tp=>
    `<option value="${tp}"${tp===t?' selected':''}>${{note:'📝 Заметка',video:'🎬 Видео',quote:'💬 Цитата',link:'🔗 Ссылка'}[tp]}</option>`
  ).join('');
  const items = posts.map((p,i)=>liW(i, (p.title||p.content||'Запись').slice(0,48), `
    <div class="frow">
      ${fg('Тип',`<select class="fi" id="bp-type-${i}" onchange="boardTypeChange(${i})">${typeOpts(p.type||'note')}</select>`)}
      ${fg('Дата',dateinp(`bp-date-${i}`, p.date||new Date().toISOString().slice(0,10)))}
    </div>
    <div id="bp-fields-${i}">${boardPostFields(p,i)}</div>
    ${fg('Теги (через запятую)',inp(`bp-tags-${i}`,(p.tags||[]).join(', ')))}
    <div class="fg" style="margin-bottom:0;"><label class="chk-row"><input type="checkbox" id="bp-pub-${i}"${p.published!==false?' checked':''}><span><b>Опубликовано</b> <span style="color:var(--muted);font-size:.88em;font-weight:400;">— черновик не виден на сайте</span></span></label></div>
  `)).join('');

  return `<div class="ed-header">
    <div class="ed-tag">Доски интересов</div>
    <h2>${meta.icon} ${meta.label}</h2>
    <p>Записи хранятся отдельно для каждой доски. Переключайся между досками с помощью кнопок ниже.</p>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">${tabs}</div>
  <div class="fsec">Записи (${posts.length})</div>
  <div class="leditor" id="ls-boards">${items}</div>
  <button class="add-btn" onclick="addBoardPost()">+ Добавить запись</button>`;
}

function boardPostFields(p,i){
  const t = p.type||'note';
  const videoUrl = p.videoUrl||(p.videoType==='youtube'&&p.videoId?'https://youtu.be/'+p.videoId:p.videoType==='vimeo'&&p.videoId?'https://vimeo.com/'+p.videoId:p.videoId||'');
  return `
    <input type="hidden" id="bp-id-${i}" value="${esc(String(p.id||''))}">
    ${t!=='quote'?fg('Заголовок',inp(`bp-title-${i}`,p.title||'')):''}
    ${t==='link'?fg('URL',inp(`bp-url-${i}`,p.url||'')):''}
    ${t==='video'?fg('Ссылка на видео (YouTube / Vimeo / файл)',inp(`bp-vurl-${i}`,videoUrl)):''}
    ${fg(t==='quote'?'Текст цитаты':'Текст / описание',`<textarea class="fi" id="bp-content-${i}" rows="3">${escTA(p.content||'')}</textarea>`)}
    ${t==='quote'?fg('Автор',inp(`bp-author-${i}`,p.author||'')):''}`;
}

function boardTypeChange(i){
  const t  = document.getElementById(`bp-type-${i}`)?.value||'note';
  const id = document.getElementById(`bp-id-${i}`)?.value||'';
  const el = document.getElementById(`bp-fields-${i}`);
  if(el) el.innerHTML = boardPostFields({type:t, id}, i);
}

async function switchBoard(id){
  colBoards();
  currentBoard=id;
  CT='';
  showTab('boards');
}

function colBoards(){
  if(!document.getElementById('ls-boards')) return;
  const posts=[...document.querySelectorAll('#ls-boards .li-item')].map(li=>{
    const i=li.dataset.idx;
    const type=document.getElementById(`bp-type-${i}`)?.value||'note';
    const tags=(document.getElementById(`bp-tags-${i}`)?.value||'').split(',').map(s=>s.trim()).filter(Boolean);
    const content=document.getElementById(`bp-content-${i}`)?.value||'';
    const title=document.getElementById(`bp-title-${i}`)?.value||'';
    const date=document.getElementById(`bp-date-${i}`)?.value||'';
    const author=document.getElementById(`bp-author-${i}`)?.value||'';
    const url=document.getElementById(`bp-url-${i}`)?.value||'';
    const vurl=document.getElementById(`bp-vurl-${i}`)?.value||'';
    const savedId = document.getElementById(`bp-id-${i}`)?.value;
    const published=!!document.getElementById(`bp-pub-${i}`)?.checked;
    const post={id: savedId ? Number(savedId) : Date.now()+parseInt(i), type,tags,content,title,date,published};
    if(type==='quote') post.author=author;
    if(type==='link')  post.url=url;
    if(type==='video' && vurl){
      post.videoUrl=vurl;
      let m=vurl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
      if(m){ post.videoType='youtube'; post.videoId=m[1]; post.thumb='https://img.youtube.com/vi/'+m[1]+'/hqdefault.jpg'; }
      else { m=vurl.match(/vimeo\.com\/(\d+)/); if(m){ post.videoType='vimeo'; post.videoId=m[1]; } else { post.videoType='file'; post.videoId=vurl; } }
    }
    return post;
  });
  // Queue board save for unified pipeline instead of saving directly
  queueSave('boards', currentBoard, {posts: posts});
}

async function addBoardPost(){
  colBoards();
  // Flush pending board save immediately so new post appears
  const pending = (window._pendingSaves||[]).find(s=>s.collection==='boards'&&s.docId===currentBoard);
  if(pending) await fsSet(pending.collection, pending.docId, pending.data);
  const posts=await loadBoardPosts(currentBoard);
  posts.unshift({id:Date.now(),type:'note',title:'',content:'',tags:[],date:new Date().toISOString().slice(0,10),published:true});
  await fsSet('boards', currentBoard, {posts});
  CT='';
  showTab('boards');
}

// ── SEO ──────────────────────────────────────
function seoCount(id, type){
  const el=document.getElementById(id);
  const cnt=document.getElementById(id+'-cnt');
  if(!el||!cnt) return;
  const len=el.value.length;
  if(type==='title'){
    const ok=len>=50&&len<=60, warn=len>=40&&len<=70;
    cnt.textContent=len+' / 60 симв.'+(len<50?' — слишком коротко':len>60?' — слишком длинно':' — отлично');
    cnt.className='seo-cnt '+(ok?'ok':warn?'warn':'bad');
  } else {
    const ok=len>=120&&len<=160, warn=len>=100&&len<=180;
    cnt.textContent=len+' / 160 симв.'+(len<120?' — слишком коротко':len>160?' — слишком длинно':' — отлично');
    cnt.className='seo-cnt '+(ok?'ok':warn?'warn':'bad');
  }
}
function initSeoCounters(){
  ['index','about','journey','interests','videos','contact'].forEach(key=>{
    seoCount('seo-t-'+key,'title');
    seoCount('seo-d-'+key,'desc');
  });
}

function edSEO(){
  const s=D.seo||{};
  const pages=[['index','🏠 Главная'],['about','👤 О себе'],['journey','🗺️ Мой путь'],['interests','🧠 Интересы'],['videos','🎬 Видео'],['contact','✉️ Контакт']];
  let html=`<div class="ed-header"><div class="ed-tag">SEO</div><h2>Мета-теги</h2><p>Заголовок вкладки и описание для поисковиков и соцсетей</p></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:24px;">
    <div style="padding:14px;background:var(--s2);border:1px solid var(--border);border-radius:var(--r);line-height:1.7;">
      <div style="font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;">Title</div>
      <div style="font-size:.82rem;color:var(--muted);">50–60 символов. Уникальный для каждой страницы. Включи ключевое слово + имя.</div>
    </div>
    <div style="padding:14px;background:var(--s2);border:1px solid var(--border);border-radius:var(--r);line-height:1.7;">
      <div style="font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;">Description</div>
      <div style="font-size:.82rem;color:var(--muted);">120–160 символов. Опиши содержание страницы. Это текст в результатах Google.</div>
    </div>
    <div style="padding:14px;background:var(--s2);border:1px solid var(--border);border-radius:var(--r);line-height:1.7;">
      <div style="font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;">Подсказки</div>
      <div style="font-size:.82rem;color:var(--muted);">
        <span class="seo-cnt ok" style="display:inline;">●</span> отлично &nbsp;
        <span class="seo-cnt warn" style="display:inline;">●</span> допустимо &nbsp;
        <span class="seo-cnt bad" style="display:inline;">●</span> исправь
      </div>
    </div>
  </div>`;
  pages.forEach(([key,label])=>{
    const sd=s[key]||{};
    html+=`<div class="fsec">${label}</div>
    <div class="fg">
      <label class="flbl">Title (вкладка браузера / Google)</label>
      <input class="fi" id="seo-t-${key}" value="${esc(sd.title||'')}" oninput="seoCount('seo-t-${key}','title')">
      <span class="seo-cnt" id="seo-t-${key}-cnt"></span>
    </div>
    <div class="fg">
      <label class="flbl">Description (описание в поиске)</label>
      <textarea class="fi" id="seo-d-${key}" rows="2" oninput="seoCount('seo-d-${key}','desc')">${escTA(sd.desc||'')}</textarea>
      <span class="seo-cnt" id="seo-d-${key}-cnt"></span>
    </div>`;
  });
  return html;
}
function colSEO(){
  if(!document.getElementById('seo-t-index'))return;
  if(!D.seo)D.seo={};
  ['index','about','journey','interests','videos','contact'].forEach(key=>{
    D.seo[key]={title:v(`seo-t-${key}`),desc:v(`seo-d-${key}`)};
  });
}

// ── APPEARANCE ───────────────────────────────
function edAppearance(){
  const a=D.appearance||{};
  const colors = a.customColors||{};
  const themes=[['cyan','Cyan — синий (по умолчанию)'],['purple','Purple — фиолетовый'],['green','Green — зелёный'],['orange','Orange — оранжевый'],['custom','🎨 Свой цвет']];
  const opts=themes.map(([val,lbl])=>`<option value="${val}"${a.defaultTheme===val?' selected':''}>${lbl}</option>`).join('');
  const checked=a.showHeroStats!==false;
  const pg=a.pages||{};
  const isCustom = a.defaultTheme==='custom';
  const pgRow=(key,label,hint)=>{
    const vis=pg[key]!==false;
    return `<label class="chk-row" style="margin-bottom:10px;align-items:flex-start;">
      <input type="checkbox" id="ap-pg-${key}"${vis?' checked':''} style="margin-top:3px;">
      <div><span>${label}</span><p class="fhint" style="margin:3px 0 0;">${hint}</p></div>
    </label>`;
  };
  return `<div class="ed-header"><div class="ed-tag">Внешний вид</div><h2>Настройки отображения</h2><p>Тема, цвета, видимость разделов и элементов</p></div>
  ${fg('Тема по умолчанию',`<select class="fi" id="ap-theme" onchange="toggleCustomColors()">${opts}</select>`,'Для новых посетителей. Выбери «Свой цвет» чтобы задать любые цвета')}
  <div id="custom-colors-panel" style="display:${isCustom?'block':'none'};">
    <div class="fsec">Свои цвета</div>
    <p style="color:var(--muted);font-size:.82rem;margin-bottom:16px;line-height:1.5;">Выбери свои цвета для сайта. Изменения будут видны после сохранения.</p>
    <div class="color-grid">
      <div class="color-item">
        <label class="flbl">Основной акцент</label>
        <div class="color-pick-wrap">
          <input type="color" id="cc-accent" value="${colors.accent||'#00d4ff'}" class="color-inp" oninput="previewColor()"/>
          <input class="fi color-hex" id="cc-accent-hex" value="${colors.accent||'#00d4ff'}" oninput="syncColorFromHex('accent')"/>
        </div>
        <p class="fhint">Кнопки, ссылки, иконки, свечение</p>
      </div>
      <div class="color-item">
        <label class="flbl">Второй акцент</label>
        <div class="color-pick-wrap">
          <input type="color" id="cc-accent2" value="${colors.accent2||'#a855f7'}" class="color-inp" oninput="previewColor()"/>
          <input class="fi color-hex" id="cc-accent2-hex" value="${colors.accent2||'#a855f7'}" oninput="syncColorFromHex('accent2')"/>
        </div>
        <p class="fhint">Градиент имени, детали</p>
      </div>
      <div class="color-item">
        <label class="flbl">Фон</label>
        <div class="color-pick-wrap">
          <input type="color" id="cc-bg" value="${colors.bg||'#050810'}" class="color-inp" oninput="previewColor()"/>
          <input class="fi color-hex" id="cc-bg-hex" value="${colors.bg||'#050810'}" oninput="syncColorFromHex('bg')"/>
        </div>
        <p class="fhint">Основной фон страницы</p>
      </div>
      <div class="color-item">
        <label class="flbl">Текст</label>
        <div class="color-pick-wrap">
          <input type="color" id="cc-text" value="${colors.text||'#f1f5f9'}" class="color-inp" oninput="previewColor()"/>
          <input class="fi color-hex" id="cc-text-hex" value="${colors.text||'#f1f5f9'}" oninput="syncColorFromHex('text')"/>
        </div>
        <p class="fhint">Основной цвет текста</p>
      </div>
    </div>
    <div class="color-preview-bar" id="color-preview">
      <div class="cprev-bg" id="cprev-bg">
        <span class="cprev-text" id="cprev-text">Превью текста</span>
        <span class="cprev-accent" id="cprev-accent">Акцент</span>
        <span class="cprev-accent2" id="cprev-accent2">Градиент</span>
      </div>
    </div>
  </div>
  <div class="fsec">Видимость разделов</div>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:20px;line-height:1.6;">Снятая галочка — раздел исчезает из меню и с главной страницы. Прямая ссылка всё ещё работает.</p>
  ${pgRow('about',   'О себе',   'about.html')}
  ${pgRow('journey', 'Мой путь', 'journey.html')}
  ${pgRow('interests','Интересы','interests.html')}
  ${pgRow('videos',  'Видео',    'videos.html — скрой пока не добавишь контент')}
  ${pgRow('contact', 'Контакт',  'contact.html')}
  <div class="fsec">Элементы главной страницы</div>
  <label class="chk-row">
    <input type="checkbox" id="ap-stats"${checked?' checked':''}>
    <span>Показывать блок со счётчиками (10+ лет, 5+ стран...)</span>
  </label>`;
}

function toggleCustomColors(){
  const sel=document.getElementById('ap-theme');
  const panel=document.getElementById('custom-colors-panel');
  if(sel&&panel) panel.style.display=sel.value==='custom'?'block':'none';
}
function syncColorFromHex(key){
  const hex=document.getElementById('cc-'+key+'-hex');
  const clr=document.getElementById('cc-'+key);
  if(hex&&clr&&/^#[0-9a-fA-F]{6}$/.test(hex.value)){ clr.value=hex.value; previewColor(); }
}
function previewColor(){
  const bg=document.getElementById('cc-bg')?.value||'#050810';
  const accent=document.getElementById('cc-accent')?.value||'#00d4ff';
  const accent2=document.getElementById('cc-accent2')?.value||'#a855f7';
  const text=document.getElementById('cc-text')?.value||'#f1f5f9';
  ['accent','accent2','bg','text'].forEach(k=>{
    const c=document.getElementById('cc-'+k);
    const h=document.getElementById('cc-'+k+'-hex');
    if(c&&h) h.value=c.value;
  });
  const bar=document.getElementById('cprev-bg');
  if(bar){
    bar.style.background=bg;
    document.getElementById('cprev-text').style.color=text;
    document.getElementById('cprev-accent').style.color=accent;
    const a2=document.getElementById('cprev-accent2');
    a2.style.background=`linear-gradient(90deg,${accent},${accent2})`;
    a2.style.webkitBackgroundClip='text';
    a2.style.webkitTextFillColor='transparent';
  }
}

function colAppearance(){
  if(!document.getElementById('ap-theme'))return;
  if(!D.appearance)D.appearance={};
  D.appearance.defaultTheme=v('ap-theme');
  D.appearance.showHeroStats=!!document.getElementById('ap-stats')?.checked;
  if(!D.appearance.pages)D.appearance.pages={};
  ['about','journey','interests','videos','contact'].forEach(key=>{
    D.appearance.pages[key]=!!document.getElementById('ap-pg-'+key)?.checked;
  });
  if(D.appearance.defaultTheme==='custom'){
    D.appearance.customColors={
      accent: document.getElementById('cc-accent')?.value||'#00d4ff',
      accent2: document.getElementById('cc-accent2')?.value||'#a855f7',
      bg: document.getElementById('cc-bg')?.value||'#050810',
      text: document.getElementById('cc-text')?.value||'#f1f5f9'
    };
  }
}

// ── SECURITY ─────────────────────────────────
function edSecurity(){
  const user = auth.currentUser;
  const emailHint = user ? user.email : '';
  return `<div class="ed-header"><div class="ed-tag">Безопасность</div><h2>Доступ к панели</h2><p>Смена пароля через Firebase Auth</p></div>
  <div class="fsec">Текущий аккаунт</div>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:20px;">Вход выполнен как: <strong style="color:var(--accent);">${emailHint}</strong></p>
  <div class="fsec">Смена пароля</div>
  <div class="fg"><label class="flbl">Новый пароль (мин. 6 символов)</label><input class="fi" type="password" id="sec-pass" placeholder="••••••••••" autocomplete="new-password"/></div>
  <div class="fg"><label class="flbl">Повторите пароль</label><input class="fi" type="password" id="sec-pass2" placeholder="••••••••••" autocomplete="new-password"/></div>
  <button class="xbtn cyan" style="margin-top:4px;" onclick="changePassword()">🔐 Обновить пароль</button>
  <div id="sec-msg" style="margin-top:14px;font-size:.85rem;min-height:20px;"></div>
  <div class="fsec">Сессия</div>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:16px;">Завершить текущую сессию и вернуться на экран авторизации.</p>
  <button class="xbtn red" onclick="doLogout()">→ Выйти из системы</button>`;
}
async function changePassword(){
  const pass=document.getElementById('sec-pass')?.value;
  const pass2=document.getElementById('sec-pass2')?.value;
  const msg=document.getElementById('sec-msg');
  if(!pass){ msg.innerHTML='<span class="sec-msg-err">Введите новый пароль</span>'; return; }
  if(pass!==pass2){ msg.innerHTML='<span class="sec-msg-err">Пароли не совпадают</span>'; return; }
  if(pass.length<6){ msg.innerHTML='<span class="sec-msg-err">Пароль минимум 6 символов</span>'; return; }
  try {
    await auth.currentUser.updatePassword(pass);
    msg.innerHTML='<span class="sec-msg-ok">✓ Пароль обновлён.</span>';
    document.getElementById('sec-pass').value='';
    document.getElementById('sec-pass2').value='';
  } catch(e) {
    if(e.code==='auth/requires-recent-login'){
      msg.innerHTML='<span class="sec-msg-err">Необходимо перелогиниться для смены пароля. Выйдите и войдите снова.</span>';
    } else {
      msg.innerHTML='<span class="sec-msg-err">Ошибка: '+e.message+'</span>';
    }
  }
}

// ── TRANSLATIONS EDITOR ───────────────────────
async function edTranslations(){
  const lang=adminLang;
  let ov = await fsGet('content','ac_i18n_'+lang) || {};
  const def=(window.AC_I18N&&window.AC_I18N[lang])||{};
  const val=(k)=>ov[k]!==undefined?ov[k]:(def[k]||'');
  const KEYS=[
    {k:'open_board',     label:'Ссылка "Открыть доску"',       hint:'На карточках интересов, напр. «Открыть доску →»'},
    {k:'watch_btn',      label:'Кнопка "Смотреть"',            hint:'На главном видео вверху страницы, напр. «▶ Смотреть»'},
    {k:'featured_label', label:'Метка "Избранное"',            hint:'Бейдж поверх главного (featured) видео'},
    {k:'values_title',   label:'Заголовок "Что мне важно"',    hint:'Подпись над блоком ценностей на странице О себе'},
    {k:'topics_title',   label:'Заголовок "Темы"',             hint:'Подпись над тегами тем на странице Контакт'},
    {k:'nav_section',    label:'Метка "Навигация"',            hint:'Подпись над карточками-меню на главной странице'},
    {k:'menu_label',     label:'Aria-label бургер-кнопки',     hint:'Для скринридеров и доступности — не виден визуально, но важен'},
  ];
  return `<div class="ed-header">
    <div class="ed-tag">Интерфейс</div>
    <h2>Переводы UI <span class="lang-badge">${lang.toUpperCase()}</span></h2>
    <p>Небольшие тексты интерфейса: кнопки, метки, подписи. Переключай язык редактора вверху (RU / UK / NO) чтобы настроить каждый язык.</p>
  </div>
  <p style="color:var(--muted);font-size:.85rem;margin-bottom:24px;padding:12px 16px;background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.1);border-radius:8px;line-height:1.7;">
    💡 Здесь — <b style="color:var(--text);">служебные тексты</b>, которые не входят в контент страниц.<br>
    Тексты пунктов меню → таб <b style="color:var(--accent);">Общие</b>.<br>
    Метки разделов (Хронология, Интересы...) → в каждом табе страницы, поле <b style="color:var(--accent);">«Метка раздела»</b>.
  </p>
  ${KEYS.map(({k,label,hint})=>fg(label,inp('tr-'+k,val(k)),hint)).join('')}`;
}

function colTranslations(){
  if(!document.getElementById('tr-open_board'))return;
  const KEYS=['open_board','watch_btn','featured_label','values_title','topics_title','nav_section','menu_label'];
  const ov={};
  KEYS.forEach(k=>{ const v2=document.getElementById('tr-'+k)?.value||''; if(v2)ov[k]=v2; });
  // Queue i18n save for unified pipeline
  queueSave('content', 'ac_i18n_'+adminLang, ov);
  if(window.AC_I18N&&window.AC_I18N[adminLang]){
    KEYS.forEach(k=>{ if(ov[k])window.AC_I18N[adminLang][k]=ov[k]; });
  }
}

// ── MEDIA MANAGER ───────────────────────────
function edMedia(){
  return `<div class="ed-header"><div class="ed-tag">Медиафайлы</div><h2>Менеджер медиа</h2>
    <p>Загружай картинки в Firebase Storage. Нажми на карточку чтобы скопировать URL.</p></div>
  <div class="media-drop" id="media-drop">
    <div class="media-drop-icon">📁</div>
    <div class="media-drop-text"><b>Перетащи файлы</b> или нажми для выбора<br>PNG, JPG, GIF, WebP, SVG — до 5 MB</div>
    <input type="file" multiple accept="image/*" id="media-file-input" onchange="handleMediaFiles(this.files)">
    <div class="media-upload-progress" id="media-progress"><div class="bar" id="media-progress-bar"></div></div>
  </div>
  <div class="fsec">Загруженные файлы</div>
  <div id="media-list"><p style="color:var(--muted);font-size:.85rem;">Загрузка...</p></div>`;
}

function initMediaDrop(){
  const drop=document.getElementById('media-drop');
  if(!drop) return;
  drop.addEventListener('dragover',e=>{ e.preventDefault(); drop.classList.add('dragover'); });
  drop.addEventListener('dragleave',()=>drop.classList.remove('dragover'));
  drop.addEventListener('drop',e=>{ e.preventDefault(); drop.classList.remove('dragover'); handleMediaFiles(e.dataTransfer.files); });
  loadMediaList();
}

async function handleMediaFiles(files){
  if(!files||!files.length) return;
  const prog=document.getElementById('media-progress');
  const bar=document.getElementById('media-progress-bar');
  prog.style.display='block';
  for(let i=0;i<files.length;i++){
    const file=files[i];
    if(file.size>5*1024*1024){ showToast('// Файл '+file.name+' > 5 MB, пропущен','error'); continue; }
    if(!file.type.startsWith('image/')){ showToast('// '+file.name+' — не изображение, пропущен','error'); continue; }
    const name=Date.now()+'_'+file.name.replace(/[^a-zA-Z0-9._-]/g,'');
    const ref=storage.ref('media/'+name);
    try{
      const task=ref.put(file,{contentType:file.type});
      task.on('state_changed',snap=>{
        bar.style.width=Math.round((snap.bytesTransferred/snap.totalBytes)*100)+'%';
      });
      await task;
      bar.style.width='100%';
      showToast('// Загружено: '+file.name,'success');
    }catch(e){ showToast('// Ошибка загрузки: '+e.message,'error'); }
  }
  prog.style.display='none'; bar.style.width='0';
  loadMediaList();
}

let _mediaItems=[];
async function loadMediaList(){
  const container=document.getElementById('media-list');
  if(!container) return;
  try{
    const res=await storage.ref('media').listAll();
    if(!res.items.length){
      _mediaItems=[];
      container.innerHTML='<p style="color:var(--muted);font-size:.85rem;">Пока нет загруженных файлов</p>';
      return;
    }
    _mediaItems=[];
    const cards=[];
    for(let idx=0;idx<res.items.length;idx++){
      const item=res.items[idx];
      const url=await item.getDownloadURL();
      _mediaItems.push({url:url, path:item.fullPath, name:item.name});
      cards.push(`<div class="media-card" title="${esc(item.name)}">
        <img src="${esc(url)}" alt="${esc(item.name)}" loading="lazy">
        <div class="media-card-name">${esc(item.name)}</div>
        <div class="media-card-overlay">
          <button class="media-card-btn copy" onclick="event.stopPropagation();copyMediaUrl(${idx})">📋 URL</button>
          <button class="media-card-btn del" onclick="event.stopPropagation();deleteMedia(${idx})">🗑 Удалить</button>
        </div>
      </div>`);
    }
    container.innerHTML='<div class="media-grid">'+cards.join('')+'</div>';
  }catch(e){
    container.innerHTML='<p style="color:var(--danger);font-size:.85rem;">Ошибка загрузки: '+esc(e.message)+'</p>';
  }
}

function copyMediaUrl(idx){
  const item=_mediaItems[idx];
  if(!item) return;
  navigator.clipboard.writeText(item.url).then(()=>showToast('// URL скопирован','success')).catch(()=>{
    prompt('Скопируй URL:',item.url);
  });
}

async function deleteMedia(idx){
  const item=_mediaItems[idx];
  if(!item) return;
  if(!confirm('Удалить '+item.name+'? Это необратимо.')) return;
  try{
    await storage.ref(item.path).delete();
    showToast('// Файл удалён','success');
    loadMediaList();
  }catch(e){ showToast('// Ошибка удаления: '+e.message,'error'); }
}
