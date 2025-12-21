import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: 1,
    title: "Senaryoları Keşfet",
    description: "İş hayatında karşılaşabileceğin 10 kritik durumu simüle et. Maaş pazarlığından ekip yönetimine kadar her şeye hazır ol.",
    icon: "map-search-outline"
  },
  {
    id: 2,
    title: "Kararlarını Ver",
    description: "Her senaryoda karşına çıkan soruları yanıtla. Stratejik düşün ve en doğru hamleyi yap.",
    icon: "checkbox-marked-circle-outline"
  },
  {
    id: 3,
    title: "AI Analizi Al",
    description: "Yapay zeka destekli analiz ile güçlü ve zayıf yönlerini gör. Kişisel aksiyon planınla kariyerinde yüksel.",
    icon: "robot-happy-outline"
  }
];

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = async () => {
    if (currentStep < ONBOARDING_DATA.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingSeen', 'true');
      navigation.replace('Dashboard');
    } catch (error) {
      console.error("Error saving onboarding status", error);
      navigation.replace('Dashboard');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={ONBOARDING_DATA[currentStep].icon} 
            size={100} 
            color={COLORS.primary} 
          />
        </View>
        <Text style={styles.title}>{ONBOARDING_DATA[currentStep].title}</Text>
        <Text style={styles.description}>{ONBOARDING_DATA[currentStep].description}</Text>
        
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {ONBOARDING_DATA.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                index === currentStep ? styles.activeDot : styles.inactiveDot
              ]} 
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {currentStep < ONBOARDING_DATA.length - 1 && (
          <TouchableOpacity onPress={completeOnboarding} style={styles.skipButton}>
            <Text style={styles.skipText}>Atla</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextText}>
            {currentStep === ONBOARDING_DATA.length - 1 ? "Başla 🚀" : "Devam Et"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#E0E7FF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 40,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    width: 30,
    backgroundColor: COLORS.accent,
  },
  inactiveDot: {
    width: 10,
    backgroundColor: '#D1D5DB',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 15,
  },
  skipText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flex: 1,
    marginLeft: 20,
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;

