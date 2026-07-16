# FRAMELIMIT: Project Status and SEO Roadmap

Последна актуализация: 16 юли 2026 г.

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

- Commit: `f60df79`
- Message: `Fix homepage best picks section`
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
  - [x] Осми high-risk batch: Legion 5i Gen 10 review и reviews card са синхронизирани с exact 83N20003BO (Core Ultra 7 255HX, RTX 5070 115W, 32GB DDR5-5600, 1TB, OLED 165Hz, 80Wh и тегло от 1.9kg); различният 15IRX10 i7/IPS dataset е ясно обозначен като related evidence, legacy FPS таблицата е потисната и остарелият Product Offer markup е премахнат.
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
  - [x] Седми price/ranking batch: общият flagship guide е синхронизиран с RTX 5080/5090 evidence статусите; Blade 16 EN9, Zephyrus GU606 и Titan 18 са unranked, точните GPU/CPU/RAM/storage/weight данни са обновени, а статичните цени, runtime оценки и неподкрепените cross-model performance/value изводи са премахнати.
  - [x] Осми price/ranking batch: 14-inch guide е ограничен до реални 14-inch конфигурации; погрешно включеният MSI Stealth A16 е премахнат, Razer Blade 14 е коригиран към Ryzen AI 9 365 / RTX 5070 115W / 2880×1800 OLED 120Hz / 1.63kg и обозначен като unranked, а статичните price/runtime и performance-gap твърдения са премахнати.
  - [x] Девети price/ranking batch: thin-and-light guide е синхронизиран с точните G14, Blade 14, Legion 7 Gen 11 и Zephyrus G16 конфигурации; несъществуващият MSI Stealth 14 запис е заменен с реалния Legion, трите review страници без editorial score са unranked, а runtime, price-gap и универсалните weight/TGP performance твърдения са премахнати.
  - [x] Десети price/ranking batch: college guide е синхронизиран с exact Legion 5i 83N20003BO, TUF A16 FA608UM, G14 GU405AR, Katana B14WGK и LOQ 15AHP10 конфигурации; старите Radeon TUF и RTX 5060 Katana описания са заменени, а статичните цени, runtime, student-discount и warranty-cost твърдения са премахнати.
  - [x] Единадесети price/ranking batch: laptop-vs-desktop guide вече изисква matched workload данни и live complete-system цени; несъществуващият 11-game suite, универсалните performance gaps, фиксираните system prices и неподкрепените lifespan/value изводи са премахнати.
  - [x] Дванадесети price/ranking batch: under-$2,500 guide вече прилага live checkout eligibility и exact-evidence ranking; Aurora е коригиран от RTX 5070 Ti/140W към exact RTX 5070/115W, G14 към GU405AR, Blade 14 и Omen към точните спецификации, а Legion 7i е unranked до корекция на stale review evidence.
  - [x] Тринадесети price/ranking batch: under-$2,000 guide вече класира само exact Helios PHN16S-71-98RF и Katana B14WGK evidence; Legion 83N20003BO е unranked заради related 15IRX10 dataset, TUF FX608LPG и Omen 16-an0000 са specifications-only, а статичните цени, runtime и универсалните value/performance изводи са премахнати.
  - [x] Четиринадесети price/ranking batch: under-$1,500 guide е уеднаквен до четири exact-evidence RTX 5060 конфигурации, класирани по публикувания editorial score; model codes, таблицата и card labels са синхронизирани, а статичните price gaps, thermal/value суперлативи и грешният lower-tier линк са коригирани.
  - [x] Петнадесети price/ranking batch: under-$1,000 page вече е live-deal screening guide без измислен постоянен победител; ranking се допуска само при exact-SKU evidence и fresh checkout цена до прага, generic RTX/TGP minima и clearance твърденията са премахнати, а LOQ 15AHP10 е ясно неeligible reference до потвърдена оферта.
  - [x] Шестнадесети price/ranking batch: общият buying guide е синхронизиран с exact-SKU evidence и live-tier методологията; FAQ schema и видимите отговори вече съвпадат, фиксираните GPU/price/battery/desktop gaps и остарелият Radeon TUF ladder са премахнати, а display, CPU, RAM, storage, TGP и checklist съветите изискват конкретни измервания и конфигурации.
  - [x] Седемнадесети price/ranking batch: video-editing guide е преобразуван от неподкрепена Tested & Ranked класация в unranked creator shortlist; Blade EN9 е коригиран до RTX 5090 24GB/64GB retail с family-level evidence, Legion 83F50053US до точните OLED/CPU/weight данни, а статичните цени, runtime, display-accuracy, export и universal-workflow твърдения са премахнати.
  - [x] Осемнадесети price/ranking batch: streaming guide е преобразуван от неподкрепена Game + Stream Tested класация в unranked OBS shortlist; NVENC Gen 7 е коригиран до Blackwell ninth-generation NVENC, точните Legion Pro 7i 83F50053US, Omen Max 16-ah0070ca, Legion 5i 83N20003BO и TUF A16 FA608UM evidence статуси са уточнени, а фиксираните overhead, price и value твърдения са премахнати.
  - [x] Деветнадесети price/ranking batch: Fortnite guide е преобразуван от неподкрепена best/competitive класация в unranked replay shortlist; SCAR 16 е понижен до family-level evidence, Legion 5i 83N20003BO е обозначен с related 15IRX10 data, LOQ 15AHP10 и Omen Max 16-ah0070ca са exact general-evidence кандидати, а фиксираните цени, FPS/value суперлативи и универсалното DLSS/MFG множително твърдение са премахнати.
  - [x] Двадесети price/ranking batch: Minecraft guide е преобразуван от неподкрепена Java & Bedrock Tested класация в unranked workload shortlist; LOQ 15AHP10 и TUF A16 FA608UM са синхронизирани с exact general-evidence данните, Legion 5i 83N20003BO е обозначен с related 15IRX10 evidence, несъответстващите LOQ/Legion affiliate ASIN-и са коригирани, а фиксираните цени, shader/value/longevity твърдения и универсалните RAM препоръки са премахнати.
  - [x] Двадесет и първи price/ranking batch: budget-college guide е преобразуван от неподкрепена best-performance/balanced класация в unranked student shortlist; LOQ 15AHP10, TUF A16 FA608UM и Gigabyte Gaming A16 CVH са показани с exact-model evidence, battery capacity и live-price checks, generic search affiliate линковете са синхронизирани с проверените ASIN-и, а thermal/display/value суперлативите са премахнати.
  - [x] Двадесет и втори evidence-safety batch: cooling/thermals guide е преобразуван от несъпоставима cross-source temperature класация и рискови generic repaste/undervolt инструкции в manufacturer-first diagnostic workflow; универсалните температурни прагове, voltage offsets, cleaning intervals и заявените cooling gains са премахнати, а airflow, firmware, OEM diagnostics, repeatable measurement и service escalation стъпките са ясно разделени.
  - [x] Двадесет и трети ranking-consistency batch: основният Best Gaming Laptops guide е повторно синхронизиран с exact evidence статусите; Legion 5i 83N20003BO и TUF A16 FA608UM са unranked, грешните Legion CPU/display/runtime и TUF CPU/RAM/TGP/runtime данни са коригирани, comparison/benchmark таблиците и affiliate линковете са уеднаквени, а universal GPU-gap, lifespan, roadmap, RAM/storage, battery, desktop и OLED твърденията са премахнати и FAQ schema е синхронизиран с видимия текст.
  - [x] Двадесет и четвърти ranking-consistency batch: under-$3,000 guide е уеднаквен до conditional exact-evidence ranking по публикувания editorial score и live checkout eligibility; неподкрепеният 15–25% lower-TGP gap, Omen Best Value и Vector Best Portable етикетите, no-throttling/fastest-storage/best-display claims и cross-brand build-quality изводът са премахнати, а metadata, Omen alt text и evidence labels са синхронизирани.
  - [x] Двадесет и пети ranking-consistency batch: college guide е преобразуван от неподкрепена best-overall/use-case класация в unranked student shortlist; Legion 5i 83N20003BO е обозначен с related 15IRX10 gaming evidence и N/R college rank, останалите четири модела са exact general-evidence кандидати без общ student-runtime протокол, LOQ storage и TUF/LOQ affiliate ASIN-ите са коригирани, а best-balance/battery/ultraportable и универсалните RAM/storage твърдения са премахнати.
  - [x] Двадесет и шести structured-data batch: 20 review страници са преобразувани от orphan `Review → itemReviewed Product` markup към `Product → review`, така че всеки Product node има реална редакционна review оценка без измислени Offer цени; Razer Article `about` е понижен до Thing, а новият product-schema audit блокира бъдещи Product nodes без offers, review или aggregateRating.
  - [x] Двадесет и седми ranking-consistency batch: AMD Radeon guide е преобразуван от противоречива 01–03 fastest/value класация в unranked legacy/configuration shortlist; Alienware m18 useahctom18r1amd09 и TUF A16 FA617XT са exact-specification кандидати, m16 R1 AMD е family-specification entry, AMD reference power е отделена от system TGP, а текущите availability/price и универсалните FSR compatibility твърдения са премахнати.
  - [x] Двадесет и осми ranking-consistency batch: under-$2,000 guide вече показва ranked Helios PHN16S-71-98RF и Katana B14WGK cards преди unranked Legion 83N20003BO, описва conditional live-price/editorial-score метода и синхронизира Katana overall score до canonical 7.9 между laptops.js, standalone review, Product review markup, central reviews card, comparison table и price guide; статичният Best-under-$1,800 етикет е премахнат.
  - [x] Двадесет и девети ranking-consistency batch: under-$1,500 guide вече класира условно само exact-evidence LOQ 15AHP10 и Nitro ANV16S-41-R2AJ; TUF FA608UM и Gigabyte CVHI3US894SH са понижени до unranked related-configuration алтернативи заради несъответстващи memory/storage test конфигурации, cards/order/comparison таблицата са синхронизирани, а точните retail спецификации и evidence ограниченията са коригирани и в централния reviews каталог.
  - [x] Тридесети ranking-consistency batch: централната reviews comparison таблица е синхронизирана с всичките 22 текущи review cards и реалните им published scores; stale Helios 18, Omen Max RTX 5090 и Alienware 16 Area-51 редовете са премахнати, липсващите SCAR 16, Legion 7i/5 AMD, Stealth A16, Dell G16 и Gigabyte записи са добавени, а Blade 16 и Blade 14 са преместени като N/R след числово класираните модели.
  - [x] Тридесет и първи ranking-consistency batch: новият `scripts/audit-ranking-consistency.mjs` сравнява central review cards с `laptops.js`, изисква 22/22 comparison rows в низходящ score ред с N/R накрая и валидира numeric Quick Picks срещу ranked price-guide cards; SCAR 18 и Vector са синхронизирани с публикуваните standalone scores 9.6/9.0, а stale Raider 9.5, Alienware 18 9.4 и Omen Max 9.3 central оценки са коригирани до 9.3/9.2/9.1.
