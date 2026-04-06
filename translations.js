/* ================================================
   ПЕРЕВОДЫ САЙТА — Украинский (uk) и Норвежский (no)
   Русский контент живёт в site-data.js
   ================================================ */

// ── СТАТИЧЕСКИЕ ПЕРЕВОДЫ (навигация, кнопки, подписи) ──
window.AC_I18N = {
  ru: {
    nav_about:'О себе', nav_journey:'Мой путь', nav_interests:'Интересы', nav_videos:'Видео', nav_contact:'Контакт',
    back_home:'← На главную', back_interests:'← К интересам',
    lbl_about:'Обо мне', lbl_journey:'Хронология', lbl_interests:'Интересы', lbl_videos:'Контент', lbl_contact:'Контакт',
    values_title:'// Что мне важно', topics_title:'// Темы', nav_section:'Зачем ты здесь?',
    menu_label:'Меню', footer_right:'Норвегия · Живу настоящим',
    open_board:'Открыть доску →', featured_label:'Избранное', watch_btn:'▶ Смотреть'
  },
  uk: {
    nav_about:'Про мене', nav_journey:'Мій шлях', nav_interests:'Інтереси', nav_videos:'Відео', nav_contact:'Контакт',
    back_home:'← На головну', back_interests:'← До інтересів',
    lbl_about:'Про мене', lbl_journey:'Хронологія', lbl_interests:'Інтереси', lbl_videos:'Контент', lbl_contact:'Контакт',
    values_title:'// Що мені важливо', topics_title:'// Теми', nav_section:'Навіщо ти тут?',
    menu_label:'Меню', footer_right:'Норвегія · Живу теперішнім',
    open_board:'Відкрити дошку →', featured_label:'Обране', watch_btn:'▶ Дивитися'
  },
  no: {
    nav_about:'Om meg', nav_journey:'Min reise', nav_interests:'Interesser', nav_videos:'Video', nav_contact:'Kontakt',
    back_home:'← Tilbake', back_interests:'← Til interesser',
    lbl_about:'Om meg', lbl_journey:'Kronologi', lbl_interests:'Interesser', lbl_videos:'Innhold', lbl_contact:'Kontakt',
    values_title:'// Hva er viktig for meg', topics_title:'// Temaer', nav_section:'Hvorfor er du her?',
    menu_label:'Meny', footer_right:'Norge · Lever i nuet',
    open_board:'Åpne tavle →', featured_label:'Utvalgt', watch_btn:'▶ Se'
  }
};

