/** Public package version. Keep this value aligned with package.json. */
export const OPENDLE_UI_VERSION = "0.1.0" as const;

/** Shared token names. Values are defined in styles/tokens.css. */
export const designTokens = {
  color: {
    background: "--od-color-background",
    foreground: "--od-color-foreground",
    muted: "--od-color-muted",
    accent: "--od-color-accent",
    border: "--od-color-border",
  },
  radius: {
    sm: "--od-radius-sm",
    md: "--od-radius-md",
    lg: "--od-radius-lg",
  },
  space: {
    xs: "--od-space-xs",
    sm: "--od-space-sm",
    md: "--od-space-md",
    lg: "--od-space-lg",
    xl: "--od-space-xl",
  },
} as const;
