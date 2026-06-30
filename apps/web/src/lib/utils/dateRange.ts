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

export function calculateReferenceRange(
  preset: DatePreset,
  primaryStart?: string,
  primaryEnd?: string,
  referenceType: 'previous_period' | 'previous_year' | 'custom' = 'previous_period',
  customReferenceStart?: string,
  customReferenceEnd?: string
): { startDate?: string; endDate?: string } {
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

  if (referenceType === 'custom') {
    if (customReferenceStart && customReferenceEnd) {
      const localStart = parseLocalDate(customReferenceStart);
      const localEnd = parseLocalDate(customReferenceEnd);
      return {
        startDate: getStartOfDay(localStart).toISOString(),
        endDate: getEndOfDay(localEnd).toISOString(),
      };
    }
  }

  // Se for "same period last year", calcula o período principal primeiro e depois subtrai 1 ano de ambas as datas
  if (referenceType === 'previous_year') {
    const now = new Date();

    const getPrimaryRange = () => {
      switch (preset) {
        case 'today': {
          return { start: getStartOfDay(now), end: getEndOfDay(now) };
        }
        case 'last_7_days': {
          const start = getStartOfDay(now);
          start.setDate(start.getDate() - 6);
          return { start, end: getEndOfDay(now) };
        }
        case 'last_30_days': {
          const start = getStartOfDay(now);
          start.setDate(start.getDate() - 29);
          return { start, end: getEndOfDay(now) };
        }
        case 'this_month': {
          const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          return { start, end: getEndOfDay(now) };
        }
        case 'last_month': {
          const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
          const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          return { start, end };
        }
        case 'custom': {
          if (!primaryStart || !primaryEnd) return null;
          return { start: new Date(primaryStart), end: new Date(primaryEnd) };
        }
        default:
          return null;
      }
    };

    const primaryRange = getPrimaryRange();
    if (!primaryRange) return { startDate: undefined, endDate: undefined };
    
    primaryRange.start.setFullYear(primaryRange.start.getFullYear() - 1);
    primaryRange.end.setFullYear(primaryRange.end.getFullYear() - 1);
    
    return {
      startDate: primaryRange.start.toISOString(),
      endDate: primaryRange.end.toISOString(),
    };
  }

  // Comportamento padrão: período anterior equivalente
  const now = new Date();

  switch (preset) {
    case 'today': {
      const start = getStartOfDay(now);
      start.setDate(start.getDate() - 1);
      const end = getEndOfDay(now);
      end.setDate(end.getDate() - 1);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'last_7_days': {
      const start = getStartOfDay(now);
      start.setDate(start.getDate() - 13);
      const end = getEndOfDay(now);
      end.setDate(end.getDate() - 7);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'last_30_days': {
      const start = getStartOfDay(now);
      start.setDate(start.getDate() - 59);
      const end = getEndOfDay(now);
      end.setDate(end.getDate() - 30);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'this_month': {
      // Período anterior equivalente (ex: se hoje é dia 15, compara de 1 a 15 do mês anterior)
      const daysPassed = now.getDate();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() - 1, daysPassed, 23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'custom': {
      if (!primaryStart || !primaryEnd) {
        return { startDate: undefined, endDate: undefined };
      }
      const pStart = new Date(primaryStart);
      const pEnd = new Date(primaryEnd);
      const diffMs = pEnd.getTime() - pStart.getTime();
      const rEnd = new Date(pStart.getTime() - 1);
      const rStart = new Date(rEnd.getTime() - diffMs);
      return { startDate: rStart.toISOString(), endDate: rEnd.toISOString() };
    }
    case 'all':
    default:
      return { startDate: undefined, endDate: undefined };
  }
}
