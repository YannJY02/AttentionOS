import type { TaskDecompositionSuggestion, V2Entity } from '@attentionos/core';
import { Bot, CheckCircle2, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { createLocalTaskDecompositionSuggestion } from '../../ai/taskDecomposition';
import { approveTaskDecompositionSuggestion } from '../../ai/taskDecompositionWorkflow';
import {
  findTaskDecompositionSuggestion,
  saveTaskDecompositionSuggestion,
} from '../../storage/aiSuggestions';
import { readHierarchyEntities } from '../../storage/hierarchy';

interface AiDecompositionPanelProps {
  readonly task: V2Entity;
}

const buttonClass = 'inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium text-sm';

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

  return (
    <div className="rounded-md border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 font-medium text-stone-950">
            <Bot aria-hidden="true" size={18} />
            AI task decomposition
          </p>
          {suggestion ? (
            <p className="mt-2 font-medium text-sky-700 text-sm">{suggestion.status}</p>
          ) : null}
        </div>

        <button
          className={`${buttonClass} border border-stone-300 text-stone-800 disabled:cursor-not-allowed disabled:opacity-40`}
          disabled={isGenerating}
          onClick={generateSuggestion}
          type="button"
        >
          <WandSparkles aria-hidden="true" size={16} />
          {suggestion ? 'Regenerate' : 'AI decompose task'}
        </button>
      </div>

      {suggestion ? (
        <div className="mt-4 grid gap-4">
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

            {createdTaskCount > 0 ? (
              <p className="text-sm text-stone-600">Created {createdTaskCount} tasks</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
