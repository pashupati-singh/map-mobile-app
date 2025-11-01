import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface UserProfileSidebarProps {
  visible: boolean;
  onClose: () => void;
  userData: {
    name: string;
    role: string;
    email: string;
    company: string;
    profileImage?: string;
    monthlyTarget?: number;
    monthlySale?: number;
    remainingDays?: number;
  };
  onLogout: () => void;
  onChangePassword: () => void;
  onVerifyEmail: () => void;
  onSetNewMPIN: () => void;
}

export default function UserProfileSidebar({
  visible,
  onClose,
  userData,
  onLogout,
  onChangePassword,
  onVerifyEmail,
  onSetNewMPIN,
}: UserProfileSidebarProps) {
  const slideAnim = React.useRef(new Animated.Value(-width)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const menuItems = [
    {
      id: 'my-saved',
      title: 'My Saved',
      icon: 'heart-outline',
      onPress: () => {},
    },
    {
      id: 'appointment',
      title: 'Appointment',
      icon: 'document-outline',
      onPress: () => {},
    },
    {
      id: 'payment-method',
      title: 'Payment Method',
      icon: 'wallet-outline',
      onPress: () => {},
    },
    {
      id: 'faqs',
      title: 'FAQs',
      icon: 'chatbubble-outline',
      onPress: () => {},
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: 'log-out-outline',
      onPress: onLogout,
      isDestructive: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#f0fdfa', '#ecfdf5', '#f8fafc']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                {userData.profileImage ? (
                  <Image
                    source={{ uri: userData.profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.defaultProfileImage}>
                    <Ionicons name="person" size={40} color="#0f766e" />
                  </View>
                )}
                <TouchableOpacity style={styles.editProfileButton}>
                  <Ionicons name="pencil" size={12} color="white" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
              <Text style={styles.userCompany}>{userData.company}</Text>
            </View>

            {/* Monthly Metrics */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Ionicons name="heart" size={20} color="white" />
                <Text style={styles.metricValue}>{userData.monthlyTarget || 0}</Text>
                <Text style={styles.metricLabel}>Monthly Target</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricCard}>
                <Ionicons name="flame" size={20} color="white" />
                <Text style={styles.metricValue}>{userData.monthlySale || 0}</Text>
                <Text style={styles.metricLabel}>Monthly Sale</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricCard}>
                <Ionicons name="time" size={20} color="white" />
                <Text style={styles.metricValue}>{userData.remainingDays || 0}</Text>
                <Text style={styles.metricLabel}>Remaining Days</Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  item.isDestructive && styles.destructiveMenuItem,
                ]}
                onPress={item.onPress}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={item.isDestructive ? '#ef4444' : '#374151'}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    item.isDestructive && styles.destructiveText,
                  ]}
                >
                  {item.title}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={item.isDestructive ? '#ef4444' : '#9ca3af'}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  backdrop: {
    flex: 1,
  },
  sidebar: {
    width: width * 0.8,
    height: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  defaultProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userCompany: {
    fontSize: 14,
    color: '#6b7280',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
    marginTop: 4,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(15, 118, 110, 0.2)',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  destructiveMenuItem: {
    borderBottomColor: '#fee2e2',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
  },
  destructiveText: {
    color: '#ef4444',
  },
});
