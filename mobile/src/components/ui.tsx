import { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Animated,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';

import { C, F, GRADIENTS, R, SHADOW, SHADOW_STRONG } from '@/constants/theme';

export type IconName = keyof typeof Ionicons.glyphMap;

export function haptic(kind: 'light' | 'medium' | 'success' | 'warning' | 'select' = 'light') {
  if (Platform.OS === 'web') return;
  if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else if (kind === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  else if (kind === 'select') Haptics.selectionAsync();
  else Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
}

const VARIANTS = {
  hero: { fontFamily: F.black, fontSize: 34, lineHeight: 40, letterSpacing: -1.4, color: C.ink },
  number: { fontFamily: F.black, fontSize: 40, lineHeight: 44, letterSpacing: -1.6, color: C.ink },
  title: { fontFamily: F.black, fontSize: 26, lineHeight: 32, letterSpacing: -0.9, color: C.ink },
  h2: { fontFamily: F.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.4, color: C.ink },
  h3: { fontFamily: F.bold, fontSize: 16, lineHeight: 22, letterSpacing: -0.2, color: C.ink },
  body: { fontFamily: F.regular, fontSize: 15, lineHeight: 22, color: C.text },
  bodyStrong: { fontFamily: F.semibold, fontSize: 15, lineHeight: 22, color: C.text },
  small: { fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: C.muted },
  label: { fontFamily: F.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.4, color: C.faint },
} satisfies Record<string, TextStyle>;

// CSS/RN `textTransform: uppercase` is locale-blind (i → I); labels are uppercased with Turkish rules (i → İ).
const upperTr = (node: React.ReactNode): React.ReactNode =>
  typeof node === 'string' ? node.toLocaleUpperCase('tr-TR') : Array.isArray(node) ? node.map(upperTr) : node;

export function T({ v = 'body', style, children, ...props }: TextProps & { v?: keyof typeof VARIANTS }) {
  return (
    <Text {...props} style={[VARIANTS[v], style]}>
      {v === 'label' ? upperTr(children) : children}
    </Text>
  );
}

// Press feedback: subtle scale + haptic.
export function Pressy({
  onPress,
  children,
  style,
  disabled,
  scale = 0.97,
  feedback = 'light',
  hitSlop,
}: {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  scale?: number;
  feedback?: Parameters<typeof haptic>[0] | null;
  hitSlop?: number;
}) {
  const s = useState(() => new Animated.Value(1))[0];
  const to = (v: number) => Animated.spring(s, { toValue: v, useNativeDriver: Platform.OS !== 'web', speed: 40, bounciness: 6 }).start();
  // Layout props must sit on the outer Pressable, or it shrink-wraps and the inner view can't stretch.
  const { flex, alignSelf, width, margin, marginTop, marginBottom, marginLeft, marginRight, marginHorizontal, marginVertical, ...inner } =
    (StyleSheet.flatten(style as any) || {}) as ViewStyle;
  const outer = { flex, alignSelf, width, margin, marginTop, marginBottom, marginLeft, marginRight, marginHorizontal, marginVertical };
  return (
    <Pressable
      disabled={disabled}
      hitSlop={hitSlop}
      style={outer}
      onPressIn={() => to(scale)}
      onPressOut={() => to(1)}
      onPress={() => {
        if (feedback) haptic(feedback);
        onPress?.();
      }}>
      <Animated.View style={[inner as any, flex != null && { flexGrow: 1 }, { transform: [{ scale: s }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
  size = 'lg',
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'gold' | 'secondary' | 'ghost' | 'danger' | 'light';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'lg' | 'md';
}) {
  const off = disabled || loading;
  const height = size === 'lg' ? 56 : 44;
  const fg =
    variant === 'primary' ? C.white
      : variant === 'gold' ? C.onAccent
        : variant === 'danger' ? C.red
          : variant === 'light' ? C.ink
            : C.brand;
  const content = (
    <View style={[styles.btnInner, { height }]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={size === 'lg' ? 20 : 17} color={fg} />}
          <Text style={[styles.btnText, { color: fg, fontSize: size === 'lg' ? 16 : 14 }]}>{title}</Text>
        </>
      )}
    </View>
  );
  const shell: StyleProp<ViewStyle> = [styles.btn, off && { opacity: 0.5 }, style];
  return (
    <Pressy onPress={onPress} disabled={off} style={shell} feedback={variant === 'primary' || variant === 'gold' ? 'medium' : 'light'}>
      {variant === 'primary' || variant === 'gold' ? (
        <LinearGradient
          colors={variant === 'gold' ? GRADIENTS.gold : GRADIENTS.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[{ borderRadius: R.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' }, !off && SHADOW_STRONG, variant === 'gold' && { shadowColor: '#FF8FC2' }]}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            { borderRadius: R.lg },
            variant === 'secondary' && { backgroundColor: C.brandSoft, borderWidth: 1, borderColor: 'rgba(149,131,255,0.22)' },
            variant === 'light' && { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
            variant === 'danger' && { backgroundColor: C.redSoft },
          ]}>
          {content}
        </View>
      )}
    </Pressy>
  );
}

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  return <GlowCard style={style} padded={padded}>{children}</GlowCard>;
}

export function Chip({
  label,
  active,
  onPress,
  icon,
  tone = 'brand',
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IconName;
  tone?: 'brand' | 'gold' | 'green' | 'neutral';
}) {
  const tones = {
    brand: [C.brandSoft, C.brand],
    gold: [C.goldSoft, C.goldInk],
    green: [C.greenSoft, C.green],
    neutral: [C.lineSoft, C.muted],
  } as const;
  const [bg, fg] = tones[tone];
  const body = (
    <View style={[styles.chip, { backgroundColor: active ? C.brand : bg, borderColor: active ? 'rgba(255,255,255,0.2)' : C.lineSoft }]}>
      {icon && <Ionicons name={icon} size={13} color={active ? C.white : fg} />}
      <Text style={[styles.chipText, { color: active ? C.white : fg }]}>{label}</Text>
    </View>
  );
  return onPress ? (
    <Pressy onPress={onPress} feedback="select">
      {body}
    </Pressy>
  ) : (
    body
  );
}

export function ProBadge({ small }: { small?: boolean }) {
  return (
    <LinearGradient colors={GRADIENTS.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.pro, small && { paddingHorizontal: 6, paddingVertical: 2 }]}>
      <Ionicons name="sparkles" size={small ? 9 : 11} color={C.onAccent} />
      <Text style={[styles.proText, small && { fontSize: 9 }]}>PRO</Text>
    </LinearGradient>
  );
}

export function IconBubble({ name, color = C.brand, bg = C.brandSoft, size = 40 }: { name: IconName; color?: string; bg?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2.6, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={name} size={size * 0.5} color={color} />
    </View>
  );
}

export function ProgressBar({ value, color = C.brand, track = C.lineSoft, height = 6 }: { value: number; color?: string; track?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: C.line }, style]} />;
}

const styles = StyleSheet.create({
  btn: { borderRadius: R.lg },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
  btnText: { fontFamily: F.bold, letterSpacing: -0.1 },
  card: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.line },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: R.pill, borderWidth: 1 },
  chipText: { fontFamily: F.semibold, fontSize: 12.5 },
  pro: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill },
  proText: { fontFamily: F.black, fontSize: 10.5, color: C.onAccent, letterSpacing: 0.8 },
});

