import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import CurvedHeader from '../components/CurvedHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { gqlFetch } from '../api/graphql';
import { CREATE_REQUEST_MUTATION } from '../graphql/mutation/request';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonLoader from '../components/ButtonLoader';

type NewRequestScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewRequest'>;

type RequestType = 'new-doctor' | 'new-chemist' | 'leaves' | 'sample-templates' | 'work-together' | 'other';

export default function NewRequestScreen() {
  const navigation = useNavigation<NewRequestScreenNavigationProp>();
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [associatedChemists, setAssociatedChemists] = useState<string[]>(['']); // For new-doctor type
  const [chemistName, setChemistName] = useState('');
  const [chemistFields, setChemistFields] = useState<Array<{ id: string; value: string }>>([{ id: '1', value: '' }]); // For new-chemist type
  const [associateDoctor, setAssociateDoctor] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [productName, setProductName] = useState('');
  const [template, setTemplate] = useState('');
  const [workTogetherDate, setWorkTogetherDate] = useState<Date | null>(null); // For work-together type
  const [showWorkTogetherDatePicker, setShowWorkTogetherDatePicker] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestTypeOptions = [
    { id: 'new-doctor', label: 'New Doctor', value: 'new-doctor' as RequestType },
    { id: 'new-chemist', label: 'New Chemist', value: 'new-chemist' as RequestType },
    { id: 'leaves', label: 'Leaves', value: 'leaves' as RequestType },
    { id: 'sample-templates', label: 'Sample Templates', value: 'sample-templates' as RequestType },
    { id: 'work-together', label: 'Work Together with Manager', value: 'work-together' as RequestType },
    { id: 'other', label: 'Other', value: 'other' as RequestType },
  ];

  const getSelectedLabel = () => {
    const selected = requestTypeOptions.find(opt => opt.value === requestType);
    return selected ? selected.label : 'Select Request Type';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const addAssociatedChemist = () => {
    setAssociatedChemists([...associatedChemists, '']);
  };

  const removeAssociatedChemist = (index: number) => {
    if (associatedChemists.length > 1) {
      const updated = associatedChemists.filter((_, i) => i !== index);
      setAssociatedChemists(updated);
    }
  };

  const updateAssociatedChemist = (index: number, value: string) => {
    const updated = [...associatedChemists];
    updated[index] = value;
    setAssociatedChemists(updated);
  };
  const addChemistField = () => {
    const newId = Date.now().toString();
    setChemistFields([...chemistFields, { id: newId, value: '' }]);
  };

  const removeChemistField = (id: string) => {
    if (chemistFields.length > 1) {
      setChemistFields(chemistFields.filter(field => field.id !== id));
    }
  };

  const updateChemistField = (id: string, value: string) => {
    setChemistFields(chemistFields.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };

  const handleSave = async () => {
    if (!requestType) {
      Alert.alert('Error', 'Please select a request type');
      return;
    }

    let isValid = true;
    let errorMessage = '';

    switch (requestType) {
      case 'new-doctor':
        if (!doctorName.trim()) {
          isValid = false;
          errorMessage = 'Please enter Doctor Name';
        } else if (associatedChemists.every(c => !c.trim())) {
          isValid = false;
          errorMessage = 'Please enter at least one Associated Chemist';
        }
        break;
      case 'new-chemist':
        if (!chemistName.trim()) {
          isValid = false;
          errorMessage = 'Please enter Chemist Name';
        } else if (chemistFields.every(f => !f.value.trim())) {
          isValid = false;
          errorMessage = 'Please fill at least one additional field';
        }
        break;
      case 'leaves':
        if (!startDate) {
          isValid = false;
          errorMessage = 'Please select Start Date';
        } else if (!endDate) {
          isValid = false;
          errorMessage = 'Please select End Date';
        }
        break;
      case 'sample-templates':
        if (!productName.trim()) {
          isValid = false;
          errorMessage = 'Please enter Product Name';
        }
        break;
      case 'work-together':
        if (!workTogetherDate) {
          isValid = false;
          errorMessage = 'Please select Date';
        }
        break;
      case 'other':
        if (!remarks.trim()) {
          isValid = false;
          errorMessage = 'Please enter Remarks';
        }
        break;
    }

    if (!isValid) {
      Alert.alert('Validation Error', errorMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        setIsSubmitting(false);
        return;
      }
      const mutationData: any = {
        requestType,
      };
      switch (requestType) {
        case 'new-doctor':
          mutationData.name = doctorName.trim();
          mutationData.associates = associatedChemists.filter(c => c.trim());
          break;
        case 'new-chemist':
          mutationData.name = chemistName.trim();
          mutationData.associates = chemistFields
            .filter(f => f.value.trim())
            .map(f => f.value.trim());
          break;
        case 'leaves':
          if (startDate) {
            mutationData.startDate = formatDate(startDate);
          }
          if (endDate) {
            mutationData.endDate = formatDate(endDate);
          }
          break;
        case 'sample-templates':
          mutationData.productName = productName.trim();
          break;
        case 'work-together':
          if (workTogetherDate) {
            mutationData.startDate = formatDate(workTogetherDate);
          }
          break;
        case 'other':
          break;
      }

      if (remarks.trim()) {
        mutationData.remark = remarks.trim();
      }

      type CreateRequestResponse = {
        createRequest: {
          code: number;
          success: boolean;
          message: string;
        };
      };

      const response = await gqlFetch<CreateRequestResponse>(
        CREATE_REQUEST_MUTATION,
        { data: mutationData },
        token
      );

      if (response.createRequest.success) {
        Alert.alert('Success', response.createRequest.message || 'Request created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setRequestType(null);
              setDoctorName('');
              setAssociatedChemists(['']);
              setChemistName('');
              setChemistFields([{ id: '1', value: '' }]);
              setAssociateDoctor('');
              setStartDate(null);
              setEndDate(null);
              setProductName('');
              setTemplate('');
              setWorkTogetherDate(null);
              setRemarks('');
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.createRequest.message || 'Failed to create request');
      }
    } catch (error: any) {
      console.error('Error creating request:', error);
      Alert.alert('Error', error.message || 'Failed to create request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setRequestType(null);
    setDoctorName('');
    setAssociatedChemists(['']);
    setChemistName('');
    setChemistFields([{ id: '1', value: '' }]);
    setAssociateDoctor('');
    setStartDate(null);
    setEndDate(null);
    setProductName('');
    setTemplate('');
    setWorkTogetherDate(null);
    setRemarks('');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <CurvedHeader
          title="New Request"
          onBack={handleBack}
          showBackButton={true}
        />
        <View style={styles.content}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Request Type</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text style={[
                  styles.selectButtonText,
                  !requestType && styles.selectButtonTextPlaceholder
                ]}>
                  {getSelectedLabel()}
                </Text>
                <Ionicons
                  name={showDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
              
              {showDropdown && (
                <View style={styles.dropdownContainer}>
                  {requestTypeOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.dropdownOption,
                        requestType === option.value && styles.dropdownOptionSelected,
                        index !== requestTypeOptions.length - 1 && styles.dropdownOptionBorder
                      ]}
                      onPress={() => {
                        setRequestType(option.value);
                        setShowDropdown(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        requestType === option.value && styles.dropdownOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {requestType === 'new-doctor' && (
              <View style={styles.section}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Doctor Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter doctor name"
                    value={doctorName}
                    onChangeText={setDoctorName}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>Associated Chemist</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={addAssociatedChemist}
                    >
                      <Ionicons name="add-circle" size={20} color="#0f766e" />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                  {associatedChemists.map((chemist, index) => (
                    <View key={index} style={styles.multiFieldRow}>
                      <TextInput
                        style={[styles.input, styles.multiFieldInput]}
                        placeholder={`Enter chemist name ${index + 1}`}
                        value={chemist}
                        onChangeText={(value) => updateAssociatedChemist(index, value)}
                        placeholderTextColor="#9ca3af"
                      />
                      {associatedChemists.length > 1 && (
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeAssociatedChemist(index)}
                        >
                          <Ionicons name="close-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
            {requestType === 'new-chemist' && (
              <View style={styles.section}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Chemist Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter chemist name"
                    value={chemistName}
                    onChangeText={setChemistName}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>Additional Information</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={addChemistField}
                    >
                      <Ionicons name="add-circle" size={20} color="#0f766e" />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                  {chemistFields.map((field) => (
                    <View key={field.id} style={styles.multiFieldRow}>
                      <TextInput
                        style={[styles.input, styles.multiFieldInput]}
                        placeholder="Enter information"
                        value={field.value}
                        onChangeText={(value) => updateChemistField(field.id, value)}
                        placeholderTextColor="#9ca3af"
                      />
                      {chemistFields.length > 1 && (
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeChemistField(field.id)}
                        >
                          <Ionicons name="close-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
            {requestType === 'leaves' && (
              <View style={styles.section}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Start Date</Text>
                  <TouchableOpacity
                    style={styles.dateInputContainer}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={[styles.dateInputText, !startDate && styles.dateInputPlaceholder]}>
                      {startDate ? formatDate(startDate) : 'Select start date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>End Date</Text>
                  <TouchableOpacity
                    style={styles.dateInputContainer}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={[styles.dateInputText, !endDate && styles.dateInputPlaceholder]}>
                      {endDate ? formatDate(endDate) : 'Select end date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {requestType === 'sample-templates' && (
              <View style={styles.section}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Product Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter product name"
                    value={productName}
                    onChangeText={setProductName}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            )}
            {requestType === 'work-together' && (
              <View style={styles.section}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TouchableOpacity
                    style={styles.dateInputContainer}
                    onPress={() => setShowWorkTogetherDatePicker(true)}
                  >
                    <Text style={[styles.dateInputText, !workTogetherDate && styles.dateInputPlaceholder]}>
                      {workTogetherDate ? formatDate(workTogetherDate) : 'Select date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {requestType === 'other' && (
              <View style={styles.section}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Remarks *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter remarks"
                    value={remarks}
                    onChangeText={setRemarks}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            )}
            {requestType && requestType !== 'other' && (
              <View style={styles.section}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Remarks</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter remarks (optional)"
                    value={remarks}
                    onChangeText={setRemarks}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            )}

            {requestType && (
              <TouchableOpacity
                style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ButtonLoader size={20} color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          minimumDate={startDate || new Date()}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}

      {showWorkTogetherDatePicker && (
        <DateTimePicker
          value={workTogetherDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowWorkTogetherDatePicker(false);
            if (selectedDate) {
              setWorkTogetherDate(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  selectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  selectButtonTextPlaceholder: {
    color: '#9ca3af',
  },
  dropdownContainer: {
    marginTop: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  dropdownOptionSelected: {
    backgroundColor: '#f0fdfa',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  dropdownOptionTextSelected: {
    color: '#0f766e',
    fontWeight: '600',
  },
  dropdownOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  inputRow: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
  },
  multiFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  multiFieldInput: {
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateInputText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  dateInputPlaceholder: {
    color: '#9ca3af',
  },
  saveButton: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

