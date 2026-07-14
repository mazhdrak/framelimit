# FRAMELIMIT: Project Status and SEO Roadmap

Последна актуализация: 14 юли 2026 г.

## Цел на проекта

FRAMELIMIT трябва да се развие като надежден източник за gaming laptop спецификации, benchmark сравнения, buying guides и проверени Amazon affiliate оферти.

Основните бизнес цели са:

- органичен трафик от Google;
- класиране по конкретни модели и long-tail заявки;
- Amazon affiliate приходи;
- изграждане на разпознаваем и надежден hardware сайт;
- постепенно класиране по по-конкурентни buying guide заявки.

## Какво е направено

### 1. Review и guide структура

- Добавени и разширени са индивидуални review страници за актуални gaming laptop модели.
- Добавени са нови модели за 2026 г., включително Lenovo Legion 7 Gen 11, ASUS ROG Strix G16 и MSI Raider 16 Max HX.
- Моделите са свързани с `reviews.html`, buying guides и comparison страници.
- Подобрени са навигацията, вътрешните линкове, author информацията и methodology страницата.
- Разграничени са собствени наблюдения, официални спецификации и независимо публикувани измервания.

### 2. Benchmark система

- Създаден е централен файл `benchmark-data.js`.
- Всички продуктови review страници вече използват общ benchmark template.
- Добавени са 26 централизирани benchmark dataset-а.
- Показват се точният модел/SKU, CPU, GPU, TGP, RAM и дисплей на тестваната конфигурация.
- Native, DLSS, FSR и Frame Generation резултатите са разделени.
- Frame Generation се обозначава като `FG x2`, `MFG x4` или с точния публикуван режим.
- Average FPS, 1% low и minimum FPS са отделни колони.
- Липсващи стойности се показват като `N/A`, вместо да бъдат изчислявани или измисляни.
- Synthetic резултатите са отделени от gaming FPS: 3DMark, Cinebench, Geekbench и други.
- Всеки dataset съдържа линкове към използваните източници.

### 3. Корекции на лаптоп конфигурации

Коригирани са множество несъответствия между review текстове, cards и реално измерени конфигурации. Сред по-важните примери са:

- ASUS TUF Gaming A16 FA608: Ryzen 7 260 и RTX 5060 115W;
- Lenovo Legion 5i 15IRX10: Core i7-13650HX и RTX 5070 115W;
- Lenovo Legion 5 AMD 15AHP10: Ryzen AI 7 350 и RTX 5070 115W;
- ASUS ROG Zephyrus G14 GU405AR: Core Ultra 9 386H и RTX 5070 Ti 115W;
- Lenovo LOQ 15AHP10: Ryzen 7 250 и RTX 5060 115W;
- Dell G16 7630: RTX 4070 140W, 32GB RAM, 86Wh;
- Gigabyte Gaming A16: RTX 5060 85W, 32GB RAM, 76Wh;
- HP Omen Max 16: Core Ultra 9 275HX, RTX 5080 175W и IPS 240Hz;
- Alienware 18 Area-51: Core Ultra 9 275HX, 300Hz display и 4.34kg;
- HP Omen Transcend 14: Core Ultra 9 285H и RTX 5070.

Когато benchmark източникът използва различен CPU или регионален SKU, това вече е обозначено като reference configuration.

### 4. Affiliate линкове

- Amazon линковете използват affiliate tag `framelimit20-20`.
- Потвърдените ASIN линкове водят към конкретен продукт.
- Когато няма надежден директен ASIN, се използва точно model-specific Amazon търсене.
- Affiliate линковете използват `rel="nofollow sponsored"`.
- Добавени са предупреждения за проверка на model code, GPU, RAM, display, seller и checkout price.
- Премахнати или коригирани са линкове, водещи към друг модел или поколение.

### 5. SEO и технически проверки

- Добавени или коригирани са canonical URL-и, title и meta description полета.
- Добавени са author, publisher, datePublished и dateModified данни там, където са приложими.
- JSON-LD блоковете са проверени за валиден JSON.
- Няма останали `pending benchmark` или `Exact SKU required` секции.
- Всички benchmark ID стойности имат съответстващ dataset.
- HTML comment блоковете и JavaScript файловете преминават структурните проверки.
- Проверените локални review URL-и връщат HTTP 200.
- `robots.txt` позволява обхождането и съдържа правилния sitemap URL.
- Новите review страници са включени в `sitemap.xml`.

### 6. Последен публикуван commit

- Commit: `4848bab05c21aa9a873bee529dbb57bcb7d588b8`
- Message: `Standardize sourced laptop benchmarks`
- Branch: `main`
- Remote: `https://github.com/mazhdrak/framelimit.git`
- Статус: push-нат към `origin/main`.

