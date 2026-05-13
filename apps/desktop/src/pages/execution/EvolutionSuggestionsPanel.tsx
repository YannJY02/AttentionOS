import type { WorkflowOptimizationSuggestion } from '@attentionos/core';
import { Check, Lightbulb, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import {
  findWorkflowOptimizationSuggestions,
  markWorkflowOptimizationReviewed,
} from '../../storage/aiSuggestions';
import { logWorkflowOptimizationReviewed } from '../../storage/audit';
import { generateWorkflowOptimizationSuggestion } from '../../storage/learning';

export function EvolutionSuggestionsPanel() {
  const [suggestion, setSuggestion] = useState<WorkflowOptimizationSuggestion | null>(
    () => findWorkflowOptimizationSuggestions('execution')[0] ?? null,
  );

  function analyzeWorkflow() {
    setSuggestion(generateWorkflowOptimizationSuggestion());
  }

  function review(status: 'approved' | 'rejected') {
    if (!suggestion || suggestion.status !== 'pending') return;

    const reviewed = markWorkflowOptimizationReviewed(suggestion, status);
    logWorkflowOptimizationReviewed({
      actionCount: reviewed.payload.actions.length,
      status,
      suggestionId: reviewed.id,
    });
    setSuggestion(reviewed);
  }

  return (
    <section
      aria-label="Workflow suggestion review"
      className="rounded-md border border-stone-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 font-medium text-sm text-emerald-700">
            <Lightbulb aria-hidden="true" size={16} />
            Workflow review lane
          </p>
          <h3 className="mt-2 font-semibold text-xl text-stone-950">
            Workflow optimization review
          </h3>
          {suggestion ? (
            <p className="mt-2 font-medium text-sm text-stone-950">{suggestion.title}</p>
          ) : (
            <p className="mt-2 text-sm text-stone-600">No workflow optimization queued.</p>
          )}
          <p className="mt-2 text-sm text-stone-600">
            Review a planning suggestion. Marking it reviewed records your decision; it does not
            change the workflow automatically.
          </p>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800"
          onClick={analyzeWorkflow}
          type="button"
        >
          <Lightbulb aria-hidden="true" size={16} />
          Review workflow pattern
        </button>
      </div>

      {suggestion ? (
        <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-4">
          <p className="inline-flex items-center gap-2 font-medium text-emerald-900 text-sm">
            <ShieldCheck aria-hidden="true" size={15} />
            {suggestion.status === 'pending'
              ? 'Pending your review'
              : `Marked ${suggestion.status} by you`}
          </p>
          <p className="mt-2 text-sm text-stone-700">{suggestion.rationale}</p>
          <ul className="mt-3 grid gap-2">
            {suggestion.payload.actions.map((action) => (
              <li className="text-sm text-stone-700" key={`${suggestion.id}-${action.type}`}>
                {action.label}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 font-medium text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={suggestion.status !== 'pending'}
              onClick={() => review('approved')}
              type="button"
            >
              <Check aria-hidden="true" size={16} />
              Mark reviewed as useful
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={suggestion.status !== 'pending'}
              onClick={() => review('rejected')}
              type="button"
            >
              <X aria-hidden="true" size={16} />
              Mark reviewed as not useful
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
