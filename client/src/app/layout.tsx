// Import Next.js type definitions for metadata configuration
import type { Metadata } from "next";

// Import Google Fonts for consistent typography across the application
// Geist: Modern sans-serif font family for body text and UI elements
// Geist_Mono: Monospace font family for code blocks and technical content
import { Geist, Geist_Mono } from "next/font/google";

// Import global CSS styles that apply to the entire application
import "./globals.css";

/**
 * Font Configuration - Geist Sans
 * 
 * Primary sans-serif font used throughout the application for:
 * - Body text and paragraphs
 * - Headings and titles
 * - User interface elements
 * - Navigation and buttons
 * 
 * Configuration:
 * - CSS variable: --font-geist-sans (for use in Tailwind CSS)
 * - Subsets: Latin characters (covers English and most European languages)
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Font Configuration - Geist Mono
 * 
 * Monospace font used for technical content such as:
 * - Code snippets and programming examples
 * - Terminal outputs and logs
 * - Data tables and fixed-width content
 * - JSON displays and API responses
 * 
 * Configuration:
 * - CSS variable: --font-geist-mono (for use in Tailwind CSS)
 * - Subsets: Latin characters (covers English and most European languages)
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Application Metadata Configuration
 * 
 * Defines the metadata that appears in:
 * - Browser tab titles
 * - Search engine results
 * - Social media previews
 * - Bookmark descriptions
 * 
 * Searchly application metadata
 */
export const metadata = {
  title: 'Searchly',
  description: 'Search engine powered by AI',
};

/**
 * RootLayout Component - Main HTML layout wrapper for the entire application
 * 
 * This component serves as the root layout that wraps all pages in the application.
 * It provides:
 * 
 * - HTML document structure (html and body tags)
 * - Font loading and CSS variable setup
 * - Global styling and theme configuration
 * - Base accessibility features (lang attribute)
 * - Typography optimization (antialiased text rendering)
 * 
 * Layout responsibilities:
 * - Sets up the overall page structure
 * - Applies global fonts and CSS variables
 * - Ensures consistent styling across all pages
 * - Provides a container for page-specific content
 * 
 * Font integration:
 * - Applies CSS variables for both Geist fonts
 * - Enables font swapping for better performance
 * - Provides fallback fonts for loading states
 * 
 * @param children - The page content to render within the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // Type definition for child components/pages
}>) {
  return (
    // HTML document root with language specification for accessibility
    <html lang="en">
      {/* Body element with font variables and text optimization */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Page content will be rendered here by Next.js routing */}
        {children}
      </body>
    </html>
  );
}
