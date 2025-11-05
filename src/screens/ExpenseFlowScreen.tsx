import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type ExpenseFlowScreenRouteProp = RouteProp<RootStackParamList, 'ExpenseFlow'>;
type ExpenseFlowScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpenseFlow'>;

export default function ExpenseFlowScreen() {
  const route = useRoute<ExpenseFlowScreenRouteProp>();
  const navigation = useNavigation<ExpenseFlowScreenNavigationProp>();
  const { viewMode: initialViewMode, currentDate: initialDate } = route.params;
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedViewMode, setSelectedViewMode] = useState(initialViewMode);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Debug modal state
  console.log('Modal should be visible:', showFilterModal);

  // Mock expense data for different time periods
  const getExpenseData = () => {
    const data = [];
    const now = new Date(selectedDate);
    
    switch (selectedViewMode) {
      case 'daily':
        // Generate data for one month
        for (let i = 0; i < 30; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - 29 + i);
          data.push({
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            value: Math.random() * 50000 + 10000, // Random expense between 10k-60k
            fullDate: new Date(date),
          });
        }
        break;
      case 'weekly':
        // Generate data for 4 weeks
        for (let i = 0; i < 4; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - (3 - i) * 7);
          data.push({
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            value: Math.random() * 100000 + 50000, // Random expense between 50k-150k
            fullDate: new Date(date),
          });
        }
        break;
      case 'monthly':
        // Generate data for 12 months
        for (let i = 0; i < 12; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - 11 + i);
          data.push({
            date: date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
            value: Math.random() * 200000 + 100000, // Random expense between 100k-300k
            fullDate: new Date(date),
          });
        }
        break;
      case 'q1':
      case 'q2':
      case 'q3':
      case 'q4':
        // Generate data for 4 quarters
        for (let i = 0; i < 4; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - (3 - i) * 3);
          data.push({
            date: `Q${i + 1} ${date.getFullYear()}`,
            value: Math.random() * 500000 + 200000, // Random expense between 200k-700k
            fullDate: new Date(date),
          });
        }
        break;
      case '6months':
        // Generate data for 6 months
        for (let i = 0; i < 6; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - 5 + i);
          data.push({
            date: date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
            value: Math.random() * 300000 + 150000, // Random expense between 150k-450k
            fullDate: new Date(date),
          });
        }
        break;
      case 'yearly':
        // Generate data for 5 years
        for (let i = 0; i < 5; i++) {
          const date = new Date(now);
          date.setFullYear(now.getFullYear() - 4 + i);
          data.push({
            date: date.getFullYear().toString(),
            value: Math.random() * 1000000 + 500000, // Random expense between 500k-1.5M
            fullDate: new Date(date),
          });
        }
        break;
    }
    
    return data;
  };

  const expenseData = getExpenseData();

  // Prepare chart data
  const chartData = {
    labels: expenseData.map(item => item.date),
    datasets: [
      {
        data: expenseData.map(item => item.value),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red color for expenses
        strokeWidth: 2,
      },
    ],
  };

  const getDisplayText = () => {
    switch (selectedViewMode) {
      case 'daily':
        return selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'weekly':
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}`;
      case 'monthly':
        return selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      case 'q1':
        return `Q1 ${selectedDate.getFullYear()}`;
      case 'q2':
        return `Q2 ${selectedDate.getFullYear()}`;
      case 'q3':
        return `Q3 ${selectedDate.getFullYear()}`;
      case 'q4':
        return `Q4 ${selectedDate.getFullYear()}`;
      case '6months':
        return `${selectedDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} - ${new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 5).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
      case 'yearly':
        return selectedDate.getFullYear().toString();
      default:
        return selectedDate.getFullYear().toString();
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    switch (selectedViewMode) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'q1':
      case 'q2':
      case 'q3':
      case 'q4':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case '6months':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 6 : -6));
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setSelectedDate(newDate);
  };

  const getCalendarMonths = () => {
    const months = [];
    const startDate = new Date(selectedDate);
    
    switch (selectedViewMode) {
      case 'daily':
      case 'weekly':
      case 'monthly':
        // Show one month
        months.push(new Date(startDate));
        break;
      case 'q1':
      case 'q2':
      case 'q3':
      case 'q4':
        // Show 3 months
        for (let i = 0; i < 3; i++) {
          const month = new Date(startDate);
          month.setMonth(startDate.getMonth() + i);
          months.push(month);
        }
        break;
      case '6months':
        // Show 6 months
        for (let i = 0; i < 6; i++) {
          const month = new Date(startDate);
          month.setMonth(startDate.getMonth() + i);
          months.push(month);
        }
        break;
      case 'yearly':
        // Show 12 months
        for (let i = 0; i < 12; i++) {
          const month = new Date(startDate);
          month.setMonth(startDate.getMonth() + i);
          months.push(month);
        }
        break;
    }
    
    return months;
  };

  const getCalendarData = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    const calendar = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      calendar.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const expense = Math.random() * 50000 + 10000; // Random expense for each day
      calendar.push({
        day,
        date,
        expense: Math.random() > 0.7 ? expense : 0, // 30% chance of having an expense
      });
    }
    
    return calendar;
  };

  const formatExpenseValue = (value: number) => {
    if (value >= 1000) {
      return `-${(value / 1000).toFixed(1)}k`;
    }
    return `-${value.toFixed(0)}`;
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <LinearGradient
      colors={['#f8fafc', '#f1f5f9', '#e2e8f0']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f766e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Flow</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#0f766e" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Navigation */}
        <View style={styles.yearSection}>
          <TouchableOpacity 
            style={styles.yearArrow}
            onPress={() => handleDateChange('prev')}
          >
            <Ionicons name="chevron-back" size={24} color="#0f766e" />
          </TouchableOpacity>
          <Text style={styles.yearText}>{getDisplayText()}</Text>
          <TouchableOpacity 
            style={styles.yearArrow}
            onPress={() => handleDateChange('next')}
          >
            <Ionicons name="chevron-forward" size={24} color="#0f766e" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {
              console.log('Filter button pressed, opening modal');
              setShowFilterModal(true);
            }}
          >
            <Ionicons name="options-outline" size={20} color="#0f766e" />
          </TouchableOpacity>
        </View>

        {/* Financial Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>EXPENSE</Text>
            <Text style={styles.expenseValue}>₹{expenseData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TARGET</Text>
            <Text style={styles.targetValue}>₹500,000</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>SALES</Text>
            <Text style={styles.salesValue}>₹425,000</Text>
          </View>
        </View>

        {/* Expense Flow Button */}
        <View style={styles.flowButtonContainer}>
          <TouchableOpacity style={styles.flowButton}>
            <Ionicons name="checkmark" size={16} color="#0f766e" />
            <Text style={styles.flowButtonText}>EXPENSE FLOW</Text>
          </TouchableOpacity>
        </View>

        {/* Line Chart */}
        <View style={styles.chartSection}>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#ef4444',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          {getCalendarMonths().map((month, monthIndex) => (
            <View key={monthIndex} style={styles.monthContainer}>
              <Text style={styles.monthTitle}>
                {month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </Text>
              <View style={styles.calendarGrid}>
                {/* Days of week header */}
                <View style={styles.weekHeader}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} style={styles.weekDayText}>{day}</Text>
                  ))}
                </View>
                
                {/* Calendar days */}
                <View style={styles.calendarDays}>
                  {getCalendarData(month).map((dayData, dayIndex) => (
                    <View key={dayIndex} style={styles.calendarDay}>
                      {dayData ? (
                        <>
                          <Text style={styles.dayNumber}>{dayData.day}</Text>
                          {dayData.expense > 0 && (
                            <Text style={styles.expenseText}>
                              {formatExpenseValue(dayData.expense)}
                            </Text>
                          )}
                        </>
                      ) : (
                        <View />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Display Options</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#0f766e" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSectionTitle}>View mode:</Text>
              <View style={styles.viewModeOptions}>
                {[
                  { key: 'daily', label: 'DAILY' },
                  { key: 'weekly', label: 'WEEKLY' },
                  { key: 'monthly', label: 'MONTHLY' },
                  { key: 'q1', label: '1 QUARTERLY' },
                  { key: 'q2', label: '2 QUARTERLY' },
                  { key: 'q3', label: '3 QUARTERLY' },
                  { key: 'q4', label: '4 QUARTERLY' },
                  { key: '6months', label: '6 MONTHS' },
                  { key: 'yearly', label: 'YEARLY' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={styles.viewModeOption}
                    onPress={() => {
                      console.log('Selected view mode:', option.key);
                      setSelectedViewMode(option.key as any);
                      setShowFilterModal(false);
                    }}
                  >
                    <Text style={styles.viewModeText}>{option.label}</Text>
                    {selectedViewMode === option.key && (
                      <Ionicons name="checkmark" size={20} color="#0f766e" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
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
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  yearSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  yearArrow: {
    padding: 8,
  },
  yearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 20,
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  targetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  salesValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  flowButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  flowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  flowButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
    marginLeft: 8,
  },
  chartSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  calendarSection: {
    marginBottom: 20,
  },
  monthContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  calendarGrid: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  expenseText: {
    fontSize: 8,
    color: '#ef4444',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  modalContent: {
    maxHeight: 400,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  viewModeOptions: {
    gap: 8,
  },
  viewModeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
