// Test file to verify calendar functionality
// This demonstrates that the calendar logic should work correctly

export class CalendarTest {
  // Test the getDaysInMonth function logic
  static testGetDaysInMonth(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      days.push(dayDate);
    }
    
    // Add empty cells to fill the remaining weeks (up to 6 weeks total)
    const totalCells = 42; // 6 weeks * 7 days
    while (days.length < totalCells) {
      days.push(null);
    }
    
    return days;
  }

  // Test October 2025 (the month shown in the image)
  static testOctober2025() {
    console.log('Testing October 2025 Calendar:');
    console.log('============================');
    
    const days = this.testGetDaysInMonth(2025, 9); // October is month 9 (0-indexed)
    
    // Group days into weeks for display
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    console.log('Week layout:');
    weeks.forEach((week, weekIndex) => {
      console.log(`Week ${weekIndex + 1}:`);
      weekDays.forEach((dayName, dayIndex) => {
        const day = week[dayIndex];
        const dayNumber = day ? day.getDate() : '--';
        console.log(`  ${dayName}: ${dayNumber}`);
      });
    });
    
    return days;
  }

  // Test current month
  static testCurrentMonth() {
    const now = new Date();
    console.log(`Testing ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}:`);
    console.log('==========================================');
    
    const days = this.testGetDaysInMonth(now.getFullYear(), now.getMonth());
    
    // Group days into weeks for display
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    console.log('Week layout:');
    weeks.forEach((week, weekIndex) => {
      console.log(`Week ${weekIndex + 1}:`);
      weekDays.forEach((dayName, dayIndex) => {
        const day = week[dayIndex];
        const dayNumber = day ? day.getDate() : '--';
        console.log(`  ${dayName}: ${dayNumber}`);
      });
    });
    
    return days;
  }

  // Verify that all days of the week are properly filled
  static verifyCalendarIntegrity(days: (Date | null)[]) {
    console.log('\nCalendar Integrity Check:');
    console.log('========================');
    
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let hasIssues = false;
    
    weeks.forEach((week, weekIndex) => {
      weekDays.forEach((dayName, dayIndex) => {
        const day = week[dayIndex];
        if (day) {
          const actualDayOfWeek = day.getDay();
          if (actualDayOfWeek !== dayIndex) {
            console.log(`❌ ISSUE: Week ${weekIndex + 1}, ${dayName} has date ${day.getDate()} but should be day ${dayIndex}`);
            hasIssues = true;
          }
        }
      });
    });
    
    if (!hasIssues) {
      console.log('✅ Calendar integrity verified - all days are in correct positions');
    }
    
    return !hasIssues;
  }
}

// Usage examples:
// CalendarTest.testOctober2025();
// CalendarTest.testCurrentMonth();
// const days = CalendarTest.testGetDaysInMonth(2025, 9);
// CalendarTest.verifyCalendarIntegrity(days);
