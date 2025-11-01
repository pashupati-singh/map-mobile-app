import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReportsScreenProps {
  onBack: () => void;
}

export default function ReportsScreen({ onBack }: ReportsScreenProps) {
  const callReportOptions = [
    { id: '1', title: 'Generate Call Report', icon: 'add-circle-outline' },
    { id: '2', title: 'View All Call Reports', icon: 'list-outline' },
    { id: '3', title: 'Call Report Analytics', icon: 'analytics-outline' },
    { id: '4', title: 'Export Call Reports', icon: 'download-outline' },
    { id: '5', title: 'Call Report Templates', icon: 'copy-outline' },
    { id: '6', title: 'Call Performance Metrics', icon: 'trending-up-outline' },
  ];

  const dailyPlanReportOptions = [
    { id: '1', title: 'Generate Daily Plan Report', icon: 'add-circle-outline' },
    { id: '2', title: 'View Daily Plan Reports', icon: 'list-outline' },
    { id: '3', title: 'Plan Completion Analytics', icon: 'analytics-outline' },
    { id: '4', title: 'Export Plan Reports', icon: 'download-outline' },
    { id: '5', title: 'Plan Report Templates', icon: 'copy-outline' },
    { id: '6', title: 'Plan Performance Metrics', icon: 'trending-up-outline' },
  ];

  const viewAllOptions = [
    { id: '1', title: 'All Reports Dashboard', icon: 'grid-outline' },
    { id: '2', title: 'Report Categories', icon: 'folder-outline' },
    { id: '3', title: 'Report Filters', icon: 'funnel-outline' },
    { id: '4', title: 'Report Search', icon: 'search-outline' },
    { id: '5', title: 'Report Settings', icon: 'settings-outline' },
    { id: '6', title: 'Report Notifications', icon: 'notifications-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#0f766e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Daily Plan Report Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Plan Report</Text>
          <View style={styles.optionsContainer}>
            {dailyPlanReportOptions.map((option) => (
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

        {/* View All Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>View All</Text>
          <View style={styles.optionsContainer}>
            {viewAllOptions.map((option) => (
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
