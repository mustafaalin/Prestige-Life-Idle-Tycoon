# Tartışma notları (sonra konuşulacak)

Kararı henüz verilmemiş konular ve Claude'un önerileri. **Karar verilince ilgili belgeye (plan, hikâye, tasarım, monetizasyon) taşınır ve buradan silinir**; burada sadece açık konular durur.

Son güncelleme: 2026-10-11 (§8 eklendi: genel gözden geçirme; önceki temizlik 2026-10-08: görsel yaklaşım, konut modeli, ömür modeli, tempo, aylık gelir, ana ekran ve monetizasyon kararları ilgili belgelere taşındı)

## 1. Görsel: açık kalanlar

Görsel roman yaklaşımı ve yarı 3D stil kararlaştırıldı ([story-v2.md §8](./story-v2.md)). Açık kalanlar:

- **Özel anlar için video (isteğe bağlı, sonra):** "Eski evimizi geri aldım" gibi 2–3 büyük anda kısa yapay zekâ videosu. Yol: Higgsfield MCP (`claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp`, `/mcp` ile giriş; Kling 3.0, Seedance 2.0, Veo 3.1, Soul ID), yedek fal.ai. Her üretimden önce maliyet söylenir; kabul ölçütü kabul edilen bir animasyonun toplam maliyeti.
- **İskeletli 2D (Spine / Rive):** Oyun testi "karakter hareketi şart" demezse gerek yok.

## 2. Remotion (github.com/remotion-dev/remotion)

React ile kodla video üretme çerçevesi; yeni görüntü üretmez, var olanları düzenler. Bireyler ve en fazla 3 çalışanlı şirketler için ticari kullanım ücretsiz.

| Kullanım | Değer | Zaman |
| --- | --- | --- |
| Mağaza tanıtım videosu ve reklamlar (Play Store, TikTok, Reels; TR/EN, dikey/yatay) | Yüksek | Yayından önce (Faz 3) |
| Mağaza ekran görüntüleri (her dil ve cihaz boyutu) | Orta | Yayından önce |
| "Hayat hikâyen" paylaşım videosu | Deneysel | Faz 2+ |
| Oyun içi tören ve hikâye kartları | Düşük (oyun zaten React) | Gerekmez |

**Öneri:** Yayından önce repoda ayrı bir `video/` klasöründe tanıtım videoları için kurulsun.

## 3. Yaş ve ömür: açık ayrıntılar

Ana kurallar kararlaştırıldı ([game-design-v2.md §4.9](./game-design-v2.md)). Kalanlar:

