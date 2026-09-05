import React from 'react';
import { Skull } from 'lucide-react';

export default function BossHealthBar({ bossName, bossHp, bossMaxHp }) {
  if (bossHp === null || bossHp === undefined || bossHp <= 0) return null;

  const pct = Math.max(0, Math.min(100, (bossHp / bossMaxHp) * 100));

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 w-11/12 max-w-sm pointer-events-none z-20 animate-fade-in">
      <div className="bg-black/75 backdrop-blur-md border border-purple-500/50 rounded-2xl p-2.5 shadow-2xl shadow-purple-900/40">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Skull size={16} className="text-purple-400 animate-pulse" />
            <span className="text-xs font-black font-fantasy text-purple-200 uppercase tracking-wider">
              {bossName || 'DUNGEON OVERLORD'}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-300">
            {bossHp} / {bossMaxHp} HP
          </span>
        </div>

        {/* Outer Bar */}
        <div className="w-full h-3.5 bg-dungeon-950 rounded-full border border-purple-900/60 p-0.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-700 via-purple-500 to-amber-400 rounded-full transition-all duration-150 shadow-inner"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
