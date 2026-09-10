import { useEffect, useRef, useState, type FormEvent } from 'react';
import styles from './EntryFlow.module.css';

type Stage = 'entry' | 'setup';
type AccessMode = 'beta' | 'interest';

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

type InterestState = 'idle' | 'submitting' | 'success' | 'duplicate' | 'error';

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

function modeFromPath(): AccessMode {
  return window.location.pathname.startsWith('/interest') ? 'interest' : 'beta';
}

export function EntryFlow({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>('entry');
  const [mode, setMode] = useState<AccessMode>(() => modeFromPath());
  const [setupStep, setSetupStep] = useState(0);
  const [setup, setSetup] = useState(defaultSetup);
  const [error, setError] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [interestState, setInterestState] = useState<InterestState>('idle');

  useEffect(() => {
    const onPopState = () => {
      setMode(modeFromPath());
      setError('');
      setInterestState('idle');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const chooseMode = (next: AccessMode) => {
    if (next === mode) return;
    setMode(next);
    setError('');
    setInterestState('idle');
    window.history.pushState({}, '', next === 'beta' ? '/beta' : '/interest');
  };

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
      window.history.replaceState({}, '', '/');
      setStage('setup');
    } catch {
      setError('Arc could not check the password. Try again.');
    } finally {
      setCheckingAccess(false);
    }
  };

  const submitInterest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '').trim();
    const name = String(data.get('name') || '').trim();
    const role = String(data.get('role') || '').trim();
    const website = String(data.get('website') || '').trim();

    if (website) return;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setInterestState('error');
      setError('Enter a valid email address.');
      return;
    }

    setInterestState('submitting');
    setError('');
    try {
      const response = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role, website }),
      });
      const result = await response.json().catch(() => ({ ok: false }));
      if (response.status === 409 || result.duplicate) {
        setInterestState('duplicate');
        e.currentTarget.reset();
        return;
      }
      if (!response.ok || !result.ok) {
        setInterestState('error');
        setError('We could not add you right now. Try again.');
        return;
      }
      setInterestState('success');
      e.currentTarget.reset();
    } catch {
      setInterestState('error');
      setError('We could not add you right now. Try again.');
    }
  };

  const finish = () => {
    localStorage.setItem('arc.setup.complete', 'true');
    localStorage.setItem('arc.setup.profile', JSON.stringify(setup));
    onComplete();
  };

  if (stage === 'entry') {
    return (
      <OpeningGate
        mode={mode}
        onChooseMode={chooseMode}
        error={error}
        checkingAccess={checkingAccess}
        interestState={interestState}
        onBetaSubmit={submitBeta}
        onInterestSubmit={submitInterest}
      />
    );
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
  mode: AccessMode;
  onChooseMode: (mode: AccessMode) => void;
  error: string;
  checkingAccess: boolean;
  interestState: InterestState;
  onBetaSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onInterestSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

function OpeningGate({ mode, onChooseMode, error, checkingAccess, interestState, onBetaSubmit, onInterestSubmit }: OpeningGateProps) {
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
          <section className={styles.gateShelf} aria-label="Arc entry options">
            <img className={styles.gateAsset} src="/assets/arc/pattern-arc-geometric.webp" alt="" aria-hidden="true" />
            <div className={styles.gateHeading}>
              <span className={styles.gateKicker}>ARC</span>
              <h1 id="entry-title">Come on in.</h1>
            </div>

            <div className={styles.choiceTabs} role="tablist" aria-label="Choose Arc access">
              <button type="button" role="tab" aria-selected={mode === 'beta'} className={mode === 'beta' ? styles.choiceActive : styles.choiceTab} onClick={() => onChooseMode('beta')}>Beta tester</button>
              <button type="button" role="tab" aria-selected={mode === 'interest'} className={mode === 'interest' ? styles.choiceActive : styles.choiceTab} onClick={() => onChooseMode('interest')}>Interested in Arc</button>
            </div>

            {mode === 'beta' ? (
              <form onSubmit={onBetaSubmit} className={styles.gateForm} aria-label="Beta tester login">
                <div className={styles.branchIntro}>
                  <strong>Beta access</strong>
                  <span>Use the shared tester password to open Arc.</span>
                </div>
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
                <div className={styles.gateMeta} aria-live="polite">
                  {error
                    ? <p id="access-error" className={styles.error} role="alert">{error}</p>
                    : <p id="access-note">Private beta. Planning stays teacher-first.</p>}
                </div>
              </form>
            ) : (
              <form onSubmit={onInterestSubmit} className={styles.gateForm} aria-label="Arc interest form" noValidate>
                <div className={styles.branchIntro}>
                  <strong>Keep me posted.</strong>
                  <span>Leave your email and we’ll let you know when Arc opens more widely.</span>
                </div>
                <label htmlFor="interest-email">Email</label>
                <input id="interest-email" name="email" type="email" autoComplete="email" maxLength={254} required aria-invalid={interestState === 'error'} />
                <div className={styles.interestDetails}>
                  <label htmlFor="interest-name">Name <span>(optional)</span></label>
                  <input id="interest-name" name="name" type="text" autoComplete="name" maxLength={120} />
                  <label htmlFor="interest-role">What best describes you? <span>(optional)</span></label>
                  <select id="interest-role" name="role" defaultValue="">
                    <option value="">Choose one</option>
                    <option>Classroom teacher</option>
                    <option>Department chair / instructional lead</option>
                    <option>School or district leader</option>
                    <option>Education creator / consultant</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className={styles.honeypot} aria-hidden="true"><label htmlFor="interest-website">Website</label><input id="interest-website" name="website" tabIndex={-1} autoComplete="off" /></div>
                <button className={styles.gateSubmitWide} type="submit" disabled={interestState === 'submitting'}>
                  {interestState === 'submitting' ? 'Adding you…' : 'Join the interest list'}
                </button>
                <div className={styles.gateMeta} aria-live="polite">
                  {interestState === 'success' && <p className={styles.success}>You’re on the list. Thank you.</p>}
                  {interestState === 'duplicate' && <p className={styles.success}>You’re already on the list.</p>}
                  {interestState === 'error' && <p className={styles.error} role="alert">{error}</p>}
                  {interestState === 'idle' && <p>This does not create an Arc account or open the beta.</p>}
                </div>
              </form>
            )}
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
