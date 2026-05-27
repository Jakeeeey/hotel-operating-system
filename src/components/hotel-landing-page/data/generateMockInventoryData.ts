import { InventoryNight } from "../pages/calendar/types";
import { RoomType } from "../pages/calendar/types";

export const generateMockInventoryData = (): InventoryNight[] => {
  const data: InventoryNight[] = [];
  const roomTypes: Exclude<RoomType, "all">[] = ["deluxe", "suite", "villa", "overwater"];
  const totalCounts: Record<Exclude<RoomType, "all">, number> = {
    deluxe: 12, suite: 8, villa: 4, overwater: 3,
  };

  const months = [{ month: 5, days: 30 }, { month: 6, days: 31 }, { month: 7, days: 31 }, { month: 8, days: 30 }];

  months.forEach(({ month, days }) => {
    for (let day = 1; day <= days; day++) {
      const dateString = `2026-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      roomTypes.forEach((type) => {
        const seedStr = `${dateString}-${type}`;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
        const pseudoRandom = Math.abs(hash % 100) / 100;
        let allocated = Math.floor(pseudoRandom * (totalCounts[type] - 1));

        const dayOfWeek = new Date(2026, month, day).getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6) allocated = Math.min(totalCounts[type], allocated + 3);
        if (month === 5 && day >= 12 && day <= 14) allocated = totalCounts[type];

        data.push({
          date: dateString,
          roomType: type,
          totalInventory: totalCounts[type],
          allocatedCount: allocated,
          remainingAvailable: totalCounts[type] - allocated,
        });
      });
    }
  });
  return data;
};