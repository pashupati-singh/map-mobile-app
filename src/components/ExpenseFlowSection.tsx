import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

interface ExpenseFlowSectionProps {
  initialViewMode: 'daily' | 'weekly' | 'monthly' | 'quarterly' | '6months' | 'yearly';
  initialDate: Date;
}

export default function ExpenseFlowSection({ initialViewMode, initialDate }: ExpenseFlowSectionProps) {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedViewMode, setSelectedViewMode] = useState(initialViewMode);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Sync with parent component's date and viewMode changes
  useEffect(() => {
    setSelectedViewMode(initialViewMode);
    setSelectedDate(initialDate);
  }, [initialViewMode, initialDate]);

  // Mock expense data for different time periods
  const getExpenseData = () => {
    const data = [];
    const now = new Date(selectedDate);
    
    switch (selectedViewMode) {
      case 'daily':
        for (let i = 0; i < 30; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - 29 + i);
          data.push({
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            value: Math.random() * 50000 + 10000,
            fullDate: new Date(date),
          });
        }
        break;
      case 'weekly':
        for (let i = 0; i < 4; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - (3 - i) * 7);
          data.push({
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            value: Math.random() * 100000 + 50000,
            fullDate: new Date(date),
          });
        }
        break;
      case 'monthly':
        for (let i = 0; i < 12; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - 11 + i);
          data.push({
            date: date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
            value: Math.random() * 200000 + 100000,
            fullDate: new Date(date),
          });
        }
        break;
      case 'quarterly':
        // Indian fiscal year quarters: Q1 (Apr-Jun), Q2 (Jul-Sep), Q3 (Oct-Dec), Q4 (Jan-Mar)
        const currentMonth = now.getMonth(); // 0-11 (Jan=0, Dec=11)
        let currentQuarter: number;
        let currentYear = now.getFullYear();
        
        // Determine current quarter based on month
        if (currentMonth >= 3 && currentMonth <= 5) {
          currentQuarter = 1; // Apr-Jun
        } else if (currentMonth >= 6 && currentMonth <= 8) {
          currentQuarter = 2; // Jul-Sep
        } else if (currentMonth >= 9 && currentMonth <= 11) {
          currentQuarter = 3; // Oct-Dec
        } else {
          currentQuarter = 4; // Jan-Mar
          // For Q4, we're in the next fiscal year
          currentYear = now.getFullYear();
        }
        
        // Generate 4 quarters: current quarter and 3 previous quarters
        for (let i = 0; i < 4; i++) {
          let quarter = currentQuarter - i;
          let year = currentYear;
          
          // Handle year rollover for Q4
          if (quarter <= 0) {
            quarter += 4;
            year -= 1;
          }
          
          // Calculate start and end months for the quarter
          let startMonth: number, endMonth: number;
          if (quarter === 1) {
            startMonth = 3; // April (0-indexed: 3)
            endMonth = 5; // June (0-indexed: 5)
          } else if (quarter === 2) {
            startMonth = 6; // July (0-indexed: 6)
            endMonth = 8; // September (0-indexed: 8)
          } else if (quarter === 3) {
            startMonth = 9; // October (0-indexed: 9)
            endMonth = 11; // December (0-indexed: 11)
          } else {
            startMonth = 0; // January (0-indexed: 0)
            endMonth = 2; // March (0-indexed: 2)
          }
          
          const startDate = new Date(year, startMonth, 1);
          const endDate = new Date(year, endMonth + 1, 0);
          
          data.push({
            date: `${startDate.toLocaleDateString('en-GB', { month: 'short' })} - ${endDate.toLocaleDateString('en-GB', { month: 'short' })} ${year}`,
            value: Math.random() * 500000 + 200000,
            fullDate: new Date(year, startMonth, 1),
          });
        }
        break;
      case '6months':
        for (let i = 0; i < 6; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - 5 + i);
          data.push({
            date: date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
            value: Math.random() * 300000 + 150000,
            fullDate: new Date(date),
          });
        }
        break;
      case 'yearly':
        for (let i = 0; i < 5; i++) {
          const date = new Date(now);
          date.setFullYear(now.getFullYear() - 4 + i);
          data.push({
            date: date.getFullYear().toString(),
            value: Math.random() * 1000000 + 500000,
            fullDate: new Date(date),
          });
        }
        break;
    }
    return data;
  };

  const expenseData = getExpenseData();

  const chartData = {
    labels: expenseData.map(item => item.date),
    datasets: [{
      data: expenseData.map(item => item.value),
      color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
      strokeWidth: 2,
    }],
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
      case 'quarterly':
        const month = selectedDate.getMonth();
        let quarter: number;
        let year = selectedDate.getFullYear();
        
        // Determine quarter based on Indian fiscal year
        if (month >= 3 && month <= 5) {
          quarter = 1; // Apr-Jun
        } else if (month >= 6 && month <= 8) {
          quarter = 2; // Jul-Sep
        } else if (month >= 9 && month <= 11) {
          quarter = 3; // Oct-Dec
        } else {
          quarter = 4; // Jan-Mar
        }
        
        // Get quarter range
        let startMonth: number, endMonth: number;
        if (quarter === 1) {
          startMonth = 3; endMonth = 5;
        } else if (quarter === 2) {
          startMonth = 6; endMonth = 8;
        } else if (quarter === 3) {
          startMonth = 9; endMonth = 11;
        } else {
          startMonth = 0; endMonth = 2;
        }
        
        const startDate = new Date(year, startMonth, 1);
        const endDate = new Date(year, endMonth + 1, 0);
        return `${startDate.toLocaleDateString('en-GB', { month: 'short' })} - ${endDate.toLocaleDateString('en-GB', { month: 'short' })} ${year}`;
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
      case 'quarterly':
        // Move to the start of the next/previous quarter
        const currentMonth = newDate.getMonth();
        let currentQuarter: number;
        let currentYear = newDate.getFullYear();
        
        // Determine current quarter
        if (currentMonth >= 3 && currentMonth <= 5) {
          currentQuarter = 1; // Apr-Jun
        } else if (currentMonth >= 6 && currentMonth <= 8) {
          currentQuarter = 2; // Jul-Sep
        } else if (currentMonth >= 9 && currentMonth <= 11) {
          currentQuarter = 3; // Oct-Dec
        } else {
          currentQuarter = 4; // Jan-Mar
        }
        
        // Calculate next/previous quarter
        let nextQuarter = currentQuarter + (direction === 'next' ? 1 : -1);
        let nextYear = currentYear;
        
        // Handle year rollover
        if (nextQuarter > 4) {
          nextQuarter = 1;
          nextYear += 1;
        } else if (nextQuarter < 1) {
          nextQuarter = 4;
          nextYear -= 1;
        }
        
        // Set to the first month of the quarter
        let startMonth: number;
        if (nextQuarter === 1) {
          startMonth = 3; // April
        } else if (nextQuarter === 2) {
          startMonth = 6; // July
        } else if (nextQuarter === 3) {
          startMonth = 9; // October
        } else {
          startMonth = 0; // January
        }
        
        newDate.setFullYear(nextYear);
        newDate.setMonth(startMonth);
        newDate.setDate(1);
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
        months.push(new Date(startDate));
        break;
      case 'quarterly':
        // Determine which quarter the selectedDate is in
        const month = startDate.getMonth();
        let quarter: number;
        let year = startDate.getFullYear();
        
        // Determine quarter based on Indian fiscal year
        if (month >= 3 && month <= 5) {
          quarter = 1; // Apr-Jun
        } else if (month >= 6 && month <= 8) {
          quarter = 2; // Jul-Sep
        } else if (month >= 9 && month <= 11) {
          quarter = 3; // Oct-Dec
        } else {
          quarter = 4; // Jan-Mar
        }
        
        // Get the 3 months for this quarter
        let startMonth: number;
        if (quarter === 1) {
          startMonth = 3; // April
        } else if (quarter === 2) {
          startMonth = 6; // July
        } else if (quarter === 3) {
          startMonth = 9; // October
        } else {
          startMonth = 0; // January
        }
        
        // Add the 3 months of the quarter
        for (let i = 0; i < 3; i++) {
          const quarterMonth = new Date(year, startMonth + i, 1);
          months.push(quarterMonth);
        }
        break;
      case '6months':
        for (let i = 0; i < 6; i++) {
          const month = new Date(startDate);
          month.setMonth(startDate.getMonth() + i);
          months.push(month);
        }
        break;
      case 'yearly':
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
    for (let i = 0; i < startDay; i++) {
      calendar.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const expense = Math.random() * 50000 + 10000;
      calendar.push({
        day,
        date,
        expense: Math.random() > 0.7 ? expense : 0,
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
    <>
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
                  { key: 'quarterly', label: 'QUARTERLY' },
                  { key: '6months', label: '6 MONTHS' },
                  { key: 'yearly', label: 'YEARLY' },
                ].map((option) => {
                  // Check if selected (handle old q1, q2, q3, q4 values)
                  const isSelected = selectedViewMode === option.key || 
                    (option.key === 'quarterly' && ['q1', 'q2', 'q3', 'q4'].includes(selectedViewMode));
                  
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={styles.viewModeOption}
                      onPress={() => {
                        setSelectedViewMode(option.key as any);
                        setShowFilterModal(false);
                      }}
                    >
                      <Text style={styles.viewModeText}>{option.label}</Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#0f766e" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
});

