import { useEffect, useRef, useState, type FormEvent } from 'react';
import { PaperGrain } from '../assets/PaperTexture';
import { EntryEyebrow, EntryMark } from './DeskProps';
import { reopenSetup, unlockBeta, verifyBetaPassword } from './session';
import type { EntryScreen } from './paths';
import styles from './EntryFlow.module.css';

export const OPENING_MOTION_SRC = '/assets/arc/ARC_Opening_Motion_v8_REVIEW.mp4';
/** Assembled stacked mark, before the title-card kicker types on. */
export const OPENING_LAST_FRAME_SRC = '/assets/arc/ARC_Opening_Motion_v8_last.png';
export const WELCOME_MARK_SIZE = 240;
/** Cut on the settled boxed mark, before “Plan the way you think.” types on. */
export const MOTION_CUT_S = 7.4;

export function EntryFlow({
  screen,
  onGo,
}: {
  screen: Exclude<EntryScreen, 'desk' | 'table'>;
  onGo: (path: string) => void;
}) {
  return (
    <main className={styles.stage}>
      {screen === 'landing' && <Landing onGo={onGo} />}
      {screen === 'beta' && <BetaCard onGo={onGo} />}
      {screen === 'signup' && <SignupCard onGo={onGo} />}
      {screen === 'enter' && <EnterCard onGo={onGo} />}
    </main>
  );
}

function motionIsReduced() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.getAttribute('data-reduced-motion') === 'true'
  );
}

function Landing({ onGo }: { onGo: (path: string) => void }) {
  const reduced = motionIsReduced();
  const [phase, setPhase] = useState<'motion' | 'ready'>(() => (reduced ? 'ready' : 'motion'));

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (!motionIsReduced()) return;
      setPhase('ready');
    };
    media.addEventListener('change', sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduced-motion'] });
    return () => {
      media.removeEventListener('change', sync);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={styles.landing} data-phase={phase}>
      <PaperGrain baseColor="transparent" opacity={0.28} className={styles.grain} />
      <div className={styles.hero}>
        <div className={styles.markSlot}>
          {!reduced && <OpeningMotion onDone={() => setPhase('ready')} />}
          {(reduced || phase === 'ready') && (
            <img
              className={styles.settledFrame}
              src={OPENING_LAST_FRAME_SRC}
              width={WELCOME_MARK_SIZE}
              height={Math.round(WELCOME_MARK_SIZE * (280 / 256))}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          )}
        </div>
        <div className={styles.copy}>
          <EntryEyebrow>Plan the way you think.</EntryEyebrow>
          <h1 className={styles.display}>Making it make sense.</h1>
          <p className={styles.lede}>A teacher planner built for what actually happens.</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => onGo('/signup')}>
              Sign up with email
            </button>
            <button type="button" className={styles.beta} onClick={() => onGo('/beta')}>
              Log in with beta password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OpeningMotion({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onDoneRef = useRef(onDone);
  const finished = useRef(false);
  onDoneRef.current = onDone;

  function finish() {
    const video = videoRef.current;
    if (video && video.currentTime < MOTION_CUT_S) {
      video.currentTime = MOTION_CUT_S;
    }
    video?.pause();
    if (finished.current) return;
    finished.current = true;
    onDoneRef.current();
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.volume = 0;
    const tryPlay = () => {
      if (finished.current || video.ended) {
        finish();
        return;
      }
      void video.play().catch(() => {
        /* Retry below. Last frame poster stays until play or watchdog. */
      });
    };
    const onTime = () => {
      if (video.currentTime >= MOTION_CUT_S) {
        video.pause();
        finish();
      }
    };
    tryPlay();
    video.addEventListener('loadeddata', tryPlay);
    video.addEventListener('canplay', tryPlay);
    video.addEventListener('timeupdate', onTime);
    const retry = window.setInterval(tryPlay, 450);
    const watchdog = window.setTimeout(finish, 14000);
    return () => {
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('timeupdate', onTime);
      window.clearInterval(retry);
      window.clearTimeout(watchdog);
    };
  }, []);

  return (
    <div className={styles.opening} aria-hidden="true">
      <video
        ref={videoRef}
        className={styles.openingVideo}
        src={OPENING_MOTION_SRC}
        poster={OPENING_LAST_FRAME_SRC}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        onEnded={finish}
        onError={finish}
      />
    </div>
  );
}

function BetaCard({ onGo }: { onGo: (path: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!verifyBetaPassword(password)) {
      setError('That password does not open Arc yet.');
      return;
    }
    unlockBeta();
    onGo('/enter');
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <EntryMark size={88} />
      <EntryEyebrow>Beta access · required</EntryEyebrow>
      <h1 className={styles.cardTitle}>Log in with your beta password.</h1>
      <p className={styles.cardBody}>Required until full launch. Enter your beta password to open Arc.</p>
      <label className={styles.label} htmlFor="arc-beta-password">
        Beta password
      </label>
      <input
        id="arc-beta-password"
        className={styles.input}
        type="password"
        autoComplete="current-password"
        placeholder="Enter beta password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setError(null);
        }}
      />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={styles.primaryWide}>
        Continue
      </button>
      <button type="button" className={styles.textLink} onClick={() => onGo('/signup')}>
        Sign up with email instead
      </button>
      <p className={styles.hold}>Arc holds your place.</p>
    </form>
  );
}

function SignupCard({ onGo }: { onGo: (path: string) => void }) {
  return (
    <div className={styles.card}>
      <EntryMark size={88} />
      <EntryEyebrow>Email signup</EntryEyebrow>
      <h1 className={styles.cardTitle}>Beta is still the door.</h1>
      <p className={styles.cardBody}>
        Email accounts are not open yet. Use your beta password to enter Arc. Google can wait until you want Drive files in lesson planning.
      </p>
      <button type="button" className={styles.primaryWide} onClick={() => onGo('/beta')}>
        Log in with beta password
      </button>
      <button type="button" className={styles.textLink} onClick={() => onGo('/')}>
        Back to landing
      </button>
      <p className={styles.hold}>Arc holds your place.</p>
    </div>
  );
}

function EnterCard({ onGo }: { onGo: (path: string) => void }) {
  return (
    <div className={styles.card} data-paper="white">
      <EntryEyebrow>You&apos;re in</EntryEyebrow>
      <h1 className={styles.cardTitle}>Open your desk.</h1>
      <p className={styles.cardBody}>
        Beta access is unlocked. Open your desk to start planning.
      </p>
      <button
        type="button"
        className={styles.enterCta}
        onClick={() => {
          reopenSetup();
          onGo('/');
        }}
      >
        Continue to calendar setup
      </button>
      <p className={styles.hold}>Arc holds your place.</p>
    </div>
  );
}
