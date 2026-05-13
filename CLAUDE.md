# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run typecheck    # TypeScript check (no emit)
npm run lint         # ESLint
npm run cap:sync     # build + sync to Capacitor native projects
npx cap open android # open in Android Studio
npx cap open ios     # open in Xcode
```

No test suite exists. Validation = `typecheck` + `lint`.

## Architecture Overview

**Stack:** React 18 + TypeScript, Vite, TailwindCSS, Capacitor (iOS/Android), Supabase (auth + remote DB), AdMob via `@capacitor-community/admob`.

**Runtime mode:** `src/lib/runtimeMode.ts` → `isLocalMode()` always returns `true`. The game runs **local-first**: all state is stored in `localStorage` (via `src/utils/game/storage.ts`) and synced periodically to Supabase. Supabase anonymous auth (`src/lib/auth.ts`) exists only as IAP infrastructure.

### State Architecture

All game state lives in `GameState` (`src/types/game.ts`). The central hook is `useGameState` (`src/hooks/useGameState.ts`) which orchestrates:

| Sub-hook | Responsibility |
|---|---|
| `useGameLoader` | Initial load, localStorage bootstrap, Supabase sync |
| `usePassiveIncome` | Tick-based passive money accumulation |
| `useAutoSave` | Debounced flush of `pendingMoneyDelta` to Supabase |
| `useJobTracking` | Real-time job work-seconds tracking |
| `useQuestDetection` | Watches state changes, marks quests claimable |
| `useBusinessActions` | Purchase / upgrade businesses |
| `useJobActions` | Unlock / select jobs |
| `useBankActions` | Bank deposits, cashback, premium card |
| `useInvestmentActions` | Real estate purchase / upgrade |
| `useStuffActions` | Cars, houses, characters, outfits |
| `useRewardActions` | Daily reward, accumulated money claim, ads |
| `useWellbeingActions` | Health / happiness action modals |

`saveToLocalStorage` is passed down from `useGameLoader` to all action hooks. Every mutation must call it to persist.

`pendingMoneyDelta` is an accumulator; income ticks add to it and `useAutoSave` flushes it in a debounced Supabase write. Never block the tick on network.

### Data Layer

- **Static game data:** `src/data/local/` — jobs, houses, cars, businesses, investments, quests, economy constants, reward scaling. These files are the source of truth for game design values.
- **Services:** `src/services/` — thin wrappers over Supabase RPC calls (profileService, jobService, businessService, investmentService, itemService, rewardService, purchaseService, iapService, statsService).
- **Ad system:** `src/services/ads/` — provider pattern: `providerSelector.ts` picks between `capacitorAdmobProvider` (native) and `mockRewardedProvider` (web/dev) based on platform.

### Key Game Rules (source of truth: `docs/game-rules.md`)

- **Income:** `hourly_income = job_income + business_income + investment_income − house_rent − vehicle_cost − other_expenses`. Net income can be negative.
- **Prestige** comes exclusively from quests: each claimed quest = +1, chapter rewards = bonus prestige, resets accumulate `reset_prestige_bonus`. Job/business/house/car/outfit have no prestige contribution.
- **Jobs:** unlock requires 3 min worked at current job (not money). Completed jobs cannot be revisited.
- **Businesses:** sequential unlock by `unlock_order`, max level 6, upgrade cost = `current_hourly_income × multiplier` (30/60/120/180/240).
- **Investment upgrades:** must be sequential (1→5), each level multiplies `base_rental_income`, not current income.
- **Bank:** same plan type can only have 1 active deposit at a time. Profit-only goes to `lifetime_earnings` on collect.
- **Cashback:** 2% on business/real-estate/car/character/outfit purchases. Premium Bank Card doubles it.
- **Claim system:** 60-min cap, daily limit = 2× full-pool, triple claim multiplies payout but not the daily limit cap.
- **Offline earnings:** calculated on `visibilitychange` (foreground resume). Wellbeing decay capped at −2/h, max 24h.
- Schema fields `jobs.unlock_requirement_money`, `character_outfits.unlock_type/value` are unused in live rules.

### UI Conventions

- All screens are **mobile-first**. Never design for desktop-only layouts.
- Navigation is `BottomNav` → tab modals (full-screen overlay pattern).
- Reward animations (`GemRewardAnimation`, `MoneyRewardAnimation`, `StatRewardAnimation`) must render **above** modals, not behind them.
- Do not add global loading spinners that wipe content; prefer skeleton or in-place loading.

### Known Technical Debt

- `useGameState.ts` is ~1667 lines (SRP violation, decomposition is in the roadmap but not urgent).
- Manager job category is a placeholder — no real data yet.
- RevenueCat native SDK not installed; IAP is mock-only.
- AdMob is in test mode (`isTesting: true`).
- ~15 broken quests (`claimed_quest_count` logic incorrect).

## Session Startup

When resuming work, read:
1. `docs/session-handoff.md` — last known state and recently finished work
2. `docs/current-roadmap.md` — what's in progress and what's next
3. `docs/game-rules.md` — authoritative game logic (beats schema when they conflict)
