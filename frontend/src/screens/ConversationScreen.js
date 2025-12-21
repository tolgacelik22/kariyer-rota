import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { UserContext } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';

const ConversationScreen = ({ route, navigation }) => {
  const { conversationId } = route.params;
  const { user, refreshUser } = useContext(UserContext);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newSituation, setNewSituation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const maxLength = 500;

  useEffect(() => {
    fetchConversation();
  }, []);

  const fetchConversation = async () => {
    try {
      const response = await api.get(`/conversations/${conversationId}`);
      setConversation(response.data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      Alert.alert('Hata', 'Konuşma yüklenemedi.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!newSituation.trim()) {
      Alert.alert('Hata', 'Lütfen yeni durumu açıklayın.');
      return;
    }

    if (newSituation.length > maxLength) {
      Alert.alert('Hata', `Durum açıklaması ${maxLength} karakterden uzun olamaz.`);
      return;
    }

    setSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await api.post(`/conversations/${conversationId}/continue`, {
        userId,
        newSituation: newSituation.trim()
      });

      await refreshUser();
      // Update conversation with new step
      setConversation(prev => ({
        ...prev,
        steps: [...prev.steps, response.data.step]
      }));
      setNewSituation('');
      
      // Format result for ResultScreen
      const resultData = {
        conversationId: response.data.conversationId,
        traits: response.data.traits,
        totalScore: response.data.totalScore,
        feedback: response.data.feedback,
        actionPlan: response.data.actionPlan,
        newBalance: response.data.newBalance,
        canContinue: response.data.canContinue
      };
      
      // Show result in a modal-like way or navigate to result
      navigation.navigate('Result', { result: resultData });
    } catch (error) {
      console.error('Continue error:', error);
      if (error.response && error.response.status === 402) {
        setShowInsufficientBalance(true);
      } else {
        Alert.alert('Hata', 'Devam ederken bir sorun oluştu.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!conversation) return null;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      scrollIndicatorInsets={{ right: 1 }}
      indicatorStyle="black"
    >
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="book-open-variant" size={40} color={COLORS.primary} />
        <Text style={styles.title}>Hikaye Akışı</Text>
        <Text style={styles.subtitle}>{conversation.moduleTitle}</Text>
      </View>

      {/* Conversation Timeline */}
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineTitle}>Hikaye Adımları</Text>
        {conversation.steps.map((step, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineDot}>
              <Text style={styles.timelineNumber}>{step.stepNumber}</Text>
            </View>
            <View style={styles.timelineContent}>
              {step.type === 'continuation' && step.situation && (
                <View style={styles.situationCard}>
                  <Text style={styles.situationLabel}>Yeni Durum:</Text>
                  <Text style={styles.situationText}>{step.situation}</Text>
                </View>
              )}
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackText}>{step.feedback}</Text>
              </View>
              {step.actionPlan && step.actionPlan.length > 0 && (
                <View style={styles.actionPlanCard}>
                  <Text style={styles.actionPlanTitle}>Aksiyon Planı:</Text>
                  {step.actionPlan.map((item, idx) => (
                    <Text key={idx} style={styles.actionPlanItem}>
                      • {item.replace('🔒 ', '')}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* New Situation Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputTitle}>Hikayeyi Devam Ettir</Text>
        <Text style={styles.inputSubtitle}>
          Yeni bir durum ekleyin veya sonuçları paylaşın. Size özel öneriler alın.
        </Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={6}
          placeholder="Örn: Önerdiğiniz aksiyonları uyguladım ve sonuç şöyle oldu... Veya yeni bir zorlukla karşılaştım..."
          placeholderTextColor={COLORS.textLight}
          value={newSituation}
          onChangeText={setNewSituation}
          maxLength={maxLength}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>
          {newSituation.length} / {maxLength} karakter
        </Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity 
        style={[styles.continueButton, submitting && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <MaterialCommunityIcons name="arrow-right-circle" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.continueButtonText}>Devam Et (-{user.tier?.simCost ?? 50} KR)</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Geri Dön</Text>
      </TouchableOpacity>

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        visible={showInsufficientBalance}
        onClose={() => setShowInsufficientBalance(false)}
        onGoToStore={() => {
          setShowInsufficientBalance(false);
          navigation.navigate('Store');
        }}
        currentBalance={user.balance}
        requiredAmount={user.tier?.simCost || 50}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  timelineContainer: {
    marginBottom: 30,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineNumber: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  timelineContent: {
    flex: 1,
  },
  situationCard: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  situationLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  situationText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  feedbackCard: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  feedbackText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  actionPlanCard: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
  },
  actionPlanTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  actionPlanItem: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  inputSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 150,
    backgroundColor: COLORS.cardBg,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 8,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backButton: {
    padding: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ConversationScreen;

