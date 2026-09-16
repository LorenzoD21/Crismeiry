import React from 'react';
import { motion } from 'motion/react';
import { Clapperboard, Images, Cake, FolderCog, Music, Volume2, VolumeX } from 'lucide-react';
import { ViewMode } from '../types';

interface IOSNavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenManager: () => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
}

export const IOSNavbar: React.FC<IOSNavbarProps> = ({
  currentView,
  onViewChange,
  onOpenManager,
  isAudioPlaying,
  onToggleAudio
}) => {
  const navItems = [
    {
      id: 'story' as ViewMode,
      label: 'TikTok Edit',
      icon: Clapperboard,
      color: '#ec4899'
    },
    {
      id: 'gallery' as ViewMode,
      label: 'Galería',
      icon: Images,
      color: '#3b82f6'
    },
    {
      id: 'letter' as ViewMode,
      label: '16 Años',
      icon: Cake,
      color: '#a855f7'
    }
  ];

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <motion.nav
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full ios-glass border border-white/20 shadow-2xl shadow-black/80 backdrop-blur-3xl"
      >
        {/* Main View Buttons */}
        {navItems.map(item => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative px-3.5 sm:px-4 py-2 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isActive 
                  ? 'text-white bg-white/20 shadow-inner' 
                  : 'text-white/65 hover:text-white hover:bg-white/10'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="ios-active-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/40 to-purple-600/40 border border-white/30"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={16} className={`relative z-10 ${isActive ? 'text-pink-300' : 'text-white/70'}`} />
              <span className="relative z-10 hidden xs:inline">{item.label}</span>
            </button>
          );
        })}

        <div className="w-[1px] h-5 bg-white/15 mx-0.5" />

        {/* Global Photo Folder Manager */}
        <button
          id="nav-btn-manager"
          onClick={onOpenManager}
          className="px-2.5 sm:px-3 py-2 rounded-full flex items-center gap-1 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Gestionar Carpeta /public/photos/"
        >
          <FolderCog size={16} className="text-zinc-300" />
          <span className="hidden sm:inline text-[11px] font-mono">Fotos</span>
        </button>

        {/* Nostalgic Audio Controller */}
        <button
          id="nav-btn-audio"
          onClick={onToggleAudio}
          className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={isAudioPlaying ? "Pausar música nostálgica" : "Activar música"}
        >
          {isAudioPlaying ? (
            <div className="flex items-end gap-[2px] h-3.5 px-0.5">
              <span className="w-0.5 h-3 bg-pink-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-2 bg-purple-300 rounded-full animate-bounce" />
              <span className="w-0.5 h-3.5 bg-pink-300 rounded-full animate-pulse" />
            </div>
          ) : (
            <VolumeX size={16} className="text-white/50" />
          )}
        </button>
      </motion.nav>
    </div>
  );
};
