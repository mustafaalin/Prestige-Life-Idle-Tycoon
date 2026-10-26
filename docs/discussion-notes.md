# Tartışma notları (sonra konuşulacak)

Kararı henüz verilmemiş konular ve Claude'un önerileri. **Karar verilince ilgili belgeye (plan, hikâye, tasarım, monetizasyon) taşınır ve buradan silinir**; burada yalnızca açık konular durur.

Son güncelleme: 2026-10-21 (ekonominin yeniden kurulmasından sonra sadeleştirildi: hanedan matematiği, Burak hattı ve eski ekonomi ayarları kapandı ya da 2. nesle kaldı)

## 0. Telefon testi (2026-10-21, kullanıcı; inceleme sürüyor)

Kullanıcının telefonda bulduğu her şey burada; yapılan madde ilgili belgeye taşınır ve buradan silinir. Yapıldı (2026-10-21): şişeler menünün üstünde, Şans alınana kadar bekliyor, "kendini öder" kalktı, kampanya kartta görünüyor, uzun seviye adı taşmıyor.

**Kayıt (öncelik):** güncellemeden sonra oyun baştan başladı. Neden: ekonomi yeniden kurulurken şema 1 → 2 geçişi bilinçli tek seferlik sıfırlamaydı (`storage.ts` `migrate`, eski kayıt `prestige_life_v2_pre_rebuild` altında duruyor). Kullanıcı tekrar hatırlattı: **yayından sonra hiçbir güncelleme ilerlemeyi silmez**. `npm run savecheck` kuruldu (session-handoff "Kayıt uyumluluğu"); sıfırlama bir daha yapılmaz.

**Kariyer:** kararlaştı ([archive/career-redesign.md](./archive/career-redesign.md), kurallar [game-design-v2.md §4.4](./game-design-v2.md)); ekran, iş değişimi şovu ve ikonlar [rebuild-plan.md E7](./rebuild-plan.md)'de. Açık kalan: aylık gelir çok hızlı artıyor (işletmeler). Maaşın payı 23–45 yaşta %2–8; kullanıcı dengeyi bozmasın diye böyle kabul etti (2026-10-21).

**İlk iş ile tezgâh arası (2026-10-24, kullanıcı; öneri bekliyor):** ilk işten sonra tezgâhın $1.000'ına kadar (~3–4 dk) şişe toplamaktan başka yapacak şey yok, Şans belki gelir. Bisiklet çadırda yaşarken tuhaf ve yakın zamanda onu isteyen iş yok (Bisikletli Kurye bulaşıkçı ya da hamaldan sonra açılıyor; çadırdan minibüse geçmek de bisiklet istiyor). Claude'un önerisi kullanıcıya sunuldu: (1) bu arada var olan bir olay kartı, (2) el ilanı işinin ustalık çubuğu hedef olarak ("3 ayda bulaşıkçılık açılır"), (3) bisiklet hedefi bulaşıkçıdan sonraya, kartında "Bisikletli Kurye'yi açar". Karar bekliyor.

