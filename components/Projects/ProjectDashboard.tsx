
import React from 'react';
import { Project } from '../../types';
import ProjectCard from './ProjectCard';
import { Plus } from 'lucide-react';
import Button from '../Button';

interface ProjectDashboardProps {
  projects: Project[];
  onCreateNew: () => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject?: (id: string, data: { title: string; address: string }) => void;
  onDeleteProject?: (id: string) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ 
  projects, 
  onCreateNew, 
  onSelectProject,
  onUpdateProject,
  onDeleteProject
}) => {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">My Listings</h2>
          <p className="text-slate-400 mt-2">Manage your virtual staging projects.</p>
        </div>
        <Button onClick={onCreateNew} className="shadow-cyan-500/20">
          <Plus size={18} className="mr-2" />
          Create New Listing
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
          <div className="mx-auto h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
             <Plus size={32} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No listings yet</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">Start by creating your first property listing to manage multiple staged photos in one place.</p>
          <Button variant="outline" onClick={onCreateNew}>Create Listing</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => onSelectProject(project)} 
              onUpdate={onUpdateProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
