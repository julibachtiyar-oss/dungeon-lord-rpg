import React, { useState, useRef } from 'react';
import { EventBus } from '../game/events';

export default function VirtualJoystick() {
  const [active, setActive] = useState(false);
  const [basePos, setBasePos] = useState({ x: 0, y: 0 });
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 45;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    touchIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setBasePos({ x, y });
    setKnobPos({ x: 0, y: 0 });
    setActive(true);
    EventBus.emitEvent('input:joystick', { x: 0, y: 0, active: true });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== e.pointerId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;

    let dx = curX - basePos.x;
    let dy = curY - basePos.y;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: dx, y: dy });

    // Deadzone 15% (GDD §3.2)
    const deadzone = maxRadius * 0.15;
    if (dist < deadzone) {
      EventBus.emitEvent('input:joystick', { x: 0, y: 0, active: true });
    } else {
      EventBus.emitEvent('input:joystick', { x: dx / maxRadius, y: dy / maxRadius, active: true });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== e.pointerId) return;
    touchIdRef.current = null;
    setActive(false);
    setKnobPos({ x: 0, y: 0 });
    EventBus.emitEvent('input:joystick', { x: 0, y: 0, active: false });
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="absolute left-0 bottom-0 w-1/2 h-1/2 touch-none select-none z-30"
    >
      {active && (
        <div
          className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-sm pointer-events-none flex items-center justify-center"
          style={{ left: basePos.x, top: basePos.y }}
        >
          <div
            className="w-10 h-10 rounded-full bg-gold-400/80 border border-gold-300 shadow-lg shadow-gold-500/40"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: active ? 'none' : 'transform 0.1s ease-out'
            }}
          />
        </div>
      )}
    </div>
  );
}
