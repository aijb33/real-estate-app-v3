
import React, { useState } from 'react';
import Button from '../Button';
import BeforeAfterSlider from '../BeforeAfterSlider';
import { Download, RotateCcw, CheckCircle, Share2, Sparkles, Wand2, RefreshCw, Send, Type } from 'lucide-react';

interface ResultStepProps {
  uploadedImage: string | null;
  generatedImage: string | null;
  onReset: () => void;
  onRefine: (instructions: string) => void;
  onRegenerate: () => void;
  isProcessing?: boolean;
}

type WatermarkType = 'enhanced' | 'staged' | 'custom';

const ResultStep: React.FC<ResultStepProps> = ({ 
  uploadedImage, 
  generatedImage, 
  onReset,
  onRefine,
  onRegenerate,
  isProcessing = false
}) => {
  const [viewMode, setViewMode] = useState<'compare' | 'result'>('compare');
  const [refineText, setRefineText] = useState('');
  
  // Watermark State
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('staged');
  const [customWatermarkText, setCustomWatermarkText] = useState('Designed by One Roof');

  if (!generatedImage) return null;

  const getWatermarkString = () => {
    switch (watermarkType) {
      case 'enhanced': return 'Digitally Enhanced';
      case 'staged': return 'Virtually Staged';
      case 'custom': return customWatermarkText.slice(0, 100);
      default: return '';
    }
  };

  const WatermarkOverlay = () => (
    <div className="select-none pointer-events-none">
      <p 
        className="text-white/50 font-bold tracking-[0.2em] uppercase font-sans drop-shadow-md"
        style={{ 
            fontSize: 'clamp(14px, 2vw, 24px)', 
            textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
        }}
      >
        {getWatermarkString()}
      </p>
    </div>
  );

  const handleDownload = async () => {
    if (!generatedImage) return;

    // If watermark is disabled, just download the image directly
    if (!showWatermark) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'OneRoof_Staging_Render.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // If watermark is enabled, we need to draw it onto the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        // Draw Image
        ctx.drawImage(img, 0, 0);

        // Configure Watermark Style to match Preview
        const text = getWatermarkString().toUpperCase();
        
        // Dynamic sizing: roughly 3% of image width, min 24px
        const fontSize = Math.max(24, Math.floor(img.width * 0.03)); 
        // Padding from edge
        const paddingX = Math.floor(img.width * 0.04);
        const paddingY = Math.floor(img.width * 0.04);

        ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        // Subtle Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;

        // "Opaque Gray" / Semi-transparent White look
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; 

        const xPos = canvas.width - paddingX;
        const yPos = canvas.height - paddingY;

        // Simulate wide tracking (Canvas doesn't support letter-spacing universally yet)
        // We add thin hair spaces if needed, or just rely on the font
        // For this MVP, standard text rendering with the right font looks clean.
        ctx.fillText(text, xPos, yPos);
        
        // Trigger Download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'OneRoof_Staging_Watermarked.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    img.crossOrigin = "anonymous"; // Handle potential CORS if image comes from external URL
    img.src = generatedImage;
  };

  const handleRefineSubmit = () => {
    if (refineText.trim()) {
      onRefine(refineText);
      setRefineText('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-center pb-20">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-green-500/10 rounded-full ring-1 ring-green-500/20">
            <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">Transformation Complete</h2>
        <p className="text-slate-400">See the potential of your property.</p>
        
        <div className="flex space-x-2 bg-slate-800 p-1 rounded-lg">
            <button 
                onClick={() => setViewMode('compare')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'compare' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
                Before / After
            </button>
            <button 
                onClick={() => setViewMode('result')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'result' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
                Result Only
            </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        {viewMode === 'compare' && uploadedImage ? (
             <BeforeAfterSlider 
                beforeImage={uploadedImage} 
                afterImage={generatedImage}
                watermark={showWatermark ? <WatermarkOverlay /> : undefined}
            />
        ) : (
            <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 flex items-center">
                        <Sparkles size={12} className="mr-1 text-cyan-400" /> ONE ROOF AI
                    </span>
                </div>
                <img 
                  src={generatedImage} 
                  alt="Staged Property" 
                  className="w-full h-auto object-cover max-h-[60vh]" 
                />
                {showWatermark && (
                   <div className="absolute bottom-6 right-6 pointer-events-none">
                      <WatermarkOverlay />
                   </div>
                )}
            </div>
        )}
      </div>

      {/* Tools Section: Watermark & Refinement */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Watermark Options */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm text-left">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                      <Type size={18} className="mr-2 text-cyan-400" />
                      Export Watermark
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={showWatermark}
                      onChange={(e) => setShowWatermark(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
              </div>

              <div className={`space-y-3 transition-opacity duration-200 ${showWatermark ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                 <div className="flex flex-col space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="watermark" value="staged" checked={watermarkType === 'staged'} onChange={() => setWatermarkType('staged')} className="text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-600" />
                        <span className="text-sm text-slate-300">"Virtually Staged"</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="watermark" value="enhanced" checked={watermarkType === 'enhanced'} onChange={() => setWatermarkType('enhanced')} className="text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-600" />
                        <span className="text-sm text-slate-300">"Digitally Enhanced"</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="watermark" value="custom" checked={watermarkType === 'custom'} onChange={() => setWatermarkType('custom')} className="text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-600" />
                        <span className="text-sm text-slate-300">Custom Text</span>
                    </label>
                 </div>
                 
                 {watermarkType === 'custom' && (
                     <input 
                        type="text" 
                        maxLength={100}
                        value={customWatermarkText}
                        onChange={(e) => setCustomWatermarkText(e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                        placeholder="Enter watermark text..."
                     />
                 )}
              </div>
          </div>

          {/* Refinement Options */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Wand2 size={18} className="mr-2 text-cyan-400" />
                Quick Refine
              </h3>
              <button 
                  onClick={onRegenerate}
                  disabled={isProcessing}
                  className="text-xs font-medium text-slate-400 hover:text-white flex items-center transition-colors disabled:opacity-50"
              >
                  <RefreshCw size={12} className={`mr-1 ${isProcessing ? 'animate-spin' : ''}`} /> 
                  Regenerate
              </button>
            </div>

            <div className="relative mb-3">
              <input 
                type="text" 
                value={refineText}
                onChange={(e) => setRefineText(e.target.value)}
                placeholder="e.g. 'Make the sofa blue'..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-3 pr-10 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit()}
                disabled={isProcessing}
              />
              <button 
                onClick={handleRefineSubmit}
                disabled={!refineText.trim() || isProcessing}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-slate-800"
              >
                {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {['Brighter lighting', 'Warmer tones', 'Less furniture', 'More plants'].map((suggestion) => (
                    <button 
                      key={suggestion}
                      onClick={() => onRefine(suggestion)}
                      disabled={isProcessing}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700 transition-colors"
                    >
                        + {suggestion}
                    </button>
                ))}
            </div>
          </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center border-t border-slate-800/50 pt-8">
        <Button variant="secondary" onClick={onReset} className="w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4" />
          New Project
        </Button>
        <Button onClick={handleDownload} className="w-full sm:w-auto shadow-cyan-500/20">
          <Download className="mr-2 h-4 w-4" />
          Download {showWatermark ? 'with Watermark' : 'High-Res'}
        </Button>
        <Button variant="outline" className="w-full sm:w-auto">
            <Share2 className="mr-2 h-4 w-4" />
            Share
        </Button>
      </div>
    </div>
  );
};

export default ResultStep;
