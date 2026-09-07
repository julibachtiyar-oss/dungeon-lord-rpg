-- ==========================================================
-- DUNGEON LORD RPG - SUPABASE CLOUD DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql
-- ==========================================================

-- 1. Game Cloud Saves Table
CREATE TABLE IF NOT EXISTS public.game_saves (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL DEFAULT 'Ren',
    hero_class_id TEXT NOT NULL DEFAULT 'warrior',
    hero_level INTEGER NOT NULL DEFAULT 1,
    core_crystals INTEGER NOT NULL DEFAULT 0,
    gold BIGINT NOT NULL DEFAULT 0,
    gems INTEGER NOT NULL DEFAULT 0,
    story_chapter INTEGER NOT NULL DEFAULT 1,
    adventurer_rank TEXT NOT NULL DEFAULT 'F',
    save_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Global Leaderboard Table
CREATE TABLE IF NOT EXISTS public.leaderboards (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    hero_class TEXT NOT NULL,
    hero_level INTEGER NOT NULL DEFAULT 1,
    core_crystals INTEGER NOT NULL DEFAULT 0,
    floor_reached INTEGER NOT NULL DEFAULT 1,
    total_kills INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_game_saves_updated ON public.game_saves(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON public.leaderboards(core_crystals DESC, floor_reached DESC);

-- 4. Row Level Security (RLS)
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Allow anonymous / public access for game client sync
CREATE POLICY " Allow public read on game_saves\
 ON public.game_saves FOR SELECT
 USING (true);

CREATE POLICY \Allow public upsert on game_saves\
 ON public.game_saves FOR ALL
 USING (true)
 WITH CHECK (true);

CREATE POLICY \Allow public read on leaderboards\
 ON public.leaderboards FOR SELECT
 USING (true);

CREATE POLICY \Allow public upsert on leaderboards\
 ON public.leaderboards FOR ALL
 USING (true)
 WITH CHECK (true);

-- 5. Auto-update timestamp function & trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS \$\$
BEGIN
 NEW.updated_at = NOW();
 RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_game_saves_updated ON public.game_saves;
CREATE TRIGGER tr_game_saves_updated
 BEFORE UPDATE ON public.game_saves
 FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_leaderboards_updated ON public.leaderboards;
CREATE TRIGGER tr_leaderboards_updated
 BEFORE UPDATE ON public.leaderboards
 FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
