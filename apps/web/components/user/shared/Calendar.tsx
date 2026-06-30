import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

interface CalendarProps {
  selectedDate?: Date;
  onSelect: (date: Date) => void;
}

export function Calendar({ selectedDate, onSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

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
          const isSelected = selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(date)}
              className={`h-7 w-7 cursor-pointer text-xs flex items-center justify-center rounded-md transition-colors ${
                isSelected
                  ? 'bg-(--primary-color) text-(--bg-primary) font-semibold'
                  : 'hover:bg-(--seventh-color) text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