- [x] Разграничаване на direct ASIN и Amazon search fallback.
- [x] Проверка на всички връзки от guides към individual reviews.
- [x] Проверка дали класациите отговарят на публикуваните доказателства чрез ръчните ranking batches и `scripts/audit-ranking-consistency.mjs`.

### Приоритет 2: Sitemap и индексиране

- [x] Обновяване на `<lastmod>` за всички съществено променени URL-и.
- [x] XML validation на `sitemap.xml` чрез XML parser и `scripts/audit-sitemap.mjs`.
- [x] Уеднаквяване на canonical, Open Graph, JSON-LD, sitemap и internal links с extensionless URL-ите, които Cloudflare Pages обслужва като крайни HTTP 200 адреси.
- [x] Добавяне на `scripts/audit-public-urls.mjs` за проверка на canonical URL-и, redirect-free internal links и счупени локални цели.
- [x] Deploy на обновения sitemap на същия URL; production проверката на 16 юли 2026 г. потвърждава HTTP 200 за `sitemap.xml`, homepage и приоритетните extensionless guide/review URL-и.
- [x] Проверка за `Success` в Google Search Console: sitemap-ът е прочетен успешно с 59 открити страници на 15 юли 2026 г.
- [x] URL Inspection на най-важните 5-10 страници; live test-ът потвърждава, че приоритетният 2026 guide може да бъде индексиран.
- [x] `Request indexing` само веднъж за всяка приоритетна страница; приоритетните URL-и са подадени на 15 юли 2026 г.
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
  - [x] Първи RTX 5060 cluster batch: under-$1,500 guide вече използва описателни model-specific anchors към LOQ 15AHP10, Nitro V 16S, TUF A16 FA608UM и Gigabyte Gaming A16; четирите review страници имат обратен линк към guide-а и поне една crawlable related-review връзка.
  - [x] Втори money-page cluster batch: under-$3,000, RTX 5080, 14-inch и thin-and-light guides вече използват описателни model-specific review anchors; 8 свързани review страници имат обратни guide линкове и тематични alternative-review връзки.
  - [x] `scripts/audit-internal-links.mjs` вече валидира 6 двупосочни content clusters в 17 файла и блокира generic `Full Review`, `Read Review` и `Read more` anchors.
