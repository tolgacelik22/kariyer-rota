// Promotly design tokens — dark, layered, one electric accent.
// Token names are semantic: `card` = raised surface, `ink` = strongest text, `brand` = accent.
export const C = {
  bg: '#07080D',
  card: '#11131B',
  card2: '#181B25',
  ink: '#F5F6FB',
  text: '#D6DAE6',
  muted: '#8D93A8',
  faint: '#5B6177',
  line: 'rgba(255,255,255,0.09)',
  lineSoft: 'rgba(255,255,255,0.055)',
  brand: '#9583FF',
  brandDeep: '#5B45F0',
  brandSoft: 'rgba(149,131,255,0.14)',
  brandBright: '#B3A6FF',
  cyan: '#4FD8FF',
  lime: '#C6F45C',
  limeSoft: 'rgba(198,244,92,0.12)',
  gold: '#FFB75E',
  goldSoft: 'rgba(255,183,94,0.10)',
  goldInk: '#FFCB8A',
  green: '#3DDC97',
  greenSoft: 'rgba(61,220,151,0.12)',
  red: '#FF5C7A',
  redSoft: 'rgba(255,92,122,0.12)',
  flame: '#FF7A45',
  white: '#FFFFFF',
  onAccent: '#140C2E', // text on holo / lime fills
} as const;

export const GRADIENTS = {
  brand: ['#A28BFF', '#6C4DFF', '#4C5BFF'] as const,
  night: ['#1B1534', '#0B0A15'] as const,
  // Pro: holographic
  gold: ['#FFD08A', '#FF8FC2', '#A28BFF'] as const,
  card: ['#1A1D2A', '#11131B'] as const,
  lime: ['#DBFF7A', '#9EE84A'] as const,
};

export const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  black: 'PlusJakartaSans_800ExtraBold',
} as const;

export const R = { sm: 12, md: 16, lg: 22, xl: 30, pill: 999 } as const;
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// On dark, depth comes from borders and glow rather than drop shadows.
export const SHADOW = {
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
} as const;

export const SHADOW_STRONG = {
  shadowColor: '#6C4DFF',
  shadowOpacity: 0.55,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 10 },
  elevation: 12,
} as const;

export const TAB_BAR_SPACE = 118; // bottom padding so content clears the floating tab bar
