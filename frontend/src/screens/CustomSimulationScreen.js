import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import { UserContext } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PlatinumUpgradeModal from '../components/PlatinumUpgradeModal';

const CustomSimulationScreen = ({ navigation }) => {
  const { user, refreshUser } = useContext(UserContext);
  const [scenario, setScenario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPlatinumModal, setShowPlatinumModal] = useState(false);
  const maxLength = 500;

  const handleSubmit = async () => {
    if (!scenario.trim()) {
      Alert.alert('Hata', 'Lütfen senaryonuzu açıklayın.');
      return;
    }

    if (scenario.length > maxLength) {
      Alert.alert('Hata', `Senaryo ${maxLength} karakterden uzun olamaz.`);
      return;
    }

    setSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await api.post('/analyze/custom', {
        userId,
        scenario: scenario.trim()
      });

      await refreshUser();
      navigation.replace('Result', { result: response.data });
    } catch (error) {
      console.error('Custom analysis error:', error);
      if (error.response && error.response.status === 403) {
        setShowPlatinumModal(true);
      } else {
        Alert.alert('Hata', 'Analiz yapılırken bir sorun oluştu.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      scrollIndicatorInsets={{ right: 1 }}
      indicatorStyle="black"
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="star-circle" size={60} color={COLORS.accent} />
        <Text style={styles.title}>Özel Simülasyon</Text>
        <Text style={styles.subtitle}>
          Yaşadığınız bir iş durumunu anlatın, size özel analiz alın.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Senaryonuzu Açıklayın</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={10}
          placeholder="Örn: Yöneticimle maaş görüşmesi yapacağım ama nasıl hazırlanmalıyım? Veya ekibimde bir çatışma var, nasıl çözmeliyim?"
          placeholderTextColor={COLORS.textLight}
          value={scenario}
          onChangeText={setScenario}
          maxLength={maxLength}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>
          {scenario.length} / {maxLength} karakter
        </Text>
      </View>

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Bu özellik sadece PLATINUM üyeler için geçerlidir. Detaylı ve kişiselleştirilmiş analiz almak için üyeliğinizi yükseltebilirsiniz.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <MaterialCommunityIcons name="robot" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.submitButtonText}>ANALİZ ET</Text>
          </>
        )}
      </TouchableOpacity>

      <PlatinumUpgradeModal
        visible={showPlatinumModal}
        onClose={() => setShowPlatinumModal(false)}
        onUpgrade={() => {
          setShowPlatinumModal(false);
          navigation.navigate('Store');
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 200,
    backgroundColor: COLORS.cardBg,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default CustomSimulationScreen;

