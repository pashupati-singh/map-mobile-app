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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface EmailVerificationScreenProps {
  onCodeSent: (email: string) => void;
  onBack: () => void;
}

export default function EmailVerificationScreen({ onCodeSent, onBack }: EmailVerificationScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async () => {
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Code Sent', 'Verification code has been sent to your email', [
        {
          text: 'OK',
          onPress: () => onCodeSent(email),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Email Icon */}
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

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>Enter your email address to receive verification code</Text>
          </View>

          {/* Email Input */}
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

          {/* Send Code Button */}
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleSendCode}
            disabled={isLoading}
          >
            <Text style={styles.sendButtonText}>
              {isLoading ? 'Sending Code...' : 'Send Verification Code'}
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
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
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  sendButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
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

