import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import UserProfileSidebar from '../components/UserProfileSidebar';
import TodaysReminders from '../components/TodaysReminders';
import UserReminders from '../components/UserReminders';
import DailyPlans from '../components/DailyPlans';
import InlineSearchSuggestions from '../components/InlineSearchSuggestions';
import DailyPlansForm from '../forms/DailyPlansForm';
import DoctorChemistListScreen from './DoctorChemistListScreen';
import DoctorProfileScreen from './DoctorProfileScreen';
import ChemistProfileScreen from './ChemistProfileScreen';
import DCRFormScreen from './DCRFormScreen';
import ExpenseOverviewScreen from './ExpenseOverviewScreen';
import CalendarScreen from './CalendarScreen';
import NotificationsScreen from './NotificationsScreen';
import { UserDataManager, UserData } from '../utils/UserDataManager';
import { LoginManager } from '../utils/LoginManager';
import { SetReminderForm } from '../forms';
import { ReminderManager, UserReminder } from '../utils/ReminderManager';
import { createSearchSuggestions, SearchSuggestion } from '../utils/SearchSuggestions';
import { gqlFetch } from '../api/graphql';
import { HOME_PAGE_QUERY } from '../graphql/query/home';
import { CREATE_REMINDAR_MUTATION } from '../graphql/mutation/reminder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeSkeleton from '../components/HomeSkeleton';

interface HomeScreenProps {
  onLogout: () => void;
}

