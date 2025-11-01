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
import { CHEMIST_QUERY } from '../graphql/query/chemist';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Address {
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  landmark: string;
  latitude: number;
  longitude: number;
}

interface Doctor {
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
  type: string;
  name: string;
  salt: string;
  details: string;
}

interface ChemistProfileData {
  chemist: {
    address: Address;
    name: string;
    titles: string[];
    status: string;
  };
  email: string;
  phone: string;
  dob: string;
  anniversary: string;
  approxTarget: number;
  doctorChemist: {
    doctorCompany: {
      doctor: Doctor;
    };
  }[];
  ChemistProduct: {
    product: Product;
  }[];
}

interface ChemistProfileScreenProps {
  chemistId: string;
  onBack: () => void;
}

export default function ChemistProfileScreen({ chemistId, onBack }: ChemistProfileScreenProps) {
  const [chemistProfileData, setChemistProfileData] = useState<ChemistProfileData | null>(null);
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
    loadChemistData();
  }, [chemistId]);

  const loadChemistData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Use chemistId directly (should be numeric string)
      const numericId = parseInt(chemistId) || 1;

      type ChemistResponse = {
        chemist: {
          code: number;
          success: boolean;
          message: string;
          data: {
            email: string;
            phone: string;
            dob: string;
            anniversary: string;
            approxTarget: number;
            chemist: {
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
            doctorChemist: Array<{
              doctorCompany: {
                email: string;
                phone: string;
                approxTarget: number;
                doctor: {
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
              };
            }>;
          };
        };
      };

      const response = await gqlFetch<ChemistResponse>(
        CHEMIST_QUERY,
        { chemistId: numericId },
        token
      );

      if (response.chemist.success && response.chemist.data) {
        const data = response.chemist.data;
        const transformedData: ChemistProfileData = {
          chemist: {
            name: data.chemist.name,
            titles: data.chemist.titles || [],
            status: data.chemist.status || 'Active',
            address: {
              address: data.chemist.address.address || '',
              city: data.chemist.address.city || '',
              state: data.chemist.address.state || '',
              pinCode: data.chemist.address.pinCode || '',
              country: data.chemist.address.country || '',
              landmark: data.chemist.address.landmark || '',
              latitude: 0,
              longitude: 0,
            },
          },
          email: data.email || '',
          phone: data.phone || '',
          dob: data.dob || '',
          anniversary: data.anniversary || '',
          approxTarget: data.approxTarget || 0,
          doctorChemist: data.doctorChemist.map((dc) => ({
            doctorCompany: {
              doctor: {
                name: dc.doctorCompany.doctor.name,
                titles: dc.doctorCompany.doctor.titles || [],
                status: dc.doctorCompany.doctor.status || 'Active',
                address: {
                  address: dc.doctorCompany.doctor.address.address || '',
                  city: dc.doctorCompany.doctor.address.city || '',
                  state: dc.doctorCompany.doctor.address.state || '',
                  pinCode: '',
                  country: 'India',
                  landmark: dc.doctorCompany.doctor.address.landmark || '',
                  latitude: 0,
                  longitude: 0,
                },
                email: dc.doctorCompany.email || '',
                phone: dc.doctorCompany.phone || '',
                dob: '',
                anniversary: '',
                approxTarget: dc.doctorCompany.approxTarget || 0,
              },
            },
          })),
          ChemistProduct: [], // Products not included in the query response
        };
        setChemistProfileData(transformedData);
      }
    } catch (error) {
      console.error('Error loading chemist data:', error);
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
          <Text style={styles.headerTitle}>Chemist Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!chemistProfileData) {
    return (
      <LinearGradient
        colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0f766e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chemist Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No data available</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderDoctorItem = ({ item }: { item: { doctorCompany: { doctor: Doctor } } }) => (
    <View style={styles.doctorItem}>
      <View style={styles.doctorHeader}>
        <Text style={styles.doctorName}>{item.doctorCompany.doctor.name}</Text>
        <Text style={styles.doctorStatus}>{item.doctorCompany.doctor.status}</Text>
      </View>
      <Text style={styles.doctorTitles}>{item.doctorCompany.doctor.titles.join(', ')}</Text>
      <Text style={styles.doctorAddress}>{item.doctorCompany.doctor.address.address}, {item.doctorCompany.doctor.address.city}</Text>
      <Text style={styles.doctorContact}>📞 {item.doctorCompany.doctor.phone} | ✉️ {item.doctorCompany.doctor.email}</Text>
      <Text style={styles.doctorTarget}>Target: ₹{item.doctorCompany.doctor.approxTarget.toLocaleString()}</Text>
    </View>
  );

  const renderProductItem = ({ item }: { item: { product: Product } }) => (
    <View style={styles.productItem}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <Text style={styles.productType}>{item.product.type}</Text>
      </View>
      <Text style={styles.productSalt}>Salt: {item.product.salt}</Text>
      <Text style={styles.productDetails}>{item.product.details}</Text>
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
        <Text style={styles.headerTitle}>Chemist Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Chemist Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: getDummyProfileImage(chemistProfileData.chemist.name) }} 
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.chemistName}>{chemistProfileData.chemist.name}</Text>
              <Text style={styles.chemistTitles}>{chemistProfileData.chemist.titles.join(', ')}</Text>
              <Text style={styles.chemistStatus}>Status: {chemistProfileData.chemist.status}</Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={16} color="#0f766e" />
              <Text style={styles.contactText}>{chemistProfileData.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={16} color="#0f766e" />
              <Text style={styles.contactText}>{chemistProfileData.phone}</Text>
            </View>
            {chemistProfileData.dob && (
              <View style={styles.contactItem}>
                <Ionicons name="calendar-outline" size={16} color="#0f766e" />
                <Text style={styles.contactText}>DOB: {chemistProfileData.dob}</Text>
              </View>
            )}
            {chemistProfileData.anniversary && (
              <View style={styles.contactItem}>
                <Ionicons name="gift-outline" size={16} color="#0f766e" />
                <Text style={styles.contactText}>Anniversary: {chemistProfileData.anniversary}</Text>
              </View>
            )}
            <View style={styles.contactItem}>
              <Ionicons name="trending-up-outline" size={16} color="#0f766e" />
              <Text style={styles.contactText}>Target: ₹{chemistProfileData.approxTarget.toLocaleString()}</Text>
            </View>
          </View>

          {/* Address Information */}
          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.addressItem}>
              <Ionicons name="location-outline" size={16} color="#0f766e" />
              <Text style={styles.addressText}>{chemistProfileData.chemist.address.address}</Text>
            </View>
            <View style={styles.addressItem}>
              <Ionicons name="business-outline" size={16} color="#0f766e" />
              <Text style={styles.addressText}>{chemistProfileData.chemist.address.city}, {chemistProfileData.chemist.address.state} - {chemistProfileData.chemist.address.pinCode}</Text>
            </View>
            <View style={styles.addressItem}>
              <Ionicons name="flag-outline" size={16} color="#0f766e" />
              <Text style={styles.addressText}>{chemistProfileData.chemist.address.country}</Text>
            </View>
            <View style={styles.addressItem}>
              <Ionicons name="navigate-outline" size={16} color="#0f766e" />
              <Text style={styles.addressText}>Landmark: {chemistProfileData.chemist.address.landmark}</Text>
            </View>
          </View>
        </View>

        {/* Associated Doctors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Associated Doctors ({chemistProfileData.doctorChemist.length})</Text>
          <FlatList
            data={chemistProfileData.doctorChemist}
            renderItem={renderDoctorItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            style={styles.list}
          />
        </View>

        {/* Products */}
        {chemistProfileData.ChemistProduct && chemistProfileData.ChemistProduct.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Products ({chemistProfileData.ChemistProduct.length})</Text>
            <FlatList
              data={chemistProfileData.ChemistProduct}
              renderItem={renderProductItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              style={styles.list}
            />
          </View>
        )}
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
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#0f766e',
  },
  profileInfo: {
    flex: 1,
  },
  chemistName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  chemistTitles: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  chemistStatus: {
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
  doctorItem: {
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
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  doctorStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  doctorTitles: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  doctorAddress: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  doctorContact: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  doctorTarget: {
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
