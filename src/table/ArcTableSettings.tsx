import styles from './ArcTable.module.css';
import type {
  AlarmVoice,
  ArcLink,
  ClassroomStudent,
  DisplayMode,
  DisplayOverride,
  FlowBlock,
  FlowKind,
  TablePrefs,
} from './classroom';

type Pane = 'class' | 'flow' | 'timer' | 'board' | 'pass' | 'demo' | 'media' | 'access' | 'roster';

const PANES: { id: Pane; label: string }[] = [
  { id: 'class', label: 'Class' },
  { id: 'roster', label: 'Roster' },
  { id: 'flow', label: 'Flow' },
  { id: 'timer', label: 'Timer' },
  { id: 'board', label: 'Student board' },
  { id: 'pass', label: 'Pass' },
  { id: 'demo', label: 'Demo' },
  { id: 'media', label: 'Media' },
  { id: 'access', label: 'Access' },
];

export function SettingsDialog({
  displayOverride,
  displayMode,
  highContrast,
  reducedMotion,
  isFullscreen,
  flow,
  prefs,
  settingsPane,
  alarmVoice,
  customAlarmUrl,
  recordingAlarm,
  cameraError,
  demoLive,
  onDisplayOverride,
  onHighContrast,
  onReducedMotion,
  onToggleFullscreen,
  onPane,
  onPrefs,
  onPatchBlock,
  onMinutes,
  onAddBlock,
  onDeleteBlock,
  onMoveBlock,
  onAttachMedia,
  currentIndex,
  onAlarmVoice,
  onPlayAlarm,
  onStartAlarmRecording,
  onStopAlarmRecording,
  onAlarmFile,
  onStartCamera,
  onDemoVideo,
  onStopDemo,
  roster,
  rosterDraft,
  arcLink,
  onRosterDraft,
  onAddRoster,
  onRemoveStudent,
  onSyncArc,
  onClose,
}: {
  displayOverride: DisplayOverride;
  displayMode: DisplayMode;
  highContrast: boolean;
  reducedMotion: boolean;
  isFullscreen: boolean;
  flow: FlowBlock[];
  prefs: TablePrefs;
  settingsPane: Pane;
  alarmVoice: AlarmVoice;
  customAlarmUrl: string | null;
  recordingAlarm: boolean;
  cameraError: string | null;
  demoLive: boolean;
  onDisplayOverride: (value: DisplayOverride) => void;
  onHighContrast: () => void;
  onReducedMotion: () => void;
  onToggleFullscreen: () => void;
  onPane: (pane: Pane) => void;
  onPrefs: (patch: Partial<TablePrefs>) => void;
  onPatchBlock: (index: number, patch: Partial<FlowBlock>) => void;
  onMinutes: (index: number, minutes: number) => void;
  onAddBlock: () => void;
  onDeleteBlock: (index: number) => void;
  onMoveBlock: (index: number, direction: -1 | 1) => void;
  onAttachMedia: (index: number, file: File | undefined) => void;
  currentIndex: number;
  onAlarmVoice: (value: AlarmVoice) => void;
  onPlayAlarm: () => void;
  onStartAlarmRecording: () => void;
  onStopAlarmRecording: () => void;
  onAlarmFile: (file: File | undefined) => void;
  onStartCamera: () => void;
  onDemoVideo: (file: File | undefined) => void;
  onStopDemo: () => void;
  roster: ClassroomStudent[];
  rosterDraft: string;
  arcLink: ArcLink;
  onRosterDraft: (value: string) => void;
  onAddRoster: () => void;
  onRemoveStudent: (id: string) => void;
  onSyncArc: () => void;
  onClose: () => void;
}) {
  return (
    <div className={styles.settingsScrim} onClick={onClose}>
      <div
        className={styles.settings}
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.settingsHeader}>
          <h2 id="table-settings-title">Settings</h2>
          <button type="button" className={styles.iconButton} aria-label="Close settings" onClick={onClose}>
            ×
          </button>
        </div>
        <nav className={styles.settingsNav} aria-label="Settings sections">
          {PANES.map((pane) => (
            <button
              key={pane.id}
              type="button"
              className={styles.settingsNavButton}
              data-active={settingsPane === pane.id}
              onClick={() => onPane(pane.id)}
            >
              {pane.label}
            </button>
          ))}
        </nav>

        {settingsPane === 'class' && (
          <>
            <p className={styles.settingsHint}>Set the table here if you did not set this period in Arc.</p>
            <label className={styles.settingsField}>
              Class name
              <input value={prefs.className} onChange={(event) => onPrefs({ className: event.target.value })} />
            </label>
            <label className={styles.settingsField}>
              Period
              <input value={prefs.periodName} onChange={(event) => onPrefs({ periodName: event.target.value })} />
            </label>
            <label className={styles.settingsField}>
              Room
              <input value={prefs.roomName} onChange={(event) => onPrefs({ roomName: event.target.value })} />
            </label>
            <label className={styles.settingsField}>
              Teacher
              <input value={prefs.teacherName} onChange={(event) => onPrefs({ teacherName: event.target.value })} placeholder="Name on the student board" />
            </label>
            <label className={styles.settingsField}>
              Board size
              <select
                value={displayOverride}
                onChange={(event) => onDisplayOverride(event.target.value as DisplayOverride)}
              >
                <option value="auto">Auto ({displayMode})</option>
                <option value="board">Smart Board</option>
                <option value="laptop">Laptop</option>
                <option value="compact">Compact</option>
              </select>
            </label>
            <button type="button" className={styles.primaryButton} onClick={onToggleFullscreen}>
              {isFullscreen ? 'Exit full screen' : 'Enter full screen'}
            </button>
          </>
        )}

        {settingsPane === 'roster' && (
          <>
            <p className={styles.settingsHint}>
              Student lists live in Arc with the period. This table will sync them when that link is built. Until then, paste names. Skyward is not in this loop.
            </p>
            <button type="button" className={styles.secondaryButton} onClick={onSyncArc}>
              Sync roster and schedule from Arc
            </button>
            <p className={styles.settingsHint}>
              {arcLink.lastAttemptAt
                ? 'Arc is not connected yet. The attempt was recorded. Keep the typed list; it is what this period uses.'
                : 'No sync attempt yet.'}
            </p>
            <p className={styles.kicker}>This period’s schedule on the table</p>
            <ul className={styles.plainList}>
              {flow.map((block) => (
                <li key={block.id}>
                  <strong>{block.title}</strong>
                  <span>{block.minutes} min</span>
                </li>
              ))}
            </ul>
            <label className={styles.settingsField}>
              Add students
              <textarea
                value={rosterDraft}
                onChange={(event) => onRosterDraft(event.target.value)}
                rows={4}
                placeholder={'One name per line, or commas:\nMaya Chen\nDee Patel'}
              />
            </label>
            <button type="button" className={styles.primaryButton} onClick={onAddRoster}>Add to this class</button>
            <ul className={styles.rosterList}>
              {roster.map((student) => (
                <li key={student.id}>
                  <span>{student.name}</span>
                  <button type="button" className={styles.textButton} onClick={() => onRemoveStudent(student.id)}>Remove</button>
                </li>
              ))}
            </ul>
          </>
        )}

        {settingsPane === 'flow' && (
          <>
            <p className={styles.settingsHint}>Same class order as the Today list. Name it, time it, move it, or remove it.</p>
            <ul className={styles.setupList}>
              {flow.map((block, index) => (
                <li key={block.id} className={styles.setupRow}>
                  <input
                    aria-label={`${block.title} name`}
                    value={block.title}
                    onChange={(event) => onPatchBlock(index, { title: event.target.value })}
                  />
                  <input
                    aria-label={`${block.title} minutes`}
                    type="number"
                    min={1}
                    max={90}
                    value={block.minutes}
                    onChange={(event) => onMinutes(index, Number(event.target.value))}
                  />
                  <select
                    aria-label={`${block.title} type`}
                    value={block.kind}
                    onChange={(event) => onPatchBlock(index, { kind: event.target.value as FlowKind })}
                  >
                    <option value="block">Block</option>
                    <option value="demo">Demo</option>
                    <option value="cleanup">Cleanup</option>
                  </select>
                  <button type="button" className={styles.textButton} onClick={() => onMoveBlock(index, -1)}>Up</button>
                  <button type="button" className={styles.textButton} onClick={() => onMoveBlock(index, 1)}>Down</button>
                  <button type="button" className={styles.textButton} onClick={() => onDeleteBlock(index)}>Remove</button>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.primaryButton} onClick={onAddBlock}>Add to class order</button>
          </>
        )}

        {settingsPane === 'timer' && (
          <>
            <label className={styles.settingsField}>
              Sound
              <select value={alarmVoice} onChange={(event) => onAlarmVoice(event.target.value as AlarmVoice)}>
                <option value="chime">Arc chime</option>
                <option value="bell">Bell</option>
                <option value="custom" disabled={!customAlarmUrl}>Recorded or uploaded</option>
              </select>
            </label>
            <div className={styles.settingsActions}>
              <button type="button" className={styles.secondaryButton} onClick={onPlayAlarm}>Preview alarm</button>
              {recordingAlarm ? (
                <button type="button" className={styles.secondaryButton} onClick={onStopAlarmRecording}>Stop recording</button>
              ) : (
                <button type="button" className={styles.secondaryButton} onClick={onStartAlarmRecording}>Record alarm</button>
              )}
              <label className={styles.fileButton}>
                Upload alarm
                <input type="file" accept="audio/*" onChange={(event) => onAlarmFile(event.target.files?.[0])} />
              </label>
            </div>
            <label className={styles.toggleRow}>
              <span>
                <strong>Auto-advance</strong>
                <small>When a block hits 0:00, start the next block.</small>
              </span>
              <input type="checkbox" checked={prefs.autoAdvance} onChange={() => onPrefs({ autoAdvance: !prefs.autoAdvance })} />
            </label>
            <label className={styles.toggleRow}>
              <span>
                <strong>Alarm on cleanup</strong>
                <small>Play the alarm when cleanup becomes current.</small>
              </span>
              <input type="checkbox" checked={prefs.alarmOnCleanup} onChange={() => onPrefs({ alarmOnCleanup: !prefs.alarmOnCleanup })} />
            </label>
          </>
        )}

        {settingsPane === 'board' && (
          <>
            <p className={styles.settingsHint}>What students can read from the far tables.</p>
            <label className={styles.toggleRow}>
              <span><strong>Show groups</strong></span>
              <input type="checkbox" checked={prefs.studentGroups} onChange={() => onPrefs({ studentGroups: !prefs.studentGroups })} />
            </label>
            <label className={styles.toggleRow}>
              <span><strong>Show who is in each group</strong></span>
              <input type="checkbox" checked={prefs.studentMembers} onChange={() => onPrefs({ studentMembers: !prefs.studentMembers })} />
            </label>
            <label className={styles.toggleRow}>
              <span><strong>Show the wall clock</strong></span>
              <input type="checkbox" checked={prefs.studentClock} onChange={() => onPrefs({ studentClock: !prefs.studentClock })} />
            </label>
            <label className={styles.toggleRow}>
              <span><strong>Show the current prompt</strong></span>
              <input type="checkbox" checked={prefs.showPrompt} onChange={() => onPrefs({ showPrompt: !prefs.showPrompt })} />
            </label>
            <label className={styles.toggleRow}>
              <span><strong>Show Up Next</strong></span>
              <input type="checkbox" checked={prefs.showNext} onChange={() => onPrefs({ showNext: !prefs.showNext })} />
            </label>
            <label className={styles.toggleRow}>
              <span><strong>Show cleanup</strong></span>
              <input type="checkbox" checked={prefs.showCleanup} onChange={() => onPrefs({ showCleanup: !prefs.showCleanup })} />
            </label>
            <label className={styles.toggleRow}>
              <span><strong>Show the timer</strong></span>
              <input type="checkbox" checked={prefs.showTimer} onChange={() => onPrefs({ showTimer: !prefs.showTimer })} />
            </label>
            <label className={styles.toggleRow}>
              <span><strong>Large type</strong></span>
              <input type="checkbox" checked={prefs.largeType} onChange={() => onPrefs({ largeType: !prefs.largeType })} />
            </label>
          </>
        )}

        {settingsPane === 'pass' && (
          <>
            <p className={styles.settingsHint}>Students sign out on the board by name. Time is recorded here. After ten minutes the teacher screen alerts. This stays on the table until Arc can receive the log.</p>
            <label className={styles.toggleRow}>
              <span><strong>Students can check out a pass</strong></span>
              <input type="checkbox" checked={prefs.studentPass} onChange={() => onPrefs({ studentPass: !prefs.studentPass })} />
            </label>
            <label className={styles.settingsField}>
              Alert after (minutes)
              <input
                type="number"
                min={1}
                max={45}
                value={prefs.passAlertMinutes}
                onChange={(event) => onPrefs({ passAlertMinutes: Math.max(1, Number(event.target.value) || 10) })}
              />
            </label>
            <label className={styles.toggleRow}>
              <span><strong>Bathroom</strong></span>
              <input type="checkbox" checked={prefs.passBathroom} onChange={() => onPrefs({ passBathroom: !prefs.passBathroom })} />
            </label>
            <label className={styles.toggleRow}>
              <span><strong>Nurse</strong></span>
              <input type="checkbox" checked={prefs.passNurse} onChange={() => onPrefs({ passNurse: !prefs.passNurse })} />
            </label>
            <label className={styles.toggleRow}>
              <span><strong>Office</strong></span>
              <input type="checkbox" checked={prefs.passOffice} onChange={() => onPrefs({ passOffice: !prefs.passOffice })} />
            </label>
          </>
        )}

        {settingsPane === 'demo' && (
          <>
            <p className={styles.settingsHint}>Present from a dock camera, or upload a video. Students see it in the center of the board.</p>
            <div className={styles.settingsActions}>
              <button type="button" className={styles.secondaryButton} onClick={onStartCamera}>
                {demoLive ? 'Restart dock camera' : 'Connect dock camera'}
              </button>
              <label className={styles.fileButton}>
                Upload video
                <input type="file" accept="video/*" onChange={(event) => onDemoVideo(event.target.files?.[0])} />
              </label>
              <button type="button" className={styles.textButton} onClick={onStopDemo}>Clear demo</button>
            </div>
            {cameraError && <p className={styles.settingsHint}>{cameraError}</p>}
          </>
        )}

        {settingsPane === 'media' && (
          <>
            <p className={styles.settingsHint}>Attach a still, a clip, or slides to the current block. Students see it on the board.</p>
            <p className={styles.detailCopy}>{flow[currentIndex]?.title}: {flow[currentIndex]?.media?.name ?? 'nothing attached yet'}</p>
            <div className={styles.settingsActions}>
              <label className={styles.fileButton}>
                Attach to current block
                <input type="file" onChange={(event) => onAttachMedia(currentIndex, event.target.files?.[0])} />
              </label>
              {flow[currentIndex]?.media && (
                <button type="button" className={styles.textButton} onClick={() => onPatchBlock(currentIndex, { media: null })}>
                  Remove media
                </button>
              )}
            </div>
          </>
        )}

        {settingsPane === 'access' && (
          <>
            <label className={styles.toggleRow}>
              <span>
                <strong>High contrast</strong>
                <small>Black type on white paper, 3px focus.</small>
              </span>
              <input type="checkbox" checked={highContrast} onChange={onHighContrast} />
            </label>
            <label className={styles.toggleRow}>
              <span>
                <strong>Reduce motion</strong>
                <small>Stops animation. Follows the OS until you override it.</small>
              </span>
              <input type="checkbox" checked={reducedMotion} onChange={onReducedMotion} />
            </label>
          </>
        )}
      </div>
    </div>
  );
}
