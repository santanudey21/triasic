import React, { useState } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { fileToGenerativePart, extractMediaFromImage } from '../services/geminiService';
import { MediaItem } from '../types';

interface ScreenshotUploaderProps {
  onClose: () => void;
  onScanComplete: (data: Partial<MediaItem>) => void;
}

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({ onClose, onScanComplete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRawFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleScan = async () => {
    if (!rawFile) return;
    
    setIsScanning(true);
    try {
        const base64Data = await fileToGenerativePart(rawFile);
        const result = await extractMediaFromImage(base64Data);
        if (result) {
            onScanComplete(result);
        } else {
            setError("Could not identify media from this image.");
        }
    } catch (err) {
        setError("Analysis failed. Please try again.");
    } finally {
        setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-md-sys-surface w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 bg-md-sys-surfaceVariant flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
                <ImageIcon size={20} /> Quick Add
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full">
                <X size={20} />
            </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
            {!selectedImage ? (
                <label className="w-full aspect-video border-2 border-dashed border-md-sys-outline/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-md-sys-surfaceVariant/30 transition-colors group">
                    <div className="p-4 bg-md-sys-primaryContainer/50 rounded-full text-md-sys-primary mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                    </div>
                    <p className="text-sm font-medium text-md-sys-onSurface">Upload Screenshot</p>
                    <p className="text-xs text-md-sys-onSurfaceVariant mt-1">Supports JPG, PNG</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            ) : (
                <div className="relative w-full rounded-xl overflow-hidden bg-black">
                    <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[300px] object-contain" />
                    <button 
                        onClick={() => { setSelectedImage(null); setRawFile(null); }}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {error && <p className="text-xs text-md-sys-error text-center">{error}</p>}

            <div className="w-full">
                <Button 
                    className="w-full" 
                    disabled={!selectedImage || isScanning} 
                    onClick={handleScan}
                >
                    {isScanning ? (
                        <>
                            <Loader2 size={18} className="animate-spin mr-2" /> Analyzing...
                        </>
                    ) : (
                        "Extract Details"
                    )}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};
