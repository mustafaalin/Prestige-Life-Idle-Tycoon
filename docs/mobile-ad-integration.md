# Mobile Ad Integration

## v2 (2026-10-08)

v2'nin reklam katmanı v1'den ayrı: `src/game/runtime/ads.ts` (kararlar: [monetization-v2.md](./monetization-v2.md)).

- **Giriş noktası:** `showRewardedAd(placement)` → `'rewarded' | 'dismissed' | 'unavailable'`. Ödül sadece `'rewarded'` dönünce verilir; reklam kapandıktan sonra döner (oyuncu ödülün geldiğini görür). Reklam öncesi teklifte ödül yazılı olmalı (AdMob politikası).
- **Reklam yerleri:** `offline_x2`, `find_x2`, `income_boost`, `dream_help` (+ `dev_test`). Hepsi aynı ödüllü birimi kullanır (Android `…/1720602351`, iOS `…/1908304619`).
- **İzin sırası:** `initAds()` ana ekran açılınca (önsözden sonra) çağrılır: AdMob başlatılır, UMP izin bilgisi alınır, gerekiyorsa form gösterilir. iOS ATT, oyuncu ilk kez reklam izlemeyi seçtiğinde sorulur (Google'ın önerdiği sıra: önce GDPR, sonra ATT). v1 sırayı tersine yapıyordu.
- **Gizlilik seçenekleri:** Ayarlar (üst barda dişli) → "Gizlilik seçenekleri"; yalnızca UMP gerekli dediğinde görünür (AB/Birleşik Krallık/İsviçre).
- **Test:** Geliştirme sürümünde (ve `VITE_ADMOB_TESTING=true` iken) her zaman test reklamı. Tarayıcıda `MockAdOverlay` (4 sn sahte reklam). Geliştirici menüsü → "Test reklamı izle". İzin formunu Türkiye'den denemek için `.env.local`'a `VITE_ADMOB_DEBUG_EEA=true`; UMP bunu sadece test cihazında uygular (cihazın hash'li kimliği logcat'te "addTestDeviceHashedId" satırında, `VITE_ADMOB_TEST_DEVICE_IDS`'e eklenir).
- **Eklenti:** `@capacitor-community/admob` 8.2.1 (Capacitor 8 uyumlu; 7.2.0'dan yükseltildi, v1 de derleniyor).
- **AdMob konsolunda yapılacaklar (kullanıcı):** Privacy & messaging → "European regulations" (GDPR) mesajı oluşturup uygulamaya bağlamak (yoksa form hiç açılmaz); isteğe bağlı iOS IDFA açıklama mesajı; mağaza yayınından önce `app-ads.txt`.

Aşağısı v1 altyapısını anlatır.

---

Bu doküman, oyundaki rewarded ad altyapısının mevcut durumunu ve production'a geçişte değiştirilecek noktaları özetler.

## Amaç

- Web geliştirmede reklam akışlarını hızlı test edebilmek
- Android / iOS native build'de gerçek rewarded test reklamı gösterebilmek
- Oyun kodunu reklam SDK detaylarından ayırmak

## Mevcut Mimari

Reklam sistemi provider tabanlı çalışır:

- `src/services/adService.ts`
  - uygulamanın kullandığı tek giriş noktası
  - `showRewardedAd(placement)` çağrısı burada dışarı açılır
- `src/services/ads/providerSelector.ts`
  - runtime'a göre provider seçer
- `src/services/ads/providers/mockRewardedProvider.ts`
  - web/tarayıcı geliştirmede kullanılır
- `src/services/ads/providers/capacitorAdmobProvider.ts`
  - native Android/iOS build için gerçek AdMob plugin çağrılarını yapar
- `src/components/TestRewardedAdModal.tsx`
  - mock provider kullanılırken açılan geliştirme reklam modalı

## Web vs Native Davranışı

### Web

- Tarayıcıda çalışırken gerçek AdMob SDK kullanılamaz
- Bu yüzden `mockRewardedProvider` seçilir
- Kullanıcıya test reklam modalı gösterilir
- Reklam tamamlanınca ödül akışı gerçekmiş gibi devam eder

### Native

- Android/iOS uygulaması Capacitor container içinde çalışırken
- `capacitorAdmobProvider` seçilir
- `@capacitor-community/admob` ile gerçek rewarded test reklam açılır

## Aktif Rewarded Ad Placement'ları

Aşağıdaki aksiyonlar şu anda rewarded ad akışına bağlı:

- `quest_reward_x2`
- `offline_x2`
- `daily_streak_rescue`
- `shop_ad_reward`
- `earnings_x3`
- `job_unlock_skip`

Placement metinleri:

- `src/services/ads/placements.ts`

## Test Ad Unit Yapısı

Rewarded test ad unit id'leri:

- Android: `ca-app-pub-3940256099942544/5224354917`
- iOS: `ca-app-pub-3940256099942544/1712485313`

Bu değerler:

- `src/services/ads/adMobConfig.ts`

içinde tutulur.

## Native App ID Yapılandırması

### Android

Test app id:

- `ca-app-pub-3940256099942544~3347511713`

Konumlar:

- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/values/strings.xml`

### iOS

Test app id:

- `ca-app-pub-3940256099942544~1458002511`

Konum:

- `ios/App/App/Info.plist`

Ek olarak iOS tarafında:

- `GADApplicationIdentifier`
- `GADIsAdManagerApp`
- `NSUserTrackingUsageDescription`
- `SKAdNetworkItems`

alanları eklendi.

## Capacitor Kurulumu

Eklenen dosyalar / klasörler:

- `capacitor.config.ts`
- `android/`
- `ios/`

Kullanılan scriptler:

- `npm run cap:sync`
- `npm run cap:add:android`
- `npm run cap:add:ios`
- `npm run cap:open:android`
- `npm run cap:open:ios`

## Native Test Akışı

1. `Android Studio` veya `Xcode` ile native proje açılır
2. uygulama cihaza yüklenir
3. rewarded placement tetiklenir
4. native test ad açılır
5. reklam gerçekten reward verirse oyun ödülü uygular

## Production'a Geçerken Değişecek Yerler

Production öncesi aşağıdakiler değiştirilecek:

1. `src/services/ads/adMobConfig.ts`
   - test rewarded ad unit id'leri yerine gerçek rewarded ad unit id'leri

2. `android/app/src/main/res/values/strings.xml`
   - test Android app id yerine gerçek Android app id

3. `ios/App/App/Info.plist`
   - test iOS app id yerine gerçek iOS app id

4. `src/services/ads/providers/capacitorAdmobProvider.ts`
   - test mode ayarları gözden geçirilecek
   - gerçek consent / privacy akışı finalize edilecek

## Dikkat Edilmesi Gerekenler

- Web'de gerçek reklam beklenmemeli; mock modal normal davranıştır
- Native test için cihazda çalıştırmak gerekir
- Gerçek yayın öncesi production ad unit id'leri gelmeden store build alınmamalı
- Consent / privacy metinleri store yayınından önce tekrar gözden geçirilmeli

## Şu Anki Durum

- Rewarded ad provider mimarisi hazır
- Web mock akışı çalışır durumda
- Native Capacitor + AdMob test entegrasyonu temel seviyede hazır
- Android/iOS test app id konfigürasyonu yapıldı
- Sonraki adım gerçek cihazda rewarded test reklam doğrulaması
