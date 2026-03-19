export const Theme = {
  background: '#000000',
  card: '#1C1C1E',
  elevated: '#2C2C2E',
  accent: '#FFD60A',
  text: '#FFFFFF',
  secondaryText: 'rgba(235,235,245,0.8)',
  muted: '#8E8E93',
  divider: '#38383A',
  success: '#30D158',
  danger: '#FF453A',
  blue: '#0A84FF',
} as const;

export type ThemeColors = typeof Theme;
