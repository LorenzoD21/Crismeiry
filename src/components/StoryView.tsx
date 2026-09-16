import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Sparkles, 
  MessageSquare, 
  Share2, 
  SlidersHorizontal,
  Cake
} from 'lucide-react';
import { PhotoItem, VisualEffect } from '../types';
import confetti from 'canvas-confetti';

interface StoryViewProps {
  photos: PhotoItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onOpenLetter: () => void;
  onOpenManager: () => void;
}

interface FloatingHeartItem {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const StoryView: React.FC<StoryViewProps> = ({
  photos,
  currentIndex,
  onIndexChange,
  isAudioPlaying,
  onToggleAudio,
  onOpenLetter,
  onOpenManager
}) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [slideProgress, setSlideProgress] = useState<number>(0);
  const [showFullText, setShowFullText] = useState<boolean>(true);
  const [activeEffect, setActiveEffect] = useState<VisualEffect>('cinematic');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeartItem[]>([]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [slideDuration, setSlideDuration] = useState<number>(5000); // 5 seconds per slide default

  const progressIntervalRef = useRef<number | null>(null);
  const activePhoto = photos[currentIndex] || photos[0];

  // Advance to next photo
  const nextSlide = useCallback(() => {
    setSlideProgress(0);
    if (currentIndex < photos.length - 1) {
      onIndexChange(currentIndex + 1);
    } else {
      // Loop or prompt final celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onIndexChange(0);
    }
  }, [currentIndex, photos.length, onIndexChange]);

  // Go to previous photo
  const prevSlide = useCallback(() => {
    setSlideProgress(0);
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    } else {
      onIndexChange(photos.length - 1);
    }
  }, [currentIndex, photos.length, onIndexChange]);

