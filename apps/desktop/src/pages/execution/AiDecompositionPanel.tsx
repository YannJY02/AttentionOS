import type { TaskDecompositionSuggestion, V2Entity } from '@attentionos/core';
import { Bot, CheckCircle2, ShieldCheck, WandSparkles, X } from 'lucide-react';
import { useState } from 'react';
import { createLocalTaskDecompositionSuggestion } from '../../ai/taskDecomposition';
import {
  approveTaskDecompositionSuggestion,
  rejectTaskDecompositionSuggestion,
} from '../../ai/taskDecompositionWorkflow';
import {
  findTaskDecompositionSuggestion,
  saveTaskDecompositionSuggestion,
} from '../../storage/aiSuggestions';
import { readHierarchyEntities } from '../../storage/hierarchy';

interface AiDecompositionPanelProps {
  readonly task: V2Entity;
}

const buttonClass = 'inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium text-sm';

const statusCopy = {
  applied: 'Applied by you',
  approved: 'Approved by you',
  pending: 'Pending your review',
  rejected: 'Rejected by you',
} as const;

export function AiDecompositionPanel({ task }: AiDecompositionPanelProps) {
  const [suggestion, setSuggestion] = useState<TaskDecompositionSuggestion | null>(() =>
    findTaskDecompositionSuggestion(task.id),
  );
  const [createdTaskCount, setCreatedTaskCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  async function generateSuggestion() {
    setIsGenerating(true);
    try {
      const nextSuggestion = await createLocalTaskDecompositionSuggestion(
        task,
        readHierarchyEntities(),
      );
      setSuggestion(saveTaskDecompositionSuggestion(nextSuggestion));
      setCreatedTaskCount(0);
    } finally {
      setIsGenerating(false);
    }
  }

  function approveSuggestion() {
    if (!suggestion || suggestion.status !== 'pending') {
      return;
    }

    const result = approveTaskDecompositionSuggestion({ suggestion, task });
    setSuggestion(result.appliedSuggestion);
    setCreatedTaskCount(result.createdTasks.length);
  }

  function rejectSuggestion() {
    if (!suggestion || suggestion.status !== 'pending') {
      return;
    }

    const result = rejectTaskDecompositionSuggestion({ suggestion, task });
    setSuggestion(result.rejectedSuggestion);
    setCreatedTaskCount(0);
  }

  return (
    <section
      aria-label="Task suggestion review"
      className="rounded-md border border-stone-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 font-medium text-sm text-sky-700">
            <Bot aria-hidden="true" size={18} />
            Planning helper lane
          </p>
          <h3 className="mt-2 font-semibold text-xl text-stone-950">Task decomposition review</h3>
          <p className="mt-2 text-sm text-stone-600">
            Generate a draft split for this task. Nothing is added to Overview until you approve it.
          </p>
          {suggestion ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-sm bg-stone-100 px-2 py-1 font-medium text-sm text-stone-700">
              <ShieldCheck aria-hidden="true" size={15} />
              {statusCopy[suggestion.status]}
            </p>
          ) : null}
        </div>

        <button
          className={`${buttonClass} border border-stone-300 text-stone-800 disabled:cursor-not-allowed disabled:opacity-40`}
          disabled={isGenerating}
          onClick={generateSuggestion}
          type="button"
        >
          <WandSparkles aria-hidden="true" size={16} />
          {suggestion ? 'Regenerate draft' : 'Draft task split'}
        </button>
      </div>

      {suggestion ? (
        <div className="mt-4 grid gap-4">
          <p className="text-sm text-stone-600">{suggestion.rationale}</p>
          <ol className="grid gap-2">
            {suggestion.payload.steps.map((step) => (
              <li className="rounded-md bg-stone-50 p-3 text-sm text-stone-800" key={step.title}>
                <span className="font-medium">{step.title}</span>
                {step.estimatedMinutes ? (
                  <span className="ml-2 text-stone-500">{step.estimatedMinutes} min</span>
                ) : null}
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className={`${buttonClass} bg-emerald-700 text-white disabled:cursor-not-allowed disabled:opacity-40`}
              disabled={suggestion.status !== 'pending'}
              onClick={approveSuggestion}
              type="button"
            >
              <CheckCircle2 aria-hidden="true" size={16} />
              Approve suggestion
            </button>

            <button
              className={`${buttonClass} border border-stone-300 text-stone-800 disabled:cursor-not-allowed disabled:opacity-40`}
              disabled={suggestion.status !== 'pending'}
              onClick={rejectSuggestion}
              type="button"
            >
              <X aria-hidden="true" size={16} />
              Reject suggestion
            </button>

            {createdTaskCount > 0 ? (
              <p className="text-sm text-stone-600">Created {createdTaskCount} tasks</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
