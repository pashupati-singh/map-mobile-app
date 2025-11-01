export interface SearchSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  keywords: string[];
}

export const createSearchSuggestions = (
  onNavigateToDCR: () => void,
  onNavigateToDCRForm: () => void,
  onNavigateToDailyPlans: () => void,
  onNavigateToDailyPlansForm: () => void,
  onNavigateToReminderForm: () => void,
  onNavigateToExpenseOverview: () => void,
  onNavigateToDoctorList: () => void,
  onNavigateToChemistList: () => void,
  onNavigateToMasterList: () => void,
  onNavigateToProfile: () => void,
  onNavigateToCalendar: () => void,
): SearchSuggestion[] => {
  return [
    // DCR Related
    {
      id: 'dcr',
      title: 'DCR',
      description: 'Daily Call Report',
      icon: 'document-outline',
      action: onNavigateToDCR,
      keywords: ['dcr', 'call report', 'daily call report', 'daily report']
    },
    {
      id: 'new-call-report',
      title: 'New Call Report',
      description: 'Create a new call report',
      icon: 'add-circle-outline',
      action: onNavigateToDCRForm,
      keywords: ['new call report', 'create call report', 'add call report']
    },
    {
      id: 'call-report',
      title: 'Call Report',
      description: 'Report your calls',
      icon: 'call-outline',
      action: onNavigateToDCRForm,
      keywords: ['call report', 'report calls', 'meeting report']
    },

    // Daily Plans
    {
      id: 'daily-plans',
      title: 'Daily Plans',
      description: 'View your daily plans',
      icon: 'calendar-outline',
      action: onNavigateToDailyPlans,
      keywords: ['daily plans', 'plans', 'schedule', 'daily schedule']
    },
    {
      id: 'create-daily-plan',
      title: 'Create Daily Plan',
      description: 'Create a new daily plan',
      icon: 'add-circle-outline',
      action: onNavigateToDailyPlansForm,
      keywords: ['create daily plan', 'new daily plan', 'add daily plan']
    },
    {
      id: 'today-plan',
      title: "Today's Plan",
      description: "View today's activities",
      icon: 'today-outline',
      action: onNavigateToDailyPlans,
      keywords: ['today plan', 'today schedule', 'today activities']
    },

    // Reminders
    {
      id: 'set-reminder',
      title: 'Set Reminder',
      description: 'Create a new reminder',
      icon: 'alarm-outline',
      action: onNavigateToReminderForm,
      keywords: ['set reminder', 'create reminder', 'new reminder', 'add reminder']
    },
    {
      id: 'view-reminders',
      title: 'View Reminders',
      description: 'See all your reminders',
      icon: 'alarm-outline',
      action: () => {}, // Will scroll to reminders
      keywords: ['view reminders', 'see reminders', 'reminders list']
    },
    {
      id: 'today-reminders',
      title: "Today's Reminders",
      description: "View today's reminders",
      icon: 'today-outline',
      action: () => {}, // Will scroll to reminders
      keywords: ['today reminders', 'today alerts', 'current reminders']
    },

    // Expenses
    {
      id: 'expense',
      title: 'Expense',
      description: 'Track your expenses',
      icon: 'card-outline',
      action: onNavigateToExpenseOverview,
      keywords: ['expense', 'expenses', 'cost', 'spending', 'money']
    },
    {
      id: 'expense-overview',
      title: 'Expense Overview',
      description: 'View expense summary',
      icon: 'bar-chart-outline',
      action: onNavigateToExpenseOverview,
      keywords: ['expense overview', 'expense summary', 'expense report']
    },
    {
      id: 'add-expense',
      title: 'Add Expense',
      description: 'Record a new expense',
      icon: 'add-circle-outline',
      action: onNavigateToExpenseOverview,
      keywords: ['add expense', 'new expense', 'record expense']
    },

    // Master List
    {
      id: 'master-list',
      title: 'Master List',
      description: 'View doctors and chemists',
      icon: 'list-outline',
      action: onNavigateToMasterList,
      keywords: ['master list', 'directory', 'contacts', 'list']
    },
    {
      id: 'doctor-list',
      title: 'Doctor List',
      description: 'View list of doctors',
      icon: 'medical-outline',
      action: onNavigateToDoctorList,
      keywords: ['doctor list', 'doctors', 'physicians']
    },
    {
      id: 'chemist-list',
      title: 'Chemist List',
      description: 'View list of chemists',
      icon: 'business-outline',
      action: onNavigateToChemistList,
      keywords: ['chemist list', 'chemists', 'pharmacists', 'pharmacy']
    },

    // Profile & Settings
    {
      id: 'profile',
      title: 'Profile',
      description: 'View your profile',
      icon: 'person-outline',
      action: onNavigateToProfile,
      keywords: ['profile', 'account', 'personal info']
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'App settings',
      icon: 'settings-outline',
      action: onNavigateToProfile,
      keywords: ['settings', 'preferences', 'configuration']
    },

    // Quick Actions
    {
      id: 'emergency',
      title: 'Emergency',
      description: 'Emergency contacts',
      icon: 'medical-outline',
      action: () => {},
      keywords: ['emergency', 'urgent', 'help']
    },
    {
      id: 'hospital',
      title: 'Hospital',
      description: 'Find hospitals',
      icon: 'business-outline',
      action: () => {},
      keywords: ['hospital', 'medical center', 'healthcare']
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      description: 'Find pharmacies',
      icon: 'medical-outline',
      action: () => {},
      keywords: ['pharmacy', 'drugstore', 'medication']
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'View calendar and events',
      icon: 'calendar-outline',
      action: onNavigateToCalendar,
      keywords: ['calendar', 'events', 'schedule', 'dates']
    }
  ];
};
