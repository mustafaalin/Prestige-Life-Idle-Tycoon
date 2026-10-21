# Tartışma notları (sonra konuşulacak)

Kararı henüz verilmemiş konular ve Claude'un önerileri. **Karar verilince ilgili belgeye (plan, hikâye, tasarım, monetizasyon) taşınır ve buradan silinir**; burada yalnızca açık konular durur.

Son güncelleme: 2026-10-21 (ekonominin yeniden kurulmasından sonra sadeleştirildi: hanedan matematiği, Burak hattı ve eski ekonomi ayarları kapandı ya da 2. nesle kaldı)

## 0. Telefon testi (2026-10-21, kullanıcı; inceleme sürüyor)

Kullanıcının telefonda bulduğu her şey burada; yapılan madde ilgili belgeye taşınır ve buradan silinir.

**Kayıt (öncelik):** güncellemeden sonra oyun baştan başladı. Neden: ekonomi yeniden kurulurken şema 1 → 2 geçişi bilinçli tek seferlik sıfırlamaydı (`storage.ts` `migrate`, eski kayıt `prestige_life_v2_pre_rebuild` altında duruyor). Kullanıcı tekrar hatırlattı: **yayından sonra hiçbir güncelleme ilerlemeyi silmez**. Öneri: farklı sürümlerden örnek kayıtlarla `npm run savecheck` (her şemanın kaydı açılınca para, sınıf, işletmeler, iş korunuyor mu); yayından önce şema 2 → 3 sıfırlaması bir daha yapılmayacak.

**Sahne**
- Şişeler alttaki düğmelerin arkasında kalıyor (tıklanıyor ama görsel olarak hatalı; başka cihazlarda daha kötü olabilir).
- Bazı evlerin önünde araçlar çok büyük: her ev × araç için ayrı yerleşim (sonra, tek tek bakılacak).
- Şans bulduğu şeyle gelince havlama sesi ne olduğunu anlatmıyor; Şans bir süre durup gidiyor, başka ekrandaki oyuncu ödülü kaçırıyor. Kullanıcı: alınana kadar beklesin.

**Kariyer**
- Süre şartları çakışıyor: aynı işten 6 ve 12 ay isteyen iki iş var (bulaşıkçı → garson 6, aşçı 12; mağaza satış danışmanı → satış temsilcisi 12, mağaza müdürü 36). 10 ayda geçen oyuncu 12 ay isteyen işe bir daha giremiyor (kurallar eski işe dönmeye izin veriyor ama ekran daha düşük maaşlı işi göstermiyor). Çok iş "El ilanında 6 ay" istiyor.
- Kullanıcının önerisi: daha dikey meslekler (az yatay dal), düzenli artan maaşlar, her işte tek ve aynı "uzmanlık" süresi (önceki işte uzmanlığı bitirmek) + 2–3 ek şart, böylece diğer geliştirmeler paralel yürür. CEO maaşı $5–10M/ay, CEO'ya oyunda birkaç haftada varılır.
- Uzmanlık süresi tek olursa iş kartının çevresinde dolan bir şerit; dolunca uzmanlık tamam.
- Kilitli işlerin adı görünsün, maaşı ve giriş ücreti görünmesin. Giriş ücreti neden var? (kullanıcı ücretsiz sanıyordu; tasarımda $20 → $20K "küçük bedel").
- Deneyim reklamı: her reklam 3 ay, her işte yalnız 1 kez (şimdi günde 3). Reklamsız paketi olan arka arkaya basıp geçişleri çok hızlı yapıyor. Aylık gelir çok hızlı artıyor.
- İş değişiminde görsel şölen yok: referans oyunda arka plan kararıyor, eski işin ikonu ve maaşı ortada, kayıp çıkıyor, yenisi kayarak geliyor, maaş eskisinden yenisine sayarak artıyor, "+$X" yazıyor. Daha iyisi tasarlanacak.
- Eski işler görünmüyor; sıradaki işe dokununca eksik şartları gösteren bir detay penceresi.
- Kurslar ekranın altında kalmış, ne olduğu anlaşılmıyor: "İşler / Kurslar" sekmeleri.
- Dallanma kalırsa dalları gösteren bir harita (referans `jobs.jpeg`); gerekirse meslek sayısı artar. Hikâyeye uygun olan yapı seçilecek.

