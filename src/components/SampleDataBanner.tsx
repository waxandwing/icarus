import { useWorkspaceStore } from '../state/store';
import styles from './SampleDataBanner.module.css';

/**
 * Arc must never present generated content as if it were the teacher's real
 * plan (Canonical Product Spec \u00a72: "Never show demo data inside a real
 * teacher workspace"). This banner keeps the distinction explicit until the
 * teacher clears the example plan or chooses to keep browsing it.
 */
export function SampleDataBanner() {
  const isSample = useWorkspaceStore((s) => s.domain.isSampleWorkspace);
  const dismissed = useWorkspaceStore((s) => s.domain.settings.sampleBannerDismissed);
  const clearSampleData = useWorkspaceStore((s) => s.clearSampleData);
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);

  if (!isSample || dismissed) return null;

  return (
    <div className={styles.banner} role="status">
      <span>This is an example plan so you can explore Arc \u2014 it isn&apos;t your real schedule.</span>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          data-tone="primary"
          onClick={() => {
            if (confirm('Clear the example plan and start with a blank workspace?')) clearSampleData();
          }}
        >
          Clear sample data
        </button>
        <button type="button" className={styles.button} onClick={() => updateSettings({ sampleBannerDismissed: true })}>
          Keep exploring
        </button>
      </div>
    </div>
  );
}
