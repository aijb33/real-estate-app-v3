
import React, { useState, useEffect } from 'react';
import { AppStep, StagingState, StyleOption, StagingType, User, Project, ProjectImage } from './types';
import UploadStep from './components/steps/UploadStep';
import CategoryStep from './components/steps/CategoryStep';
import StyleStep from './components/steps/StyleStep';
import GuidelineStep from './components/steps/GuidelineStep';
import ResultStep from './components/steps/ResultStep';
import Sidebar from './components/Sidebar';
import AuthPage from './components/AuthPage';
import ProjectDashboard from './components/Projects/ProjectDashboard';
import ProjectDetail from './components/Projects/ProjectDetail';
import { generateStagedImage, refineGeneratedImage } from './services/geminiService';
import { appwriteAuth } from './services/appwrite';
import { Menu } from 'lucide-react';

// Types for navigation
type View = 'dashboard' | 'project' | 'editor';

// Sample Data for "My Listings"
const SAMPLE_PROJECTS: Project[] = [
    {
        id: 'sample-1',
        title: '101 Ocean Drive',
        address: '101 Ocean Dr, Miami, FL 33139',
        createdAt: new Date(),
        images: [],
        coverImage: 'https://images.unsplash.com/photo-1600596542815-e328700336f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // Placeholder
    }
];

