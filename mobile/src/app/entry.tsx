import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button, Card, Chip, haptic, ProBadge, ProgressBar, Pressy, T } from '@/components/ui';
import Markdown from '@/components/Markdown';
import { C, F, GRADIENTS, R, SHADOW } from '@/constants/theme';
import { api, EntriesResponse, Entry } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { MOODS, weekLabel, weekRange } from '@/lib/format';
import { prefs } from '@/lib/storage';
import { getReminderPrefs, scheduleFridayReminder } from '@/lib/notifications';

type Form = { wins: string; impact: string; links: string[]; tags: string[]; mood: number | null; challenges: string; learnings: string; nextWeek: string };
const EMPTY: Form = { wins: '', impact: '', links: [], tags: [], mood: null, challenges: '', learnings: '', nextWeek: '' };

const STEPS = [
  { key: 'wins', title: 'Bu hafta neler yaptın?', sub: 'Teslim ettiğin, çözdüğün, yönettiğin işler. Her satır bir madde.', tip: 'Fiille başla: “Canlıya aldım”, “Çözdüm”, “Yönettim”. Küçük işler de sayılır.' },
  { key: 'impact', title: 'Etkisi ne oldu?', sub: 'Bir sayı, süre, tutar ya da sonuç. Raporunu güçlü yapan kısım burası.', tip: 'Önce → sonra yaz: “Hata oranı %4,1 → %1,3”. Kesin değilse “~%30” da olur.' },
  { key: 'evidence', title: 'Kanıt ve etiketler', sub: 'Jira, GitHub ya da doküman linki ekle; işi bir alanla etiketle.', tip: 'Linkler raporunda her katkının yanında “kanıt” olarak görünür.' },
  { key: 'close', title: 'Haftayı kapat', sub: 'Nasıl geçti? İstersen zorlukları ve gelecek haftayı da not et.', tip: 'Zorluklar çeyrek analizinde gelişim alanlarını, planlar da hedeflerini besler.' },
] as const;

const STARTERS = ['Canlıya aldım: ', 'Çözdüm: ', 'Yönettim: ', 'Mentorluk yaptım: ', 'Sunum yaptım: ', 'Süreci iyileştirdim: '];
const IMPACT_HELPERS = ['%', ' → ', ' saat kazandırdı', ' kişiye ulaştı', ' TL tasarruf'];
const BASE_TAGS = ['teknik', 'liderlik', 'iş birliği', 'mentorluk', 'süreç', 'müşteri', 'strateji'];

function toForm(e?: Entry): Form {
  if (!e || e.locked) return EMPTY;
  return {
    wins: e.wins || '',
    impact: e.impact || '',
    links: e.links || [],
    tags: e.tags || [],
    mood: e.mood ?? null,
    challenges: e.challenges || '',
    learnings: e.learnings || '',
    nextWeek: e.nextWeek || '',
  };
}

