import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button, haptic, Pressy, T } from '@/components/ui';
import { C, F, GRADIENTS, R } from '@/constants/theme';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { getPlans, Plan, purchase, restore, STORE_MODE } from '@/lib/purchases';

const HEADLINES: Record<string, { title: string; sub: string }> = {
  offer: { title: 'Arşivin hazır.\nŞimdi dosyanı çıkar.', sub: 'Haftalarca biriktirdiğin kayıtları yöneticine hazır bir performans dosyasına dönüştür.' },
  summary: { title: 'Her haftaya\nAI özeti.', sub: 'Kaydını yöneticine iletebileceğin 3 net maddeye çeviririz.' },
  review: { title: 'Terfi görüşmesine\nkanıtla git.', sub: '6 aylık katkıların, etkileri ve kanıtlarıyla tek bir dosyada.' },
  quarterly: { title: 'Çeyreğini\nanaliz et.', sub: 'Güçlü yönlerin, gelişim alanların ve ölçülebilir hedeflerin.' },
  stories: { title: 'Mülakata\nhikâyelerle gir.', sub: 'Kayıtlarından STAR formatında başarı hikâyeleri ve CV maddeleri.' },
  archive: { title: 'Tüm geçmişin\nher zaman elinde.', sub: 'Ücretsiz planda son 8 hafta görünür. Pro ile arşivinin tamamı açılır.' },
  default: { title: 'Kariyerini\nkanıtla büyüt.', sub: 'Haftalık kayıtlarını yapay zekâ ile terfi dosyasına dönüştür.' },
};

const BENEFITS = [
  { icon: 'sparkles', title: 'AI haftalık özet', text: 'Her kayıt, yöneticine hazır 3 maddeye dönüşür' },
  { icon: 'ribbon', title: '6 aylık terfi dosyası', text: 'Katkılar, etkiler, kanıtlar ve görüşme hazırlığı' },
  { icon: 'analytics', title: 'Çeyrek analizi', text: 'Güçlü yönler, gelişim alanları, yeni hedefler' },
  { icon: 'briefcase', title: 'STAR başarı hikâyeleri', text: 'CV ve mülakat için hazır anlatım' },
  { icon: 'infinite', title: 'Sınırsız arşiv', text: 'Tüm geçmiş + 8 hafta geriye kayıt' },
] as const;

