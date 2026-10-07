# Prestige Life v2 — Hikaye ve Karakterler

Son güncelleme: 2026-10-07 · İlgili: [game-design-v2.md](./game-design-v2.md), [rebuild-plan.md](./rebuild-plan.md)

Bu belge hikayenin, karakterlerin ve tonun tek kaynağıdır. Dayanağı "Oyun Tasarım Analizi ve Yeniden Doğuş Raporu" §6 (fakirlikten zenginliğe hissi) ve §7'dir (hanedan, olay kartları).

**Kararlar (2026-10-07):**

- Kahraman: elimizdeki 20 kıyafetli genç adam; adını oyuncu verir.
- Yoldaş: sokak köpeği Şans (İng. Lucky).
- Ton: sıcak ve umutlu, olay kartlarında hafif mizah.
- Görseller en sonda, hikaye oturduktan sonra topluca üretilir (Higgsfield pilotu dahil).

---

## 1. Tek cümle

**Her şeyini kaybetmiş genç bir adam, sokakta bulduğu köpeği ve annesine verdiği sözle sıfırdan dünyanın en zengini olur; sonra servetini değil, hikayesini çocuğuna bırakır.**

## 2. Ton kuralları

- **Sıcak ve umutlu.** Oyuncu kahramanın iyiliğini ister. Zafer anları duygusaldır, utandırıcı değildir.
- **Evsizlikle dalga geçilmez.** Sokak zor ama onurlu anlatılır. Mizah kahramanın acizliğinden değil, durumların absürtlüğünden gelir ("Kuzenin üçüncü kez kripto fırsatı öneriyor").
- **Mizah olay kartlarında ve konuşma balonlarında,** törenlerde değil.
- **Kısa metin.** Konuşma balonu en fazla 2 satır; tören metni en fazla 3 kısa cümle. 10 saniyede okunur.
- **İki dilde birlikte yazılır** (Türkçe ve İngilizce). Karakter adları yerelleştirilir; birebir çeviri değil, aynı duyguyu veren karşılık aranır.

## 3. Karakterler

| Karakter | TR / EN | Rolü | Nerede görünür |
| --- | --- | --- | --- |
| Kahraman | Oyuncu verir (varsayılan **Can** / **Alex**) | Oyuncunun kendisi | Sahnenin merkezi, her şey |
| Köpek | **Şans** / **Lucky** | Sadık yoldaş, sevimlilik ve paylaşılabilirlik | Sahnede her zaman |
| Akıl hocası | **Rıza Amca** / **Old Ray** | Sokakta yol gösteren yaşlı adam; ilk yönetici | Rehber (onboarding), Çiçek Tezgâhı yöneticisi, olay kartları |
| Anne | **Annen** / **Mom** | Duygusal çapa; verilen söz | Telefon/mektup balonları, hayaller, Milyoner töreni |
| Eski patron | **Bülent Bey** / **Mr. Bryce** | Kahramanı bulaşıkçıyken kovan restoran zinciri sahibi | Bulaşıkçı işi, Milyarder töreni, olay kartları |
| Eş | Oyuncu verir (varsayılan **Elif** / **Emma**) | Aile kurmak; varisin gerekçesi | Multimilyoner töreni, olay kartları |
| Çocuk (varis) | Faz 2'de belirlenecek | 2. neslin kahramanı | Emeklilik töreni, 2. nesil |

### Kahraman

- 20'li yaşların başında, koyu saçlı genç adam (mevcut `ch-N` seti).
- Geçmiş: babasının küçük mahalle dükkânı battı; borçlar yüzünden aile evini kaybetti. Baba yok (vefat etmiş; oyunda hiç ayrıntıya girilmez). Annesi memleketteki küçük bir kiralık dairede.
- Söz: *"Anne, bir gün sana ev alacağım."* Oyunun duygusal omurgası.
- İsim: ilk satın almadan hemen sonra sorulur (oyun önce eğlendirir, sonra sorar). Varsayılan dolu gelir, tek dokunuşla geçilir. En fazla 16 karakter.
- Duruş sınıfla değişir: sokakta üşüyen, kambur → çalışan, dik → zengin, kendinden emin (idle animasyonları, §8).

### Şans (köpek)

- Karışık cins, kırpık kulaklı, tüyleri dağınık bir sokak köpeği. İlk sahnede kahramanın çadırına sokulur.
- Her zaman sahnede, kahramanın yanında. Zenginleştikçe aksesuarı değişir: ip → deri tasma → altın tasma → elmas tasma ve küçük bir yelek.
- Çevrimdışı dönüşte kapının önünde uyurken uyanır ve sevinir ("Tekrar hoş geldin" ekranı).
- Mekanik bağ yok (bonus vermez); saf duygu ve paylaşım değeri.

### Rıza Amca (Old Ray)

