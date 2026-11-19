import { Platform } from "react-native"

/*
 * Design tokens taken from the EMI web app (src/style.css :root) so the two
 * apps read as one product: indigo for navigation and stage moves, green for
 * "save / received" actions, hairline borders, no shadows at rest.
 */
export type ColorScheme = "light" | "dark"
/** What the user picked in Profile → Appearance. "system" follows the phone. */
export type ThemePreference = "system" | ColorScheme

const lightPalette = {
  ground: "#f6f8fb",
  surface: "#ffffff",
  raised: "#f1f3f8",
  ink: "#111827",
  ink2: "#374151",
  muted: "#5b6472",
  faint: "#9ca3af",
  border: "#e4e7ef",
  rule: "#eff0f6",
  control: "#d5d9e3",
  brand: "#4f46e5",
  brandDark: "#4338ca",
  brandSoft: "#eef2ff",
  brandInk: "#3730a3",
  green: "#059669",
  greenSoft: "#ecfdf5",
  greenInk: "#065f46",
  red: "#dc2626",
  redSoft: "#fef2f2",
  redInk: "#991b1b",
  /** Border of the destructive button. */
  redLine: "#f3c4c4",
  orange: "#ea580c",
  orangeSoft: "#fff7ed",
  orangeInk: "#9a3412",
  purple: "#7c3aed",
  purpleSoft: "#f5f3ff",
  purpleInk: "#5b21b6",
  /** Filled selected chip and the toast: the opposite of the page. */
  inverse: "#111827",
  onInverse: "#ffffff",
  /** The scanner is dark in both modes. */
  dark: "#0f1115",
  darkSurface: "#1a1d24",
}

export type Palette = typeof lightPalette

/** Same roles, tuned for a dark page. Filled buttons keep white text readable. */
const darkPalette: Palette = {
  ground: "#0b0d12",
  surface: "#151820",
  raised: "#1d212b",
  ink: "#e6e9ef",
  ink2: "#c3c8d2",
  muted: "#98a1b0",
  faint: "#6b7382",
  border: "#262b36",
  rule: "#1f232c",
  control: "#343a48",
  brand: "#6366f1",
  brandDark: "#4f46e5",
  brandSoft: "#1f1d4a",
  brandInk: "#c7d2fe",
  green: "#059669",
  greenSoft: "#0b2a20",
  greenInk: "#6ee7b7",
  red: "#ef4444",
  redSoft: "#331416",
  redInk: "#fca5a5",
  redLine: "#5c2326",
  orange: "#f97316",
  orangeSoft: "#33200f",
  orangeInk: "#fdba74",
  purple: "#a78bfa",
  purpleSoft: "#251a45",
  purpleInk: "#c4b5fd",
  inverse: "#e6e9ef",
  onInverse: "#111827",
  dark: "#0f1115",
  darkSurface: "#1a1d24",
}

/**
 * The live palette. Screens read `color.x` while rendering, so swapping the
 * values here and re-rendering is enough to change mode (see app/theme).
 */
export const color: Palette = { ...lightPalette }

let activeScheme: ColorScheme = "light"
let themeVersion = 0

export function applyColorScheme(scheme: ColorScheme) {
  if (scheme === activeScheme) return
  activeScheme = scheme
  Object.assign(color, scheme === "dark" ? darkPalette : lightPalette)
  themeVersion++
}

export const currentColorScheme = () => activeScheme

/**
 * For style objects built once at module level (StyleSheet.create, variant
 * maps): rebuilt from the live palette the first time they are read after a
 * mode change. Reads look the same as a plain object: `styles.card`.
 */
export function themed<T extends object>(build: () => T): T {
  let cache = build()
  let version = themeVersion
  return new Proxy({} as T, {
    get(_, key) {
      if (version !== themeVersion) {
        cache = build()
        version = themeVersion
      }
      return cache[key as keyof T]
    },
  })
}

export const radius = { control: 7, card: 11, sheet: 14 } as const

/** Sizes in points; nothing below 12. */
export const font = {
  title: 24,
  heading: 18,
  body: 15,
  small: 14,
  meta: 13,
  tiny: 12,
  figure: 28,
} as const

export const tabular = { fontVariant: ["tabular-nums" as const] }

/** SKUs and codes only. iOS has no generic "monospace" family. */
export const mono = Platform.select({ ios: "Menlo", default: "monospace" })
