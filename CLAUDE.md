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
- **Offline earnings:** calculated on `visibilitychange` (foreground resume). Wellbeing decay capped at −2/h, max 24h. Unclaimed earnings are persisted to `localStorage` under `pending_offline_earnings` and restored on next session, combining with any newly calculated earnings.
- Schema fields `jobs.unlock_requirement_money`, `character_outfits.unlock_type/value` are unused in live rules.

### UI Conventions

- All screens are **mobile-first**. Never design for desktop-only layouts.
- Navigation is `BottomNav` → tab modals (full-screen overlay pattern).
- Reward animations (`GemRewardAnimation`, `MoneyRewardAnimation`, `StatRewardAnimation`) must render **above** modals, not behind them.
- Do not add global loading spinners that wipe content; prefer skeleton or in-place loading.

## Design System

### Color Palette

| Role | Token | Usage |
|---|---|---|
| Primary / navigation | `violet-500 → indigo-500` | Tab bars, primary buttons, modal headers |
| Positive / income | `emerald-500` | Buy buttons, income indicators, success states |
| Negative / expense | `rose-500 → rose-600` | Sell buttons, expense indicators, danger actions |
| Boost / active | `amber-400` | Active boost timers, quest rewards, prestige |
| Ad button | `orange-500` | "Free / Watch Ad" buttons everywhere |
| Gem / premium | `violet-600` | Gem buttons, gem prices, premium features |
| Health | `lime-400 → lime-500` | Health bar, health boost |
| Happiness | `amber-300 → orange-400` | Happiness bar, happiness boost |
| Neutral text | `slate-900 / slate-800 / slate-500 / slate-400` | Body text hierarchy |
| Card background | `white` | All modal cards |
| Subtle background | `slate-50 / slate-100` | Section backgrounds, cancel buttons |

### Gradients (recurring patterns)
```
Primary CTA:      from-violet-500 to-indigo-500
Income/Buy:       from-emerald-500 to-green-500
Danger/Sell:      from-rose-500 to-rose-600
Boost (ad):       from-amber-500 to-orange-500
Health bar:       from-lime-400 to-lime-500
Happiness bar:    from-amber-300 to-orange-400
```

### Border Radius
| Context | Token |
|---|---|
| Full-screen modal card | `rounded-[28px]` |
| Large content cards | `rounded-[22px]` or `rounded-3xl` |
| Standard cards | `rounded-2xl` |
| Buttons | `rounded-2xl` (primary) / `rounded-xl` (secondary) |
| Pills / badges | `rounded-full` |
| Small chips | `rounded-lg` |

### Modal Patterns
- **Overlay backdrop:** `bg-black/35` — never go darker; `bg-black/90` is too aggressive
- **Full-screen modal:** `fixed inset-x-0 z-[50]` starting at `top: 88px` (below header)
- **Bottom sheet (confirm dialogs):** `fixed inset-0 bg-black/35 flex items-end`; OR `absolute inset-0` inside the parent modal's content area to pin it below the tabs
- **Dialog card:** `bg-white rounded-[28px] shadow-2xl`
- **Card header separator:** `border-b border-slate-100` or `border-b border-violet-100`

### Buttons
```
Primary CTA:    rounded-2xl py-3.5 font-black text-sm text-white bg-gradient shadow-lg active:scale-[0.98]
Secondary:      rounded-2xl py-3.5 font-black text-sm bg-slate-100 text-slate-600 active:scale-[0.98]
Destructive:    bg-gradient-to-r from-rose-500 to-rose-600
Icon button:    p-1.5 rounded-full hover:bg-*/10 active:scale-90
```
- Always `transition-all` on interactive elements
- Press feedback: `active:scale-95` for large buttons, `active:scale-[0.98]` for cards/rows, `active:scale-90` for icon buttons
- Disabled state: `disabled:opacity-50` (never hide disabled buttons entirely)

