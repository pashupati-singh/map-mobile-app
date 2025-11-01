import AsyncStorage from '@react-native-async-storage/async-storage';

export class LoginManager {
  private static readonly USER_ID_KEY = 'userId';
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly USER_NAME_KEY = 'userName';
  private static readonly COMPANY_NAME_KEY = 'companyName';
  private static readonly COMPANY_ID_KEY = 'companyId';

  static async checkExistingUser(): Promise<string | null> {
    try {
      const userId = await AsyncStorage.getItem(this.USER_ID_KEY);
      return userId;
    } catch (error) {
      console.error('Error checking existing user:', error);
      return null;
    }
  }

  static async storeUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_ID_KEY, userId);
    } catch (error) {
      console.error('Error storing user ID:', error);
      throw error;
    }
  }

  static async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.TOKEN_KEY,
        this.USER_NAME_KEY,
        this.COMPANY_NAME_KEY,
        this.COMPANY_ID_KEY,
        this.USER_ID_KEY
      ]);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }

  static async storeCompanyId(companyId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.COMPANY_ID_KEY, companyId);
    } catch (error) {
      console.error('Error storing company ID:', error);
      throw error;
    }
  }

  static async getCompanyId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.COMPANY_ID_KEY);
    } catch (error) {
      console.error('Error getting company ID:', error);
      return null;
    }
  }

  static async getStoredUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.USER_ID_KEY);
    } catch (error) {
      console.error('Error getting stored user ID:', error);
      return null;
    }
  }
}
