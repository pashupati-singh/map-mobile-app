import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface DailyPlan {
  id: string;
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'pending' | 'in-progress';
  statusText?: string;
  priority: 'high' | 'medium' | 'low';
  type?: 'doctor' | 'chemist';
  email?: string;
  phone?: string;
}

interface DailyPlansProps {
  plans: DailyPlan[];
  onCreatePlan: () => void;
}

export default function DailyPlans({ plans, onCreatePlan }: DailyPlansProps) {
  const hasPlans = plans.length > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#f59e0b';
      case 'pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in-progress':
        return 'time';
      case 'pending':
        return 'ellipse-outline';
      default:
        return 'ellipse-outline';
    }
  };

  if (!hasPlans) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>Daily Plans</Text>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>No Plans</Text>
          </View>
        </View>

        <LinearGradient
          colors={['#f8fafc', '#f1f5f9']}
          style={styles.emptyCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.emptyContent}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient
                colors={['#e2e8f0', '#cbd5e1']}
                style={styles.emptyIconBackground}
              >
                <Ionicons name="calendar-outline" size={32} color="#64748b" />
              </LinearGradient>
            </View>
            
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyTitle}>No Daily Plan Created</Text>
              <Text style={styles.emptyDescription}>
                You haven't created your daily plan for today. Plan your day to stay organized and productive.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.createPlanButton}
              onPress={onCreatePlan}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0f766e', '#14b8a6']}
                style={styles.createPlanGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.createPlanText}>Create Daily Plan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Todays Pending Calls</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.plansScrollContainer}
        style={styles.plansScrollView}
      >
        {plans.map((plan, index) => (
          <View key={plan.id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.planTitleContainer}>
                <Text style={styles.planTitle}>{plan.title}</Text>
              </View>
              
              <View style={styles.planStatusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(plan.status) }]}>
                  <Ionicons 
                    name={getStatusIcon(plan.status) as any} 
                    size={12} 
                    color="white" 
                  />
                  <Text style={styles.statusBadgeText}>{plan.statusText || plan.status}</Text>
                </View>
                
              </View>
            </View>

            <Text style={styles.planDescription}>{plan.description}</Text>
            {(plan.email || plan.phone) && (
              <View style={styles.contactInfo}>
                {plan.email && (
                  <View style={styles.contactRow}>
                    <Ionicons name="mail-outline" size={14} color="#6b7280" />
                    <Text style={styles.contactText}>{plan.email}</Text>
                  </View>
                )}
                {plan.phone && (
                  <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={14} color="#6b7280" />
                    <Text style={styles.contactText}>{plan.phone}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6b7280',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTextContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  createPlanButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0f766e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createPlanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  createPlanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  plansScrollView: {
    marginHorizontal: -4,
    marginBottom: 8,
  },
  plansScrollContainer: {
    gap: 12,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    width: 320,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  planTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planTime: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  planStatusContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  planDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  planFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  contactInfo: {
    marginTop: 4,
    gap: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 11,
    color: '#6b7280',
  },
});
