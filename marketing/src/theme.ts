import { loadFont } from '@remotion/google-fonts/Inter';

export const { fontFamily: INTER } = loadFont('normal', {
  weights: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'latin-ext'],
});

export const C = {
  bg: '#F5F6FA',
  ink: '#0B1220',
  text: '#1E293B',
  muted: '#64748B',
  brand: '#1F3A8A',
  brandBright: '#3B5BDB',
  brandSoft: '#EAF0FF',
  gold: '#F5A524',
  goldLight: '#FFC857',
  white: '#FFFFFF',
  night: '#0B1220',
};

export const GRAD = {
  brand: 'linear-gradient(150deg, #2A4BB0 0%, #1F3A8A 50%, #14286B 100%)',
  night: 'linear-gradient(160deg, #16213F 0%, #0B1220 100%)',
  light: 'linear-gradient(180deg, #F8F9FC 0%, #E9EEFB 100%)',
  gold: 'linear-gradient(135deg, #FFC857 0%, #F5A524 100%)',
};

export const FPS = 30;
