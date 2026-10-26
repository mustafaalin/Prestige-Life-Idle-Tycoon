# Analytics (v2)

Oyunun Firebase'e (GA4) gönderdiği olaylar ve ayrıntıları; hangilerinin Firebase'de **özel boyut / metrik** olarak kayıtlı olduğu. Kod: `src/game/runtime/analytics.ts` (olay adları `AnalyticsEvent`), oyuncu hareketleri `src/game/runtime/store.ts` (`actTracked`).

## Neden kayıt gerekir

Olayın yanındaki ayrıntı (parametre) Firebase'e her zaman gider, ama GA4 raporlarında yalnız **Custom definitions**'a kaydedilmiş olanlar görünür. Kayıttan önceki veri geriye dönük dolmaz. Bu yüzden yeni bir ayrıntı, onu gönderen sürüm yayınlanmadan kaydedilir.

**Nerede:** Firebase → Analytics → Custom definitions (ya da GA4 → Admin → Custom definitions). Ad = parametre adı. Sınır: 50 olay boyutu, 25 kullanıcı boyutu, 50 metrik (ücretsiz).

## Kural (her güncellemede)

Koda yeni bir olay ya da parametre eklenince **aynı commit'te** bu belge güncellenir: aşağıdaki tabloya satır eklenir, raporda görülmesi gerekiyorsa "Kayıt" sütununa **bekliyor** yazılır ve `session-handoff.md` → "Kullanıcının yapacakları"na "Firebase'e kaydet: `<ad>`" maddesi eklenir. Kullanıcı Firebase'de kaydedince **kayıtlı** yapılır, madde silinir. Ad değiştirilmez (eski veri eski adla kalır).

## Kayıtlı olması gerekenler

| Ad | Kapsam | Hangi olaylarda | Ne anlatır | Kayıt |
| --- | --- | --- | --- | --- |
| `placement` | Olay | `ad_offer`, `ad_watch` | reklamın hangi düğmeden önerildiği / izlendiği | 2026-10-26 kayıtlı |
| `step` | Olay | `tutorial_step` | rehberde gelinen adım (oyuncu nerede bırakıyor) | 2026-10-26 kayıtlı |
| `outcome` | Olay | `ad_watch`, `purchase_result`, `app_update` | reklam bitti mi, satın alma tamamlandı mı, güncelleme kabul edildi mi | 2026-10-26 kayıtlı |
| `kind` | Olay | `story_view`, `notification_open` | hikâye anının / bildirimin türü | 2026-10-26 kayıtlı |
| `id` | Olay | `story_view`, `notification_open`, `app_update` | hangi an, bildirim ya da sürüm | 2026-10-26 kayıtlı |
| `skipped` | Olay | `story_view` | hikâye "Geç" ile atlandı mı | 2026-10-26 kayıtlı |
| `quest_id` | Olay | `quest_claim` | ödülü alınan hedef | 2026-10-26 kayıtlı |
| `career_id` | Olay | `job_take` | geçilen meslek | 2026-10-26 kayıtlı |
| `course_id` | Olay | `course_start` | başlatılan kurs | bekliyor |
| `skill_id` | Olay | `skill_train`, `skill_pause`, `skill_collect` | çalışılan beceri | bekliyor |
| `business_id` | Olay | `business_level`, `business_branch`, `manager_hire` | işletme | 2026-10-26 kayıtlı |
| `level` | Olay | `business_level`, `skill_train`, `skill_collect` | çıkılan seviye | 2026-10-26 kayıtlı |
| `class_index` | Olay | `class_up`, `story_view`, `retire`, `review_prompt` | sınıf | 2026-10-26 kayıtlı |
| `product_id` | Olay | `purchase_start`, `purchase_result`, `purchase_applied`, `purchase_revoked` | mağaza ürünü | 2026-10-26 kayıtlı |
| `item_id` | Olay | `lifestyle_buy` | alınan araç / kıyafet / lüks / eşya | bekliyor |
| `house_id` | Olay | `home_change` | kiralanan / alınan ev | bekliyor |
| `card_id` | Olay | `event_card` | açılan olay kartı | bekliyor |
| `plan` | Olay | `invest_start`, `invest_collect` | seçilen yatırım fırsatı | bekliyor |
| `life_minutes` | Olay (metrik, Standard) | `class_up` | kahramanın oyun içi yaşı, dakika | bekliyor (yanlışlıkla boyut olarak açıldı: boyut arşivlenip metrik açılmalı) |
| `class_index` | Kullanıcı | oyuncu özelliği | oyuncunun şu anki sınıfı | bekliyor |
| `generation` | Kullanıcı | oyuncu özelliği | kaçıncı nesil | bekliyor |

## Kayıt gerekmeyenler

Raporda kırılım olarak gerekmeyen ya da sayı olarak olayın içinde yeterli olanlar: `accepted` (bildirim izni), `action` (ev: kirala / al), `age`, `amount`, `away_minutes`, `branches`, `finds`, `found`, `heirloom`, `is_default`, `months`, `multiplier`, `panel`, `product`, `products`, `replay`, `won`. Biri raporda gerekirse yukarıya taşınır ve kaydedilir.
