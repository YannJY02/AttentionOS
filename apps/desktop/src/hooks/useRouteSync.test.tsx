import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DailyFlowProvider, useDailyFlow } from './useDailyFlow';
import { useRouteSync } from './useRouteSync';

function RouteSyncHarness() {
  const dailyFlow = useDailyFlow();
  const location = useLocation();

  useRouteSync(dailyFlow);

  return (
    <div>
      <p data-testid="stage">{dailyFlow.stage}</p>
      <p data-testid="path">{location.pathname}</p>
      <button
        onClick={() => {
          dailyFlow.send({ type: 'MEDITATION_COMPLETE' });
          dailyFlow.send({ type: 'REFLECTION_SAVED', text: 'Morning reflection' });
          dailyFlow.send({ type: 'RITUAL_COMPLETE' });
        }}
        type="button"
      >
        Finish ritual
      </button>
      <button
        onClick={() => dailyFlow.send({ type: 'START_EXECUTION', taskId: 'task-1' })}
        type="button"
      >
        Start execution
      </button>
    </div>
  );
}

function renderHarness(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <DailyFlowProvider>
        <RouteSyncHarness />
      </DailyFlowProvider>
    </MemoryRouter>,
  );
}

describe('useRouteSync', () => {
  it('restores the daily-flow stage from the initial route', async () => {
    renderHarness('/execution/focus');

    await waitFor(() => {
      expect(screen.getByTestId('stage')).toHaveTextContent('execution');
    });
  });

  it('navigates to overview when ritual completes', async () => {
    renderHarness('/ritual');

    fireEvent.click(screen.getByRole('button', { name: /finish ritual/i }));

    await waitFor(() => {
      expect(screen.getByTestId('path')).toHaveTextContent('/overview');
    });
  });

  it('navigates to execution when a task starts', async () => {
    renderHarness('/overview');

    fireEvent.click(screen.getByRole('button', { name: /start execution/i }));

    await waitFor(() => {
      expect(screen.getByTestId('path')).toHaveTextContent('/execution/plan');
    });
  });
});
