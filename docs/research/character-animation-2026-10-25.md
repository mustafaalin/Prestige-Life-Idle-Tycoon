# Kahramanı canlandırmak: Idle Guy gibi sürekli hareket eden karakter

Tarih: 2026-10-25 · Durum: **araştırma; karar kullanıcıda** ([discussion-notes.md](../discussion-notes.md) §1). Kullanıcının sorusu: "Referans oyunda karakter 2 boyutlu ama ağzı, yüzü, kafası, kolları, gözleri hareket ediyor. Biz iki resim arasında gidip geliyoruz. Idle pozunda sabit durmasın, sürekli değişik hareketler yapsın istesek ne yapmalıyız?"

## 1. Idle Guy bunu nasıl yapıyor

Karakter düz renkli, kalın çizgili bir çizgi film çizimi ve **parçalara ayrılmış** (kafa, gözler, kaşlar, ağız, gövde, iki kol ayrı katman). Bir **iskelet** (kemikler) bu parçaları taşır; animasyon kemiklerin zamana göre dönmesidir: göz kırpma, ağız açma, kafa sallama, kol hareketi. Birkaç kısa "idle" hareketi rastgele sırayla oynar, bu yüzden hep farklı bir şey yapıyor gibi görünür. Heatherglade Unity kullanıyor (iş ilanlarından); hangi iskelet aracını kullandığı açık değil, türde en yaygın olanı Spine.

Bu tekniğe **iskelet animasyonu** (skeletal / cutout animation) denir. Karede kare çizim değildir; bir kez parçalara ayrılan resim sonsuz hareket üretir, dosyası küçüktür, oyun sırasında hangi hareketin oynayacağını kod seçer (sevinç, şaşkınlık, okşama…).

## 2. Bizim durumumuz

- Kahraman **yarı 3D, yumuşak gölgeli** GPT resimleri (story-v2 §8): tek parça, katmansız.
- 9 görünüm (sokak, iş, mont, şık, takım, üç parça, smokin, dede, temel) × poz (idle, joy, happy, worried, determined, soft, okşama ×2) = **63 resim**. Her biri ayrı çizildiği için kıyafetler birbirinin üstüne birebir oturmuyor.
- Sonuç: bugünkü resimlerle iskelet kurmak **görünüm başına ayrı bir iskelet** demek; tek iskelet + kıyafet değiştirme (Spine "skin") için kahramanın baştan **katmanlı** çizilmesi gerekir.

## 3. Yollar

| Yol | Nasıl | Artı | Eksi |
| --- | --- | --- | --- |
| **A. Spine** (Esoteric Software) | Resim katmanlara ayrılır (Photoshop / Krita / yapay zekâ), Spine'da kemik + **mesh** (yumuşak bükülme) kurulur, animasyonlar yapılır; oyunda `spine-player` / `spine-webgl` (web) çalıştırır. | Mobil oyunların standardı; çok sayıda serbest animatör; skin ile kıyafet değiştirme; olaylarla koddan kontrol; düşük telefonda tek karakter rahat. | Lisans: Essential $69–99 (mesh yok, boyalı resim için yetmez), **Professional $369–439** tek seferlik; yıllık gelir $500K'yı geçerse Enterprise ($2.499/yıl). Öğrenmesi zaman ister. |
| **B. Rive** | Aynı mantık (kemik, mesh) tarayıcıda çalışan bir editörde; **durum makinesi** ile "idle → sevinç → idle" geçişleri dosyanın içinde. React çalıştırıcısı (`@rive-app/react-canvas`) hazır. | Çalıştırıcı MIT ve bedava; dosyalar KB düzeyinde; React'e doğrudan oturur; ücretli plan aylık $9 (Cadet; bedava planda dışa aktarılan dosyada Rive açılış ekranı var). | Oyun animatörü havuzu Spine'dan küçük; boyalı / yarı 3D resimlerde Spine kadar yaygın denenmemiş. |
| **C. Live2D Cubism** | Japon aracı; tek bir boyalı resmi katmanlara ayırıp "2,5D" yüz hareketi (kafa çevirme, göz, ağız, nefes) verir; VTuber'ların aracı. | **Boyalı yüzlerde en inandırıcı** sonuç (bize en yakın stil). | Web SDK'sı Spine'a göre zor (topluluk yorumları); lisans geliri olan stüdyolarda ücretli (koşulları başvuruda doğrulanmalı); daha çok portre için, tam boy kahraman için ağır. |
| **D. Yapay zekâ videosu → döngü** | Resmi image-to-video modeline (Kling, Seedance, Veo; fal.ai üzerinden) verip 3–5 sn'lik döngü üretmek, animasyonlu WebP'ye çevirmek (v1'de Ludo.ai sprite'larıyla yapılan buna benziyordu). | Mevcut resimden doğrudan; kemik kurmak yok; yarı 3D stile en iyi uyan hareket. | Her döngü 1–3 MB; 9 görünüm × birkaç hareket derlemeyi şişirir; yüz ve kıyafet kareden kareye kayar; döngü dikişi belli olur; koddan kontrol yok (yalnız oynat / değiştir). Özel anlar için iyi, sürekli idle için zayıf (2026-10-07 kararıyla uyumlu: yapay zekâ videosu yalnız özel anlar). |
| **E. Kod ile zıplatma / sıkıştırma** | CSS ile resmi oynatmak. | Bedava. | Kullanıcı yapay buldu (2026-10-07); önerilmez. |

