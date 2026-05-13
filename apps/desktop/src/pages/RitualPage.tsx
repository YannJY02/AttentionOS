import { useDailyFlow } from '../hooks/useDailyFlow';
import { saveReflection } from '../storage/reflections';
import { readRitualCopy } from '../storage/ritualCopy';
import { DedicationStep } from './ritual/DedicationStep';
import { MeditationStep } from './ritual/MeditationStep';
import { ReflectionStep } from './ritual/ReflectionStep';

export function RitualPage() {
  const dailyFlow = useDailyFlow();
  const ritualCopy = readRitualCopy();

  function completeMeditation() {
    dailyFlow.send({ type: 'MEDITATION_COMPLETE' });
  }

  function saveReflectionText(text: string) {
    const reflection = saveReflection(text);
    dailyFlow.send({ type: 'REFLECTION_SAVED', text: reflection.content ?? text });
  }

  function completeRitual() {
    dailyFlow.send({ type: 'RITUAL_COMPLETE' });
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="font-medium text-amber-700 text-sm">Stage 1</p>
        <h1 className="mt-2 font-semibold text-4xl text-stone-950">Ritual</h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600">
          Begin by settling attention, choosing an intention, reflecting briefly, and dedicating the
          work before the day moves into planning.
        </p>
      </div>

      {dailyFlow.ritualStep === 'meditation' ? (
        <MeditationStep intentionText={ritualCopy.intentionText} onComplete={completeMeditation} />
      ) : null}

      {dailyFlow.ritualStep === 'reflection' ? (
        <ReflectionStep onSave={saveReflectionText} />
      ) : null}

      {dailyFlow.ritualStep === 'dedication' ? (
        <DedicationStep
          dedicationText={ritualCopy.dedicationText}
          onComplete={completeRitual}
          reflectionText={dailyFlow.snapshot.context.reflectionText}
        />
      ) : null}
    </section>
  );
}
