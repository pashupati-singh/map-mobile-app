import React, { useState, useEffect } from 'react';
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
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import CurvedHeader from '../components/CurvedHeader';
import ExpenseFlowSection from '../components/ExpenseFlowSection';
import { ExpenseData } from '../components/AddExpenseForm';
import { SaleData } from '../components/AddSaleForm';
import { gqlFetch } from '../api/graphql';
import { GET_EXPENSE_BY_MONTHS_QUERY } from '../graphql/query/expense';
import { GET_MY_SALES_ANALYTICS_QUERY } from '../graphql/query/salesAnalytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomLoader from '../components/CustomLoader';

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  icon: string;
  color: string;
  type: 'doctor' | 'chemist';
}


type ExpenseOverviewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpenseOverview'>;

interface ExpenseDetail {
  date: string;
  total: number;
  expenseId: number;
  id: number;
}

interface ExpenseMonthData {
  ExpenseMonth: string;
  amount: number;
  isApproved: boolean;
  isCompleted: boolean;
  details: ExpenseDetail[];
}

interface SalesAnalyticsData {
  totalAmount: number;
  doctorContributions: Array<{
    doctorCompanyId: number;
    doctorName: string;
    totalAmount: number;
    percentage: number;
  }>;
  chemistContributions: Array<{
    chemistCompanyId: number;
    chemistName: string;
    totalAmount: number;
    percentage: number;
  }>;
  productContributions: Array<{
    productId: number;
    productName: string;
    totalAmount: number;
    percentage: number;
  }>;
  areaContributions: Array<{
    workingAreaId: number;
    workingAreaName: string;
    totalAmount: number;
    percentage: number;
  }>;
}

