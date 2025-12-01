
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
  watermark?: React.ReactNode;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ 
  beforeImage, 
  afterImage, 
  className = '',
  watermark 
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[50vh] md:h-[60vh] select-none group cursor-ew-resize overflow-hidden rounded-2xl border border-slate-700 shadow-2xl ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background) - The "Staged" Version */}
      <img
        src={afterImage}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Watermark Layer - Visible on the 'After' image, covered by 'Before' */}
      {watermark && (
        <div className="absolute bottom-6 right-6 z-0 pointer-events-none">
          {watermark}
        </div>
      )}

      {/* Before Image (Foreground, clipped) - The "Original" Version */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden z-10"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover max-w-none" // max-w-none ensures image doesn't squash
          style={{ width: containerRef.current?.offsetWidth || '100%' }} // Keep original aspect ratio
          draggable={false}
        />
        
        {/* Before Label */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
          ORIGINAL
        </div>
      </div>

       {/* After Label (Positioned relative to container) */}
       <div className="absolute top-4 right-4 bg-cyan-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          STAGED
        </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-cyan-600 border-4 border-slate-900/10">
          <ChevronsLeftRight size={20} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
