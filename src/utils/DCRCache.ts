import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@dcr:dailyPlans';

interface CacheData<T> {
  data: T;
  timestamp: number;
}

// Cache expiration time: 10 minutes
const CACHE_EXPIRY = 10 * 60 * 1000;

export class DCRCache {
  /**
   * Get cached daily plans data
   */
  static async getDailyPlans<T>(): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - cacheData.timestamp > CACHE_EXPIRY) {
        await this.clearAll();
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Error getting cached daily plans:', error);
      return null;
    }
  }

  /**
   * Set cached daily plans data
   */
  static async setDailyPlans<T>(data: T): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cached daily plans:', error);
    }
  }

  /**
   * Remove a specific daily plan from cache by its unique identifier
   * @param planId - The unique identifier for the plan (e.g., "plan-doctor-0" or "plan-chemist-1")
   */
  static async removePlan(planId: string): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return;

      const cacheData: CacheData<any[]> = JSON.parse(cached);
      if (!Array.isArray(cacheData.data)) return;

      // Filter out the plan with matching id
      const updatedData = cacheData.data.filter((plan: any) => plan.id !== planId);
      
      // Update cache with filtered data
      const updatedCache: CacheData<any[]> = {
        data: updatedData,
        timestamp: cacheData.timestamp, // Keep original timestamp
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updatedCache));
    } catch (error) {
      console.error('Error removing plan from cache:', error);
    }
  }

  /**
   * Clear all DCR cache
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error clearing DCR cache:', error);
    }
  }
}

