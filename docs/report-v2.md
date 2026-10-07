# Prestige Life — Oyun Tasarım Analizi ve Yeniden Doğuş Raporu

Kaynak: [orijinal belge](https://claude.ai/code/artifact/bf728735-b984-43f5-b741-a3780d5fdeeb) · Yazım: 2026-10-06 · Repoya kopya: 2026-10-07

> **Bu rapor v2'nin "neden"idir ve değişmez.** Kullanıcı genel hatlarıyla onayladı ve büyük çoğunlukla uygulanıyor. Uygulamada değişen kararlar (simülasyonla veya kullanıcıyla) [game-design-v2.md](./game-design-v2.md) içindedir; rapor ile tasarım belgesi çelişirse **tasarım belgesi geçerlidir**. Rapordan sapmaların listesi: tasarım belgesi §9.

## Özet: hüküm

**Oyun tutmadı çünkü ekonomisi oyuncuyu zenginleştirmiyor; fikir ya da görseller yüzünden değil.** Tür kanıtlanmış, elindeki varlıklar güçlü ve düzeltilmesi gereken kısım (oyun tasarımı) en ucuz kısım. Başarılı olabilir, ama oyun mantığı sıfırdan yazılmalı.

1. **Matematik karşı çalışıyor.** İlk işletme kendini 89 saatte, son yükseltmeler 960 saatte amorti ediyor. 52. meslekten sonra zorunlu ev+araç gideri maaşı geçiyor; CEO saatte 175.000 $ zarar ediyor.
2. **Para oyundan değil reklamdan geliyor.** Tek reklam ilk işin 18 saatlik maaşı. Oyuncunun kararları hızını neredeyse değiştirmiyor.
3. **Prestij (reset) ceza.** Her şeyi siliyor, gelire çarpan vermiyor. Türün en güçlü bağımlılık mekaniği çalışmıyor.
4. **Zenginleşme görünmüyor.** Sayaç saniyede 0,19 $ artıyor, maaş baştan sona sadece 71 kat büyüyor, sınıf atlamaları törensiz.
5. **Çok sistem, az derinlik.** 12 sistem aynı şeyi (biraz para) veriyor; sağlık/mutluluk barları angarya kilide dönüşmüş.
6. **Öneri:** üstel ekonomi + 7 basamaklı, törenli sınıf merdiveni + BitLife tarzı olay kartları + hanedan (nesil) prestiji. Görselleri, Capacitor/AdMob/RevenueCat altyapısını ve ses sistemini koru.
7. **İlk adım:** 4 haftada sadece ilk 30 dakikayı (sokak → milyoner) yap, 20–50 kişiye oynat. İlk oturum 15 dakikayı geçerse devam et.

Raporun geri kalanı her maddenin kanıtını ve nasıl yapılacağını anlatıyor. Sayılar kod tabanından (`src/data/local/`) hesaplandı; pazar verileri sondaki kaynaklardan.

## 1. Oyunun bugünkü hali

Prestige Life teknik olarak bitmiş bir ürün: 12 ayrı sistem, \~17.000 satır kod ve 300'e yakın görsel var. Sorun altyapıda değil, oyunun matematiğinde ve hissinde.

**Elinde olan varlıklar (kod tabanından sayıldı):**

| Varlık | Adet | Not |
| --- | --- | --- |
| Meslek | 60 (İşçi 20, Uzman 20, Yönetici 20) | Her biri için ikon var |
| İşletme | 40 (20 küçük, 20 büyük) | 6 seviye, ikonlu |
| Yatırım mülkü | 50 | Her biri için görsel |
| Yaşanan ev | 25 + 3 premium | Arka plan görselleri hazır |
| Araç | 20 + 3 premium | El arabasından özel jete |
| Kıyafet | 20+ | Bazılarında animasyonlu WebP |
| Görev | 100 sabit + meslek görevleri, 10 bölüm |  |
| Sistemler | Banka, cashback, sağlık/mutluluk, boost, liderlik tablosu, günlük ödül, reset |  |

**Oyuncunun yaşadığı döngü bugün şöyle:** bir işte 2,5–6 dakika çalış → sağlık/mutluluğu %75–85 üstünde tut → doğru ev ve araç seviyesine geç → sonraki işe geç. Para arka planda saatlik gelirle akar; asıl para ise reklam, birikmiş para claim'i ve günlük ödülden gelir.

**Kodda öne çıkan beş yapısal gözlem:**

1. Gelir gerçek saat bazlı. İlk iş saatte 700 $ veriyor, yani saniyede 0,19 $. Ana ekrandaki para sayacı \~5 saniyede bir kıpırdıyor.
2. Prestij (reset) gelire çarpan vermiyor. Reset her şeyi siliyor; karşılığında sadece reklam ödülü kademesini yükselten birkaç prestij puanı geliyor.
3. Reklam ödülü çekirdek gelirden çok büyük. Başlangıçta tek reklam 12.500 $ = ilk işin 18 saatlik maaşı.
4. Lüks giderler gelirden hızlı büyüyor. Son evin kirası (75.000 $/saat) CEO maaşından (50.000 $/saat) yüksek.
5. İlerlemeyi kilitleyen asıl şey para değil; sağlık/mutluluk barları, ev/araç seviyesi ve görev prestiji. Oyuncu "zengin oluyorum" yerine "şartları tamamlıyorum" hissediyor.

## 2. Pazar araştırması: bu türde kim, neden tutuyor?

Bu pazarda iki ayrı aile var ve tutan oyunlar ikisinden birinin gücünü tam almış durumda. Prestige Life ikisinin ortasında kalmış: BitLife'ın hikaye ve sürprizi yok, AdVenture Capitalist'in üstel büyümesi ve prestij çarpanı yok.

**Aile A — Hikaye/seçim hayat simülasyonları (BitLife tipi).** Oyuncu bir hayatı baştan sona yaşar, rastgele olaylar ve seçimler paylaşılabilir hikayeler üretir. Güçleri: merak, sürpriz, mizah, "bir hayat daha" tekrar oynanabilirliği.

**Aile B — İdle tycoon (AdVenture Capitalist, Idle Miner tipi).** Rakamlar üstel büyür, işler otomatikleşir, reset bir sonraki turu katlayarak hızlandırır, haftalık etkinlikler oyunu taze tutar. Güçleri: sürekli "sayı yukarı" tatmini ve günde 5+ kısa oturum.

**Hibrit — "Sıfırdan zengine" idle hayat simülasyonları.** Senin oyununun doğrudan rakipleri. Hepsinde aynı iskelet var: kariyer, ihtiyaç barları, mülk/işletme, lüks eşya. Farklılaşanların eklediği şeyler: borsa, kumarhane mini oyunu, ilişki/aile, yaşlanma ve süre baskısı.

| Oyun | Aile | Kanıt | Neden tutuyor | Sana dersi |
| --- | --- | --- | --- | --- |
| [BitLife](https://goodgamestudios.com/?p=65830) | A | Bir yılda 72 milyon sanal hayat oynandı (2022) | Rastgele olaylar, kara mizah, TikTok'ta paylaşılan hikayeler, bölgeye göre yerelleştirme | Hikaye anları ve paylaşılabilir sürprizler oyuncuyu geri getirir |
| [Idle Miner Tycoon](https://www.kolibrigames.com/press/kolibri-games-hit-title-idle-miner-tycoon-surpasses-150-million-downloads/) | B | 150 milyon indirme (2022), Ubisoft satın aldı | Net çekirdek döngü, haftalık güncelleme, özel etkinlik madenleri, karakterli çizim | Canlı operasyon (etkinlik) olmadan idle oyun uzun yaşamaz |
| [AdVenture Capitalist](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i) | B | Türün referans oyunu | Maliyet her alımda ×1,07; 25 ve 50 adette ×2 milestone; reset çarpanı | Matematik üstel olmalı, reset ödül olmalı |
| [Idle Guy: Life Simulator](https://apps.apple.com/app/id1612163874) | Hibrit | 72.000+ App Store puanı, 4,8 | Borsa, kumarhane, aile, yaşlanma; "sokaktan milyonere" vaadi | Süre baskısı (yaş) ve risk mini oyunları heyecan katar |
| [Idle Life Sim](https://apppricinglab.com/app/apple/1501361660) (Codigames) | Hibrit | 61.000 App Store puanı, 4,6 | Codigames'in idle tycoon tecrübesi, "Mentor" ve "No Ads" paketleri | Kalıcı hızlandırıcı (mentor) iyi satan bir IAP |
| [Rich Inc.](https://apps.apple.com/app/id1622543751) | Hibrit | 33.000 App Store puanı, 4,7; Türk stüdyo | Sağlık/mutluluk/enerji, aile, kumarhane, lüks eşya | Türk bir ekip bu türde ölçek yakalamış; en büyük şikayet aşırı reklam |
| [Rags to Riches: Become RichMan](https://apps.apple.com/us/app/-/id6743711998) | Hibrit | 82 puan (2025 çıkışlı) | Park bankında uyuyarak başlayan sert giriş, papağan yoldaş | Yeni giren aynı iskeletle tutunamıyor; fark yaratan bir kanca şart |

**Türün ekonomik gerçekleri:**

- İdle oyunlarda gelirin \~%60–70'i reklamdan, \~%30–40'ı IAP'tan gelir; ödüllü video en iyi çalışan format ([kaynak](https://www.gameanalytics.com/blog/how-to-keep-players-engaged-and-coming-back-to-your-idle-game)).
- İlk %10'luk idle oyunlarda oyuncu günde \~5,8 oturum ve \~35 dakika oynuyor; oturum başı \~7 dakika (aynı kaynak).
- 2025'te mobil oyunlarda medyan D7 tutma %4'ün altında, medyan D30 \~%0,7. İlk %10'luk oyunlar D1 \~%40, D7 \~%11–12 yapıyor ([GameAnalytics 2026 raporu](https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game)).
- Başarılı idle oyunların ortak noktası haftalık güncelleme ve süreli etkinlikler; Idle Miner Tycoon büyümesini bunlara bağlıyor (tablodaki kaynak).

**Sonuç:** Hibrit pazar kalabalık ama doymuş değil. Mevcut liderlerin ortak zayıfı aşırı reklam ve geç oyunda giderlerin geliri geçmesi. Temiz reklam deneyimi + gerçekten hissedilen "zenginleşme" + BitLife tadında hikaye anları, açık bir boşluk.

## 3. İlerleme matematiği: asıl sorun burada

Ekonomi oyuncuyu zenginleştirmek yerine yerinde saydırıyor. Yatırımların kendini amorti etmesi 89–960 gerçek saat sürüyor; kariyerin son 9 mesleğinde zorunlu yaşam gideri maaşı geçiyor.

> Görsel: src/data/local/jobs.ts, houses.ts, cars.ts · 60 meslek; gider = jobRequirements.ts'teki minimum ev ve araç seviyesinin saatlik maliyeti (yalnızca orijinal belgede)

Net maaş 45. meslekte \~12.400 $/saatle zirve yapıp düşüyor; CEO olan oyuncu sadece işten saatte 175.000 $ zarar ediyor. Bunu yalnızca işletme geliri ya da gem ile alınan sıfır giderli premium ev/araç kurtarıyor. Oyuncu terfiyi ödül değil ceza olarak yaşıyor.

### Yatırımlar çok yavaş geri dönüyor

| Satın alma | Fiyat | Saatlik getiri | Kendini amorti süresi |
| --- | --- | --- | --- |
| Çiçekçi (ilk işletme) | 8.000 $ | 90 $ | 89 saat (3,7 gün) |
| Lojistik Deposu (ilk büyük işletme) | 1.350.000 $ | 2.000 $ | 675 saat (28 gün) |
| Tech Startup (son işletme) | 200.000.000 $ | 400.000 $ | 500 saat (21 gün) |
| İşletme yükseltme 1→2 | gelir × 30 | +%25 | 120 saat |
| İşletme yükseltme 5→6 | gelir × 240 | +%25 | 960 saat (40 gün) |
| Yatırım mülkü, 5 yükseltme dahil | fiyat × 3,18 | fiyat ÷ 200 × 2,5 | 255 saat |

Türün kuralı: ilk yükseltme 60 saniyede, ilk otomasyon 3 dakikada, ilk prestij 10–15 dakikada alınabilmeli ([kaynak](https://dev.to/aguier/i-built-7-idle-games-in-30-days-what-i-learned-about-incremental-design-5d3f)). Prestige Life'ta ilk işletme (8.000 $) reklamsız \~11 saatlik maaş ediyor.

### Para çekirdek döngüden değil reklamdan geliyor

- Başlangıçta tek ödüllü reklam 12.500 $: ilk işin 18 saatlik maaşı, ilk işletmenin 1,5 katı.
- Birikmiş para claim havuzu 25.000 $ (günde 50.000 $); gelire değil, prestij kademesine bağlı.
- Sonuç: oyuncunun kararları (hangi işletme, hangi mülk) hızını neredeyse değiştirmiyor. Asıl ilerleme düğmesi "reklam izle". Bu hem tatmini öldürür hem reklamı zorunluluk gibi hissettirir.

### Prestij döngüsü kırık

- Türün standardı: reset bir sonraki turu katlayan kalıcı bir çarpan verir. AdVenture Capitalist'te prestij para birimi ömür boyu kazancın kareköküyle büyür; \~4 kat kazanç prestiji ikiye katlar ([kaynak](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii)).
- Prestige Life'ta reset parayı, işi ve işletmeleri siliyor; karşılığında tamamlanan görev sayısının yarısı kadar prestij puanı veriyor. Bu puan gelire hiç çarpan olarak etki etmiyor. Akıllı oyuncu reset yapmaz.

### Ölçek çok dar, sayaç çok yavaş

- İlk meslek ile CEO arası maaş farkı sadece 71 kat. İdle türünde ekonomi trilyonlara uzanır; AdVenture Capitalist'in prestij formülü 10^15 $ ölçeğinden başlıyor (yukarıdaki kaynak). Her yeni basamak (bin → milyon → milyar) bir "vay" anıdır.
- Gelir gerçek saat bazında: ilk dakikalarda para sayacı saniyede 0,19 $ artıyor. "Sayı yukarı" hissi ilk 5 dakikada yok.

### Kilitler para dışı ve angarya

- 60 mesleğin hepsi için gereken çalışma süresi toplam \~4 saat. Ama her geçişte sağlık ve mutluluk %75–85, belirli ev ve araç seviyesi, işçi kademesinde ise görev prestiji şartı var.
- Sağlık işte saatte 3–5 puan düşüyor; geri almak için 5–15 sn bekleme süreli butonlara basılıyor. Bu bir karar değil, bakım işi.

## 4. Eksikler: oyuncuyu tutacak ama oyunda olmayan şeyler

En büyük eksik içerik değil, his: oyuncu ilk 5 dakikada zenginleştiğini görmüyor, ertesi gün geri dönmek için de bir sebebi yok. Aşağıdaki liste etkisine göre sıralı.

| # | Eksik | Neden kritik | Kim iyi yapıyor | Öncelik |
| --- | --- | --- | --- | --- |
| 1 | Üstel ekonomi ve hızlı akan sayaç | "Sayı yukarı" tatmini türün kalbi; bin → milyon → milyar geçişleri zenginleşme hissini kendiliğinden üretir | AdVenture Capitalist, Idle Miner | Hayati |
| 2 | Gerçek prestij döngüsü | Reset bir ödül olmalı: kalıcı çarpan, ikinci tur ilkinin 3–5 katı hızlı. Bugün reset ceza | Tüm tür | Hayati |
| 3 | İlk 5 dakika / onboarding | Oyuncu 60 sn içinde ilk satın almayı, 5 dk içinde ilk anlamlı kararı yapmalı. Kodda tutorial yok | Tüm tür | Hayati |
| 4 | Hikaye anları ve rastgele olaylar | "Bugün ne olacak?" merakı geri dönüşün en ucuz motoru; paylaşılabilir anlar üretir | BitLife | Yüksek |
| 5 | Kutlama ve dönüşüm anları | Ev değiştirmek, terfi, ilk milyon gibi anlar tam ekran, sesli, önce/sonra karşılaştırmalı olmalı. Bugün çoğu bir modal kapanışı | Merge oyunları, Idle Miner | Yüksek |
| 6 | Otomasyon ve yöneticiler | Oyuncu "artık ben çalışmıyorum, param çalışıyor" anını yaşamalı; zenginliğin özü bu | Idle Miner (manager), AdCap | Yüksek |
| 7 | Yaşam hedefi ve görünür net servet | Tek bir büyük sayı (Net Servet) ve "sıradaki hayal" (ilk araba, ilk ev, ilk milyon) yolu göstermeli | Idle Guy, Rich Inc. | Yüksek |
| 8 | Canlı operasyon: haftalık etkinlik | 2. haftadan sonra oyunu yaşatan tek şey; ayrıca en iyi IAP anı | Idle Miner (etkinlik madenleri) | Orta (lansmandan sonra) |
| 9 | Bildirimler | "Kasan doldu", "Yatırımın vadesi geldi" gibi zamanlı hatırlatmalar; kodda yok | Tüm tür | Orta |
| 10 | Analitik | Hangi ekranda oyuncu kaybettiğini bilmeden denge yapılamaz; kodda hiçbir event takibi yok | — | Hayati (testten önce) |
| 11 | Risk/şans mekaniği | Borsa, kumar, girişim yatırımı gibi "çift ya da hiç" anlar adrenalin verir | Idle Guy, Rich Inc. | Orta |

**En kritik üçlü birlikte çalışır:** hızlı akan üstel sayaç zenginleşmeyi gösterir, otomasyon "param benim için çalışıyor" anını verir, prestij de bunu her turda daha büyük ölçekte tekrar yaşatır.

## 5. Gereksizler ve sadeleştirilmesi gerekenler

Oyunda çok fazla sistem var ama çoğu aynı şeyi (biraz para) farklı bir ekranda veriyor. Oyuncu 12 sistemi öğrenmek zorunda kalıyor, hiçbirinde derinleşemiyor. Hedef: 4–5 güçlü sistem.

| Sistem | Sorun | Öneri |
| --- | --- | --- |
| Sağlık / mutluluk barları + bekleme süreli butonlar | Terfi kapısı olarak çalışıyor; buton basmak karar değil, angarya | **Dönüştür:** tek bir "Yaşam Kalitesi" göstergesi, gelire çarpan versin (ör. %50–150). Kilit olmasın |
| Yaşanan ev (kira) + yatırım mülkü (ayrı 50 ev) | İki ayrı ev kavramı kafa karıştırıyor; yaşanan ev sadece gider | **Birleştir:** evi satın al, birinde yaşa (statü + çarpan), diğerlerini kiraya ver |
| Ev ve araç gideri + negatif net gelir | Terfiyi cezaya çeviriyor (Bölüm 3 grafiği) | **Kaldır:** lüks eşya gider değil, çarpan/statü versin. Net gelir asla eksiye düşmesin |
| Banka: 3 mevduat + cashback havuzu + premium kart | Üç alt sistem tek bir "faiz" hissi için; %2 cashback'i elle toplamak gürültü | **Birleştir:** tek "Yatırım Hesabı" (risk seçimli vadeler). Cashback kalksın |
| Birikmiş para claim'i + günlük limit + üçlü claim + reklam ödülü + günlük ödül | Beş ayrı para musluk; gerçek gelirden büyük, ekonomiyi bozuyor | **Sadeleştir:** çevrimdışı kazanç + "reklamla ×2" + günlük ödül. Hepsi gelire oranlı olsun |
| Görevden prestij | "Prestij" kelimesi hem görev puanı, hem kilit, hem reset ödülü; oyuncu ne olduğunu anlamıyor | **Ayır:** görevler yön gösterir ve gem verir; prestij sadece resetten gelir ve gelire çarpan verir |
| 60 meslek, 3 kategori | Meslekler birbirinin aynısı: maaş biraz artar, 2,5–6 dk sayaç dolar | **Az ama farklı:** 12–15 meslek; her biri bir hikaye anı, bir yeni sistem ya da görünür bir mekan değişikliği açsın |
| Premium (gem) ev/araç = giderleri atlama | Ceza veren sistemden kaçış satmak oyuncuya kötü hissettirir | **Dönüştür:** premium eşya kalıcı çarpan ya da kozmetik versin |
| Supabase senkron, anonim auth, 3 dk liderlik senkronu | Kapalı test için fazla altyapı; hata yüzeyi büyük | **Askıya al:** önce yerel + analitik + RevenueCat. Liderlik tablosu sonra |

**Korunması gerekenler:** görsel kütüphane (ev, araç, işletme, meslek, kıyafet), karakter animasyon boru hattı, reklam/IAP entegrasyonu, ses sistemi ve local-first kayıt mimarisi. Bunlar sıfırdan yapılsa aylar sürerdi.

## 6. Fakirlikten zenginliğe hissi nasıl verilir?

Zenginleşme hissi bir özellik değil, düzinelerce küçük anın toplamı. Bugün oyunda 60 meslek basamağı var ama hiçbiri bir "sınıf atlama" gibi hissettirmiyor. Önerim: az sayıda, büyük ve törenli eşik.

> Görsel: önerilen sınıf merdiveni · 7 basamak, eşikler net servet (yalnızca orijinal belgede)

Her eşikte aynı anda beş şey değişmeli: ana ekran sahnesi, ev, araç, karakterin kıyafeti ve müzik. Elindeki 25 ev arka planı ve 20 araç görseli bu merdivene doğrudan dağıtılabilir.

**Somut teknikler:**

1. **Gerçekten fakir başla.** İlk ekran soğuk renkli bir sokak; karakter üşüyor. İlk 30 saniye ekrana dokunarak şişe/kutu topla, her dokunuşta uçan "+1 $". Fakirliği hissetmeyen oyuncu zenginliği de hissetmez.
2. **Para sayacı hep aksın.** Saniyede birkaç kez güncellensin; K, M, Mr, T kısaltmaları. Her yeni birimde (ilk bin, ilk milyon) tam ekran kutlama, konfeti, haptik, özel ses.
3. **Paranın fiziksel hali büyüsün.** Cüzdan → kasa → banka kasası → altın dolu oda. Oyuncu sayıyı okumadan zenginliğini görsün.
4. **Önce/sonra kartı.** Her sınıf atlamasında "başladığın yer / şimdi" görseli; tek dokunuşla paylaşılabilir. Bu aynı zamanda bedava TikTok/Instagram reklamı.
5. **Hayaller panosu.** Ekranda her zaman 3 görünür hayal: "Sıcak yemek", "Bisiklet", "Annene ev al". Gerçekleşince kısa bir mikro hikaye ve karakter tepkisi.
6. **Karakter değişsin.** Idle animasyonu sınıfa göre: yorgun ve kambur → dik ve kendinden emin. Konuşma balonları: "Bir gün o arabayı alacağım" → aldığında "Başardım!".
7. **Tanıdık yüzler geri dönsün.** Sokaktaki arkadaş, anne, eski patron. Zenginleşince onlarla karşılaşma anları ("Eski patronun şirketini satın aldın") duygusal zirve yaratır.
8. **Her satın alma "juice" alacak.** Parçacık, küçük ekran sarsıntısı, haptik, katmanlı ses. Gelir arttığında sayaç bir an büyüyüp renk değiştirsin.

## 7. Önerilen yeni tasarım

**Tek cümlelik vaat:** "Sokaktan dünyanın en zenginine — ve her nesil bir öncekinden hızlı." AdVenture Capitalist'in üstel matematiği, BitLife'ın olay kartları ve türde nadir görülen bir hanedan (nesil) prestiji tek pakette.

> Görsel: önerilen oyun yapısı · 3 döngü, 1 geri dönüş (yalnızca orijinal belgede)

Hanedan prestiji türün sıkıcı "reset" butonunu hikayeye çeviriyor. Oyuncu her şeyini kaybetmiyor; çocuğuna miras bırakıyor. Fikir, BitLife'taki "çocuğunla devam et" özelliğini idle prestij matematiğine bağlıyor. İncelediğim hibrit rakiplerin mağaza sayfalarında böyle bir sistem yok; senin farklılaşma noktan olabilir.

### Ekonomi kuralları

1. **Gelir saniye bazında,** sayaç saniyede birkaç kez güncellenir. Para birimleri K, M, Mr, T, ...
2. **İşletmeler adet bazında alınır** (AdCap gibi). Maliyet her alımda ×1,07–1,15, gelir doğrusal; 10, 25, 50, 100 adette gelir ×2 ([formüller](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i)).
3. **Lüks eşya gider değil, güç.** Ev, araç, kıyafet "Statü" puanı verir; Statü gelire yüzde çarpan ekler. Alışveriş = güçlenme. Net gelir asla eksiye düşmez.
4. **Yöneticiler otomasyon getirir.** İlk yönetici 3. dakikada. "Artık param benim için çalışıyor" anı büyük bir törenle verilir.
5. **Miras (prestij) formülü karekök:** miras puanı √(bu nesilde kazanılan / sabit). Her puan gelire kalıcı yüzde ekler. Amaç: ikinci nesil aynı noktaya ilk neslin 1/3–1/5 süresinde gelsin.
6. **Tüm ödüller gelire oranlı.** Reklam ödülü = "X dakikalık gelir". Böylece reklam çekirdek döngüyü ezmez, hızlandırır.

### Hedef tempo

| Kilometre taşı | Hedef süre | Neden |
| --- | --- | --- |
| İlk satın alma | 30–60 sn | Türün "60 saniye" kuralı |
| İlk yönetici (otomasyon) | \~3 dk | İlk büyük "vay" anı |
| Milyoner töreni | 20–30 dk | İlk oturum bir zirveyle bitsin |
| İlk emeklilik (hanedan) açılır | 1.–2. gün (Multimilyoner sınıfında açılır) | D1 dönüşü için "yarın daha hızlı olacağım" vaadi |
| Milyarder | 3.–5. gün | D7'ye taşıyan orta hedef |
| 1 trilyon (ilk nesil zirvesi) | 2–3 hafta (2–4 nesil sonra) | D30 hedefi |

### Olay kartları (BitLife tadı)

Günde 3–5 rastgele kart, her biri 2–3 seçenekli ve 10 saniyede okunur. Örnekler: "Kuzenin bir kripto fırsatı öneriyor" (risk), "Patron fazla mesai istiyor" (para vs. mutluluk), "Eski sokak arkadaşın iş arıyor" (duygusal + yönetici kazanımı). Kartlar sınıfa göre değişir; milyarderin dertleri sokaktakinden farklıdır. Bu içerik ucuzdur (sadece metin + ikon) ama oyunu her gün taze tutar.

### Monetizasyon

- **Ödüllü reklam (gelirin \~%60–70'i):** çevrimdışı kazanç ×2, 4 saatlik ×2 hız, olay kartında "ikinci şans", günlük çark. Hepsi isteğe bağlı.
- **Zorla reklam (interstitial):** ilk 3 gün hiç, sonra çok seyrek. Rakiplerin 1 numaralı şikayeti aşırı reklam; temiz deneyim yorumlarda fark yaratır.
- **"Altın Kaşık" paketi:** reklamsız + kalıcı ×2 gelir, tek seferlik. Türün en iyi satan IAP tipi (Idle Life Sim'deki "Mentor" ve "No Ads" gibi).
- **Başlangıç paketi:** ilk 48 saat, düşük fiyat, yüksek değer.
- **Etkinlik geçişi:** haftalık etkinliğin ücretli ödül hattı (lansmandan sonra).
- **Gem:** hızlandırma ve kozmetik. Gem ile cezadan kaçış satılmaz.

## 8. Karar: sıfırdan mı, mevcut üzerine mi?

**Önerim: oyun mantığını sıfırdan yaz, varlıkları ve altyapıyı koru.** Mevcut ekonomiyi yamamak işe yaramaz; sorun tek tek sayılarda değil, sistemlerin birbirine bağlanışında (gider modeli, prestij, ödül muslukları, kilitler). Ama görseller ve teknik altyapı bu oyunun en değerli kısmı ve yeni tasarıma birebir uyuyor.

| Ne | Karar | Neden |
| --- | --- | --- |
| \~290 görsel (ev, araç, işletme, meslek, kıyafet, mülk) | Koru | Sınıf merdivenine doğrudan dağıtılır; sıfırdan üretmek aylar sürer |
| Karakter animasyon boru hattı (WebP, celebrate) | Koru, genişlet | Sınıfa göre idle animasyonu ve törenler için temel hazır |
| Capacitor + AdMob + RevenueCat + ses sistemi | Koru | Çalışıyor ve yayına hazır; en zahmetli entegrasyonlar bitmiş |
| Local-first kayıt, tasarım sistemi (renk, buton, modal kuralları) | Koru | Yeni ekranlar aynı dili konuşur |
| Ekonomi verisi ve formülleri | Yeniden yaz | Bölüm 3'teki tüm sorunlar burada |
| İlerleme, kilitler, görevler, prestij | Yeniden yaz | Hanedan döngüsü ve sınıf merdiveni yeni yapı ister |
| Ana ekran | Yeniden tasarla | Sahne + akan sayaç + hayaller panosu + törenler oyunun yüzü olacak |
| Banka alt sistemleri, sağlık/mutluluk butonları, Supabase senkronu, liderlik | Park et | Lansmandan sonra ihtiyaç olursa sadeleştirilmiş haliyle döner |

**Teknoloji:** React + Capacitor'da kal. İdle oyunlar ağırlıklı arayüz oyunudur ve bu yığını zaten biliyorsun. "Juice" için bir animasyon kütüphanesi (ör. Framer Motion) ve parçacık/konfeti için hafif bir canvas katmanı eklemek yeterli. Unity'ye geçmek 2–3 ay altyapı kaybı demek.

**Kod yazmadan önce ekonomiyi simüle et.** Tempo tablosundaki hedefleri (60 sn, 3 dk, 30 dk, 1. gün...) tutturan formülleri bir tablo ya da küçük bir script ile modelle. Mevcut oyunda bu adım atlanmış; Bölüm 3'teki grafik bunun sonucu.

**Neden inanabilirsin:** tür kanıtlanmış (BitLife, Idle Miner, 30–70 bin puanlı hibritler), bir Türk stüdyo aynı alt türde ölçek yakalamış, rakiplerin zayıf noktası (aşırı reklam, geç oyunda giderin geliri geçmesi) belli. Senin elinde ise rakiplerin çoğunda olmayan bir görsel kütüphane ve bitmiş bir altyapı var. Eksik olan oyun tasarımı — ve bu, en ucuz düzeltilen kısım.

## 9. Yol haritası, test planı ve metrikler

Büyük yatırım yapmadan önce fikri 4 haftada oyuncuyla test et. İlk 30 dakikası (sokak → milyoner) eğlenceli değilse geri kalanını yapmaya gerek yok; eğlenceliyse inanman için somut veri olur.

> Görsel: önerilen yol haritası · 5 faz, 3 karar kapısı (tahmini tarihler) (yalnızca orijinal belgede)

Her kapıda hedef tutmazsa bir sonraki faza geçme; önce dengeyi düzelt. Tarihler tam zamanlı çalışma varsayımına göre; yarı zamanlıysan süreleri ikiyle çarp.

### Takip edilecek metrikler

| Metrik | Hedef | Dayanak |
| --- | --- | --- |
| İlk oturum süresi | ≥15 dk | Milyoner törenine ulaşmak için gereken süre |
| İlk oturumda milyoner olan oyuncu | ≥%60 | Dikey dilimin başarı ölçütü (benim önerim) |
| D1 tutma | ≥%35 | İlk %10'luk mobil oyunlar \~%40 ([GameAnalytics](https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game)) |
| D7 tutma | ≥%12 | İlk %10'luk oyunlar %11–12 (aynı kaynak) |
| D30 tutma | ≥%5 | Medyan \~%0,7; idle türü ortalamanın üstünde tutar |
| Günlük oturum sayısı | ≥4 | İlk %10'luk idle oyunlar \~5,8 ([GameAnalytics](https://www.gameanalytics.com/blog/how-to-keep-players-engaged-and-coming-back-to-your-idle-game)) |

### Test kullanıcısı bulmak

- Yeni kişisel Play Console hesaplarında yayına çıkmak için **en az 12 testçinin 14 gün kesintisiz** kapalı testte kalması zorunlu ([Google](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB)). Oyunun bu aşamada takılmış olması çok yaygın; bunu bir pazarlama görevi gibi planla.
- Kaynaklar: arkadaş/aile çevresi, Reddit'teki idle oyun topluluğu (r/incremental\_games) ve kapalı test takas grupları, Türk oyun geliştirici Discord'ları.
- Geliştirme günlüğünü TikTok/Reels'te paylaş: "sokaktan milyonere" önce/sonra görüntüleri bu türün en iyi reklam malzemesi. BitLife'ın büyümesi de büyük ölçüde sosyal medya ile geldi ([kaynak](https://goodgamestudios.com/?p=65830)).

### İlk hafta yapılacaklar

- [ ] Bu rapordan tek sayfalık tasarım belgesi çıkar: vaat, 3 döngü, sınıf merdiveni
- [ ] Ekonomi simülatörü: tempo tablosundaki hedefleri tutan formüller
- [ ] Analitik seç ve event listesini yaz: oturum, sınıf atlama, reklam, satın alma, çıkış ekranı
- [ ] 30 olay kartı taslak metni
- [ ] Mevcut ev/araç/kıyafet görsellerini 7 sınıfa dağıt
- [ ] 12+ kişilik testçi listesini şimdiden toplamaya başla

## Kaynaklar

- [BitLife: 72 milyon sanal hayat (Good Game Studios, 2022)](https://goodgamestudios.com/?p=65830)
- [Idle Miner Tycoon 150 milyon indirme (Kolibri Games, 2022)](https://www.kolibrigames.com/press/kolibri-games-hit-title-idle-miner-tycoon-surpasses-150-million-downloads/)
- [The Math of Idle Games, Part I](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i) ve [Part III](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii)
- [Idle oyun tempo önerileri (dev.to)](https://dev.to/aguier/i-built-7-idle-games-in-30-days-what-i-learned-about-incremental-design-5d3f)
- [GameAnalytics: idle oyunlarda tutma](https://www.gameanalytics.com/blog/how-to-keep-players-engaged-and-coming-back-to-your-idle-game)
- [GameAnalytics 2026 benchmark özeti](https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game)
- App Store sayfaları: [Idle Guy](https://apps.apple.com/app/id1612163874), [Rich Inc.](https://apps.apple.com/app/id1622543751), [Rags to Riches: Become RichMan](https://apps.apple.com/us/app/-/id6743711998), [Idle Life Sim](https://apppricinglab.com/app/apple/1501361660)
- [Google Play: yeni kişisel hesaplar için test şartı](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB)
