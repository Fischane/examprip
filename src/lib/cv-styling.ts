export interface ColorScheme {
  accent: string
  background: string
  sidebar: string
  text: string
  subtext: string
}

export interface FontOption {
  label: string
  value: string
  css: string
}

export const COLOR_SCHEMES: Record<string, ColorScheme> = {
  default:  { accent: '#f5a623', background: '#ffffff', sidebar: '#2d2d2d', text: '#111111', subtext: '#666666' },
  blue:     { accent: '#2563eb', background: '#ffffff', sidebar: '#1e3a5f', text: '#111111', subtext: '#555555' },
  green:    { accent: '#16a34a', background: '#ffffff', sidebar: '#14532d', text: '#111111', subtext: '#555555' },
  purple:   { accent: '#7c3aed', background: '#ffffff', sidebar: '#3b0764', text: '#111111', subtext: '#555555' },
  minimal:  { accent: '#374151', background: '#ffffff', sidebar: '#111827', text: '#111111', subtext: '#6b7280' },
}

export const FONT_OPTIONS: FontOption[] = [
  { label: 'Inter',     value: 'inter',     css: 'Inter, sans-serif' },
  { label: 'Georgia',   value: 'georgia',   css: 'Georgia, serif' },
  { label: 'Arial',     value: 'arial',     css: 'Arial, sans-serif' },
  { label: 'Montserrat',value: 'montserrat',css: 'Montserrat, sans-serif' },
]

const DEFAULT_SCHEME = COLOR_SCHEMES.default
const DEFAULT_FONT = FONT_OPTIONS[0]

export function resolveColorScheme(key: string): ColorScheme {
  return COLOR_SCHEMES[key] ?? DEFAULT_SCHEME
}

export function resolveFont(key: string): FontOption {
  return FONT_OPTIONS.find(f => f.value === key) ?? DEFAULT_FONT
}
