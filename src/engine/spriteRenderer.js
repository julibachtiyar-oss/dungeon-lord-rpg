// High-Fidelity Procedural Sprite Engine for Inotia-Grade Mobile RPG

export class SpriteRenderer {
  // Draw Hero with animated cape, armor, helmet, weapon, and attack trail
  static drawHero(ctx, player, heroClass, time) {
    ctx.save();
    ctx.translate(player.x, player.y);

    const isMoving = Math.abs(player.vx || 0) > 0.05 || Math.abs(player.vy || 0) > 0.05 || player.isAttacking;
    const walkBob = isMoving ? Math.sin(time * 12) * 2.5 : Math.sin(time * 3) * 1.0;
    const capeFlutter = Math.sin(time * 8) * 0.18;

    // 1. Soft Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Invulnerability Flicker
    if (player.invulnerableTimer > 0 && Math.floor(time * 30) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    // 2. Flowing Cape (Drawn behind body)
    ctx.save();
    ctx.rotate(player.facingAngle + Math.PI); // Trails behind hero
    ctx.fillStyle = heroClass.id === 'warrior' ? '#7f1d1d' : heroClass.id === 'mage' ? '#1e1b4b' : '#14532d';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.quadraticCurveTo(
      -18 - Math.sin(time * 7) * 4,
      capeFlutter * 20,
      -26,
      -8 + Math.cos(time * 6) * 5
    );
    ctx.quadraticCurveTo(
      -22,
      8 + Math.cos(time * 6) * 5,
      -6,
      6
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. Feet / Armored Boots (Moving cycle)
    const legOffset = isMoving ? Math.sin(time * 12) * 5 : 0;
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;

    // Left Boot
    ctx.fillRect(-9, 10 + legOffset + walkBob, 6, 8);
    ctx.strokeRect(-9, 10 + legOffset + walkBob, 6, 8);
    // Right Boot
    ctx.fillRect(3, 10 - legOffset + walkBob, 6, 8);
    ctx.strokeRect(3, 10 - legOffset + walkBob, 6, 8);

    // 4. Armored Torso / Breastplate
    ctx.save();
    ctx.translate(0, walkBob);

    // Body gradient
    const bodyGrad = ctx.createLinearGradient(-10, -10, 10, 10);
    bodyGrad.addColorStop(0, heroClass.color);
    bodyGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    // Torso armor shape
    ctx.beginPath();
    ctx.moveTo(-11, -6);
    ctx.lineTo(11, -6);
    ctx.lineTo(8, 11);
    ctx.lineTo(-8, 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gold/Steel Breastplate Trim
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-6, -3, 12, 10);

    // Shoulder Pauldrons
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(-12, -4, 5, 0, Math.PI * 2);
    ctx.arc(12, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5. Head / Helmet with Class Visor
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -13, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (heroClass.id === 'warrior') {
      // Horned Dark Knight Helmet Visor
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-5, -14, 10, 3); // Glowing eye slit

      // Horns
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-8, -16);
      ctx.lineTo(-13, -23);
      ctx.moveTo(8, -16);
      ctx.lineTo(13, -23);
      ctx.stroke();
    } else if (heroClass.id === 'mage') {
      // Pointed Archmage Cowl Hood
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(0, -26);
      ctx.lineTo(10, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing Astral Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-3, -13, 1.8, 0, Math.PI * 2);
      ctx.arc(3, -13, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Shadow Assassin Mask
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, -13, 16, 7);

      // Glowing Yellow Assassin Eyes
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(-3, -15, 1.8, 0, Math.PI * 2);
      ctx.arc(3, -15, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 6. Weapon & Dynamic Attack Slash
    ctx.save();
    ctx.rotate(player.facingAngle);

    const atkProgress = player.attackTimer > 0
      ? 1 - player.attackTimer / player.attackDuration
      : 0;

    const swingAngle = player.isAttacking
      ? -Math.PI * 0.4 + atkProgress * Math.PI * 0.8
      : 0;

    ctx.rotate(swingAngle);

    if (heroClass.id === 'warrior') {
      // Dragon Greatsword
      ctx.fillStyle = '#cbd5e1'; // Blade
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;

      // Two-handed blade
      ctx.beginPath();
      ctx.moveTo(12, -3);
      ctx.lineTo(34, -4);
      ctx.lineTo(38, 0); // Tip
      ctx.lineTo(34, 4);
      ctx.lineTo(12, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Rune Glow on Blade
      ctx.fillStyle = player.frenzyTimer > 0 ? '#facc15' : '#ef4444';
      ctx.fillRect(16, -1, 14, 2);

      // Gold Crossguard & Pommel
      ctx.fillStyle = '#facc15';
      ctx.fillRect(10, -7, 3, 14);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(5, -2, 5, 4);
    } else if (heroClass.id === 'mage') {
      // Starlight Staff
      ctx.fillStyle = '#78350f'; // Wood staff
      ctx.fillRect(8, -2, 24, 4);

      // Star Crystal Orb Head
      const orbGrad = ctx.createRadialGradient(32, 0, 2, 32, 0, 9);
      orbGrad.addColorStop(0, '#ffffff');
      orbGrad.addColorStop(0.5, '#38bdf8');
      orbGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(32, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      // Orbital Stardust Rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(32, 0, 11 + Math.sin(time * 10) * 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Dual Assassin Daggers
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;

      // Main Dagger
      ctx.beginPath();
      ctx.moveTo(10, -5);
      ctx.lineTo(24, -7);
      ctx.lineTo(28, -5);
      ctx.lineTo(24, -3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Poison Tip Glow
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(22, -6, 6, 2);

      // Offhand Dagger
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(10, 5);
      ctx.lineTo(22, 7);
      ctx.lineTo(26, 5);
      ctx.lineTo(22, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 7. Energy Blade Crescent Slash Wave (During Attack)
    if (player.isAttacking) {
      const slashGrad = ctx.createRadialGradient(0, 0, 18, 0, 0, 48);
      slashGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      slashGrad.addColorStop(0.5, heroClass.color);
      slashGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');

      ctx.strokeStyle = slashGrad;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, 40, -0.6, 0.6);
      ctx.stroke();
    }

    ctx.restore();

    // 8. Iron Bastion / Shield Bubble
    if (player.ironBastionTimer > 0) {
      ctx.save();
      const shieldPulse = Math.sin(time * 8) * 3;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(249, 115, 22, 0.15)';
      ctx.beginPath();
      ctx.arc(0, 0, 26 + shieldPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Monsters with distinct silhouettes, eyes, and weapons
  static drawMonster(ctx, m, time) {
    ctx.save();
    ctx.translate(m.x, m.y);

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, m.radius * 0.75, m.radius * 0.9, m.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    const isHit = m.flashTimer > 0;

    if (m.type === 'slime') {
      // Slime: Jelly Wobble Body
      const wobbleX = 1 + Math.sin(time * 7 + m.x) * 0.14;
      const wobbleY = 1 - Math.sin(time * 7 + m.x) * 0.14;
      ctx.scale(wobbleX, wobbleY);

      const slimeGrad = ctx.createRadialGradient(0, -4, 2, 0, 0, m.radius);
      slimeGrad.addColorStop(0, isHit ? '#ffffff' : '#86efac');
      slimeGrad.addColorStop(0.7, isHit ? '#ffffff' : '#22c55e');
      slimeGrad.addColorStop(1, isHit ? '#ffffff' : '#15803d');

      ctx.fillStyle = slimeGrad;
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Slime Eyes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(4, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (m.type === 'goblin') {
      // Goblin Scout: Pointy ears, tattered leather, dagger
      const bob = Math.sin(time * 8) * 2;
      ctx.translate(0, bob);

      // Pointy Ears
      ctx.fillStyle = isHit ? '#ffffff' : '#eab308';
      ctx.beginPath();
      ctx.moveTo(-15, -6);
      ctx.lineTo(-5, -3);
      ctx.lineTo(-5, -8);
      ctx.closePath();
      ctx.moveTo(15, -6);
      ctx.lineTo(5, -3);
      ctx.lineTo(5, -8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // Head
      ctx.fillStyle = isHit ? '#ffffff' : '#ca8a04';
      ctx.beginPath();
      ctx.arc(0, -6, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sharp Red Eyes
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(-3, -6, 2, 0, Math.PI * 2);
      ctx.arc(3, -6, 2, 0, Math.PI * 2);
      ctx.fill();

      // Body & Jagged Dagger
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-6, 2, 12, 10);
      ctx.strokeRect(-6, 2, 12, 10);

      // Jagged Copper Blade
      ctx.fillStyle = '#f97316';
      ctx.fillRect(7, 3, 10, 3);
      ctx.strokeRect(7, 3, 10, 3);

    } else if (m.type === 'skeleton_archer') {
      // Skeleton Archer: Skull, ribcage, wooden longbow
      ctx.fillStyle = isHit ? '#ffffff' : '#e2e8f0';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;

      // Skull
      ctx.beginPath();
      ctx.arc(0, -7, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hollow Blue Eye Sockets
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-3, -7, 2, 0, Math.PI * 2);
      ctx.arc(3, -7, 2, 0, Math.PI * 2);
      ctx.fill();

      // Ribcage
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, 3); ctx.lineTo(6, 3);
      ctx.moveTo(-7, 7); ctx.lineTo(7, 7);
      ctx.moveTo(-5, 11); ctx.lineTo(5, 11);
      ctx.stroke();

      // Wooden Bow
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(10, 3, 12, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();

    } else if (m.type === 'orc_berserker') {
      // Orc Berserker: Huge muscles, tusks, spiked battleaxe
      const bob = Math.sin(time * 6) * 2;
      ctx.translate(0, bob);

      // Massive Body
      ctx.fillStyle = isHit ? '#ffffff' : '#7f1d1d';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 2, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Orc Head & Tusks
      ctx.fillStyle = isHit ? '#ffffff' : '#991b1b';
      ctx.beginPath();
      ctx.arc(0, -10, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // White Tusks
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-6, -6); ctx.lineTo(-8, -13); ctx.lineTo(-4, -8);
      ctx.moveTo(6, -6); ctx.lineTo(8, -13); ctx.lineTo(4, -8);
      ctx.fill();

      // Double-Headed Spiked Battleaxe
      ctx.fillStyle = '#475569';
      ctx.fillRect(12, -18, 12, 6);
      ctx.fillRect(12, -2, 12, 6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(15, -22, 4, 32);

    } else if (m.isBoss) {
      // EPIC BOSS: Gargoyle Overlord / Nether Lich with Demonic Wings & Obsidian Horns
      const wingFlap = Math.sin(time * 5) * 0.25;

      // Demonic Bat Wings
      ctx.save();
      ctx.fillStyle = '#3b0764';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;

      // Left Wing
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.quadraticCurveTo(-38 - wingFlap * 15, -35, -45, 0);
      ctx.quadraticCurveTo(-28, 15, -8, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Wing
      ctx.beginPath();
      ctx.moveTo(10, -5);
      ctx.quadraticCurveTo(38 + wingFlap * 15, -35, 45, 0);
      ctx.quadraticCurveTo(28, 15, 8, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Giant Body & Purple Dark Runic Core
      const bossGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, m.radius);
      bossGrad.addColorStop(0, isHit ? '#ffffff' : '#c084fc');
      bossGrad.addColorStop(0.6, isHit ? '#ffffff' : '#581c87');
      bossGrad.addColorStop(1, isHit ? '#ffffff' : '#1e1b4b');

      ctx.fillStyle = bossGrad;
      ctx.strokeStyle = '#facc15'; // Golden Ancient Boss Armor
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Giant Obsidian Horns
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, -18);
      ctx.quadraticCurveTo(-32, -45, -12, -40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(16, -18);
      ctx.quadraticCurveTo(32, -45, 12, -40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Blazing Red Demon Eyes
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(-8, -6, 3.5, 0, Math.PI * 2);
      ctx.arc(8, -6, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Fallback Minion Sprite
      ctx.fillStyle = isHit ? '#ffffff' : (m.color || '#dc2626');
      ctx.beginPath();
      ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Glowing Eyes
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-m.radius * 0.35, -m.radius * 0.2, 3, 0, Math.PI * 2);
      ctx.arc(m.radius * 0.35, -m.radius * 0.2, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health Bar & Name Display
    const barW = Math.max(32, m.radius * 2.2);
    const barH = m.isBoss ? 6 : 4;
    const barY = -m.radius - (m.isBoss ? 22 : 12);
    const hpPct = Math.max(0, m.hp / m.maxHp);

    if (m.isBoss) {
      ctx.font = "bold 11px 'Cinzel', serif";
      ctx.fillStyle = '#facc15';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 4;
      ctx.fillText(`👑 ${m.name}`, 0, barY - 6);
      ctx.shadowBlur = 0;
    }

    // HP Bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(-barW / 2, barY, barW, barH);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-barW / 2, barY, barW, barH);

    // HP Bar fill
    ctx.fillStyle = m.isBoss ? '#c084fc' : '#ef4444';
    ctx.fillRect(-barW / 2, barY, barW * hpPct, barH);

    ctx.restore();
  }

  // Draw Mercenary Companion with companion crown/badge
  static drawMercenary(ctx, merc, time) {
    ctx.save();
    ctx.translate(merc.x, merc.y);

    // Soft Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 15, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = Math.sin(time * 9) * 2;
    ctx.translate(0, bob);

    // Body
    ctx.fillStyle = merc.color;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-3, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(3, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Mercenary Companion Crown Badge
    ctx.fillStyle = '#facc15';
    ctx.font = "bold 9px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('★ ' + merc.name.split(' ')[0], 0, -18);

    // Mini HP bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-14, -15, 28, 3.5);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-14, -15, 28 * Math.max(0, merc.hp / merc.maxHp), 3.5);

    // Comic Battle Shout Speech Bubble
    if (merc.speechBubble) {
      ctx.save();
      ctx.font = "bold 9px 'Plus Jakarta Sans', sans-serif";
      const txtW = ctx.measureText(merc.speechBubble).width;
      const bubbleW = txtW + 12;
      const bubbleH = 16;
      const bubbleY = -38;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;

      // Rounded bubble body
      ctx.beginPath();
      ctx.roundRect(-bubbleW / 2, bubbleY, bubbleW, bubbleH, 5);
      ctx.fill();
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(-3, bubbleY + bubbleH);
      ctx.lineTo(0, bubbleY + bubbleH + 4);
      ctx.lineTo(3, bubbleY + bubbleH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(merc.speechBubble, 0, bubbleY + 11);
      ctx.restore();
    }

    ctx.restore();
  }
}
