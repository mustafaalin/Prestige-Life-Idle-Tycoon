# Ses ve müzik (v2)

Son güncelleme: 2026-10-21 · Kod: `src/game/runtime/feedback.ts` · Bekleyen: yağmur ve ortam sesi ([rebuild-plan.md](./rebuild-plan.md) Faz 1 "His parçaları")

## 1. Durum

- **Oyunda:** 16 efekt (ElevenLabs Sound Effects v2, kullanıcı seçti; kaynaklar `art/audio/sfx-2026-10-17/`, komutlar yanında `prompts.txt`, dinleme sayfası `art/audio/listen.html`), 4 müzik, Ayarlar'da "Ses efektleri" ve "Müzik" anahtarları. Oyundaki dosyalar `public/assets/audio/sfx/v2/` (sessizlik kırpıldı, −16 LUFS, mono 96 kbps) ve `public/assets/audio/music/v2/`.
- `purchase` (2026-10-17): ilk iki deneme "para eksiliyor" hissini vermedi; üç yeni denemeden **c** (paralar kasa çekmecesine düşüyor) seçildi.
- **İşletme şovu (2026-10-21):** iki yeni efekt, `grow` (işletme yeni görünüme geçer) ve `hire` (yönetici alımı); üçer deneme `art/audio/sfx-2026-10-21/` (komutlar `prompts.txt`), dinleme sayfasının başında. Oyunda geçici olarak grow-a ve hire-b; kullanıcı seçince değişir. Sıradan işletme seviyesinde `levelUp` seviye başına %5 tiz çalar (en çok ×1,5; `playSfx(…, { rate })`).
- Seçilenler: purchase-c, click-a, coin-b, levelup-a, payout-a, fanfare-b, page-a, ring-a, message-b, bark-b, arrive-a, reward-b, loss-b, unlock-b.

## 2. Ses efektleri (14; oyunda)

İlk dördü v1'in yerine yeni üretilir (iki çizim dili gibi iki ses dili olmasın). Hepsi kısa (0,2–2 sn), aynı "sıcak, oyuncaklı, yumuşak" ailede; sert elektronik bip yok.

| # | Anahtar | Nerede | Tarif |
| --- | --- | --- | --- |
| 1 | `click` | Düğmeler, sekmeler | Yumuşak, tok bir tık; tahta ya da plastik oyuncak |
| 2 | `coin` | Şişe/para toplama, para uçuşu | Tek parlak bozuk para şıngırtısı (sık çalar: hafif ve kısa) |
| 3 | `purchase` | İşletme, eşya, ev alımı | Paralar kasa çekmecesine düşer, çekmece kapanır (para eksiliyor hissi) |
| 4 | `levelUp` | Yükseltme, kariyer, yönetici | Yükselen üç notalık parlak arpej |
| 5 | `payout` | Ödül kartında "Topla", çevrimdışı kart, günlük ödül | Bir avuç paranın dökülmesi, 1 sn |
| 6 | `fanfare` | Sınıf töreninin "yeni sınıf" başlığı (konfeti) | Kısa, sıcak bir kutlama: zil + yaylı/üflemeli, 2 sn |
| 7 | `page` | Hikâye balonunun ilerlemesi, önsöz | Kâğıt hışırtısı ya da yumuşak "pop", çok kısa |
| 8 | `ring` | Olay kartının titreyen arama düğmesi | Eski bir telefonun iki kısa çalışı (döngüye girmez) |
| 9 | `message` | Annenin mesajı, bildirim kartı | Tatlı iki notalı mesaj sesi |
| 10 | `bark` | Şans cüzdan getirince, Şans'a dokununca | Mutlu, kısa tek havlama (gerçek köpek, sevimli) |
| 11 | `arrive` | Yeni araç sahneye kayarken, taşınma | Yumuşak "vuuş", motor sesi değil (bisiklet de arabada aynı) |
| 12 | `reward` | Reklam ödülü, ×2 hızlandırıcı açılınca | Büyülü parıltı, yükselen çan |
| 13 | `loss` | Olay kartında tutmayan cevap, paralar dökülürken | Düşen paralar + hafif "ııh" duygusu, eğlenceli, cezalandırıcı değil |
| 14 | `unlock` | Kilitli düğme açılınca, yeni sekme, yadigâr alımı | Kilit açılma tıkı + küçük çan |

Kural (CLAUDE.md): anlamlı her oyuncu eylemi ses çalar; kilitli ve beklemedeki düğme çalmaz. Aynı ses 70 ms içinde ikinci kez çalmaz (var).

## 3. Müzik (oyunda, 2026-10-17)

Kaynak: ElevenLabs Music v2.5, 2026-10-15'te üretilen 40 sn'lik 8 parça (`art/audio/music-2026-10-15/`); kullanıcı dördünü seçti. Hepsi −18 LUFS'e eşitlendi; sonu sıfıra kadar kısılır (ukulelede son 4 sn, çünkü birden kesiliyordu), ardından 0,5 sn sessizlik, sonra döngü baştan.

