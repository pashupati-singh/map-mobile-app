import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ReminderManager, UserReminder } from '../utils/ReminderManager';

type CalendarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Calendar'>;

interface CalendarData {
  date: Date;
  reminders: UserReminder[];
  expenses: any[];
  orders: any[];
  hasDailyPlan: boolean;
  dayStatus: 'has-plan' | 'missing-plan' | 'today' | 'future' | 'normal';
}

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [showWeekView, setShowWeekView] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [dailyPlansDates, setDailyPlansDates] = useState<string[]>([]);
  const [selectedDateData, setSelectedDateData] = useState<CalendarData | null>(null);
  const [showDateDetails, setShowDateDetails] = useState(false);

  useEffect(() => {
    loadDailyPlansDates();
  }, []);

  useEffect(() => {
    loadCalendarData();
  }, [currentMonth, dailyPlansDates]);

  const loadDailyPlansDates = async () => {
    try {
      // Sample daily plans dates - in real app, this would come from your data source
      const sampleDates = [
        "2025-10-01", "2025-10-02", "2025-10-03", "2025-10-04", "2025-10-06", "2025-10-10",
        "2025-10-11", "2025-10-13", "2025-10-14", "2025-10-15", "2025-10-17", "2025-10-18",
        "2025-10-20", "2025-10-21", "2025-10-22", "2025-10-24", "2025-10-25", "2025-10-27",
        "2025-10-28", "2025-10-29", "2025-10-31"
      ];
      
      // For demo purposes, let's use current month dates
      const today = new Date();
      const currentMonthDates = sampleDates.filter(date => {
        const dateObj = new Date(date);
        return dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
      });
      
      setDailyPlansDates(currentMonthDates);
    } catch (error) {
      console.error('Error loading daily plans dates:', error);
    }
  };

  // Function to update daily plans dates from external source
  const updateDailyPlansDates = (dates: string[]) => {
    setDailyPlansDates(dates);
  };

  // Demo function to set sample daily plans dates
  const setSampleDailyPlansDates = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Generate some sample dates for the current month in YYYY-MM-DD format
    const sampleDates = [
      "2025-10-01", "2025-10-02", "2025-10-03", "2025-10-05", "2025-10-09", "2025-10-10",
      "2025-10-12", "2025-10-15", "2025-10-18", "2025-10-20", "2025-10-22", "2025-10-25"
    ];
    
    setDailyPlansDates(sampleDates);
  };

  const loadCalendarData = async () => {
    try {
      const reminders = await ReminderManager.getReminders();
      const groupedData: CalendarData[] = [];
      
      // Create data for current month
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const dateReminders = reminders.filter(reminder => {
          const reminderDate = new Date(reminder.date);
          return reminderDate.toDateString() === d.toDateString();
        });
        
        // Check if this date has a daily plan
        const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD format
        const hasDailyPlan = dailyPlansDates.includes(dateString);
        
        // Determine day status
        let dayStatus: 'has-plan' | 'missing-plan' | 'today' | 'future' | 'normal' = 'normal';
        
        if (d.toDateString() === today.toDateString()) {
          dayStatus = 'today';
        } else if (d < today) {
          // Past date
          if (hasDailyPlan) {
            dayStatus = 'has-plan';
          } else {
            dayStatus = 'missing-plan';
          }
        } else {
          // Future date - no special highlighting
          dayStatus = 'normal';
        }
        
        // Add some sample data for testing
        const sampleExpenses = d.getDate() % 3 === 0 ? [{ title: 'Sample Expense', amount: '50' }] : [];
        const sampleOrders = d.getDate() % 5 === 0 ? [{ title: 'Sample Order', description: 'Order details' }] : [];
        
        groupedData.push({
          date: new Date(d),
          reminders: dateReminders,
          expenses: sampleExpenses,
          orders: sampleOrders,
          hasDailyPlan: hasDailyPlan,
          dayStatus: dayStatus,
        });
      }
      
      setCalendarData(groupedData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

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
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      days.push(dayDate);
    }
    
    // Add empty cells to fill the remaining weeks (up to 6 weeks total)
    const totalCells = 42; // 6 weeks * 7 days
    while (days.length < totalCells) {
      days.push(null);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDay = (date: Date) => {
    return date.getDate().toString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    
    return week;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateData = getDataForDate(date);
    setSelectedDateData(dateData || null);
    setShowDateDetails(true);
  };

  const handleBackToMonth = () => {
    setShowWeekView(false);
  };

  const getDataForDate = (date: Date) => {
    return calendarData.find(data => 
      data.date.toDateString() === date.toDateString()
    );
  };


  const renderMonthView = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Group days into weeks for proper grid layout
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.weekDaysHeader}>
          {weekDays.map((day, index) => (
            <Text key={index} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <View key={dayIndex} style={styles.emptyDay} />;
                }
                
                const dayData = getDataForDate(day);
                const hasData = dayData && (dayData.reminders.length > 0 || dayData.expenses.length > 0 || dayData.orders.length > 0);
                
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      isToday(day) && styles.todayCell,
                      isSelected(day) && styles.selectedCell,
                      dayData?.dayStatus === 'has-plan' && styles.hasPlanCell,
                      dayData?.dayStatus === 'missing-plan' && styles.missingPlanCell,
                      dayData?.dayStatus === 'today' && styles.todayHighlightCell,
                    ]}
                    onPress={() => handleDateSelect(day)}
                  >
                    <Text style={[
                      styles.dayText,
                      isToday(day) && styles.todayText,
                      isSelected(day) && styles.selectedText,
                      dayData?.dayStatus === 'has-plan' && styles.hasPlanText,
                      dayData?.dayStatus === 'missing-plan' && styles.missingPlanText,
                      dayData?.dayStatus === 'today' && styles.todayHighlightText,
                    ]}>
                      {formatDay(day)}
                    </Text>
                    {hasData && <View style={styles.dataIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    
    return (
      <View style={styles.weekContainer}>
        <View style={styles.weekHeader}>
          <TouchableOpacity onPress={handleBackToMonth} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0f766e" />
          </TouchableOpacity>
          <Text style={styles.weekTitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric' 
            })}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.weekContent}>
          {weekDates.map((date, index) => {
            const dayData = getDataForDate(date);
            const isSelectedDay = date.toDateString() === selectedDate.toDateString();
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.weekDayCard,
                  isSelectedDay && styles.selectedWeekDay,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <View style={styles.weekDayHeader}>
                  <Text style={styles.weekDayName}>
                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </Text>
                  <Text style={styles.weekDayDate}>
                    {date.getDate()}
                  </Text>
                </View>
                
                {dayData && (
                  <View style={styles.dayDataContainer}>
                    {dayData.reminders.length > 0 && (
                      <View style={styles.dataSection}>
                        <Text style={styles.dataSectionTitle}>Reminders</Text>
                        {dayData.reminders.map((reminder, idx) => (
                          <View key={idx} style={styles.dataItem}>
                            <Ionicons name="alarm-outline" size={16} color="#0f766e" />
                            <Text style={styles.dataItemText}>{reminder.heading}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {dayData.expenses.length > 0 && (
                      <View style={styles.dataSection}>
                        <Text style={styles.dataSectionTitle}>Expenses</Text>
                        {dayData.expenses.map((expense, idx) => (
                          <View key={idx} style={styles.dataItem}>
                            <Ionicons name="card-outline" size={16} color="#ef4444" />
                            <Text style={styles.dataItemText}>{expense.title}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {dayData.orders.length > 0 && (
                      <View style={styles.dataSection}>
                        <Text style={styles.dataSectionTitle}>Orders</Text>
                        {dayData.orders.map((order, idx) => (
                          <View key={idx} style={styles.dataItem}>
                            <Ionicons name="bag-outline" size={16} color="#f59e0b" />
                            <Text style={styles.dataItemText}>{order.title}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderActionModal = () => (
    <Modal
      visible={showActionModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowActionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.actionModal}>
          <View style={styles.actionModalHeader}>
            <Text style={styles.actionModalTitle}>Add New Item</Text>
            <TouchableOpacity onPress={() => setShowActionModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="alarm-outline" size={24} color="#0f766e" />
              </View>
              <Text style={styles.actionButtonText}>Add Reminder</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="card-outline" size={24} color="#ef4444" />
              </View>
              <Text style={styles.actionButtonText}>Add Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="bag-outline" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.actionButtonText}>Add Order</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="calendar-outline" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.actionButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f766e', '#14b8a6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendars</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.demoButton}>
              {/* <Ionicons name="color-palette" size={20} color="white" /> */}
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton}>
              {/* <Ionicons name="add" size={24} color="white" /> */}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.monthView}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => {
            const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
            setCurrentMonth(newMonth);
          }}>
            <Ionicons name="chevron-back" size={24} color="#0f766e" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{formatDate(currentMonth)}</Text>
          <TouchableOpacity onPress={() => {
            const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
            setCurrentMonth(newMonth);
          }}>
            <Ionicons name="chevron-forward" size={24} color="#0f766e" />
          </TouchableOpacity>
        </View>
        {renderMonthView()}
      </View>

      {/* Date Details Section */}
      {showDateDetails && (
        <View style={styles.dateDetailsContainer}>
          {selectedDateData ? (
            <>
              <View style={styles.dateDetailsHeader}>
                <Text style={styles.dateDetailsTitle}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                <TouchableOpacity onPress={() => setShowDateDetails(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              {/* Working Day Status */}
              {selectedDateData.dayStatus === 'has-plan' && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>✅ Working Day</Text>
                </View>
              )}
              {selectedDateData.dayStatus === 'missing-plan' && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>❌ Non-Working Day</Text>
                </View>
              )}

              {/* Reminders */}
              {selectedDateData.reminders.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>📅 Reminders ({selectedDateData.reminders.length})</Text>
                  {selectedDateData.reminders.map((reminder, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <Text style={styles.itemTitle}>{reminder.title}</Text>
                      <Text style={styles.itemDescription}>{reminder.description}</Text>
                      <Text style={styles.itemTime}>{reminder.time}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Expenses */}
              {selectedDateData.expenses.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>💰 Expenses ({selectedDateData.expenses.length})</Text>
                  {selectedDateData.expenses.map((expense, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <Text style={styles.itemTitle}>{expense.title || 'Expense'}</Text>
                      <Text style={styles.itemDescription}>Amount: ${expense.amount || '0'}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Orders */}
              {selectedDateData.orders.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>📦 Orders ({selectedDateData.orders.length})</Text>
                  {selectedDateData.orders.map((order, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <Text style={styles.itemTitle}>{order.title || 'Order'}</Text>
                      <Text style={styles.itemDescription}>{order.description || 'Order details'}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* No Data Message */}
              {selectedDateData.reminders.length === 0 && selectedDateData.expenses.length === 0 && selectedDateData.orders.length === 0 && (
                <Text style={styles.noDataText}>
                  {selectedDateData.dayStatus === 'missing-plan' 
                    ? 'No data available - This was a non-working day' 
                    : 'No data available for this date'
                  }
                </Text>
              )}
            </>
          ) : (
            <>
              <View style={styles.dateDetailsHeader}>
                <Text style={styles.dateDetailsTitle}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                <TouchableOpacity onPress={() => setShowDateDetails(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <Text style={styles.noDataText}>No data available for this date</Text>
            </>
          )}
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowActionModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {renderActionModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 8,
  },
  monthView: {
    flex: 1,
    padding: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 300,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  calendarGrid: {
    flex: 1,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  emptyDay: {
    flex: 1,
    height: 40,
    marginHorizontal: 1,
  },
  dayCell: {
    flex: 1,
    height: 40,
    marginHorizontal: 1,
    borderRadius: 50, // 50% for perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  todayCell: {
    backgroundColor: '#f0fdfa',
  },
  selectedCell: {
    backgroundColor: '#0f766e',
  },
  dayText: {
    fontSize: 16,
    color: '#000000', // Black text
    fontWeight: '500',
  },
  todayText: {
    color: '#0f766e',
    fontWeight: 'bold',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hasPlanCell: {
    backgroundColor: '#dcfce7', // Light green circle
    borderRadius: 50, // 50% for perfect circle
    borderWidth: 2,
    borderColor: '#22c55e', // Green border
  },
  missingPlanCell: {
    backgroundColor: '#fef2f2', // Light red circle
    borderRadius: 50, // 50% for perfect circle
    borderWidth: 2,
    borderColor: '#ef4444', // Red border
  },
  todayHighlightCell: {
    backgroundColor: '#fed7aa', // Light orange circle
    borderRadius: 50, // 50% for perfect circle
    borderWidth: 2,
    borderColor: '#f97316', // Orange border
  },
  hasPlanText: {
    color: '#16a34a', // Dark green text
    fontWeight: '600',
  },
  missingPlanText: {
    color: '#dc2626', // Dark red text
    fontWeight: '600',
  },
  todayHighlightText: {
    color: '#ea580c', // Dark orange text
    fontWeight: 'bold',
  },
  dataIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0f766e',
  },
  dateDetailsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  noDataText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  itemContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  itemTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  weekContainer: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  weekContent: {
    flex: 1,
    padding: 20,
  },
  weekDayCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedWeekDay: {
    borderWidth: 2,
    borderColor: '#0f766e',
  },
  weekDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekDayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  weekDayDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  dayDataContainer: {
    gap: 12,
  },
  dataSection: {
    marginBottom: 8,
  },
  dataSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dataItemText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
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
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  actionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  actionButtons: {
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});