export default function Paywall() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { user, refresh, setUser } = useAuth();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [selected, setSelected] = useState<'yearly' | 'monthly'>('yearly');
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [done, setDone] = useState(false);
  const head = HEADLINES[from || ''] || HEADLINES.default;

  useEffect(() => {
    if (user) getPlans(user.prices).then(setPlans);
  }, [user]);

  const plan = plans?.find((p) => p.id === selected);

  async function buy() {
    if (!plan) return;
    setBusy(true);
    const res = await purchase(plan);
    setBusy(false);
    if (res.ok) {
      haptic('success');
      if (res.user) setUser(res.user);
      // Store purchases reach the server through the RevenueCat webhook; give it a moment.
      else setTimeout(refresh, 2500);
      setDone(true);
    } else if (!res.cancelled) {
      haptic('warning');
      Alert.alert('Satın alma tamamlanamadı', res.error || 'Lütfen tekrar dene.');
    }
  }

  async function doRestore() {
    setRestoring(true);
    const ok = await restore();
    setRestoring(false);
    if (ok) {
      await refresh();
      setDone(true);
    } else Alert.alert('Abonelik bulunamadı', STORE_MODE ? 'Bu hesapla ilişkili aktif bir Pro aboneliği yok.' : 'Geri yükleme yalnızca mağaza sürümünde çalışır.');
  }

  if (done) {
    return (
      <LinearGradient colors={GRADIENTS.night} style={{ flex: 1 }}>
        <SafeAreaView style={styles.doneWrap}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.doneIcon}>
            <Ionicons name="star" size={46} color="#3A2300" />
          </LinearGradient>
          <T v="hero" style={{ color: C.white, textAlign: 'center' }}>Pro’ya hoş geldin</T>
          <T v="body" style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            AI özetleri, terfi dosyası ve tüm arşivin açıldı.
          </T>
          <Button
            variant="gold"
            title="İlk raporumu oluştur"
            icon="sparkles"
            style={{ alignSelf: 'stretch', marginTop: 16 }}
            onPress={() => router.replace('/(tabs)/reports')}
          />
          <Pressy onPress={() => router.back()} feedback={null}>
            <T v="bodyStrong" style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Kapat</T>
          </Pressy>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.ink }}>
      <StatusBar style="light" />
      <LinearGradient colors={['#1F3A8A', '#0B1220']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.55 }} style={StyleSheet.absoluteFill} />
      <View style={styles.orb} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.top}>
          <Pressy onPress={doRestore} feedback={null} hitSlop={10}>
            {restoring ? <ActivityIndicator color="rgba(255,255,255,0.6)" /> : <T v="small" style={styles.topLink}>Geri yükle</T>}
          </Pressy>
          <Pressy onPress={() => router.back()} style={styles.close} hitSlop={10}>
            <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
          </Pressy>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.crown}>
            <Ionicons name="trophy" size={30} color="#3A2300" />
          </LinearGradient>
          <T v="label" style={{ color: C.gold, textAlign: 'center' }}>Promotly Pro</T>
          <T v="hero" style={{ color: C.white, textAlign: 'center', marginTop: 8 }}>{head.title}</T>
          <T v="body" style={{ color: 'rgba(255,255,255,0.72)', textAlign: 'center', marginTop: 10 }}>{head.sub}</T>

          <View style={styles.benefits}>
            {BENEFITS.map((b) => (
              <View key={b.title} style={styles.benefit}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={b.icon} size={16} color={C.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <T v="bodyStrong" style={{ color: C.white }}>{b.title}</T>
                </View>
              </View>
            ))}
          </View>

          {!plans ? (
            <ActivityIndicator color={C.white} style={{ marginVertical: 30 }} />
          ) : (
            <View style={{ gap: 12 }}>
              {plans.map((p) => {
                const active = p.id === selected;
                return (
                  <Pressy key={p.id} onPress={() => setSelected(p.id)} feedback="select" scale={0.98}>
                    <View style={[styles.plan, active && styles.planActive]}>
                      {p.id === 'yearly' && !!p.savePct && (
                        <LinearGradient colors={GRADIENTS.gold} style={styles.saveBadge}>
                          <T v="small" style={{ color: '#3A2300', fontFamily: F.black, fontSize: 11 }}>%{p.savePct} TASARRUF</T>
                        </LinearGradient>
                      )}
                      <View style={[styles.radio, active && styles.radioOn]}>{active && <View style={styles.radioDot} />}</View>
                      <View style={{ flex: 1 }}>
                        <T v="h3" style={{ color: C.white }}>{p.id === 'yearly' ? 'Yıllık' : 'Aylık'}</T>
                        <T v="small" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {p.trial ? `${p.trial}, sonra ` : ''}
                          {p.id === 'yearly' ? `aylık ${p.perMonth}'ye denk` : 'İstediğin zaman iptal'}
                        </T>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <T v="h2" style={{ color: C.white }}>{p.price}</T>
                        <T v="small" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.id === 'yearly' ? '/yıl' : '/ay'}</T>
                      </View>
                    </View>
                  </Pressy>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            variant="gold"
            title={plan?.trial ? 'Ücretsiz denemeyi başlat' : 'Pro’ya geç'}
            onPress={buy}
            loading={busy}
            disabled={!plan}
          />
          <T v="small" style={styles.fine}>
            {STORE_MODE
              ? `Abonelik, dönem sonundan 24 saat önce iptal edilmezse otomatik yenilenir. ${Platform.OS === 'ios' ? 'App Store' : 'Google Play'} hesap ayarlarından yönetebilirsin.`
              : 'Demo sürümü: gerçek ödeme alınmaz, Pro bu hesapta test için açılır.'}
          </T>
          <View style={styles.legal}>
            <T v="small" style={styles.legalLink} onPress={() => Linking.openURL(`${API_URL}/kvkk`)}>Gizlilik</T>
            <T v="small" style={styles.legalDot}>·</T>
            <T v="small" style={styles.legalLink} onPress={() => Linking.openURL(`${API_URL}/kosullar`)}>Kullanım koşulları</T>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', width: 340, height: 340, borderRadius: 170, backgroundColor: 'rgba(245,165,36,0.06)', top: -140, alignSelf: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 52 },
  topLink: { color: 'rgba(255,255,255,0.6)', fontFamily: F.semibold },
  close: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  crown: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12, marginTop: 0 },
  benefits: { gap: 11, marginVertical: 22 },
  benefit: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  benefitIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(245,165,36,0.14)', alignItems: 'center', justifyContent: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: R.lg, borderWidth: 2, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.05)' },
  planActive: { borderColor: C.gold, backgroundColor: 'rgba(245,165,36,0.10)' },
  saveBadge: { position: 'absolute', top: -11, right: 16, paddingHorizontal: 10, paddingVertical: 3, borderRadius: R.pill },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: C.gold },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: C.gold },
  footer: { paddingHorizontal: 24, paddingBottom: 10, paddingTop: 8, gap: 10 },
  fine: { color: 'rgba(255,255,255,0.45)', textAlign: 'center', fontSize: 11.5, lineHeight: 16 },
  legal: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  legalLink: { color: 'rgba(255,255,255,0.6)', fontSize: 12, textDecorationLine: 'underline' },
  legalDot: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  doneIcon: { width: 96, height: 96, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
});
