# GPT'ye: ilerleme hissi, geç oyun hedefi, reklam, IAP ve liderlik tablosu önerileri

Tarih: 2026-10-14 · Hazırlayan: Claude · Durum: **öneri; hiçbiri karar değil.** Kullanıcı önerileri beğendi, başlamadan önce senin görüşünü istiyor.

## Senden istenen

Aşağıdaki teşhisi ve önerileri eleştirel gözle değerlendir. Özellikle:

1. Teşhis doğru mu? Gözden kaçan başka bir sebep var mı?
2. Her öneri için: katılıyor musun, neyi değiştirirdin, riski ne?
3. Daha iyi ya da daha basit bir alternatifin varsa öner (kullanıcı fazla dallanan, çok sistemli çözümleri sevmiyor; az ve güçlü sistem tercih ediliyor).
4. Önerilen sırayı onaylıyor musun?
5. Rakip örnekleri (idle tycoon, hayat simülasyonu) varsa somut kaynakla ekle.

Kod değiştirme. Cevabını bu dosyanın sonuna "## GPT'nin görüşü" başlığıyla ya da ayrı bir `docs/gpt-review-progression-monetization-answer.md` dosyasına yaz.

Bağlam için oku: `docs/game-design-v2.md` (§1 vaat, §4.1 sınıflar, §4.4 statü eşyaları, §4.5 miras, §5 tempo), `docs/monetization-v2.md` (reklam yerleri §4, IAP §5), `docs/discussion-notes.md` §8 (ilerleme hissi), `docs/story-v2.md` (ton, karakterler).

## Oyunun kısa özeti

Sokaktan dünyanın en zenginine, tek ömürde (17 → 80 yaş, ~17 saatlik oyun, bağlı oyuncuda ~25 gün). 8 sınıf: Sokak → Gündelikçi ($1K) → İşçi ($100K) → Orta Sınıf ($1M) → Milyoner ($10M) → Milyarder ($1B) → Multimilyarder ($100B) → En Zengin ($1T). **Sınıf kazanılan toplam paraya bağlı, harcamaya değil** (alışveriş sınıf düşürmez). Gelirin ~%96'sı işletmelerden. Statü eşyaları (12 ev, 12 araç, 4 kıyafet, 4 lüks) gider değil, tüm gelire kalıcı yüzde bonus verir. 80 yaşında emeklilik, torun miras puanıyla (her puan +%1 gelir) devralır.

## Teşhis (simülatör verisi, 2026-10-14, en iyi oynayan bot)

**1. Pahalı lüksler alınmaya değmiyor.**

| Eşya | Fiyat | Bonus | Bot ne zaman alıyor |
|---|---|---|---|
| Sürat teknesi | $5B | +%10 | 4. saat |
| Mega yat | $50B | +%10 | En Zengin olduktan sonra (11. saat) |
| Helikopter | $200B | +%10 | Ömür bitmeden 10 dk önce |
| Özel jet | $1T | +%10 | **Hiç** |

En Zengin anında gelir ~$9M/sn (~$32B/saat). Jet ~31 saatlik gelir; +%10 ile kendini ~300 saatte öder, ömür yetmez. Rasyonel oyuncu jeti almaz.

**2. Pahalı bir şey almak hiçbir kapı açmıyor.** Sınıf harcamadan bağımsız; lüksler sahnede görünmüyor (yalnızca mağazada); hikâyede karşılığı yok.

**3. Geç oyun boş.** Fakirlikten zenginliğe geçiş ilk ~2 saatte. 4. saatten sonra ekranda neredeyse hiçbir şey değişmiyor: araçlar ve kıyafetler bitmiş, sonraki ~13 saatte iki tören, bir ev, birkaç anne mesajı (discussion-notes §8).

## Öneriler

### A. Servet (net değer)
Nakit + evlerin, araçların, lükslerin ve işletmelerin değeri = tek sayı. Satın alma serveti düşürmez (para varlığa dönüşür), böylece "harcarsam geri kalırım" hissi kalkar. Sınıf yine kazanılan toplama bağlı kalır (değişmez).

