'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setTaskDetailId } from '@/store/slices/uiSlice';
import { Task, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';
import { IconButton } from '@/components/ui';
import { cn, isSameDay, format, addDays, subDays, startOfDay } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const dispatch = useAppDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days: Date[] = [];
  const d = new Date(startDate);
  while (days.length < 42) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const goToToday = () => setCurrentDate(new Date());
  const goToPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNext = () => setCurrentDate(new Date(year, month + 1, 1));

  const getTasksForDate = (date: Date) =>
    tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), date));

  const today = startOfDay(new Date());
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-heading-md text-text-primary">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="h-8 px-3 text-sm font-medium text-text-secondary hover:bg-bg-hover rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>
          <IconButton onClick={goToPrev} tooltip="Previous month">
            <ChevronLeft size={16} />
          </IconButton>
          <IconButton onClick={goToNext} tooltip="Next month">
            <ChevronRight size={16} />
          </IconButton>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-border-primary mb-1">
        {dayNames.map(day => (
          <div key={day} className="py-2 text-center text-overline text-text-tertiary">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr border-l border-border-primary">
        {weeks.flat().map((date, i) => {
          const isCurrentMonth = date.getMonth() === month;
          const isToday = isSameDay(date, today);
          const dayTasks = getTasksForDate(date);

          return (
            <div
              key={i}
              className={cn(
                'border-r border-b border-border-primary p-1.5 min-h-[80px] transition-colors',
                !isCurrentMonth && 'bg-bg-tertiary/50',
                isToday && 'bg-info/5',
              )}
            >
              <div className={cn(
                'text-caption font-medium mb-1',
                isToday ? 'text-info' : isCurrentMonth ? 'text-text-primary' : 'text-text-tertiary',
              )}>
                <span className={cn(
                  isToday && 'bg-info text-white h-6 w-6 rounded-full inline-flex items-center justify-center',
                )}>
                  {date.getDate()}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={() => dispatch(setTaskDetailId(task.id))}
                    className="w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium truncate hover:opacity-80 transition-opacity cursor-pointer"
                    style={{
                      backgroundColor: `${STATUS_CONFIG[task.status].color}20`,
                      color: STATUS_CONFIG[task.status].color,
                    }}
                    title={task.title}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-text-tertiary px-1.5">+{dayTasks.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
