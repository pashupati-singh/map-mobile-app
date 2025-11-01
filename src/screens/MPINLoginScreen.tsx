import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gqlFetch } from '../api/graphql';
import { VERIFY_MPIN_MUTATION } from '../graphql/mutations/auth';
import { UserDataManager } from '../utils/UserDataManager';
import { LoginManager } from '../utils/LoginManager';

interface MPINLoginScreenProps {
  onLoginSuccess: (userId: string) => void;
  onSwitchToEmail: () => void;
}

export default function MPINLoginScreen({ onLoginSuccess, onSwitchToEmail }: MPINLoginScreenProps) {
  const [mpin, setMpin] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const handleMpinChange = (value: string, index: number) => {
    if (value.length > 1) return; 
    const newMpin = [...mpin];
    newMpin[index] = value;
    setMpin(newMpin);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !mpin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async () => {
    const mpinString = mpin.join('');
    if (mpinString.length !== 4) {
      Alert.alert('Error', 'Please enter all 4 digits of your MPIN');
      return;
    }
    setIsLoading(true);
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        Alert.alert('Error', 'No user found. Please login with email first.');
        onSwitchToEmail();
        return;
      }

      type VerifyMpinResponse = {
        verifyMpin: {
          code: number;
          success: boolean;
          message: string;
          token: string | null;
          user: { id: number | string; name?: string; company?: { name?: string; id?: number | string } | null } | null;
        };
      };

      const data = await gqlFetch<VerifyMpinResponse>(
        VERIFY_MPIN_MUTATION,
        { userId: Number(storedUserId), mpin: mpinString },
        undefined,
        true
      );
      const result = data.verifyMpin;

      if (result.success && result.code === 200 && result.user && result.token) {
        const name = result.user.name || '';
        const companyName = result.user.company?.name || '';
        const companyId = result.user.company?.id ? String(result.user.company.id) : '';

        await AsyncStorage.multiSet([
          ['authToken', result.token],
          ['userName', name],
          ['companyName', companyName],
        ]);

        if (companyId) {
          await LoginManager.storeCompanyId(companyId);
        }

        await UserDataManager.updateUserData({
          name,
          company: companyName,
          hasMPIN: true,
        });

        onLoginSuccess(String(result.user.id));
        return;
      }

      Alert.alert('MPIN Failed', result.message || 'Invalid MPIN. Please try again.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'MPIN verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <LinearGradient
    colors={['#D4F7EE', '#EAFBF7', '#F7FDFB']}
    style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <View style={styles.mpinIcon}>
                <View style={styles.mpinKey}>
                  <View style={styles.keyHead} />
                  <View style={styles.keyBody} />
                  <View style={styles.keyTeeth} />
                </View>
                <View style={styles.mpinNumbers}>
                  <Text style={styles.numberText}>6</Text>
                </View>
              </View>
              <View style={styles.decorativeDots}>
                <View style={[styles.dot, styles.dotRed]} />
                <View style={[styles.dot, styles.dotGreen]} />
                <View style={[styles.dot, styles.dotBlue]} />
              </View>
            </View>
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>Enter MPIN</Text>
            <Text style={styles.subtitle}>Enter your 4-digit MPIN to continue</Text>
          </View>
        <View style={styles.mpinContainer}>
          {mpin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.mpinInput,
                digit && styles.mpinInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleMpinChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={ ()=>{Keyboard.dismiss();handleLogin()}}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Verifying...' : 'Verify MPIN'}
          </Text>
        </TouchableOpacity>
           {!isLoading && (
        <TouchableOpacity style={styles.switchButton} onPress={onSwitchToEmail}>
          <Text style={styles.switchButtonText}>Back to Email Login</Text>
        </TouchableOpacity>
           )}
       
      </View>
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
  content: {
    flex: 1,
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
  mpinIcon: {
    width: 60,
    height: 40,
    position: 'relative',
  },
  mpinKey: {
    width: 30,
    height: 20,
    position: 'relative',
  },
  keyHead: {
    width: 8,
    height: 8,
    backgroundColor: '#fbbf24',
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    left: 11,
  },
  keyBody: {
    width: 30,
    height: 12,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
    position: 'absolute',
    top: 4,
  },
  keyTeeth: {
    width: 4,
    height: 4,
    backgroundColor: '#fbbf24',
    position: 'absolute',
    bottom: 0,
    left: 13,
  },
  mpinNumbers: {
    position: 'absolute',
    top: 8,
    right: 5,
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f766e',
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
  mpinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  mpinInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'white',
  },
  mpinInputFilled: {
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa',
  },
  loginButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
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
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});
