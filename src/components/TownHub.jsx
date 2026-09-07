import React, { useState } from 'react';
import { 
  Building2, 
  Hammer, 
  FlaskConical, 
  Scroll, 
  Compass, 
  Key, 
  Volume2, 
  Sparkles, 
  Coins, 
  Gem, 
  ShieldAlert, 
  Flame, 
  Crown,
  ChevronRight,
  User,
  Heart,
  Zap,
  Info,
  Layers
} from 'lucide-react';
import { sound } from '../engine/soundEngine';

export default function TownHub({
  gameState,
  heroClass,
  totalStats,
  onEnterDungeon,
  onGoToSanctuary,
  onOpenInventory,
  onOpenTalentTree,
  onOpenBountyBoard,
  onOpenAudioSettings,
  onOpenClassSelect,
  onBuyPotions,
  onAdvanceStory,
  onStartStoryDialogue
}) {
  const [activeTab, setActiveTab] = useState('hub'); // 'hub' | 'guild' | 'forge' | 'alchemy'

  // Dialog Elena
  const handleTalkToElena = () => {
    sound.playEquipItem();
    if (gameState.storyChapter <= 1) {
      onStartStoryDialogue([
        {
          speaker: 'Elena (Resepsionis)',
          avatarImg: '/portraits/elena.jpg',
          avatarColor: '#22c55e',
          text: `Halo ${gameState.playerName}! Selamat datang di Adventurer's Guild Kota Valenrock. Pendaftaranmu sebagai Petualang Rank F telah resmi tercatat!`
        },
        {
          speaker: 'Elena (Resepsionis)',
          avatarImg: '/portraits/elena.jpg',
          avatarColor: '#22c55e',
          text: 'Sebagai misi perdanilmu, pergilah ke [Gerbang Ekspedisi] dan selidiki "Whispering Ruins". Hati-hati, ada penjaga batu kuno di dalamnya!'
        }
      ]);
    } else {
      onStartStoryDialogue([
        {
          speaker: 'Elena (Resepsionis)',
          avatarImg: '/portraits/elena.jpg',
          avatarColor: '#22c55e',
          text: `Luar biasa, ${gameState.playerName}! Berita kemenanganmu di Whispering Ruins sudah sampai ke Guild! Reputasimu semakin disegani di Valenrock.`
        },
        {
          speaker: 'Elena (Resepsionis)',
          avatarImg: '/portraits/elena.jpg',
          avatarColor: '#22c55e',
          text: 'Kabarnya reruntuhan itu kini sunyi... (Elena tersenyum). Teruslah berpetualang dan taklukkan dungeon-dungeon yang lebih dalam!'
        }
      ]);
    }
  };

  // Dialog Borin
  const handleTalkToBorin = () => {
    sound.playEquipItem();
    onStartStoryDialogue([
      {
        speaker: 'Borin (Pandai Besi)',
        avatarImg: '/portraits/borin.jpg',
        avatarColor: '#ea580c',
        text: 'Hahaha! Selamat datang di bengkelku, bocah! Paluku selalu siap menempa senjatamu hingga level +10 dan menanam batu permata langka!'
      },
      {
        speaker: 'Borin (Pandai Besi)',
        avatarImg: '/portraits/borin.jpg',
        avatarColor: '#ea580c',
        text: 'Bawa pecahan batu kristal dan koin emas dari dungeon, akan kubuat senjatamu bersinar memancarkan aura dewa perang!'
      }
    ]);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-dungeon-950 text-white flex flex-col justify-between overflow-x-hidden select-none font-sans">
      {/* Background Town Graphic with Parallax Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/backgrounds/valenrock.jpg"
          alt="Valenrock Town"
          className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-105"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dungeon-950 via-black/40 to-black/75" />
      </div>

      {/* TOP HEADER: Inotia Ornate Status Bar */}
      <header className="relative z-10 p-3 sm:p-4 bg-black/60 backdrop-blur-md border-b border-gold-500/30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Character Identity */}
          <div className="flex items-center gap-2.5">
            <div 
              onClick={onOpenClassSelect}
              className="w-12 h-12 rounded-2xl border-2 border-gold-400 overflow-hidden shadow-lg shadow-gold-950/60 bg-dungeon-900 cursor-pointer active:scale-95 transition-all shrink-0 relative"
            >
              <img
                src="/portraits/hero_warrior.jpg"
                alt="Avatar"
                className="w-full h-full object-cover object-top"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-black text-gold-400 text-center py-0.5">
                Lv.{gameState.heroLevel}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black font-fantasy text-white tracking-wide">
                  {gameState.playerName || 'Ren'}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-purple-900/80 border border-purple-400 text-[9px] font-black text-purple-200">
                  RANK {gameState.adventurerRank || 'F'}
                </span>
              </div>
              <div className="text-[10px] text-gold-400 font-bold flex items-center gap-1">
                <span>{heroClass.name}</span>
                <span className="text-slate-400">• Kota Valenrock</span>
              </div>
            </div>
          </div>

          {/* Currencies Pill */}
          <div className="flex items-center gap-2">
            {/* Core Crystals */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-400 shadow-md">
              <Sparkles size={12} className="text-purple-300 animate-pulse" />
              <div className="text-right leading-none">
                <div className="text-[8px] text-purple-300 font-bold">INTI</div>
                <div className="text-xs font-black text-white">{gameState.coreCrystals || 0}</div>
              </div>
            </div>

            {/* Gold */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500 shadow-md">
              <Coins size={12} className="text-amber-400" />
              <div className="text-right leading-none">
                <div className="text-[8px] text-amber-300 font-bold">GOLD</div>
                <div className="text-xs font-black text-amber-300">{gameState.gold.toLocaleString()}</div>
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={onOpenAudioSettings}
              className="w-8 h-8 rounded-xl bg-dungeon-800 border border-gold-500/40 text-gold-400 flex items-center justify-center active:scale-95 transition-all hover:bg-dungeon-700"
            >
              <Volume2 size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* CENTER: Valenrock Town Hub Interactive Landmark Cards */}
      <main className="relative z-10 flex-1 p-4 max-w-4xl mx-auto w-full flex flex-col justify-center space-y-4">
        {/* Banner Selamat Datang */}
        <div className="text-center space-y-1 drop-shadow-md">
          <span className="px-3 py-0.5 rounded-full bg-gold-500/20 border border-gold-400/50 text-[10px] font-black text-gold-300 uppercase tracking-widest">
            IBUKOTA SERIKAT PETUALANG
          </span>
          <h1 className="text-xl sm:text-2xl font-black font-fantasy text-white tracking-wider">
            KOTA VALENROCK
          </h1>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Pusat peradaban para pemburu dungeon. Temui Elena di Guild, tempa senjatamu pada Borin, atau terjun ke dungeon liar!
          </p>
        </div>

        {/* 6 Landmark Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {/* 1. ADVENTURER'S GUILD (ELENA) */}
          <div
            onClick={handleTalkToElena}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/90 to-dungeon-900/90 border-2 border-emerald-500/60 shadow-xl cursor-pointer active:scale-95 transition-all hover:border-emerald-400 flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <Building2 size={20} />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 uppercase">
                Elena
              </span>
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                Serikat Petualang
              </div>
              <div className="text-[10px] text-slate-300 line-clamp-1">
                Lapor misi & bicara dengan Elena
              </div>
            </div>
          </div>

          {/* 2. BORIN'S FORGE (BLACKSMITH) */}
          <div
            onClick={() => {
              handleTalkToBorin();
              setTimeout(() => onOpenInventory(), 1200);
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/90 to-dungeon-900/90 border-2 border-amber-500/60 shadow-xl cursor-pointer active:scale-95 transition-all hover:border-amber-400 flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400">
                <Hammer size={20} />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 uppercase">
                Borin
              </span>
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                Bengkel Tempa (+10)
              </div>
              <div className="text-[10px] text-slate-300 line-clamp-1">
                Tempa senjata & pasang permata
              </div>
            </div>
          </div>

          {/* 3. ALCHEMY POTION SHOP */}
          <div
            onClick={() => {
              sound.playEquipItem();
              onBuyPotions(3, 50);
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-950/90 to-dungeon-900/90 border-2 border-teal-500/60 shadow-xl cursor-pointer active:scale-95 transition-all hover:border-teal-400 flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-400">
                <FlaskConical size={20} />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-300">
                {gameState.potionsCount || 0} Pcs
              </span>
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-teal-300 transition-colors">
                Kedai Ramuan
              </div>
              <div className="text-[10px] text-slate-300 line-clamp-1">
                Beli 3 Potion (50 Gold)
              </div>
            </div>
          </div>

          {/* 4. BOUNTY BOARD */}
          <div
            onClick={onOpenBountyBoard}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-yellow-950/90 to-dungeon-900/90 border-2 border-yellow-500/60 shadow-xl cursor-pointer active:scale-95 transition-all hover:border-yellow-400 flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-400">
                <Scroll size={20} />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-yellow-500/30 text-yellow-300">
                Bounty
              </span>
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-yellow-300 transition-colors">
                Papan Hadiah Pemburu
              </div>
              <div className="text-[10px] text-slate-300 line-clamp-1">
                Klaim hadiah buruan monster
              </div>
            </div>
          </div>

          {/* 5. WILD EXPEDITION GATES (DUNGEON LIAR) */}
          <div
            onClick={onEnterDungeon}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-blood-950/90 to-dungeon-900/90 border-2 border-blood-500 shadow-xl cursor-pointer active:scale-95 transition-all hover:border-blood-400 flex flex-col justify-between space-y-2 group ring-2 ring-blood-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blood-500/30 border border-blood-400 flex items-center justify-center text-blood-400 animate-pulse">
                <Compass size={20} />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blood-600 text-white uppercase">
                Petualangan
              </span>
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-blood-300 transition-colors">
                Gerbang Ekspedisi
              </div>
              <div className="text-[10px] text-slate-300 line-clamp-1">
                Taklukkan dungeon & rebut Kristal Inti!
              </div>
            </div>
          </div>

          {/* 6. SECRET DUNGEON HOME PORTAL (RUMAH SANCTUARY) */}
          <div
            onClick={() => {
              if (gameState.dungeonHomeUnlocked || gameState.storyChapter >= 2) {
                onGoToSanctuary();
              } else {
                sound.playEquipItem();
                onStartStoryDialogue([
                  {
                    speaker: 'Portal Gaib (Terkunci)',
                    avatar: '🔒',
                    avatarColor: '#a855f7',
                    text: 'Portal ruang bawah tanah ini masih tertutup kabut tebal. Kalahkan Bos "Ruin Golem" di Whispering Ruins (Lantai 1) untuk mengikat Kristal Inti dan membuka rumah bawah tanahmu!'
                  }
                ]);
              }
            }}
            className={`p-3.5 rounded-2xl border-2 shadow-xl cursor-pointer active:scale-95 transition-all flex flex-col justify-between space-y-2 group ${
              gameState.dungeonHomeUnlocked || gameState.storyChapter >= 2
                ? 'bg-gradient-to-br from-purple-950/90 to-dungeon-900/90 border-purple-500 hover:border-purple-400 ring-2 ring-purple-500/30'
                : 'bg-black/50 border-dungeon-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300">
                <Crown size={20} />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white">
                {gameState.dungeonHomeUnlocked || gameState.storyChapter >= 2 ? 'Rumah Kita' : 'Terkunci'}
              </span>
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-purple-300 transition-colors">
                Rumah Dungeon (Sanctuary)
              </div>
              <div className="text-[10px] text-slate-300 line-clamp-1">
                {gameState.dungeonHomeUnlocked || gameState.storyChapter >= 2
                  ? 'Kunjungi Vespera & bangun dungeon'
                  : 'Buka setelah Misi 1 selesai'}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM ACTION BAR: Equipment, Talents & Fast Travel */}
      <footer className="relative z-10 p-3 bg-black/80 backdrop-blur-md border-t border-gold-500/30">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
          <button
            onClick={onOpenInventory}
            className="py-2.5 rounded-2xl bg-dungeon-800 hover:bg-dungeon-700 border border-dungeon-700 text-center active:scale-95 transition-all shadow-md"
          >
            <div className="text-[10px] font-black text-gold-400 uppercase">🎒 TAS</div>
            <div className="text-[8px] text-slate-400">Perlengkapan</div>
          </button>

          <button
            onClick={onOpenTalentTree}
            className="py-2.5 rounded-2xl bg-dungeon-800 hover:bg-dungeon-700 border border-dungeon-700 text-center active:scale-95 transition-all shadow-md relative"
          >
            {gameState.talentPoints > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blood-600 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                {gameState.talentPoints}
              </span>
            )}
            <div className="text-[10px] font-black text-cyan-400 uppercase">⚡ TALENT</div>
            <div className="text-[8px] text-slate-400">Pohon Bakat</div>
          </button>

          <button
            onClick={() => {
              if (gameState.dungeonHomeUnlocked || gameState.storyChapter >= 2) {
                onGoToSanctuary();
              } else {
                onTalkToElena();
              }
            }}
            className="py-2.5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-400 text-center active:scale-95 transition-all shadow-md"
          >
            <div className="text-[10px] font-black text-purple-200 uppercase">🔮 RUMAH</div>
            <div className="text-[8px] text-purple-300">Dungeon Inti</div>
          </button>

          <button
            onClick={onEnterDungeon}
            className="py-2.5 rounded-2xl bg-gradient-to-r from-blood-700 to-rose-700 border border-blood-400 text-center active:scale-95 transition-all shadow-md"
          >
            <div className="text-[10px] font-black text-white uppercase">⚔️ EXPEDISI</div>
            <div className="text-[8px] text-rose-200">Masuk Gua</div>
          </button>
        </div>
      </footer>
    </div>
  );
}
