export class CalendarStructureTest {
  static testGetDaysInMonth(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      days.push(dayDate);
    }
    
    const totalCells = 42; 
    while (days.length < totalCells) {
      days.push(null);
    }
    
    return days;
  }

  static testOctober2025Structure() {
   
    const days = this.testGetDaysInMonth(2025, 9); 
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    weeks.forEach((week, weekIndex) => {
      weekDays.forEach((dayName, dayIndex) => {
        const day = week[dayIndex];
        const dayNumber = day ? day.getDate() : '--';
      });
    });
    
    return days;
  }

  static verifyStructure(days: (Date | null)[]) {
    
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
      console.log('✅ Calendar structure is correct - all days are in proper positions');
    }
    
    return !hasIssues;
  }

  static testWorkingDaysLogic() {
    const today = new Date();
    const workingDays = [
      "2025-10-01", "2025-10-02", "2025-10-03", "2025-10-04", "2025-10-06", "2025-10-10",
      "2025-10-11", "2025-10-13", "2025-10-14", "2025-10-15", "2025-10-17", "2025-10-18"
    ];
    const testDates = [
      { date: "2025-10-01", expected: "Working Day (Green)" },
      { date: "2025-10-05", expected: "Non-Working Day (Red)" },
      { date: "2025-10-10", expected: "Working Day (Green)" },
      { date: "2025-10-12", expected: "Non-Working Day (Red)" }
    ];
    
    testDates.forEach(({ date, expected }) => {
      const hasPlan = workingDays.includes(date);
      const status = hasPlan ? "Working Day (Green)" : "Non-Working Day (Red)";
      const match = status === expected ? "✅" : "❌";
      console.log(`${match} ${date}: ${status}`);
    });
  }
}
