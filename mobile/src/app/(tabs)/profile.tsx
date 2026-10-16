import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Share, StyleSheet, Switch, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button, Card, Divider, haptic, IconBubble, IconName, ProBadge, Pressy, T } from '@/components/ui';
import { C, F, GRADIENTS, R } from '@/constants/theme';
import { api, API_URL, User } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { longDate } from '@/lib/format';
import { getReminderPrefs, ReminderPrefs, scheduleFridayReminder } from '@/lib/notifications';
import { manageSubscriptionUrl, STORE_MODE } from '@/lib/purchases';
import { prefs } from '@/lib/storage';

const HOURS = [9, 12, 16, 18];

export default function Profile() {
  const { user, setUser, signOut } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.jobTitle || '');
  const [dirty, setDirty] = useState(false);
  const [reminder, setReminder] = useState<ReminderPrefs | null>(null);

  useEffect(() => {
    getReminderPrefs().then(setReminder);
  }, []);

  if (!user) return null;

  async function saveProfile() {
    const u = await api<User>('/api/me', { method: 'PATCH', body: { name, jobTitle: title } });
    setUser(u);
    setDirty(false);
    haptic('success');
  }

  async function updateReminder(next: ReminderPrefs) {
    setReminder(next);
    const ok = await scheduleFridayReminder(next);
    // Server-side email reminder follows the same switch.
    api<User>('/api/me', { method: 'PATCH', body: { reminderOptIn: next.enabled } }).then(setUser);
    if (!ok && next.enabled && Platform.OS !== 'web') {
      Alert.alert('Bildirim izni kapalı', 'Cuma hatırlatması için ayarlardan Promotly bildirimlerine izin ver.', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Ayarlar', onPress: () => Linking.openSettings() },
      ]);
    }
  }

  async function exportArchive() {
    const md = await api<string>('/api/export?format=md', { raw: true });
    if (Platform.OS === 'web') {
      await globalThis.navigator?.clipboard?.writeText(md);
      globalThis.alert?.('Arşivin Markdown olarak panoya kopyalandı.');
    } else {
      await Share.share({ message: md, title: 'Promotly arşivim' });
    }
  }

  async function manage() {
    const url = await manageSubscriptionUrl();
    if (url) Linking.openURL(url);
    else if (Platform.OS === 'ios') Linking.openURL('https://apps.apple.com/account/subscriptions');
    else if (Platform.OS === 'android') Linking.openURL('https://play.google.com/store/account/subscriptions');
  }

  async function demoCancel() {
    setUser(await api<User>('/api/dev/pro', { method: 'POST', body: { cancel: true } }));
  }

  function confirmDelete() {
    const go = async () => {
      await api('/api/me', { method: 'DELETE' });
      await prefs.clear();
      await signOut();
      router.replace('/onboarding');
    };
    const msg = 'Hesabın, tüm haftalık kayıtların ve raporların kalıcı olarak silinecek. Bu işlem geri alınamaz.';
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(msg)) go();
      return;
    }
    Alert.alert('Hesabı sil', msg, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Kalıcı olarak sil', style: 'destructive', onPress: go },
    ]);
  }

  async function logout() {
    await signOut();
    router.replace('/login');
  }

  async function replayTutorial() {
    await prefs.set('composerIntroSeen', false);
    router.push('/onboarding');
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <T v="title">Profil</T>

        {user.pro ? (
          <LinearGradient colors={GRADIENTS.night} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.plan}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ProBadge />
              <T v="small" style={{ color: 'rgba(255,255,255,0.6)' }}>{user.proPlan === 'yearly' ? 'Yıllık plan' : 'Aylık plan'}</T>
            </View>
            <T v="h2" style={{ color: C.white, marginTop: 12 }}>Promotly Pro aktif</T>
            <T v="small" style={{ color: 'rgba(255,255,255,0.7)' }}>{user.proUntil ? `${longDate(user.proUntil)} tarihine kadar` : ''}</T>
            {STORE_MODE ? (
              <Button title="Aboneliği yönet" variant="light" size="md" style={{ marginTop: 14 }} onPress={manage} />
            ) : (
              <Button title="Demo: Pro’yu kapat" variant="light" size="md" style={{ marginTop: 14 }} onPress={demoCancel} />
            )}
          </LinearGradient>
        ) : (
          <Pressy onPress={() => router.push({ pathname: '/paywall', params: { from: 'profile' } })} scale={0.985}>
            <LinearGradient colors={GRADIENTS.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.plan}>
              <T v="label" style={{ color: 'rgba(255,255,255,0.7)' }}>Ücretsiz plan</T>
              <T v="h2" style={{ color: C.white, marginTop: 6 }}>Pro’ya geç</T>
              <T v="small" style={{ color: 'rgba(255,255,255,0.75)' }}>
                AI özetleri, terfi dosyası, sınırsız arşiv. Aylık {user.prices.monthly} TL’den başlayan fiyatlarla.
              </T>
              <View style={styles.planCta}>
                <T v="bodyStrong" style={{ color: '#3A2300' }}>Planları gör</T>
                <Ionicons name="arrow-forward" size={16} color="#3A2300" />
              </View>
            </LinearGradient>
          </Pressy>
        )}

        <Card style={{ gap: 12 }}>
          <T v="label">Kimlik</T>
          <Input label="Ad" value={name} onChange={(v) => { setName(v); setDirty(true); }} placeholder="Adın" />
          <Input label="Pozisyon" value={title} onChange={(v) => { setTitle(v); setDirty(true); }} placeholder="Kıdemli Yazılım Mühendisi" />
          <T v="small">Raporlarının başlığında görünür. {user.email}</T>
          {dirty && <Button title="Kaydet" size="md" onPress={saveProfile} />}
        </Card>

        <Card style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconBubble name="notifications" size={36} />
            <View style={{ flex: 1 }}>
              <T v="bodyStrong">Cuma hatırlatması</T>
              <T v="small">{Platform.OS === 'web' ? 'Web önizlemesinde e-posta ile' : 'Her cuma bildirim + kaçırırsan e-posta'}</T>
            </View>
            <Switch
              value={!!reminder?.enabled}
              onValueChange={(v) => { if (reminder) updateReminder({ ...reminder, enabled: v }); }}
              trackColor={{ true: C.brand, false: C.line }}
              thumbColor={C.white}
            />
          </View>
          {reminder?.enabled && Platform.OS !== 'web' && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {HOURS.map((h) => (
                <Pressy key={h} onPress={() => updateReminder({ ...reminder, hour: h, minute: 0 })} style={[styles.hour, reminder.hour === h && styles.hourOn]} feedback="select">
                  <T v="bodyStrong" style={{ color: reminder.hour === h ? C.white : C.text }}>{String(h).padStart(2, '0')}:00</T>
                </Pressy>
              ))}
            </View>
          )}
        </Card>

        <Card padded={false}>
          <Row icon="download-outline" label="Arşivimi dışa aktar" sub="Markdown, tüm kayıtlar ve raporlar" onPress={exportArchive} />
          <Divider style={{ marginLeft: 64 }} />
          <Row icon="school-outline" label="Tanıtımı tekrar izle" onPress={replayTutorial} />
          <Divider style={{ marginLeft: 64 }} />
          <Row icon="shield-checkmark-outline" label="KVKK ve gizlilik" onPress={() => Linking.openURL(`${API_URL}/kvkk`)} />
          <Divider style={{ marginLeft: 64 }} />
          <Row icon="document-outline" label="Kullanım koşulları" onPress={() => Linking.openURL(`${API_URL}/kosullar`)} />
          <Divider style={{ marginLeft: 64 }} />
          <Row icon="mail-outline" label="Destek" sub="destek@magicdigital.org" onPress={() => Linking.openURL('mailto:destek@magicdigital.org?subject=Promotly')} />
        </Card>

        <Card padded={false}>
          <Row icon="log-out-outline" label="Çıkış yap" onPress={logout} />
          <Divider style={{ marginLeft: 64 }} />
          <Row icon="trash-outline" label="Hesabı ve verilerimi sil" danger onPress={confirmDelete} />
        </Card>

        <T v="small" style={{ textAlign: 'center', color: C.faint }}>Promotly · Terfi ve Başarı Arşivi</T>
      </ScrollView>
    </SafeAreaView>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={{ gap: 4 }}>
      <T v="small" style={{ fontFamily: F.semibold, color: C.text }}>{label}</T>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.faint} style={styles.input} />
    </View>
  );
}

function Row({ icon, label, sub, onPress, danger }: { icon: IconName; label: string; sub?: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressy onPress={onPress} scale={0.99} style={styles.row}>
      <IconBubble name={icon} size={36} color={danger ? C.red : C.brand} bg={danger ? C.redSoft : C.brandSoft} />
      <View style={{ flex: 1 }}>
        <T v="bodyStrong" style={danger && { color: C.red }}>{label}</T>
        {sub && <T v="small">{sub}</T>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.faint} />
    </Pressy>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  plan: { borderRadius: R.xl, padding: 20 },
  planCta: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: C.gold, paddingHorizontal: 14, paddingVertical: 9, borderRadius: R.md, marginTop: 14 },
  input: { backgroundColor: C.bg, borderRadius: R.md, paddingHorizontal: 14, height: 48, fontFamily: F.medium, fontSize: 15, color: C.ink, outlineStyle: 'none' } as any,
  hour: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: R.md, backgroundColor: C.bg },
  hourOn: { backgroundColor: C.brand },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
});
