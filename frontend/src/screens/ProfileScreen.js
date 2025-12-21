import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { UserContext } from '../context/UserContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const { user, refreshUser } = useContext(UserContext);
  
  // Refresh user data when screen comes into focus (e.g., after coin purchase or premium upgrade)
  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
    }, [refreshUser])
  );

  const skills = user.skills || {};
  const skillEntries = Object.entries(skills);
  const hasSkills = skillEntries.length > 0;

  // Skill name translations
  const skillNames = {
    strategy: 'Stratejik Düşünme',
    confidence: 'Özgüven',
    negotiation: 'Pazarlık',
    leadership: 'Liderlik',
    communication: 'İletişim',
    teamManagement: 'Ekip Yönetimi',
    problemSolving: 'Problem Çözme',
    resilience: 'Dayanıklılık',
    adaptability: 'Uyum Sağlama',
    learning: 'Öğrenme',
    reflection: 'Öz Değerlendirme',
    achievement: 'Başarı Odaklılık',
    motivation: 'Motivasyon',
    emotionalIntelligence: 'Duygusal Zeka',
    decisionMaking: 'Karar Verme'
  };

  const getSkillLevel = (average) => {
    // Average is now on 0-100 scale
    if (average >= 80) return { level: 'Mükemmel', color: '#10B981' };
    if (average >= 60) return { level: 'İyi', color: '#3B82F6' };
    if (average >= 40) return { level: 'Orta', color: '#F59E0B' };
    return { level: 'Gelişmeli', color: '#EF4444' };
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={true}
      scrollIndicatorInsets={{ right: 1 }}
      indicatorStyle="black"
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name ? user.name.substring(0, 2).toUpperCase() : (user.userId ? user.userId.substring(5, 7).toUpperCase() : 'U')}</Text>
        </View>
        <Text style={styles.userIdText}>{user.name || `ID: ${user.userId}`}</Text>
        <View style={[styles.tierBadge, { backgroundColor: user.tier?.color || COLORS.textLight }]}>
          <Text style={styles.tierText}>{user.tier?.name || 'Free'} Üye</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.balance}</Text>
          <Text style={styles.statLabel}>KR</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.completedModulesCount || 0}/10</Text>
          <Text style={styles.statLabel}>Modül</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.tier?.simCost === 0 ? 'Sınırsız' : '-%' + (100 - (user.tier?.simCost / 50 * 100))}</Text>
          <Text style={styles.statLabel}>İndirim</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => navigation.navigate('Store')}
      >
        <MaterialCommunityIcons name="crown" size={24} color={COLORS.accent} />
        <Text style={styles.menuText}>Üyeliğimi Yükselt</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textLight} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <MaterialCommunityIcons name="cog" size={24} color={COLORS.text} />
        <Text style={styles.menuText}>Ayarlar</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textLight} />
      </TouchableOpacity>

      {/* Skills Map */}
      <View style={styles.skillsSection}>
        <Text style={styles.sectionTitle}>Yetkinlik Haritası</Text>
        {hasSkills ? (
          <View style={styles.skillsContainer}>
            {skillEntries.map(([skillKey, skillData]) => {
              const skillName = skillNames[skillKey] || skillKey;
              // Average is already on 0-100 scale
              const average100 = skillData.average || 0;
              const { level, color } = getSkillLevel(average100);
              const percentage = Math.min(average100, 100);
              
              return (
                <View key={skillKey} style={styles.skillCard}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{skillName}</Text>
                    <View style={[styles.skillLevelBadge, { backgroundColor: color }]}>
                      <Text style={styles.skillLevelText}>{level}</Text>
                    </View>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.skillScore}>Puan: {Math.round(average100)}/100</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="chart-line" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Henüz yetkinlik verisi yok</Text>
            <Text style={styles.emptySubText}>Simülasyonları tamamladıkça yetkinlikleriniz burada görünecek.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: 'bold',
  },
  userIdText: {
    color: COLORS.textLight,
    marginBottom: 8,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tierText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  skillsSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  skillsContainer: {
    gap: 12,
  },
  skillCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  skillLevelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillLevelText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.cardBg,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  skillScore: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  emptyState: {
    marginTop: 20,
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 14,
    lineHeight: 20,
  }
});

export default ProfileScreen;
