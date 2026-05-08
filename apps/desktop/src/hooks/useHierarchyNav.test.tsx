import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HIERARCHY_STORAGE_KEY } from '../storage/hierarchy';
import { useHierarchyNav } from './useHierarchyNav';

function HierarchyHarness() {
  const nav = useHierarchyNav();

  return (
    <section>
      <h1>{nav.currentLayer}</h1>
      <p>Breadcrumb: {nav.breadcrumb.map((entity) => entity.title).join(' / ')}</p>
      <button disabled={!nav.canDrillUp} onClick={nav.drillUp} type="button">
        Back
      </button>
      <ul>
        {nav.entities.map((entity) => (
          <li key={entity.id}>
            <button onClick={() => nav.drillDown(entity)} type="button">
              Open {entity.title}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

describe('useHierarchyNav', () => {
  it('starts at the vision layer and loads root entities', () => {
    localStorage.removeItem(HIERARCHY_STORAGE_KEY);

    render(<HierarchyHarness />);

    expect(screen.getByRole('heading', { name: 'vision' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open personal context os/i })).toBeInTheDocument();
  });

  it('drills down and up through the hierarchy state machine', () => {
    localStorage.removeItem(HIERARCHY_STORAGE_KEY);

    render(<HierarchyHarness />);

    fireEvent.click(screen.getByRole('button', { name: /open personal context os/i }));
    expect(screen.getByRole('heading', { name: 'area' })).toBeInTheDocument();
    expect(screen.getByText(/breadcrumb: personal context os/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open product development/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('heading', { name: 'vision' })).toBeInTheDocument();
  });
});
