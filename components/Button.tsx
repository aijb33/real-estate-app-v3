
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 text-sm font-bold tracking-wide rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    // New "Neon/Glow" style matching Sidebar Tabs
    primary: "text-cyan-400 bg-blue-950/30 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] backdrop-blur-md",
    
    secondary: "text-white bg-slate-800 hover:bg-slate-700 border border-slate-700",
    outline: "border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white bg-transparent",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50",
    glass: "text-white bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : children}
      
      {/* Subtle shine effect for primary buttons */}
      {variant === 'primary' && !disabled && !isLoading && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent z-10" />
      )}
    </button>
  );
};

export default Button;
