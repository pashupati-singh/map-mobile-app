import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type BottomNavBarNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BottomNavBarProps {
  currentRoute: string;
}

export default function BottomNavBar({ currentRoute }: BottomNavBarProps) {
  const navigation = useNavigation<BottomNavBarNavigationProp>();
  
  // Use the currentRoute prop instead of useNavigationState
  const routeName = currentRoute || 'Home';

  const bottomNavItems = [
    { id: 'home', title: 'Home', icon: 'home-outline', route: 'Home' },
    { id: 'report', title: 'Report', icon: 'document-outline', route: 'ReportsMore' },
    { id: 'dcr', title: 'DCR', icon: 'calendar-outline', route: 'DCR' },
    { id: 'expense', title: 'Expense', icon: 'wallet-outline', route: 'ExpenseOverview' },
    { id: 'calendar', title: 'Calendar', icon: 'calendar-outline', route: 'Calendar' },
  ];

  const getActiveRoute = (itemRoute: string) => {
    // Map routes to their main tab
    const routeMap: { [key: string]: string } = {
      'Home': 'Home',
      'ReportsMore': 'ReportsMore',
      'DCR': 'DCR',
      'DCRForm': 'DCR', // DCRForm is part of DCR tab
      'ExpenseOverview': 'ExpenseOverview',
      'AddExpense': 'ExpenseOverview', // AddExpense is part of Expense tab
      'AddSale': 'ExpenseOverview', // AddSale is part of Expense tab
      'Calendar': 'Calendar',
    };
    
    return routeMap[routeName] === itemRoute;
  };

  const handleNavPress = (item: typeof bottomNavItems[0]) => {
    if (getActiveRoute(item.route)) {
      // Already on this screen, do nothing
      return;
    }

    if (item.id === 'home') {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      );
    } else {
      navigation.navigate(item.route as any);
    }
  };

  return (
    <View style={styles.bottomNav}>
      {bottomNavItems.map((item) => {
        const isActive = getActiveRoute(item.route);
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.navItem, isActive && styles.activeNavItem]}
            onPress={() => handleNavPress(item)}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color="#FFFFFF"
            />
            <Text style={[styles.navText, isActive && styles.activeNavText]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: '600',
  },
});

