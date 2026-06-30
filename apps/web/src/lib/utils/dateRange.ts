export type DatePreset = 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month' | 'custom';

export function calculatePresetRange(
  preset: DatePreset,
  customStart?: string,
  customEnd?: string
): { startDate?: string; endDate?: string } {
  const now = new Date();

  const getStartOfDay = (d: Date) => {
    const res = new Date(d);
    res.setHours(0, 0, 0, 0);
    return res;
  };

  const getEndOfDay = (d: Date) => {
    const res = new Date(d);
    res.setHours(23, 59, 59, 999);
    return res;
  };

  switch (preset) {
    case 'today': {
      const start = getStartOfDay(now);
      const end = getEndOfDay(now);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'last_7_days': {
      const start = getStartOfDay(now);
      start.setDate(start.getDate() - 6);
      const end = getEndOfDay(now);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'last_30_days': {
      const start = getStartOfDay(now);
      start.setDate(start.getDate() - 29);
      const end = getEndOfDay(now);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = getEndOfDay(now);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'custom': {
      if (!customStart && !customEnd) {
        return { startDate: undefined, endDate: undefined };
      }

      let start: Date | undefined;
      let end: Date | undefined;

      if (customStart) {
        const localStart = customStart.includes('-') ? parseLocalDate(customStart) : new Date(customStart);
        start = getStartOfDay(localStart);
      }
      if (customEnd) {
        const localEnd = customEnd.includes('-') ? parseLocalDate(customEnd) : new Date(customEnd);
        end = getEndOfDay(localEnd);
      }

      return {
        startDate: start?.toISOString(),
        endDate: end?.toISOString(),
      };
    }
    case 'all':
    default:
      return { startDate: undefined, endDate: undefined };
  }
}

function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}
