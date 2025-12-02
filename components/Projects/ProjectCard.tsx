
import React, { useState, useRef, useEffect } from 'react';
import { Project, US_STATES } from '../../types';
import { Image as ImageIcon, Calendar, MapPin, ChevronRight, MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onUpdate?: (id: string, data: Partial<Project>) => void;
  onDelete?: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onUpdate, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit States
  const [editStreet, setEditStreet] = useState(project.street);
  const [editCity, setEditCity] = useState(project.city);
  const [editState, setEditState] = useState(project.state);
  const [editZip, setEditZip] = useState(project.zip);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdate) {
      onUpdate(project.id, { 
          street: editStreet,
          city: editCity,
          state: editState,
          zip: editZip
      });
    }
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditStreet(project.street);
    setEditCity(project.city);
    setEditState(project.state);
    setEditZip(project.zip);
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        if (onDelete) onDelete(project.id);
    }
  };

  return (
    <div 
      className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer"
      onClick={!isEditing ? onClick : undefined}
    >
      {/* Cover Image */}
      <div className="h-48 w-full bg-slate-800 relative overflow-hidden">
        {project.coverImage ? (
          <img 
            src={project.coverImage} 
            alt={project.street} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-slate-800/50">
            <ImageIcon className="text-slate-600 h-10 w-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
        
        {/* Count Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md text-xs font-bold text-white">
          {project.images.length} Photos
        </div>

        {/* Menu Button */}
        <div className="absolute top-3 left-3" ref={menuRef}>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors border border-white/10"
            >
                <MoreVertical size={16} />
            </button>
            
            {isMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center"
                    >
                        <Edit2 size={14} className="mr-2" /> Edit Info
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center"
                    >
                        <Trash2 size={14} className="mr-2" /> Delete
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {isEditing ? (
            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <input 
                    type="text" 
                    value={editStreet}
                    onChange={(e) => setEditStreet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-cyan-500 outline-none"
                    placeholder="Street Address"
                    autoFocus
                />
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:border-cyan-500 outline-none"
                        placeholder="City"
                    />
                     <select
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                        className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 text-xs focus:border-cyan-500 outline-none"
                    >
                        {US_STATES.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
                    </select>
                </div>
                <input 
                    type="text" 
                    value={editZip}
                    onChange={(e) => setEditZip(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:border-cyan-500 outline-none"
                    placeholder="Zip Code"
                />

                <div className="flex justify-end space-x-2 pt-1">
                    <button onClick={handleCancel} className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400">
                        <X size={16} />
                    </button>
                    <button onClick={handleSave} className="p-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white">
                        <Check size={16} />
                    </button>
                </div>
            </div>
        ) : (
            <>
                <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-cyan-400 transition-colors">
                  {project.street}
                </h3>
                
                <div className="space-y-2 mt-3">
                  <div className="flex items-center text-sm text-slate-400">
                    <MapPin size={14} className="mr-2 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{project.city}, {project.state} {project.zip}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-400">
                    <Calendar size={14} className="mr-2 text-slate-500 flex-shrink-0" />
                    <span>{project.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
            </>
        )}

        {!isEditing && (
            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500">
                 {project.images.filter(i => i.status === 'staged').length} Staged
              </span>
              <span className="text-cyan-400 flex items-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                Open Project <ChevronRight size={16} className="ml-1" />
              </span>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
