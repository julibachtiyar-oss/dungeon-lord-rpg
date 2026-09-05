import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-sm mx-auto bg-dungeon-850/95 backdrop-blur-md border border-gold-500/50 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0">
          <Smartphone size={22} />
        </div>
        <div>
          <h4 className="text-xs font-black text-white">Pasang di Layar Utama HP</h4>
          <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
            Mainkan game fullscreen & offline tanpa buka browser.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-gold-500/20"
        >
          <Download size={13} />
          <span>Pasang</span>
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
