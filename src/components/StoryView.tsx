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
  Cake,
  BookOpen,
  Maximize2,
  Minimize2,
  X,
  Share2
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
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [slideProgress, setSlideProgress] = useState<number>(0);
  const [showFullText, setShowFullText] = useState<boolean>(true);
  const [showVerseModal, setShowVerseModal] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<'cover' | 'fit'>('cover');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeartItem[]>([]);
  const [showCenterHeart, setShowCenterHeart] = useState<boolean>(false);
  const [slideDuration, setSlideDuration] = useState<number>(5500); // 5.5s per slide

  // Gesture tracking
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchStartTime = useRef<number>(0);
  const holdTimeoutRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  const progressIntervalRef = useRef<number | null>(null);
  const activePhoto = photos[currentIndex] || photos[0];

  const nextSlideRef = useRef<() => void>(() => {});
  const prevSlideRef = useRef<() => void>(() => {});

  // Advance to next photo
  const nextSlide = useCallback(() => {
    setSlideProgress(0);
    if (currentIndex < photos.length - 1) {
      onIndexChange(currentIndex + 1);
    } else {
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

  // Keep refs synchronized with latest callbacks
  useEffect(() => {
    nextSlideRef.current = nextSlide;
    prevSlideRef.current = prevSlide;
  }, [nextSlide, prevSlide]);

  // Reset slide progress whenever the current index changes
  useEffect(() => {
    setSlideProgress(0);
  }, [currentIndex]);

  // Progress timer loop
  useEffect(() => {
    if (isPaused || isHolding || showVerseModal) return;

    const stepMs = 50;
    const increment = (stepMs / slideDuration) * 100;
    let isTransitioning = false;

    progressIntervalRef.current = window.setInterval(() => {
      if (isTransitioning) return;

      setSlideProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          isTransitioning = true;
          // Defer call so it executes outside React's state updater phase
          window.setTimeout(() => {
            nextSlideRef.current();
            isTransitioning = false;
          }, 0);
          return 100;
        }
        return next;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current !== null) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPaused, isHolding, showVerseModal, slideDuration, currentIndex]);

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
      } else if (e.key === 'v' || e.key === 'V') {
        setShowVerseModal(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Heart floater trigger
  const triggerHeart = (x?: number, y?: number) => {
    const heartColors = ['#ec4899', '#f43f5e', '#a855f7', '#fb7185', '#e879f9', '#f59e0b'];
    const newHeart: FloatingHeartItem = {
      id: Date.now() + Math.random(),
      x: x !== undefined ? x : 50 + (Math.random() * 20 - 10),
      y: y !== undefined ? y : 80,
      color: heartColors[Math.floor(Math.random() * heartColors.length)]
    };
    setFloatingHearts(prev => [...prev.slice(-15), newHeart]);

    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1400);

    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  // Double tap to like (Instagram/TikTok style)
  const handleDoubleTap = (x: number, y: number) => {
    setShowCenterHeart(true);
    triggerHeart(x, y);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { x: x / 100, y: y / 100 }
    });
    setTimeout(() => setShowCenterHeart(false), 800);
  };

  // Touch start with hold-to-pause & tap detection
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchStartTime.current = Date.now();

    // Start hold timer (holding pauses the story)
    holdTimeoutRef.current = window.setTimeout(() => {
      setIsHolding(true);
    }, 220);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (holdTimeoutRef.current !== null) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (isHolding) {
      setIsHolding(false);
      return;
    }

    if (!touchStartPos.current) return;
    const touch = e.changedTouches[0];
    const diffX = touchStartPos.current.x - touch.clientX;
    const diffY = touchStartPos.current.y - touch.clientY;
    const elapsed = Date.now() - touchStartTime.current;

    // Swipe detection (horizontal or vertical)
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // Swiped Left -> Next
        nextSlide();
      } else {
        // Swiped Right -> Prev
        prevSlide();
      }
      touchStartPos.current = null;
      return;
    }

    // Swipe Up -> Open biblical verse
    if (diffY > 50 && Math.abs(diffY) > Math.abs(diffX)) {
      setShowVerseModal(true);
      touchStartPos.current = null;
      return;
    }

    // Tap handling (check for double tap)
    if (elapsed < 250 && Math.abs(diffX) < 15 && Math.abs(diffY) < 15) {
      const now = Date.now();
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeX = ((touch.clientX - rect.left) / rect.width) * 100;
      const relativeY = ((touch.clientY - rect.top) / rect.height) * 100;

      if (now - lastTapTimeRef.current < 280) {
        // Double tap confirmed!
        handleDoubleTap(relativeX, relativeY);
        lastTapTimeRef.current = 0;
      } else {
        lastTapTimeRef.current = now;
        // Single tap navigation: left 30% goes back, right 70% goes forward
        setTimeout(() => {
          if (lastTapTimeRef.current === now) {
            if (relativeX < 30) {
              prevSlide();
            } else {
              nextSlide();
            }
          }
        }, 280);
      }
    }

    touchStartPos.current = null;
  };

  const handleAménBlessing = () => {
    confetti({
      particleCount: 100,
      spread: 90,
      colors: ['#fbbf24', '#f59e0b', '#ec4899', '#a855f7', '#ffffff'],
      origin: { y: 0.6 }
    });
    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 80]);
    }
  };

  return (
    <div 
      className="relative w-full h-full max-w-lg mx-auto flex flex-col justify-between overflow-hidden bg-black select-none shadow-2xl sm:rounded-3xl sm:border sm:border-white/10"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image & Ken Burns / Blurred Ambient Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden cursor-pointer">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activePhoto.id}-${displayMode}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Ambient Blurred Background (Matches exact photo colors for seamless phone display) */}
            <div 
              className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-125 opacity-70 transition-opacity"
              style={{ backgroundImage: `url(${activePhoto.customSrc || activePhoto.defaultSrc})` }}
            />

            {/* Foreground Photo (Cover vs Fit) */}
            <img
              src={activePhoto.customSrc || activePhoto.defaultSrc}
              alt={activePhoto.title}
              className={`relative z-10 w-full h-full ${
                displayMode === 'cover'
                  ? `object-cover object-center ${currentIndex % 2 === 0 ? 'animate-kenburns-1' : 'animate-kenburns-2'}`
                  : 'object-contain'
              }`}
              referrerPolicy="no-referrer"
            />

            {/* Aesthetic Cinematic Vignette Gradients */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/30 to-black/65 pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Center Bursting Heart on Double Tap */}
      <AnimatePresence>
        {showCenterHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0.3, 1.3, 1], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <div className="p-5 rounded-full bg-black/40 backdrop-blur-md border border-pink-500/40 shadow-2xl">
              <Heart size={80} fill="#ec4899" className="text-pink-400 drop-shadow-[0_0_25px_rgba(236,72,153,0.8)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hold-to-pause subtle indicator */}
      {isHolding && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium animate-pulse flex items-center gap-1.5">
          <Pause size={12} fill="currentColor" />
          <span>Pausado</span>
        </div>
      )}

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

      {/* TOP BAR: Safe Area + Segmented Progress Bars + Profile Header */}
      <div className="relative z-30 pt-2.5 px-3 sm:px-4 flex flex-col gap-2">
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
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden relative cursor-pointer"
                title={`Recuerdo ${idx + 1}`}
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
              <div className="w-9 h-9 rounded-full ring-2 ring-pink-500 overflow-hidden bg-zinc-800 shadow-md">
                <img
                  src={photos[19]?.customSrc || photos[19]?.defaultSrc}
                  alt="Crismeiri avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 text-[11px] filter drop-shadow">👑</span>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-white text-xs font-semibold tracking-wide">Crismeiri</span>
                <span className="text-[10px] bg-pink-500/30 text-pink-300 px-1.5 py-0.5 rounded-full border border-pink-500/40 font-medium">16 Años</span>
              </div>
              <span className="text-[11px] text-white/70 font-mono">
                {currentIndex + 1} de {photos.length} • {activePhoto.ageBadge}
              </span>
            </div>
          </div>

          {/* Quick Actions (Fit/Fill Toggle, Speed, Pause, Audio) */}
          <div className="flex items-center gap-1.5">
            {/* Aspect Fit/Fill Toggle (Great for mobile viewing without crops) */}
            <button
              id="btn-toggle-fit"
              onClick={(e) => {
                e.stopPropagation();
                setDisplayMode(m => m === 'cover' ? 'fit' : 'cover');
              }}
              className="w-8 h-8 rounded-full ios-glass-pill flex items-center justify-center text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
              title={displayMode === 'cover' ? "Ajustar foto completa sin cortes" : "Llenar pantalla"}
            >
              {displayMode === 'cover' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>

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
              title={isPaused ? "Reanudar" : "Pausar"}
            >
              {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
            </button>

            {/* Speed Selector */}
            <button
              id="btn-story-speed"
              onClick={(e) => {
                e.stopPropagation();
                setSlideDuration(d => d === 5500 ? 8000 : d === 8000 ? 3500 : 5500);
              }}
              className="px-2 py-1 rounded-full ios-glass-pill text-[10px] font-mono text-white/80 cursor-pointer active:scale-90"
              title="Velocidad"
            >
              {slideDuration === 5500 ? '1x' : slideDuration === 8000 ? '0.7x' : '1.5x'}
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP/TABLET SIDE NAVIGATION ARROWS */}
      <div className="absolute inset-y-28 inset-x-0 flex items-center justify-between px-2 pointer-events-none z-20">
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
      <div className="absolute right-3 bottom-24 sm:bottom-28 z-30 flex flex-col items-center gap-3">
        {/* Heart Tap */}
        <button
          id="btn-like-heart"
          onClick={(e) => {
            e.stopPropagation();
            triggerHeart(85, 75);
          }}
          className="group w-11 h-11 rounded-full ios-glass flex flex-col items-center justify-center text-white cursor-pointer active:scale-125 transition-transform shadow-lg shadow-black/50"
          title="Dar amor"
        >
          <Heart size={20} className="text-pink-500 group-hover:scale-110 transition-transform fill-pink-500/40 group-active:fill-pink-500" />
        </button>

        {/* Biblical Verse Shortcut Button (Golden Glow) */}
        <button
          id="btn-open-bible-verse"
          onClick={(e) => {
            e.stopPropagation();
            setShowVerseModal(true);
          }}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500/40 to-yellow-300/30 border border-amber-300/60 shadow-lg shadow-amber-500/30 flex items-center justify-center text-amber-200 hover:text-white cursor-pointer active:scale-115 transition-transform"
          title="Ver versículo bíblico y bendición"
        >
          <BookOpen size={19} className="animate-pulse text-amber-300" />
        </button>

        {/* Text Toggle */}
        <button
          id="btn-toggle-captions"
          onClick={(e) => {
            e.stopPropagation();
            setShowFullText(!showFullText);
          }}
          className={`w-11 h-11 rounded-full ios-glass flex items-center justify-center cursor-pointer transition-all shadow-lg shadow-black/50 ${
            showFullText ? 'text-pink-400 bg-white/20' : 'text-white/70'
          }`}
          title={showFullText ? "Ocultar dedicatoria" : "Mostrar dedicatoria"}
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
          className="w-11 h-11 rounded-full ios-glass flex items-center justify-center text-amber-300 hover:text-amber-200 cursor-pointer active:scale-110 transition-transform shadow-lg shadow-black/50"
          title="Pastel de 16 y carta"
        >
          <Cake size={19} />
        </button>

        {/* Spinning Vinyl TikTok Disc */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onToggleAudio();
          }}
          className={`relative w-10 h-10 rounded-full border border-white/30 p-1 bg-zinc-900 shadow-xl cursor-pointer active:scale-95 transition-transform ${
            isAudioPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '4s' }}
          title="Sonido original • Toque para música"
        >
          <img
            src={photos[19]?.customSrc || photos[19]?.defaultSrc}
            alt="disc"
            className="w-full h-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-black/80 border border-white/50" />
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Touching Poetic Dedication Card + Biblical Verse Bar */}
      <div className="relative z-30 pb-20 sm:pb-22 px-3 sm:px-4">
        <AnimatePresence>
          {showFullText ? (
            <motion.div
              key={`text-${activePhoto.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35 }}
              className="w-full rounded-2xl ios-glass p-3.5 sm:p-4 text-left border border-white/20 shadow-2xl backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo Title & Milestone Tag */}
              <div className="flex items-center justify-between mb-1.5">
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-white shadow-sm"
                  style={{ backgroundColor: activePhoto.accentColor }}
                >
                  Recuerdo #{activePhoto.id} • {activePhoto.ageBadge}
                </span>
                <span className="text-[11px] text-white/75 font-mono">
                  Crismeiri ✨
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-display font-bold text-white leading-tight mb-1 text-glow">
                {activePhoto.title}
              </h2>

              {/* Poetic quote */}
              <p className="text-pink-300 font-handwriting text-base sm:text-lg italic mb-1.5 leading-snug">
                "{activePhoto.quote}"
              </p>

              {/* Touching story description */}
              <p className="text-xs text-zinc-200 leading-relaxed font-sans font-normal mb-2 line-clamp-2 hover:line-clamp-none transition-all">
                {activePhoto.storyText}
              </p>

              {/* Biblical Verse Pill - Tap to open full blessing */}
              {activePhoto.bibleVerse && (
                <button
                  id={`btn-verse-tag-${activePhoto.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVerseModal(true);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20 border border-amber-400/40 text-amber-200 text-xs hover:border-amber-300 transition-colors cursor-pointer group shadow-sm active:scale-98"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <BookOpen size={13} className="text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-amber-300 font-serif">
                      {activePhoto.bibleVerse.reference}:
                    </span>
                    <span className="truncate italic text-amber-100/90 text-[11px]">
                      "{activePhoto.bibleVerse.text}"
                    </span>
                  </div>
                  <span className="shrink-0 text-[10px] bg-amber-400/30 text-amber-200 px-1.5 py-0.5 rounded-full font-mono">
                    Bendición →
                  </span>
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center py-1"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullText(true);
                }}
                className="px-4 py-1.5 rounded-full ios-glass-pill text-xs text-white/90 hover:text-white flex items-center gap-1.5 cursor-pointer backdrop-blur-lg shadow-lg border border-white/20"
              >
                <MessageSquare size={13} className="text-pink-400" />
                <span>Leer dedicatoria #{activePhoto.id}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DEDICATED BIBLICAL BLESSING BOTTOM SHEET (Modal / Drawer) */}
      <AnimatePresence>
        {showVerseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowVerseModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="w-full max-w-lg bg-gradient-to-b from-zinc-900 via-zinc-950 to-black rounded-t-3xl sm:rounded-3xl border border-amber-500/30 p-6 shadow-2xl relative text-left overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Drag Indicator for mobile */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

              {/* Glowing Background Radial */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-amber-400 uppercase font-semibold">
                      Palabra de Dios • 16 Años
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Bendición para Crismeiri
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setShowVerseModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Golden Scripture Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-950/40 border border-amber-400/30 mb-4 shadow-lg">
                <div className="flex items-center gap-1.5 text-amber-300 font-mono text-xs font-bold mb-2">
                  <Sparkles size={14} className="text-amber-300" />
                  <span>{activePhoto.bibleVerse.reference}</span>
                </div>
                <p className="text-base sm:text-lg font-serif italic text-amber-100 leading-snug">
                  "{activePhoto.bibleVerse.text}"
                </p>
              </div>

              {/* Spiritual Reflection for Crismeiri */}
              <div className="mb-6 space-y-2">
                <h4 className="text-xs font-semibold text-pink-300 uppercase tracking-wider font-mono">
                  Promesa y Declaración en tu Vida:
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                  {activePhoto.bibleVerse.reflection}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAménBlessing}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} className="text-black" />
                  <span>¡Amén! Declarar Bendición 🙏</span>
                </button>

                <button
                  onClick={() => setShowVerseModal(false)}
                  className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs cursor-pointer active:scale-95"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
