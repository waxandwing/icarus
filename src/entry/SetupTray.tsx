import { useRef, useState, type ChangeEvent, type FormEvent, type Ref } from 'react';
import { dismissSetup } from './session';
import styles from './SetupTray.module.css';

const CHIPS = ['1 School', '2 Source', '3 Review', '4 Early*', '5 Classes', '6 Day (optional)'];

const COPY = [
  {
    stickyTitle: 'Start here',
    stickyBody: 'District & school first. We’ll find the official calendar — you confirm before anything saves.',
    question: 'Where do you teach?',
  },
  {
    stickyTitle: 'Source match',
    stickyBody: 'Stays empty until Arc finds a real district/school calendar. No fake sources.',
    question: 'Source match (after Find)',
  },
  {
    stickyTitle: 'Year review',
    stickyBody: 'This is the proof — glance the miniature year before you commit.',
    question: 'Does this look right?',
  },
  {
    stickyTitle: 'Early release',
    stickyBody: 'Still a school day — just shorter. Skip if you’re unsure.',
    question: 'Does your school have early release days?',
  },
  {
    stickyTitle: 'Your classes',
    stickyBody: 'Add what you teach. One course can have a few sections.',
    question: 'Add your classes',
  },
  {
    stickyTitle: 'Optional — your day',
    stickyBody: 'Bell schedule can wait. Jump into your desk whenever you’re ready.',
    question: 'Set up my day? (optional)',
  },
  {
    stickyTitle: "You're in",
    stickyBody: 'Come back to Calendar Setup anytime from Settings.',
    question: "You're in.",
  },
] as const;

const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

export function SetupTray({ onDismiss }: { onDismiss: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [district, setDistrict] = useState('Orange County Public Schools');
  const [school, setSchool] = useState('Winter Park High');
  const [place, setPlace] = useState('Winter Park, FL');
  const [year, setYear] = useState('2025–26');
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState('');
  const [section, setSection] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState('Nothing saves until you confirm a year preview.');

  const copy = COPY[step];

  function skip() {
    dismissSetup();
    onDismiss();
  }

  function go(next: number) {
    setStep(Math.max(0, Math.min(COPY.length - 1, next)));
  }

  function onFind(event: FormEvent) {
    event.preventDefault();
    if (fileName) {
      setStatus(`Arc will prefill from ${fileName} for ${school}. Nothing is saved yet.`);
    } else {
      setStatus(`Arc will search official sources for ${school} next. Nothing is saved yet.`);
    }
    go(1);
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus(`Using ${file.name} as a PDF/CSV fallback. Nothing is saved yet.`);
  }

  return (
    <div id="arc-setup-tray" className={styles.layer}>
      {step < 6 && (
        <div className={styles.chips} role="tablist" aria-label="Setup steps">
          {CHIPS.map((label, index) => (
            <button
              key={label}
              type="button"
              className={styles.chip}
              role="tab"
              aria-selected={index === step}
              data-active={index === step ? 'true' : 'false'}
              onClick={() => go(index)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.work}>
        <aside className={`${styles.sticky} arc-hand`} aria-label={copy.stickyTitle}>
          <p className={styles.stickyTitle}>{copy.stickyTitle}</p>
          <p className={styles.stickyBody}>{copy.stickyBody}</p>
        </aside>

        <form className={styles.card} onSubmit={onFind}>
          <h2 className={styles.question}>{copy.question}</h2>

          {step === 0 && (
            <>
              <Field id="arc-setup-district" label="District (suggested)" value={district} onChange={setDistrict} />
              <Field id="arc-setup-school" label="School (suggested)" value={school} onChange={setSchool} />
              <Field id="arc-setup-place" label="City / State (suggested)" value={place} onChange={setPlace} />
              <Field id="arc-setup-year" label="School year (suggested)" value={year} onChange={setYear} />
              <button type="submit" className={styles.find}>
                Find my calendar
              </button>
              <p className={styles.alts}>
                <input
                  ref={fileRef}
                  className={styles.fileInput}
                  type="file"
                  accept=".pdf,.csv,application/pdf,text/csv"
                  onChange={onFile}
                  aria-label="Upload PDF or CSV calendar"
                />
                <button type="button" className={styles.alt} onClick={() => fileRef.current?.click()}>
                  Upload PDF/CSV
                </button>
                <span aria-hidden="true"> · </span>
                <button type="button" className={styles.alt} onClick={() => go(1)}>
                  Enter manually
                </button>
              </p>
              <p className={styles.note} role="status">
                {status}
              </p>
            </>
          )}

          {step === 1 && (
            <>
              <p className={styles.note}>
                No source planted here. After Find my calendar, a real district or school calendar appears for review.
              </p>
              <button type="button" className={styles.find} onClick={() => go(2)}>
                Use this calendar
              </button>
              <button type="button" className={styles.ghost} onClick={() => go(0)}>
                Not my school
              </button>
              <button type="button" className={styles.ghost} onClick={() => fileRef.current?.click()}>
                Upload instead
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className={styles.note}>182 instructional days · 10 no-school · early-release Wednesdays</p>
              <div className={styles.year}>
                <p>2025–26 · miniature year</p>
                <div className={styles.months}>
                  {MONTHS.map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
                <p>■ instructional · ■ no-school · ■ early release</p>
              </div>
              <button type="button" className={styles.find} onClick={() => go(3)}>
                Confirm calendar
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button type="button" className={styles.find} onClick={() => go(4)}>
                Yes — find the pattern
              </button>
              <button type="button" className={styles.ghost} onClick={() => go(4)}>
                No early release
              </button>
              <button type="button" className={styles.ghost} onClick={() => go(4)}>
                Skip for now
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <Field id="arc-setup-course" label="Course name" value={course} onChange={setCourse} />
              <Field id="arc-setup-period" label="Period / block / Section" value={period} onChange={setPeriod} />
              <Field id="arc-setup-section" label="Section label (optional)" value={section} onChange={setSection} />
              <button type="button" className={styles.find} onClick={() => go(5)}>
                Save class
              </button>
              <button type="button" className={styles.ghost} onClick={() => go(5)}>
                Add another class
              </button>
            </>
          )}

          {step === 5 && (
            <>
              <button type="button" className={styles.find} onClick={() => go(6)}>
                Find my bell schedule
              </button>
              <button type="button" className={styles.ghost} onClick={() => go(6)}>
                Not now — open my desk
              </button>
            </>
          )}

          {step === 6 && (
            <>
              <p className={styles.note}>School calendar is ready enough to teach with. Resume setup anytime.</p>
              <button type="button" className={styles.find} onClick={skip}>
                Take a Look Around
              </button>
              <button type="button" className={styles.ghost} onClick={skip}>
                Open my desk
              </button>
            </>
          )}
        </form>
      </div>

      <div className={styles.bar}>
        <p>Skip setup — explore your desk. Calendar can wait.</p>
        <button type="button" className={styles.notNow} onClick={skip}>
          Not now
        </button>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  inputRef,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <label className={styles.field} htmlFor={id}>
      {label}
      <input id={id} ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
