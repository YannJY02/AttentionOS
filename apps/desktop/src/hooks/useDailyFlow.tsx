import { dailyFlowMachine } from '@attentionos/machines';
import { useMachine } from '@xstate/react';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import type { EventFrom, SnapshotFrom } from 'xstate';

type DailyFlowSnapshot = SnapshotFrom<typeof dailyFlowMachine>;
type DailyFlowEvent = EventFrom<typeof dailyFlowMachine>;

export type WorkflowStage = 'ritual' | 'overview' | 'execution';
export type RitualStep = 'meditation' | 'reflection' | 'dedication' | null;

export interface DailyFlowApi {
  readonly activeTaskId: string | null;
  readonly ritualStep: RitualStep;
  readonly send: (event: DailyFlowEvent) => void;
  readonly snapshot: DailyFlowSnapshot;
  readonly stage: WorkflowStage;
}

const DailyFlowContext = createContext<DailyFlowApi | null>(null);

function getWorkflowStage(snapshot: DailyFlowSnapshot): WorkflowStage {
  if (snapshot.matches('overview')) {
    return 'overview';
  }

  if (snapshot.matches('execution')) {
    return 'execution';
  }

  return 'ritual';
}

function getRitualStep(snapshot: DailyFlowSnapshot): RitualStep {
  if (snapshot.matches({ ritual: 'reflection' })) {
    return 'reflection';
  }

  if (snapshot.matches({ ritual: 'dedication' })) {
    return 'dedication';
  }

  if (snapshot.matches({ ritual: 'meditation' })) {
    return 'meditation';
  }

  return null;
}

export function DailyFlowProvider({ children }: { readonly children: ReactNode }) {
  const [snapshot, send] = useMachine(dailyFlowMachine);
  const stage = getWorkflowStage(snapshot);
  const ritualStep = getRitualStep(snapshot);

  const value = useMemo<DailyFlowApi>(
    () => ({
      activeTaskId: snapshot.context.activeTaskId,
      ritualStep,
      send,
      snapshot,
      stage,
    }),
    [ritualStep, send, snapshot, stage],
  );

  return <DailyFlowContext.Provider value={value}>{children}</DailyFlowContext.Provider>;
}

export function useDailyFlow(): DailyFlowApi {
  const context = useContext(DailyFlowContext);

  if (!context) {
    throw new Error('useDailyFlow must be used within DailyFlowProvider');
  }

  return context;
}