function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState<User | null>({
    $id: 'dev-mode',
    name: 'Developer Agent',
    email: 'dev@oneroof.ai'
  });
  const [loadingAuth, setLoadingAuth] = useState(false);
  
  // --- PROJECT STATE ---
  const [view, setView] = useState<View>('dashboard');
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);

  // --- EDITOR STATE ---
  const [state, setState] = useState<StagingState>({
    step: AppStep.UPLOAD,
    uploadedImage: null,
    stagingType: null,
    selectedStyle: null,
    guidelines: '',
    generatedImage: null,
    isGenerating: false,
    error: null,
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- NAVIGATION ---
  const handleNavigate = (newView: View) => {
      setView(newView);
      if (newView === 'editor') {
          // Reset editor for fresh start
          setActiveProject(null);
          setActiveImageId(null);
          handleReset();
      }
      setMobileMenuOpen(false);
  };

  // --- PROJECT ACTIONS ---
  
  const handleCreateProject = () => {
    // In a real app, this would be a modal form. For MVP, we auto-create.
    const newProject: Project = {
        id: Date.now().toString(),
        title: `New Listing ${projects.length + 1}`,
        address: 'Pending Address...',
        createdAt: new Date(),
        images: []
    };
    setProjects([newProject, ...projects]);
    setActiveProject(newProject);
    setView('project');
  };

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    setView('project');
  };

  const handleUpdateProject = (id: string, data: { title: string; address: string }) => {
    setProjects(projects.map(p => 
        p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
    ));
    // If updating the active project, update it too
    if (activeProject && activeProject.id === id) {
        setActiveProject({ ...activeProject, ...data, updatedAt: new Date() });
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    if (activeProject && activeProject.id === id) {
        setActiveProject(null);
        setView('dashboard');
    }
  };

  const handleAddImageToProject = (base64: string, name: string) => {
    if (!activeProject) return;

    const newImage: ProjectImage = {
        id: Date.now().toString() + Math.random(),
        originalUrl: base64,
        status: 'original',
        name: name
    };

    const updatedProject = {
        ...activeProject,
        images: [...activeProject.images, newImage],
        coverImage: activeProject.coverImage || base64 // Set cover if first image
    };

    // Update both local active project and master list
    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleStageProjectImage = (image: ProjectImage) => {
      // 1. Prepare Editor State
      setState({
          step: AppStep.CATEGORY, // Skip upload step
          uploadedImage: image.originalUrl,
          stagingType: null,
          selectedStyle: null,
          guidelines: '',
          generatedImage: image.stagedUrl || null,
          isGenerating: false,
          error: null
      });
      setActiveImageId(image.id);
      
      // 2. Navigate to Editor
      setView('editor');
  };

  const handleDeleteImage = (imageId: string) => {
      if (!activeProject) return;
      const updatedProject = {
          ...activeProject,
          images: activeProject.images.filter(i => i.id !== imageId)
      };
      setActiveProject(updatedProject);
      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  // --- EDITOR ACTIONS ---

  // Handle saving from the Result screen to a specific project (existing or new)
  const handleSaveToSpecificProject = (projectId: string | null, newProjectTitle?: string) => {
      if (!state.generatedImage || !state.uploadedImage) return;

      // Create the new image object
      const newImage: ProjectImage = {
          id: Date.now().toString(),
          originalUrl: state.uploadedImage,
          stagedUrl: state.generatedImage,
          status: 'staged',
          name: `Staged Photo ${new Date().toLocaleTimeString()}`
      };

      let targetProject: Project;

      if (projectId) {
          // Find existing project
          const existing = projects.find(p => p.id === projectId);
          if (!existing) return;
          
          targetProject = {
              ...existing,
              images: [...existing.images, newImage],
              updatedAt: new Date()
          };
      } else {
          // Create new project
          targetProject = {
              id: Date.now().toString(),
              title: newProjectTitle || 'New Virtual Staging Project',
              address: 'Address pending...',
              createdAt: new Date(),
              updatedAt: new Date(),
              images: [newImage],
              coverImage: state.generatedImage // Set the staged image as cover
          };
      }

      // Update state
      if (projectId) {
          // Update existing in list
          setProjects(projects.map(p => p.id === targetProject.id ? targetProject : p));
      } else {
          // Add new to list
          setProjects([targetProject, ...projects]);
      }

      // Redirect to that project
      setActiveProject(targetProject);
      setView('project');
      handleReset(); // Reset editor state
  };

  // --- AUTH & MISC ---

  const handleLogout = async () => {
    setUser(null);
    handleReset();
  };

  const nextStep = () => setState(prev => ({ ...prev, step: prev.step + 1 }));
  const prevStep = () => setState(prev => ({ ...prev, step: prev.step - 1 }));

  const handleImageSelect = (base64: string) => {
    setState(prev => ({ ...prev, uploadedImage: base64 }));
  };

  const handleTypeSelect = (type: StagingType) => {
    setState(prev => ({ ...prev, stagingType: type, selectedStyle: null })); 
  };

  const handleStyleSelect = (style: StyleOption) => {
    setState(prev => ({ ...prev, selectedStyle: style }));
  };

  const handleGuidelinesChange = (text: string) => {
    setState(prev => ({ ...prev, guidelines: text }));
  };

  const handleGenerate = async () => {
    if (!state.uploadedImage || !state.selectedStyle) return;

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const resultImage = await generateStagedImage(
        state.uploadedImage,
        state.selectedStyle,
        state.guidelines
      );
      
      setState(prev => ({
        ...prev,
        generatedImage: resultImage,
        isGenerating: false,
        step: AppStep.RESULT
      }));
    } catch (error: any) {
      console.error("Generation failed", error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message || "Failed to generate image. Please try again."
      }));
    }
  };

  const handleRefine = async (instructions: string) => {
    if (!state.generatedImage) return;

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const refinedImage = await refineGeneratedImage(
        state.generatedImage, 
        instructions
      );
      setState(prev => ({ ...prev, generatedImage: refinedImage, isGenerating: false }));
    } catch (error: any) {
      setState(prev => ({ ...prev, isGenerating: false, error: "Failed to refine image." }));
    }
  };

  const handleRegenerate = async () => {
      await handleGenerate();
  };

  const handleReset = () => {
    setState({
      step: AppStep.UPLOAD,
      uploadedImage: null,
      stagingType: null,
      selectedStyle: null,
      guidelines: '',
      generatedImage: null,
      isGenerating: false,
      error: null,
    });
    // If we were editing a project image, canceling goes back to project
    if (activeImageId) {
        setView('project');
        setActiveImageId(null);
    }
  };

  const steps = [
    { num: 1, label: 'Upload' },
    { num: 2, label: 'Type' },
    { num: 3, label: 'Style' },
    { num: 4, label: 'Details' },
    { num: 5, label: 'Result' },
  ];

  // Loading Screen
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Auth Screen
  if (!user) {
    return (
      <AuthPage 
        onAuthSuccess={async () => {
          setUser({
            $id: 'dev-user',
            name: 'Developer Agent',
            email: 'dev@oneroof.ai'
          });
        }} 
      />
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100 selection:bg-cyan-500/30">
      
      {/* Sidebar Navigation */}
      <Sidebar 
          user={user} 
          onLogout={handleLogout} 
          currentView={view} 
          onNavigate={handleNavigate}
      />
      
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center">
        <span className="font-bold text-white text-lg">One Roof</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            <Menu />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-10 md:py-16 pt-20 md:pt-16">
          
          {/* VIEW: DASHBOARD */}
          {view === 'dashboard' && (
              <ProjectDashboard 
                  projects={projects} 
                  onCreateNew={handleCreateProject}
                  onSelectProject={handleSelectProject}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
              />
          )}

          {/* VIEW: PROJECT DETAIL */}
          {view === 'project' && activeProject && (
              <ProjectDetail 
                  project={activeProject}
                  onBack={() => setView('dashboard')}
                  onAddImage={handleAddImageToProject}
                  onStageImage={handleStageProjectImage}
                  onDeleteImage={handleDeleteImage}
              />
          )}

          {/* VIEW: EDITOR (Standard Flow) */}
          {view === 'editor' && (
            <>
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
                    <div>
                        <button 
                            onClick={handleReset} 
                            className="text-slate-400 text-sm hover:text-white mb-2 flex items-center"
                        >
                             {activeProject ? '← Back to Project' : '← Back Home'}
                        </button>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            {activeProject ? `Editing: ${activeProject.title}` : 'New Transformation'}
                        </h1>
                    </div>
                    
                    {/* Step Indicator */}
                    <div className="hidden md:flex items-center space-x-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                        {steps.map((s, idx) => (
                            <div key={s.num} className="flex items-center">
                                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                    ${state.step === idx 
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm' 
                                        : state.step > idx 
                                            ? 'text-slate-400' 
                                            : 'text-slate-600'}`}>
                                    <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] 
                                        ${state.step === idx ? 'bg-cyan-500 text-white' : 'bg-slate-800'}`}>
                                        {state.step > idx ? '✓' : s.num}
                                    </span>
                                    <span>{s.label}</span>
                                </div>
                                {idx < steps.length - 1 && <div className="w-4 h-[1px] bg-slate-800 mx-1" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workflow Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden min-h-[600px] relative animate-fade-in">
                    
                    {/* Loading Overlay */}
                    {state.isGenerating && (
                        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-cyan-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                </div>
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-white">
                                {state.step === AppStep.RESULT ? 'Refining Details...' : 'Rendering Vision...'}
                            </h3>
                            <p className="text-slate-400 mt-2">AI is reimagining your space</p>
                        </div>
                    )}

                    <div className="p-6 md:p-10 h-full">
                        {state.error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-start">
                            <div className="mr-3 mt-0.5 text-red-400">⚠️</div>
                            <div>
                                <strong className="block text-red-400 font-semibold mb-1">Process Failed</strong>
                                {state.error}
                            </div>
                            </div>
                        )}

                        {state.step === AppStep.UPLOAD && (
                            <UploadStep
                                onImageSelect={handleImageSelect}
                                currentImage={state.uploadedImage}
                                onNext={nextStep}
                            />
                        )}

                        {state.step === AppStep.CATEGORY && (
                            <CategoryStep
                                selectedType={state.stagingType}
                                onSelectType={handleTypeSelect}
                                onNext={nextStep}
                                onBack={activeImageId ? handleReset : prevStep} // Back exits if came from project
                            />
                        )}

                        {state.step === AppStep.STYLE && (
                            <StyleStep
                                selectedStyle={state.selectedStyle}
                                stagingType={state.stagingType}
                                onSelectStyle={handleStyleSelect}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}

                        {state.step === AppStep.GUIDELINES && (
                            <GuidelineStep
                                guidelines={state.guidelines}
                                onGuidelinesChange={handleGuidelinesChange}
                                onGenerate={handleGenerate}
                                onBack={prevStep}
                                isGenerating={state.isGenerating}
                            />
                        )}

                        {state.step === AppStep.RESULT && (
                            <ResultStep
                                uploadedImage={state.uploadedImage}
                                generatedImage={state.generatedImage}
                                onReset={handleReset}
                                onRefine={handleRefine}
                                onRegenerate={handleRegenerate}
                                isProcessing={state.isGenerating}
                                projects={projects}
                                onSaveToProject={handleSaveToSpecificProject}
                            />
                        )}
                    </div>
                </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