## Текущи рискове

### 1. Част от guide страниците още съдържат стари данни

Някои guides все още могат да показват:

- стари CPU/GPU конфигурации;
- стари цени;
- неподкрепени FPS стойности;
- твърдения като `Fully Tested`;
- стари TGP, RAM, display и battery данни;
- класации, които не използват новите benchmark dataset-и.

Това е най-важната следваща задача преди масово искане за повторно индексиране.

### 2. Sitemap `lastmod` стойности

Всички нови URL-и са включени, но част от сериозно променените страници още имат `<lastmod>` от април 2026 г.

`lastmod` трябва да се променя само когато основното съдържание, structured data или важни линкове са съществено обновени.

### 3. Google още може да показва стари версии

Google Search в момента може да показва кеширани заглавия, спецификации и `Fully Tested` текстове от предишни версии. Това ще се промени едва след повторно обхождане и обработване на страниците.

### 4. Ограничена оригинална hands-on информация

FRAMELIMIT няма бюджет за собствено тестване на всички модели. Затова сайтът не трябва да се конкурира чрез измислено hands-on позициониране.

По-добрата стратегия е:

- стандартизиране на независимо публикувани измервания;
- ясна attribution информация;
- сравнение на еднакви настройки;
- проверка на точния SKU и TGP;
- уникални таблици, графики и анализ;
- наблюдение на цени и конфигурации.

## Следващи стъпки

### Приоритет 1: Guide consistency audit

- [x] Преглед на всеки `guide-*.html` файл чрез повторяемия `scripts/audit-guides.mjs` audit.
- [x] Съпоставяне на guide лаптопите с точните review benchmark anchors; липсващите exact datasets са обозначени като `Specifications only` или `Not published`.
- [ ] Корекция на CPU, GPU, VRAM, TGP, RAM, display, weight и battery.
  - [x] Първи high-risk batch: Lenovo Legion 5 Gen 10 AMD, HP Omen 16 Slim и ASUS TUF F16 са сверени с официални Lenovo/HP/ASUS спецификации; добавени са model code, source URL и дата на проверката.
  - [x] Втори high-risk batch: Lenovo Legion 5i 15IAX10, Acer Helios Neo 16S AI PHN16S-71-98RF и MSI Katana 15 HX B14WGK са сверени с официалните конфигурации; коригирани са TGP, refresh rate, panel, weight и battery.
  - [x] Трети high-risk batch: Lenovo LOQ 15AHP10, ASUS TUF Gaming A16 FA608UM и Gigabyte Gaming A16 CVH са синхронизирани между централния каталог, review страниците и приоритетните budget guides; неподкрепените runtime и статични price твърдения са заменени с battery capacity и live-price checks.
  - [x] Четвърти high-risk batch: неподкрепените ASUS TUF A15 RTX 5060 / Ryzen 7 8745H и Lenovo LOQ 16 Gen 10 / Core Ultra 5 245H записи са премахнати от каталога, cards, review notes и guides; student, Minecraft и Fortnite данните са синхронизирани с проверените LOQ 15AHP10 и TUF A16 FA608UM конфигурации.
  - [x] Пети high-risk batch: ASUS TUF Gaming A16 Advantage Edition е коригиран към официалния FA617XT от 2023 г. с Ryzen 9 7940HS, RX 7700S 120W, DDR5-4800, 1TB SSD и QHD+ 240Hz панел; моделът вече е search-only legacy option и не се използва като фиксирана препоръка до $1,150.
  - [x] Шести high-risk batch: Acer Nitro 16S AI AN16S-61-R7YL и Nitro V 16S AI ANV16S-41-R2AJ са сверени с официалните Acer конфигурации; коригирани са CPU, TGP, display, storage и weight, премахнати са статичните price/runtime твърдения, а неподкрепеният HP Victus 16 RTX 5060 запис е премахнат.
  - [x] Седми high-risk batch: Dell G16 7630 RTX 4070 е синхронизиран с официалната конфигурация useghbto7630glmf (Core i9-13900HX, 140W RTX 4070, 32GB DDR5, 1TB SSD, QHD+ 240Hz и 86Wh); остарелите статични price/runtime твърдения са премахнати, моделът е изваден от under-$1,500 класацията, а неподкрепеният college-guide Dell G16 RTX 5060 е заменен с проверения LOQ 15AHP10.
  - [x] `scripts/audit-guides.mjs` вече валидира задължителните централни spec полета и source metadata.
