import { meditationMachine } from '@attentionos/workflow';
import { useMachine } from '@xstate/react';
import { Pause, Play, SkipForward } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { RitualSoundMode } from '../../adapters/storage/ritualCopy';

interface MeditationStepProps {
  readonly durationMinutes: number;
  readonly guidanceLabel: string;
  readonly guidancePrompt: string;
  readonly intentionText: string;
  readonly onComplete: () => void;
  readonly soundLabel: string;
  readonly soundMode: RitualSoundMode;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getBreathLabel(snapshotValue: unknown): string {
  if (snapshotValue === 'meditating') {
    return 'In rhythm';
  }

  if (snapshotValue === 'paused') {
    return 'Paused';
  }

  return 'Ready';
}

function playBellCue(soundMode: RitualSoundMode): void {
  if (soundMode !== 'bell' || typeof window === 'undefined' || !window.AudioContext) {
    return;
  }

  try {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.frequency.value = 660;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.18);
  } catch {
    // Audio cues are optional; meditation controls must remain usable without them.
  }
}

export function MeditationStep({
  durationMinutes,
  guidanceLabel,
  guidancePrompt,
  intentionText,
  onComplete,
  soundLabel,
  soundMode,
}: MeditationStepProps) {
  const durationMs = durationMinutes * 60_000;
  const [snapshot, send] = useMachine(meditationMachine, { input: { durationMs } });
  const completedRef = useRef(false);
  const isIdle = snapshot.matches('idle');
  const isMeditating = snapshot.matches('meditating');
  const isPaused = snapshot.matches('paused');
  const isCompleted = snapshot.matches('completed');

  useEffect(() => {
    if (!isMeditating) {
      return undefined;
    }

    const timer = window.setInterval(() => send({ type: 'TICK', deltaMs: 1000 }), 1000);
    return () => window.clearInterval(timer);
  }, [isMeditating, send]);

  useEffect(() => {
    if (!isCompleted || completedRef.current) {
      return;
    }

    completedRef.current = true;
    playBellCue(soundMode);
    onComplete();
  }, [isCompleted, onComplete, soundMode]);

  function startMeditation() {
    playBellCue(soundMode);
    send({ type: 'START' });
  }

  function completeMeditation() {
    send({ type: 'COMPLETE' });
  }

  return (
    <section className="max-w-2xl">
      <p className="font-medium text-amber-700 text-sm">Ritual step 1</p>
      <h1 className="mt-2 font-semibold text-4xl text-stone-950">Meditation</h1>
      <p className="mt-3 text-base text-stone-600">{intentionText}</p>

      <div className="mt-8 rounded-md border border-stone-200 bg-white p-6">
        <div className="grid gap-3 text-sm text-stone-600 sm:grid-cols-3">
          <p>
            <span className="block font-medium text-stone-800">Target</span>
            {formatElapsed(durationMs)}
          </p>
          <p>
            <span className="block font-medium text-stone-800">Guidance</span>
            {guidanceLabel}
          </p>
          <p>
            <span className="block font-medium text-stone-800">Sound cue</span>
            {soundLabel}
          </p>
        </div>

        <p className="mt-6 text-sm text-stone-500">Elapsed</p>
        <p className="mt-2 font-semibold text-5xl tabular-nums text-stone-950">
          {formatElapsed(snapshot.context.elapsedMs)}
        </p>
        <p className="mt-2 text-sm text-stone-500">Breath: {getBreathLabel(snapshot.value)}</p>
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {guidancePrompt}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {isIdle ? (
            <button
              className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2 font-medium text-sm text-white"
              onClick={startMeditation}
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
