import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  id: string;
  name: string;
  role: string;
  email: string;
  company: string;
  profileImage?: string;
  isEmailVerified: boolean;
  hasMPIN: boolean;
  monthlyTarget?: number;
  monthlySale?: number;
  remainingDays?: number;
}

export class UserDataManager {
  private static readonly USER_DATA_KEY = 'userData';

  static async storeUserData(userData: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  static async getUserData(): Promise<UserData | null> {
    try {
      const userDataString = await AsyncStorage.getItem(this.USER_DATA_KEY);
      if (userDataString) {
        return JSON.parse(userDataString);
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async updateUserData(updates: Partial<UserData>): Promise<void> {
    try {
      const currentData = await this.getUserData();
      if (currentData) {
        const updatedData = { ...currentData, ...updates };
        await this.storeUserData(updatedData);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  static async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.USER_DATA_KEY);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }

  static async createDefaultUserData(userId: string, email: string): Promise<UserData> {
    const defaultUserData: UserData = {
      id: userId,
      name: 'Dr. John Doe',
      role: 'MR',
      email: email,
      company: 'my-app Healthcare',
      isEmailVerified: false,
      hasMPIN: false,
      monthlyTarget: 150,
      monthlySale: 120,
      remainingDays: 15,
    };
    
    await this.storeUserData(defaultUserData);
    return defaultUserData;
  }
}
