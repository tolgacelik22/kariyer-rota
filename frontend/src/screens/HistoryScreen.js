import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import { UserContext } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HistoryScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await api.get(`/conversations?userId=${userId}`);
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Bugün';
    } else if (diffDays === 1) {
      return 'Dün';
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#3B82F6'; // Blue
    if (score >= 40) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
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
        <Text style={styles.title}>Hikaye Geçmişim</Text>
        <Text style={styles.subtitle}>
          {conversations.length > 0 
            ? `${conversations.length} hikaye bulundu`
            : 'Henüz hikaye yok'}
        </Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="book-open-variant" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyText}>Henüz hikaye yok</Text>
          <Text style={styles.emptySubText}>
            Simülasyonları tamamlayıp hikayelerinizi devam ettirdikçe burada görünecek.
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => navigation.navigate('Modules')}
          >
            <Text style={styles.startButtonText}>Simülasyonlara Başla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.conversationsList}>
          {conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationCard}
              onPress={() => navigation.navigate('Conversation', { conversationId: conversation.id })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <MaterialCommunityIcons 
                    name="book-open-variant" 
                    size={24} 
                    color={COLORS.primary} 
                  />
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {conversation.moduleTitle}
                    </Text>
                    <Text style={styles.cardDate}>
                      {formatDate(conversation.updatedAt)}
                    </Text>
                  </View>
                </View>
                {conversation.lastStep && (
                  <View style={[
                    styles.scoreBadge, 
                    { backgroundColor: getScoreColor(conversation.lastStep.totalScore) }
                  ]}>
                    <Text style={styles.scoreText}>
                      {Math.round(conversation.lastStep.totalScore)}
                    </Text>
                  </View>
                )}
              </View>

              {conversation.lastStep && (
                <Text style={styles.cardFeedback} numberOfLines={2}>
                  {conversation.lastStep.feedback}
                </Text>
              )}

              <View style={styles.cardFooter}>
                <View style={styles.stepInfo}>
                  <MaterialCommunityIcons 
                    name="steps" 
                    size={16} 
                    color={COLORS.textLight} 
                  />
                  <Text style={styles.stepText}>
                    {conversation.stepsCount} adım
                  </Text>
                </View>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={20} 
                  color={COLORS.textLight} 
                />
              </View>
            </TouchableOpacity>
          ))}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationsList: {
    gap: 16,
  },
  conversationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardFeedback: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBg,
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 6,
  },
});

export default HistoryScreen;

