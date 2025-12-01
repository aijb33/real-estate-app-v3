import React from 'react';
import { Home, Armchair, ChevronRight } from 'lucide-react';
import { StagingType } from '../../types';

interface CategoryStepProps {
  selectedType: StagingType | null;
  onSelectType: (type: StagingType) => void;
  onNext: () => void;
  onBack: () => void;
}

const CategoryStep: React.FC<CategoryStepProps> = ({ selectedType, onSelectType, onNext, onBack }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold text-white mb-2">What are we enhancing?</h2>
        <p className="text-slate-400">Select the type of transformation required for this project.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exterior Card */}
        <button
          onClick={() => onSelectType('exterior')}
          className={`relative overflow-hidden flex flex-col items-start text-left p-8 rounded-2xl border transition-all duration-300 group
            ${selectedType === 'exterior' 
              ? 'border-blue-600 bg-blue-900/20 shadow-[0_0_30px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/50' 
              : 'border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600'}`}
        >
          {selectedType === 'exterior' && (
             <div className="absolute top-0 right-0 p-4">
                 <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center animate-in zoom-in">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-white"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </div>
             </div>
          )}

          <div className={`p-4 rounded-xl mb-6 transition-all duration-300
             ${selectedType === 'exterior' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-blue-400'}`}>
            <Home size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
            Exterior Enhancement
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Boost curb appeal. Perfect for twilight hero shots, landscaping updates, and facade modernization.
          </p>
          
          <div className={`mt-auto text-xs font-bold uppercase tracking-wider flex items-center transition-colors
             ${selectedType === 'exterior' ? 'text-blue-400' : 'text-slate-600 group-hover:text-blue-400'}`}>
              Select Exterior <ChevronRight size={14} className="ml-1" />
          </div>
        </button>

        {/* Interior Card */}
        <button
          onClick={() => onSelectType('interior')}
          className={`relative overflow-hidden flex flex-col items-start text-left p-8 rounded-2xl border transition-all duration-300 group
            ${selectedType === 'interior' 
              ? 'border-cyan-500 bg-cyan-900/20 shadow-[0_0_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50' 
              : 'border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600'}`}
        >
           {selectedType === 'interior' && (
             <div className="absolute top-0 right-0 p-4">
                 <div className="h-6 w-6 rounded-full bg-cyan-500 flex items-center justify-center animate-in zoom-in">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-white"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </div>
             </div>
          )}

          <div className={`p-4 rounded-xl mb-6 transition-all duration-300
             ${selectedType === 'interior' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-cyan-400'}`}>
            <Armchair size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
            Interior Staging
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
             Fill empty spaces. Visualize potential with realistic furniture, decor, and lighting in any style.
          </p>
          
          <div className={`mt-auto text-xs font-bold uppercase tracking-wider flex items-center transition-colors
             ${selectedType === 'interior' ? 'text-cyan-400' : 'text-slate-600 group-hover:text-cyan-400'}`}>
              Select Interior <ChevronRight size={14} className="ml-1" />
          </div>
        </button>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-800/50">
        <button 
          onClick={onBack}
          className="px-6 py-3 text-slate-400 font-medium hover:text-white transition-colors"
        >
          Back
        </button>
        <button 
          onClick={onNext}
          disabled={!selectedType}
          className="px-8 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CategoryStep;