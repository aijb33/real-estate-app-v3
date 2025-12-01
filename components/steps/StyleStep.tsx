import React from 'react';
import { STYLES, StyleOption, StagingType } from '../../types';
import Button from '../Button';
import { CheckCircle2 } from 'lucide-react';

interface StyleStepProps {
  selectedStyle: StyleOption | null;
  stagingType: StagingType | null;
  onSelectStyle: (style: StyleOption) => void;
  onNext: () => void;
  onBack: () => void;
}

const StyleStep: React.FC<StyleStepProps> = ({ selectedStyle, stagingType, onSelectStyle, onNext, onBack }) => {
  // Filter styles based on the selected staging type
  const filteredStyles = STYLES.filter(style => style.type === stagingType);

  return (
    <div className="space-y-8 animate-fade-in h-full flex flex-col">
      <div className="text-center md:text-left flex-shrink-0">
        <h2 className="text-3xl font-bold text-white mb-2">
          {stagingType === 'exterior' ? 'Choose Exterior Mood' : 'Choose Interior Style'}
        </h2>
        <p className="text-slate-400">Select the design language that best fits the property's potential.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-[300px] max-h-[500px]">
        {filteredStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelectStyle(style)}
            className={`relative flex items-start p-5 rounded-xl border text-left transition-all duration-200 group
              ${selectedStyle?.id === style.id 
                ? 'border-cyan-500 bg-cyan-900/20 ring-1 ring-cyan-500/50' 
                : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-600'}`}
          >
            <div className={`h-12 w-12 rounded-lg shrink-0 mr-4 ${style.previewColor} shadow-lg ring-1 ring-white/10`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                  <h3 className={`font-bold truncate ${selectedStyle?.id === style.id ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    {style.name}
                  </h3>
                  {selectedStyle?.id === style.id && (
                    <CheckCircle2 size={18} className="text-cyan-400 ml-2 flex-shrink-0" />
                  )}
              </div>
              <p className={`text-sm mt-1 leading-snug line-clamp-2 ${selectedStyle?.id === style.id ? 'text-cyan-200' : 'text-slate-500 group-hover:text-slate-400'}`}>
                {style.description}
              </p>
            </div>
            
            {/* Glow Effect on Hover */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${selectedStyle?.id === style.id ? 'hidden' : ''}`} />
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-800/50 flex-shrink-0">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!selectedStyle}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StyleStep;