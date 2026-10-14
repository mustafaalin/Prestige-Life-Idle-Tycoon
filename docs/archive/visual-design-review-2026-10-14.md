# Görsel tasarım incelemesi

Tarih: 2026-10-14 · Durum: öneri; uygulama veya yeni üretim yapılmadı.

## Kapsam ve doğrulama

Güncel handoff, üretim planı, art brief, hikâye ve monetizasyon belgeleri; sahne/yerleşim, hikâye oynatıcı, portre seçimi, IAP mağazası, zenginler listesi ve emeklilik kodu incelendi. Runtime'daki önsöz, dört lüks anı, düğün, sokak kahramanı, örnek portreler, göl evi, uyuyan Şans ve dört lüks nesne dosyası doğrudan açılıp değerlendirildi.

Geçici bir kontrol betiği config/işletme/kariyer/ev/eşya/IAP, ortak ikon, sınıf görünümü, kahraman pozları ve ifade portreleri, ana kadro/yönetici portreleri, tören/hayat anı/önsöz referanslarından 184 benzersiz görsel yolu çıkardı. Hepsi mevcut. Bu kontrol bütün uygulamanın ağ/ekran testi değildir.

Yerel dev sunucusu açıldı ancak bu oturumda bilgisayar kullanım aracına bağlı tarayıcı yoktu; canlı ekran ve mobil kadraj doğrulaması yapılamadı. Sunucu kapatıldı. Aşağıdaki kodla doğrulanan sorunlar ile telefon kontrolü gerektiren öneriler ayrıdır. Renk kontrastı veya dokunma alanlarına ölçülmüş geçer/kalır sonucu verilmedi.

## Tamamlanmış işler: tekrar üretme

- Palto, üç parçalı takım, smokin: pozlar ve portreler runtime'da; `stages.ts` ve `ceremonyScript.ts`.
- Dört lüks hikâye anı: `lifeScript.ts` ile `story/life/{boat,yacht,heli,jet}.webp` kullanılıyor.
- Uyuyan Şans: ip, deri ve altın tasmalı üç runtime görsel; çevrimdışı kartında seçiliyor.
- İki IAP: `config/iap.ts` → `assets/iap/{comfort,starter}.webp`; mağazada ve teklif kartında kullanılıyor.
- Atölye, yedi tören, kariyer ve işletme ikonları mevcut.

`story-v2.md` §8'in uyuyan Şans ve atölye satırları, `art-brief-v2.md`'nin dört kıyafet ifadeleri, eski üretim/teslim notları güncel durumla yer yer çelişiyor. Gelecek üretim listesi bunlardan doğrudan çıkarılmamalı. Bu inceleme eski belgeleri topluca değiştirmiyor.

## Öncelik 1 — Ücretli fuların devamlılığı

**Kodla doğrulandı:** `Scene.tsx` oturan köpeğin üzerine `hasScarf` koşuluyla fular bindiriyor. Cüzdanlı görselde aynı bindirme yok. Okşama tek bir kahraman+köpek görseli; köpek oturma katmanı o sırada gizleniyor. Çevrimdışı kartı tasma varyantını seçiyor, satın alınan fuları seçmiyor (`HomeScreen.tsx`). Sonuç: aynı ücretli aksesuar farklı pozlarda kayboluyor.

Önce ayrı fular görselini poz başına boyun noktalarına yerleştirme olanağını değerlendirin. Oturan pozda zaten kullanılan yöntem budur. Uygunsa **yeni üretim yok**, poz başına konum/ölçek ve gerekirse örtüşme maskesi gerekir. Fular boyun açısı değiştiğinde doğal oturmuyorsa 2–3 açı varyantı veya ilgili köpek pozu düzenlemesi üretilebilir. Baştan 7 kahraman+köpek görseli ve bütün tasma kombinasyonlarını yeniden üretmek ilk tercih olmamalı.

