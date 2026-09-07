import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Cloud Save Game State to Supabase
 * Falls back safely if Supabase is unconfigured or offline.
 */
export async function cloudSaveGameState(playerId, gameState) {
  if (!supabase || !playerId) {
    return { success: false, reason: 'unconfigured' };
  }

  try {
    const { data, error } = await supabase
      .from('game_saves')
      .upsert({
        player_id: playerId,
        player_name: gameState.playerName || 'Ren',
        hero_class_id: gameState.heroClassId || 'warrior',
        hero_level: gameState.heroLevel || 1,
        core_crystals: gameState.coreCrystals || 0,
        gold: gameState.gold || 0,
        gems: gameState.gems || 0,
        story_chapter: gameState.storyChapter || 1,
        adventurer_rank: gameState.adventurerRank || 'F',
        save_data: gameState,
        updated_at: new Date().toISOString()
      }, { onConflict: 'player_id' });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase] Cloud save error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Cloud Load Game State from Supabase
 */
export async function cloudLoadGameState(playerId) {
  if (!supabase || !playerId) {
    return { success: false, reason: 'unconfigured' };
  }

  try {
    const { data, error } = await supabase
      .from('game_saves')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error) throw error;
    return { success: true, saveData: data?.save_data };
  } catch (err) {
    console.warn('[Supabase] Cloud load error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch Global Leaderboard of Adventurers
 */
export async function fetchLeaderboard(limit = 25) {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .order('core_crystals', { ascending: false })
      .order('floor_reached', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase] Fetch leaderboard error:', err);
    return [];
  }
}

/**
 * Submit / Update Highscore to Supabase
 */
export async function submitScoreToLeaderboard(entry) {
  if (!supabase || !entry.playerId) return false;

  try {
    const { error } = await supabase
      .from('leaderboards')
      .upsert({
        player_id: entry.playerId,
        player_name: entry.playerName || 'Ren',
        hero_class: entry.heroClass || 'warrior',
        hero_level: entry.heroLevel || 1,
        core_crystals: entry.coreCrystals || 0,
        floor_reached: entry.floorReached || 1,
        total_kills: entry.totalKills || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'player_id' });

    return !error;
  } catch (err) {
    console.warn('[Supabase] Submit leaderboard error:', err);
    return false;
  }
}
