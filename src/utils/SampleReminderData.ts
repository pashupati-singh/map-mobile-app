import { ReminderManager, UserReminder } from './ReminderManager';

export const sampleReminders = [
  {
    date: new Date(),
    heading: "Follow up with Dr. Sarah Johnson",
    message: "Call Dr. Sarah Johnson to discuss the new cardiology treatment protocol. She mentioned wanting to review the latest research on statin therapy for high-risk patients. Prepare the presentation materials and patient case studies.",
  },
  {
    date: new Date(),
    heading: "Pharmacy visit - Kumar Medical Store",
    message: "Visit Kumar Medical Store to check on the new medication stock. Discuss the availability of the new diabetes management drugs and provide product information to the pharmacist. Also, collect feedback on the recent product launch.",
  },
  {
    date: new Date(),
    heading: "Team meeting preparation",
    message: "Prepare for the weekly team meeting. Review the sales targets, prepare the performance report, and gather feedback from the field team. Don't forget to bring the updated product catalog and pricing sheets.",
  },
  {
    date: new Date(),
    heading: "Patient consultation follow-up",
    message: "Follow up with the patients who were prescribed the new hypertension medication. Check their progress, side effects, and overall satisfaction. Document any concerns or positive feedback for the medical team.",
  },
  {
    date: new Date(),
    heading: "Product training session",
    message: "Conduct training session for the new medical representatives on the latest product line. Cover the clinical benefits, dosage guidelines, and patient selection criteria. Prepare interactive materials and case studies.",
  },
  {
    date: new Date(),
    heading: "Market research data collection",
    message: "Visit 5 different clinics to collect market research data on prescription patterns. Focus on cardiology and diabetes medications. Prepare questionnaires and ensure all necessary permissions are obtained.",
  },
  {
    date: new Date(),
    heading: "Inventory check - Central Hospital",
    message: "Check the medication inventory at Central Hospital. Verify stock levels, expiry dates, and storage conditions. Report any discrepancies and ensure proper rotation of stock according to FIFO principles.",
  },
  {
    date: new Date(),
    heading: "Doctor's birthday reminder",
    message: "Dr. Michael Chen's birthday is today! Send birthday wishes and consider bringing a small gift. He's been a valuable partner and has helped increase our product adoption in his clinic significantly.",
  },
  {
    date: new Date(),
    heading: "Regulatory compliance review",
    message: "Review the latest regulatory guidelines for pharmaceutical sales. Ensure all promotional materials comply with the new regulations. Update the product information sheets and training materials accordingly.",
  },
  {
    date: new Date(),
    heading: "Customer feedback collection",
    message: "Collect feedback from 10 key customers about our service quality and product effectiveness. Prepare a structured questionnaire covering product satisfaction, delivery times, and support quality. Schedule follow-up calls for detailed discussions.",
  }
];

export const createSampleReminders = async (): Promise<UserReminder[]> => {
  const createdReminders: UserReminder[] = [];
  
  try {
    // Clear existing reminders first (optional)
    // await ReminderManager.clearAllReminders();
    
    for (const reminderData of sampleReminders) {
      const reminder = await ReminderManager.saveReminder(reminderData);
      createdReminders.push(reminder);
    }
    
    console.log(`Created ${createdReminders.length} sample reminders`);
    return createdReminders;
  } catch (error) {
    console.error('Error creating sample reminders:', error);
    return [];
  }
};

export const createTodaysReminders = async (): Promise<UserReminder[]> => {
  const todaysReminders = sampleReminders.slice(0, 4); // Take first 4 for today
  const createdReminders: UserReminder[] = [];
  
  try {
    for (const reminderData of todaysReminders) {
      const reminder = await ReminderManager.saveReminder(reminderData);
      createdReminders.push(reminder);
    }
    
    console.log(`Created ${createdReminders.length} today's reminders`);
    return createdReminders;
  } catch (error) {
    console.error('Error creating today\'s reminders:', error);
    return [];
  }
};

export const createUpcomingReminders = async (): Promise<UserReminder[]> => {
  const upcomingReminders = sampleReminders.slice(4, 8); // Take next 4 for upcoming
  const createdReminders: UserReminder[] = [];
  
  try {
    for (const reminderData of upcomingReminders) {
      // Set dates to tomorrow and day after
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + Math.floor(Math.random() * 3) + 1);
      
      const reminder = await ReminderManager.saveReminder({
        ...reminderData,
        date: reminderDate,
      });
      createdReminders.push(reminder);
    }
    
    console.log(`Created ${createdReminders.length} upcoming reminders`);
    return createdReminders;
  } catch (error) {
    console.error('Error creating upcoming reminders:', error);
    return [];
  }
};
