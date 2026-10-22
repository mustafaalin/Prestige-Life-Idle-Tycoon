# Varsayılan ikonlar (sonra çizilecek)

Kullanıcı isteği (2026-10-22): oyunda kendi çizilmiş ikonlarımız dışında kalan varsayılan ikonları belirleyip onlar için ikon üretmek. Bunlar `lucide-react` kütüphanesinden gelen düz çizgi ikonlar; geri kalan her şey `public/assets/icons/v2/` ve `ui/icons.ts` içindeki kendi resimlerimiz. Bu liste 2026-10-22 kodundan çıkarıldı; ikon değişince buradan silinir.

Üretim sırası: önce oyuncunun her gün gördükleri (A), sonra ara sıra görülenler (B). C'dekiler küçük arayüz işaretleri, düz vektör kalabilir (kararı kullanıcı verir). Görseller GPT'de (komutları ben yazarım), [art-prompts-v2.md](./art-prompts-v2.md) tarzında; resim ekleyince `npm run backup`.

## A. Oyunda sık görülenler

| İkon | Nerede | Ne anlatıyor |
| --- | --- | --- |
| Saat (`Clock`) | Yatırım kutucukları ve miktar kartı (`ui/invest/InvestScreen.tsx`); mağazadaki günlük teklif sayacı (`ui/shop/StoreBanners.tsx`) | vade / kalan süre |
| Kilit (`Lock`) | Alt menüde kapalı düğmeler (`home/BottomNav.tsx`), hayaller satırı (`home/DreamsRow.tsx`), iş ağacı (`career/JobTree.tsx`), işletmeler (`businesses/BusinessesScreen.tsx`, `BusinessDetails.tsx`), mağaza ve evler (`shop/ShopScreen.tsx`, `HousingPanel.tsx`), Zenginler listesi, albüm, yatırımın Borsa / Emlak sekmeleri | kapalı / henüz açılmadı |
| Onay (`Check`) | Günlük ödülde alınan gün (`home/DailyCard.tsx`), şart listesi (`career/Requirements.tsx`), ustalık (`JobTree.tsx`), mağazada sahip olunan (`ShopScreen.tsx`), Mağaza paket maddeleri (`StoreSheet.tsx`, `StoreBanners.tsx`) | tamam / sende var |
| Yükselt oku (`ArrowBigUpDash`) | İşletme kartı ve ayrıntısındaki geliştir düğmesi (`businesses/BusinessCard.tsx`, `BusinessDetails.tsx`), hedef rozeti (`home/QuestPanel.tsx`) | seviye atla |
| Dükkân (`Store`) | Şube düğmesi (`BusinessCard.tsx`, `BusinessDetails.tsx`), Mağaza başlığı (`shop/StoreSheet.tsx`) | şube / mağaza |
| Oynat (`Play`) | İşletme "Çalıştır" düğmesi (`BusinessCard.tsx`), albümde video (`story/AlbumSheet.tsx`) | çalıştır / izle |
| Reklam kartı (`Clapperboard`) | İşletme satırında reklam teklifi işareti (`BusinessCard.tsx`) | reklam fırsatı var |
| Çanta (`Briefcase`) | Resmi olmayan meslek yerine (`career/JobIcon.tsx`), Kariyer boş durumu (`CareerScreen.tsx`), ev/araç kariyer şartı (`shop/CareerAsk.tsx`) | iş / kariyer |
| Kep (`GraduationCap`) | Kurslar paneli (`career/CoursesPanel.tsx`) | kurs |
| Ev / anahtar (`Home`, `KeyRound`) | Evler panelinde kendi ev / kira (`shop/HousingPanel.tsx`), sahnedeki eşya kısayolu (`scene/Scene.tsx`) | ev, kiralık |
| Gömlek, araba (`Shirt`, `Car`) | Sahnedeki eşya kısayolları (`scene/Scene.tsx`) | kıyafet, araç |
| Kalp (`Heart`) | Okşayınca uçan kalp (`scene/Scene.tsx`), annenin mesajı (`story/MomMessage.tsx`) | sevgi |
| Telefon (`Phone`) | Annenin mesajı, olay kartları, tören ve önsöz konuşmaları (`story/MomMessage.tsx`, `events/EventCards.tsx`, `story/Ceremony.tsx`, `story/Prologue.tsx`) | telefondan gelen mesaj |
| Hediye (`Gift`) | Olay kartındaki seçenek düğmeleri (`events/EventCards.tsx`), tören hediyesi (`story/Ceremony.tsx`) | hediye |
| El (`Pointer`) | Rehberin işaret eden eli (`home/Focusable.tsx`) | buraya dokun |

## B. Ara sıra görülenler

| İkon | Nerede |
| --- | --- |
| Kupa (`Trophy`), gazete (`Newspaper`) | Zenginler listesi (`richList/RichList.tsx`) |
| Ses, müzik, zil, kalkan, geri yükle (`Volume2`, `Music`, `Bell`, `ShieldCheck`, `RotateCcw`) | Ayarlar (`home/SettingsSheet.tsx`) |
| Kopyala (`Copy`) | Oyuncu kimliği (`shop/PlayerId.tsx`) |

## C. Küçük arayüz işaretleri (düz kalabilir)

Kapat `X` (bütün pencereler), ok `ChevronRight` / `ChevronUp` / `ArrowRight` (rehber, üst çubuk, hedef, tören), şartta boş halka `Circle` (`career/Requirements.tsx`).

Yalnız geliştirme ekranlarında olanlar (`DevMenu.tsx`, `scene/SceneLab.tsx`, `ads/MockAdOverlay.tsx`) çizilmez.
