import React, { createContext, useContext, useEffect, useState } from "react";

export interface ColorScheme {
  id: string;
  name: string;
  isDarkHeader: boolean;
  swatchColors: [string, string, string, string]; // 4 swatch bars matching WP UI
  styles: {
    navy: string;       // Primary dark header / main dark UI color
    navy2: string;      // Secondary header / hover background
    emerald: string;    // Main active/accent color (CTA buttons, active indicators)
    green: string;      // CTA hover color
    mint: string;       // Soft active background / pill badge fill
    offwhite: string;   // Page canvas background
    grey: string;       // Muted text color
    border: string;     // Border divider color
    logoText: string;   // Logo text fill color (#FFFFFF or #081426)
    logoGrad: [string, string, string]; // SVG Logo "10" badge linear gradient stops
  };
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "default",
    name: "Default (Think10 Emerald)",
    isDarkHeader: true,
    swatchColors: ["#081426", "#00b979", "#00c98b", "#87f4cd"],
    styles: {
      navy: "#081426",
      navy2: "#0d1f3a",
      emerald: "#00b979",
      green: "#00a068",
      mint: "#eafbf5",
      offwhite: "#f8faf9",
      grey: "#536174",
      border: "#dce6e2",
      logoText: "#FFFFFF",
      logoGrad: ["#87f4cd", "#41ad6c", "#19592d"],
    },
  },
  {
    id: "fresh",
    name: "Fresh",
    isDarkHeader: false,
    swatchColors: ["#1e1e1e", "#3858e9", "#0073aa", "#00a0d2"],
    styles: {
      navy: "#1e1e1e",
      navy2: "#2d2d2d",
      emerald: "#0073aa",
      green: "#005a87",
      mint: "#e6f4fa",
      offwhite: "#f8fafc",
      grey: "#55606e",
      border: "#d0dbe5",
      logoText: "#081426",
      logoGrad: ["#00a0d2", "#0073aa", "#3858e9"],
    },
  },
  {
    id: "light",
    name: "Light (WordPress)",
    isDarkHeader: false,
    swatchColors: ["#e5e5e5", "#888888", "#e14d43", "#2ea2cc"],
    styles: {
      navy: "#2c3338",
      navy2: "#3c434a",
      emerald: "#2ea2cc",
      green: "#1d84ad",
      mint: "#f0f6fc",
      offwhite: "#f9fafb",
      grey: "#646970",
      border: "#dcdcde",
      logoText: "#081426",
      logoGrad: ["#2ea2cc", "#e14d43", "#a00000"],
    },
  },
  {
    id: "blue",
    name: "Blue",
    isDarkHeader: true,
    swatchColors: ["#096484", "#4796b3", "#52accc", "#74bfd6"],
    styles: {
      navy: "#096484",
      navy2: "#0c7ba3",
      emerald: "#008cb4",
      green: "#006c8b",
      mint: "#e8f6fa",
      offwhite: "#f4fafd",
      grey: "#507585",
      border: "#cce4ee",
      logoText: "#FFFFFF",
      logoGrad: ["#74bfd6", "#52accc", "#096484"],
    },
  },
  {
    id: "coffee",
    name: "Coffee",
    isDarkHeader: true,
    swatchColors: ["#46403c", "#59524c", "#c7a589", "#9fa47c"],
    styles: {
      navy: "#46403c",
      navy2: "#59524c",
      emerald: "#a67c52",
      green: "#8a633e",
      mint: "#f6f1ec",
      offwhite: "#faf8f5",
      grey: "#6e6661",
      border: "#e3dad1",
      logoText: "#FFFFFF",
      logoGrad: ["#c7a589", "#9fa47c", "#46403c"],
    },
  },
  {
    id: "ectoplasm",
    name: "Ectoplasm",
    isDarkHeader: true,
    swatchColors: ["#413256", "#523f6d", "#a3b745", "#d96b27"],
    styles: {
      navy: "#413256",
      navy2: "#523f6d",
      emerald: "#8ba02a",
      green: "#718320",
      mint: "#f4f6e6",
      offwhite: "#faf9fc",
      grey: "#695b7f",
      border: "#e0d9eb",
      logoText: "#FFFFFF",
      logoGrad: ["#a3b745", "#8ba02a", "#d96b27"],
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    isDarkHeader: true,
    swatchColors: ["#26292c", "#363b3f", "#64a5b9", "#e14d43"],
    styles: {
      navy: "#26292c",
      navy2: "#363b3f",
      emerald: "#498f9c",
      green: "#39737e",
      mint: "#edf6f8",
      offwhite: "#f7f9fa",
      grey: "#61686e",
      border: "#d4dddf",
      logoText: "#FFFFFF",
      logoGrad: ["#e14d43", "#64a5b9", "#26292c"],
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    isDarkHeader: false,
    swatchColors: ["#627c83", "#738e96", "#9ebaa0", "#aa9d88"],
    styles: {
      navy: "#496067",
      navy2: "#627c83",
      emerald: "#588157",
      green: "#3a5a40",
      mint: "#f0f5f1",
      offwhite: "#f7f9f8",
      grey: "#687a80",
      border: "#d3ded6",
      logoText: "#081426",
      logoGrad: ["#9ebaa0", "#7a9c7d", "#aa9d88"],
    },
  },
  {
    id: "sunrise",
    name: "Sunrise",
    isDarkHeader: true,
    swatchColors: ["#b43c38", "#dd3d36", "#e65000", "#d4af37"],
    styles: {
      navy: "#942d2a",
      navy2: "#b43c38",
      emerald: "#dd3d36",
      green: "#b82c26",
      mint: "#fdf2f0",
      offwhite: "#fdf8f7",
      grey: "#7a5553",
      border: "#f0d5d3",
      logoText: "#FFFFFF",
      logoGrad: ["#d4af37", "#e65000", "#dd3d36"],
    },
  },
];

type PanelType = "admin" | "consultant" | "dashboard" | "global";

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorSchemeId: (id: string) => void;
  availableSchemes: ColorScheme[];
  themeStyle: React.CSSProperties;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  panel = "global",
  children,
}: {
  panel?: PanelType;
  children: React.ReactNode;
}) {
  const storageKey = `think10_theme_${panel}`;
  const [schemeId, setSchemeId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(storageKey) || "default";
    }
    return "default";
  });

  const activeScheme =
    COLOR_SCHEMES.find((s) => s.id === schemeId) || COLOR_SCHEMES[0];

  const setColorSchemeId = (id: string) => {
    setSchemeId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, id);
    }
  };

  const themeStyle = {
    "--t10-navy": activeScheme.styles.navy,
    "--t10-navy-2": activeScheme.styles.navy2,
    "--t10-emerald": activeScheme.styles.emerald,
    "--t10-green": activeScheme.styles.green,
    "--t10-mint": activeScheme.styles.mint,
    "--t10-offwhite": activeScheme.styles.offwhite,
    "--t10-grey": activeScheme.styles.grey,
    "--t10-border": activeScheme.styles.border,
    "--logo-text-color": activeScheme.styles.logoText,
    "--logo-grad-start": activeScheme.styles.logoGrad[0],
    "--logo-grad-mid": activeScheme.styles.logoGrad[1],
    "--logo-grad-end": activeScheme.styles.logoGrad[2],
  } as React.CSSProperties;

  return (
    <ThemeContext.Provider
      value={{
        colorScheme: activeScheme,
        setColorSchemeId,
        availableSchemes: COLOR_SCHEMES,
        themeStyle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    const defaultScheme = COLOR_SCHEMES[0];
    return {
      colorScheme: defaultScheme,
      setColorSchemeId: () => {},
      availableSchemes: COLOR_SCHEMES,
      themeStyle: {} as React.CSSProperties,
    };
  }
  return context;
}