export default function EntryComposer() {
  const { user, refresh } = useAuth();
  const params = useLocalSearchParams<{ week?: string }>();
  const [meta, setMeta] = useState<EntriesResponse | null>(null);
  const [week, setWeek] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ entry: Entry; streak: number; total: number } | null>(null);
  const [showIntro, setShowIntro] = useState<boolean | null>(null);
  const mainInput = useRef<any>(null);
  const [weekPicker, setWeekPicker] = useState(false);
  const [more, setMore] = useState(false);
  const [linkDraft, setLinkDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const fade = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    api<EntriesResponse>('/api/entries').then((d) => {
      setMeta(d);
      const target = params.week && d.entries.some((e) => e.weekStart === params.week) ? params.week : d.currentWeek;
      setWeek(target);
      setForm(toForm(d.entries.find((e) => e.weekStart === target)));
    });
    prefs.get('composerIntroSeen', false).then((seen) => setShowIntro(!seen));
  }, [params.week]);

  // Open the keyboard on the text steps, but never underneath the first-time intro card.
  useEffect(() => {
    if (!meta || showIntro !== false || step > 1 || Platform.OS === 'web') return;
    const t = setTimeout(() => mainInput.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [meta, showIntro, step]);

  const weeks = useMemo(() => {
    if (!meta) return [];
    const base = new Date(meta.currentWeek).getTime();
    return Array.from({ length: meta.backfillWeeks + 1 }, (_, i) => new Date(base - i * 7 * 864e5).toISOString());
  }, [meta]);

  const knownTags = useMemo(() => {
    const fromHistory = (meta?.entries || []).flatMap((e) => e.tags || []);
    return [...new Set([...form.tags, ...fromHistory, ...BASE_TAGS])].slice(0, 14);
  }, [meta, form.tags]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  function go(to: number) {
    Animated.sequence([
      Animated.timing(fade, { toValue: 0, duration: 110, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
    setTimeout(() => setStep(to), 110);
  }

  function pickWeek(w: string) {
    setWeek(w);
    setForm(toForm(meta?.entries.find((e) => e.weekStart === w)));
    setWeekPicker(false);
    setStep(0);
  }

  function addLink() {
    let v = linkDraft.trim();
    if (!v) return;
    if (!/^https?:\/\//.test(v)) v = `https://${v}`;
    if (!form.links.includes(v)) set('links', [...form.links, v]);
    setLinkDraft('');
  }

  function toggleTag(t: string) {
    set('tags', form.tags.includes(t) ? form.tags.filter((x) => x !== t) : [...form.tags, t].slice(0, 10));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      // Drop starter chips that were tapped but never completed ("Çözdüm:" alone).
      const clean = (s: string) => s.split('\n').filter((l) => !/^[^:]{0,30}:\s*$/.test(l.trim())).join('\n').trim();
      const body = { weekStart: week, ...form, wins: clean(form.wins), impact: clean(form.impact) };
      if (!body.wins) {
        setError('Bu hafta yaptıklarını en az bir cümleyle yaz.');
        setStep(0);
        return;
      }
      const { entry } = await api<{ entry: Entry }>('/api/entries', { method: 'PUT', body });
      const d = await api<EntriesResponse>('/api/entries');
      haptic('success');
      setSaved({ entry, streak: d.stats.streak, total: d.stats.total });
      refresh();
    } catch (e: any) {
      setError(e.message);
      haptic('warning');
    } finally {
      setSaving(false);
    }
  }

  if (saved) return <Saved data={saved} pro={!!user?.pro} />;

  const current = STEPS[step];
  const canNext = step !== 0 || form.wins.trim().length > 2;
  const isLast = step === STEPS.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={styles.top}>
          <Pressy onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="close" size={22} color={C.ink} />
          </Pressy>
          <Pressy onPress={() => weeks.length > 1 && setWeekPicker(!weekPicker)} feedback="select" style={styles.weekBtn}>
            <T v="bodyStrong">{week && meta ? weekLabel(week, meta.currentWeek) : 'Bu hafta'}</T>
            <T v="small">{week ? weekRange(week) : ''}</T>
            {weeks.length > 1 && <Ionicons name={weekPicker ? 'chevron-up' : 'chevron-down'} size={14} color={C.muted} />}
          </Pressy>
          <View style={styles.iconBtn}>
            <T v="small" style={{ fontFamily: F.bold, color: C.brand }}>{step + 1}/{STEPS.length}</T>
          </View>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <ProgressBar value={(step + 1) / STEPS.length} />
        </View>

        {weekPicker && (
          <Card style={styles.weekMenu}>
            {weeks.map((w) => (
              <Pressy key={w} onPress={() => pickWeek(w)} style={styles.weekRow} feedback="select">
                <View style={{ flex: 1 }}>
                  <T v="bodyStrong">{meta && weekLabel(w, meta.currentWeek)}</T>
                  <T v="small">{weekRange(w)}</T>
                </View>
                {meta?.entries.some((e) => e.weekStart === w) && <Ionicons name="checkmark-circle" size={18} color={C.green} />}
                {w === week && <Ionicons name="radio-button-on" size={18} color={C.brand} />}
              </Pressy>
            ))}
            {!user?.pro && (
              <T v="small" style={{ padding: 12 }}>Pro ile 8 hafta geriye kadar kayıt ekleyebilirsin.</T>
            )}
          </Card>
        )}

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fade, gap: 18 }}>
            <View style={{ gap: 6 }}>
              <T v="title">{current.title}</T>
              <T v="body" style={{ color: C.muted }}>{current.sub}</T>
            </View>

            {step === 0 && (
              <>
                <Field value={form.wins} onChange={(v) => set('wins', v)} placeholder={'Ödeme servisine retry mekanizmasını canlıya aldım\nYeni gelen iki kişinin onboarding’ini yürüttüm'} minHeight={150} inputRef={mainInput} />
                <View style={styles.chips}>
                  {STARTERS.map((s) => (
                    <Chip key={s} label={s.replace(': ', '')} icon="add" tone="neutral" onPress={() => set('wins', form.wins ? `${form.wins.trimEnd()}\n${s}` : s)} />
                  ))}
                </View>
              </>
            )}

            {step === 1 && (
              <>
                <Field value={form.impact} onChange={(v) => set('impact', v)} placeholder="Başarısız ödeme oranı %4,1 → %1,3; destek talepleri haftalık 40 → 12" minHeight={120} inputRef={mainInput} />
                <View style={styles.chips}>
                  {IMPACT_HELPERS.map((h) => (
                    <Chip key={h} label={h.trim()} tone="neutral" onPress={() => set('impact', form.impact + h)} />
                  ))}
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <View style={{ gap: 10 }}>
                  <T v="label">Kanıt linkleri</T>
                  <View style={styles.linkRow}>
                    <TextInput
                      value={linkDraft}
                      onChangeText={setLinkDraft}
                      onSubmitEditing={addLink}
                      placeholder="jira.sirket.com/browse/PAY-482"
                      placeholderTextColor={C.faint}
                      autoCapitalize="none"
                      keyboardType="url"
                      style={[styles.inlineInput, { flex: 1 }]}
                    />
                    <Pressy onPress={addLink} style={styles.addBtn}>
                      <Ionicons name="add" size={22} color={C.white} />
                    </Pressy>
                  </View>
                  {form.links.map((l) => (
                    <View key={l} style={styles.linkItem}>
                      <Ionicons name="link" size={16} color={C.brand} />
                      <T v="small" numberOfLines={1} style={{ flex: 1, color: C.text }}>{l.replace(/^https?:\/\//, '')}</T>
                      <Pressy onPress={() => set('links', form.links.filter((x) => x !== l))} hitSlop={8}>
                        <Ionicons name="close-circle" size={18} color={C.faint} />
                      </Pressy>
                    </View>
                  ))}
                </View>
                <View style={{ gap: 10 }}>
                  <T v="label">Etiketler</T>
                  <View style={styles.chips}>
                    {knownTags.map((t) => (
                      <Chip key={t} label={`#${t}`} active={form.tags.includes(t)} onPress={() => toggleTag(t)} />
                    ))}
                  </View>
                  <TextInput
                    value={tagDraft}
                    onChangeText={setTagDraft}
                    onSubmitEditing={() => {
                      const t = tagDraft.trim().toLocaleLowerCase('tr-TR').replace(/^#/, '');
                      if (t) toggleTag(t);
                      setTagDraft('');
                    }}
                    placeholder="+ yeni etiket (ör. ödeme)"
                    placeholderTextColor={C.faint}
                    style={styles.inlineInput}
                  />
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <View style={styles.moodRow}>
                  {MOODS.map((m, i) => {
                    const active = form.mood === i + 1;
                    return (
                      <Pressy key={m} onPress={() => set('mood', active ? null : i + 1)} feedback="select" style={[styles.mood, active && styles.moodActive]}>
                        <T style={{ fontSize: active ? 34 : 28 }}>{m}</T>
                      </Pressy>
                    );
                  })}
                </View>
                {!more ? (
                  <Pressy onPress={() => setMore(true)} style={styles.moreBtn} feedback="select">
                    <Ionicons name="add-circle-outline" size={20} color={C.brand} />
                    <T v="bodyStrong" style={{ color: C.brand }}>Zorluk, öğrenim ve plan ekle</T>
                    <T v="small">(isteğe bağlı)</T>
                  </Pressy>
                ) : (
                  <View style={{ gap: 12 }}>
                    <Field label="Zorluklar / engeller" value={form.challenges} onChange={(v) => set('challenges', v)} minHeight={70} />
                    <Field label="Öğrendiklerin" value={form.learnings} onChange={(v) => set('learnings', v)} minHeight={70} />
                    <Field label="Gelecek hafta odak" value={form.nextWeek} onChange={(v) => set('nextWeek', v)} minHeight={70} />
                  </View>
                )}
              </>
            )}

            <View style={styles.tip}>
              <Ionicons name="bulb" size={18} color={C.goldInk} />
              <T v="small" style={{ flex: 1, color: C.goldInk }}>{current.tip}</T>
            </View>
            {error && <T v="small" style={{ color: C.red }}>{error}</T>}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          {step > 0 && (
            <Pressy onPress={() => go(step - 1)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={C.brand} />
            </Pressy>
          )}
          <Button
            style={{ flex: 1 }}
            title={isLast ? 'Haftayı kaydet' : step === 1 && !form.impact ? 'Şimdilik atla' : 'Devam'}
            icon={isLast ? 'checkmark' : undefined}
            onPress={() => (isLast ? save() : go(step + 1))}
            loading={saving}
            disabled={!canNext || !meta}
          />
        </View>
      </KeyboardAvoidingView>

      {showIntro && (
        <View style={styles.overlay}>
          <Card style={styles.introCard}>
            <LinearGradient colors={GRADIENTS.brand} style={styles.introIcon}>
              <Ionicons name="timer-outline" size={30} color={C.white} />
            </LinearGradient>
            <T v="title" style={{ textAlign: 'center' }}>4 adım, 5 dakika</T>
            <View style={{ gap: 10, alignSelf: 'stretch' }}>
              {['Yaptıklarını madde madde yaz', 'Etkisini sayıyla ekle', 'Kanıt linki ve etiket iliştir', 'Haftayı kapat'].map((t, i) => (
                <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <View style={styles.introNum}><T v="small" style={{ color: C.brand, fontFamily: F.black }}>{i + 1}</T></View>
                  <T v="body">{t}</T>
                </View>
              ))}
            </View>
            <T v="small" style={{ textAlign: 'center' }}>Sadece ilk adım zorunlu. Gerisi raporunu güçlendirir.</T>
            <Button
              title="Anladım, başlayalım"
              style={{ alignSelf: 'stretch' }}
              onPress={() => {
                prefs.set('composerIntroSeen', true);
                setShowIntro(false);
              }}
            />
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}

function Field({ value, onChange, placeholder, minHeight = 90, label, inputRef }: { value: string; onChange: (v: string) => void; placeholder?: string; minHeight?: number; label?: string; inputRef?: React.Ref<any> }) {
  return (
    <View style={{ gap: 6 }}>
      {label && <T v="label">{label}</T>}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.faint}
        multiline
        ref={inputRef}
        spellCheck={false}
        autoCorrect={process.env.EXPO_PUBLIC_MARKETING !== '1'}
        textAlignVertical="top"
        style={[styles.field, { minHeight }]}
      />
    </View>
  );
}

function Saved({ data, pro }: { data: { entry: Entry; streak: number; total: number }; pro: boolean }) {
  const scale = useState(() => new Animated.Value(0.4))[0];
  const rise = useState(() => new Animated.Value(30))[0];
  useEffect(() => {
    const native = Platform.OS !== 'web';
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: native, bounciness: 14 }),
      Animated.timing(rise, { toValue: 0, duration: 450, useNativeDriver: native }),
    ]).start();
  }, [scale, rise]);

  // Ask for notification permission right after the first save — the moment the Friday reminder makes sense.
  useEffect(() => {
    (async () => {
      if (await prefs.get('reminderAsked', false)) return;
      await prefs.set('reminderAsked', true);
      scheduleFridayReminder(await getReminderPrefs());
    })();
  }, []);

  const milestone = [4, 8, 13, 26, 52].find((m) => m === data.total);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.body, { alignItems: 'center', paddingTop: 40 }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <LinearGradient colors={GRADIENTS.brand} style={styles.doneIcon}>
            <Ionicons name="checkmark" size={56} color={C.white} />
          </LinearGradient>
        </Animated.View>
        <Animated.View style={{ alignItems: 'center', gap: 8, transform: [{ translateY: rise }], alignSelf: 'stretch' }}>
          <T v="hero" style={{ textAlign: 'center' }}>Hafta arşivde!</T>
          <T v="body" style={{ color: C.muted, textAlign: 'center' }}>
            {milestone ? `${milestone}. haftana ulaştın. ${milestone >= 26 ? 'Terfi dosyan hazır!' : 'Harika bir seri.'}` : 'Altı ay sonraki sen teşekkür edecek.'}
          </T>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 14, alignSelf: 'stretch' }}>
            <Card style={styles.savedStat}>
              <Ionicons name="flame" size={24} color={C.flame} />
              <T v="title">{data.streak}</T>
              <T v="small">hafta seri</T>
            </Card>
            <Card style={styles.savedStat}>
              <Ionicons name="albums" size={22} color={C.brand} />
              <T v="title">{data.total}</T>
              <T v="small">toplam kayıt</T>
            </Card>
          </View>

          {pro && data.entry.aiSummary ? (
            <Card style={{ alignSelf: 'stretch', marginTop: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Ionicons name="sparkles" size={16} color={C.brand} />
                <T v="label" style={{ color: C.brand }}>AI haftalık özet</T>
                <View style={{ flex: 1 }} />
                <ProBadge small />
              </View>
              <Markdown content={data.entry.aiSummary} />
            </Card>
          ) : !pro ? (
            <Pressy onPress={() => router.replace({ pathname: '/paywall', params: { from: 'summary' } })} style={{ alignSelf: 'stretch', marginTop: 6 }}>
              <View style={[styles.teaser, SHADOW]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="sparkles" size={16} color={C.brand} />
                  <T v="label" style={{ color: C.brand }}>AI haftalık özet</T>
                  <View style={{ flex: 1 }} />
                  <ProBadge small />
                </View>
                <View style={{ gap: 8, marginTop: 12 }}>
                  {[0.92, 0.78, 0.85].map((w, i) => (
                    <View key={i} style={{ height: 10, width: `${w * 100}%`, borderRadius: 5, backgroundColor: C.lineSoft }} />
                  ))}
                </View>
                <T v="bodyStrong" style={{ color: C.brand, marginTop: 14 }}>Yöneticine hazır 3 maddelik özeti aç →</T>
              </View>
            </Pressy>
          ) : null}
        </Animated.View>
      </ScrollView>
      <View style={styles.footer}>
        <Button style={{ flex: 1 }} title="Tamam" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  weekBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.pill, backgroundColor: C.white },
  weekMenu: { position: 'absolute', top: 70, left: 20, right: 20, zIndex: 10, padding: 6 },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: R.md },
  body: { padding: 20, gap: 18, paddingBottom: 40 },
  field: { backgroundColor: C.white, borderRadius: R.lg, borderWidth: 1.5, borderColor: C.line, padding: 16, fontFamily: F.regular, fontSize: 16, lineHeight: 24, color: C.ink, outlineStyle: 'none' } as any,
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linkRow: { flexDirection: 'row', gap: 8 },
  inlineInput: { backgroundColor: C.white, borderRadius: R.md, borderWidth: 1.5, borderColor: C.line, paddingHorizontal: 14, height: 48, fontFamily: F.regular, fontSize: 15, color: C.ink, outlineStyle: 'none' } as any,
  addBtn: { width: 48, height: 48, borderRadius: R.md, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center' },
  linkItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.brandSoft, paddingHorizontal: 12, paddingVertical: 10, borderRadius: R.md },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  mood: { width: 58, height: 58, borderRadius: 18, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  moodActive: { borderColor: C.brand, backgroundColor: C.brandSoft },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderRadius: R.lg, borderWidth: 1.5, borderColor: C.line, borderStyle: 'dashed' },
  tip: { flexDirection: 'row', gap: 10, backgroundColor: C.goldSoft, padding: 14, borderRadius: R.md },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, backgroundColor: C.bg },
  backBtn: { width: 56, height: 56, borderRadius: R.lg, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,18,32,0.55)', justifyContent: 'center', padding: 24 },
  introCard: { alignItems: 'center', gap: 16, padding: 24 },
  introIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  introNum: { width: 26, height: 26, borderRadius: 9, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  doneIcon: { width: 112, height: 112, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  savedStat: { flex: 1, alignItems: 'center', gap: 2 },
  teaser: { backgroundColor: C.white, borderRadius: R.lg, padding: 18, borderWidth: 1.5, borderColor: C.brandSoft },
});