| Parça | Dosya | Nerede | Kaynak |
| --- | --- | --- | --- |
| Ana ekran | `home.mp3` | Ana ekran | 3 ukulele + ıslık |
| Sakin | `calm.mp3` | İşletmeler ve Yatırım ekranları (kullanıcı: daha yavaş orkestral, sayfaya geçince değişsin) | 1 orkestral ana tema |
| Hikâye | `story.mp3` | Önsöz, sınıf törenleri, hayat anları, "Yıllar geçti", albüm | 2 piyano motifi |
| Olay kartı | `event.mp3` | Açık olay kartı | 5 komik pizzicato |

Kullanılmayan: 4 gitar + piyano (hikâye yedeği), 6 caz (olay kartı yedeği), 7 ve 8 (tanıtım videosu için).

**Kurallar (kod `runtime/feedback.ts`):** ekran istediği parçayı `useMusic(track)` ile ister; öncelik hikâye > olay kartı > sakin > ana ekran. Parça değişirken 0,8 sn geçiş; hikâye her seferinde baştan, diğerleri kaldığı yerden. Müzik %35 seste; ilk dokunuşta başlar (WebView kuralı), uygulama arka plandayken ve ödüllü reklam oynarken durur. Anahtarlar cihazda saklanır (`localStorage`), oyun kaydında değil. Lumen müziği (M3) 2. nesille gelir; önsözün yağmur ambiyansı isteğe bağlı.

## 4. Nereden (araştırma 2026-10-17)

| Yol | Ne için | Maliyet | Lisans | Not |
| --- | --- | --- | --- | --- |
| **ElevenLabs Sound Effects v2 (fal.ai)** | 14 efekt | $0,002/sn: 14 efekt × ~2 sn × 3 deneme ≈ **$0,20** | Ticari kullanım | Tarifle üretilir, aile tutarlılığı kolay; fal bakiyesi (~$2,5) yeter |
| Kenney UI Audio, Pixabay | Efekt | Ücretsiz | CC0 / Pixabay Lisansı (ticari, atıf gerekmez) | Hazır; tek ailede bulmak daha zor |
| **Pixabay Music** | M1–M3 | Ücretsiz | Pixabay Lisansı: oyunda kullanmak serbest, dosyayı tek başına satmak yasak | Önce burada aranır; aynı motifle üç parça bulmak zor |
| ElevenLabs Music v2.5 (fal.ai) | M1–M3, ortak motifle | $0,60/dk: 3 parça × 1,5 dk × 2 deneme ≈ **$5,4** | Lisanslı veriyle eğitilmiş, ticari | Bakiyeyi aşar (yükleme gerekir); en temiz lisans |
| Google Lyria 2 (fal.ai) | Müzik | $0,10/30 sn ≈ **$1,8** | Ticari (fal şartları) | Ucuz deneme yolu |
| Suno (Pro) | Müzik | ~$10/ay | Ticari kullanım hakkı ama sahiplik tartışmalı, plak şirketi davaları sürüyor | Önerilmez |

**Öneri:** efektler ElevenLabs SFX ile (ucuz, tek aile). Müzikte önce Pixabay'de M1 ve M2 aranır; ortak motifli bir aile bulunamazsa Lyria 2 ile denenir, beğenilmezse ElevenLabs Music. Sesleri yalnız kullanıcı dinleyip seçebilir: Claude üretir, telefonda dinlenecek kısa bir liste (DEV menüsünde "Sesleri dinle") hazırlar.

Kaynaklar: [Pixabay lisansı (SSS)](https://pixabay.com/service/faq/), [Pixabay kullanım şartları](https://pixabay.com/service/terms/), [Kenney UI Audio (Godot)](https://godotengine.org/asset-library/asset/795), [Kenney arayüz sesleri (OpenGameArt)](https://opengameart.org/content/interface-sounds), [Eleven Music lisansı (Tom's Guide)](https://tomsguide.com/ai/elevenlabs-reveals-ai-music-generator-and-it-has-full-commercial-rights), [Suno ve Udio lisansları 2026](https://blog.dubspot.com/ai-music-licensing-explained-2026), fiyatlar fal.ai'nin kendi fiyat listesinden (2026-10-17).

## 5. Efektlerin yerleri (oyunda)

`click` düğmeler · `coin` şişe/para toplama · `purchase` her ilerleme (sahne) · `levelUp` yükseltme (işletmede seviyeyle tizleşir), kariyer · `grow` işletmenin yeni görünümü (şovun patlaması) · `hire` yönetici alımı · `payout` ödül kartları, görev, günlük ödül, çevrimdışı, Şans'ın cüzdanı, tören hediyesi, yatırım kazancı · `fanfare` sınıf töreni başlığı · `page` hikâye balonu ve önsöz ilerlerken, hayat anının açılışı · `ring` olay kartının arama düğmesi belirince · `message` annenin mesajı · `bark` Şans cüzdanla gelince ve okşanınca · `arrive` yeni araç · `reward` reklam ödülleri, ×2 · `loss` olay kartı ve yatırım kaybı · `unlock` yadigâr alımı.
