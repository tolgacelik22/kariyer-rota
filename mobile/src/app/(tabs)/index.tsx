import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Ambient, Button, Card, IconBubble, ProBadge, Pressy, Ring, T } from '@/components/ui';
import Markdown from '@/components/Markdown';
import { C, F, GRADIENTS, R, SHADOW_STRONG, TAB_BAR_SPACE } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useEntries } from '@/lib/hooks';
import { daysToFriday, greeting, weekRange } from '@/lib/format';

const TIPS = [
  { icon: 'stats-chart', title: 'Rakam ekle', text: '“Hızlandırdım” yerine “p95 süresini 1,8 sn → 420 ms’ye indirdim”. Yöneticiler sayıyı hatırlar.' },
  { icon: 'link', title: 'Kanıtı iliştir', text: 'Jira bileti, PR ya da doküman linki. Raporunda her katkının yanında görünür.' },
  { icon: 'people', title: 'Görünmeyen işi de yaz', text: 'Mentorluk, olay yönetimi, süreç iyileştirme… Terfi kararlarında en çok bunlar unutulur.' },
  { icon: 'shield-checkmark', title: 'Gizliliği koru', text: 'Müşteri adı veya iç rakam yerine “büyük bir müşteri”, “%30” gibi genellemeler kullan.' },
] as const;

const DOSSIER_WEEKS = 26;

