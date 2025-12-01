import React, { useState, useEffect } from 'react';
import { AppStep, StagingState, StyleOption, StagingType, User } from './types';
import UploadStep from './components/steps/UploadStep';
import CategoryStep from './components/steps/CategoryStep';
import StyleStep from './components/steps/StyleStep';
import GuidelineStep from './components/steps/GuidelineStep';
import ResultStep from './components/steps/ResultStep';
import Sidebar from './components/Sidebar';
import AuthPage from './components/AuthPage';
import { generateStagedImage, refineGeneratedImage } from './services/geminiService';
import { appwriteAuth } from './services/appwrite';
import { Menu } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
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

  // Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await appwriteAuth.getCurrentUser();
        if (currentUser) {
          setUser({
            $id: currentUser.$id,
            name: currentUser.name,
            email: currentUser.email,
          });
        }
      } catch (error) {
        console.log("No active session");
      } finally {
        setLoadingAuth(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await appwriteAuth.logout();
    setUser(null);
    // Reset app state
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
      // Use the CURRENT generated image as the base for refinement
      const refinedImage = await refineGeneratedImage(
        state.generatedImage, 
        instructions
      );

      setState(prev => ({
        ...prev,
        generatedImage: refinedImage,
        isGenerating: false
      }));
    } catch (error: any) {
      console.error("Refinement failed", error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: "Failed to refine image. Try a simpler instruction."
      }));
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
          const currentUser = await appwriteAuth.getCurrentUser();
          if (currentUser) {
            setUser({
              $id: currentUser.$id,
              name: currentUser.name,
              email: currentUser.email,
            });
          }
        }} 
      />
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100 selection:bg-cyan-500/30">
      
      {/* Sidebar Navigation */}
      <Sidebar user={user} onLogout={handleLogout} />
      
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
          
          {/* Header Section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">New Project</h1>
                <p className="text-slate-400 mt-2">Create a stunning visual transformation.</p>
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
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden min-h-[600px] relative">
            
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
                  onBack={prevStep}
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
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
