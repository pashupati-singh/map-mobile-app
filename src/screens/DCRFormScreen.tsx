import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  phone: string;
  profileImage: string;
}

interface Chemist {
  id: string;
  name: string;
  title: string;
  shopName: string;
  phone: string;
  profileImage: string;
}

interface Product {
  id: string;
  name: string;
  type: string;
  salt: string;
}

interface DCRFormData {
  selectedPerson: Doctor | Chemist | null;
  personType: 'doctor' | 'chemist' | null;
  date: Date;
  startTime: Date;
  endTime: Date;
  meetingType: 'ABM' | 'MR';
  managerName: string;
  selectedProducts: Product[];
  remarks: string;
}

interface DCRFormScreenProps {
  onBack: () => void;
}

export default function DCRFormScreen({ onBack }: DCRFormScreenProps) {
  const [formData, setFormData] = useState<DCRFormData>({
    selectedPerson: null,
    personType: null,
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    meetingType: 'MR',
    managerName: 'John Smith (Manager)', // Auto-filled dummy data
    selectedProducts: [],
    remarks: '',
  });

  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for doctors and chemists
  const doctorsData: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      title: 'MBBS, MD',
      specialty: 'Cardiologist',
      phone: '+1 (555) 123-4567',
      profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      title: 'MBBS, MS',
      specialty: 'Orthopedic Surgeon',
      phone: '+1 (555) 234-5678',
      profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      title: 'MBBS, MD',
      specialty: 'Pediatrician',
      phone: '+1 (555) 345-6789',
      profileImage: 'https://images.unsplash.com/photo-1594824388852-7b4b1b5b5b5b?w=150&h=150&fit=crop&crop=face',
    },
  ];

  const chemistsData: Chemist[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      title: 'B.Pharm',
      shopName: 'Kumar Medical Store',
      phone: '+91 98765 43210',
      profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      title: 'M.Pharm',
      shopName: 'Sharma Pharmacy',
      phone: '+91 98765 43211',
      profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '3',
      name: 'Amit Patel',
      title: 'B.Pharm',
      shopName: 'Patel Medical Center',
      phone: '+91 98765 43212',
      profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
    },
  ];

  const productsData: Product[] = [
    { id: '1', name: 'CardioMax', type: 'Tablet', salt: 'Amlodipine 5mg' },
    { id: '2', name: 'HeartGuard', type: 'Capsule', salt: 'Atorvastatin 20mg' },
    { id: '3', name: 'BloodFlow', type: 'Syrup', salt: 'Aspirin 75mg' },
    { id: '4', name: 'NeuroPlus', type: 'Tablet', salt: 'Donepezil 5mg' },
    { id: '5', name: 'DiabCare', type: 'Capsule', salt: 'Metformin 500mg' },
  ];

  const allPersons = [...doctorsData, ...chemistsData];
  const filteredPersons = allPersons.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ('specialty' in person ? person.specialty : person.shopName).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePersonSelect = (person: Doctor | Chemist) => {
    setFormData(prev => ({
      ...prev,
      selectedPerson: person,
      personType: 'specialty' in person ? 'doctor' : 'chemist',
    }));
    setShowPersonModal(false);
    setSearchQuery('');
  };

  const handleProductSelect = (product: Product) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.some(p => p.id === product.id)
        ? prev.selectedProducts.filter(p => p.id !== product.id)
        : [...prev.selectedProducts, product],
    }));
  };

  const removeProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter(p => p.id !== productId),
    }));
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSubmit = () => {
    if (!formData.selectedPerson) {
      Alert.alert('Error', 'Please select a doctor or chemist');
      return;
    }
    if (formData.selectedProducts.length === 0) {
      Alert.alert('Error', 'Please select at least one product');
      return;
    }

    // Dismiss keyboard before showing preview
    Keyboard.dismiss();
    setShowPreview(true);
  };

  const handleContinue = () => {
    setShowPreview(false);
    Alert.alert(
      'Success',
      'Call reported successfully!',
      [
        {
          text: 'OK',
          onPress: () => onBack(),
        },
      ]
    );
  };

  const renderPersonItem = ({ item }: { item: Doctor | Chemist }) => (
    <TouchableOpacity
      style={styles.personItem}
      onPress={() => handlePersonSelect(item)}
    >
      <Image source={{ uri: item.profileImage }} style={styles.personImage} />
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.name}</Text>
        <Text style={styles.personTitle}>{item.title}</Text>
        <Text style={styles.personSpecialty}>
          {'specialty' in item ? item.specialty : item.shopName}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.productItem,
        formData.selectedProducts.some(p => p.id === item.id) && styles.selectedProduct,
      ]}
      onPress={() => handleProductSelect(item)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productType}>{item.type} - {item.salt}</Text>
      </View>
      {formData.selectedProducts.some(p => p.id === item.id) && (
        <Ionicons name="checkmark-circle" size={24} color="#0f766e" />
      )}
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f766e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Call Reporting</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Person Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Doctor/Chemist *</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowPersonModal(true)}
          >
            <Text style={[
              styles.inputText,
              !formData.selectedPerson && styles.placeholderText
            ]}>
              {formData.selectedPerson 
                ? `${formData.selectedPerson.name} (${formData.personType === 'doctor' ? 'Doctor' : 'Chemist'})`
                : 'Tap to select doctor or chemist'
              }
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Date Selection - Locked to today */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.disabledInputContainer}>
            <Text style={styles.disabledInputText}>{formatDate(formData.date)}</Text>
            <Ionicons name="lock-closed" size={16} color="#9ca3af" />
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.timeRow}>
          <View style={styles.timeContainer}>
            <Text style={styles.label}>Start Time *</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.inputText}>{formatTime(formData.startTime)}</Text>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.label}>End Time *</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.inputText}>{formatTime(formData.endTime)}</Text>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Manager Name - Auto-filled and non-editable */}
        <View style={styles.section}>
          <Text style={styles.label}>Manager/ABM Name</Text>
          <View style={styles.disabledInputContainer}>
            <Text style={styles.disabledInputText}>{formData.managerName}</Text>
            <Ionicons name="lock-closed" size={16} color="#9ca3af" />
          </View>
        </View>

        {/* Product Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Products *</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowProductModal(true)}
          >
            <Text style={[
              styles.inputText,
              formData.selectedProducts.length === 0 && styles.placeholderText
            ]}>
              {formData.selectedProducts.length === 0 
                ? 'Tap to select products'
                : `${formData.selectedProducts.length} product(s) selected`
              }
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* Selected Products */}
          {formData.selectedProducts.length > 0 && (
            <View style={styles.selectedProductsContainer}>
              {formData.selectedProducts.map((product) => (
                <View key={product.id} style={styles.selectedProductItem}>
                  <Text style={styles.selectedProductText}>{product.name}</Text>
                  <TouchableOpacity onPress={() => removeProduct(product.id)}>
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Remarks */}
        <View style={styles.section}>
          <Text style={styles.label}>Remarks</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter any additional remarks..."
            placeholderTextColor="#9ca3af"
            value={formData.remarks}
            onChangeText={(text) => setFormData(prev => ({ ...prev, remarks: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Report</Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Person Selection Modal */}
      <Modal
        visible={showPersonModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPersonModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Doctor/Chemist</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors or chemists..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredPersons}
            renderItem={renderPersonItem}
            keyExtractor={(item) => `${item.id}-${'specialty' in item ? 'doctor' : 'chemist'}`}
            style={styles.personList}
          />
        </View>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Products</Text>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={productsData}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            style={styles.productList}
          />
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPreview(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Preview</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.previewContent}>
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Person:</Text>
              <Text style={styles.previewValue}>
                {formData.selectedPerson?.name} ({formData.personType === 'doctor' ? 'Doctor' : 'Chemist'})
              </Text>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Date:</Text>
              <Text style={styles.previewValue}>{formatDate(formData.date)}</Text>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Time:</Text>
              <Text style={styles.previewValue}>
                {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
              </Text>
            </View>


            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Manager:</Text>
              <Text style={styles.previewValue}>{formData.managerName}</Text>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Products:</Text>
              {formData.selectedProducts.map((product, index) => (
                <Text key={index} style={styles.previewValue}>
                  • {product.name} ({product.type})
                </Text>
              ))}
            </View>

            {formData.remarks && (
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Remarks:</Text>
                <Text style={styles.previewValue}>{formData.remarks}</Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Time Pickers */}
      {showStartTimePicker && (
        <DateTimePicker
          value={formData.startTime}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowStartTimePicker(false);
            if (selectedTime) {
              setFormData(prev => ({ ...prev, startTime: selectedTime }));
            }
          }}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={formData.endTime}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowEndTimePicker(false);
            if (selectedTime) {
              setFormData(prev => ({ ...prev, endTime: selectedTime }));
            }
          }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  inputText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  textInput: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
    color: '#374151',
    minHeight: 100,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeContainer: {
    flex: 1,
    marginRight: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#0f766e',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeToggleText: {
    color: 'white',
  },
  selectedProductsContainer: {
    marginTop: 12,
  },
  selectedProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  selectedProductText: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#0f766e',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalDoneText: {
    fontSize: 16,
    color: '#0f766e',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  personList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  personImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  personTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  personSpecialty: {
    fontSize: 12,
    color: '#9ca3af',
  },
  productList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedProduct: {
    backgroundColor: '#f0fdfa',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  productType: {
    fontSize: 14,
    color: '#6b7280',
  },
  previewContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewSection: {
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  continueButton: {
    backgroundColor: '#0f766e',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  disabledInputText: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
  },
});
