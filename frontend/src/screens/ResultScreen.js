import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { UserContext } from '../context/UserContext';
import QuestCompletedModal from '../components/QuestCompletedModal';

const ResultScreen = ({ route, navigation }) => {
  const { result } = route.params;
  const { user } = useContext(UserContext);
  const [showQuestModal, setShowQuestModal] = useState(false);
  
  // Show quest completion modal if quest rewards exist
  useEffect(() => {
    if (result.questRewards && result.questRewards.length > 0) {
      setShowQuestModal(true);
    }
  }, [result.questRewards]);
  
  // QuizScreen already refreshes user data after analysis
  // No need to refresh here to avoid duplicate API calls

  return (
    <>
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      scrollIndicatorInsets={{ right: 1 }}
      indicatorStyle="black"
    >
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreTitle}>Genel Skor</Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{Math.round(result.totalScore)}</Text>
        </View>
        {result.newBalance !== undefined && (
           <Text style={styles.balanceInfo}>Kalan KR: {result.newBalance}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Analizi</Text>
        <View style={styles.card}>
          <Text style={styles.feedbackText}>{result.feedback}</Text>
        </View>
      </View>

      {result.advancedStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Detaylı İstatistikler (Premium)</Text>
          <View style={styles.card}>
            <Text style={styles.statText}>📊 {result.advancedStats.percentile}</Text>
            <Text style={styles.statText}>📈 {result.advancedStats.marketComparison}</Text>
            <Text style={styles.statText}>🎯 Sonraki Adım: {result.advancedStats.nextLevelRequirement}</Text>
          </View>
        </View>
      )}
      
      {!result.advancedStats && user.tier?.canSeeAdvancedStats === false && (
         <View style={styles.section}>
           <TouchableOpacity style={styles.lockedCard} onPress={() => navigation.navigate('Store')}>
             <Text style={styles.lockedText}>🔒 Detaylı İstatistikleri Gör (Premium)</Text>
           </TouchableOpacity>
         </View>
      )}

      {result.traits && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Öne Çıkan Yetkinlikler</Text>
          <View style={styles.traitsContainer}>
            {Object.entries(result.traits).map(([trait, score]) => (
              <View key={trait} style={styles.traitBadge}>
                <Text style={styles.traitText}>{trait.charAt(0).toUpperCase() + trait.slice(1)}: {score}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aksiyon Planı</Text>
        <View style={styles.card}>
          {result.actionPlan.map((item, index) => (
            <View key={index} style={styles.actionItem}>
              <Text style={styles.actionBullet}>•</Text>
              <Text style={styles.actionText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {result.conversationId && result.canContinue && (
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => navigation.navigate('Conversation', { conversationId: result.conversationId })}
          >
            <Text style={styles.continueButtonText}>📖 Hikayeyi Devam Ettir</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.homeButtonText}>ANA MENÜYE DÖN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

    {/* Quest Completion Modal */}
    <QuestCompletedModal
      visible={showQuestModal}
      onClose={() => setShowQuestModal(false)}
      questRewards={result.questRewards || []}
    />
    </>
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
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreTitle: {
    fontSize: 18,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  balanceInfo: {
    color: COLORS.accent,
    fontWeight: 'bold',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  feedbackText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  statText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  lockedCard: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  lockedText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  traitBadge: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  traitText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionBullet: {
    fontSize: 20,
    color: COLORS.accent,
    marginRight: 10,
    marginTop: -2,
  },
  actionText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 12,
  },
  continueButton: {
    backgroundColor: COLORS.accent,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResultScreen;
