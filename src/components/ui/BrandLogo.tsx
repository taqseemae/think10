import React from "react";

interface BrandLogoProps {
  className?: string;
  altText?: string;
  forceWhite?: boolean;
}

export function BrandLogo({
  className = "h-8 w-auto",
  altText = "Think10",
  forceWhite = false,
}: BrandLogoProps) {
  // Uses 100% exact original SVG logo file without modifying any paths
  // If forceWhite is true (dark hero banner or dark footer), apply CSS invert for crisp white logo.
  return (
    <img
      src="/logo/t10-brand-logo.svg"
      alt={altText}
      className={`${className} object-contain ${forceWhite ? "brightness-0 invert" : ""}`}
    />
  );
}
