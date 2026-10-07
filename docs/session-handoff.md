# Session Handoff

Son güncelleme: 2026-10-08 · Dal: `v2-rebuild`

Yeni bir oturumda projeye hızlı dönmek için güncel durum özeti. Oyun v2 olarak yeniden yapılıyor; v1 dondu ve v2 onu Faz 2.11'de kaldıracak.

## Belgeler (hepsi bu kadar)

| Belge | Soru | Not |
| --- | --- | --- |
| [report-v2.md](./report-v2.md) | **Neden?** | Tasarım analizi ve yeniden doğuş raporu. Değişmez referans. |
| [game-design-v2.md](./game-design-v2.md) | **Ne?** Kurallar ve sayılar | Rapordan sapmalar §9'da. Rapor ile çelişirse bu geçerli. |
| [story-v2.md](./story-v2.md) | Hikaye, karakterler, ton, görsel listesi | |
| [rebuild-plan.md](./rebuild-plan.md) | **Ne zaman?** Fazlar, görevler, durum | Yapılanlar işaretli. |
| [discussion-notes.md](./discussion-notes.md) | Kararı bekleyen konular | Karar verilince ilgili belgeye taşınır. |
| [mobile-ad-integration.md](./mobile-ad-integration.md) | Reklam altyapısı | v1'den kalan, v2'de de kullanılacak. |
| [v1/](./v1/) | v1 arşivi | v2 işinde okunmaz. `v1/game-rules.md` sadece v1 için geçerli. |

## Durum

- Tamam: Faz 0 (ekonomi çekirdeği + simülatör), 1.1 runtime, 1.2 AppV2 + geliştirici menüsü + i18n, 1.3 işletmeler, 1.4 kariyer + alt sekmeler, 1.5 alışveriş, 1.M mobil temel, 1.17 konut modeli (kirala → satın al → kiraya ver). Hikaye belgesi yazıldı. Faz 1A (çalışan oyun) bitti.
- Oyun mobil öncelikli: önce Google Play, sonra iOS App Store (plan ilke 6). Kayıt telefonda `@capacitor/preferences`'ta.
- 2026-10-08: GPT Astra bağımsız incelemesi (`gpt-astra-inceleme/`) ve Rich Inc. ekran görüntüleri (`rich inc oyun görselleri/`) değerlendirildi. Kararlar:
  - Görsel roman yaklaşımı (durağan poz + ifade + balon); Higgsfield video pilotu ilk adım değil.
  - Önsöz: kovulma + lojmandan çıkış; anne teyzenin yanında, kahraman sokakta; annenin evi kendi merdiveni (konağa kadar). story-v2 §4–5.
  - Ana sahne dış mekân, kirli ara sokak; şişe/kutu sahnede dokunarak toplanır.
  - Ömür: yaş sadece oyun açıkken ilerler, 1 dk = 1 ay, 17 → 97; ömür sonunda emeklilik ve devir, erken emeklilik yok (game-design §4.9, kodda).
  - En Zengin'den sonrası şimdilik bekliyor.
  - Simülatör olay saati hatası düzeltildi; ekranlar artık sadece otomatik geliri gösteriyor.
- Kullanıcı oynayınca bakacak: konut taşınma bedeli seçenek B (discussion-notes §3).
- Tempo: Multimilyarder ($100B) eklendi; yaşlar Milyoner 19, Milyarder 24, Multimilyarder 39, En Zengin 46; sim 8/8.
- Görseller sıfırdan üretiliyor: fal.ai MCP bağlı (kullanıcının bakiyesi ~$10, ~2 ay geçerli). Stil yarı 3D (A1). Pilot `art/pilot/` (~$1,84 harcandı). Stil kılavuzu story-v2 §8.
- Sıradaki: 1.T tasarım düğümleri (sınıf aralıkları/tempo, çevrimdışı tavan, aylık gelir) ve 1.16 sanat stili denemesi; ardından 1.6 sahne (sokak + şişe toplama) ve 1.18 önsöz.

## Çalıştırma

- `npm run dev:v2` (v1 için `npm run dev`); telefonda denemek için `npm run dev:v2 -- --host`
- `npm run sim` ekonomi simülatörü
- Uygulama olarak: `npm run cap:sync:v2` ve ardından `npx cap open android`
- Kod: `src/game/` (çekirdek `core/`, simülatör `sim/`, runtime `runtime/`, i18n `i18n/`, ekranlar `ui/`). Kayıt anahtarı `prestige_life_v2`.
- i18n: Türkçe + İngilizce; v2'de sabit metin yok.

## Uygulama kimliği (v1 ve v2 ortak)

- Paket adı: `com.prestigelife.idletycoon` · Uygulama adı: Prestige Life: Idle Tycoon · versionCode: 2
- AdMob App ID: Android `ca-app-pub-8950990027285549~9898475278`, iOS `ca-app-pub-8950990027285549~3253175874`
- IAP: 8 ürün Play Console'da tanımlı (`com.prestigelife.*`); liste [v1/session-handoff-v1.md](./v1/session-handoff-v1.md). Faz 2.9'da v2'ye göre güncellenecek.
