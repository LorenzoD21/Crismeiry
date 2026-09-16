import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  FolderCheck, 
  Download, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PhotoItem } from '../types';
import { sliceCollageImage } from '../utils/collageSlicer';
import { getPhotoUrl } from '../utils/photoUtils';

interface PhotoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoItem[];
  onUpdatePhotoSrc: (id: number, newSrc: string) => void;
  onBatchUpdatePhotos: (updates: { id: number; src: string }[]) => void;
  onResetPhotos: () => void;
}

export const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
  isOpen,
  onClose,
  photos,
  onUpdatePhotoSrc,
  onBatchUpdatePhotos,
  onResetPhotos
}) => {
  const [isProcessingCollage, setIsProcessingCollage] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedPhotoToReplace, setSelectedPhotoToReplace] = useState<number | null>(null);

  const collageInputRef = useRef<HTMLInputElement>(null);
  const singlePhotoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCollageUpload = async (file: File) => {
    try {
      setIsProcessingCollage(true);
      const sliced = await sliceCollageImage(file);
      const updates = sliced.map(s => ({ id: s.id, src: s.dataUrl }));
      onBatchUpdatePhotos(updates);
      setSuccessMessage("¡Las 20 fotos del collage fueron recortadas e importadas con éxito! 🎉");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
      alert("No se pudo procesar la imagen. Intenta de nuevo.");
    } finally {
      setIsProcessingCollage(false);
    }
  };

  const handleSinglePhotoUpload = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onUpdatePhotoSrc(id, e.target.result as string);
        setSuccessMessage(`¡Foto #${id} actualizada correctamente! ✨`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-zinc-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <FolderCheck size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-white leading-none">
                Carpeta Global & Gestor de Fotos
              </h2>
              <span className="text-[11px] text-zinc-400 font-mono">
                Carpeta física: /public/photos/ (1.jpeg al 20.jpeg)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto no-scrollbar space-y-4 text-left">
          {/* Notification feedback */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Super Feature: Auto-Cortar Collage Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/30">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-300 uppercase tracking-wider mb-1">
                  <Sparkles size={13} />
                  HERRAMIENTA MÁGICA DE COLLAGE
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  ¿Tienes la imagen con las 20 fotos juntas?
                </h3>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  Sube la imagen del collage y nuestro sistema recortará automáticamente cada una de las 20 fotos para colocarlas en orden en la historia.
                </p>
              </div>

              <input
                type="file"
                ref={collageInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCollageUpload(file);
                }}
              />

              <button
                onClick={() => collageInputRef.current?.click()}
                disabled={isProcessingCollage}
                className="shrink-0 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-pink-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Upload size={14} />
                <span>{isProcessingCollage ? "Recortando..." : "Subir Collage"}</span>
              </button>
            </div>
          </div>

          {/* Folder Instructions */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300">
            <div className="flex items-center gap-2 font-medium text-white mb-1">
              <FolderCheck size={14} className="text-pink-400" />
              <span>Ubicación permanente de archivos:</span>
            </div>
            <p className="leading-relaxed">
              La carpeta global <code className="bg-black/50 px-1.5 py-0.5 rounded text-pink-300 font-mono">/public/photos/</code> ya está lista con los archivos en formato JPEG desde <code className="bg-black/50 px-1 rounded text-pink-300 font-mono">1.jpeg</code> hasta <code className="bg-black/50 px-1 rounded text-pink-300 font-mono">20.jpeg</code> (también compatibles con <code className="bg-black/50 px-1 rounded text-zinc-300 font-mono">.jpg</code>).
            </p>
          </div>

          {/* 20 Photos Grid to replace individually */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Reemplazar Fotos Individuales (1 a 20)
            </h4>

            <input
              type="file"
              ref={singlePhotoInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && selectedPhotoToReplace !== null) {
                  handleSinglePhotoUpload(selectedPhotoToReplace, file);
                }
              }}
            />

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto no-scrollbar p-1">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="relative rounded-xl overflow-hidden aspect-[4/5] bg-zinc-800 border border-white/10 group cursor-pointer"
                  onClick={() => {
                    setSelectedPhotoToReplace(p.id);
                    singlePhotoInputRef.current?.click();
                  }}
                  title={`Cambiar foto #${p.id}`}
                >
                  <img
                    src={getPhotoUrl(p)}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex flex-col items-center justify-center p-1 text-center">
                    <span className="text-[11px] font-mono font-bold text-white bg-black/70 px-1.5 py-0.5 rounded">
                      #{p.id}
                    </span>
                    <span className="text-[9px] text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity font-medium mt-1">
                      Cambiar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/20">
          <button
            onClick={onResetPhotos}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Restablecer fotos originales</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-white text-black text-xs font-semibold cursor-pointer active:scale-95 transition-all"
          >
            Listo
          </button>
        </div>
      </motion.div>
    </div>
  );
};