**Beklemeyi parasız işlerle doldurmak (2026-10-24, kullanıcı):** "Oyunda yapacak bir şey olmazsa oyuncu sıkılıp çıkar." Idle Guy'daki gibi beceriler (güç, zekâ, karizma), mutluluk ve sağlık, yemek, flört; iş değiştirirken bunların belli seviyede olması istensin. Parasız ya da çok az parayla yapılacak şeyler öncelikli; Yatırım'daki kilitli Borsa ve Emlak sonra (parası olanın işi). Bu, önceki "sağlık/mutluluk yok" kararını (2026-10-07, game-design §9) yeniden açıyor. **1. adım yapıldı (2026-10-25):** beceriler ve Kendim sekmesi oyunda ([game-design-v2.md §4.15](./game-design-v2.md)); telefonda denenecek, sonra 2. adım. Önceki üç öneriden olay kartı gereksiz kaldı; bisiklet hedefi bulaşıkçıdan sonraya alındı (2026-10-25); ustalık çubuğunu hedef yapmak hâlâ açık. **Kararlar (2026-10-25, kullanıcı):** önce yalnız 1. adım (beceriler), telefonda denenip sonra 2. adım; mutluluk ve sağlık yumuşak düşer, cezası yok (yalnız terfi şartında önemli, gelir kesilmez, uyarı yok); beceride tek yuva; sonra (aynı gün) Idle Guy gibi sürekli çalışma, en çok 3 seviye biriktirip "Topla", reklamla +2 seviye (ikinci yuva kalktı). Claude'un önerisi: alt menüye yeni bir sekme (oyunda "Beceriler", ilk adı "Kendim"); 1. adım üç beceri (Güç, Zekâ, Karizma; "Şans" köpeğin adı olduğu için beceri adı olamaz) parasız, gerçek zamanlı, tek yuva, erken mesleklerin şartı (ilk iş → tezgâh arasını bu doldurur); 2. adım mutluluk ve sağlık (hobiler, Şans'la yürüyüş, anneyi aramak, yemek; şişe parası yemeğe gider), cezası yok, yalnız terfi şartı; 3. adım Defne ile bağ çubuğu (hayat anları yaşla değil bağla); 4. adım Borsa ve Emlak. **Ayrıntılı araştırma ve yeni öneriler (2026-10-25, kullanıcı: "yemek, flört… araştır"):** [research/life-features-2026-10-25.md](./research/life-features-2026-10-25.md): A mutluluk + sağlık (yemek merdiveni ve "Ye", 4 hobi, tatil), B Defne bağı, C Şans'ın bağı ve buldukları koleksiyonu, D hayat listesi, E bağış ve itibar; dört açık soru kullanıcıda. **Kararlar (2026-10-25, ikinci tur):** mutluluk ve sağlık yalnız terfide işe yarar, her işin ikisi için alt sınırı olur; gülen poz yok; 10–12 hobi, bedavadan pahalıya + reklamla yapılanlar (önerilen liste ve alt sınırlar araştırma belgesi §5, onay bekliyor; açık: hobi ayrı yuva mı, sekme adı hobiler gelince); alt menüde "Kendim" → "Beceriler" (yapıldı). **Defne:** oyuncunun ilerlettiği yapı, kod ve görsel ihtiyacı belge §6'da; "tam" ya da "hafif" kararı kullanıcıda. **C (Şans'ın bağı + koleksiyon), D (hayat listesi), E (bağış ve itibar): şimdilik bekler, sonra düşünülecek** (kullanıcı, 2026-10-25). **Üçüncü tur (2026-10-25):** mutluluk ve sağlık üst barda (Idle Guy gibi), sekmede yer kaplamaz; reklamlı hobiler anında doldurmaz, %50 artırır; Defne etkileşimli ("tam" yapı, belge §6). **Dördüncü tur:** hobi listesi onaylandı, hobi ayrı yuva (beceriyle aynı anda), hobiler ve beceriler ayrı ekranlarda (öneri: Hobiler kendi alt menü düğmesi). 2. adım telefon denemesinden sonra yapılacak.

## 1. Görsel

Yaklaşım (görsel roman) ve stil (yarı 3D) kararlaştı: [story-v2.md §8](./story-v2.md). Sahne kahramanı için Rive ile hareketli parçalı sürüm pilotu sürüyor (aşağıda "Karakter animasyonu").

- **Okşama pozunda tasma sabit:** `hero-*-pet-sans.webp` kahramanla Şans'ı tek resimde çiziyor; tasma o resimdeki. Fularlı ikizler oyunda (2026-10-21); bedava tasmalar sabit kalır, yakut gelince (IAP 2. adım) yeniden bakılır.
- **İki çizim dili:** önsöz 3D'de (2026-10-21, altı kare oyunda). Açık: sokak kahramanı ve ana kadro portreleri de 3D'ye geçsin mi.
- **Uygulama ikonu ve özellik grafiği:** adaylar hazır, seçim bekliyor ([art-prompts-v2.md §1](./art-prompts-v2.md)).
- **Lüks oyuncaklar sahnede (plan 2.6):** jet ve helikopter ara sıra geçer, yat sahil evinde, tekne göl evinde.
- **Karakter animasyonu (2026-10-25, kullanıcı: referanstaki gibi sürekli hareket eden idle):** araştırma [research/character-animation-2026-10-25.md](./research/character-animation-2026-10-25.md): iskelet animasyonu (Spine ya da Rive), önce sokak kahramanı + Şans'la pilot, beğenilirse kahraman katmanlı yeniden çizilir (lansmandan sonra). **Araç: Rive** (kullanıcı, 2026-10-25: Spine pahalı; kullanıcı Rive üyeliğini açıp verecek). Rive'ın resmî MCP'si (masaüstü editör açıkken) ve komut satırı aracı var; kemik ve mesh desteğinin MCP / CLI'dan kurulabildiği doğrulanmadı, Cadet ($9/ay) yalnız filigransız dışa aktarım için gerekli. **Denendi (2026-10-25):** CLI kemik + resim mesh'i + skinning kurabiliyor; sokak kahramanının tek parça resmiyle nefes ve kafa hareketi çalıştı (video `~/Downloads/rive-kahraman-deneme.mp4`, belge §6). Göz kırpma, ağız ve kollar için o bölgelerin ayrı katmanı gerekir. **Sonra (2026-10-25):** see-through ile parçalı kahraman kuruldu (göz kırpma, bakış, baş dönmesi, R3 ağızları; belge §8). **Manken + giydirilen kıyafet** (üst / alt / ayakkabı ayrı) deneniyor: komutlar [art-prompts-v2.md §0f](./art-prompts-v2.md), belge §9; açık: lansmanda takım olarak mı, parça parça satış lansmandan sonra mı (öneri).
- **Kahraman 60'a kadar yaşlanmıyor:** 31'inde baba, 50'lerinde Milyarder'e yaklaşan kahraman 23'lük görünüyor; 60+ dede görünümü var. Yetişkin dönemi her kıyafetin yeniden üretimi demek.
- **Sonra:** annenin mesajında telefona bakan kahraman pozu; özel anlar için kısa yapay zekâ videosu (Higgsfield MCP ya da fal.ai, maliyet önce söylenir); mağaza tanıtım videosu için Remotion (`video/` klasörü, yayından önce).

## 2. Oyuncuyu oyunda tutma

Claude + GPT'nin birleşik önerisi (2026-10-20, eski ekonomide ölçüldü): [archive/engagement-strategy-v2.md](./archive/engagement-strategy-v2.md); GPT'nin raporu ve rakip incelemesi [research/](./research/). Ekonominin yeniden kurulması (şartlı meslekler, kurslar, seviye + şube, 19 reklam yeri) "oturumda yapacak bir şey yok" sorununun bir kısmını karşıladı; ölçüm yeni ekonomide tekrarlanmadı. Bekleyen öneriler:

1. **Boşluk ölçüsü simülatörün içinde:** oturum başına anlamlı eylem sayısı ve en uzun eylemsiz süre; yeni profiller (günde 1–3 oturum, 24 / 72 sa ara).
2. **İş teklifleri:** olay kartlarının büyümüş hâli; tek alan, aynı anda tek iş, 60–90 sn, iki seçenek (para ya da yakın hedefe yardım), çevrimdışında da biter.
3. **Üç katmanlı hedef:** şimdi / bu oturum / hayatım; hedef rozeti ve hayaller panosu kullanılır.
4. **Zenginliği hissettirmek:** önemli alımda "Aylık gelir: $120K → $145K" ve hayale kalan süre; tören kartında "1 saniyede el ilanı işinin 3 yıllık maaşı"; Milyon → Milyar geçişinde parıltı.
5. **Aşamalı projeler:** Rıza'nın atölyesi ve annenin konağı. Yeni ekonomide Multimilyarder ve En Zengin törenleri 1. nesilde gelmediği için bu iki an (atölyenin anahtarı, annenin büyük pencereli konağı) şu an hiç oynamıyor; proje olarak 1. nesle alınabilirler (öneri).
6. **Sonra:** günlük üç görev (oynanış keyifli görülürse), yönetici terfisi, süreli etkinlikler.

## 3. Hikâye

- **Hikâye ayrıntıları:** anne, Rıza'yı tanıyor olmalı (eşinin en yakın arkadaşı); Şans'ın getirdiği şey sınıfa göre değişsin mi; Defne ve kızından mesajlar.

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
