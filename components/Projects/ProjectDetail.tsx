
import React, { useRef } from 'react';
import { Project, ProjectImage } from '../../types';
import Button from '../Button';
import { ArrowLeft, Upload, Download, Sparkles, MoreVertical, Trash2 } from 'lucide-react';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onAddImage: (base64: string, name: string) => void;
  onStageImage: (image: ProjectImage) => void;
  onDeleteImage: (imageId: string) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project, 
  onBack, 
  onAddImage, 
  onStageImage,
  onDeleteImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          onAddImage(reader.result as string, file.name);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder(project.title.replace(/\s+/g, '_') || 'listing_photos');

    if (!folder) return;

    // Helper to fetch base64 data
    const addImageToZip = (dataUrl: string, filename: string) => {
        const base64Data = dataUrl.split(',')[1];
        folder.file(filename, base64Data, { base64: true });
    };

    project.images.forEach((img, idx) => {
        // Prefer staged image, fallback to original
        const data = img.stagedUrl || img.originalUrl;
        const prefix = img.stagedUrl ? 'STAGED_' : 'ORIGINAL_';
        const name = `${prefix}${img.name || `photo_${idx}.jpg`}`;
        addImageToZip(data, name);
    });

    try {
        const content = await zip.generateAsync({ type: "blob" });
        FileSaver.saveAs(content, `${project.title || 'Listing'}_Staged_Photos.zip`);
    } catch (err) {
        console.error("Zip failed", err);
        alert("Failed to create zip file.");
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 border-b border-slate-800 pb-8">
        <div>
           <button 
             onClick={onBack}
             className="text-slate-400 hover:text-white flex items-center mb-4 text-sm font-medium transition-colors"
           >
             <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
           </button>
           <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{project.title}</h1>
           <p className="text-lg text-slate-400">{project.address}</p>
        </div>
        <div className="flex gap-3">
             <Button variant="outline" onClick={handleDownloadAll} disabled={project.images.length === 0}>
                <Download size={16} className="mr-2" />
                Download All (ZIP)
             </Button>
             <Button onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} className="mr-2" />
                Add Photos
             </Button>
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/png, image/jpeg" 
                onChange={handleFileUpload}
             />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Total Photos</span>
            <div className="text-2xl font-bold text-white">{project.images.length}</div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Staged</span>
            <div className="text-2xl font-bold text-cyan-400">{project.images.filter(i => i.status === 'staged').length}</div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
             <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Processing</span>
            <div className="text-2xl font-bold text-amber-400">{project.images.filter(i => i.status === 'processing').length}</div>
        </div>
      </div>

      {/* Grid */}
      {project.images.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
             <p className="text-slate-500">No photos uploaded yet. Drag and drop or click "Add Photos".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {project.images.map((img) => (
                <div key={img.id} className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-all">
                    {/* Image Area */}
                    <div className="aspect-[4/3] relative">
                         <img 
                            src={img.stagedUrl || img.originalUrl} 
                            alt={img.name} 
                            className="w-full h-full object-cover"
                         />
                         
                         {/* Status Badge */}
                         <div className="absolute top-2 left-2">
                             {img.status === 'staged' && (
                                 <span className="bg-cyan-500/90 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg backdrop-blur-md">
                                     STAGED
                                 </span>
                             )}
                              {img.status === 'original' && (
                                 <span className="bg-slate-800/90 text-slate-300 text-xs font-bold px-2 py-1 rounded-md shadow-lg backdrop-blur-md">
                                     ORIGINAL
                                 </span>
                             )}
                         </div>

                         {/* Overlay Actions */}
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-3">
                             <Button 
                                variant="primary" 
                                className="scale-90"
                                onClick={() => onStageImage(img)}
                             >
                                <Sparkles size={16} className="mr-2" />
                                {img.status === 'staged' ? 'Re-Stage' : 'Stage Photo'}
                             </Button>
                             
                             {img.stagedUrl && (
                                <a 
                                    href={img.stagedUrl} 
                                    download={`OneRoof_${img.name}`}
                                    className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Download
                                </a>
                             )}
                         </div>
                    </div>

                    {/* Footer */}
                    <div className="p-3 flex justify-between items-center bg-slate-900">
                        <span className="text-xs text-slate-400 truncate max-w-[120px]" title={img.name}>
                            {img.name}
                        </span>
                        <button 
                            onClick={() => onDeleteImage(img.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
