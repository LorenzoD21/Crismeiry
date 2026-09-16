import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Cake, Gift, Copy, Check, Send, Flame } from 'lucide-react';
import { BIRTHDAY_LETTER_TEXT } from '../data/photosData';
import confetti from 'canvas-confetti';

interface BirthdayLetterProps {
  onBackToStory: () => void;
}

export const BirthdayLetter: React.FC<BirthdayLetterProps> = ({ onBackToStory }) => {
  const [candlesBlown, setCandlesBlown] = useState<boolean[]>(new Array(16).fill(false));
  const [allCandlesOut, setAllCandlesOut] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [customWishes, setCustomWishes] = useState<string[]>([]);
  const [newWish, setNewWish] = useState<string>('');

  const blowSingleCandle = (idx: number) => {
    const updated = [...candlesBlown];
    updated[idx] = true;
    setCandlesBlown(updated);

    // If all are out
    if (updated.every(c => c)) {
      triggerAllOut();
    } else {
      confetti({
        particleCount: 15,
        spread: 40,
        origin: { y: 0.5 }
      });
    }
  };

  const blowAllCandles = () => {
    setCandlesBlown(new Array(16).fill(true));
    triggerAllOut();
  };

  const triggerAllOut = () => {
    setAllCandlesOut(true);
    // Multiple celebratory confetti bursts!
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.trim()) return;
    setCustomWishes(prev => [newWish.trim(), ...prev]);
    setNewWish('');
    confetti({ particleCount: 30, spread: 50 });
  };

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar pb-32 pt-4 px-4 max-w-2xl mx-auto select-none">
      {/* Celebration Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full ios-glass-pill text-xs font-semibold text-pink-300 mb-3">
          <Gift size={14} className="text-pink-400" />
          <span>CELEBRACIÓN ESPECIAL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mb-2 text-glow">
          ¡Felices 16 Años, Crismeiri! 🎂
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm font-sans max-w-md mx-auto">
          {BIRTHDAY_LETTER_TEXT.date}
        </p>
      </motion.div>

      {/* Interactive 16-Candle Birthday Cake Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full rounded-3xl ios-glass p-5 sm:p-6 mb-8 border border-white/15 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-medium text-pink-300 flex items-center gap-1.5">
            <Cake size={15} />
            Pastel Virtual de los 16
          </span>
          <span className="text-[11px] text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
            Toca las velas para apagarlas
          </span>
        </div>

        {/* 16 Glowing Candles Row */}
        <div className="flex items-end justify-center gap-2 sm:gap-3 my-6 py-2 px-2 overflow-x-auto no-scrollbar">
          {candlesBlown.map((isBlown, idx) => (
            <button
              key={idx}
              onClick={() => blowSingleCandle(idx)}
              className="flex flex-col items-center group cursor-pointer active:scale-90 transition-transform"
              title={`Vela #${idx + 1}`}
            >
              {/* Flame */}
              <div className="h-5 flex items-center justify-center">
                {!isBlown ? (
                  <motion.div
                    animate={{
                      scale: [1, 1.25, 0.9, 1.15],
                      rotate: [-3, 4, -2, 3]
                    }}
                    transition={{
                      duration: 0.8 + (idx % 4) * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="w-3 h-4 rounded-full bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200 shadow-md shadow-amber-400/80"
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 opacity-60" />
                )}
              </div>

              {/* Candle Stick */}
              <div 
                className={`w-2 sm:w-2.5 h-10 sm:h-12 rounded-t-sm shadow-sm transition-colors ${
                  isBlown ? 'bg-zinc-600' : 'bg-gradient-to-b from-pink-300 via-purple-300 to-indigo-400'
                }`}
              />
              <span className="text-[9px] font-mono text-white/50 mt-1">{idx + 1}</span>
            </button>
          ))}
        </div>

        {/* Action button for blowing out candles */}
        {!allCandlesOut ? (
          <button
            onClick={blowAllCandles}
            className="py-2.5 px-5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-black font-semibold text-xs sm:text-sm shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            <Flame size={16} className="text-red-700 animate-bounce" />
            <span>¡Soplar las 16 Velas y Pedir un Deseo! ✨</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/30 text-pink-200 text-xs sm:text-sm font-medium"
          >
            🎉 ¡Deseo concedido! Que la vida te llene de amor, salud y bendiciones infinitas en tus 16 años, Crismeiri.
          </motion.div>
        )}
      </motion.div>

      {/* The Touching Birthday Letter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full rounded-3xl ios-glass p-6 sm:p-8 border border-white/15 shadow-2xl text-left relative mb-8"
      >
        <div className="absolute top-4 right-5 text-pink-400/30">
          <Sparkles size={32} />
        </div>

        <h2 className="text-xl sm:text-2xl font-handwriting text-pink-400 font-bold mb-4">
          {BIRTHDAY_LETTER_TEXT.greeting}
        </h2>

        <div className="space-y-4 text-zinc-200 text-sm sm:text-base leading-relaxed font-sans font-normal">
          {BIRTHDAY_LETTER_TEXT.paragraphs.map((p, idx) => (
            <p key={idx} className="leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-400">{BIRTHDAY_LETTER_TEXT.signature}</p>
            <p className="text-base font-handwriting text-pink-300 font-bold mt-0.5">
              {BIRTHDAY_LETTER_TEXT.from}
            </p>
          </div>

          <button
            onClick={onBackToStory}
            className="py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all text-center"
          >
            ← Volver a los 20 Momentos
          </button>
        </div>
      </motion.div>

      {/* Shareable Link Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full rounded-2xl ios-glass p-4 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 mb-8"
      >
        <div className="text-left">
          <p className="text-xs font-semibold text-white">Comparte este regalo con Crismeiri</p>
          <p className="text-[11px] text-zinc-400">Envíaselo por WhatsApp o Instagram para que vea su página</p>
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full sm:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-md shadow-pink-500/20"
        >
          {copiedLink ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
          <span>{copiedLink ? "¡Enlace Copiado!" : "Copiar Enlace Especial"}</span>
        </button>
      </motion.div>

      {/* Leave a quick wish */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full rounded-2xl ios-glass p-5 border border-white/15 text-left mb-6"
      >
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <Heart size={15} className="text-pink-500 fill-pink-500" />
          <span>Dedícale un Deseo a Crismeiri</span>
        </h3>

        <form onSubmit={handleAddWish} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newWish}
            onChange={(e) => setNewWish(e.target.value)}
            placeholder="Escribe un mensaje bonito para Crismeiri..."
            className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold flex items-center justify-center cursor-pointer active:scale-95 transition-all"
          >
            <Send size={13} />
          </button>
        </form>

        {customWishes.length > 0 && (
          <div className="space-y-2 mt-3 pt-3 border-t border-white/10">
            {customWishes.map((wish, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-pink-200">
                "{wish}"
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
