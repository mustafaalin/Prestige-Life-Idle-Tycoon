# Session Handoff

Son güncelleme: 2026-10-22 · Dal: `v2-rebuild` · Son sürüm: **AAB 30** (Play'e yüklendi, kullanıcı telefonda test etti; bulguların neredeyse hepsi düzeltildi, evlerin önünde büyük duran araçlar dahil). **AAB 31** telefonda denendi. **AAB 32** derlendi (2026-10-23, `~/Downloads/prestige-life-v2-32.aab`; ekran tasarımı, şube sınırı, Analytics rızası, Ayarlar'da gizlilik/destek bağlantıları); kullanıcı dahili teste yükleyecek.

Yeni bir oturumda projeye hızlı dönmek için güncel durum. Oyun v2 olarak yeniden yapılıyor; v1 dondu ve Faz 2.11'de kaldırılacak. Bu belge günlük tutmaz: her oturum sonunda **güncel durumu yansıtacak şekilde yeniden yazılır**. Kararların gerekçesi ve sayılar ilgili belgededir; burada yalnızca özet ve yapılacaklar durur.

## Belgeler

| Belge | Soru |
| --- | --- |
| [game-design-v2.md](./game-design-v2.md) | **Ne?** Kurallar ve sayılar; tek doğruluk kaynağı |
| [story-v2.md](./story-v2.md) | Hikâye, karakterler, ton, metinler, görsel stil kılavuzu |
| [monetization-v2.md](./monetization-v2.md) | Reklam ve IAP: yerler, ürünler, mağaza kurulumu, veri güvenliği beyanı |
| [rebuild-plan.md](./rebuild-plan.md) | **Ne zaman?** Fazlar ve görevler |
| [discussion-notes.md](./discussion-notes.md) | Kararı bekleyen konular (yalnız açık olanlar) |
| [art-brief-v2.md](./art-brief-v2.md) | Görsellerin kuralları, boyutları, sahne ölçeği, oyuna bağlama |
| [default-icons.md](./default-icons.md) | Kendi çizimimiz olmayan varsayılan ikonlar ve nerede oldukları (ikon üretimi için) |
| [art-prompts-v2.md](./art-prompts-v2.md) | GPT'yi bekleyen 1. nesil işleri (önsözün 3D kareleri) ve seçim bekleyen ikon / özellik grafiği adayları |
| [art-prompts-ada.md](./art-prompts-ada.md), [art-prompts-lumen.md](./art-prompts-lumen.md) | 2. neslin görselleri (yayından sonra) |
| [audio-v2.md](./audio-v2.md) | Ses efektleri ve müzik |
| [mobile-ad-integration.md](./mobile-ad-integration.md) | v2 reklam altyapısı (AdMob, izin, test) |
| [report-v2.md](./report-v2.md) | **Neden?** Değişmez; tasarım belgesiyle çelişirse tasarım geçerli |
| [research/](./research/) | Rakip incelemesi (Idle Guy) ve oyuncuyu tutma raporu (2026-10-20) |
| [archive/](./archive/) | Bitmiş teslimler, komutlar, ekonominin yeniden kurulması, Burak hikâyesi; yalnız geçmiş için |
| [v1/](./v1/) | v1 arşivi; v2 işinde okunmaz |

## Oyunda olanlar (lansman = 1. nesil)

Ayrıntılar tasarım ve hikâye belgelerinde.

