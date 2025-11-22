import { GoogleGenAI, Type } from "@google/genai";
import { MediaItem, Suggestion, HomeData, MediaType } from "../types";

const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

// Helper to convert blob/file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const askSanta = async (prompt: string, history: ChatMessage[]): Promise<string> => {
  try {
    // Convert history to Gemini format
    const chatSession = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "You are Santa, a helpful, friendly, and witty AI assistant for the Triasic entertainment app. You know about movies, shows, and anime, but you can answer any general question too. Keep responses concise and engaging.",
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chatSession.sendMessage({ message: prompt });
    return result.text || "I'm having trouble thinking right now. Try again?";
  } catch (error) {
    console.error("Santa Chat Error:", error);
    return "Sorry, I seem to be offline. Please check your connection.";
  }
};

export const extractMediaFromImage = async (base64Data: string): Promise<Partial<MediaItem> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: `Analyze this screenshot. It is likely from a streaming service or media player. 
                   Extract:
                   1. Title of the show/movie.
                   2. Type (Movie, Series, Anime, YouTube).
                   3. Current platform (Netflix, YouTube, etc.) if visible.
                   4. Current progress (Season and Episode number) if visible.
                   
                   Return JSON.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["Movie", "Series", "Anime", "Web Show", "YouTube", "OTT"] },
            platform: { type: Type.STRING },
            season: { type: Type.INTEGER },
            episode: { type: Type.INTEGER }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        title: data.title,
        type: data.type as MediaType,
        platforms: data.platform ? [data.platform] : [],
        progress: (data.season || data.episode) ? {
            currentSeason: data.season || 1,
            currentEpisode: data.episode || 1,
            totalEpisodes: 12 // Default placeholder
        } : undefined
      };
    }
    return null;
  } catch (error) {
    console.error("Screenshot extraction error:", error);
    return null;
  }
};

export const searchMediaDetails = async (query: string): Promise<Partial<MediaItem> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for media details for the query: "${query}".
                 Provide:
                 1. Correct Title.
                 2. Type (Movie, Series, Anime, etc.).
                 3. Release Year.
                 4. List of 2-3 main Genres.
                 5. List of 2 common streaming Platforms.
                 6. Short Description.
                 7. Estimated IMDb Rating (1-5 scale converted from 10).
                 8. Total Episodes (if series, otherwise 0).
                 9. Moods (e.g., "Thrilling", "Funny", "Dark", "Romantic").
                 
                 Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["Movie", "Series", "Anime", "Web Show", "YouTube", "OTT"] },
            year: { type: Type.INTEGER },
            genres: { type: Type.ARRAY, items: { type: Type.STRING } },
            platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            totalEpisodes: { type: Type.INTEGER },
            moods: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "type", "year"]
        }
      }
    });

    if (response.text) {
        const data = JSON.parse(response.text);
        return {
            ...data,
            // Generate poster url based on seed to avoid broken external links
            posterUrl: `https://picsum.photos/seed/${data.title.replace(/\s/g, '')}/300/450`,
            progress: data.type !== 'Movie' ? {
                currentSeason: 1,
                currentEpisode: 0,
                totalEpisodes: data.totalEpisodes || 12
            } : undefined
        };
    }
    return null;
  } catch (error) {
      console.error("Search error:", error);
      return null;
  }
};

export const discoverMedia = async (query: string): Promise<Partial<MediaItem>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for media items matching: "${query}". 
                 Return a list of 6-8 distinct results.
                 For each item provide: Title, Type, Year, 2 Platforms, and Description.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["Movie", "Series", "Anime", "Web Show", "YouTube", "OTT"] },
              year: { type: Type.INTEGER },
              platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING }
            },
            required: ["title", "type", "year"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as any[];
      return data.map(item => ({
        ...item,
        posterUrl: `https://picsum.photos/seed/${item.title.replace(/\s/g, '')}/300/450`,
        progress: item.type !== 'Movie' ? { currentSeason: 1, currentEpisode: 0, totalEpisodes: 12 } : undefined
      }));
    }
    return [];
  } catch (error) {
    console.error("Discover media error:", error);
    return [];
  }
};

export const getMediaSuggestions = async (userList: MediaItem[]): Promise<Suggestion[]> => {
  // If list is empty, return generics
  if (userList.length === 0) {
      return [
          { title: "Stranger Things", type: "Series", reason: "Global sci-fi phenomenon.", confidenceScore: 95, year: 2016 },
          { title: "Your Name", type: "Anime", reason: "Breathtaking animation and story.", confidenceScore: 98, year: 2016 },
          { title: "Inception", type: "Movie", reason: "Mind-bending thriller.", confidenceScore: 92, year: 2010 },
      ];
  }

  const listDescription = userList.map(item => `${item.title} (${item.type})`).join(", ");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on this watchlist: ${listDescription}, suggest 5 similar items.
                 Include year and platforms.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["Movie", "Series", "Anime", "Web Show"] },
              reason: { type: Type.STRING },
              confidenceScore: { type: Type.INTEGER },
              year: { type: Type.INTEGER },
              platforms: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "type", "reason", "confidenceScore"]
          }
        }
      }
    });

    if (response.text) {
      const results = JSON.parse(response.text) as Suggestion[];
      // Add placeholder posters
      return results.map(r => ({
          ...r,
          posterUrl: `https://picsum.photos/seed/${r.title.replace(/\s/g, '')}/300/450`
      }));
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const getDiscoveryContent = async (): Promise<HomeData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a "Home Page" discovery feed. 
      1. One "Featured" item.
      2. 3 Categories: "Trending Movies", "Popular Series", "Top Anime".
      
      Return strictly JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            featured: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING },
                reason: { type: Type.STRING },
                confidenceScore: { type: Type.INTEGER },
              },
              required: ["title", "type", "reason"]
            },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        type: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        confidenceScore: { type: Type.INTEGER },
                      },
                      required: ["title", "type", "reason"]
                    }
                  }
                },
                required: ["title", "items"]
              }
            }
          },
          required: ["featured", "categories"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as HomeData;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Home Content Error:", error);
    return null;
  }
};