import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import DateTimePicker from '@react-native-community/datetimepicker';
import ButtonLoader from '../components/ButtonLoader';

interface ReminderFormData {
  date: Date;
  heading: string;
  message: string;
}

interface SetReminderFormProps {
  onSubmit?: (data: ReminderFormData) => void;
}

type SetReminderFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SetReminder'>;

export default function SetReminderForm(props?: SetReminderFormProps) {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RootStackParamList, 'SetReminder'>>();
  const { onSubmit } = props || {};
  const navigation = useNavigation<SetReminderFormNavigationProp>();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ReminderFormData>({
    date: new Date(),
    heading: '',
    message: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!formData.heading.trim()) {
      Alert.alert('Error', 'Please enter a heading for the reminder');
      return;
    }

    if (!formData.message.trim()) {
      Alert.alert('Error', 'Please enter a message for the reminder');
      return;
    }

    const submitHandler = onSubmit || route.params?.onSubmit;
    try {
      setSubmitting(true);
      if (submitHandler) {
        const possiblePromise: any = submitHandler(formData);
        if (possiblePromise && typeof possiblePromise.then === 'function') {
          await possiblePromise;
        }
      } else {
        Alert.alert(
          'Success',
          'Reminder set successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
      style={styles.container}
    >
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Set Reminder</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputText}>{formatDate(formData.date)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Heading Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Heading *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter reminder heading..."
              placeholderTextColor="#9ca3af"
              value={formData.heading}
              onChangeText={(text) => setFormData(prev => ({ ...prev, heading: text }))}
              maxLength={30}
            />
            <Text style={styles.characterCount}>
              {formData.heading.length}/30
            </Text>
          </View>

          {/* Message Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter reminder message..."
              placeholderTextColor="#9ca3af"
              value={formData.message}
              onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.characterCount}>
              {formData.message.length}/200
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, submitting && { opacity: 0.7 }]}
            onPress={() => { Keyboard.dismiss(); handleSubmit(); }}
            disabled={submitting}
          >
            <LinearGradient
              colors={['#0f766e', '#14b8a6']}
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {submitting ? (
                <ButtonLoader size={20} variant="white" />
              ) : (
                <Text style={styles.submitButtonText}>Set Reminder</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData(prev => ({ ...prev, date: selectedDate }));
            }
          }}
        />
      )}
      </SafeAreaView>
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
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  inputText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  textInput: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
    color: '#374151',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 30,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