### Resmi parçalara ayırmak (A, B, C'nin ortak ilk adımı)

En pahalı adım bu: kafayı, kolları, gözleri, ağzı ayırmak ve arkada kalan yerleri (kolun arkasındaki gövde) doldurmak. Yeni araçlar:

- **OCS (OneClickSpine)**, açık kaynak (Apache-2.0): şeffaf PNG → katmanlar ("see-through" modeliyle) → kemikleri elle yerleştir → Spine 4.2 iskeleti + `idle` animasyonu. Apple Silicon'da çalışıyor (MPS, 768 px sınırı), ilk çalıştırma ~12 GB model indirir. Çok yeni (2 yıldız, sürüm yok): deneme için.
- **Donatello** (Steam, ücretli): tek resimden 3D model → 2D parçalar → Spine JSON, insan iskeletini kendisi kurar.
- **Layer.ai, Scenario "2D Animation Rigging Sheet"**: karakteri kafa / gövde / kol parçalarına ayıran üretim şablonları.
- **GPT ile parça sayfası**: aynı kahramanı "ayrı parçalar hâlinde" çizdirmek mümkün, ama parçaların ana resimle birebir tutması güvenilir değil.

Hepsinde sonuç elle temizlenir; yarı 3D gölgeler parçaların birleştiği yerde (omuz, boyun) düzeltme ister.

## 4. Öneri

