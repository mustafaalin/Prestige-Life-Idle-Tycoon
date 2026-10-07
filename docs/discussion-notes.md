# Tartışma notları (sonra konuşulacak)

Kararı henüz verilmemiş konular ve Claude'un önerileri. Karar verilince ilgili belgeye (plan, hikaye, tasarım) taşınır ve buradan silinir.

Son güncelleme: 2026-10-07

## 1. Görsel ve animasyon yaklaşımı

**Durum:** Kullanıcı kodla "sahte animasyonu" (durağan resme zıplama/esneme) reddetti: yüz ifadesi ve kollar hareket etmeden sevinç yapay kalıyor. Hedef gerçek karakter animasyonu. Araç maliyetlerini kullanıcı karşılar. Mevcut `ch-N-*.png` görsellere bağlı kalmak gerekmiyor; daha iyisi çıkarsa karakter, Şans ve kadro sıfırdan tasarlanabilir.

**Karar (2026-10-07):** Higgsfield pilotu hemen, 1.6 ile paralel; mevcut kahraman ile yeni tasarım yan yana denenir (plan 1.16). Açık kalan: aşağıdaki kurulum ve Ludo.ai sorusu.

- Kurulum (kullanıcı yapacak): `claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp`, ardından `/mcp` ile OAuth girişi. Ücretsiz katman 150 kredi/ay, fazlası $1 = 16 kredi (Mayıs 2026 bilgisi).
- Erişilen modeller: Kling 3.0, Seedance 2.0, Veo 3.1; karakter tutarlılığı için Soul ID.
- Pilot kapsamı: tek kıyafet idle + sevinç, Şans idle. Oyuna takılıp telefonda değerlendirilir.
- Boru hattı:
  1. Düz yeşil zeminde video üret (arka plan silmeyi kolaylaştırır).
  2. Idle için başlangıç ve bitiş karesi aynı resim → dikişsiz döngü.
  3. Kare kare arka plan sil (yerelde rembg/BiRefNet veya fal.ai).
  4. Küçült, kare azalt, animasyonlu WebP (`ffmpeg`, `img2webp`, `scripts/convert_outfit.py` mevcut).
- Başarı ölçütleri: sevinçte yüz ifadesi değişiyor ve kollar kalkıyor; döngüde atlama yok; kenarda yeşil hale yok; animasyon başına < 1–1,5 MB.
- Her üretimden önce kredi maliyeti kullanıcıya söylenir.
- Yedek: fal.ai MCP (`https://mcp.fal.ai/mcp`, API anahtarlı): 1.000+ model, video arka plan silme.
- Açık soru: Ludo.ai ile önceki sevinç denemesi tam olarak nerede takıldı (görüntü kalitesi, şeffaflık, karakter bozulması)?

**Alternatif: iskeletli 2D (Rive / Spine).** Kol, kafa, ağız ve göz ayrı parçalar, kemikle hareket. Küçük dosya, akıcı hareket, kıyafet değişimi kolay; ama rig işi editörde elle yapılmalı, Claude koddan güvenilir yapamaz.

## 2. Remotion (github.com/remotion-dev/remotion)

**Ne:** React ile kodla video üretme çerçevesi. Yeni görüntü üretmez, var olan görselleri düzenler. Karakter animasyonu sorununu çözmez.

**Lisans:** Bireyler ve en fazla 3 çalışanlı şirketler için ticari kullanım dahil ücretsiz; daha büyük şirkete Company License gerekir.

**Faydalı olabileceği yerler:**

| Kullanım | Değer | Zaman |
| --- | --- | --- |
| Mağaza tanıtım videosu ve reklamlar (Play Store, TikTok, Reels, Shorts); TR/EN, dikey/yatay otomatik | Yüksek | Yayından önce (Faz 3) |
| Mağaza ekran görüntüleri (her dil ve cihaz boyutu) | Orta | Yayından önce |
| "Hayat hikayen" paylaşım videosu (oyuncunun yolculuğu, sosyal medyada paylaşılır) | Deneysel | Faz 2+ |
| Higgsfield kliplerini müzik ve yazıyla tanıtım filmine çevirmek | Orta | Yayından önce |
| Oyun içi tören ve hikaye kartları | Düşük (oyun zaten React; video dosyası uygulamayı şişirir) | Gerekmez |

**Öneri:** Yayından önce repoda ayrı bir `video/` klasöründe tanıtım videoları için kurulsun.

## 3. Konut modeli ayrıntıları

Karar: tek ev kavramı, kirala → satın al → kiraya ver ([game-design-v2.md §4.8](./game-design-v2.md)). Simülatörde netleşecekler: depozito oranı (başlangıç %4), kira geri dönüş süresi, aynı anda tek kiralık ev mi. Düzenli kira gideri yok önerisi kullanıcıyla teyit edilecek.

## 4. Faz 2.1 hanedan soruları ([story-v2.md §6](./story-v2.md))

Faz 1 bitip oyunun eğlenceli olduğu görülünce karar verilecek.

1. **Varisin cinsiyeti.** Öneri: oyuncu seçsin (düğünden sonraki doğum sahnesinde tek seçim). 1. nesilde kahraman sabit erkek; seçim kitleyi genişletir. Bedeli: 2. nesil kıyafetleri iki kat çizim. Bütçe kısıtlıysa: varis her zaman kız ("babasının izinden giden kız"), seçim sonra eklenir.
2. **2. neslin açılış sahnesi.** Öneri: küçük yurt odası veya kiralık oda, sokak değil. Ünlü ailenin çocuğu sokakta inandırıcı değil, aynı sahneyi tekrarlamak emekliliğin ödülünü küçültür. "Para yok ama ad var" Aile İtibarı ile örtüşür. Gerekenler: yeni başlangıç evi görseli, "Şişe topla" yerine yeni eylem ("Ders ver" / "Kuryelik yap"), birkaç metin.
3. **2. nesil kıyafet seti.** Öneri: aynı kademe sayısında yeni, daha genç tarzda set; parça parça üretim (açılışa ilk 3–4). Ek fikir: babadan kalan bir aile yadigârı (saat veya Şans'ın tasması) varisin üzerinde hep görünsün.