- 60'larında, gri sakallı, bereli, eski bir marangoz. O da atölyesini kaybetmiş ama umudunu kaybetmemiş.
- **Rehber:** ilk 3 dakikada konuşma balonlarıyla yol gösterir: "Boş şişeleri topla evlat, depozitosu var." → "Şu çiçek tezgâhını al." → "İşe gir, düzenli para lazım."
- **İlk yönetici:** Çiçek Tezgâhı'nın yöneticisi odur. "Tezgâhı ben beklerim, sen büyük düşün." Oyuncunun ilk "param benim için çalışıyor" anı bir dostlukla gelir.
- İşçi Sınıfı töreninde vedalaşma; sonra olay kartlarında arada bir uğrar.

### Annen (Mom)

- Hiç sahnede değil; telefon ve mektup balonlarıyla konuşur (portre + 3 ifade: endişeli, gülümseyen, ağlayan-mutlu).
- Sınıf atlamalarında kısa bir mesaj atar. Milyoner töreninde ona ev alınır.

### Bülent Bey (Mr. Bryce)

- Kahramanın Bulaşıkçı olarak çalıştığı restoran zincirinin sahibi. Kibirli, bağırgan, komik derecede kendini beğenmiş (mizahın güvenli hedefi).
- Bulaşıkçı terfisinde bir balon: "Bir tabak daha kırarsan kapının önündesin!"
- Milyarder töreninde kahraman onun şirketini satın alır. Kötü son yok: Bülent Bey'e kahraman iş teklif eder ("Bulaşıkhane senin, şaka şaka"). Ton intikam değil, büyüme.

### Eş

- Multimilyoner sınıfında hayatına girer (tören: tanışma + düğün fotoğrafı). Adını oyuncu verir.
- Emekliliğin bu sınıfta açılmasının hikaye gerekçesi: artık bir aile ve bir varis var.

## 4. Nesil 1 hikaye akışı

### Açılış (ilk 30 saniye)

Soğuk bir gece, yağmur sesi. Kahraman bir çadırın önünde üşüyor. Bir köpek sokulur (Şans). Rıza Amca yanından geçer: "Boş şişeleri topla evlat, depozitosu var." Oyuncunun ilk dokunuşu şişe toplamaktır; her dokunuşta uçan "+$1".

Mekanik karşılık: mevcut "Dokun, kazan" düğmesi sokak sınıflarında **"Şişe topla"** olur (sınıfla değişen etiket: şişe topla → bahşiş → ... ileride).

### 7 sınıf, 7 hikaye anı

| # | Sınıf | Hikaye anı (tören) | Sahnede değişen | Mekanik |
| --- | --- | --- | --- | --- |
| 0 | Sokakta Yaşayan | Şans ile tanışma, Rıza Amca'nın ilk dersi | Çadır, soğuk mavi ışık | Şişe toplama |
| 1 | Gündelikçi ($1K) | İlk sıcak yemek; annesini arar: "Merak etme anne, iyiyim." | Gece → sabah | — |
| 2 | İşçi Sınıfı ($100K) | Sokaktan çıkış: ilk kiralık daire. Rıza Amca'yla vedalaşma. | İlk kapalı ev | — |
| 3 | Milyoner ($1M) | **Söz tutulur: annene ev.** Annenin ağlayan-mutlu mesajı. İlk oturumun zirvesi. | Annenin evinin fotoğrafı sahnede çerçevede | — |
| 4 | Multimilyoner ($100M) | Eşle tanışma ve düğün | Düğün fotoğrafı | **Emeklilik açılır** |
| 5 | Milyarder ($1B) | Bülent Bey'in şirketini satın alma | Dergi haberi: "Bulaşıkçıdan patrona" | — |
| 6 | Dünyanın En Zengini ($1T) | Dergi kapağı, özel jet; annenin mesajı: "Baban seninle gurur duyardı." | Dergi kapağı çerçevede | — |

Tören yapısı (1.10): eski sahne çıkar → yeni sahne gelir → hikaye kartı (portre + 1–3 cümle) → "Önce / Şimdi" kartı → konfeti, ses, haptik.

## 5. Hayaller (duygusal hedefler)

Hayaller panosu (1.8) iki tür hedef gösterir:

1. **Statü eşyaları:** sıradaki ev, araç, kıyafet (mevcut tasarım; gelir bonusu verir).
2. **Hikaye hayalleri:** tek seferlik, küçük bir mikro hikaye ve karakter tepkisi açan alımlar. Gelir bonusu yok ya da çok küçük; asıl ödül an.

| Hayal | Yaklaşık sınıf | Ödül anı |
| --- | --- | --- |
| Sıcak bir çorba | Sokak | Kahraman ilk kez gülümser |
| Şans'a mama ve tasma | Sokak | Şans'ın ilk tasması |
| Annene telefon kontörü | Gündelikçi | Annenin ilk sesli mesajı |
| Rıza Amca'ya yeni mont | İşçi Sınıfı | Vedalaşma anı |
| Annene ev | Milyoner | Milyoner töreniyle birleşir |
| Düğün | Multimilyoner | Multimilyoner töreniyle birleşir |
| Bülent Bey'in şirketi | Milyarder | Milyarder töreniyle birleşir |
| Mahalleye kütüphane (vakıf) | En Zengin | Emekliliğe köprü |