### Typography
```
Modal title:       text-xl font-black text-slate-900
Section label:     text-[10px] font-black uppercase tracking-widest text-slate-400
Body:              text-sm font-bold text-slate-600
Subtext:           text-[11px] font-semibold text-slate-500
Price / value:     text-lg font-black  (color depends on positive/negative)
Badge / chip:      text-[10px] font-black
```

### Z-Index Layering
```
50   Full-screen tab modals (BusinessModal, InvestmentsModal, etc.)
60   IAP confirm modal
70   Selection warning overlays
90–100 Reward animations
110  In-modal confirm overlay (car purchase)
130–160 Toast / notification overlays
200  Top-level system dialogs
```

### Spacing Conventions
- Modal inner padding: `px-5 pb-5 pt-3`
- Card padding: `p-3` or `p-4`
- Button gap in a row: `gap-2.5`
- Section gap: `gap-3` or `gap-4`
- Header height assumed: `88px` (used for `top` positioning of modals and ad button)

### Responsive Breakpoint
- `max-[500px]:` — elements shrink below 500px viewport width (header icons, health/happiness bars)

### Sound Effects
| Event | SFX key |
|---|---|
| Money / coin collected | `coin` |
| Gem collected | `gem` |
| Purchase (new item bought) | `purchase` |
| Upgrade / job change / outfit select | `levelUp` |
| Button click (minor) | `click` |

Always play a sound for meaningful player actions. Cooldown / disabled states → no sound.

### Monetization Status

- **RevenueCat:** `@revenuecat/purchases-capacitor` installed and configured. Android API key live in `.env.production`. Native purchase flow active on device; web falls back to `purchaseMock` (dev only).
- **AdMob:** Real ad unit IDs in `src/services/ads/adMobConfig.ts`. `VITE_ADMOB_TESTING=false` in `.env.production`. Rewarded ad provider switches automatically: Capacitor on native, mock on web.
- **IAP products:** Defined in Play Console. `PACKAGE_ID_TO_PRODUCT_ID` map in `src/services/iapService.ts` links shop packages to store product IDs.

### Character Animation Status

- Outfit images follow naming: `ch-N-1.png` (idle static), `ch-N-2.png` (celebrate static).
- Animated WebP overlays: `ch-N-idle.webp` (18-frame, 7fps) and `ch-N-celebrate.webp` (25-frame, 12.5fps). Generated from Ludo.ai sprite sheets using `scripts/convert_outfit.py`.
- `CharacterDisplay` tries `.webp` first, falls back to `.png` via `onError`. No code change needed when adding new animated outfits — just drop the `.webp` files.
- Celebration window: 2200ms. Animated celebrate plays browser-natively (no CSS needed); static celebrate uses `animate-celebrate-jump` CSS.

### Splash Screen (Android)

- Android 12+ shows a mandatory OS splash (app icon + blue `#0C2FA0` background) before the app window opens. This is system-controlled and cannot be removed.
- After OS splash: Capacitor `@capacitor/splash-screen` overlay shows `drawable-port-*/splash.png` (full game artwork). Configured with `launchAutoHide: false`; manually hidden via `SplashScreen.hide({ fadeOutDuration: 400 })` when `gameState.loading` becomes false.
- Splash images live in `android/app/src/main/res/drawable-port-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/splash.png`.

### Intro Sequence

On first game load (web and native), `App.tsx` runs a staged intro:
1. House background slides in from right (0ms)
2. Character slides in from right (900ms)
3. Car slides in from right if present (1650ms)
4. Offline earnings modal appears (2475ms)

Controlled by `introPhase` state (`'pending' | 'house' | 'character' | 'car' | 'done'`). Offline modal gated on `introPhase === 'done'`.

## Session Startup

When resuming work, read:
1. `docs/session-handoff.md` — last known state and recently finished work
2. `docs/current-roadmap.md` — what's in progress and what's next
3. `docs/game-rules.md` — authoritative game logic (beats schema when they conflict)
