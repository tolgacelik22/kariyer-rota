import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, Share, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import Markdown from '@/components/Markdown';
import { Button, Card, Pressy, T } from '@/components/ui';
import { C, R } from '@/constants/theme';
import { api, Report } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { longDate } from '@/lib/format';

const LABEL = { review: 'Performans & terfi dosyası', quarterly: 'Çeyrek analizi', stories: 'Başarı hikâyeleri', monthly: 'Aylık özet' } as const;

export default function ReportView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    api<{ report: Report }>(`/api/reports/${id}`).then((r) => setReport(r.report));
  }, [id]);

  async function share() {
    if (!report) return;
    const message = `${LABEL[report.type]} — ${user?.name || ''}\n\n${report.content}`;
    if (Platform.OS === 'web') {
      await globalThis.navigator?.clipboard?.writeText(message);
      globalThis.alert?.('Rapor panoya kopyalandı.');
    } else {
      await Share.share({ message, title: LABEL[report.type] });
    }
  }

  function remove() {
    const go = async () => {
      await api(`/api/reports/${id}`, { method: 'DELETE' });
      router.back();
    };
    if (Platform.OS === 'web') return globalThis.confirm?.('Rapor silinsin mi?') && go();
    Alert.alert('Raporu sil', 'Haftalık kayıtların etkilenmez.', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: go },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.top}>
        <Pressy onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={C.ink} />
        </Pressy>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressy onPress={remove} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={19} color={C.muted} />
          </Pressy>
        </View>
      </View>
      {!report ? (
        <ActivityIndicator color={C.brand} style={{ marginTop: 60 }} />
      ) : (
        <>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <T v="label" style={{ color: C.brand }}>
              {report.source === 'ai' ? '✦ AI ile hazırlandı' : 'Temel özet'}
            </T>
            <T v="title" style={{ marginTop: 6 }}>{LABEL[report.type]}</T>
            <T v="small" style={{ marginTop: 4 }}>
              {user?.name || user?.email}{user?.jobTitle ? ` · ${user.jobTitle}` : ''} · {longDate(report.createdAt)} · {report.entryCount} hafta
            </T>
            <Card style={{ marginTop: 18 }}>
              <Markdown content={report.content} />
            </Card>
            {report.source === 'template' && !user?.pro && (
              <Pressy onPress={() => router.push({ pathname: '/paywall', params: { from: 'review' } })} style={{ marginTop: 14 }}>
                <View style={styles.upsell}>
                  <Ionicons name="sparkles" size={18} color={C.brand} />
                  <T v="small" style={{ flex: 1, color: C.brand }}>Bu temel özet. Pro ile yöneticine hazır, kanıtlı AI raporu al →</T>
                </View>
              </Pressy>
            )}
          </ScrollView>
          <View style={styles.footer}>
            <Button title={Platform.OS === 'web' ? 'Kopyala' : 'Paylaş'} icon={Platform.OS === 'web' ? 'copy-outline' : 'share-outline'} onPress={share} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' , borderWidth: 1, borderColor: C.line},
  upsell: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: C.brandSoft, padding: 14, borderRadius: R.md },
  footer: { padding: 20, paddingTop: 10 },
});
