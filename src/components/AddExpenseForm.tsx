import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import CurvedHeader from './CurvedHeader';
import { gqlFetch } from '../api/graphql';
import { CREATE_DEFAULT_MUTATION, CREATE_EXPENSE_MUTATION } from '../graphql/mutation/expense';
import { GET_DEFAULT_BY_USER_ID_QUERY, GET_EXPENSE_BY_MONTHS_QUERY } from '../graphql/query/expense';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonLoader from './ButtonLoader';
import CustomLoader from './CustomLoader';

type AddExpenseFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;
type AddExpenseFormRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;

export interface ExpenseData {
  dates: Date[];
  ta: string;
  da: string;
  ha: string;
  ca: string;
  oa: string;
  misc: string;
  miscReason: string;
}

export default function AddExpenseForm() {
  const navigation = useNavigation<AddExpenseFormNavigationProp>();
  const route = useRoute<AddExpenseFormRouteProp>();
  const mode = route.params?.mode || 'add';
  const isSettingsMode = mode === 'settings';
  const [step, setStep] = useState<1 | 2>(isSettingsMode ? 1 : 1);
  const [selectedExpenseDate, setSelectedExpenseDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [taAmount, setTaAmount] = useState('');
  const [daAmount, setDaAmount] = useState('');
  const [haAmount, setHaAmount] = useState('');
  const [caAmount, setCaAmount] = useState('');
  const [oaAmount, setOaAmount] = useState('');
  const [miscAmount, setMiscAmount] = useState('');
  const [miscReason, setMiscReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);
  const [defaultExpenseData, setDefaultExpenseData] = useState<{
    id: number;
    ta: number;
    da: number;
    ha: number;
    ca: number;
    oa: number;
  } | null>(null);
  const [existingExpenseDates, setExistingExpenseDates] = useState<Date[]>([]);
  const [isLoadingExistingDates, setIsLoadingExistingDates] = useState(false);
  const [currentMonthExpenseData, setCurrentMonthExpenseData] = useState<{
    isCompleted: boolean;
    ExpenseMonth: string;
  } | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const calendarDayWidth = (screenWidth - 40) / 7 - 4; // Reduced size with spacing

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return isSameDay(date, today);
  };

  const isFutureDate = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date) return false;
    return selectedDates.some(selectedDate => isSameDay(date, selectedDate));
  };

  const hasExistingExpense = (date: Date | null) => {
    if (!date) return false;
    return existingExpenseDates.some(existingDate => isSameDay(date, existingDate));
  };

  const toggleDateSelection = (date: Date) => {
    // Prevent selection of future dates
    if (isFutureDate(date)) {
      return;
    }
    
    // Prevent selection of dates that already have expenses
    if (hasExistingExpense(date)) {
      return;
    }
    
    if (isDateSelected(date)) {
      setSelectedDates(selectedDates.filter(d => !isSameDay(d, date)));
    } else {
      // Only allow dates from the same month
      const currentMonth = selectedExpenseDate.getMonth();
      const currentYear = selectedExpenseDate.getFullYear();
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  const isNextMonthFuture = () => {
    const nextMonth = new Date(selectedExpenseDate.getFullYear(), selectedExpenseDate.getMonth() + 1, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth > today;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedExpenseDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      // Prevent navigating to future months
      if (isNextMonthFuture()) {
        return;
      }
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedExpenseDate(newDate);
    // Reset current month expense data when changing months
    setCurrentMonthExpenseData(null);
    // Fetch existing dates for the new month
    if (step === 2 && !isSettingsMode) {
      fetchExistingExpenseDates(newDate);
    }
  };

  // Function to format date as dd/mm/yyyy
  const formatDateForQuery = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to get first day of current month
  const getFirstDayOfMonth = (date: Date): string => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return formatDateForQuery(firstDay);
  };

  // Fetch existing expense dates for a specific month
  const fetchExistingExpenseDates = async (monthDate?: Date) => {
    if (isSettingsMode) return; // Don't fetch in settings mode
    
    try {
      setIsLoadingExistingDates(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setIsLoadingExistingDates(false);
        return;
      }

      // Use provided date or current selectedExpenseDate
      const dateToUse = monthDate || selectedExpenseDate;
      // Get first day of current month
      const firstDayOfMonth = getFirstDayOfMonth(dateToUse);
      const dates = [firstDayOfMonth];

      type GetExpenseByMonthsResponse = {
        getExpenseByMonths: {
          code: number;
          success: boolean;
          message: string;
          data: Array<{
            ExpenseMonth: string;
            amount: number;
            isApproved: boolean;
            isCompleted: boolean;
            details: Array<{
              date: string;
              total: number;
              expenseId: number;
              id: number;
            }>;
          }>;
        };
      };

      const response = await gqlFetch<GetExpenseByMonthsResponse>(
        GET_EXPENSE_BY_MONTHS_QUERY,
        { dates },
        token
      );

      if (response.getExpenseByMonths.success && response.getExpenseByMonths.data) {
        // Extract all dates from details array
        const datesList: Date[] = [];
        // Find the expense data for the current month
        const monthData = response.getExpenseByMonths.data.find(data => {
          // Check if any detail date falls in the current month
          return data.details.some(detail => {
            const detailDate = new Date(parseInt(detail.date));
            return detailDate.getFullYear() === dateToUse.getFullYear() && 
                   detailDate.getMonth() === dateToUse.getMonth();
          });
        });
        
        if (monthData) {
          // Store month expense data to check isCompleted
          setCurrentMonthExpenseData({
            isCompleted: monthData.isCompleted,
            ExpenseMonth: monthData.ExpenseMonth,
          });
          
          // If month is completed, add all dates of the month to prevent selection
          if (monthData.isCompleted) {
            const year = dateToUse.getFullYear();
            const month = dateToUse.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month, day);
              date.setHours(0, 0, 0, 0);
              datesList.push(date);
            }
          } else {
            // Only add specific dates that have expenses
            monthData.details.forEach((detail) => {
              const dateTimestamp = parseInt(detail.date);
              const expenseDate = new Date(dateTimestamp);
              expenseDate.setHours(0, 0, 0, 0);
              datesList.push(expenseDate);
            });
          }
        } else {
          setCurrentMonthExpenseData(null);
        }
        setExistingExpenseDates(datesList);
      } else {
        setExistingExpenseDates([]);
        setCurrentMonthExpenseData(null);
      }
    } catch (error: any) {
      console.error('Error fetching existing expense dates:', error);
      setExistingExpenseDates([]);
    } finally {
      setIsLoadingExistingDates(false);
    }
  };

  const handleNext = () => {
    setStep(2);
    // Fetch existing expense dates when moving to step 2
    fetchExistingExpenseDates();
  };

  // Function to apply default expense data (uses already fetched data)
  const applyDefaults = () => {
    if (defaultExpenseData) {
      // Auto-fill form fields with stored default data
      setTaAmount(defaultExpenseData.ta ? String(defaultExpenseData.ta) : '');
      setDaAmount(defaultExpenseData.da ? String(defaultExpenseData.da) : '');
      setHaAmount(defaultExpenseData.ha ? String(defaultExpenseData.ha) : '');
      setCaAmount(defaultExpenseData.ca ? String(defaultExpenseData.ca) : '');
      setOaAmount(defaultExpenseData.oa ? String(defaultExpenseData.oa) : '');
    } else {
      // Show message if no default data exists
      Alert.alert('Info', 'No default expense settings found. Please set defaults first.');
    }
  };

  // Function to format date as dd/mm/yyyy
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleCreate = async () => {
    if (!isSettingsMode && selectedDates.length === 0) {
      Alert.alert('Validation', 'Please select at least one date.');
      return;
    }

    const expenseData: ExpenseData = {
      dates: isSettingsMode ? [] : selectedDates,
      ta: taAmount,
      da: daAmount,
      ha: haAmount,
      ca: caAmount,
      oa: oaAmount,
      misc: isSettingsMode ? '' : miscAmount,
      miscReason: isSettingsMode ? '' : miscReason,
    };

    // Handle save logic here (you can add API call, etc.)
    if (isSettingsMode) {
      // Call GraphQL mutation for default expense
      setIsSubmitting(true);
      Keyboard.dismiss();
      
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'Authentication token not found. Please login again.');
          setIsSubmitting(false);
          return;
        }

        // Convert string values to numbers
        const mutationData = {
          data: {
            ta: parseFloat(taAmount) || 0,
            da: parseFloat(daAmount) || 0,
            ha: parseFloat(haAmount) || 0,
            ca: parseFloat(caAmount) || 0,
            oa: parseFloat(oaAmount) || 0,
          },
        };

        type CreateDefaultResponse = {
          createDefault: {
            code: number;
            success: boolean;
            message: string;
          };
        };

        const response = await gqlFetch<CreateDefaultResponse>(
          CREATE_DEFAULT_MUTATION,
          mutationData,
          token
        );

        if (response.createDefault.success) {
          Alert.alert('Success', response.createDefault.message || 'Default expense settings saved successfully!', [
            {
              text: 'OK',
              onPress: () => {
                // Reset form and navigate back
                setStep(1);
                setTaAmount('');
                setDaAmount('');
                setHaAmount('');
                setCaAmount('');
                setOaAmount('');
                setMiscAmount('');
                setMiscReason('');
                setSelectedExpenseDate(new Date());
                setSelectedDates([]);
                navigation.goBack();
              },
            },
          ]);
        } else {
          Alert.alert('Error', response.createDefault.message || 'Failed to save default expense settings.');
          setIsSubmitting(false);
        }
      } catch (error: any) {
        console.error('Error saving default expense:', error);
        Alert.alert('Error', error.message || 'Failed to save default expense settings. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      // Call GraphQL mutation for creating expense
      setIsSubmitting(true);
      Keyboard.dismiss();
      
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'Authentication token not found. Please login again.');
          setIsSubmitting(false);
          return;
        }

        // Format dates as dd/mm/yyyy
        const formattedDates = selectedDates.map(date => formatDate(date));

        // Convert string values to numbers and prepare mutation data
        const mutationData = {
          data: {
            ta: parseFloat(taAmount) || 0,
            da: parseFloat(daAmount) || 0,
            ha: parseFloat(haAmount) || 0,
            ca: parseFloat(caAmount) || 0,
            oa: parseFloat(oaAmount) || 0,
            miscellaneous: parseFloat(miscAmount) || 0,
            reason: miscReason || '',
            dates: formattedDates,
          },
        };

        type CreateExpenseResponse = {
          createExpense: {
            code: number;
            success: boolean;
            message: string;
          };
        };

        const response = await gqlFetch<CreateExpenseResponse>(
          CREATE_EXPENSE_MUTATION,
          mutationData,
          token
        );

        if (response.createExpense.success) {
          Alert.alert('Success', response.createExpense.message || 'Expense created successfully!', [
            {
              text: 'OK',
              onPress: () => {
                // Reset form and navigate back
                setStep(1);
                setTaAmount('');
                setDaAmount('');
                setHaAmount('');
                setCaAmount('');
                setOaAmount('');
                setMiscAmount('');
                setMiscReason('');
                setSelectedExpenseDate(new Date());
                setSelectedDates([]);
                navigation.goBack();
              },
            },
          ]);
        } else {
          Alert.alert('Error', response.createExpense.message || 'Failed to create expense.');
          setIsSubmitting(false);
        }
      } catch (error: any) {
        console.error('Error creating expense:', error);
        Alert.alert('Error', error.message || 'Failed to create expense. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  const handleSave = () => {
    // For settings mode, save directly without calendar
    handleCreate();
  };

  const handleBack = () => {
    if (!isSettingsMode && step === 2) {
      setStep(1);
    } else {
      // Reset form and navigate back
      setStep(1);
      setTaAmount('');
      setDaAmount('');
      setHaAmount('');
      setCaAmount('');
      setOaAmount('');
      setMiscAmount('');
      setMiscReason('');
      setSelectedExpenseDate(new Date());
      setSelectedDates([]);
      navigation.goBack();
    }
  };

  // Fetch default expense data when form opens
  useEffect(() => {
    const fetchDefaultExpense = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          return;
        }

        type GetDefaultByUserIdResponse = {
          getDefaultByUserId: {
            success: boolean;
            message: string;
            data: {
              id: number;
              ta: number;
              da: number;
              ha: number;
              ca: number;
              oa: number;
            } | null;
            code: number;
          };
        };

        const response = await gqlFetch<GetDefaultByUserIdResponse>(
          GET_DEFAULT_BY_USER_ID_QUERY,
          {},
          token
        );

        if (response.getDefaultByUserId.success && response.getDefaultByUserId.data) {
          // Store the default expense data
          setDefaultExpenseData(response.getDefaultByUserId.data);
          
          // If in settings mode, auto-fill the form
          if (isSettingsMode) {
            const data = response.getDefaultByUserId.data;
            setTaAmount(data.ta ? String(data.ta) : '');
            setDaAmount(data.da ? String(data.da) : '');
            setHaAmount(data.ha ? String(data.ha) : '');
            setCaAmount(data.ca ? String(data.ca) : '');
            setOaAmount(data.oa ? String(data.oa) : '');
          }
        } else {
          setDefaultExpenseData(null);
        }
      } catch (error: any) {
        console.error('Error fetching default expense:', error);
        setDefaultExpenseData(null);
        // In settings mode, show error; in add mode, silently fail (button won't show)
        if (isSettingsMode) {
          // Don't show alert on error, just allow user to create new defaults
        }
      }
    };

    if (isSettingsMode) {
      // In settings mode, show loader and fetch data
      setIsLoading(true);
      fetchDefaultExpense().finally(() => {
        setIsLoading(false);
      });
    } else {
      // In add mode, fetch data with button loader
      setIsLoadingDefaults(true);
      fetchDefaultExpense().finally(() => {
        setIsLoadingDefaults(false);
      });
      // Reset form when not in settings mode
      setStep(1);
      setSelectedDates([]);
      setSelectedExpenseDate(new Date());
      setTaAmount('');
      setDaAmount('');
      setHaAmount('');
      setCaAmount('');
      setOaAmount('');
      setMiscAmount('');
      setMiscReason('');
    }
  }, [isSettingsMode]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <CurvedHeader
          title={isSettingsMode ? "Set Default Expense" : "Add Expense"}
          onBack={handleBack}
          showBackButton={true}
        />
        
        <View style={styles.content}>
          {isLoading && isSettingsMode ? (
            <View style={styles.loadingContainer}>
              <CustomLoader size={48} color="#0f766e" />
            </View>
          ) : (
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
              scrollEventThrottle={20}
              nestedScrollEnabled={true}
              decelerationRate="normal"
            >
              {step === 1 ? (
                <>
                  {/* Default Expense Button - Always show in add mode */}
                  {!isSettingsMode && (
                    <View style={styles.defaultExpenseButtonContainer}>
                      <TouchableOpacity
                        style={[styles.defaultExpenseButton, isLoadingDefaults && { opacity: 0.7 }]}
                        onPress={applyDefaults}
                        disabled={isLoadingDefaults}
                      >
                        {isLoadingDefaults ? (
                          <ButtonLoader size={16} color="#0f766e" />
                        ) : (
                          <>
                            <Ionicons name="copy-outline" size={18} color="#0f766e" />
                            <Text style={styles.defaultExpenseButtonText}>Use Default Expense</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Input Fields Section */}
              <View style={styles.expenseInputSection}>
                <View style={styles.expenseInputRow}>
                  <Text style={styles.expenseInputLabel}>TA – Travelling Allowance</Text>
                  <TextInput
                    style={styles.expenseInput}
                    placeholder="Enter amount"
                    value={taAmount}
                    onChangeText={setTaAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.expenseInputRow}>
                  <Text style={styles.expenseInputLabel}>DA – Daily Allowance</Text>
                  <TextInput
                    style={styles.expenseInput}
                    placeholder="Enter amount"
                    value={daAmount}
                    onChangeText={setDaAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.expenseInputRow}>
                  <Text style={styles.expenseInputLabel}>HA – Hotel / Lodging Allowance</Text>
                  <TextInput
                    style={styles.expenseInput}
                    placeholder="Enter amount"
                    value={haAmount}
                    onChangeText={setHaAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.expenseInputRow}>
                  <Text style={styles.expenseInputLabel}>CA – Conveyance Allowance (Local)</Text>
                  <TextInput
                    style={styles.expenseInput}
                    placeholder="Enter amount"
                    value={caAmount}
                    onChangeText={setCaAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.expenseInputRow}>
                  <Text style={styles.expenseInputLabel}>OA / NA – Outstation / Night Halt Allowance</Text>
                  <TextInput
                    style={styles.expenseInput}
                    placeholder="Enter amount"
                    value={oaAmount}
                    onChangeText={setOaAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {!isSettingsMode && (
                  <>
                    <View style={styles.expenseInputRow}>
                      <Text style={styles.expenseInputLabel}>Miscellaneous</Text>
                      <TextInput
                        style={styles.expenseInput}
                        placeholder="Enter amount"
                        value={miscAmount}
                        onChangeText={setMiscAmount}
                        keyboardType="numeric"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    <View style={styles.expenseInputRow}>
                      <Text style={styles.expenseInputLabel}>Miscellaneous Reason</Text>
                      <TextInput
                        style={[styles.expenseInput, styles.expenseInputMultiline]}
                        placeholder="Enter reason"
                        value={miscReason}
                        onChangeText={setMiscReason}
                        multiline
                        numberOfLines={3}
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </>
                )}
              </View>

                  {/* Next Button for Add mode, Save Button for Settings mode */}
                  {isSettingsMode ? (
                    <TouchableOpacity
                      style={[styles.expenseSaveButton, isSubmitting && { opacity: 0.7 }]}
                      onPress={handleSave}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ButtonLoader size={20} variant="white" />
                      ) : (
                        <Text style={styles.expenseSaveButtonText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.expenseSaveButton}
                      onPress={handleNext}
                    >
                      <Text style={styles.expenseSaveButtonText}>Next</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  {/* Calendar Section */}
                  <View style={styles.calendarSection}>
                    {/* Loading indicator for existing dates */}
                    {isLoadingExistingDates && (
                      <View style={styles.calendarLoaderContainer}>
                        <ButtonLoader size={16} color="#0f766e" />
                        <Text style={styles.calendarLoaderText}>Loading existing expenses...</Text>
                      </View>
                    )}
                    {/* Message if month is completed */}
                    {currentMonthExpenseData?.isCompleted && (
                      <View style={styles.monthCompletedMessage}>
                        <Ionicons name="information-circle" size={20} color="#f59e0b" />
                        <Text style={styles.monthCompletedMessageText}>
                          You already submit expense of this month
                        </Text>
                      </View>
                    )}
                    {/* Month Navigation Header */}
                    <View style={styles.calendarHeader}>
                      <TouchableOpacity
                        style={styles.calendarArrowButton}
                        onPress={() => changeMonth('prev')}
                      >
                        <Ionicons name="chevron-back" size={24} color="#0f766e" />
                      </TouchableOpacity>
                      <Text style={styles.calendarMonthText}>
                        {selectedExpenseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </Text>
                      <TouchableOpacity
                        style={styles.calendarArrowButton}
                        onPress={() => changeMonth('next')}
                        disabled={isNextMonthFuture()}
                      >
                        <Ionicons 
                          name="chevron-forward" 
                          size={24} 
                          color={isNextMonthFuture() ? '#9ca3af' : '#0f766e'} 
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.calendarWeekDays}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <View key={day} style={styles.calendarWeekDay}>
                          <Text style={styles.calendarWeekDayText}>{day}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.calendarGrid}>
                      {getDaysInMonth(selectedExpenseDate).map((date, index) => {
                        const isSelected = date ? isDateSelected(date) : false;
                        const dayIsToday = date ? isToday(date) : false;
                        const isFuture = date ? isFutureDate(date) : false;
                        const hasExpense = date ? hasExistingExpense(date) : false;
                        const isMonthCompleted = currentMonthExpenseData?.isCompleted ?? false;
                        return (
                          <TouchableOpacity
                            key={date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : `empty-${index}`}
                            style={[
                              styles.calendarDay,
                              { width: calendarDayWidth, height: calendarDayWidth },
                              date && isSelected && styles.calendarDaySelected,
                              date && dayIsToday && !isSelected && !hasExpense && !isMonthCompleted && styles.calendarDayToday,
                              date && isFuture && styles.calendarDayFuture,
                              date && (hasExpense || isMonthCompleted) && styles.calendarDayHasExpense,
                            ]}
                            onPress={() => date && toggleDateSelection(date)}
                            disabled={!date || isFuture || hasExpense || isMonthCompleted}
                            activeOpacity={0.7}
                          >
                            {date && (
                              <Text
                                style={[
                                  styles.calendarDayText,
                                  isSelected && styles.calendarDayTextSelected,
                                  dayIsToday && !isSelected && !hasExpense && !isMonthCompleted && styles.calendarDayTextToday,
                                  isFuture && styles.calendarDayTextFuture,
                                  (hasExpense || isMonthCompleted) && styles.calendarDayTextHasExpense,
                                ]}
                              >
                                {date.getDate()}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {selectedDates.length > 0 && (
                      <Text style={styles.selectedDatesText}>
                        {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                      </Text>
                    )}
                  </View>

                  {/* Create Button */}
                  <TouchableOpacity
                    style={[styles.expenseSaveButton, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleCreate}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ButtonLoader size={20} variant="white" />
                    ) : (
                      <Text style={styles.expenseSaveButtonText}>Create</Text>
                    )}
                  </TouchableOpacity>
                </>
            )}
          </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
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
  calendarSection: {
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  calendarArrowButton: {
    padding: 4,
    borderRadius: 8,
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarWeekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarWeekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    marginHorizontal: 2,
  },
  calendarDaySelected: {
    backgroundColor: '#0f766e',
    borderRadius: 20,
  },
  calendarDayToday: {
    backgroundColor: '#d1fae5',
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#1f2937',
  },
  calendarDayFuture: {
    opacity: 0.4,
  },
  calendarDayTextFuture: {
    color: '#9ca3af',
  },
  calendarDayHasExpense: {
    backgroundColor: '#fee2e2',
    borderRadius: 20,
    opacity: 0.6,
  },
  calendarDayTextHasExpense: {
    color: '#dc2626',
    textDecorationLine: 'line-through',
  },
  calendarDayTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  calendarDayTextToday: {
    color: '#0f766e',
    fontWeight: '600',
  },
  selectedDatesText: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  calendarLoaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  calendarLoaderText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  monthCompletedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  monthCompletedMessageText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  expenseInputSection: {
    padding: 20,
  },
  expenseInputRow: {
    marginBottom: 20,
  },
  expenseInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  expenseInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  expenseInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  expenseSaveButton: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseSaveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultExpenseButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  defaultExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  defaultExpenseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
  },
});


