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
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="text-body-md font-semibold text-text-primary">{title}</h2>
        <span className="text-caption text-text-tertiary">{count}</span>
      </div>
      <div className="bg-bg-secondary border border-border-primary rounded-xl divide-y divide-border-secondary">
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
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-hover transition-colors cursor-pointer text-left"
    >
      <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG].color }} />
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-text-primary truncate">{task.title}</p>
        {project && <p className="text-caption text-text-tertiary">{project.icon} {project.name}</p>}
      </div>
      <Badge size="sm" color={PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG].color}>
        {PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG].label}
      </Badge>
      {task.dueDate && (
        <span className={cn(
          'text-caption flex items-center gap-1',
          isOverdue(task.dueDate) ? 'text-error font-medium' : 'text-text-tertiary',
        )}>
          <Clock size={11} />
          {formatShortDate(task.dueDate)}
        </span>
      )}
    </button>
  );
}