Kabul: oturma, cüzdan, uyku ve 7 kıyafetle okşama; aksesuar baş/yaka/el ile yanlış örtüşmüyor, tasma rengi korunuyor, yeni nesilde satın alma hakkı görünür kalıyor. Eski sabit hikâye karelerini ücretli fular için topluca yeniden çizmek gerekmiyor.

## Öncelik 2 — Lüks satın alma ana sahnede iz bıraksın

**Kodla doğrulandı:** `Scene.tsx` kara aracını render ediyor; dört lüks için bir sahne katmanı yok. Hikâye anları ve albüm artık var, ancak alışveriş sonrası günlük ana ekran değişmiyor.

Küçük ilk kapsam: jet ve helikopter için aralıklı geçiş; sahil evinde yat; uygun su kıyısında tekne. Mevcut göl evi sağda iskele/su içeriyor, fakat araç/kahraman yerleşimiyle birlikte test edilmeden tekne eklenmemeli. Her evde su varlığı gösterilmemeli.

Mevcut nesne görselleri mağaza için 3/4 açıyla çizildi; sahne için otomatik uygun değiller. Önce yerleşim denemesi yapın. Yeni üretim gerekirse hedef paket:

1. Jet: uçuş açısı, iniş takımları kapalı, şeffaf zemin.
2. Helikopter: uçuş açısı, rotor hareketi ayrı katman veya kısa döngü; gövde/renk mevcut ürünü izler.
3. Yat: su çizgisinde oturan yan/3/4 görünüm, mağaza nesnesiyle aynı model/renk.
4. Tekne: aynı model, su çizgisinde görünüm.

İlk iki öğe daha geniş ev kapsamına hizmet eder. Garaj/marina ekranı veya yeni sahil evleri bu küçük kapsam için önkoşul değildir. Hava araçları üst bar/yan düğmelerle yarışmamalı.

## Öncelik 3 — Mevcut kesimleri temizle

**Dosyalarda gözlendi:** `luxury-speedboat.webp` altındaki geniş gri gölge ve sert bitiş; yatın sol altındaki gri kalıntı; jetin alt gövde ve kanat kenarındaki açık renkli kenarlar; helikopterin bazı boşluk/kenarlarında açık gri alanlar. Sokak kahramanının bazı saç/kol/ayakkabı kenarları da koyu zemin üzerinde kontrol edilmeli.

Bu bir yeni tasarım ihtiyacı değil, alpha/kesim temizliği. Açık renk gövdeleri kesimde delmeden kalıntıları kaldırın; gerçek gölgeyi ayrı katmanda, kullanılacağı yüzeye göre verin. Beyaz, koyu lacivert ve oyundaki zeminler üzerinde test edin. Geniş tek bir toleransla tüm kaynakları yeniden kesmeyin; beyaz gövde ve ayakkabılar zarar görebilir.

## Öncelik 4 — Stil sürekliliği

Önsöz, sokak kahramanı, ana kadro ve yeni lüks hikâye karelerinde belirgin çizgi/illüstrasyon dili var; geç kıyafetler, evler, mağaza lüksleri ve bazı törenler daha hacimli 3D. Aynı kişi tanınsa da bölüm değişince çizim dili değişiyor. Jet/helikopter hikâye kareleri bu farkı tekrar getiriyor; konu sadece önsözün eskiliği değil.

Öneri: oyun içi sıcak, yumuşak yarı 3D dil hedef olarak sabitlensin. Mevcut `prologue-4-door-3d.png` örneği eski kare ve ana ekranla yan yana değerlendirilip stil seçimi yapılsın. Bu bir mevcut karar değil. Ardından sıralama:

