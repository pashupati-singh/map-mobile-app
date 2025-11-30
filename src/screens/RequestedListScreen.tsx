import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import CurvedHeader from '../components/CurvedHeader';
import CustomLoader from '../components/CustomLoader';
import { gqlFetch } from '../api/graphql';
import { GET_REQUESTS_QUERY } from '../graphql/query/requests';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Request {
  requestType: string;
  name: string | null;
  startDate: string | null;
  endDate: string | null;
  productName: string | null;
  assoicateDoc: string | null;
  remark: string | null;
  associates: string[];
  requestedDate: string;
  isApproved: boolean;
  isReject: boolean;
}

type RequestedListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RequestedList'>;

export default function RequestedListScreen() {
  const navigation = useNavigation<RequestedListScreenNavigationProp>();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = async (pageNum: number = 1, useCache: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      type RequestsResponse = {
        getRequests: {
          code: number;
          success: boolean;
          message: string;
          lastPage: number;
          data: Request[];
        };
      };

      const response = await gqlFetch<RequestsResponse>(
        GET_REQUESTS_QUERY,
        {
          page: pageNum,
          limit: 20,
        },
        token
      );

      if (response.getRequests.success) {
        const newRequests = response.getRequests.data;
        
        if (pageNum === 1) {
          setRequests(newRequests);
        } else {
          setRequests((prev) => [...prev, ...newRequests]);
        }
        
        setPage(pageNum);
        setLastPage(response.getRequests.lastPage);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRequests(1, false);
    }, [])
  );

  const handleLoadMore = () => {
    if (!loadingMore && page < lastPage) {
      loadRequests(page + 1, false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests(1, false).finally(() => {
      setRefreshing(false);
    });
  };

  const formatRequestType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'new-doctor': 'New Doctor',
      'new-chemist': 'New Chemist',
      'leaves': 'Leaves',
      'leave': 'Leave',
      'sample-templates': 'Sample Templates',
      'work-together': 'Work Together',
      'other': 'Other',
    };
    return typeMap[type] || type;
  };

  const formatDate = (timestamp: string): string => {
    try {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const renderRequestItem = ({ item }: { item: Request }) => {
    // Build array of fields to display (only non-null/non-empty)
    const fields: Array<{ label: string; value: string }> = [];

    if (item.name) {
      fields.push({ label: 'Name', value: item.name });
    }

    if (item.productName) {
      fields.push({ label: 'Product', value: item.productName });
    }

    if (item.startDate && item.endDate) {
      fields.push({ label: 'Date Range', value: `${item.startDate} - ${item.endDate}` });
    } else if (item.startDate) {
      fields.push({ label: 'Start Date', value: item.startDate });
    } else if (item.endDate) {
      fields.push({ label: 'End Date', value: item.endDate });
    }

    if (item.assoicateDoc) {
      fields.push({ label: 'Associate Doctor', value: item.assoicateDoc });
    }

    if (item.associates && item.associates.length > 0) {
      fields.push({ label: 'Associates', value: item.associates.join(', ') });
    }

    if (item.remark) {
      fields.push({ label: 'Remark', value: item.remark });
    }

    const requestedDate = formatDate(item.requestedDate);
    if (requestedDate) {
      fields.push({ label: 'Requested Date', value: requestedDate });
    }

    return (
      <TouchableOpacity
        style={styles.requestItem}
        activeOpacity={0.7}
      >
        <View style={styles.requestInfo}>
          <View style={styles.requestHeader}>
            <Text style={styles.requestType}>{formatRequestType(item.requestType)}</Text>
            <View style={styles.statusContainer}>
              {item.isApproved && (
                <View style={[styles.statusBadge, styles.approvedBadge]}>
                  <Text style={styles.statusText}>Approved</Text>
                </View>
              )}
              {item.isReject && (
                <View style={[styles.statusBadge, styles.rejectedBadge]}>
                  <Text style={styles.statusText}>Rejected</Text>
                </View>
              )}
              {!item.isApproved && !item.isReject && (
                <View style={[styles.statusBadge, styles.pendingBadge]}>
                  <Text style={styles.statusText}>Pending</Text>
                </View>
              )}
            </View>
          </View>
          
          {fields.map((field, index) => (
            <View key={index} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{field.label}:</Text>
              <Text style={styles.fieldValue}>{field.value}</Text>
            </View>
          ))}
        </View>
        {/* <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#0f766e" />
        </View> */}
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0f766e" />
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
      style={styles.container}
    >
      <CurvedHeader title="Requested List" />
      
      {loading && requests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <CustomLoader size={48} color="#0f766e" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No requests found</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item, index) => `${item.requestType}-${item.requestedDate}-${index}`}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
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
  requestInfo: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  approvedBadge: {
    backgroundColor: '#d1fae5',
  },
  rejectedBadge: {
    backgroundColor: '#fee2e2',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 6,
  },
  fieldValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