  // Progress timer loop
  useEffect(() => {
    if (isPaused) return;

    const stepMs = 50;
    const increment = (stepMs / slideDuration) * 100;

    progressIntervalRef.current = window.setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current !== null) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPaused, slideDuration, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Heart floater trigger
  const triggerHeart = (x?: number, y?: number) => {
    const heartColors = ['#ec4899', '#f43f5e', '#a855f7', '#fb7185', '#e879f9'];
    const newHeart: FloatingHeartItem = {
      id: Date.now() + Math.random(),
      x: x !== undefined ? x : 50 + (Math.random() * 20 - 10),
      y: y !== undefined ? y : 80,
      color: heartColors[Math.floor(Math.random() * heartColors.length)]
    };
    setFloatingHearts(prev => [...prev.slice(-15), newHeart]);

    // Self cleanup after 1.5s
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1400);
  };

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Determine if clicked left side (prev) or right side (next)
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.3) {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 45) {
      // Swiped left -> next
      nextSlide();
    } else if (diff < -45) {
      // Swiped right -> prev
      prevSlide();
    }
    setTouchStartX(null);
  };

  return (
    <div 
      className="relative w-full h-full max-w-lg mx-auto flex flex-col justify-between overflow-hidden bg-black select-none shadow-2xl sm:rounded-3xl sm:border sm:border-white/10"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Visual background image with TikTok-style zoom animation */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden cursor-pointer"
        onClick={handleScreenClick}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhoto.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full"
          >
            <img
              src={activePhoto.customSrc || activePhoto.defaultSrc}
              alt={activePhoto.title}
              className={`w-full h-full object-cover object-center ${
                currentIndex % 2 === 0 ? 'animate-kenburns-1' : 'animate-kenburns-2'
              }`}
              referrerPolicy="no-referrer"
            />

            {/* Aesthetic Cinematic Vignette & Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/60 pointer-events-none" />

            {/* Optional Subtle Film Grain or Sparkle Overlay */}
            {activeEffect === 'sparkles' && (
              <div className="absolute inset-0 bg-radial from-pink-500/10 via-transparent to-transparent pointer-events-none" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Hearts Container */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {floatingHearts.map(heart => (
          <div
            key={heart.id}
            className="absolute"
            style={{
              left: `${heart.x}%`,
              bottom: `${100 - heart.y}%`,
              animation: 'float-heart 1.4s ease-out forwards',
              color: heart.color
            }}
          >
            <Heart size={28} fill="currentColor" />
          </div>
        ))}
      </div>

      {/* TOP BAR: Segmented Progress & iOS Navigation */}
      <div className="relative z-30 pt-3 px-3 sm:px-4 flex flex-col gap-2">
        {/* 20 Segmented Progress Bars (Instagram/TikTok style) */}
        <div className="w-full flex items-center gap-1">
          {photos.map((photo, idx) => {
            let fillPercent = 0;
            if (idx < currentIndex) fillPercent = 100;
            else if (idx === currentIndex) fillPercent = slideProgress;

            return (
              <button
                key={photo.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideProgress(0);
                  onIndexChange(idx);
                }}
                className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden relative cursor-pointer group"
                title={`Ir a foto ${idx + 1}: ${photo.title}`}
              >
                <div 
                  className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                  style={{ width: `${fillPercent}%` }}
                />
              </button>
            );
          })}
        </div>

        {/* Top iOS Profile & Controls Row */}
        <div className="flex items-center justify-between mt-1">
          {/* Crismeiri Status */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full ring-2 ring-pink-500 overflow-hidden bg-zinc-800">
                <img
                  src={photos[19]?.customSrc || photos[19]?.defaultSrc}
                  alt="Crismeiri avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 text-[10px]">👑</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-white text-xs font-semibold tracking-wide">Crismeiri</span>
                <span className="text-[10px] bg-pink-500/30 text-pink-300 px-1.5 py-0.5 rounded-full border border-pink-500/40">16 Años</span>
              </div>
              <span className="text-[11px] text-white/70 font-mono">
                {currentIndex + 1} de {photos.length} • {activePhoto.ageBadge}
              </span>
            </div>
          </div>

          {/* Quick Actions (Audio, Pause, Options) */}
          <div className="flex items-center gap-1.5">
            {/* Audio Toggle */}
            <button
              id="btn-story-audio"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAudio();
              }}
              className="w-8 h-8 rounded-full ios-glass-pill flex items-center justify-center text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
              title={isAudioPlaying ? "Pausar música" : "Reproducir música nostálgica"}
            >
              {isAudioPlaying ? (
                <div className="flex items-end gap-[2px] h-3.5">
                  <span className="w-0.5 h-3 bg-pink-400 rounded-full animate-pulse" />
                  <span className="w-0.5 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <span className="w-0.5 h-3.5 bg-pink-300 rounded-full animate-pulse" />
                </div>
              ) : (
                <VolumeX size={14} className="text-white/60" />
              )}
            </button>

            {/* Play/Pause Timer */}
            <button
              id="btn-story-pause"
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="w-8 h-8 rounded-full ios-glass-pill flex items-center justify-center text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
              title={isPaused ? "Reanudar pase automático" : "Pausar para leer con calma"}
            >
              {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
            </button>

            {/* Speed Selector */}
            <button
              id="btn-story-speed"
              onClick={(e) => {
                e.stopPropagation();
                setSlideDuration(d => d === 5000 ? 7000 : d === 7000 ? 3500 : 5000);
              }}
              className="px-2 py-1 rounded-full ios-glass-pill text-[10px] font-mono text-white/80 cursor-pointer"
              title="Cambiar velocidad del pase"
            >
              {slideDuration === 5000 ? '1x' : slideDuration === 7000 ? '0.7x' : '1.5x'}
            </button>
          </div>
        </div>
      </div>

      {/* MIDDLE: Left/Right Arrow Hit Areas (Visible on Hover for Desktop) */}
      <div className="absolute inset-y-24 inset-x-0 flex items-center justify-between px-2 pointer-events-none z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="pointer-events-auto w-10 h-10 rounded-full ios-glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 opacity-0 sm:group-hover:opacity-80 transition-all cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="pointer-events-auto w-10 h-10 rounded-full ios-glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 opacity-0 sm:group-hover:opacity-80 transition-all cursor-pointer"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* RIGHT SIDE FLOATING BAR (TikTok Interaction Style) */}
      <div className="absolute right-3 bottom-32 z-30 flex flex-col items-center gap-3">
        {/* Heart Tap */}
        <button
          id="btn-like-heart"
          onClick={(e) => {
            e.stopPropagation();
            triggerHeart(85, 75);
          }}
          className="group w-11 h-11 rounded-full ios-glass flex flex-col items-center justify-center text-white cursor-pointer active:scale-125 transition-transform"
          title="Enviar amor a Crismeiri"
        >
          <Heart size={20} className="text-pink-500 group-hover:scale-110 transition-transform fill-pink-500/40 group-active:fill-pink-500" />
        </button>

        {/* Text Toggle */}
        <button
          id="btn-toggle-captions"
          onClick={(e) => {
            e.stopPropagation();
            setShowFullText(!showFullText);
          }}
          className={`w-11 h-11 rounded-full ios-glass flex items-center justify-center cursor-pointer transition-all ${
            showFullText ? 'text-pink-400 bg-white/15' : 'text-white/70'
          }`}
          title={showFullText ? "Ocultar texto para ver foto completa" : "Mostrar dedicatoria"}
        >
          <MessageSquare size={18} />
        </button>

        {/* Birthday Cake Letter Shortcut */}
        <button
          id="btn-open-cake-letter"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLetter();
          }}
          className="w-11 h-11 rounded-full ios-glass flex items-center justify-center text-amber-300 hover:text-amber-200 cursor-pointer active:scale-110 transition-transform"
          title="Ver carta y pastel de cumpleaños"
        >
          <Cake size={19} />
        </button>

        {/* Confetti Explosion */}
        <button
          id="btn-confetti"
          onClick={(e) => {
            e.stopPropagation();
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 }
            });
          }}
          className="w-11 h-11 rounded-full ios-glass flex items-center justify-center text-purple-300 hover:text-purple-100 cursor-pointer active:scale-110 transition-transform"
          title="Lanzar confeti"
        >
          <Sparkles size={18} />
        </button>
      </div>

      {/* BOTTOM SECTION: Touching Poetic Dedication Card (Aesthetic TikTok Subtitles) */}
      <div className="relative z-30 pb-4 px-3 sm:px-4">
        <AnimatePresence>
          {showFullText ? (
            <motion.div
              key={`text-${activePhoto.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="w-full rounded-2xl ios-glass p-3.5 sm:p-4 text-left border border-white/15 shadow-xl backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo Title & Milestone Tag */}
              <div className="flex items-center justify-between mb-1.5">
                <span 
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-white"
                  style={{ backgroundColor: activePhoto.accentColor }}
                >
                  Recuerdo #{activePhoto.id} • {activePhoto.ageBadge}
                </span>
                <span className="text-[11px] text-white/60 font-medium font-mono">
                  Crismeiri ✨
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-display font-bold text-white leading-tight mb-1 text-glow">
                {activePhoto.title}
              </h2>

              {/* Poetic quote */}
              <p className="text-pink-300 font-handwriting text-base sm:text-lg italic mb-1.5 leading-snug">
                "{activePhoto.quote}"
              </p>

              {/* Touching story description */}
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans font-normal line-clamp-3 hover:line-clamp-none transition-all">
                {activePhoto.storyText}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center py-2"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullText(true);
                }}
                className="px-4 py-1.5 rounded-full ios-glass-pill text-xs text-white/80 hover:text-white flex items-center gap-1.5 cursor-pointer backdrop-blur-lg"
              >
                <MessageSquare size={13} className="text-pink-400" />
                <span>Leer recuerdo #{activePhoto.id}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
