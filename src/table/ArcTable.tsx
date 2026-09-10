import { useEffect, useMemo, useState } from 'react';
import { ArcMark } from '../assets/ArcMark';
import styles from './ArcTable.module.css';

type ToolPanel = 'tools' | 'people' | 'pass' | null;

const FLOW = [
  ['Warm Up', '5 min'],
  ['Demo', '15 min'],
  ['Studio Time', '25 min'],
  ['Critique', '10 min'],
  ['Cleanup', '5 min'],
] as const;

export function ArcTable() {
  const [panel, setPanel] = useState<ToolPanel>(null);
  const [studentView, setStudentView] = useState(false);
  const [seconds, setSeconds] = useState(24 * 60 + 58);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const time = useMemo(() => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainder = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  }, [seconds]);

  return (
    <main className={styles.page} data-mode={studentView ? 'student' : 'teacher'}>
      <div className={styles.paperTexture} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.brandLockup} aria-label="Arc Table">
          <ArcMark size={54} />
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.tableWord}>TABLE</span>
        </div>
        <div className={styles.context}>2D ART 1 <span>•</span> TUESDAY, SEPTEMBER 9</div>
      </header>

      {studentView ? (
        <StudentDisplay time={time} onExit={() => setStudentView(false)} />
      ) : (
        <section className={styles.teacherStage}>
          <FurnitureTab label="Tools" active={panel === 'tools'} onClick={() => setPanel(panel === 'tools' ? null : 'tools')} icon="+" />
          <FurnitureTab label="People" active={panel === 'people'} onClick={() => setPanel(panel === 'people' ? null : 'people')} icon="2" />
          <FurnitureTab label="Pass" active={panel === 'pass'} onClick={() => setPanel(panel === 'pass' ? null : 'pass')} icon="1" />

          <div className={styles.lessonSurface}>
            <div className={styles.arcCrop} aria-hidden="true" />
            <div className={styles.lessonHeader}>
              <span className={styles.eyebrow}>CURRENT</span>
              <h1>Studio Time</h1>
              <p>Creating personal collage compositions using magazine materials.</p>
            </div>

            <div className={styles.timerBlock}>
              <div className={styles.timer}>{time}</div>
              <button className={styles.pauseButton} onClick={() => setRunning((value) => !value)} aria-label={running ? 'Pause timer' : 'Start timer'}>
                {running ? 'Ⅱ' : '▶'}
              </button>
            </div>
            <div className={styles.progress} aria-label="Studio Time progress"><span /></div>

            <div className={styles.flow} aria-label="Today's flow">
              {FLOW.map(([label, duration], index) => (
                <div className={`${styles.flowItem} ${index === 2 ? styles.currentFlow : ''}`} key={label}>
                  <span className={styles.flowNumber}>{index + 1}</span>
                  <span><strong>{label}</strong><small>{duration}</small></span>
                </div>
              ))}
            </div>

            <footer className={styles.lessonFooter}>
              <div><span className={styles.unitMagnet} aria-hidden="true" /><strong>2D Art 1</strong><small>Studio Practices · Quarter 1</small></div>
              <button className={styles.boardButton} onClick={() => setStudentView(true)}>Open student display</button>
              <button className={styles.endButton}>End class</button>
            </footer>
          </div>

          <aside className={`${styles.drawer} ${panel ? styles.drawerOpen : ''}`} aria-hidden={!panel}>
            {panel === 'tools' && <ToolsPanel />}
            {panel === 'people' && <PeoplePanel />}
            {panel === 'pass' && <PassPanel />}
          </aside>
        </section>
      )}
    </main>
  );
}

function FurnitureTab({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: string }) {
  return (
    <button className={`${styles.furnitureTab} ${active ? styles.tabActive : ''}`} onClick={onClick} aria-pressed={active}>
      <span aria-hidden="true">{icon}</span>{label}
    </button>
  );
}

function ToolsPanel() {
  return <div className={styles.drawerContent}><span className={styles.eyebrow}>TOOLS</span><h2>Class tools</h2><div className={styles.toolGrid}><button>Groups</button><button>Picker</button><button>Notes</button><button>Media</button></div></div>;
}

function PeoplePanel() {
  return <div className={styles.drawerContent}><span className={styles.eyebrow}>PEOPLE</span><h2>24 students</h2><p className={styles.muted}>Four groups are active. One student is currently out of room.</p><button className={styles.primaryAction}>Manage groups</button></div>;
}

function PassPanel() {
  return <div className={styles.drawerContent}><span className={styles.eyebrow}>PASS</span><h2>1 student out</h2><div className={styles.passCard}><strong>Jordan M.</strong><span>Bathroom · 4:12</span></div><button className={styles.primaryAction}>Mark returned</button></div>;
}

function StudentDisplay({ time, onExit }: { time: string; onExit: () => void }) {
  return (
    <section className={styles.studentStage}>
      <button className={styles.teacherReturn} onClick={onExit}>Teacher controls</button>
      <div className={styles.studentDecorLeft} aria-hidden="true" />
      <div className={styles.studentDecorRight} aria-hidden="true" />
      <div className={styles.studentContent}>
        <span className={styles.eyebrow}>CURRENT</span>
        <h1>STUDIO TIME</h1>
        <p>Creating personal collage compositions using magazine materials.</p>
        <div className={styles.studentTimer}>{time}</div>
        <div className={styles.studentProgress}><span /></div>
      </div>
      <div className={styles.studentFooter}>
        <div><span className={styles.eyebrow}>UP NEXT</span><strong>Critique</strong></div>
        <div><span className={styles.eyebrow}>GROUPS</span><strong>4 groups</strong></div>
        <div><span className={styles.eyebrow}>CLEAN UP</span><strong>5 min</strong></div>
      </div>
    </section>
  );
}
