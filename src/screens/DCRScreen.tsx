import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SetReminderForm } from '../forms';

interface DCRScreenProps {
  onBack: () => void;
}

export default function DCRScreen({ onBack }: DCRScreenProps) {
  const [showReminderForm, setShowReminderForm] = useState(false);

  const dailyPlanOptions = [
    { id: '1', title: 'Create Daily Plan', icon: 'add-circle-outline' },
    { id: '2', title: 'View Today\'s Plan', icon: 'today-outline' },
    { id: '3', title: 'Edit Plan', icon: 'create-outline' },
    { id: '4', title: 'Plan History', icon: 'time-outline' },
    { id: '5', title: 'Plan Templates', icon: 'copy-outline' },
    { id: '6', title: 'Plan Analytics', icon: 'analytics-outline' },
  ];

  const callReportOptions = [
    { id: '1', title: 'New Call Report', icon: 'add-circle-outline' },
    { id: '2', title: 'View Call Reports', icon: 'list-outline' },
    { id: '3', title: 'Call Statistics', icon: 'bar-chart-outline' },
    { id: '4', title: 'Call History', icon: 'time-outline' },
    { id: '5', title: 'Export Reports', icon: 'download-outline' },
    { id: '6', title: 'Call Analytics', icon: 'trending-up-outline' },
  ];

  const reminderOptions = [
    { id: '1', title: 'Set New Reminder', icon: 'add-circle-outline', action: 'setReminder' },
    { id: '2', title: 'View Reminders', icon: 'alarm-outline' },
    { id: '3', title: 'Edit Reminder', icon: 'create-outline' },
    { id: '4', title: 'Reminder History', icon: 'time-outline' },
    { id: '5', title: 'Reminder Settings', icon: 'settings-outline' },
    { id: '6', title: 'Notification Settings', icon: 'notifications-outline' },
  ];

  const handleReminderAction = (option: any) => {
    if (option.action === 'setReminder') {
      setShowReminderForm(true);
    } else {
      Alert.alert(option.title, `${option.title} functionality will be implemented`);
    }
  };

  const handleReminderSubmit = (data: any) => {
    // Handle reminder submission here
    console.log('Reminder data:', data);
    setShowReminderForm(false);
    Alert.alert('Success', 'Reminder set successfully!');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#0f766e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DCR</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Plan Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Plan</Text>
          <View style={styles.optionsContainer}>
            {dailyPlanOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => Alert.alert(option.title, `${option.title} functionality will be implemented`)}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon as any} size={24} color="#0f766e" />
                </View>
                <Text style={styles.optionText}>{option.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Call Report Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Call Report</Text>
          <View style={styles.optionsContainer}>
            {callReportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => Alert.alert(option.title, `${option.title} functionality will be implemented`)}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon as any} size={24} color="#0f766e" />
                </View>
                <Text style={styles.optionText}>{option.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Set Reminder Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set Reminder</Text>
          <View style={styles.optionsContainer}>
            {reminderOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => handleReminderAction(option)}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon as any} size={24} color="#0f766e" />
                </View>
                <Text style={styles.optionText}>{option.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Reminder Form Modal */}
      {showReminderForm && (
        <SetReminderForm
          onBack={() => setShowReminderForm(false)}
          onSubmit={handleReminderSubmit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#0f766e',
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
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  optionsContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
