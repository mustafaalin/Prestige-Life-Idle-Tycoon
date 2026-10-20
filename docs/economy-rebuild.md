# Ekonominin yeniden kurulması (1. nesil, lansman öncesi)

Tarih: 2026-10-20, kararlar 2026-10-21 · Durum: **yön kararlaştı (kullanıcı), sayılar öneri; simülatörle ayarlanacak.** Uygulandıkça kurallar [game-design-v2.md](./game-design-v2.md)'ye taşınır ve buradan silinir. Görevler [rebuild-plan.md](./rebuild-plan.md) "Faz E". İlgili: [engagement-strategy-v2.md](./engagement-strategy-v2.md) (oyuncuyu tutma), [research/idle-guy-comparison-2026-10-20.md](./research/idle-guy-comparison-2026-10-20.md).

## 1. Kullanıcının kararları (2026-10-20)

1. **Burak'ın kazığı tamamen kalkar.** Hikâye sade kalsın.
2. **80 yaşta torun devralır ve kaldığı yerden devam eder:** işletmeler, evler, para, sınıf aileyle kalır; torun geliştirmeye ve zenginleşmeye devam eder. Sıfırlama yok.
3. **Lansman = 1. nesil.** 2. ve 3. nesil (Lumen, Ada, yeni şehir) tamamen yayından sonraya kalır. Yapı nesil eklemeye hazır kurulur.
4. **Ekonomi baştan ele alınır:** her şeyin fiyatı katlanarak artmaz; eşya, işletme ve meslek sayısı artar. (2026-10-20'nin önceki kararları da geçerli: kişisel eşyalar gerçekçi sabit fiyatlı ve gelir bonusu vermez, bir şeyin kilidini açar; meslekler satın alınmaz, şartla açılır, 60+ meslek; En Zengin 1. nesilde şart değil.)
5. **İşletmeler adetle değil, seviyeyle büyür:** tezgâh alınır, 8–10 yükseltmeyle dükkâna dönüşür, sonra yeni şube açılır. "73. çiçek tezgâhı" yok. Şubelerin işletme ekranında ayrı yeri olmak zorunda değil.
6. **Yönetici gelene kadar elle "Çalıştır":** aylık gelire sayılmaz; yönetici atanınca aylığa girer (bugünkü kural sürer).
7. **Tek tezgâhın bir "Çalıştır"ı bir şişeden belirgin şekilde fazla öder.** Bugün tur $1, şişe $2+: tersine.
8. **Şişe toplama kalır, ama gelirle katlanarak büyümez:** başta anlamlı, sonra etkisi azalır.
9. **Kayıt:** şu an oyunu oynayan ve ilerlemesi bozulacak kimse yok, yeni ekonomi bir kez temiz başlatabilir. **Yayından sonra** her güncelleme kayıtları korur ([session-handoff.md](./session-handoff.md) "Kayıt uyumluluğu").
10. **Kod:** kıdemli yazılımcı gibi, SOLID'e uygun (§7).
11. **(2026-10-21, §8 cevapları)** Lansmanda kahraman 80'de kalır: "Torununun hikâyesi yakında" der, oyun ve para sürer, devir 2. nesil güncellemesiyle gelir. Burak hikâyesi şimdilik tamamen kalkar, Burak yalnız bir yönetici. Miras puanı, yadigârlar ve "Şimdi devret" lansmanda gizli. Gerçekçi takvim (§2) kabul.
12. **(2026-10-21)** 1. nesilde **14 işletme**; kıyafetler **7**'de kalır.
13. **(2026-10-21)** Çevrimdışı kazanç **%20**, tavan en çok **1 saat** (önce %50 ve 2 sa; §8c).

## 2. Ana ilke: gerçekçi takvim

Bir oyun ayı 80 sn (§4.9, değişmiyor). Öneri: **ekranda yazan aylık tutarlar gerçek hayattakine yakın olsun**, yavaşlık fiyatların katlanmasından değil, büyük işlerin geri dönüşünün uzamasından gelsin:

- El ilanı dağıtan ayda ~$300, tezgâh ayda ~$1–2 bin, çiçekçi mağazası ~$6 bin, fabrika ayda milyonlar.
- Küçük iş hızlı kendini öder (aylar), büyük iş yavaş (yıllar). Gerçekte de böyle; idle oyunlarda da kartopunu bu frenler.
- Eşya fiyatları gerçek: bisiklet $150, ikinci el sedan $6 bin, ev $300 bin, jet $60 milyon.
- Sonuç hikâyeyle hizalanır: milyoner 20'lerin sonu–30'lar, milyarder ömrün ikinci yarısı, En Zengin torunla. Kesin hedefler §6, simülatör karar verir.

Çevrimdışı kazanç (yaşlanmadan para) bu ilkeyi bozar; oran ve tavan aynı işte yeniden ölçülür.

## 3. İşletme modeli

### 3.1 Bir işletme = tek kart, seviye + şube

| Aşama | Seviye | Ne olur | Yatırımın karakteri |
| --- | --- | --- | --- |
| 1. İşi kurmak | 1–3 | İlk ekipman, ilk müşteriler | Ucuz, hızlı geri döner, küçük artış |
| 2. Verimli çalışmak | 4–7 | Daha iyi ekipman, çalışan, düzenli sipariş | Orta fiyat, kontrollü artış |
| 3. Ölçeği büyütmek | 8–10 | Daha büyük yer; tezgâh → dükkân → mağaza | Pahalı, büyük sıçrama; görsel değişir |
| Şubeler | 10'dan sonra | Aynı işletmeden yeni şube | En pahalı; geliri katlar, yeni iş/olay kartı açabilir |

- **Her seviyenin adı ve kendi fiyatı var** (tasarlanmış tablo, formül değil). Kartta: "Soğuk dolap · $1.500 · tur $40 → $55 · kendini ~8 dakikada öder". Oyuncu farkı görür: "Bu ekipman hızlı döner", "Şube pahalı ama yeni müşteri getirir".
- **Görsel aşamaları:** her işletmenin 3 görseli (1–7, 8–9, 10+). Sahnede ve kartta görünen, işletmenin şu anki hâli.
- **Şubeler kartta tek satır:** "Şubeler 3/5" + küçük simgeler + "Yeni şube aç ($80 bin)". Ayrı kart yok. Şube başına gelir ana dükkânla aynı; sonraki şube biraz pahalıya (öneri ×1,15, yüksek değil). Şube sınırı sınıfla büyür (bugünkü `BUSINESS_CAP_STEPS` fikri).
- **Yönetici:** tek seferlik, işletmeyi otomatik ve çevrimdışı çalıştırır, aylığa girer; şubeler de onunla çalışır. Her işletmenin yönetici karakteri kalır (story-v2 §3).
- **Kilometre taşı ×2'ler, adet alma, ×10 / Maks kalkar.** Yükseltme ve sınıf sınırı seviye/şube modeline taşınır.

### 3.2 Çiçek Tezgâhı taslağı (sayılar simülatörden önce)

Tur 5 sn. Şişe $2 (§4). Elle durmadan çalıştırınca: 1. seviyede ~$5/sn (şişenin ~6 katı).

| Sv | Ad (TR) | Fiyat | Tur başına | Aylık (yöneticiyle) |
| --- | --- | --- | --- | --- |
| 1 | Tezgâh kur | $500 | $25 | $400 |
| 2 | Kova ve makas | $300 | $32 | $510 |
| 3 | Tente | $600 | $40 | $640 |
| 4 | Soğuk dolap | $1,5 bin | $55 | $880 |
| 5 | Çırak | $3 bin | $75 | $1,2 bin |
| 6 | Düğün siparişleri | $6 bin | $100 | $1,6 bin |
| 7 | Telefonla sipariş | $10 bin | $130 | $2,1 bin |
| 8 | Küçük dükkân (görsel 2) | $25 bin | $200 | $3,2 bin |
| 9 | Vitrin ve atölye | $40 bin | $260 | $4,2 bin |
| 10 | Çiçekçi mağazası (görsel 3) | $80 bin | $400 | $6,4 bin |
| Şube | 2., 3., ... şube | $80 bin, $92 bin, ... | +$400 her biri | +$6,4 bin |

Yönetici (Rıza Amca) $1,5 bin. Diğer işletmeler aynı iskelette, daha büyük ölçekte ve daha uzun geri dönüşle.

### 3.3 İşletme sayısı

Bugün 10. **Karar (2026-10-21): 1. nesilde 14**, her biri 3 görsel aşamalı. Yeni dördü merdivenin arasına girer (aday: Restoran, İnşaat Şirketi, Gayrimenkul Ofisi, Medya Şirketi); ilk işletme yine Çiçek Tezgâhı. Liste ve adlar ayrı onay; her yeni işletme bir yönetici karakteri ve olay kartı demek.

## 4. Elle kazanç: şişe ve "Çalıştır"

- **Şişe değeri gelire bağlı olmaz** (bugün `2 + 2,5 × gelir/sn`): sınıfa göre sabit küçük bir tablo, öneri Sokak $2, Gündelikçi $3, İşçi $5 (bozuk para). Orta Sınıf'ta biter (bugünkü kural). Başta ilk işten ve tezgâhtan önceki tek gelir; tezgâh açılınca turun ~1/12'si; İşçi'de neredeyse süs.
- **Şişenin bir amacı olsun:** ilk mesleğin şartı (ör. "temiz kıyafet $20") şişeyle karşılanır; para tek başına iş satın almaz.
- **Şans'ın cüzdanı** şimdilik "15 şişe" yerine sınıfa göre sabit tutar ya da aylık gelirin küçük bir payı; ölçümle seçilir.

## 5. Meslekler ve eşyalar (önceki karar, bu yeniden yapımın parçası)

- **Meslekler (60+):** satın alınmaz, şartla açılır. Şart türleri: önceki işte deneyim (ay), kurs (para + süre, oyun açıkken ilerler), eşya (telefon → kurye, araba → şoför, takım elbise → satış), adres (ev seviyesi), sınıf. Kariyer ekranı eksik şartı ve "Git"i gösterir (Idle Guy incelemesi §1). Maaş gerçekçi aylık; gelire % bonus yok ya da çok küçük.
- **Eşyalar:** gerçekçi sabit fiyat, gelir bonusu yok; değeri açtığı şey (iş, ev, olay, yer). Sayı artar, ama kahraman çizimi gerektirmeyenlerle: araçlar (12 → ~20), teknoloji eşyaları (telefon, dizüstü: meslek şartı), mobilya/ev eşyası, lüksler. Kıyafet poz çizimi istediği için 7'de kalır (karar 2026-10-21).
- **Gelir artışı nereden gelir:** işletme seviyeleri, şubeler, yöneticiler, maaş, kira. Çarpanlar azalır, böylece kartopu küçülür ve sayılar gerçekçi kalır. Tasmalar, fular ve yakut tasmanın %'leri sürer (IAP vaadi; [monetization-v2.md](./monetization-v2.md)).

## 6. Hanedan ve lansman kapsamı (karar 2026-10-21)

- **Burak hikâyesi kalkar:** 45 yaş ortaklık anı, annenin uyarısı, 70 yaşın iki gölge balonu, 80'deki kazık, Ada'nın yemini, 2. nesil Burak planı. Burak yalnız Lojistik'in yöneticisi (yönetici olay kartı diğer yöneticilerinki gibi kalır). Kayıttaki `partner` / `betrayal` kimlikleri silinmez, yalnız hiç oynamaz.
- **80 yaş, lansmanda:** torunun doğumu (63) ve dede ve torun (70) anları kalır (metinler kazıksız yeniden yazılır). 80'de devir oynamaz: kahraman 80'de kalır, yaş durur, "Torununun hikâyesi yakında" kartı gelir, oyun ve para sürer. Devir (torun her şeyle 17 yaşında devam eder) 2. nesil güncellemesiyle gelir.
- **Miras puanı, yadigârlar, "Şimdi devret", Aile sekmesi:** lansmanda gizli; kod ve kayıt alanları durur, 2. nesil tasarlanırken yeniden ele alınır.
- **Lumen ve Ada:** kod duruyor (`runtime/city.ts`), lansmanda kapalı (içerik bayrağı). Görsel işleri (Ada'nın kıyafetleri, Burak) bekletilir.

## 7. Mimari (SOLID)

Ekonomi saf TypeScript `core/`'da kalır (React yok); simülatör aynı çekirdeği oynar.

- **Veri ile kural ayrı (açık/kapalı ilkesi):** her işletme, seviye, şube, meslek, eşya, şart `config/` altında bir tablo satırı. Yeni işletme ya da meslek = bir satır; çekirdek kod değişmez.
- **Tek sorumluluk:** bugün 472 satırlık `formulas.ts` sistemlere bölünür: `core/economy/business.ts` (seviye, şube, tur geliri, yönetici), `career.ts`, `items.ts`, `housing.ts`, `income.ts` (gelir kaynaklarını toplar), `manual.ts` (şişe, Çalıştır).
- **Gelir kaynakları kayıt defteri:** `IncomeSource { id, perSecond(state, mode), countsInMonthly }`; işletmeler, maaş, kira birer kaynak. Yatırım ya da yeni bir kaynak eklemek toplama fonksiyonunu değiştirmez; gelir dökümü de buradan çizilir.
- **Ortak şart sistemi:** `Requirement` birleşik tipi (`experience`, `course`, `item`, `home`, `class`, `businessLevel`) ve her tür için bir değerlendirici; meslekler, eşyalar, işletmeler, olay kartları aynı şartları kullanır. Kartlarda "eksik şart + Git" tek bileşenden gelir.
- **İçerik paketleri:** `ContentPack { generation, city, businesses, homes, items, careers }`; lansman yalnız 1. nesil paketini kaydeder. 2. nesil yeni bir paket olarak eklenir, çekirdek ve kayıt yapısı değişmez.
- **Kayıt:** her şey kararlı string kimlikle (`flower-stand`, `flower-stand:lv4` değil seviye sayısı `level: 4` + kimlik), dizin sırasıyla değil. Yeni alan varsayılanla, şema yalnız `migrate()` adımıyla. Yeni ekonomi `SAVE_SCHEMA`'yı artırır; lansman öncesi test kayıtları bir kez temiz başlar (yedek `prestige_life_v2_unreadable` gibi saklanır), yayından sonra bu bir daha yapılmaz.
- **Arayüz çekirdeği bilmez:** ekranlar `core`'dan seçici fonksiyonlar okur (`businessView(state, id)` gibi), hesap yapmaz.

## 8. Kararı bekleyenler

1. Görseller GPT'de: 32 işletme aşaması ve 4 yönetici portresi ([art-prompts-businesses.md](./art-prompts-businesses.md)). Dört yeni işletmenin adları ve yöneticileri onaylandı (2026-10-21).
2. Telefonda ilk his: Çiçek Tezgâhı tablosu, şişe, deneyimle açılan meslekler.
3. Bot en ucuz kursu seçiyor; gerçek oyuncunun yolu telefonda görülmeli (kurs sayısı ve süreleri).
4. Gece Vardiyası IAP'ı (çevrimdışı %50 → %100, tavan +2 sa) yeni %20'ye göre yeniden yazılmalı ([monetization-v2.md](./monetization-v2.md) §5).

## 8b. E1'de yapılanlar (2026-10-21)

- **Model:** `BusinessState { level, branches, managed }`, `BusinessDef { levels[{cost, revenue, stage}], stageImages, branchCost, branchCostGrowth, managerCost, requires }` (`core/types.ts`, `config/businesses.ts`). Adet, ×10/Maks, kilometre taşları ve 3'lü yükseltmeler (`config/upgrades.ts`) kalktı. Çiçek Tezgâhı §3.2 tablosuyla; diğer dokuz işletme şimdilik aynı biçimden üretiliyor (açılış fiyatı + ilk aylık), E2'de her biri kendi tablosunu alacak. Şube sınırı sınıfla: açılış sınıfında 2, sonra 5, 10, 20, sonra sınırsız; şube ×1,15 pahalanır.
- **Çekirdek bölündü:** `core/economy/business.ts` (seviye, şube, tur, aşama görseli, yönetici fiyatı), `income.ts` (gelir kaynakları listesi `INCOME_SOURCES`: işletmeler, maaş, kira; toplam, çevrimdışı, gelir dökümü), `multipliers.ts`, `legacy.ts`, `manual.ts` (şişe sınıfa göre $2 / $3 / $5; Şans 15 şişe + 30 sn gelir). `formulas.ts` bunları dışa verir; ekranların içe aktarımı değişmedi.
- **Ortak şart sistemi:** `core/requirements.ts` (`class`, `home`, `item`, `businessLevel`; `isMet`, `firstUnmet`). Şimdilik işletme açılışı kullanıyor; meslek ve eşyalar E4'te.
- **Hedefler:** `level` ve `branches` hedefleri; yazılı yol yeni kimliklerle; üretilen hedefler her işletmenin 3/5/8/10. seviyesi, sonra 1/3/5/10/20/50 şube.
- **Ekran:** işletme kartında seviye adı ve "Seviye n/10", "Geliştir" düğmesinde sıradaki seviyenin adı ve fiyatı, altında "Tur $40 → $55 · kendini ~X öder", son seviyede "Yeni şube aç" ve "Şubeler 3/10" satırı (küçük dükkân simgeleri). Seviye adları TR/EN `businessLevels` (eski `upgrades`/`upgradesLumen` kalktı; Lumen'in seviye adları 2. nesille). Tarayıcıda denendi.
- **Kayıt:** `SAVE_SCHEMA` 2. Şema 1 kayıt bir kez sıfırdan başlar (yalnız mağaza alımları ve bildirim cevabı kalır), eski kayıt `prestige_life_v2_pre_rebuild`'de saklanır; betikle denendi. Seviye config'ten büyükse son seviyeye iner.
- **Analitik:** `business_level`, `business_branch` (`business_buy`, `upgrade_buy` yerine).
- **Simülatör:** bot seviye, şube ve yöneticiyi seçer; tempo hedefleri yaşa bağlandı (Orta Sınıf 21–26, Milyoner 26–35, Milyarder 50–72 yaş; Multimilyarder 70'ten önce değil, En Zengin 1. nesilde yok; ömür sonu 19.–31. gün). His kontrolü: ilk tur ≥ 5 şişe.
- **Bugünkü ölçüm (E2'den önce, beklenen):** ekonomi çok hızlı. Bağlı bot: ilk işletme 7 dk 48 sn (hedef 2–6; ilk iş maaşı hâlâ $0,11/sn), Orta Sınıf 40 dk (19 yaş), Milyoner 47 dk, Milyarder 1 sa 15 dk (21 yaş), En Zengin 26 yaşta. Nedeni: meslekler ve eşyalar eski sayılarda (kariyer ve statü çarpanları), işletme merdiveni cömert. E2 bunları birlikte ayarlar.
- **Kalan (E5'e taşındı):** içerik paketleri (`ContentPack`) ve lansman bayrakları, 2. nesil gizlenirken yapılır.

## 8c. E2'de yapılanlar (2026-10-21)

**Ölçümün ana bulgusu:** %50 çevrimdışı ve 2 saat tavanla paranın %76'sı oyun kapalıyken geliyordu. Yaş yalnız oyun açıkken aktığı için gerçekçi takvim fiilen 4 kat hızlı işliyordu; işletmeleri ne kadar yavaşlatsam Milyarder 35 yaşta kalıyordu. Kullanıcı %20 ve 1 saati seçti; şimdi paranın %42'si çevrimdışından.

| Ayar | Önce | Şimdi |
| --- | --- | --- |
| Çevrimdışı oran / tavan | %50 / 10 dk → 2 sa | %20 / 10 dk, 15 dk, 30 dk, 30 dk, Milyoner'den 1 sa |
| Gündelikçi eşiği | $1K | $2K (gerçek maaşla $1K ilk tezgâh çalışmadan geliyordu) |
| Meslekler | satın alınır, +%5–25 gelir | önceki işte deneyimle açılır (3 → 60 ay, toplam ~21 yıl), küçük bedel ($20 → $60K), gerçek aylık maaş ($300 → $60K), bonus yok |
| Eşyalar | geometrik fiyat, +%3,75–10 gelir | gerçek fiyat, bonus yok: bisiklet $150 → grand lüks $1,5M; kıyafet $60 → $15K; tekne $300K, yat $10M, helikopter $15M, jet $60M |
| Evler | taşınma $1,2K → $20B, +%8 / kademe | taşınma $500 → $3,2M (satın alma ×25: ilk kendi ev $300K, büyük malikâne $80M), bonus yok; kira fiyatın 200 ayda geri dönüşü |
| İşletmeler | 10 | 14 (yeni: Restoran, Emlak Ofisi, İnşaat, Medya); açılış $1K → $1B, ilk seviyenin geri dönüşü 1,25 → 360 ay |
| Şube | son seviye fiyatı, ×1,15 | bütün seviyelerin toplamı (sıfırdan mağaza), ×1,4; sınır açılış sınıfında 1, sonra 2, 4, 8, 16, 32 |
| Yönetici | açılışın 3 katı | 4 katı; Rıza Amca $5K |
| Günlük ödül | ×5 → ×50 ay | ×2 → ×20 ay (2. haftadan ×6, 7. gün ×20) |
| Yatırım tavanı | 60 aylık gelir | 24 aylık gelir |

**Simülatör (bağlı oyuncu, bütün hedefler tutuyor):** ilk iş 20 sn, ilk işletme 3 dk 11 sn, Gündelikçi 4 dk 37 sn, ilk yönetici 9 dk, İşçi 33 dk, Orta Sınıf 1 sa 12 dk (21 yaş), Milyoner 2 sa 29 dk (26), Milyarder 13 sa 58 dk (69, 20. gün), Multimilyarder ve En Zengin 1. nesilde yok, ömür sonu 24. gün. Gündelik oyuncu: Milyoner 23, Milyarder 56 yaş (42. gün). Reklam izleyen: Milyoner 23, Milyarder 53 yaş. İşletmeler yaklaşık 1–2 saatte bir açılıyor (Fabrika 6 sa 44 dk); Fabrika'dan Medya'ya ~8,5 saat yeni işletme yok, Teknoloji 1. nesilde açılmıyor (torunla). Para: çevrimdışı %42, yatırım %9, günlük ödül %6.

**Bilinen eksikler:** 13 işletmenin seviye tablosu hâlâ Çiçek Tezgâhı'nın biçiminden üretiliyor (her işletmeye kendi karakteri E3/E4'te); Çiçek Tezgâhı ilk saatlerde gelirin %60–85'i (ucuz şubeleri); Milyarder 69 yaşla aralığın üst ucunda.

## 8d. E3'te yapılanlar (2026-10-21)

- **İşletme kartı:** ad satırının altında 10 nokta (alınan seviyeler turuncu; yeni görünümün başladığı 8. ve 10. seviye büyük nokta) ve sıradaki görünüm ("Seviye 8: Küçük dükkân"). Geri dönüş oyunun takvimiyle yazılıyor ("kendini ~22 ayda öder", 24 aydan sonra yıl). 8. ve 10. seviyede "{işletme} büyüdü!" kartı: yeni görünümün resmi, seviyenin adı, tur öncesi → sonrası.
- **Aşama görselleri:** `config/businesses.ts` `STAGE_ART` (işletme başına çizilmiş aşama sayısı; dosyalar `{id}.webp`, `{id}-2.webp`, `{id}-3.webp`), görseli olmayan aşama bir öncekini gösterir. Komutlar [art-prompts-businesses.md](./art-prompts-businesses.md); mevcut 10 ikon 1. aşama.
- **E4'e kalanlar:** kariyerde deneyim dışındaki şartlar ve "Git", mağazada "neyi açar" (eşyalar henüz bir şey açmıyor).

## 8e. E4'te yapılanlar (2026-10-21)

- **63 meslek, 9 alan** (`config/careers.ts`): başlangıç (el ilanı), yemek ve konaklama (8), satış (8), ulaşım ve lojistik (9), teknoloji (8), ofis ve finans (7), inşaat ve zanaat (7), medya (7), sağlık (7), zirve (CEO: herhangi bir alanın direktörlüğünden). Maaş gerçek aylık ($300 → $60K), küçük bedel ($20 → $20K), gelir bonusu yok. Aynı anda tek iş; işler arasında serbest geçiş, önceki işlerdeki aylar deneyim olarak kalır.
- **Şartlar** (`core/requirements.ts`): bir işte N ay (`job`, şimdiki ya da eski iş), kurs (`course`), eşya (`item`: telefon, alet çantası, fotoğraf makinesi, dizüstü, iş kıyafeti, bisiklet, skuter, emektar sedan), adres (`home`: kiralık oda ve üstü), sınıf, işletme seviyesi, "şunlardan biri" (`anyOf`). Eski "şimdiki işte deneyim" şartı kalktı.
- **16 kurs** (`config/courses.ts`): ilk yardım (1 ay, $300) → tıp fakültesi (72 ay, $150K); aynı anda tek kurs, para baştan, oyun açıkken ilerler (yaş gibi). Ağır vasıta ehliyeti ehliyet ister.
- **4 meslek açan eşya** (`gadget` türü, mağazada yeni "Eşyalar" sekmesi; sıra yok, hepsi bir listede).
- **Kariyer ekranı = iş panosu:** şimdiki iş ve bu işteki ay, süren kurs (çubuk, kalan ay), "Girebileceğin işler" (şartları tamam ve daha çok kazandıran; satır ve "İşe gir"), "Hedefindeki işler" (en çok 6; şart listesi ✓ / ○, deneyimde "7/12", eşya, kurs ve adreste "Git"), kurslar (kaç ay, "Açar: …", "Başla"), "Bütün meslekler" alanlara göre. Kariyer düğmesinde "!" daha iyi bir iş alınabilir olunca.
- **Mağazada "Açar: …":** sıradaki araç, kıyafet, ev ve her eşya hangi meslekleri açtığını söylüyor.
- **Kayıt:** `careerId` (eski `careerIndex` eski 12 basamağa eşlenir), `jobSeconds` (iş başına oynanan saniye), `coursesDone`, `course`; bilinmeyen kimlikler düşer, süren kursun parası ödendiği için kurs kaybolmaz. Betikle denendi.
- **Hedefler:** iş hedefleri kimlikle (`job-1` el ilanı, `job-2` bulaşıkçı, `job-4` garson); analitik `job_take`, `course_start` (`promotion` yerine).
- **Simülatör:** bot daha çok kazandıran ve eksiği yalnız eşya olan işi eşyasıyla alır; kurs yokken daha iyi bir iş açan en ucuz kursu başlatır. Bağlı oyuncunun bütün hedefleri tutuyor: ilk yönetici 12 dk 49 sn, Orta Sınıf 1 sa 11 dk (21 yaş), Milyoner 2 sa 28 dk (26), Milyarder 14 sa 9 dk (70); bot 29 iş ve kurs adımı atıyor, 7 sa 12 dk oyunda (44 yaş) CEO.
- **Görseller:** 51 meslek ve 4 eşya ikonu GPT'yi bekliyor ([art-prompts-jobs.md](./art-prompts-jobs.md)); şimdilik kariyer ve mağaza simgesi.
- **Yapılmayan:** araç sayısı 12'de kaldı (yeni araç sahne kesimi ve ev–araç zinciri ister); eşyalar meslek dışında bir şey (olay, yer) açmıyor.

## 9. Sıra (Faz E)

1. **E0:** kararlar ve bu belge (2026-10-20/21).
2. **E1 çekirdek (yapıldı 2026-10-21, §8b):** `core/economy/` bölünmesi, şart sistemi, işletme seviye/şube modeli, gelir kaynakları; simülatör yeni modele; yeni tempo hedefleri.
3. **E2 sayılar (yapıldı 2026-10-21, §8c):** Çiçek Tezgâhı'ndan başlayarak bütün işletmelerin seviye tabloları, şişe, Şans, çevrimdışı; `npm run sim` ile.
4. **E3 arayüz (yapıldı 2026-10-21, §8d; görseller GPT'de):** işletme kartı (seviye, aşama görseli, şube satırı), kariyer ekranı (şartlar + Git), mağaza (sabit fiyat, "neyi açar").
5. **E4 meslekler ve eşyalar (yapıldı 2026-10-21, §8e; ikonlar GPT'de):** 60+ meslek tablosu, eşya listesi, kurslar.
6. **E5 hanedan:** Burak hikâyesinin kaldırılması, 63/70 metinleri, gizlenen sistemler, 80'de "yakında" kartı, içerik paketleri ve lansman bayrakları.
7. **E6 bütünleme:** hedefler (quests), hayaller panosu, olay kartı ödülleri, günlük ödül ve yatırım tutarları yeni ölçeğe; belgeler yeniden yazılır; telefonda test; lansman.
