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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import CurvedHeader from '../components/CurvedHeader';

type MasterListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MasterList'>;

export default function MasterListScreen() {
  const navigation = useNavigation<MasterListScreenNavigationProp>();
  const doctorOptions = [
    { id: '1', title: 'Add New Doctor', icon: 'person-add-outline' },
    { id: '2', title: 'View All Doctors', icon: 'people-outline' },
    { id: '3', title: 'Doctor Categories', icon: 'medical-outline' },
    { id: '4', title: 'Specializations', icon: 'star-outline' },
    { id: '5', title: 'Doctor Reviews', icon: 'star-half-outline' },
    { id: '6', title: 'Appointment History', icon: 'time-outline' },
  ];

  const chemistOptions = [
    { id: '1', title: 'Add New Chemist', icon: 'add-circle-outline' },
    { id: '2', title: 'View All Chemists', icon: 'business-outline' },
    { id: '3', title: 'Medicine Categories', icon: 'medical-outline' },
    { id: '4', title: 'Stock Management', icon: 'cube-outline' },
    { id: '5', title: 'Order History', icon: 'receipt-outline' },
    { id: '6', title: 'Payment Records', icon: 'card-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <CurvedHeader title="Master List" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Section */}
        <View style={styles.section}>
          {/* <Text style={styles.sectionTitle}>Doctor</Text> */}
          <View style={styles.optionsContainer}>
            {doctorOptions.map((option) => (
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

        {/* Chemist Section */}
        <View style={styles.section}>
          {/* <Text style={styles.sectionTitle}>Chemist</Text> */}
          <View style={styles.optionsContainer}>
            {chemistOptions.map((option) => (
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
