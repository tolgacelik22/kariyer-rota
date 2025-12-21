import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const QuestCompletedModal = ({ visible, onClose, questRewards }) => {
  if (!questRewards || questRewards.length === 0) {
    return null;
  }

  const totalReward = questRewards.reduce((sum, r) => sum + r.reward, 0);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>
          
          <Text style={styles.congratsText}>Tebrikler! 🎉</Text>
          <Text style={styles.subtitleText}>Görev tamamlandı!</Text>

          <View style={styles.rewardsContainer}>
            {questRewards.map((reward, index) => (
              <View key={index} style={styles.rewardItem}>
                <View style={styles.rewardIconContainer}>
                  <Text style={styles.rewardIcon}>⭐</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>{reward.questTitle}</Text>
                  <Text style={styles.rewardAmount}>+{reward.reward} KR</Text>
                </View>
              </View>
            ))}
          </View>

          {totalReward > 0 && (
            <View style={styles.totalRewardContainer}>
              <Text style={styles.totalRewardText}>Toplam Ödül: {totalReward} KR 🪙</Text>
            </View>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Harika! ✨</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  trophyIcon: {
    fontSize: 50,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  rewardsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  rewardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardIcon: {
    fontSize: 24,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  rewardAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  totalRewardContainer: {
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
  },
  totalRewardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default QuestCompletedModal;

