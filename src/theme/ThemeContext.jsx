import { createContext, useContext, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "theme";
const ThemeContext = createContext(null);

function getInitialDarkMode() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme === "dark";
  } catch (error) {
    console.warn("تعذّر قراءة إعداد المظهر المحفوظ.", error);
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn("تعذّر حفظ إعداد المظهر.", error);
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((currentMode) => !currentMode);

  return <ThemeContext.Provider value={{ darkMode, toggleTheme }}>{children}</ThemeContext.Provider>;
}

// The hook is intentionally exported alongside its provider and context.
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return theme;
}
