import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomLoader from '../components/CustomLoader';
import CurvedHeader from '../components/CurvedHeader';
import { gqlFetch } from '../api/graphql';
import { UPCOMING_EVENTS_QUERY } from '../graphql/query/upcomingEvents';
import { RootStackParamList } from '../types/navigation';

type UpcomingEventsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UpcomingEvents'>;

type ApiDoctorEvent = {
  type?: string | null;
  phone?: string | null;
  email?: string | null;
  dob?: string | null;
  anniversary?: string | null;
  doctor?: {
    name?: string | null;
    titles?: string[] | null;
    status?: string | null;
  } | null;
};

type ApiChemistEvent = {
  type?: string | null;
  phone?: string | null;
  email?: string | null;
  dob?: string | null;
  anniversary?: string | null;
  chemist?: {
    name?: string | null;
    titles?: string[] | null;
    status?: string | null;
  } | null;
};

type UpcomingEventsResponse = {
  upcomingEvents: {
    code: number;
    success: boolean;
    message?: string;
    data?: {
      events: Array<ApiDoctorEvent | ApiChemistEvent>;
    } | null;
  };
};

type NormalisedEvent = {
  id: string;
  name: string;
  titles: string[];
  email: string | null;
  phone: string | null;
  eventType: 'birthday' | 'anniversary' | 'both';
  dob?: string | null;
  anniversary?: string | null;
  status?: string | null;
};

