import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@homePage:data';

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export class HomePageCache {
  /**
   * Get cached home page data
   */
  static async getHomePageData<T>(): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      return cacheData.data;
    } catch (error) {
      console.error('Error getting cached home page data:', error);
      return null;
    }
  }

  /**
   * Set cached home page data
   */
  static async setHomePageData<T>(data: T): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cached home page data:', error);
    }
  }

  /**
   * Clear cached home page data
   */
  static async clearHomePageData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cached home page data:', error);
    }
  }
}

