export interface CalendarCell {
  dateStr: string | null;
  dayNumber: number | null;
}

export function buildGridCells(year: number, month: number): CalendarCell[] {
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];
  
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ dateStr: null, dayNumber: null });
  }
  
  for (let d = 1; d <= totalDays; d++) {
    cells.push({
      dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      dayNumber: d,
    });
  }
  return cells;
}

export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short", 
    month: "short", 
    day: "numeric",
  });
}