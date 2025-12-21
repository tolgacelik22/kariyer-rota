import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserContext } from '../context/UserContext';
import PlatinumUpgradeModal from '../components/PlatinumUpgradeModal';

const DashboardScreen = ({ navigation }) => {
  const { user, loading, refreshUser } = useContext(UserContext);
  const [showPlatinumModal, setShowPlatinumModal] = useState(false);
  
  // Check if user has a name, if not redirect to name input
  useEffect(() => {
    if (!loading && user.userId && !user.name) {
      navigation.replace('NameInput', { userId: user.userId });
    }
  }, [user, loading, navigation]);
  
  // Refresh user data when screen comes into focus (e.g., after coin purchase or premium upgrade)
  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
    }, [refreshUser])
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      scrollIndicatorInsets={{ right: 1 }}
      indicatorStyle="black"
    >
      
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {user.name || 'Misafir'} 👋</Text>
          <Text style={styles.subGreeting}>Bugün kariyerin için ne yapacaksın?</Text>
        </View>
        <View style={styles.userStatus}>
           <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>{user.balance} 🪙</Text>
           </View>
           <TouchableOpacity onPress={() => navigation.navigate('Store')}>
             <View style={[styles.tierBadge, { backgroundColor: user.tier?.color || COLORS.textLight }]}>
                <Text style={styles.tierText}>{user.tier?.name || 'FREE'}</Text>
             </View>
           </TouchableOpacity>
        </View>
      </View>

      {/* Daily Tip Card */}
      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={COLORS.accent} />
          <Text style={styles.tipTitle}>Günün İpucu</Text>
        </View>
        <Text style={styles.tipText}>
          "Zorlu görüşmelerde sessizliği bir araç olarak kullanın. Karşı taraf boşluğu doldurmak için daha fazla bilgi verebilir."
        </Text>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <MaterialCommunityIcons name="chart-line-variant" size={24} color={COLORS.primary} />
          <Text style={styles.progressTitle}>Genel İlerleme</Text>
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {user.completedModulesCount || 0} / 10 Modül Tamamlandı
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(((user.completedModulesCount || 0) / 10) * 100)}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min(((user.completedModulesCount || 0) / 10) * 100, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressSubtext}>
          {user.completedModulesCount === 10 
            ? '🎉 Tüm modülleri tamamladınız! Tebrikler!'
            : `${10 - (user.completedModulesCount || 0)} modül kaldı. Devam edin!`}
        </Text>
      </View>

      {/* Main Action Section */}
      <Text style={styles.sectionTitle}>Simülasyon Merkezi</Text>
      
      <TouchableOpacity 
        style={styles.mainCard}
        onPress={() => navigation.navigate('Modules')}
      >
        <View style={styles.mainCardContent}>
          <View style={styles.mainCardTextContainer}>
            <Text style={styles.mainCardTitle}>Senaryoları Keşfet</Text>
            <Text style={styles.mainCardSubtitle}>
              10 kritik iş hayatı senaryosunda kendini sına ve analiz et.
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BAŞLA 🚀</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="map-marker-path" size={80} color="rgba(255,255,255,0.2)" style={styles.mainCardIcon} />
        </View>
      </TouchableOpacity>

      {/* Custom Simulation Card - PLATINUM Only */}
      <TouchableOpacity 
        style={[styles.customCard, user.tier?.id !== 'PLATINUM' && styles.customCardLocked]}
        onPress={() => {
          if (user.tier?.id === 'PLATINUM') {
            navigation.navigate('CustomSimulation');
          } else {
            setShowPlatinumModal(true);
          }
        }}
      >
        <View style={styles.customCardContent}>
          <View style={styles.customCardTextContainer}>
            <View style={styles.customCardHeader}>
              <MaterialCommunityIcons name="star-circle" size={24} color={user.tier?.id === 'PLATINUM' ? COLORS.accent : COLORS.textLight} />
              <Text style={styles.customCardTitle}>Özel Simülasyon</Text>
              {user.tier?.id !== 'PLATINUM' && (
                <View style={styles.platinumBadge}>
                  <Text style={styles.platinumBadgeText}>PLATINUM</Text>
                </View>
              )}
            </View>
            <Text style={styles.customCardSubtitle}>
              {user.tier?.id === 'PLATINUM' 
                ? 'Yaşadığın durumu anlat, kişiselleştirilmiş analiz al.'
                : 'Kendi senaryonu yaz, özel analiz al. (Sadece PLATINUM)'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Quick Access Grid */}
      <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
      <View style={styles.gridContainer}>
        
        <TouchableOpacity 
          style={styles.gridItem} 
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
            <MaterialCommunityIcons name="chart-bar" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.gridTitle}>Yetkinlik Haritam</Text>
          <Text style={styles.gridDesc}>Güçlü yönlerini gör</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gridItem}
          onPress={() => navigation.navigate('Store')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
            <MaterialCommunityIcons name="store" size={24} color={COLORS.success} />
          </View>
          <Text style={styles.gridTitle}>Mağaza</Text>
          <Text style={styles.gridDesc}>KR ve Üyelik</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gridItem}
          onPress={() => navigation.navigate('History')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <MaterialCommunityIcons name="book-open-variant" size={24} color={COLORS.accent} />
          </View>
          <Text style={styles.gridTitle}>Hikaye Geçmişim</Text>
          <Text style={styles.gridDesc}>Tüm hikayelerin</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gridItem}
          onPress={() => navigation.navigate('Quests')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
            <MaterialCommunityIcons name="trophy-variant" size={24} color={COLORS.accent} />
          </View>
          <Text style={styles.gridTitle}>Görevler</Text>
          <Text style={styles.gridDesc}>Ödüller kazan</Text>
        </TouchableOpacity>

      </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  balanceContainer: {
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tipCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    color: COLORS.accent,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  tipText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  mainCard: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    height: 140,
    marginBottom: 30,
    overflow: 'hidden',
    elevation: 3,
  },
  mainCardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F59E0B', 
  },
  mainCardTextContainer: {
    flex: 1,
    zIndex: 1,
  },
  mainCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 6,
  },
  mainCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 12,
  },
  mainCardIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    transform: [{ rotate: '-15deg' }],
  },
  customCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: COLORS.accent,
    elevation: 3,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  customCardLocked: {
    borderColor: '#D1D5DB',
    opacity: 0.7,
  },
  customCardContent: {
    flexDirection: 'row',
  },
  customCardTextContainer: {
    flex: 1,
  },
  customCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  platinumBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platinumBadgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  customCardSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  gridItem: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  gridDesc: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: COLORS.cardBg,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 5,
  },
  progressSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default DashboardScreen;
