import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, FileImage } from 'lucide-react';
import Button from '../Button';

interface UploadStepProps {
  onImageSelect: (base64: string) => void;
  currentImage: string | null;
  onNext: () => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onImageSelect, currentImage, onNext }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid JPG or PNG image.");
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold text-white mb-2">Upload Source Image</h2>
        <p className="text-slate-400">Start by uploading a high-resolution photo of the property you want to transform.</p>
      </div>

      {!currentImage ? (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`relative h-96 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ease-out cursor-pointer group overflow-hidden
            ${isDragging 
              ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]' 
              : 'border-slate-700 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-slate-800'}`}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
          
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleInputChange}
            accept="image/png, image/jpeg"
          />
          
          <div className="relative z-20 flex flex-col items-center">
            <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 shadow-xl
                ${isDragging ? 'bg-cyan-500 text-white scale-110' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-cyan-400'}`}>
              <Upload className="h-8 w-8" strokeWidth={2} />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              Drag & Drop your photo here
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              or click to browse from your computer
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                    <FileImage size={12} className="mr-1.5" /> JPG
                </span>
                <span className="flex items-center bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                    <FileImage size={12} className="mr-1.5" /> PNG
                </span>
                <span className="flex items-center bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                    Max 10MB
                </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl group animate-in fade-in zoom-in duration-300">
          <img src={currentImage} alt="Preview" className="w-full h-[500px] object-cover" />
          
          {/* Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-white font-medium">Original Image</p>
                    <p className="text-slate-300 text-xs">Ready for processing</p>
                </div>
                <button 
                onClick={(e) => { e.stopPropagation(); onImageSelect(''); }}
                className="p-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl text-red-100 hover:bg-red-500 hover:text-white transition-all"
                >
                <span className="flex items-center text-sm font-medium"><X size={16} className="mr-2"/> Remove</span>
                </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-6 border-t border-slate-800/50">
        <Button onClick={onNext} disabled={!currentImage} className="w-full sm:w-auto">
          Continue to Step 2
        </Button>
      </div>
    </div>
  );
};

export default UploadStep;