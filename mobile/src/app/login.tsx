import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Ambient, Button, haptic, Pressy, T } from '@/components/ui';
import { C, F, R } from '@/constants/theme';
import { api, API_URL, User } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const { signIn } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [kvkk, setKvkk] = useState(false);
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<any>(null);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function requestCode() {
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ devCode?: string }>('/api/auth/code', {
        method: 'POST',
        body: { email: email.trim(), kvkkAccepted: kvkk, platform: Platform.OS },
      });
      setDevCode(res.devCode || null);
      setStep('code');
      setCode('');
      setCooldown(30);
      setTimeout(() => codeRef.current?.focus(), 300);
    } catch (e: any) {
      setError(e.message);
      haptic('warning');
    } finally {
      setBusy(false);
    }
  }

  async function verify(value = code) {
    if (value.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ token: string; user: User }>('/api/auth/code/verify', { method: 'POST', body: { email: email.trim(), code: value } });
      haptic('success');
      await signIn(res.token, res.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
      setCode('');
      haptic('warning');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Ambient variant="default" />
      <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, padding: 24 }}>
        {step === 'code' && (
          <Pressy onPress={() => setStep('email')} style={styles.back} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={C.ink} />
          </Pressy>
        )}
        <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
          {step === 'email' ? (
            <>
              <View style={{ gap: 10 }}>
                <T v="label" style={{ color: C.gold }}>Hoş geldin</T>
                <T v="hero">Arşivini başlat</T>
                <T v="body" style={{ color: C.muted }}>Şifre yok. E-postana 6 haneli bir giriş kodu göndereceğiz.</T>
              </View>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={20} color={C.faint} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="is@ornek.com"
                  placeholderTextColor={C.faint}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => validEmail && kvkk && requestCode()}
                  style={styles.input}
                />
              </View>
              <Pressy onPress={() => setKvkk(!kvkk)} feedback="select" style={styles.consent}>
                <View style={[styles.check, kvkk && styles.checkOn]}>{kvkk && <Ionicons name="checkmark" size={15} color={C.white} />}</View>
                <T v="small" style={{ flex: 1, color: C.text }}>
                  <T v="small" style={{ color: C.brand, fontFamily: F.bold }} onPress={() => Linking.openURL(`${API_URL}/kvkk`)}>
                    KVKK Aydınlatma Metni
                  </T>
                  ’ni okudum; kayıtlarımın raporlarım için işlenmesini ve yapay zekâ raporları için yurt dışına aktarılmasını kabul ediyorum.
                </T>
              </Pressy>
              {error && <T v="small" style={{ color: C.red }}>{error}</T>}
              <Button title="Kodu gönder" onPress={requestCode} loading={busy} disabled={!validEmail || !kvkk} />
            </>
          ) : (
            <>
              <View style={{ gap: 10 }}>
                <T v="label" style={{ color: C.gold }}>Doğrulama</T>
                <T v="hero">Kodu gir</T>
                <T v="body" style={{ color: C.muted }}>
                  <T v="bodyStrong">{email.trim()}</T> adresine gönderdik. 10 dakika geçerli.
                </T>
              </View>
              <Pressy onPress={() => codeRef.current?.focus()} feedback={null} style={{ alignSelf: 'stretch' }}>
                <View style={styles.codeRow}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <View key={i} style={[styles.codeBox, code.length === i && styles.codeBoxActive, code[i] && styles.codeBoxFilled]}>
                      <T v="title" style={{ fontSize: 26 }}>{code[i] || ''}</T>
                    </View>
                  ))}
                </View>
              </Pressy>
              <TextInput
                ref={codeRef}
                value={code}
                onChangeText={(t) => {
                  const v = t.replace(/\D/g, '').slice(0, 6);
                  setCode(v);
                  if (v.length === 6) verify(v);
                }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={6}
                style={styles.hidden}
              />
              {devCode && (
                <Pressy
                  onPress={() => {
                    setCode(devCode);
                    verify(devCode);
                  }}
                  style={styles.dev}>
                  <Ionicons name="flask-outline" size={18} color={C.goldInk} />
                  <T v="small" style={{ color: C.goldInk, flex: 1 }}>
                    Demo modu (e-posta kapalı): kodun <T v="small" style={{ fontFamily: F.black, color: C.goldInk }}>{devCode}</T> · doldurmak için dokun
                  </T>
                </Pressy>
              )}
              {error && <T v="small" style={{ color: C.red }}>{error}</T>}
              <Button title="Giriş yap" onPress={() => verify()} loading={busy} disabled={code.length !== 6} />
              <Pressy onPress={requestCode} disabled={cooldown > 0 || busy} feedback={null} style={{ alignSelf: 'center' }}>
                <T v="bodyStrong" style={{ color: cooldown ? C.faint : C.brand }}>
                  {cooldown ? `Yeni kod ${cooldown} sn sonra` : 'Kodu tekrar gönder'}
                </T>
              </Pressy>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' , borderWidth: 1, borderColor: C.line},
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: R.lg, paddingHorizontal: 16, height: 58, borderWidth: 1.5, borderColor: C.line },
  input: { flex: 1, fontFamily: F.medium, fontSize: 17, color: C.ink, height: '100%', outlineStyle: 'none' } as any,
  consent: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  check: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: C.line, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkOn: { backgroundColor: C.brand, borderColor: C.brand },
  codeRow: { flexDirection: 'row', gap: 8, width: '100%' },
  codeBox: { flex: 1, height: 62, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  codeBoxActive: { borderColor: C.brand, borderWidth: 2 },
  codeBoxFilled: { borderColor: C.brandBright },
  hidden: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  dev: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: C.goldSoft, padding: 14, borderRadius: R.md },
});
