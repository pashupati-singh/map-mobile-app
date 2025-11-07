import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { gqlFetch } from '../api/graphql';
import { CREATE_DCR_MUTATION } from '../graphql/mutation/dcr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import ButtonLoader from '../components/ButtonLoader';
import { LoginManager } from '../utils/LoginManager';
import { DCRCache } from '../utils/DCRCache';

type DCRFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DCRForm'>;
type DCRFormScreenRouteProp = RouteProp<RootStackParamList, 'DCRForm'>;

interface Product {
  id: number;
  name: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Product A' },
  { id: 2, name: 'Product B' },
  { id: 3, name: 'Product C' },
  { id: 4, name: 'Product D' },
  { id: 5, name: 'Product E' },
];

export default function DCRFormScreen() {
  const navigation = useNavigation<DCRFormScreenNavigationProp>();
  const route = useRoute<DCRFormScreenRouteProp>();
  const planData = route.params?.planData;

  const [typeOfReport, setTypeOfReport] = useState<'REMINDER' | 'CALL' | 'APPOINTMENT'>('CALL');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to submit DCR');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    }
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getSelectedProductsText = () => {
    if (selectedProducts.length === 0) {
      return 'Select Products';
    }
    if (selectedProducts.length === 1) {
      const product = MOCK_PRODUCTS.find(p => p.id === selectedProducts[0]);
      return product?.name || '1 product selected';
    }
    return `${selectedProducts.length} products selected`;
  };

  const handleSubmit = async () => {
    try {
      Keyboard.dismiss();

      if (!latitude || !longitude) {
        Alert.alert('Error', 'Location is required. Please enable location services.');
        return;
      }

      if (selectedProducts.length === 0) {
        Alert.alert('Error', 'Please select at least one product.');
        return;
      }

      setSubmitting(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        setSubmitting(false);
        return;
      }

      const userId = await LoginManager.getStoredUserId();
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        setSubmitting(false);
        return;
      }

      // Prepare mutation data
      const mutationData: any = {
        dailyPlanId: planData?.dailyPlanId || 1,
        abmId: planData?.workTogether && planData?.abmId ? planData.abmId : null,
        dailyPlanDoctorId: planData?.dailyPlanDoctorId || null,
        dailyPlanChemistId: planData?.dailyPlanChemistId || null,
        doctorCompanyId: planData?.type === 'doctor' ? planData.doctorCompanyId : null,
        chemistCompanyId: planData?.type === 'chemist' ? planData.chemistId : null,
        typeOfReport: typeOfReport,
        reportStartTime: formatTime(startTime),
        reportEndTime: formatTime(endTime),
        products: selectedProducts,
        remarks: remarks || '',
        latitude: latitude,
        longitude: longitude,
      };

      type CreateDcrResponse = {
        createDcr: {
          code: number;
          success: boolean;
          message: string;
        };
      };

      const response = await gqlFetch<CreateDcrResponse>(
        CREATE_DCR_MUTATION,
        { data: mutationData },
        token
      );

      if (response.createDcr.success) {
        // Remove the specific plan from cache
        if (planData?.id) {
          await DCRCache.removePlan(planData.id);
        }
        
        Alert.alert('Success', response.createDcr.message || 'DCR created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', response.createDcr.message || 'Failed to create DCR.');
      }
    } catch (error: any) {
      console.error('Error creating DCR:', error);
      Alert.alert('Error', error.message || 'Failed to create DCR. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#f8fafc']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Call Report</Text>
        <View style={styles.placeholder} />
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
          {/* Plan Details Card */}
          {planData && (
            <View style={styles.planCard}>
              <View style={styles.planCardHeader}>
                <Ionicons 
                  name={planData.type === 'doctor' ? 'person' : 'medical'} 
                  size={24} 
                  color="#0f766e" 
                />
                <Text style={styles.planCardTitle}>{planData.title}</Text>
              </View>
              <View style={styles.planCardInfo}>
                <Text style={styles.planCardText}>📧 {planData.email}</Text>
                <Text style={styles.planCardText}>📞 {planData.phone}</Text>
                <Text style={styles.planCardText}>🕐 {planData.time}</Text>
                <Text style={styles.planCardText}>📅 {planData.date}</Text>
              </View>
            </View>
          )}

          {/* Type Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Type *</Text>
            <TouchableOpacity
              style={styles.selectContainer}
              onPress={() => setShowTypeModal(true)}
            >
              <Text style={[
                styles.selectText,
                !typeOfReport && styles.selectPlaceholder
              ]}>
                {typeOfReport || 'Select Type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Start Time */}
          <View style={styles.section}>
            <Text style={styles.label}>Start Time *</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text style={styles.inputText}>{formatTime(startTime)}</Text>
            </TouchableOpacity>
          </View>

          {/* End Time */}
          <View style={styles.section}>
            <Text style={styles.label}>End Time *</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text style={styles.inputText}>{formatTime(endTime)}</Text>
            </TouchableOpacity>
          </View>

          {/* Products Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Products *</Text>
            <TouchableOpacity
              style={styles.selectContainer}
              onPress={() => setShowProductModal(true)}
            >
              <Text style={[
                styles.selectText,
                selectedProducts.length === 0 && styles.selectPlaceholder
              ]}>
                {getSelectedProductsText()}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Remarks */}
          <View style={styles.section}>
            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter remarks..."
              placeholderTextColor="#9ca3af"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Location Status */}
          <View style={styles.section}>
            <View style={styles.locationStatus}>
              <Ionicons 
                name={latitude && longitude ? "location" : "location-outline"} 
                size={20} 
                color={latitude && longitude ? "#10b981" : "#9ca3af"} 
              />
              <Text style={[
                styles.locationText,
                !latitude && !longitude && styles.locationTextPending
              ]}>
                {latitude && longitude 
                  ? `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                  : 'Getting location...'
                }
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting || !latitude || !longitude}
          >
            {submitting ? (
              <LinearGradient
                colors={['#0f766e', '#14b8a6']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <ButtonLoader size={20} variant="white" />
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={['#0f766e', '#14b8a6']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Time Pickers */}
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowStartTimePicker(false);
            if (selectedTime) {
              setStartTime(selectedTime);
            }
          }}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowEndTimePicker(false);
            if (selectedTime) {
              setEndTime(selectedTime);
            }
          }}
        />
      )}

      {/* Type Selection Modal */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeModal(false)}
        >
          <View style={styles.modalContentCenter} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Type</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.modalOptions}>
                {(['REMINDER', 'CALL', 'APPOINTMENT'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.modalOption,
                      typeOfReport === type && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      setTypeOfReport(type);
                      setShowTypeModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      typeOfReport === type && styles.modalOptionTextSelected
                    ]}>
                      {type}
                    </Text>
                    {typeOfReport === type && (
                      <Ionicons name="checkmark" size={20} color="#0f766e" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Products Selection Modal */}
      <Modal
        visible={showProductModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProductModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProductModal(false)}
        >
          <View style={styles.modalContentCenter} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Products</Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.modalOptions}>
                {MOCK_PRODUCTS.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={[
                      styles.modalOption,
                      selectedProducts.includes(product.id) && styles.modalOptionSelected
                    ]}
                    onPress={() => toggleProduct(product.id)}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      selectedProducts.includes(product.id) && styles.modalOptionTextSelected
                    ]}>
                      {product.name}
                    </Text>
                    {selectedProducts.includes(product.id) && (
                      <Ionicons name="checkmark" size={20} color="#0f766e" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  planCardInfo: {
    gap: 8,
  },
  planCardText: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  selectContainer: {
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
  selectText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectPlaceholder: {
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentCenter: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalOptions: {
    padding: 20,
    paddingBottom: 30,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  modalOptionSelected: {
    backgroundColor: '#f0fdfa',
    borderWidth: 2,
    borderColor: '#0f766e',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#0f766e',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 12,
  },
  inputText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#10b981',
  },
  locationTextPending: {
    color: '#9ca3af',
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 30,
    marginTop: 10,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