Denge: hikaye hayallerinin fiyatları o sınıfın birkaç dakikalık geliri kadar olacak. 1.8'de simülatöre eklenip tempo hedefleri yeniden kontrol edilecek.

## 6. Hanedan anlatısı (Faz 2)

- **Emeklilik = servetini vakfa bağışlamak.** Kahraman "kütüphane/vakıf" çizgisini tamamlar; çocuğuna para değil **adını ve öğrettiklerini** bırakır.
- **Miras puanı arayüzde "Aile İtibarı" (Family Legacy)** olarak geçer. Her puan +%1 gelir: "Soyadın kapıları açıyor."
- Çocuk kendini kanıtlamak için sıfırdan başlar. Şans'ın yavrusu ona eşlik eder (yoldaş nesiller boyu sürer).
- Açık sorular (Faz 2.1'de karar): varisin cinsiyeti (oyuncu seçimi mi, sırayla mı?), 2. neslin açılış sahnesi (sokak mı, yurt odası mı?), 2. nesil için yeni kıyafet seti.

## 7. Olay kartlarına karakter bağları (Faz 2.4)

Kartların bir kısmı bu kadrodan gelir; böylece "tanıdık yüzler geri döner":

- Rıza Amca: "Eski atölyeyi yeniden açmak istiyorum, ortak olur musun?"
- Annen: "Komşunun oğlu iş arıyor, bir bakar mısın?"
- Bülent Bey: "Restoranımı sana satayım, ama bir şartım var..."
- Eşin: "Tatile mi çıksak, yoksa yeni bir yatırım mı?"
- Kuzen: "Bu kripto kesin uçacak!" (tekrar eden mizah karakteri)

## 8. Görsel ihtiyaç listesi

Stil: mevcut Pixar benzeri yarı 3D çizgi tarz (`ch-8-1.png` referans). Hepsi şeffaf arka planlı.

**Faz 1 (dikey dilim, ilk 30 dakika):**

| Görsel | Adet | Not |
| --- | --- | --- |
| Kahraman idle: üşüyen-kambur (sokak kıyafetleri 1–3) | 3 | Animasyonlu WebP döngü |
| Kahraman idle: normal / kendinden emin | Kıyafet başına 1 | Aşamalı; önce ilk 8 kıyafet |
| Kahraman sevinç | Kıyafet başına 1 | Mevcut `celebrate` boru hattı |
| Şans: idle, sevinç, uyuyan → uyanan | 3 | + 3 tasma varyantı (Faz 1'de ip ve deri yeterli) |
| Rıza Amca portre | 3 ifade | Rehber balonları için |
| Annen portre | 3 ifade | Endişeli, gülümseyen, ağlayan-mutlu |
| Bülent Bey portre | 2 ifade | Kızgın, şaşkın |
| Tören sahneleri: ilk sıcak yemek, annenin evi | 2 | Hikaye kartı görseli |
| Para fiziksel hali: cüzdan → kasa → banka kasası → altın oda | 4 | Rapor §6.3 |

**Faz 2:** eş portresi ve düğün fotoğrafı, dergi kapakları, kütüphane/vakıf, varis seti, Şans'ın yavrusu, kuzen portresi, olay kartı ikonları.

Üretim yolu: hikaye ve liste onaylanınca Higgsfield pilotu (tek kıyafet + Şans), beğenilirse toplu üretim. Statik portreler görsel modelle, animasyonlar video modelle (başlangıç = bitiş karesi, dikişsiz döngü) → şeffaf animasyonlu WebP.

## 9. Metin ihtiyacı (TR + EN)

- 7 tören hikaye kartı (1–3 cümle)
- Rehber: ~8 Rıza Amca balonu
- Anne mesajları: ~10
- Hayal mikro hikayeleri: 8
- Karakter balonları (terfi, alım tepkileri): ~30
- Olay kartları: 60 (Faz 2)

Metinler `src/game/i18n/` içine, ilgili özellik yazılırken eklenir.

## 10. Mekaniğe etkisi (planla bağ)

| Plan maddesi | Hikaye eklemesi |
| --- | --- |
| 1.7 HUD | Sokak sınıflarında dokunma düğmesi "Şişe topla" |
| 1.8 Hayaller panosu | Hikaye hayalleri + statü eşyaları |
| 1.10 Sınıf töreni | Her sınıfta hikaye kartı (§4) |
| 1.12 Onboarding | Rehber Rıza Amca; isim sorma ilk satın almadan sonra |
| 1.13 Çevrimdışı modal | Şans kapıda uyanır |
| 2.1 Hanedan | Vakıf ve "Aile İtibarı" anlatısı (§6) |
| 2.4 Olay kartları | Kadro kartları (§7) |
