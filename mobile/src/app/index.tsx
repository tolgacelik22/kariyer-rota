import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/auth';

export default function Gate() {
  const { user, onboarded } = useAuth();
  if (user) return <Redirect href="/(tabs)" />;
  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/login" />;
}
