import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { gqlFetch } from '../api/graphql';
import { GET_DAILY_PLAN_BY_ID_QUERY } from '../graphql/query/planHistory';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomLoader from '../components/CustomLoader';
import CurvedHeader from '../components/CurvedHeader';

type PlanDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlanDetail'>;
type PlanDetailScreenRouteProp = RouteProp<RootStackParamList, 'PlanDetail'>;

interface Doctor {
  dcr: boolean;
  doctorCompanyId: number;
  DoctorCompany: {
    email: string;
    phone: string;
    doctor: {
      name: string;
      titles: string[];
    };
  };
}

interface Chemist {
  dcr: boolean;
  chemistCompanyId: number;
  ChemistCompany: {
    email: string;
    phone: string;
    chemist: {
      name: string;
      titles: string[];
    };
  };
}

interface PlanDetailData {
  isApproved: boolean;
  workTogether: boolean;
  isWorkTogetherConfirmed: boolean;
  isRejected: boolean;
  planDate: string;
  notes: string | null;
  doctors: Doctor[];
  chemists: Chemist[];
}

interface PlanDetailResponse {
  getDailyPlanById: {
    code: number;
    success: boolean;
    message: string;
    data: PlanDetailData;
  };
}

export default function PlanDetailScreen() {
  const navigation = useNavigation<PlanDetailScreenNavigationProp>();
  const route = useRoute<PlanDetailScreenRouteProp>();
  const { planId } = route.params;
  
  const [planDetail, setPlanDetail] = useState<PlanDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlanDetail();
  }, [planId]);

  const loadPlanDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await gqlFetch<PlanDetailResponse>(
        GET_DAILY_PLAN_BY_ID_QUERY,
        { getDailyPlanByIdId: planId },
        token
      );

      if (response.getDailyPlanById.success) {
        setPlanDetail(response.getDailyPlanById.data);
      } else {
        throw new Error(response.getDailyPlanById.message || 'Failed to load plan details');
      }
    } catch (err: any) {
      console.error('Error loading plan detail:', err);
      setError(err.message || 'Failed to load plan details');
      Alert.alert('Error', err.message || 'Failed to load plan details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(Number(dateString));
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = () => {
    if (planDetail?.isApproved) return '#10b981'; // Green
    if (planDetail?.isRejected) return '#ef4444'; // Red
    if (planDetail?.isWorkTogetherConfirmed) return '#3b82f6'; // Blue
    return '#f59e0b'; // Amber (Pending)
  };

  const getStatusText = () => {
    if (planDetail?.isApproved) return 'Approved';
    if (planDetail?.isRejected) return 'Rejected';
    if (planDetail?.isWorkTogetherConfirmed) return 'Work Together Confirmed';
    return 'Pending';
  };

  const getStatusIcon = () => {
    if (planDetail?.isApproved) return 'checkmark-circle';
    if (planDetail?.isRejected) return 'close-circle';
    if (planDetail?.isWorkTogetherConfirmed) return 'people';
    return 'time';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CurvedHeader title="Plan Details" />
        <View style={styles.loadingContainer}>
          <CustomLoader size={48} color="#0f766e" />
        </View>
      </View>
    );
  }

  if (error || !planDetail) {
    return (
      <View style={styles.container}>
        <CurvedHeader title="Plan Details" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Plan not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPlanDetail}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor();
  const statusText = getStatusText();
  const statusIcon = getStatusIcon();

  // Calculate statistics
  const totalDoctors = planDetail.doctors?.length || 0;
  const totalChemists = planDetail.chemists?.length || 0;
  const totalPeople = totalDoctors + totalChemists;
  
  const reportedCalls = [
    ...(planDetail.doctors || []).filter(d => d.dcr),
    ...(planDetail.chemists || []).filter(c => c.dcr),
  ].length;
  
  const missedCalls = [
    ...(planDetail.doctors || []).filter(d => !d.dcr),
    ...(planDetail.chemists || []).filter(c => !c.dcr),
  ].length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0f766e', '#14b8a6']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan Details</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={20} color="#0f766e" />
              <Text style={styles.dateText}>{formatDate(planDetail.planDate)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Ionicons name={statusIcon} size={16} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={18} color="#64748b" />
              <Text style={styles.infoLabel}>Work Together:</Text>
              <Text style={[styles.infoValue, { color: planDetail.workTogether ? '#10b981' : '#64748b' }]}>
                {planDetail.workTogether ? 'Yes' : 'No'}
              </Text>
            </View>

            {planDetail.notes && (
              <View style={styles.notesContainer}>
                <Ionicons name="document-text-outline" size={18} color="#64748b" />
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{planDetail.notes}</Text>
              </View>
            )}

            {/* Statistics Section */}
            <View style={styles.statisticsContainer}>
              <View style={styles.statisticsRow}>
                <View style={styles.statisticItem}>
                  <Ionicons name="people-outline" size={24} color="#0f766e" />
                  <View style={styles.statisticContent}>
                    <Text style={styles.statisticValue}>{totalPeople}</Text>
                    <Text style={styles.statisticLabel}>Total People</Text>
                  </View>
                </View>
                <View style={styles.statisticDivider} />
                <View style={styles.statisticItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  <View style={styles.statisticContent}>
                    <Text style={styles.statisticValue}>{reportedCalls}</Text>
                    <Text style={styles.statisticLabel}>Call Reported</Text>
                  </View>
                </View>
                <View style={styles.statisticDivider} />
                <View style={styles.statisticItem}>
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                  <View style={styles.statisticContent}>
                    <Text style={styles.statisticValue}>{missedCalls}</Text>
                    <Text style={styles.statisticLabel}>Call Missed</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Doctors Section */}
        {planDetail.doctors && planDetail.doctors.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical-outline" size={20} color="#0f766e" />
              <Text style={styles.sectionTitle}>Doctors ({planDetail.doctors.length})</Text>
            </View>
            {planDetail.doctors.map((doctor, index) => (
              <View key={index} style={styles.personCard}>
                <View style={styles.personHeader}>
                  <View style={styles.personNameContainer}>
                    <Ionicons name="person-circle-outline" size={24} color="#0f766e" />
                    <View style={styles.personInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.personName}>
                          Dr. {doctor.DoctorCompany.doctor.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.checkDcrButton}
                          onPress={() => {
                            Alert.alert('Check DCR', `DCR for Dr. ${doctor.DoctorCompany.doctor.name}`);
                          }}
                        >
                          <Text style={styles.checkDcrButtonText}>Check DCR</Text>
                        </TouchableOpacity>
                      </View>
                      {doctor.DoctorCompany.doctor.titles && doctor.DoctorCompany.doctor.titles.length > 0 && (
                        <Text style={styles.personTitle}>
                          {doctor.DoctorCompany.doctor.titles.join(', ')}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.personDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="mail-outline" size={16} color="#64748b" />
                    <Text style={styles.detailText}>{doctor.DoctorCompany.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={16} color="#64748b" />
                    <Text style={styles.detailText}>{doctor.DoctorCompany.phone}</Text>
                  </View>
                  <View style={styles.detailRowWithBadge}>
                    <View style={[styles.dcrBadge, doctor.dcr ? styles.dcrBadgeCompleted : styles.dcrBadgeMissed]}>
                      <Ionicons 
                        name={doctor.dcr ? "checkmark-circle" : "close-circle"} 
                        size={14} 
                        color="white" 
                        style={styles.dcrBadgeIcon}
                      />
                      <Text style={styles.dcrBadgeText}>
                        {doctor.dcr ? 'Call Reported' : 'Call Missed'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Chemists Section */}
        {planDetail.chemists && planDetail.chemists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business-outline" size={20} color="#0f766e" />
              <Text style={styles.sectionTitle}>Chemists ({planDetail.chemists.length})</Text>
            </View>
            {planDetail.chemists.map((chemist, index) => (
              <View key={index} style={styles.personCard}>
                <View style={styles.personHeader}>
                  <View style={styles.personNameContainer}>
                    <Ionicons name="person-circle-outline" size={24} color="#0f766e" />
                    <View style={styles.personInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.personName}>
                          {chemist.ChemistCompany.chemist.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.checkDcrButton}
                          onPress={() => {
                            // Handle Check DCR action
                            Alert.alert('Check DCR', `DCR for ${chemist.ChemistCompany.chemist.name}`);
                          }}
                        >
                          <Text style={styles.checkDcrButtonText}>Check DCR</Text>
                        </TouchableOpacity>
                      </View>
                      {chemist.ChemistCompany.chemist.titles && chemist.ChemistCompany.chemist.titles.length > 0 && (
                        <Text style={styles.personTitle}>
                          {chemist.ChemistCompany.chemist.titles.join(', ')}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.personDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="mail-outline" size={16} color="#64748b" />
                    <Text style={styles.detailText}>{chemist.ChemistCompany.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={16} color="#64748b" />
                    <Text style={styles.detailText}>{chemist.ChemistCompany.phone}</Text>
                  </View>
                  <View style={styles.detailRowWithBadge}>
                    <View style={[styles.dcrBadge, chemist.dcr ? styles.dcrBadgeCompleted : styles.dcrBadgeMissed]}>
                      <Ionicons 
                        name={chemist.dcr ? "checkmark-circle" : "close-circle"} 
                        size={14} 
                        color="white" 
                        style={styles.dcrBadgeIcon}
                      />
                      <Text style={styles.dcrBadgeText}>
                        {chemist.dcr ? 'Call Reported' : 'Call Missed'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notesLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  statisticsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statisticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  statisticItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statisticContent: {
    alignItems: 'center',
    marginTop: 8,
  },
  statisticValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    lineHeight: 28,
  },
  statisticLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  statisticDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#e5e7eb',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  personCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  personNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  checkDcrButton: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  checkDcrButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  personTitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  dcrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  dcrBadgeCompleted: {
    backgroundColor: '#10b981', // Green for completed/reported
  },
  dcrBadgeMissed: {
    backgroundColor: '#ef4444', // Red for missed
  },
  dcrBadgeIcon: {
    marginRight: 2,
  },
  dcrBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  personDetails: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailRowWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
});

