import React, { useState, useEffect } from 'react';
import { Pause, Coins, Volume2, VolumeX, MapPin, Compass } from 'lucide-react';
import VirtualJoystick from './VirtualJoystick';
import VirtualButtons from './VirtualButtons';
import { BGM } from '../game/audio/bgm';
import { EventBus } from '../game/events';

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
  const [isMuted, setIsMuted] = useState(BGM.getMuted());
  const [mapData, setMapData] = useState<{
    playerX: number;
    playerY: number;
    floor: number;
    bounds: { minX: number; minY: number; maxX: number; maxY: number };
    rooms: Array<{ id: string; x: number; y: number; w: number; h: number; isExit?: boolean }>;
    enemiesCount: number;
    portalReady: boolean;
  } | null>(null);

  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const xpPercent = Math.max(0, Math.min(100, (stats.xp / Math.max(1, stats.nextXp)) * 100));

  useEffect(() => {
    const onMap = (data: any) => setMapData(data);
    EventBus.onEvent('dungeon:map', onMap);
    return () => {
      EventBus.offEvent('dungeon:map', onMap);
    };
  }, []);

  const toggleSound = () => {
    const muted = BGM.toggleMute();
    setIsMuted(muted);
  };

  // Calculate minimap normalized coordinates (0..56px)
  const mapW = 60;
  const mapH = 60;
  let px = 30;
  let py = 30;
  if (mapData && mapData.bounds) {
    const bw = Math.max(1, mapData.bounds.maxX - mapData.bounds.minX);
    const bh = Math.max(1, mapData.bounds.maxY - mapData.bounds.minY);
    px = Math.max(4, Math.min(mapW - 4, ((mapData.playerX - mapData.bounds.minX) / bw) * mapW));
    py = Math.max(4, Math.min(mapH - 4, ((mapData.playerY - mapData.bounds.minY) / bh) * mapH));
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-20 select-none font-sans overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-2.5 pt-3 flex items-start justify-between pointer-events-auto">
        {/* Left: Player Avatar + HP & XP Bar */}
        <div className="flex items-center gap-2">
          {/* Avatar frame */}
          <div className="relative">
            <img
              src="/portraits/hero_warrior.jpg"
              alt="Hero"
              className="w-11 h-11 rounded-xl object-cover border-2 border-amber-400 shadow-xl shadow-amber-950/50"
            />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-black font-mono text-[9px] border border-amber-200 shadow">
              Lv.{stats.level}
            </span>
          </div>

          {/* Health & XP */}
          <div className="space-y-1 w-28 sm:w-40">
            <div className="flex items-center justify-between text-[10px] font-black font-fantasy text-amber-300 drop-shadow">
              <span>REN</span>
              <span className="font-mono text-slate-200 text-[9px]">{Math.round(stats.hp)}/{stats.maxHp}</span>
            </div>

            {/* Health Bar */}
            <div className="relative w-full h-2.5 bg-black/80 rounded-full border border-red-500/80 overflow-hidden p-0.5 shadow-md shadow-red-950/40">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            {/* XP Bar */}
            <div className="relative w-full h-1.5 bg-black/80 rounded-full border border-sky-500/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 rounded-full transition-all duration-200"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Audio & Pause Controls */}
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-slate-700/80 shadow-lg">
          <button
            onClick={toggleSound}
            className="w-7 h-7 rounded-full text-slate-300 hover:text-amber-400 flex items-center justify-center active:scale-95 transition-all"
            title="Mute / Unmute"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-amber-400" />}
          </button>
          <button
            onClick={onPause}
            className="w-7 h-7 rounded-full text-slate-300 hover:text-amber-400 flex items-center justify-center active:scale-95 transition-all"
            title="Pause Game"
          >
            <Pause size={14} />
          </button>
        </div>

        {/* Right: Gold Counter & Minimap Radar */}
        <div className="flex flex-col items-end gap-1.5">
          {/* Gold Badge */}
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/70 border border-amber-500/60 shadow backdrop-blur-md">
            <Coins size={12} className="text-yellow-400" />
            <span className="text-xs font-black text-amber-300 font-mono">{gold}</span>
          </div>

          {/* Dungeon Radar Minimap */}
          <div className="relative w-[60px] h-[60px] bg-black/80 border-2 border-amber-500/60 rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
            {/* Render mini rooms */}
            {mapData && mapData.bounds && mapData.rooms.map((r) => {
              const bw = Math.max(1, mapData.bounds.maxX - mapData.bounds.minX);
              const bh = Math.max(1, mapData.bounds.maxY - mapData.bounds.minY);
              const rx = ((r.x - mapData.bounds.minX) / bw) * mapW;
              const ry = ((r.y - mapData.bounds.minY) / bh) * mapH;
              const rw = Math.max(4, (r.w / bw) * mapW);
              const rh = Math.max(4, (r.h / bh) * mapH);

              return (
                <div
                  key={r.id}
                  className={`absolute border ${r.isExit ? 'border-purple-400 bg-purple-900/40' : 'border-slate-600 bg-slate-800/40'}`}
                  style={{ left: rx, top: ry, width: rw, height: rh }}
                />
              );
            })}

            {/* Exit Portal Indicator */}
            {mapData?.portalReady && (
              <div className="absolute right-1 bottom-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}

            {/* Player Blip */}
            <div
              className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400 border border-black shadow-[0_0_6px_rgba(250,204,21,1)] animate-pulse"
              style={{ left: px, top: py }}
            />
          </div>

          {/* Floor & Objective Badge */}
          <div className="text-[9px] font-bold text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-500/40 tracking-wider font-mono">
            {mapData?.portalReady ? (
              <span className="text-emerald-400 animate-pulse">TANGGA TERBUKA!</span>
            ) : (
              <span>{mapData ? `${mapData.enemiesCount} MONSTER` : `LT.${roomInfo.floor}`}</span>
            )}
          </div>
        </div>
      </div>

      {/* Center-Top: Boss HP Bar Overlay */}
      {bossHp && (
        <div className="absolute top-16 inset-x-4 max-w-xs sm:max-w-sm mx-auto text-center space-y-1 animate-fade-in pointer-events-auto bg-black/75 backdrop-blur-md p-2.5 rounded-2xl border-2 border-purple-500/80 shadow-2xl shadow-purple-950">
          <div className="flex items-center justify-between text-[11px] font-black font-fantasy text-purple-200 tracking-wider">
            <span>{bossHp.name}</span>
            <span className="text-amber-400 font-mono text-[9px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-500/50">
              FASE {bossHp.phase} / 3
            </span>
          </div>
          <div className="w-full h-3.5 bg-black/90 rounded-full border border-purple-500 overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-700 via-pink-600 to-amber-400 rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
              style={{ width: `${Math.max(0, Math.min(100, (bossHp.current / bossHp.max) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Desktop Keybinds Helper */}
      <div className="hidden sm:flex absolute bottom-2 inset-x-0 justify-center pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-black/75 border border-slate-700 text-[10px] text-slate-300 font-mono backdrop-blur-md flex items-center gap-3">
          <span><b className="text-amber-400">[WASD]</b> Gerak</span>
          <span><b className="text-amber-400">[SPASI / Klik]</b> Serang</span>
          <span><b className="text-amber-400">[Q/K]</b> Cleave</span>
          <span><b className="text-amber-400">[E/L]</b> Bulwark</span>
          <span><b className="text-amber-400">[SHIFT]</b> Dash</span>
          <span><b className="text-amber-400">[R/P]</b> Potion</span>
        </div>
      </div>

      {/* Touch Joystick (Left Half) */}
      <div className="pointer-events-auto">
        <VirtualJoystick />
      </div>

      {/* Touch Action Buttons (Right Half) */}
      <div className="pointer-events-auto">
        <VirtualButtons skills={skills} potions={stats.potions} />
      </div>
    </div>
  );
}
