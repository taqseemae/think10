import React from "react";
import { useTheme, COLOR_SCHEMES } from "@/context/ThemeContext";

interface ColorSchemePickerProps {
  title?: string;
  subtitle?: string;
}

export function ColorSchemePicker({
  title = "Admin Color Scheme",
  subtitle = "Customize the primary workspace theme and brand colors.",
}: ColorSchemePickerProps) {
  const { colorScheme, setColorSchemeId } = useTheme();

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-neutral-900 font-display">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
        {COLOR_SCHEMES.map((scheme) => {
          const isSelected = colorScheme.id === scheme.id;
          return (
            <div
              key={scheme.id}
              onClick={() => setColorSchemeId(scheme.id)}
              className={`group relative flex flex-col p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                isSelected
                  ? "border-[color:var(--t10-navy)] bg-neutral-50 shadow-md ring-2 ring-[color:var(--t10-navy)]/10"
                  : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
              }`}
            >
              {/* Radio Header */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <input
                  type="radio"
                  id={`scheme-${scheme.id}`}
                  name="color-scheme"
                  checked={isSelected}
                  onChange={() => setColorSchemeId(scheme.id)}
                  className="h-4 w-4 accent-[color:var(--t10-navy)] cursor-pointer"
                />
                <label
                  htmlFor={`scheme-${scheme.id}`}
                  className="text-xs font-bold text-neutral-800 cursor-pointer group-hover:text-neutral-900"
                >
                  {scheme.name.split(" ")[0]}
                </label>
              </div>

              {/* 4-Color Swatch Strip (matching WordPress screenshot layout) */}
              <div className="flex h-7 w-full overflow-hidden rounded-md border border-black/10 shadow-inner">
                {scheme.swatchColors.map((color, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-full"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
