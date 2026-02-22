import React from 'react';

/**
 * Header Component - Top navigation bar for the Searchly application
 * 
 * This component provides:
 * - Brand identity with gradient background and logo
 * - Visual elements including decorative accents and overlays
 * - Responsive design with hover effects and smooth transitions
 * 
 * Design features:
 * - Purple gradient background (#4A3F71 to #5E507F)
 * - Subtle pattern overlay for texture
 * - Teal accent color for brand highlight
 * - Clean typography with proper spacing
 */
export const Header: React.FC = () => {
    return (
        <header className="relative flex items-center justify-between px-8 py-5 bg-gradient-to-r from-[#4A3F71] to-[#5E507F] z-10">
            {/* Background texture overlay - provides subtle pattern without overwhelming the content */}
            <div className="absolute inset-0 bg-[url('/api/placeholder/100/100')] opacity-5 mix-blend-overlay"></div>
            
            {/* Bottom border gradient - adds subtle separation from main content */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            {/* Brand/Logo section - left side of header */}
            <div className="flex items-center relative">
                {/* Decorative accent bar - teal highlight that reinforces brand identity */}
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1.5 h-6 bg-teal-400 rounded-full opacity-80"></div>
                
                {/* Search icon for Searchly brand */}
                <div className="mr-3">
                    <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                
                {/* Main application title with clean typography */}
                <span className="font-bold text-white text-xl tracking-tight">Searchly</span>
            </div>

            {/* Navigation section removed to reduce redundancy */}
        </header>
    );
};
