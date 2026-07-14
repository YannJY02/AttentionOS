import {
  type RitualFollowUpTarget,
  saveDedicationInput,
  saveReflection,
} from '../adapters/storage/reflections';
import {
  formatRitualScheduleSummary,
  getRitualGuidanceLabel,
  getRitualGuidancePrompt,
  getRitualSoundLabel,
  readRitualSettings,
} from '../adapters/storage/ritualCopy';
import { useDailyFlow } from '../hooks/useDailyFlow';
import { DedicationStep } from './ritual/DedicationStep';
import { MeditationStep } from './ritual/MeditationStep';
import { ReflectionStep } from './ritual/ReflectionStep';

export function RitualPage() {
  const dailyFlow = useDailyFlow();
  const ritualSettings = readRitualSettings();

  function completeMeditation() {
    dailyFlow.send({ type: 'MEDITATION_COMPLETE' });
  }

  function saveReflectionText(text: string, followUpTargets: readonly RitualFollowUpTarget[]) {
    const reflection = saveReflection(text, { followUpTargets });
    dailyFlow.send({ type: 'REFLECTION_SAVED', text: reflection.content ?? text });
  }

  function completeRitual(followUpTargets: readonly RitualFollowUpTarget[]) {
    if (followUpTargets.length > 0) {
      saveDedicationInput(ritualSettings.dedicationText, { followUpTargets });
    }
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
        <p className="mt-4 inline-flex rounded-md bg-amber-50 px-3 py-2 text-amber-900 text-sm">
          {formatRitualScheduleSummary(ritualSettings.schedule)}
        </p>
      </div>

      {dailyFlow.ritualStep === 'meditation' ? (
        <MeditationStep
          durationMinutes={ritualSettings.meditation.durationMinutes}
          guidanceLabel={getRitualGuidanceLabel(ritualSettings.meditation.guidanceMode)}
          guidancePrompt={getRitualGuidancePrompt(ritualSettings.meditation.guidanceMode)}
          intentionText={ritualSettings.intentionText}
          onComplete={completeMeditation}
          soundLabel={getRitualSoundLabel(ritualSettings.meditation.soundMode)}
          soundMode={ritualSettings.meditation.soundMode}
        />
      ) : null}

      {dailyFlow.ritualStep === 'reflection' ? (
        <ReflectionStep onSave={saveReflectionText} />
      ) : null}

      {dailyFlow.ritualStep === 'dedication' ? (
        <DedicationStep
          dedicationText={ritualSettings.dedicationText}
          onComplete={completeRitual}
          reflectionText={dailyFlow.snapshot.context.reflectionText}
        />
      ) : null}
    </section>
  );
}
