import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import CurvedHeader from '../components/CurvedHeader';

type ReportsMoreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReportsMore'>;

export default function ReportsMoreScreen() {
  const navigation = useNavigation<ReportsMoreScreenNavigationProp>();
  const [pressedId, setPressedId] = useState<string | null>(null);

  const reportOptions = [
    {
      id: 'plan-history',
      title: 'Plan History',
      icon: 'time-outline',
      color: '#6366f1', // Indigo
      onPress: () => {
        navigation.navigate('PlanHistory');
      },
    },
    {
      id: 'average-call',
      title: 'Average Call',
      icon: 'stats-chart-outline',
      color: '#f97316', // Orange
      onPress: () => {
        Alert.alert('Average Call', 'Average Call functionality will be implemented');
      },
    },
    {
      id: 'visiting-history',
      title: 'Visiting History',
      icon: 'location-outline',
      color: '#06b6d4', // Cyan
      onPress: () => {
        Alert.alert('Visiting History', 'Visiting History functionality will be implemented');
      },
    },
    {
      id: 'products',
      title: 'Products',
      icon: 'cube-outline',
      color: '#ec4899', // Pink
      onPress: () => {
        navigation.navigate('Products');
      },
    },
    {
      id: 'upcoming-events',
      title: 'Upcoming Events',
      icon: 'calendar-outline',
      color: '#8b5cf6', // Purple
      onPress: () => {
        navigation.navigate('UpcomingEvents');
      },
    },
    {
      id: 'old-reminders',
      title: 'Old Reminders',
      icon: 'archive-outline',
      color: '#ef4444', // Red
      onPress: () => {
        navigation.navigate('OldReminders');
      },
    },
    {
      id: 'requested-list',
      title: 'Requested List',
      icon: 'list-circle-outline',
      color: '#10b981', // Green
      onPress: () => {
        navigation.navigate('RequestedList');
      },
    },
    {
      id: 'new-request',
      title: 'New Request',
      icon: 'document-text-outline',
      color: '#3b82f6', // Blue
      onPress: () => {
        navigation.navigate('NewRequest');
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <CurvedHeader title="Reports" />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.optionsContainer}>
          <View style={styles.serviceGrid}>
            {reportOptions.map((option) => {
              const isPressed = pressedId === option.id;
              const iconBackgroundColor = isPressed ? '#0f766e' : option.color;
              const iconColor = isPressed ? 'white' : 'white';
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={styles.serviceCard}
                  onPressIn={() => setPressedId(option.id)}
                  onPressOut={() => setPressedId(null)}
                  onPress={() => {
                    setPressedId(null);
                    option.onPress();
                  }}
                  activeOpacity={1}
                >
                  <View style={styles.serviceIconContainer}>
                    <View style={[styles.serviceIcon, { backgroundColor: iconBackgroundColor }]}>
                      <Ionicons name={option.icon as any} size={24} color={iconColor} />
                    </View>
                  </View>
                  <Text style={styles.serviceTitle}>{option.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  serviceCard: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 2,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  serviceIconContainer: {
    marginBottom: 8,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 16,
    flexWrap: 'wrap',
  },
});