**İşletmeler**
- "Kampanya ×2 15 dk" reklamının ne yaptığı görünmüyor (o işletmenin turları 15 dk ×2 ödüyor ama kartta iz yok).
- "Kendini 3 yılda öder" yazısı kalksın; maliyet kalsın.
- Seviyeler 10 (yeni görünüm 8 ve 10'da): eşit aşamalar olsun, 5 + 5 ya da 6 + 6; her aşamanın son seviyesinde "yeni binaya geçiş" bilgisi ve belirgin gelir artışı.
- Bütün turlar 1 sn; her saniye "+$8" gibi bir kabarcık (yeşil banknot ikonuyla) çıkıp söner. Yöneticiliyse her saniye, değilse "Çalıştır"a basınca.
- Kahve Arabası'nda "Şemsiye ve tabureler" düğmesi uzun, "Yönetici" düğmesi ekrandan taşıyor: düğme satırı dar ekranda düzgün sarılmalı.

**Sınıf ve eşyalar**
- İşçi Sınıfı'na çok hızlı geçildi, ev ödülü geldi; yalnız bisiklet varken arka arkaya modern hatchback'e kadar 4 araç alındı. Ya sınıf geçişi yavaşlasın ya önceki araçlar sırayla alınsın ya da başka bir yol.

## 1. Görsel

Yaklaşım (görsel roman) ve stil (yarı 3D) kararlaştı: [story-v2.md §8](./story-v2.md).

- **Okşama pozunda tasma ve fular sabit (AAB 28 testi):** `hero-*-pet-sans.webp` kahramanla Şans'ı tek resimde çiziyor; tasma hep o resimdeki, fular okşarken kayboluyor. Seçenekler: poz başına varyant (8 poz × 5 tasma, çok) ya da yalnız ücretli olanlar (fular, yakut) için varyant.
- **İki çizim dili:** önsöz 3D'ye geçiyor (karar 2026-10-17; kapı karesi hazır, kalan beşi [art-prompts-v2.md §2](./art-prompts-v2.md)). Açık: sokak kahramanı ve ana kadro portreleri de 3D'ye geçsin mi.
- **Uygulama ikonu ve özellik grafiği:** adaylar hazır, seçim bekliyor ([art-prompts-v2.md §1](./art-prompts-v2.md)).
- **Lüks oyuncaklar sahnede (plan 2.6):** jet ve helikopter ara sıra geçer, yat sahil evinde, tekne göl evinde.
- **Kahraman 60'a kadar yaşlanmıyor:** 31'inde baba, 50'lerinde Milyarder'e yaklaşan kahraman 23'lük görünüyor; 60+ dede görünümü var. Yetişkin dönemi her kıyafetin yeniden üretimi demek.
- **Sonra:** annenin mesajında telefona bakan kahraman pozu; özel anlar için kısa yapay zekâ videosu (Higgsfield MCP ya da fal.ai, maliyet önce söylenir); mağaza tanıtım videosu için Remotion (`video/` klasörü, yayından önce).

## 2. Oyuncuyu oyunda tutma

Claude + GPT'nin birleşik önerisi (2026-10-20, eski ekonomide ölçüldü): [archive/engagement-strategy-v2.md](./archive/engagement-strategy-v2.md); GPT'nin raporu ve rakip incelemesi [research/](./research/). Ekonominin yeniden kurulması (şartlı meslekler, kurslar, seviye + şube, 19 reklam yeri) "oturumda yapacak bir şey yok" sorununun bir kısmını karşıladı; ölçüm yeni ekonomide tekrarlanmadı. Bekleyen öneriler:

1. **Boşluk ölçüsü simülatörün içinde:** oturum başına anlamlı eylem sayısı ve en uzun eylemsiz süre; yeni profiller (günde 1–3 oturum, 24 / 72 sa ara).
2. **İş teklifleri:** olay kartlarının büyümüş hâli; tek alan, aynı anda tek iş, 60–90 sn, iki seçenek (para ya da yakın hedefe yardım), çevrimdışında da biter.
3. **Üç katmanlı hedef:** şimdi / bu oturum / hayatım; hedef rozeti ve hayaller panosu kullanılır.
4. **Zenginliği hissettirmek:** önemli alımda "Aylık gelir: $120K → $145K" ve hayale kalan süre; tören kartında "1 saniyede el ilanı işinin 3 yıllık maaşı"; Milyon → Milyar geçişinde parıltı.
5. **Aşamalı projeler:** Rıza'nın atölyesi ve annenin konağı. Yeni ekonomide Multimilyarder ve En Zengin törenleri 1. nesilde gelmediği için bu iki an (atölyenin anahtarı, saray sözü ve pasta) şu an hiç oynamıyor; proje olarak 1. nesle alınabilirler (öneri).
6. **Sonra:** günlük üç görev (oynanış keyifli görülürse), yönetici terfisi, süreli etkinlikler.

## 3. Hikâye

- **1. neslin kapanmayan sözü:** annene verilen saray sözü ve pasta En Zengin töreninde kapanıyordu; En Zengin artık torunla. 1. nesil Milyarder'de (~70 yaş) ve 80'de "Torununun hikâyesi yakında"yla bitiyor. Sözün 1. nesilde kapanması için seçenekler: §2.5'teki konak projesi, 80 yaş kartına bir balon, ya da Milyarder töreninde ilk adım.
- **Törenlerin zamanlaması:** Milyarder töreni artık ~70 yaşta (bağlı bot; gündelik 55): kahraman, önsözdeki patronu Bülent Bey'in restoranlarını satın alıyor ve ona iş teklif ediyor; Bülent Bey o yaşta çok yaşlı. "Yaşı çok ilerleyen yan karakterler 55'ten sonra görünmez" kuralıyla (story §6) çelişiyor; törenin metni ya da kişileri gözden geçirilmeli.
- **İki anne mesajını kimse görmüyor:** İşçi ve Orta Sınıf mesajları günde bir mesaj kuralı yüzünden yetişmiyordu; yeni tempoda yeniden bakılmalı.
- **Hikâye ayrıntıları:** anne, Rıza'yı tanıyor olmalı (eşinin en yakın arkadaşı); Şans'ın getirdiği şey sınıfa göre değişsin mi; Defne ve kızından mesajlar.
- **Olay kartları çok tekrar ediyor:** 10 kart, Orta Sınıf'tan ömür sonuna her kart onlarca kez. Büyük set (plan 2.4) gelene kadar: hepsi görülmeden tekrar yok, günde en fazla ~6 kart.

## 4. Ekonomi

Kurallar ve sayılar [game-design-v2.md](./game-design-v2.md); sonraya bırakılanlar §8.

- **Faz 1 kapısı yeniden yazılmalı:** "ilk oturumda Orta Sınıf ≥ %60" yeni tempoda tutmuyor (Orta Sınıf 21 yaş, bağlı botta 1 sa 11 dk, 2. gün).
- **Reklam izleyenin erken oyunu:** Orta Sınıf %51, Milyoner %59 erken (×2 hızlandırıcı ilk dakikadan açık). Kullanıcı isterse erken oyun ayrıca frenlenir.
- **Her işletmeye kendi seviye tablosu;** Fabrika'dan Medya'ya ~8,5 saat yeni işletme yok.
- **Gece Vardiyası IAP'ı** %20 / 1 sa çevrimdışına göre yeniden yazılacak.
- **Yöneticisiz işletmeye dokunma:** AdCap modeli ("Çalıştır" → tek tur). "Dokundukça hızlanır" alternatifi oyun testinden sonra.

## 5. Simülatörün sınırları

- Bot açgözlü ve optimal; menü okuma, hikâye izleme, kararsızlık yok; kursta en ucuzunu seçer.
- Gerçek doğrulama oyuncu gözlemi ve analitikle.

## 6. 2. nesil (yayından sonra)

Lansman 1. nesil; devir, miras ve Lumen kodda, kapalı ([game-design-v2.md §4.10](./game-design-v2.md), [story-v2.md §6](./story-v2.md)). Açık konular:

- **Sıfırlamasız devirde mirasın anlamı:** torun her şeyle devam ediyor (karar 2026-10-20); miras puanı ve yadigârlar bu durumda ne verir.
- **Lumen'in ekonomiyle uyumu:** Lumen 10 işletme için çizildi; 14 işletmeye ve üç görünüme göre ek görsel gerekir (yeni dört işletme, yöneticileri, 2. ve 3. görünümler).
- **Ada'nın görselleri** ([art-prompts-ada.md](./art-prompts-ada.md)), 2. neslin tören ve rehber metinleri, Lumen olay kartları; dede rehber olur, annenin mesaj kanalı kızına geçer (öneri).
- **Burak hikâyesi** kaldırıldı (2026-10-21); metinleri [archive/burak-story.md](./archive/burak-story.md). Geri gelirse kapsamı yeniden konuşulur.

## 7. Diğer

- **Zenginler Listesi:** benzetme isimlerin hukuki riski (portre, şirket adı, logo yok, ton alaycı değil; kullanıcı benzetme isimleri seçti).
- **Başarımlar:** Google Play Games, plan 2.13 (sonra).
- **Fiyat A/B testleri:** Başlangıç Paketi fiyatları Remote Config ile (Faz 3).
- **Açıklama metinleri çok (AAB 28, kullanıcı):** kartların altındaki küçük açıklamalar; kullanıcı yerlerini gösterince kısaltılacak.
- **Çevrimdışı kartı ve Rahat Paket:** 10 dakikadan kısa ayrılıkta ek teklif yok; kullanıcı paket sahibine "+%30 senin"in açıkça söylenmesini istiyor.
