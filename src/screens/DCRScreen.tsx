import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { gqlFetch } from '../api/graphql';
import { HOME_PAGE_QUERY } from '../graphql/query/home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomLoader from '../components/CustomLoader';
import CurvedHeader from '../components/CurvedHeader';
import { DCRCache } from '../utils/DCRCache';

type DCRScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DCR'>;

interface DailyPlanCard {
  id: string;
  type: 'doctor' | 'chemist';
  title: string;
  description: string;
  time: string;
  date: string;
  status: string;
  statusText: string;
  priority: string;
  email: string;
  phone: string;
  dcr: boolean;
  doctorCompanyId?: number;
  chemistId?: number;
  dailyPlanId?: number;
  dailyPlanDoctorId?: number;
  dailyPlanChemistId?: number;
  abmId?: number;
  workTogether?: boolean;
}

export default function DCRScreen() {
  const navigation = useNavigation<DCRScreenNavigationProp>();
  const [dailyPlans, setDailyPlans] = useState<DailyPlanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDailyPlans = async (isRefreshing: boolean = false, useCache: boolean = true) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Check cache first
      if (useCache && !isRefreshing) {
        const cachedPlans = await DCRCache.getDailyPlans<DailyPlanCard[]>();
        if (cachedPlans) {
          setDailyPlans(cachedPlans);
          if (isRefreshing) {
            setRefreshing(false);
          } else {
            setLoading(false);
          }
          return;
        }
      }

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        if (isRefreshing) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
        return;
      }

      type HomePageResponse = {
        homePage: {
          data: {
            dailyplans: Array<{
              id: number;
              isApproved: boolean;
              workTogether: boolean;
              isWorkTogetherConfirmed: boolean;
              isRejected: boolean;
              planDate: string;
              notes: string;
              abmId?: number;
              doctors: Array<{
                id: number;
                doctorCompanyId: number;
                dcr: boolean;
                DoctorCompany: { email: string; phone: string };
              }>;
              chemists: Array<{
                id: number;
                dcr: boolean;
                ChemistCompany: { email: string; phone: string; dob?: string; anniversary?: string };
              }>;
            }>;
          };
          success: boolean;
          code: number;
        };
      };

      const response = await gqlFetch<HomePageResponse>(HOME_PAGE_QUERY, {}, token);
      
      if (response.homePage.success && response.homePage.data) {
        const { dailyplans } = response.homePage.data;
        const transformedPlans: DailyPlanCard[] = [];
        let cardIndex = 0;

        dailyplans.forEach((plan) => {
          const planDate = new Date(Number(plan.planDate));
          const dailyPlanId = plan.id;

          // Create cards for doctors
          plan.doctors.forEach((doctor) => {
            const doctorName = doctor.DoctorCompany.email.split('@')[0];
            transformedPlans.push({
              id: `plan-doctor-${cardIndex}`,
              type: 'doctor',
              title: `Dr. ${doctorName}`,
              description: plan.notes || '',
              time: planDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              date: planDate.toLocaleDateString(),
              status: 'pending',
              statusText: 'Pending',
              priority: plan.workTogether ? 'high' : 'medium',
              email: doctor.DoctorCompany.email,
              phone: doctor.DoctorCompany.phone,
              doctorCompanyId: doctor.doctorCompanyId,
              dcr: doctor.dcr,
              dailyPlanId: dailyPlanId,
              dailyPlanDoctorId: doctor.id,
              dailyPlanChemistId: undefined,
              abmId: plan.abmId,
              workTogether: plan.workTogether,
            });
            cardIndex++;
          });

          // Create cards for chemists
          plan.chemists.forEach((chemist) => {
            const chemistName = chemist.ChemistCompany.email.split('@')[0];
            transformedPlans.push({
              id: `plan-chemist-${cardIndex}`,
              type: 'chemist',
              title: chemistName,
              description: plan.notes || '',
              time: planDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              date: planDate.toLocaleDateString(),
              status: 'pending',
              statusText: 'Pending',
              priority: plan.workTogether ? 'high' : 'medium',
              email: chemist.ChemistCompany.email,
              phone: chemist.ChemistCompany.phone,
              chemistId: chemist.id,
              dcr: chemist.dcr,
              dailyPlanId: dailyPlanId,
              dailyPlanDoctorId: undefined,
              dailyPlanChemistId: chemist.id,
              abmId: plan.abmId,
              workTogether: plan.workTogether,
            });
            cardIndex++;
          });
        });
        
        setDailyPlans(transformedPlans);
        // Cache the data
        await DCRCache.setDailyPlans(transformedPlans);
      }
    } catch (error) {
      console.error('Error loading daily plans:', error);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDailyPlans();
    }, [])
  );

  const onRefresh = () => {
    loadDailyPlans(true, false); // Don't use cache on refresh
  };

  const handleCardPress = (plan: DailyPlanCard) => {
    navigation.navigate('DCRForm', { planData: plan });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <CurvedHeader title="Call Reports" />

      {loading ? (
        <View style={styles.loaderContainer}>
          <CustomLoader size={48} color="#0f766e" />
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0f766e']}
              tintColor="#0f766e"
            />
          }
        >
          {dailyPlans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No daily plans found</Text>
            </View>
          ) : (
            dailyPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.card,
                  plan.dcr ? styles.cardCompleted : styles.cardPending
                ]}
                onPress={() => handleCardPress(plan)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleContainer}>
                      <Ionicons 
                        name={plan.type === 'doctor' ? 'person' : 'medical'} 
                        size={20} 
                        color={plan.dcr ? '#10b981' : '#f59e0b'} 
                        style={styles.cardIcon}
                      />
                      <Text style={styles.cardTitle}>{plan.title}</Text>
                    </View>
                    {plan.dcr && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Complete</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.cardInfo}>
                    <View style={styles.infoRow}>
                      <Ionicons name="time-outline" size={16} color="#6b7280" />
                      <Text style={styles.infoText}>{plan.time}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                      <Text style={styles.infoText}>{plan.date}</Text>
                    </View>
                  </View>

                  {plan.description && (
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {plan.description}
                    </Text>
                  )}
                </View>
                
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
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
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
    elevation: 3,
  },
  cardPending: {
    backgroundColor: '#fef3c7', // Light yellow/amber for pending
  },
  cardCompleted: {
    backgroundColor: '#d1fae5', // Light green for completed
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  badge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  cardInfo: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});
