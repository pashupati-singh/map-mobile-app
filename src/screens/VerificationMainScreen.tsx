import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import EmailVerificationScreen from './EmailVerificationScreen';
import PhoneVerificationScreen from './PhoneVerificationScreen';
import EnterCodeScreen from './EnterCodeScreen';
import SetMPINScreen from './SetMPINScreen';

interface VerificationMainScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

type TabType = 'email' | 'phone';
type ScreenType = 'main' | 'email-verify' | 'phone-verify' | 'enter-code' | 'set-mpin';

export default function VerificationMainScreen({ onBack, onComplete }: VerificationMainScreenProps) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('main');
  const [currentTab, setCurrentTab] = useState<TabType>('email');
  const [contactInfo, setContactInfo] = useState<string>('');

  const handleEmailCodeSent = (email: string) => {
    setContactInfo(email);
    setCurrentScreen('enter-code');
  };

  const handlePhoneCodeSent = (phone: string) => {
    setContactInfo(phone);
    setCurrentScreen('enter-code');
  };

  const handleCodeVerified = (code: string) => {
    setCurrentScreen('set-mpin');
  };

  const handleMPINSet = (mpin: string) => {
    onComplete();
  };

  const handleResendCode = () => {
    // This would trigger resend in the parent screen
    console.log('Resending code...');
  };

  const handleBackToMain = () => {
    setCurrentScreen('main');
  };

  const handleBackToVerification = () => {
    if (currentTab === 'email') {
      setCurrentScreen('email-verify');
    } else {
      setCurrentScreen('phone-verify');
    }
  };

  if (currentScreen === 'email-verify') {
    return (
      <EmailVerificationScreen
        onCodeSent={handleEmailCodeSent}
        onBack={handleBackToMain}
      />
    );
  }

  if (currentScreen === 'phone-verify') {
    return (
      <PhoneVerificationScreen
        onCodeSent={handlePhoneCodeSent}
        onBack={handleBackToMain}
      />
    );
  }

  if (currentScreen === 'enter-code') {
    return (
      <EnterCodeScreen
        email={currentTab === 'email' ? contactInfo : undefined}
        phone={currentTab === 'phone' ? contactInfo : undefined}
        onCodeVerified={handleCodeVerified}
        onBack={handleBackToVerification}
        onResendCode={handleResendCode}
      />
    );
  }

  if (currentScreen === 'set-mpin') {
    return (
      <SetMPINScreen
        onMPINSet={handleMPINSet}
        onBack={() => setCurrentScreen('enter-code')}
      />
    );
  }

  return (
    <LinearGradient
      colors={['#D4F7EE', '#EAFBF7', '#F7FDFB']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Account</Text>
          <Text style={styles.subtitle}>Choose your verification method</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'email' && styles.activeTab]}
            onPress={() => setCurrentTab('email')}
          >
            <Text style={[styles.tabText, currentTab === 'email' && styles.activeTabText]}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'phone' && styles.activeTab]}
            onPress={() => setCurrentTab('phone')}
          >
            <Text style={[styles.tabText, currentTab === 'phone' && styles.activeTabText]}>
              Phone
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verification Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setCurrentScreen('email-verify')}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>📧</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Verify with Email</Text>
              <Text style={styles.optionDescription}>
                We'll send a verification code to your email address
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setCurrentScreen('phone-verify')}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>📱</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Verify with Phone</Text>
              <Text style={styles.optionDescription}>
                We'll send a verification code to your phone number
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0f766e',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  optionsContainer: {
    marginBottom: 40,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
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
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});

