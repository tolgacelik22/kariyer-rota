import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserContext } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const QuestsScreen = ({ navigation }) => {
  const { user, refreshUser } = useContext(UserContext);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuests = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await api.get('/quests', { params: { userId } });
      setQuests(response.data.quests || []);
    } catch (error) {
      console.error('Error fetching quests:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchQuests();
      refreshUser();
    }, [refreshUser])
  );

  const getQuestStatus = (quest) => {
    if (quest.isCompleted) {
      return { text: 'Tamamlandı', color: COLORS.success, icon: 'check-circle' };
    } else if (quest.canClaim) {
      return { text: 'Ödülü Al', color: COLORS.accent, icon: 'gift' };
    } else {
      return { text: 'Devam Ediyor', color: COLORS.textLight, icon: 'clock-outline' };
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      scrollIndicatorInsets={{ right: 1 }}
      indicatorStyle="black"
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="trophy-variant" size={50} color={COLORS.accent} />
        <Text style={styles.title}>Görevler</Text>
        <Text style={styles.subtitle}>Modülleri tamamlayarak ödüller kazanın!</Text>
      </View>

      {quests.map((quest, index) => {
        const status = getQuestStatus(quest);
        const progress = quest.progressPercentage || 0;
        
        return (
          <View key={quest.id} style={styles.questCard}>
            <View style={styles.questHeader}>
              <View style={styles.questIconContainer}>
                <Text style={styles.questIcon}>{quest.icon}</Text>
              </View>
              <View style={styles.questInfo}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questDescription}>{quest.description}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                <MaterialCommunityIcons name={status.icon} size={16} color={status.color} />
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.text}
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: quest.isCompleted ? COLORS.success : COLORS.accent
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {quest.progress} / {quest.requirement}
              </Text>
            </View>

            <View style={styles.rewardContainer}>
              <MaterialCommunityIcons name="star-circle" size={20} color={COLORS.accent} />
              <Text style={styles.rewardText}>{quest.reward} KR Ödül</Text>
            </View>

            {quest.isCompleted && (
              <View style={styles.completedBadge}>
                <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
                <Text style={styles.completedText}>Görev tamamlandı!</Text>
              </View>
            )}
          </View>
        );
      })}

      {quests.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="trophy-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyText}>Henüz görev bulunmuyor</Text>
        </View>
      )}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  questCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  questIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questIcon: {
    fontSize: 28,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.cardBg,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    marginTop: 8,
  },
  rewardText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  completedText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 16,
  },
});

export default QuestsScreen;

