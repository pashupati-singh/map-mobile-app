import React, { useState, useEffect, useCallback } from 'react';
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
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import SearchComponent from '../components/SearchComponent';
import SuccessToast from '../components/SuccessToast';
import CustomLoader from '../components/CustomLoader';
import ButtonLoader from '../components/ButtonLoader';
import CurvedHeader from '../components/CurvedHeader';
import { gqlFetch } from '../api/graphql';
import { GET_WORKING_AREA_RELATIONS_QUERY } from '../graphql/query/workingAreaRelations';
import { GET_USERS_BY_WORKING_AREA_BY_USER_ID_QUERY } from '../graphql/query/workingArea';
import { CREATE_DAILY_PLAN_MUTATION } from '../graphql/mutation/dailyPlan';
import { LoginManager } from '../utils/LoginManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyPlansCache } from '../utils/DailyPlansCache';

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

interface WorkingArea {
  id: number;
  state: string;
  city: string;
  district: string;
  workingArea: string;
}

type DailyPlansFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailyPlansForm'>;

export default function DailyPlansForm() {
  const navigation = useNavigation<DailyPlansFormNavigationProp>();
  const [step, setStep] = useState<0 | 1 | 2>(0); // Step 0: Location, Step 1: Selection, Step 2: Details
  const [activeTab, setActiveTab] = useState<'doctor' | 'chemist'>('doctor');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [selectedChemists, setSelectedChemists] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [chemists, setChemists] = useState<Chemist[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingChemists, setLoadingChemists] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Step 0 states
  const [workingAreas, setWorkingAreas] = useState<WorkingArea[]>([]);
  const [loadingWorkingAreas, setLoadingWorkingAreas] = useState(false);
  const [selectedWorkingArea, setSelectedWorkingArea] = useState<WorkingArea | null>(null);
  
  // Step 2 states
  const [workTogether, setWorkTogether] = useState(false);
  const [notes, setNotes] = useState('');
  const [planDate, setPlanDate] = useState<Date>(new Date());

  // Helper function to get dummy profile image
  const getDummyProfileImage = (name: string, type: 'doctor' | 'chemist'): string => {
    const images = type === 'doctor' 
      ? [
          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        ]
      : [
          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        ];
    
    // Use name hash to consistently assign image
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return images[Math.abs(hash) % images.length];
  };

  // Load doctors and chemists based on selected working area
  const loadDoctorsAndChemists = async () => {
    try {
      setLoadingDoctors(true);
      setLoadingChemists(true);

      // Get selected working area
      const cachedWorkingArea = await DailyPlansCache.getSelectedWorkingArea();
      if (!cachedWorkingArea || !cachedWorkingArea.id) {
        Alert.alert('Error', 'Please select a working area first.');
        setLoadingDoctors(false);
        setLoadingChemists(false);
        return;
      }

      // Check cache first
      const cachedDoctors = await DailyPlansCache.getDoctors<Doctor[]>();
      const cachedChemists = await DailyPlansCache.getChemists<Chemist[]>();
      if (cachedDoctors && cachedChemists) {
        setDoctors(cachedDoctors);
        setChemists(cachedChemists);
        setLoadingDoctors(false);
        setLoadingChemists(false);
        return;
      }

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoadingDoctors(false);
        setLoadingChemists(false);
        return;
      }

      type WorkingAreaRelationsResponse = {
        getWorkingAreaRelations: {
          code: number;
          success: boolean;
          message: string;
          data: {
            doctorCompanies: Array<{
              id: number;
              phone: string;
              doctor: {
                name: string;
                titles: string[];
              };
            }>;
            chemistCompanies: Array<{
              id: number;
              phone: string;
              chemist: {
                name: string;
                titles: string[];
              };
            }>;
          };
        };
      };

      const response = await gqlFetch<WorkingAreaRelationsResponse>(
        GET_WORKING_AREA_RELATIONS_QUERY,
        { workingAreaId: cachedWorkingArea.id },
        token
      );

      if (response.getWorkingAreaRelations.success && response.getWorkingAreaRelations.data) {
        const { doctorCompanies, chemistCompanies } = response.getWorkingAreaRelations.data;

        // Transform doctors
        const transformedDoctors: Doctor[] = doctorCompanies.map((doc) => ({
          id: String(doc.id),
          name: `Dr. ${doc.doctor.name}`,
          title: doc.doctor.titles?.join(', ') || '',
          specialty: '',
          phone: doc.phone || '',
          profileImage: getDummyProfileImage(doc.doctor.name, 'doctor'),
        }));
        setDoctors(transformedDoctors);
        await DailyPlansCache.setDoctors(transformedDoctors);

        // Transform chemists
        const transformedChemists: Chemist[] = chemistCompanies.map((chem) => ({
          id: String(chem.id),
          name: chem.chemist.name,
          title: 'Chemist',
          shopName: '',
          phone: chem.phone || '',
          profileImage: getDummyProfileImage(chem.chemist.name, 'chemist'),
        }));
        setChemists(transformedChemists);
        await DailyPlansCache.setChemists(transformedChemists);
      }
    } catch (error) {
      console.error('Error loading doctors and chemists:', error);
      Alert.alert('Error', 'Failed to load doctors and chemists. Please try again.');
    } finally {
      setLoadingDoctors(false);
      setLoadingChemists(false);
    }
  };

  // Load working areas - prioritize cache, only fetch if empty
  const loadWorkingAreas = async () => {
    try {
      // Check cache first
      const cachedAreas = await DailyPlansCache.getWorkingAreas<WorkingArea[]>();
      if (cachedAreas && cachedAreas.length > 0) {
        setWorkingAreas(cachedAreas);
        const selected = await DailyPlansCache.getSelectedWorkingArea();
        if (selected) setSelectedWorkingArea(selected);
        return;
      }

      // Only fetch if cache is empty
      setLoadingWorkingAreas(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoadingWorkingAreas(false);
        return;
      }

      type WorkingAreasResponse = {
        getUsersByWorkingAreabyUserId: {
          code: number;
          success: boolean;
          message: string;
          data: WorkingArea[];
        };
      };

      const response = await gqlFetch<WorkingAreasResponse>(
        GET_USERS_BY_WORKING_AREA_BY_USER_ID_QUERY,
        {},
        token
      );

      if (response.getUsersByWorkingAreabyUserId.success && response.getUsersByWorkingAreabyUserId.data) {
        setWorkingAreas(response.getUsersByWorkingAreabyUserId.data);
        await DailyPlansCache.setWorkingAreas(response.getUsersByWorkingAreabyUserId.data);
        const selected = await DailyPlansCache.getSelectedWorkingArea();
        if (selected) setSelectedWorkingArea(selected);
      }
    } catch (error) {
      console.error('Error loading working areas:', error);
      Alert.alert('Error', 'Failed to load working areas. Please try again.');
    } finally {
      setLoadingWorkingAreas(false);
    }
  };

  // Load working areas on mount only
  useEffect(() => {
    loadWorkingAreas();
  }, []);

  // Load doctors and chemists when step 1 is reached
  useEffect(() => {
    if (step === 1) {
      loadDoctorsAndChemists();
    }
  }, [step]); // Run when step changes

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 2) {
        // If on step 2, go back to step 1
        Keyboard.dismiss();
        setStep(1);
        return true; // Prevent default back behavior
      } else if (step === 1) {
        // If on step 1, go back to step 0
        Keyboard.dismiss();
        setStep(0);
        return true; // Prevent default back behavior
      }
      // If on step 0, allow default back behavior (go to home)
      return false;
    });

    return () => backHandler.remove();
  }, [step]);

  // Clear cache when component unmounts or user leaves the page
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Clear cache when leaving the page
        DailyPlansCache.clearAll();
      };
    }, [])
  );

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

  const handleLocationNext = async () => {
    // Validate that a working area is selected
    if (!selectedWorkingArea) {
      Alert.alert('Location Required', 'Please select a working area to continue.');
      return;
    }
    // Save selected working area to cache
    await DailyPlansCache.setSelectedWorkingArea(selectedWorkingArea);
    setStep(1);
  };

  const handleNext = () => {
    // Validate that at least one doctor or chemist is selected
    if (selectedDoctors.length === 0 && selectedChemists.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one doctor or chemist to continue.');
      return;
    }
    setStep(2);
  };

  const handleBackToStep1 = () => {
    Keyboard.dismiss();
    setStep(1);
  };

  const handleCreateDailyPlan = async () => {
    try {
      // Dismiss keyboard
      Keyboard.dismiss();
      
      setSubmitting(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        setSubmitting(false);
        return;
      }

      // Format date as dd-mm-yyyy
      const formatDateForAPI = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
      };

      // Get current user ID (abmId) - this is the person creating the plan
      const userId = await LoginManager.getStoredUserId();
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        setSubmitting(false);
        return;
      }
      const abmId = parseInt(userId);

      // Get selected working area ID
      const cachedWorkingArea = await DailyPlansCache.getSelectedWorkingArea();
      if (!cachedWorkingArea || !cachedWorkingArea.id) {
        Alert.alert('Error', 'Working area not found. Please select a location again.');
        setSubmitting(false);
        return;
      }

      type CreateDailyPlanResponse = {
        createDailyPlan: {
          code: number;
          success: boolean;
          message: string;
        };
      };
      const mutationPayload = {
        data: {
          doctorCompanyIds: selectedDoctors.map(id => parseInt(id)),
          chemistCompanyIds: selectedChemists.map(id => parseInt(id)),
          planDate: formatDateForAPI(planDate),
          notes: notes || '',
          // abmId: abmId,
          workTogether: workTogether,
          workingAreaId: cachedWorkingArea.id,
        },
      };

      console.log('Create Daily Plan Mutation Payload:', JSON.stringify(mutationPayload, null, 2));

      const response = await gqlFetch<CreateDailyPlanResponse>(
        CREATE_DAILY_PLAN_MUTATION,
        mutationPayload,
        token
      );


      if (response.createDailyPlan.success) {
        await DailyPlansCache.clearAll();
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          // Reset navigation stack to Home
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })
          );
        }, 2000);
      } else {
        Alert.alert('Error', response.createDailyPlan.message || 'Failed to create daily plan.');
      }
    } catch (error: any) {
      console.error('Error creating daily plan:', error);
      Alert.alert('Error', error.message || 'Failed to create daily plan. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToastHide = async () => {
    await DailyPlansCache.clearAll();
    setShowToast(false);
    // Reset navigation stack to Home
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
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
      <CurvedHeader
        title={step === 0 ? 'Select Location' : step === 1 ? 'Daily Plans' : 'Plan Details'}
        showBackButton={false}
        rightComponent={
          step === 1 ? (
            <TouchableOpacity 
              onPress={() => setShowSearch(true)}
            >
              <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Step 0: Location Selection */}
      {step === 0 && (
        <>
          {loadingWorkingAreas ? (
            <View style={styles.loaderContainer}>
              <CustomLoader size={48} color="#0f766e" />
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.locationScrollContent}>
              {workingAreas.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="location-outline" size={48} color="#9ca3af" />
                  <Text style={styles.emptyText}>No working areas found</Text>
                </View>
              ) : (
                workingAreas.map((area) => (
                  <TouchableOpacity
                    key={area.id}
                    style={[
                      styles.locationItem,
                      selectedWorkingArea?.id === area.id && styles.locationItemSelected
                    ]}
                    onPress={() => setSelectedWorkingArea(area)}
                  >
                    <View style={styles.locationItemLeft}>
                      <View style={[
                        styles.locationRadio,
                        selectedWorkingArea?.id === area.id && styles.locationRadioSelected
                      ]}>
                        {selectedWorkingArea?.id === area.id && (
                          <View style={styles.locationRadioInner} />
                        )}
                      </View>
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationArea}>{area.workingArea}</Text>
                        <Text style={styles.locationDetails}>
                          {area.district}, {area.city}, {area.state}
                        </Text>
                      </View>
                    </View>
                    {selectedWorkingArea?.id === area.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#0f766e" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </>
      )}

      {/* Step 1: Selection */}
      {step === 1 && (
        <>
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
        </>
      )}

      {/* Content */}
      {step === 0 ? null : step === 1 ? (
        (loadingDoctors || loadingChemists) ? (
          <View style={styles.loaderContainer}>
            <CustomLoader size={48} color="#0f766e" />
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <>
              {(activeTab === 'doctor' ? doctors : chemists).length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-outline" size={48} color="#9ca3af" />
                  <Text style={styles.emptyText}>
                    No {activeTab === 'doctor' ? 'doctors' : 'chemists'} found
                  </Text>
                </View>
              ) : (
                (activeTab === 'doctor' ? doctors : chemists).map((item) => (
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
                          {item.title} {activeTab === 'doctor' 
                            ? (item as Doctor).specialty ? `• ${(item as Doctor).specialty}` : ''
                            : (item as Chemist).shopName ? `• ${(item as Chemist).shopName}` : ''
                          }
                        </Text>
                        {item.phone && (
                          <Text style={styles.listItemPhone}>{item.phone}</Text>
                        )}
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
                ))
              )}
            </>
          </ScrollView>
        )
      ) : (
        /* Step 2: Details with KeyboardAvoidingView */
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
            <View style={styles.step2Container}>
              {/* Work With Manager Toggle */}
              <View style={styles.toggleContainer}>
                <View style={styles.toggleLabelContainer}>
                  <Text style={styles.toggleLabel}>Work With Manager</Text>
                  <Text style={styles.toggleDescription}>
                    Enable if you want to work together with a manager
                  </Text>
                </View>
                <Switch
                  value={workTogether}
                  onValueChange={setWorkTogether}
                  trackColor={{ false: '#d1d5db', true: '#14b8a6' }}
                  thumbColor={workTogether ? '#0f766e' : '#f4f3f4'}
                />
              </View>

              {/* Notes */}
              <View style={styles.notesSection}>
                <Text style={styles.sectionLabel}>Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Enter notes for this daily plan..."
                  placeholderTextColor="#9ca3af"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              {/* Action Buttons for Step 2 - Inside ScrollView */}
              <View style={styles.step2ActionButtons}>
                <TouchableOpacity 
                  style={styles.createButtonFullWidth} 
                  onPress={handleCreateDailyPlan}
                  disabled={submitting}
                >
                  {submitting ? (
                    <LinearGradient
                      colors={['#0f766e', '#14b8a6']}
                      style={styles.createButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <ButtonLoader size={20} variant="white" />
                    </LinearGradient>
                  ) : (
                    <LinearGradient
                      colors={['#0f766e', '#14b8a6']}
                      style={styles.createButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.createButtonText}>Create</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Action Buttons for Step 0 - Outside ScrollView */}
      {step === 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={async () => {
              await DailyPlansCache.clearAll();
              navigation.goBack();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleLocationNext}
            disabled={!selectedWorkingArea}
          >
            <LinearGradient
              colors={
                !selectedWorkingArea 
                  ? ['#9ca3af', '#9ca3af']
                  : ['#0f766e', '#14b8a6']
              }
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons for Step 1 - Outside ScrollView */}
      {step === 1 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={async () => {
              await DailyPlansCache.clearAll();
              navigation.goBack();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNext}
            disabled={selectedDoctors.length === 0 && selectedChemists.length === 0}
          >
            <LinearGradient
              colors={
                (selectedDoctors.length === 0 && selectedChemists.length === 0) 
                  ? ['#9ca3af', '#9ca3af']
                  : ['#0f766e', '#14b8a6']
              }
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Component */}
      {step === 1 && (
        <SearchComponent
          visible={showSearch}
          onClose={() => setShowSearch(false)}
          title={`Search ${activeTab === 'doctor' ? 'Doctors' : 'Chemists'}`}
          items={activeTab === 'doctor' ? doctors : chemists}
          selectedItems={activeTab === 'doctor' ? selectedDoctors : selectedChemists}
          onItemSelect={toggleSelection}
          searchPlaceholder={`Search ${activeTab === 'doctor' ? 'doctors' : 'chemists'}`}
        />
      )}

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
  searchIconButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#f97316',
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
    marginBottom: 2,
  },
  listItemPhone: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
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
  // Step 2 Styles
  step2Container: {
    paddingVertical: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
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
  toggleLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  notesSection: {
    marginBottom: 24,
  },
  step2ActionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: 20,
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  createButtonFullWidth: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  createButtonLoading: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Location Selection Styles
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  locationItemSelected: {
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa',
  },
  locationItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationRadioSelected: {
    borderColor: '#0f766e',
  },
  locationRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0f766e',
  },
  locationInfo: {
    flex: 1,
  },
  locationArea: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  locationDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationScrollContent: {
    paddingTop: 20,
  },
});