- [ ] Свързване на reviews с GPU и technology guides.
  - [x] Първи RTX 5060 technology-link batch: LOQ 15AHP10, Nitro V 16S и Gigabyte Gaming A16 reviews вече имат описателни backlinks към RTX 50 Laptop TGP Database и DLSS/FSR/Frame Generation database; `scripts/audit-internal-links.mjs` пази връзките.
  - [x] Втори RTX 5080 technology-link batch: Legion Pro 7i, MSI Vector 16, HP Omen Max 16, Zephyrus G16 и Strix G16 reviews вече водят към TGP и DLSS/Frame Generation техническите бази; същият audit guard валидира и петте страници.
- [x] Добавяне на директни model-vs-model comparison страници; публикувани са осем exact-SKU/evidence-boundary comparisons, включително LOQ 15AHP10 срещу Nitro V 16S и Gigabyte Gaming A16 в RTX 5060 cluster-а.
- [x] Добавяне на отделна `Best RTX 5060 Gaming Laptops` money page с две exact-evidence ranked конфигурации, една директно купуема unranked алтернатива, backlinks от трите reviews и връзки към двете model-vs-model comparison страници.
- [x] Добавяне на описателни anchor текстове вместо само `Read more`.
  - [x] Site-wide guide anchor batch: всички 36 `guide-*.html` страници са проверени, 25 generic review CTA текста са заменени с model-specific anchors, а `scripts/audit-internal-links.mjs` вече блокира повторната им поява във всеки guide.