export default function Today() {
  const { user } = useAuth();
  const { data, refresh, refreshing } = useEntries();
  const [now] = useState(() => Date.now());
  if (!user) return null;

  const stats = data?.stats;
  const thisWeek = data?.entries.find((e) => e.weekStart === data.currentWeek && !e.locked);
  const recentKeys = new Set(data?.entries.map((e) => e.weekStart));
  const last8 = data
    ? Array.from({ length: 8 }, (_, i) => new Date(new Date(data.currentWeek).getTime() - (7 - i) * 7 * 864e5).toISOString())
    : [];
  const tip = TIPS[Math.floor(now / (7 * 864e5)) % TIPS.length];
  const toFriday = daysToFriday();
  const initials = (user.name || user.email).slice(0, 1).toLocaleUpperCase('tr-TR');
  const total = stats?.total ?? 0;
  const dossier = Math.min(total, DOSSIER_WEEKS);
  const today = new Date(now).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Ambient />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.brand} />}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <T v="label">{today}</T>
              <T v="title" style={{ marginTop: 6 }}>
                {greeting()}, {user.name || 'merhaba'}
              </T>
            </View>
            {user.pro && <ProBadge />}
            <Pressy onPress={() => router.push('/(tabs)/profile')}>
              <LinearGradient colors={GRADIENTS.brand} style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <T v="h3" style={{ fontFamily: F.black }}>{initials}</T>
                </View>
              </LinearGradient>
            </Pressy>
          </View>

          <Pressy onPress={() => router.push('/entry')} scale={0.985} feedback="medium">
            <LinearGradient colors={GRADIENTS.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }} style={styles.hero}>
              <View style={styles.heroOrbA} />
              <View style={styles.heroOrbB} />
              <View style={styles.heroTop}>
                <View style={styles.heroPill}>
                  <Ionicons name="calendar-clear-outline" size={13} color={C.white} />
                  <T v="small" style={styles.heroPillText}>{data ? weekRange(data.currentWeek) : 'Bu hafta'}</T>
                </View>
                <View style={[styles.heroPill, thisWeek && { backgroundColor: 'rgba(198,244,92,0.22)' }]}>
                  <Ionicons name={thisWeek ? 'checkmark-circle' : 'time-outline'} size={13} color={thisWeek ? C.lime : C.white} />
                  <T v="small" style={[styles.heroPillText, thisWeek && { color: C.lime }]}>
                    {thisWeek ? 'Kaydedildi' : toFriday === 0 ? 'Bugün cuma' : `Cumaya ${toFriday} gün`}
                  </T>
                </View>
              </View>
              <T style={styles.heroTitle}>{thisWeek ? 'Bu hafta\narşivde.' : 'Bu haftayı\n5 dakikada arşivle.'}</T>
              {thisWeek ? (
                <T v="body" numberOfLines={2} style={styles.heroSub}>{thisWeek.wins}</T>
              ) : (
                <T v="body" style={styles.heroSub}>Ne yaptın, etkisi ne oldu, kanıtı nerede?</T>
              )}
              <View style={styles.heroCta}>
                <T v="bodyStrong" style={{ color: C.onAccent, fontFamily: F.bold }}>{thisWeek ? 'Düzenle' : 'Kaydı başlat'}</T>
                <View style={styles.heroCtaIcon}>
                  <Ionicons name={thisWeek ? 'create-outline' : 'arrow-forward'} size={16} color={C.white} />
                </View>
              </View>
            </LinearGradient>
          </Pressy>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Card style={{ flex: 1.1, alignItems: 'center', paddingVertical: 20 }}>
              <Ring value={dossier / DOSSIER_WEEKS} size={104} stroke={10}>
                <T v="number" style={{ fontSize: 30, lineHeight: 34 }}>{dossier}</T>
                <T v="small" style={{ fontSize: 11, marginTop: -2 }}>/ {DOSSIER_WEEKS} hafta</T>
              </Ring>
              <T v="bodyStrong" style={{ marginTop: 12, color: C.ink }}>Terfi dosyası</T>
              <T v="small">{dossier >= DOSSIER_WEEKS ? 'Hazır' : `${DOSSIER_WEEKS - dossier} hafta kaldı`}</T>
            </Card>
            <Card style={{ flex: 1, justifyContent: 'space-between' }}>
              <View style={styles.statIcon}>
                <Ionicons name="flame" size={20} color={C.flame} />
              </View>
              <View>
                <T v="number">{stats?.streak ?? '–'}</T>
                <T v="small">hafta seri</T>
              </View>
              <View style={styles.weekDots}>
                {last8.map((w) => (
                  <View key={w} style={[styles.weekDot, recentKeys.has(w) && styles.weekDotOn]} />
                ))}
              </View>
            </Card>
          </View>

          {stats?.showOffer && !user.pro && (
            <Pressy onPress={() => router.push({ pathname: '/paywall', params: { from: 'offer' } })}>
              <LinearGradient colors={GRADIENTS.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.offerBorder}>
                <View style={styles.offer}>
                  <IconBubble name="gift" color={C.goldInk} bg="rgba(255,183,94,0.14)" size={46} />
                  <View style={{ flex: 1 }}>
                    <T v="h3">{stats.total} haftadır düzenlisin</T>
                    <T v="small">İlk AI performans dosyanı çıkaracak kadar verin var.</T>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={C.goldInk} />
                </View>
              </LinearGradient>
            </Pressy>
          )}

          {thisWeek?.aiSummary && (
            <Card>
              <View style={styles.cardHead}>
                <LinearGradient colors={GRADIENTS.brand} style={styles.aiDot}>
                  <Ionicons name="sparkles" size={13} color={C.white} />
                </LinearGradient>
                <T v="label" style={{ color: C.brandBright }}>Bu haftanın AI özeti</T>
              </View>
              <Markdown content={thisWeek.aiSummary} />
            </Card>
          )}

          {stats && stats.total === 0 && (
            <Card style={{ gap: 16 }}>
              <T v="h2">Nasıl başlarım?</T>
              {[
                ['1', 'Bu hafta yaptığın 2–3 işi yaz', 'Teslim ettiğin, çözdüğün, yönettiğin şeyler.'],
                ['2', 'Etkisini ekle', 'Bir sayı, süre ya da sonuç. Yoksa da sorun değil.'],
                ['3', 'Her cuma tekrarla', 'Hatırlatmayı biz yaparız. 6 ayda dosyan hazır.'],
              ].map(([n, title, text]) => (
                <View key={n} style={{ flexDirection: 'row', gap: 14 }}>
                  <View style={styles.stepNum}><T v="bodyStrong" style={{ color: C.brandBright }}>{n}</T></View>
                  <View style={{ flex: 1 }}>
                    <T v="bodyStrong" style={{ color: C.ink }}>{title}</T>
                    <T v="small">{text}</T>
                  </View>
                </View>
              ))}
              <Button title="İlk kaydımı oluştur" icon="add" onPress={() => router.push('/entry')} size="md" />
            </Card>
          )}

          <Card style={{ flexDirection: 'row', gap: 14 }}>
            <IconBubble name={tip.icon} color={C.goldInk} bg={C.goldSoft} />
            <View style={{ flex: 1 }}>
              <T v="label" style={{ color: C.goldInk }}>Haftanın ipucu · {tip.title}</T>
              <T v="body" style={{ marginTop: 6 }}>{tip.text}</T>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14, paddingBottom: TAB_BAR_SPACE },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6, marginTop: 4 },
  avatarRing: { width: 48, height: 48, borderRadius: 24, padding: 2 },
  avatar: { flex: 1, borderRadius: 22, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: R.xl, padding: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', ...SHADOW_STRONG },
  heroOrbA: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.10)', top: -120, right: -80 },
  heroOrbB: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(79,216,255,0.22)', bottom: -90, left: -40 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  heroPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 11, paddingVertical: 6, borderRadius: R.pill },
  heroPillText: { color: C.white, fontFamily: F.semibold, fontSize: 12 },
  heroTitle: { fontFamily: F.black, fontSize: 30, lineHeight: 34, letterSpacing: -1.2, color: C.white, marginTop: 22 },
  heroSub: { color: 'rgba(255,255,255,0.78)', marginTop: 8 },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', marginTop: 20, paddingLeft: 18, paddingRight: 6, paddingVertical: 6, borderRadius: R.pill, backgroundColor: C.white },
  heroCtaIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.onAccent, alignItems: 'center', justifyContent: 'center' },
  statIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: 'rgba(255,122,69,0.14)', alignItems: 'center', justifyContent: 'center' },
  weekDots: { flexDirection: 'row', gap: 4 },
  weekDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)' },
  weekDotOn: { backgroundColor: C.lime },
  offerBorder: { borderRadius: R.lg, padding: 1.5 },
  offer: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: R.lg - 1.5, backgroundColor: C.card },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  aiDot: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  stepNum: { width: 32, height: 32, borderRadius: 11, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
});
