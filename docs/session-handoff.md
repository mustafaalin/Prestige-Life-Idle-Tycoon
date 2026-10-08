# Session Handoff

Son güncelleme: 2026-10-08 · Dal: `v2-rebuild`

Yeni bir oturumda projeye hızlı dönmek için güncel durum özeti. Oyun v2 olarak yeniden yapılıyor; v1 dondu ve v2 onu Faz 2.11'de kaldıracak. Bu belge tarih sırasıyla günlük tutmaz; her oturum sonunda **güncel durumu yansıtacak şekilde yeniden yazılır**.

## Belgeler

| Belge | Soru | Not |
| --- | --- | --- |
| [report-v2.md](./report-v2.md) | **Neden?** | Tasarım analizi ve yeniden doğuş raporu. Değişmez referans. |
| [game-design-v2.md](./game-design-v2.md) | **Ne?** Kurallar ve sayılar | Rapordan sapmalar §9'da. Rapor ile çelişirse bu geçerli. |
| [story-v2.md](./story-v2.md) | Hikâye, karakterler, ton, görsel listesi ve stil kılavuzu | |
| [monetization-v2.md](./monetization-v2.md) | Reklam ve IAP | Kararlaştırıldı (2026-10-08); altyapı hazır, yerler ve IAP bekliyor. |
| [rebuild-plan.md](./rebuild-plan.md) | **Ne zaman?** Fazlar, görevler, durum | Yapılanlar işaretli. |
| [discussion-notes.md](./discussion-notes.md) | Kararı bekleyen konular | Sadece açık konular; karar verilince taşınır. |
| [mobile-ad-integration.md](./mobile-ad-integration.md) | Reklam altyapısı | Üstte v2 bölümü, altında v1. |
| [v1/](./v1/) | v1 arşivi | v2 işinde okunmaz. |

## Durum (oyunda olanlar)

