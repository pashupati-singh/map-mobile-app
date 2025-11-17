import React, { useState } from 'react';
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
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { UserDataManager } from '../utils/UserDataManager';

const { width } = Dimensions.get('window');

interface UserProfileSidebarProps {
  visible: boolean;
  onClose: () => void;
  userData: {
    id: string;
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
  onProfileImageUpdate?: (imageUri: string) => void;
  onUpdateProfile?: () => void;
  onContactUs?: () => void;
}

export default function UserProfileSidebar({
  visible,
  onClose,
  userData,
  onLogout,
  onChangePassword,
  onVerifyEmail,
  onSetNewMPIN,
  onProfileImageUpdate,
  onUpdateProfile,
  onContactUs,
}: UserProfileSidebarProps) {
  const slideAnim = React.useRef(new Animated.Value(-width)).current;
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(userData.profileImage || null);
  const slideUpAnim = React.useRef(new Animated.Value(300)).current;

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

  React.useEffect(() => {
    if (showImagePicker) {
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideUpAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showImagePicker]);

  React.useEffect(() => {
    setSelectedImage(userData.profileImage || null);
  }, [userData.profileImage]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and photo library permissions are required to change your profile picture.'
        );
        return false;
      }
    }
    return true;
  };

  const handleImagePicker = async (source: 'camera' | 'gallery') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setShowImagePicker(false);

    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        
        // Update user data
        try {
          await UserDataManager.updateUserData({ profileImage: imageUri });
          onProfileImageUpdate?.(imageUri);
        } catch (error) {
          console.error('Error updating profile image:', error);
          Alert.alert('Error', 'Failed to update profile image. Please try again.');
          // Reset image if update failed
          setSelectedImage(userData.profileImage || null);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const menuItems = [
    {
      id: 'update-profile',
      title: 'Update Profile',
      icon: 'person-outline',
      onPress: () => {
        onUpdateProfile?.();
        onClose();
      },
    },
    {
      id: 'set-mpin',
      title: 'Set MPIN',
      icon: 'lock-closed-outline',
      onPress: () => {
        onSetNewMPIN();
        onClose();
      },
    },
    {
      id: 'change-password',
      title: 'Change Password',
      icon: 'key-outline',
      onPress: () => {
        onChangePassword();
        onClose();
      },
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      icon: 'mail-outline',
      onPress: () => {
        onContactUs?.();
        onClose();
      },
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
              <View style={styles.placeholder} />
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.defaultProfileImage}>
                    <Ionicons name="person" size={40} color="#0f766e" />
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.editProfileButton}
                  onPress={() => setShowImagePicker(true)}
                >
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

          <View style={styles.contentContainer}>
            <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
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

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerContent}>
                <Text style={styles.footerText}>my-app</Text>
                <Text style={styles.footerSubtext}>© 2024 All rights reserved</Text>
                <Text style={styles.footerVersion}>Version 1.0.0</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Image Picker Bottom Sheet */}
        <Modal
          visible={showImagePicker}
          transparent
          animationType="none"
          onRequestClose={() => setShowImagePicker(false)}
        >
          <View style={styles.bottomSheetOverlay}>
            <TouchableOpacity
              style={styles.bottomSheetBackdrop}
              activeOpacity={1}
              onPress={() => setShowImagePicker(false)}
            />
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY: slideUpAnim }],
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.bottomSheetHandle} />
              <Text style={styles.bottomSheetTitle}>Select Profile Picture</Text>
              
              <TouchableOpacity
                style={styles.bottomSheetOption}
                onPress={() => handleImagePicker('camera')}
                activeOpacity={0.7}
              >
                <View style={styles.bottomSheetOptionIcon}>
                  <Ionicons name="camera-outline" size={24} color="#0f766e" />
                </View>
                <Text style={styles.bottomSheetOptionText}>Take Photo</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomSheetOption}
                onPress={() => handleImagePicker('gallery')}
                activeOpacity={0.7}
              >
                <View style={styles.bottomSheetOptionIcon}>
                  <Ionicons name="images-outline" size={24} color="#0f766e" />
                </View>
                <Text style={styles.bottomSheetOptionText}>Choose from Gallery</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomSheetCancel}
                onPress={() => setShowImagePicker(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.bottomSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholder: {
    flex: 1,
  },
  closeButton: {
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
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
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
  footer: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  footerContent: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 11,
    color: '#9ca3af',
  },
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '50%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  bottomSheetOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bottomSheetOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  bottomSheetCancel: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  bottomSheetCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
