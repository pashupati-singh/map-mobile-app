import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  DOCTORS: '@dailyPlans:doctors',
  CHEMISTS: '@dailyPlans:chemists',
  WORKING_AREAS: '@dailyPlans:workingAreas',
  SELECTED_WORKING_AREA: '@dailyPlans:selectedWorkingArea',
};

interface CacheData<T> {
  data: T;
  timestamp: number;
}

// Cache expiration time: 5 minutes
const CACHE_EXPIRY = 5 * 60 * 1000;

export class DailyPlansCache {
  /**
   * Get cached doctors data
   */
  static async getDoctors<T>(): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.DOCTORS);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - cacheData.timestamp > CACHE_EXPIRY) {
        await this.clearDoctors();
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Error getting cached doctors:', error);
      return null;
    }
  }

  /**
   * Set cached doctors data
   */
  static async setDoctors<T>(data: T): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEYS.DOCTORS, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cached doctors:', error);
    }
  }

  /**
   * Get cached chemists data
   */
  static async getChemists<T>(): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.CHEMISTS);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - cacheData.timestamp > CACHE_EXPIRY) {
        await this.clearChemists();
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Error getting cached chemists:', error);
      return null;
    }
  }

  /**
   * Set cached chemists data
   */
  static async setChemists<T>(data: T): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEYS.CHEMISTS, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cached chemists:', error);
    }
  }

  /**
   * Clear doctors cache
   */
  static async clearDoctors(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.DOCTORS);
    } catch (error) {
      console.error('Error clearing doctors cache:', error);
    }
  }

  /**
   * Clear chemists cache
   */
  static async clearChemists(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.CHEMISTS);
    } catch (error) {
      console.error('Error clearing chemists cache:', error);
    }
  }

  /**
   * Get cached working areas data
   */
  static async getWorkingAreas<T>(): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.WORKING_AREAS);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - cacheData.timestamp > CACHE_EXPIRY) {
        await this.clearWorkingAreas();
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Error getting cached working areas:', error);
      return null;
    }
  }

  /**
   * Set cached working areas data
   */
  static async setWorkingAreas<T>(data: T): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEYS.WORKING_AREAS, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cached working areas:', error);
    }
  }

  /**
   * Get selected working area
   */
  static async getSelectedWorkingArea(): Promise<{ id: number; state: string; city: string; district: string; workingArea: string } | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.SELECTED_WORKING_AREA);
      if (!cached) return null;
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error getting selected working area:', error);
      return null;
    }
  }

  /**
   * Set selected working area
   */
  static async setSelectedWorkingArea(workingArea: { id: number; state: string; city: string; district: string; workingArea: string }): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.SELECTED_WORKING_AREA, JSON.stringify(workingArea));
    } catch (error) {
      console.error('Error setting selected working area:', error);
    }
  }

  /**
   * Clear working areas cache
   */
  static async clearWorkingAreas(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.WORKING_AREAS);
    } catch (error) {
      console.error('Error clearing working areas cache:', error);
    }
  }

  /**
   * Clear selected working area
   */
  static async clearSelectedWorkingArea(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.SELECTED_WORKING_AREA);
    } catch (error) {
      console.error('Error clearing selected working area:', error);
    }
  }

  /**
   * Clear all daily plans cache
   */
  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.clearDoctors(),
        this.clearChemists(),
        this.clearWorkingAreas(),
        this.clearSelectedWorkingArea(),
      ]);
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }
}

