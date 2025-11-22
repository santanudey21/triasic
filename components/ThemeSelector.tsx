import React from 'react';
import { motion } from 'framer-motion';
import { Check, Moon, Palette } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: string;
  isAmoled: boolean;
  onThemeChange: (theme: string) => void;
  onAmoledToggle: (enabled: boolean) => void;
}

const themes = [
  {
    id: 'default',
    name: 'Default',
    description: 'Clean & Balanced Cyan',
    colors: ['#006874', '#97F0FF', '#E0F7FA']
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    description: 'Material You Violet',
    colors: ['#6750A4', '#EADDFF', '#F3EDF7']
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'Futuristic Blue & Grey',
    colors: ['#005FB8', '#D1E4FF', '#F8F9FA']
  },
  {
    id: 'cotton',
    name: 'Cotton Candy',
    description: 'Playful Pink & Pastel',
    colors: ['#984061', '#FFD9E2', '#FFF0F5']
  }
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  isAmoled,
  onThemeChange,
  onAmoledToggle
}) => {
  return (
    <div className="pb-20 animate-fade-in max-w-4xl mx-auto">
      <div className="p-6 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-md-sys-primaryContainer flex items-center justify-center text-md-sys-onPrimaryContainer shadow-sm">
            <Palette size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-md-sys-onSurface">App Themes</h2>
            <p className="text-sm text-md-sys-onSurfaceVariant">Customize the look and feel of Triasic.</p>
          </div>
        </div>

        {/* AMOLED Toggle */}
        <div className="bg-md-sys-surface rounded-3xl p-6 shadow-sm border border-md-sys-outline/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAmoled ? 'bg-white text-black' : 'bg-gray-100 text-gray-500'}`}>
              <Moon size={20} className={isAmoled ? "fill-black" : ""} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-md-sys-onSurface">Pure Black Mode</h3>
              <p className="text-sm text-md-sys-onSurfaceVariant">Ultra-dark background for AMOLED screens.</p>
            </div>
          </div>
          
          <button 
            onClick={() => onAmoledToggle(!isAmoled)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${isAmoled ? 'bg-md-sys-primary' : 'bg-md-sys-surfaceVariant'}`}
          >
            <motion.div 
              className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
              animate={{ x: isAmoled ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {themes.map((theme) => (
            <motion.button
              key={theme.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onThemeChange(theme.id)}
              className={`relative overflow-hidden rounded-3xl border-2 text-left transition-all ${
                currentTheme === theme.id 
                ? 'border-md-sys-primary ring-2 ring-md-sys-primary/30' 
                : 'border-transparent hover:border-md-sys-outline/20'
              }`}
            >
              {/* Preview Background */}
              <div 
                className="h-32 w-full relative"
                style={{ background: `linear-gradient(135deg, ${theme.colors[2]} 0%, ${theme.colors[1]} 100%)` }}
              >
                {/* Mock UI Elements */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="w-8 h-8 rounded-xl shadow-sm flex items-center justify-center text-white" style={{ backgroundColor: theme.colors[0] }}>
                    <div className="w-4 h-4 bg-white/30 rounded-full" />
                  </div>
                </div>
                
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm" style={{ color: theme.colors[0] }}>
                  Preview
                </div>
              </div>

              {/* Content */}
              <div className="p-5 bg-md-sys-surface">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-md-sys-onSurface">{theme.name}</h3>
                    <p className="text-xs text-md-sys-onSurfaceVariant mt-1">{theme.description}</p>
                  </div>
                  {currentTheme === theme.id && (
                    <div className="w-6 h-6 rounded-full bg-md-sys-primary text-md-sys-onPrimary flex items-center justify-center">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>
                
                {/* Color Swatches */}
                <div className="flex gap-2 mt-4">
                  {theme.colors.map((color, i) => (
                    <div key={i} className="w-6 h-6 rounded-full shadow-inner border border-black/5" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

      </div>
    </div>
  );
};