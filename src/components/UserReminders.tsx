import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ReminderManager, UserReminder } from '../utils/ReminderManager';

interface UserRemindersProps {
  reminders: UserReminder[];
  onReminderUpdate?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = 16;

export default function UserReminders({ reminders, onReminderUpdate }: UserRemindersProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    if (reminders.length <= 1) return;

    const autoScrollInterval = setInterval(() => {
      if (isAutoScrolling) {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % reminders.length;
          scrollViewRef.current?.scrollTo({
            x: nextIndex * (CARD_WIDTH + CARD_SPACING),
            animated: true,
          });
          return nextIndex;
        });
      }
    }, 4000); // Auto scroll every 4 seconds

    return () => clearInterval(autoScrollInterval);
  }, [reminders.length, isAutoScrolling]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  const handleScrollBegin = () => {
    setIsAutoScrolling(false);
  };

  const handleScrollEnd = () => {
    setTimeout(() => setIsAutoScrolling(true), 2000);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleMarkCompleted = async (reminderId: string) => {
    try {
      await ReminderManager.markReminderCompleted(reminderId);
      onReminderUpdate?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark reminder as completed');
    }
  };

  const handleDeleteReminder = (reminderId: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ReminderManager.deleteReminder(reminderId);
              onReminderUpdate?.();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  if (reminders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alarm-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No reminders for today</Text>
          <Text style={styles.emptySubText}>Create a reminder to get started</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Today's Reminders</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {reminders.map((reminder, index) => (
          <View
            key={reminder.id}
            style={[styles.cardContainer, { width: CARD_WIDTH }]}
          >
            <LinearGradient
              colors={['#0f766e', '#14b8a6']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.reminderContent}>
                <Text style={styles.reminderHeading} numberOfLines={1} ellipsizeMode="tail">
                  {reminder.heading}
                </Text>
                <Text style={styles.reminderMessage} numberOfLines={4} ellipsizeMode="tail">
                  {reminder.message}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.createdText}>
                  Created on {formatDate(reminder.createdAt)}
                </Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {reminders.length > 1 && (
        <View style={styles.paginationContainer}>
          {reminders.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.activePaginationDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  reminderCountBadge: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reminderCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  scrollView: {
    marginHorizontal: -4,
  },
  scrollContainer: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  cardContainer: {
    marginRight: CARD_SPACING,
    marginBottom: 4,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    height: 200,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'visible',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  reminderTimeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderContent: {
    flexGrow: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  reminderHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  reminderMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
  },
  createdText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: '#0f766e',
    width: 20,
  },
});
