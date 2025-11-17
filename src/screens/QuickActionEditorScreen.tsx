import React, { useState, useEffect } from 'react';
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
import { QuickActionManager } from '../utils/QuickActionManager';
import CurvedHeader from '../components/CurvedHeader';

type QuickActionEditorScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'QuickActionEditor'>;

interface QuickActionOption {
  id: string;
  title: string;
  icon: string;
  color: string;
  category: 'dcr' | 'report';
}

export default function QuickActionEditorScreen() {
  const navigation = useNavigation<QuickActionEditorScreenNavigationProp>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // All available options from DCR and Reports
  const allOptions: QuickActionOption[] = [
    // DCR Options
    {
      id: 'daily-plan',
      title: 'Daily Plan',
      icon: 'calendar-outline',
      color: '#0f766e',
      category: 'dcr',
    },
    {
      id: 'call-report',
      title: 'Call Report',
      icon: 'call-outline',
      color: '#3b82f6',
      category: 'dcr',
    },
    {
      id: 'reminder',
      title: 'Reminder',
      icon: 'alarm-outline',
      color: '#f59e0b',
      category: 'dcr',
    },
    {
      id: 'visit-plan',
      title: 'Visit Plan',
      icon: 'location-outline',
      color: '#10b981',
      category: 'dcr',
    },
    // Reports Options
    {
      id: 'plan-history',
      title: 'Plan History',
      icon: 'time-outline',
      color: '#6366f1',
      category: 'report',
    },
    {
      id: 'average-call',
      title: 'Average Call',
      icon: 'stats-chart-outline',
      color: '#f97316',
      category: 'report',
    },
    {
      id: 'visiting-history',
      title: 'Visiting History',
      icon: 'location-outline',
      color: '#06b6d4',
      category: 'report',
    },
    {
      id: 'upcoming-events',
      title: 'Upcoming Events',
      icon: 'calendar-outline',
      color: '#8b5cf6',
      category: 'report',
    },
    {
      id: 'old-reminders',
      title: 'Old Reminders',
      icon: 'archive-outline',
      color: '#ef4444',
      category: 'report',
    },
    {
      id: 'sales',
      title: 'Sales',
      icon: 'trending-up-outline',
      color: '#10b981',
      category: 'report',
    },
  ];

  useEffect(() => {
    loadSelectedItems();
  }, []);

  const loadSelectedItems = async () => {
    try {
      const saved = await QuickActionManager.getQuickActions();
      setSelectedItems(saved);
    } catch (error) {
      console.error('Error loading quick actions:', error);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        // Deselect
        return prev.filter((id) => id !== itemId);
      } else {
        // Select (max 4 items)
        if (prev.length >= 4) {
          Alert.alert('Limit Reached', 'You can select maximum 4 items for Quick Action');
          return prev;
        }
        return [...prev, itemId];
      }
    });
  };

  const handleSave = async () => {
    try {
      await QuickActionManager.saveQuickActions(selectedItems);
      Alert.alert('Success', 'Quick Action items saved successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save Quick Action items');
    }
  };

  const dcrOptions = allOptions.filter((item) => item.category === 'dcr');
  const reportOptions = allOptions.filter((item) => item.category === 'report');

  return (
    <View style={styles.container}>
      {/* Header */}
      <CurvedHeader
        title="Edit Quick Action"
        rightComponent={
          <TouchableOpacity onPress={handleSave}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Save</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#0f766e" />
          <Text style={styles.infoText}>
            Select up to 4 items to display in Quick Action. Tap an item to select/deselect.
          </Text>
        </View>

        <Text style={styles.selectedCount}>
          Selected: {selectedItems.length} / 4
        </Text>

        {/* DCR Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DCR Options</Text>
          <View style={styles.optionsGrid}>
            {dcrOptions.map((option) => {
              const isSelected = selectedItems.includes(option.id);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => toggleItem(option.id)}
                >
                  <View style={styles.optionIconContainer}>
                    <View
                      style={[
                        styles.optionIcon,
                        { backgroundColor: option.color },
                      ]}
                    >
                      <Ionicons name={option.icon as any} size={24} color="white" />
                    </View>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reports Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports Options</Text>
          <View style={styles.optionsGrid}>
            {reportOptions.map((option) => {
              const isSelected = selectedItems.includes(option.id);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => toggleItem(option.id)}
                >
                  <View style={styles.optionIconContainer}>
                    <View
                      style={[
                        styles.optionIcon,
                        { backgroundColor: option.color },
                      ]}
                    >
                      <Ionicons name={option.icon as any} size={24} color="white" />
                    </View>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionTitle}>{option.title}</Text>
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
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0f766e',
    marginLeft: 8,
    lineHeight: 20,
  },
  selectedCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionCard: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  optionIconContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
});

