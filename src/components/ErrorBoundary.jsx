import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Game Error Caught by Boundary:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-3xl bg-blood-600/20 border-2 border-blood-500 text-blood-500 flex items-center justify-center mb-4 shadow-xl shadow-blood-600/30">
            <AlertTriangle size={32} />
          </div>

          <h1 className="text-xl font-black text-gold-400 font-serif mb-2">
            DUNGEON LORD RECOVERY
          </h1>

          <p className="text-xs text-slate-300 max-w-xs mb-4 leading-relaxed">
            Terjadi kendala saat memuat aset game di perangkat Anda. Tekan tombol di bawah untuk memuat ulang game.
          </p>

          <div className="bg-black/60 border border-slate-800 rounded-xl p-3 max-w-xs w-full text-left mb-6 overflow-hidden">
            <p className="text-[10px] font-mono text-red-400 break-words">
              {this.state.error?.toString() || 'Unknown initialization error'}
            </p>
          </div>

          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-2xl bg-gradient-to-tr from-gold-600 to-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-gold-600/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} />
            <span>Reset Data & Muat Ulang</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
