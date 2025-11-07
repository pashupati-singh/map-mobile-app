import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  DailyPlansForm: undefined;
  DoctorChemistList: { listType?: 'doctors' | 'chemists' | 'both' };
  DoctorProfile: { doctorId: string };
  ChemistProfile: { chemistId: string };
  DCRForm: { planData: any } | undefined;
  ExpenseOverview: undefined;
  ExpenseFlow: { 
    viewMode: 'daily' | 'weekly' | 'monthly' | 'q1' | 'q2' | 'q3' | 'q4' | '6months' | 'yearly';
    currentDate: Date;
  };
  Calendar: undefined;
  Notifications: undefined;
  SetReminder: { onSubmit?: (data: any) => void } | undefined;
  DCR: undefined;
  Reports: undefined;
  MasterList: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

