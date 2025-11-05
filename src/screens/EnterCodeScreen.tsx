import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gqlFetch } from '../api/graphql';
import { RESEND_OTP_MUTATION, VERIFY_OTP_MUTATION } from '../graphql/mutations/auth';

interface EnterCodeScreenProps {
  email?: string;
  phone?: string;
  onCodeVerified: (code: string) => void;
  onBack: () => void;
  onResendCode: () => void;
}

export default function EnterCodeScreen({ 
  email, 
  phone, 
  onCodeVerified, 
  onBack, 
  onResendCode 
}: EnterCodeScreenProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Start the 60-second timer
    setCanResend(false);
    setResendTimer(60);
    
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits of the verification code');
      return;
    }

    setIsLoading(true);

    try {
      type VerifyOtpResponse = {
        verifyOtp: {
          code: number;
          message: string;
        };
      };

      const variables: { 
        type: string; 
        otpOrToken: string; 
        email?: string; 
        phone?: string 
      } = email
        ? { 
            type: 'EMAIL', 
            otpOrToken: codeString, 
            email: email 
          }
        : { 
            type: 'PHONE', 
            otpOrToken: codeString, 
            phone: phone 
          };

      const data = await gqlFetch<VerifyOtpResponse>(VERIFY_OTP_MUTATION, variables, undefined, true);
      const result = data.verifyOtp;

      if (result.code === 200) {
        Alert.alert('Success', result.message || 'Code verified successfully!', [
          {
            text: 'OK',
            onPress: () => onCodeVerified(codeString),
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      type ResendOtpResponse = {
        resendOtp: {
          code: number;
        };
      };

      const variables: { type: string; email?: string; phone?: string } = email
        ? { type: 'EMAIL', email: email }
        : { type: 'PHONE', phone: phone };

      const data = await gqlFetch<ResendOtpResponse>(RESEND_OTP_MUTATION, variables, undefined, true);
      const result = data.resendOtp;

      if (result.code === 200) {
        // Reset timer
        setCanResend(false);
        setResendTimer(60);
        
        // Start new timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        timerRef.current = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Call parent resend function
        onResendCode();
        
        Alert.alert('Code Sent', `A new verification code has been sent to ${getContactInfo()}`);
      } else {
        Alert.alert('Error', 'Failed to resend verification code. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to resend verification code. Please try again.');
    }
  };

  const getContactInfo = () => {
    if (email) return email;
    if (phone) return phone;
    return 'your contact';
  };

  const getContactType = () => {
    if (email) return 'email';
    if (phone) return 'phone';
    return 'contact';
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
          {/* Code Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <View style={styles.codeIcon}>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>6</Text>
                </View>
                <View style={styles.codeLines}>
                  <View style={styles.codeLine} />
                  <View style={styles.codeLine} />
                  <View style={styles.codeLine} />
                </View>
              </View>
              <View style={styles.decorativeDots}>
                <View style={[styles.dot, styles.dotRed]} />
                <View style={[styles.dot, styles.dotGreen]} />
                <View style={[styles.dot, styles.dotBlue]} />
              </View>
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Enter Verification Code</Text>
            <View style={styles.contactInfoContainer}>
              <Text style={styles.contactInfoLabel}>
                Code sent to {email ? 'Email' : 'Phone'}:
              </Text>
              <Text style={styles.contactInfoValue}>{getContactInfo()}</Text>
            </View>
            <Text style={styles.subtitle}>
              Enter the 6-digit code we sent to verify your {getContactType()}
            </Text>
          </View>

          {/* Code Input Fields */}
          <View style={styles.codeContainer}>
            <View style={styles.inputRow}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.codeInput,
                    digit && styles.codeInputFilled,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
            onPress={handleVerifyCode}
            disabled={isLoading}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity 
              style={[styles.resendButton, !canResend && styles.resendButtonDisabled]} 
              onPress={handleResendCode}
              disabled={!canResend}
            >
              <Text style={[styles.resendButtonText, !canResend && styles.resendButtonTextDisabled]}>
                {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back to {getContactType()} verification</Text>
          </TouchableOpacity>
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
  codeIcon: {
    width: 50,
    height: 40,
    position: 'relative',
  },
  codeBox: {
    width: 30,
    height: 20,
    backgroundColor: '#fbbf24',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  codeLines: {
    position: 'absolute',
    top: 25,
    left: 5,
  },
  codeLine: {
    width: 20,
    height: 2,
    backgroundColor: '#fbbf24',
    marginBottom: 2,
    borderRadius: 1,
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
    marginBottom: 16,
  },
  contactInfoContainer: {
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1fae5',
    width: '100%',
  },
  contactInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f766e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  codeContainer: {
    marginBottom: 40,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  codeInput: {
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
  codeInputFilled: {
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa',
  },
  verifyButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 8,
  },
  resendButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#9ca3af',
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

