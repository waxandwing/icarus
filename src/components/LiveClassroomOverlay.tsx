import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../state/store';
import styles from './LiveClassroomOverlay.module.css';

function LiveClassroomContent({ sectionId, lessonId }: { sectionId: string; lessonId: string }) {
  const domain = useWorkspaceStore((s) => s.domain);
  const setDelivery = useWorkspaceStore((s) => s.setDelivery);
  const closeLiveClassroom = useWorkspaceStore((s) => s.closeLiveClassroom);
  const [showResumeField, setShowResumeField] = useState(false);
  const [resumeNote, setResumeNote] = useState('');

  const lesson = domain.lessons[lessonId];
  const section = domain.sections[sectionId];
  if (!lesson) return null;

  const currentState = domain.delivery[sectionId]?.[lessonId]?.state ?? 'not-started';
  const alreadyFinal = currentState === 'completed' || currentState === 'skipped';
  const midDot = '\u00b7';
  const emDash = '\u2014';

  function outcome(state: 'completed' | 'skipped') {
    const result = setDelivery(sectionId, lessonId, state);
    if (result.ok) closeLiveClassroom();
  }

  function confirmStop() {
    const result = setDelivery(sectionId, lessonId, 'in-progress', resumeNote);
    if (result.ok) closeLiveClassroom();
  }

  if (alreadyFinal) {
    return (
      <div className={styles.sheet} role="region" aria-label="Live Classroom">
        <span className={styles.eyebrow}>
          Live Classroom {midDot} {section?.name}
        </span>
        <h2 className={styles.title}>{lesson.title}</h2>
        <p className={styles.body}>
          This lesson already has a final outcome ({currentState}) and can&apos;t be relaunched.
        </p>
        <button type="button" className={styles.leaveButton} onClick={closeLiveClassroom}>
          Back to Day
        </button>
      </div>
    );
  }

  return (
    <div className={styles.sheet} role="region" aria-label="Live Classroom">
      <span className={styles.eyebrow}>
        Live Classroom {midDot} {section?.name}
      </span>
      <h2 className={styles.title}>{lesson.title}</h2>
      {lesson.body && <p className={styles.body}>{lesson.body}</p>}

      {showResumeField ? (
        <div className={styles.resume}>
          <label htmlFor="resume-note">Resume note {emDash} where should you pick back up?</label>
          <textarea
            id="resume-note"
            autoFocus
            value={resumeNote}
            onChange={(e) => setResumeNote(e.target.value)}
          />
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionButton}
              data-tone="primary"
              onClick={confirmStop}
              disabled={!resumeNote.trim()}
            >
              Save and stop here
            </button>
            <button type="button" className={styles.actionButton} onClick={() => setShowResumeField(false)}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.actions}>
          <button type="button" className={styles.actionButton} data-tone="primary" onClick={() => outcome('completed')}>
            Complete
          </button>
          <button type="button" className={styles.actionButton} onClick={() => setShowResumeField(true)}>
            Stop here
          </button>
          {currentState === 'not-started' && (
            <button type="button" className={styles.actionButton} onClick={() => outcome('skipped')}>
              Skip
            </button>
          )}
        </div>
      )}

      <button type="button" className={styles.leaveButton} onClick={closeLiveClassroom}>
        Leave without recording an outcome
      </button>
    </div>
  );
}

export function LiveClassroomOverlay() {
  const live = useWorkspaceStore((s) => s.ui.liveClassroom);
  const closeLiveClassroom = useWorkspaceStore((s) => s.closeLiveClassroom);

  useEffect(() => {
    if (!live.open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLiveClassroom();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [live.open, closeLiveClassroom]);

  if (!live.open || !live.sectionId || !live.lessonId) return null;

  return <LiveClassroomContent key={`${live.sectionId}-${live.lessonId}`} sectionId={live.sectionId} lessonId={live.lessonId} />;
}
