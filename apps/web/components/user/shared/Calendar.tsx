import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import type { CalendarProps } from './ui.types';

const stripTime = (d: Date) => {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export function Calendar({
  selectedDate,
  onSelect,
  isRange = false,
  startDate,
  endDate,
  onRangeSelect,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(
    startDate || selectedDate || new Date()
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const startNormalized = startDate ? stripTime(startDate) : undefined;
  const endNormalized = endDate ? stripTime(endDate) : undefined;

  const handleDateClick = (date: Date) => {
    if (isRange && onRangeSelect) {
      if (!startNormalized || (startNormalized && endNormalized)) {
        onRangeSelect(date, undefined);
      } else if (startNormalized && !endNormalized) {
        if (date < startNormalized) {
          onRangeSelect(date, undefined);
        } else {
          onRangeSelect(startNormalized, date);
        }
      }
    } else if (onSelect) {
      onSelect(date);
    }
  };

  return (
    <div className="w-[260px] p-3 bg-(--bg-secondary) text-(--text-primary) font-work-sans">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 cursor-pointer hover:bg-(--seventh-color) rounded-md text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          <FaChevronLeft className="h-3 w-3" />
        </button>
        <span className="text-xs font-semibold font-montserrat">
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 cursor-pointer hover:bg-(--seventh-color) rounded-md text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          <FaChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-(--text-tertiary) mb-2">
        <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((b) => (
          <div key={`blank-${b}`} />
        ))}
        {days.map((day) => {
          const date = new Date(year, month, day);
          const isStart = startNormalized && date.getTime() === startNormalized.getTime();
          const isEnd = endNormalized && date.getTime() === endNormalized.getTime();
          const isWithin = startNormalized && endNormalized && date > startNormalized && date < endNormalized;

          let dayClass = 'hover:bg-(--seventh-color) text-(--text-secondary) hover:text-(--text-primary) rounded-md';

          if (isStart || isEnd) {
            dayClass = 'bg-(--primary-color) text-white font-semibold rounded-md';
          } else if (isWithin) {
            dayClass = 'bg-(--primary-color)/12 text-(--primary-color) font-medium rounded-none hover:bg-(--primary-color)/20';
          } else if (!isRange && selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year) {
            dayClass = 'bg-(--primary-color) text-white font-semibold rounded-md';
          }

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(date)}
              className={`h-7 w-7 cursor-pointer text-xs flex items-center justify-center transition-colors ${dayClass}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
