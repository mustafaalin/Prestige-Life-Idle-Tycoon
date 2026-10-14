# Tartışma notları (sonra konuşulacak)

Kararı henüz verilmemiş konular ve Claude'un önerileri. **Karar verilince ilgili belgeye (plan, hikâye, tasarım, monetizasyon) taşınır ve buradan silinir**; burada sadece açık konular durur.

Son güncelleme: 2026-10-13 (§5: erken oyun ayarı ve Multimilyarder hedefi; §9: hikâye ve görsel gözden geçirmesi)

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

- **Kahraman yaşlanmıyor (2026-10-11, kullanıcı: şimdilik kalsın):** 31'inde baba, 63'ünde dede olan kahraman 17'lik görünüyor. Seçenekler: 3 görünüm (genç, yetişkin, kır saçlı; portreler ve sahne pozları katlanır) ya da yalnızca portreler yaşlanır. Kıyafet 3 ve 4 ile tören kareleri genç yüzle üretildi (2026-10-12/13); yaşlanan görünüm artık bunların da yeniden üretilmesi demek.
- **Anne ve Şans, En Zengin'den sonra:** anne 59'da ~87 yaşında, Şans 40 yıldır yanında. Ölüm gösterilmiyor. Öneri: annenin mesajları En Zengin'den sonra biter, kanal Defne ve kızına geçer; Şans'ın yerini yavrusu alır.
- **Ömür sonu uyarısı:** "65 yaşındasın, 15 yılın kaldı" gibi bir hatırlatma; zirveye ulaşmamış oyuncunun "sonu göremedim" hissi. Üst bar artık sadece yaşı gösteriyor ("kalan yıl" 2026-10-08'de kalktı).
- **En Zengin'den sonrası (57 → 80):** hayat anları dolduracak (torun, devir; [story-v2.md §4c](./story-v2.md), testten sonra); başka içerik yok.
- **Ömür 80 yaş kalıyor (karar 2026-10-13, kullanıcı).** 70 yaş simülatörde denendi (ömür sonu 25. günden 21. güne, En Zengin'den sonraki boş süre 8,5 günden ~5 güne) ama torunun doğumunu 53'e çekiyor ve varisi 2. neslin içeriği yokken 4 gün erken getiriyordu.
- **Gönüllü erken emeklilik:** Yok (kullanıcı: erken devir olmasın).

## 4. Faz 2.1 hanedan soruları ([story-v2.md §6](./story-v2.md))

Kararlaştırılanlar (story §6, §4c): varis 17 yaşında bir torun (kahramanın kızının çocuğu), devir 80 yaşında, ölüm gösterilmez, 4. perde oynanabilir bir vakıf projesi, eş Nevin Hanım'ın torunu Defne.

1. **Torunun cinsiyeti.** Öneri: oyuncu seçsin (tek seçim). Bütçe kısıtlıysa sabit, seçim sonra.
2. **2. neslin başlangıcı.** Yön kararı (2026-10-11): torun sıfırdan değil, biraz alttan başlar. Açık: nereden ve neyle. Öneri: küçük yurt odası veya kiralık oda ve dedesinin ilk tezgâhı; servet vakfa gittiği için "para yok ama ad var" Aile İtibarı ile örtüşür.
3. **2. nesil kıyafet ve poz seti.** Öneri: aynı yaşam aşaması sayısında yeni set; babadan kalan bir yadigâr (saat veya Şans'ın tasması) hep görünsün.
4. **Varis çok hızlı:** 1. ömür ~1.800 miras puanı (×19 gelir; ömür 80 yaşla; son işletmeler güçlenince 1.400'den çıktı, reklam izleyende ~3.900) bırakıyor; 2. nesil dakikalar içinde Milyoner ve üstü. Miras formülüyle birlikte ele alınacak.

## 5. Ekonomi: açık sorular

Ekonomi 2026-10-09'da kullanıcıyla yeniden ayarlandı (başta ana gelir iş, sonra işletmeler); güncel kurallar ve sayılar [game-design-v2.md §4–5](./game-design-v2.md). Kullanıcı telefonda deneyecek; aşağıdakiler testten sonra konuşulacak:

- **Orta Sınıf ilk oturumda değil** (botta 31 dk, 1. günün 2. oturumu; Milyoner 2. gün; 2026-10-13). Defter sorusu yine oturum sınırını geçiyor. Faz 1 kapısındaki "ilk oturumda Orta Sınıf ≥ %60" ölçütü yeniden yazılmalı.
- **Multimilyarder hedefi bozuk (2026-10-13; karar bekliyor):** Çiçek Tezgâhı $120 ve yöneticisi $1K olunca (kullanıcı kararı, [game-design-v2.md §4.2](./game-design-v2.md)) bağlı bot Multimilyarder'e bir oturum erken ulaşıyor: 7. gün 21:00 (4 sa 45 dk oyun), hedefin alt sınırı 8. gün 00:00; `npm run sim` bu satırda FAIL veriyor, diğer bütün hedefler tutuyor. Tek bir geç işletmenin gelirini %5–7 kısmak yetmedi (Güzellik Salonu, Lojistik, Fabrika, Mini Market tek tek denendi; bot aynı oturuma düşüyor). Seçenekler: (a) hedefin alt sınırını 7. günün akşamına çekmek (fark 3 saat, tek oturum); (b) geç oyunu ~15 dakikalık oyun kadar yavaşlatacak daha büyük bir ayar. Claude'un önerisi (a).
- **Erken oyun, telefonda bakılacak (2026-10-13):** ucuz tezgâh, $1K yönetici, ilk yöneticiye kadar sık gelen Şans ve öne alınan iki hedef (bisiklet, Bulaşıkçı) kodda. Elle çalışan tezgâhın geliri üst barda görünmüyor, yönetici atanınca görünüyor (kullanıcı: böyle kalsın). Hâlâ boş gelirse yeni bir uğraş konuşulur. Yöneticiye kadar 1 sn'lik tezgâh için sürekli "Çalıştır"a basılıyor; süre 19 dakikadan ~6,5 dakikaya indi (botta).
- **Kariyer/işletme dengesi:** ilk 4 dk gelir tamamen maaş, Gündelikçi'de %73 işletme, ömür boyunca ortanca %95 işletme. "Başta kariyer" daha uzun sürsün mü?
- **Çevrimdışı ödül** (kullanıcı erken oyunda fazla buluyor; 4–8 saatlik tavan fikri).
- **Çevrimdışı oran ve tavan (karar 2026-10-13, kullanıcı: Claude'un önerisi): şimdiki %50 / 2 sa kalır** ("Gece Vardiyası Ekibi" paketi oran ve tavan satıyor). Açık kalan yalnızca erken sınıfların tavanları (aşağıda). Denemenin kaydı: paranın %87'si çevrimdışı kartlardan geliyor (game-design §4.6). Denenen seçenekler (bağlı oyuncu, reklamsız; şimdiki ayar %50 ve geç oyunda 2 sa tavan; sayılar son işletmeler güçlenmeden önce ölçüldü, En Zengin şimdi 10 sa 42 dk):

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
| 10 sa 42 dk | 16 | En Zengin töreni |
| 11–17 sa | 17–25 | Yeni bir şey yok; ömür 80 yaşında biter (hayat anları testten sonra doldurur) |

Yaşa bağlı üç hayat anı (25, 28, 31 yaş: ~2–4. saat) ve Orta Sınıf'tan sonra olay kartları bu çizelgenin üstüne gelir.

**Hissi en çok zayıflatanlar:**

1. **İlk oturumda tek tören.** 30 dakikalık ilk oturumda yalnızca Gündelikçi (8. dk); oturum kiralık odada bitiyor. İşçi 32. dk (2. oturum).
2. **Erken evler çok kısa, son evler çok uzun.** Kiralık oda ~5 dk, eski daire ~8 dk, site ~7 dk; büyük malikâne 8 saatten fazla.
3. **4. saatten sonra ekranda neredeyse hiçbir şey değişmiyor.** Araçlar ve kıyafetler bitiyor; sonraki 13 saatte iki tören, bir ev, annenin birkaç mesajı.

**Tutarsızlık, yaş ile hikâye:** Milyarder 22, Multimilyarder 35, En Zengin 59 yaş. Önsözden son törene 42 yıl: anne pastayı aldığında ~87, Rıza Amca atölyede ~80. Portreler yaşlanmıyor; kahraman 59 yaşında 23'lük görünüyor (§3 ile birlikte ele alınır).

**Eksikler (çoğu planda):** hayaller panosu (1.8; zincirden sonra daha değerli, sıradaki adım hep belli), lüks oyuncaklar sahnede (2.6), yağmur ve ortam sesi, Şans'ın dönüşte kapıda uyuması, hayat anlarının ana ekranda iz bırakması (Defne ve kızından mesajlar, aile albümü: [story-v2.md §7](./story-v2.md)), En Zengin'den sonrası (§3).

**Claude'un önerdiği sıra (karar kullanıcıda):**

1. **Yaş temposu:** En Zengin'e kadar yıllar daha yavaş (zirve ~40 yaş), zirveden sonra hızlı. Hem annenin ve Rıza Amca'nın yaşını makul yapar hem sondaki boş saatleri kısaltır. Simülatörle denenmeli.
2. **İlk oturum:** İşçi törenini ilk oturuma (~25. dk) çekmek; ekonomi ayarı, simülatörle.
3. Hayaller panosu: ana ekranda zincirin sıradaki adımı.

## 9. Hikâye ve görsel gözden geçirmesi (2026-10-13; karar bekliyor)

Altı tören karesi bağlandıktan sonra hikâyenin akışına, tetiklere ve görsellere bakıldı. Yaş ve boş saatler §8'de; buradakiler yeni.

**Ölçüldü (simülatörün oturum çizelgesi + `runtime/story.ts` kuralları):**

| Oyuncu | Gördüğü anne mesajı | Hiç görmediği |
| --- | --- | --- |
| Bağlı | 7 / 11 | perdeler, basamak, ★ Bülent Bey'in restoranları, gazete kupürü |
| Bağlı + reklam | 6 / 11 | yukarıdakiler + börek |
| Gündelik | 9 / 11 | perdeler, basamak |

1. **Çözüldü (2026-10-13):** Milyarder töreninin kancası ("restoranlar satılık" mesajı) hızlı oyuncuya ulaşmıyordu; tören artık satışı kendi ilk cümlesinde söylüyor ([story-v2.md §4](./story-v2.md)). Kancalara öncelik vermek denendi: kancalar herkese ulaştı ama bağlı oyuncuda Defne köprüsü kayboldu, bu yüzden sıra değiştirilmedi. Açık kalan: İşçi ve Orta Sınıf mesajlarını (perdeler, basamak) hiçbir profil görmüyor; "basamak"ın geçerliliği Milyoner'e uzatılırsa gündelik oyuncu görür. Şimdilik kabul edildi.
2. **Çözüldü (2026-10-13), Bülent Bey:** ilk Otel Zinciri ve yöneticisi Milyarder töreniyle bedava geliyor ([game-design-v2.md §4.2](./game-design-v2.md)). **Kuzen de çözüldü (2026-10-13):** son iki işletme güçlendirildi ([game-design-v2.md §4.2](./game-design-v2.md)); bağlı bot Teknoloji Girişimi'ni 14. günde alıyor, Kuzen'i 19. günde (En Zengin'den sonra) işe alıyor. Gündelik oyuncuda 39. gün.
3. **Çözüldü (2026-10-13):** kahramanın portresi kıyafeti izliyor; dört kıyafetin dördünün de 4 ifadesi oyunda (kapüşonlu set eski çizgili dilde kaldı, madde 4).
4. **İki ayrı çizim dili.** Önsöz, portreler ve eski fotoğraf çizgili, düz boyalı (fal.ai, 8–11 Ekim); evler, kıyafetler ve tören kareleri parlak 3D (GPT, 12–13 Ekim). Aynı törende yan yana geliyorlar. En görünür yer önsöz (ilk 40 saniye) ile ana ekranın farkı.
5. **Çözüldü (2026-10-13):** Multimilyarder töreninin atölye karesi oyunda. Eski not: oyuncunun göl evinin üstünde oynuyordu, konusu atölye. Yeni Fabrika ikonu zaten ahşap atölye olarak çizildi (§7'deki "Mehmet & Rıza Atölyesi" fikriyle örtüşüyor).
6. **En Zengin karesinde aile yok.** Kahraman o yaşta (59) evli ve kızı 28 yaşında; karede ve metinde yalnız anne ve kahraman var, Şans da yok. Yaş temposu (§8) değişirse sorun küçülür.
7. **Küçük metin pürüzleri:** (a) Orta Sınıf'ta "eski evimizi geri aldım", bir tören sonra "bir ev aldım, tapusunda benim adım yazıyor": ilk tapu hangisi? (b) Anne, eşinin en yakın arkadaşı Rıza'yı tanıyor olmalı; kahraman ona Rıza Amca'dan hiç söz etmemiş gibi. (c) Rıza'nın tezgâh cümlesi "Annene de bir demet ayırdım" 18. dakikada geliyor; anne o sırada teyzede ve Rıza onu tanımıyor. (d) İngilizcede iki Nora var: Nevin Hanım "Mrs. Nora", Fabrika yöneticisi "Nora".

**İyi çalışanlar:** önsözün geri dönüşleri karelerde de tutuyor (restoranın bakır lambaları ve personel üniforması, Bülent Bey'in takımı, kurdeleli pasta kutusu, annenin elbisesi); kıyafetler ve Şans'ın tasması her karede o sınıfınkiyle aynı; üç hayat anı Milyarder ile Multimilyarder arasındaki beş günlük boşluğa düşüyor; atölye ve pencere kancaları her profilde töreninden önce geliyor.


## 10. Geç oyun: lükslerin karşılığı, IAP sırası, reklam (2026-10-14; karar bekliyor)

Kaynak: GPT incelemesi ([gpt-review-progression-monetization-answer.md](./gpt-review-progression-monetization-answer.md)) ve Claude'un cevabı. Zenginler Listesi kararlaştı ve oyunda ([game-design-v2.md §4.11](./game-design-v2.md)); kalanlar kararlaştırılmadı.

**Uzlaşılanlar:** lüks bonusu statü bonusuna eklendiği için gerçek etkisi ~%3; kalıcı ×2 IAP'ın kozmetiği kırmızı fular değil (Başlangıç Paketi'nde var), örneğin yakut tasma; Gece Vardiyası + kalıcı ×2 dolu kartı ~×8 yapar; reklam izleyen En Zengin'e %33 kısa sürede ulaşıyor (~%49 hızlı; hedef %20–30).

**Önerilen sıra:**

1. ✅ (2026-10-14, sahne hariç: [rebuild-plan 1.22](./rebuild-plan.md)) Lükslerin karşılığı: her lüks ilk alındığında hayat anı + sahnede iz + albüm; lüks fiyatları simülatörle (reklamsız oyuncu jetle yaşayacak zamanı bulmalı; bugün jet ilk hayatta alınmıyor). En Zengin'den sonraki boş saatleri (§8) liste doldurmuyor, bu doldurabilir.
2. ✅ 1. adım kodda (2026-10-14; [monetization-v2 §8](./monetization-v2.md)). IAP kademeli: önce Rahat Paket ve Başlangıç Paketi; kalıcı ×2 ve Gece Vardiyası ücretli profil simülasyonundan sonra. Öncesinde mevcut dört reklam yeri telefonda doğrulanır.
3. ✅ (2026-10-14) Tek yeni reklam yeri: tören ve hayat anı hediyesi (hikâye bittikten sonra; [monetization-v2 §4](./monetization-v2.md)).
4. Yerel başarımlar; liderlik tablosu sonra.

**Zenginler Listesi'nde açık kalanlar:** benzetme isimlerin hukuki riski (Claude'un notu: Hindistan'daki "Selmon Bhoi" davası; portre, şirket adı ve logo yok, ton alaycı değil; kullanıcı benzetme isimleri seçti); düğmenin yeri (albümün altında) ve kartın sıklığı telefonda bakılacak.

## 11. Şans'ın aksesuarları gelire katkı versin mi? (2026-10-14; konuşulacak)

Kullanıcının fikri: Başlangıç Paketi'nin kırmızı fuları bugün yalnızca görünüş; bir artısı olmalı. Genel hâli: Şans'ın takacağı aksesuarlar (fular, tasmalar, ileride kalıcı ×2'nin tasması) gelire belirli bir katkı sağlayabilir. Konuşulacaklar: katkı nereye (tüm gelir mi, Şans'ın bulduğu cüzdan mı, çevrimdışı mı), ne kadar (statü eşyaları gibi küçük yüzdeler mi), ücretli aksesuarın ücretsiz sınıf tasmasıyla ve kalıcı ×2 ürünüyle ilişkisi (§10: kalıcı ×2'nin kozmetiği fular değil, ör. yakut tasma), simülatörde "ödeyen oyuncu" profili. Karar verilmedi.
