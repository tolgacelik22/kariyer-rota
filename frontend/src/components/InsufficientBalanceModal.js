import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const InsufficientBalanceModal = ({ visible, onClose, onGoToStore, currentBalance, requiredAmount }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="wallet-outline" size={64} color={COLORS.accent} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Yetersiz Bakiye</Text>

          {/* Balance Info */}
          <View style={styles.balanceContainer}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Mevcut KR:</Text>
              <Text style={styles.balanceValue}>{currentBalance || 0} 💰</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Gerekli KR:</Text>
              <Text style={[styles.balanceValue, styles.requiredAmount]}>{requiredAmount || 50} 💰</Text>
            </View>
          </View>

          {/* Message */}
          <Text style={styles.message}>
            Bu işlemi gerçekleştirmek için yeterli coininiz bulunmamaktadır.
            {'\n\n'}
            Mağazadan coin satın alarak devam edebilirsiniz.
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.accent} />
              <Text style={styles.benefitText}>Anında coin yüklemesi</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.accent} />
              <Text style={styles.benefitText}>Özel paket fırsatları</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.accent} />
              <Text style={styles.benefitText}>Premium üyelik avantajları</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.storeButton}
              onPress={onGoToStore}
            >
              <MaterialCommunityIcons name="store" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.storeButtonText}>Mağazaya Git</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  balanceContainer: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  requiredAmount: {
    color: '#EF4444',
  },
  message: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  storeButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  storeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
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

export default InsufficientBalanceModal;

