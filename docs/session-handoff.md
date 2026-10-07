# Session Handoff

Son güncelleme: 2026-10-07 · Dal: `v2-rebuild`

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
- Kullanıcı oynayınca bakacak: konut taşınma bedeli seçenek B (discussion-notes §3).
- Sıradaki: Faz 1.6 sahne sistemi. Görsel üretimi (1.16): Higgsfield pilotu, kullanıcı MCP bağlantısını kurunca (bkz. discussion-notes §1).

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
