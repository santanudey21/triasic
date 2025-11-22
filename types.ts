export type MediaType = 'Movie' | 'Series' | 'Anime' | 'Web Show' | 'YouTube' | 'OTT';

export interface MediaProgress {
  currentEpisode: number;
  totalEpisodes?: number;
  currentSeason?: number;
}

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  description?: string;
  rating?: number; // 1-5 stars
  watched: boolean;
  posterUrl?: string;
  // New fields
  platforms?: string[];
  genres?: string[];
  year?: number;
  language?: string;
  progress?: MediaProgress;
  moods?: string[];
  notes?: string;
}

export interface Suggestion {
  title: string;
  type: MediaType;
  reason: string;
  confidenceScore: number;
  posterUrl?: string;
  // Enrichment fields for suggestions
  year?: number;
  platforms?: string[];
}

export interface Category {
  title: string;
  items: Suggestion[];
}

export interface HomeData {
  featured: Suggestion;
  categories: Category[];
}