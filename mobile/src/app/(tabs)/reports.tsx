import { useEffect, useState } from 'react';
import { Alert, Animated, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Card, IconBubble, IconName, ProBadge, Pressy, T } from '@/components/ui';
import { C, F, GRADIENTS, R } from '@/constants/theme';
import { api, Report, ReportMeta, ReportType } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useFocusData } from '@/lib/hooks';
import { longDate } from '@/lib/format';

const TYPES: { type: ReportType; title: string; text: string; icon: IconName; weeks: string; pro: boolean }[] = [
  { type: 'review', title: 'Performans & terfi dosyası', text: 'Yöneticine götüreceğin, kanıtlı 6 aylık dosya ve görüşme hazırlığı.', icon: 'ribbon', weeks: 'Son 26 hafta', pro: true },
  { type: 'quarterly', title: 'Çeyrek analizi', text: 'Güçlü yönler, gelişim alanları ve ölçülebilir yeni hedefler.', icon: 'analytics', weeks: 'Son 13 hafta', pro: true },
  { type: 'stories', title: 'Başarı hikâyeleri', text: 'CV maddeleri ve mülakat için STAR formatında hikâyeler.', icon: 'briefcase', weeks: 'Son 52 hafta', pro: true },
  { type: 'monthly', title: 'Aylık özet', text: 'Son 4 haftanın çıktıları ve ölçülebilir katkıları.', icon: 'calendar', weeks: 'Son 4 hafta', pro: false },
];
const LABEL: Record<ReportType, string> = { review: 'Terfi dosyası', quarterly: 'Çeyrek analizi', stories: 'Başarı hikâyeleri', monthly: 'Aylık özet' };

export default function Reports() {
  const { user } = useAuth();
  const { data, refresh, refreshing } = useFocusData<{ reports: ReportMeta[] }>('/api/reports');
  const [generating, setGenerating] = useState<ReportType | null>(null);

  async function generate(t: (typeof TYPES)[number]) {
    if (t.pro && !user?.pro) return router.push({ pathname: '/paywall', params: { from: t.type } });
    setGenerating(t.type);
    try {
      const { report } = await api<{ report: Report }>('/api/reports', { method: 'POST', body: { type: t.type } });
      router.push(`/report/${report.id}`);
    } catch (e: any) {
      if (e.paywall) router.push({ pathname: '/paywall', params: { from: t.type } });
      else if (Platform.OS === 'web') globalThis.alert?.(e.message);
      else Alert.alert('Rapor oluşturulamadı', e.message);
    } finally {
      setGenerating(null);
    }
  }

  const [hero, ...rest] = TYPES;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.brand} />}>
        <View>
          <T v="title">Raporlar</T>
          <T v="small">Kayıtlarından üretilir; rakam ya da proje uydurmaz.</T>
        </View>

        <Pressy onPress={() => generate(hero)} scale={0.985} feedback="medium">
          <LinearGradient colors={GRADIENTS.night} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroOrb} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <IconBubble name="ribbon" color={C.gold} bg="rgba(245,165,36,0.15)" size={48} />
              {!user?.pro && <ProBadge />}
            </View>
            <T v="title" style={{ color: C.white, marginTop: 16 }}>{hero.title}</T>
            <T v="body" style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>{hero.text}</T>
            <View style={styles.heroCta}>
              <Ionicons name="sparkles" size={16} color="#3A2300" />
              <T v="bodyStrong" style={{ color: '#3A2300' }}>Dosyamı hazırla</T>
            </View>
          </LinearGradient>
        </Pressy>

        <View style={{ gap: 12 }}>
          {rest.map((t) => (
            <Pressy key={t.type} onPress={() => generate(t)} scale={0.985}>
              <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                <IconBubble name={t.icon} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <T v="h3">{t.title}</T>
                    {t.pro && !user?.pro && <ProBadge small />}
                  </View>
                  <T v="small" numberOfLines={2}>{t.text}</T>
                  <T v="small" style={{ color: C.faint, marginTop: 2 }}>
                    {t.weeks}{!t.pro && !user?.pro ? ' · temel özet' : ' · AI'}
                  </T>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.faint} />
              </Card>
            </Pressy>
          ))}
        </View>

        <View style={{ gap: 10 }}>
          <T v="label">Oluşturduklarım</T>
          {data?.reports.length === 0 && (
            <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Ionicons name="document-text-outline" size={32} color={C.faint} />
              <T v="small" style={{ marginTop: 8 }}>Henüz rapor yok. Yukarıdan ilkini oluştur.</T>
            </Card>
          )}
          {data?.reports.map((r) => (
            <Pressy key={r.id} onPress={() => router.push(`/report/${r.id}`)} scale={0.99}>
              <View style={styles.row}>
                <Ionicons name="document-text" size={20} color={C.brand} />
                <View style={{ flex: 1 }}>
                  <T v="bodyStrong">{LABEL[r.type]}</T>
                  <T v="small">{longDate(r.createdAt)} · {r.entryCount} hafta</T>
                </View>
                <T v="small" style={{ fontFamily: F.bold, color: r.source === 'ai' ? C.brand : C.faint }}>{r.source === 'ai' ? 'AI' : 'Temel'}</T>
              </View>
            </Pressy>
          ))}
        </View>
      </ScrollView>
      {generating && <Generating type={generating} />}
    </SafeAreaView>
  );
}

const STEPS = ['Haftalık kayıtların okunuyor', 'Etkiler ve kanıtlar eşleştiriliyor', 'Öne çıkan katkılar seçiliyor', 'Dosyan yazılıyor'];

function Generating({ type }: { type: ReportType }) {
  const [i, setI] = useState(0);
  const spin = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, STEPS.length - 1)), 2200);
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1400, useNativeDriver: Platform.OS !== 'web' })).start();
    return () => clearInterval(t);
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={styles.overlay}>
      <Card style={{ alignItems: 'center', gap: 18, padding: 28, width: '100%' }}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <LinearGradient colors={GRADIENTS.brand} style={styles.spinner}>
            <Ionicons name="sparkles" size={28} color={C.white} />
          </LinearGradient>
        </Animated.View>
        <T v="h2">{LABEL[type]} hazırlanıyor</T>
        <View style={{ gap: 10, alignSelf: 'stretch' }}>
          {STEPS.map((s, idx) => (
            <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, opacity: idx <= i ? 1 : 0.35 }}>
              <Ionicons name={idx < i ? 'checkmark-circle' : idx === i ? 'ellipse' : 'ellipse-outline'} size={18} color={idx < i ? C.green : C.brand} />
              <T v="body">{s}</T>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 18, paddingBottom: 40 },
  hero: { borderRadius: R.xl, padding: 22, overflow: 'hidden' },
  heroOrb: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(245,165,36,0.10)', right: -80, top: -80 },
  heroCta: { flexDirection: 'row', gap: 8, alignItems: 'center', alignSelf: 'flex-start', backgroundColor: C.gold, paddingHorizontal: 16, paddingVertical: 11, borderRadius: R.md, marginTop: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, padding: 16, borderRadius: R.md },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,18,32,0.55)', justifyContent: 'center', padding: 24 },
  spinner: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
