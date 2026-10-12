# Mobile Ad Integration (v2)

Son güncelleme: 2026-10-08 (altyapı); reklam yerleri henüz bağlı değil.

v2'nin reklam katmanı v1'den ayrı: `src/game/runtime/ads.ts` (kararlar: [monetization-v2.md](./monetization-v2.md)).

- **Giriş noktası:** `showRewardedAd(placement)` → `'rewarded' | 'dismissed' | 'unavailable'`. Ödül sadece `'rewarded'` dönünce verilir; reklam kapandıktan sonra döner (oyuncu ödülün geldiğini görür). Reklam öncesi teklifte ödül yazılı olmalı (AdMob politikası).
- **Reklam yerleri:** `offline_x2`, `find_x2`, `income_boost`, `dream_help` (+ `dev_test`). Hepsi aynı ödüllü birimi kullanır (Android `…/1720602351`, iOS `…/1908304619`).
- **İzin sırası:** `initAds()` ana ekran açılınca (önsözden sonra) çağrılır: AdMob başlatılır, UMP izin bilgisi alınır, gerekiyorsa form gösterilir. iOS ATT, oyuncu ilk kez reklam izlemeyi seçtiğinde sorulur (Google'ın önerdiği sıra: önce GDPR, sonra ATT). v1 sırayı tersine yapıyordu.
- **Gizlilik seçenekleri:** Ayarlar (üst barda dişli) → "Gizlilik seçenekleri"; yalnızca UMP gerekli dediğinde görünür (AB/Birleşik Krallık/İsviçre).
- **Test:** Geliştirme sürümünde (ve `VITE_ADMOB_TESTING=true` iken) her zaman test reklamı. Tarayıcıda `MockAdOverlay` (4 sn sahte reklam). Geliştirici menüsü → "Test reklamı izle". İzin formunu Türkiye'den denemek için `.env.local`'a `VITE_ADMOB_DEBUG_EEA=true`; UMP bunu sadece test cihazında uygular (cihazın hash'li kimliği logcat'te "addTestDeviceHashedId" satırında, `VITE_ADMOB_TEST_DEVICE_IDS`'e eklenir).
- **Eklenti:** `@capacitor-community/admob` 8.2.1 (Capacitor 8 uyumlu; 7.2.0'dan yükseltildi, v1 de derleniyor).
- **AdMob konsolunda yapılacaklar (kullanıcı):** Privacy & messaging → "European regulations" (GDPR) mesajı oluşturup uygulamaya bağlamak (yoksa form hiç açılmaz); isteğe bağlı iOS IDFA açıklama mesajı; mağaza yayınından önce `app-ads.txt`.

v1'in reklam altyapısı: [v1/mobile-ad-integration-v1.md](./v1/mobile-ad-integration-v1.md).
