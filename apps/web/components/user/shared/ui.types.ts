export interface CalendarProps {
  selectedDate?: Date;
  onSelect?: (date: Date) => void;
  isRange?: boolean;
  startDate?: Date;
  endDate?: Date;
  onRangeSelect?: (start: Date, end?: Date) => void;
}
