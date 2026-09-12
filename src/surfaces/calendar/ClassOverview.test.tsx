import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../../domain/seed';
import { useWorkspaceStore } from '../../state/store';
import { ClassOverview } from './ClassOverview';
import { WeekView } from './WeekView';

describe('class overview', () => {
  afterEach(() => {
    cleanup();
    useWorkspaceStore.setState({ domain: createInitialState(), ui: { ...useWorkspaceStore.getState().ui, overviewSectionId: null } });
  });

  it('opens from the week row label and stores a day check on that section', async () => {
    const domain = createInitialState();
    const section = Object.values(domain.sections)[0]!;
    useWorkspaceStore.setState({
      domain,
      ui: { ...useWorkspaceStore.getState().ui, view: 'week', anchorDate: '2026-09-10', overviewSectionId: null },
    });
    const user = userEvent.setup();
    render(
      <>
        <WeekView onEdit={() => undefined} onCreate={() => undefined} />
        <ClassOverview />
      </>,
    );
    await user.click(screen.getByRole('button', { name: /Open class overview for AP Biology, Period 2/i }));
    expect(useWorkspaceStore.getState().ui.overviewSectionId).toBe(section.id);
    const overview = screen.getByRole('complementary', { name: 'Class overview' });
    expect(overview).toBeTruthy();
    expect(overview.textContent).toContain('Membrane transport lab');
    await user.click(screen.getByRole('checkbox', { name: /Practice complete/i }));
    expect(useWorkspaceStore.getState().domain.sections[section.id]?.dayMarks['2026-09-10']?.complete).toBe(true);
  });
});
