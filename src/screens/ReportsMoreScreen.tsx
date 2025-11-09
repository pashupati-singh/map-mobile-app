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

type ReportsMoreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReportsMore'>;

export default function ReportsMoreScreen() {
  const navigation = useNavigation<ReportsMoreScreenNavigationProp>();
  const [pressedId, setPressedId] = useState<string | null>(null);

  const bottomNavItems = [
    { id: 'home', title: 'Home', icon: 'home-outline', active: false },
    { id: 'report', title: 'Report', icon: 'document-outline', active: true },
    { id: 'dcr', title: 'DCR', icon: 'calendar-outline', active: false },
    { id: 'expense', title: 'Expense', icon: 'wallet-outline', active: false },
    { id: 'calendar', title: 'Calendar', icon: 'calendar-outline', active: false },
  ];

  const reportOptions = [
    {
      id: 'plan-history',
      title: 'Plan History',
      icon: 'time-outline',
      color: '#6366f1', // Indigo
      onPress: () => {
        Alert.alert('Plan History', 'Plan History functionality will be implemented');
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
      id: 'upcoming-events',
      title: 'Upcoming Events',
      icon: 'calendar-outline',
      color: '#8b5cf6', // Purple
      onPress: () => {
        Alert.alert('Upcoming Events', 'Upcoming Events functionality will be implemented');
      },
    },
    {
      id: 'old-reminders',
      title: 'Old Reminders',
      icon: 'archive-outline',
      color: '#ef4444', // Red
      onPress: () => {
        Alert.alert('Old Reminders', 'Old Reminders functionality will be implemented');
      },
    },
    {
      id: 'sales',
      title: 'Sales',
      icon: 'trending-up-outline',
      color: '#10b981', // Green
      onPress: () => {
        Alert.alert('Sales', 'Sales functionality will be implemented');
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0f766e', '#14b8a6']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

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

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomNavItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.navItem, item.active && styles.activeNavItem]}
            onPress={() => {
              if (item.id === 'home') {
                navigation.navigate('Home');
              } else if (item.id === 'report') {
                // Already on ReportsMore screen, do nothing
                return;
              } else if (item.id === 'dcr') {
                navigation.navigate('DCR');
              } else if (item.id === 'expense') {
                navigation.navigate('ExpenseOverview');
              } else if (item.id === 'calendar') {
                navigation.navigate('Calendar');
              }
            }}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={item.active ? '#FFFFFF' : '#FFFFFF'}
            />
            <Text style={[styles.navText, item.active && styles.activeNavText]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0f766e',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  navText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
  },
  activeNavText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

