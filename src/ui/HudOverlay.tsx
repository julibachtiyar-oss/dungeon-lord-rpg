import React from 'react';
import { Pause, Coins } from 'lucide-react';
import VirtualJoystick from './VirtualJoystick';
import VirtualButtons from './VirtualButtons';

interface Props {
  stats: { hp: number; maxHp: number; level: number; xp: number; nextXp: number; potions: number };
  gold: number;
  skills: {
    cleaveReady: boolean;
    cleaveCooldownProgress: number;
    bulwarkReady: boolean;
    bulwarkCooldownProgress: number;
    dashReady: boolean;
    dashCooldownProgress: number;
  };
  bossHp: { current: number; max: number; phase: number; name: string } | null;
  roomInfo: { floor: number; roomName: string };
  onPause: () => void;
}

export default function HudOverlay({ stats, gold, skills, bossHp, roomInfo, onPause }: Props) {
  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));

  return (
    <div className="fixed inset-0 pointer-events-none z-20 select-none font-sans overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-3 pt-4 flex items-start justify-between pointer-events-auto">
        {/* Left: Player Health Bar & Level */}
        <div className="space-y-1 w-36 sm:w-44">
          <div className="flex items-center justify-between text-[10px] font-black font-fantasy text-gold-300">
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.2 rounded bg-amber-600/80 text-black font-mono font-black text-[9px]">
                Lv.{stats.level}
              </span>
              <span>KNIGHT</span>
            </div>
            <span className="text-[9px] text-slate-300 font-mono">
              {Math.round(stats.hp)}/{stats.maxHp}
            </span>
          </div>

          <div className="relative w-full h-3.5 bg-black/80 rounded-full border border-red-500/80 overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-red-700 via-rose-500 to-amber-400 rounded-full transition-all duration-100"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Center: Pause Button */}
        <button
          onClick={onPause}
          className="w-8 h-8 rounded-full bg-black/60 border border-slate-700 text-slate-300 flex items-center justify-center active:scale-95 transition-all shadow-md"
        >
          <Pause size={14} />
        </button>

        {/* Right: Gold Counter & Room info */}
        <div className="text-right space-y-0.5">
          <div className="flex items-center justify-end gap-1 px-2.5 py-1 rounded-xl bg-black/60 border border-amber-500/50 shadow-md">
            <Coins size={12} className="text-amber-400" />
            <span className="text-xs font-black text-amber-300 font-mono">{gold}</span>
          </div>
          <span className="text-[9px] text-slate-400 font-bold block truncate max-w-[120px]">
            {roomInfo.roomName || `Lantai ${roomInfo.floor}`}
          </span>
        </div>
      </div>

      {/* Center-Top: Boss HP Bar Overlay */}
      {bossHp && (
        <div className="absolute top-16 inset-x-4 max-w-xs mx-auto text-center space-y-1 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between text-[10px] font-black text-purple-300 uppercase tracking-widest">
            <span>{bossHp.name}</span>
            <span>FASE {bossHp.phase} / 3</span>
          </div>
          <div className="w-full h-3 bg-black/80 rounded-full border border-purple-500 overflow-hidden p-0.5 shadow-lg shadow-purple-900/40">
            <div
              className="h-full bg-gradient-to-r from-purple-700 via-purple-500 to-pink-400 rounded-full transition-all duration-100"
              style={{ width: `${Math.max(0, Math.min(100, (bossHp.current / bossHp.max) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Floating Joystick in Bottom-Left */}
      <VirtualJoystick />

      {/* Action Buttons in Bottom-Right */}
      <VirtualButtons skills={skills} potions={stats.potions} />
    </div>
  );
}
