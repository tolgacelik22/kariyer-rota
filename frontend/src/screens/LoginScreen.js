import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

const LoginScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkKvkkStatus();
  }, []);

  const checkKvkkStatus = async () => {
    try {
      const accepted = await AsyncStorage.getItem('kvkkAccepted');
      if (accepted === 'true') {
        setKvkkAccepted(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGuestLogin = async () => {
    if (!kvkkAccepted) {
      Alert.alert("KVKK Onayı Gerekli", "Lütfen devam etmeden önce KVKK Aydınlatma Metni'ni onaylayınız.");
      return;
    }

    setLoading(true);
    try {
      // Get existing userId if any
      const storedUserId = await AsyncStorage.getItem('userId');
      
      // Call backend to init/get user
      const response = await api.post('/auth/guest', { userId: storedUserId });
      
      // Save userId and KVKK proof
      await AsyncStorage.setItem('userId', response.data.userId);
      await AsyncStorage.setItem('kvkkAccepted', 'true');
      
      // Check if user has a name, if not, redirect to name input screen
      if (!response.data.name) {
        navigation.replace('NameInput', { userId: response.data.userId });
        return;
      }
      
      // Check if onboarding is seen
      const onboardingSeen = await AsyncStorage.getItem('onboardingSeen');
      if (onboardingSeen === 'true') {
        navigation.replace('Dashboard');
      } else {
        navigation.replace('Onboarding');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert("Hata", "Giriş yapılırken bir sorun oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>💼</Text>
        </View>
        <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
        <Text style={styles.subText}>Kariyer yolculuğunuzda doğru kararları alın.</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Placeholder for Real Login Inputs */}
        <TouchableOpacity style={styles.disabledInput}>
          <MaterialCommunityIcons name="email-outline" size={24} color={COLORS.textLight} />
          <Text style={styles.inputText}>E-posta (Yakında)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.disabledInput}>
          <MaterialCommunityIcons name="lock-outline" size={24} color={COLORS.textLight} />
          <Text style={styles.inputText}>Şifre (Yakında)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} disabled={true}>
          <Text style={styles.loginButtonText}>GİRİŞ YAP</Text>
        </TouchableOpacity>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          <Text style={styles.socialText}>veya şununla giriş yap</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#3b5998' }]}>
              <MaterialCommunityIcons name="facebook" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#E1306C' }]}>
              <MaterialCommunityIcons name="instagram" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#DB4437' }]}>
              <MaterialCommunityIcons name="google" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>veya</Text>
          <View style={styles.divider} />
        </View>

        {/* KVKK Checkbox Area */}
        <View style={styles.kvkkContainer}>
          <TouchableOpacity onPress={() => setKvkkAccepted(!kvkkAccepted)} style={styles.checkbox}>
            {kvkkAccepted ? (
              <MaterialCommunityIcons name="checkbox-marked" size={24} color={COLORS.primary} />
            ) : (
              <MaterialCommunityIcons name="checkbox-blank-outline" size={24} color={COLORS.textLight} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.kvkkText}>
              <Text style={styles.kvkkLink}>KVKK Aydınlatma Metni</Text>'ni okudum ve onaylıyorum.
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.guestButton, loading && { opacity: 0.7 }]} 
          onPress={handleGuestLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <>
              <MaterialCommunityIcons name="account-arrow-right-outline" size={24} color={COLORS.primary} style={{ marginRight: 10 }} />
              <Text style={styles.guestButtonText}>Misafir Olarak Devam Et</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footerText}>© 2024 Kariyer Rotası</Text>

      {/* KVKK Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>KVKK Aydınlatma Metni</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>
                Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Kariyer Rotası uygulaması olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz.{'\n'}{'\n'}
                1. Veri Sorumlusu: Kariyer Rotası uygulaması.{'\n'}
                2. Kişisel Verilerin İşlenme Amacı: Uygulama içi deneyiminizi iyileştirmek, simülasyon sonuçlarını analiz etmek ve üyelik işlemlerini yönetmek.{'\n'}
                3. Verilerin Aktarılması: Verileriniz yasal zorunluluklar dışında üçüncü kişilerle paylaşılmamaktadır.{'\n'}
                4. Haklarınız: KVKK'nın 11. maddesi uyarınca veri sahibi olarak haklarınızı kullanabilirsiniz.{'\n'}{'\n'}
                Detaylı bilgi için web sitemizi ziyaret edebilirsiniz.
              </Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setKvkkAccepted(true);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Okudum, Anladım ve Onaylıyorum</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 3,
    padding: 24,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  disabledInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    opacity: 0.6,
  },
  inputText: {
    marginLeft: 12,
    color: COLORS.textLight,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: COLORS.textLight,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    opacity: 0.5,
  },
  loginButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    marginHorizontal: 16,
    color: COLORS.textLight,
  },
  guestButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 12,
    marginBottom: 24,
  },
  kvkkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    marginRight: 8,
  },
  kvkkText: {
    color: COLORS.textLight,
    fontSize: 14,
    flex: 1,
  },
  kvkkLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  socialContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  socialText: {
    color: COLORS.textLight,
    fontSize: 12,
    marginBottom: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16, // Note: gap works in newer RN versions, if not, use margins
  },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8, // Fallback for gap
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default LoginScreen;
