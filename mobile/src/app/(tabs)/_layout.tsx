import { Platform, StyleSheet, View } from 'react-native';
import { router, Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/build/layouts/Tabs';

import { haptic, Pressy, T } from '@/components/ui';
import { C, F, GRADIENTS, SHADOW_STRONG } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const ITEMS: Record<string, { label: string; icon: IconName; active: IconName }> = {
  index: { label: 'Bugün', icon: 'home-outline', active: 'home' },
  archive: { label: 'Arşiv', icon: 'layers-outline', active: 'layers' },
  reports: { label: 'Raporlar', icon: 'sparkles-outline', active: 'sparkles' },
  profile: { label: 'Profil', icon: 'person-outline', active: 'person' },
};

// Floating glass pill with a raised “+” in the middle.
function FloatingBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((r) => r.name !== 'new');
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  const Item = ({ name, index }: { name: string; index: number }) => {
    const def = ITEMS[name];
    const focused = state.index === index;
    return (
      <Pressy
        feedback="select"
        style={styles.item}
        onPress={() => {
          if (!focused) navigateToTab(state.routes[index].key);
        }}>
        <View style={[styles.iconWrap, focused && styles.iconWrapOn]}>
          <Ionicons name={focused ? def.active : def.icon} size={21} color={focused ? C.ink : C.faint} />
        </View>
        <T style={[styles.label, { color: focused ? C.ink : C.faint }]}>{def.label}</T>
      </Pressy>
    );
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 10) + 6 }]}>
      <View style={styles.pill}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} {...(Platform.OS === 'android' ? { experimentalBlurMethod: 'dimezisBlurView' as const } : {})} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(17,19,27,0.78)' }]} />
        {left.map((r) => (
          <Item key={r.key} name={r.name} index={state.routes.indexOf(r)} />
        ))}
        <View style={styles.fabSlot}>
          <Pressy
            feedback={null}
            onPress={() => {
              haptic('medium');
              router.push('/entry');
            }}
            style={styles.fabShadow}>
            <LinearGradient colors={GRADIENTS.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fab}>
              <Ionicons name="add" size={30} color={C.white} />
            </LinearGradient>
          </Pressy>
        </View>
        {right.map((r) => (
          <Item key={r.key} name={r.name} index={state.routes.indexOf(r)} />
        ))}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg } }} tabBar={(p) => <FloatingBar {...p} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="archive" />
      <Tabs.Screen name="new" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 440,
    height: 72,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 6,
  },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  iconWrap: { width: 44, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconWrapOn: { backgroundColor: 'rgba(149,131,255,0.22)' },
  label: { fontFamily: F.semibold, fontSize: 10.5, lineHeight: 13 },
  fabSlot: { width: 72, alignItems: 'center' },
  fabShadow: { borderRadius: 22, ...SHADOW_STRONG },
  fab: { width: 54, height: 54, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
});
