import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import ExpenseFlowScreen from './ExpenseFlowScreen';

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  icon: string;
  color: string;
  type: 'doctor' | 'chemist';
}

interface ExpenseOverviewScreenProps {
  onBack: () => void;
}

export default function ExpenseOverviewScreen({ onBack }: ExpenseOverviewScreenProps) {
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'q1' | 'q2' | 'q3' | 'q4' | '6months' | 'yearly'>('yearly');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExpenseFlowDropdown, setShowExpenseFlowDropdown] = useState(false);
  const [showExpenseFlow, setShowExpenseFlow] = useState(false);

  // Show ExpenseFlowScreen if selected
  if (showExpenseFlow) {
    return (
      <ExpenseFlowScreen
        onBack={() => setShowExpenseFlow(false)}
        viewMode={viewMode}
        currentDate={currentDate}
      />
    );
  }

  // Mock data for expense categories
  const expenseCategories: ExpenseCategory[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      amount: 125000,
      percentage: 35.2,
      icon: 'person',
      color: '#ef4444',
      type: 'doctor',
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      amount: 85000,
      percentage: 23.9,
      icon: 'person',
      color: '#f59e0b',
      type: 'doctor',
    },
    {
      id: '3',
      name: 'Rajesh Kumar (Chemist)',
      amount: 45000,
      percentage: 12.7,
      icon: 'medical',
      color: '#8b5cf6',
      type: 'chemist',
    },
    {
      id: '4',
      name: 'Dr. Emily Rodriguez',
      amount: 35000,
      percentage: 9.8,
      icon: 'person',
      color: '#10b981',
      type: 'doctor',
    },
    {
      id: '5',
      name: 'Priya Sharma (Chemist)',
      amount: 28000,
      percentage: 7.9,
      icon: 'medical',
      color: '#06b6d4',
      type: 'chemist',
    },
    {
      id: '6',
      name: 'Dr. James Wilson',
      amount: 22000,
      percentage: 6.2,
      icon: 'person',
      color: '#3b82f6',
      type: 'doctor',
    },
    {
      id: '7',
      name: 'Amit Patel (Chemist)',
      amount: 15000,
      percentage: 4.2,
      icon: 'medical',
      color: '#f97316',
      type: 'chemist',
    },
    {
      id: '8',
      name: 'Dr. Lisa Anderson',
      amount: 12000,
      percentage: 3.4,
      icon: 'person',
      color: '#84cc16',
      type: 'doctor',
    },
    {
      id: '9',
      name: 'Sunita Singh (Chemist)',
      amount: 8000,
      percentage: 2.3,
      icon: 'medical',
      color: '#ec4899',
      type: 'chemist',
    },
    {
      id: '10',
      name: 'Dr. Robert Taylor',
      amount: 5000,
      percentage: 1.4,
      icon: 'person',
      color: '#6366f1',
      type: 'doctor',
    },
  ];

  // Calculate totals
  const totalExpense = expenseCategories.reduce((sum, category) => sum + category.amount, 0);
  const totalTarget = 500000; // Mock target
  const totalSales = 425000; // Mock sales

  const handleYearChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentYear(prev => prev + 1);
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
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
    
    setCurrentDate(newDate);
  };

  const getDisplayText = () => {
    switch (viewMode) {
      case 'daily':
        return currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'weekly':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}`;
      case 'monthly':
        return currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      case 'q1':
        return `Q1 ${currentDate.getFullYear()}`;
      case 'q2':
        return `Q2 ${currentDate.getFullYear()}`;
      case 'q3':
        return `Q3 ${currentDate.getFullYear()}`;
      case 'q4':
        return `Q4 ${currentDate.getFullYear()}`;
      case '6months':
        return `${currentDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} - ${new Date(currentDate.getFullYear(), currentDate.getMonth() + 5).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
      case 'yearly':
        return currentDate.getFullYear().toString();
      default:
        return currentDate.getFullYear().toString();
    }
  };

  // Prepare data for pie chart
  const pieChartData = [
    {
      name: 'Doctors',
      population: expenseCategories.filter(cat => cat.type === 'doctor').reduce((sum, cat) => sum + cat.amount, 0),
      color: '#ef4444',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Chemists',
      population: expenseCategories.filter(cat => cat.type === 'chemist').reduce((sum, cat) => sum + cat.amount, 0),
      color: '#8b5cf6',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  const screenWidth = Dimensions.get('window').width;

  const renderExpenseItem = ({ item }: { item: ExpenseCategory }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseItemLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          <Ionicons 
            name={item.icon as any} 
            size={20} 
            color="white" 
          />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseName}>{item.name}</Text>
          <Text style={styles.expenseType}>
            {item.type === 'doctor' ? 'Doctor' : 'Chemist'}
          </Text>
        </View>
      </View>
      <View style={styles.expenseItemRight}>
        <Text style={styles.expenseAmount}>-₹{item.amount.toLocaleString()}</Text>
        <Text style={styles.expensePercentage}>{item.percentage.toFixed(1)}%</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#f8fafc', '#f1f5f9', '#e2e8f0']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f766e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Overview</Text>
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
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={20} color="#0f766e" />
          </TouchableOpacity>
        </View>

        {/* Financial Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>EXPENSE</Text>
            <Text style={styles.expenseValue}>₹{totalExpense.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TARGET</Text>
            <Text style={styles.targetValue}>₹{totalTarget.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>SALES</Text>
            <Text style={styles.salesValue}>₹{totalSales.toLocaleString()}</Text>
          </View>
        </View>

        {/* Overview Button */}
        <View style={styles.overviewButtonContainer}>
          <TouchableOpacity 
            style={styles.overviewButton}
            onPress={() => {
              console.log('Expense Overview button pressed, current dropdown state:', showExpenseFlowDropdown);
              setShowExpenseFlowDropdown(!showExpenseFlowDropdown);
            }}
          >
            <Text style={styles.overviewButtonText}>EXPENSE OVERVIEW</Text>
            <Ionicons name="chevron-down" size={16} color="#0f766e" />
          </TouchableOpacity>
          
          {/* Dropdown Menu */}
          {showExpenseFlowDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={() => {
                  console.log('Expense Flow selected, navigating to ExpenseFlowScreen');
                  setShowExpenseFlow(true);
                  setShowExpenseFlowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>EXPENSE FLOW</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Pie Chart */}
        <View style={styles.chartSection}>
          <View style={styles.pieChartContainer}>
            <PieChart
              data={pieChartData}
              width={screenWidth - 100}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              absolute
            />
          </View>
        </View>

        {/* Expense List */}
        <View style={styles.expenseListSection}>
          <Text style={styles.sectionTitle}>Expense Breakdown</Text>
          <FlatList
            data={expenseCategories}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.expenseList}
          />
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

  <ScrollView
    contentContainerStyle={styles.modalContent}
    showsVerticalScrollIndicator={false}
  >
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
                      setViewMode(option.key as any);
                      setShowFilterModal(false);
                    }}
                  >
                    <Text style={styles.viewModeText}>{option.label}</Text>
                    {viewMode === option.key && (
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 20,
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
  overviewButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  overviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
    marginRight: 8,
  },
  chartSection: {
    flexDirection: 'row',
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
  pieChartContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  pieChartLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  legendContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
  },
  expenseListSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  expenseList: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  expenseItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  expenseType: {
    fontSize: 12,
    color: '#6b7280',
  },
  expenseItemRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 2,
  },
  expensePercentage: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
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
  filterButton: {
    padding: 8,
    marginLeft: 8,
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
    paddingVertical: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  modalContent: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  viewModeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});
