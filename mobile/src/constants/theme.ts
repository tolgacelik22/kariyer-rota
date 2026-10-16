export const C = {
  bg: '#F5F6FA',
  card: '#FFFFFF',
  ink: '#0B1220',
  text: '#1E293B',
  muted: '#64748B',
  faint: '#94A3B8',
  line: '#E2E8F0',
  lineSoft: '#EEF1F6',
  brand: '#1F3A8A',
  brandDeep: '#14286B',
  brandSoft: '#EAF0FF',
  brandBright: '#3B5BDB',
  gold: '#F5A524',
  goldSoft: '#FFF4DE',
  goldInk: '#8A5200',
  green: '#12A150',
  greenSoft: '#E6F7EE',
  red: '#E5484D',
  redSoft: '#FDECEC',
  flame: '#F76B15',
  white: '#FFFFFF',
} as const;

export const GRADIENTS = {
  brand: ['#2A4BB0', '#1F3A8A', '#14286B'] as const,
  night: ['#16213F', '#0B1220'] as const,
  gold: ['#FFC857', '#F5A524'] as const,
};

export const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  black: 'Inter_800ExtraBold',
} as const;

export const R = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const SHADOW = {
  shadowColor: '#0B1220',
  shadowOpacity: 0.06,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
} as const;

export const SHADOW_STRONG = {
  shadowColor: '#14286B',
  shadowOpacity: 0.28,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 12 },
  elevation: 8,
} as const;
