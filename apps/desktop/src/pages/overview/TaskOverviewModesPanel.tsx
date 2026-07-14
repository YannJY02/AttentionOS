import type { V2Entity } from '@attentionos/core';
import { CalendarRange, FolderKanban, Grid2X2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { readHierarchyEntities } from '../../storage/hierarchy';

type BrowseMode = 'day' | 'week' | 'month';

interface PeriodProjectGroup {
  readonly projectTitle: string;
  readonly tasks: readonly V2Entity[];
}

interface PeriodGroup {
  readonly label: string;
  readonly projectGroups: readonly PeriodProjectGroup[];
  readonly sortKey: number;
}

interface Quadrant {
  readonly label: string;
  readonly tasks: readonly V2Entity[];
}

const MODE_LABELS: Record<BrowseMode, string> = {
  day: 'Day',
  month: 'Month',
  week: 'Week',
};

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 'yes';
}

function parseDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function taskDate(task: V2Entity): Date {
  return (
    parseDate(
      asString(task.properties.scheduledFor) ??
        asString(task.properties.dueDate) ??
        asString(task.properties.targetDate),
    ) ?? new Date(task.createdAt)
  );
}

function startOfUtcWeek(date: Date): Date {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = start.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  start.setUTCDate(start.getUTCDate() + offset);
  return start;
}

function formatIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatPeriod(date: Date, mode: BrowseMode): string {
  if (mode === 'day') {
    return formatIsoDay(date);
  }

  if (mode === 'week') {
    return `Week of ${formatIsoDay(startOfUtcWeek(date))}`;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date);
}

function projectTitleFor(task: V2Entity, entities: readonly V2Entity[]): string {
  const project = entities.find(
    (entity) => entity.id === task.parentId && entity.hierarchyLayer === 'project',
  );

  return project?.title ?? 'Unassigned project';
}

function activeTasks(entities: readonly V2Entity[]): V2Entity[] {
  return entities.filter(
    (entity) => entity.hierarchyLayer === 'task' && entity.status === 'active',
  );
}

function groupTasksByPeriod(
  tasks: readonly V2Entity[],
  entities: readonly V2Entity[],
  mode: BrowseMode,
): PeriodGroup[] {
  const periodMap = new Map<string, { projectMap: Map<string, V2Entity[]>; sortKey: number }>();

  for (const task of tasks) {
    const date = taskDate(task);
    const label = formatPeriod(date, mode);
    const projectTitle = projectTitleFor(task, entities);
    const period = periodMap.get(label) ?? {
      projectMap: new Map<string, V2Entity[]>(),
      sortKey: mode === 'week' ? startOfUtcWeek(date).getTime() : date.getTime(),
    };
    period.projectMap.set(projectTitle, [...(period.projectMap.get(projectTitle) ?? []), task]);
    periodMap.set(label, period);
  }

  return [...periodMap.entries()]
    .map(([label, period]) => ({
      label,
      projectGroups: [...period.projectMap.entries()]
        .map(([projectTitle, projectTasks]) => ({
          projectTitle,
          tasks: projectTasks.sort(
            (left, right) => taskDate(left).getTime() - taskDate(right).getTime(),
          ),
        }))
        .sort((left, right) => left.projectTitle.localeCompare(right.projectTitle)),
      sortKey: period.sortKey,
    }))
    .sort((left, right) => left.sortKey - right.sortKey);
}

function isUrgent(task: V2Entity): boolean {
  if (
    asBoolean(task.properties.urgent) ||
    asBoolean(task.properties.isUrgent) ||
    task.properties.executionRole === 'current'
  ) {
    return true;
  }

  const dueDate = parseDate(asString(task.properties.dueDate));
  if (!dueDate) {
    return false;
  }

  const now = new Date();
  const sevenDaysFromNow = now.getTime() + 7 * 24 * 60 * 60 * 1000;
  return dueDate.getTime() <= sevenDaysFromNow;
}

