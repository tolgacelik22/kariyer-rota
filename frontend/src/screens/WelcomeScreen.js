import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { COLORS } from '../constants/colors';

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Logo Fade In
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Navigate to Login after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ ...styles.content, opacity: fadeAnim }}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🧭</Text>
        </View>
        <Text style={styles.title}>Kariyer Rotası</Text>
        <Text style={styles.subtitle}>Profesyonel Diyalog Simülatörü</Text>
      </Animated.View>
      <View style={styles.footer}>
        <Text style={styles.version}>v1.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  version: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
});

export default WelcomeScreen;

