import { FormEvent, useEffect, useRef, useState } from 'react';
import styles from './EntryFlow.module.css';

type Stage = 'entry' | 'setup';

type SetupData = {
  name: string;
  role: string;
  classes: string;
  schedule: 'standard' | 'block';
  schoolDayStart: string;
  schoolDayEnd: string;
  planning: string;
  lunch: string;
  google: boolean;
};

const defaultSetup: SetupData = {
  name: '',
  role: 'Teacher',
  classes: '',
  schedule: 'standard',
  schoolDayStart: '',
  schoolDayEnd: '',
  planning: '',
  lunch: '',
  google: false,
};

export function EntryFlow({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>('entry');
  const [setupStep, setSetupStep] = useState(0);
  const [setup, setSetup] = useState(defaultSetup);
  const [error, setError] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(false);

  const submitBeta = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get('password') || '');
    if (!password) {
      setError('Enter the beta password.');
      return;
    }

    setCheckingAccess(true);
    setError('');
    try {
      const response = await fetch('/api/beta-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = await response.json().catch(() => ({ ok: false }));
      if (!response.ok || !result.ok) {
        setError('That password did not open Arc.');
        return;
      }
      setStage('setup');
    } catch {
      setError('Arc could not check the password. Try again.');
    } finally {
      setCheckingAccess(false);
    }
  };

  const finish = () => {
    localStorage.setItem('arc.setup.complete', 'true');
    localStorage.setItem('arc.setup.profile', JSON.stringify(setup));
    onComplete();
  };

  if (stage === 'entry') {
    return <OpeningGate error={error} checkingAccess={checkingAccess} onSubmit={submitBeta} />;
  }

  const steps = [
    <SetupWelcome key="welcome" setup={setup} setSetup={setSetup} />,
    <SetupClasses key="classes" setup={setup} setSetup={setSetup} />,
    <SetupSchedule key="schedule" setup={setup} setSetup={setSetup} />,
    <SetupGoogle key="google" setup={setup} setSetup={setSetup} />,
  ];

  return (
    <main className={styles.paperStage}>
      <section className={styles.setupShell} aria-labelledby="setup-title">
        <header className={styles.setupHeader}>
          <div><p className={styles.eyebrow}>SET UP ARC</p><h1 id="setup-title">A few useful things.</h1></div>
          <p aria-label={`Step ${setupStep + 1} of ${steps.length}`}>{setupStep + 1} / {steps.length}</p>
        </header>
        <div className={styles.progress} aria-hidden="true"><span style={{ width: `${((setupStep + 1) / steps.length) * 100}%` }} /></div>
        <div className={styles.setupBody}>{steps[setupStep]}</div>
        <footer className={styles.setupFooter}>
          <button type="button" className={styles.textButton} disabled={setupStep === 0} onClick={() => setSetupStep((s) => Math.max(0, s - 1))}>Back</button>
          {setupStep < steps.length - 1
            ? <button type="button" className={styles.primary} onClick={() => setSetupStep((s) => s + 1)}>Next</button>
            : <button type="button" className={styles.primary} onClick={finish}>Open Arc</button>}
        </footer>
      </section>
    </main>
  );
}

