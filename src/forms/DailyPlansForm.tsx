import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SearchComponent from '../components/SearchComponent';
import SuccessToast from '../components/SuccessToast';

interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  phone: string;
  profileImage?: string;
}

interface Chemist {
  id: string;
  name: string;
  title: string;
  shopName: string;
  phone: string;
  profileImage?: string;
}

interface DailyPlansFormProps {
  onBack: () => void;
}

export default function DailyPlansForm({ onBack }: DailyPlansFormProps) {
  const [activeTab, setActiveTab] = useState<'doctor' | 'chemist'>('doctor');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [selectedChemists, setSelectedChemists] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Sample data for doctors
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      title: 'MBBS, MD',
      specialty: 'Cardiologist',
      phone: '+1 (555) 123-4567',
      profileImage: 'https://via.placeholder.com/60x60/0f766e/ffffff?text=SJ',
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      title: 'MBBS, MS',
      specialty: 'Orthopedic Surgeon',
      phone: '+1 (555) 987-6543',
      profileImage: 'https://via.placeholder.com/60x60/ef4444/ffffff?text=MC',
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      title: 'MBBS, MD',
      specialty: 'Pediatrician',
      phone: '+1 (555) 456-7890',
      profileImage: 'https://via.placeholder.com/60x60/f59e0b/ffffff?text=ER',
    },
    {
      id: '4',
      name: 'Dr. David Wilson',
      title: 'MBBS, MD',
      specialty: 'Neurologist',
      phone: '+1 (555) 321-9876',
      profileImage: 'https://via.placeholder.com/60x60/8b5cf6/ffffff?text=DW',
    },
    {
      id: '5',
      name: 'Dr. Lisa Anderson',
      title: 'MBBS, MS',
      specialty: 'Dermatologist',
      phone: '+1 (555) 654-3210',
      profileImage: 'https://via.placeholder.com/60x60/06b6d4/ffffff?text=LA',
    },
  ];

  // Sample data for chemists
  const chemists: Chemist[] = [
    {
      id: '1',
      name: 'John Smith',
      title: 'Pharmacist',
      shopName: 'MediCare Pharmacy',
      phone: '+1 (555) 111-2222',
      profileImage: 'https://via.placeholder.com/60x60/10b981/ffffff?text=JS',
    },
    {
      id: '2',
      name: 'Maria Garcia',
      title: 'Senior Pharmacist',
      shopName: 'Health Plus Pharmacy',
      phone: '+1 (555) 333-4444',
      profileImage: 'https://via.placeholder.com/60x60/f59e0b/ffffff?text=MG',
    },
    {
      id: '3',
      name: 'Robert Brown',
      title: 'Pharmacy Manager',
      shopName: 'City Medical Store',
      phone: '+1 (555) 555-6666',
      profileImage: 'https://via.placeholder.com/60x60/ef4444/ffffff?text=RB',
    },
    {
      id: '4',
      name: 'Jennifer Lee',
      title: 'Clinical Pharmacist',
      shopName: 'Wellness Pharmacy',
      phone: '+1 (555) 777-8888',
      profileImage: 'https://via.placeholder.com/60x60/8b5cf6/ffffff?text=JL',
    },
    {
      id: '5',
      name: 'Ahmed Hassan',
      title: 'Pharmacist',
      shopName: 'Family Care Pharmacy',
      phone: '+1 (555) 999-0000',
      profileImage: 'https://via.placeholder.com/60x60/06b6d4/ffffff?text=AH',
    },
  ];

  const toggleSelection = (id: string) => {
    if (activeTab === 'doctor') {
      setSelectedDoctors(prev => 
        prev.includes(id) 
          ? prev.filter(doctorId => doctorId !== id)
          : [...prev, id]
      );
    } else {
      setSelectedChemists(prev => 
        prev.includes(id) 
          ? prev.filter(chemistId => chemistId !== id)
          : [...prev, id]
      );
    }
  };

  const getSelectedCount = () => {
    return activeTab === 'doctor' ? selectedDoctors.length : selectedChemists.length;
  };

  const handleSave = () => {
    setShowSuccessModal(true);
  };

  const handleSuccessSave = () => {
    setShowSuccessModal(false);
    setShowToast(true);
  };

  const handleToastHide = () => {
    setShowToast(false);
    onBack();
  };

  const getSelectedItems = () => {
    const selectedItems: any[] = [];
    
    selectedDoctors.forEach(id => {
      const doctor = doctors.find(d => d.id === id);
      if (doctor) selectedItems.push({ ...doctor, type: 'Doctor' });
    });
    
    selectedChemists.forEach(id => {
      const chemist = chemists.find(c => c.id === id);
      if (chemist) selectedItems.push({ ...chemist, type: 'Chemist' });
    });
    
    return selectedItems;
  };

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#f8fafc']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Plans</Text>
        <TouchableOpacity 
          style={styles.searchIconButton}
          onPress={() => setShowSearch(true)}
        >
          <Ionicons name="search" size={24} color="#0f766e" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'doctor' && styles.activeTab]}
          onPress={() => setActiveTab('doctor')}
        >
          <Text style={[styles.tabText, activeTab === 'doctor' && styles.activeTabText]}>
            Doctor {selectedDoctors.length > 0 && `(${selectedDoctors.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chemist' && styles.activeTab]}
          onPress={() => setActiveTab('chemist')}
        >
          <Text style={[styles.tabText, activeTab === 'chemist' && styles.activeTabText]}>
            Chemist {selectedChemists.length > 0 && `(${selectedChemists.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {(activeTab === 'doctor' ? doctors : chemists).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.listItem}
            onPress={() => toggleSelection(item.id)}
          >
            <View style={styles.listItemLeft}>
              {item.profileImage ? (
                <Image source={{ uri: item.profileImage }} style={styles.listImage} />
              ) : (
                <View style={styles.defaultListImage}>
                  <Ionicons name="person" size={24} color="#6b7280" />
                </View>
              )}
              <View style={styles.listItemInfo}>
                <Text style={styles.listItemName}>{item.name}</Text>
                <Text style={styles.listItemTitle}>
                  {item.title} • {activeTab === 'doctor' 
                    ? (item as Doctor).specialty 
                    : (item as Chemist).shopName
                  }
                </Text>
              </View>
            </View>
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox,
                ((activeTab === 'doctor' && selectedDoctors.includes(item.id)) ||
                 (activeTab === 'chemist' && selectedChemists.includes(item.id))) && styles.checkboxChecked
              ]}>
                {((activeTab === 'doctor' && selectedDoctors.includes(item.id)) ||
                  (activeTab === 'chemist' && selectedChemists.includes(item.id))) && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient
            colors={['#0f766e', '#14b8a6']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Search Component */}
      <SearchComponent
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        title={`Search ${activeTab === 'doctor' ? 'Doctors' : 'Chemists'}`}
        items={activeTab === 'doctor' ? doctors : chemists}
        selectedItems={activeTab === 'doctor' ? selectedDoctors : selectedChemists}
        onItemSelect={toggleSelection}
        searchPlaceholder={`Search ${activeTab === 'doctor' ? 'doctors' : 'chemists'}`}
      />

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selected Items</Text>
              <TouchableOpacity onPress={() => setShowSuccessModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {getSelectedItems().map((item, index) => (
                <View key={index} style={styles.modalItem}>
                  <View style={styles.modalItemLeft}>
                    {item.profileImage ? (
                      <Image source={{ uri: item.profileImage }} style={styles.modalImage} />
                    ) : (
                      <View style={styles.defaultModalImage}>
                        <Ionicons name="person" size={20} color="#6b7280" />
                      </View>
                    )}
                    <View style={styles.modalItemInfo}>
                      <Text style={styles.modalItemName}>{item.name}</Text>
                      <Text style={styles.modalItemTitle}>{item.title}</Text>
                      <Text style={styles.modalItemType}>{item.type}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.modalSaveButton} onPress={handleSuccessSave}>
              <LinearGradient
                colors={['#0f766e', '#14b8a6']}
                style={styles.modalSaveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SuccessToast
        visible={showToast}
        message="Daily plan created successfully!"
        onHide={handleToastHide}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchIconButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#0f766e',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  defaultListImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  listItemTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    maxHeight: 400,
    padding: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  defaultModalImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  modalItemTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  modalItemType: {
    fontSize: 12,
    color: '#0f766e',
    fontWeight: '600',
  },
  modalSaveButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSaveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
