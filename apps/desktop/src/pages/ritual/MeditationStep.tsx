import { meditationMachine } from '@attentionos/machines';
import { useMachine } from '@xstate/react';
import { Pause, Play, SkipForward } from 'lucide-react';

interface MeditationStepProps {
  readonly onComplete: () => void;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function MeditationStep({ onComplete }: MeditationStepProps) {
  const [snapshot, send] = useMachine(meditationMachine, { input: { durationMs: 300_000 } });
  const isIdle = snapshot.matches('idle');
  const isMeditating = snapshot.matches('meditating');
  const isPaused = snapshot.matches('paused');

  function completeMeditation() {
    send({ type: 'COMPLETE' });
    onComplete();
  }

  return (
    <section className="max-w-2xl">
      <p className="font-medium text-amber-700 text-sm">Ritual step 1</p>
      <h1 className="mt-2 font-semibold text-4xl text-stone-950">Meditation</h1>
      <p className="mt-3 text-base text-stone-600">
        Start with a short deterministic pause before planning. The timer state is controlled by the
        meditation state machine.
      </p>

      <div className="mt-8 rounded-md border border-stone-200 bg-white p-6">
        <p className="text-sm text-stone-500">Elapsed</p>
        <p className="mt-2 font-semibold text-5xl tabular-nums text-stone-950">
          {formatElapsed(snapshot.context.elapsedMs)}
        </p>
        <p className="mt-2 text-sm capitalize text-stone-500">Status: {String(snapshot.value)}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {isIdle ? (
            <button
              className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2 font-medium text-sm text-white"
              onClick={() => send({ type: 'START' })}
              type="button"
            >
              <Play aria-hidden="true" size={16} />
              Start meditation
            </button>
          ) : null}

          {isMeditating ? (
            <button
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800"
              onClick={() => send({ type: 'PAUSE' })}
              type="button"
            >
              <Pause aria-hidden="true" size={16} />
              Pause meditation
            </button>
          ) : null}

          {isPaused ? (
            <button
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800"
              onClick={() => send({ type: 'RESUME' })}
              type="button"
            >
              <Play aria-hidden="true" size={16} />
              Resume meditation
            </button>
          ) : null}

          {!isIdle ? (
            <button
              className="inline-flex items-center gap-2 rounded-md bg-amber-700 px-4 py-2 font-medium text-sm text-white"
              onClick={completeMeditation}
              type="button"
            >
              <SkipForward aria-hidden="true" size={16} />
              Complete meditation
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
