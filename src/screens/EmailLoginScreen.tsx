import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gqlFetch } from '../api/graphql';
import { LOGIN_MUTATION, RESEND_OTP_MUTATION } from '../graphql/mutations/auth';
import { UserDataManager } from '../utils/UserDataManager';
import { LoginManager } from '../utils/LoginManager';
import EmailVerificationScreen from './EmailVerificationScreen';
import PhoneVerificationScreen from './PhoneVerificationScreen';
import EnterCodeScreen from './EnterCodeScreen';

interface EmailLoginScreenProps {
  onLoginSuccess: (userId: string) => void;
  onSwitchToMPIN: () => void;
}

export default function EmailLoginScreen({ onLoginSuccess, onSwitchToMPIN }: EmailLoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showEnterCode, setShowEnterCode] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ email?: string; phone?: string }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one capital letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }
    return { isValid: true };
  };

  const handleEmailCodeSent = (emailAddress: string) => {
    setContactInfo({ email: emailAddress });
    setShowEmailVerification(false);
    setShowEnterCode(true);
  };

  const handlePhoneCodeSent = (phone: string) => {
    setContactInfo({ phone: phone });
    setShowPhoneVerification(false);
    setShowEnterCode(true);
  };

  const handleCodeVerified = (code: string) => {
    // Handle code verification - can be enhanced later
    setShowEnterCode(false);
    Alert.alert('Success', 'Code verified successfully!');
  };

  const handleResendCode = async () => {
    try {
      type ResendOtpResponse = {
        resendOtp: {
          code: number;
        };
      };

      const variables: { type: string; email?: string; phone?: string } = contactInfo.email
        ? { type: 'EMAIL', email: contactInfo.email }
        : { type: 'PHONE', phone: contactInfo.phone };

      const data = await gqlFetch<ResendOtpResponse>(RESEND_OTP_MUTATION, variables, undefined, true);
      const result = data.resendOtp;

      if (result.code === 200) {
        const contact = contactInfo.email || contactInfo.phone || 'your contact';
        Alert.alert('Code Sent', `A new verification code has been sent to ${contact}`);
      } else {
        Alert.alert('Error', 'Failed to resend verification code. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to resend verification code. Please try again.');
    }
  };

  const handleBackFromEnterCode = () => {
    setShowEnterCode(false);
    if (contactInfo.email) {
      setShowEmailVerification(true);
    } else if (contactInfo.phone) {
      setShowPhoneVerification(true);
    }
  };

  const handleBackFromEmailVerification = () => {
    setShowEmailVerification(false);
  };

  const handleBackFromPhoneVerification = () => {
    setShowPhoneVerification(false);
  };

  const handleLogin = async () => {
    setErrors({});
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }
    if (!password.trim()) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrors(prev => ({ ...prev, password: passwordValidation.message }));
      return;
    }
    setIsLoading(true);
    try {
      type LoginResponse = {
        loginUser: {
          code: number;
          success: boolean;
          message: string;
          token: string | null;
          user: { id: number | string; name?: string; company?: { name?: string; id?: number | string } | null } | null;
        };
      };

      const data = await gqlFetch<LoginResponse>(LOGIN_MUTATION, { email, password }, undefined, true);
      const result = data.loginUser;
      if (result.success && result.code === 200 && result.user && result.token) {
        const userId = String(result.user.id);
        const name = result.user.name || '';
        const companyName = result.user.company?.name || '';
        const companyId = result.user.company?.id ? String(result.user.company.id) : '';

        await AsyncStorage.multiSet([
          ['userId', userId],
          ['authToken', result.token],
          ['userName', name],
          ['companyName', companyName],
        ]);

        if (companyId) {
          await LoginManager.storeCompanyId(companyId);
        }

        await UserDataManager.storeUserData({
          id: userId,
          name,
          role: 'MR',
          email,
          company: companyName,
          isEmailVerified: true,
          hasMPIN: false,
        });

        onLoginSuccess(userId);
        return;
      }
      Alert.alert('Login Failed', result.message || 'Please verify your email or phone number and try again.');

      if(result.code === 400){
        if(result.message === 'Please verify your email before logging in'){
          setShowEmailVerification(true);
          return;
        }else if(result.message === 'Please verify your phone number before logging in'){
          setShowPhoneVerification(true);
          return;
        }
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', error?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showEnterCode) {
    return (
      <EnterCodeScreen
        email={contactInfo.email}
        phone={contactInfo.phone}
        onCodeVerified={handleCodeVerified}
        onBack={handleBackFromEnterCode}
        onResendCode={handleResendCode}
      />
    );
  }

  if (showEmailVerification) {
    return (
      <EmailVerificationScreen
        onCodeSent={handleEmailCodeSent}
        onBack={handleBackFromEmailVerification}
        initialEmail={email}
      />
    );
  }

  if (showPhoneVerification) {
    return (
      <PhoneVerificationScreen
        onCodeSent={handlePhoneCodeSent}
        onBack={handleBackFromPhoneVerification}
      />
    );
  }

  return (
    <LinearGradient
    colors={['#D4F7EE', '#EAFBF7', '#F7FDFB']}
    style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <View style={styles.emailIcon}>
                <View style={styles.emailEnvelope}>
                  <View style={styles.emailFlap} />
                  <View style={styles.emailBody} />
                </View>
                <View style={styles.emailDocument} />
              </View>
              <View style={styles.decorativeDots}>
                <View style={[styles.dot, styles.dotRed]} />
                <View style={[styles.dot, styles.dotGreen]} />
                <View style={[styles.dot, styles.dotBlue]} />
              </View>
            </View>
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>We sent a verification link to your email</Text>
          </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={ ()=>{Keyboard.dismiss();handleLogin()}}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
       {!isLoading &&   <TouchableOpacity style={styles.switchButton} onPress={onSwitchToMPIN}>
          <Text style={styles.switchButtonText}>Use MPIN instead</Text>
        </TouchableOpacity>}
      </ScrollView>
    </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emailIcon: {
    width: 60,
    height: 40,
    position: 'relative',
  },
  emailEnvelope: {
    width: 50,
    height: 35,
    backgroundColor: '#fbbf24',
    borderRadius: 4,
    position: 'relative',
  },
  emailFlap: {
    position: 'absolute',
    top: -8,
    left: 8,
    width: 34,
    height: 16,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  emailBody: {
    width: 50,
    height: 35,
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  emailDocument: {
    position: 'absolute',
    top: 8,
    right: 5,
    width: 8,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  decorativeDots: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  dotRed: {
    backgroundColor: '#ef4444',
  },
  dotGreen: {
    backgroundColor: '#10b981',
  },
  dotBlue: {
    backgroundColor: '#3b82f6',
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchButtonText: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: '500',
  },
});
