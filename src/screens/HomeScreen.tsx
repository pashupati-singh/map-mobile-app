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
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import UserProfileSidebar from '../components/UserProfileSidebar';
import TodaysReminders from '../components/TodaysReminders';
import UserReminders from '../components/UserReminders';
import DailyPlans from '../components/DailyPlans';
import InlineSearchSuggestions from '../components/InlineSearchSuggestions';
import { UserDataManager, UserData } from '../utils/UserDataManager';
import { LoginManager } from '../utils/LoginManager';
import { SetReminderForm } from '../forms';
import { ReminderManager, UserReminder } from '../utils/ReminderManager';
import { createSearchSuggestions, SearchSuggestion } from '../utils/SearchSuggestions';
import { QuickActionManager, QuickActionItem } from '../utils/QuickActionManager';
import { gqlFetch } from '../api/graphql';
import { HOME_PAGE_QUERY } from '../graphql/query/home';
import { CREATE_REMINDAR_MUTATION } from '../graphql/mutation/reminder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeSkeleton from '../components/HomeSkeleton';

interface HomeScreenProps {
  onLogout: () => void;
}

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen({ onLogout }: HomeScreenProps) {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMasterTab, setActiveMasterTab] = useState<'doctor' | 'chemist'>('doctor');
  const [userReminders, setUserReminders] = useState<UserReminder[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [todaysReminders, setTodaysReminders] = useState<any[]>([]);
  const [dailyPlans, setDailyPlans] = useState<any[]>([]);
  const [loadingHomeData, setLoadingHomeData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [displayCompany, setDisplayCompany] = useState<string>('');
  const [pressedServiceId, setPressedServiceId] = useState<string | null>(null);
  const [pressedDcrId, setPressedDcrId] = useState<string | null>(null);
  const [pressedReportsId, setPressedReportsId] = useState<string | null>(null);
  const [quickActionItems, setQuickActionItems] = useState<QuickActionItem[]>([]);
  const [userId, setUserId] = useState<string>('');

  const handleCreateDailyPlan = () => {
    navigation.navigate('DailyPlansForm');
  };

  const handleDoctorSelect = (doctorId: string) => {
    navigation.navigate('DoctorProfile', { doctorId });
  };

  const handleChemistSelect = (chemistId: string) => {
    navigation.navigate('ChemistProfile', { chemistId });
  };

  const handleReminderAction = () => {
    navigation.navigate('SetReminder', { onSubmit: handleReminderSubmit });
  };

  // All available quick action options
  const getAllQuickActionOptions = (): QuickActionItem[] => {
    return [
      // DCR Options
      {
        id: 'daily-plan',
        title: 'Daily Plan',
        icon: 'calendar-outline',
        color: '#0f766e',
        category: 'dcr',
        onPress: () => navigation.navigate('DailyPlansForm'),
      },
      {
        id: 'call-report',
        title: 'Call Report',
        icon: 'call-outline',
        color: '#3b82f6',
        category: 'dcr',
        onPress: () => navigation.navigate('DCR'),
      },
      {
        id: 'reminder',
        title: 'Reminder',
        icon: 'alarm-outline',
        color: '#f59e0b',
        category: 'dcr',
        onPress: () => handleReminderAction(),
      },
      {
        id: 'visit-plan',
        title: 'Visit Plan',
        icon: 'location-outline',
        color: '#10b981',
        category: 'dcr',
        onPress: () => {},
      },
      // Reports Options
      {
        id: 'plan-history',
        title: 'Plan History',
        icon: 'time-outline',
        color: '#6366f1',
        category: 'report',
        onPress: () => navigation.navigate('PlanHistory'),
      },
      {
        id: 'average-call',
        title: 'Average Call',
        icon: 'stats-chart-outline',
        color: '#f97316',
        category: 'report',
        onPress: () => {},
      },
      {
        id: 'visiting-history',
        title: 'Visiting History',
        icon: 'location-outline',
        color: '#06b6d4',
        category: 'report',
        onPress: () => {},
      },
      {
        id: 'upcoming-events',
        title: 'Upcoming Events',
        icon: 'calendar-outline',
        color: '#8b5cf6',
        category: 'report',
        onPress: () => {},
      },
      {
        id: 'old-reminders',
        title: 'Old Reminders',
        icon: 'archive-outline',
        color: '#ef4444',
        category: 'report',
        onPress: () => {},
      },
      {
        id: 'sales',
        title: 'Sales',
        icon: 'trending-up-outline',
        color: '#10b981',
        category: 'report',
        onPress: () => {},
      },
    ];
  };

  const loadQuickActions = async () => {
    try {
      const selectedIds = await QuickActionManager.getQuickActions();
      const allOptions = getAllQuickActionOptions();
      const selectedItems = allOptions.filter((item) => selectedIds.includes(item.id));
      setQuickActionItems(selectedItems);
    } catch (error) {
      console.error('Error loading quick actions:', error);
    }
  };

  useEffect(() => {
    loadUserData();
    initializeSearchSuggestions();
    loadHomePageData();
    loadQuickActions();
  }, []);

  // Reload quick actions when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadQuickActions();
    });
    return unsubscribe;
  }, [navigation]);

  const initializeSearchSuggestions = () => {
    const suggestions = createSearchSuggestions(
      () => navigation.navigate('PlanHistory'), // Plan History
      () => Alert.alert('Average Call', 'Average Call functionality will be implemented'), // Average Call
      () => Alert.alert('Visiting History', 'Visiting History functionality will be implemented'), // Visiting History
      () => navigation.navigate('Products'), // Products
      () => navigation.navigate('UpcomingEvents'), // Upcoming Events
      () => navigation.navigate('OldReminders'), // Old Reminders
      () => Alert.alert('Sales', 'Sales functionality will be implemented'), // Sales
      () => navigation.navigate('DailyPlansForm'), // Daily Plans
      () => navigation.navigate('DCR'), // Call Reports
      () => navigation.navigate('SetReminder'), // Reminder
      () => Alert.alert('Visiting Plan', 'Visiting Plan functionality will be implemented'), // Visiting Plan
      () => navigation.navigate('DoctorChemistList', { listType: 'doctors' }), // Doctor List
      () => navigation.navigate('DoctorChemistList', { listType: 'chemists' }), // Chemist List
      () => setShowSidebar(true), // Update Profile
      () => handleSetNewMPIN(), // Set MPIN
      () => handleChangePassword(), // Change Password
      () => handleContactUs(), // Contact Us
    );
    setSearchSuggestions(suggestions);
  };

  const loadUserReminders = async () => {
    try {
      // Don't load from local storage - API is the source of truth
      // This prevents duplicates when reminders are created via API
      // Reminders are loaded via loadHomePageData() which gets them from the API
    } catch (error) {
      console.error('Error loading user reminders:', error);
    }
  };

  const loadHomePageData = async (isRefreshing: boolean = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoadingHomeData(true);
      }
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        if (isRefreshing) {
          setRefreshing(false);
        } else {
          setLoadingHomeData(false);
        }
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
              type?: string;
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

          const dob = (event as any).dob as string | undefined;
          const anniversary = (event as any).anniversary as string | undefined;
          const rawType = ((event as any).type ?? '').toString().toLowerCase();

          const parseDate = (value?: string) => {
            if (!value) return null;
            const numeric = Number(value);
            const date = Number.isFinite(numeric) && value.trim() !== '' ? new Date(numeric) : new Date(value);
            return Number.isNaN(date.getTime()) ? null : date;
          };

          const isSameDay = (first?: string, second?: string) => {
            const firstDate = parseDate(first);
            const secondDate = parseDate(second);
            if (!firstDate || !secondDate) return false;
            return (
              firstDate.getUTCDate() === secondDate.getUTCDate() &&
              firstDate.getUTCMonth() === secondDate.getUTCMonth()
            );
          };

          let eventType: 'birthday' | 'anniversary' | 'both';
          if (rawType === 'birthday' || rawType === 'anniversary' || rawType === 'both') {
            eventType = rawType as 'birthday' | 'anniversary' | 'both';
          } else if (dob && anniversary && isSameDay(dob, anniversary)) {
            eventType = 'both';
          } else if (dob) {
            eventType = 'birthday';
          } else {
            eventType = 'anniversary';
          }

          const eventDate =
            eventType === 'anniversary' ? anniversary ?? dob ?? '' : dob ?? anniversary ?? '';

          return {
            id: `event-${index}`,
            name: isDoctor ? `Dr. ${person.name}` : person.name,
            phoneNumber: event.phone,
            titles: person.titles || [],
            eventType,
            eventDate: eventDate,
            profileImage: undefined,
          };
        });
        setTodaysReminders(transformedEvents);

        // Transform remindars to userReminders format
        // Use only API reminders as the source of truth to avoid duplicates
        const transformedRemindars: UserReminder[] = remindars.map((reminder, index) => ({
          id: `api-reminder-${index}`,
          heading: reminder.heading,
          message: reminder.message,
          date: new Date(Number(reminder.remindAt)),
          createdAt: new Date(),
          isCompleted: false,
        }));
        
        // Use only API reminders - don't merge with local storage to avoid duplicates
        setUserReminders(transformedRemindars);

        // Transform dailyplans: create one card for each doctor and chemist
        const transformedPlans: any[] = [];
        let cardIndex = 0;

        dailyplans.forEach((plan, planIndex) => {
          const planDate = new Date(Number(plan.planDate));
          
          // Determine status based on approval and rejection
          let status: 'completed' | 'pending' | 'in-progress' | 'abm-will-work';
          let statusText: string;
          
          if (plan.isRejected) {
            status = 'pending';
            statusText = 'ABM Rejected';
          } else if (plan.isApproved && plan.workTogether && plan.isWorkTogetherConfirmed) {
            status = 'abm-will-work';
            statusText = 'ABM Will Work';
          } else if (plan.isApproved) {
            status = 'completed';
            statusText = 'Manager Approved';
          } else if (plan.isWorkTogetherConfirmed) {
            status = 'in-progress';
            statusText = 'ABM Confirmed';
          } else if (plan.workTogether) {
            status = 'in-progress';
            statusText = 'ABM Will Work';
          } else if (!plan.isRejected && !plan.isApproved) {
            // Both false means ABM hasn't responded
            status = 'pending';
            statusText = 'ABM Not Responded';
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
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoadingHomeData(false);
      }
    }
  };

  const onRefresh = async () => {
    await loadUserData();
    await loadHomePageData(true);
    await loadUserReminders();
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
      // First, try to get name and company from AsyncStorage (available from login)
      const userName = await AsyncStorage.getItem('userName');
      const companyName = await AsyncStorage.getItem('companyName');
      if (userName) setDisplayName(userName);
      if (companyName) setDisplayCompany(companyName);

      // Get user ID
      const storedUserId = await LoginManager.getStoredUserId();
      if (storedUserId) setUserId(storedUserId);

      const data = await UserDataManager.getUserData();
      if (data) {
        setUserData(data);
        // Update display values if userData has them
        if (data.name) setDisplayName(data.name);
        if (data.company) setDisplayCompany(data.company);
      } else {
        // Create default user data if none exists
        if (storedUserId) {
          const defaultData = await UserDataManager.createDefaultUserData(
            storedUserId,
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

  const handleUpdateProfile = () => {
    setShowSidebar(false);
    Alert.alert('Update Profile', 'Profile update functionality will be implemented');
  };

  const handleContactUs = () => {
    setShowSidebar(false);
    Alert.alert('Contact Us', 'Contact us functionality will be implemented');
  };

  const serviceCategories = [
    {
      id: 'emergency',
      title: 'Emergency',
      icon: 'medical-outline',
      color: '#ef4444', // Red for emergency
    },
    {
      id: 'doctor',
      title: 'Doctor',
      icon: 'medical-outline',
      color: '#0f766e', // Teal for doctor (theme color)
    },
    {
      id: 'hospital',
      title: 'Hospital',
      icon: 'business-outline',
      color: '#3b82f6', // Blue for hospital
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      icon: 'medical-outline',
      color: '#10b981', // Green for pharmacy
    },
    {
      id: 'report',
      title: 'Report',
      icon: 'document-outline',
      color: '#f59e0b', // Amber for report
    },
    {
      id: 'appointment',
      title: 'Appointment',
      icon: 'calendar-outline',
      color: '#8b5cf6', // Purple for appointment
    },
    {
      id: 'prescription',
      title: 'Prescription',
      icon: 'receipt-outline',
      color: '#ec4899', // Pink for prescription
    },
    {
      id: 'more',
      title: 'More',
      icon: 'ellipsis-horizontal-outline',
      color: '#6b7280', // Gray for more
    },
  ];

  const dcrCategories = [
    {
      id: 'daily-plan',
      title: 'Daily Plan',
      icon: 'calendar-outline',
      color: '#0f766e', // Teal for daily plan (theme color)
      onPress: () => navigation.navigate('DailyPlansForm'),
    },
    {
      id: 'call-report',
      title: 'Call Report',
      icon: 'call-outline',
      color: '#3b82f6', // Blue for call report
      onPress: () => navigation.navigate('DCR'),
    },
    {
      id: 'reminder',
      title: 'Reminder',
      icon: 'alarm-outline',
      color: '#f59e0b', // Amber for reminder
      onPress: () => handleReminderAction(),
    },
    {
      id: 'visit-plan',
      title: 'Visit Plan',
      icon: 'location-outline',
      color: '#10b981', // Green for visit plan
      onPress: () => {},
    },
  ];

  const reportsCategories = [
      {
        id: 'plan-history',
        title: 'Plan History',
        icon: 'time-outline',
        color: '#6366f1', // Indigo for plan history - professional and distinct
        onPress: () => navigation.navigate('PlanHistory'),
      },
    {
      id: 'visiting-history',
      title: 'Visiting History',
      icon: 'location-outline',
      color: '#06b6d4', // Cyan for visiting history - fresh and distinct
      onPress: () => {},
    },
    {
      id: 'products',
      title: 'Products',
      icon: 'cube-outline',
      color: '#ec4899', // Pink for products - unique and distinct
      onPress: () => navigation.navigate('Products'),
    },
    {
      id: 'more',
      title: 'More',
      icon: 'ellipsis-horizontal-outline',
      color: '#64748b', // Slate for more options - professional neutral
      onPress: () => navigation.navigate('ReportsMore'),
    },
  ];

  const bottomNavItems = [
    { id: 'home', title: 'Home', icon: 'home-outline', active: true },
    { id: 'report', title: 'Report', icon: 'document-outline', active: false },
    { id: 'dcr', title: 'DCR', icon: 'calendar-outline', active: false },
    { id: 'expense', title: 'Expense', icon: 'wallet-outline', active: false },
    { id: 'calendar', title: 'Calendar', icon: 'calendar-outline', active: false },
  ];

  if (!userData && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load user data</Text>
      </View>
    );
  }

  const handleReminderSubmit = async (data: any) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        return;
      }
      const formatDateForAPI = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

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
        // Don't save to local storage - API is the source of truth
        // Just refresh from API to get the updated list including the new reminder
        await loadHomePageData(); // Refresh home page data to get updated reminders from API
        Alert.alert('Success', response.createRemindar.message || 'Reminder set successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.createRemindar.message || 'Failed to create reminder.');
      }
    } catch (error: any) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', error.message || 'Failed to save reminder. Please try again.');
    }
  };


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
            {userData?.profileImage ? (
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
            <Text style={styles.userNameText}>{displayName || userData?.name || ''}</Text>
            {(displayCompany || userData?.company) && (
              <Text style={styles.companyText}>{displayCompany || userData?.company || ''}</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
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

      {loadingHomeData ? (
        <HomeSkeleton />
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0f766e']}
              tintColor="#0f766e"
            />
          }
        >
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Action</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('QuickActionEditor')}
            >
              <Ionicons name="create-outline" size={20} color="#0f766e" />
            </TouchableOpacity>
          </View>
          <View style={styles.serviceContainer}>
            {quickActionItems.length === 0 ? (
              <View style={styles.emptyQuickAction}>
                <Ionicons name="add-circle-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyQuickActionText}>No Quick Actions</Text>
                <Text style={styles.emptyQuickActionSubtext}>
                  Tap the edit icon to add Quick Actions
                </Text>
              </View>
            ) : (
              <View style={styles.serviceGrid}>
                {quickActionItems.map((service) => {
                  const isPressed = pressedServiceId === service.id;
                  const iconBackgroundColor = isPressed ? '#0f766e' : service.color;
                  const iconColor = isPressed ? 'white' : 'white';
                  
                  return (
                    <TouchableOpacity
                      key={service.id}
                      style={styles.serviceCard}
                      onPressIn={() => setPressedServiceId(service.id)}
                      onPressOut={() => setPressedServiceId(null)}
                      onPress={() => {
                        setPressedServiceId(null);
                        service.onPress();
                      }}
                      activeOpacity={1}
                    >
                      <View style={styles.serviceIconContainer}>
                        <View style={[styles.serviceIcon, { backgroundColor: iconBackgroundColor }]}>
                          <Ionicons name={service.icon as any} size={20} color={iconColor} />
                        </View>
                      </View>
                      <Text style={styles.serviceTitle}>{service.title}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
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
                onPress={() => navigation.navigate('DoctorChemistList', { listType: 'doctors' })}
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
                onPress={() => navigation.navigate('DoctorChemistList', { listType: 'chemists' })}
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
              {dcrCategories.map((dcr) => {
                const isPressed = pressedDcrId === dcr.id;
                const iconBackgroundColor = isPressed ? '#0f766e' : dcr.color;
                const iconColor = isPressed ? 'white' : 'white';
                
                return (
                  <TouchableOpacity
                    key={dcr.id}
                    style={styles.serviceCard}
                    onPressIn={() => setPressedDcrId(dcr.id)}
                    onPressOut={() => setPressedDcrId(null)}
                    onPress={() => {
                      setPressedDcrId(null);
                      dcr.onPress();
                    }}
                    activeOpacity={1}
                  >
                    <View style={styles.serviceIconContainer}>
                      <View style={[styles.serviceIcon, { backgroundColor: iconBackgroundColor }]}>
                        <Ionicons name={dcr.icon as any} size={20} color={iconColor} />
                      </View>
                    </View>
                    <Text style={styles.serviceTitle}>{dcr.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Reports */}
        <View style={styles.reportsSection}>
          <Text style={styles.sectionTitle}>Reports</Text>
          <View style={styles.reportsContainer}>
            <View style={styles.serviceGrid}>
              {reportsCategories.map((report) => {
                const isPressed = pressedReportsId === report.id;
                const iconBackgroundColor = isPressed ? '#0f766e' : report.color;
                const iconColor = isPressed ? 'white' : 'white';
                
                return (
                  <TouchableOpacity
                    key={report.id}
                    style={styles.serviceCard}
                    onPressIn={() => setPressedReportsId(report.id)}
                    onPressOut={() => setPressedReportsId(null)}
                    onPress={() => {
                      setPressedReportsId(null);
                      report.onPress();
                    }}
                    activeOpacity={1}
                  >
                    <View style={styles.serviceIconContainer}>
                      <View style={[styles.serviceIcon, { backgroundColor: iconBackgroundColor }]}>
                        <Ionicons name={report.icon as any} size={20} color={iconColor} />
                      </View>
                    </View>
                    <Text style={styles.serviceTitle}>{report.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        </ScrollView>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomNavItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.navItem, item.active && styles.activeNavItem]}
            onPress={() => {
              if (item.id === 'home') {
                // Already on Home screen, do nothing
                return;
              } else if (item.id === 'report') {
                navigation.navigate('ReportsMore');
              } else if (item.id === 'dcr') {
                navigation.navigate('DCR');
              } else if (item.id === 'expense') {
                navigation.navigate('ExpenseOverview');
              } else if (item.id === 'calendar') {
                navigation.navigate('Calendar');
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
        userData={userData ? {
          id: userData.id,
          name: userData.name,
          role: userData.role,
          email: userData.email,
          company: userData.company,
          profileImage: userData.profileImage,
          monthlyTarget: userData.monthlyTarget,
          monthlySale: userData.monthlySale,
          remainingDays: userData.remainingDays,
        } : { 
          id: userId, 
          name: displayName, 
          email: '', 
          company: displayCompany, 
          role: 'MR'
        }}
        onLogout={handleLogout}
        onChangePassword={handleChangePassword}
        onVerifyEmail={handleVerifyEmail}
        onSetNewMPIN={handleSetNewMPIN}
        onUpdateProfile={handleUpdateProfile}
        onContactUs={handleContactUs}
        onProfileImageUpdate={async (imageUri: string) => {
          // Reload user data to get updated profile image
          await loadUserData();
        }}
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
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
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
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: 0.5,
  },
  editButton: {
    padding: 4,
  },
  emptyQuickAction: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyQuickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyQuickActionSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  masterListSection: {
    marginBottom: 20,
  },
  masterListContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  reportsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
