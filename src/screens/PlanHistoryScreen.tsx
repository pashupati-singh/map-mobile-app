import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { gqlFetch } from '../api/graphql';
import { GET_DAILY_PLANS_BY_MR_ID_QUERY } from '../graphql/query/planHistory';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomLoader from '../components/CustomLoader';
import CurvedHeader from '../components/CurvedHeader';

type PlanHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlanHistory'>;

interface DailyPlan {
  id: number;
  planDate: string;
  isWorkTogetherConfirmed: boolean;
  isRejected: boolean;
  workTogether: boolean;
  isApproved: boolean;
  notes: string | null;
}

interface PlanHistoryResponse {
  getDailyPlansByMRId: {
    code: number;
    success: boolean;
    message: string;
    data: DailyPlan[];
  };
}

export default function PlanHistoryScreen() {
  const navigation = useNavigation<PlanHistoryScreenNavigationProp>();
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pressedCardIndex, setPressedCardIndex] = useState<number | null>(null);

  const limit = 7;

  const loadPlans = async (pageNumber: number, isRefreshing: boolean = false) => {
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

      const response = await gqlFetch<PlanHistoryResponse>(
        GET_DAILY_PLANS_BY_MR_ID_QUERY,
        { page: pageNumber, limit },
        token
      );

      if (response.getDailyPlansByMRId.success) {
        const newPlans = response.getDailyPlansByMRId.data || [];
        
        if (isRefreshing || pageNumber === 1) {
          setPlans(newPlans);
        } else {
          setPlans((prevPlans) => [...prevPlans, ...newPlans]);
        }

        // Check if there are more items to load
        // If we got exactly the limit, there might be more data
        // If we got less than the limit, we've reached the end
        setHasMore(newPlans.length === limit);
      } else {
        throw new Error(response.getDailyPlansByMRId.message || 'Failed to load plans');
      }
    } catch (err: any) {
      console.error('Error loading plans:', err);
      setError(err.message || 'Failed to load plans');
      if (pageNumber === 1) {
        Alert.alert('Error', err.message || 'Failed to load plans. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlans(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPlans(nextPage);
    }
  }, [loadingMore, hasMore, loading, page]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadPlans(1, true);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(Number(dateString));
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (plan: DailyPlan) => {
    if (plan.isApproved) return '#10b981'; // Green
    if (plan.isRejected) return '#ef4444'; // Red
    if (plan.isWorkTogetherConfirmed) return '#3b82f6'; // Blue
    return '#f59e0b'; // Amber (Pending)
  };

  const getStatusText = (plan: DailyPlan) => {
    if (plan.isApproved) return 'Approved';
    if (plan.isRejected) return 'Rejected';
    if (plan.isWorkTogetherConfirmed) return 'Work Together Confirmed';
    return 'Pending';
  };

  const getStatusIcon = (plan: DailyPlan) => {
    if (plan.isApproved) return 'checkmark-circle';
    if (plan.isRejected) return 'close-circle';
    if (plan.isWorkTogetherConfirmed) return 'people';
    return 'time';
  };

  const renderPlanCard = ({ item, index }: { item: DailyPlan; index: number }) => {
    const statusColor = getStatusColor(item);
    const statusText = getStatusText(item);
    const statusIcon = getStatusIcon(item);
    const isPressed = pressedCardIndex === index;

    return (
      <Pressable
        onPressIn={() => setPressedCardIndex(index)}
        onPressOut={() => setPressedCardIndex(null)}
        onPress={() => {
          setPressedCardIndex(null);
          navigation.navigate('PlanDetail', { planId: item.id });
        }}
        style={({ pressed }) => [
          styles.card,
          (pressed || isPressed) && styles.cardPressed,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#0f766e" />
            <Text style={styles.dateText}>{formatDate(item.planDate)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Ionicons name={statusIcon} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={15} color="#64748b" />
            <Text style={styles.infoLabel}>Work Together:</Text>
            <Text style={[styles.infoValue, { color: item.workTogether ? '#10b981' : '#64748b' }]}>
              {item.workTogether ? 'Yes' : 'No'}
            </Text>
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Ionicons name="document-text-outline" size={15} color="#64748b" />
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText} numberOfLines={2} ellipsizeMode="tail">{item.notes}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0f766e" />
        <Text style={styles.footerLoaderText}>Loading more plans...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={64} color="#9ca3af" />
        <Text style={styles.emptyText}>No plans found</Text>
        <Text style={styles.emptySubtext}>You don't have any daily plans yet.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <CurvedHeader title="Plan History" />

      {/* Content */}
      {loading && plans.length === 0 ? (
        <View style={styles.loadingContainer}>
          <CustomLoader size={48} color="#0f766e" />
        </View>
      ) : error && plans.length === 0 ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => `plan-${item.id}`}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
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
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
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
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardPressed: {
    backgroundColor: '#f0f9ff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    marginLeft: 6,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 6,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  notesLabel: {
    marginLeft: 6,
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 6,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

