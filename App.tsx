import React, { useState, useEffect } from 'react';
import { Plus, Menu, X, Smile, Sparkles, Star, LayoutGrid, Home as HomeIcon, Camera, Search, CheckSquare, Trash2, CheckCircle, PlayCircle, Clock, Bot, Palette } from 'lucide-react';
import { MediaItem, MediaType, Suggestion, HomeData } from './types';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { MediaCard } from './components/MediaCard';
import { MediaDetails } from './components/MediaDetails';
import { AISuggestions } from './components/AISuggestions';
import { PullToRefresh } from './components/PullToRefresh';
import { getDiscoveryContent, searchMediaDetails } from './services/geminiService';
import { Home } from './components/Home';
import { ScreenshotUploader } from './components/ScreenshotUploader';
import { SearchPage } from './components/SearchPage';
import { SantaAssistant } from './components/SantaAssistant';
import { ThemeSelector } from './components/ThemeSelector';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// --- Main App ---
function App() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<MediaType | 'All' | 'Continue'>('All');
  const [activeMood, setActiveMood] = useState<string>('All Moods');
  const [currentView, setCurrentView] = useState<'home' | 'mylist' | 'search' | 'santa' | 'themes'>('home');
  
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [isAmoled, setIsAmoled] = useState<boolean>(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isScreenshotOpen, setIsScreenshotOpen] = useState(false);
  
  // Item Interaction State
  const [viewingItem, setViewingItem] = useState<MediaItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const isSelectionMode = selectedItems.size > 0;

  // Home Page Data
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loadingHome, setLoadingHome] = useState(false);

  // Add Modal & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Partial<MediaItem> | null>(null);

  // Manual Fallback fields
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<MediaType>('Movie');
  const [newItemRating, setNewItemRating] = useState<number>(0);

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Constants
  const MOODS = ['All Moods', 'Chill', 'Exciting', 'Funny', 'Romantic', 'Dark', 'Inspiring', 'Scary'];
  const TYPES: MediaType[] = ['Movie', 'Series', 'Anime', 'Web Show', 'YouTube', 'OTT'];

  // Helpers
  const vibrate = () => { if (navigator.vibrate) navigator.vibrate(10); };

  // Load data & theme
  useEffect(() => {
    const savedMedia = localStorage.getItem('triasic_media');
    if (savedMedia) setMediaList(JSON.parse(savedMedia));
    
    const savedTheme = localStorage.getItem('triasic_theme');
    if (savedTheme) setCurrentTheme(savedTheme);

    const savedAmoled = localStorage.getItem('triasic_amoled');
    if (savedAmoled) setIsAmoled(JSON.parse(savedAmoled));

    loadHomeContent();
  }, []);

  // Apply Theme to Body
  useEffect(() => {
    // Remove old theme classes
    document.body.classList.remove('theme-default', 'theme-dynamic', 'theme-cloudflare', 'theme-cotton', 'amoled-mode');
    
    // Add new theme class
    if (currentTheme !== 'default') {
        document.body.classList.add(`theme-${currentTheme}`);
    }
    
    // Add amoled class
    if (isAmoled) {
        document.body.classList.add('amoled-mode');
    }

    // Persist
    localStorage.setItem('triasic_theme', currentTheme);
    localStorage.setItem('triasic_amoled', JSON.stringify(isAmoled));

  }, [currentTheme, isAmoled]);

  const loadHomeContent = async () => {
    if (!homeData) {
        setLoadingHome(true);
        const data = await getDiscoveryContent();
        if (data) setHomeData(data);
        setLoadingHome(false);
    }
  };

  // Save data
  useEffect(() => {
    localStorage.setItem('triasic_media', JSON.stringify(mediaList));
  }, [mediaList]);

  const handleRefreshList = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleSmartSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      setIsSearching(true);
      const result = await searchMediaDetails(searchQuery);
      if (result) {
          setSearchResult(result);
          setNewItemTitle(result.title || searchQuery);
          setNewItemType(result.type || 'Movie');
          setNewItemRating(result.rating || 0);
      }
      setIsSearching(false);
  };

  const handleAddFromSearchPage = (item: Partial<MediaItem>) => {
      const newItem: MediaItem = {
          id: Date.now().toString(),
          title: item.title || 'Untitled',
          type: item.type || 'Movie',
          description: item.description,
          watched: false,
          posterUrl: item.posterUrl,
          platforms: item.platforms,
          genres: item.genres,
          year: item.year,
          progress: item.progress,
          moods: item.moods
      };
      setMediaList([newItem, ...mediaList]);
      vibrate();
  };

  const confirmAddItem = () => {
    const finalTitle = newItemTitle || searchResult?.title || searchQuery;
    if (!finalTitle) return;

    const isSeriesType = ['Series', 'Anime', 'Web Show'].includes(newItemType);
    
    let finalProgress = searchResult?.progress;
    if (isSeriesType && !finalProgress) {
        finalProgress = {
            currentSeason: 1,
            currentEpisode: 0,
            totalEpisodes: 24 
        };
    }

    const newItem: MediaItem = {
      id: Date.now().toString(),
      title: finalTitle,
      type: newItemType,
      description: searchResult?.description,
      rating: newItemRating > 0 ? newItemRating : undefined,
      watched: false,
      posterUrl: searchResult?.posterUrl,
      platforms: searchResult?.platforms,
      genres: searchResult?.genres,
      year: searchResult?.year,
      progress: finalProgress,
      moods: searchResult?.moods
    };

    setMediaList([newItem, ...mediaList]);
    resetAddModal();
    setCurrentView('mylist');
    vibrate();
  };

  const resetAddModal = () => {
    setNewItemTitle('');
    setSearchQuery('');
    setSearchResult(null);
    setNewItemRating(0);
    setIsAddModalOpen(false);
  };

  const handleScreenshotScan = (data: Partial<MediaItem>) => {
      setIsScreenshotOpen(false);
      setSearchResult(data);
      setNewItemTitle(data.title || '');
      if (data.type) setNewItemType(data.type);
      setIsAddModalOpen(true);
  };

  const addSuggestion = (s: Suggestion) => {
      if (mediaList.some(m => m.title === s.title)) return;

      const isSeriesType = ['Series', 'Anime', 'Web Show'].includes(s.type);
      const newItem: MediaItem = {
          id: Date.now().toString(),
          title: s.title,
          type: s.type,
          description: s.reason, 
          watched: false,
          posterUrl: s.posterUrl,
          year: s.year,
          platforms: s.platforms,
          progress: isSeriesType ? { currentSeason: 1, currentEpisode: 0, totalEpisodes: 24 } : undefined
      };
      setMediaList([newItem, ...mediaList]);
      setCurrentView('mylist');
      vibrate();
  };

  const openAddModalWithItem = (s: Suggestion) => {
    setNewItemTitle(s.title);
    setNewItemType(s.type);
    setSearchQuery(s.title); 
    setIsAddModalOpen(true);
  };

  const deleteItem = (id: string) => {
    setMediaList(mediaList.filter(item => item.id !== id));
  };

  const toggleWatched = (id: string) => {
    setMediaList(mediaList.map(item => 
      item.id === id ? { ...item, watched: !item.watched } : item
    ));
  };

  const updateProgress = (id: string, newEpisode: number) => {
      setMediaList(mediaList.map(item => {
          if (item.id !== id) return item;
          const currentProgress = item.progress || { currentSeason: 1, currentEpisode: 0, totalEpisodes: 24 };
          return { ...item, progress: { ...currentProgress, currentEpisode: newEpisode } };
      }));
  };

  const updateNotes = (id: string, notes: string) => {
      setMediaList(mediaList.map(item => 
        item.id === id ? { ...item, notes } : item
      ));
  };

  const moveToTop = (id: string) => {
      const itemIndex = mediaList.findIndex(i => i.id === id);
      if (itemIndex > -1) {
          const newList = [...mediaList];
          const [item] = newList.splice(itemIndex, 1);
          newList.unshift(item);
          setMediaList(newList);
      }
  };

  const toggleSelection = (id: string) => {
    vibrate();
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  };

  const clearSelection = () => setSelectedItems(new Set());

  const batchDelete = () => {
      setMediaList(mediaList.filter(item => !selectedItems.has(item.id)));
      clearSelection();
  };

  const batchMarkWatched = () => {
      setMediaList(mediaList.map(item => 
          selectedItems.has(item.id) ? { ...item, watched: true } : item
      ));
      clearSelection();
  };

  // --- Filters ---
  const filteredList = mediaList.filter(item => {
      const matchesMood = activeMood === 'All Moods' || (item.moods && item.moods.some(m => m.toLowerCase().includes(activeMood.toLowerCase())));
      if (activeTab === 'Continue') return !item.watched && item.progress && item.progress.currentEpisode > 0 && matchesMood;
      const matchesType = activeTab === 'All' || item.type === activeTab;
      return matchesType && matchesMood;
  });

  const continueWatchingItems = mediaList.filter(item => 
    !item.watched && item.progress && item.progress.currentEpisode > 0
  );

  const navigateTo = (view: typeof currentView) => {
      vibrate();
      setCurrentView(view);
      setMobileMenuOpen(false);
  };

  // --- Animation Variants ---
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 font-sans relative bg-transparent text-md-sys-onSurface overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-md-sys-outline/10 px-4 py-3 supports-[backdrop-filter]:bg-white/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo('home')}>
                    <motion.div 
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-shadow"
                    >
                        {/* Custom Logo SVG based on user image */}
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <defs>
                            <radialGradient id="logoGrad" cx="30%" cy="30%" r="70%">
                              <stop offset="0%" stopColor="#DDD6FE" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </radialGradient>
                          </defs>
                          <circle cx="50" cy="50" r="50" fill="url(#logoGrad)" />
                          {/* Eyes */}
                          <ellipse cx="38" cy="45" rx="10" ry="16" fill="white" />
                          <ellipse cx="62" cy="45" rx="10" ry="16" fill="white" />
                          {/* Pupils looking left */}
                          <circle cx="34" cy="45" r="5" fill="#1F2937" />
                          <circle cx="58" cy="45" r="5" fill="#1F2937" />
                        </svg>
                    </motion.div>
                    <span className="text-xl font-bold tracking-tight hidden sm:block text-md-sys-primary">Triasic</span>
                </div>

                <div className="hidden md:flex items-center gap-1 bg-md-sys-surfaceVariant/30 p-1 rounded-full">
                    {['home', 'mylist', 'search', 'santa'].map((view) => (
                        <button 
                            key={view}
                            onClick={() => navigateTo(view as any)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 relative ${
                                currentView === view ? 'text-md-sys-primary' : 'text-md-sys-onSurfaceVariant hover:text-md-sys-onSurface'
                            }`}
                        >
                            {currentView === view && (
                                <motion.div 
                                    layoutId="nav-pill" 
                                    className="absolute inset-0 bg-white shadow-sm rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2 capitalize">
                                {view === 'home' && <HomeIcon size={18} />}
                                {view === 'mylist' && <LayoutGrid size={18} />}
                                {view === 'search' && <Search size={18} />}
                                {view === 'santa' && <Bot size={18} />}
                                {view === 'mylist' ? 'My List' : view === 'search' ? 'Discover' : view === 'santa' ? 'Santa AI' : view}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateTo('search')} 
                    className="p-2 text-md-sys-onSurfaceVariant hover:bg-black/5 rounded-full transition-colors"
                >
                    <Search size={24} />
                </motion.button>
                
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateTo('themes')} 
                    className={`p-2 rounded-full transition-colors ${currentView === 'themes' ? 'bg-md-sys-primaryContainer text-md-sys-onPrimaryContainer' : 'text-md-sys-onSurfaceVariant hover:bg-black/5'}`}
                >
                    <Palette size={24} />
                </motion.button>

                <Button variant="text" onClick={() => setIsAIOpen(true)} className="hidden sm:flex">
                    <Sparkles size={20} className="mr-2" /> AI Picks
                </Button>
                <div className="relative md:hidden">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
        {mobileMenuOpen && (
             <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden"
            >
                 <div className="pt-4 pb-2 border-t border-md-sys-outline/10 mt-2 space-y-2">
                     <div className="flex flex-col gap-2">
                        {['home', 'mylist', 'search', 'santa'].map((view) => (
                             <button 
                                key={view}
                                onClick={() => navigateTo(view as any)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg capitalize ${currentView === view ? 'bg-md-sys-primaryContainer text-md-sys-onPrimaryContainer' : 'text-md-sys-onSurface'}`}
                            >
                                {view}
                            </button>
                        ))}
                        <button 
                            onClick={() => navigateTo('themes')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg capitalize ${currentView === 'themes' ? 'bg-md-sys-primaryContainer text-md-sys-onPrimaryContainer' : 'text-md-sys-onSurface'}`}
                        >
                            Themes
                        </button>
                     </div>
                 </div>
             </motion.div>
        )}
        </AnimatePresence>
      </nav>

      {/* Main Content with AnimatePresence */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <AnimatePresence mode="wait">
            <motion.div
                key={currentView}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                {currentView === 'home' && (
                    <Home data={homeData} isLoading={loadingHome} onAdd={openAddModalWithItem} />
                )}

                {currentView === 'search' && (
                    <SearchPage userList={mediaList} onAdd={handleAddFromSearchPage} />
                )}

                {currentView === 'santa' && (
                    <SantaAssistant />
                )}

                {currentView === 'themes' && (
                    <ThemeSelector 
                        currentTheme={currentTheme}
                        isAmoled={isAmoled}
                        onThemeChange={setCurrentTheme}
                        onAmoledToggle={setIsAmoled}
                    />
                )}

                {currentView === 'mylist' && (
                    <PullToRefresh onRefresh={handleRefreshList}>
                        <section id="my-list" className="space-y-8 pb-20">
                            {/* Continue Watching */}
                            {continueWatchingItems.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-md-sys-primary px-1">
                                        <Clock size={20} />
                                        <h3 className="text-lg font-bold uppercase tracking-wider">Continue Watching</h3>
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar mask-fade-right px-1">
                                        {continueWatchingItems.map(item => (
                                            <div key={item.id} className="flex-none w-64 snap-start">
                                                <MediaCard 
                                                    item={item}
                                                    isSelected={false}
                                                    isSelectionMode={false}
                                                    onSelect={() => {}}
                                                    onPress={(i) => setViewingItem(i)}
                                                    onDelete={deleteItem}
                                                    onToggleWatched={toggleWatched}
                                                    onUpdateProgress={updateProgress}
                                                    onUpdateNotes={updateNotes}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Main List Controls */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-md-sys-outline/10 sticky top-0 bg-transparent z-10 py-2">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h2 className="text-3xl font-normal text-md-sys-onSurface">My List</h2>
                                        <p className="text-sm text-md-sys-onSurfaceVariant">{filteredList.length} titles</p>
                                    </div>
                                    {isSelectionMode && (
                                        <button onClick={clearSelection} className="ml-auto md:ml-4 text-sm text-md-sys-primary font-bold hover:underline">
                                            Cancel Selection
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                                    {['All', 'Continue', ...TYPES].map(tab => (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            key={tab}
                                            onClick={() => { vibrate(); setActiveTab(tab as any); }}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
                                                activeTab === tab 
                                                ? 'bg-md-sys-primary text-md-sys-onPrimary border-md-sys-primary shadow-md' 
                                                : 'bg-transparent border-md-sys-outline/30 text-md-sys-onSurfaceVariant hover:bg-md-sys-surfaceVariant/50'
                                            }`}
                                        >
                                            {tab}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Moods */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
                                <span className="text-xs font-bold text-md-sys-onSurfaceVariant uppercase tracking-wider mr-2 shrink-0">Moods:</span>
                                {MOODS.map(mood => (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        key={mood}
                                        onClick={() => { vibrate(); setActiveMood(mood); }}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                                            activeMood === mood
                                            ? 'bg-md-sys-secondaryContainer text-md-sys-onSecondaryContainer border-md-sys-secondaryContainer'
                                            : 'bg-white/50 border-md-sys-outline/20 text-md-sys-onSurfaceVariant hover:bg-white'
                                        }`}
                                    >
                                        {mood}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Grid with Layout Animation */}
                            <LayoutGroup>
                                <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
                                    <AnimatePresence>
                                        {filteredList.map(item => (
                                            <MediaCard 
                                                key={item.id} 
                                                item={item} 
                                                isSelected={selectedItems.has(item.id)}
                                                isSelectionMode={isSelectionMode}
                                                onSelect={toggleSelection}
                                                onPress={(i) => setViewingItem(i)}
                                                onDelete={deleteItem}
                                                onToggleWatched={toggleWatched}
                                                onUpdateProgress={updateProgress}
                                                onMoveToTop={moveToTop}
                                                onUpdateNotes={updateNotes}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            </LayoutGroup>

                            {filteredList.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                                    <Smile size={48} className="text-md-sys-outline mb-4" />
                                    <p className="text-lg font-medium text-md-sys-onSurface">No matches found</p>
                                    <Button variant="outlined" className="mt-6" onClick={() => setIsAddModalOpen(true)}>Add Item</Button>
                                </div>
                            )}
                        </section>
                    </PullToRefresh>
                )}
            </motion.div>
        </AnimatePresence>
      </main>

      {/* Batch Actions Bar */}
      <AnimatePresence>
      {isSelectionMode && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-md-sys-inverseSurface text-md-sys-inverseOnSurface px-6 py-3 rounded-full shadow-xl flex items-center gap-6"
        >
              <span className="font-bold">{selectedItems.size} selected</span>
              <div className="h-4 w-px bg-white/20" />
              <button onClick={batchMarkWatched} className="flex items-center gap-2 hover:text-green-300"><CheckCircle size={20} /></button>
              <button onClick={batchDelete} className="flex items-center gap-2 hover:text-red-300"><Trash2 size={20} /></button>
              <div className="h-4 w-px bg-white/20" />
              <button onClick={clearSelection} className="hover:opacity-80"><X size={20} /></button>
          </motion.div>
      )}
      </AnimatePresence>

      {/* FABs */}
      {!isSelectionMode && currentView !== 'themes' && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40 pointer-events-none">
            <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => { vibrate(); setIsScreenshotOpen(true); }}
                className="bg-md-sys-secondaryContainer text-md-sys-onSecondaryContainer shadow-lg shadow-cyan-900/20 rounded-2xl w-14 h-14 flex items-center justify-center pointer-events-auto"
            >
                <Camera size={24} />
            </motion.button>
            <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => { vibrate(); setIsAddModalOpen(true); }}
                className="bg-md-sys-primaryContainer text-md-sys-onPrimaryContainer shadow-lg shadow-cyan-900/20 rounded-2xl w-14 h-14 flex items-center justify-center pointer-events-auto"
            >
                <Plus size={28} />
            </motion.button>
          </div>
      )}

      {/* Details Modal (Bottom Sheet) */}
      <AnimatePresence>
      {viewingItem && (
          <MediaDetails 
             item={viewingItem} 
             onClose={() => setViewingItem(null)}
             onDelete={deleteItem}
             onToggleWatched={toggleWatched}
             onMoveToTop={moveToTop}
             onUpdateNotes={updateNotes}
             onUpdateProgress={updateProgress}
          />
      )}
      </AnimatePresence>

      {/* Add Item Modal */}
      <AnimatePresence>
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center pointer-events-none">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                onClick={resetAddModal}
            />
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-md-sys-surface w-full sm:max-w-md p-6 min-h-screen sm:min-h-0 sm:rounded-3xl shadow-xl relative z-10 pointer-events-auto flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-md-sys-primary">Quick Add</h3>
                    <button onClick={resetAddModal} className="p-2 hover:bg-black/5 rounded-full"><X size={24}/></button>
                </div>
                
                <div className="mb-6">
                    <form onSubmit={handleSmartSearch} className="flex gap-2">
                        <div className="flex-1 relative">
                             <input 
                                className="w-full bg-md-sys-surfaceVariant/30 border border-md-sys-outline/30 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-md-sys-primary focus:bg-md-sys-surfaceVariant/50 transition-colors"
                                placeholder="Search movies, shows..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                             />
                             <Search className="absolute left-3 top-3.5 text-md-sys-outline" size={18} />
                        </div>
                        <Button type="submit" disabled={isSearching || !searchQuery} className="!px-4 !rounded-xl">
                            {isSearching ? <Sparkles className="animate-spin" size={20}/> : 'Go'}
                        </Button>
                    </form>
                </div>

                {searchResult && (
                    <div className="bg-md-sys-secondaryContainer/30 rounded-xl p-4 mb-6 flex gap-4 border border-md-sys-outline/10">
                        {searchResult.posterUrl ? (
                            <img src={searchResult.posterUrl} alt="" className="w-20 h-28 object-cover rounded-lg shadow-sm" />
                        ) : <div className="w-20 h-28 bg-md-sys-surfaceVariant rounded-lg" />}
                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-md-sys-onSurface">{searchResult.title}</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-white/80 rounded text-md-sys-onSurfaceVariant border border-md-sys-outline/20 font-medium">{searchResult.type}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-5 border-t border-md-sys-outline/10 pt-6 overflow-y-auto flex-1">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-md-sys-onSurfaceVariant ml-1 uppercase tracking-wide">Title</label>
                        <Input label="" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} placeholder="Enter title..." required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-md-sys-onSurfaceVariant ml-1 uppercase tracking-wide">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {TYPES.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setNewItemType(type)}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${newItemType === type ? 'border-md-sys-primary bg-md-sys-primaryContainer text-md-sys-onPrimaryContainer' : 'border-md-sys-outline/30 text-md-sys-onSurfaceVariant'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-md-sys-onSurfaceVariant ml-1 uppercase tracking-wide">Your Rating</label>
                        <div className="flex gap-2 px-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} type="button" onClick={() => setNewItemRating(star === newItemRating ? 0 : star)}>
                                    <Star size={28} className="fill-yellow-400 text-yellow-400" : "text-md-sys-outline/20"} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-6 flex gap-3 justify-end">
                        <Button type="button" variant="text" onClick={resetAddModal}>Cancel</Button>
                        <Button onClick={confirmAddItem}>Save to List</Button>
                    </div>
                </div>
            </motion.div>
        </div>
      )}
      </AnimatePresence>

      {isAIOpen && <AISuggestions userMedia={mediaList} onClose={() => setIsAIOpen(false)} onAddSuggestion={addSuggestion} />}
      {isScreenshotOpen && <ScreenshotUploader onClose={() => setIsScreenshotOpen(false)} onScanComplete={handleScreenshotScan} />}
    </div>
  );
}

export default App;