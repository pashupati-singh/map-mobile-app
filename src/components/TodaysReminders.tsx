import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DoctorReminder {
  id: string;
  name: string;
  phoneNumber: string;
  titles: string[];
  eventType: 'birthday' | 'anniversary';
  eventDate: string;
  profileImage?: string;
}

interface TodaysRemindersProps {
  reminders: DoctorReminder[];
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = 16;

export default function TodaysReminders({ reminders }: TodaysRemindersProps) {
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
    }, 3000); // Auto scroll every 3 seconds

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

  const getEventIcon = (eventType: string) => {
    return eventType === 'birthday' ? 'gift-outline' : 'heart-outline';
  };

  const getEventIconColor = (eventType: string) => {
    return eventType === 'birthday' ? '#0f766e' : '#0f766e';
  };

  if (reminders.length === 0) { 
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No Events for today</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Important Events</Text>
        {/* <View style={styles.eventCountBadge}> */}
          {/* <Text style={styles.eventCountText}>{reminders.length}</Text> */}
        {/* </View> */}
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
          <TouchableOpacity
            key={reminder.id}
            style={[styles.cardContainer, { width: CARD_WIDTH }]}
            activeOpacity={0.9}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.eventIconContainer}>
                  <Ionicons
                    name={getEventIcon(reminder.eventType) as any}
                    size={24}
                    color={getEventIconColor(reminder.eventType)}
                  />
                </View>
                <View style={styles.eventTypeContainer}>
                  <Text style={styles.eventTypeText}>
                    {reminder.eventType === 'birthday' ? 'Birthday' : 'Anniversary'}
                  </Text>
                </View>
              </View>

              <View style={styles.doctorInfo}>
                <View style={styles.profileSection}>
                  {reminder.profileImage ? (
                    <Image
                      source={{ uri: reminder.profileImage }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.defaultProfileImage}>
                      <Ionicons name="person" size={32} color="#0f766e" />
                    </View>
                  )}
                  <View style={styles.doctorDetails}>
                    <Text style={styles.doctorName}>{reminder.name}</Text>
                    <View style={styles.titlesContainer}>
                      {reminder.titles.map((title, titleIndex) => (
                        <View key={titleIndex} style={styles.titleChip}>
                          <Text style={styles.titleText}>{title}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.contactSection}>
                  <View style={styles.phoneContainer}>
                    <Ionicons name="call-outline" size={16} color="#6b7280" />
                    <Text style={styles.phoneText}>{reminder.phoneNumber}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.todayText}>
                  Today is {reminder.eventType === 'birthday' ? 'their birthday' : 'their anniversary'}!
                </Text>
              </View>
            </View>
          </TouchableOpacity>
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
  eventCountBadge: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventCountText: {
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
  scrollView: {
    marginHorizontal: -4,
  },
  scrollContainer: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  cardContainer: {
    marginRight: CARD_SPACING,
  },
  card: {
    backgroundColor: '#fff6ef',
    borderRadius: 16,
    padding: 14,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventTypeContainer: {
    flex: 1,
  },
  eventTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 2,
  },
  eventDateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  doctorInfo: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'black',
  },
  defaultProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 8,
  },
  titlesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  titleChip: {
    backgroundColor: 'rgba(15, 118, 110, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  titleText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  contactSection: {
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  phoneText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
    fontWeight: '500',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 118, 110, 0.2)',
    paddingTop: 12,
  },
  todayText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
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