// ── ПОЛНЫЕ ПЕРЕВОДЫ КОНТЕНТА ──
window.AC_TRANSLATIONS = {

  /* ════════════════════════════════
     УКРАИНСКИЙ
     ════════════════════════════════ */
  uk: {
    global: {
      footerLeft:  '© 2026 Andrii Chepelovskyi',
      footerRight: 'Норвегія · Живу теперішнім',
      nav: {
        about: 'Про мене',
        journey: 'Мій шлях',
        interests: 'Інтереси',
        videos: 'Відео',
        contact: 'Контакт',
        backHome: '← На головну',
        backInterests: '← До інтересів'
      }
    },
    index: {
      badge:       'Норвегія · Дослідник світу',
      tagline:     'Акробат. Мандрівник. Мислитель.',
      sub:         'Людина, яка будує світ зсередини — через досвід, роздуми та щире зацікавлення до життя.',
      btnPrimary:  { text: 'Мій шлях →', href: 'journey.html' },
      btnGhost:    { text: 'Про мене',   href: 'about.html'   },
      quote:       '«Кожна людина може дати і поділитися тим, чим вона є всередині — незалежно від того, що вона декларує. Пережитий досвід, інтегровані моделі та патерни поведінки — це те, що будує наше життя.»',
      quoteAuthor: '— Andrii Chepelovskyi',
      navCards: [
        { icon:'🪞', title:'Ти коли-небудь міняв усе з нуля?',             desc:'Не план. Серія точок, після яких назад уже не можна.',                              href:'journey.html'   },
        { icon:'🧩', title:'Тобі казали, що ти занадто багато думаєш?',    desc:'Може, справа не в кількості думок — а в якості питань.',                             href:'interests.html' },
        { icon:'🔬', title:'Ти знаєш, чому приймаєш свої рішення?',       desc:'Не ті, які пояснюєш іншим. Справжні.',                                               href:'about.html'     },
        { icon:'📡', title:'Слова чи дії — чому ти довіряєш?',            desc:'Іноді краще дивитися, ніж слухати. Тут — без фільтрів.',                               href:'videos.html'    },
        { icon:'💬', title:'Є думка, якій нікуди подітися?',              desc:'Не шукай відповідь. Іноді потрібна просто людина, яка зрозуміє питання.',              href:'contact.html'   }
      ]
    },
    about: {
      pageTitle: 'Хто я такий?',
      pageDesc:  'Я не вкладаюся в одне слово. Акробат, мандрівник, мислитель — кожне правда, і жодне не повне.',
      paragraphs: [
        'Мене звуть <b>Andrii Chepelovskyi</b>. Я виріс в Україні, навчався в танцювальному коледжі в Житомирі, потім прийшов до акробатики — і це змінило все.',
        'З <b>2015 року</b> я працював у міжнародних акробатичних колективах, об\'їздив Китай, Кіпр, Італію, Францію. Життя на контрактах навчає головного: адаптуватися, не втрачаючи себе.',
        'Зараз я живу в <b>Норвегії</b> вже третій рік. Працюю вактмайстром. Читаю, думаю, спостерігаю.',
        'Я називаю себе <b>дослідником світу</b> — не тому що мандрую, а тому що не перестаю ставити запитання.'
      ],
      stats: [
        { num:'10+', label:'років у міжнародних колективах' },
        { num:'5+',  label:'країн, де жив і працював'       },
        { num:'3',   label:'роки в Норвегії'                 },
        { num:'∞',   label:'цікавість до життя'              }
      ],
      values: [
        { icon:'🔍', title:'Щира цікавість',        desc:'Я ставлю запитання не для того, щоб знайти відповідь — а щоб краще зрозуміти запитання.'      },
        { icon:'🌱', title:'Зростання через досвід', desc:'Кожен етап — танці, акробатика, переїзди, війна — залишив слід. Будую з нього.'                 },
        { icon:'🤝', title:'Справжність у спілкуванні', desc:'Люди діляться тим, ким є всередині — не тим, що говорять. Це мене захоплює.'              },
        { icon:'🏗️', title:'Будувати своє бачення', desc:'Моя мета — скласти в голові цілісне бачення світу і жити через нього.'                         }
      ]
    },
    journey: {
      pageTitle: 'Мій шлях',
      pageDesc:  'Від танцювального коледжу в Житомирі до берегів Норвегії — кожен етап був своїм світом.',
      items: [
        { year:'Початок',    title:'Танцювальний коледж',              location:'📍 Житомир, Україна',       desc:'Перші кроки у творчість. Народний колектив «Льонок» — сцена, дисципліна, колектив.',                               tags:['Танець','Сцена','Колектив']         },
        { year:'Перехід',    title:'Акробатика',                       location:'📍 Україна',                desc:'Новий виклик — акробатика. Через пів року тренувань відкрилась можливість поїхати до Китаю.',                    tags:['Акробатика','Тренування']           },
        { year:'Китай',      title:'Перший виїзд — 4 місяці',          location:'📍 Китай',                  desc:'Повне занурення в іншу культуру. Інша мова, інший ритм життя, інше розуміння роботи.',                          tags:['Китай','Інша культура']             },
        { year:'2015–2020',  title:'Акробатичний колектив',            location:'📍 Міжнародні гастролі',    desc:'Активна робота в професійному акробатичному колективі. Роки виступів, репетицій і зростання.',                  tags:['Сцена','Гастролі','Команда']        },
        { year:'2020–2022',  title:'Школа акробатики + COVID + Війна', location:'📍 Україна',                desc:'Відкриття школи акробатики. Потім — війна в Україні. Треба було приймати рішення швидко і чесно.',               tags:['Школа','COVID','Війна']             },
        { year:'Контракти',  title:'Кіпр · Італія · Франція',          location:'📍 Європа',                 desc:'Серія міжнародних контрактів по Європі. Кожна країна — нове середовище, нові люди, нові правила.',               tags:['Кіпр','Італія','Франція']           },
        { year:'Зараз',      title:'Норвегія',                         location:'📍 Норвегія',               desc:'Вже третій рік тут. Працюю вактмайстром. Займаюся психологією мислення, філософією, технологіями.',             tags:['Норвегія','Психологія','Філософія'] }
      ],
      nowTitle: 'Де я зараз',
      nowText:  'Норвегія, 2026. Працюю, читаю, думаю. Займаюся психологією мислення і стежу за розвитком технологій. Будую своє бачення — зсередини, крок за кроком.'
    },
    interests: {
      pageTitle: 'Що мене захоплює',
      pageDesc:  'Різні галузі — одна спільна нитка: бажання зрозуміти, як влаштований світ і людина всередині нього.',
      cards: [
        { icon:'🧠', title:'Психологія мислення', desc:'Мене захоплює не практична психологія, а фундаментальна: як саме працює мислення, що стоїть за сприйняттям.',       questions:['Що таке мислення?','Який механізм сприйняття?','Як досвід змінює структуру думки?']    },
        { icon:'🌀', title:'Філософія',            desc:'Особливо цікавить зв\'язок мови та мислення: як слова, які ми використовуємо, формують реальність, яку ми сприймаємо.', questions:['Які патерни приховані за мовою?','Як моделі поведінки керують життям?']                  },
        { icon:'⚡', title:'Технології та ШІ',     desc:'Стежу за технічним і технологічним розвитком світу. ШІ цікавить як явище — що він говорить про природу інтелекту.',    questions:['Як ШІ змінює мислення людей?','Де межа між інструментом і розумом?']                    },
        { icon:'🌍', title:'Соціологія',           desc:'Життя в різних країнах дало матеріал для спостережень: як середовище формує поведінку в різних культурах.',            questions:['Як середовище формує людину?','Що спільного у людей різних культур?']                   },
        { icon:'🤸', title:'Акробатика',           desc:'Не просто професія — спосіб думати тілом. Точність, довіра до партнера і робота з простором, який не прощає помилок.', questions:['Тіло як інструмент пізнання','Дисципліна як форма свободи']                             },
        { icon:'🚗', title:'Автомобілі та механіка',desc:'Почалося з BMW X1 d23 N47 turbo — питання заміни витратників потягнуло інтерес до інженерії та механіки.',            questions:['Як влаштовані складні системи?','BMW N47 — мотор з характером']                        }
      ]
    },
    contact: {
      pageTitle: 'Зв\'яжіться зі мною',
      pageDesc:  'Відкритий до спілкування — якщо хочете познайомитися, обговорити ідеї або просто написати.',
      items: [
        { icon:'✉️', label:'Email',     value:'your@email.com',      href:'mailto:your@email.com'                },
        { icon:'✈️', label:'Telegram',  value:'@yourusername',       href:'https://t.me/yourusername'            },
        { icon:'📸', label:'Instagram', value:'@yourusername',       href:'https://instagram.com/yourusername'   },
        { icon:'💼', label:'LinkedIn',  value:'Andrii Chepelovskyi', href:'https://linkedin.com/in/yourusername' }
      ],
      textTitle: 'Про що поговорити?',
      textParagraphs: [
        'Я відкритий до різних розмов. Не обов\'язково мати конкретну причину — іноді цікаво просто обмінятися поглядами.',
        'Особливо близькі теми <b>мислення і сприйняття</b>, спостереження за поведінкою людей у різних культурах, технології та куди вони ведуть.',
        'Якщо ви акробат, мандрівник або просто людина з нестандартним поглядом — пишіть.'
      ],
      topics: ['🧠 Психологія мислення','🌀 Філософія','⚡ Технології / ШІ','🤸 Акробатика','🌍 Культури','🚗 Механіка / BMW']
    }
  },

  /* ════════════════════════════════
     НОРВЕЖСКИЙ
     ════════════════════════════════ */
  no: {
    global: {
      footerLeft:  '© 2026 Andrii Chepelovskyi',
      footerRight: 'Norge · Lever i nuet',
      nav: {
        about: 'Om meg',
        journey: 'Min reise',
        interests: 'Interesser',
        videos: 'Video',
        contact: 'Kontakt',
        backHome: '← Tilbake',
        backInterests: '← Til interesser'
      }
    },
    index: {
      badge:       'Norge · Verdensutforsker',
      tagline:     'Akrobat. Reisende. Tenker.',
      sub:         'En mann som bygger verden innenfra — gjennom erfaring, refleksjon og genuin nysgjerrighet på livet.',
      btnPrimary:  { text: 'Min reise →', href: 'journey.html' },
      btnGhost:    { text: 'Om meg',      href: 'about.html'   },
      quote:       '«Hvert menneske kan gi og dele det det er innenfra seg selv — uavhengig av hva det erklærer. Opplevd erfaring, integrerte modeller og atferdsmønstre — det er det som bygger livene våre.»',
      quoteAuthor: '— Andrii Chepelovskyi',
      navCards: [
        { icon:'🪞', title:'Har du noen gang begynt helt på nytt?',        desc:'Ikke en plan. En serie punkter du ikke kan gå tilbake fra.',                          href:'journey.html'   },
        { icon:'🧩', title:'Har noen sagt at du tenker for mye?',          desc:'Kanskje problemet ikke er mengden tanker — men kvaliteten på spørsmålene.',            href:'interests.html' },
        { icon:'🔬', title:'Vet du hvorfor du tar dine egne valg?',        desc:'Ikke de du forklarer til andre. De virkelige.',                                        href:'about.html'     },
        { icon:'📡', title:'Ord eller handlinger — hva stoler du på?',     desc:'Noen ganger er det bedre å se enn å lytte. Her — uten filtre.',                        href:'videos.html'    },
        { icon:'💬', title:'Har du en tanke som ikke finner sin plass?',   desc:'Ikke let etter svar. Noen ganger trenger du bare en som forstår spørsmålet.',          href:'contact.html'   }
      ]
    },
    about: {
      pageTitle: 'Hvem er jeg?',
      pageDesc:  'Jeg passer ikke inn i ett ord. Akrobat, reisende, tenker — hvert er sant, og ingen er fullstendig.',
      paragraphs: [
        'Jeg heter <b>Andrii Chepelovskyi</b>. Jeg vokste opp i Ukraina, studerte ved dansekollegiet i Zhytomyr, så begynte jeg med akrobatikk — og det forandret alt.',
        'Fra <b>2015</b> jobbet jeg i internasjonale akrobatiske ensembler og reiste til Kina, Kypros, Italia og Frankrike. Livet på kontrakter lærer det viktigste: å tilpasse seg uten å miste seg selv.',
        'Nå bor jeg i <b>Norge</b> for tredje år. Jobber som vaktmester. Leser, tenker, observerer.',
        'Jeg kaller meg selv en <b>verdensutforsker</b> — ikke fordi jeg reiser, men fordi jeg aldri slutter å stille spørsmål.'
      ],
      stats: [
        { num:'10+', label:'år i internasjonale ensembler' },
        { num:'5+',  label:'land der jeg bodde og jobbet'  },
        { num:'3',   label:'år i Norge'                    },
        { num:'∞',   label:'nysgjerrighet på livet'        }
      ],
      values: [
        { icon:'🔍', title:'Ekte nysgjerrighet',          desc:'Jeg stiller spørsmål ikke for å finne svaret — men for bedre å forstå spørsmålet.'               },
        { icon:'🌱', title:'Vekst gjennom erfaring',      desc:'Hvert livssteg — dans, akrobatikk, flytte, krig — etterlot et spor. Jeg bygger av det.'           },
        { icon:'🤝', title:'Autentisitet i samtale',      desc:'Folk deler det de er inni seg — ikke det de sier. Det fascinerer meg.'                            },
        { icon:'🏗️', title:'Bygge sin egen visjon',      desc:'Mitt mål er å forme en helhetlig visjon av verden og leve gjennom den.'                           }
      ]
    },
    journey: {
      pageTitle: 'Min reise',
      pageDesc:  'Fra dansekollegiet i Zhytomyr til Norges kyster — hvert steg var sin egen verden.',
      items: [
        { year:'Begynnelsen', title:'Dansekollegiet',                    location:'📍 Zhytomyr, Ukraina',       desc:'Første steg inn i kreativitet. Folkensemblet «Lenok» — scenen, disiplin, fellesskap.',                    tags:['Dans','Scene','Ensemble']          },
        { year:'Overgang',    title:'Akrobatikk',                        location:'📍 Ukraina',                 desc:'En ny utfordring — akrobatikk. Etter et halvt år med trening åpnet muligheten til å reise til Kina.',   tags:['Akrobatikk','Trening']             },
        { year:'Kina',        title:'Første tur — 4 måneder',            location:'📍 Kina',                    desc:'Full fordypning i en annen kultur. Annet språk, annen livsrytme, annen forståelse av arbeid.',           tags:['Kina','Annen kultur']              },
        { year:'2015–2020',   title:'Akrobatisk ensemble',               location:'📍 Internasjonale turneer',  desc:'Aktivt arbeid i et profesjonelt akrobatisk ensemble. År med opptredener, øvinger og vekst.',             tags:['Scene','Turneer','Team']           },
        { year:'2020–2022',   title:'Akrobatikkskole + COVID + Krig',    location:'📍 Ukraina',                 desc:'Åpning av akrobatikkskole. Så — krigen i Ukraina. Måtte ta beslutninger raskt og ærlig.',               tags:['Skole','COVID','Krig']             },
        { year:'Kontrakter',  title:'Kypros · Italia · Frankrike',       location:'📍 Europa',                  desc:'En serie internasjonale kontrakter i Europa. Hvert land — nytt miljø, nye mennesker, nye regler.',       tags:['Kypros','Italia','Frankrike']      },
        { year:'Nå',          title:'Norge',                             location:'📍 Norge',                   desc:'Tredje år her nå. Jobber som vaktmester. Studerer tenkningens psykologi, filosofi og teknologi.',       tags:['Norge','Psykologi','Filosofi']     }
      ],
      nowTitle: 'Hvor jeg er nå',
      nowText:  'Norge, 2026. Jobber, leser, tenker. Studerer tenkningens psykologi og følger teknologisk utvikling. Bygger min visjon — innenfra, steg for steg.'
    },
    interests: {
      pageTitle: 'Hva engasjerer meg',
      pageDesc:  'Ulike felt — én felles tråd: ønsket om å forstå hvordan verden og mennesket er skrudd sammen.',
      cards: [
        { icon:'🧠', title:'Tenkningens psykologi', desc:'Jeg er fascinert av grunnleggende psykologi: hvordan tenkning fungerer, hva som ligger bak persepsjon.',      questions:['Hva er tenkning?','Hva er mekanismen bak persepsjon?','Hvordan endrer erfaring tankemønstre?']  },
        { icon:'🌀', title:'Filosofi',              desc:'Spesielt interessert i forholdet mellom språk og tenkning: hvordan ord former virkeligheten vi oppfatter.',    questions:['Hvilke mønstre skjuler seg bak språket?','Hvordan styrer atferdsmodeller livet?']               },
        { icon:'⚡', title:'Teknologi og KI',       desc:'Følger teknologisk utvikling. KI er interessant som fenomen — hva det sier om intelligensens natur.',          questions:['Hvordan endrer KI menneskers tenkning?','Hvor er grensen mellom verktøy og intelligens?']      },
        { icon:'🌍', title:'Sosiologi',             desc:'Å leve i ulike land ga materiale for observasjoner: hvordan miljø former atferd på tvers av kulturer.',        questions:['Hvordan former miljø mennesket?','Hva er felles for folk fra ulike kulturer?']                 },
        { icon:'🤸', title:'Akrobatikk',            desc:'Ikke bare et yrke — en måte å tenke med kroppen. Presisjon, tillit og romlig bevissthet, som ikke tilgir feil.',questions:['Kroppen som erkjennelsesverktøy','Disiplin som en form for frihet']                            },
        { icon:'🚗', title:'Biler og mekanikk',     desc:'Startet med BMW X1 d23 N47 turbo — interesse for ingeniørvitenskap og hvordan komplekse systemer fungerer.',   questions:['Hvordan fungerer komplekse systemer?','BMW N47 — en motor med karakter']                      }
      ]
    },
    contact: {
      pageTitle: 'Ta kontakt',
      pageDesc:  'Åpen for kommunikasjon — om du vil bli kjent, diskutere ideer eller bare skrive.',
      items: [
        { icon:'✉️', label:'Email',     value:'your@email.com',      href:'mailto:your@email.com'                },
        { icon:'✈️', label:'Telegram',  value:'@yourusername',       href:'https://t.me/yourusername'            },
        { icon:'📸', label:'Instagram', value:'@yourusername',       href:'https://instagram.com/yourusername'   },
        { icon:'💼', label:'LinkedIn',  value:'Andrii Chepelovskyi', href:'https://linkedin.com/in/yourusername' }
      ],
      textTitle: 'Hva snakke om?',
      textParagraphs: [
        'Jeg er åpen for alle slags samtaler. Det er ikke nødvendig å ha et bestemt motiv — noen ganger er det interessant å bare utveksle synspunkter.',
        'Spesielt nær temaene <b>tenkning og persepsjon</b>, observasjoner av menneskelig atferd i ulike kulturer, teknologi og dens retning.',
        'Hvis du er akrobat, reisende eller bare en person med et utradisjonelt syn — skriv gjerne.'
      ],
      topics: ['🧠 Tenkningens psykologi','🌀 Filosofi','⚡ Teknologi / KI','🤸 Akrobatikk','🌍 Kulturer','🚗 Mekanikk / BMW']
    }
  }
};

// ── ADMIN i18n OVERRIDES ──────────────────────────
// Применяет изменения из Admin → Переводы поверх дефолтных AC_I18N
(function(){
  try{
    ['ru','uk','no'].forEach(function(lang){
      var stored=localStorage.getItem('ac_i18n_'+lang);
      if(!stored)return;
      var ov=JSON.parse(stored);
      Object.keys(ov).forEach(function(k){ if(ov[k])window.AC_I18N[lang][k]=ov[k]; });
    });
  }catch(e){}
})();
