'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectMyTasks, selectAllProjects } from '@/store/selectors';
import { setTaskDetailId, setCreateTaskOpen } from '@/store/slices/uiSlice';
import { Badge, EmptyState, Button } from '@/components/ui';
import { STATUS_CONFIG, PRIORITY_CONFIG, Task, Project } from '@/types';
import { cn, formatShortDate, isOverdue } from '@/lib/utils';
import { CheckSquare, Clock, Plus, AlertTriangle, CalendarClock, CalendarDays, Inbox, Flag } from 'lucide-react';

export default function MyTasksPage() {
  const dispatch = useAppDispatch();
  const myTasks = useAppSelector(selectMyTasks);
  const projects = useAppSelector(selectAllProjects);

  const grouped = {
    overdue: myTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done'),
    today: myTasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()),
    upcoming: myTasks.filter(t => t.dueDate && new Date(t.dueDate) > new Date() && !isOverdue(t.dueDate)),
    noDue: myTasks.filter(t => !t.dueDate),
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shadow-xs">
            <CheckSquare size={18} />
          </div>
          <div>
            <h1 className="text-heading-lg text-text-primary font-heading">My Tasks</h1>
            <p className="text-caption text-text-tertiary">All assignments and deadlines across projects</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => dispatch(setCreateTaskOpen(true))}
          className="shadow-sm font-medium"
        >
          New Task
        </Button>
      </div>

      {myTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={48} className="text-text-tertiary" />}
          title="No tasks assigned"
          description="Tasks assigned to you will appear here."
        />
      ) : (
        <div className="space-y-6">
          {grouped.overdue.length > 0 && (
            <Section
              title="Overdue"
              count={grouped.overdue.length}
              color="#EF4444"
              icon={<AlertTriangle size={16} className="text-error" />}
            >
              {grouped.overdue.map(task => (
                <TaskRow key={task.id} task={task} projects={projects} onClick={() => dispatch(setTaskDetailId(task.id))} />
              ))}
            </Section>
          )}
          {grouped.today.length > 0 && (
            <Section
              title="Due Today"
              count={grouped.today.length}
              color="#3B82F6"
              icon={<CalendarClock size={16} className="text-info" />}
            >
              {grouped.today.map(task => (
                <TaskRow key={task.id} task={task} projects={projects} onClick={() => dispatch(setTaskDetailId(task.id))} />
              ))}
            </Section>
          )}
          {grouped.upcoming.length > 0 && (
            <Section
              title="Upcoming"
              count={grouped.upcoming.length}
              color="#10B981"
              icon={<CalendarDays size={16} className="text-success" />}
            >
              {grouped.upcoming.map(task => (
                <TaskRow key={task.id} task={task} projects={projects} onClick={() => dispatch(setTaskDetailId(task.id))} />
              ))}
            </Section>
          )}
          {grouped.noDue.length > 0 && (
            <Section
              title="No Due Date"
              count={grouped.noDue.length}
              color="#6B7280"
              icon={<Inbox size={16} className="text-text-tertiary" />}
            >
              {grouped.noDue.map(task => (
                <TaskRow key={task.id} task={task} projects={projects} onClick={() => dispatch(setTaskDetailId(task.id))} />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title, count, color, icon, children,
}: {
  title: string;
  count: number;
  color: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5 px-1">
        {icon}
        <h2 className="text-body-md font-semibold text-text-primary font-heading">{title}</h2>
        <span className="text-caption text-text-secondary bg-bg-tertiary border border-border-primary px-2.5 py-0.5 rounded-full font-medium text-[11px] shadow-2xs">
          {count}
        </span>
      </div>
      <div className="google-card overflow-hidden divide-y divide-border-secondary shadow-xs">
        {children}
      </div>
    </div>
  );
}

function TaskRow({ task, projects, onClick }: { task: Task; projects: Record<string, Project>; onClick: () => void }) {
  const project = projects[task.projectId];
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#F8FAFD] dark:hover:bg-[#303134] transition-all duration-150 cursor-pointer text-left group"
    >
      <div
        className="h-4 w-4 rounded-full border-2 border-border-primary group-hover:border-accent-primary flex items-center justify-center transition-colors flex-shrink-0"
        title={STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG].label}
      >
        <div className="h-1.5 w-1.5 rounded-full opacity-0 group-hover:opacity-100 bg-accent-primary transition-opacity" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-text-primary truncate group-hover:text-accent-primary transition-colors">
          {task.title}
        </p>
        {project && (
          <p className="text-caption text-text-tertiary flex items-center gap-1.5 mt-0.5">
            <span>{project.icon}</span>
            <span>{project.name}</span>
          </p>
        )}
      </div>
      <Badge size="sm" color={PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG].color}>
        <Flag size={10} className="mr-0.5" />
        {PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG].label}
      </Badge>
      {task.dueDate && (
        <span className={cn(
          'text-caption flex items-center gap-1 px-2.5 py-0.5 rounded-full',
          isOverdue(task.dueDate)
            ? 'text-[#C5221F] bg-[#FCE8E6] dark:bg-[#C5221F]/20 font-medium'
            : 'text-text-tertiary bg-bg-tertiary',
        )}>
          <Clock size={11} />
          {formatShortDate(task.dueDate)}
        </span>
      )}
    </button>
  );
}
