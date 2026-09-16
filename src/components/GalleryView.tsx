import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, Filter, X, ChevronRight, Heart } from 'lucide-react';
import { PhotoItem } from '../types';

interface GalleryViewProps {
  photos: PhotoItem[];
  onSelectPhoto: (index: number) => void;
  onPlayFromStart: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  photos,
  onSelectPhoto,
  onPlayFromStart
}) => {
  const [selectedEra, setSelectedEra] = useState<string>('todos');
  const [activeModalPhoto, setActiveModalPhoto] = useState<PhotoItem | null>(null);

  const eras = [
    { id: 'todos', label: 'Todos', count: 20 },
    { id: 'infancia', label: 'Infancia', count: 6 },
    { id: 'creciendo', label: 'Creciendo', count: 12 },
    { id: 'quinceanera', label: 'Los 15', count: 1 },
    { id: 'dulces16', label: 'Dulces 16', count: 1 }
  ];

  const filteredPhotos = selectedEra === 'todos' 
    ? photos 
    : photos.filter(p => p.era === selectedEra);

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar pb-28 pt-4 px-4 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2">
        <div>
          <div className="flex items-center gap-2 text-pink-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Álbum de Recuerdos • 2008 - 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Los 20 Momentos de Crismeiri
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Una colección cronológica desde tus primeros pasos hasta tus 16 años.
          </p>
        </div>

        <button
          onClick={onPlayFromStart}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium text-xs sm:text-sm shadow-lg shadow-pink-500/20 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <Play size={15} fill="currentColor" />
          <span>Ver como TikTok Edit</span>
        </button>
      </div>

      {/* iOS Segmented Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
        {eras.map(era => {
          const isActive = selectedEra === era.id;
          return (
            <button
              key={era.id}
              onClick={() => setSelectedEra(era.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
              }`}
            >
              {era.label} ({era.count})
            </button>
          );
        })}
      </div>

      {/* Photos Masonry / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {filteredPhotos.map((photo) => {
          const originalIndex = photos.findIndex(p => p.id === photo.id);
          return (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-900 border border-white/10 shadow-md hover:shadow-pink-500/20 hover:border-pink-500/40 transition-all cursor-pointer"
              onClick={() => setActiveModalPhoto(photo)}
            >
              <img
                src={photo.customSrc || photo.defaultSrc}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Number Badge Top Left */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/15">
                #{photo.id}
              </div>

              {/* Age Milestone Top Right */}
              <div 
                className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white backdrop-blur-md shadow-sm"
                style={{ backgroundColor: `${photo.accentColor}cc` }}
              >
                {photo.ageBadge}
              </div>

              {/* Info Bottom */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 flex flex-col">
                <span className="text-white text-xs sm:text-sm font-display font-bold leading-snug line-clamp-1 group-hover:text-pink-300 transition-colors">
                  {photo.title}
                </span>
                <span className="text-zinc-400 text-[11px] font-sans line-clamp-1 mt-0.5">
                  {photo.subtitle}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Photo Detail Modal / Lightbox */}
      <AnimatePresence>
        {activeModalPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-zinc-900/90 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalPhoto(null)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Image Preview */}
              <div className="relative w-full aspect-[4/5] max-h-[55vh] bg-black overflow-hidden">
                <img
                  src={activeModalPhoto.customSrc || activeModalPhoto.defaultSrc}
                  alt={activeModalPhoto.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-xs font-mono text-white">
                  Recuerdo #{activeModalPhoto.id} • {activeModalPhoto.ageBadge}
                </div>
              </div>

              {/* Text & Actions */}
              <div className="p-4 sm:p-5 flex flex-col gap-2 overflow-y-auto no-scrollbar">
                <h3 className="text-xl font-display font-bold text-white leading-tight">
                  {activeModalPhoto.title}
                </h3>
                <p className="text-pink-400 font-handwriting text-lg italic">
                  "{activeModalPhoto.quote}"
                </p>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans">
                  {activeModalPhoto.storyText}
                </p>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-2">
                  <button
                    onClick={() => {
                      const idx = photos.findIndex(p => p.id === activeModalPhoto.id);
                      setActiveModalPhoto(null);
                      onSelectPhoto(idx);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                  >
                    <Play size={15} fill="currentColor" />
                    <span>Ver en Modo Historia</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
