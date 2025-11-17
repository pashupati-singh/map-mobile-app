import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../types/navigation';
import { gqlFetch } from '../api/graphql';
import { GET_REMINDARS_QUERY } from '../graphql/query/reminders';
import CustomLoader from '../components/CustomLoader';
import CurvedHeader from '../components/CurvedHeader';

type OldRemindersScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OldReminders'
>;

interface Reminder {
  remindAt: string;
  heading: string;
  message: string;
}

interface GetRemindarsResponse {
  getRemindars: {
    code: number;
    success: boolean;
    message?: string;
    lastPage?: number | boolean | null;
    data: Reminder[];
  };
}

export default function OldRemindersScreen() {
  const navigation = useNavigation<OldRemindersScreenNavigationProp>();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const limit = 10;

  const formatReminderDate = useCallback((remindAt: string) => {
    try {
      const date = new Date(Number(remindAt));
      const dateStr = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${dateStr} • ${timeStr}`;
    } catch {
      return 'Invalid date';
    }
  }, []);

  const determineHasMore = useCallback(
    (pageNumber: number, lastPage: number | boolean | null | undefined, received: number) => {
      if (typeof lastPage === 'number') {
        return pageNumber < lastPage;
      }
      if (typeof lastPage === 'boolean') {
        return !lastPage;
      }
      if (lastPage === null) {
        return received === limit;
      }
      return received === limit;
    },
    [limit]
  );

  const loadReminders = useCallback(
    async (pageNumber: number, options?: { refreshing?: boolean }) => {
      const isRefreshing = options?.refreshing ?? false;
      try {
        if (isRefreshing) {
          setRefreshing(true);
          setError(null);
        } else if (pageNumber === 1) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await gqlFetch<GetRemindarsResponse>(
          GET_REMINDARS_QUERY,
          { page: pageNumber, limit },
          token
        );

        if (!response?.getRemindars?.success) {
          throw new Error(response?.getRemindars?.message || 'Failed to load reminders');
        }

        const newReminders = response.getRemindars.data ?? [];

        if (isRefreshing || pageNumber === 1) {
          setReminders(newReminders);
        } else {
          setReminders((prev) => [...prev, ...newReminders]);
        }

        const shouldContinue = determineHasMore(
          pageNumber,
          response.getRemindars.lastPage,
          newReminders.length
        );
        setHasMore(shouldContinue);
      } catch (err: any) {
        console.error('Error loading reminders:', err);
        const message = err?.message || 'Failed to load reminders';
        setError(message);
        if (pageNumber === 1) {
          Alert.alert('Error', message);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [determineHasMore, limit]
  );

  useEffect(() => {
    loadReminders(1).catch(console.error);
  }, [loadReminders]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadReminders(1, { refreshing: true }).catch(console.error);
  }, [loadReminders]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) {
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);
    loadReminders(nextPage).catch(console.error);
  }, [hasMore, loadReminders, loading, loadingMore, page]);

  const renderReminderCard = ({ item }: { item: Reminder }) => {
    const formattedDate = formatReminderDate(item.remindAt);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headingContainer}>
            <Ionicons name="notifications-outline" size={16} color="#0f766e" />
            <Text style={styles.headingText} numberOfLines={1}>
              {item.heading || 'Untitled Reminder'}
            </Text>
          </View>
          <View style={styles.dateChip}>
            <Ionicons name="time-outline" size={14} color="#0f766e" />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>

        {item.message ? (
          <Text style={styles.messageText}>{item.message}</Text>
        ) : (
          <Text style={[styles.messageText, styles.messagePlaceholder]}>
            No additional details provided.
          </Text>
        )}
      </View>
    );
  };

  const keyExtractor = useCallback(
    (_item: Reminder, index: number) => `reminder-${index}`,
    []
  );

  const listEmptyComponent = useMemo(() => {
    if (loading) {
      return null;
    }
    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.emptyTitle}>Unable to load reminders</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Ionicons name="archive-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No old reminders</Text>
        <Text style={styles.emptySubtitle}>
          You have cleared all reminders. New ones will appear here automatically.
        </Text>
      </View>
    );
  }, [error, handleRefresh, loading]);

  const listFooterComponent = useMemo(() => {
    if (!loadingMore) {
      return null;
    }
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0f766e" />
        <Text style={styles.footerLoaderText}>Loading more reminders...</Text>
      </View>
    );
  }, [loadingMore]);

  return (
    <View style={styles.container}>
      <CurvedHeader title="Old Reminders" />

      {loading && reminders.length === 0 ? (
        <View style={styles.loaderContainer}>
          <CustomLoader size={48} color="#0f766e" />
        </View>
      ) : (
        <FlatList
          data={reminders}
          renderItem={renderReminderCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={listEmptyComponent}
          ListFooterComponent={listFooterComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0f766e']}
              tintColor="#0f766e"
            />
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
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
    gap: 8,
  },
  headingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flexShrink: 1,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0f766e',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  messagePlaceholder: {
    fontStyle: 'italic',
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
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
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 14,
    color: '#64748b',
  },
});

