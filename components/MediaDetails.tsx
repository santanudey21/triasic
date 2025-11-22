import React, { useState } from 'react';
import { X, Star, Calendar, Monitor, Smile, CheckCircle, Circle, Trash2, ArrowUpToLine, Youtube, PenLine, ChevronDown, ChevronUp, ListVideo, Check } from 'lucide-react';
import { MediaItem } from '../types';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaDetailsProps {
  item: MediaItem;
  onClose: () => void;
  onToggleWatched: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveToTop: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onUpdateProgress?: (id: string, episode: number) => void;
}

export const MediaDetails: React.FC<MediaDetailsProps> = ({ 
  item, 
  onClose, 
  onToggleWatched, 
  onDelete,
  onMoveToTop,
  onUpdateNotes,
  onUpdateProgress
}) => {
  const seed = item.title.replace(/\s/g, '');
  const imageUrl = item.posterUrl || `https://picsum.photos/seed/${seed}/600/900`;
  const [notes, setNotes] = useState(item.notes || '');
  const [showEpisodes, setShowEpisodes] = useState(false);

  const isSeries = ['Series', 'Anime', 'Web Show'].includes(item.type);
  const totalEpisodes = item.progress?.totalEpisodes || 24;
  const currentEp = item.progress?.currentEpisode || 0;

  const handleBlurNotes = () => {
      if (onUpdateNotes && notes !== item.notes) {
          onUpdateNotes(item.id, notes);
      }
  };

  const handleTrailerSearch = () => {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' trailer')}`, '_blank', 'noopener,noreferrer');
  };

  const handleEpisodeClick = (epNum: number) => {
      if (!onUpdateProgress) return;
      // If clicking the current episode, toggle it off (go back one step), else jump to that episode
      const newProgress = (epNum === currentEp) ? epNum - 1 : epNum;
      onUpdateProgress(item.id, newProgress);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
      />

      {/* Sheet / Modal */}
      <motion.div 
        layoutId={item.id}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
            if (info.offset.y > 150 || info.velocity.y > 500) {
                onClose();
            }
        }}
        className="bg-md-sys-surface w-full sm:max-w-2xl h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle (Mobile) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/40 rounded-full sm:hidden z-20" />

        {/* Close Button */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X size={24} />
        </motion.button>

        {/* Header Image */}
        <div className="relative h-72 shrink-0">
          <motion.img 
            layoutId={`poster-${item.id}`}
            src={imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-md-sys-surface via-md-sys-surface/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-1 bg-md-sys-primaryContainer text-md-sys-onPrimaryContainer text-xs font-bold rounded-md uppercase tracking-wider shadow-sm">
                    {item.type}
                </span>
                {item.year && (
                    <span className="px-2 py-1 bg-black/40 text-white backdrop-blur-md text-xs font-bold rounded-md flex items-center gap-1">
                        <Calendar size={12} /> {item.year}
                    </span>
                )}
            </div>
            <motion.h2 
                layoutId={`title-${item.id}`}
                className="text-3xl sm:text-4xl font-bold text-md-sys-onSurface leading-tight drop-shadow-sm"
            >
                {item.title}
            </motion.h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6 overscroll-contain">
          
          <div className="flex items-center gap-3 pb-2">
              <Button variant="filled" onClick={handleTrailerSearch} className="!py-2 !px-4 !text-sm bg-red-600 hover:bg-red-700 text-white shadow-md">
                  <Youtube size={18} className="mr-2" /> Play Trailer
              </Button>
              <Button 
                 variant="outlined" 
                 onClick={() => onToggleWatched(item.id)}
                 className={`!py-2 !px-4 !text-sm ${item.watched ? 'border-green-600 text-green-600 bg-green-50' : ''}`}
              >
                 {item.watched ? <CheckCircle size={18} className="mr-2" /> : <Circle size={18} className="mr-2" />}
                 {item.watched ? 'Watched' : 'Mark Watched'}
              </Button>
          </div>

          <div className="flex items-center gap-6 text-sm text-md-sys-onSurfaceVariant border-y border-md-sys-outline/10 py-4">
             {item.rating && (
                 <div className="flex items-center gap-1 text-yellow-600 font-bold">
                     <Star size={18} className="fill-yellow-500 text-yellow-500" />
                     {item.rating}/5
                 </div>
             )}
             {item.progress && (
                 <div className="flex items-center gap-1 bg-md-sys-secondaryContainer/50 px-3 py-1 rounded-full text-md-sys-onSecondaryContainer">
                     <span className="font-bold text-xs">PROGRESS</span> 
                     <span className="font-medium ml-1">S{item.progress.currentSeason} E{item.progress.currentEpisode}</span>
                 </div>
             )}
          </div>

          {item.description && (
              <div>
                  <h3 className="text-sm font-bold text-md-sys-onSurfaceVariant uppercase tracking-wider mb-2">Synopsis</h3>
                  <p className="text-md-sys-onSurface leading-relaxed opacity-90">{item.description}</p>
              </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             {item.platforms && item.platforms.length > 0 && (
                 <div>
                     <h3 className="text-sm font-bold text-md-sys-onSurfaceVariant uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Monitor size={16} /> Available On
                     </h3>
                     <div className="flex flex-wrap gap-2">
                         {item.platforms.map(p => (
                             <span key={p} className="px-3 py-1.5 bg-white border border-md-sys-outline/20 shadow-sm rounded-lg text-sm font-bold text-md-sys-primary">
                                 {p}
                             </span>
                         ))}
                     </div>
                 </div>
             )}

             {item.genres && item.genres.length > 0 && (
                 <div>
                     <h3 className="text-sm font-bold text-md-sys-onSurfaceVariant uppercase tracking-wider mb-2">Genres</h3>
                     <div className="flex flex-wrap gap-2">
                         {item.genres.map(g => (
                             <span key={g} className="px-2 py-1 bg-md-sys-surfaceVariant/50 rounded-md text-xs font-medium text-md-sys-onSurfaceVariant">
                                 {g}
                             </span>
                         ))}
                     </div>
                 </div>
             )}
          </div>
          
          {/* Episodes List for Series */}
          {isSeries && onUpdateProgress && (
              <div className="bg-md-sys-surface border border-md-sys-outline/10 rounded-xl overflow-hidden">
                  <button 
                      onClick={() => setShowEpisodes(!showEpisodes)}
                      className="flex items-center justify-between w-full p-4 bg-md-sys-surfaceVariant/20 hover:bg-md-sys-surfaceVariant/40 transition-colors"
                  >
                      <h3 className="text-sm font-bold text-md-sys-onSurfaceVariant uppercase tracking-wider flex items-center gap-2">
                          <ListVideo size={16} /> Episodes ({currentEp}/{totalEpisodes})
                      </h3>
                      <div className={`p-1 rounded-full transition-transform duration-300 ${showEpisodes ? 'rotate-180' : ''}`}>
                          <ChevronDown size={20} className="text-md-sys-onSurfaceVariant" />
                      </div>
                  </button>

                  <AnimatePresence>
                      {showEpisodes && (
                          <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-md-sys-outline/10"
                          >
                              <div className="max-h-60 overflow-y-auto p-2 space-y-2 bg-md-sys-surfaceVariant/10">
                                  {Array.from({ length: totalEpisodes }).map((_, i) => {
                                      const epNum = i + 1;
                                      const isWatched = epNum <= currentEp;
                                      return (
                                          <motion.button
                                              key={epNum}
                                              whileTap={{ scale: 0.98 }}
                                              onClick={() => handleEpisodeClick(epNum)}
                                              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                                  isWatched 
                                                  ? 'bg-md-sys-primaryContainer/30 border-md-sys-primary/20' 
                                                  : 'bg-md-sys-surface border-md-sys-outline/10 hover:border-md-sys-outline/30'
                                              }`}
                                          >
                                              <span className={`text-sm font-medium ${isWatched ? 'text-md-sys-primary' : 'text-md-sys-onSurface'}`}>
                                                  Episode {epNum}
                                              </span>
                                              <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                                                  isWatched 
                                                  ? 'bg-md-sys-primary border-md-sys-primary text-md-sys-onPrimary' 
                                                  : 'border-md-sys-outline/30 text-transparent'
                                              }`}>
                                                  <Check size={14} strokeWidth={3} />
                                              </div>
                                          </motion.button>
                                      );
                                  })}
                              </div>
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
          )}

          <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
              <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <PenLine size={16} /> Personal Notes
              </h3>
              <textarea 
                  className="w-full bg-transparent text-md-sys-onSurface text-sm resize-y focus:outline-none min-h-[60px]"
                  placeholder="Write your thoughts here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleBlurNotes}
              />
          </div>

          {item.moods && item.moods.length > 0 && (
              <div>
                  <h3 className="text-sm font-bold text-md-sys-onSurfaceVariant uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Smile size={16} /> Vibe
                  </h3>
                  <div className="flex flex-wrap gap-2">
                      {item.moods.map(m => (
                          <span key={m} className="px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-100 text-xs font-bold">
                              #{m}
                          </span>
                      ))}
                  </div>
              </div>
          )}
        </div>

        <div className="p-4 bg-md-sys-surface border-t border-md-sys-outline/10 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
             <Button 
                variant="outlined" 
                onClick={() => { onMoveToTop(item.id); onClose(); }}
                className="flex items-center justify-center gap-2"
             >
                <ArrowUpToLine size={18} /> Move to Top
             </Button>
             
             <div className="col-span-2 sm:col-span-1 sm:ml-auto">
                 <Button 
                    variant="text" 
                    onClick={() => { onDelete(item.id); onClose(); }}
                    className="w-full text-md-sys-error hover:bg-md-sys-error/10"
                 >
                    <Trash2 size={18} className="mr-2" /> Delete
                 </Button>
             </div>
        </div>
      </motion.div>
    </div>
  );
};