- [x] Проверка всяка важна страница да има поне един crawlable вътрешен линк; `scripts/audit-crawlable-pages.mjs` валидира всички sitemap URL-и, а откритите orphan comparison и review-notes страници са свързани тематично от Compare и Methodology.
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
- [x] Показване на `Check Price` само при точен ASIN.
- [x] Изключване на моделите без потвърден директен Amazon US продукт от активните finder/compare препоръки.
- [x] Добавяне на `Last checked` дата към офертите.
- [ ] Фокус върху money pages с ясна покупателна цел.
- [ ] Избягване на ръчно публикувани цени без надежден процес за обновяване.
  - [x] Обновен direct-retail audit на 16 юли 2026 г.: активният каталог съдържа 34 модела, 34 уникални direct ASIN линка и 0 Amazon search fallback линка; всички използват tracking ID `framelimit20-20`.
  - [x] Осемте стари или неподкрепени конфигурации са заменени с актуални директно купуеми Amazon US конфигурации с конкретни уникални ASIN-и. Всички отново участват във finder/compare; архивните ревюта отделят старите benchmark данни от точния текущ retail SKU.
  - [x] Потвърдени и добавени директни продуктови страници за Blade 16/18, Legion 5 AMD, Zephyrus G14/G16, HP Omen 16, TUF A16, LOQ 15 и Acer Nitro 16S/Nitro V 16S.
  - [x] Site-wide affiliate guard на 16 юли 2026 г.: `scripts/update-amazon-prices.mjs --audit` проверява всеки директен Amazon anchor във всички HTML файлове за управляван ASIN, точен `framelimit20-20` tag и `rel="nofollow sponsored"`; 196 връзки в 78 файла и 37 управлявани ASIN-а преминават без грешка.
  - [ ] `price-snapshot.js` все още няма генериран live snapshot (`generatedAt: null`), затова текуща цена и наличност не могат да се гарантират за целия каталог.

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
- [ ] активният affiliate линк е direct ASIN; ако точният модел не е купуем, страницата ясно означава директно купуемата алтернатива;
- [ ] canonical, title, description и JSON-LD са валидни;
- [ ] страницата има вътрешни линкове към guides и alternatives;
- [ ] URL-ът присъства в sitemap-а с точен `lastmod`;
- [ ] страницата връща HTTP 200.

## Следваща препоръчана задача

Следващият работен пакет трябва да бъде:

1. Изчакване Amazon Associates профилът да покрие Creators API eligibility; workflow-ът запазва reference-price fallback и предупреждава без да се проваля дотогава.
2. Изчакване на Search Console да обработи еднократните indexing заявки и наблюдение на Pages/Indexing отчета.
3. `Validate Fix` за стария Product snippets проблем след като Google обходи новите страници.
4. [x] Отделната `Best RTX 5060 Gaming Laptops` money page обединява under-$1,500 guide-а, individual reviews и двете model-vs-model comparison страници.
