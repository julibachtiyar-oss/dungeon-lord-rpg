// Dungeon Tile & Environment Renderer for Medieval Gothic Visuals

const tileCache = {};
function getTileImage(name, path) {
  if (typeof window === 'undefined') return null;
  if (!tileCache[name]) {
    const img = new Image();
    img.src = path;
    tileCache[name] = img;
  }
  return tileCache[name];
}

export class DungeonTileRenderer {
  // Draw textured room floor with flagstones & ancient runes
  static drawRoom(ctx, room, time) {
    ctx.save();

    const isBoss = room.isBoss;
    const floorImg = getTileImage('floor', '/sprites/floor.png');
    const wallImg = getTileImage('wall', '/sprites/wall.png');

    // 1. Room Floor Base (2D DawnLike Tiles if loaded, else procedural)
    if (floorImg && floorImg.complete && floorImg.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;
      const tileSize = 36;
      const srcTileX = isBoss ? 32 : (room.isStart ? 48 : 0);
      const srcTileY = isBoss ? 32 : (room.isStart ? 16 : 0);

      for (let x = room.x; x < room.x + room.w; x += tileSize) {
        for (let y = room.y; y < room.y + room.h; y += tileSize) {
          const drawW = Math.min(tileSize, room.x + room.w - x);
          const drawH = Math.min(tileSize, room.y + room.h - y);
          ctx.drawImage(floorImg, srcTileX, srcTileY, 16, 16, x, y, drawW, drawH);
        }
      }

      // Tint overlay
      ctx.fillStyle = isBoss ? 'rgba(88, 28, 135, 0.25)' : (room.isStart ? 'rgba(6, 95, 70, 0.2)' : 'rgba(15, 23, 42, 0.25)');
      ctx.fillRect(room.x, room.y, room.w, room.h);
    } else {
      ctx.fillStyle = isBoss ? '#1a1026' : room.isStart ? '#0f231a' : '#141b26';
      ctx.fillRect(room.x, room.y, room.w, room.h);

      ctx.strokeStyle = isBoss ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1.5;

      const tileSize = 40;
      for (let x = room.x; x < room.x + room.w; x += tileSize) {
        for (let y = room.y; y < room.y + room.h; y += tileSize) {
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }
    }

    // 2. 2D Medieval Wall Borders
    if (wallImg && wallImg.complete && wallImg.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;
      const wallSize = 24;
      // Top wall trim
      for (let x = room.x; x < room.x + room.w; x += wallSize) {
        ctx.drawImage(wallImg, 0, 0, 16, 16, x, room.y - 8, wallSize, wallSize);
        ctx.drawImage(wallImg, 0, 0, 16, 16, x, room.y + room.h - 16, wallSize, wallSize);
      }
      // Left and right wall trim
      for (let y = room.y; y < room.y + room.h; y += wallSize) {
        ctx.drawImage(wallImg, 16, 0, 16, 16, room.x - 8, y, wallSize, wallSize);
        ctx.drawImage(wallImg, 16, 0, 16, 16, room.x + room.w - 16, y, wallSize, wallSize);
      }
    }

    // 3. Ancient Runic Summoning Circle for Boss Room
    if (isBoss) {
      const cx = room.x + room.w / 2;
      const cy = room.y + room.h / 2;
      const runeRadius = Math.min(room.w, room.h) * 0.32;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.2); // Slowly rotating circle

      ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, runeRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, runeRadius * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      // Pentagram star
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = (Math.PI * 2 / 5) * i;
        const a2 = (Math.PI * 2 / 5) * ((i + 2) % 5);
        ctx.moveTo(Math.cos(a1) * runeRadius, Math.sin(a1) * runeRadius);
        ctx.lineTo(Math.cos(a2) * runeRadius, Math.sin(a2) * runeRadius);
      }
      ctx.stroke();

      ctx.restore();
    }

    // 4. Thick 3D Gothic Walls
    ctx.strokeStyle = isBoss ? '#581c87' : room.isStart ? '#065f46' : '#334155';
    ctx.lineWidth = 8;
    ctx.strokeRect(room.x, room.y, room.w, room.h);

