import React, { useState } from 'react';
import { Sparkles, Plus, Loader2, X } from 'lucide-react';
import { MediaItem, Suggestion } from '../types';
import { getMediaSuggestions } from '../services/geminiService';
import { Button } from './Button';

interface AISuggestionsProps {
  userMedia: MediaItem[];
  onAddSuggestion: (suggestion: Suggestion) => void;
  onClose: () => void;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({ userMedia, onAddSuggestion, onClose }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetSuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await getMediaSuggestions(userMedia);
      setSuggestions(results);
    } catch (err) {
      setError('Failed to fetch suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  React.useEffect(() => {
    handleGetSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 transition-opacity">
      <div className="w-full max-w-2xl bg-md-sys-surface rounded-3xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-md-sys-primaryContainer text-md-sys-onPrimaryContainer flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-normal">Gemini Suggestions</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
            {loading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-md-sys-primary" />
                    <p className="text-md-sys-onSurfaceVariant">Analyzing your taste...</p>
                </div>
            )}

            {!loading && error && (
                <div className="text-center py-8">
                    <p className="text-md-sys-error mb-4">{error}</p>
                    <Button onClick={handleGetSuggestions} variant="outlined">Try Again</Button>
                </div>
            )}

            {!loading && !error && suggestions.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-md-sys-onSurfaceVariant">No suggestions found.</p>
                </div>
            )}

            {!loading && !error && suggestions.length > 0 && (
                <div className="grid gap-4">
                    {suggestions.map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-md-sys-surfaceVariant/30 border border-md-sys-surfaceVariant/50 hover:bg-md-sys-surfaceVariant/50 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg text-md-sys-onSurface">{item.title}</h3>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-md-sys-secondaryContainer text-md-sys-secondary font-medium">
                                        {item.type}
                                    </span>
                                </div>
                                <p className="text-sm text-md-sys-onSurfaceVariant mb-2">{item.reason}</p>
                                <div className="text-xs font-medium text-md-sys-primary">
                                    Match Score: {item.confidenceScore}%
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Button 
                                    variant="text" 
                                    onClick={() => onAddSuggestion(item)}
                                    className="!px-3"
                                >
                                    <Plus size={20} className="mr-1" /> Add
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-md-sys-outline/10 flex justify-end bg-md-sys-surface">
            <Button variant="text" onClick={handleGetSuggestions} disabled={loading}>
                Refresh
            </Button>
        </div>
      </div>
    </div>
  );
};