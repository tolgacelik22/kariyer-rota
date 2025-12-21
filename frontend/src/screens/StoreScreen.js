import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../context/UserContext';

const TIERS = [
  {
    id: 'BRONZE',
    name: 'BRONZE Üyelik',
    price: '₺49.99 / Ay',
    features: ['Günlük 100 KR Ödül', '%20 İndirimli Simülasyon', 'Aksiyon Planı Erişimi'],
    color: '#CD7F32',
    icon: 'medal'
  },
  {
    id: 'GOLD',
    name: 'GOLD Üyelik',
    price: '₺99.99 / Ay',
    features: ['Günlük 200 KR Ödül', '%50 İndirimli Simülasyon', 'Aksiyon Planı + Detaylı İstatistikler', 'Reklamsız Deneyim'],
    color: '#F59E0B',
    icon: 'crown'
  },
  {
    id: 'PLATINUM',
    name: 'PLATINUM Üyelik',
    price: '₺199.99 / Ay',
    features: ['Günlük 500 KR Ödül', 'ÜCRETSİZ Sınırsız Simülasyon', 'Tüm Analizler Açık', 'VIP Destek'],
    color: '#E5E7EB', // Using light gray to represent platinum/white
    textColor: '#374151',
    icon: 'diamond'
  }
];

const COIN_PACKAGES = [
  { id: 1, amount: 100, price: '₺19.99' },
  { id: 2, amount: 500, price: '₺69.99', tag: 'POPÜLER' },
  { id: 3, amount: 1000, price: '₺119.99', tag: 'AVANTAJLI' },
];

const StoreScreen = ({ navigation }) => {
  const { user, refreshUser } = useContext(UserContext);
  const [showOtherPlans, setShowOtherPlans] = React.useState(false);

  const handleBuyCoins = async (amount) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await api.post('/store/buy', { userId, amount });
      
      // Refresh user context to update balance in all screens
      await refreshUser();
      
      Alert.alert('Başarılı', `${amount} KR hesabınıza yüklendi!`);
    } catch (error) {
      console.error('Buy coins error:', error);
      Alert.alert('Hata', 'Satın alma işlemi başarısız.');
    }
  };

  const handleUpgrade = async (tierId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await api.post('/store/upgrade', { userId, targetTier: tierId });
      
      // Refresh user context to update tier in all screens
      await refreshUser();
      
      Alert.alert('Tebrikler!', `${tierId} üyeliğine geçiş yaptınız. Avantajlarınız hemen başladı.`);
    } catch (error) {
      console.error('Upgrade error:', error);
      Alert.alert('Hata', 'Üyelik yükseltme işlemi başarısız.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>KR Paketleri</Text>
      <View style={styles.coinContainer}>
        {COIN_PACKAGES.map((pkg) => (
          <TouchableOpacity key={pkg.id} style={styles.coinCard} onPress={() => handleBuyCoins(pkg.amount)}>
            {pkg.tag && <View style={styles.tag}><Text style={styles.tagText}>{pkg.tag}</Text></View>}
            <MaterialCommunityIcons name="star-circle" size={32} color={COLORS.accent} />
            <Text style={styles.coinAmount}>{pkg.amount}</Text>
            <Text style={styles.coinText}>KR</Text>
            <View style={styles.priceButton}>
              <Text style={styles.priceText}>{pkg.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Premium Üyelikler</Text>
      
      {/* Current Plan Badge */}
      <View style={styles.currentPlanContainer}>
        <Text style={styles.currentPlanLabel}>Mevcut Üyeliğiniz:</Text>
        <View style={[styles.currentPlanBadge, { backgroundColor: user.tier?.color || '#9CA3AF' }]}>
          <Text style={styles.currentPlanText}>{user.tier?.name || 'Free'}</Text>
        </View>
      </View>

      {TIERS.map((tier) => {
        const isCurrentPlan = user.tier?.id === tier.id;
        
        // Show if it's current plan OR if showOtherPlans is true
        // If user is FREE, show BRONZE as next step if showOtherPlans is false?
        // User request: "Mevcut paketim varsa onu gösterelim ve yanda küçük bir text ile diğer paketleri gör dedikten sonra diğerlerini açalım"
        
        if (!showOtherPlans && !isCurrentPlan) return null;

        return (
          <View key={tier.id} style={[styles.tierCard, { borderColor: tier.color, opacity: isCurrentPlan ? 0.8 : 1 }]}>
            <View style={[styles.tierHeader, { backgroundColor: tier.color }]}>
              <MaterialCommunityIcons name={tier.icon} size={24} color={tier.textColor || COLORS.white} />
              <Text style={[styles.tierTitle, { color: tier.textColor || COLORS.white }]}>{tier.name}</Text>
              {isCurrentPlan && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>AKTİF</Text>
                </View>
              )}
            </View>
            
            <View style={styles.tierBody}>
              {tier.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              <TouchableOpacity 
                style={[styles.upgradeButton, { backgroundColor: tier.color, opacity: isCurrentPlan ? 0.5 : 1 }]} 
                onPress={() => !isCurrentPlan && handleUpgrade(tier.id)}
                disabled={isCurrentPlan}
              >
                <Text style={[styles.upgradeButtonText, { color: tier.textColor || COLORS.white }]}>
                  {isCurrentPlan ? 'Mevcut Plan' : `${tier.price} - Yükselt`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {!showOtherPlans && (
        <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowOtherPlans(true)}>
          <Text style={styles.showMoreText}>Diğer Paketleri Gör</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}
      
      {showOtherPlans && (
        <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowOtherPlans(false)}>
          <Text style={styles.showMoreText}>Gizle</Text>
          <MaterialCommunityIcons name="chevron-up" size={20} color={COLORS.primary} />
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    marginTop: 8,
  },
  coinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  coinCard: {
    backgroundColor: COLORS.white,
    width: '31%',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    elevation: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tag: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  coinAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  coinText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  priceButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  priceText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tierCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 4,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'center',
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tierBody: {
    padding: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  upgradeButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  upgradeButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  currentPlanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
  },
  currentPlanLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 8,
  },
  currentPlanBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  currentPlanText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  activeBadgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 20,
  },
  showMoreText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default StoreScreen;

