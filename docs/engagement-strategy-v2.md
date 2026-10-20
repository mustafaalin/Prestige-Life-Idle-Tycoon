# Oyuncuyu oyunda tutma stratejisi (öneri)

Tarih: 2026-10-20 · Durum: **öneri, kullanıcı kararı bekliyor**. Kararlaşan madde ilgili belgeye (tasarım, hikâye, plan) taşınır ve buradan silinir. İlgili: [game-design-v2.md](./game-design-v2.md), [story-v2.md](./story-v2.md), [discussion-notes.md](./discussion-notes.md) §2, §6. GPT'nin aynı soruya raporu: [research/retention-strategy-2026-10-20.md](./research/retention-strategy-2026-10-20.md); bu belge iki raporun ve GPT'nin bu birleşik hâle ikinci tur itirazlarının (2026-10-20) sonucudur (bölüm 3). Rakip incelemesi (Idle Guy, kullanıcının ekran görüntüleri): [research/idle-guy-analysis-2026-10-20.md](./research/idle-guy-analysis-2026-10-20.md); oradaki terfi şartları ve kurs önerileri henüz bu belgeye işlenmedi.

Soru (kullanıcı): oyuncu biraz ilerledikten sonra çoğu yerde yapacak bir şey kalmıyor. Oyuncu oyunda nasıl tutulur, zenginleşme hissi nasıl doyasıya yaşatılır, hikâye nasıl anlatılır?

## 1. Teşhis: simülatörle ölçüldü

Ölçüm `npm run sim`'in botuyla yapıldı (bağlı oyuncu: 1. gün 30 + 10 + 7 dk, sonra günde 6 × 7 dk; bot optimal oynar). Bir oturumdaki alımlar (işletme, adet, yükseltme, yönetici, terfi, ev, eşya) sayıldı.

| Dönem (bağlı oyuncu) | Hiç alım olmayan oturum | En çok 1 alım | Alımların oturumun ilk 30 sn'sinde yapılanı |
| --- | --- | --- | --- |
| 1. gün | %0 | %0 | %84 |
| 2–4. gün | %11 | %28 | %87 |
| 5–10. gün | **%56** | **%78** | %91 |
| 11–17. gün (1. nesil sonu) | **%62** | **%83** | %93 |
| 2. nesil, ilk gün | %0 | %0 | %65 |
| 2. nesil, sonrası | %38 | %48 | %79 |

Gündelik oyuncuda (günde 3 × 5 dk) 11–17. gün %43 / %71.

Kayda değer anlar (sınıf, ev, eşya, yeni işletme, yönetici, terfi, Zenginler Listesi sırası), 1. nesil, oyun saatine göre: 0–1. saat 34 (~2 dk'da bir), 1–3. saat 17 (~7 dk), 3–6. saat 9 (~20 dk), 6–12. saat 10 (~36 dk). En uzun boşluklar 91 dk (Director → CEO), 77 dk, 59 dk. Ortalama aralık tek başına boş oturum dizisini göstermez (GPT); diziler ayrıca ölçüldü: 1. nesilde bağlı oyuncunun oturumlarının %69'unda kayda değer bir an yok, üst üste boş oturum dizilerinin en uzunları 12, 10, 8, 6, 6 oturum (12 oturum = 2 günlük oyun), 3 ve daha uzun 9 dizi; gündelik oyuncuda %72, en uzun 11, 10, 10. En boş dönem Milyarder → Multimilyarder (2–8. gün) ve Multimilyarder → En Zengin (8–15. gün).

**Kök neden:** oyuncu girer, çevrimdışı kartını toplar, parayı ilk 30 saniyede harcar; kalan 6,5 dakikada oyunda kazandığı para bir sonraki alıma yetmez. Orta Sınıf'tan sonra toplama da bittiği için ekranda kalmanın katkısı yalnız olay kartı (4–6 dk'da bir) ve Şans'tır (5–10 dk'da bir). Paranın %87'sinin çevrimdışından gelmesi (game-design §4.6) tek başına sorun değil, oyuncu günün çoğunu zaten uzakta geçirir (GPT); sorun, aktif kalınan dakikaların ne para ne karar olarak bir şey katmaması.

Ölçünün sınırları (GPT): bunlar bot ölçümü, gerçek oyuncu değil; betikler şimdilik geçici, 4.0'da simülatörün kendisine taşınır ki sonuç tekrar üretilebilsin. Bir de: "alım yok" ile "yapacak anlamlı şey yok" aynı değil. Gelire %0,01 ekleyen bir alım anlamlı eylem sayılmamalı; hikâye ya da karar veren bir eylem alım olmasa da sayılmalı. Simülatöre eklenecek ölçü buna göre tanımlanır (4.0).

