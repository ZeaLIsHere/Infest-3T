/**
 * Palet warna, spacing, dan radius global.
 * Dark mode default untuk hemat daya (PRD §9).
 */
export const colors = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceVariant: '#21262D',
  border: '#30363D',
  primary: '#58A6FF',
  textPrimary: '#E6EDF3',
  textSecondary: '#8B949E',
  textOnPrimary: '#FFFFFF',
  success: '#3FB950',
  warning: '#D29922',
  error: '#F85149',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
} as const;
