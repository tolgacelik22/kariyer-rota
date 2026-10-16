import { Platform, StyleSheet, View } from 'react-native';
import { router, Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressy } from '@/components/ui';
import { C, F, GRADIENTS, SHADOW_STRONG } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, active, color, focused }: { name: IconName; active: IconName; color: any; focused: boolean }) {
  return <Ionicons name={focused ? active : name} size={23} color={color} />;
}

const icon = (name: IconName, active: IconName) =>
  function Icon({ color, focused }: { color: any; focused: boolean }) {
    return <TabIcon name={name} active={active} color={color} focused={focused} />;
  };

export default function TabsLayout() {
  // Explicit insets: with Android edge-to-edge the default bar sat under the gesture/nav bar.
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, Platform.OS === 'web' ? 8 : 10);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.brand,
        tabBarInactiveTintColor: C.faint,
        tabBarLabelStyle: { fontFamily: F.semibold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: C.white,
          borderTopColor: C.lineSoft,
          height: 60 + bottom,
          paddingTop: 6,
          paddingBottom: bottom,
        },
        sceneStyle: { backgroundColor: C.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Bugün', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="archive" options={{ title: 'Arşiv', tabBarIcon: icon('albums-outline', 'albums') }} />
      <Tabs.Screen
        name="new"
        options={{
          title: '',
          tabBarButton: () => (
            <View style={styles.fabSlot}>
              <Pressy onPress={() => router.push('/entry')} feedback="medium" style={styles.fabShadow}>
                <LinearGradient colors={GRADIENTS.brand} style={styles.fab}>
                  <Ionicons name="add" size={30} color={C.white} />
                </LinearGradient>
              </Pressy>
            </View>
          ),
        }}
      />
      <Tabs.Screen name="reports" options={{ title: 'Raporlar', tabBarIcon: icon('document-text-outline', 'document-text') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: icon('person-circle-outline', 'person-circle') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabSlot: { flex: 1, alignItems: 'center' },
  fabShadow: { marginTop: -18, borderRadius: 22, ...SHADOW_STRONG },
  fab: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: C.white },
});
