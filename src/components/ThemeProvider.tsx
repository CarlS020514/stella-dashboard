'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ThemeContextType = {
  themeColor: string;
  setThemeColor: (color: string) => void;
  desktopMode: boolean;
  setDesktopMode: (enabled: boolean) => void;
  bgImage: string | null;
  setBgImage: (url: string | null) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themeColor: '#5865F2',
  setThemeColor: () => {},
  desktopMode: false,
  setDesktopMode: () => {},
  bgImage: null,
  setBgImage: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState('#5865F2');
  const [desktopMode, setDesktopMode] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage
    const savedTheme = localStorage.getItem('stella_theme_color');
    if (savedTheme) setThemeColor(savedTheme);

    const savedDesktop = localStorage.getItem('stella_desktop_mode');
    if (savedDesktop === 'true') setDesktopMode(true);
  }, []);

  // Apply Background Image to Body
  useEffect(() => {
    if (mounted && bgImage) {
      document.body.classList.add('has-bg-image');
      document.body.style.backgroundImage = `linear-gradient(rgba(10, 10, 15, 0.4), rgba(10, 10, 15, 0.8)), url('${bgImage}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center top'; // Focuses on the top of the image
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
    } else if (mounted) {
      document.body.classList.remove('has-bg-image');
      document.body.style.backgroundImage = '';
    }
  }, [bgImage, mounted]);

  // Update CSS variable
  useEffect(() => {
    if (mounted) {
      document.documentElement.style.setProperty('--accent', themeColor);
      
      // Convert HEX to RGB for the background glow
      const hex = themeColor.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
      }
      
      localStorage.setItem('stella_theme_color', themeColor);
    }
  }, [themeColor, mounted]);

  // Update Viewport
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('stella_desktop_mode', desktopMode ? 'true' : 'false');
      let meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        document.head.appendChild(meta);
      }
      
      if (desktopMode) {
        // Desktop mode: normal behavior, user can pinch/zoom
        meta.setAttribute('content', 'width=device-width, initial-scale=1');
      } else {
        // Mobile mode: strictly locked width, no zoom
        meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0');
      }
    }
  }, [desktopMode, mounted]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, desktopMode, setDesktopMode, bgImage, setBgImage }}>
      {children}
    </ThemeContext.Provider>
  );
}
