import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  DailyPlansForm: undefined;
  DoctorChemistList: { listType?: 'doctors' | 'chemists' | 'both' };
  DoctorProfile: { doctorId: string };
  ChemistProfile: { chemistId: string };
  DCRForm: { planData: any } | undefined;
  ExpenseOverview: undefined;
  Calendar: undefined;
  Notifications: undefined;
  SetReminder: { onSubmit?: (data: any) => void } | undefined;
  DCR: undefined;
  Reports: undefined;
  ReportsMore: undefined;
  QuickActionEditor: undefined;
  MasterList: undefined;
  PlanHistory: undefined;
  OldReminders: undefined;
  UpcomingEvents: undefined;
  PlanDetail: { planId: number };
  Products: undefined;
  ProductDetail: { productId: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