1. **Pilot, tek karakterle:** sokak görünümünün idle pozu + **Şans** (kuyruk sallama, kulak, nefes; köpek basit ve etkisi büyük). Hedef: göz kırpma, nefes, kafa hafif yana, ara sıra el / kol hareketi, rastgele sırayla 3–4 kısa idle; sevinç ve okşama da iskeletten.
2. **Araç: Spine Professional** (animatör bulmak kolay, boyalı resimde mesh güçlü, web çalıştırıcısı olgun) ya da maliyeti düşük tutmak için **Rive** (aylık $9, React'e doğrudan). İkisi de Capacitor'daki web görünümünde çalışır; pilotta düşük telefonda (ör. 3–4 GB RAM'li Android) akıcılık ölçülür.
3. **Kim yapar:** (a) serbest bir Spine / Rive animatörü (Upwork, Fiverr; fiyat karakter ve hareket sayısına göre değişir, pilot öncesi teklif alınmalı), ya da (b) Claude parçalara ayırmayı OCS ile dener, iskeleti ve animasyonu Claude JSON olarak kurmayı dener; ama hareketin "canlı" görünmesi animatör gözü ister, kalite çıtası (görsel-kalite kararı) bunu gerektirebilir.
4. Pilot beğenilirse **kahramanı katmanlı yeniden çizmek**: tek gövde + kıyafet katmanları (skin). Böylece 9 görünüm tek iskelette, yeni kıyafet = yeni katman. Bu büyük bir iş (63 resmin yerini alır); lansmandan sonra.
5. Yapay zekâ videosu (D) yalnız tören ve hayat anları gibi özel anlarda kalır.

Kod tarafı: `ui/scene/` içinde kahramanı çizen yer bir `<HeroRig>` bileşeni olur (Spine ya da Rive), olmayan görünümde bugünkü resimlere düşer; derleme boyutu ve açılış süresi izlenir.

## 5. Karar ve Rive ile çalışma yolu (2026-10-25)

Kullanıcı: Spine pahalı, **Rive**; kullanıcı üyeliği açıp Claude'a verecek, işi Claude yapacak.

- **Rive MCP (resmî):** masaüstü Rive editörü (macOS) açıkken `http://127.0.0.1:9791/mcp` adresinde çalışır; Claude Code'a `claude mcp add --transport http rive http://127.0.0.1:9791/mcp` ile eklenir. Araçları: artboard, nesne düzenleme, şekiller, "asset tabanlı öğeler", animasyon, durum makinesi, geçiş, koşul, anahtar kare, veri bağlama, Luau betikleri. Kemik ve mesh araçları listede **yazmıyor**.
- **Rive CLI (resmî):** `rive create` projeyi ve ajan talimatlarını (`AGENTS.md`, `CLAUDE.md`) yazar; sahne RML (Rive Markup Language) ile metin olarak yazılır, `--verify`, `inspect`, `--screenshot` ile denetlenir. Yerelde hesapsız çalışır; filigransız `.riv` için dosya hesaba bağlanır (`rive push`) ve çalışma alanı **Cadet ($9/ay)** ya da üstü olmalı.
- **Bilinmeyen:** RML ve MCP ile resme kemik + ağırlıklı mesh bağlanabiliyor mu (editörde var). İlk iş bunu bedava CLI / bedava hesapla denemek (`rive schema --search bone`, `--search mesh`, `--search image`); olmazsa kemik ve mesh editörde elle (kullanıcı ya da animatör), animasyon ve durum makinesi Claude'da.
- **Parçalara ayırma** ayrı adım: OCS (Mac, ~12 GB model) ya da GPT'den parça sayfası, sonra elle temizlik.
- **Sıra:** CLI kurulumu ve destek denemesi (bedava) → masaüstü editör + MCP → sokak kahramanı ve Şans'ın parçaları → pilot `.riv` (bekleme hareketleri, sevinç) → oyuna `<HeroRig>` (`@rive-app/react-canvas`), düşük telefonda akıcılık → beğenilirse Cadet ve diğer görünümler.

## 6. İlk deneme (2026-10-25, kullanıcı: "kur ve dene")

Rive CLI 1.8.0 kuruldu (`~/.rive/bin/rive`, hesapsız; PATH'e eklenmedi). **Kemik, resim mesh'i ve skinning komut satırından kurulabiliyor** (`rive schema`: `Bone`, `RootBone`, `Mesh`, `MeshVertex`, `Skin`, `Tendon`, `Weight`; belge `~/.rive/versions/1.8.0/docs/rigging.md`).

Deneme: sokak kahramanının bugünkü **tek parça** idle resmi (`hero-street-idle.webp`), 297 noktalı ızgara mesh, iki kemik (gövde: kalçadan boyna, kafa), ağırlıklar yüksekliğe göre yumuşak geçişli (bacaklar sabit). 4 sn'lik döngü: nefes (gövde %1,6 uzar), gövdenin hafif sallanması, kafanın iki yana eğilmesi. Üretici Python betiği yazıyor (`gen.py`, scratchpad'de; oyuna girerse `scripts/`e taşınır), `--verify` temiz, `.riv` 335 KB (PNG gömülü; webp ya da referanslı asset ile küçülür). Video: `~/Downloads/rive-kahraman-deneme.mp4`.

Sonuç: **tek parça resimle bile** nefes ve kafa hareketi doğal duruyor; 63 resmin her birine aynı betikle uygulanabilir (görünüm başına boyun / kalça yüksekliği ayarı). Tek parça resmin sınırı: **göz kırpma, ağız, kollar** ayrı hareket edemez; bunlar için o bölgelerin ayrı katmanı gerekir (gözler kapalı yaması ve kol parçası GPT'den ya da OCS ile). Sıradaki adım: (1) göz kırpma için kapalı göz yaması, (2) birkaç farklı idle hareketi (omuz silkme, etrafa bakma) ve rastgele seçen durum makinesi, (3) oyuna `@rive-app/react-canvas` ile bağlayıp telefonda akıcılık. Hesap ve Cadet ($9/ay) yalnız filigransız yayın dosyası için (scripted olmayan dosyada gerekip gerekmediği denenecek).

## 7. Parçalı kahraman: bütün pozları biz verebilir miyiz? (2026-10-25, kullanıcı sorusu)

Kullanıcı: deneme fena değil; ağız, göz, kaş, kollar ve başın hafif dönmesi de olsun. GPT her uzvu ayrı mı üretecek, ayırırsak her kıyafetin bütün pozlarını kendimiz verebilir miyiz?

**Cevap: büyük ölçüde evet.** Parçalı (cutout) kahramanda:
- **İfadeler** parça değiştirerek: göz (açık, yarı, kapalı, yana bakan), kaş (düz, endişeli, kararlı, şaşkın), ağız (düz, gülümseme, açık gülme, üzgün, "o", konuşma ağızları). Mutlu, endişeli, kararlı, yumuşak, sevinç: hepsi bu kütüphanenin birleşimi. Yüz kütüphanesi **bir kez** yapılır, bütün kıyafetlerde ortak (dede kendi yüzüyle).
- **Kollar ve eller** kemikle döner (üst kol, ön kol, el); ellerin birkaç hâli (açık, yumruk, işaret, el sallama, cebinde) parça değiştirme.
- **Baş dönmesi** ±15°'ye kadar mesh bükmesiyle (Live2D'nin "2,5D" hilesi); daha büyük dönüş (profil) ayrı çizim ister.
- **Kıyafetler:** gövde ve kafa oranı ve duruş bütün kıyafetlerde aynı tutulursa her kıyafet yalnız gövde / kol / bacak parçalarını yeniden ister, iskelet ve animasyonlar aynen kullanılır (Rive'da parça değiştirme). Yeni kıyafet = yeni parçalar, yeni poz çizimi yok.
- **Sınır:** siluetin çok değiştiği pozlar ek parça ister: Şans'ı okşarken eğilmek (bel kemiği + eğilmiş gövde parçası), elde eşya tutmak, oturmak. Yarı 3D gölgeler büyük açılarda (kol 45°'den fazla) yanlış düşebilir; o açılar için ikinci bir kol çizimi.

**Parçalar nasıl üretilir:**
1. **Ayrılmaya uygun temel poz** (GPT): kahraman önden / hafif yandan, kollar gövdeden biraz açık, eller görünür (bugünkü "eller cepte" duruşu ayrılamaz), ağız kapalı, gözler açık, düz ışık. Her kıyafet bu pozla.
2. **Ayırma**, iki yol, pilotta ikisi denenir:
   - **see-through** (açık kaynak, Apache-2.0): tek resmi 23'e kadar katmana ayırır ve **arkada kalan yerleri doldurur** (kolun arkasındaki gövde, saçın altındaki alın); çıktısı katmanlı PSD. Anime resimlerle eğitilmiş, yarı 3D stilde başarısı belirsiz; Hugging Face'te çevrimiçi demosu var, yerelde NVIDIA ya da Apple Silicon. OCS bunu Spine için sarıyor. **Bu Mac'te (MacBook Air, 16 GB) yerelde çalıştırma:** 2026-10-25 OCS ile (`~/tools/OCS`, MPS, 640 px) manken ayırma denemesi belleği bitirdi, Mac çekirdek hatasıyla yeniden başladı (watchdog timeout, takas dolu); yerelde tekrar denenmez, yalnız çevrimiçi demo.
   - **GPT düzenleme ile:** temel resmi verip "yalnız sol kolu, şeffaf zeminde, aynı boyut ve konumda" gibi tek tek parça istemek; arkada kalan yerler için "kolu kaldır, gövdenin o kısmını tamamla". Tutarlılık parça parça kontrol edilir.
3. **Yüz kütüphanesi** (GPT düzenleme): kafa kesiti üzerinde göz / kaş / ağız çeşitleri, aynı ışık ve boyutta.
4. **Kurulum** (Claude): parçaları hizalayan ve iskeleti, mesh'leri, ağırlıkları, ifade değiştirmeyi, bekleme hareketlerini (göz kırpma, etrafa bakma, kol hareketi) ve sevinç / okşama geçişlerini yazan betik (`gen.py`'nin büyümüş hâli); Rive dosyası durum makinesiyle (oyun "sevin", "endişelen" der, karakter geçer).

**Önerilen pilot:** sokak kıyafeti tek karakter: (1) GPT'den ayrılmaya uygun temel poz, (2) see-through demosu ve GPT ile ayırma karşılaştırması, (3) yüz kütüphanesi (4 göz, 4 kaş, 6 ağız), (4) Rive'da göz kırpma + konuşma + kol hareketi + baş dönmesi + bugünkü pozların (idle, mutlu, endişeli, kararlı, sevinç) iskeletten üretilmesi. Pilot iyi çıkarsa ikinci kıyafet aynı iskeletle denenir (parça değiştirme gerçekten çalışıyor mu); sonra 9 görünüm. Lansman AAB'sini beklemez; ayrı dalda.

## 8. Parçalı kahraman, ilk sürüm (2026-10-25)

GPT'den R1 temel poz (`art/pilot/18-rig/rig-base.png`, kılavuza uygun, onaylandı) → **see-through** çevrimiçi demosu 21 katman (`art/pilot/18-rig/seethrough/`) → boyun kapüşonun içinde karanlık kalıyordu: orijinalde ten görünen kısmı kesilip kapüşonun üstüne kondu (`neckfix.py`) → üretici `gen2.py` Rive sahnesini yazar (`art/pilot/18-rig/rive/herorig/`, `.riv` 695 KB, `--verify` temiz).

Kurulum: eklem noktasında duran gruplar (gövde kalçadan, kafa boyundan, kollar omuzdan; kollar gövdenin altında, omuz eklemi gizli). Aynı anda dört döngü, farklı uzunlukta (4,4 / 5,3 / 11 / 13 sn) olduğu için hareket nadiren tekrarlar: nefes + gövde sallanması + kol sallanması; göz kırpma (biri tek, biri çift; kapalı göz = kirpiğin üst kapak çizgisi ters çevrilmiş "‿", göz akı ve iris gizlenir, altta see-through'un yüz derisindeki kapaklar görünür); gözler sola ve sağa bakar; kafa eğilir ve hafif döner (yüz parçaları yüzden çok, ön saç biraz, kulaklar ters yönde kayar: 2,5D); kaşlar bir kez kalkar. Video: `~/Downloads/rive-kahraman-parcali-v1.mp4`.

Düzeltmeler (kullanıcı, aynı gün): gözler dururken göz akının ortasında, iki yöne eşit kayıyor (resimde hafif içe bakış vardı); baş dönerken yüz mesh'le bükülüyor (ortası çok, kenarı az), saç ve kulaklar başla aynı yöne.

**R2 / R3 (GPT, aynı gün):** R2 parçaları R1'den kesilmeyip yeniden çizildiği için hizasız (baş, bacak, kol boyları tutmuyor); kullanılmadı, yedek. R3'ün 14 yüzü kimliğe uygun; nötr yüz see-through katmanlarına otomatik eşlendi (ölçek 3,5, skor 0,96), her ifade önce nötre hizalandı, sonra yalnız ağız ve yarı kapalı göz bölgeleri yumuşak kenarla kesildi (`patches.py`). Rive'da ağızlar bir `Solo`'da (nötr, gülümseme, gülme, üzgün, konuşma a / e / o; see-through'un çizgi ağzının yerine), göz kırpma açık → yarı → kapalı → yarı → açık. Video: `~/Downloads/rive-kahraman-parcali-v4.mp4` (bekleme döngüsünde bir gülümseme ve kısa bir konuşma; oyunda konuşma balonlarına bağlanır).

Kalan: ifade geçişleri (mutlu, endişeli, kararlı, sevinç) ve durum makinesi girdileri, dirsek bükülmesi (kol mesh + iki kemik), see-through'u daha yüksek çözünürlükte denemek (yüz biraz yumuşak), oyuna bağlamak.

## 9. Manken + giydirilen kıyafetler (2026-10-25, kullanıcı: "üst ayrı, alt ayrı, ayakkabı bile ayrı")

Idle Guy'ın kıyafet ekranında 5 yuva var (şapka, üst, alt, ayakkabı, gözlük), her parça ayrı eşya ve ayrı fiyat; karakter bir kez çizilmiş, parçalar üstüne konuyor. Sektördeki karşılığı "paper doll": kıyafetsiz temel gövde, ona hizalı ayrı kıyafet katmanları, katman sırası; Spine'da "mix and match" (her parça bir skin, çalışırken birleştirilir, bükülen kıyafet gövdenin kemiklerine bağlanır), Rive'da parça değiştirme (`Solo`) ve kemiğe bağlı resimler.

Bizde: **oyunda** manken kahraman + yuvalara konan kıyafet resimleri (kollar ve paçalar kemikle birlikte döner, örtülen atlet / şort gizlenir). **Üretimde** GPT kıyafeti mankenin üstünde çizer, Claude yalnız kıyafeti keser (manken ile fark + see-through); karşılaştırma için GPT'ye kıyafeti tek başına da çizdirilir. Komutlar [art-prompts-v2.md §0f](../art-prompts-v2.md). Öneri: ilk sürümde mevcut 7 kıyafet "takım" olarak yuvalara girer (oyuncu için değişiklik yok, kayıt aynı); parça parça satın alma lansmandan sonra.

**Kaç parça (karar bekliyor):** pilot yalnız sokak kıyafeti (kapüşonlu, kot, spor ayakkabı). Oyundaki 7 kıyafet parçalara bölünürse ~20–25 parça: dış giyim (iş ceketi, blazer, deve tüyü palto, takım ceketi, üç parçalının ceketi ve yeleği, smokin ceketi), iç üst (tişört, triko, balıkçı yaka, beyaz gömlek, papyonlu gömlek), alt (kot, iş pantolonu, chino, kumaş pantolon; takım pantolonları ortak olabilir), ayakkabı (spor, bot, beyaz spor, kahverengi deri, rugan), aksesuar (sırt çantası, saat, kravat, papyon). Lansmandan sonra yeni parçalar eklenebilir.

Kaynaklar: [Spine mix-and-match](https://en.esotericsoftware.com/spine-unity-mix-and-match), [Spine skin ve linked mesh](https://4enjoy.com/articles/character-customization-in-spine-how-does-it-work-skins-and-linked-mesh-tools), [paper doll katmanları](https://playgama.com/blog/unity/how-can-i-integrate-paper-doll-style-character-customization-into-my-games-art-design/), [Daggerfall paper doll](https://www.dfworkshop.net/?p=2358).

## 10. Yandan giydirilmiş manken (2026-10-26)

Manken ve üç giysi resmi (her biri mankenin üstünde tek giysi) **ModelScope'taki see-through demosunda** ayrıldı (ücretsiz, 1280 px, kolları sol-sağ ayırma seçeneği; Hugging Face demosunun günlük kotası yok). see-through'un katmanları tek başına yetmedi: orijinalden yumuşak, her parçanın kenarında kontur var (boyunda çizgi, omuzda yay), kapüşonun içini boynun üstüne koyu doldurdu, şortun lastiğini atlete koydu. Çözüm: katmanların **görünen her pikseline orijinalin rengi** (see-through yalnız arkada kalan yerler ve sınırlar için), kapüşon içindeki tenin açılması, lastiğin şorta taşınması (`rive/project_layers.py`). Sonra Rive'da üç yuva (`top`, `bottom`, `shoes`) görünüm modeli boolean'larıyla, durağan poz orijinalin aynısı; video `rive-manken-kiyafet-v3.mp4`. Yalnız göz / burun / ağzı kaydıran 2,5D baş çevirme yüzü "öne çıkıp giriyor" gösterdi, kaldırıldı. Ayrıntı ve sıradakiler: [session-handoff.md](../session-handoff.md) madde 0b.

## 11. Rig ayrıntıları (2026-10-26)

Kahramanın ve Şans'ın rigleri nasıl kurulu; güncel durum ve sıradaki iş [session-handoff.md §2](../session-handoff.md)'de.

- **Araç:** Rive CLI 1.8.0, `~/.rive/bin/rive` (PATH'te değil), hesapsız; kemik, mesh, skinning, durum makinesi RML ile; `--verify`, `inspect`, `--screenshot --advance=`. Kullanıcı Cadet ($9/ay) aboneliğini filigransız yayın dosyası gerekince açacak.
- **Kararlar:** kahraman hafif yandan (≈20°, ekranın sağına dönük). Manken + giydirilen parçalar; eklem noktaları mankende bir kez. **6 yuva: şapka, gözlük, üst, alt, ayakkabı, saat**; tek üst (ceket ile gömlek tek parça); şapka, gözlük, saat her birinden 3–4. Rive'da her yuva bir sayı (0 = boş); parça resimleri dışarıdan yüklenir ("referenced assets"). Oyunda her parça ayrı eşya (fiyat, `minClass`, bonus), takıma küçük takım bonusu (öneri); kayıtta eski kıyafet id'leri kalır, sahip olunan parçalara açılır (göç). Şapka saçı ezer (mankenin ön saçı gizlenir); şeffaf gözlükte cam see-through'dan, güneş gözlüğü opak.
- **Kahraman rigi:** yandan giydirilmiş manken çalışıyor, kullanıcı onayladı. Video `~/Downloads/rive-manken-kiyafet-v3.mp4`; proje `art/pilot/18-rig/rive/dressrig/` (`.riv`, `--verify` temiz). Rig: görünüm modeli `Hero`, yuvalar `top` / `bottom` / `shoes` (şimdilik boolean); hareketler nefes + gövde + kol sallanması (4,4 sn), göz kırpma (5,3 sn: yarı → kapalı → yarı, arada çift kırpma), bakış (11 sn: 2,5 sn'de yana, 7 sn'de izleyiciye bakar; dinlenirken mankenin kendi gözleri), baş eğme (13 sn), dirsekler nefesle hafifçe bükülür. **Kollar:** her kol ve kolluk resmi ızgara mesh, omuz → dirsek → bilek kemik zincirine skinlenmiş (eklemler kolun genişlik profilinden, `JOINTS`; eklemde yumuşak geçiş). Dirsek geçişi geniş (±34 px), kol kıvrılarak bükülür. Görünüm modelinde `cheer` (boolean): `raise` (0,45 sn) el göğsün önünden kalkar, dirsek dışa açılır (önkol "ön taraftan" döner, açı −2π ile); `cheer` döngüsünde el yukarıda sallanır; kapanınca `lower` (kalkışın tersi). El kalkarken ayna çevrilir (el kemiğinde scaleY −1, göğsün önünde tek karede; yoksa başparmak ters tarafta kalır); bu yüzden el meshin ayrı parçası, önkoldan el kemiğine dik bir çizgiyle kesik (kollukta manşet kenarında) ve bilek bükülmez (kesikte kama açılırdı). Çıplak kol y=420'den ikiye bölünür: üstü atletin altında, önkol ve el gövdenin üstünde. Çıplak kolda kalkık elde bilekte hafif ton çizgisi var (ayna çevrilen elin ışığı ters); giyinikken görünmez. Artboard sola genişletildi (730 × 1260, tuvalde x 170'ten başlar) ki kalkan kol kesilmesin; oyuna bağlarken kahramanın konumu buna göre ayarlanacak. **Kaşlar:** `Solo` (dinlenirken mankenin kendi kaşları) + endişeli / kararlı / kalkık yamaları. **Ağız:** `Solo` (dinlenirken mankenin kendi ağzı); görünüm modelinde `talking` (boolean: 2,4 sn'lik düzensiz a / e / o / kapalı döngüsü) ve `mood` (sayı, ağız + kaş: 0 nötr, 1 gülümse, 2 kahkaha + kalkık kaş, 3 üzgün + endişeli kaş, 4 endişeli, 5 kararlı, 6 şaşkın (o ağzı + kalkık kaş); konuşma bitince buna döner; tablo `MOOD_FACES`). Oyunda: balon açıkken `talking = true`, replik etiketine göre `mood`. Göz ve ağız durumları yandan yüzlerden yama (`rig-dressed/eyes/<durum>-<l|r>.png`, `rig-dressed/mouth/<durum>.png`; yüz katmanının içinde kalır): yüz resmi SIFT ile tuvale oturtulur (değişmeyen yerler: saç, kulak, burun, çene; ölçek ~0,256), göz bölgesi yumuşak elipsle kesilir, kenar teni mankene eşitlenir. Not: izleyiciye bakan göz mankeninkinden biraz iri; videoda göze batarsa yama küçültülür. Kaldırılan: yalnız göz / burun / ağzı kaydıran 2,5D baş çevirme.
- **Kaynaklar (`art/pilot/18-rig/`):** `manken.png`, `wear-hoodie.png` / `wear-jeans.png` / `wear-sneakers.png` (mankenin üstünde tek giysi), `rig-base.png`, `face-*.png` (yandan 14 yüz, henüz kullanılmadı). Eski önden pilot (`front/`, `rive/herorig/`, `gen2.py`) yalnız yöntem kaynağı.
- **Katman ayırma: see-through, ModelScope demosunda** (https://modelscope.cn/studios/ljsabc/See-Through; ücretsiz, 1280 px ~3 dk). Ayarlar: çözünürlük 1280, "左右拆分手臂、眼睛与耳朵" açık. Kullanıcı resmi sürükler, Claude Chrome'dan çalıştırıp PSD'yi indirir. Çıktılar `art/pilot/18-rig/seethrough-*/`. **Yerelde çalıştırma yasak** (Mac'i çökertti). Yedek: Kaggle (`art/pilot/18-rig/kaggle/`), son çare HF demosu.
- **Boru hattı (scriptler repoda, `scripts/rig/`; yollar repo köküne göre):** `scripts/rig/project_layers.py` → `rig-dressed/<kaynak>/` (görünen her piksele GPT orijinalinin rengi; see-through yalnız arkada kalan yerler; kapüşon içi, şort lastiği, göz kapakları düzeltmeleri; orijinal → tuval: yükseklik 1280, x +213) → `scripts/rig/face_patches.py <önizleme.png>` → `rig-dressed/{eyes,mouth,brows}/` → `scripts/rig/gen3.py art/pilot/18-rig/rive/dressrig` → `scene.rml` → `~/.rive/bin/rive art/pilot/18-rig/rive/dressrig --verify`. Video kare kare `--advance` + ffmpeg 30 fps; görünüm modeli girdisi sıranın ortasında `--advance=Xms --data=mood=1` ile değişir (zsh'de argüman dizisi `${=args}`). Python geçici venv (psd-tools, numpy, pillow, scipy, opencv-python-headless).
- **Şans rigi:** proje `art/pilot/19-sans-rig/rive/sansrig/`; `scripts/rig/sans_cut.py` (D1'i gri arka plandan keser) → `scripts/rig/sans_rig.py art/pilot/19-sans-rig/rive/sansrig`. Tek parça resim ızgara mesh'te; kemikler kalça (sabit), göğüs, baş, iki kulak, üç parçalı kuyruk. Hareketler: nefes, baş eğme + kulak gecikmesi, kulak seğirmesi, kuyruk salınımı + sallama, göz kırpma, soluma. Görünüm modeli `Dog`: `happy`, `collar` (0 yok, 1 ip, 2 deri, 3 gümüş, 4 altın, 5 yakut), `scarf`. Okşama, cüzdan, uyuma pozları resim kalır.
- **Kıyafet yuvaları ve el (gen3.py):** `top` / `bottom` / `shoes` sayı (0 çıplak, 1 sokak, 2–7 `lifestyle.ts` sırası); kalkık elde avuç içi resmi (`hand-palm.png`) önkol kemiğinde, DrawRules ile çıplak önkolun üstünde çizilir, sarkık el kemiği 0'a ölçeklenir. `wear_cut.py` (see-through'suz kesim) yedek olarak duruyor; sert kenar ve arkada kalan gövde eksikliği yüzünden reddedildi.

## Kaynaklar

- [Spine satın alma ve lisans](https://esotericsoftware.com/spine-purchase); [Spine lisans açıklaması (forum)](https://esotericsoftware.com/forum/d/29824-spine-43--2d-animation-buy-form)
- [Rive fiyatları](https://rive.app/pricing); [Rive MCP](https://rive.app/docs/editor/ai/mcp.md); [Rive CLI ajanlar](https://rive.app/docs/cli/agents.md); [Rive CLI kurulum](https://rive.app/docs/cli/getting-started.md); [RML](https://rive.app/docs/runtimes/advanced-topic/rml.md); [Rive React çalıştırıcısı](https://help.rive.app/runtimes/overview/react); [Rive web](https://rive.app/docs/runtimes/web/web-js)
- [Spine ve Live2D karşılaştırması (JP)](https://imitsu.jp/matome/movie/spine-live2d); [Esoteric forum: Live2D ile Spine](https://fr.esotericsoftware.com/forum/d/26595-vtubing-with-spine-models)
- [see-through (katman ayırma)](https://github.com/shitagaki-lab/see-through); [OCS (OneClickSpine)](https://github.com/sleeeppy/OCS); [Donatello (Steam)](https://store.steampowered.com/app/5030490); [Layer.ai Spine parçaları](https://layer.ai/tools/layer--create-spine-components); [Scenario rigging sheet](https://scenario.com/apps/2d-animation-rigging-sheet); [Esoteric forum: yapay zekâ ve Spine](https://it.esotericsoftware.com/forum/d/25605-ai-and-spine)
- Heatherglade'in Unity kullandığı: iş ilanları ([quick-offer](https://quick-offer.ru/job/middle-unity-developer-92472))
