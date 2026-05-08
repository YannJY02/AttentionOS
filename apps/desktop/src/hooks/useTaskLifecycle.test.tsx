import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EXECUTION_AUDIT_STORAGE_KEY } from '../storage/audit';
import { useTaskLifecycle } from './useTaskLifecycle';

function TaskLifecycleHarness() {
  const task = useTaskLifecycle({
    estimatedMinutes: 25,
    taskId: 'task-wire-overview',
    title: 'Wire overview',
  });

  return (
    <section>
      <h1>{task.state}</h1>
      <p>Actual minutes: {task.actualMinutes}</p>
      <button onClick={task.start} type="button">
        Start
      </button>
      <button onClick={task.tickFiveMinutes} type="button">
        Add 5
      </button>
      <button onClick={task.submitForReview} type="button">
        Submit
      </button>
      <button onClick={task.complete} type="button">
        Complete
      </button>
    </section>
  );
}

describe('useTaskLifecycle', () => {
  it('initializes a task in planning and only ticks while executing', () => {
    localStorage.removeItem(EXECUTION_AUDIT_STORAGE_KEY);

    render(<TaskLifecycleHarness />);

    expect(screen.getByRole('heading', { name: 'planning' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add 5' }));
    expect(screen.getByText('Actual minutes: 0')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByRole('heading', { name: 'executing' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add 5' }));
    expect(screen.getByText('Actual minutes: 5')).toBeInTheDocument();
  });

  it('logs valid lifecycle transitions to the execution audit store', () => {
    localStorage.removeItem(EXECUTION_AUDIT_STORAGE_KEY);

    render(<TaskLifecycleHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));

    const auditEntries = JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]');
    expect(auditEntries).toHaveLength(3);
    expect(auditEntries[0]).toMatchObject({
      action: 'task.lifecycle.transition',
      actor: 'user',
      targetId: 'task-wire-overview',
    });
    expect(auditEntries[2].details).toMatchObject({
      event: 'COMPLETE',
      from: 'reviewing',
      to: 'done',
    });
  });
});
