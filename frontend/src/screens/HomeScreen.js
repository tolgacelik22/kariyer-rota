import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import api from '../api';
import { UserContext } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, [user.userId]);

  const fetchModules = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const params = userId ? { params: { userId } } : {};
      const response = await api.get('/modules', params);
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
      // Fallback data if server is not running for demo purposes
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level) => {
    switch(level) {
      case 1: return 'Başlangıç';
      case 2: return 'Orta';
      case 3: return 'İleri';
      default: return 'Başlangıç';
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 1: return '#10B981'; // Green
      case 2: return '#3B82F6'; // Blue
      case 3: return '#F59E0B'; // Orange/Gold
      default: return '#9CA3AF'; // Gray
    }
  };

  const renderModuleItem = ({ item }) => {
    const categoryLevel = item.categoryLevel || 1;
    const categoryProgress = item.categoryProgress;
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('Quiz', { moduleId: item.id, title: item.title })}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{item.category}</Text>
            {categoryProgress && (
              <View style={[styles.levelBadge, { backgroundColor: getLevelColor(categoryLevel) }]}>
                <Text style={styles.levelText}>Seviye {categoryLevel}</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          {categoryProgress && (
            <Text style={styles.progressText}>
              {categoryProgress.completedCount}/{categoryProgress.totalCount} modül tamamlandı
            </Text>
          )}
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={modules}
        renderItem={renderModuleItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        scrollIndicatorInsets={{ right: 1 }}
        indicatorStyle="black"
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Modül bulunamadı veya sunucuya erişilemiyor.</Text>
            <Text style={styles.retryText} onPress={fetchModules}>Tekrar Dene</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
  },
  listContent: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    flex: 1,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  levelText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  arrowContainer: {
    paddingLeft: 8,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

