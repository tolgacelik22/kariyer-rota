import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../context/UserContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';

const QuizScreen = ({ route, navigation }) => {
  const { moduleId } = route.params;
  const { user, refreshUser } = useContext(UserContext);
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);

  useEffect(() => {
    fetchModuleDetails();
    refreshUser();
  }, []);

  const fetchModuleDetails = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const params = userId ? { params: { userId } } : {};
      const response = await api.get(`/modules/${moduleId}`, params);
      setModuleData(response.data);
    } catch (error) {
      console.error('Error fetching module details:', error);
      Alert.alert('Hata', 'Modül detayları yüklenemedi.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNext = () => {
    const currentQuestion = moduleData.questions[currentQuestionIndex];
    if (!answers[currentQuestion.id]) {
      Alert.alert('Cevap Seçin', 'Lütfen bir seçenek seçin.');
      return;
    }

    if (currentQuestionIndex < moduleData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const requiredAmount = user.tier?.simCost || 50;
    if (user.balance < requiredAmount) {
      setShowInsufficientBalance(true);
      return;
    }

    // Validation
    const allAnswered = moduleData.questions.every(q => answers[q.id]);
    if (!allAnswered) {
      Alert.alert('Eksik Cevap', 'Lütfen tüm soruları cevaplayınız.');
      return;
    }

    setSubmitting(true);
    try {
      setAnalyzing(true);
      
      // Wait for 3 seconds artificial delay for "analysis" effect
      await new Promise(resolve => setTimeout(resolve, 3000));

      const userId = await AsyncStorage.getItem('userId');
      const response = await api.post('/analyze', {
        moduleId,
        answers,
        userId
      });
      // Refresh user data to get updated progress
      const updatedUser = await refreshUser();
      navigation.replace('Result', { result: response.data });
    } catch (error) {
      setAnalyzing(false);
      console.error('Analysis error:', error);
      if (error.response && error.response.status === 402) {
        setShowInsufficientBalance(true);
      } else {
        Alert.alert('Hata', 'Analiz yapılırken bir sorun oluştu.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (analyzing) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.analyzingText}>Yapay Zeka Analiz Yapıyor...</Text>
          <Text style={styles.analyzingSubText}>Cevaplarınız değerlendiriliyor ve aksiyon planınız oluşturuluyor.</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!moduleData) return null;

  const currentQuestion = moduleData.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / moduleData.questions.length;
  const isLastQuestion = currentQuestionIndex === moduleData.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <View style={styles.container}>
      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Soru {currentQuestionIndex + 1} / {moduleData.questions.length}
        </Text>
      </View>

      {/* Question Card - Onboarding Style */}
      <View style={styles.contentContainer}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionButton,
                  answers[currentQuestion.id] === opt.id && styles.optionSelected
                ]}
                onPress={() => handleOptionSelect(currentQuestion.id, opt.id)}
              >
                <View style={[
                  styles.radioCircle,
                  answers[currentQuestion.id] === opt.id && styles.radioSelected
                ]}>
                  {answers[currentQuestion.id] === opt.id && (
                    <View style={styles.radioInnerCircle} />
                  )}
                </View>
                <Text style={[
                  styles.optionText,
                  answers[currentQuestion.id] === opt.id && styles.optionTextSelected
                ]}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Footer Navigation - Onboarding Style */}
      <View style={styles.footer}>
        {!isFirstQuestion && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
            <Text style={styles.backButtonText}>Önceki</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[
            styles.nextButton,
            !answers[currentQuestion.id] && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!answers[currentQuestion.id] || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? 'Analizi Bitir' : 'Devam Et'}
              </Text>
              {!isLastQuestion && (
                <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  progressText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    lineHeight: 28,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInnerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  analyzingText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  analyzingSubText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default QuizScreen;
