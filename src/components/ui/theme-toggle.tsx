
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
  const [mounted, setMounted] = useState(false);
  
  // Only run client-side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Apply theme on mount and when it changes
  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme immediately without checking system preference
    applyTheme(theme);
  }, [theme, mounted]);
  
  const applyTheme = (newTheme: "light" | "dark") => {
    // Ensure we're working with the actual document
    if (typeof document === 'undefined') return;
    
    // Force remove both classes first
    document.documentElement.classList.remove("dark", "light");
    
    // Add the appropriate class
    document.documentElement.classList.add(newTheme);
    
    // Also set the color-scheme meta tag for better mobile support
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#0f172a' : '#ffffff');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = newTheme === 'dark' ? '#0f172a' : '#ffffff';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  };
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };
  
  // Avoid hydration mismatch by only rendering after mount
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label="Loading theme toggle"
      >
        <div className="h-5 w-5" />
      </Button>
    );
  }
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="relative"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 transition-all" />
      ) : (
        <Sun className="h-5 w-5 transition-all" />
      )}
    </Button>
  );
}
