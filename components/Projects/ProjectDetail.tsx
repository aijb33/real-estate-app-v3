
import React, { useRef, useState } from 'react';
import { Project, ProjectImage } from '../../types';
import Button from '../Button';
import { ArrowLeft, Upload, Download, Sparkles, MoreVertical, Trash2, Building2, Gavel, FileText, MapPin, Users, AlertTriangle, Edit3, Shield, Info, Copy, Check, Bot } from 'lucide-react';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import EditProjectModal from './EditProjectModal';
import { generateListingDescription } from '../../services/geminiService';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onAddImage: (base64: string, name: string) => void;
  onStageImage: (image: ProjectImage) => void;
  onDeleteImage: (imageId: string) => void;
  onUpdateProject: (id: string, data: Partial<Project>) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project, 
  onBack, 
  onAddImage, 
  onStageImage,
  onDeleteImage,
  onUpdateProject
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [description, setDescription] = useState(project.description || '');
  const [copied, setCopied] = useState(false);

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
    const folderName = project.street.replace(/\s+/g, '_') || 'listing_photos';
    const folder = zip.folder(folderName);

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
        FileSaver.saveAs(content, `${project.street || 'Listing'}_Staged_Photos.zip`);
    } catch (err) {
        console.error("Zip failed", err);
        alert("Failed to create zip file.");
    }
  };

  const handleGenerateDescription = async () => {
      setIsGeneratingDesc(true);
      try {
          const text = await generateListingDescription(project);
          setDescription(text);
          onUpdateProject(project.id, { description: text });
      } catch (e) {
          alert("Failed to generate description");
      } finally {
          setIsGeneratingDesc(false);
      }
  };

  const handleCopyDescription = () => {
      navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
           <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{project.street}</h1>
           <div className="flex items-center text-lg text-slate-400">
             <MapPin size={18} className="mr-2 text-slate-500" />
             {project.city}, {project.state} {project.zip}
           </div>
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

      {/* Property Intelligence & Info Panel */}
      <div className="mb-10 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-white flex items-center">
                 <Shield size={20} className="text-cyan-400 mr-2" />
                 Property Intelligence
             </h2>
             <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center px-3 py-1.5 bg-cyan-950/30 rounded-lg border border-cyan-500/20 hover:bg-cyan-900/40 transition-colors"
             >
                 <Edit3 size={14} className="mr-2" />
                 Edit Details
             </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Classification */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Classification</span>
                    <div className="flex items-center text-white font-medium mb-1">
                        <Building2 size={18} className="mr-2 text-slate-400" />
                        {project.propertyType === 'residential' ? 'Residential' : project.propertyType === 'commercial' ? 'Commercial' : 'Vacant Land'}
                    </div>
                     <div className="flex items-center text-slate-400 text-sm">
                        <Users size={16} className="mr-2 text-slate-500" />
                        {project.isAgeRestricted ? '55+ Restricted Community' : 'Standard Community'}
                    </div>
                </div>
            </div>

            {/* Card 2: Construction Status (Critical) */}
            <div className={`bg-slate-900/50 rounded-xl p-4 border flex flex-col justify-between
                ${project.constructionStatus === 'existing' ? 'border-amber-500/30 bg-amber-900/5' : 'border-green-500/30 bg-green-900/5'}`}>
                <div>
                    <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${project.constructionStatus === 'existing' ? 'text-amber-500' : 'text-green-500'}`}>
                        Construction Status
                    </span>
                    <div className="flex items-center text-white font-medium mb-1">
                         {project.constructionStatus === 'existing' ? <AlertTriangle size={18} className="mr-2 text-amber-500" /> : <Building2 size={18} className="mr-2 text-green-500" />}
                         {project.constructionStatus === 'existing' ? 'Existing Structure' : 'New / To-Be-Built'}
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">
                        {project.constructionStatus === 'existing' 
                            ? 'AI locked: No structural changes allowed.' 
                            : 'AI unlocked: Structural changes permitted.'}
                    </p>
                </div>
            </div>

             {/* Card 3: Auction Info */}
             <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Auction Status</span>
                    {project.isAuction ? (
                        <>
                            <div className="flex items-center text-white font-medium mb-1">
                                <Gavel size={18} className="mr-2 text-cyan-400" />
                                {project.auctionDetails?.date ? new Date(project.auctionDetails.date).toLocaleDateString() : 'Date Pending'}
                            </div>
                            <div className="text-xs text-slate-400">
                                {project.auctionDetails?.type} • {project.auctionDetails?.premium} Premium
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center text-slate-500 text-sm h-full pt-1">
                            No auction details listed.
                        </div>
                    )}
                </div>
            </div>

             {/* Card 4: Features */}
             <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Key Features</span>
                     <div className="text-sm text-slate-300 leading-snug line-clamp-3">
                         {project.features || <span className="text-slate-600 italic">No specific features listed. Add features to improve AI accuracy.</span>}
                     </div>
                </div>
            </div>
        </div>
      </div>

       {/* AI Copywriter Section */}
       <div className="mb-10 animate-fade-in bg-slate-900/30 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Bot size={120} />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 relative z-10">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center">
                        <Sparkles size={20} className="text-purple-400 mr-2" />
                        AI Listing Copywriter
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Generate specific, rule-compliant listing descriptions in seconds.</p>
                </div>
                <Button 
                    onClick={handleGenerateDescription} 
                    isLoading={isGeneratingDesc}
                    className="mt-4 md:mt-0 bg-purple-600/20 border-purple-500/50 text-purple-200 hover:bg-purple-600/40 hover:text-white hover:border-purple-400"
                >
                    <Sparkles size={16} className="mr-2" />
                    Generate Description
                </Button>
            </div>

            <div className="relative z-10">
                <div className="relative group">
                    <textarea 
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            onUpdateProject(project.id, { description: e.target.value });
                        }}
                        placeholder="Click generate to create a description..."
                        rows={6}
                        className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm leading-relaxed focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-y"
                    />
                    {description && (
                        <button 
                            onClick={handleCopyDescription}
                            className="absolute top-3 right-3 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    )}
                </div>
            </div>
       </div>

      {/* Photo Grid */}
      <h2 className="text-lg font-bold text-white mb-4">Project Gallery</h2>
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

      {isEditModalOpen && (
          <EditProjectModal 
            project={project}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={onUpdateProject}
          />
      )}
    </div>
  );
};

export default ProjectDetail;
