import React, { useRef } from 'react';
import Button from '../Button';
import { FileText, Paperclip, Sparkles } from 'lucide-react';

interface GuidelineStepProps {
  guidelines: string;
  onGuidelinesChange: (text: string) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

const GuidelineStep: React.FC<GuidelineStepProps> = ({ 
  guidelines, 
  onGuidelinesChange, 
  onGenerate, 
  onBack,
  isGenerating 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result;
          if (typeof text === 'string') {
            onGuidelinesChange(guidelines + (guidelines ? '\n\n' : '') + `[Imported from ${file.name}]:\n${text}`);
          }
        };
        reader.readAsText(file);
      } else {
        onGuidelinesChange(guidelines + (guidelines ? '\n\n' : '') + `[Attached Document: ${file.name}]`);
        alert("For this MVP, we extracted the filename. In production, we parse the full PDF.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold text-white mb-2">Fine-tune the Result</h2>
        <p className="text-slate-400">Add specific instructions to guide the AI, or leave it blank for creative freedom.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="guidelines" className="block text-sm font-medium text-slate-300 mb-2">
            Design Instructions (Optional)
          </label>
          <div className="relative">
            <textarea
              id="guidelines"
              rows={6}
              className="block w-full rounded-xl bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-4 transition-colors"
              placeholder="e.g. 'Use light beige curtains', 'Keep the hardwood floor visible', 'Add a large abstract painting on the left wall'..."
              value={guidelines}
              onChange={(e) => onGuidelinesChange(e.target.value)}
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-600">
                {guidelines.length} chars
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800 border-dashed">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Have a design brief?</p>
              <p className="text-xs text-slate-500">Upload PDF, DOCX, TXT</p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center px-3 py-2 rounded-lg hover:bg-cyan-500/10 transition-colors"
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Attach File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".txt,.pdf,.docx"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-800/50">
        <Button variant="ghost" onClick={onBack} disabled={isGenerating}>
          Back
        </Button>
        <Button onClick={onGenerate} isLoading={isGenerating} className="px-8 shadow-cyan-500/25">
           {!isGenerating && <Sparkles size={18} className="mr-2" />}
           Generate Staging
        </Button>
      </div>
    </div>
  );
};

export default GuidelineStep;