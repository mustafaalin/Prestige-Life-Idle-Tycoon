# Tartışma notları (sonra konuşulacak)

Kararı henüz verilmemiş konular ve Claude'un önerileri. **Karar verilince ilgili belgeye (plan, hikâye, tasarım, monetizasyon) taşınır ve buradan silinir**; burada sadece açık konular durur.

Son güncelleme: 2026-10-08 (temizlendi: görsel yaklaşım, konut modeli, ömür modeli, tempo, aylık gelir, ana ekran ve monetizasyon kararları ilgili belgelere taşındı)

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

**Açık (kapalı testten sonra):**

- **Mağaza evleri ve kıyafetleri sahneyle nasıl bağlanacak?** Bugün 25 ev ve 20 kıyafet mağazada duruyor, ama sahneyi değiştirmiyor. Kullanıcının yönü: ev 10–12 olsun, kıyafet 4–5 olsun, oturulan ev arka planı belirlesin, araç evin önünde dursun. Claude'un önerisi: sınıf içinde ikinci, daha iyi ev isteğe bağlı alım olarak kalsın; kıyafet gelir bonusu ev, araç ya da aksesuara kaysın. Bot ilk 30 dakikada 9 kez taşınıyor (`npm run sim -- --purchases`). Ekonomiyi etkiler, `npm run sim` ile yapılır.
- **Apartman evlerinde dış mekân mı iç mekân mı?** Şimdilik dış mekân (bina girişi ve avlu), çünkü iç mekânda araç görünmez.
- **Ara anlar** ("ilk sıcak yemek" gibi): art-brief H6 isteğe bağlı.
