import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button, Card, IconBubble, ProBadge, ProgressBar, Pressy, T } from '@/components/ui';
import Markdown from '@/components/Markdown';
import { C, F, GRADIENTS, R, SHADOW_STRONG } from '@/constants/theme';
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

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.brand} />}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <T v="small">{greeting()}</T>
            <T v="title">{user.name || 'Hoş geldin'} 👋</T>
          </View>
          {user.pro && <ProBadge />}
          <Pressy onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}>
            <T v="h3" style={{ color: C.brand, fontFamily: F.black }}>{initials}</T>
          </Pressy>
        </View>

        <Pressy onPress={() => router.push('/entry')} scale={0.985} feedback="medium">
          <LinearGradient colors={GRADIENTS.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroGlow} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T v="label" style={{ color: 'rgba(255,255,255,0.7)' }}>{data ? weekRange(data.currentWeek) : 'Bu hafta'}</T>
              <View style={styles.heroPill}>
                <Ionicons name={thisWeek ? 'checkmark-circle' : 'time-outline'} size={14} color={C.white} />
                <T v="small" style={{ color: C.white, fontFamily: F.semibold }}>
                  {thisWeek ? 'Kaydedildi' : toFriday === 0 ? 'Bugün cuma!' : `Cumaya ${toFriday} gün`}
                </T>
              </View>
            </View>
            {thisWeek ? (
              <>
                <T v="title" style={{ color: C.white, marginTop: 14 }}>Bu hafta arşivde ✓</T>
                <T v="body" numberOfLines={2} style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>{thisWeek.wins}</T>
                <View style={styles.heroCta}>
                  <T v="bodyStrong" style={{ color: C.white }}>Düzenle</T>
                  <Ionicons name="create-outline" size={18} color={C.white} />
                </View>
              </>
            ) : (
              <>
                <T v="title" style={{ color: C.white, marginTop: 14 }}>Bu haftayı 5 dakikada arşivle</T>
                <T v="body" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>Ne yaptın, etkisi ne oldu, kanıtı nerede?</T>
                <View style={[styles.heroCta, { backgroundColor: C.white }]}>
                  <T v="bodyStrong" style={{ color: C.brand }}>Kaydı başlat</T>
                  <Ionicons name="arrow-forward" size={18} color={C.brand} />
                </View>
              </>
            )}
          </LinearGradient>
        </Pressy>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="flame" size={22} color={C.flame} />
              <T v="title">{stats?.streak ?? '–'}</T>
            </View>
            <T v="small" style={{ marginTop: 2 }}>hafta seri</T>
            <View style={styles.weekDots}>
              {last8.map((w) => (
                <View key={w} style={[styles.weekDot, recentKeys.has(w) && { backgroundColor: C.flame }]} />
              ))}
            </View>
          </Card>
          <Card style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="ribbon" size={20} color={C.gold} />
              <T v="title">{Math.min(stats?.total ?? 0, DOSSIER_WEEKS)}<T v="small">/{DOSSIER_WEEKS}</T></T>
            </View>
            <T v="small" style={{ marginTop: 2, marginBottom: 10 }}>terfi dosyasına</T>
            <ProgressBar value={(stats?.total ?? 0) / DOSSIER_WEEKS} color={C.gold} />
          </Card>
        </View>

        {stats?.showOffer && !user.pro && (
          <Pressy onPress={() => router.push({ pathname: '/paywall', params: { from: 'offer' } })}>
            <LinearGradient colors={GRADIENTS.night} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.offer}>
              <IconBubble name="gift" color={C.gold} bg="rgba(245,165,36,0.15)" size={46} />
              <View style={{ flex: 1 }}>
                <T v="h3" style={{ color: C.white }}>{stats.total} haftadır düzenlisin 🎉</T>
                <T v="small" style={{ color: 'rgba(255,255,255,0.7)' }}>İlk AI performans dosyanı çıkaracak kadar verin var.</T>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.gold} />
            </LinearGradient>
          </Pressy>
        )}

        {thisWeek?.aiSummary && (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Ionicons name="sparkles" size={16} color={C.brand} />
              <T v="label" style={{ color: C.brand }}>Bu haftanın AI özeti</T>
            </View>
            <Markdown content={thisWeek.aiSummary} />
          </Card>
        )}

        {stats && stats.total === 0 && (
          <Card style={{ gap: 14 }}>
            <T v="h2">Nasıl başlarım?</T>
            {[
              ['1', 'Bu hafta yaptığın 2–3 işi yaz', 'Teslim ettiğin, çözdüğün, yönettiğin şeyler.'],
              ['2', 'Etkisini ekle', 'Bir sayı, süre ya da sonuç. Yoksa da sorun değil.'],
              ['3', 'Her cuma tekrarla', 'Hatırlatmayı biz yaparız. 6 ayda dosyan hazır.'],
            ].map(([n, title, text]) => (
              <View key={n} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={styles.stepNum}><T v="bodyStrong" style={{ color: C.brand }}>{n}</T></View>
                <View style={{ flex: 1 }}>
                  <T v="bodyStrong">{title}</T>
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
            <T v="body" style={{ marginTop: 4 }}>{tip.text}</T>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  avatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: R.xl, padding: 22, overflow: 'hidden', ...SHADOW_STRONG },
  heroGlow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)', top: -90, right: -60 },
  heroPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.pill },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginTop: 18, paddingHorizontal: 16, paddingVertical: 11, borderRadius: R.md, backgroundColor: 'rgba(255,255,255,0.16)' },
  weekDots: { flexDirection: 'row', gap: 4, marginTop: 12 },
  weekDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: C.lineSoft },
  offer: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: R.lg },
  stepNum: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
});