- **Ekonomi (yeniden kuruldu 2026-10-20/21):** gerçekçi takvim (1 ay = 80 sn, 1 yıl = 16 dk, gerçek maaş ve fiyatlar); 14 işletme, her biri 15 seviye (üç görünüm × 5, yeni binada tur ×2) + şube, tur 1 sn; 104 meslekli ağaç (54 satır, satırda 2 iş, sekmeler sırayla, ustalık 3–8 ay, iş değişimi şovu), 24 kurs, 4 meslek açan eşya; 12 ev (kirala → satın al → kiraya ver), 12 araç, 7 kıyafet, 4 lüks (gelir bonusu yok); Şans'ın tasmaları (%2 / %4 / %6); çevrimdışı %20, en çok 1 sa; 8 sınıf, 1. nesilde Milyarder'e kadar (~70 yaş). Kayıt şeması 3 (2026-10-21: 10 → 15 işletme seviyesi).
- **Hikâye:** önsöz (6 kare), 5 sınıf töreni (Gündelikçi → Milyarder; Multimilyarder ve En Zengin torunla), annenin mesajları, hayat anları (25, 28, 31, 63, 70), 4 lüks anı, 50 olay kartı (üç tür, yönetici kartları işletmenin görünümüne bağlı, deste düzeni), Zenginler Listesi, aile albümü, 60+ dede görünümü. 80'de kahraman kalır: bir kez "Torununun hikâyesi yakında" kartı, oyun sürer. Burak hikâyesi, devir, miras, Aile sekmesi ve Lumen kodda duruyor ama kapalı (`config/content.ts`).
- **Ana ekran:** oturulan ev ve önündeki araç, kahraman, Şans, yerden toplama (Orta Sınıf'ta biter), hedef rozeti (bitince "Ödülü al" ve yanında ×3 reklamı), gelir dökümü, hayaller panosu, ×2 hızlandırıcı, Şans'ı çağır, para yağmuru (30 sn geri sayımlı), fırsat balonu, günde bir teklif kartı; ödüller yeşil banknotlarla bakiyeye uçar; alt menüde İşletmeler, Kariyer, Alışveriş, Yatırım. Rıza Amca rehberi.
- **İşletmeler ekranı (yeni tasarım, 2026-10-21):** kısa satır: resme dokun = çalıştır, ad, seviye adı · N/15, aylık gelir, üç parçalı aşama çubuğu (tezgâh / dükkân / mağaza), tek ana düğme (Geliştir / Yeni bina ×2 / Aç / Şube) ve eksik tutar ya da yardım reklamı; yöneticisi olmayan satırın altında yönetici şeridi (portre, ad, "İşe al"; para yetince altın); satıra dokununca ayrıntı penceresi (tur kazancı, sıradaki seviye, yönetici, şubeler, reklam teklifleri). Kod `ui/businesses/BusinessCard.tsx`, `BusinessDetails.tsx`, `StageBar.tsx`.
- **Para:** 19 ödüllü reklam yeri, kilitsiz (reklam izleyen Milyarder'e %47 erken); Mağaza afiş tarzında (Sınırlı teklif, Bedava, Hep senin): Başlangıç Paketi $2,99 (ilk 3 gün $1,49; ×2 4 sa, 1 sa gelir, fular +%10), Rahat Paket $7,99 (reklamsız, 3 sa gelir, ×2 2 sa; simgesi altın yasak çemberli kırmızı oynat düğmesi); geri yükleme; Play puanlama penceresi.
- **Görseller:** 1. neslin bütün görselleri oyunda, GPT'de bekleyen iş yok. 2026-10-21'de bağlananlar: 41 meslek ikonu (104'ün hepsi), önsözün 3D kareleri, dedenin okşama pozu (Şans doğru boyda), Sahil Malikânesi v2 (ev geride), fularlı okşama pozları, McLaren tarzı Süper Otomobil; 11 aracın tekerlek altındaki gri zemin temizlendi (`scripts/vehicle-ground.py`).
- **Sahne panosu (DEV, 2026-10-21):** `npm run dev:v2` → `/scene-board.html`; ilk hayatta görülebilen her ev, araç, kıyafet ve tasma (`ui/scene/sceneCombos.ts`, şu an 84 sahne) telefon boyunda, altında yorum kutusu; yorumlar `scene-notes.json`'a (git dışı) yazılır, Claude oradan okur. İlk turun yorumlarıyla poz boyları, ev başına araç yeri ve üç aracın lastik altı düzeltildi; ayak altındaki gölge kaldırıldı (kahramanı havada gösteriyordu).
- **Altyapı:** kayıt Preferences'ta, Android geri tuşu, güvenli alanlar, yalnız dikey (tablette ortada dikey sütun), yerel bildirimler, Firebase Analytics ve Crashlytics (JS hataları ölümcül olmayan rapor, çizilemeyen ekranda yeniden başlat), ses ve müzik, TR + EN.

## Sıradaki

1b. **IAP para paketleri (2026-10-22, oyunda):** Mağaza'da "Para çantaları" bölümü, 5 tüketilir ürün `v2_cash_1..5` ($0,99 / $2,99 / $4,99 / $9,99 / $14,99 = 15 dk / 1 / 2 / 5 / 10 saatlik gelir; [monetization-v2.md §5](./monetization-v2.md)), görselleri para serisi M2–M6. Lansmanda gelecek. Kullanıcı 5 ürünü Play Console'a ve RevenueCat'e ekledi (2026-10-22). Oyun ürünleri id ile çeker (`runtime/iap.ts` `getProducts`), RevenueCat'te offering gerekmez. Sırada AAB 31'de gerçek satın alma (lisans test hesabıyla).
2. **AAB 31:** derlendi (2026-10-22), `~/Downloads/prestige-life-v2-31.aab`; kullanıcı dahili teste yükleyip aşağıdaki listeyle dener. RevenueCat'te para çantaları Consumable, Rahat ve Başlangıç Paketi Non-consumable (kullanıcı düzeltti, 2026-10-22).
3. **AAB 31 telefon bulguları (kullanıcı, 2026-10-22):** IAP para çantaları çalışıyor (alınıyor, para geçiyor, tekrar alınabiliyor).
   - **Yapıldı (geliştirme sunucusunda görüldü, AAB 32'de gelecek):** olay kartında "kesin" yok, teşekkür ve seçenek kartlarında düğmede yalnız metin, sağlam/cesur seçeneklerde tutar banknotlu küçük etiketlerde ("%50 · +$X ya da −$Y"); uçan banknot 34 px (ilk boyun 1,2 katı); işletmeler: açılmamış satırda gelir vaadi yok, yönetici şeridinde "Sen yokken de çalıştırır: +$X/ay", büyüme şovunda ve geliştirmede aylık gelir, şube düğmesinin altında "+$X/ay", ayrıntı penceresinde aylık; mağazanın Bedava kartlarında düğmeler kartın dibinde; **Rahat Paket'te tek düğme** (`AdCollect`, `ui/ads/AdButton.tsx`): ödül kartlarında (çevrimdışı, Şans, günlük, tören hediyesi, olay sonucu, büyüme, hedef) "Topla +$2X ~~+$X~~" ve üstünde "Rahat Paket ×2" şeridi; tek başına duran reklam düğmeleri pakette yeşil ve paketin üstü çizili oynat simgesiyle, "Hemen al:" yazısı yok. Mavi-mor reklam simgesi (`public/assets/icons/ads.png`) yalnız v1'de kullanılıyor; v2'de hiçbir yerde yok, v1 kaldırılınca gider.
   - **Kariyer, Ofis sekmesi erken açık (yapıldı):** sebep iş ağacının 2026-10-21'de yeniden dizilmesi; eski kayıtta çalışılmış ve sonradan yukarı taşınmış bir iş (ör. Kasiyer: eskiden 3. satır, şimdi Ofis 16. satır) "en ileri satır"ı oraya taşıyordu. Artık en ileri satır yalnız 1. satırdan kesintisiz gelen işlerden sayılır (`careerFrontier`, `core/economy/career.ts`); bir iş en çok bir satır ötede alınabilir. Telefondaki kayıtta Ofis sekmesi güncellemeden sonra kapanır; o işler "çalışıldı" olarak durur.
   - **Seçenek kartı (kullanıcı, 2026-10-22):** iki eşit seçenek yan yana, farklı renk (yeşil / turuncu), üstlerinde hediye simgesi, tutar yazısı yok; hangisine basılırsa hediye gelir.
   - **Referans görüntüler** anlamlı adlarla yeniden adlandırıldı (`idle-guy-life-sim oyun ekran görüntüleri/01-esya-evler.jpeg` … `56-kariyer-is-agaci.jpeg`); eski numaralar → yeni adlar: [research/idle-guy-screenshot-index-2026-10-20.txt](./research/idle-guy-screenshot-index-2026-10-20.txt).
   - **Yatırım yeniden (yapıldı, geliştirme sunucusunda görüldü, 2026-10-22):** üç fırsat, risk yok: Hızlı 5 dk +%10, Gece 6 sa +%50, Özel fırsat 6 sa +%100 (reklamla, günde 2); üçüne aynı anda yatırılır (her biri en çok 24 aylık gelir, kullanıcı 24 ayda kalmayı seçti). Süren yatırım kendi kutucuğunda aynı boyda (çubuk, "Geri gelecek", reklamla "Süre ½", "Topla"). Üstte sekmeler: Banka (2026-10-22 kullanıcı: "Fırsatlar" → "Banka", EN "Bank"); Borsa ve Emlak kilitli "Yakında" (sonraki güncellemeler). Kayıt: `invest.active` → `invest.deals` (plan başına bir yatırım; eski tek yatırım yüklenirken taşınır, denendi; eski vadeler gizli satır, ödenir). Sim: hedefler geçiyor, yatırım payı %17, Milyarder 67 yaş (gündelik 51).
   - **Meslek değişim şovu (yapıldı):** yeni meslek ikonu 120 → 170 px, eski 104 → 150 px.
   - **Ev ve araç için kariyer şartı (yapıldı, geliştirme sunucusunda görüldü):** her ev ve araç "Sv N bir işte çalış" ister (tablo [game-design-v2.md §4.6](./game-design-v2.md)); mağazada kilitli kartta şart ve Kariyer'e "Git" (`ui/shop/CareerAsk.tsx`). Sim değişmedi (bot ev/araç almıyor, evler törenle geliyor), kayıt denetimi geçti, döngü denetimi temiz.
   - **Sonraya not (kullanıcı, 2026-10-22):** kendi çizimimiz olmayan varsayılan ikonlar (yatırımdaki saat gibi) belirlendi: [default-icons.md](./default-icons.md); onlar için ikon üretilecek.
   - **Ekranlarda Yatırım/İşletmeler dili (yapıldı, geliştirme sunucusunda görüldü, 2026-10-22; kullanıcı "önerdiğin bütün değişiklikleri yap"):** ortak parçalar `ui/kit.tsx`: `Segmented` kilitli seçenek alır (kilit + "Yakında"; Yatırım sekmeleri artık bununla), `BandTile` + `TILE_FACE` + `TilePill` (bantlı kutucuk; Yatırım ve Aile), `SpeakerLine` (konuşan karakter; Yatırım'da Rıza Amca, Aile'de Anne, 2. nesilde Dede). Aile: puan büyük çerçeveli rakam, yadigârlar üçlü kutucukta (bant, seviye, ikon, "GELİR +%30", "Sonra +%60", puanla al; alınca ikon zıplar, yeni değer yükselir); kartlardaki açıklama cümleleri (`family.items.*.body`) artık görünmüyor. Kariyer: maaş büyük çerçeveli rakam; iş değişim şovu kapanınca "+$X/ay" yükselir, ikon zıplar. Mağaza: sıradaki hayalin fiyatı banknotlu büyük rakam, düğmede yalnız "Satın al"; alımda titreşim (ses zaten sahneden, `Scene.tsx` `progressMark`); koleksiyon kutucukları Yatırım yüzeyiyle, yeni alınan parlayarak gelir (araç ve kıyafette pencere kapanır, lüks eşyada görünür). Ayrıca İngilizcede yatırım yüzdesi "+%10" yazıyordu, "+10%" oldu (`invest.gainShort`). Aile sekmesi lansmanda kapalı (`CONTENT.legacy`); bakmak için geçici açıldı, geri kapatıldı.
   - **Şube sınırı satırda (yapıldı, geliştirme sunucusunda görüldü, 2026-10-22; kullanıcı: "kaç şube açılacağı belli olmuyor"):** son seviyedeki işletmenin satırında düğmenin altında "Şubeler 2/4"; sınırdaysa "SINIRDA" ve kilitle "Milyoner olunca 16" (bir sonraki sınıfın sınırı; `business.branchCapNext*`). Sınırsızken "Şubeler 8/∞" (`business.branchesNoCap`), yani son seviyedeki her satırda sayaç var. Dar ekranda kesilme düzeltildi (kullanıcı ekran görüntüsü): satırdaki bilgi yalnız seviye adı (seviye sayısı noktalarda, şube sayısı düğme sütununda), işletme adı ve seviye adı iki satıra inebilir; tur balonu ("+$14,4B") küçüldü, adın üstüne binmesin. Ayrıntı penceresinde zaten vardı. Sınır kuralı değişmedi (game-design-v2 §4.3).
   - **Gizlilik / Play denetimi (2026-10-22):** GPT'nin hazırladığı `docs/legal/` (gizlilik, şartlar, veri talepleri EN/TR + [play-console-checklist-tr.md](./legal/play-console-checklist-tr.md)) kodla karşılaştırıldı, içerik doğru. Ayarlar'a eklenen gizlilik ve destek bağlantıları i18n'e taşındı (`settings.privacyPolicy`, `settings.support`); "Gizlilik seçenekleri" alt yazısı "Reklam tercihlerini değiştir" oldu (UMP yalnız reklam rızası). Site güncellendi (site deposu commit 84674f8, 2026-10-22; kontrol edildi): gizlilik (rıza §6 dahil), şartlar ve veri talepleri EN/TR yayında, olmayan adres 404; e-posta Cloudflare Email Obfuscation ile JS'le gösteriliyor (JS'siz okuyucuda "[email protected]"). Play'de şartlar için alan yok; veri silme bağlantısı Veri güvenliği formunun silme sorularında, alan çıkarsa; Veri güvenliği formu (2026-10-22, kullanıcı ekran görüntüleri): formda yalnız Finansal (2/4) ve Cihaz kimlikleri (yalnız toplandı, yalnız işlevsellik) seçiliydi; AdMob/Analytics/Crashlytics eksikti. Kullanıcıya verilen tam liste: Yaklaşık konum (topl.+payl.; analiz, reklam, sahtekarlık), Satın alma geçmişi (yalnız topl.; işlevsellik, analiz; diğer finansal tür kaldırılacak), Uygulama etkileşimleri (topl.+payl.; analiz, reklam, sahtekarlık), Kilitlenme günlükleri (yalnız topl.; analiz), Teşhis (topl.+payl.; analiz, reklam, sahtekarlık), Cihaz veya diğer kimlikler (topl.+payl.; işlevsellik, analiz, reklam, sahtekarlık); hepsi zorunlu, kısa süreli değil; silme sorusu Evet + veri talebi adresi. Kullanıcı formu bu listeyle doldurdu, önizleme kontrol edildi (2026-10-23); kaydedip incelemeye gönderecek. Analytics rızaya bağlandı (2026-10-22: manifestte dört rıza varsayılan kapalı, UMP AB'de seçimi Firebase'e aktarır, rıza gerekmeyen bölgede `grantAnalyticsConsent`; AdMob panelinde rıza modunun açılması ve AEA test coğrafyasıyla telefonda denenmesi gerekiyor; gizlilik metni §6 buna göre güncellendi); 13–15 yaş ve AdMob rıza yaşı kararı kullanıcıda; Ayarlar'daki bağlantıların telefonda tarayıcıyı / e-postayı açtığı denenmedi.
   - **Sırada:** AAB 32'yi dahili teste yüklemek ve telefonda denemek: yeni ekranlar (Yatırım "Banka", Kariyer, Mağaza, şube sayacı), Ayarlar'daki gizlilik ve destek bağlantıları tarayıcıyı / e-postayı açıyor mu; AdMob panelinde Analytics için rıza modunu açmak; AEA rıza denemesi geliştirme derlemesinde (`VITE_ADMOB_DEBUG_EEA=true`, `npm run phone`).
4. **Lansman hazırlığı:** Play'den üretim erişimi başvurusu; Play Console işleri (aşağıda); uygulama ikonu yeniden tasarlanıyor (özellik grafiği tamam, 2026-10-22; yeni ikon komutları [art-prompts-v2.md §1](./art-prompts-v2.md)); mağaza ekran görüntülerini yeni ekranlarla yenilemek.
5. **Sonra (lansmandan sonra):** IAP 2. adım (Yakut Tasma, Gece Vardiyası), Remote Config, oyuncuyu tutma önerileri ([discussion-notes.md §2](./discussion-notes.md)), 2. nesil.

## 2026-10-21 oturumunun kararları (kullanıcı)

Hepsi yapıldı ve commit'lendi; ayrıntıları ilgili belgelerde. Yeni oturum bunları yeniden sormaz, yeniden açmaz.

- **Sahne:** sahne panosu (`/scene-board.html`) ile yorum turu; ayak altındaki gölge kalktı (kahramanı havada gösteriyordu); poz boyları düzeltildi; ev başına araç yeri (E3, E5 öne; E8, E12 geri; E11 için ev yeniden çizildi); Spor Coupe 1,42 m; Süper Otomobil yeni çizim.
- **Hikâye:** otogardaki söz artık "eski evimizi geri alacağım, pastanı orada keseriz"; Orta Sınıf töreninde ev geri alınır, pasta gelir, anne yanında ("Sen bana hep yettin"); saray sözü kalktı. Milyarder töreninde Bülent Bey emekliye ayrılır, otellerin onur başkanı olur; metinlerde kimsenin yaşı söylenmez.
- **Olay kartları:** 50 kart; her yöneticinin 3 kartı işletmenin görünümüne bağlı (yeni görünüm yeni kartı ekler, eskiler destede kalır); üç tür (sağlamcı/cesur, teşekkür, iki eşit seçenek); deste düzeni (hepsi çalmadan tekrar yok); **günlük sınır yok**.
- **Mağaza:** afiş tarzı (referans Idle Guy); ödüller miktarla ("+$277 Bin"); Bedava bölümü (sahnedeki reklamlar); Rahat Paket'e 3 saatlik gelir; reklam ve reklamsız simgeleri yeni (kırmızı oynat düğmesi; reklamsızda altın yasak çemberi resmin içinde, 2026-10-22); her gün bir teklif kartı ana ekranda (alınmamış paket, sırayla); kartın düğmesinde fiyat yazar ve doğrudan satın aldırır, hoş geldin fiyatında altında "Sonra $2.99"; "Şimdi değil" yok, büyük çarpı 2 sn sonra gelir (2026-10-22).
- **Ödül hissi:** uçan para yeşil banknot (bozuk para yok); para ödüllerinin tutarı her zaman banknotla gösterilir, büyük ödül daha büyük para (2026-10-22); para yağmurunda bütün yerler dolar, iki kat sık; şişe $2 / $20 / $50 (Sokak $2 kaldı, 2026-10-22); hedef rozetinde ×3 reklamı "Ödülü al"ın yanında.
- **İşletmeler ekranı:** onaylanan taslak gerçek oyunda (yukarıda).
- **Crashlytics** eklendi; Firebase'de kullanıcının yapacağı ayar yok (istenirse Crashlytics sayfası bir kez açılır).
- **Yayın derlemesi** DEV menüsünü kendisi kapatır (`build:v2`).

## Telefonda test listesi (AAB 31)

Kurulum: dahili testten (Play sürümü) ya da `npm run phone -- --install` (DEV sürümü, ayrı uygulama "Prestige DEV"). Bulgular gelince madde buradan silinir.

**Daha önce denendi, sorun yok (AAB 28–29):** güncellemede kayıt, mağaza ve yerel para birimi, Başlangıç Paketi'nin ödülleri, Rahat Paket'le "Hemen al ×2", kıyafetlerin sınıf kilidi, akıcılık, TR/EN metinler, bildirimler.

1. **İlk saat:** el ilanı → bulaşıkçı → tezgâh, şişe ve tezgâh turunun hissi, "Çalıştır", ilk yönetici (Rıza Amca), hedef rozeti ve "Git".
2. **İşletmeler ekranı (yeni):** kısa satırlar, resme dokunup çalıştırma, aşama çubuğu, yönetici şeridi ve "İşe al", ayrıntı penceresi, yeni bina şovu, şube; rehberin işaret ettiği düğmeler.
3. **Kariyer:** sekmeli ağaç (telefon genişliğinde kutuların dizilişi, çizgiler), şart penceresi ve "Git", ustalık halkası, kurs başlatma, eşya alıp meslek açma.
4. **Reklamlar ve mağaza:** 19 yerin düğmeleri, gerçek test reklamı, Rahat Paket'le reklamsız ödül, Şans'ı çağır, fırsat balonu, para yağmuru (yoğunluk, 30 sn geri sayım), hedefte ×3; yeni mağaza, Bedava bölümü, günlük teklif kartı; yeşil banknot uçuşu.
10. **Yeni içerik:** 3D önsöz, yeni olay kartları (teşekkür ve seçenek kartları), fularlı okşama pozu, Orta Sınıf'ta pasta, Crashlytics deneme çökmesi (DEV).
5. **Sınıflar:** Gündelikçi → İşçi → Orta Sınıf (tasma kartı, toplamanın bitişi, olay kartları, yatırım) → Milyoner (ilk kendi ev, gümüş tasma, puanlama penceresi). Milyarder ve 80 yaş DEV sürümüyle.
6. **Yaşa bağlı anlar:** 25 / 28 / 31, 60+ dede görünümü, 63 ve 70, 80'de "Torununun hikâyesi yakında".
7. **Günlük ödül ve çevrimdışı kartı:** ertesi gün, ×2 reklamı, kapat-aç sonrası aynı tutar.
8. **Dikey sütun, ses ve müzik:** tablette ortada dikey oyun; telefonu yan çevirince dönmemesi; dört müziğin geçişleri, Ayarlar'daki iki anahtar, arka planda sesin susması.
9. **Para:** Başlangıç Paketi'nin hoş geldin fiyatının 3 gün sonra $2,99'a dönmesi, "Satın alımları geri yükle".

## Kullanıcının yapacakları

- **Play Console:**
  - AAB 31'i dahili teste yüklemek (AAB 30 yüklendi ve test edildi); sonra üretim erişimi başvurusu.
  - Mağaza sayfası: web sitesi `https://mathgamesstudio.com` (AdMob `app-ads.txt`'yi buradan okur), gizlilik politikası `https://mathgamesstudio.com/games/prestige-life/privacy`.
  - Başlangıç Paketi açıklamasına fuların bonusu (metin [monetization-v2.md §8](./monetization-v2.md)).
  - Veri güvenliği beyanı v2'ye göre ([monetization-v2.md §7](./monetization-v2.md)).
  - v1'in 8 ürününü pasifleştirmek.
  - Mağaza görselleri `~/Downloads/play-store-v2/` (6 ekran × TR/EN, özellik grafiği, ikon 512). Ekran görüntüleri eski ekonomiden; yeni işletme kartı ve iş panosuyla yenilenebilir (kaynak `art/store-v2/`, `capture.mjs` / `compose.mjs` / `feature.mjs`; `playwright-core` projede yok, yerel bir kopya gerekir).
- **Uygulama ikonu:** A, B, C adayları beğenilmedi (2026-10-22); yeni ikon GPT'de, komutlar [art-prompts-v2.md §1](./art-prompts-v2.md) (D "İkiye bölünmüş yüz", E "Şans'ın iki hâli"). Özellik grafiği tamam. Para serisi (M1–M6) 2026-10-22'de oyunda: üst bardaki bakiye M3, uçan para ve işletme baloncukları M2 (kullanıcı: tek banknot değil, altın bantlı deste), günlük ödül takvimi M1–M4, ödül kartlarında tutara göre M2–M5, Başlangıç Paketi M3, Rahat Paket M4, para çantaları M2–M6 (`ui/icons.ts` `MONEY`, `ui/piles.ts`). 2026-10-21 teslimi oyunda ([archive/art-prompts-2026-10-21.md](./archive/art-prompts-2026-10-21.md)).
- **`npm run backup`:** `art/` klasörüne 2026-10-21'de yeni GPT görselleri geldi; Drive'a yedeklenmedi.
- **AdMob:** Play'de web sitesi girildikten sonra app-ads.txt doğrulaması (AdMob → Uygulamalar); Ayarlar → Test cihazları'na telefon.
- **Oyuncu gözlemi:** 6–8 tanıdıkla (kapalı test verisi çoğunlukla kendi hesapların).

## Çalışma kuralları (kullanıcı, 2026-10-21: konuşulanlar yarım kalıyor, aynı şeyi birkaç kez söylemek zorunda kaldım)

- **Her istek bir yere yazılır.** Kullanıcının bir mesajındaki her madde ya aynı turda yapılır ya da bu belgenin "Sıradaki" bölümüne (karar bekliyorsa discussion-notes'a) yazılır; hiçbiri sadece sohbette kalmaz.
- **Karar verilince belgeye geçer:** yukarıdaki "oturumun kararları" bölümü ve ilgili belge (tasarım, hikâye, monetizasyon) aynı commit'te güncellenir.
- **"Yaptım" demeden önce:** commit'li ve ekranda görülmüş olmalı (tarayıcıda ya da telefonda); kullanıcıya nerede göreceği söylenir (geliştirme sunucusu mu, hangi AAB).
- **Zaten var olan bir şey istenirse** (ör. para yağmurunun geri sayımı) bunu açıkça söyle ve nerede olduğunu göster.
- **Doğrulama komutu `npm run typecheck`**; `npx tsc -p .` hiçbir dosyayı denetlemiyor (kök tsconfig boş, 2026-10-21'de fark edildi).
- **Oturum sonunda** bu belge yeniden yazılır: Sıradaki, kararlar, test listesi güncel.

## Kurallar

**Kayıt uyumluluğu (kullanıcı, 2026-10-14):** yayından sonra her güncelleme oyuncunun kaydını korumalı. Kod `src/game/runtime/storage.ts`.

- **Kimlikler değişmez:** kayıtta duran bir id (işletme, eşya, ev, meslek, kurs, hedef, an, mağaza ürünü) yeniden adlandırılmaz, silinmez; gerekirse eskisi yenisine eşlenir.
- **Yeni alan varsayılanla gelir:** `normalize*()` her alanı tek tek okur; yeni sistem eski oyuncuya bir anda onlarca kart ya da tören yaşatmaz.
- **Alınmış olan geri alınmaz:** kural sıkılaşsa da sahip olunan kalır; sınıf hediyeleri `applyClassFloors` ile eksikse verilir.
- **Şema:** `SAVE_SCHEMA` yalnızca `migrate()`'e adım eklenerek artırılır; okunamayan kayıt `prestige_life_v2_unreadable`'a yedeklenir. Şema 2'nin tek seferlik temiz başlangıcı yayından önceydi (2026-10-21; kullanıcı telefonda gördü ve yeniden vurguladı); yayından önce de bir daha yapılmaz.
- **Kayıt anahtarı** `prestige_life_v2` ve uygulama kimliği değişmez.
- **Denetim:** `npm run savecheck` (2026-10-21) `scripts/save-fixtures/` içindeki her eski kaydı bugünün koduyla açar ve ilerlemenin tamamını arar (para, kazanç, sınıf, yaş, iş ve deneyim, kurslar, işletmeler, yöneticiler, şubeler, eşyalar, evler, törenler, kahramanın adı, satın almalar). Kaydı etkileyen her değişiklikte çalışır. Şema her arttığında yükseltmeden önce `npm run savecheck -- --snapshot schemaN-midgame` ile o şemanın örnek kaydı eklenir; örnek kayıtlar sonradan hiç düzenlenmez (eski telefonlarda duran budur).

**Ekran kuralı:** yeni bir açılır kart `createPortal(..., portalRoot())` kullanır (`document.body` değil); ekrandan ölçülen nokta sütuna `toStage()` ile çevrilir; `vw` yerine `var(--stage-w)`.

**İçerik bayrakları:** lansmanın neyi içerdiği `core/config/content.ts`'te (`handover`, `legacy`, `bradStory`, hepsi kapalı). Ekranlar, hikâye ve simülatör yalnız bunlara bakar.

## Çalıştırma

- `npm run dev:v2` (tarayıcıda DEV menüsü açık); `npm run sim`; `npm run typecheck`; `npx eslint src/game`.
- **Telefon:** `npm run phone` (Android, kablosuz ya da USB; port değişince `-- PORT`, yerel eklenti değişince `-- --install`). DEV sürümü ayrı uygulama: `com.prestigelife.idletycoon.dev`, "Prestige DEV", kendi kaydı var. Kullanıcının telefonu Samsung Galaxy S24+ (Android 16). Gradle için `JAVA_HOME` Android Studio'nun Java 21'i.
- **AAB:** `npm run cap:sync:v2`, sonra `android/` içinde `./gradlew bundleRelease` (imza `android/keystore.properties`; `build:v2` DEV menüsünü kendisi kapatır, test reklamı yalnız geliştirme sunucusunda açık); çıktı `android/app/build/outputs/bundle/release/app-release.aab` → `~/Downloads/prestige-life-v2-<kod>.aab`. Sonraki sürümde `android/app/build.gradle` `versionCode` bir artar. Gradle Java 17+ ister: `JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"` (sistemdeki java 8).
- **Kod:** `src/game/` (çekirdek `core/`, simülatör `sim/`, `runtime/`, `i18n/`, `ui/`). Yapı [game-design-v2.md §7](./game-design-v2.md).
- **Görseller:** önce GPT (komutu Claude yazar), gerekirse fal.ai. Kaynaklar `art/` (git'te değil), oyundakiler `public/assets/` (webp: işletme ve ikonlar 384 px, yönetici portresi 256 px); kurallar [art-brief-v2.md](./art-brief-v2.md), stil [story-v2.md §8](./story-v2.md). Git dışı klasörler Drive'da yedekli; yeni görselden sonra `npm run backup`.
- **Stüdyo sitesi:** `https://mathgamesstudio.com` (Cloudflare Pages; oyun sayfası, destek, `app-ads.txt`, gizlilik politikası).

## Uygulama kimliği

- Paket `com.prestigelife.idletycoon` · Prestige Life: Idle Tycoon · yayıncı Math Games Studio (`mathgamesstudio@gmail.com`, `mathgamesstudio.com`)
- AdMob App ID: Android `ca-app-pub-8950990027285549~9898475278`, iOS `ca-app-pub-8950990027285549~3253175874`; ödüllü birim `runtime/ads.ts`. GDPR mesajı yayında.
- Firebase projesi `prestige-life-idle-tycoon`; RevenueCat → Firebase entegrasyonu panelde.
