import { useMemo, useState } from 'react';
import { Alert, Linking, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button, Card, Chip, ProBadge, Pressy, T } from '@/components/ui';
import Markdown from '@/components/Markdown';
import { C, F, R } from '@/constants/theme';
import { api, Entry } from '@/lib/api';
import { useEntries } from '@/lib/hooks';
import { MOODS, monthKey, weekLabel, weekRange } from '@/lib/format';

export default function Archive() {
  const { data, refresh, refreshing, reload } = useEntries();
  const [tag, setTag] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const tags = useMemo(() => {
    const count: Record<string, number> = {};
    data?.entries.forEach((e) => e.tags?.forEach((t) => (count[t] = (count[t] || 0) + 1)));
    return Object.entries(count).sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 12);
  }, [data]);

  const groups = useMemo(() => {
    const list = (data?.entries || []).filter((e) => !tag || e.tags?.includes(tag));
    const out: { month: string; items: Entry[] }[] = [];
    for (const e of list) {
      const m = monthKey(e.weekStart);
      if (out[out.length - 1]?.month !== m) out.push({ month: m, items: [] });
      out[out.length - 1].items.push(e);
    }
    return out;
  }, [data, tag]);

  const lockedCount = data?.entries.filter((e) => e.locked).length || 0;

  function remove(e: Entry) {
    const go = async () => {
      await api(`/api/entries/${e.id}`, { method: 'DELETE' });
      reload();
    };
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Bu haftalık kaydı silmek istiyor musun?')) go();
    } else {
      Alert.alert('Kaydı sil', 'Bu haftalık kayıt kalıcı olarak silinecek.', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: go },
      ]);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.brand} />}>
        <View>
          <T v="title">Arşiv</T>
          <T v="small">{data ? `${data.stats.total} haftalık kayıt` : ' '}</T>
        </View>

        {tags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -20, paddingHorizontal: 20, flexGrow: 0 }}>
            <Chip label="Tümü" active={!tag} onPress={() => setTag(null)} />
            {tags.map((t) => (
              <Chip key={t} label={`#${t}`} active={tag === t} onPress={() => setTag(tag === t ? null : t)} />
            ))}
          </ScrollView>
        )}

        {data && data.entries.length === 0 && (
          <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 32 }}>
            <Ionicons name="albums-outline" size={40} color={C.faint} />
            <T v="h3">Arşivin henüz boş</T>
            <T v="small" style={{ textAlign: 'center' }}>İlk haftanı kaydet; her cuma buraya bir sayfa eklenecek.</T>
            <Button title="Bu haftayı kaydet" size="md" icon="add" onPress={() => router.push('/entry')} style={{ marginTop: 6 }} />
          </Card>
        )}

        {groups.map((g) => (
          <View key={g.month} style={{ gap: 10 }}>
            <T v="label">{g.month}</T>
            {g.items.map((e) =>
              e.locked ? (
                <Pressy key={e.id} onPress={() => router.push({ pathname: '/paywall', params: { from: 'archive' } })}>
                  <View style={styles.locked}>
                    <Ionicons name="lock-closed" size={16} color={C.faint} />
                    <T v="bodyStrong" style={{ color: C.faint, flex: 1 }}>{weekRange(e.weekStart)}</T>
                    <ProBadge small />
                  </View>
                </Pressy>
              ) : (
                <Pressy key={e.id} onPress={() => setOpen(open === e.id ? null : e.id)} scale={0.99} feedback="select">
                  <Card>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <T v="label" style={{ color: C.brand, flex: 1 }}>
                        {weekRange(e.weekStart)} · {weekLabel(e.weekStart, data!.currentWeek)}
                      </T>
                      {!!e.mood && <T style={{ fontSize: 18 }}>{MOODS[e.mood - 1]}</T>}
                      {e.aiSummary && <Ionicons name="sparkles" size={14} color={C.brand} />}
                    </View>
                    <T v="body" numberOfLines={open === e.id ? undefined : 3} style={{ marginTop: 8 }}>{e.wins}</T>
                    {!!e.impact && (
                      <View style={styles.impact}>
                        <Ionicons name="trending-up" size={15} color={C.green} />
                        <T v="small" style={{ color: C.green, flex: 1, fontFamily: F.semibold }} numberOfLines={open === e.id ? undefined : 2}>{e.impact}</T>
                      </View>
                    )}
                    {open === e.id && (
                      <View style={{ gap: 10, marginTop: 12 }}>
                        {e.aiSummary && (
                          <View style={styles.ai}>
                            <T v="label" style={{ color: C.brand, marginBottom: 6 }}>AI özet</T>
                            <Markdown content={e.aiSummary} />
                          </View>
                        )}
                        {[['Zorluklar', e.challenges], ['Öğrenilenler', e.learnings], ['Gelecek hafta', e.nextWeek]].map(([k, v]) =>
                          v ? (
                            <View key={k}>
                              <T v="label">{k}</T>
                              <T v="body">{v}</T>
                            </View>
                          ) : null,
                        )}
                        {(e.links || []).map((l) => (
                          <Pressy key={l} onPress={() => Linking.openURL(l)} style={styles.link}>
                            <Ionicons name="link" size={14} color={C.brand} />
                            <T v="small" numberOfLines={1} style={{ color: C.brand, flex: 1 }}>{l.replace(/^https?:\/\//, '')}</T>
                          </Pressy>
                        ))}
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          {data!.entries.indexOf(e) <= data!.backfillWeeks && (
                            <Button title="Düzenle" icon="create-outline" variant="secondary" size="md" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/entry', params: { week: e.weekStart } })} />
                          )}
                          <Button title="Sil" icon="trash-outline" variant="danger" size="md" style={{ flex: 1 }} onPress={() => remove(e)} />
                        </View>
                      </View>
                    )}
                    {!!e.tags?.length && (
                      <View style={styles.tags}>
                        {e.tags.map((t) => (
                          <T key={t} v="small" style={{ color: C.muted }}>#{t}</T>
                        ))}
                        {!!e.links?.length && open !== e.id && (
                          <T v="small" style={{ color: C.brand }}>🔗 {e.links.length}</T>
                        )}
                      </View>
                    )}
                  </Card>
                </Pressy>
              ),
            )}
          </View>
        ))}

        {lockedCount > 0 && (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="lock-open-outline" size={22} color={C.brand} />
            <T v="small" style={{ flex: 1, color: C.text }}>
              {lockedCount} eski haftan güvende, silinmedi. Ücretsiz planda son {data?.historyLimitWeeks} hafta görünür.
            </T>
            <Button title="Aç" size="md" variant="gold" onPress={() => router.push({ pathname: '/paywall', params: { from: 'archive' } })} />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  locked: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: R.lg, backgroundColor: C.white, opacity: 0.75, borderWidth: 1, borderColor: C.line, borderStyle: 'dashed' },
  impact: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 8, backgroundColor: C.greenSoft, padding: 10, borderRadius: R.sm },
  ai: { backgroundColor: C.brandSoft, padding: 12, borderRadius: R.md },
  link: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: C.brandSoft, padding: 10, borderRadius: R.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
});