- Önsöz: altı karelik tutarlı set; mevcut deneme uygunsa kalan beş, değilse altısı.
- Sokak kahramanı: önce bekleme pozu + tek ifade örneği; kimlik korunuyorsa diğer poz/ifadeler.
- Ana kadro: anne/Rıza/Bülent'te ancak yan yana karşılaştırma farkı rahatsız ediyorsa yeni set; tüm yönetici/Defne/Nevin portrelerini otomatik yeniden çizme.
- Dört lüks hikâye karesi: içerik hazır, yalnız stil revizyonu adayı. Hepsini yeni içerik gibi planlama.

Nesne sürekliliği de kontrol edilmeli: mağazadaki tekne krem gövdeli, ahşap güverteli ve ince kırmızı çizgili; hikâye karesinde daha büyük kırmızı gövde alanları var. Gelecek revizyonda aynı satın alınan tekne tanınmalı. Şans'ın bükük kulağı ve baş oranı kareler arasında sabit kalmalı.

## Öncelik 5 — Telefon yerleşimi; yeni resimden önce

- 12 ev, 12 kara aracı ve 7 kıyafet kombinasyonlarında ayak hizası, boy, ev kimliğinin kapanması ve ışık: özellikle göl evi ve büyük araçlar.
- Düğün/yat karelerinde Şans ve pasta; jet karesinde alttaki Nevin/Rıza: hikâye balonunun kapatması telefon üzerinde doğrulanmalı. Kaynakta görünmeleri ekranda da göründüklerini kanıtlamaz. Kodun panel yerleşimi uzun telefonda yan kırpmayı azaltıyor; bütün kareleri eski notlara göre yeniden kadrajlama.
- Küçük portrelerde baş büyüklüğü, göz hizası ve kıyafetler arası renk sıcaklığı.
- Ana ekranda boost, albüm, liste ve mağaza düğmeleri: koddan yoğunluk riski var; gerçekten karakteri kapatıp kapatmadığı canlı ekran olmadan kesinleştirilemez.
- `CoinLayer` z-index 90; liste kartı 80. Handoff'taki uçan paraların hikâyenin üstünden geçmesi notu kodla uyumlu. Önce animasyon/kart zamanlaması düzelsin; yeni efekt üretimine gerek yok.

Mağaza ve liste ana ikonları `Store`, `Trophy`, `Newspaper` vektörleri; diğer büyük gezinme ikonları raster 3D. İleride 2–3 raster ikonla görsel aile tamamlanabilir, ama bu düşük öncelik. Ok/kilit/onay/kapat/ayar işaretlerini vektör tutun. Liste rakipleri için 20 ayrı portre üretmek mevcut tasarımda gerekli değil.

## Daha sonra: aile ve nesil görselleri

Kızın kimliği/yaş aşamaları ve varis henüz görsel olarak tasarlanmamış; belge bunu açıkça söylüyor. Emeklilik paneli mevcut, fakat hanedan devri için özgün sahne yok. Nesil içeriği seçilince kız kılavuzu, varis kılavuzu ve tek devir karesi yüksek değerli olabilir. Okul/mezuniyet/torun için beş ayrı kare veya yeni şehir seti, tetik ve içerik tasarımı netleşmeden üretilmemeli. Kahramanın yaşlanmaması mevcut bilinçli karar; 80 yaş portresi üretimini kendiliğinden gerektirmiyor.

## Önerilen iş sırası

1. Fuların bütün canlı pozlarda devamlılığı + mevcut kesim temizliği.
2. Jet/helikopter sahne yerleşimi denemesi; gerekiyorsa iki uçuş asset'i.
3. Telefon QA; yat/tekne yerleşimi; gerekiyorsa iki su üstü asset'i.
4. Tek örnek üzerinden stil seçimi, ardından önsöz ve sokak setinin aşamalı uyumu.
5. Nesil içerik kararıyla kız/varis/devir seti.

Yeni ev, kara aracı, kıyafet, IAP kartı, lüks hikâye anı ve kariyer/işletme ikonlarını baştan üretmek şu anda öncelik değil. En yüksek kazanç, mevcut üretimi tutarlı ve sahnede hissedilir hâle getirmekte.