- [x] Премахване на неподкрепени `we tested`, `fully tested` и подобни твърдения.
- [x] Премахване или ясно обозначаване на прогнозни FPS стойности; несъпоставимите cross-source averages са заменени с връзки към точните datasets.
- [ ] Обновяване на стари цени и добавяне на дата на проверката.
  - [x] Първи price/ranking batch: under-$3,000 guide вече използва checkout eligibility вместо фиксирани цени; Legion Pro 7i 83F50053US, Omen Max 16-ah0070ca и MSI Vector A2XWIG-058US са синхронизирани с exact SKU данни, battery capacity и live-price checks, а неподкрепените runtime и price-gap твърдения са премахнати.
  - [x] Втори price/ranking batch: сравнението Razer Blade 16 RZ09-05819EN9-R3U1 срещу Legion Pro 7i 83F50053US е обновено с official-store snapshot от 14 юли; грешният $1,500 gap, синтетичният cross-source FPS average и неподкрепеният 60-minute throttling тест са премахнати, а изводът вече е условен според exact SKU, workload и live price.
  - [x] Трети price/ranking batch: RTX 5080 vs RX 7900M guide е коригиран от несъществуващ ROG Strix G18 Radeon вариант към официалния Alienware m18 R1 AMD useahctom18r1amd09; премахнати са измислените 11-game averages, battery/runtime и $800 value изводи, а сравнението вече е cross-generation explainer с exact Dell price snapshot и matching-dataset requirement.
  - [x] Четвърти price/ranking batch: основната Best Gaming Laptops 2026 класация е синхронизирана с exact SKU данните за Legion Pro 7i 83F50053US, Razer Blade 16 RZ09-05819EN9-R3U1, MSI Vector A2XWIG-058US и Omen Max 16-ah0070ca; Razer е обозначен като unranked до exact-SKU benchmark покритие, а фиксираните цени, price-gap и неподкрепените performance/runtime твърдения са заменени с live-price и matching-workload проверки.
  - [x] Пети price/ranking batch: Best RTX 5080 Gaming Laptops guide е намален до пет проверими конфигурации; неподкрепеният Alienware 16 Area-51 RTX 5080 запис е заменен с exact Omen Max 16-ah0070ca, Zephyrus GU606 и Strix G615 са ясно unranked, а фиксираните цени, desktop-GPU еквиваленти и универсалните performance разлики са премахнати.
  - [x] Шести price/ranking batch: Best RTX 5090 Gaming Laptops guide вече разделя exact sourced конфигурациите от unranked алтернативите; Razer Blade 16 EN9 е обозначен с family-level 32GB evidence, Titan 18 остава specifications-only, а фиксираните цени, benchmark-winner и универсалните TGP/performance твърдения са премахнати.
- [x] Разграничаване на direct ASIN и Amazon search fallback.
- [x] Проверка на всички връзки от guides към individual reviews.
- [ ] Проверка дали класациите отговарят на публикуваните доказателства.

### Приоритет 2: Sitemap и индексиране

- [x] Обновяване на `<lastmod>` за всички съществено променени URL-и.
- [x] XML validation на `sitemap.xml` чрез XML parser и `scripts/audit-sitemap.mjs`.
- [ ] Deploy на обновения sitemap на същия URL.
- [ ] Проверка за `Success` в Google Search Console.
- [ ] URL Inspection на най-важните 5-10 страници.
- [ ] `Request indexing` само веднъж за всяка приоритетна страница.
- [ ] `Validate Fix` за стария Product snippets проблем след deploy.

Sitemap-ът не трябва да бъде изтриван и добавян като нов файл. Google вече знае неговия постоянен URL.

### Приоритет 3: Long-tail SEO

Първоначалната цел не трябва да бъде общата заявка `best gaming laptop`. По-реалистични заявки са:

- `Lenovo Legion 7 Gen 11 benchmarks`;
- `ASUS TUF A16 FA608 RTX 5060 review`;
- `RTX 5060 laptop 115W benchmarks`;
- `Dell G16 7630 RTX 4070 140W`;
- `DLSS quality vs balanced laptop`;
- `best RTX 5060 laptop under $1500`;
- `[model A] vs [model B]`;
- `[exact SKU] review`;
- `[GPU] laptop TGP comparison`.

За всяка основна заявка трябва да има една ясна canonical страница, за да не се конкурират няколко FRAMELIMIT URL-а помежду си.

### Приоритет 4: Content clusters и internal linking

