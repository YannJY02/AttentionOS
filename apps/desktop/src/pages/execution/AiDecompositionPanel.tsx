import type { TaskDecompositionSuggestion } from '@attentionos/core';
import type { V2Entity } from '@attentionos/workflow';
import { Bot, CheckCircle2, RotateCcw, ShieldCheck, WandSparkles, X } from 'lucide-react';
import { useState } from 'react';
import { createLocalTaskDecompositionSuggestion } from '../../ai/taskDecomposition';
import {
  approveTaskDecompositionSuggestion,
  getTaskDecompositionRollbackState,
  rejectTaskDecompositionSuggestion,
  restoreTaskDecompositionRollback,
  rollbackTaskDecompositionSuggestion,
  validateTaskDecompositionSuggestion,
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
  const [clarificationText, setClarificationText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('Answer the clarification prompt before drafting a split.');

  async function generateSuggestion() {
    const trimmedClarification = clarificationText.trim();
    if (!trimmedClarification) {
      setStatus('Clarification is required before AI can draft a split.');
      return;
    }

    setIsGenerating(true);
    try {
      const nextSuggestion = await createLocalTaskDecompositionSuggestion(
        task,
        readHierarchyEntities(),
        trimmedClarification,
      );
      setSuggestion(saveTaskDecompositionSuggestion(nextSuggestion));
      setCreatedTaskCount(0);
      setStatus('Draft split is pending your review.');
    } finally {
      setIsGenerating(false);
    }
  }

  function approveSuggestion() {
    if (!suggestion || suggestion.status !== 'pending') {
      return;
    }

    try {
      const result = approveTaskDecompositionSuggestion({ suggestion, task });
      setSuggestion(result.appliedSuggestion);
      setCreatedTaskCount(result.createdTasks.length);
      setStatus(`Created ${result.createdTasks.length} reviewed tasks.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to approve suggestion.');
    }
  }

  function rejectSuggestion() {
    if (!suggestion || suggestion.status !== 'pending') {
      return;
    }

    const result = rejectTaskDecompositionSuggestion({ suggestion, task });
    setSuggestion(result.rejectedSuggestion);
    setCreatedTaskCount(0);
    setStatus('Suggestion rejected without creating tasks.');
  }

  function rollbackSuggestion() {
    if (!suggestion || suggestion.status !== 'applied') {
      return;
    }

    try {
      const result = rollbackTaskDecompositionSuggestion({ suggestion, task });
      setCreatedTaskCount(0);
      setStatus(
        `Archived ${result.archivedTasks.length} AI-created tasks. Rollback audit recorded.`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to rollback suggestion.');
    }
  }

  function restoreRollback() {
    if (!suggestion || suggestion.status !== 'applied') {
      return;
    }

    try {
      const result = restoreTaskDecompositionRollback({ suggestion, task });
      setCreatedTaskCount(result.restoredTasks.length);
      setStatus(
        `Restored ${result.restoredTasks.length} AI-created tasks. Restore audit recorded.`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to restore rolled back tasks.');
    }
  }

  const validationErrors = suggestion ? validateTaskDecompositionSuggestion(suggestion) : [];
  const rollbackState = suggestion ? getTaskDecompositionRollbackState(suggestion, task) : null;

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
          <label
            className="mt-4 block font-medium text-sm text-stone-800"
            htmlFor={`ai-split-clarification-${task.id}`}
          >
            Clarification for AI split
            <textarea
              className="mt-2 min-h-20 w-full resize-y rounded-md border border-stone-300 bg-white p-3 font-normal text-sm text-stone-900 outline-none focus:border-sky-700"
              id={`ai-split-clarification-${task.id}`}
              onChange={(event) => setClarificationText(event.target.value)}
              value={clarificationText}
            />
          </label>
          <p className="mt-2 text-sm text-stone-600" role="status">
            {status}
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
          disabled={isGenerating || !clarificationText.trim()}
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
          {validationErrors.length > 0 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm">
              {validationErrors[0]}
            </div>
          ) : null}
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
              disabled={suggestion.status !== 'pending' || validationErrors.length > 0}
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

            {suggestion.status === 'applied' && !rollbackState?.rolledBack ? (
              <button
                className={`${buttonClass} border border-amber-300 text-amber-900 disabled:cursor-not-allowed disabled:opacity-40`}
                onClick={rollbackSuggestion}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={16} />
                Undo AI-created tasks
              </button>
            ) : null}

            {suggestion.status === 'applied' && rollbackState?.rolledBack ? (
              <button
                className={`${buttonClass} border border-sky-300 text-sky-900 disabled:cursor-not-allowed disabled:opacity-40`}
                onClick={restoreRollback}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={16} />
                Restore AI-created tasks
              </button>
            ) : null}

            {createdTaskCount > 0 ? (
              <p className="text-sm text-stone-600">Created {createdTaskCount} tasks</p>
            ) : null}
          </div>

          {rollbackState?.rolledBack ? (
            <p className="text-sm text-stone-600">
              AI-created tasks from this suggestion are archived with audit history preserved.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
