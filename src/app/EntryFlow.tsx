import { FormEvent, useEffect, useRef, useState } from 'react';
import styles from './EntryFlow.module.css';

type Stage = 'entry' | 'access' | 'setup';
type AccessMode = 'email' | 'beta';

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
  const [mode, setMode] = useState<AccessMode>('beta');
  const [setupStep, setSetupStep] = useState(0);
  const [setup, setSetup] = useState(defaultSetup);
  const [error, setError] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(false);

  const advanceAccess = () => {
    setError('');
    setStage('setup');
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
        setError(result.error || 'Beta access could not be verified.');
        return;
      }
      advanceAccess();
    } catch {
      setError('Beta access could not be verified. Try again.');
    } finally {
      setCheckingAccess(false);
    }
  };

  const submitEmail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') || '').trim();
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    localStorage.setItem('arc.setup.email', email);
    advanceAccess();
  };

  const finish = () => {
    localStorage.setItem('arc.setup.complete', 'true');
    localStorage.setItem('arc.setup.profile', JSON.stringify(setup));
    onComplete();
  };

  if (stage === 'entry') {
    return <OpeningAnimation onChoose={(next) => { setMode(next); setStage('access'); }} />;
  }

  if (stage === 'access') {
    return (
      <main className={styles.paperStage}>
        <section className={styles.accessCard} aria-labelledby="access-title">
          <div className={styles.brandColumn}>
            <div className={styles.brandMark} aria-hidden="true">arc</div>
            <p className={styles.eyebrow}>PRIVATE BETA</p>
            <h1 id="access-title">Come on in.</h1>
            <p className={styles.lede}>Arc keeps the plan intact when the day does not.</p>
          </div>
          <div className={styles.formColumn}>
            <div className={styles.modeSwitch} role="group" aria-label="Access method">
              <button type="button" className={mode === 'beta' ? styles.modeActive : ''} aria-pressed={mode === 'beta'} onClick={() => { setMode('beta'); setError(''); }}>Beta password</button>
              <button type="button" className={mode === 'email' ? styles.modeActive : ''} aria-pressed={mode === 'email'} onClick={() => { setMode('email'); setError(''); }}>Email</button>
            </div>
            {mode === 'beta' ? (
              <form onSubmit={submitBeta} className={styles.form}>
                <label htmlFor="beta-password">Beta password<input id="beta-password" name="password" type="password" autoComplete="current-password" autoFocus /></label>
                <button className={styles.primary} type="submit" disabled={checkingAccess}>{checkingAccess ? 'Checking…' : 'Continue'}</button>
              </form>
            ) : (
              <form onSubmit={submitEmail} className={styles.form}>
                <label htmlFor="access-email">Email<input id="access-email" name="email" type="email" autoComplete="email" autoFocus /></label>
                <button className={styles.primary} type="submit">Continue</button>
              </form>
            )}
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button type="button" className={styles.textButton} onClick={() => setStage('entry')}>Back</button>
          </div>
        </section>
      </main>
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

function OpeningAnimation({ onChoose }: { onChoose: (mode: AccessMode) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-reduced-motion') === 'true';
    let frame = 0;
    let failed = false;

    const sync = () => {
      const t = el.currentTime || 0;
      const p = reduced || failed ? 1 : Math.max(0, Math.min(1, (t - 3.28) / (6.65 - 3.28)));
      const ease = p * p * p * (p * (p * 6 - 15) + 10);
      el.style.setProperty('--reel-scale', String(1.10 + (.68 - 1.10) * ease));
      el.style.setProperty('--reel-trim', String(-.401 * ease));
      setReady(reduced || failed || t >= 7.08);
    };

    const tick = () => {
      sync();
      if (!el.paused && !el.ended) frame = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      cancelAnimationFrame(frame);
      tick();
    };
    const failOpen = () => {
      failed = true;
      setReady(true);
      sync();
    };

    el.addEventListener('play', onPlay);
    el.addEventListener('timeupdate', sync);
    el.addEventListener('seeking', sync);
    el.addEventListener('seeked', sync);
    el.addEventListener('ratechange', sync);
    el.addEventListener('error', failOpen);

    if (reduced) {
      el.pause();
      setReady(true);
      sync();
    } else {
      el.play().catch(failOpen);
    }

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('timeupdate', sync);
      el.removeEventListener('seeking', sync);
      el.removeEventListener('seeked', sync);
      el.removeEventListener('ratechange', sync);
      el.removeEventListener('error', failOpen);
    };
  }, []);

  return (
    <main className={styles.entryStage} aria-labelledby="entry-title">
      <section className={`${styles.entryContent} ${ready ? styles.ready : ''}`}>
        <div className={styles.reelWrap} role="img" aria-label="Arc logo animation resolving from a busy teacher planning week">
          <video ref={video} className={styles.reel} muted playsInline preload="auto" poster="/arc-motion-final-transparent.png" aria-hidden="true">
            <source src="/Arc_Motion_Transparent.webm" type="video/webm" />
          </video>
          <img className={styles.reelFallback} src="/arc-motion-final-transparent.png" alt="" />
        </div>
        <div className={styles.entryCopy} aria-hidden={!ready}>
          <p className={styles.eyebrow}>PLAN THE WAY YOU THINK.</p>
          <h1 id="entry-title">Making it make sense.</h1>
          <p className={styles.intro}>A teacher planner built for what actually happens.</p>
          <nav className={styles.actions} aria-label="Beta access options">
            <button className={styles.primary} onClick={() => onChoose('email')}>Sign up with email</button>
            <button className={styles.secondary} onClick={() => onChoose('beta')}>Log in with beta password</button>
          </nav>
        </div>
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