type OpeningGateProps = {
  error: string;
  checkingAccess: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

function OpeningGate({ error, checkingAccess, onSubmit }: OpeningGateProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [mediaFallback, setMediaFallback] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-reduced-motion') === 'true';
    const finishOpen = () => setReady(true);
    const failOpen = () => {
      setMediaFallback(true);
      setReady(true);
    };

    el.addEventListener('ended', finishOpen);
    el.addEventListener('error', failOpen);

    if (reduced) {
      el.pause();
      setMediaFallback(true);
      setReady(true);
    } else {
      el.play().catch(failOpen);
    }

    return () => {
      el.removeEventListener('ended', finishOpen);
      el.removeEventListener('error', failOpen);
    };
  }, []);

  return (
    <main className={styles.entryStage} aria-labelledby="entry-title">
      <section className={styles.entryContent}>
        <div className={styles.reelWrap} role="img" aria-label="Teacher planning notes gather, become geometric pieces, and construct the Arc mark">
          {!mediaFallback && (
            <video ref={video} className={styles.reel} muted playsInline preload="auto" aria-hidden="true">
              <source src="/Arc_Motion_Transparent.webm" type="video/webm" />
            </video>
          )}
          {mediaFallback && <img className={styles.reelFallback} src="/assets/arc/arc-mark-stacked.webp" alt="" />}
        </div>

        {ready && (
          <section className={styles.gateShelf} aria-label="Arc private beta access">
            <div className={styles.gateHeading}>
              <span className={styles.gateKicker}>PRIVATE BETA</span>
              <h1 id="entry-title">Come on in.</h1>
            </div>

            <form onSubmit={onSubmit} className={styles.gateForm}>
              <label htmlFor="beta-password">Beta password</label>
              <div className={styles.gateControlRow}>
                <input
                  id="beta-password"
                  name="password"
                  type="password"
                  maxLength={256}
                  autoComplete="current-password"
                  autoFocus
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'access-error' : 'access-note'}
                />
                <button className={styles.gateSubmit} type="submit" disabled={checkingAccess}>
                  {checkingAccess ? 'Checking…' : 'Open Arc'}
                </button>
              </div>
            </form>

            <div className={styles.gateMeta} aria-live="polite">
              {error
                ? <p id="access-error" className={styles.error} role="alert">{error}</p>
                : <p id="access-note">Built for plans that change.</p>}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function SetupWelcome({ setup, setSetup }: SetupProps) {
  return (
    <div className={styles.setupGrid}>
      <div><h2>Who are we setting up for?</h2><p>You can change all of this later.</p></div>
      <div className={styles.form}>
        <label>Name<input value={setup.name} onChange={e => setSetup({ ...setup, name: e.target.value })} /></label>
        <label>Role<select value={setup.role} onChange={e => setSetup({ ...setup, role: e.target.value })}><option>Teacher</option><option>Department chair</option><option>Administrator</option><option>Athletic coach</option><option>Club leader</option><option>Student advisor</option><option>Support staff</option></select></label>
      </div>
    </div>
  );
}

function SetupClasses({ setup, setSetup }: SetupProps) {
  return (
    <div className={styles.setupGrid}>
      <div><h2>Your classes.</h2><p>One per line is enough. Arc can get more specific later.</p></div>
      <label className={styles.form}>Classes<textarea rows={7} value={setup.classes} onChange={e => setSetup({ ...setup, classes: e.target.value })} placeholder={'AP Art History\n2D Art 1\n3D Art 1'} /></label>
    </div>
  );
}

function SetupSchedule({ setup, setSetup }: SetupProps) {
  return (
    <div className={styles.setupGrid}>
      <div><h2>Your day has a shape.</h2><p>Give Arc the structure, not a novel.</p></div>
      <div className={styles.form}>
        <fieldset>
          <legend>Schedule</legend>
          <label className={styles.inline}><input type="radio" checked={setup.schedule === 'standard'} onChange={() => setSetup({ ...setup, schedule: 'standard' })} /> Standard</label>
          <label className={styles.inline}><input type="radio" checked={setup.schedule === 'block'} onChange={() => setSetup({ ...setup, schedule: 'block' })} /> Block</label>
        </fieldset>
        <label>School day starts<input type="time" value={setup.schoolDayStart} onChange={e => setSetup({ ...setup, schoolDayStart: e.target.value })} /></label>
        <label>School day ends<input type="time" value={setup.schoolDayEnd} onChange={e => setSetup({ ...setup, schoolDayEnd: e.target.value })} /></label>
        <label>Planning period<input value={setup.planning} onChange={e => setSetup({ ...setup, planning: e.target.value })} placeholder="Period 4" /></label>
        <label>Lunch<input value={setup.lunch} onChange={e => setSetup({ ...setup, lunch: e.target.value })} placeholder="11:20–11:50" /></label>
      </div>
    </div>
  );
}

function SetupGoogle({ setup, setSetup }: SetupProps) {
  return (
    <div className={styles.setupGrid}>
      <div><h2>Drive, if you want it.</h2><p>Connecting Google is optional. Arc should still work without it.</p></div>
      <div className={styles.googleChoice}>
        <button className={styles.secondary} onClick={() => setSetup({ ...setup, google: !setup.google })}>{setup.google ? 'Google connection planned' : 'Connect Google later'}</button>
        <p className={styles.small}>The actual Google authorization is a separate, explicit permission step. Arc does not load Drive content just because you opened setup.</p>
      </div>
    </div>
  );
}

type SetupProps = { setup: SetupData; setSetup: (next: SetupData) => void };
