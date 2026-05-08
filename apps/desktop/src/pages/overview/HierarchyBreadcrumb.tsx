import type { V2Entity } from '@attentionos/core';
import { ChevronRight } from 'lucide-react';

interface HierarchyBreadcrumbProps {
  readonly entities: readonly V2Entity[];
}

export function HierarchyBreadcrumb({ entities }: HierarchyBreadcrumbProps) {
  return (
    <nav aria-label="Hierarchy breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-stone-500">Root</span>
      {entities.map((entity) => (
        <span className="inline-flex items-center gap-2" key={entity.id}>
          <ChevronRight aria-hidden="true" className="text-stone-400" size={14} />
          <span className="font-medium text-stone-800">{entity.title}</span>
        </span>
      ))}
    </nav>
  );
}
