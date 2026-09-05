'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectMyTasks, selectAllProjects } from '@/store/selectors';
import { setTaskDetailId, setCreateTaskOpen } from '@/store/slices/uiSlice';
import { Badge, EmptyState, Button } from '@/components/ui';
import { STATUS_CONFIG, PRIORITY_CONFIG, Task, Project } from '@/types';
import { cn, formatShortDate, isOverdue } from '@/lib/utils';
import { CheckSquare, Clock, Plus } from 'lucide-react';

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
        <h1 className="text-heading-lg text-text-primary">My Tasks</h1>
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
            <Section title="Overdue" count={grouped.overdue.length} color="#EF4444">
              {grouped.overdue.map(task => (
                <TaskRow key={task.id} task={task} projects={projects} onClick={() => dispatch(setTaskDetailId(task.id))} />
              ))}
            </Section>
          )}
          {grouped.today.length > 0 && (
            <Section title="Due Today" count={grouped.today.length} color="#3B82F6">
              {grouped.today.map(task => (
                <TaskRow key={task.id} task={task} projects={projects} onClick={() => dispatch(setTaskDetailId(task.id))} />
              ))}
            </Section>
          )}
          {grouped.upcoming.length > 0 && (
            <Section title="Upcoming" count={grouped.upcoming.length} color="#10B981">
              {grouped.upcoming.map(task => (
                <TaskRow key={task.id} task={task} projects={projects} onClick={() => dispatch(setTaskDetailId(task.id))} />
              ))}
            </Section>
          )}
          {grouped.noDue.length > 0 && (
            <Section title="No Due Date" count={grouped.noDue.length} color="#6B7280">
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

function Section({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <div
          className="h-2.5 w-2.5 rounded-full shadow-xs"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
        />
        <h2 className="text-body-md font-bold text-text-primary font-heading">{title}</h2>
        <span className="text-caption text-text-secondary bg-bg-tertiary/70 border border-border-primary/50 px-2 py-0.5 rounded-full font-semibold text-[11px]">
          {count}
        </span>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden border border-white/70 dark:border-white/10 divide-y divide-border-secondary/60 shadow-xs">
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
      className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer text-left group"
    >
      <div
        className="h-2.5 w-2.5 rounded-full flex-shrink-0 ring-4 ring-transparent group-hover:ring-accent-primary/20 transition-all"
        style={{ backgroundColor: STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG].color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
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
        {PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG].label}
      </Badge>
      {task.dueDate && (
        <span className={cn(
          'text-caption flex items-center gap-1 px-2 py-0.5 rounded-md',
          isOverdue(task.dueDate)
            ? 'text-error bg-error/10 border border-error/20 font-medium'
            : 'text-text-tertiary bg-bg-tertiary/50',
        )}>
          <Clock size={11} />
          {formatShortDate(task.dueDate)}
        </span>
      )}
    </button>
  );
}
