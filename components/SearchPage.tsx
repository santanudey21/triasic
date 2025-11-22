import React, { useState } from 'react';
import { Search, Plus, Check, Loader2, Film, Tv, Monitor } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { discoverMedia } from '../services/geminiService';
import { Button } from './Button';

interface SearchPageProps {
  userList: MediaItem[];
  onAdd: (item: Partial<MediaItem>) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ userList, onAdd }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Partial<MediaItem>[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    const data = await discoverMedia(query);
    setResults(data);
    setLoading(false);
  };

  const isAdded = (title?: string) => {
    if (!title) return false;
    return userList.some(item => item.title.toLowerCase() === title.toLowerCase());
  };

  return (
    <div className="pb-20 animate-fade-in min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Search Header */}
        <div className="bg-md-sys-surface rounded-3xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-md-sys-onSurface mb-4">Discover</h2>
            <form onSubmit={handleSearch} className="relative">
                <input 
                    className="w-full bg-md-sys-surfaceVariant/30 border border-md-sys-outline/20 rounded-2xl px-6 py-4 pl-12 text-lg focus:outline-none focus:border-md-sys-primary focus:bg-md-sys-surfaceVariant/50 transition-all shadow-inner"
                    placeholder="Search for movies, series, anime..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    autoFocus
                />
                <Search className="absolute left-4 top-5 text-md-sys-outline" size={24} />
                <Button 
                    type="submit" 
                    className="absolute right-2 top-2 !rounded-xl !px-6" 
                    disabled={loading || !query.trim()}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Search"}
                </Button>
            </form>

            {/* Quick Filter Chips (Visual Only for now, could filter query context) */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 hide-scrollbar">
                {['Movies', 'TV Series', 'Anime', 'Netflix', 'Prime Video'].map(filter => (
                    <button 
                        key={filter}
                        onClick={() => setQuery(prev => `${prev} ${filter}`.trim())}
                        className="px-4 py-1.5 rounded-lg bg-md-sys-secondaryContainer/30 text-md-sys-secondary text-sm font-medium hover:bg-md-sys-secondaryContainer hover:text-md-sys-onSecondaryContainer transition-colors whitespace-nowrap"
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-4">
             {hasSearched && !loading && (
                 <h3 className="text-lg font-bold text-md-sys-onSurfaceVariant px-2">
                     {results.length > 0 ? `Found ${results.length} results` : "No results found"}
                 </h3>
             )}

             {loading && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 pointer-events-none">
                     {[1,2,3].map(i => (
                         <div key={i} className="aspect-video bg-md-sys-surfaceVariant/30 rounded-2xl animate-pulse" />
                     ))}
                 </div>
             )}

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {results.map((item, idx) => {
                     const added = isAdded(item.title);
                     return (
                         <div key={idx} className="bg-md-sys-surface rounded-2xl shadow-sm hover:shadow-md transition-all border border-md-sys-outline/10 overflow-hidden group flex flex-col">
                             {/* Card Image & Type */}
                             <div className="relative aspect-video sm:aspect-[4/3] bg-md-sys-surfaceVariant overflow-hidden">
                                 <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-md-sys-surface via-transparent to-transparent opacity-90" />
                                 
                                 <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                     <div className="flex gap-2">
                                         <span className="px-2 py-1 bg-md-sys-primaryContainer/90 backdrop-blur-sm text-md-sys-onPrimaryContainer text-xs font-bold rounded uppercase tracking-wider shadow-sm">
                                             {item.type}
                                         </span>
                                         {item.year && (
                                             <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-bold rounded">
                                                 {item.year}
                                             </span>
                                         )}
                                     </div>
                                 </div>
                             </div>

                             {/* Card Body */}
                             <div className="p-4 flex-1 flex flex-col">
                                 <h4 className="text-lg font-bold text-md-sys-onSurface leading-tight mb-2 line-clamp-1" title={item.title}>{item.title}</h4>
                                 <p className="text-xs text-md-sys-onSurfaceVariant line-clamp-2 mb-4">{item.description}</p>
                                 
                                 {/* Platforms */}
                                 {item.platforms && item.platforms.length > 0 && (
                                     <div className="flex flex-wrap gap-1.5 mb-4">
                                         {item.platforms.map(p => (
                                             <span key={p} className="px-1.5 py-0.5 rounded border border-md-sys-outline/20 text-[10px] font-bold text-md-sys-secondary uppercase">
                                                 {p}
                                             </span>
                                         ))}
                                     </div>
                                 )}

                                 {/* Add Button */}
                                 <div className="mt-auto pt-2">
                                     <button
                                         onClick={() => !added && onAdd(item)}
                                         disabled={added}
                                         className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                                             added 
                                             ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                                             : 'bg-md-sys-primary text-md-sys-onPrimary hover:bg-md-sys-primary/90 shadow-md hover:shadow-lg active:scale-95'
                                         }`}
                                     >
                                         {added ? (
                                             <>
                                                 <Check size={18} strokeWidth={3} /> In Library
                                             </>
                                         ) : (
                                             <>
                                                 <Plus size={18} strokeWidth={3} /> Add to Watchlist
                                             </>
                                         )}
                                     </button>
                                 </div>
                             </div>
                         </div>
                     );
                 })}
             </div>
        </div>

      </div>
    </div>
  );
};