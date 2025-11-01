import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gqlFetch } from '../api/graphql';
import { DOCTOR_QUERY } from '../graphql/query/doctor';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Address {
  city: string;
  state: string;
  address: string;
  pinCode: string;
  country: string;
  landmark: string;
  latitude: number;
  longitude: number;
}

interface Doctor {
  id: string;
  name: string;
  titles: string[];
  status: string;
  image: string;
  address: Address;
}

interface Chemist {
  id: string;
  name: string;
  titles: string[];
  status: string;
  address: Address;
  email: string;
  phone: string;
  dob: string;
  anniversary: string;
  approxTarget: number;
}

interface Product {
  name: string;
  type: string;
  salt: string;
  details: string;
  assignedAt: string;
}

interface DoctorProfileData {
  id: string;
  doctor: Doctor;
  doctorChemist: Chemist[];
  email: string;
  phone: string;
  dob: string;
  anniversary: string;
  approxTarget: number;
  doctorProduct: Product[];
}

interface DoctorProfileScreenProps {
  doctorId: string;
  onBack: () => void;
}

export default function DoctorProfileScreen({ doctorId, onBack }: DoctorProfileScreenProps) {
  const [doctorProfileData, setDoctorProfileData] = useState<DoctorProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get dummy profile image
  const getDummyProfileImage = (name: string): string => {
    const images = [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1594824388852-7b4b1b5b5b5b?w=200&h=200&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return images[Math.abs(hash) % images.length];
  };

  useEffect(() => {
    loadDoctorData();
  }, [doctorId]);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Use doctorId directly (should be numeric string)
      const numericId = parseInt(doctorId) || 1;

      type DoctorResponse = {
        doctor: {
          code: number;
          success: boolean;
          message: string;
          data: {
            doctor: {
              name: string;
              titles: string[];
              status: string;
              address: {
                address: string;
                city: string;
                state: string;
                pinCode: string;
                country: string;
                landmark: string;
              };
            };
            email: string;
            phone: string;
            dob: string;
            anniversary: string;
            approxTarget: number;
            doctorChemist: Array<{
              chemistCompany: {
                chemist: {
                  name: string;
                  titles: string[];
                  status: string;
                  address: {
                    address: string;
                    city: string;
                    state: string;
                    landmark: string;
                  };
                };
                email: string;
                phone: string;
                approxTarget: number;
              };
            }>;
            DoctorProduct: Array<{
              product: {
                name: string;
                type: string;
                salt: string;
              };
              assignedAt: string;
            }>;
          };
        };
      };

      const response = await gqlFetch<DoctorResponse>(
        DOCTOR_QUERY,
        { doctorId: numericId },
        token
      );

      if (response.doctor.success && response.doctor.data) {
        const data = response.doctor.data;
        const transformedData: DoctorProfileData = {
          id: doctorId,
          doctor: {
            id: doctorId,
            name: data.doctor.name,
            titles: data.doctor.titles || [],
            status: data.doctor.status || 'Active',
            image: getDummyProfileImage(data.doctor.name),
            address: {
              city: data.doctor.address.city || '',
              state: data.doctor.address.state || '',
              address: data.doctor.address.address || '',
              pinCode: data.doctor.address.pinCode || '',
              country: data.doctor.address.country || '',
              landmark: data.doctor.address.landmark || '',
              latitude: 0,
              longitude: 0,
            },
          },
          email: data.email || '',
          phone: data.phone || '',
          dob: data.dob || '',
          anniversary: data.anniversary || '',
          approxTarget: data.approxTarget || 0,
          doctorChemist: data.doctorChemist.map((chem, index) => ({
            id: `chemist-${index}`,
            name: chem.chemistCompany.chemist.name,
            titles: chem.chemistCompany.chemist.titles || [],
            status: chem.chemistCompany.chemist.status || 'Active',
            address: {
              city: chem.chemistCompany.chemist.address.city || '',
              state: chem.chemistCompany.chemist.address.state || '',
              address: chem.chemistCompany.chemist.address.address || '',
              pinCode: '',
              country: 'India',
              landmark: chem.chemistCompany.chemist.address.landmark || '',
              latitude: 0,
              longitude: 0,
            },
            email: chem.chemistCompany.email || '',
            phone: chem.chemistCompany.phone || '',
            dob: '',
            anniversary: '',
            approxTarget: chem.chemistCompany.approxTarget || 0,
          })),
          doctorProduct: data.DoctorProduct.map((prod) => ({
            name: prod.product.name,
            type: prod.product.type,
            salt: prod.product.salt,
            details: '',
            assignedAt: prod.assignedAt,
          })),
        };
        setDoctorProfileData(transformedData);
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0f766e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doctor Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!doctorProfileData) {
    return (
      <LinearGradient
        colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0f766e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doctor Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No data available</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderChemistItem = ({ item }: { item: Chemist }) => (
    <View style={styles.chemistItem}>
      <View style={styles.chemistHeader}>
        <Text style={styles.chemistName}>{item.name}</Text>
        <Text style={styles.chemistStatus}>{item.status}</Text>
      </View>
      <Text style={styles.chemistTitles}>{item.titles.join(', ')}</Text>
      <Text style={styles.chemistAddress}>{item.address.address}, {item.address.city}</Text>
      <Text style={styles.chemistContact}>📞 {item.phone} | ✉️ {item.email}</Text>
      <Text style={styles.chemistTarget}>Target: ₹{item.approxTarget.toLocaleString()}</Text>
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productType}>{item.type}</Text>
      </View>
      <Text style={styles.productSalt}>Salt: {item.salt}</Text>
      <Text style={styles.productDetails}>{item.details}</Text>
      <Text style={styles.productAssigned}>Assigned: {new Date(item.assignedAt).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f766e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: doctorProfileData.doctor.image || getDummyProfileImage(doctorProfileData.doctor.name) }} 
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.doctorName}>{doctorProfileData.doctor.name}</Text>
              <Text style={styles.doctorTitles}>{doctorProfileData.doctor.titles.join(', ')}</Text>
              <Text style={styles.doctorStatus}>Status: {doctorProfileData.doctor.status}</Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={16} color="#0f766e" />
              <Text style={styles.contactText}>{doctorProfileData.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={16} color="#0f766e" />
              <Text style={styles.contactText}>{doctorProfileData.phone}</Text>
            </View>
            {doctorProfileData.dob && (
              <View style={styles.contactItem}>
                <Ionicons name="calendar-outline" size={16} color="#0f766e" />
                <Text style={styles.contactText}>DOB: {doctorProfileData.dob}</Text>
              </View>
            )}
            {doctorProfileData.anniversary && (
              <View style={styles.contactItem}>
                <Ionicons name="gift-outline" size={16} color="#0f766e" />
                <Text style={styles.contactText}>Anniversary: {doctorProfileData.anniversary}</Text>
              </View>
            )}
            <View style={styles.contactItem}>
              <Ionicons name="trending-up-outline" size={16} color="#0f766e" />
              <Text style={styles.contactText}>Target: ₹{doctorProfileData.approxTarget.toLocaleString()}</Text>
            </View>
          </View>

          {/* Address Information */}
          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.addressItem}>
              <Ionicons name="location-outline" size={16} color="#0f766e" />
              <Text style={styles.addressText}>{doctorProfileData.doctor.address.address}</Text>
            </View>
            <View style={styles.addressItem}>
              <Ionicons name="business-outline" size={16} color="#0f766e" />
              <Text style={styles.addressText}>{doctorProfileData.doctor.address.city}, {doctorProfileData.doctor.address.state} - {doctorProfileData.doctor.address.pinCode}</Text>
            </View>
            <View style={styles.addressItem}>
              <Ionicons name="flag-outline" size={16} color="#0f766e" />
              <Text style={styles.addressText}>{doctorProfileData.doctor.address.country}</Text>
            </View>
            <View style={styles.addressItem}>
              <Ionicons name="navigate-outline" size={16} color="#0f766e" />
              <Text style={styles.addressText}>Landmark: {doctorProfileData.doctor.address.landmark}</Text>
            </View>
          </View>
        </View>

        {/* Associated Chemists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Associated Chemists ({doctorProfileData.doctorChemist.length})</Text>
          <FlatList
            data={doctorProfileData.doctorChemist}
            renderItem={renderChemistItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.list}
          />
        </View>

        {/* Assigned Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Products ({doctorProfileData.doctorProduct.length})</Text>
          <FlatList
            data={doctorProfileData.doctorProduct}
            renderItem={renderProductItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            style={styles.list}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  doctorTitles: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  doctorStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  contactSection: {
    marginBottom: 20,
  },
  addressSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  list: {
    marginTop: 12,
  },
  chemistItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chemistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chemistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  chemistStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  chemistTitles: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  chemistAddress: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  chemistContact: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  chemistTarget: {
    fontSize: 12,
    color: '#0f766e',
    fontWeight: '600',
  },
  productItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  productType: {
    fontSize: 12,
    color: '#0f766e',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productSalt: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  productAssigned: {
    fontSize: 12,
    color: '#0f766e',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});
