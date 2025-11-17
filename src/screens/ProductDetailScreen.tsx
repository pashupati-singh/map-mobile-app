import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import CurvedHeader from '../components/CurvedHeader';
import CustomLoader from '../components/CustomLoader';
import { gqlFetch } from '../api/graphql';
import { GET_PRODUCT_BY_ID_QUERY } from '../graphql/query/products';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

interface ProductDetails {
  [key: string]: any; // Dynamic keys and values
}

interface Product {
  name: string;
  type: string;
  salt: string;
  details: ProductDetails;
}

const PRODUCTS_CACHE_KEY = 'products_cache';

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailScreenRouteProp>();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      type ProductResponse = {
        getProductById: {
          code: number;
          success: boolean;
          message: string;
          product: Product;
        };
      };

      const response = await gqlFetch<ProductResponse>(
        GET_PRODUCT_BY_ID_QUERY,
        {
          productId: productId,
        },
        token
      );

      if (response.getProductById.success) {
        setProduct(response.getProductById.product);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProductDetails();
      
      // Clear cache when navigating back from this screen
      return () => {
        AsyncStorage.removeItem(PRODUCTS_CACHE_KEY).catch((error) => {
          console.error('Error clearing products cache:', error);
        });
        AsyncStorage.removeItem(PRODUCTS_PAGE_KEY).catch((error) => {
          console.error('Error clearing products page cache:', error);
        });
        AsyncStorage.removeItem(PRODUCTS_LAST_PAGE_KEY).catch((error) => {
          console.error('Error clearing products last page cache:', error);
        });
      };
    }, [productId])
  );

  const renderDetailItem = (key: string, value: any) => {
    // Handle different value types
    let displayValue = value;
    if (typeof value === 'object' && value !== null) {
      displayValue = JSON.stringify(value, null, 2);
    } else if (value === null || value === undefined) {
      displayValue = 'N/A';
    } else {
      displayValue = String(value);
    }

    return (
      <View key={key} style={styles.detailRow}>
        <Text style={styles.detailLabel}>{key}:</Text>
        <Text style={styles.detailValue}>{displayValue}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
        style={styles.container}
      >
        <CurvedHeader title="Product Details" />
        <View style={styles.loadingContainer}>
          <CustomLoader size={48} color="#0f766e" />
        </View>
      </LinearGradient>
    );
  }

  if (!product) {
    return (
      <LinearGradient
        colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
        style={styles.container}
      >
        <CurvedHeader title="Product Details" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
      style={styles.container}
    >
      <CurvedHeader title="Product Details" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.headerSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.type}</Text>
            </View>
          </View>

          {product.salt && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Salt</Text>
              <Text style={styles.sectionValue}>{product.salt}</Text>
            </View>
          )}

          {product.details && Object.keys(product.details).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.detailsContainer}>
                {Object.entries(product.details).map(([key, value]) =>
                  renderDetailItem(key, value)
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const PRODUCTS_PAGE_KEY = 'products_page';
const PRODUCTS_LAST_PAGE_KEY = 'products_last_page';

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  badge: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  sectionValue: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  detailsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 120,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    flexWrap: 'wrap',
  },
});

