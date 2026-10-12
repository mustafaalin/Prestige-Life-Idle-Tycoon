# Tartışma notları (sonra konuşulacak)

Kararı henüz verilmemiş konular ve Claude'un önerileri. **Karar verilince ilgili belgeye (plan, hikâye, tasarım, monetizasyon) taşınır ve buradan silinir**; burada sadece açık konular durur.

Son güncelleme: 2026-10-12 (belgeler gözden geçirildi: kararlaşmış konular ve eskimiş sayılar çıkarıldı)

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

- **Kahraman yaşlanmıyor (2026-10-11, kullanıcı: şimdilik kalsın):** 31'inde baba, 63'ünde dede olan kahraman 17'lik görünüyor. Seçenekler: 3 görünüm (genç, yetişkin, kır saçlı; portreler ve sahne pozları katlanır) ya da yalnızca portreler yaşlanır. Kıyafet 3 ve 4 henüz üretilmedi; onları yetişkin ve olgun hâliyle tasarlamak en ucuz yol, ama hızlı oyuncuda kıyafet yaştan önce gelir.
- **Anne ve Şans, En Zengin'den sonra:** anne 59'da ~87 yaşında, Şans 40 yıldır yanında. Ölüm gösterilmiyor. Öneri: annenin mesajları En Zengin'den sonra biter, kanal Defne ve kızına geçer; Şans'ın yerini yavrusu alır.
- **Ömür sonu uyarısı:** "65 yaşındasın, 15 yılın kaldı" gibi bir hatırlatma; zirveye ulaşmamış oyuncunun "sonu göremedim" hissi. Üst bar artık sadece yaşı gösteriyor ("kalan yıl" 2026-10-08'de kalktı).
- **En Zengin'den sonrası (59 → 80):** hayat anları dolduracak (torun, devir; [story-v2.md §4c](./story-v2.md), testten sonra); başka içerik yok.
- **Gönüllü erken emeklilik:** Yok (kullanıcı: erken devir olmasın).

## 4. Faz 2.1 hanedan soruları ([story-v2.md §6](./story-v2.md))

Kararlaştırılanlar (story §6, §4c): varis 17 yaşında bir torun (kahramanın kızının çocuğu), devir 80 yaşında, ölüm gösterilmez, 4. perde oynanabilir bir vakıf projesi, eş Nevin Hanım'ın torunu Defne.

1. **Torunun cinsiyeti.** Öneri: oyuncu seçsin (tek seçim). Bütçe kısıtlıysa sabit, seçim sonra.
2. **2. neslin başlangıcı.** Yön kararı (2026-10-11): torun sıfırdan değil, biraz alttan başlar. Açık: nereden ve neyle. Öneri: küçük yurt odası veya kiralık oda ve dedesinin ilk tezgâhı; servet vakfa gittiği için "para yok ama ad var" Aile İtibarı ile örtüşür.
3. **2. nesil kıyafet ve poz seti.** Öneri: aynı yaşam aşaması sayısında yeni set; babadan kalan bir yadigâr (saat veya Şans'ın tasması) hep görünsün.
4. **Varis çok hızlı:** 1. ömür ~1.400 miras puanı (×15 gelir; ömür 80 yaşla) bırakıyor; 2. nesil dakikalar içinde Milyoner ve üstü. Miras formülüyle birlikte ele alınacak.

## 5. Ekonomi: açık sorular

Ekonomi 2026-10-09'da kullanıcıyla yeniden ayarlandı (başta ana gelir iş, sonra işletmeler); güncel kurallar ve sayılar [game-design-v2.md §4–5](./game-design-v2.md). Kullanıcı telefonda deneyecek; aşağıdakiler testten sonra konuşulacak:

- **Son işletmeler az alınıyor.** Bot Otel ve Teknoloji Girişimi'ni (bazen Fabrika'yı) almıyor: eski işletmeler kilometre taşı ve yükseltmeyle çok katlandığı için yeni işletme sıfırdan başlayınca zayıf kalıyor. Fiyat ayarıyla çözülmüyor (geniş tarama yapıldı). Çözüm fikri: her yeni işletme ya da her kilometre taşı tüm gelire kalıcı bir bonus versin (AdVenture Capitalist'teki "hepsinden 25 adet = ×2" gibi).
- **Orta Sınıf ilk oturumda değil** (botta 47 dk, 1. günün 3. oturumu; Milyoner 2. gün). Defter sorusu yine oturum sınırını geçiyor. Faz 1 kapısındaki "ilk oturumda Orta Sınıf ≥ %60" ölçütü yeniden yazılmalı.
- **İlk yönetici 19. dakikada**; o zamana kadar 1 sn'lik Çiçek Tezgâhı için sürekli "Çalıştır"a basılıyor. Telefonda yorucuysa ilk tur 2 sn ya da ilk yönetici ucuz.
- **Kariyer/işletme dengesi:** ilk 4 dk gelir tamamen maaş, Gündelikçi'de %73 işletme, ömür boyunca ortanca %95 işletme. "Başta kariyer" daha uzun sürsün mü?
- **Çevrimdışı ödül** (kullanıcı erken oyunda fazla buluyor; 4–8 saatlik tavan fikri).
- **Çevrimdışı oran ve tavan (simülatör, 2026-10-13; karar bekliyor):** paranın %87'si çevrimdışı kartlardan geliyor (game-design §4.6). Denenen seçenekler (bağlı oyuncu, reklamsız; şimdiki ayar %50 ve geç oyunda 2 sa tavan):

  | Seçenek | Milyarder | Multimilyarder | En Zengin | Gündelik oyuncu En Zengin | Çevrimdışı pay | Hedefler |
  | --- | --- | --- | --- | --- | --- | --- |
  | Şimdiki: %50, 2 sa | 1 sa 36 dk | 4 sa 59 dk (8. gün) | 11 sa 16 dk (16. gün) | 34. gün | %87 | tutuyor |
  | %35, 2 sa | 1 sa 57 dk | 6 sa 30 dk (10. gün) | 14 sa 54 dk (22. gün) | 45. gün | %83 | En Zengin geç |
  | %25, 2 sa | 2 sa 11 dk | 8 sa 14 dk (12. gün) | ömürde yetişmiyor | 59. gün | %78 | bozuluyor |
  | %50, 1 sa | 2 sa 4 dk | 8 sa 1 dk (12. gün) | ömürde yetişmiyor | 58. gün | %78 | bozuluyor |
  | %50, 4 sa | 1 sa 36 dk | 3 sa 59 dk (6. gün) | 8 sa 13 dk (12. gün) | 20. gün | %91 | fazla hızlı |
  | %35, 3 sa | 1 sa 57 dk | 5 sa 27 dk (8. gün) | 11 sa 45 dk (17. gün) | 34. gün | %87 | tutuyor |
  | %25, 8 sa (Multimilyarder'den; Milyarder'de 4 sa) | 2 sa 11 dk | 6 sa 30 dk (10. gün) | 13 sa 2 dk (19. gün) | 29. gün | %86 | tutuyor |

  Sonuç: pay hiçbir seçenekte %78'in altına inmiyor, çünkü oyuncu günde ~40 dakika oynuyor; oran ve tavan payı değil tempoyu ve "ne sıklıkla dönmeli" hissini belirliyor. Kısa tavan sık dönmeyi ödüllendirir (2 saatte bir), uzun tavan ve düşük oran günde bir iki kez dönen oyuncuyu (son satırda gündelik oyuncu 34. yerine 29. günde bitiriyor). "Gece Vardiyası Ekibi" IAP'ı tam bu ikisini satıyor (oran %100, tavan +2 sa). Erken sınıfların tavanları (10 dk → 1 sa) hiçbir seçenekte değişmedi; kullanıcının "erken oyunda fazla" gözlemi ayrıca denenmedi.
- **"Ödeyen" oyuncu profili** simülatörde yok; IAP ile.
- **Evler varise miras kalsın mı** (Faz 2.1).

## 6. Simülatörün sınırları (GPT Astra incelemesi, doğrulandı)

- Bot yöneticisiz işletmeleri %60 verimle çalışıyor sayıyor (`ACTIVE_UNMANAGED_EFFICIENCY`); gerçek oyunda sadece "Çalıştır"la başlatılan döngü ödenir.
- Bot açgözlü ve optimal; menü okuma, hikâye izleme, kararsızlık yok. "Gerçek oyuncu 1,3–1,8 kat yavaş" ölçülmüş değil, tahmin; kullanıcının gözlemi ise tersine "hızlı" (§5).
- Önerilen ek profiller: ilk 2 dakikada çıkan, yöneticiyi geciktiren, günde iki kez dönen, 24 saat ara veren (+ §5'teki reklam/ödeme profilleri).
- Gerçek doğrulama oyun testi ve analitikle (plan 1.14–1.15).

## 7. Sahne, kıyafetler ve olay kartları: kalan sorular

Kararlaşanlar taşındı: sahne, evler, araçlar ve kıyafetler [game-design-v2.md §4.4, §4.8](./game-design-v2.md); pozların sırası ve komutları [art-prompts-v2.md §4](./art-prompts-v2.md).

- **Lüks oyuncaklar (tekne, yat, helikopter, jet)** sahnede yok (plan 2.6).
- **Apartman evlerinde dış mekân mı iç mekân mı?** Şimdilik dış mekân (bina girişi ve avlu), çünkü iç mekânda araç görünmez.
- **Ara anlar** ("ilk sıcak yemek" gibi): art-brief H6 isteğe bağlı.
- **Olay kartları (oyunda, game-design §4.7):** ödül sayıları ve sıklık telefonda denenmedi (45 / 100 / 10 sn gelir, 4–6 dk); Şans'ın getirdiği şeyin sınıfa göre değişmesi (mekanik aynı kalacak) konuşulmadı; kötü sonuçta reklamla "ikinci şans" reklam yerleriyle birlikte.
- **Oyun testinden sonra karar:** annenin mesajında telefona bakma pozu (kıyafet başına 1 görsel) ve geç oyun için olgun görünüm (§3'teki "yaşlanan görünüm yok" kararını yeniden açar).
- **Önerilmeyenler:** arabaya yaslanma gibi araca bağlı pozlar (12 aracın boyu farklı).

## 8. Genel gözden geçirme: ilerleme hissi (konuşulacak)

Claude'un hikâye, tasarım belgesi, plan ve simülatör zaman çizelgesi üzerinden gözlemi (2026-10-11; sayılar 2026-10-12 simülatöründen). **Hiçbiri kararlaştırılmadı**; kullanıcı birlikte konuşmak istedi. Ana sonuç: fakirlikten zenginliğe geçiş ilk ~2 saate sıkışmış, kalan ~15 saat neredeyse boş.

**Zaman çizelgesi** (`npm run sim -- --purchases --timeline`, en iyi oynayan bot; gerçek oyuncu farklı olabilir):

| Oynama süresi | Gün | Ne oluyor |
| --- | --- | --- |
| 0–8 dk | 1 | Çadır; 4. dk'da bisiklet |
| 8 dk | 1 | Gündelikçi töreni, minibüs; 14. dk'da skuter |
| 27 dk | 1 | Kiralık oda, emektar sedan (ilk oturumun sonu) |
| 32 dk | 1 (2. oturum) | İşçi töreni, eski daire, motosiklet |
| 40–47 dk | 1 (3. oturum) | Hatchback, yenice daire; Orta Sınıf töreni, site |
| 54 dk | 2 | Milyoner töreni, ilk kendi evin, pikap |
| 1 sa 15 dk – 1 sa 30 dk | 2–3 | Banliyö evi, spor coupe, takım elbise, villa |
| 1 sa 36 dk | 3 | Milyarder töreni |
| 2–4 sa | 3–6 | Göl evi, süper araba, sahil malikânesi, grand lüks |
| 5 sa | 8 | Multimilyarder töreni |
| 8,5 sa | 13 | Büyük malikâne |
| 11 sa 16 dk | 16 | En Zengin töreni |
| 11–17 sa | 17–25 | Yeni bir şey yok; ömür 80 yaşında biter (hayat anları testten sonra doldurur) |

Yaşa bağlı üç hayat anı (25, 28, 31 yaş: ~2–4. saat) ve Orta Sınıf'tan sonra olay kartları bu çizelgenin üstüne gelir.

**Hissi en çok zayıflatanlar:**

1. **İlk oturumda tek tören.** 30 dakikalık ilk oturumda yalnızca Gündelikçi (8. dk); oturum kiralık odada bitiyor. İşçi 32. dk (2. oturum).
2. **Erken evler çok kısa, son evler çok uzun.** Kiralık oda ~5 dk, eski daire ~8 dk, site ~7 dk; büyük malikâne 8 saatten fazla.
3. **4. saatten sonra ekranda neredeyse hiçbir şey değişmiyor.** Araçlar ve kıyafetler bitiyor; sonraki 13 saatte iki tören, bir ev, annenin birkaç mesajı.

**Tutarsızlık, yaş ile hikâye:** Milyarder 22, Multimilyarder 35, En Zengin 59 yaş. Önsözden son törene 42 yıl: anne pastayı aldığında ~87, Rıza Amca atölyede ~80. Portreler yaşlanmıyor; kahraman 59 yaşında 23'lük görünüyor (§3 ile birlikte ele alınır).

**Eksikler (çoğu planda):** hayaller panosu (1.8; zincirden sonra daha değerli, sıradaki adım hep belli), lüks oyuncaklar sahnede (2.6), yağmur ve ortam sesi, Şans'ın dönüşte kapıda uyuması, konak ve pasta karesi, hayat anlarının ana ekranda iz bırakması (Defne ve kızından mesajlar, aile albümü: [story-v2.md §7](./story-v2.md)), En Zengin'den sonrası (§3).

**Claude'un önerdiği sıra (karar kullanıcıda):**

1. **Yaş temposu:** En Zengin'e kadar yıllar daha yavaş (zirve ~40 yaş), zirveden sonra hızlı. Hem annenin ve Rıza Amca'nın yaşını makul yapar hem sondaki boş saatleri kısaltır. Simülatörle denenmeli.
2. **İlk oturum:** İşçi törenini ilk oturuma (~25. dk) çekmek; ekonomi ayarı, simülatörle.
3. Hayaller panosu: ana ekranda zincirin sıradaki adımı.
