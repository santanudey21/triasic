import React from 'react';
import { Play, Plus, Info, ChevronRight } from 'lucide-react';
import { HomeData, Suggestion } from '../types';
import { Button } from './Button';

interface HomeProps {
  data: HomeData | null;
  isLoading: boolean;
  onAdd: (item: Suggestion) => void;
}

export const Home: React.FC<HomeProps> = ({ data, isLoading, onAdd }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-pulse">
        <div className="w-full h-64 bg-md-sys-surfaceVariant/50 rounded-3xl" />
        <div className="space-y-2 w-full">
            <div className="h-8 w-48 bg-md-sys-surfaceVariant/50 rounded-lg" />
            <div className="h-48 w-full bg-md-sys-surfaceVariant/30 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { featured, categories } = data;
  const featuredSeed = featured.title.replace(/\s/g, '');
  const featuredImage = `https://picsum.photos/seed/${featuredSeed}/1200/600`;

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] min-h-[400px] rounded-3xl overflow-hidden shadow-lg group">
        <img 
          src={featuredImage} 
          alt={featured.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-md-sys-surface via-md-sys-surface/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-md-sys-surface via-md-sys-surface/60 to-transparent sm:via-transparent" />
        
        <div className="absolute bottom-0 left-0 p-6 sm:p-10 max-w-2xl w-full flex flex-col justify-end h-full">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-md-sys-primary bg-md-sys-primaryContainer/80 backdrop-blur-sm rounded-full w-fit">
            FEATURED {featured.type.toUpperCase()}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-md-sys-onSurface mb-3 leading-tight drop-shadow-sm">
            {featured.title}
          </h1>
          <p className="text-md-sys-onSurfaceVariant text-lg mb-6 line-clamp-2 max-w-lg drop-shadow-sm">
            {featured.reason}
          </p>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="filled" 
              onClick={() => onAdd(featured)}
              className="!px-8 !py-3 text-lg"
            >
              <Plus className="mr-2" size={20} /> Add to List
            </Button>
            <Button variant="outlined" className="!bg-md-sys-surface/50 backdrop-blur-md border-none">
               <Info className="mr-2" size={20} /> Details
            </Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {categories.map((category, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl font-bold text-md-sys-onSurface">{category.title}</h2>
              <button className="text-md-sys-primary text-sm font-medium hover:underline flex items-center">
                See All <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 px-1 snap-x hide-scrollbar mask-fade-right">
              {category.items.map((item, i) => {
                 const seed = item.title.replace(/\s/g, '');
                 const img = `https://picsum.photos/seed/${seed}/300/450`;
                 return (
                    <button 
                        key={i}
                        onClick={() => onAdd(item)}
                        className="relative flex-none w-36 sm:w-48 snap-start group focus:outline-none"
                    >
                        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 bg-md-sys-surfaceVariant">
                            <img src={img} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100">
                                <div className="bg-md-sys-primary text-md-sys-onPrimary p-2 rounded-full shadow-lg">
                                    <Plus size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 text-left">
                            <h3 className="font-medium text-md-sys-onSurface truncate group-hover:text-md-sys-primary transition-colors">{item.title}</h3>
                            <p className="text-xs text-md-sys-onSurfaceVariant truncate">{item.reason}</p>
                        </div>
                    </button>
                 )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};