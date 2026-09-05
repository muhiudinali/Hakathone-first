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
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="glass-card rounded-2xl p-6 border border-white/70 dark:border-white/10 shadow-sm flex flex-col flex-1 min-h-[620px]">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-heading-md text-text-primary font-heading font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="h-8 px-3.5 text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-secondary/70 backdrop-blur-sm border border-border-primary/80 hover:bg-bg-hover rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Today
            </button>
            <IconButton onClick={goToPrev} tooltip="Previous month" size="sm">
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton onClick={goToNext} tooltip="Next month" size="sm">
              <ChevronRight size={16} />
            </IconButton>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border-primary/80 pb-2 mb-1">
          {dayNames.map(day => (
            <div key={day} className="text-center text-overline text-text-tertiary font-bold">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr border-l border-t border-border-primary/60 rounded-xl overflow-hidden">
          {weeks.flat().map((date, i) => {
            const isCurrentMonth = date.getMonth() === month;
            const isToday = isSameDay(date, today);
            const dayTasks = getTasksForDate(date);

            return (
              <div
                key={i}
                className={cn(
                  'border-r border-b border-border-primary/60 p-2 min-h-[85px] transition-colors',
                  !isCurrentMonth && 'bg-bg-tertiary/40 opacity-60',
                  isToday && 'bg-accent-primary/5',
                )}
              >
                <div className={cn(
                  'text-caption font-medium mb-1.5 flex items-center justify-between',
                  isToday ? 'text-accent-primary' : isCurrentMonth ? 'text-text-primary' : 'text-text-tertiary',
                )}>
                  <span className={cn(
                    isToday && 'bg-accent-primary text-white h-6 w-6 rounded-full inline-flex items-center justify-center shadow-xs shadow-indigo-500/30 font-bold text-xs',
                  )}>
                    {date.getDate()}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-text-tertiary font-semibold">
                      {dayTasks.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <button
                      key={task.id}
                      onClick={() => dispatch(setTaskDetailId(task.id))}
                      className="w-full text-left px-2 py-1 rounded-md text-[11px] font-semibold truncate hover:opacity-90 transition-opacity cursor-pointer border shadow-2xs"
                      style={{
                        backgroundColor: `${STATUS_CONFIG[task.status].color}18`,
                        color: STATUS_CONFIG[task.status].color,
                        borderColor: `${STATUS_CONFIG[task.status].color}35`,
                      }}
                      title={task.title}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-text-tertiary px-1.5 font-medium">+{dayTasks.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
