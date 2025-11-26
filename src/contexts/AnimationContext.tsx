import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AnimationContextType {
  animationsEnabled: boolean;
  toggleAnimations: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
  // Initialize from localStorage or system preference
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem("animationsEnabled");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return !prefersReducedMotion;
  });

  useEffect(() => {
    localStorage.setItem("animationsEnabled", JSON.stringify(animationsEnabled));
    
    // Add/remove class to body for CSS targeting
    if (animationsEnabled) {
      document.body.classList.remove("reduce-animations");
    } else {
      document.body.classList.add("reduce-animations");
    }
  }, [animationsEnabled]);

  const toggleAnimations = () => {
    setAnimationsEnabled((prev: boolean) => !prev);
  };

  return (
    <AnimationContext.Provider value={{ animationsEnabled, toggleAnimations }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimations = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error("useAnimations must be used within AnimationProvider");
  }
  return context;
};
