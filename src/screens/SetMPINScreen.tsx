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

interface SetMPINScreenProps {
  onMPINSet: (mpin: string) => void;
  onBack: () => void;
}

export default function SetMPINScreen({ onMPINSet, onBack }: SetMPINScreenProps) {
  const [mpin, setMpin] = useState(['', '', '', '', '', '']);
  const [confirmMpin, setConfirmMpin] = useState(['', '', '', '', '', '']);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const confirmInputRefs = useRef<TextInput[]>([]);

  const handleMpinChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newMpin = [...mpin];
    newMpin[index] = value;
    setMpin(newMpin);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleConfirmMpinChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newConfirmMpin = [...confirmMpin];
    newConfirmMpin[index] = value;
    setConfirmMpin(newConfirmMpin);

    if (value && index < 5) {
      confirmInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number, isConfirm: boolean = false) => {
    const currentMpin = isConfirm ? confirmMpin : mpin;
    const currentRefs = isConfirm ? confirmInputRefs : inputRefs;
    
    if (key === 'Backspace' && !currentMpin[index] && index > 0) {
      currentRefs.current[index - 1]?.focus();
    }
  };

  const handleSetMPIN = async () => {
    const mpinString = mpin.join('');
    const confirmMpinString = confirmMpin.join('');
    
    if (mpinString.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits of your MPIN');
      return;
    }

    if (confirmMpinString.length !== 6) {
      Alert.alert('Error', 'Please confirm your MPIN');
      return;
    }

    if (mpinString !== confirmMpinString) {
      Alert.alert('Error', 'MPIN and confirmation do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store MPIN (in real app, this would be encrypted)
      // await AsyncStorage.setItem('userMPIN', mpinString);
      
      Alert.alert('Success', 'MPIN set successfully!', [
        {
          text: 'OK',
          onPress: () => onMPINSet(mpinString),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to set MPIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mpin.every(digit => digit !== '') && !isConfirming) {
      setIsConfirming(true);
    }
  }, [mpin, isConfirming]);

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
          {/* MPIN Icon */}
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

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Set Your MPIN</Text>
            <Text style={styles.subtitle}>Create a 6-digit MPIN for secure access</Text>
          </View>

          {/* MPIN Input Fields */}
          <View style={styles.mpinContainer}>
            <Text style={styles.label}>Enter MPIN</Text>
            <View style={styles.inputRow}>
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
          </View>

          {/* Confirm MPIN Input Fields */}
          {isConfirming && (
            <View style={styles.mpinContainer}>
              <Text style={styles.label}>Confirm MPIN</Text>
              <View style={styles.inputRow}>
                {confirmMpin.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) confirmInputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.mpinInput,
                      digit && styles.mpinInputFilled,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleConfirmMpinChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index, true)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>
            </View>
          )}

          {/* Set MPIN Button */}
          <TouchableOpacity
            style={[styles.setButton, isLoading && styles.setButtonDisabled]}
            onPress={handleSetMPIN}
            disabled={isLoading}
          >
            <Text style={styles.setButtonText}>
              {isLoading ? 'Setting MPIN...' : 'Set MPIN'}
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
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
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  setButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  setButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  setButtonText: {
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

