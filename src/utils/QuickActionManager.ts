import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuickActionItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  category: 'dcr' | 'report';
  onPress: () => void;
}

const QUICK_ACTION_KEY = 'quickActionItems';

export class QuickActionManager {
  /**
   * Save selected quick action items
   */
  static async saveQuickActions(itemIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(QUICK_ACTION_KEY, JSON.stringify(itemIds));
    } catch (error) {
      console.error('Error saving quick actions:', error);
      throw error;
    }
  }

  /**
   * Get saved quick action item IDs
   */
  static async getQuickActions(): Promise<string[]> {
    try {
      const saved = await AsyncStorage.getItem(QUICK_ACTION_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch (error) {
      console.error('Error getting quick actions:', error);
      return [];
    }
  }

  /**
   * Clear quick action preferences
   */
  static async clearQuickActions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUICK_ACTION_KEY);
    } catch (error) {
      console.error('Error clearing quick actions:', error);
    }
  }
}