export default function ExpenseOverviewScreen() {
  const navigation = useNavigation<ExpenseOverviewScreenNavigationProp>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | '6months' | 'yearly'>('monthly');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'expense' | 'sales' | 'order'>('expense');
  const [isFabCancel, setIsFabCancel] = useState(false);
  const [expenseData, setExpenseData] = useState<ExpenseMonthData[]>([]);
  const [isLoadingExpenseData, setIsLoadingExpenseData] = useState(false);
  const [salesAnalyticsData, setSalesAnalyticsData] = useState<SalesAnalyticsData | null>(null);
  const [isLoadingSalesData, setIsLoadingSalesData] = useState(false);

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
  // Calculate total expense from expenseData (API data)
  const totalExpense = expenseData.reduce((sum, monthData) => sum + (monthData.amount || 0), 0);
  const totalTarget = 500000; // Mock target
  const totalSales = salesAnalyticsData?.totalAmount || 0;


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
      case 'quarterly':
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
      case 'quarterly':
        const month = currentDate.getMonth();
        let quarter: number;
        let year = currentDate.getFullYear();
        
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
        return `${currentDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} - ${new Date(currentDate.getFullYear(), currentDate.getMonth() + 5).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
      case 'yearly':
        return currentDate.getFullYear().toString();
      default:
        return currentDate.getFullYear().toString();
    }
  };

  const handleSaveExpense = (expenseData: ExpenseData) => {
    // Handle save logic here
    console.log('Saving expense:', expenseData);
    console.log('Selected dates:', expenseData.dates);
    // You can add your save logic here (API call, etc.)
  };

  const handleSaveSale = (saleData: SaleData) => {
    // Handle save logic here
    console.log('Saving sale:', saleData);
    // You can add your save logic here (API call, etc.)
  };

  // Prepare data for pie charts from sales analytics
  const getDoctorPieChartData = () => {
    if (!salesAnalyticsData?.doctorContributions.length) return [];
    return salesAnalyticsData.doctorContributions.map((doctor, index) => {
      const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
      return {
        name: doctor.doctorName,
        population: doctor.totalAmount,
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 10,
      };
    });
  };

  const getChemistPieChartData = () => {
    if (!salesAnalyticsData?.chemistContributions.length) return [];
    return salesAnalyticsData.chemistContributions.map((chemist, index) => {
      const colors = ['#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#6366f1'];
      return {
        name: chemist.chemistName,
        population: chemist.totalAmount,
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 10,
      };
    });
  };

  const getProductPieChartData = () => {
    if (!salesAnalyticsData?.productContributions.length) return [];
    return salesAnalyticsData.productContributions.map((product, index) => {
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#6366f1'];
      return {
        name: product.productName,
        population: product.totalAmount,
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 10,
      };
    });
  };

  const getAreaPieChartData = () => {
    if (!salesAnalyticsData?.areaContributions.length) return [];
    return salesAnalyticsData.areaContributions.map((area, index) => {
      const colors = ['#0f766e', '#14b8a6', '#06b6d4', '#3b82f6'];
      return {
        name: area.workingAreaName,
        population: area.totalAmount,
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 10,
      };
    });
  };

  // Function to format date as dd/mm/yyyy
  const formatDateForQuery = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to get date range for sales analytics based on viewMode
  const getDateRangeForSalesAnalytics = (
    date: Date,
    mode: 'monthly' | 'quarterly' | '6months' | 'yearly'
  ): { startDate: string; endDate: string } => {
    let startDate: Date;
    let endDate: Date;

    switch (mode) {
      case 'monthly': {
        // First day of selected month to last day of selected month
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        break;
      }
      case 'quarterly': {
        // Indian fiscal year quarters: Q1 (Apr-Jun), Q2 (Jul-Sep), Q3 (Oct-Dec), Q4 (Jan-Mar)
        const month = date.getMonth();
        let startMonth: number, endMonth: number;
        let year = date.getFullYear();

        if (month >= 3 && month <= 5) {
          // Q1: Apr-Jun
          startMonth = 3;
          endMonth = 5;
        } else if (month >= 6 && month <= 8) {
          // Q2: Jul-Sep
          startMonth = 6;
          endMonth = 8;
        } else if (month >= 9 && month <= 11) {
          // Q3: Oct-Dec
          startMonth = 9;
          endMonth = 11;
        } else {
          // Q4: Jan-Mar
          startMonth = 0;
          endMonth = 2;
        }

        startDate = new Date(year, startMonth, 1);
        endDate = new Date(year, endMonth + 1, 0);
        break;
      }
      case '6months': {
        // First day of selected month to last day of 6th month
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 6, 0);
        break;
      }
      case 'yearly': {
        // First day of year to last day of year
        startDate = new Date(date.getFullYear(), 0, 1);
        endDate = new Date(date.getFullYear(), 11, 31);
        break;
      }
      default: {
        // Default to monthly
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      }
    }

    return {
      startDate: formatDateForQuery(startDate),
      endDate: formatDateForQuery(endDate),
    };
  };

  // Function to get first day of a month
  const getFirstDayOfMonth = (date: Date): string => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return formatDateForQuery(firstDay);
  };

  // Function to get dates array based on viewMode
  const getDatesForViewMode = (date: Date, mode: string): string[] => {
    const dates: string[] = [];
    
    switch (mode) {
      case 'monthly':
        // Single month
        dates.push(getFirstDayOfMonth(date));
        break;
        
      case 'quarterly':
        // Indian fiscal year quarters: Q1 (Apr-Jun), Q2 (Jul-Sep), Q3 (Oct-Dec), Q4 (Jan-Mar)
        const month = date.getMonth();
        let quarter: number;
        let year = date.getFullYear();
        
        // Determine current quarter
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
        
        // Add first day of each month in the quarter
        for (let i = 0; i < 3; i++) {
          const quarterMonth = new Date(year, startMonth + i, 1);
          dates.push(getFirstDayOfMonth(quarterMonth));
        }
        break;
        
      case '6months':
        // 6 months starting from selected month
        for (let i = 0; i < 6; i++) {
          const monthDate = new Date(date.getFullYear(), date.getMonth() + i, 1);
          dates.push(getFirstDayOfMonth(monthDate));
        }
        break;
        
      case 'yearly':
        // All 12 months of the year
        for (let i = 0; i < 12; i++) {
          const monthDate = new Date(date.getFullYear(), i, 1);
          dates.push(getFirstDayOfMonth(monthDate));
        }
        break;
        
      default:
        // Default to monthly
        dates.push(getFirstDayOfMonth(date));
    }
    
    return dates;
  };

  // Fetch expense data when component mounts or date/viewMode changes
  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        setIsLoadingExpenseData(true);
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setIsLoadingExpenseData(false);
          return;
        }

        // Get dates array based on viewMode
        const dates = getDatesForViewMode(currentDate, viewMode);

        type GetExpenseByMonthsResponse = {
          getExpenseByMonths: {
            code: number;
            success: boolean;
            message: string;
            data: ExpenseMonthData[];
          };
        };

        const response = await gqlFetch<GetExpenseByMonthsResponse>(
          GET_EXPENSE_BY_MONTHS_QUERY,
          { dates },
          token
        );

        if (response.getExpenseByMonths.success) {
          setExpenseData(response.getExpenseByMonths.data || []);
        }
      } catch (error: any) {
        console.error('Error fetching expense data:', error);
        setExpenseData([]);
      } finally {
        setIsLoadingExpenseData(false);
      }
    };

    fetchExpenseData();
  }, [currentDate, viewMode]);

  // Fetch sales analytics data when sales tab is selected or date/viewMode changes
  useEffect(() => {
    const fetchSalesAnalytics = async () => {
      if (selectedTab !== 'sales') {
        return;
      }

      try {
        setIsLoadingSalesData(true);
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setIsLoadingSalesData(false);
          return;
        }

        // Get date range based on viewMode
        const { startDate, endDate } = getDateRangeForSalesAnalytics(
          currentDate,
          viewMode as 'monthly' | 'quarterly' | '6months' | 'yearly'
        );

        type GetMySalesAnalyticsResponse = {
          getMySalesAnalytics: SalesAnalyticsData;
        };

        const response = await gqlFetch<GetMySalesAnalyticsResponse>(
          GET_MY_SALES_ANALYTICS_QUERY,
          { startDate, endDate },
          token
        );

        setSalesAnalyticsData(response.getMySalesAnalytics);
      } catch (error: any) {
        console.error('Error fetching sales analytics data:', error);
        setSalesAnalyticsData(null);
      } finally {
        setIsLoadingSalesData(false);
      }
    };

    fetchSalesAnalytics();
  }, [currentDate, viewMode, selectedTab]);

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
      <CurvedHeader
        title="Expense Overview"
        rightComponent={
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        }
      />

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

      {/* Financial Summary - Fixed */}
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

      {/* Segmented Control - Fixed */}
      <View style={styles.segmentedControlContainer}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              selectedTab === 'expense' && styles.segmentButtonActive
            ]}
            onPress={() => setSelectedTab('expense')}
          >
            <Text
              style={[
                styles.segmentText,
                selectedTab === 'expense' && styles.segmentTextActive
              ]}
            >
              EXPENSE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              selectedTab === 'sales' && styles.segmentButtonActive
            ]}
            onPress={() => setSelectedTab('sales')}
          >
            <Text
              style={[
                styles.segmentText,
                selectedTab === 'sales' && styles.segmentTextActive
              ]}
            >
              SALES
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              selectedTab === 'order' && styles.segmentButtonActive
            ]}
            onPress={() => setSelectedTab('order')}
          >
            <Text
              style={[
                styles.segmentText,
                selectedTab === 'order' && styles.segmentTextActive
              ]}
            >
              ORDER
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Expense Tab - Show ExpenseFlowSection content */}
        {selectedTab === 'expense' && (
          <>
            {isLoadingExpenseData ? (
              <View style={styles.loaderContainer}>
                <CustomLoader size={48} color="#0f766e" />
              </View>
            ) : (
              <ExpenseFlowSection
                initialViewMode={viewMode}
                initialDate={currentDate}
                expenseData={expenseData}
              />
            )}
          </>
        )}

        {/* Sales Tab - Show Sales Analytics content */}
        {selectedTab === 'sales' && (
          <>
            {isLoadingSalesData ? (
              <View style={styles.loaderContainer}>
                <CustomLoader size={48} color="#0f766e" />
              </View>
            ) : salesAnalyticsData ? (
              <>
                {/* Doctor Contributions */}
                {salesAnalyticsData.doctorContributions.length > 0 && (
                  <View style={styles.salesSection}>
                    <Text style={styles.sectionTitle}>Doctor Contributions</Text>
                    <View style={styles.chartSection}>
                      <View style={styles.pieChartContainer}>
                        <PieChart
                          data={getDoctorPieChartData()}
                          width={screenWidth - 100}
                          height={200}
                          chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                          accessor="population"
                          backgroundColor="transparent"
                          paddingLeft="15"
                          center={[10, 10]}
                          absolute
                        />
                      </View>
                    </View>
                    <View style={styles.contributionsList}>
                      {salesAnalyticsData.doctorContributions.map((doctor, index) => (
                        <View key={doctor.doctorCompanyId} style={styles.contributionItem}>
                          <View style={styles.contributionItemLeft}>
                            <View style={[styles.contributionIcon, { backgroundColor: '#ef4444' }]}>
                              <Ionicons name="person" size={20} color="white" />
                            </View>
                            <View style={styles.contributionInfo}>
                              <Text style={styles.contributionName}>{doctor.doctorName}</Text>
                            </View>
                          </View>
                          <View style={styles.contributionItemRight}>
                            <Text style={styles.contributionAmount}>₹{doctor.totalAmount.toLocaleString()}</Text>
                            <Text style={styles.contributionPercentage}>{doctor.percentage.toFixed(1)}%</Text>
                            <View style={styles.progressBar}>
                              <View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${doctor.percentage}%`,
                                    backgroundColor: '#ef4444',
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Chemist Contributions */}
                {salesAnalyticsData.chemistContributions.length > 0 && (
                  <View style={styles.salesSection}>
                    <Text style={styles.sectionTitle}>Chemist Contributions</Text>
                    <View style={styles.chartSection}>
                      <View style={styles.pieChartContainer}>
                        <PieChart
                          data={getChemistPieChartData()}
                          width={screenWidth - 100}
                          height={200}
                          chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                          accessor="population"
                          backgroundColor="transparent"
                          paddingLeft="15"
                          center={[10, 10]}
                          absolute
                        />
                      </View>
                    </View>
                    <View style={styles.contributionsList}>
                      {salesAnalyticsData.chemistContributions.map((chemist, index) => (
                        <View key={chemist.chemistCompanyId} style={styles.contributionItem}>
                          <View style={styles.contributionItemLeft}>
                            <View style={[styles.contributionIcon, { backgroundColor: '#8b5cf6' }]}>
                              <Ionicons name="medical" size={20} color="white" />
                            </View>
                            <View style={styles.contributionInfo}>
                              <Text style={styles.contributionName}>{chemist.chemistName}</Text>
                            </View>
                          </View>
                          <View style={styles.contributionItemRight}>
                            <Text style={styles.contributionAmount}>₹{chemist.totalAmount.toLocaleString()}</Text>
                            <Text style={styles.contributionPercentage}>{chemist.percentage.toFixed(1)}%</Text>
                            <View style={styles.progressBar}>
                              <View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${chemist.percentage}%`,
                                    backgroundColor: '#8b5cf6',
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Product Contributions */}
                {salesAnalyticsData.productContributions.length > 0 && (
                  <View style={styles.salesSection}>
                    <Text style={styles.sectionTitle}>Product Contributions</Text>
                    <View style={styles.chartSection}>
                      <View style={styles.pieChartContainer}>
                        <PieChart
                          data={getProductPieChartData()}
                          width={screenWidth - 100}
                          height={200}
                          chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                          accessor="population"
                          backgroundColor="transparent"
                          paddingLeft="15"
                          center={[10, 10]}
                          absolute
                        />
                      </View>
                    </View>
                    <View style={styles.contributionsList}>
                      {salesAnalyticsData.productContributions.map((product, index) => (
                        <View key={product.productId} style={styles.contributionItem}>
                          <View style={styles.contributionItemLeft}>
                            <View style={[styles.contributionIcon, { backgroundColor: '#10b981' }]}>
                              <Ionicons name="cube" size={20} color="white" />
                            </View>
                            <View style={styles.contributionInfo}>
                              <Text style={styles.contributionName}>{product.productName}</Text>
                            </View>
                          </View>
                          <View style={styles.contributionItemRight}>
                            <Text style={styles.contributionAmount}>₹{product.totalAmount.toLocaleString()}</Text>
                            <Text style={styles.contributionPercentage}>{product.percentage.toFixed(1)}%</Text>
                            <View style={styles.progressBar}>
                              <View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${product.percentage}%`,
                                    backgroundColor: '#10b981',
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Area Contributions */}
                {salesAnalyticsData.areaContributions.length > 0 && (
                  <View style={styles.salesSection}>
                    <Text style={styles.sectionTitle}>Area Contributions</Text>
                    <View style={styles.chartSection}>
                      <View style={styles.pieChartContainer}>
                        <PieChart
                          data={getAreaPieChartData()}
                          width={screenWidth - 100}
                          height={200}
                          chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                          accessor="population"
                          backgroundColor="transparent"
                          paddingLeft="15"
                          center={[10, 10]}
                          absolute
                        />
                      </View>
                    </View>
                    <View style={styles.contributionsList}>
                      {salesAnalyticsData.areaContributions.map((area, index) => (
                        <View key={area.workingAreaId} style={styles.contributionItem}>
                          <View style={styles.contributionItemLeft}>
                            <View style={[styles.contributionIcon, { backgroundColor: '#0f766e' }]}>
                              <Ionicons name="location" size={20} color="white" />
                            </View>
                            <View style={styles.contributionInfo}>
                              <Text style={styles.contributionName}>{area.workingAreaName}</Text>
                            </View>
                          </View>
                          <View style={styles.contributionItemRight}>
                            <Text style={styles.contributionAmount}>₹{area.totalAmount.toLocaleString()}</Text>
                            <Text style={styles.contributionPercentage}>{area.percentage.toFixed(1)}%</Text>
                            <View style={styles.progressBar}>
                              <View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${area.percentage}%`,
                                    backgroundColor: '#0f766e',
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="bar-chart-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No sales data available</Text>
              </View>
            )}
          </>
        )}
        {selectedTab === 'order' && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        )}
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
                  { key: 'monthly', label: 'MONTHLY' },
                  { key: 'quarterly', label: 'QUARTERLY' },
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

      {/* Overlay for Floating Action Menu */}
      {isFabCancel && (
        <TouchableOpacity 
          style={styles.fabOverlay}
          activeOpacity={1}
          onPress={() => setIsFabCancel(false)}
        >
          <BlurView intensity={20} style={styles.blurView} />
        </TouchableOpacity>
      )}

      {/* Floating Action Menu */}
      {isFabCancel && (
        <View style={styles.fabMenu}>
          <TouchableOpacity 
            style={styles.fabMenuItem}
            onPress={() => {
              setIsFabCancel(false);
              navigation.navigate('AddExpense', { mode: 'add' });
            }}
          >
            <Text style={styles.fabMenuLabel}>Add Expense</Text>
            <View style={styles.fabMenuButton}>
              <Ionicons name="add-circle" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.fabMenuItem}
            onPress={() => {
              setIsFabCancel(false);
              navigation.navigate('AddSale');
            }}
          >
            <Text style={styles.fabMenuLabel}>Add Sale</Text>
            <View style={styles.fabMenuButton}>
              <Ionicons name="cash" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fabMenuItem}>
            <Text style={styles.fabMenuLabel}>Add Order</Text>
            <View style={styles.fabMenuButton}>
              <Ionicons name="cart" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fabMenuItem}>
            <Text style={styles.fabMenuLabel}>Export Data</Text>
            <View style={styles.fabMenuButton}>
              <Ionicons name="download" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.fabMenuItem}
            onPress={() => {
              setIsFabCancel(false);
              navigation.navigate('AddExpense', { mode: 'settings' });
            }}
          >
            <Text style={styles.fabMenuLabel}>Settings</Text>
            <View style={styles.fabMenuButton}>
              <Ionicons name="settings" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setIsFabCancel(!isFabCancel)}
      >
        <Ionicons name={isFabCancel ? "close" : "add"} size={24} color="white" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
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
  segmentedControlContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 4,
    width: '100%',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: 'white',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  segmentTextActive: {
    color: '#f97316',
  },
  tabContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  expenseFlowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  expenseFlowButtonText: {
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
    zIndex: 1000,
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  blurView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fabMenu: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fabMenuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 12,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    width: 120,
    height: 36,
    textAlign: 'center',
    lineHeight: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  fabMenuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  salesSection: {
    marginBottom: 24,
  },
  contributionsList: {
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
    marginTop: 12,
  },
  contributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  contributionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contributionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contributionInfo: {
    flex: 1,
  },
  contributionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  contributionItemRight: {
    alignItems: 'flex-end',
  },
  contributionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 2,
  },
  contributionPercentage: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
});