- **Çekirdek ve simülatör:** İşletmeler (+ yükseltmeler), yöneticiler, kariyer, statü eşyaları, konut (kirala → satın al → kiraya ver), 8 sınıf (2026-10-08: Multimilyoner kalktı, İşçi ile Milyoner arasına Orta Sınıf $1M girdi, Milyoner $10M), yaş ve ömür (17 → 97, 1 dk = 1 ay), miras, hedefler. İşletme ana gelir: Çalıştır turda en az $1, yavaşlatma fiyatlardan (Gündelikçi 4,5 dk, İşçi 15 dk, Orta Sınıf ilk oturumun sonu, Milyoner dönüş oturumu). `npm run sim` 11 tempo + 4 his hedefi.
- **Önsöz:** 6 karelik görsel roman (annesini doğum gününde aradığı için kovulma → lojmandan çıkış → otogarda söz → ara sokakta Şans). Yeni oyuncu oyundan önce görür.
- **Ana ekran:** Tam ekran ara sokak; kahraman 4 pozla, yanında Şans. Şişe/kutu toplama (her biri ~2,5 sn gelir), Şans'ın 5–10 dakikada bir cüzdan getirmesi (sahibine verilir, teşekkür ödülü). Paralar kavisle bakiyeye uçar. Renkli üst bar (aylık gelir, sınıf, yaş, ayarlar), 3D ikonlu alt menü, sekmeler sahnenin üstünde sayfa.
- **Ekranlar:** İşletmeler (adet, aylık kazanç, Çalıştır, kilometre taşı çubuğu, 3 yükseltme, her işletmeye kendi yöneticisi: portre + işe alma kartı + cümleler), Kariyer, Alışveriş/Evler, Ayarlar (dil, gizlilik seçenekleri). Ana ekranda Hedefler kartı (3 hedef, ödül; her hedefte resim, nerede yapıldığı ve "Git": sekmeyi açıp düğmeyi parlatır; sekme içinde hedef şeridi). Ortak görünüm `ui/kit.tsx`, yazı tipi Fredoka.
- **Ödül kartları:** Çevrimdışı kazanç (tavan sınıfla büyür: 10 dk → 2 sa), Şans'ın cüzdanı, yönetici işe alma.
- **Ses ve haptik:** Toplama, alım, ödül.
- **Reklam altyapısı:** `runtime/ads.ts` (AdMob 8.2.1, UMP izin formu, iOS ATT, web'de sahte reklam). Reklam yerleri henüz bağlı değil.
- **Mobil:** Kayıt Preferences'ta, Android geri tuşu, güvenli alanlar; `npm run phone` ile telefonda canlı yenileme.

## Son oturumda kararlaşanlar (2026-10-08 akşam)

- **Hikâye omurgası** ([story-v2.md](./story-v2.md) başı ve §4): ana zincir sadece sınıf törenlerine bağlı (her oyuncu sınıfları aynı sırayla geçer, "denk getirme" gerekmez). İşçi Sınıfı'nda annenin "babanın defteri" mesajı; Orta Sınıf'ta (30. dk) eski aile evi kendiliğinden geri alınır, çatı katında defter, içinden baba (Mehmet) + küçük kahraman + genç Rıza'nın fotoğrafı; Rıza babanın dostuymuş ama kahramanı tanımıyormuş. Anne mesajları sınıfa bağlı (günde en fazla 1, birikmez); 3 yönetici anı (Rıza, Selin, Hüseyin Usta = babanın eski çırağı). Annenin evi: eski ev ve konak törenle gelir, ara basamaklar isteğe bağlı. Faz 2: eş = Nevin Hanım'ın torunu (cüzdan zinciri), varis 17 yaşında torun, ölüm gösterilmez, 4. perde oynanabilir vakıf projesi.
- **Sınıf merdiveni** ([game-design-v2.md §4.1](./game-design-v2.md), kodda): Multimilyoner kalktı; Sokak · Gündelikçi $1K · İşçi $100K · **Orta Sınıf $1M** (30. dk) · **Milyoner $10M** (dönüş oturumu) · Milyarder $1B · Multimilyarder $100B · En Zengin $1T. Sim hedefleri tutuyor.
- **Görseller** (fal.ai, $0,60): Orta Sınıf anı için çatı katı ve eski fotoğraf (`art/pilot/07-story/`), Gündelikçi için minibüs arka planı (`art/pilot/05-scene/home-1-van-v1.png`). Oyuna bağlı değiller.

## Sıradaki (sırayla)

1. **Ana ekran sahnesi, evler ve kıyafetler (sıradaki konuşma, [discussion-notes.md §7](./discussion-notes.md)):** Katmanlar tek sahibe bağlı: arka plan = oturulan ev, araç evin önünde, kıyafet, poz = sınıf, hikâye = tören. Kullanıcının yönü: ev 25 → 10–12, her sınıfa 1–2 ev, sınıf atlayınca herkes aynı evde (Claude: tören oyuncuyu sınıfın ilk evine taşır, ikinci ev isteğe bağlı alım); kıyafet 20 → 4–5 (Claude: kıyafeti tören versin, mecbur alım değil). Taslak ev tablosu notlarda. Açık: apartmanlarda dış/iç mekân, şişe toplamanın sınıfla neye dönüşeceği, "yemek" gibi ara anlar. Ekonomiyi etkiler → `npm run sim`.
2. **Telefonda deneme:** İşletme ayarı (Çalıştır turda en az $1), hedeflerin "Git" düğmesi, yeni Orta Sınıf / Milyoner temposu.
3. **Sınıf töreni + hikâye anları (1.10):** Hikâye omurgası, anne mesajları, yönetici anları; önsözün balon bileşeniyle. Sahne/kıyafet değişimi aynı tetiğe bağlanır.
4. **Ekonomi ayarının kalanı:** çevrimdışı ödül ve ev bonusları ([discussion-notes.md §5](./discussion-notes.md)); reklamsız / reklam izleyen / ödeyen profilleri.
5. **Reklam yerleri:** Çevrimdışı ×2, Şans ×2, 1 saatlik ×2 hızlandırıcı, hayaline yardım ([monetization-v2 §4](./monetization-v2.md)).
6. **IAP:** Rahat Paket, Şans'ın Altın Tasması, Yeni Başlangıç, Gece Vardiyası Ekibi; RevenueCat; "Satın alımları geri yükle"; v1'in 8 ürünü pasifleştirilir.
7. **Faz 1'in kalanı:** onboarding ve Rıza Amca rehber balonları (1.12), hayaller panosu (1.8), analitik (1.14), oyun testi paketi (1.15). Ayrıntı: [rebuild-plan.md](./rebuild-plan.md).

## Kullanıcının yapacakları

- **Telefonda gerçek test reklamını denemek:** DEV → "Test reklamı izle"; Google'ın "Test Ad" reklamı açılmalı, sonuç "rewarded" olmalı.
- **AdMob konsolu:** Privacy & messaging → "European regulations" (GDPR) mesajı oluşturup uygulamaya bağlamak (yoksa AB'de izin formu açılmaz); yayından önce `app-ads.txt`.
- **Firebase projesi** (Analytics + Remote Config + Crashlytics) ve `google-services.json` (plan Faz 0).
- **Test kullanıcısı listesi** (20–50 kişi; Google Play kapalı testi için en az 12 kişi 14 gün).

## Çalıştırma

- `npm run dev:v2` (v1 için `npm run dev`); tarayıcıda geliştirici menüsü (DEV) açık.
- Telefonda gerçek uygulama, canlı yenilemeyle: `npm run phone` (Android; kablosuz hata ayıklama ya da USB). Kablosuz port değişince `npm run phone -- PORT`; yerel eklenti değişince `npm run phone -- --install`. Oyun adb tüneliyle gelir, Mac'in IP'si önemli değil. Kullanıcının telefonu Samsung Galaxy S24+ (Android 16), eşlendi. Gradle için `JAVA_HOME` Android Studio'nun Java 21'i (`~/.zshrc`; sistemdeki `java` 8 kaldı).
- `npm run sim` ekonomi simülatörü; `npm run typecheck`, `npx eslint src/game`.
- Kod: `src/game/` (çekirdek `core/`, simülatör `sim/`, runtime `runtime/`, i18n `i18n/`, ekranlar `ui/`). Kayıt anahtarı `prestige_life_v2`. Türkçe + İngilizce; sabit metin yok.
- Görseller fal.ai ile (MCP bağlı, kullanıcının bakiyesi ~$10, ~$5,2 harcandı, kalan ~$4,8); stil kılavuzu [story-v2.md §8](./story-v2.md). Kaynak dosyalar `art/` (git'te değil, 184 MB), oyundakiler `public/assets/`.
- Git dışı klasörler (`art/`, `gpt-astra-inceleme/`, `rich inc oyun görselleri/`) Google Drive'da yedekli: My Drive → "Prestige Life yedek" (Drive for desktop). Yeni görsel üretince `npm run backup` (sadece yeni/değişen dosyaları kopyalar).

## Uygulama kimliği (v1 ve v2 ortak)

- Paket adı: `com.prestigelife.idletycoon` · Uygulama adı: Prestige Life: Idle Tycoon
- AdMob App ID: Android `ca-app-pub-8950990027285549~9898475278`, iOS `ca-app-pub-8950990027285549~3253175874`; ödüllü birimler `runtime/ads.ts`.
- IAP: v1'in 8 ürünü Play Console'da (`com.prestigelife.*`, liste [v1/session-handoff-v1.md](./v1/session-handoff-v1.md)); v2'de pasifleştirilip yenileri açılacak.
