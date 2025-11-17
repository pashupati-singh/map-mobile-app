export interface SearchSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  keywords: string[];
}

export const createSearchSuggestions = (
  onNavigateToPlanHistory: () => void,
  onNavigateToAverageCall: () => void,
  onNavigateToVisitingHistory: () => void,
  onNavigateToProducts: () => void,
  onNavigateToUpcomingEvents: () => void,
  onNavigateToOldReminders: () => void,
  onNavigateToSales: () => void,
  onNavigateToDailyPlans: () => void,
  onNavigateToCallReports: () => void,
  onNavigateToReminder: () => void,
  onNavigateToVisitingPlan: () => void,
  onNavigateToDoctorList: () => void,
  onNavigateToChemistList: () => void,
  onNavigateToUpdateProfile: () => void,
  onNavigateToSetMPIN: () => void,
  onNavigateToChangePassword: () => void,
  onNavigateToContactUs: () => void,
): SearchSuggestion[] => {
  return [
    // Reports
    {
      id: 'plan-history',
      title: 'Plan History',
      description: 'View your plan history',
      icon: 'time-outline',
      action: onNavigateToPlanHistory,
      keywords: ['plan history', 'history', 'plans', 'past plans']
    },
    {
      id: 'average-call',
      title: 'Average Call',
      description: 'View average call statistics',
      icon: 'stats-chart-outline',
      action: onNavigateToAverageCall,
      keywords: ['average call', 'call stats', 'statistics', 'average']
    },
    {
      id: 'visiting-history',
      title: 'Visiting History',
      description: 'View your visiting history',
      icon: 'location-outline',
      action: onNavigateToVisitingHistory,
      keywords: ['visiting history', 'visit history', 'visits', 'locations']
    },
    {
      id: 'products',
      title: 'Products',
      description: 'View products',
      icon: 'cube-outline',
      action: onNavigateToProducts,
      keywords: ['products', 'product list', 'items']
    },
    {
      id: 'upcoming-events',
      title: 'Upcoming Events',
      description: 'View upcoming events',
      icon: 'calendar-outline',
      action: onNavigateToUpcomingEvents,
      keywords: ['upcoming events', 'events', 'upcoming', 'calendar events']
    },
    {
      id: 'old-reminders',
      title: 'Old Reminders',
      description: 'View old reminders',
      icon: 'archive-outline',
      action: onNavigateToOldReminders,
      keywords: ['old reminders', 'past reminders', 'archived reminders']
    },
    {
      id: 'sales',
      title: 'Sales',
      description: 'View sales information',
      icon: 'trending-up-outline',
      action: onNavigateToSales,
      keywords: ['sales', 'revenue', 'income', 'sales report']
    },

    // Daily Plans
    {
      id: 'daily-plans',
      title: 'Daily Plans',
      description: 'Create and manage daily plans',
      icon: 'calendar-outline',
      action: onNavigateToDailyPlans,
      keywords: ['daily plans', 'plans', 'schedule', 'daily schedule', 'create plan']
    },

    // Call Reports
    {
      id: 'call-reports',
      title: 'Call Reports',
      description: 'View and create call reports',
      icon: 'call-outline',
      action: onNavigateToCallReports,
      keywords: ['call reports', 'dcr', 'call report', 'reports']
    },

    // Reminder
    {
      id: 'reminder',
      title: 'Reminder',
      description: 'Set and manage reminders',
      icon: 'alarm-outline',
      action: onNavigateToReminder,
      keywords: ['reminder', 'reminders', 'set reminder', 'alarm']
    },

    // Visiting Plan
    {
      id: 'visiting-plan',
      title: 'Visiting Plan',
      description: 'Plan your visits',
      icon: 'location-outline',
      action: onNavigateToVisitingPlan,
      keywords: ['visiting plan', 'visit plan', 'plan visit']
    },

    // Doctor & Chemist Lists
    {
      id: 'doctor-list',
      title: 'Doctor List',
      description: 'View all doctors',
      icon: 'medical-outline',
      action: onNavigateToDoctorList,
      keywords: ['doctor list', 'doctors', 'view all doctors', 'physicians']
    },
    {
      id: 'chemist-list',
      title: 'Chemist List',
      description: 'View all chemists',
      icon: 'business-outline',
      action: onNavigateToChemistList,
      keywords: ['chemist list', 'chemists', 'view all chemists', 'pharmacists', 'pharmacy']
    },

    // Profile Settings
    {
      id: 'update-profile',
      title: 'Update Profile',
      description: 'Update your profile information',
      icon: 'person-outline',
      action: onNavigateToUpdateProfile,
      keywords: ['update profile', 'profile', 'edit profile', 'profile settings']
    },
    {
      id: 'set-mpin',
      title: 'Set MPIN',
      description: 'Set or change your MPIN',
      icon: 'lock-closed-outline',
      action: onNavigateToSetMPIN,
      keywords: ['set mpin', 'mpin', 'pin', 'security pin']
    },
    {
      id: 'change-password',
      title: 'Change Password',
      description: 'Change your password',
      icon: 'key-outline',
      action: onNavigateToChangePassword,
      keywords: ['change password', 'password', 'update password', 'reset password']
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      description: 'Get in touch with support',
      icon: 'mail-outline',
      action: onNavigateToContactUs,
      keywords: ['contact us', 'support', 'help', 'contact', 'customer service']
    }
  ];
};
