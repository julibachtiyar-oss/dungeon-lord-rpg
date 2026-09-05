import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, Zap, Smartphone, Sparkles, Copy, Check, Upload, Download, RotateCcw, ShieldCheck } from 'lucide-react';
import { sound } from '../engine/soundEngine';

export default function AudioSettingsModal({ isOpen, onClose }) {
  const [bgmVol, setBgmVol] = useState(Math.round(sound.bgmVolume * 100));
  const [sfxVol, setSfxVol] = useState(Math.round(sound.sfxVolume * 100));
  const [isMuted, setIsMuted] = useState(sound.muted);
  const [haptics, setHaptics] = useState(sound.hapticsEnabled);

  // Save/Load states
  const [copied, setCopied] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [showSaveSection, setShowSaveSection] = useState(false);

  if (!isOpen) return null;

  const handleBgmChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setBgmVol(val);
    sound.setBGMVolume(val / 100);
  };

  const handleSfxChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSfxVol(val);
    sound.setSFXVolume(val / 100);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const handleToggleHaptics = () => {
    const next = !haptics;
    setHaptics(next);
    sound.setHapticsEnabled(next);
    if (next) sound.vibrate([40, 20, 60]);
  };

  const handleTestSfx = () => {
    sound.playCriticalHit();
  };

  const handleTestBgm = () => {
    sound.playBGM('boss');
    setTimeout(() => sound.playBGM('sanctuary'), 3500);
  };

  const handleExportSave = () => {
    try {
      const raw = localStorage.getItem('DUNGEON_LORD_INOTIA_SAVE_V2');
      if (!raw) {
        setSaveStatus({ type: 'error', text: 'Belum ada data progres tersimpan.' });
        return;
      }
      const b64 = btoa(unescape(encodeURIComponent(raw)));
      navigator.clipboard.writeText(b64);
      setCopied(true);
      setSaveStatus({ type: 'success', text: 'Kode cadangan berhasil disalin ke clipboard!' });
      sound.playCoinCollect();
      setTimeout(() => setCopied(false), 3500);
    } catch {
      setSaveStatus({ type: 'error', text: 'Gagal mengekspor data simpanan.' });
    }
  };

  const handleImportSave = () => {
    if (!importCode.trim()) {
      setSaveStatus({ type: 'error', text: 'Silakan tempelkan kode cadangan terlebih dahulu.' });
      return;
    }
    try {
      const decoded = decodeURIComponent(escape(atob(importCode.trim())));
      const parsed = JSON.parse(decoded);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Format salah');
      }
      localStorage.setItem('DUNGEON_LORD_INOTIA_SAVE_V2', decoded);
      sound.playLevelUp();
      setSaveStatus({ type: 'success', text: 'Akun berhasil dipulihkan! Memuat ulang game...' });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch {
      setSaveStatus({ type: 'error', text: 'Kode cadangan tidak valid atau rusak.' });
    }
  };

  const handleResetGame = () => {
    if (window.confirm('PERINGATAN: Seluruh progres karakter, item, dungeon, dan talent akan direset ke awal. Anda yakin?')) {
      localStorage.removeItem('DUNGEON_LORD_INOTIA_SAVE_V2');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-dungeon-900 border-2 border-gold-500/60 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dungeon-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gold-500/20 border border-gold-400 text-gold-400 flex items-center justify-center">
              <Volume2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black font-fantasy text-white tracking-wide">
                PENGATURAN & AKUN
              </h2>
              <p className="text-[10px] text-gold-400 font-semibold">Chiptune Audio 2.0 & Cloud Save</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-dungeon-800 text-slate-300 flex items-center justify-center active:scale-95 transition-all hover:bg-dungeon-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Master Mute Toggle */}
        <div className="p-3 rounded-2xl bg-black/40 border border-dungeon-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isMuted ? <VolumeX size={18} className="text-blood-400" /> : <Volume2 size={18} className="text-emerald-400" />}
            <div>
              <span className="text-xs font-black text-white block">Suara Keseluruhan</span>
              <span className="text-[9px] text-slate-400">{isMuted ? 'Mati (Hening)' : 'Aktif (Normal)'}</span>
            </div>
          </div>
          <button
            onClick={handleToggleMute}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all shadow-md active:scale-95 ${
              isMuted ? 'bg-blood-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isMuted ? 'BUNGKAM' : 'HIDUP'}
          </button>
        </div>

        {/* BGM Volume Slider */}
        <div className="p-3 rounded-2xl bg-black/30 border border-dungeon-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Music size={14} className="text-amber-400" />
              Volume Musik Latar (BGM)
            </span>
            <span className="text-xs font-black text-amber-400">{bgmVol}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={bgmVol}
            onChange={handleBgmChange}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* SFX Volume Slider */}
        <div className="p-3 rounded-2xl bg-black/30 border border-dungeon-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400" />
              Volume Efek Suara (SFX)
            </span>
            <span className="text-xs font-black text-cyan-400">{sfxVol}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sfxVol}
            onChange={handleSfxChange}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Haptics Toggle */}
        <div className="p-3 rounded-2xl bg-black/30 border border-dungeon-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-purple-400" />
            <div>
              <span className="text-xs font-bold text-white block">Getaran Haptik HP</span>
              <span className="text-[9px] text-slate-400">Getar saat tebasan pedang & critical</span>
            </div>
          </div>
          <button
            onClick={handleToggleHaptics}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all shadow-md active:scale-95 ${
              haptics ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'
            }`}
          >
            {haptics ? 'AKTIF' : 'MATI'}
          </button>
        </div>

        {/* Audio Sample Test Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleTestBgm}
            className="py-2 rounded-xl bg-dungeon-800 hover:bg-dungeon-700 border border-dungeon-700 text-[10px] font-black uppercase text-amber-300 flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md"
          >
            <Music size={12} />
            <span>Tes BGM Boss</span>
          </button>
          <button
            onClick={handleTestSfx}
            className="py-2 rounded-xl bg-dungeon-800 hover:bg-dungeon-700 border border-dungeon-700 text-[10px] font-black uppercase text-cyan-300 flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md"
          >
            <Zap size={12} />
            <span>Tes SFX Crit</span>
          </button>
        </div>

        {/* Save / Restore Cloud Backup Section */}
        <div className="pt-2 border-t border-dungeon-800 space-y-3">
          <button
            onClick={() => setShowSaveSection(!showSaveSection)}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-gold-950/40 to-dungeon-800/40 border border-gold-500/30 text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-gold-400" />
              <div>
                <div className="text-xs font-black text-white">Cadangan & Pulihkan Akun</div>
                <div className="text-[9px] text-slate-400">Pindahkan progres ke HP lain dengan kode</div>
              </div>
            </div>
            <span className="text-xs text-gold-400 font-bold">{showSaveSection ? '▲' : '▼'}</span>
          </button>

          {showSaveSection && (
            <div className="p-3 rounded-2xl bg-black/50 border border-dungeon-700 space-y-3 animate-fade-in">
              {saveStatus && (
                <div
                  className={`text-[11px] p-2 rounded-xl font-bold flex items-center gap-1.5 ${
                    saveStatus.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                      : 'bg-blood-950/60 border border-blood-500/40 text-blood-300'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>{saveStatus.text}</span>
                </div>
              )}

              {/* Export Button */}
              <div>
                <button
                  onClick={handleExportSave}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-amber-600 hover:from-gold-500 hover:to-amber-500 text-black text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Kode Tersalin ke Clipboard!' : 'Salin Kode Cadangan (Export)'}</span>
                </button>
                <span className="text-[9px] text-slate-400 block mt-1 text-center">
                  Simpan kode ini di catatan Anda untuk memulihkan akun kapan saja.
                </span>
              </div>

              {/* Import Section */}
              <div className="space-y-1.5 pt-2 border-t border-dungeon-800">
                <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                  <Upload size={12} className="text-cyan-400" />
                  Pulihkan dari Kode (Import):
                </label>
                <textarea
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Tempelkan kode cadangan di sini..."
                  rows={2}
                  className="w-full p-2 text-[10px] font-mono bg-dungeon-950 border border-dungeon-700 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-gold-400"
                />
                <button
                  onClick={handleImportSave}
                  className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Upload size={13} />
                  <span>Pulihkan Akun Karakter</span>
                </button>
              </div>

              {/* Reset Game Button */}
              <div className="pt-2 border-t border-dungeon-800">
                <button
                  onClick={handleResetGame}
                  className="w-full py-2 rounded-xl bg-dungeon-950 hover:bg-blood-950/60 border border-blood-500/40 text-blood-400 hover:text-blood-300 text-[10px] font-black uppercase flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <RotateCcw size={12} />
                  <span>Reset Permainan (Mulai Baru)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