// Soft light leaks behind a screen. Pre-rendered radial PNGs: cheap, no blur pass.
const GLOWS = {
  violet: require('@/assets/images/glow-violet.png'),
  cyan: require('@/assets/images/glow-cyan.png'),
  pink: require('@/assets/images/glow-pink.png'),
};
export function Ambient({ variant = 'default' }: { variant?: 'default' | 'warm' | 'calm' }) {
  const set =
    variant === 'warm'
      ? [['violet', -160, -120, 520], ['pink', 180, 420, 460]]
      : variant === 'calm'
        ? [['cyan', -200, -140, 480], ['violet', 160, 520, 420]]
        : [['violet', -180, -160, 560], ['cyan', 200, 360, 420]];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {set.map(([k, x, y, size]) => (
        <Image key={k as string} source={GLOWS[k as keyof typeof GLOWS]} style={{ position: 'absolute', left: x as number, top: y as number, width: size as number, height: size as number, opacity: 0.9 }} />
      ))}
    </View>
  );
}

// Circular progress (0..1) with gradient stroke.
export function Ring({ value, size = 92, stroke = 9, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={GRADIENTS.lime[0]} />
            <Stop offset="1" stopColor={C.cyan} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c * v} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

// Raised surface with a faint top highlight — the base for most cards.
export function GlowCard({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  return (
    <LinearGradient colors={GRADIENTS.card} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[styles.card, padded && { padding: 18 }, style]}>
      {children}
    </LinearGradient>
  );
}