- **Hikâye anlarında yaş dursun mu?** Öneri: tam ekran törende durur (1.10). Önsöz zaten oyun başlamadan oynar.
- **Ömür sonu uyarısı:** "65 yaşındasın, 32 yılın kaldı" gibi bir hatırlatma; zirveye ulaşmamış oyuncunun "sonu göremedim" hissi. Üst bar artık sadece yaşı gösteriyor ("kalan yıl" 2026-10-08'de kalktı).
- **En Zengin'den sonrası:** İçerik yok (kullanıcı: "ileride bakarız").
- **Gönüllü erken emeklilik:** Yok (kullanıcı: erken devir olmasın).

## 4. Faz 2.1 hanedan soruları ([story-v2.md §6](./story-v2.md))

Kararlaştırılanlar (2026-10-08, story §6): varis 17 yaşında bir torun, ölüm gösterilmez, 4. perde oynanabilir bir vakıf projesi, eş Nevin Hanım'ın torunu.

1. **Torunun cinsiyeti.** Öneri: oyuncu seçsin (tek seçim). Bütçe kısıtlıysa sabit, seçim sonra.
2. **2. neslin açılış sahnesi.** Öneri: küçük yurt odası veya kiralık oda, sokak değil. "Para yok ama ad var" Aile İtibarı ile örtüşür.
3. **2. nesil kıyafet ve poz seti.** Öneri: aynı yaşam aşaması sayısında yeni set; babadan kalan bir yadigâr (saat veya Şans'ın tasması) hep görünsün.
4. **Varis çok hızlı:** 1. ömür ~3.000 miras puanı (×31 gelir) bırakıyor; 2. nesil dakikalar içinde Milyoner ve üstü. Miras formülüyle birlikte ele alınacak.

## 5. Ekonomi (2026-10-09 yeniden ayarlandı; geniş konuşma bekliyor)

**Yapılan (kullanıcıyla, 2026-10-09):** başta ana gelir iş, işletmeler sonra ağırlığı alır. Çiçek Tezgâhı $250; işletme fiyat adımı 3× → 20× (büyüyerek; son işletme $26B); tur süreleri 1–5 sn, sonra 7–15 sn; adet zammı %20 → %10; yönetici ilk adetin 12 katı; yükseltme fiyatı o adede ulaşma maliyetinin 2× / 6× / 20×'i; kilometre taşları 25, 50, 75 (bir ömürde ~70 adet alınıyor); geç kariyer maaşları sert kısıldı; ev kirası yavaşladı (1M$'lık ev 12 saatte döner); yaşlanma 1 dk ≈ 3 hafta (ömür ~21 saatlik oyun). Simülatör (en iyi oynayan bot): Gündelikçi 8 dk, İşçi 32 dk, Orta Sınıf 47 dk (2. oturum), Milyoner 1 sa (3. oturum), Milyarder 3. gün, Multimilyarder 8. gün, En Zengin 17. gün (59 yaş), ömür sonu 31. gün. Kod: `config/businesses.ts`, `upgrades.ts`, `careers.ts`, `housing.ts`, `life.ts`, `economy.ts`.

**Açık sorular (testten sonra konuşulacak):**

- **Son işletmeler yine az alınıyor.** Bot Otel ve Teknoloji Girişimi'ni (bazen Fabrika'yı) almıyor: eski işletmeler kilometre taşı ve yükseltmeyle çok katlandığı için yeni işletme sıfırdan başlayınca zayıf kalıyor. Fiyat ayarıyla çözülmüyor (geniş tarama yapıldı). Çözüm fikri: her yeni işletme ya da her kilometre taşı tüm gelire kalıcı bir bonus versin (AdVenture Capitalist'teki "hepsinden 25 adet = ×2" gibi).
- **Orta Sınıf artık ilk oturumda değil** (botta 47 dk, 2. oturum). Defter sorusu yine oturum sınırını geçiyor (Orta 2., Milyoner 3. oturum). Ama Faz 1 kapısındaki "ilk oturumda Orta Sınıf ≥ %60" ölçütü yeniden yazılmalı.
- **İlk yönetici 19. dakikada**; o zamana kadar 1 sn'lik Çiçek Tezgâhı için sürekli "Çalıştır"a basılıyor. Telefonda yorucuysa ilk tur 2 sn ya da ilk yönetici ucuz.
- **Kariyer/işletme dengesi:** ilk 4 dk gelir tamamen maaş, Gündelikçi'de %73 işletme, ömür boyunca ortanca %97 işletme. "Başta kariyer" daha uzun sürsün mü?
- Çevrimdışı ödül ve ev bonusları (önceki not), reklamsız / reklam izleyen / ödeyen profilleri.

## 6. Simülatörün sınırları (GPT Astra incelemesi, doğrulandı)

- Bot yöneticisiz işletmeleri %60 verimle çalışıyor sayıyor (`ACTIVE_UNMANAGED_EFFICIENCY`); gerçek oyunda sadece "Çalıştır"la başlatılan döngü ödenir.
- Bot açgözlü ve optimal; menü okuma, hikâye izleme, kararsızlık yok. "Gerçek oyuncu 1,3–1,8 kat yavaş" ölçülmüş değil, tahmin; kullanıcının gözlemi ise tersine "hızlı" (§5).
- Önerilen ek profiller: ilk 2 dakikada çıkan, yöneticiyi geciktiren, günde iki kez dönen, 24 saat ara veren (+ §5'teki reklam/ödeme profilleri).
- Gerçek doğrulama oyun testi ve analitikle (plan 1.14–1.15).

## 7. Evler, kıyafetler ve sahne: kalan sorular

**Kararlaşan (2026-10-09):** ana ekran sınıfı izler. Her tören kahramanı o sınıfın yerine ve kıyafetine taşır (6 aşama: sokak, minibüs, kiralık daire, site, müstakil ev, villa; 4 kıyafet). Kod `src/game/ui/scene/stages.ts`, görsel listesi [art-brief-v2.md](./art-brief-v2.md). Görselleri önce GPT üretecek (kullanıcı projeyi gören bir GPT ile deneyecek), beğenilmezse fal.ai.

**Kararlaşan (2026-10-10):** arka plan oturulan ev, en iyi araç önünde park eder; ev sayısı 12; sınıf töreni hikâyenin evine taşır (game-design §4.8). Kıyafet, Şans'ın tasması ve toplanacaklar sınıfı izlemeye devam eder.

**Kararlaşan (2026-10-11):** mağazada hikâyenin 4 kıyafeti; kahraman sahip olduğu en iyisini giyer, sınıf töreni sınıfın kıyafetini bedava verir (evlerle aynı model, game-design §4.4). Araç 16 → 10, yeni hayat araçsız başlar ([art-prompts-v2.md](./art-prompts-v2.md) §2; game-design §4.4).

**Açık:**

- **Lüks oyuncaklar (tekne, yat, helikopter, jet)** sahnede yok (plan 2.6).
- **Apartman evlerinde dış mekân mı iç mekân mı?** Şimdilik dış mekân (bina girişi ve avlu), çünkü iç mekânda araç görünmez.
- **Ara anlar** ("ilk sıcak yemek" gibi): art-brief H6 isteğe bağlı.

## 8. Genel gözden geçirme: ilerleme hissi ve tutarsızlıklar (2026-10-11, konuşulacak)

Claude'un hikâye, tasarım belgesi, plan ve simülatör zaman çizelgesi üzerinden gözlemi. **Hiçbiri kararlaştırılmadı**; kullanıcı yeni oturumda birlikte konuşmak istedi. Ana sonuç: fakirlikten zenginliğe geçiş ilk ~2 saate sıkışmış, kalan ~19 saat neredeyse boş.

**Zaman çizelgesi** (`npm run sim -- --purchases --timeline`, en iyi oynayan bot, ev–araç zincirinden sonra; gerçek oyuncu farklı olabilir):

| Oynama süresi | Gün | Ne oluyor |
| --- | --- | --- |
| 0–8 dk | 1 | Çadır; 4. dk'da bisiklet |
| 8 dk | 1 | Gündelikçi töreni, minibüs |
| 27 dk | 1 | Kiralık oda, emektar sedan |
| 32 dk | 1 (2. oturum) | İşçi töreni, eski daire |
| 46 dk | 1 (3. oturum) | Orta Sınıf töreni, site |
| 54 dk | 2 | Milyoner töreni, ilk ev |
| 1 sa 40 dk | 3 | Milyarder töreni, villa |
| 2–3,5 sa | 3–6 | Göl evi, süper araba, grand lüks, sahil malikânesi |
| 5 sa | 8 | Multimilyarder töreni |
| 8,5 sa | 13 | Büyük malikâne |
| 11 sa | 17 | En Zengin töreni |
| 11–21 sa | 17–31 | Hiçbir şey; ömür 97 yaşında biter |

**Hissi en çok zayıflatanlar:**

1. **İlk oturumda tek tören.** 30 dakikalık ilk oturumda yalnızca Gündelikçi (8. dk); oturum minibüste ya da kiralık odada bitiyor. İşçi 32. dk (2. oturum). [story-v2.md](./story-v2.md) hâlâ "İşçi 15 dk, Orta Sınıf 30 dk, ilk oturumun sonu" diyor (§5'teki 2026-10-09 ayarından önce).
2. **Erken evler çok kısa, son evler çok uzun.** Kiralık oda 5 dk, eski daire 8, site 8 dk; büyük malikâne 12 saatten fazla.
3. **3,5. saatten sonra ekranda neredeyse hiçbir şey değişmiyor.** Araçlar ve kıyafetler bitiyor; sonraki 17 saatte iki tören, iki ev, annenin birkaç mesajı.
4. **Zenginlik ekranda eski dairede duruyor** (görsel bekleyenler): kıyafet 3 ve 4, Şans'ın deri ve altın tasması, banknotlar, 9 ev.

**Tutarsızlıklar:**

- **Yaş ile hikâye:** Milyarder 23, Multimilyarder 35, En Zengin 58 yaş. Önsözden son törene 41 yıl: anne pastayı aldığında ~90, Rıza Amca atölyede ~80. Portreler yaşlanmıyor; kahraman 58 yaşında 23'lük görünüyor (§3 ile birlikte ele alınır).
- **"İlk Kendi Evin" kiralık:** Milyoner töreni kahramanı ev 7'ye kiracı olarak taşıyor; mağazada adı "İlk Kendi Evin", üstünde "Kiracısın".
- **Defne yarım kalıyor:** 32. dk'da tanışma, Milyoner'de annenin bir mesajı, sonra oyunun sonuna kadar yok (devamı Faz 2).
- **Eskimiş belgeler:** [game-design-v2.md](./game-design-v2.md) §4.2, §4.3 ve §5 tabloları 2026-10-08'den (Çiçek Tezgâhı $25; oyunda $250; güncel değerler `npm run sim -- --config`). [story-v2.md](./story-v2.md): "8 tören" (7 var), "16 araç" (12 var), "elmas tasma" (kodda yok), tören süreleri; game-design §4.8 "Gündelikçi → kiralık oda" (oyunda minibüs). §7'deki "araç 16 → 10" artık 12 ve ev–araç zinciri.

**Eksikler (çoğu planda):** hayaller panosu (1.8; zincirden sonra daha değerli, sıradaki adım hep belli), lüks oyuncaklar sahnede (2.6), yağmur ve ortam sesi, Şans'ın dönüşte kapıda uyuması, Nevin Hanım ve Defne portreleri, konak ve pasta karesi, En Zengin'den sonrası (§3).

**Claude'un önerdiği sıra (karar kullanıcıda):**

1. Görseller: evlerden sonra kıyafet 3 ve 4 ile tasmalar (hissi en çok artıranlar).
2. **Yaş temposu:** En Zengin'e kadar yıllar daha yavaş (zirve ~40 yaş), zirveden sonra hızlı. Hem annenin ve Rıza Amca'nın yaşını makul yapar hem sondaki boş ~10 saati kısaltır. Simülatörle denenmeli.
3. **İlk oturum:** İşçi törenini ilk oturuma (~25. dk) çekmek; ekonomi ayarı, simülatörle.
4. **Ev 7'nin adı:** "Bahçeli Küçük Ev" gibi bir ad; "ilk kendi evin" duygusu ilk satın almaya kalsın (bedava sahiplik kira gelirini bozar).
5. Hayaller panosu: ana ekranda zincirin sıradaki adımı.
6. Belgeleri güncel duruma getirmek (karar gerektirmez).
