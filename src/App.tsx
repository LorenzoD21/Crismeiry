import React, { useState, useEffect } from 'react';
import { INITIAL_PHOTOS } from './data/photosData';
import { PhotoItem, ViewMode } from './types';
import { audioEngine } from './utils/audioSynth';
import { IntroScreen } from './components/IntroScreen';
import { StoryView } from './components/StoryView';
import { GalleryView } from './components/GalleryView';
import { BirthdayLetter } from './components/BirthdayLetter';
import { PhotoManagerModal } from './components/PhotoManagerModal';
import { IOSNavbar } from './components/IOSNavbar';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'crismeiri_16th_photos_v3';

export default function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewMode>('story');
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === INITIAL_PHOTOS.length) {
          return parsed.map((p, i) => ({
            ...INITIAL_PHOTOS[i],
            ...p,
            bibleVerse: INITIAL_PHOTOS[i].bibleVerse
          }));
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PHOTOS;
  });

  // Save changes to localStorage
  const savePhotos = (updated: PhotoItem[]) => {
    setPhotos(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage quota warning:", err);
    }
  };

  const handleUpdateSinglePhoto = (id: number, newSrc: string) => {
    const updated = photos.map(p => p.id === id ? { ...p, customSrc: newSrc } : p);
    savePhotos(updated);
  };

  const handleBatchUpdatePhotos = (updates: { id: number; src: string }[]) => {
    const updateMap = new Map(updates.map(u => [u.id, u.src]));
    const updated = photos.map(p => {
      if (updateMap.has(p.id)) {
        return { ...p, customSrc: updateMap.get(p.id) };
      }
      return p;
    });
    savePhotos(updated);
  };

  const handleResetPhotos = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setPhotos(INITIAL_PHOTOS);
  };

  const handleStartExperience = () => {
    setHasStarted(true);
    // Start nostalgic background music on first interaction
    audioEngine.play().then(() => {
      setIsAudioPlaying(true);
    }).catch(() => {
      // Audio autoplay policy fallback
    });

    // Welcome celebration confetti burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleToggleAudio = () => {
    const newState = audioEngine.toggle();
    setIsAudioPlaying(newState);
  };

  // Switch view helper
  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  // Jump from gallery directly into story mode at selected photo
  const handleSelectPhotoFromGallery = (index: number) => {
    setCurrentStoryIndex(index);
    setCurrentView('story');
  };

  return (
    <main className="w-full h-screen h-[100dvh] overflow-hidden bg-black text-white font-sans flex flex-col relative select-none">
      {!hasStarted ? (
        <IntroScreen
          onStart={handleStartExperience}
          featuredPhoto={photos[19] || photos[0]}
        />
      ) : (
        <div className="w-full h-full flex flex-col relative overflow-hidden">
          {/* Active View */}
          <div className="w-full flex-1 relative overflow-hidden">
            {currentView === 'story' && (
              <StoryView
                photos={photos}
                currentIndex={currentStoryIndex}
                onIndexChange={setCurrentStoryIndex}
                isAudioPlaying={isAudioPlaying}
                onToggleAudio={handleToggleAudio}
                onOpenLetter={() => setCurrentView('letter')}
                onOpenManager={() => setIsManagerOpen(true)}
              />
            )}

            {currentView === 'gallery' && (
              <GalleryView
                photos={photos}
                onSelectPhoto={handleSelectPhotoFromGallery}
                onPlayFromStart={() => {
                  setCurrentStoryIndex(0);
                  setCurrentView('story');
                }}
              />
            )}

            {currentView === 'letter' && (
              <BirthdayLetter
                onBackToStory={() => setCurrentView('story')}
              />
            )}
          </div>

          {/* Persistent iOS Floating Dock Navigation */}
          <IOSNavbar
            currentView={currentView}
            onViewChange={handleViewChange}
            onOpenManager={() => setIsManagerOpen(true)}
            isAudioPlaying={isAudioPlaying}
            onToggleAudio={handleToggleAudio}
          />

          {/* Photo Manager Modal Sheet */}
          <PhotoManagerModal
            isOpen={isManagerOpen}
            onClose={() => setIsManagerOpen(false)}
            photos={photos}
            onUpdatePhotoSrc={handleUpdateSinglePhoto}
            onBatchUpdatePhotos={handleBatchUpdatePhotos}
            onResetPhotos={handleResetPhotos}
          />
        </div>
      )}
    </main>
  );
}
