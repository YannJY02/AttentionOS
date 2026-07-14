import { ArrowRight, Focus, ListTree, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { completeOnboarding } from '../adapters/storage/onboarding';

interface OnboardingPageProps {
  readonly onComplete: () => void;
}

const workflowSteps = [
  {
    icon: Sparkles,
    label: 'Ritual',
    text: 'Begin with intention, meditation, reflection, and dedication before work starts.',
  },
  {
    icon: ListTree,
    label: 'Overview',
    text: 'Read the current vision, layer, risk, trend, and context without editing or approving AI.',
  },
  {
    icon: Focus,
    label: 'Execution',
    text: 'Plan with review, then protect one focus action until it is completed or intentionally exited.',
  },
] as const;

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const navigate = useNavigate();
  const [localDataAcknowledged, setLocalDataAcknowledged] = useState(false);
  const [nonMedicalAcknowledged, setNonMedicalAcknowledged] = useState(false);

  const canContinue = localDataAcknowledged && nonMedicalAcknowledged;

  function finishOnboarding() {
    if (!canContinue) {
      return;
    }

    completeOnboarding();
    onComplete();
    navigate('/ritual', { replace: true });
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-stone-950 sm:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="font-medium text-emerald-700 text-sm">First run</p>
          <h1 className="mt-3 font-semibold text-4xl tracking-normal sm:text-5xl">
            Set up AttentionOS around the workflow it protects.
          </h1>
          <p className="mt-4 text-lg text-stone-600 leading-8">
            AttentionOS is a personal attention system: it helps you move from intention to overview
            to one protected action without turning the product into a chat inbox, dashboard, or
            generic task list.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {workflowSteps.map((step) => {
            const Icon = step.icon;

            return (
              <section className="rounded-md border border-stone-200 bg-white p-5" key={step.label}>
                <Icon aria-hidden="true" className="h-5 w-5 text-emerald-700" />
                <h2 className="mt-4 font-semibold text-xl">{step.label}</h2>
                <p className="mt-2 text-sm text-stone-600 leading-6">{step.text}</p>
              </section>
            );
          })}
        </div>

        <section className="mt-8 rounded-md border border-stone-200 bg-white p-5">
          <p className="inline-flex items-center gap-2 font-medium text-emerald-700 text-sm">
            <ShieldCheck aria-hidden="true" size={16} />
            Local-first and non-medical boundary
          </p>

          <div className="mt-5 grid gap-4">
            <label className="flex items-start gap-3 rounded-md border border-stone-200 p-4 text-sm text-stone-700">
              <input
                checked={localDataAcknowledged}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-700"
                onChange={(event) => setLocalDataAcknowledged(event.target.checked)}
                type="checkbox"
              />
              <span>
                <span className="block font-medium text-stone-900">
                  I understand my AttentionOS workspace starts local to this Mac.
                </span>
                <span className="mt-1 block text-stone-600">
                  Backups and exports are user-controlled files. External AI calls, telemetry, and
                  cloud sync stay off unless a future setup explicitly enables them.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-stone-200 p-4 text-sm text-stone-700">
              <input
                checked={nonMedicalAcknowledged}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-700"
                onChange={(event) => setNonMedicalAcknowledged(event.target.checked)}
                type="checkbox"
              />
              <span>
                <span className="block font-medium text-stone-900">
                  I understand AttentionOS is not medical advice or clinical diagnosis.
                </span>
                <span className="mt-1 block text-stone-600">
                  The app can help structure attention, reflection, and work recovery, but it does
                  not diagnose or treat ADHD, anxiety, depression, or any health condition.
                </span>
              </span>
            </label>
          </div>

          <button
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2 font-medium text-sm text-white disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={!canContinue}
            onClick={finishOnboarding}
            type="button"
          >
            Begin with Ritual
            <ArrowRight aria-hidden="true" size={16} />
          </button>
        </section>
      </section>
    </main>
  );
}
