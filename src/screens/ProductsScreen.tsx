import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import CurvedHeader from '../components/CurvedHeader';
import CustomLoader from '../components/CustomLoader';
import { gqlFetch } from '../api/graphql';
import { GET_PRODUCTS_BY_COMPANY_QUERY } from '../graphql/query/products';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginManager } from '../utils/LoginManager';

interface Product {
  id: number;
  name: string;
  type: string;
  salt: string;
}

type ProductsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Products'>;

const PRODUCTS_CACHE_KEY = 'products_cache';
const PRODUCTS_PAGE_KEY = 'products_page';
const PRODUCTS_LAST_PAGE_KEY = 'products_last_page';

export default function ProductsScreen() {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async (pageNum: number = 1, useCache: boolean = true) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Try to load from cache first if it's the first page
      if (pageNum === 1 && useCache) {
        try {
          const cachedData = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
          const cachedPage = await AsyncStorage.getItem(PRODUCTS_PAGE_KEY);
          const cachedLastPage = await AsyncStorage.getItem(PRODUCTS_LAST_PAGE_KEY);
          
          if (cachedData && cachedPage && cachedLastPage) {
            const parsedProducts = JSON.parse(cachedData);
            setProducts(parsedProducts);
            setPage(parseInt(cachedPage, 10));
            setLastPage(parseInt(cachedLastPage, 10));
            setLoading(false);
            // Still fetch fresh data in background
          }
        } catch (error) {
          console.error('Error loading from cache:', error);
        }
      }

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const companyId = await LoginManager.getCompanyId();
      if (!companyId) {
        setLoading(false);
        setLoadingMore(false);
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
          limit: 10,
          companyId: parseInt(companyId, 10),
        },
        token
      );

      if (response.getProductsByCompany.success) {
        const newProducts = response.getProductsByCompany.data;
        
        if (pageNum === 1) {
          setProducts(newProducts);
          // Cache the first page data
          await AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(newProducts));
          await AsyncStorage.setItem(PRODUCTS_PAGE_KEY, '1');
          await AsyncStorage.setItem(PRODUCTS_LAST_PAGE_KEY, String(response.getProductsByCompany.lastPage));
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }
        
        setPage(pageNum);
        setLastPage(response.getProductsByCompany.lastPage);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts(1, true);
    }, [])
  );

  const handleLoadMore = () => {
    if (!loadingMore && page < lastPage) {
      loadProducts(page + 1, false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts(1, false).finally(() => {
      setRefreshing(false);
    });
  };

  const handleProductPress = (productId: number) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => handleProductPress(item.id)}
      >
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productType}>{item.type}</Text>
          {item.salt && <Text style={styles.productSalt}>{item.salt}</Text>}
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#0f766e" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0f766e" />
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#f0fdf4']}
      style={styles.container}
    >
      <CurvedHeader title="Products" />
      
      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <CustomLoader size={48} color="#0f766e" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#0f766e',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  productSalt: {
    fontSize: 12,
    color: '#9ca3af',
  },
  arrowContainer: {
    marginLeft: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

