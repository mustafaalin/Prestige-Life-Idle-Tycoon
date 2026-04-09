-- =============================================================
-- IAP & Leaderboard Migration
-- Bu migration yeni Supabase projesinde çalıştırılmalıdır.
-- Önce: Authentication > Settings > Anonymous sign-ins = ENABLED
-- =============================================================

-- ---------------------------------------------------------------
-- 1. PROFILES (anonim auth user'ı ile eşleştirilmiş profil)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL DEFAULT 'player',
  device_id       TEXT,                          -- deviceIdentity'den geliyor
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ---------------------------------------------------------------
-- 2. IAP_PURCHASES (satın alma geçmişi)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.iap_purchases (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id              TEXT NOT NULL,           -- local: 'money-pack-2'
  product_id              TEXT NOT NULL,           -- store: 'com.idleguy.money_pack_2'
  platform                TEXT NOT NULL DEFAULT 'unknown',  -- 'ios' | 'android' | 'mock'
  status                  TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'completed' | 'refunded'
  money_granted           BIGINT NOT NULL DEFAULT 0,
  gems_granted            INTEGER NOT NULL DEFAULT 0,
  amount_usd              NUMERIC(8, 2),
  provider_transaction_id TEXT,
  revenuecat_event_id     TEXT UNIQUE,             -- duplicate önleme
  granted_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.iap_purchases ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi satın almalarını okuyabilir
CREATE POLICY "Users can read own purchases"
  ON public.iap_purchases FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Sadece service_role (webhook) yazabilir — kullanıcı doğrudan yazamaz
-- (Mock geliştirme için geçici olarak anon insert'e izin veriyoruz)
CREATE POLICY "Allow insert for authenticated users (dev)"
  ON public.iap_purchases FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- ---------------------------------------------------------------
-- 3. LEADERBOARD_SCORES
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leaderboard_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL DEFAULT 'player',
  score_type      TEXT NOT NULL,   -- 'lifetime_earnings' | 'prestige_points' | 'net_worth'
  score_value     BIGINT NOT NULL DEFAULT 0,
  extra_data      JSONB,           -- opsiyonel (seviye, outfit vs)
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (auth_user_id, score_type)
);

ALTER TABLE public.leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (leaderboard public)
CREATE POLICY "Anyone can read leaderboard"
  ON public.leaderboard_scores FOR SELECT
  USING (true);

-- Kullanıcı kendi skorunu güncelleyebilir
CREATE POLICY "Users can upsert own score"
  ON public.leaderboard_scores FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own score"
  ON public.leaderboard_scores FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- ---------------------------------------------------------------
-- 4. Leaderboard için index
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS leaderboard_scores_type_value_idx
  ON public.leaderboard_scores (score_type, score_value DESC);

-- ---------------------------------------------------------------
-- 5. updated_at auto-update trigger
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER leaderboard_scores_updated_at
  BEFORE UPDATE ON public.leaderboard_scores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
