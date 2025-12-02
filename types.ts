
export type StagingType = 'interior' | 'exterior';

export interface StyleOption {
  id: string;
  type: StagingType;
  name: string;
  description: string;
  previewColor: string;
  customPrompt?: string;
}

export enum AppStep {
  UPLOAD = 0,
  CATEGORY = 1,
  STYLE = 2,
  GUIDELINES = 3,
  RESULT = 4,
}

export interface User {
  $id: string;
  name: string;
  email: string;
}

export interface StagingState {
  step: AppStep;
  uploadedImage: string | null; // base64
  stagingType: StagingType | null;
  selectedStyle: StyleOption | null;
  guidelines: string;
  generatedImage: string | null; // base64
  isGenerating: boolean;
  error: string | null;
}

// Project System Types
export type ImageStatus = 'original' | 'processing' | 'staged';

export interface ProjectImage {
  id: string;
  originalUrl: string; // base64 for now
  stagedUrl?: string; // base64
  status: ImageStatus;
  name: string;
}

export type ConstructionStatus = 'existing' | 'new_construction';
export type PropertyType = 'residential' | 'commercial' | 'land';

export interface AuctionDetails {
  date: string;
  type: string;
  premium: string;
}

export interface Project {
  id: string;
  // Replaced title/address with structured fields
  street: string;
  city: string;
  state: string;
  zip: string;
  
  createdAt: Date;
  updatedAt?: Date;
  images: ProjectImage[];
  coverImage?: string;
  
  // Legal & Form Info
  constructionStatus: ConstructionStatus;
  propertyType: PropertyType;
  isAgeRestricted: boolean;
  isAuction: boolean;
  auctionDetails?: AuctionDetails;
  features: string; // "Actual Features to Highlight"
  description?: string; // AI Generated Description
}