    // Inner bevel highlight
    ctx.strokeStyle = isBoss ? '#9333ea' : room.isStart ? '#10b981' : '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(room.x + 3, room.y + 3, room.w - 6, room.h - 6);

    ctx.restore();
  }

  // Draw Corridors with textured stone pavers
  static drawCorridor(ctx, corr) {
    ctx.save();

    const floorImg = getTileImage('floor', '/sprites/floor.png');
    if (floorImg && floorImg.complete && floorImg.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;
      const tileSize = 30;
      for (let x = corr.x; x < corr.x + corr.w; x += tileSize) {
        for (let y = corr.y; y < corr.y + corr.h; y += tileSize) {
          const drawW = Math.min(tileSize, corr.x + corr.w - x);
          const drawH = Math.min(tileSize, corr.y + corr.h - y);
          ctx.drawImage(floorImg, 16, 16, 16, 16, x, y, drawW, drawH);
        }
      }
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.fillRect(corr.x, corr.y, corr.w, corr.h);
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillRect(corr.x, corr.y, corr.w, corr.h);

      // Corridor paver seams
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(corr.x, corr.y, corr.w, corr.h);
    }

    // Border stone trims
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(corr.x, corr.y, corr.w, corr.h);

    ctx.restore();
  }

  // Draw Realistic Burning Wall Torch with dynamic light cast
  static drawTorch(ctx, torch, time) {
    ctx.save();
    const flicker = Math.sin(time * 8 + torch.flickerOffset) * 4;

    // 1. Warm Ambient Light Gradient Cast on Surrounding Stones
    const lightGrad = ctx.createRadialGradient(torch.x, torch.y, 4, torch.x, torch.y, 65 + flicker);
    lightGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    lightGrad.addColorStop(0.45, 'rgba(234, 88, 12, 0.16)');
    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.arc(torch.x, torch.y, 70 + flicker, 0, Math.PI * 2);
    ctx.fill();

    // 2. Wrought Iron Sconce Mount
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(torch.x - 3, torch.y - 2, 6, 12);
    ctx.fillStyle = '#78350f'; // Wood torch handle
    ctx.fillRect(torch.x - 2, torch.y - 10, 4, 10);

    // 3. Multi-layer Animated Torch Flame
    // Orange Outer Flame
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(torch.x - 4, torch.y - 9);
    ctx.quadraticCurveTo(torch.x - 6, torch.y - 18 - flicker * 0.5, torch.x, torch.y - 22 - flicker);
    ctx.quadraticCurveTo(torch.x + 6, torch.y - 18 - flicker * 0.5, torch.x + 4, torch.y - 9);
    ctx.closePath();
    ctx.fill();

    // Yellow Hot Flame Core
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(torch.x - 2.5, torch.y - 9);
    ctx.quadraticCurveTo(torch.x - 3, torch.y - 14, torch.x, torch.y - 17 - flicker * 0.5);
    ctx.quadraticCurveTo(torch.x + 3, torch.y - 14, torch.x + 2.5, torch.y - 9);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draw Detailed Medieval Treasure Chest
  static drawChest(ctx, chest) {
    ctx.save();
    ctx.translate(chest.x, chest.y);

    const isOpened = chest.opened;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chest Body (Wood Planks)
    ctx.fillStyle = isOpened ? '#475569' : '#78350f';
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(-14, -8, 28, 18, 4);
    ctx.fill();
    ctx.stroke();

    // Brass/Gold Metal Reinforcement Bands
    ctx.fillStyle = isOpened ? '#64748b' : '#eab308';
    ctx.fillRect(-12, -8, 3.5, 18);
    ctx.fillRect(8.5, -8, 3.5, 18);

    // Arched Lid
    if (isOpened) {
      // Open tilted lid
      ctx.fillStyle = '#334155';
      ctx.fillRect(-14, -18, 28, 8);
      ctx.strokeRect(-14, -18, 28, 8);
    } else {
      // Closed lid with gold latch & keyhole
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(-14, -12, 28, 6);
      ctx.strokeRect(-14, -12, 28, 6);

      // Gold Lock Plate
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-3, -7, 6, 8);
      ctx.strokeRect(-3, -7, 6, 8);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, -3, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