export default function HomeScreen({ onLogout }: HomeScreenProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDailyPlansForm, setShowDailyPlansForm] = useState(false);
  const [activeMasterTab, setActiveMasterTab] = useState<'doctor' | 'chemist'>('doctor');
  const [showDoctorChemistList, setShowDoctorChemistList] = useState(false);
  const [showDoctorProfile, setShowDoctorProfile] = useState(false);
  const [showChemistProfile, setShowChemistProfile] = useState(false);
  const [showDCRForm, setShowDCRForm] = useState(false);
  const [showExpenseOverview, setShowExpenseOverview] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedChemistId, setSelectedChemistId] = useState<string>('');
  const [listType, setListType] = useState<'doctors' | 'chemists' | 'both'>('both');
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [userReminders, setUserReminders] = useState<UserReminder[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [todaysReminders, setTodaysReminders] = useState<any[]>([]);
  const [dailyPlans, setDailyPlans] = useState<any[]>([]);
  const [loadingHomeData, setLoadingHomeData] = useState(true);

  const handleCreateDailyPlan = () => {
    setShowDailyPlansForm(true);
  };

  const handleBackFromDailyPlans = () => {
    setShowDailyPlansForm(false);
  };

  const handleBackFromDoctorChemistList = () => {
    setShowDoctorChemistList(false);
    setListType('both');
  };

  const handleBackFromDoctorProfile = () => {
    setShowDoctorProfile(false);
    setSelectedDoctorId('');
  };

  const handleBackFromChemistProfile = () => {
    setShowChemistProfile(false);
    setSelectedChemistId('');
  };

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setShowDoctorProfile(true);
  };

  const handleChemistSelect = (chemistId: string) => {
    setSelectedChemistId(chemistId);
    setShowChemistProfile(true);
  };

  const handleBackFromDCRForm = () => {
    setShowDCRForm(false);
  };

  const handleBackFromExpenseOverview = () => {
    setShowExpenseOverview(false);
  };

  useEffect(() => {
    loadUserData();
    initializeSearchSuggestions();
    loadHomePageData(); // This also loads user reminders from API
  }, []);

  const initializeSearchSuggestions = () => {
    const suggestions = createSearchSuggestions(
      () => setShowDCRForm(false), // DCR
      () => setShowDCRForm(true), // DCR Form
      () => setShowDailyPlansForm(false), // Daily Plans
      () => setShowDailyPlansForm(true), // Daily Plans Form
      () => setShowReminderForm(true), // Reminder Form
      () => setShowExpenseOverview(true), // Expense Overview
      () => { setListType('doctors'); setShowDoctorChemistList(true); }, // Doctor List
      () => { setListType('chemists'); setShowDoctorChemistList(true); }, // Chemist List
      () => { setListType('both'); setShowDoctorChemistList(true); }, // Master List
      () => setShowSidebar(true), // Profile
      () => setShowCalendar(true), // Calendar
    );
    setSearchSuggestions(suggestions);
  };

  const loadUserReminders = async () => {
    try {
      const localReminders = await ReminderManager.getTodaysReminders();
      // Preserve API reminders (those with id starting with 'api-reminder-')
      const apiReminders = userReminders.filter(r => r.id.startsWith('api-reminder-'));
      setUserReminders([...localReminders, ...apiReminders]);
    } catch (error) {
      console.error('Error loading user reminders:', error);
    }
  };

  const loadHomePageData = async () => {
    try {
      setLoadingHomeData(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoadingHomeData(false);
        return;
      }

      type HomePageResponse = {
        homePage: {
          data: {
            events: Array<{
              email: string;
              phone: string;
              dob?: string;
              anniversary?: string;
              doctor?: { name: string; titles: string[] };
              chemist?: { name: string; titles: string[]; status?: string };
            }>;
            remindars: Array<{
              remindAt: string;
              heading: string;
              message: string;
            }>;
            dailyplans: Array<{
              isApproved: boolean;
              workTogether: boolean;
              isWorkTogetherConfirmed: boolean;
              isRejected: boolean;
              planDate: string;
              notes: string;
              doctors: Array<{
                doctorCompanyId: number;
                dcr: boolean;
                DoctorCompany: { email: string; phone: string };
              }>;
              chemists: Array<{
                id: number;
                dcr: boolean;
                ChemistCompany: { email: string; phone: string; dob?: string; anniversary?: string };
              }>;
            }>;
          };
          success: boolean;
          code: number;
        };
      };

      const response = await gqlFetch<HomePageResponse>(HOME_PAGE_QUERY, {}, token);
      
      if (response.homePage.success && response.homePage.data) {
        const { events, remindars, dailyplans } = response.homePage.data;

        // Transform events to todaysReminders format
        const transformedEvents = events.map((event, index) => {
          const isDoctor = !!event.doctor;
          const person = isDoctor ? event.doctor! : event.chemist!;
          const today = new Date();
          const eventDate = event.dob ? event.dob : event.anniversary || '';
          const eventType = event.dob ? 'birthday' : 'anniversary';

          return {
            id: `event-${index}`,
            name: isDoctor ? `Dr. ${person.name}` : person.name,
            phoneNumber: event.phone,
            titles: person.titles || [],
            eventType: eventType as 'birthday' | 'anniversary',
            eventDate: eventDate,
            profileImage: undefined,
          };
        });
        setTodaysReminders(transformedEvents);

        // Transform remindars to userReminders format and merge with existing
        const transformedRemindars: UserReminder[] = remindars.map((reminder, index) => ({
          id: `api-reminder-${index}`,
          heading: reminder.heading,
          message: reminder.message,
          date: new Date(Number(reminder.remindAt)),
          createdAt: new Date(),
          isCompleted: false,
        }));
        
        // Load local reminders first, then add API reminders
        const localReminders = await ReminderManager.getTodaysReminders();
        setUserReminders([...localReminders, ...transformedRemindars]);

        // Transform dailyplans: create one card for each doctor and chemist
        const transformedPlans: any[] = [];
        let cardIndex = 0;

        dailyplans.forEach((plan, planIndex) => {
          const planDate = new Date(Number(plan.planDate));
          
          // Determine status based on approval and rejection
          let status: 'completed' | 'pending' | 'in-progress';
          let statusText: string;
          
          if (plan.isRejected) {
            status = 'pending';
            statusText = 'ABM Rejected';
          } else if (plan.isApproved) {
            status = 'completed';
            statusText = 'Manager Approved';
          } else if (plan.isWorkTogetherConfirmed) {
            status = 'in-progress';
            statusText = 'ABM Confirmed';
          } else if (plan.workTogether) {
            status = 'in-progress';
            statusText = 'ABM Will Work';
          } else {
            status = 'pending';
            statusText = 'Pending';
          }

          // Create cards for doctors (only if dcr is false - call not complete)
          plan.doctors.forEach((doctor) => {
            if (!doctor.dcr) { // Only show if call is not complete
              const doctorName = doctor.DoctorCompany.email.split('@')[0];
              transformedPlans.push({
                id: `plan-doctor-${cardIndex}`,
                type: 'doctor',
                title: `Dr. ${doctorName}`,
                description: plan.notes || '',
                time: planDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                date: planDate.toLocaleDateString(),
                status: status,
                statusText: statusText,
                priority: plan.workTogether ? 'high' : 'medium',
                email: doctor.DoctorCompany.email,
                phone: doctor.DoctorCompany.phone,
                doctorCompanyId: doctor.doctorCompanyId,
                dcr: doctor.dcr,
              });
              cardIndex++;
            }
          });

          // Create cards for chemists (only if dcr is false - call not complete)
          plan.chemists.forEach((chemist) => {
            if (!chemist.dcr) { // Only show if call is not complete
              const chemistName = chemist.ChemistCompany.email.split('@')[0];
              transformedPlans.push({
                id: `plan-chemist-${cardIndex}`,
                type: 'chemist',
                title: chemistName,
                description: plan.notes || '',
                time: planDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                date: planDate.toLocaleDateString(),
                status: status,
                statusText: statusText,
                priority: plan.workTogether ? 'high' : 'medium',
                email: chemist.ChemistCompany.email,
                phone: chemist.ChemistCompany.phone,
                chemistId: chemist.id,
                dcr: chemist.dcr,
              });
              cardIndex++;
            }
          });
        });
        
        setDailyPlans(transformedPlans);
      }
    } catch (error) {
      console.error('Error loading home page data:', error);
    } finally {
      setLoadingHomeData(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchSuggestions(query.length > 0);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setSearchQuery('');
    setShowSearchSuggestions(false);
    suggestion.action();
  };

  const loadUserData = async () => {
    try {
      const data = await UserDataManager.getUserData();
      if (data) {
        setUserData(data);
      } else {
        // Create default user data if none exists
        const userId = await LoginManager.getStoredUserId();
        if (userId) {
          const defaultData = await UserDataManager.createDefaultUserData(
            userId,
            'user@medicmap.com'
          );
          setUserData(defaultData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await LoginManager.clearUserData(); // keeps userId, clears auth/name/company
            await UserDataManager.updateUserData({ name: '', company: '', hasMPIN: false });
            onLogout();
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    setShowSidebar(false);
    Alert.alert('Change Password', 'Password change functionality will be implemented');
  };

  const handleVerifyEmail = () => {
    setShowSidebar(false);
    Alert.alert('Verify Email', 'Email verification functionality will be implemented');
  };

  const handleSetNewMPIN = () => {
    setShowSidebar(false);
    Alert.alert('Set New MPIN', 'MPIN setup functionality will be implemented');
  };

  const serviceCategories = [
    {
      id: 'emergency',
      title: 'Emergency',
      icon: 'medical-outline',
      color: '#3b82f6',
    },
    {
      id: 'doctor',
      title: 'Doctor',
      icon: 'medical-outline',
      color: '#3b82f6',
    },
    {
      id: 'hospital',
      title: 'Hospital',
      icon: 'business-outline',
      color: '#3b82f6',
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      icon: 'medical-outline',
      color: '#3b82f6',
    },
    {
      id: 'report',
      title: 'Report',
      icon: 'document-outline',
      color: '#3b82f6',
    },
    {
      id: 'appointment',
      title: 'Appointment',
      icon: 'calendar-outline',
      color: '#3b82f6',
    },
    {
      id: 'prescription',
      title: 'Prescription',
      icon: 'receipt-outline',
      color: '#3b82f6',
    },
    {
      id: 'more',
      title: 'More',
      icon: 'ellipsis-horizontal-outline',
      color: '#3b82f6',
    },
  ];

  const bottomNavItems = [
    { id: 'home', title: 'Home', icon: 'home-outline', active: true },
    { id: 'report', title: 'Report', icon: 'document-outline', active: false },
    { id: 'dcr', title: 'DCR', icon: 'calendar-outline', active: false },
    { id: 'expense', title: 'Expense', icon: 'wallet-outline', active: false },
    { id: 'calendar', title: 'Calendar', icon: 'calendar-outline', active: false },
  ];

  if (loading || loadingHomeData) {
    return <HomeSkeleton />;
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load user data</Text>
      </View>
    );
  }

  if (showDailyPlansForm) {
    return <DailyPlansForm onBack={handleBackFromDailyPlans} />;
  }

  if (showDoctorChemistList) {
    return <DoctorChemistListScreen onBack={handleBackFromDoctorChemistList} onDoctorSelect={handleDoctorSelect} onChemistSelect={handleChemistSelect} listType={listType} />;
  }

  if (showDoctorProfile) {
    return <DoctorProfileScreen doctorId={selectedDoctorId} onBack={handleBackFromDoctorProfile} />;
  }

  if (showChemistProfile) {
    return <ChemistProfileScreen chemistId={selectedChemistId} onBack={handleBackFromChemistProfile} />;
  }

  if (showDCRForm) {
    return <DCRFormScreen onBack={handleBackFromDCRForm} />;
  }

  if (showExpenseOverview) {
    return <ExpenseOverviewScreen onBack={handleBackFromExpenseOverview} />;
  }

  const handleReminderAction = () => {
    console.log('Reminder action');
    setShowReminderForm(true);
  };

  const handleBackFromReminderForm = () => {
    setShowReminderForm(false);
  };

  const handleReminderSubmit = async (data: any) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        return;
      }

      // Format date as dd/mm/yyyy
      const formatDateForAPI = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Call the mutation
      type CreateRemindarResponse = {
        createRemindar: {
          code: number;
          success: boolean;
          message: string;
        };
      };

      const response = await gqlFetch<CreateRemindarResponse>(
        CREATE_REMINDAR_MUTATION,
        {
          data: {
            heading: data.heading,
            message: data.message,
            date: formatDateForAPI(data.date),
          },
        },
        token
      );

      if (response.createRemindar.success) {
        // Also save locally for offline access
        await ReminderManager.saveReminder({
          date: data.date,
          heading: data.heading,
          message: data.message,
        });
        
        setShowReminderForm(false);
        await loadUserReminders(); // Refresh the reminders list
        await loadHomePageData(); // Refresh home page data to get updated reminders from API
        Alert.alert('Success', response.createRemindar.message || 'Reminder set successfully!');
      } else {
        Alert.alert('Error', response.createRemindar.message || 'Failed to create reminder.');
      }
    } catch (error: any) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', error.message || 'Failed to save reminder. Please try again.');
    }
  };

  if (showReminderForm) {
    return <SetReminderForm onBack={handleBackFromReminderForm} onSubmit={handleReminderSubmit} />;
  }

  if (showCalendar) {
    return <CalendarScreen onBack={() => setShowCalendar(false)} />;
  }

  if (showNotifications) {
    return <NotificationsScreen onBack={() => setShowNotifications(false)} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0f766e', '#14b8a6']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setShowSidebar(true)}
          >
            {userData.profileImage ? (
              <Image
                source={{ uri: userData.profileImage }}
                style={styles.headerProfileImage}
              />
            ) : (
              <View style={styles.defaultHeaderProfileImage}>
                <Ionicons name="person" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.userNameText}>{userData.name}</Text>
            {!!userData.company && (
              <Text style={styles.companyText}>{userData.company}</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for features, reports, plans..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Inline Search Suggestions */}
      <InlineSearchSuggestions
        visible={showSearchSuggestions}
        searchQuery={searchQuery}
        suggestions={searchSuggestions}
        onSuggestionPress={handleSuggestionPress}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Created Reminders */}
        <UserReminders 
          reminders={userReminders} 
          onReminderUpdate={loadUserReminders}
        />

        {/* Today's Reminders (Doctor/Chemist Events) */}
        <TodaysReminders reminders={todaysReminders} />

        {/* Daily Plans */}
        <DailyPlans plans={dailyPlans} onCreatePlan={handleCreateDailyPlan} />

        {/* Quick Action */}
        <View style={styles.serviceSection}>
          <Text style={styles.sectionTitle}>Quick Action</Text>
          <View style={styles.serviceContainer}>
            <View style={styles.serviceGrid}>
              {serviceCategories.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => {
                    Alert.alert(service.title, `${service.title} functionality will be implemented`);
                  }}
                >
                  <View style={styles.serviceIconContainer}>
                    <View style={styles.serviceIcon}>
                      <Ionicons name={service.icon as any} size={20} color="#0f766e" />
                    </View>
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Master List */}
        <View style={styles.masterListSection}>
          <Text style={styles.sectionTitle}>Master List</Text>
          <View style={styles.masterListContainer}>
            {/* Tabs */}
            {/* <View style={styles.masterTabContainer}>
              <TouchableOpacity
                style={[styles.masterTab, activeMasterTab === 'doctor' && styles.activeMasterTab]}
                onPress={() => setActiveMasterTab('doctor')}
              >
                <Text style={[styles.masterTabText, activeMasterTab === 'doctor' && styles.activeMasterTabText]}>
                  Doctor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.masterTab, activeMasterTab === 'chemist' && styles.activeMasterTab]}
                onPress={() => setActiveMasterTab('chemist')}
              >
                <Text style={[styles.masterTabText, activeMasterTab === 'chemist' && styles.activeMasterTabText]}>
                  Chemist
                </Text>
              </TouchableOpacity>
            </View> */}

            {/* Content based on active tab */}
            <View style={styles.masterContent}>
              <TouchableOpacity 
                style={styles.masterActionButton}
                onPress={() => {
                  setListType('doctors');
                  setShowDoctorChemistList(true);
                }}
              >
                <View style={styles.masterActionContent}>
                  <Ionicons name="person-outline" size={24} color="#0f766e" />
                  <View style={styles.masterActionText}>
                    <Text style={styles.masterActionTitle}>View All Doctors</Text>
                    <Text style={styles.masterActionSubtitle}>Browse complete doctor directory</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.masterActionButton}
                onPress={() => {
                  setListType('chemists');
                  setShowDoctorChemistList(true);
                }}
              >
                <View style={styles.masterActionContent}>
                  <Ionicons name="medical-outline" size={24} color="#0f766e" />
                  <View style={styles.masterActionText}>
                    <Text style={styles.masterActionTitle}>View All Chemists</Text>
                    <Text style={styles.masterActionSubtitle}>Browse complete chemist directory</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* DCR */}
        <View style={styles.dcrSection}>
          <Text style={styles.sectionTitle}>DCR</Text>
          <View style={styles.dcrContainer}>
            <View style={styles.serviceGrid}>
              <TouchableOpacity style={styles.serviceCard}>
                <View style={styles.serviceIconContainer}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="calendar-outline" size={20} color="#0f766e" />
                  </View>
                </View>
                <Text style={styles.serviceTitle}>Daily Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.serviceCard}
                onPress={() => setShowDCRForm(true)}
              >
                <View style={styles.serviceIconContainer}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="call-outline" size={20} color="#0f766e" />
                  </View>
                </View>
                <Text style={styles.serviceTitle}>Call Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceCard} onPress={() => handleReminderAction()}>
                <View style={styles.serviceIconContainer}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="alarm-outline" size={20} color="#0f766e" />
                  </View>
                </View>
                <Text style={styles.serviceTitle}  >Set Reminder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceCard}>
                <View style={styles.serviceIconContainer}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="location-outline" size={20} color="#0f766e" />
                  </View>
                </View>
                <Text style={styles.serviceTitle}>Visit Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reports */}
        <View style={styles.reportsSection}>
          <Text style={styles.sectionTitle}>Reports</Text>
          <View style={styles.reportsContainer}>
            <View style={styles.serviceGrid}>
              <TouchableOpacity style={styles.serviceCard}>
                <View style={styles.serviceIconContainer}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="call-outline" size={20} color="#0f766e" />
                  </View>
                </View>
                <Text style={styles.serviceTitle}>Call Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceCard}>
                <View style={styles.serviceIconContainer}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="document-outline" size={20} color="#0f766e" />
                  </View>
                </View>
                <Text style={styles.serviceTitle}>Daily Plan Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceCard}>
                <View style={styles.serviceIconContainer}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="eye-outline" size={20} color="#0f766e" />
                  </View>
                </View>
                <Text style={styles.serviceTitle}>View All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceCard}>
                <View style={styles.serviceIconContainer}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name="analytics-outline" size={20} color="#0f766e" />
                  </View>
                </View>
                <Text style={styles.serviceTitle}>Analytics</Text>
              </TouchableOpacity>
            </View>
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
              if (item.id === 'expense') {
                setShowExpenseOverview(true);
              } else if (item.id === 'calendar') {
                setShowCalendar(true);
              } else {
                Alert.alert(item.title, `${item.title} functionality will be implemented`);
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

      {/* User Profile Sidebar */}
      <UserProfileSidebar
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        userData={userData}
        onLogout={handleLogout}
        onChangePassword={handleChangePassword}
        onVerifyEmail={handleVerifyEmail}
        onSetNewMPIN={handleSetNewMPIN}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 16,
  },
  headerProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultHeaderProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  companyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchSection: {
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  serviceSection: {
    marginBottom: 20,
  },
  serviceContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  serviceCard: {
    width: '22%',
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
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
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 14,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  masterListSection: {
    marginBottom: 20,
  },
  masterListContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  masterTabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  masterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeMasterTab: {
    backgroundColor: '#0f766e',
  },
  masterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeMasterTabText: {
    color: 'white',
  },
  masterContent: {
    marginTop: 8,
  },
  masterActionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  masterActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  masterActionText: {
    flex: 1,
    marginLeft: 12,
  },
  masterActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  masterActionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  masterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  masterCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  masterIconContainer: {
    marginBottom: 8,
  },
  masterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  masterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  masterSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  masterListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  masterListIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  masterListText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  dcrSection: {
    marginBottom: 20,
  },
  dcrContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dcrItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dcrIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dcrText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  reportsSection: {
    marginBottom: 20,
  },
  reportsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  appointmentSection: {
    marginBottom: 20,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6b7280',
  },
  appointmentTime: {
    alignItems: 'flex-end',
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  appointmentTimeText: {
    fontSize: 14,
    color: '#0f766e',
  },
  popularSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: '#0f766e',
    fontWeight: '600',
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doctorImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  popularDoctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  popularDoctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
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