export const US_STATES = [
    { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
];

export const STYLES: StyleOption[] = [
  // Exterior Styles
  { 
    id: 'exterior-twilight-hero', 
    type: 'exterior',
    name: 'Modern Twilight Hero', 
    description: 'Cinematic early twilight, warm lighting, ultra-realistic architectural photography.', 
    previewColor: 'bg-blue-900',
    customPrompt: `Transform this photo of the house into a professional, cinematic architectural photograph during early twilight, just before sunset, keeping the house’s structure, roofline, windows, doors, and key features recognizable. Maintain ample natural ambient light so colors, materials, and textures remain vibrant and visible, while interior and exterior lights gently glow, creating a warm, inviting contrast against the soft evening sky. Render in ultra-realistic, cinematic style with micro-contrast, texture fidelity, soft layered shadows, and smooth highlight roll-off. Include reflections on glass, wood, and stone surfaces, gradual depth-of-field with realistic bokeh, and clear foreground/midground/background separation. Add subtle atmospheric effects: soft haze. Include organic photographic imperfections like chromatic aberration and sensor grain. Render as if photographed by a high-end architectural photographer at early twilight, cinematic, immersive, bright yet dramatic, and dramatically more polished than the original, while keeping the house instantly identifiable. High-resolution, hyper-detailed, professional-grade result.`
  },
  { 
    id: 'exterior-sunny-day', 
    type: 'exterior',
    name: 'Sunny Day', 
    description: 'Bright, inviting natural daylight with blue skies and enhanced landscaping.', 
    previewColor: 'bg-sky-500' 
  },
  { 
    id: 'exterior-modern-luxury', 
    type: 'exterior', 
    name: 'Modern Luxury', 
    description: 'High-end aesthetic with manicured grounds and modern exterior finishes.', 
    previewColor: 'bg-cyan-700' 
  },

  // Interior Styles (Specific JSON Presets)
  { 
    id: 'interior-scandi-clean', 
    type: 'interior', 
    name: 'Scandi Clean', 
    description: 'Safe, Bright, Minimalist. Best for small spaces.', 
    previewColor: 'bg-stone-200',
    customPrompt: `{
  "task": "vacancy_fill_staging",
  "style_preset": "SCANDINAVIAN_MINIMALIST",
  "preservation_rules": {
    "hard_constraints": ["keep_original_walls", "keep_original_flooring", "keep_window_views", "no_structural_changes"],
    "lighting_logic": "match_natural_window_direction"
  },
  "staging_content": {
    "palette": ["Bright White", "Light Heather Grey", "Blonde Oak Wood", "Soft Sage Green"],
    "furniture_selection": [
      {
        "type": "Sofa",
        "desc": "Low-profile modern sofa in light grey premium fabric with light oak legs",
        "placement": "float_center_facing_focal_point"
      },
      {
        "type": "Coffee_Table",
        "desc": "Round nesting tables, white top with light wood legs",
        "placement": "center_of_rug"
      },
      {
        "type": "Accent_Chair",
        "desc": "Wishbone-style wooden chair or simple armchair in cream boucle",
        "placement": "angle_towards_sofa"
      }
    ],
    "decor_layer": {
      "textiles": "Textured white wool rug, linen throw pillows",
      "greenery": "Single Monstera plant in a woven basket",
      "art": "Large minimalist line-art frame on main wall"
    }
  },
  "technical_rendering": {
    "ambiance": "Soft, airy, high-key lighting",
    "shadow_quality": "diffuse_and_soft"
  }
}`
  },
  { 
    id: 'interior-modern-farmhouse', 
    type: 'interior', 
    name: 'Modern Farmhouse', 
    description: 'Cozy, Family, Rustic. Best for suburban homes.', 
    previewColor: 'bg-amber-100',
    customPrompt: `{
  "task": "vacancy_fill_staging",
  "style_preset": "MODERN_FARMHOUSE",
  "preservation_rules": {
    "hard_constraints": ["keep_original_walls", "keep_original_flooring", "keep_window_views", "no_structural_changes"],
    "lighting_logic": "match_natural_window_direction"
  },
  "staging_content": {
    "palette": ["Cream", "Charcoal/Matte Black", "Reclaimed Wood", "Navy Blue Accents"],
    "furniture_selection": [
      {
        "type": "Sofa",
        "desc": "Overstuffed white slipcovered sofa, very inviting and casual",
        "placement": "float_center_facing_focal_point"
      },
      {
        "type": "Coffee_Table",
        "desc": "Solid reclaimed rustic wood table with iron hardware",
        "placement": "center_of_rug"
      },
      {
        "type": "Accent_Chair",
        "desc": "Leather club chair in cognac or spindle-back wooden chair",
        "placement": "angle_towards_sofa"
      }
    ],
    "decor_layer": {
      "textiles": "Jute or sisal natural fiber rug, chunky knit throw blanket",
      "greenery": "Faux olive tree in terracotta pot",
      "art": "Pastel landscape or botanical prints with black frames"
    }
  },
  "technical_rendering": {
    "ambiance": "Warm, inviting, golden undertones",
    "shadow_quality": "warm_and_grounded"
  }
}`
  },
  { 
    id: 'interior-mid-century', 
    type: 'interior', 
    name: 'Mid-Century Modern', 
    description: 'Trendy, Cool, Retro. Best for lofts.', 
    previewColor: 'bg-orange-300',
    customPrompt: `{
  "task": "vacancy_fill_staging",
  "style_preset": "MID_CENTURY_MODERN",
  "preservation_rules": {
    "hard_constraints": ["keep_original_walls", "keep_original_flooring", "keep_window_views", "no_structural_changes"],
    "lighting_logic": "match_natural_window_direction"
  },
  "staging_content": {
    "palette": ["Walnut Wood", "Burnt Orange", "Teal", "Mustard Yellow", "Slate Grey"],
    "furniture_selection": [
      {
        "type": "Sofa",
        "desc": "Tufted leather sofa in tan or sleek grey tweed with tapered wooden legs",
        "placement": "float_center_facing_focal_point"
      },
      {
        "type": "Coffee_Table",
        "desc": "Noguchi-style glass table or walnut amoeba shape table",
        "placement": "center_of_rug"
      },
      {
        "type": "Accent_Chair",
        "desc": "Eames-style lounge chair or sculptural velvet armchair",
        "placement": "angle_towards_sofa"
      }
    ],
    "decor_layer": {
      "textiles": "Geometric pattern rug, velvet cushions",
      "greenery": "Snake plant in ceramic planter on a stand",
      "art": "Large abstract color-block canvas"
    }
  },
  "technical_rendering": {
    "ambiance": "Cool, crisp, architectural magazine look",
    "shadow_quality": "sharp_and_defined"
  }
}`
  },
  { 
    id: 'interior-transitional-luxury', 
    type: 'interior', 
    name: 'Transitional Luxury', 
    description: 'Expensive, Neutral, High-End. Best for luxury listings.', 
    previewColor: 'bg-stone-300',
    customPrompt: `{
  "task": "vacancy_fill_staging",
  "style_preset": "TRANSITIONAL_LUXURY",
  "preservation_rules": {
    "hard_constraints": ["keep_original_walls", "keep_original_flooring", "keep_window_views", "no_structural_changes"],
    "lighting_logic": "match_natural_window_direction"
  },
  "staging_content": {
    "palette": ["Taupe", "Champagne", "Ivory", "Dark Espresso Wood", "Metallic Gold/Silver"],
    "furniture_selection": [
      {
        "type": "Sofa",
        "desc": "Large tailored sectional in performance beige linen with nailhead trim",
        "placement": "float_center_facing_focal_point"
      },
      {
        "type": "Coffee_Table",
        "desc": "Large square glass table with brass or chrome metal frame",
        "placement": "center_of_rug"
      },
      {
        "type": "Accent_Chair",
        "desc": "Pair of high-back upholstered armchairs in neutral tone",
        "placement": "symmetrical_arrangement"
      }
    ],
    "decor_layer": {
      "textiles": "Plush silk-blend rug, high-end decorative pillows",
      "greenery": "White orchids in a silver vase",
      "art": "Subtle textured canvas or oversized mirror"
    }
  },
  "technical_rendering": {
    "ambiance": "Balanced, symmetrical, 'hotel lobby' lighting",
    "shadow_quality": "subtle_ambient_occlusion"
  }
}`
  },
];