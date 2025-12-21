import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { UserContext } from '../context/UserContext';

const NameInputScreen = ({ navigation, route }) => {
  const { userId: routeUserId } = route.params || {};
  const { user, refreshUser } = useContext(UserContext);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get userId from route params, user context, or AsyncStorage
  const getUserId = async () => {
    if (routeUserId) return routeUserId;
    if (user?.userId) return user.userId;
    const storedUserId = await AsyncStorage.getItem('userId');
    return storedUserId;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Hata", "Lütfen bir isim giriniz.");
      return;
    }

    if (name.trim().length > 50) {
      Alert.alert("Hata", "İsim en fazla 50 karakter olabilir.");
      return;
    }

    setLoading(true);
    try {
      // Get userId from multiple sources
      const storedUserId = await getUserId();
      if (!storedUserId) {
        Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
        setLoading(false);
        navigation.replace('Login');
        return;
      }

      // First, ensure user exists in backend by calling guest endpoint
      // This will create the user if it doesn't exist (e.g., after backend restart)
      await api.post('/auth/guest', { userId: storedUserId });
      
      // Now update the name
      const response = await api.post('/auth/update-name', {
        userId: storedUserId,
        name: name.trim()
      });

      if (response.data.success) {
        // Refresh user context to get updated name
        await refreshUser();
        
        // Check if onboarding is seen
        const onboardingSeen = await AsyncStorage.getItem('onboardingSeen');
        if (onboardingSeen === 'true') {
          navigation.replace('Dashboard');
        } else {
          navigation.replace('Onboarding');
        }
      }
    } catch (error) {
      console.error('Name Update Error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      
      let errorMessage = "İsim kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.";
      if (error.response?.status === 404 && error.response?.data?.message === "User not found") {
        errorMessage = "Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Geçersiz isim. Lütfen tekrar deneyin.";
      }
      
      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="account-circle" size={80} color={COLORS.white} />
        </View>
        <Text style={styles.welcomeText}>Hoş Geldiniz! 👋</Text>
        <Text style={styles.subText}>Size nasıl hitap edelim?</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account-outline" size={24} color={COLORS.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Adınız veya takma adınız"
            placeholderTextColor={COLORS.textLight}
            value={name}
            onChangeText={setName}
            maxLength={50}
            autoFocus={true}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>

        <Text style={styles.hintText}>
          Bu isim ana ekranda görüntülenecektir.
        </Text>

        <TouchableOpacity 
          style={[styles.submitButton, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Devam Et</Text>
              <MaterialCommunityIcons name="arrow-right" size={24} color={COLORS.white} style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 10,
    textAlign: 'center',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 16,
  },
  hintText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default NameInputScreen;