### B. Dünyanın zenginleri listesi (kurgusal, sunucusuz)
Milyarder töreniyle açılır. Oyuncu ~#3.428'den başlar, hayalî zenginleri servetle tek tek geçer. Rakiplerin bir kısmı hikâyeden (Bülent Bey, eski patron, rakip bir aile). Sıra servete göre olduğu için jet almak oyuncuyu doğrudan birkaç sıra yükseltir: "1 trilyona neden alayım" sorusunun cevabı. "Dünyanın en zengini" vaadini 4. saatten sonra da görünür kılar. Ayrı bir XP/prestij puanı yerine bunu öneriyorum, çünkü oyunda zaten miras puanı (aile itibarı) var; üçüncü bir puan kafa karıştırır (v1'deki "prestij = görev sayısı" iyi çalışmamıştı).

Açık sorular: listeye girmek bir ödül veriyor mu (ör. her geçilen rakipte küçük bir anne/rakip mesajı), En Zengin sınıfı ile listede #1 aynı an mı olmalı, varisin listesi nasıl başlar.

### C. Lüksler bir şey açsın, yalnızca yüzde vermesin
- Sahnede görünsünler (plan 2.6): helikopter sahnenin üstünden geçer, yat sahil evinde görünür, jet gökyüzünde.
- Her biri bir hikâye anı: ör. jet → annenin "jetinle gel beni al" mesajı; ileride yeni şehir/nesil içeriği kapısı.
- Bonuslar simülatörle yeniden ayarlansın: lüksler bir ömür içinde kendini ödeyen alımlar olsun.

### D. Yeni reklam yerleri (hepsi ödüllü, isteğe bağlı)
Şu an oyunda 4 yer: çevrimdışı +%30, Şans'ın cüzdanı ×2, 1 saatlik ×2 hızlandırıcı, "biraz yardım" (15 dk gelir). Önerilenler:
- **Olay kartında ikinci şans** (zaten planlı; kartlar oyunda, en kolayı).
- **"Şans'ı şimdi gönder":** Şans'ın bekleme süresini atlar, günde 2–3.
- **Hayat anı hediyesi ×2** (düğün, doğum).
- Planlı ama henüz yapılmamış: tören hediyesi ×2 (hediyenin kendisi yok), günlük hediye ek çevirme (Faz 2.7).

İlkeler değişmiyor: zorla reklam (interstitial) yok, reklamsız oyuncu da tatmin olmalı, reklam izleyen ~%20–30 hızlı.

### E. IAP
Kararlaştırılmış 4 ürün henüz kodda yok: Rahat Paket (reklamsız ödüller) $7,99, Şans'ın Altın Tasması (kalıcı ×2 gelir) $4,99, Yeni Başlangıç $1,99, Gece Vardiyası Ekibi (çevrimdışı %100 + 2 sa tavan) $3,99. Bulunan iki sorun:
- **Ad çakışması:** Şans Milyarder'de altın tasmayı oyunda zaten bedava alıyor. IAP'ın adı ve görseli değişmeli (ör. yakut tasma ya da kırmızı fular).
- **Kalıcı ×2 boş geç oyunu büyütür:** ödeyen zirveye yarı sürede varıp uzun bir boşlukla kalır. B ve C olmadan satılmamalı.

Ek öneri: para çantası ("X saatlik gelir", tüketilir, $0,99–4,99) ucuz giriş noktası; kozmetik (Şans'ın tasması/fuları) pay-to-win değil ama her biri yeni görsel ister.

### F. Liderlik tablosu
Şimdi değil. Kayıt telefonda (yerel), sunucu doğrulaması yok: saat ileri alınarak skor şişirilebilir; ödeyen oyuncu baskın olur. Teknik not: bulunan Capacitor eklentisi (capacitor-game-connect) Capacitor 3–5 destekliyor, projede Capacitor 8 var. AdVenture Capitalist genel servet yerine kısa süreli etkinliklerde liderlik tablosu kullanıyor. Sıra: önce kurgusal liste (B), sonra Play Games başarımları, gerçek liderlik tablosu etkinliklerle birlikte (Faz 3).

## Önerilen sıra

1. Servet + zenginler listesi (tasarım, simülatör, lüks bonuslarının yeniden ayarı)
2. Lükslerin sahnede görünmesi ve birer hikâye anı
3. Olay kartında ikinci şans reklamı
4. IAP (tasma adı değişir, 4 ürün bağlanır, sonra para çantası)
5. Başarımlar; liderlik tablosu sonra
