# Session Handoff

Last updated: 2026-04-04

Bu dosya yeni bir oturumda projeye hızlı geri dönmek icin guncel durum ozetidir.

## Quick Resume Prompt

Yeni sohbette su prompt yeterli:

```text
Bu proje local-first idle life sim. Lutfen once su dosyalari oku ve mevcut durumu kisaca ozetle:

docs/session-handoff.md
docs/current-roadmap.md
docs/quest-progression.md
docs/bank-investment-system.md
docs/mobile-ad-integration.md

Sonra en mantikli siradaki urun ve teknik adimi oner.
```

## Current Product State

Oyunun ana omurgasi artik local-first olarak calisiyor.

Calisan ana sistemler:

- local auth / local profile bootstrap
- worker + specialist job progression
- chapter tabanli quest sistemi
- daily reward ve collect earnings
- business progression
- real estate / bank / cashback / premium bank card
- health ve happiness stat sistemi
- premium cars ve gem ile satin alma akisi
- modal bazli mobil-first UI akislari

Repo su anda playable durumda, ama urun tamamlanmis degil.

## What Was Finished Recently

Son sprintlerde tamamlanan ana basliklar:

- Jobs sistemi refactor edildi
  - `category`, `tier`, `order`, `requirements` explicit hale getirildi
  - worker / specialist ayrimi artik level araligindan turemiyor
  - ilgili veri: [jobs.ts](../src/data/local/jobs.ts)
- Job requirement sistemi kuruldu
  - time, prestige, health, happiness, house, car requirementlari var
  - degerlendirme mantigi: [jobRequirements.ts](../src/data/local/jobRequirements.ts)
- Health ve happiness sistemi aktif edildi
  - action modallari var
  - stat animasyonlari var
  - job / house / car wellbeing etkileri header'a bagli
  - ilgili dosyalar:
    - [wellbeing.ts](../src/data/local/wellbeing.ts)
    - [HealthModal.tsx](../src/components/HealthModal.tsx)
    - [HappinessModal.tsx](../src/components/HappinessModal.tsx)
- Specialist job track eklendi
  - manager track halen placeholder
- Job ve quest UI akislari iyilestirildi
  - quest list siralama
  - quest bar redesign
  - job progress feedback
- Stuff modal ciddi sekilde iyilestirildi
  - standart ve premium car kartlari
  - premium car gem satin alma
  - shop'a yonlendiren aktif `Buy` butonu
  - house kartlarinda wellbeing bilgisi
  - car/house downgrade kilitleri yerine active job support uyarilari
  - owned, inactive cars icin yari fiyat satis
- Bottom nav job ikonuna progress ring ve ready attention eklendi
- Investments tarafinda cashback attention badge eklendi

## Current Architecture Notes

Olumlu taraflar:

- veri katmani eskisine gore daha explicit
- local-first ama future hybrid'a uygun sinirlar var
- modal ve reward feedback dili daha tutarli
- wellbeing icin ortak kontrat var

Dikkat edilmesi gereken teknik borclar:

- [useGameState.ts](../src/hooks/useGameState.ts) hala cok buyuk
- Supabase kalintilari repoda duruyor
- manager jobs henuz gercek veriyle tanimli degil
- stocks / bazi investment alanlari placeholder
- offline wellbeing tam urunlesmedi

## Current Important Files

En kritik dosyalar:

- app orchestration: [App.tsx](../src/App.tsx)
- main game orchestration: [useGameState.ts](../src/hooks/useGameState.ts)
- jobs data: [jobs.ts](../src/data/local/jobs.ts)
- job requirements: [jobRequirements.ts](../src/data/local/jobRequirements.ts)
- quests data: [quests.ts](../src/data/local/quests.ts)
- wellbeing: [wellbeing.ts](../src/data/local/wellbeing.ts)
- cars data: [cars.ts](../src/data/local/cars.ts)
- houses data: [houses.ts](../src/data/local/houses.ts)
- stuff modal: [StuffModal.tsx](../src/components/StuffModal.tsx)
- jobs modal: [JobsModal.tsx](../src/components/JobsModal.tsx)

## What Still Needs Work

En mantikli kalan ana basliklar:

1. Manager jobs
- veri listesi yok
- modalda placeholder olarak duruyor
- specialist -> manager gecis tasarimi tamamlanmali

2. Premium houses
- premium cars mantigi house tarafina tasinabilir
- gem sink olarak guclu aday

3. Wellbeing balancing
- car / house / job degerleri tekrar balans isteyebilir
- offline wellbeing uygulanip uygulanmayacagi urun karari netlestirilmeli

4. useGameState refactor
- quest, wellbeing, bank, economy mutation kisimlari ayrilabilir

5. Gem economy design
- gem source / sink dengesi daha bilincli hale getirilmeli
- boost sistemleri veya premium utility kararina gidilebilir

## Suggested Next Step

Su an en mantikli urun sonraki adim:

- manager jobs listesini tanimlamak

Alternatif sistemsel sonraki adim:

- premium houses

Alternatif teknik sonraki adim:

- `useGameState` parcalama

## Validation Status

Son guncelleme aninda:

- calisma agaci temizdi
- son commit: `a3821d2`
- `npm run build` basariliydi
