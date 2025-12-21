import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import NameInputScreen from './src/screens/NameInputScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HomeScreen from './src/screens/HomeScreen'; // This is now the "Modules List"
import QuizScreen from './src/screens/QuizScreen';
import ResultScreen from './src/screens/ResultScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StoreScreen from './src/screens/StoreScreen';
import CustomSimulationScreen from './src/screens/CustomSimulationScreen';
import ConversationScreen from './src/screens/ConversationScreen';
import QuestsScreen from './src/screens/QuestsScreen';
import { COLORS } from './src/constants/colors';
import { UserProvider } from './src/context/UserContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerStyle: {
                backgroundColor: COLORS.primary,
              },
              headerTintColor: COLORS.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="NameInput" 
              component={NameInputScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen} 
              options={{ 
                title: 'Kariyer Rotası',
                headerLeft: null, // Disable back button to login
              }}
            />
            <Stack.Screen 
              name="Modules" 
              component={HomeScreen} 
              options={{ title: 'Senaryolar' }}
            />
            <Stack.Screen 
              name="Quiz" 
              component={QuizScreen} 
              options={({ route }) => ({ title: route.params.title })}
            />
            <Stack.Screen 
              name="Result" 
              component={ResultScreen} 
              options={{ title: 'Analiz Sonucu' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ title: 'Profilim' }}
            />
            <Stack.Screen 
              name="History" 
              component={HistoryScreen} 
              options={{ title: 'Geçmiş' }}
            />
            <Stack.Screen 
              name="Store" 
              component={StoreScreen} 
              options={{ title: 'Mağaza & Premium' }}
            />
            <Stack.Screen 
              name="CustomSimulation" 
              component={CustomSimulationScreen} 
              options={{ title: 'Özel Simülasyon' }}
            />
            <Stack.Screen 
              name="Conversation" 
              component={ConversationScreen} 
              options={{ title: 'Hikaye Akışı' }}
            />
            <Stack.Screen 
              name="Quests" 
              component={QuestsScreen} 
              options={{ title: 'Görevler' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </UserProvider>
  );
}
