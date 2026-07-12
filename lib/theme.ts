export const THEME_STORAGE_KEY = "opsbrain-theme";

export type ThemeMode = "light" | "dark";

export const THEME_META_COLORS: Record<ThemeMode, string> = {
  light: "#FFFFFF",
  dark: "#0E1219",
};

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    return t === "dark" || t === "light" ? t : null;
  } catch {
    return null;
  }
}

export function resolveTheme(): ThemeMode {
  const stored = getStoredTheme();
  if (stored) return stored;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function applyTheme(mode: ThemeMode): void {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.style.colorScheme = mode;

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", THEME_META_COLORS[mode]);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains("dark");
}
