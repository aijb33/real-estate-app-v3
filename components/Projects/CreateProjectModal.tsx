
import React, { useState, useRef, useEffect } from 'react';
import { Project, ConstructionStatus, PropertyType, AuctionDetails, US_STATES } from '../../types';
import { X, Building2, Gavel, FileText, AlertTriangle, MapPin, Info, ChevronDown, Check, Users } from 'lucide-react';
import Button from '../Button';

interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'images'>) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSubmit }) => {
  // Location Info
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  
  // Legal / Status
  const [constructionStatus, setConstructionStatus] = useState<ConstructionStatus>('existing');
  
  // Dropdown States
  const [propertyType, setPropertyType] = useState<PropertyType>('residential');
  const [isPropTypeOpen, setIsPropTypeOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  
  const propTypeRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);

  const [isAgeRestricted, setIsAgeRestricted] = useState(false);
  
  // Auction
  const [isAuction, setIsAuction] = useState(false);
  const [auctionDetails, setAuctionDetails] = useState<AuctionDetails>({
    date: '',
    type: '',
    premium: ''
  });

  // Features
  const [features, setFeatures] = useState('');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (propTypeRef.current && !propTypeRef.current.contains(event.target as Node)) {
        setIsPropTypeOpen(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setIsStateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !zip) return;

    onSubmit({
      street,
      city,
      state,
      zip,
      constructionStatus,
      propertyType,
      isAgeRestricted,
      isAuction,
      auctionDetails: isAuction ? auctionDetails : undefined,
      features,
      coverImage: undefined
    });
  };

  const propertyTypeOptions: { value: PropertyType; label: string }[] = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Vacant Land' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-fade-in flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-20">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Create New Listing</h2>
            <p className="text-sm text-slate-400 mt-1">Enter property details for accurate AI compliance.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10 flex-1">
          
          {/* Section 1: Property Location */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center">
              <MapPin size={14} className="mr-2" /> Property Location
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Street Address</label>
                <input 
                  required
                  type="text" 
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 101 Ocean Drive"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">City</label>
                    <input 
                      required
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Miami"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                    />
                  </div>

                  {/* Custom State Dropdown */}
                  <div className="space-y-2 relative" ref={stateRef}>
                    <label className="text-sm font-medium text-slate-300">State</label>
                    <button
                        type="button"
                        onClick={() => setIsStateOpen(!isStateOpen)}
                        className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-left flex justify-between items-center transition-all duration-200
                          ${isStateOpen ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-slate-700 hover:border-slate-500 text-slate-200'}`}
                    >
                        <span className={`block truncate ${!state ? 'text-slate-500' : 'text-white'}`}>
                          {state ? US_STATES.find(s => s.value === state)?.label : 'Select State'}
                        </span>
                        <ChevronDown 
                          size={16} 
                          className={`text-slate-500 transition-transform duration-300 ${isStateOpen ? 'rotate-180 text-cyan-500' : ''}`} 
                        />
                    </button>

                    {/* Dropdown Menu */}
                    <div className={`absolute z-30 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-top max-h-60 overflow-y-auto custom-scrollbar
                        ${isStateOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                    >
                        {US_STATES.map((s) => (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => {
                                    setState(s.value);
                                    setIsStateOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                                  ${state === s.value ? 'bg-cyan-900/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                            >
                                {s.label}
                                {state === s.value && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Zip Code</label>
                    <input 
                      required
                      type="text" 
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="e.g. 33139"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                    />
                  </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-800/50" />

          {/* Section 2: Legal & Classification */}
          <div className="space-y-6">
             <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center">
              <Building2 size={14} className="mr-2" /> Status & Classification
            </h3>

             {/* Construction Status Cards */}
             <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-800">
                <label className="block text-sm font-medium text-white mb-3">Construction Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setConstructionStatus('existing')}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-start group relative overflow-hidden
                            ${constructionStatus === 'existing' 
                                ? 'bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500 ring-1 ring-cyan-500/30' 
                                : 'bg-slate-950 border-slate-700 hover:border-slate-600'}`}
                    >
                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 transition-colors ${constructionStatus === 'existing' ? 'border-cyan-500' : 'border-slate-600 group-hover:border-slate-500'}`}>
                             {constructionStatus === 'existing' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />}
                        </div>
                        <div>
                            <span className={`block font-semibold text-sm mb-0.5 ${constructionStatus === 'existing' ? 'text-white' : 'text-slate-300'}`}>Existing Property</span>
                            <span className="text-xs text-slate-500 leading-snug">Walls & floors are preserved. Virtual decor only.</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setConstructionStatus('new_construction')}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-start group relative overflow-hidden
                            ${constructionStatus === 'new_construction' 
                                ? 'bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500 ring-1 ring-cyan-500/30' 
                                : 'bg-slate-950 border-slate-700 hover:border-slate-600'}`}
                    >
                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 transition-colors ${constructionStatus === 'new_construction' ? 'border-cyan-500' : 'border-slate-600 group-hover:border-slate-500'}`}>
                             {constructionStatus === 'new_construction' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />}
                        </div>
                        <div>
                            <span className={`block font-semibold text-sm mb-0.5 ${constructionStatus === 'new_construction' ? 'text-white' : 'text-slate-300'}`}>New / To-Be-Built</span>
                            <span className="text-xs text-slate-500 leading-snug">Full structural staging (walls/floors) allowed.</span>
                        </div>
                    </button>
                </div>
                {constructionStatus === 'existing' && (
                    <div className="mt-3 flex items-center text-amber-500/80 text-xs bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/10">
                        <AlertTriangle size={12} className="mr-2 flex-shrink-0" />
                        AI will be restricted from modifying structural elements (walls, permanent fixtures).
                    </div>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Custom Property Type Dropdown */}
                <div className="space-y-2 relative" ref={propTypeRef}>
                    <label className="text-sm font-medium text-slate-300">Property Type</label>
                    <button
                        type="button"
                        onClick={() => setIsPropTypeOpen(!isPropTypeOpen)}
                        className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-left flex justify-between items-center transition-all duration-200
                          ${isPropTypeOpen ? 'border-cyan-500 ring-1 ring-cyan-500 shadow-lg shadow-cyan-900/20' : 'border-slate-700 hover:border-slate-500 text-slate-200'}`}
                    >
                        <span className="block truncate">
                          {propertyTypeOptions.find(opt => opt.value === propertyType)?.label}
                        </span>
                        <ChevronDown 
                          size={16} 
                          className={`text-slate-500 transition-transform duration-300 ${isPropTypeOpen ? 'rotate-180 text-cyan-500' : ''}`} 
                        />
                    </button>

                    {/* Dropdown Menu */}
                    <div className={`absolute z-30 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-top
                        ${isPropTypeOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                    >
                        {propertyTypeOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    setPropertyType(option.value);
                                    setIsPropTypeOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors
                                  ${propertyType === option.value ? 'bg-cyan-900/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                            >
                                {option.label}
                                {propertyType === option.value && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Styled 55+ Toggle */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Community Restrictions</label>
                    <button
                        type="button"
                        onClick={() => setIsAgeRestricted(!isAgeRestricted)}
                        className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between transition-all duration-200
                            ${isAgeRestricted 
                                ? 'bg-slate-800 border-cyan-500/50 shadow-sm' 
                                : 'bg-slate-950 border-slate-700 hover:border-slate-600'}`}
                    >
                        <div className="flex items-center">
                            <Users size={18} className={`mr-3 ${isAgeRestricted ? 'text-cyan-400' : 'text-slate-500'}`} />
                            <span className={`text-sm ${isAgeRestricted ? 'text-white font-medium' : 'text-slate-400'}`}>
                                55+ / Age Restricted
                            </span>
                        </div>
                        
                        {/* Custom Switch UI */}
                        <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ${isAgeRestricted ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${isAgeRestricted ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </button>
                </div>
             </div>
          </div>

          <div className="h-px bg-slate-800/50" />

          {/* Section 3: Auction Info */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center">
                    <Gavel size={14} className="mr-2" /> Auction Status
                </h3>
                <label className="relative inline-flex items-center cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={isAuction}
                      onChange={(e) => setIsAuction(e.target.checked)}
                    />
                    <div className="w-12 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-600 group-hover:bg-slate-600"></div>
                </label>
            </div>

            {isAuction && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-800/20 p-5 rounded-xl border border-slate-800 animate-in slide-in-from-top-4 fade-in duration-300">
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Auction Date</label>
                        <input 
                          type="date"
                          value={auctionDetails.date}
                          onChange={(e) => setAuctionDetails({...auctionDetails, date: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Auction Type</label>
                        <input 
                          type="text"
                          placeholder="e.g. Absolute"
                          value={auctionDetails.type}
                          onChange={(e) => setAuctionDetails({...auctionDetails, type: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Buyer Premium</label>
                        <input 
                          type="text"
                          placeholder="e.g. 5%"
                          value={auctionDetails.premium}
                          onChange={(e) => setAuctionDetails({...auctionDetails, premium: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                     </div>
                </div>
            )}
          </div>

          <div className="h-px bg-slate-800/50" />

          {/* Section 4: Features */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center">
              <FileText size={14} className="mr-2" /> Key Features & Rooms
            </h3>
            
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">
                    What permanent features or rooms should be highlighted?
                </label>
                <textarea 
                    rows={3}
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="e.g. Original hardwood floors, marble fireplace in living room, primary suite with bay windows..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-shadow"
                />
                <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <Info size={14} className="mt-0.5 text-cyan-500 flex-shrink-0" />
                    <p className="leading-relaxed">Listing specific room names (e.g. 'Primary Bedroom') ensures MRED Section 1.5 compliance and better AI results.</p>
                </div>
            </div>
          </div>

        </form>

        <div className="px-8 py-6 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-20 flex justify-end space-x-3 rounded-b-3xl">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!street || !city || !state || !zip}>Create Listing</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
