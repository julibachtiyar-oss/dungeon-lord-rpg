import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Sword, Wand2, Shield, Flame, Zap, FastForward, Heart, Sparkles } from 'lucide-react';

export default function VirtualControls({
  heroClass,
  onMove,
  onAttack,
  onSkill,
  onDash,
  onPotion,
  skillCooldowns = {},
  potionsCount = 3
}) {
  const joystickBaseRef = useRef(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef(null);
  const maxRadius = 45; // Max joystick thumb travel

  // Reset Joystick
  const resetJoystick = useCallback(() => {
    setJoystickActive(false);
    setKnobPos({ x: 0, y: 0 });
    touchIdRef.current = null;
    onMove(0, 0);
  }, [onMove]);

  // Handle Touch Start
  const handleTouchStart = (e) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return;

    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setJoystickActive(true);
    updateJoystickPos(touch.clientX, touch.clientY);
  };

  // Handle Touch Move
  const handleTouchMove = (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  // Update Joystick vector
  const updateJoystickPos = (clientX, clientY) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist <= maxRadius) {
      setKnobPos({ x: dx, y: dy });
      onMove(dx / maxRadius, dy / maxRadius);
    } else {
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * maxRadius;
      const ky = Math.sin(angle) * maxRadius;
      setKnobPos({ x: kx, y: ky });
      onMove(Math.cos(angle), Math.sin(angle));
    }
  };

  // Handle Touch End / Cancel
  const handleTouchEnd = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        resetJoystick();
        break;
      }
    }
  };

  // Keyboard fallbacks for desktop / tablet testing
  useEffect(() => {
    const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };

    const updateFromKeys = () => {
      let x = 0;
      let y = 0;
      if (keys.w || keys.ArrowUp) y -= 1;
      if (keys.s || keys.ArrowDown) y += 1;
      if (keys.a || keys.ArrowLeft) x -= 1;
      if (keys.d || keys.ArrowRight) x += 1;

      if (x !== 0 && y !== 0) {
        x *= 0.7071;
        y *= 0.7071;
      }
      onMove(x, y);
    };

    const handleKeyDown = (e) => {
      if (keys[e.key] !== undefined) {
        keys[e.key] = true;
        updateFromKeys();
      } else if (e.code === 'Space') {
        onAttack();
      } else if (e.key === '1' || e.key.toLowerCase() === 'j') {
        onSkill(0);
      } else if (e.key === '2' || e.key.toLowerCase() === 'k') {
        onSkill(1);
      } else if (e.code === 'ShiftLeft' || e.key.toLowerCase() === 'l') {
        onDash();
      } else if (e.key.toLowerCase() === 'h' || e.key.toLowerCase() === 'q') {
        onPotion();
      }
    };

    const handleKeyUp = (e) => {
      if (keys[e.key] !== undefined) {
        keys[e.key] = false;
        updateFromKeys();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onMove, onAttack, onSkill, onDash, onPotion]);

  const skill1 = heroClass.skills[0];
  const skill2 = heroClass.skills[1];
  const cd1 = Math.ceil(skillCooldowns[0] || 0);
  const cd2 = Math.ceil(skillCooldowns[1] || 0);
  const cdDash = Math.ceil(skillCooldowns.dash || 0);

  return (
    <div className="absolute inset-0 pointer-events-none flex justify-between items-end p-4 pb-6 select-none touch-control-area">
      {/* 1. Left Side: Virtual Analog Joystick */}
      <div className="pointer-events-auto relative pl-2 pb-2">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={resetJoystick}
          className={`w-28 h-28 rounded-full border-2 transition-colors flex items-center justify-center relative ${
            joystickActive
              ? 'bg-black/50 border-gold-500/80 shadow-lg shadow-gold-500/20'
              : 'bg-black/35 border-slate-600/40'
          }`}
          style={{ touchAction: 'none' }}
        >
          {/* Inner Crosshair / Ring */}
          <div className="w-12 h-12 rounded-full border border-white/10" />

          {/* Draggable Knob */}
          <div
            className={`w-12 h-12 rounded-full absolute transition-transform duration-75 flex items-center justify-center ${
              joystickActive
                ? 'bg-gradient-to-tr from-gold-600 to-amber-400 text-black shadow-md'
                : 'bg-slate-400/50 text-white'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
            }}
          >
            <div className="w-3 h-3 rounded-full bg-white/60" />
          </div>
        </div>
        <span className="block text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 opacity-70">
          Gerak / Joystick
        </span>
      </div>

      {/* 2. Right Side: Action Cluster */}
      <div className="pointer-events-auto relative flex flex-col items-end gap-3 pr-2 pb-2">
        {/* Row 1: Potions & Dash */}
        <div className="flex items-center gap-3">
          {/* Quick Potion */}
          <button
            onClick={onPotion}
            className="w-11 h-11 rounded-full bg-blood-600/80 border border-blood-400/60 active:scale-90 transition-transform flex flex-col items-center justify-center shadow-lg relative"
          >
            <Heart size={16} className="text-white fill-white" />
            <span className="text-[9px] font-black text-white leading-none mt-0.5">
              {potionsCount}
            </span>
          </button>

          {/* Dash / Evade */}
          <button
            onClick={onDash}
            disabled={cdDash > 0}
            className={`w-12 h-12 rounded-full border active:scale-90 transition-transform flex flex-col items-center justify-center shadow-lg relative ${
              cdDash > 0
                ? 'bg-slate-800/80 border-slate-700 text-slate-500'
                : 'bg-slate-700/80 border-slate-400 text-white'
            }`}
          >
            <FastForward size={18} />
            <span className="text-[8px] font-bold uppercase tracking-wider">Dash</span>
            {cdDash > 0 && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center font-black text-xs text-amber-400">
                {cdDash}s
              </div>
            )}
          </button>
        </div>

        {/* Row 2: Skill 1, Skill 2, Big Attack */}
        <div className="flex items-end gap-3">
          {/* Skill 1 */}
          <button
            onClick={() => onSkill(0)}
            disabled={cd1 > 0}
            className={`w-13 h-13 rounded-2xl border active:scale-90 transition-transform flex flex-col items-center justify-center shadow-lg relative p-2 ${
              cd1 > 0
                ? 'bg-slate-900/80 border-slate-700 text-slate-600'
                : 'bg-gradient-to-br from-indigo-600/90 to-purple-800/90 border-indigo-400 text-white'
            }`}
          >
            <Zap size={18} />
            <span className="text-[8px] font-bold mt-0.5 truncate max-w-[42px] leading-tight">
              {skill1?.name.split(' ')[0]}
            </span>
            {cd1 > 0 && (
              <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center font-black text-sm text-indigo-300">
                {cd1}s
              </div>
            )}
          </button>

          {/* Skill 2 */}
          <button
            onClick={() => onSkill(1)}
            disabled={cd2 > 0}
            className={`w-13 h-13 rounded-2xl border active:scale-90 transition-transform flex flex-col items-center justify-center shadow-lg relative p-2 ${
              cd2 > 0
                ? 'bg-slate-900/80 border-slate-700 text-slate-600'
                : 'bg-gradient-to-br from-amber-600/90 to-red-700/90 border-amber-400 text-white'
            }`}
          >
            <Flame size={18} />
            <span className="text-[8px] font-bold mt-0.5 truncate max-w-[42px] leading-tight">
              {skill2?.name.split(' ')[0]}
            </span>
            {cd2 > 0 && (
              <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center font-black text-sm text-amber-300">
                {cd2}s
              </div>
            )}
          </button>

          {/* Big Main Attack Button */}
          <button
            onClick={onAttack}
            className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-blood-600 to-amber-500 border-2 border-gold-300 shadow-xl shadow-blood-600/30 active:scale-90 transition-transform flex flex-col items-center justify-center text-white"
          >
            {heroClass.attackType === 'ranged' ? <Wand2 size={26} /> : <Sword size={26} />}
            <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">
              SERANG
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