## 2. Türden öğrenilenler (araştırma)

- **AdVenture Capitalist** (tasarımcısı Rimmy Spanjer): asıl risk döngünün 15 dakikada tamamen görülmesi; oyuncuyu en hızlı kaçıran şey "bitirdim" hissi. Hyper Hippo'nun tutmayı ve geliri artıran adımı süreli etkinlikler oldu.
- **Idle Miner Tycoon** (GDC 2019): yükseltme seçimleri düz merdiven değil, stratejik; birkaç sıfırlamadan sonra her şeyin aynı görünmesi yeni görsel madenlerle çözüldü; süreli etkinlik madenleri gelirde sıçrama yaptı.
- **Idle Guy: Life Simulator** (türün en yakın örneği, App Store 4,8 / ~73 bin oy): şikâyetler geç oyunda giderlerin geliri geçmesi, ilerlemenin reklama bağlanması, "birkaç kez oynadıktan sonra tutmuyor". Bizim farkımız (gider yok, hikâye, hanedan) bu şikâyetlerin karşılığı.
- **Egg, Inc.:** günlük 3 görev, süreli kontratlar.
- **Pecorella, "Quest for Progress"** (GDC Europe 2016, GPT'nin kaynağı): aktif yetenekler, eski üreticilerin ilgisini korumak, sıfırlamadan sonra güç hissi.
- **Motivasyon çerçevesi** (Przybylski, Rigby, Ryan 2010, GPT'nin kaynağı): yeterlik, özerklik, ilişki; bizde görünür ustalık, sonuç veren seçim ve bağ kurulan karakterler.
- Kıyas: idle/AFK oyunlarda D1 ~%35–50, D7 ~%20–30 (Playio; bölgeye göre değişir). Planın hedefi D1 ≥ %35, D7 ≥ %12.

## 3. İki raporun karşılaştırması

| Konu | Claude | GPT | Birleşik karar |
| --- | --- | --- | --- |
| Önce ölçü | Boş oturum, ilk 30 sn yığılması, an aralığı; ölçüldü | "Anlamlı eylemsiz süre"; ölçülmedi | Ölçü GPT'nin tanımıyla (anlamlı eylem), sayılar bu belgeden |
| İşletme sınırları | Önce sınırsız kopyada ölç | Kaldırma, önce başka akışları dene | Aynı: sınır kalır, yalnız ölçülür |
| Oturum içi eylem | "Yoğun saat": 40–70 sn'de bir dokunulacak baloncuk | "Kısa iş": tek aktif iş, iki teklif, 60–90 sn, çevrimdışı da biter | **GPT'ninki**, olay kartlarıyla tek alanda; bazı aramalar anında biten karakter olayı olarak kalır (4.1). Yoğun saat bırakıldı (angarya riski) |
| Her zaman yakın bir alım | Yönetici terfisi, fiyat o anki gelire bağlı | Kalıcı malı anlık gelire bağlamak alım gücü hissini öldürür | **GPT haklı.** Terfi ertelendi; gerekirse fiyat işletmenin kendi ölçeğine bağlı, sınırlı seviyeli (4.7) |
| Duygusal ara hedefler | "Mahalleye söz": 8 bağış | Annenin evi ve Rıza'nın atölyesi, aşamalı, birer kararlı | İkisi de kısmen oyunda var (aşağıda); **var olan iki ânı aşamalı projeye çevirmek** (4.3) |
| Hedef görünümü | yok | Şimdi / bu oturum / hayat hedefi | **Alındı** (4.2) |
| Alım geri bildirimi | Karşılaştırma satırı ("1 saniyede el ilanı işinin 3 yıllık maaşı"), basamak anı | Gelir önce/sonra ve hayale kalan süre ("8 dk → 6 dk 40 sn") | İkisi birlikte (4.4) |
| Olay kartları | 30 yeni kart, tekrar yok | Sonuç bırakan zincirler, bağlama göre seçim | Yeni kartlar 4.1'deki iş şablonlarıyla birlikte yazılır |
| Günlük görev | Var | Yok; ikinci turda: oynanış keyifli olduğu görülmeden olmaz | **GPT haklı**, ertelendi (4.6) |
| Burak'ın kazığı | Yok | "Başardığım hiçbir şey kalmadı" hissi riski | **Alındı, önemli** (4.5) |
| 2. nesil | Yok | Lumen'e tek bir yeni ekonomik tercih | Sonraya, 1. nesil düzeldikten sonra (4.8) |
| Oyuncu testi | Analitik | 6–8 kişilik gözlem, 7 günlük günlük | Alındı; kapalı test verisi kullanıcının hesapları olduğu için tanıdıklarla yapılır (bölüm 6) |
| Araç | MCP / depo gerekmez | Aynı | Aynı |

**İkinci tur (GPT'nin itirazları, hepsi kabul):** ölçümün sınırları ve boş oturum dizileri (bölüm 1); iş döngüsü "seç → bekle → topla" angaryasına dönmemeli (4.1); "yapmazsan törende bedava" kuralı beklemeyi ödüllendirir (4.3); altı proje aşaması boşluğu tek başına doldurmaz, işler projeyi ilerletmeli (4.3); Burak ekranı gerçekte kaybedileni korunmuş gibi gösteremez (4.5, Claude'un hatası); günlük görevler sonra (4.6).

**İki raporun da atladığı:** önerilen projelerin bir kısmı hikâyede zaten var. Rıza'nın atölyesi Multimilyarder töreninin hediyesi (story-v2 §4, "atölyenin anahtarları"), annenin evi Orta Sınıf (eski aile evi) ve En Zengin (konak) törenlerinde; benim "Mahalleye söz" listemin aşevi, erik ağacı parkı, atölye meslek okulu gibi maddeleri ise 3. neslin vakıf temaları (story-v2 §6). Yeni bağış listesi bunlarla çakışırdı. Daha iyisi: bu iki ânı, tam da ölçülen boşluk dönemlerinde aşama aşama oynanan projelere çevirmek (4.3).

## 4. Öneriler (öncelik sırasıyla)

### 4.0 Önce ölçü (kod yalnız simülatörde)

- **Anlamlı eylem:** gelire en az birkaç yüzde ekleyen alım, yeni bir şey açan alım (işletme, yönetici, ev, eşya), iş/olay kararı, proje aşaması, tören. Simülatör her oturum için anlamlı eylem sayısını ve en uzun anlamlı eylemsiz süreyi yazar.
- **Hedefler (ilk hipotez):** 5–8 dakikalık oturumda en az bir tamamlanabilir hedef; Orta Sınıf'tan sonra 90 saniyeyi aşan eylemsiz aralıklar azalır; kayda değer an en çok ~15 dk oyunda bir (bugün 6–12. saatte 36 dk).
- **Yeni oyuncu profilleri** (discussion-notes §5'te de vardı): günde 1 / 2 / 3 oturum, 24 ve 72 saatlik ara. Çevrimdışı tavanı değiştirmeden önce bunlarla bakılır.
- **İşletme sınırı denemesi:** sınırsız bir kopyada boş oturumlar ne kadar düşüyor (yalnız ölçü).
- **Analitik:** `meaningful_action` ve oturumdaki en uzun eylemsiz süre; hikâye ve kart ekranda olduğu süre eylemsiz sayılmaz.

### 4.1 İş teklifleri: olay kartlarının büyümüş hâli (oturum içi; asıl öneri)

GPT'nin "kısa iş" fikri, ama ayrı bir sistem yerine olay kartlarının üstüne. Bugün kart anında biter (iki cevap, ödül hemen). Yeni hâli:

- Arayan kişi (yönetici, Rıza, Nevin, Kuzen, Bülent Bey) bir **iş** teklif eder; iki seçenek, her biri süre ve sonuç gösterir. Örnek (GPT): Selin, "Üniversiteden toplu sipariş geldi" → A: hızlı servis, 60 sn, garantili para; B: tanıtım masası, 90 sn, daha az para ama kahve işinde bir defalık avantaj.
- **Tek teklif alanı, aynı anda tek iş.** Yeni teklif hazır olunca alanda belirir, pencere açıp oyuncuyu bölmez (bugünkü çağrı da sahnede bekliyor). İş çevrimdışında da biter, ödül bekler; kaçırma cezası yok.
- **Angarya olmasın (GPT):** amaç düğmeye daha sık bastırmak değil. Bazı işler para, bazıları seçili hayat projesinde ilerleme verir (4.3); tekrarlanan işte ilerleme görünür: ilk müşteri → düzenli müşteri → büyük anlaşma.
- **Her arama süreli iş değil:** aynı alan ara sıra bugünkü gibi anında biten karakter olayı da getirir; her telefonu işe çevirmek hikâyeyi mekanikleştirir.
- **Ödül bütçesi (GPT'nin hipotezi):** 90 saniyelik işin net ödülü kabul anındaki otomatik gelirin 15–25 saniyesi (~%22 ek gelir), koşullar kabulde sabitlenir. Bugünkü olay kartı + toplamanın değerine yakın; simülatörde denenir.
- **Seçim gerçek olsun:** iki seçenek hep aynı cevabı vermesin; biri para, diğeri yakın hedefe yardım (yönetici indirimi, bir sonraki işte avantaj, sahnede görünür bir değişim).
- **Yatırımdan ayrımı:** yatırım saatlik, pasif, birikimi kullanır; iş dakikalık, aktif, para istemez.
- **Ölçek:** üç şablon (çiçek, kahve, fırın) ile başlanır; Milyarder'de aynı arayüz "şirket anlaşması" anlatır. Her sınıfa ayrı mini oyun yok.
- Kayıt: bekleyen iş kayda yazılır (yeni alan, varsayılan boş); bugünkü `story.eventAnsweredAt` kuralı (kapat-aç yeniden denetmez) korunur.

### 4.2 Üç katmanlı hedef: şimdi / bu oturum / hayatım (GPT)

Yeni menü yok: hedef rozeti ve hayaller panosu kullanılır.

1. **Şimdi:** "Selin'in siparişini topla" (iş ya da hedef)
2. **Bu oturum:** "Kahve Arabası'nı otomatik çalıştır" (birkaç dakikada biten)
3. **Hayatım:** "Rıza Amca'nın atölyesi: 2/3" ya da hayaller panosundaki sıradaki ev

Kural: bütün ekonomik hedefler uzaksa bir iş ya da proje aşaması sunulur; birbirine bağlı üç kilitli hedef aynı anda gösterilmez.

### 4.3 İki aşamalı proje: Rıza'nın atölyesi ve annenin konağı (hikâye + ekonomi)

En boş iki dönem, hikâyede zaten bir sonucu bekleyen iki dönem:

| Dönem (bağlı bot) | Bugün | Proje |
| --- | --- | --- |
| Milyarder → Multimilyarder (2–8. gün) | Milyarder'de annenin mesajı: "Rıza Amca kapımı çaldı, atölyeyi anlattı"; Multimilyarder töreninde anahtarlar | **Rıza'nın atölyesi:** mekân → tezgâhlar → ilk çırak. Her aşama bir satın alım (fiyat o dönemin eğrisinde, gelire bağlı değil) ve bir kısa an (Rıza konuşur, sahneye bir parça gelir); son aşama Multimilyarder töreniyle açılır |
| Multimilyarder → En Zengin (8–15. gün) | En Zengin töreninde konak | **Annenin konağı:** arsa → bahçe ve erik ağacı → anahtar; son aşama En Zengin töreni |

- Her aşamada bir seçim (GPT): örneğin atölyede "ilk çırak mahalleden mi, Rıza'nın eski ustası mı?"; sonuç yalnız metin ve görünüm, dallanma yok.
- **Tören garanti, katkı ayrı (GPT):** "yapmazsan törende bedava" kuralı oyuncuya beklemeyi öğretir. Bunun yerine Multimilyarder töreninde atölye her durumda açılır (bugünkü hikâye); oyuncunun önceden yaptığı aşamalar atölyenin ekipmanını, ilk siparişini, çırağını hazırlar. Katkının karşılığı: bonus aşama bitince başlar (daha erken fayda), sahnedeki görünüm ve özel an. Tören, satın alınmış bir şeyi yeniden hediye etmiş gibi davranmaz; eksik aşamalar törenden sonra da yapılabilir. Konakta anahtar teslimi garanti, oyuncu evin nasıl bir yaşam alanına dönüşeceğini belirler.
- **İşler projeyi besler (GPT):** altı aşama saatlerce süren dönemi tek başına dolduramaz. Etkin proje (sırayla, önce atölye sonra konak; seçim menüsü gerekmez) ilgili işleri getirir: Rıza'nın siparişi, ekipman hazırlığı; işler aşamayı ilerletir, aşama bitince sahne değişir. Oyuncu işi neden yaptığını bilir.
- Bonus küçük (aşama başına birkaç yüzde), simülatörle.
- Maliyet: 6 aşama × kısa metin (TR/EN), 6 sahne parçası ya da kare (GPT). Babanın dükkânını geri almak fikri sonraya (hikâyede yok, kapsam).
- Hikâye ilkesi (GPT): diyalog eylemin duygusal karşılığıdır, kullanım kılavuzu değil; hikâyeyi atlayan oyuncu da dönüşümü sahneden okur.

### 4.4 Zenginliği hissettirmek (küçük, ucuz)

- **Önemli alımda iki satır** (GPT): "Aylık gelir: $120K → $145K" ve "Annenin bahçesi: ~8 dk → 6 dk 40 sn" (tahmin yalnız otomatik gelirle, "yaklaşık").
- **Tören kartında karşılaştırma:** "Artık 1 saniyede, el ilanı işinin 3 yıllık maaşını kazanıyorsun." Referans sabit ($0,11/sn), kayıt gerekmez.
- **Basamak anı:** üst bardaki para Milyon → Milyar → Trilyon'a geçince kısa parıltı, ses, titreşim.
- **Eski zorluğu ara sıra göstermek** (GPT): ilk bisikletin fiyatı, ilk tezgâh, yardım edenin yeni ofise gelişi.
- Kural (GPT): kalıcı malların fiyatı içerik/sınıf eğrisinde kalır, gelire bağlanmaz; yalnız tekrarlanan ödüller (iş, kart, günlük) gelire bağlıdır. Alım gücü hissi buradan gelir.

### 4.5 Burak'ın kazığında "geriye ne kaldı" (GPT; AAB 30'dan önce)

80 yaşta servet Burak'a gider. "Her şeyi aldılar" diyaloğu, oyuncuda "başardığım hiçbir şey kalmadı" hissine dönüşmemeli. **Düzeltme (GPT haklı):** bu belgenin önceki hâli atölye ve konağın kaldığını yazıyordu; kazık metninde (story-v2 §6a) Defne "Şirketleri, evi... Hepsini" der, dede "Saati almamış. Tezgâhları da." Kaybedileni korunmuş gibi gösteremeyiz.

- **Önce ayrım netleşir:** giden (şirketler, evler, araçlar, para: zaten her devirde sıfırlanıyor), kalan (saat, 2 tezgâh ve yöneticisi, albüm, aile, yadigârlar, miras puanı), etkisi süren (yadigârların gelir bonusu, takvim sayacı). Atölye bir şirket mi? Burak atölyeyi de aldıysa, 2. neslin intikamında geri alınacaklar listesine girer (öneri; kullanıcının kararı).
- **Sonra ekran bunu dürüstçe gösterir:** "Burak aldı" ve "Sende kaldı" yan yana; kalanların mekanik karşılığı yazılı (örneğin saat +%30). Kayıp gerçek, ama oyuncunun ömrü boşa gitmemiş: kalanlar varisi hızlandırıyor.
- Burak hattı AAB 30'la ilk kez oyunculara gidecek. Metin ve emeklilik panelinin düzeni birlikte ele alınmalı; küçük bir metin düzeltmesinden büyük olabilir.

### 4.6 Günlük üç görev ve haftalık sandık (günler)

**Ertelendi (GPT, ikinci tur):** günlük görev keyifli bir davranışı destekler; sıkıcı bir davranışı günde üç kez yaptırmak sorunu büyütür. İşler ve projeler oyuncu gözleminde keyifli bulunursa açılır: "3 işi tamamla", "Şans'ın bulduğunu topla", "bir proje aşaması"; ödül aylık gelirin katı, 7 günde bir sandık, hedef rozetinin içinde.

### 4.7 Ertelenen: yönetici terfisi

Her zaman yakın bir alım için düşünülmüştü. GPT'nin itirazı doğru: kalıcı bir alımın fiyatı o anki gelirle büyürse alım gücü hissi kaybolur, koşu bandına döner. İşler ve projelerden sonra simülatör hâlâ boş oturum gösterirse yeniden açılır: fiyat işletmenin kendi ölçeğine bağlı (yükseltmeler gibi), sınırlı seviye, belirli seviyelerde yöneticinin bir cümlesi.

### 4.8 Sonra

- **Süreli etkinlikler** (Remote Config ile, Faz 3): hafta sonu "Mahalle Festivali" (Şans ×2, özel işler, sınırlı hedef dizisi, kozmetik ödül).
- **2. nesle tek yeni tercih** (GPT): Lumen bugün aynı sayılara yeni resim. Bir ekonomik tercih (hızlı nakit veren işletme ağı ↔ geç karşılık veren teknoloji anlaşmaları) yeni şehri yeni bir oyun gibi hissettirir. 1. nesil düzeldikten sonra.
- **Olay kartında seçim oranı:** cesur/sağlamcı dengesi "kayıp iki kat acıtır" varsayımına dayanıyor; gerçek oranlar analitikle ölçülür.

## 5. Önerilen sıra (iki raporun ortak sırası)

| Sıra | İş | Görsel | Neden |
| --- | --- | --- | --- |
| 1 | Tekrar üretilebilir boşluk ölçüsü simülatörün içinde, yeni oyuncu profilleri, sınır denemesi (4.0) | yok | Sonraki her iş buna göre ölçülür |
| 2 | Burak anlatısı ile devir ekranının tutarlılığı (4.5) | yok | AAB 30'la oyuncuya gidiyor |
| 3 | İş teklifleri ve üç katmanlı hedef, birlikte küçük bir prototip (4.1, 4.2); alım geri bildirimi (4.4) | küçük arayüz | Orta Sınıf'tan sonraki boşluğun doğrudan çözümü |
| 4 | Orta Sınıf ve Milyarder kayıtlarıyla oyuncu gözlemi (bölüm 6) | yok | Prototip angarya mı, karar mı? |
| 5 | Sonuca göre atölye ve konak projeleri, işlerle bağlı (4.3) | 6 parça | En boş iki dönem, var olan hikâyeyle |
| 6 | Günlük görevler, yalnız oynanış keyifliyse (4.6) | küçük arayüz | D7 |
| 7 | Gerekirse yönetici terfisi (4.7); etkinlikler, 2. nesil tercihi (4.8) | değişir | Ölçüme ve Remote Config'e bağlı |

Ortak amaç (GPT'nin cümlesi): oyuncu yalnız "param arttı" değil, "bugün kurmak istediğim hayatı biraz daha kurdum" diyebilmeli.

## 6. Doğrulama (GPT'nin planı, uyarlanmış)

- **Gözlem, 6–8 kişi** (tanıdıklar; kapalı test verisi çoğunlukla kullanıcının hesapları): hedef söylenmeden "Şu an ne için para biriktiriyorsun?", "Son aldığın şey neyi değiştirdi?", "Şimdi kapatsan ne için dönerdin?", "Kendini en son ne zaman daha zengin hissettin?". Yönlendirici soru yok; beğendiğini söylemekle geri dönmek ayrı veri.
- **7 günlük günlük, 10–15 kişi:** günde bir not (ne başardı, nerede sıkıldı, neden döndü).
- **Analitik:** `meaningful_action`, iş başlat/bitir/topla, hedef ve proje aşaması, mevcut `story_view`, `class_up`, `session_start` ile.

## 7. Araç

Ek bir MCP ya da depo gerekmiyor (iki rapor aynı sonuçta): kendi simülatörümüz oyunun formülleriyle oynuyor; dışarıdan bir model ikinci bir doğruluk kaynağı olur. Gereken, ölçünün gerçek oyuncuda da alınması (Firebase).

## Kaynaklar

- [Idle Game Design Lessons From developing AdVenture Capitalist](https://www.globalgamesforum.com/ctv/idle-game-design-lessons-from-developing-adventure-capitalist)
- [AdVenture Capitalist Postmortem (GDC)](https://www.gdcvault.com/play/1023119/-Adventure-Capitalist-Postmortem-or)
- [GDC 2019: Deconstructing Idle Miner Tycoon](https://mobilefreetoplay.com/gdc-2019-deconstructing-idle-miner-tycoon/)
- [Idle Guy: Life Simulator (App Store)](https://apps.apple.com/us/app/idle-guy-life-simulator-games/id1612163874)
- [Egg, Inc. kontratları (wiki)](https://egg-inc.fandom.com/wiki/Contracts?oldid=7586)
- [İdle oyunlar üzerine akademik çalışma (NSF PAR)](https://par.nsf.gov/servlets/purl/10174274)
- [Retention by game genre (Playio)](https://blog.playio.co/retention-by-game-genre)
- [Pecorella, The Math of Idle Games, Part I](https://www.sirpinski.com/the-math-of-idle-games-part-i/) ve [Quest for Progress, GDC Europe 2016](https://media.gdcvault.com/gdceurope2016/presentations/Pecorella_Anthony_Quest%20for%20Progress.pdf) (GPT'nin kaynakları)
- [Przybylski, Rigby, Ryan 2010, A Motivational Model of Video Game Engagement](https://doi.org/10.1037/a0019440) (GPT'nin kaynağı)
