import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const PlatinumUpgradeModal = ({ visible, onClose, onUpgrade }) => {
  const benefits = [
    {
      icon: 'star-circle',
      title: 'Özel Simülasyon',
      desc: 'Kendi senaryonuzu yazın, kişiselleştirilmiş analiz alın'
    },
    {
      icon: 'infinity',
      title: 'Sınırsız Simülasyon',
      desc: 'Tüm senaryoları ücretsiz ve sınırsız kullanın'
    },
    {
      icon: 'chart-line',
      title: 'Detaylı İstatistikler',
      desc: 'Gelişiminizi takip edin, sektör ortalamasıyla karşılaştırın'
    },
    {
      icon: 'gift',
      title: 'Günlük 500 KR',
      desc: 'Her gün 500 coin kazanın, premium özelliklerin keyfini çıkarın'
    },
    {
      icon: 'headset',
      title: 'VIP Destek',
      desc: 'Öncelikli müşteri desteği ve özel danışmanlık'
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="crown" size={40} color={COLORS.accent} />
            </View>
            <Text style={styles.title}>PLATINUM Üyelik</Text>
            <Text style={styles.subtitle}>
              Kariyerinizde bir adım öne geçin
            </Text>
          </View>

          {/* Benefits - Compact Grid */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Neler Kazanırsınız?</Text>
            <View style={styles.benefitsGrid}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <MaterialCommunityIcons name={benefit.icon} size={20} color={COLORS.accent} />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitDesc} numberOfLines={2}>{benefit.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₺199.99</Text>
              <Text style={styles.pricePeriod}>/ Ay</Text>
            </View>
            <Text style={styles.valueText}>
              Kariyeriniz için yatırım yapın, değerinizi artırın
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={onUpgrade}
            >
              <MaterialCommunityIcons name="crown" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.upgradeButtonText}>PLATINUM'a Yükselt</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Şimdilik Hayır</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    width: width * 0.9,
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  benefitsContainer: {
    padding: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  benefitsGrid: {
    gap: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
  },
  ctaSection: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  pricePeriod: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  valueText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  upgradeButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  upgradeButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cancelButton: {
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PlatinumUpgradeModal;

