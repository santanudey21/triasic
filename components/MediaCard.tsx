import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '../types';
import { Trash2, CheckCircle, Circle, Star, Plus, CheckSquare, Square, ArrowUpToLine, StickyNote, Image as ImageIcon } from 'lucide-react';
import { motion, PanInfo, useAnimation, useScroll, useTransform, useMotionValue } from 'framer-motion';

interface MediaCardProps {
  item: MediaItem;
  isSelected: boolean;
  isSelectionMode: boolean;
  onSelect: (id: string) => void;
  onPress: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onToggleWatched: (id: string) => void;
  onUpdateProgress?: (id: string, newEpisode: number) => void;
  onMoveToTop?: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  scrollContainerRef?: React.RefObject<HTMLElement>;
}

export const MediaCard: React.FC<MediaCardProps> = ({ 
  item, 
  isSelected, 
  isSelectionMode, 
  onSelect, 
  onPress, 
  onDelete, 
  onToggleWatched, 
  onUpdateProgress,
  onMoveToTop,
  onUpdateNotes,
  scrollContainerRef
}) => {
  const seed = item.title.replace(/\s/g, '');
  const imageUrl = item.posterUrl || `https://picsum.photos/seed/${seed}/300/450`;
  const isSeries = item.type === 'Series' || item.type === 'Anime' || item.type === 'Web Show';

  // Gesture & Animation State
  const cardRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const [showNotes, setShowNotes] = useState(false);
  const [localNote, setLocalNote] = useState(item.notes || '');
  const [imgHasError, setImgHasError] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Visual Transforms for Swipe Actions
  const leftIconOpacity = useTransform(x, [30, 100], [0, 1]);
  const leftIconScale = useTransform(x, [30, 100], [0.8, 1.2]);
  
  const rightIconOpacity = useTransform(x, [-30, -100], [0, 1]);
  const rightIconScale = useTransform(x, [-30, -100], [0.8, 1.2]);

  // Dynamic Background Color based on swipe direction
  // Left Swipe (Negative X) -> Green tint (Watched)
  // Right Swipe (Positive X) -> Cyan tint (Move to Top)
  const swipeBg = useTransform(
    x,
    [-150, 0, 150],
    ['rgba(34, 197, 94, 0.2)', 'rgba(0, 0, 0, 0)', 'rgba(6, 182, 212, 0.2)']
  );

  // Parallax Logic
  const { scrollXProgress } = useScroll({
    container: scrollContainerRef,
    target: cardRef,
    axis: "x",
    offset: ["start end", "end start"]
  });
  
  // Only apply parallax if scrollContainerRef is present (Carousel mode)
  const parallaxX = useTransform(scrollXProgress, [0, 1], ["-15%", "15%"]);
  const shouldUseParallax = !!scrollContainerRef;
  
  // Image Loading State
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    setLocalNote(item.notes || '');
  }, [item.notes]);

  // Swipe Logic using Framer Motion
  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Right Swipe -> Move to Top
    if (offset > 100 || velocity > 500) {
      if (onMoveToTop) {
        if (navigator.vibrate) navigator.vibrate(20);
        onMoveToTop(item.id);
      }
    } 
    // Left Swipe -> Mark Watched
    else if (offset < -100 || velocity < -500) {
      if (navigator.vibrate) navigator.vibrate(20);
      onToggleWatched(item.id);
    }

    // Spring back to center
    controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } });
  };

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      onSelect(item.id);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const handleClick = () => {
    if (isSelectionMode) {
      onSelect(item.id);
    } else {
      onPress(item);
    }
  };

  const handleIncrementEpisode = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (navigator.vibrate) navigator.vibrate(10);
      if (onUpdateProgress) {
          const currentEp = item.progress ? item.progress.currentEpisode : 0;
          onUpdateProgress(item.id, currentEp + 1);
      }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!isSeries || !onUpdateProgress) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const total = item.progress?.totalEpisodes || 24;
      const newEpisode = Math.round(percentage * total);
      
      if (navigator.vibrate) navigator.vibrate(10);
      onUpdateProgress(item.id, newEpisode);
  };

  const toggleNotes = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowNotes(!showNotes);
  };

  const saveNote = () => {
      if (onUpdateNotes && localNote !== item.notes) {
          onUpdateNotes(item.id, localNote);
      }
  };

  return (
    <div className="relative h-full" ref={cardRef}>
        {/* Background Layer for Swipe Actions */}
        <motion.div 
             style={{ backgroundColor: swipeBg }}
             className="absolute inset-0 rounded-3xl flex items-center justify-between px-8 overflow-hidden z-0 border border-md-sys-outline/10"
        >
             {/* Left Side - Move to Top (Visible when swiping Right) */}
             <motion.div 
                style={{ opacity: leftIconOpacity, scale: leftIconScale }}
                className="flex flex-col items-center text-md-sys-primary"
             >
                <ArrowUpToLine size={32} strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Top</span>
             </motion.div>

             {/* Right Side - Mark Watched (Visible when swiping Left) */}
             <motion.div 
                style={{ opacity: rightIconOpacity, scale: rightIconScale }}
                className="flex flex-col items-center text-green-600"
             >
                {item.watched ? <Circle size={32} strokeWidth={2.5} /> : <CheckCircle size={32} strokeWidth={2.5} />}
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{item.watched ? 'Unwatch' : 'Watched'}</span>
             </motion.div>
        </motion.div>

        {/* Main Card */}
        <motion.div 
            layoutId={item.id}
            style={{ x }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2} // Resistance feeling
            onDragEnd={handleDragEnd}
            animate={controls}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02, y: -4 }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`relative z-10 h-full bg-md-sys-surface rounded-3xl overflow-hidden border border-md-sys-surfaceVariant/50 flex flex-col shadow-sm hover:shadow-md select-none ${isSelected ? 'ring-4 ring-md-sys-primary' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
        >
            {/* Selection Overlay */}
            {isSelectionMode && (
                <div className="absolute top-3 right-3 z-30 text-md-sys-primary bg-md-sys-surface rounded-full p-1 shadow-sm">
                    {isSelected ? <CheckSquare size={24} className="fill-md-sys-primaryContainer" /> : <Square size={24} className="text-md-sys-outline" />}
                </div>
            )}

            {/* Poster Area */}
            <div className="relative aspect-[2/3] bg-md-sys-surfaceVariant overflow-hidden">
                {imgLoading && !imgHasError && (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-md-sys-surfaceVariant via-md-sys-surface to-md-sys-surfaceVariant animate-pulse z-10 opacity-50" />
                )}
                
                {!imgHasError ? (
                    <motion.img 
                        layoutId={`poster-${item.id}`}
                        src={imageUrl} 
                        alt={item.title} 
                        style={shouldUseParallax ? { x: parallaxX, scale: 1.15 } : {}}
                        className="w-full h-full object-cover" 
                        draggable="false"
                        onLoad={() => setImgLoading(false)}
                        onError={() => { setImgHasError(true); setImgLoading(false); }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-md-sys-surfaceVariant text-md-sys-onSurfaceVariant/50 p-4 text-center">
                        <ImageIcon size={48} className="mb-2 opacity-50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 line-clamp-2">{item.title}</span>
                    </div>
                )}
                
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    <div className="bg-md-sys-surface/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-md-sys-onSurface uppercase tracking-wider shadow-sm w-fit">
                        {item.type}
                    </div>
                    {item.year && (
                        <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white w-fit">
                            {item.year}
                        </div>
                    )}
                </div>

                {/* Hover Overlay for Desktop */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 hidden sm:flex z-20">
                    {isSeries && !item.watched && (
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={handleIncrementEpisode}
                            className="w-full bg-md-sys-primary text-md-sys-onPrimary py-2 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Plus size={16} /> Next Ep {item.progress ? item.progress.currentEpisode + 1 : 1}
                        </motion.button>
                    )}
                </div>
            </div>
            
            {/* Content Area */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="mb-1">
                    <h3 className="text-lg font-bold text-md-sys-onSurface leading-tight line-clamp-2">{item.title}</h3>
                </div>
                
                {item.rating ? (
                    <div className="flex items-center gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                        key={star}
                        size={12}
                        className={`${star <= item.rating! ? "fill-yellow-500 text-yellow-500" : "text-md-sys-outline/30"}`}
                        />
                    ))}
                    </div>
                ) : null}

                {isSeries && (
                    <div className="mb-3">
                        <div className="flex justify-between items-center text-xs text-md-sys-onSurfaceVariant mb-1">
                            <span className="font-medium">S{item.progress?.currentSeason || 1} : E{item.progress?.currentEpisode || 0}</span>
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={handleIncrementEpisode}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-md-sys-primaryContainer text-md-sys-onPrimaryContainer hover:bg-md-sys-primary hover:text-md-sys-onPrimary transition-colors"
                            >
                                <Plus size={10} strokeWidth={3} /> Ep
                            </motion.button>
                        </div>
                        
                        <div 
                            className="h-2 w-full bg-md-sys-surfaceVariant rounded-full overflow-hidden cursor-pointer relative group"
                            onClick={handleProgressBarClick}
                            title="Click to set progress"
                        >
                            <motion.div 
                                className="h-full bg-md-sys-primary group-hover:bg-md-sys-primary/80 transition-colors"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, ((item.progress?.currentEpisode || 0) / (item.progress?.totalEpisodes || 24)) * 100)}%` }}
                                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex-1">
                    {item.genres && item.genres.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {item.genres.slice(0, 3).map(g => (
                                <span key={g} className="text-[10px] px-1.5 py-0.5 bg-md-sys-surfaceVariant rounded-md text-md-sys-onSurfaceVariant">
                                    {g}
                                </span>
                            ))}
                        </div>
                    ) : (
                        item.description && <p className="text-xs text-md-sys-onSurfaceVariant line-clamp-2 mb-2">{item.description}</p>
                    )}
                </div>
                
                {showNotes && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-2 mb-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100/50" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <textarea 
                            className="w-full bg-transparent text-xs text-md-sys-onSurface p-1 focus:outline-none resize-none placeholder-yellow-800/30"
                            rows={2}
                            placeholder="Note..."
                            value={localNote}
                            onChange={(e) => setLocalNote(e.target.value)}
                            onBlur={saveNote}
                            autoFocus
                        />
                    </motion.div>
                )}

                {/* Action Footer - Always visible */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-md-sys-surfaceVariant/30">
                    <div className="flex gap-2">
                        <motion.button title="Mark as Watched" whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); onToggleWatched(item.id); }} className={`p-1.5 rounded-full ${item.watched ? 'text-green-600 bg-green-50' : 'text-md-sys-secondary'}`}>
                            {item.watched ? <CheckCircle size={18} /> : <Circle size={18} />}
                        </motion.button>
                        <motion.button title="Move to Top" whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); if(onMoveToTop) onMoveToTop(item.id); }} className="p-1.5 rounded-full text-md-sys-secondary">
                            <ArrowUpToLine size={18} />
                        </motion.button>
                        <motion.button title="Add Note" whileTap={{ scale: 0.8 }} onClick={toggleNotes} className={`p-1.5 rounded-full ${showNotes || item.notes ? 'text-yellow-600 bg-yellow-50' : 'text-md-sys-secondary'}`}>
                            <StickyNote size={18} className={item.notes ? "fill-yellow-400" : ""} />
                        </motion.button>
                    </div>
                    <motion.button title="Delete" whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="hidden sm:block text-md-sys-outline hover:text-md-sys-error p-1.5 rounded-full">
                        <Trash2 size={18} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    </div>
  );
};
