import { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
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
  hero: { fontFamily: F.black, fontSize: 32, lineHeight: 38, letterSpacing: -0.8, color: C.ink },
  title: { fontFamily: F.black, fontSize: 24, lineHeight: 30, letterSpacing: -0.5, color: C.ink },
  h2: { fontFamily: F.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.2, color: C.ink },
  h3: { fontFamily: F.semibold, fontSize: 16, lineHeight: 22, color: C.ink },
  body: { fontFamily: F.regular, fontSize: 15, lineHeight: 22, color: C.text },
  bodyStrong: { fontFamily: F.semibold, fontSize: 15, lineHeight: 22, color: C.text },
  small: { fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: C.muted },
  label: { fontFamily: F.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.1, color: C.faint },
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
      : variant === 'gold' ? '#3A2300'
        : variant === 'danger' ? C.red
          : variant === 'light' ? C.brand
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
          style={[{ borderRadius: R.lg }, variant === 'primary' && !off && SHADOW_STRONG]}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            { borderRadius: R.lg },
            variant === 'secondary' && { backgroundColor: C.brandSoft },
            variant === 'light' && { backgroundColor: C.white },
            variant === 'danger' && { backgroundColor: C.redSoft },
          ]}>
          {content}
        </View>
      )}
    </Pressy>
  );
}

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  return <View style={[styles.card, padded && { padding: 18 }, style]}>{children}</View>;
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
    <View style={[styles.chip, { backgroundColor: active ? C.brand : bg }]}>
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
      <Ionicons name="star" size={small ? 9 : 11} color="#3A2300" />
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
  card: { backgroundColor: C.card, borderRadius: R.lg, ...SHADOW },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: R.pill },
  chipText: { fontFamily: F.semibold, fontSize: 12.5 },
  pro: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill },
  proText: { fontFamily: F.black, fontSize: 10.5, color: '#3A2300', letterSpacing: 0.6 },
});
