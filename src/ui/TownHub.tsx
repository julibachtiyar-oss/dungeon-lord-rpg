import React, { useState } from 'react';
import {
  Coins,
  Gem,
  Swords,
  Shield,
  FlaskConical,
  Compass,
  Home,
  MessageSquare,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { SFX } from '../game/audio/sfx';
import { BGM } from '../game/audio/bgm';

interface Props {
  gold: number;
  coreCrystals: number;
  potions: number;
  weaponTier: number;
  armorTier: number;
  level: number;
  onEnterDungeon: () => void;
  onOpenSanctuary: () => void;
  onBuyPotion: (cost: number) => void;
  onUpgradeWeapon: (costGold: number, costCrystals: number) => void;
  onUpgradeArmor: (costGold: number) => void;
}

export default function TownHub({
  gold,
  coreCrystals,
  potions,
  weaponTier,
  armorTier,
  level,
  onEnterDungeon,
  onOpenSanctuary,
  onBuyPotion,
  onUpgradeWeapon,
  onUpgradeArmor
}: Props) {
  const [activeModal, setActiveModal] = useState<'none' | 'elena' | 'borin' | 'vespera'>('none');
  const [isMuted, setIsMuted] = useState(BGM.getMuted());

  const toggleSound = () => {
    const muted = BGM.toggleMute();
    setIsMuted(muted);
  };

  const weaponUpgradeCostGold = weaponTier * 80;
  const weaponUpgradeCostCrystal = weaponTier >= 2 ? 1 : 0;
  const armorUpgradeCostGold = armorTier * 70;

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden font-sans">
      {/* Background Image of Valenrock Town */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-10 scale-105 transform duration-1000"
        style={{ backgroundImage: "url('/backgrounds/valenrock.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/85 -z-10" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-2">
        {/* Left: Hero Info */}
        <div className="flex items-center gap-2.5 bg-black/70 backdrop-blur-md p-1.5 pr-3 rounded-full border border-amber-500/50 shadow-lg">
          <img
            src="/portraits/hero_warrior.jpg"
            alt="Hero Ren"
            className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-300 font-fantasy">REN</span>
              <span className="text-[9px] font-bold text-black bg-amber-400 px-1 rounded-sm font-mono">
                Lv.{level}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono">
              <span className="text-amber-400">⚔️ T.{weaponTier}</span>
              <span className="text-sky-400">🛡️ T.{armorTier}</span>
            </div>
          </div>
        </div>

        {/* Center: Sound Toggle */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-full bg-black/60 border border-slate-700 text-slate-300 hover:text-amber-400 active:scale-95 transition-all backdrop-blur-md"
          title="Toggle Music"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-amber-400" />}
        </button>

        {/* Right: Currency Badges */}
        <div className="flex items-center gap-2">
          {/* Gold */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/70 border border-amber-500/50 shadow-md backdrop-blur-md">
            <Coins size={13} className="text-yellow-400" />
            <span className="text-xs font-black text-amber-300 font-mono">{gold}</span>
          </div>
          {/* Core Crystals */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-500/60 shadow-md backdrop-blur-md">
            <Gem size={13} className="text-purple-400 animate-pulse" />
            <span className="text-xs font-black text-purple-200 font-mono">{coreCrystals}</span>
          </div>
        </div>
      </div>

      {/* Center Town Facilities & NPCs */}
      <div className="my-auto max-w-sm mx-auto w-full space-y-2.5">
        <div className="text-center space-y-0.5">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest font-mono border border-amber-500/40">
            KOTA VALENROCK
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-fantasy text-slate-100 tracking-wide drop-shadow">
            PUSAT PETUALANG
          </h2>
        </div>

        {/* Facility Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* 1. Elena (Adventurer's Guild) */}
          <button
            onClick={() => {
              SFX.uiTap();
              setActiveModal('elena');
            }}
            className="p-3 rounded-2xl bg-black/65 hover:bg-black/80 border border-amber-500/40 backdrop-blur-md flex items-center gap-3 text-left active:scale-95 transition-all shadow-lg group"
          >
            <img
              src="/portraits/elena.jpg"
              alt="Elena"
              className="w-11 h-11 rounded-xl object-cover border border-amber-400 group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <span className="text-xs font-black text-amber-300 font-fantasy block">GUILD ELENA</span>
              <span className="text-[10px] text-slate-400">Misi & Hadiah Bounty</span>
            </div>
          </button>

          {/* 2. Borin (Blacksmith Forge) */}
          <button
            onClick={() => {
              SFX.uiTap();
              setActiveModal('borin');
            }}
            className="p-3 rounded-2xl bg-black/65 hover:bg-black/80 border border-amber-500/40 backdrop-blur-md flex items-center gap-3 text-left active:scale-95 transition-all shadow-lg group"
          >
            <img
              src="/portraits/borin.jpg"
              alt="Borin"
              className="w-11 h-11 rounded-xl object-cover border border-amber-400 group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <span className="text-xs font-black text-amber-300 font-fantasy block">TEMPA BORIN</span>
              <span className="text-[10px] text-slate-400">Upgrade Senjata & Zirah</span>
            </div>
          </button>

          {/* 3. Vespera (Alchemist) */}
          <button
            onClick={() => {
              SFX.uiTap();
              setActiveModal('vespera');
            }}
            className="p-3 rounded-2xl bg-black/65 hover:bg-black/80 border border-amber-500/40 backdrop-blur-md flex items-center gap-3 text-left active:scale-95 transition-all shadow-lg group"
          >
            <img
              src="/portraits/vespera.jpg"
              alt="Vespera"
              className="w-11 h-11 rounded-xl object-cover border border-amber-400 group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <span className="text-xs font-black text-amber-300 font-fantasy block">TOKO VESPERA</span>
              <span className="text-[10px] text-slate-400">Potion Penyembuh (x{potions})</span>
            </div>
          </button>

          {/* 4. Dungeon Sanctuary (Rumah Pemain) */}
          <button
            onClick={() => {
              SFX.door();
              onOpenSanctuary();
            }}
            className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900 hover:to-indigo-900 border border-purple-400/80 backdrop-blur-md flex items-center gap-3 text-left active:scale-95 transition-all shadow-lg group"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-900/90 border border-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Home size={22} className="text-purple-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-purple-200 font-fantasy block">DUNGEON SAYA</span>
                <Sparkles size={10} className="text-yellow-400" />
              </div>
              <span className="text-[10px] text-purple-300/80">Rumah & Inti Kristal</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Bottom CTA: Enter Dungeon Expedition */}
      <div className="max-w-xs mx-auto w-full pb-3">
        <button
          onClick={() => {
            SFX.door();
            onEnterDungeon();
          }}
          className="group relative w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black text-sm uppercase tracking-wider font-fantasy shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-yellow-200"
        >
          <Compass size={18} className="animate-spin duration-1000" />
          <span>MASUK EKSPEDISI DUNGEON</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Modal: Elena Guild */}
      {activeModal === 'elena' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#131a26] border-2 border-amber-500/70 rounded-3xl p-5 space-y-3 relative shadow-2xl">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3">
              <img src="/portraits/elena.jpg" alt="Elena" className="w-12 h-12 rounded-xl border border-amber-400 object-cover" />
              <div>
                <span className="text-xs font-black text-amber-300 font-fantasy">ELENA (GUILD MASTER)</span>
                <p className="text-[10px] text-slate-400">Penugasan & Hadiah Kuil Emberdeep</p>
              </div>
            </div>
            <p className="text-xs text-slate-200 bg-black/50 p-3 rounded-xl border border-slate-800 leading-relaxed">
              "Ren, setiap lantai di Kuil Emberdeep semakin berbahaya. Kalahkan Ruin Warden di lantai 3 untuk merebut Kristal Inti Utama. Gunakan kristal itu untuk membangun Dungeon Sanctuary milikmu!"
            </p>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-slate-800">
                <span>Misi: Basmi Ruin Warden</span>
                <span className="text-amber-400 font-bold font-mono">+100 EXP • +1 Kristal</span>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase font-fantasy"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal: Borin Blacksmith */}
      {activeModal === 'borin' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#181a24] border-2 border-amber-500/70 rounded-3xl p-5 space-y-3 relative shadow-2xl">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3">
              <img src="/portraits/borin.jpg" alt="Borin" className="w-12 h-12 rounded-xl border border-amber-400 object-cover" />
              <div>
                <span className="text-xs font-black text-amber-300 font-fantasy">BORIN (PANDAI BESI)</span>
                <p className="text-[10px] text-slate-400">Tempa Senjata & Zirah Pelindung</p>
              </div>
            </div>

            {/* Sword Upgrade */}
            <div className="p-3 rounded-2xl bg-black/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Pedang Ksatria (Tier {weaponTier})</span>
                <span className="text-[10px] text-amber-400 font-bold">+{weaponTier * 15}% Serang</span>
              </div>
              <button
                disabled={gold < weaponUpgradeCostGold || coreCrystals < weaponUpgradeCostCrystal}
                onClick={() => {
                  onUpgradeWeapon(weaponUpgradeCostGold, weaponUpgradeCostCrystal);
                  SFX.hitStone();
                }}
                className={`w-full py-2 rounded-xl text-xs font-black uppercase font-fantasy ${
                  gold >= weaponUpgradeCostGold && coreCrystals >= weaponUpgradeCostCrystal
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Upgrade ({weaponUpgradeCostGold} G {weaponUpgradeCostCrystal > 0 ? `+ ${weaponUpgradeCostCrystal} Kristal` : ''})
              </button>
            </div>

            {/* Armor Upgrade */}
            <div className="p-3 rounded-2xl bg-black/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Zirah Pelindung (Tier {armorTier})</span>
                <span className="text-[10px] text-sky-400 font-bold">+{armorTier * 20} Max HP</span>
              </div>
              <button
                disabled={gold < armorUpgradeCostGold}
                onClick={() => {
                  onUpgradeArmor(armorUpgradeCostGold);
                  SFX.hitStone();
                }}
                className={`w-full py-2 rounded-xl text-xs font-black uppercase font-fantasy ${
                  gold >= armorUpgradeCostGold
                    ? 'bg-sky-500 hover:bg-sky-400 text-black'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Upgrade ({armorUpgradeCostGold} G)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Vespera Alchemist */}
      {activeModal === 'vespera' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#161a22] border-2 border-emerald-500/70 rounded-3xl p-5 space-y-3 relative shadow-2xl">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3">
              <img src="/portraits/vespera.jpg" alt="Vespera" className="w-12 h-12 rounded-xl border border-emerald-400 object-cover" />
              <div>
                <span className="text-xs font-black text-emerald-300 font-fantasy">VESPERA (ALKEMIS)</span>
                <p className="text-[10px] text-slate-400">Ramuan Potion Pemulih Jiwa</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlaskConical size={18} className="text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">Healing Potion (+45 HP)</span>
                </div>
                <span className="text-xs text-emerald-300 font-mono">x{potions}/5</span>
              </div>
              <button
                disabled={gold < 40 || potions >= 5}
                onClick={() => {
                  onBuyPotion(40);
                  SFX.potion();
                }}
                className={`w-full py-2 rounded-xl text-xs font-black uppercase font-fantasy ${
                  gold >= 40 && potions < 5
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Beli Ramuan (40 Gold)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
