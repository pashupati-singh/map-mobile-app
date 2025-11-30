import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import BottomNavBar from './src/components/BottomNavBar';
import SplashScreen from './src/components/SplashScreen';
import EmailLoginScreen from './src/screens/EmailLoginScreen';
import MPINLoginScreen from './src/screens/MPINLoginScreen';
import VerificationMainScreen from './src/screens/VerificationMainScreen';
import HomeScreen from './src/screens/HomeScreen';
import DailyPlansForm from './src/forms/DailyPlansForm';
import DoctorChemistListScreen from './src/screens/DoctorChemistListScreen';
import DoctorProfileScreen from './src/screens/DoctorProfileScreen';
import ChemistProfileScreen from './src/screens/ChemistProfileScreen';
import DCRFormScreen from './src/screens/DCRFormScreen';
import ExpenseOverviewScreen from './src/screens/ExpenseOverviewScreen';
import AddExpenseForm from './src/components/AddExpenseForm';
import AddSaleForm from './src/components/AddSaleForm';
import CalendarScreen from './src/screens/CalendarScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { SetReminderForm } from './src/forms';
import DCRScreen from './src/screens/DCRScreen';
import ReportsMoreScreen from './src/screens/ReportsMoreScreen';
import QuickActionEditorScreen from './src/screens/QuickActionEditorScreen';
import PlanHistoryScreen from './src/screens/PlanHistoryScreen';
import PlanDetailScreen from './src/screens/PlanDetailScreen';
import OldRemindersScreen from './src/screens/OldRemindersScreen';
import UpcomingEventsScreen from './src/screens/UpcomingEventsScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import NewRequestScreen from './src/screens/NewRequestScreen';
import RequestedListScreen from './src/screens/RequestedListScreen';
import SuccessNotification from './src/components/SuccessNotification';
import { LoginManager } from './src/utils/LoginManager';
import { UserDataManager } from './src/utils/UserDataManager';
import { AuthHandler } from './src/utils/AuthHandler';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

type LoginType = 'email' | 'mpin';

function HomeScreenWrapper({ onLogout }: { onLogout: () => void }) {
  return <HomeScreen onLogout={onLogout} />;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>('email');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>('Home');

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setLoginType('email');
  }, []);

  useEffect(() => {
    checkExistingUser();
    // Set up logout callback for AuthHandler
    AuthHandler.setLogoutCallback(() => {
      handleLogout();
      LoginManager.clearUserData().catch(console.error);
    });
  }, [handleLogout]);

  const checkExistingUser = async () => {
    const existingUserId = await LoginManager.checkExistingUser();
    if (existingUserId) {
      setLoginType('mpin');
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleLoginSuccess = async (userId: string) => {
    setShowSuccessNotification(true);
    setSuccessMessage(loginType === 'email' ? 'Email login successful!' : 'MPIN verification successful!');
    
    const existingUserData = await UserDataManager.getUserData();
    if (!existingUserData) {
      await UserDataManager.createDefaultUserData(userId, 'user@medicmap.com');
    }
    
    setIsLoggedIn(true);
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 2000);
  };

  const handleSwitchToMPIN = () => {
    setLoginType('mpin');
  };

  const handleSwitchToEmail = () => {
    setLoginType('email');
  };

  const handleShowVerification = () => {
    setShowVerification(true);
  };

  const handleVerificationComplete = () => {
    setShowVerification(false);
    setShowSuccessNotification(true);
    setSuccessMessage('Account verification completed!');
    setTimeout(() => {
      setShowSuccessNotification(false);
      setIsLoggedIn(true);
    }, 2000);
  };

  const handleBackFromVerification = () => {
    setShowVerification(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (showVerification) {
    return (
      <VerificationMainScreen
        onBack={handleBackFromVerification}
        onComplete={handleVerificationComplete}
      />
    );
  }

  if (isLoggedIn) {
    return (
      <NavigationContainer
        onStateChange={(state) => {
          if (state && state.routes && state.routes.length > 0) {
            const route = state.routes[state.index];
            if (route && route.name) {
              setCurrentRoute(route.name);
            }
          }
        }}
      >
        <View style={styles.appContainer}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
          <Stack.Screen 
            name="Home" 
            options={{ headerShown: false }}
          >
            {() => <HomeScreenWrapper onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen 
            name="DailyPlansForm" 
            component={DailyPlansForm}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="DoctorChemistList" 
            component={DoctorChemistListScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="DoctorProfile" 
            component={DoctorProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ChemistProfile" 
            component={ChemistProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="DCR" 
            component={DCRScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="DCRForm" 
            component={DCRFormScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ExpenseOverview" 
            component={ExpenseOverviewScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AddExpense" 
            component={AddExpenseForm}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AddSale" 
            component={AddSaleForm}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Calendar" 
            component={CalendarScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SetReminder" 
            component={SetReminderForm}
            options={{ headerShown: false , statusBarStyle: 'dark',          // iOS + Android
              statusBarTranslucent: true, 
              statusBarBackgroundColor: 'transparent', }}
          />
          <Stack.Screen 
            name="ReportsMore" 
            component={ReportsMoreScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="QuickActionEditor" 
            component={QuickActionEditorScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PlanHistory" 
            component={PlanHistoryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PlanDetail" 
            component={PlanDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="OldReminders" 
            component={OldRemindersScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="UpcomingEvents" 
            component={UpcomingEventsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Products" 
            component={ProductsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="NewRequest" 
            component={NewRequestScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="RequestedList" 
            component={RequestedListScreen}
            options={{ headerShown: false }}
          />
          
          </Stack.Navigator>
          <BottomNavBar currentRoute={currentRoute} />
        </View>
      </NavigationContainer>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {loginType === 'email' ? (
        <EmailLoginScreen
          onLoginSuccess={handleLoginSuccess}
          onSwitchToMPIN={handleSwitchToMPIN}
        />
      ) : (
        <MPINLoginScreen
          onLoginSuccess={handleLoginSuccess}
          onSwitchToEmail={handleSwitchToEmail}
        />
      )}
      
      {showSuccessNotification && (
        <SuccessNotification
          message={successMessage}
          onHide={() => setShowSuccessNotification(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
