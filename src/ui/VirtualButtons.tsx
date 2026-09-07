import React from 'react';
import { Swords, Flame, Shield, Wind, FlaskConical } from 'lucide-react';
import { EventBus } from '../game/events';

interface Props {
  skills: {
    cleaveReady: boolean;
    cleaveCooldownProgress: number;
    bulwarkReady: boolean;
    bulwarkCooldownProgress: number;
    dashReady: boolean;
    dashCooldownProgress: number;
  };
  potions: number;
}

export default function VirtualButtons({ skills, potions }: Props) {
  const triggerButton = (action: 'attack' | 'cleave' | 'bulwark' | 'dash' | 'potion') => {
    EventBus.emitEvent('input:button', { action });
  };

  return (
    <div className="absolute right-3 bottom-3 z-30 flex flex-col items-end gap-2.5 select-none touch-none">
      {/* Top Row: Skills S1 & S2 */}
      <div className="flex items-center gap-3">
        {/* S1: Ember Cleave */}
        <button
          onPointerDown={() => triggerButton('cleave')}
          className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-700 to-red-600 border-2 border-amber-400 text-white flex items-center justify-center active:scale-95 shadow-lg overflow-hidden"
        >
          <Flame size={20} />
          {!skills.cleaveReady && (
            <div
              className="absolute inset-0 bg-black/75 pointer-events-none"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${100 * (1 - skills.cleaveCooldownProgress)}% 0%, 100% 100%, 0% 100%, 0% 0%)`
              }}
            />
          )}
        </button>

        {/* S2: Bulwark */}
        <button
          onPointerDown={() => triggerButton('bulwark')}
          className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-700 to-blue-600 border-2 border-cyan-400 text-white flex items-center justify-center active:scale-95 shadow-lg overflow-hidden"
        >
          <Shield size={20} />
          {!skills.bulwarkReady && (
            <div
              className="absolute inset-0 bg-black/75 pointer-events-none"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${100 * (1 - skills.bulwarkCooldownProgress)}% 0%, 100% 100%, 0% 100%, 0% 0%)`
              }}
            />
          )}
        </button>
      </div>

      {/* Bottom Row: Attack A, Dash D, and Potion */}
      <div className="flex items-center gap-3">
        {/* Potion Button */}
        <button
          onPointerDown={() => triggerButton('potion')}
          className="relative w-11 h-11 rounded-full bg-emerald-900 border border-emerald-400 text-emerald-300 flex flex-col items-center justify-center active:scale-95 shadow-md"
        >
          <FlaskConical size={16} />
          <span className="text-[9px] font-black leading-none">x{potions}</span>
        </button>

        {/* D: Dash */}
        <button
          onPointerDown={() => triggerButton('dash')}
          className="relative w-12 h-12 rounded-full bg-purple-900/90 border-2 border-purple-400 text-purple-200 flex items-center justify-center active:scale-95 shadow-md overflow-hidden"
        >
          <Wind size={20} />
          {!skills.dashReady && (
            <div
              className="absolute inset-0 bg-black/75 pointer-events-none"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${100 * (1 - skills.dashCooldownProgress)}% 0%, 100% 100%, 0% 100%, 0% 0%)`
              }}
            />
          )}
        </button>

        {/* A: Primary Combo Attack (56 px diameter) */}
        <button
          onPointerDown={() => triggerButton('attack')}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-gold-500 to-yellow-400 border-2 border-gold-200 text-black flex items-center justify-center active:scale-95 shadow-xl shadow-gold-600/30"
        >
          <Swords size={26} className="fill-black" />
        </button>
      </div>
    </div>
  );
}
