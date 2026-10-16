import { useRef, useState } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button, Chip, IconBubble, Pressy, T } from '@/components/ui';
import { C, F, GRADIENTS, R, SHADOW } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

const SLIDES = [
  {
    kicker: 'Sorun',
    title: 'Terfi görüşmesinde\nboş kalma.',
    text: '“Son 6 ayda neler yaptın?” sorusu geldiğinde çoğumuz sadece son iki haftayı hatırlarız.',
    art: 'question',
  },
  {
    kicker: 'Alışkanlık',
    title: 'Her cuma\nsadece 5 dakika.',
    text: 'Ne yaptın, etkisi ne oldu, kanıtı nerede? Rehberli üç adımda haftanı arşivle.',
    art: 'entry',
  },
  {
    kicker: 'Sonuç',
    title: 'Dosyan kendiliğinden\nhazırlansın.',
    text: 'Aylık özet, çeyrek analizi, 6 aylık terfi dosyası ve CV için başarı hikâyeleri. Kanıtlarıyla.',
    art: 'report',
  },
  {
    kicker: 'Güven',
    title: 'Veri senin.\nKontrol sende.',
    text: 'Şirket sistemlerine bağlanmayız. Arşivini istediğin an indir ya da tek dokunuşla sil.',
    art: 'privacy',
  },
] as const;

export default function Onboarding() {
  const { setOnboarded, user } = useAuth();
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const scrollX = useState(() => new Animated.Value(0))[0];
  const ref = useRef<any>(null);
  const last = page === SLIDES.length - 1;

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width) setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const finish = async () => {
    await setOnboarded();
    router.replace(user ? '/(tabs)' : '/login');
  };

  const next = () => {
    if (last) return finish();
    ref.current?.scrollTo({ x: width * (page + 1), animated: true });
    setPage(page + 1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={styles.top}>
        <View style={styles.brandRow}>
          <LinearGradient colors={GRADIENTS.brand} style={styles.logo}>
            <Ionicons name="trending-up" size={16} color={C.white} />
          </LinearGradient>
          <T v="h3" style={{ fontFamily: F.black }}>Promotly</T>
        </View>
        {!last && (
          <Pressy onPress={finish} feedback={null} hitSlop={12}>
            <T v="bodyStrong" style={{ color: C.muted }}>Atla</T>
          </Pressy>
        )}
      </View>

      {width > 0 && (
        <Animated.ScrollView
          ref={ref}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onEnd}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          style={{ flex: 1 }}>
          {SLIDES.map((s, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' });
            const translateY = scrollX.interpolate({ inputRange, outputRange: [30, 0, 30], extrapolate: 'clamp' });
            return (
              <View key={s.kicker} style={{ width, paddingHorizontal: 24 }}>
                <Animated.View style={[styles.artWrap, { opacity, transform: [{ translateY }] }]}>
                  <Art kind={s.art} />
                </Animated.View>
                <T v="label" style={{ color: C.gold, marginBottom: 8 }}>{s.kicker}</T>
                <T v="hero">{s.title}</T>
                <T v="body" style={{ color: C.muted, marginTop: 12, fontSize: 16, lineHeight: 24 }}>{s.text}</T>
              </View>
            );
          })}
        </Animated.ScrollView>
      )}

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const w = width
              ? scrollX.interpolate({ inputRange: [(i - 1) * width, i * width, (i + 1) * width], outputRange: [8, 24, 8], extrapolate: 'clamp' })
              : 8;
            const bg = width
              ? scrollX.interpolate({ inputRange: [(i - 1) * width, i * width, (i + 1) * width], outputRange: [C.line, C.brand, C.line], extrapolate: 'clamp' })
              : C.line;
            return <Animated.View key={i} style={[styles.dot, { width: w, backgroundColor: bg }]} />;
          })}
        </View>
        <Button title={last ? 'Başlayalım' : 'Devam'} icon={last ? 'arrow-forward' : undefined} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