export default function UpcomingEventsScreen() {
  const navigation = useNavigation<UpcomingEventsNavigationProp>();
  const [events, setEvents] = useState<NormalisedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseDate = useCallback((value?: string | null) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    const date = Number.isFinite(numeric) ? new Date(numeric) : new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }, []);

  const formatDate = useCallback(
    (value?: string | null) => {
      const date = parseDate(value);
      if (!date) return null;
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    },
    [parseDate]
  );

  const determineEventType = useCallback(
    (rawType: string | undefined | null, dob?: string | null, anniversary?: string | null) => {
      const normalisedType = (rawType ?? '').toString().toLowerCase();
      if (normalisedType === 'birthday' || normalisedType === 'anniversary' || normalisedType === 'both') {
        return normalisedType as 'birthday' | 'anniversary' | 'both';
      }

      const dobDate = parseDate(dob);
      const anniversaryDate = parseDate(anniversary);
      if (dobDate && anniversaryDate) {
        const sameDay =
          dobDate.getUTCDate() === anniversaryDate.getUTCDate() &&
          dobDate.getUTCMonth() === anniversaryDate.getUTCMonth();
        if (sameDay) {
          return 'both';
        }
      }

      if (dobDate) {
        return 'birthday';
      }
      return 'anniversary';
    },
    [parseDate]
  );

  const loadEvents = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await gqlFetch<UpcomingEventsResponse>(UPCOMING_EVENTS_QUERY, {}, token);

      if (!response?.upcomingEvents?.success) {
        throw new Error(response?.upcomingEvents?.message || 'Failed to load upcoming events');
      }

      const apiEvents = response.upcomingEvents.data?.events ?? [];
      const transformed = apiEvents.map((rawEvent, index) => {
        const isDoctor = 'doctor' in rawEvent;
        const person = (isDoctor ? (rawEvent as ApiDoctorEvent).doctor : (rawEvent as ApiChemistEvent).chemist) ?? {
          name: '',
          titles: [],
          status: null,
        };

        const email = (rawEvent.email ?? '').trim() || null;
        const phone = (rawEvent.phone ?? '').trim() || null;
        const dob = rawEvent.dob ?? null;
        const anniversary = rawEvent.anniversary ?? null;

        const eventType = determineEventType(rawEvent.type, dob, anniversary);

        return {
          id: `upcoming-event-${index}`,
          name: person.name ? person.name : 'Unknown',
          titles: person.titles?.filter(Boolean) ?? [],
          email,
          phone,
          eventType,
          dob,
          anniversary,
          status: person.status ?? null,
        } as NormalisedEvent;
      });

      setEvents(transformed);
      setError(null);
    } catch (err: any) {
      console.error('Error loading upcoming events:', err);
      const message = err?.message || 'Failed to load upcoming events';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [determineEventType, formatDate]);

  useEffect(() => {
    loadEvents().catch(console.error);
  }, [loadEvents]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents().catch(console.error);
  }, [loadEvents]);

  const getIconName = useCallback((eventType: NormalisedEvent['eventType']) => {
    switch (eventType) {
      case 'birthday':
        return 'gift-outline';
      case 'anniversary':
        return 'heart-outline';
      case 'both':
        return 'sparkles-outline';
      default:
        return 'calendar-outline';
    }
  }, []);

  const getEventLabel = useCallback((eventType: NormalisedEvent['eventType']) => {
    switch (eventType) {
      case 'birthday':
        return 'Birthday';
      case 'anniversary':
        return 'Anniversary';
      case 'both':
        return 'Birthday & Anniversary';
      default:
        return 'Event';
    }
  }, []);

  const renderEventCard = useCallback(
    ({ item }: { item: NormalisedEvent }) => {
      const iconName = getIconName(item.eventType);
      const eventLabel = getEventLabel(item.eventType);

      // Determine which dates to show based on event type
      const showBirthday = item.eventType === 'birthday' || item.eventType === 'both';
      const showAnniversary = item.eventType === 'anniversary' || item.eventType === 'both';

      // Determine which date to display in the card header
      let displayDate: string | null = null;
      if (item.eventType === 'birthday') {
        displayDate = item.dob ?? null;
      } else if (item.eventType === 'anniversary') {
        displayDate = item.anniversary ?? null;
      } else if (item.eventType === 'both') {
        // For "both", prefer birthday date, fallback to anniversary
        displayDate = item.dob ?? item.anniversary ?? null;
      }

      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="person-circle-outline" size={22} color="#0f766e" />
              <Text style={styles.nameText} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <View style={styles.eventBadge}>
              <Ionicons name={iconName as any} size={16} color="#0f766e" />
              <Text style={styles.eventBadgeText}>{eventLabel}</Text>
            </View>
          </View>
          {item.titles.length > 0 && (
            <View style={styles.titlesContainer}>
              {item.titles.map((title, index) => (
                <View key={`${item.id}-title-${index}`} style={styles.titleChip}>
                  <Text style={styles.titleChipText}>{title}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{item.phone ?? 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{item.email ?? 'Not provided'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.datesContainer}>
            {showBirthday && item.dob && (
              <View style={styles.dateItem}>
                <Ionicons name="gift-outline" size={16} color="#0f766e" />
                <Text style={styles.dateValue}>{item.dob}</Text>
              </View>
            )}
            {showAnniversary && item.anniversary && (
              <View style={styles.dateItem}>
                <Ionicons name="heart-outline" size={16} color="#ef4444" />
                <Text style={styles.dateValue}>{item.anniversary}</Text>
              </View>
            )}
          </View>
        </View>
      );
    },
    [getIconName, getEventLabel]
  );

  const keyExtractor = useCallback((item: NormalisedEvent) => item.id, []);

  const listEmptyComponent = useMemo(() => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.emptyTitle}>Unable to load upcoming events</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No upcoming events</Text>
        <Text style={styles.emptySubtitle}>
          You're all caught up! When new events are scheduled, they'll appear here.
        </Text>
      </View>
    );
  }, [error, handleRefresh, loading]);

  return (
    <View style={styles.container}>
      <CurvedHeader title="Upcoming Events" />

      {loading && !refreshing && events.length === 0 ? (
        <View style={styles.loaderContainer}>
          <CustomLoader size={48} color="#0f766e" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={keyExtractor}
          renderItem={renderEventCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={listEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0f766e']}
              tintColor="#0f766e"
            />
          }
          ListFooterComponent={
            refreshing ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#0f766e" />
                <Text style={styles.footerLoaderText}>Refreshing events...</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#0f766e',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flexShrink: 1,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e',
  },
  dateDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 6,
  },
  dateDisplayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  titlesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  titleChip: {
    backgroundColor: 'rgba(15, 118, 110, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  titleChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f766e',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    marginLeft: 6,
    marginRight: 6,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  emptyState: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0f766e',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 13,
    color: '#64748b',
  },
});