- [ ] Свързване на individual reviews с подходящия price guide.
- [ ] Свързване на reviews с GPU и technology guides.
- [ ] Добавяне на директни model-vs-model comparison страници.
- [ ] Добавяне на описателни anchor текстове вместо само `Read more`.
- [ ] Проверка всяка важна страница да има поне един crawlable вътрешен линк.
- [ ] Добавяне на related reviews и alternatives в края на страниците.

Примерен cluster:

1. `Best RTX 5060 Gaming Laptops`.
2. Individual RTX 5060 reviews.
3. `RTX 5060 vs RTX 5070 Laptop`.
4. `RTX 5060 TGP Comparison`.
5. `Best Gaming Laptop Under $1,500`.
6. Model-vs-model comparison pages.

### Приоритет 5: Оригинални linkable assets

За получаване на естествени backlinks трябва да има информация, която други сайтове биха цитирали:

- [ ] RTX 50 Laptop TGP Database.
- [ ] Monthly Gaming Laptop Price Report.
- [ ] DLSS/FSR/Frame Generation comparison database.
- [ ] История на Amazon цените по точен SKU.
- [ ] Сравнение на еднакъв GPU при различен TGP.
- [ ] Графики за average FPS, 1% low и performance-per-dollar.
- [ ] Таблица с display brightness, gamut, refresh rate и response time.

Да не се купуват SEO backlinks и да не се използват автоматизирани link-building услуги.

### Приоритет 6: Search Console workflow

Веднъж седмично:

- [ ] Проверка на Pages/Indexing report.
- [ ] Проверка за нови structured data проблеми.
- [ ] Export на Search Results за последните 28 дни.
- [ ] Филтриране на заявки с много impressions и позиции 8-20.
- [ ] Подобряване първо на тези страници.
- [ ] Проверка на CTR по query и page.
- [ ] Подобряване на title и description при високи impressions и слаб CTR.
- [ ] Записване на позициите преди и след промяната.

### Приоритет 7: Monetization

- [ ] Проверка на Amazon Associates account и активния tracking ID.
- [ ] Проверка на conversion и ordered items reports.
- [ ] Запазване на disclosure близо до affiliate съдържанието.
- [ ] Показване на `Check Price` само при точен ASIN.
- [ ] Използване на `Search Amazon` при непотвърдена конкретна оферта.
- [ ] Добавяне на `Last checked` дата към офертите.
- [ ] Фокус върху money pages с ясна покупателна цел.
- [ ] Избягване на ръчно публикувани цени без надежден процес за обновяване.

## Препоръчани money pages

Първите страници, които трябва да бъдат довършени и оптимизирани, са:

1. Best Gaming Laptop Under $1,500.
2. Best Gaming Laptop Under $3,000.
3. Best RTX 5060 Gaming Laptops.
4. Best RTX 5080 Gaming Laptops.
5. Best 14-Inch Gaming Laptops.
6. Best Thin and Light Gaming Laptops.
7. Gaming Laptop Buying Guide.
8. Individual reviews, които вече получават impressions.

## Реалистични SEO очаквания

- Конкретни модели и long-tail заявки: приблизително 2-8 седмици след качествено преиндексиране.
- Buying guides със средна конкуренция: приблизително 3-9 месеца.
- Общи заявки като `best gaming laptop`: вероятно по-дълъг период и нужда от значително повече authority и backlinks.

Няма гарантиран срок или гаранция за първа страница. Напредъкът трябва да се оценява чрез impressions, clicks, CTR, average position, affiliate clicks и conversions.

## Definition of Done за всяка review страница

Една review страница е готова, когато:

- [ ] моделът и точният SKU са ясни;
- [ ] CPU, GPU, VRAM и TGP са проверени;
- [ ] display, RAM, storage, battery и weight са проверени;
- [ ] няма смесване на различни конфигурации;
- [ ] benchmark таблицата използва общия template;
- [ ] Native, upscaling и Frame Generation режимите са ясни;
- [ ] Average, 1% low и minimum са правилно означени;
- [ ] липсващите стойности са `N/A`;
- [ ] източниците са посочени;
- [ ] affiliate линкът е direct ASIN или ясно означен search fallback;
- [ ] canonical, title, description и JSON-LD са валидни;
- [ ] страницата има вътрешни линкове към guides и alternatives;
- [ ] URL-ът присъства в sitemap-а с точен `lastmod`;
- [ ] страницата връща HTTP 200.

## Следваща препоръчана задача

Следващият работен пакет трябва да бъде:

1. Пълен audit и корекция на всички `guide-*.html` страници.
2. Синхронизиране на guide данните с `benchmark-data.js`.
3. Обновяване и validation на `sitemap.xml`.
4. Commit и push.
5. Search Console URL Inspection и `Validate Fix`.
