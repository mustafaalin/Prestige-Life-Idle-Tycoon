# Ses ve müzik (v2)

Son güncelleme: 2026-10-17 · Kod: `src/game/runtime/feedback.ts` · Plan: [rebuild-plan.md](./rebuild-plan.md) 1.11 · İlgili: [discussion-notes.md §6](./discussion-notes.md) ("eksik his parçaları")

## 1. Bugün oyunda olan

- **4 ses efekti, hepsi v1'den:** `coin` (toplama, ödül), `purchase` (alım), `levelUp` (yükseltme, iş, yönetici, tören), `click` (düğmeler). 21 ekranda çağrılıyor. `gem_collect.mp3` duruyor ama kullanılmıyor.
- **Müzik yok.** `public/assets/audio/music/main_theme.mp3` (3,6 MB, v1) hiçbir yere bağlı değil.
- **Ayarlarda ses ve müzik düğmesi yok** (yalnız bildirim anahtarı).
- Tören, hikâye balonu, olay kartı, annenin mesajı, Şans, yeni araç, reklam ödülü ve kayıp anlarında ses yok; çoğu `levelUp` ya da `click` ile geçiştiriliyor.

## 2. Ses efektleri (14; öneri)

İlk dördü v1'in yerine yeni üretilir (iki çizim dili gibi iki ses dili olmasın). Hepsi kısa (0,2–2 sn), aynı "sıcak, oyuncaklı, yumuşak" ailede; sert elektronik bip yok.

| # | Anahtar | Nerede | Tarif |
| --- | --- | --- | --- |
| 1 | `click` | Düğmeler, sekmeler | Yumuşak, tok bir tık; tahta ya da plastik oyuncak |
| 2 | `coin` | Şişe/para toplama, para uçuşu | Tek parlak bozuk para şıngırtısı (sık çalar: hafif ve kısa) |
| 3 | `purchase` | İşletme, eşya, ev alımı | Kasa "ka-çing"i, kısa |
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

## 3. Müzik (3 parça; öneri)

| # | Parça | Nerede | Tarif |
| --- | --- | --- | --- |
| M1 | Ana ekran | Ana ekran, menüler | Sıcak, hafif, umutlu; akustik gitar ya da ukulele, yumuşak piyano, hafif vurmalı. 85–95 BPM, sözsüz, dikkat çekmeyen. 60–90 sn, kusursuz döngü |
| M2 | Hikâye | Önsöz, sınıf törenleri, hayat anları, devir | Duygusal, yumuşak piyano ve yaylılar; M1'in ana ezgisinin yavaş hâli (aynı motif aileyi bağlar). 60 sn döngü |
| M3 | Lumen | 2. neslin ana ekranı | M1'in motifi, aynı çalgılar + hafif synth pad; "aynı aile, yeni şehir". 2. nesille gelir |

İsteğe bağlı (sonra): önsözün ilk karesinde yağmur ambiyansı (discussion-notes §6 "yağmur ve ortam sesi").

**Kurallar:**
- Müzik sesi efektlerin altında (~%35); tören ve hayat anında M1 yumuşakça M2'ye geçer, bitince döner (0,8 sn geçiş).
- Uygulama arka plana gidince müzik durur, dönünce kaldığı yerden devam eder; reklam oynarken de durur.
- Android WebView sesi ilk dokunuştan önce başlatmaz: müzik ilk dokunuşta başlar.
- **Ayarlar:** iki anahtar, "Ses efektleri" ve "Müzik", varsayılan açık; cihazda saklanır (oyun kaydında değil).
- Dosyalar: efektler mp3, her biri ≤ 40 KB; müzik mp3 128 kbps, parça başı ≤ 1,5 MB (APK boyutu).

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

## 5. Kod (Claude; kaynak seçilince)

- `feedback.ts`: yeni efekt anahtarları, `musicPlay('home' | 'story')`, geçiş, arka planda durma, ses anahtarları.
- `SettingsSheet.tsx`: iki anahtar (TR + EN).
- Çağrı yerleri: tablodaki "Nerede" sütunu.
- DEV menüsü: "Sesleri dinle" (her efekt ve parça bir düğme).
