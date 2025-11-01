import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import SplashScreen from './src/components/SplashScreen';
import EmailLoginScreen from './src/screens/EmailLoginScreen';
import MPINLoginScreen from './src/screens/MPINLoginScreen';
import VerificationMainScreen from './src/screens/VerificationMainScreen';
import HomeScreen from './src/screens/HomeScreen';
import SuccessNotification from './src/components/SuccessNotification';
import { LoginManager } from './src/utils/LoginManager';
import { UserDataManager } from './src/utils/UserDataManager';
import { AuthHandler } from './src/utils/AuthHandler';

const Stack = createNativeStackNavigator();

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
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Home" 
            options={{ headerShown: false }}
          >
            {() => <HomeScreenWrapper onLogout={handleLogout} />}
          </Stack.Screen>
        </Stack.Navigator>
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


{/* <span class="loader"></span> */}

// .loader {
//   width: 48px;
//   height: 48px;
//   margin: auto;
//   position: relative;
// }
// .loader:before {
//     content: '';
//     width: 48px;
//     height: 5px;
//     background: #000;
//     opacity: 0.25;
//     position: absolute;
//     top: 60px;
//     left: 0;
//     border-radius: 50%;
//     animation: shadow 0.5s linear infinite;
//   }
//   .loader:after {
//     content: '';
//     width: 100%;
//     height: 100%;
//     background: #fff;
//     animation: bxSpin 0.5s linear infinite;
//     position: absolute;
//     top: 0;
//     left: 0;
//     border-radius: 4px;
//   }
// @keyframes bxSpin {
//   17% {
//     border-bottom-right-radius: 3px;
//   }
//   25% {
//     transform: translateY(9px) rotate(22.5deg);
//   }
//   50% {
//     transform: translateY(18px) scale(1, .9) rotate(45deg);
//     border-bottom-right-radius: 40px;
//   }
//   75% {
//     transform: translateY(9px) rotate(67.5deg);
//   }
//   100% {
//     transform: translateY(0) rotate(90deg);
//   }
// }

// @keyframes shadow {
//   0%, 100% {
//     transform: scale(1, 1);
//   }
//   50% {
//     transform: scale(1.2, 1);
//   }
// }