function isImportant(task: V2Entity): boolean {
  const importance = asString(task.properties.importance)?.toLowerCase();
  const priority = asString(task.properties.priority)?.toLowerCase();

  return (
    importance === 'high' ||
    importance === 'important' ||
    priority === 'high' ||
    task.properties.executionRole === 'current' ||
    task.properties.executionRole === 'candidate'
  );
}

function taskQuadrants(tasks: readonly V2Entity[]): Quadrant[] {
  return [
    {
      label: 'Do next',
      tasks: tasks.filter((task) => isUrgent(task) && isImportant(task)),
    },
    {
      label: 'Schedule',
      tasks: tasks.filter((task) => !isUrgent(task) && isImportant(task)),
    },
    {
      label: 'Shrink or delegate',
      tasks: tasks.filter((task) => isUrgent(task) && !isImportant(task)),
    },
    {
      label: 'Later list',
      tasks: tasks.filter((task) => !isUrgent(task) && !isImportant(task)),
    },
  ];
}

function TaskList({ tasks }: { readonly tasks: readonly V2Entity[] }) {
  if (tasks.length === 0) {
    return <p className="mt-2 text-sm text-stone-500">No tasks in this lane.</p>;
  }

  return (
    <ul className="mt-2 space-y-2 text-sm text-stone-700">
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}

export function TaskOverviewModesPanel() {
  const [mode, setMode] = useState<BrowseMode>('day');
  const entities = readHierarchyEntities();
  const tasks = useMemo(() => activeTasks(entities), [entities]);
  const periodGroups = useMemo(
    () => groupTasksByPeriod(tasks, entities, mode),
    [entities, mode, tasks],
  );
  const quadrants = useMemo(() => taskQuadrants(tasks), [tasks]);

  if (tasks.length === 0) {
    return (
      <section
        aria-label="Task overview browsing"
        className="mb-6 rounded-md border border-dashed border-stone-300 bg-white p-5"
      >
        <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
          <CalendarRange aria-hidden="true" size={16} />
          Task overview
        </p>
        <p className="mt-2 text-sm text-stone-600">
          No active tasks are available for day, week, month, project, or quadrant browsing.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Task overview browsing"
      className="mb-6 rounded-md border border-stone-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
            <CalendarRange aria-hidden="true" size={16} />
            Task overview
          </p>
          <h2 className="mt-2 font-semibold text-2xl text-stone-950">
            Browse tasks without leaving Overview
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Read tasks by day, week, month, project, or quadrant before choosing one action for
            Execution.
          </p>
        </div>

        <fieldset className="inline-flex rounded-md border border-stone-300 p-1">
          <legend className="sr-only">Task date range</legend>
          {(Object.keys(MODE_LABELS) as BrowseMode[]).map((nextMode) => (
            <button
              aria-pressed={mode === nextMode}
              className={
                mode === nextMode
                  ? 'rounded-sm bg-stone-950 px-3 py-1.5 font-medium text-sm text-white'
                  : 'rounded-sm px-3 py-1.5 font-medium text-sm text-stone-700'
              }
              key={nextMode}
              onClick={() => setMode(nextMode)}
              type="button"
            >
              {MODE_LABELS[nextMode]}
            </button>
          ))}
        </fieldset>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
            <FolderKanban aria-hidden="true" size={16} />
            {MODE_LABELS[mode]} by project
          </p>
          <div className="mt-3 space-y-4 border-stone-200 border-t pt-4">
            {periodGroups.map((period) => (
              <div key={period.label}>
                <p className="font-medium text-stone-950">{period.label}</p>
                {period.projectGroups.map((projectGroup) => (
                  <div className="mt-3" key={`${period.label}-${projectGroup.projectTitle}`}>
                    <p className="text-sm text-stone-500">{projectGroup.projectTitle}</p>
                    <TaskList tasks={projectGroup.tasks} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
            <Grid2X2 aria-hidden="true" size={16} />
            Four-quadrant scan
          </p>
          <div className="mt-3 grid gap-4 border-stone-200 border-t pt-4 sm:grid-cols-2">
            {quadrants.map((quadrant) => (
              <div key={quadrant.label}>
                <p className="font-medium text-stone-950">{quadrant.label}</p>
                <TaskList tasks={quadrant.tasks} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
