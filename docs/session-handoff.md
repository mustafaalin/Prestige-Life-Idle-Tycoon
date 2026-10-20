# Session Handoff

Son güncelleme: 2026-10-17 · Dal: `v2-rebuild` · Son sürüm: **AAB 29** (`versionCode` 29, `versionName` 2.0; Play'de, telefonda test ediliyor)

Yeni bir oturumda projeye hızlı dönmek için güncel durum. Oyun v2 olarak yeniden yapılıyor; v1 dondu ve Faz 2.11'de kaldırılacak. Bu belge günlük tutmaz: her oturum sonunda **güncel durumu yansıtacak şekilde yeniden yazılır**. Kararların gerekçesi ve sayılar ilgili belgededir; burada yalnızca özet ve yapılacaklar durur.

## Belgeler

| Belge | Soru | Not |
| --- | --- | --- |
| [game-design-v2.md](./game-design-v2.md) | **Ne?** Kurallar ve sayılar | Tek doğruluk kaynağı; rapordan sapmalar §9 |
| [story-v2.md](./story-v2.md) | Hikâye, karakterler, ton, metinler, görsel stil kılavuzu | |
| [monetization-v2.md](./monetization-v2.md) | Reklam ve IAP | Ürünler, mağaza kurulumu, veri güvenliği beyanı, destek akışı |
| [rebuild-plan.md](./rebuild-plan.md) | **Ne zaman?** Fazlar ve görevler | Yapılanlar işaretli |
| [discussion-notes.md](./discussion-notes.md) | Kararı bekleyen konular | Yalnızca açık konular |
| [economy-rebuild.md](./archive/economy-rebuild.md) | Ekonominin yeniden kurulması: kararlar, işletme seviye + şube modeli, mimari | Yön kararlaştı, sayılar öneri (2026-10-20) |
| [engagement-strategy-v2.md](./engagement-strategy-v2.md) | Oyuncuyu oyunda tutma: boş oturum ölçümü ve öneriler | Claude + GPT birleşik öneri, karar bekliyor (2026-10-20); GPT'nin raporu `research/` |
| [art-brief-v2.md](./art-brief-v2.md) | Görsel listesi, boyutlar, oyuna bağlama | |
| [art-prompts-v2.md](./art-prompts-v2.md) | GPT'ye yapıştırılacak, üretilmeyi bekleyen komutlar | Şu an yeni uygulama ikonu ve özellik grafiği (2şer aday), önsözün 3D'deki beş karesi; 1. neslin bitmiş komutları [archive/art-prompts-v2-gen1.md](./archive/art-prompts-v2-gen1.md) |
| [art-prompts-burak.md](./art-prompts-burak.md) | Burak hattının görselleri: kılavuz, ortaklık ve kazık kareleri | Anahtar karesi yetişkin Ada'yı bekliyor |
| [art-prompts-jobs.md](./art-prompts-jobs.md) | 51 meslek ve 4 eşya ikonu | GPT'yi bekliyor (2026-10-21) |
| [art-prompts-businesses.md](./art-prompts-businesses.md) | İşletmelerin 2. ve 3. aşaması, 4 yeni işletme ve yöneticileri: 36 GPT komutu | GPT'yi bekliyor (2026-10-21) |
| [art-prompts-ada.md](./art-prompts-ada.md) | Ada'nın (2. nesil kahramanı) 7 kıyafeti: kılavuz, poz ve portre şablonları | GPT'yi bekliyor (2026-10-17) |
| [art-prompts-lumen.md](./art-prompts-lumen.md) | 2. neslin şehri Lumen: yöneticiler, evler, işletmeler, araçlar, lüksler için GPT komutları | 46 görsel oyunda (2026-10-17); pikap yeniden üretilecek |
| [audio-v2.md](./audio-v2.md) | Ses efektleri ve müzik: liste, kurallar, kaynaklar | Oyunda (2026-10-17) |
| [mobile-ad-integration.md](./mobile-ad-integration.md) | v2 reklam altyapısı | |
| [report-v2.md](./report-v2.md) | **Neden?** | Değişmez; tasarım belgesiyle çelişirse tasarım geçerli |
| [archive/](./archive/) | Bitmiş teslimler ve incelemeler | Yalnızca geçmiş için |
| [v1/](./v1/) | v1 arşivi | v2 işinde okunmaz |

## Oyunda olanlar (özet)

Ayrıntılar tasarım ve hikâye belgelerinde. AAB 28 telefonda denendi (bulgular AAB 29'da düzeltildi), AAB 29 Play'de test ediliyor; 2026-10-15 akşamından sonraki işler (aile, devir, Burak, Lumen, ses, dikey sütun) henüz hiçbir sürümde yok (aşağıda "Telefonda test listesi").

- **Ekonomi:** 10 işletme (+ yükseltmeler, yöneticiler), 12 basamak kariyer, 8 sınıf, 12 ev (kirala → satın al → kiraya ver), 12 araç (ev–araç zinciri), 7 kıyafet, 4 lüks, Şans'ın tasmaları (deri %2, gümüş %4, altın %6), yaş ve ömür (17 → 80, ~17 saatlik oyun), miras, hedefler, Zenginler Listesi. `npm run sim` tempo ve his hedefleri.
- **Hikâye:** önsöz (6 kare), 7 sınıf töreni (hepsinin kendi karesi), tasma kartı, annenin 11 mesajı, yaşa bağlı 3 hayat anı, 4 lüks anı, 10 olay kartı, Zenginler Listesi'nin 6 kartı, aile albümü, emeklilik paneli. Kapanış kartında ve hayat anlarında hediye (10 dk gelir, reklamla ×2).
- **Ana ekran:** oturulan ev ve önünde araç, kahraman (kıyafetine göre pozlar), Şans (cüzdan getirir, tasması sınıfı izler), yerden toplama (Orta Sınıf'ta biter), solda üstte yuvarlak hedef rozeti (ilerleme halkası; biten hedefte yeşil halka, "!" ve yanında "Topla"; dokununca tüm hedefler açılır, 8 sn sonra kapanır), üst bardaki paraya dokununca gelir dökümü (`ui/home/IncomeSheet.tsx`, `incomeBreakdown()`), solda albüm / Zenginler Listesi / Mağaza, sağda ×2 hızlandırıcı. Rıza Amca rehberi.
- **Hayaller panosu:** alt menünün üstünde sıradaki ev, araç ve kıyafet, yüzdeyle; dokununca Alışveriş o eşyada açılır (plan 1.8).
- **Yatırım (Rıza Amca'nın fırsatları):** 1 / 4 / 8 saatlik vade, cesur vadede +%70 ya da −%20, en fazla 5 yıllık gelir, Orta Sınıf'ta açılır; alt menüde 4. düğme, öncesinde kilitli (game-design §4.14). DEV → "Yatırımı hemen bitir".
- **Günlük ödül:** aylık gelirin katı (×5 → ×50), 7 günlük takvim, cezasız, reklamla ×2 (game-design §4.13). DEV → "Günlük ödülü tekrar ver".
- **Para:** 6 ödüllü reklam yeri (çevrimdışı +%30, Şans ×2, 1 saatlik ×2, biraz yardım, hediye ×2, günlük ödül ×2); Mağaza ve 3 ürün (Rahat Paket $7,99; Başlangıç Paketi $2,99, ilk 3 gün hoş geldin fiyatı $1,49); geri yükleme; Play puanlama penceresi (Milyoner'den sonra).
- **Altyapı:** kayıt Preferences'ta, Android geri tuşu, güvenli alanlar, yerel bildirimler, Firebase Analytics, TR + EN.

## Son oturum (2026-10-16 → 17)

- **Ekran düzeni ve yön (2026-10-17):** oyun yalnız dikey. Android: `screenOrientation="portrait"` + `appCategory="game"` (Android 16+ büyük ekranlarda yön kilidini yok sayar, oyunlar muaf) + API 36 için `PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY`; iOS: iPhone ve iPad yalnız dikey, `UIRequiresFullScreen`. Kilitler ileride kalkabileceği için (API 37, iPadOS 26 sonrası) oyun her durumda dikey bir sütunda çizilir: telefonda tam genişlik, tablet, katlanır ve masaüstünde en çok yüksekliğin 0,6'sı kadar genişlikte ortada, yanlarda oturulan evin bulanık hâli (`mobile.css` `.v2-stage`, `--stage-w`; bütün açılır kartlar `ui/stage.ts` `portalRoot()` ile sütunun içine). Kısa yatay pencerede "telefonunu dik tut" uyarısı. 13 ekran boyutunda ölçüldü (320×568 → 1024×1366, yatay tablet ve telefon): kesilen yazı ya da taşan öğe yok. Düzeltilenler: alt menü yazıları 360 px telefonlarda kesiliyordu (yazı boyu sütunla ölçeklenir), çok uzun telefonlarda kenardaki şişeler ekran dışına düşüyordu (artık ekran içinde tutulur). Telefonda ve gerçek tablette denenmedi.

- **Lumen oyunda (2026-10-17):** çift nesiller Lumen'de oynar. Lumen aynı kimliklerin üstünde bir kaplama (`runtime/city.ts`): işletme, ev, araç ve lüksün kimliği, fiyatı ve kayıttaki yeri aynı; adı (TR/EN), resmi, yöneticisi (yeni 10 kişi, sözleriyle), yükseltme adları ve sahne yerleşimi şehre göre. Kayıt değişmedi. DEV → "Şehir (önizleme)" ile her iki şehre bakılır. Eksikler: Ada'nın görselleri (Lumen'de hâlâ ilk kahraman görünüyor), Lumen'in olay kartları (şimdilik eski şehrin kişileri arıyor), Lumen ev yerleşimlerinin telefonda ayarı, pikabın yeniden üretimi.

- **Ses ve müzik (2026-10-17):** 14 yeni efekt (ElevenLabs) ve 4 müzik (ana ekran, işletme/yatırım, hikâye, olay kartı) oyunda; Ayarlar'da iki anahtar. Ayrıntı [audio-v2.md](./audio-v2.md). Tarayıcıda müzik geçişleri denendi, telefonda denenmedi.

- **Hikâye düzeltmeleri (2026-10-17):** Milyoner töreninde Rıza saati verir ("Bu saat babanındı..."), devirdeki saat artık bir yerden geliyor. Lüks anlarında yaş: helikopterde "biri el sallıyor"; jette Rıza ve Nevin yerine Defne ve Elif konuşuyor, yeni aile karesi oyunda (`public/assets/story/life/jet.webp`, albümde de).

- **Burak hattı (1. nesil) oyunda, görselsiz:** 45 yaşta ortaklık anı, annenin uyarısı, 70 yaş anında iki gölge balonu, 80'de devirden önce kazık anı, devirde Ada'nın yemini ([story-v2.md §6a](./story-v2.md)). Burak isim etiketiyle konuşur; kılavuz ve iki kare GPT'yi bekliyor ([art-prompts-burak.md](./art-prompts-burak.md)). Simülatör: hedefler aynı. DEV → "Hayat anını oynat" `partner` / `betrayal`.

GPT devir görsellerini üretirken (komutlar [art-prompts-dynasty.md](./art-prompts-dynasty.md)) görselden bağımsız işler yapıldı. Tarayıcıda denendi, telefonda denenmedi.

- **Devir hikâye anları:** 63 (torunun doğumu, adını Elif sorar, varsayılan Ada), 70 (dede ve torun, çiçek tezgâhı), 80 ("Babamın saati", otogar). Metinler [story-v2.md §4c](./story-v2.md). "Şimdi devret" Aile sekmesini kapatır, "Yıllar geçti…" ekranı yaşı 80'e sayar, sonra anlar arka arkaya oynar; emeklilik paneli anlar ve isim bitince açılır. Paneldeki yeni etiket: "Varisin: Ada". Kayıtta yeni alan `story.grandchildName` (varsayılan `''`).
- **Görseller gelene kadar:** anlar sahnenin üstünde portresiz oynar, dede smokinli kahramanın yüzüyle konuşur. Görseller gelince bekleme listelerinden çıkarılacak ([art-prompts-dynasty.md §6](./art-prompts-dynasty.md)). Dede sahne görünümünün kodu hazır (60+, yalnız 1. nesil).
- **Bildirimler (plan 2.8):** "Günlük ödül hazır" ve ömür sonunda varisin mesajı; günde bir kuralı öncelik sırasıyla.
- **Küçük sorunlar:** 320 px'de para artık kısalmıyor (dar ekranda küçük yazı, uzun sınıf adı iki satır), çevrimdışı kartının paraları inmeden sıradaki kart açılmıyor, "OTOMATİK" rozeti 4 px sola alındı, v1'in `icons/` ve `vehicles/` PNG'leri v2 paketine girmiyor (`vite.config.ts`).
- Simülatör: 63 ve 70 yaş hediyeleri miras puanını ~%1 artırdı; kaçan tek hedef öncekiyle aynı.

## Önceki oturum (2026-10-14 → 15)

- **Şans'ın tasmaları gelir veriyor:** deri / gümüş / altın %2 / %4 / %6, yalnız takılı olan; törende "Şans'ın yeni tasması!" kartı (önce / şimdi, +%0 → +%2). Gümüş tasma görselleri oyunda; yakut tasmanın üç görseli hazır (`public/assets/scene/sans-*-ruby.webp`).
- **Fular kalıcı +%10**, ücretli aksesuarlar ayrı çarpan (`GameStateV2.accessoryMultiplier`, satın almalardan her açılışta hesaplanır).
- **Yakut Tasma +%50** (kalıcı ×2'nin yerine; altın tasma artık bedava): ürün 2. adımda.
- **Başlangıç Paketi:** ilk 3 gün $1,49 (`v2_starter_pack_welcome`), sonra $2,99 ve hep satışta; "%50 indirim" yerine "Hoş geldin fiyatı · Sonra $2,99".
- **Hedef kartı yuvarlak rozete döndü:** ince kart da evi kapatıyordu.
- **Gelir dökümü:** aylık gelire dokununca kaynaklar (yöneticili işletmeler, maaş, kira) ve bonuslar (kariyer, ev, tasma, araç/kıyafet/lüks, aile itibarı, fular, ×2) görünür.
- **Olay kartında gerçek risk:** tutmayan cesur cevap 20 sn'lik geliri alır (+130 / −20, ortalama aynı; game-design §4.7); kayıp düğmede kırmızı yazar, kapanınca paralar cüzdandan dökülür. Kayıp cümleleri paranın nereye gittiğini söyler. Arama düğmesi telefon gibi titrer.
- **Tekne anı yeni kare:** mağazadaki sürat teknesinin aynısı.
- **Simülatör:** "fular" ve "reklam + fular + yakut" profilleri; Milyarder hedefinin alt sınırı 2. gün 20:00 (gümüş tasma yüzünden; kullanıcı kabul etti).
- **Belgeler toparlandı:** bitmiş teslimler `archive/`'e taşındı, eskimiş yerler güncellendi, açık konular [discussion-notes.md](./discussion-notes.md)'de.
- **AAB 29 yeniden derlendi (2026-10-15):** `~/Downloads/prestige-life-v2-29.aab` (41 MB, imzası doğrulandı, DEV menüsü ve test reklamı kapalı). İlk AAB 29 Play Console'a yüklenmemişti, kod 29'da kaldı; bu dosya günlük ödül, yatırım ve hayaller panosunu da içeriyor. Telefona kurulup denenmedi.

## Sıradaki

0. **Ekonominin yeniden kurulması (karar 2026-10-20, öncelikli; plan Faz E, [economy-rebuild.md](./archive/economy-rebuild.md)):** lansman yalnız 1. nesil; Burak hikâyesi kalkıyor (yalnız yönetici); lansmanda kahraman 80'de kalır, devir 2. nesille; miras/yadigâr gizli; gerçekçi takvim; işletmeler seviye + şube; meslekler şartla, eşyalar gerçek fiyatla. E1 (çekirdek) yapıldı 2026-10-21 (economy-rebuild §8b): işletmeler seviye + şube, kayıt şeması 2 (eski kayıt bir kez temiz başlar), yaşa bağlı tempo hedefleri; E2 (sayılar) yapıldı (§8c): 14 işletme, gerçek maaş ve fiyatlar, deneyimle açılan meslekler, çevrimdışı %20 / 1 sa; yaşa bağlı tempo hedeflerinin hepsi tutuyor. E3'ün kodu yapıldı (§8d); 36 görselin komutları [art-prompts-businesses.md](./art-prompts-businesses.md)'de, GPT'yi bekliyor. E4 yapıldı (§8e): 63 meslek, 16 kurs, 4 eşya, iş panosu; 55 ikonun komutları [art-prompts-jobs.md](./art-prompts-jobs.md). E5 yapıldı (§8f): içerik bayrakları (`config/content.ts`), Burak hikâyesi oynamaz, 80'de "Torununun hikâyesi yakında", Aile sekmesi ve miras gizli. Sıradaki: E6 (bütünleme: hedefler, hayaller panosu, olay kartı ve ödül tutarları, belgelerin yeniden yazılması, telefonda test). Aşağıdaki 2. nesil işleri (madde 4, GPT işleri 3–4) bekletiliyor.
1. **AAB 29 testi sürüyor (kullanıcı):** aşağıdaki listenin A bölümü. Bulgular gelince düzeltilir.
2. **AAB 30:** 2026-10-15 akşamından bu yana yapılanlar (yadigârlar ve Aile sekmesi, devir anları ve görselleri, Burak hattı, işletmelerin sınıfla açılması, Lumen, ses ve müzik, dikey sütun) + AAB 29 bulguları. `versionCode` 30'a çekildi. Uygulama ikonu ve açılış ekranı v2'nin (2026-10-17): `node scripts/android-art.mjs` ikonu `art/store-v2/icon-1024.png`'den, açılışı sokak sahnesinden (kahraman, Şans, ad) üretir; zemin `#1A1446`. Derleme GPT görselleri bağlanınca.
3. **Kapalı test:** 14 gün ~2026-10-20'de doluyor; sonra Play'den üretim erişimi başvurusu.
4. **GPT işleri** (aşağıda) ve 2. nesil içeriği (plan 2.3): Ada'nın görselleri, 2. neslin tören ve rehber metinleri, Lumen olay kartları, Zenginler Listesi'nde Burak. Lansman kapsamı (2. nesil lansmanda mı, ilk güncellemede mi) kullanıcının kararı.
5. Sonra Yakut Tasma ve Gece Vardiyası (IAP 2. adım), Remote Config (2.10), Crashlytics.

## GPT işleri (2026-10-17)

Sırayla; kullanıcı dördünü de GPT'ye verdi (2026-10-17), oyuna bağlama Claude'un.

1. **Jet anı, aile karesi** (1): oyunda (2026-10-17; `public/assets/story/life/jet.webp`, kaynak `art/pilot/10-life/life-jet-family.png`).
2. **Lumen pikabı** (1): [art-prompts-lumen.md §4.1](./art-prompts-lumen.md).
3. **Burak** (kılavuz + 2 kare): [art-prompts-burak.md](./art-prompts-burak.md), belgedeki tek görünümle. Hikâyede yaşlara girilmez (kullanıcı, 2026-10-17).
4. **Ada'nın 7 kıyafeti** (6 kılavuz, 21 poz, 28 portre): [art-prompts-ada.md](./art-prompts-ada.md). En büyük iş; 2. nesil bunsuz ilk kahramanla oynuyor.

Bekleyen kararlar (GPT'ye gitmeden): okşama pozunda fular/tasma ([discussion-notes.md §1](./discussion-notes.md)), önsözün 3D'ye geçmesi (deneme karesi hazır).

## Kullanıcının yapacakları

- **Play Console:**
  - AAB 29 dahili testte (2026-10-17); sonra kapalı test.
  - Mağaza sayfası: **web sitesi `https://mathgamesstudio.com`** (AdMob `app-ads.txt`'yi bu adresten okur), **gizlilik politikası `https://mathgamesstudio.com/games/prestige-life/privacy`**.
  - Başlangıç Paketi açıklamasına fuların bonusu (metin [monetization-v2.md §8](./monetization-v2.md) "Mağaza kurulumu").
  - Veri güvenliği beyanı v2'ye göre (cevaplar [monetization-v2.md §7](./monetization-v2.md)).
  - v1'in 8 ürününü pasifleştirmek.
  - Ürünler tanımlı (2026-10-15): `v2_comfort_pack` $7,99, `v2_starter_pack` $2,99, `v2_starter_pack_welcome` $1,49; RevenueCat'te üçü non-consumable.
  - Mağaza görselleri yenilendi (2026-10-17): 6 ekran × TR/EN (sokak, söz, işletmeler, zengin hayatı, Zenginler Listesi, aile albümü), özellik grafiği (sokak → villa; sağda kahramanın arkasında süper araba, yanında altın tasmalı Şans, yerde para yok), ikon 512 (yeni ikon bekliyor: iki aday GPT komutu [art-prompts-v2.md §1](./art-prompts-v2.md)); `~/Downloads/play-store-v2/` (eskiler `eski-2026-10-09/`). Kaynak `art/store-v2/` (`capture.mjs` önizleme derlemesinden çeker, DEV menüsü kapalı: `VITE_DEV_MENU=false npm run build:v2`, `vite preview --mode v2 --port 5198`; `compose.mjs` çerçeveler, `feature.mjs` grafik; `playwright-core` projede yok, yerel bir kopya gerekir).
- **AdMob:** `app-ads.txt` sitede yayında (2026-10-17, `google.com, pub-8950990027285549, DIRECT, f08c47fec0942fa0`); Play'de web sitesi girildikten sonra AdMob → Uygulamalar → app-ads.txt sekmesinde doğrulanır (24 saate kadar sürebilir). Ayarlar → Test cihazları'na telefon.
- **Test kullanıcısı listesi:** Faz 1 oyun testi için 20–50 kişi.

## Telefonda test listesi

Kurulum: dahili testten (Play sürümü) ya da `npm run phone -- --install` (DEV sürümü, ayrı uygulama "Prestige DEV"). Bulgular gelince madde buradan silinir.

**Denendi, sorun yok (AAB 28–29, kullanıcı):** güncellemede kayıt, mağaza ve yerel para birimi, Başlangıç Paketi'nin ödülleri, tören hediyesi ve Rahat Paket'le "Hemen al ×2", kıyafetlerin sınıf kilidi, akıcılık ve ısınma, TR/EN metinler, bildirimler (2026-10-17).

### A. AAB 29'da (şimdi)

1. **AAB 28'den kalanlar:** geri tuşu ("bir kez daha bas"), alımdan sonra sayfanın kapanıp sevinç ve aracın gelişi, yanıp sönen "!" (alt menü ve Alışveriş sekmeleri), ×2 hızlandırıcı yazısı, ödülün ekranda yarım saniye durması.
2. **Orta Sınıf:** "Şans'ın yeni tasması!" kartı (+%0 → +%2), sahnede deri tasma, gelir dökümünde tasma satırı; yerden toplamanın bitişi; **olay kartları** (çağrı titremesi, iki cevap, kayıpta paraların dökülmesi, kapat-aç sonrası bakiye); **yatırım** düğmesinin açılması, üç vade, vade bitince "!".
3. **Milyoner:** törende Rıza'nın fotoğrafı tanıması, gümüş tasma (+%4), ilk kendi evin; **Play puanlama penceresi** Milyoner'den sonraki ikinci oturumda (çıkmazsa Google'ın sıklık sınırı olabilir).
4. **Milyarder ve sonrası:** Bülent Bey ve Otel hediyesi, altın tasma (+%6), Zenginler Listesi'ne giriş kartı ve liste sayfası, lüks alımında hayat anı ve albüm.
5. **Yaşa bağlı anlar:** 25 / 28 / 31 (ilk buluşma, düğün, kızın adı), annenin Defne mesajı.
6. **Günlük ödül:** ertesi gün çevrimdışı kartından sonra, ×2 reklamı, uygulamayı kapatıp açınca aynı tutar.
7. **Hayaller panosu:** şişelerin ve kahramanın ayaklarının menünün altında kalmaması, "Al!" ve kilit, dokununca doğru sekme.
8. **Para:** Başlangıç Paketi'nin hoş geldin fiyatının 3 gün sonra $2,99'a dönmesi ve kırmızı noktanın kaybolması, uygulamayı silip "Satın alımları geri yükle", Rahat Paket'le 10 dakikadan uzun ayrılıkta "Hemen al +%30".
9. **Ana ekran:** yuvarlak hedef rozeti evi kapatıyor mu, gelir dökümü (aylık gelire dokununca).

### B. AAB 30 gelince

1. **Dikey sütun:** tablette ve katlanırda ortada dikey oyun, yanlarda bulanık ev; telefonu yan çevirince oyunun dönmemesi.
2. **Ses ve müzik:** dört müziğin geçişleri (ana ekran, işletme/yatırım, hikâye, olay kartı), efektler, Ayarlar'daki iki anahtar, uygulama arka plandayken sesin susması.
3. **İşletmelerin sınıfla açılması:** adet sınırları 10 / 25 / 50, kilitli işletmenin yazısı.
4. **En Zengin ve devir:** Aile sekmesi, yadigâr alımı, "Şimdi devret" → "Yıllar geçti…", 63 / 70 / 80 anları ve görselleri, torunun adı, Burak'ın ortaklık ve kazık anları, emeklilik paneli. Gerçek oyunda En Zengin'e ulaşmak günler sürer; DEV sürümüyle denenir.
5. **Lumen (2. nesil):** evlerin yerleşimi, araç boyları, yöneticiler. Ada'nın görselleri gelene kadar sahnede ilk kahraman var.
6. **Bildirimler:** "Günlük ödül hazır" ve ömür sonunda varisin mesajı.

## Kurallar

**Kayıt uyumluluğu (kullanıcı, 2026-10-14):** yayından sonra her güncelleme oyuncunun kaydını korumalı. Kod `src/game/runtime/storage.ts`.

- **Kimlikler değişmez:** kayıtta duran bir id (işletme, eşya, ev, hedef, yükseltme, an, mağaza ürünü) yeniden adlandırılmaz, silinmez; gerekirse eskisi yenisine eşlenir (`legacyOutfitIndex`, `legacyVehicleCount`, `LEGACY_HOUSE_TO_HOME`).
- **Yeni alan varsayılanla gelir:** `normalize*()` her alanı tek tek okur; yeni sistem eski oyuncuya bir anda onlarca kart ya da tören yaşatmaz.
- **Alınmış olan geri alınmaz:** kural sıkılaşsa da sahip olunan kalır; sınıf hediyeleri `applyClassFloors` ile eksikse verilir.
- **Şema:** `SAVE_SCHEMA` yalnızca `migrate()`'e adım eklenerek artırılır; okunamayan kayıt `prestige_life_v2_unreadable`'a yedeklenir.
- **Kayıt anahtarı** `prestige_life_v2` ve uygulama kimliği değişmez.
- **Denetim:** kaydı etkileyen her değişiklikte eski bir kayıtla açılış denenir (DEV kaydı ya da betikle `parseRuntime`).

**Ekran kuralı (2026-10-17):** yeni bir açılır kart `createPortal(..., portalRoot())` kullanır (`document.body` değil); ekrandan ölçülen nokta (getBoundingClientRect) sütuna `toStage()` ile çevrilir; `vw` yerine `var(--stage-w)`.

**Bilinen küçük sorunlar:** listedekiler 2026-10-16'da düzeltildi; "OTOMATİK" rozeti ile 320 px üst bar telefonda bir kez görülmeli.

## Çalıştırma

- `npm run dev:v2` (tarayıcıda DEV menüsü açık); `npm run sim`; `npm run typecheck`; `npx eslint src/game`.
- **Telefon:** `npm run phone` (Android, kablosuz ya da USB; port değişince `-- PORT`, yerel eklenti değişince `-- --install`). DEV sürümü ayrı uygulama: `com.prestigelife.idletycoon.dev`, "Prestige DEV", kendi kaydı var, Play sürümünün yanında durur. Kullanıcının telefonu Samsung Galaxy S24+ (Android 16). Gradle için `JAVA_HOME` Android Studio'nun Java 21'i.
- **Kod:** `src/game/` (çekirdek `core/`, simülatör `sim/`, `runtime/`, `i18n/`, `ui/`). Mimari [rebuild-plan.md](./rebuild-plan.md).
- **Görseller:** çoğu GPT (yerleşik görsel üretimi; komutlar [art-prompts-v2.md](./art-prompts-v2.md)), bir kısmı fal.ai (bakiye ~$2,5 kaldı). Kaynaklar `art/` (git'te değil), oyundakiler `public/assets/`; stil kılavuzu [story-v2.md §8](./story-v2.md). Git dışı klasörler Drive'da yedekli; yeni görselden sonra `npm run backup`.
- **Stüdyo sitesi (2026-10-17):** `https://mathgamesstudio.com` (Cloudflare Pages; oyun sayfası, destek, `app-ads.txt`). Gizlilik politikası `https://mathgamesstudio.com/games/prestige-life/privacy`; eski GitHub Pages adresi (`docs/privacy-policy.html`, `main`'den) yedek olarak duruyor.

## Uygulama kimliği

- Paket `com.prestigelife.idletycoon` · Prestige Life: Idle Tycoon · yayıncı Math Games Studio (`mathgamesstudio@gmail.com`, `mathgamesstudio.com`)
- AdMob App ID: Android `ca-app-pub-8950990027285549~9898475278`, iOS `ca-app-pub-8950990027285549~3253175874`; ödüllü birim `runtime/ads.ts`. GDPR mesajı yayında.
- Firebase projesi `prestige-life-idle-tycoon`; RevenueCat → Firebase entegrasyonu panelde.
