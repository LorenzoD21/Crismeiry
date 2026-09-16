import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Music, Heart, Play } from 'lucide-react';
import { PhotoItem } from '../types';

interface IntroScreenProps {
  onStart: () => void;
  featuredPhoto: PhotoItem;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, featuredPhoto }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden bg-black select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/25 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-pink-600/25 blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-indigo-600/20 blur-[100px]" />
      </div>

      {/* Floating sparkles and hearts */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-400/40"
            style={{
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
            }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          >
            {i % 2 === 0 ? <Sparkles size={18} /> : <Heart size={14} fill="currentColor" />}
          </motion.div>
        ))}
      </div>

      {/* Top iOS Status Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md pt-4 flex items-center justify-between z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full ios-glass-pill text-xs text-pink-200 tracking-wider font-medium">
          <Sparkles size={13} className="text-pink-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>EDICIÓN CUMPLEAÑOS 16</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
          <Music size={13} className="text-pink-400" />
          <span>Música activa</span>
        </div>
      </motion.div>

      {/* Center Cinematic Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="w-full max-w-sm flex flex-col items-center text-center z-10 my-auto"
      >
        {/* Profile Circle with Glowing Tiara Ring */}
        <div className="relative mb-6">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-300 shadow-2xl shadow-pink-500/30">
            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 relative">
              <img
                src={featuredPhoto.customSrc || featuredPhoto.defaultSrc}
                alt="Crismeiri"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
          <motion.div 
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/30 flex items-center gap-1"
          >
            <span>👑</span>
            <span>16 AÑOS</span>
          </motion.div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-pink-400 font-handwriting text-2xl mb-1 tracking-wide"
        >
          Para una persona maravillosa
        </motion.p>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight leading-none mb-3 text-glow"
        >
          Crismeiri
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-zinc-300 max-w-xs leading-relaxed font-sans"
        >
          Hoy celebremos tus 16 años con un recorrido por tus mejores momentos, risas y la reina en la que te has convertido.
        </motion.p>
      </motion.div>

      {/* Bottom Start Action Button */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm flex flex-col items-center gap-3 z-10 pb-6"
      >
        <button
          id="btn-start-experience"
          onClick={onStart}
          className="w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-semibold text-base shadow-xl shadow-pink-500/25 active:scale-[0.98] transition-all duration-200 border border-white/25 hover:shadow-pink-500/40 cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Play size={18} className="fill-current text-white animate-bounce" style={{ animationDuration: '2s' }} />
          <span>Ver Recorrido Especial ✨</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-white/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Estilo TikTok Edit con Música Nostálgica</span>
        </div>
      </motion.div>
    </div>
  );
};