function Art({ kind }: { kind: (typeof SLIDES)[number]['art'] }) {
  if (kind === 'question')
    return (
      <View style={{ gap: 12 }}>
        <View style={[styles.bubble, styles.bubbleLeft]}>
          <T v="small" style={{ color: C.faint, marginBottom: 4 }}>Yönetici · Performans görüşmesi</T>
          <T v="bodyStrong">Son 6 ayda en önemli katkıların neydi?</T>
        </View>
        <View style={[styles.bubble, styles.bubbleRight]}>
          <T v="bodyStrong" style={{ color: C.white }}>Şey… geçen ay bir proje vardı… 🤔</T>
        </View>
        <View style={styles.monthRow}>
          {['May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki'].map((m, i) => (
            <View key={m} style={[styles.month, i < 4 && { opacity: 0.35 }]}>
              <T v="label" style={{ color: i < 4 ? C.faint : C.brand }}>{m}</T>
              <Ionicons name={i < 4 ? 'help' : 'checkmark'} size={16} color={i < 4 ? C.faint : C.brand} />
            </View>
          ))}
        </View>
      </View>
    );
  if (kind === 'entry')
    return (
      <View style={[styles.mock, SHADOW]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T v="label">Cuma kaydı</T>
          <Chip label="5 dk" icon="time-outline" tone="gold" />
        </View>
        {[
          ['checkmark-done', 'Ne yaptın?', 'Ödeme retry mekanizmasını canlıya aldım'],
          ['trending-up', 'Etkisi?', 'Hatalı ödeme %4,1 → %1,3'],
          ['link', 'Kanıt', 'jira/PAY-482 · github/pull/913'],
        ].map(([icon, label, value]) => (
          <View key={label} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 14 }}>
            <IconBubble name={icon as any} size={34} />
            <View style={{ flex: 1 }}>
              <T v="small">{label}</T>
              <T v="bodyStrong" numberOfLines={1}>{value}</T>
            </View>
          </View>
        ))}
      </View>
    );
  if (kind === 'report')
    return (
      <View style={[styles.mock, SHADOW, { paddingBottom: 22 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <IconBubble name="ribbon" color={C.goldInk} bg={C.goldSoft} />
          <View>
            <T v="h3">Performans & terfi dosyası</T>
            <T v="small">26 hafta · 14 kanıt</T>
          </View>
        </View>
        {['Yönetici özeti', 'En önemli 5 katkı', 'Terfi gerekçesi'].map((h, i) => (
          <View key={h} style={{ marginTop: 14 }}>
            <T v="bodyStrong" style={{ color: C.brand }}>{h}</T>
            <View style={[styles.line, { width: `${92 - i * 14}%` }]} />
            <View style={[styles.line, { width: `${70 - i * 8}%` }]} />
          </View>
        ))}
      </View>
    );
  return (
    <View style={{ alignItems: 'center', gap: 18 }}>
      <LinearGradient colors={GRADIENTS.brand} style={styles.shield}>
        <Ionicons name="shield-checkmark" size={56} color={C.white} />
      </LinearGradient>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        <Chip label="Şirket sistemine bağlanmaz" icon="lock-closed" />
        <Chip label="İndir" icon="download-outline" tone="green" />
        <Chip label="Tek dokunuşla sil" icon="trash-outline" tone="neutral" />
        <Chip label="KVKK uyumlu" icon="checkmark-circle" tone="gold" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, height: 48 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  artWrap: { minHeight: 300, justifyContent: 'center', marginBottom: 28, marginTop: 8 },
  footer: { paddingHorizontal: 24, paddingBottom: 16, gap: 20 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { height: 8, borderRadius: 4 },
  bubble: { padding: 16, borderRadius: R.lg, maxWidth: '88%' },
  bubbleLeft: { backgroundColor: C.white, alignSelf: 'flex-start', borderBottomLeftRadius: 6, ...SHADOW },
  bubbleRight: { backgroundColor: C.brand, alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  month: { alignItems: 'center', gap: 6, backgroundColor: C.white, borderRadius: R.md, paddingVertical: 10, width: '15%' },
  mock: { backgroundColor: C.white, borderRadius: R.xl, padding: 20 },
  line: { height: 8, borderRadius: 4, backgroundColor: C.lineSoft, marginTop: 8 },
  shield: { width: 120, height: 120, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
});
