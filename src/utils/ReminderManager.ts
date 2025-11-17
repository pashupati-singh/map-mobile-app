import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserReminder {
  id: string;
  date: Date;
  heading: string;
  message: string;
  createdAt: Date;
  isCompleted: boolean;
}

export interface DoctorReminder {
  id: string;
  name: string;
  phoneNumber: string;
  titles: string[];
  eventType: 'birthday' | 'anniversary' | 'both';
  eventDate: string;
  profileImage?: string;
}

const REMINDERS_STORAGE_KEY = 'user_reminders';

export class ReminderManager {
  static async saveReminder(reminder: Omit<UserReminder, 'id' | 'createdAt' | 'isCompleted'>): Promise<UserReminder> {
    try {
      const newReminder: UserReminder = {
        ...reminder,
        id: Date.now().toString(),
        createdAt: new Date(),
        isCompleted: false,
      };

      const existingReminders = await this.getReminders();
      const updatedReminders = [...existingReminders, newReminder];
      
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));
      return newReminder;
    } catch (error) {
      console.error('Error saving reminder:', error);
      throw error;
    }
  }

  static async getReminders(): Promise<UserReminder[]> {
    try {
      const remindersJson = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (!remindersJson) return [];
      
      const reminders = JSON.parse(remindersJson);
      // Convert date strings back to Date objects
      return reminders.map((reminder: any) => ({
        ...reminder,
        date: new Date(reminder.date),
        createdAt: new Date(reminder.createdAt),
      }));
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  static async getTodaysReminders(): Promise<UserReminder[]> {
    try {
      const allReminders = await this.getReminders();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return allReminders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        reminderDate.setHours(0, 0, 0, 0);
        return reminderDate.getTime() === today.getTime() && !reminder.isCompleted;
      });
    } catch (error) {
      console.error('Error getting today\'s reminders:', error);
      return [];
    }
  }

  static async markReminderCompleted(reminderId: string): Promise<void> {
    try {
      const reminders = await this.getReminders();
      const updatedReminders = reminders.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, isCompleted: true }
          : reminder
      );
      
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('Error marking reminder as completed:', error);
      throw error;
    }
  }

  static async deleteReminder(reminderId: string): Promise<void> {
    try {
      const reminders = await this.getReminders();
      const updatedReminders = reminders.filter(reminder => reminder.id !== reminderId);
      
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  static async getUpcomingReminders(days: number = 7): Promise<UserReminder[]> {
    try {
      const allReminders = await this.getReminders();
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);
      
      return allReminders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate >= today && reminderDate <= futureDate && !reminder.isCompleted;
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return [];
    }
  }

  static async clearAllReminders(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REMINDERS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing all reminders:', error);
      throw error;
    }
  }
}
