import { useEffect, useMemo, useState } from 'react';
import { getArcAccessToken } from '../auth/arcAuth';
import { liveSessionTransport, type LiveSession, type PassEvent, type RoomMode, type RoomProjection, type RosterStudent } from '../teaching/liveSessionTransport';
import { useWorkspaceStore } from '../state/store';
import styles from './LiveClassroomOverlay.module.css';

function initialProjection(title: string, body: string): RoomProjection {
  return {
    stepIndex: 0,
    releasedStepIndex: 0,
    steps: [{ title, body }],
    roomMode: 'live',
    clockVisible: true,
    timer: { active: false, kind: 'normal', endsAt: null, label: 'Timer' },
    pass: { active: false, publicLabel: 'AVAILABLE', startedAt: null },
    layout: { pass: 'bottom-left', clock: 'top-right', progress: 'top' },
  };
}

function LiveClassroomContent({ sectionId, lessonId }: { sectionId: string; lessonId: string }) {
  const domain = useWorkspaceStore((s) => s.domain);
  const setDelivery = useWorkspaceStore((s) => s.setDelivery);
  const closeLiveClassroom = useWorkspaceStore((s) => s.closeLiveClassroom);
  const lesson = domain.lessons[lessonId];
  const section = domain.sections[sectionId];

  const [session, setSession] = useState<LiveSession | null>(null);
  const [projection, setProjection] = useState<RoomProjection | null>(null);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [passes, setPasses] = useState<PassEvent[]>([]);
  const [quickNote, setQuickNote] = useState('');
  const [status, setStatus] = useState('Starting classroom…');
  const [error, setError] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [showEnd, setShowEnd] = useState(false);
  const [showRoster, setShowRoster] = useState(false);

  const roomUrl = useMemo(() => `${window.location.origin}/teaching-room.html`, []);
  const currentState = domain.delivery[sectionId]?.[lessonId]?.state ?? 'not-started';
  const alreadyFinal = currentState === 'completed' || currentState === 'skipped';

  useEffect(() => {
    if (!lesson || alreadyFinal) return;
    let cancelled = false;
    async function boot() {
      try {
        const accessToken = await getArcAccessToken();
        if (!accessToken) throw new Error('Sign in to Arc before starting Table.');
        const roomProjection = initialProjection(lesson.title, lesson.body || '');
        const result = await liveSessionTransport.start({
          accessToken,
          sectionId,
          lessonTitle: lesson.title,
          teacherState: { sectionId, lessonId, quickNote: '', passStudentId: null, passStudentName: null },
          roomProjection,
        });
        if (cancelled) return;
        setSession(result.session);
        setProjection(result.session.room_projection);
        setStatus('Room ready');
        try {
          const [{ roster: loadedRoster }, activePasses] = await Promise.all([
            liveSessionTransport.roster({ accessToken, sectionId }),
            liveSessionTransport.activePasses({ accessToken, sectionId }),
          ]);
          if (!cancelled) { setRoster(loadedRoster); setPasses(activePasses); }
        } catch { /* roster is useful, never allowed to block teaching */ }
      } catch (e) {
        if (!cancelled) { setError(e instanceof Error ? e.message : 'Could not start Table.'); setStatus('Not connected'); }
      }
    }
    void boot();
    return () => { cancelled = true; };
  }, [alreadyFinal, lesson, lessonId, sectionId]);

  async function push(next: RoomProjection, note = quickNote) {
    if (!session) return;
    setProjection(next);
    try {
      const accessToken = await getArcAccessToken();
      if (!accessToken) throw new Error('Arc session expired.');
      const updated = await liveSessionTransport.update({
        accessToken,
        sessionId: session.id,
        teacherState: { sectionId, lessonId, quickNote: note, passStudentId: null, passStudentName: null },
        roomProjection: next,
      });
      setSession(updated);
      setStatus('Display synced');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Display update failed.');
      setStatus('Reconnecting');
    }
  }

  function setMode(roomMode: RoomMode) {
    if (!projection) return;
    void push({ ...projection, roomMode });
  }

  function startTimer(kind: 'normal' | 'cleanup' = 'normal') {
    if (!projection) return;
    const minutes = kind === 'cleanup' ? 5 : Math.max(1, Math.min(99, timerMinutes));
    void push({ ...projection, timer: { active: true, kind, endsAt: new Date(Date.now() + minutes * 60000).toISOString(), label: kind === 'cleanup' ? 'Cleanup' : 'Timer' } });
  }

  function stopTimer() {
    if (!projection) return;
    void push({ ...projection, timer: { ...projection.timer, active: false, endsAt: null } });
  }

  async function sendStudent(student: RosterStudent) {
    if (!session || !projection) return;
    try {
      const accessToken = await getArcAccessToken();
      if (!accessToken) throw new Error('Arc session expired.');
      const pass = await liveSessionTransport.startPass({ accessToken, sessionId: session.id, studentId: student.studentId });
      setPasses((p) => [...p, pass]);
      await push({ ...projection, pass: { active: true, publicLabel: 'PASS OUT', startedAt: pass.departed_at } });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not start pass.'); }
  }

  async function returnPass(pass: PassEvent) {
    if (!projection) return;
    try {
      const accessToken = await getArcAccessToken();
      if (!accessToken) throw new Error('Arc session expired.');
      await liveSessionTransport.returnPass({ accessToken, passId: pass.id });
      const remaining = passes.filter((p) => p.id !== pass.id);
      setPasses(remaining);
      await push({ ...projection, pass: { active: remaining.length > 0, publicLabel: remaining.length > 0 ? 'PASS OUT' : 'AVAILABLE', startedAt: remaining[0]?.departed_at || null } });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not return pass.'); }
  }

  async function endClass(outcome: 'completed' | 'in-progress') {
    try {
      if (session) {
        const accessToken = await getArcAccessToken();
        if (accessToken) await liveSessionTransport.end(accessToken, session.id);
      }
      const result = setDelivery(sectionId, lessonId, outcome, outcome === 'in-progress' ? quickNote : undefined);
      if (result.ok) closeLiveClassroom();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not end class.'); }
  }

  if (!lesson) return null;
  if (alreadyFinal) {
    return <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Table"><main className={styles.blocked}><p className={styles.kicker}>ARC · TABLE</p><h2>{lesson.title}</h2><p>This lesson already has a final outcome ({currentState}) and can’t be relaunched.</p><button onClick={closeLiveClassroom}>Back to Day</button></main></div>;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Arc Table teacher controller">
      <header className={styles.topbar}>
        <div><p className={styles.kicker}>ARC · TABLE</p><h1>{lesson.title}</h1><p className={styles.context}>{section?.name || 'Class'} · Teacher controller</p></div>
        <div className={styles.roomBlock}><span>{status}</span><strong>{session?.room_code || '••••'}</strong><button type="button" onClick={() => window.open(roomUrl, '_blank', 'noopener,noreferrer')}>Open student display</button></div>
      </header>

      <main className={styles.workspace}>
        <section className={styles.lessonStage} aria-label="Lesson currently released">
          <p className={styles.label}>RELEASED NOW</p>
          <h2>{lesson.title}</h2>
          {lesson.body && <p className={styles.lessonBody}>{lesson.body}</p>}
          <div className={styles.primaryControls}>
            <button className={styles.release} onClick={() => setMode('live')}>Release</button>
            <button onClick={() => setMode('held')}>Hold</button>
            <button onClick={() => setMode('paused')}>Pause</button>
            <button className={styles.blank} onClick={() => setMode('blank')}>Blank</button>
          </div>
        </section>

        <aside className={styles.tools} aria-label="Classroom tools">
          <section className={styles.toolSection}>
            <div className={styles.toolHeading}><span>Timer</span><button onClick={stopTimer} disabled={!projection?.timer.active}>Clear</button></div>
            <div className={styles.timerRow}><input aria-label="Timer minutes" type="number" min="1" max="99" value={timerMinutes} onChange={(e) => setTimerMinutes(Number(e.target.value))}/><button onClick={() => startTimer('normal')}>Start</button><button onClick={() => startTimer('cleanup')}>5 min cleanup</button></div>
          </section>

          <section className={styles.toolSection}>
            <div className={styles.toolHeading}><span>Pass</span><button onClick={() => setShowRoster((v) => !v)}>{showRoster ? 'Close' : 'Choose student'}</button></div>
            {passes.length > 0 ? passes.map((pass) => {
              const student = roster.find((s) => s.studentId === pass.student_id);
              return <button className={styles.activePass} key={pass.id} onClick={() => void returnPass(pass)}>{student?.preferredName || student?.firstName || 'Student'} is out · tap to return</button>;
            }) : <p className={styles.muted}>Pass available</p>}
            {showRoster && <div className={styles.roster}>{roster.length ? roster.map((student) => <button key={student.studentId} onClick={() => void sendStudent(student)}>{student.preferredName || student.firstName} {student.lastName || ''}</button>) : <p className={styles.muted}>No roster linked to this section yet.</p>}</div>}
          </section>

          <section className={styles.toolSection}>
            <label htmlFor="quick-note">Teacher note</label>
            <textarea id="quick-note" value={quickNote} onChange={(e) => setQuickNote(e.target.value)} onBlur={() => projection && void push(projection, quickNote)} placeholder="Private. Never projected." />
          </section>
        </aside>
      </main>

      <footer className={styles.footer}>
        <div className={styles.displayState}>Student display: <strong>{projection?.roomMode || 'starting'}</strong>{error && <span role="alert"> · {error}</span>}</div>
        <button className={styles.endButton} onClick={() => setShowEnd(true)}>End class</button>
      </footer>

      {showEnd && <div className={styles.endSheet} role="alertdialog" aria-modal="true" aria-label="End class"><div><p className={styles.kicker}>END CLASS</p><h2>Where did you land?</h2><p>Record the outcome and return to Arc.</p><div className={styles.endActions}><button className={styles.release} onClick={() => void endClass('completed')}>Lesson complete</button><button onClick={() => void endClass('in-progress')}>Stop here</button><button onClick={() => setShowEnd(false)}>Keep teaching</button></div></div></div>}
    </div>
  );
}

export function LiveClassroomOverlay() {
  const live = useWorkspaceStore((s) => s.ui.liveClassroom);
  const closeLiveClassroom = useWorkspaceStore((s) => s.closeLiveClassroom);
  useEffect(() => {
    if (!live.open) return;
    function onKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') closeLiveClassroom(); }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [live.open, closeLiveClassroom]);
  if (!live.open || !live.sectionId || !live.lessonId) return null;
  return <LiveClassroomContent key={`${live.sectionId}-${live.lessonId}`} sectionId={live.sectionId} lessonId={live.lessonId} />;
}
