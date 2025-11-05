import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import SimpleSearchComponent from '../components/SimpleSearchComponent';
import Loader from '../components/Loader';
import { gqlFetch } from '../api/graphql';
import { CHEMISTS_QUERY } from '../graphql/query/chemists';
import { DOCTORS_QUERY } from '../graphql/query/doctors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  phone: string;
  profileImage: string;
}

interface Chemist {
  id: string;
  name: string;
  title: string;
  shopName: string;
  phone: string;
  profileImage: string;
}

type DoctorChemistListScreenRouteProp = RouteProp<RootStackParamList, 'DoctorChemistList'>;
type DoctorChemistListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorChemistList'>;

export default function DoctorChemistListScreen() {
  const route = useRoute<DoctorChemistListScreenRouteProp>();
  const navigation = useNavigation<DoctorChemistListScreenNavigationProp>();
  const listType = route.params?.listType || 'both';
  const [activeTab, setActiveTab] = useState<'doctors' | 'chemists'>('doctors');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [doctorsData, setDoctorsData] = useState<Doctor[]>([]);
  const [chemistsData, setChemistsData] = useState<Chemist[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine if we should show tabs and view all button
  const showTabs = listType === 'both';
  const showViewAll = listType === 'both';

  useEffect(() => {
    loadData();
  }, [listType]);

  // Helper function to get dummy profile image
  const getDummyProfileImage = (name: string, type: 'doctor' | 'chemist'): string => {
    const images = type === 'doctor' 
      ? [
          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
        ]
      : [
          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
        ];
    
    // Use name hash to consistently assign image
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return images[Math.abs(hash) % images.length];
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Load doctors if needed
      if (listType === 'doctors' || listType === 'both') {
        type DoctorsResponse = {
          doctors: {
            code: number;
            success: boolean;
            message: string;
            lastPage: number;
            doctors: Array<{
              id: number;
              email: string;
              phone: string;
              doctor: {
                name: string;
                titles: string[];
              };
            }>;
          };
        };

        const doctorsResponse = await gqlFetch<DoctorsResponse>(
          DOCTORS_QUERY,
          { page: 1, limit: 20 },
          token
        );

        if (doctorsResponse.doctors.success && doctorsResponse.doctors.doctors) {
          const transformedDoctors: Doctor[] = doctorsResponse.doctors.doctors.map((doc) => ({
            id: String(doc.id),
            name: `Dr. ${doc.doctor.name}`,
            title: doc.doctor.titles?.join(', ') || '',
            specialty: '',
            phone: doc.phone || '',
            profileImage: getDummyProfileImage(doc.doctor.name, 'doctor'),
          }));
          setDoctorsData(transformedDoctors);
        }
      }

      // Load chemists if needed
      if (listType === 'chemists' || listType === 'both') {
        type ChemistsResponse = {
          chemists: {
            code: number;
            success: boolean;
            message: string;
            lastPage: number;
            chemists: Array<{
              id: number;
              email: string;
              phone: string;
              chemist: {
                name: string;
              };
            }>;
          };
        };

        const chemistsResponse = await gqlFetch<ChemistsResponse>(
          CHEMISTS_QUERY,
          { page: 1, limit: 20 },
          token
        );

        if (chemistsResponse.chemists.success && chemistsResponse.chemists.chemists) {
          const transformedChemists: Chemist[] = chemistsResponse.chemists.chemists.map((chem) => ({
            id: String(chem.id),
            name: chem.chemist.name,
            title: '',
            shopName: '',
            phone: chem.phone || '',
            profileImage: getDummyProfileImage(chem.chemist.name, 'chemist'),
          }));
          setChemistsData(transformedChemists);
        }
      }
    } catch (error) {
      console.error('Error loading doctors/chemists:', error);
      // Set empty arrays on error
      if (listType === 'doctors' || listType === 'both') {
        setDoctorsData([]);
      }
      if (listType === 'chemists' || listType === 'both') {
        setChemistsData([]);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleViewAll = () => {
    // Navigate to view all doctors or chemists
    console.log(`View all ${activeTab}`);
  };

  const renderDoctorItem = ({ item }: { item: Doctor }) => {
    const profileImageUri = item.profileImage || getDummyProfileImage(item.name, 'doctor');
    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => navigation.navigate('DoctorProfile', { doctorId: item.id })}
      >
        <View style={styles.listItemLeft}>
          <Image 
            source={{ uri: profileImageUri }} 
            style={styles.profileImage}
            onError={() => {
              // Error handling - image will show broken icon
            }}
          />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.title && <Text style={styles.itemTitle}>{item.title}</Text>}
            {item.phone && <Text style={styles.itemSpecialty}>{item.phone}</Text>}
          </View>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#0f766e" style={styles.arrowIcon} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderChemistItem = ({ item }: { item: Chemist }) => {
    const profileImageUri = item.profileImage || getDummyProfileImage(item.name, 'chemist');
    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => navigation.navigate('ChemistProfile', { chemistId: item.id })}
      >
        <View style={styles.listItemLeft}>
          <Image 
            source={{ uri: profileImageUri }} 
            style={styles.profileImage}
            onError={() => {
              // Error handling - image will show broken icon
            }}
          />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.phone && <Text style={styles.itemSpecialty}>{item.phone}</Text>}
          </View>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#0f766e" style={styles.arrowIcon} />
        </View>
      </TouchableOpacity>
    );
  };

  // Determine which data to show based on listType
  const getCurrentData = () => {
    if (listType === 'doctors') return doctorsData;
    if (listType === 'chemists') return chemistsData;
    return activeTab === 'doctors' ? doctorsData : chemistsData;
  };

  const currentData = getCurrentData();
  const searchItems = currentData.map(item => ({
    id: item.id,
    name: item.name,
    title: item.title,
    specialty: 'specialty' in item ? item.specialty : item.shopName,
    shopName: 'shopName' in item ? item.shopName : undefined,
    phone: item.phone,
    profileImage: item.profileImage,
  }));

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f766e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {listType === 'doctors' ? 'Doctors' : listType === 'chemists' ? 'Chemists' : 'Medical Professionals'}
        </Text>
        <TouchableOpacity onPress={() => setSearchVisible(true)} style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#0f766e" />
        </TouchableOpacity>
      </View>

      {showTabs && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'doctors' && styles.activeTab]}
            onPress={() => setActiveTab('doctors')}
          >
            <Text style={[styles.tabText, activeTab === 'doctors' && styles.activeTabText]}>
              Doctors ({doctorsData.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chemists' && styles.activeTab]}
            onPress={() => setActiveTab('chemists')}
          >
            <Text style={[styles.tabText, activeTab === 'chemists' && styles.activeTabText]}>
              Chemists ({chemistsData.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showViewAll && (
        <View style={styles.viewAllContainer}>
          <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
            <Text style={styles.viewAllText}>
              View All {activeTab === 'doctors' ? 'Doctors' : 'Chemists'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#0f766e" />
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <Loader />
        </View>
      ) : listType === 'doctors' ? (
        <FlatList
          data={doctorsData}
          renderItem={renderDoctorItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : listType === 'chemists' ? (
        <FlatList
          data={chemistsData}
          renderItem={renderChemistItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : activeTab === 'doctors' ? (
        <FlatList
          data={doctorsData}
          renderItem={renderDoctorItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={chemistsData}
          renderItem={renderChemistItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      <SimpleSearchComponent
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        title={listType === 'doctors' ? 'Search Doctors' : listType === 'chemists' ? 'Search Chemists' : (activeTab === 'doctors' ? 'Search Doctors' : 'Search Chemists')}
        items={searchItems}
        onItemSelect={(id) => {
          if (listType === 'doctors' || (listType === 'both' && activeTab === 'doctors')) {
            navigation.navigate('DoctorProfile', { doctorId: id });
          } else {
            navigation.navigate('ChemistProfile', { chemistId: id });
          }
        }}
        searchPlaceholder={`Search ${listType === 'doctors' ? 'doctors' : listType === 'chemists' ? 'chemists' : activeTab}...`}
      />
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
  searchButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0f766e',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  viewAllContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
    marginRight: 8,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 0,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  itemSpecialty: {
    fontSize: 12,
    color: '#9ca3af',
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrowIcon: {
    shadowColor: '#0f766e',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
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
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
