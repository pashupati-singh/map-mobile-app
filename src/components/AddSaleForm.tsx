import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import CurvedHeader from './CurvedHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { gqlFetch } from '../api/graphql';
import { GET_PRODUCTS_BY_COMPANY_QUERY } from '../graphql/query/products';
import { SEARCH_DOCTOR_CHEMIST_QUERY } from '../graphql/query/searchDoctorChemist';
import { CREATE_SALE_MUTATION } from '../graphql/mutation/sale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginManager } from '../utils/LoginManager';
import { Alert } from 'react-native';

interface Product {
  id: number;
  name: string;
  type?: string;
  salt?: string;
}

interface SelectedProduct {
  id: number;
  name: string;
  quantity: string;
  mrp: string;
  total: number;
}

interface SearchDoctor {
  name: string;
  email: string;
  phone: string;
  doctorCompanyId: number;
}

interface SearchChemist {
  chemistCompanyId: number;
  name: string;
  email: string;
  phone: string;
}

export interface SaleData {
  date: Date;
  doctorChemistName: string;
  products: SelectedProduct[];
  totalPrice: number;
}

type AddSaleFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddSale'>;

export default function AddSaleForm() {
  const navigation = useNavigation<AddSaleFormNavigationProp>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [doctorChemistName, setDoctorChemistName] = useState('');
  const [selectedDoctorCompanyId, setSelectedDoctorCompanyId] = useState<number | null>(null);
  const [selectedChemistCompanyId, setSelectedChemistCompanyId] = useState<number | null>(null);
  const [doctorChemistSearchQuery, setDoctorChemistSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [doctors, setDoctors] = useState<SearchDoctor[]>([]);
  const [chemists, setChemists] = useState<SearchChemist[]>([]);
  const [loadingDoctorsChemists, setLoadingDoctorsChemists] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productLastPage, setProductLastPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter products based on search (client-side filtering)
  const filteredProducts = React.useMemo(() => {
    if (!productSearchQuery.trim()) {
      return products;
    }
    const query = productSearchQuery.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      (product.type && product.type.toLowerCase().includes(query)) ||
      (product.salt && product.salt.toLowerCase().includes(query))
    );
  }, [products, productSearchQuery]);

  // Calculate total for each product
  const getProductTotal = (product: SelectedProduct): number => {
    const qty = parseFloat(product.quantity) || 0;
    const mrp = parseFloat(product.mrp) || 0;
    return qty * mrp;
  };

  // Calculate grand total
  const grandTotal = selectedProducts.reduce((sum, product) => {
    return sum + getProductTotal(product);
  }, 0);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  // Load products with pagination
  const loadProducts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoadingProducts(true);
      } else {
        setLoadingMoreProducts(true);
      }

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoadingProducts(false);
        setLoadingMoreProducts(false);
        return;
      }

      const companyId = await LoginManager.getCompanyId();
      if (!companyId) {
        setLoadingProducts(false);
        setLoadingMoreProducts(false);
        return;
      }

      type ProductsResponse = {
        getProductsByCompany: {
          code: number;
          success: boolean;
          message: string;
          lastPage: number;
          data: Product[];
        };
      };

      const response = await gqlFetch<ProductsResponse>(
        GET_PRODUCTS_BY_COMPANY_QUERY,
        {
          page: pageNum,
          limit: 20,
          companyId: parseInt(companyId, 10),
        },
        token
      );

      if (response.getProductsByCompany.success) {
        const newProducts = response.getProductsByCompany.data;
        
        if (append) {
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }
        
        setProductPage(pageNum);
        setProductLastPage(response.getProductsByCompany.lastPage);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
      setLoadingMoreProducts(false);
    }
  }, []);

  // Load products when modal opens
  useEffect(() => {
    if (showProductDropdown && products.length === 0) {
      loadProducts(1, false);
    }
  }, [showProductDropdown, products.length, loadProducts]);

  const handleProductSelect = (product: Product) => {
    // Check if product is already selected
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
    if (!isAlreadySelected) {
      setSelectedProducts([
        ...selectedProducts,
        {
          id: product.id,
          name: product.name,
          quantity: '',
          mrp: '',
          total: 0,
        },
      ]);
    }
    setShowProductDropdown(false);
    setProductSearchQuery('');
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };


  const updateProductMRP = (productId: number, mrp: string) => {
    setSelectedProducts(
      selectedProducts.map(p => {
        if (p.id === productId) {
          const qty = parseFloat(p.quantity) || 0;
          const mrpValue = parseFloat(mrp) || 0;
          return { ...p, mrp, total: qty * mrpValue };
        }
        return p;
      })
    );
  };

  const updateProductQuantity = (productId: number, quantity: string) => {
    setSelectedProducts(
      selectedProducts.map(p => {
        if (p.id === productId) {
          const qty = parseFloat(quantity) || 0;
          const mrp = parseFloat(p.mrp) || 0;
          return { ...p, quantity, total: qty * mrp };
        }
        return p;
      })
    );
  };

  const handleLoadMoreProducts = () => {
    if (!loadingMoreProducts && productPage < productLastPage) {
      loadProducts(productPage + 1, true);
    }
  };

  // Search doctors and chemists with debouncing
  const searchDoctorsAndChemists = useCallback(async (searchText: string) => {
    if (!searchText.trim() || searchText.length < 2) {
      setDoctors([]);
      setChemists([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoadingDoctorsChemists(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoadingDoctorsChemists(false);
        return;
      }

      type SearchDoctorChemistResponse = {
        searchDoctorChemist: {
          doctors: SearchDoctor[];
          chemists: SearchChemist[];
        };
      };

      const response = await gqlFetch<SearchDoctorChemistResponse>(
        SEARCH_DOCTOR_CHEMIST_QUERY,
        { text: searchText },
        token
      );

      if (response.searchDoctorChemist) {
        setDoctors(response.searchDoctorChemist.doctors || []);
        setChemists(response.searchDoctorChemist.chemists || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching doctors/chemists:', error);
      setDoctors([]);
      setChemists([]);
    } finally {
      setLoadingDoctorsChemists(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    // Clear previous timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // If search query is empty, clear results
    if (!doctorChemistSearchQuery.trim()) {
      setDoctors([]);
      setChemists([]);
      setShowSuggestions(false);
      return;
    }

    // Set new timer for debounced search
    const timer = setTimeout(() => {
      searchDoctorsAndChemists(doctorChemistSearchQuery);
    }, 500); // 500ms debounce delay

    setSearchDebounceTimer(timer);

    // Cleanup
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [doctorChemistSearchQuery, searchDoctorsAndChemists]);

  const handleDoctorChemistSelect = (item: SearchDoctor | SearchChemist, type: 'doctor' | 'chemist') => {
    Keyboard.dismiss();
    if (type === 'doctor') {
      const doctor = item as SearchDoctor;
      setSelectedDoctorCompanyId(doctor.doctorCompanyId);
      setSelectedChemistCompanyId(null);
      setDoctorChemistName(doctor.name);
    } else {
      const chemist = item as SearchChemist;
      setSelectedChemistCompanyId(chemist.chemistCompanyId);
      setSelectedDoctorCompanyId(null);
      setDoctorChemistName(chemist.name);
    }
    setDoctorChemistSearchQuery('');
    setShowSuggestions(false);
    setDoctors([]);
    setChemists([]);
  };

  const handleSearchInputChange = (text: string) => {
    setDoctorChemistSearchQuery(text);
    if (text.trim().length >= 2) {
      // Show suggestions container when user starts typing
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setDoctors([]);
      setChemists([]);
    }
  };

  const handleSearchInputFocus = () => {
    if (doctorChemistSearchQuery.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleSearchInputBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSaveSale = async () => {
    // Validation
    if (!selectedDoctorCompanyId && !selectedChemistCompanyId) {
      Alert.alert('Validation Error', 'Please select a doctor or chemist.');
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one product.');
      return;
    }

    // Validate all products have quantity and mrp
    const invalidProducts = selectedProducts.filter(
      p => !p.quantity || !p.mrp || parseFloat(p.quantity) <= 0 || parseFloat(p.mrp) <= 0
    );

    if (invalidProducts.length > 0) {
      Alert.alert('Validation Error', 'Please ensure all products have valid quantity and MRP.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        setIsSubmitting(false);
        return;
      }

      // Format date as dd/mm/yyyy
      const orderDate = formatDate(selectedDate);

      // Prepare items array
      const items = selectedProducts.map(product => ({
        productId: product.id,
        qty: parseInt(product.quantity, 10),
        mrp: parseFloat(product.mrp),
        total: product.total,
      }));

      // Prepare mutation data
      const mutationData = {
        orderDate,
        items,
        doctorCompanyId: selectedDoctorCompanyId,
        chemistCompanyId: selectedChemistCompanyId,
      };

      type CreateSaleResponse = {
        createSale: {
          code: number;
          success: boolean;
          message: string;
        };
      };

      const response = await gqlFetch<CreateSaleResponse>(
        CREATE_SALE_MUTATION,
        { data: mutationData },
        token
      );

      if (response.createSale.success) {
        Alert.alert('Success', 'Sale created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and navigate back
              setSelectedDate(new Date());
              setDoctorChemistName('');
              setSelectedDoctorCompanyId(null);
              setSelectedChemistCompanyId(null);
              setSelectedProducts([]);
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.createSale.message || 'Failed to create sale.');
      }
    } catch (error: any) {
      console.error('Error creating sale:', error);
      Alert.alert('Error', error.message || 'Failed to create sale. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Reset form and navigate back
    setSelectedDate(new Date());
    setDoctorChemistName('');
    setSelectedProducts([]);
    navigation.goBack();
  };

  // Reset form when screen mounts
  useEffect(() => {
    setSelectedDate(new Date());
    setDoctorChemistName('');
    setSelectedProducts([]);
  }, []);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <CurvedHeader
          title="Add Sale"
          onBack={handleBack}
          showBackButton={true}
        />
        
        <View style={styles.content}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Doctor/Chemist Search Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Doctor / Chemist</Text>
              <View style={styles.searchInputWrapper}>
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search-outline" size={20} color="#6b7280" style={styles.searchInputIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search doctor or chemist..."
                    value={doctorChemistName ? doctorChemistName : doctorChemistSearchQuery}
                    onChangeText={handleSearchInputChange}
                    onFocus={() => {
                      if (doctorChemistName) {
                        // Clear selection when user starts typing
                        setDoctorChemistName('');
                        setSelectedDoctorCompanyId(null);
                        setSelectedChemistCompanyId(null);
                        setDoctorChemistSearchQuery('');
                      }
                      handleSearchInputFocus();
                    }}
                    onBlur={handleSearchInputBlur}
                    placeholderTextColor="#9ca3af"
                  />
                  {doctorChemistName && (
                    <TouchableOpacity
                      onPress={() => {
                        setDoctorChemistName('');
                        setSelectedDoctorCompanyId(null);
                        setSelectedChemistCompanyId(null);
                        setDoctorChemistSearchQuery('');
                        setShowSuggestions(false);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                  {loadingDoctorsChemists && (
                    <ActivityIndicator size="small" color="#0f766e" style={styles.searchLoader} />
                  )}
                </View>

                {/* Suggestions Dropdown */}
                {showSuggestions && (doctors.length > 0 || chemists.length > 0) && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView
                      style={styles.suggestionsList}
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled={true}
                    >
                      {/* Doctors Section */}
                      {doctors.length > 0 && (
                        <>
                          <View style={styles.suggestionSectionHeader}>
                            <Ionicons name="person" size={16} color="#0f766e" />
                            <Text style={styles.suggestionSectionTitle}>Doctors</Text>
                          </View>
                          {doctors.map((doctor) => (
                            <TouchableOpacity
                              key={doctor.doctorCompanyId}
                              style={styles.suggestionItem}
                              onPress={() => handleDoctorChemistSelect(doctor, 'doctor')}
                            >
                              <View style={styles.suggestionItemInfo}>
                                <Text style={styles.suggestionItemName}>{doctor.name}</Text>
                                {doctor.phone && (
                                  <Text style={styles.suggestionItemSubtext}>📞 {doctor.phone}</Text>
                                )}
                                {doctor.email && (
                                  <Text style={styles.suggestionItemSubtext}>✉️ {doctor.email}</Text>
                                )}
                              </View>
                            </TouchableOpacity>
                          ))}
                        </>
                      )}

                      {/* Chemists Section */}
                      {chemists.length > 0 && (
                        <>
                          <View style={styles.suggestionSectionHeader}>
                            <Ionicons name="medical" size={16} color="#8b5cf6" />
                            <Text style={styles.suggestionSectionTitle}>Chemists</Text>
                          </View>
                          {chemists.map((chemist) => (
                            <TouchableOpacity
                              key={chemist.chemistCompanyId}
                              style={styles.suggestionItem}
                              onPress={() => handleDoctorChemistSelect(chemist, 'chemist')}
                            >
                              <View style={styles.suggestionItemInfo}>
                                <Text style={styles.suggestionItemName}>{chemist.name}</Text>
                                {chemist.phone && (
                                  <Text style={styles.suggestionItemSubtext}>📞 {chemist.phone}</Text>
                                )}
                                {chemist.email && (
                                  <Text style={styles.suggestionItemSubtext}>✉️ {chemist.email}</Text>
                                )}
                              </View>
                            </TouchableOpacity>
                          ))}
                        </>
                      )}
                    </ScrollView>
                  </View>
                )}

                {/* No Results */}
                {showSuggestions && !loadingDoctorsChemists && doctors.length === 0 && chemists.length === 0 && doctorChemistSearchQuery.trim().length >= 2 && (
                  <View style={styles.suggestionsContainer}>
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>No results found</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Date Input Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Date</Text>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateInputText}>
                  {formatDate(selectedDate)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Product Selection Section */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={styles.sectionLabel}>Products</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowProductDropdown(true)}
                >
                  <Ionicons name="add-circle" size={20} color="#0f766e" />
                  <Text style={styles.addButtonText}>Add Product</Text>
                </TouchableOpacity>
              </View>

              {/* Selected Products List */}
              {selectedProducts.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <TouchableOpacity
                      onPress={() => removeProduct(product.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.productInputsRow}>
                    <View style={styles.productInputContainer}>
                      <Text style={styles.inputLabel}>Quantity</Text>
                      <TextInput
                        style={styles.productInput}
                        placeholder="Qty"
                        value={product.quantity}
                        onChangeText={(value) => updateProductQuantity(product.id, value)}
                        keyboardType="numeric"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                    
                    <View style={styles.productInputContainer}>
                      <Text style={styles.inputLabel}>MRP</Text>
                      <TextInput
                        style={styles.productInput}
                        placeholder="MRP"
                        value={product.mrp}
                        onChangeText={(value) => updateProductMRP(product.id, value)}
                        keyboardType="numeric"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                    
                    <View style={styles.productTotalContainer}>
                      <Text style={styles.inputLabel}>Total</Text>
                      <View style={styles.productTotalBox}>
                        <Text style={styles.productTotalText}>
                          ₹{product.total.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {selectedProducts.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="cube-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No products selected</Text>
                  <Text style={styles.emptyStateSubtext}>Tap "Add Product" to select products</Text>
                </View>
              )}
            </View>

            {/* Grand Total Section */}
            {selectedProducts.length > 0 && (
              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Price</Text>
                  <Text style={styles.totalAmount}>₹{grandTotal.toFixed(2)}</Text>
                </View>
              </View>
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
              onPress={handleSaveSale}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Product Dropdown Modal with Infinite Scroll */}
      <Modal
        visible={showProductDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowProductDropdown(false);
          setProductSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Product</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowProductDropdown(false);
                  setProductSearchQuery('');
                }}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                value={productSearchQuery}
                onChangeText={setProductSearchQuery}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {loadingProducts && products.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0f766e" />
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const isSelected = selectedProducts.some(p => p.id === item.id);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.modalItem,
                        isSelected && styles.modalItemSelected
                      ]}
                      onPress={() => handleProductSelect(item)}
                      disabled={isSelected}
                    >
                      <View style={styles.modalItemInfo}>
                        <Text style={[
                          styles.modalItemText,
                          isSelected && styles.modalItemTextSelected
                        ]}>
                          {item.name}
                        </Text>
                        {item.type && (
                          <Text style={styles.modalItemSubtext}>{item.type}</Text>
                        )}
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#0f766e" />
                      )}
                    </TouchableOpacity>
                  );
                }}
                onEndReached={handleLoadMoreProducts}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => {
                  if (loadingMoreProducts) {
                    return (
                      <View style={styles.footerLoader}>
                        <ActivityIndicator size="small" color="#0f766e" />
                      </View>
                    );
                  }
                  return null;
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  searchInputWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  searchLoader: {
    marginLeft: 8,
  },
  searchInputIcon: {
    marginRight: 8,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateInputText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  dropdownButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  dropdownButtonTextPlaceholder: {
    color: '#9ca3af',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
  },
  productCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  productInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  productInputContainer: {
    flex: 1,
  },
  productTotalContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  productInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  productTotalBox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0f766e',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  productTotalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  totalSection: {
    padding: 20,
    backgroundColor: '#f0fdfa',
    borderTopWidth: 2,
    borderTopColor: '#0f766e',
    marginTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  saveButton: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  typeSelectionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  suggestionSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionItemInfo: {
    flex: 1,
  },
  suggestionItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  suggestionItemSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalItemSelected: {
    backgroundColor: '#f0fdfa',
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  modalItemTextSelected: {
    color: '#0f766e',
    fontWeight: '600',
  },
  modalItemSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  typeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorBadge: {
    backgroundColor: '#dbeafe',
  },
  chemistBadge: {
    backgroundColor: '#fce7f3',
  },
  typeBadgeText: {
    fontSize: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
