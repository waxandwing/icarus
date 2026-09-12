import { useEffect, useMemo, useRef, useState, type ReactNode, type SVGProps } from 'react';
import styles from './ArcTable.module.css';
import { SettingsDialog } from './ArcTableSettings';
import {
  CLEANUP_SECONDS,
  CURRENT_FLOW_INDEX,
  DEFAULT_FLOW,
  DEFAULT_PERIOD_SECONDS,
  GROUPS,
  STUDENTS,
  type AlarmVoice,
  type DisplayOverride,
  type ArcLink,
  type ClassroomStudent,
  type FlowBlock,
  type FlowKind,
  type PassKind,
  type PassRecord,
  type PassState,
  type RoomState,
  type TablePrefs,
  type ToolView,
  DEFAULT_TABLE_PREFS,
  addFlowBlock,
  addNamedStudents,
  closePass,
  durationLabel,
  elapsedSeconds,
  enabledPassKinds,
  formatClock,
  formatElapsed,
  formatSessionDate,
  formatTimer,
  isCleanup,
  isPassOverdue,
  mediaKindFromFile,
  moveFlowBlock,
  nextBlock,
  parseStudentNames,
  pickStudent,
  removeFlowBlock,
  removeStudentById,
  requestArcSync,
  resolveAccessibilityToggle,
  resolveDisplayMode,
  roomStatusLabel,
  secondsForBlock,
  startPass,
  updateFlowBlock,
} from './classroom';
import { isStudentDisplay, openStudentBoard, returnToPlanner } from './launch';

export function ArcTable() {
  const [tool, setTool] = useState<ToolView>('home');
  const [studentView, setStudentView] = useState(() => isStudentDisplay());
  const [studentBlackout, setStudentBlackout] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>('live');
  const [seconds, setSeconds] = useState(DEFAULT_PERIOD_SECONDS);
  const [running, setRunning] = useState(false);
  const [passState, setPassState] = useState<PassState>('available');
  const [roster, setRoster] = useState<ClassroomStudent[]>(() => STUDENTS.map((student) => ({ ...student })));
  const [rosterDraft, setRosterDraft] = useState('');
  const [activePass, setActivePass] = useState<PassRecord | null>(null);
  const [passLog, setPassLog] = useState<PassRecord[]>([]);
  const [arcLink, setArcLink] = useState<ArcLink>({ connected: false, lastAttemptAt: null });
  const [flow, setFlow] = useState<FlowBlock[]>(() => DEFAULT_FLOW.map((block) => ({ ...block })));
  const [currentIndex, setCurrentIndex] = useState(CURRENT_FLOW_INDEX);
  const [alarmVoice, setAlarmVoice] = useState<AlarmVoice>('chime');
  const [customAlarmUrl, setCustomAlarmUrl] = useState<string | null>(null);
  const [recordingAlarm, setRecordingAlarm] = useState(false);
  const [demoStream, setDemoStream] = useState<MediaStream | null>(null);
  const [demoVideoUrl, setDemoVideoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<TablePrefs>(DEFAULT_TABLE_PREFS);
  const [absentIds, setAbsentIds] = useState<string[]>([]);
  const [settingsPane, setSettingsPane] = useState<'class' | 'flow' | 'timer' | 'board' | 'pass' | 'demo' | 'media' | 'access' | 'roster'>('class');
  const alarmRecorder = useRef<MediaRecorder | null>(null);
  const alarmChunks = useRef<Blob[]>([]);
  const alarmPlayed = useRef(false);
  const [displayOverride, setDisplayOverride] = useState<DisplayOverride>('auto');
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [now, setNow] = useState(() => new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [highContrastOverride, setHighContrastOverride] = useState<boolean | null>(null);
  const [reducedMotionOverride, setReducedMotionOverride] = useState<boolean | null>(null);
  const [prefersMoreContrast, setPrefersMoreContrast] = useState(
    () => window.matchMedia('(prefers-contrast: more)').matches,
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const highContrast = resolveAccessibilityToggle(highContrastOverride, prefersMoreContrast);
  const reducedMotion = resolveAccessibilityToggle(reducedMotionOverride, prefersReducedMotion);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const current: FlowBlock = flow[currentIndex] ?? flow[0] ?? DEFAULT_FLOW[0];
  const upcoming = nextBlock(flow, currentIndex);
  const cleanup = isCleanup(seconds, current);
  const displayMode = resolveDisplayMode(displayOverride, viewportWidth);
  const outCount = activePass ? 1 : 0;
  const passAlertSeconds = Math.max(1, prefs.passAlertMinutes) * 60;
  const passOverdue = activePass ? isPassOverdue(activePass.outAt, now.getTime(), passAlertSeconds) : false;
  const passElapsed = activePass ? elapsedSeconds(activePass.outAt, now.getTime()) : 0;
  const progress = ((currentIndex + 0.55) / Math.max(flow.length, 1)) * 100;

  useEffect(() => {
    document.title = 'ArcTable — live classroom';
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      document.title = 'Arc — a calendar that holds your place';
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    const contrast = window.matchMedia('(prefers-contrast: more)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onContrast = () => setPrefersMoreContrast(contrast.matches);
    const onMotion = () => setPrefersReducedMotion(motion.matches);
    contrast.addEventListener('change', onContrast);
    motion.addEventListener('change', onMotion);
    return () => {
      window.removeEventListener('resize', onResize);
      contrast.removeEventListener('change', onContrast);
      motion.removeEventListener('change', onMotion);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), activePass ? 1000 : 30_000);
    return () => window.clearInterval(id);
  }, [activePass]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (document.fullscreenElement) return;
      if (settingsOpen) {
        setSettingsOpen(false);
        return;
      }
      if (tool !== 'home') {
        setTool('home');
        return;
      }
      if (roomState === 'reconnecting') {
        setRoomState('live');
        return;
      }
      if (studentView) setStudentView(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [roomState, settingsOpen, studentView, tool]);

  const toggleFullscreen = async () => {
    const node = stageRef.current;
    if (!node) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await node.requestFullscreen();
      }
    } catch {
      // Browser or embed can refuse fullscreen without a user gesture.
    }
  };

  const playAlarm = async () => {
    if (alarmVoice === 'custom' && customAlarmUrl) {
      const audio = new Audio(customAlarmUrl);
      await audio.play().catch(() => undefined);
      return;
    }
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = alarmVoice === 'bell' ? 'triangle' : 'sine';
    oscillator.frequency.value = alarmVoice === 'bell' ? 392 : 660;
    gain.gain.value = 0.14;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.2);
    oscillator.stop(context.currentTime + 1.3);
  };

  useEffect(() => {
    if (seconds !== 0) {
      alarmPlayed.current = false;
      return;
    }
    if (alarmPlayed.current) return;
    alarmPlayed.current = true;
    setRunning(false);
    void playAlarm();
    if (prefs.autoAdvance) {
      const nextIndex = currentIndex + 1;
      const next = flow[nextIndex];
      if (next) {
        setCurrentIndex(nextIndex);
        setSeconds(secondsForBlock(next.minutes));
        setRunning(true);
      }
    }
  }, [seconds, alarmVoice, customAlarmUrl, prefs.autoAdvance, currentIndex, flow]);

  useEffect(() => {
    return () => {
      demoStream?.getTracks().forEach((track) => track.stop());
    };
  }, [demoStream]);

  const selectBlock = (index: number) => {
    const block = flow[index];
    if (!block) return;
    setCurrentIndex(index);
    setSeconds(secondsForBlock(block.minutes));
    setRunning(false);
  };

  const setBlockMinutes = (index: number, minutes: number) => {
    const safe = Math.max(1, Math.min(90, Math.round(minutes) || 1));
    setFlow((blocks) => blocks.map((block, blockIndex) => (
      blockIndex === index ? { ...block, minutes: safe } : block
    )));
    if (index === currentIndex && !running) {
      setSeconds(secondsForBlock(safe));
    }
  };

  const addBlock = () => {
    const next = addFlowBlock(flow);
    const index = next.length - 1;
    const created = next[index];
    setFlow(next);
    if (created) {
      setCurrentIndex(index);
      setSeconds(secondsForBlock(created.minutes));
      setRunning(false);
    }
  };

  const attachBlockMedia = (index: number, file: File | undefined) => {
    if (!file) return;
    setFlow((blocks) => updateFlowBlock(blocks, index, {
      media: { name: file.name, url: URL.createObjectURL(file), kind: mediaKindFromFile(file) },
    }));
  };

  const patchBlock = (index: number, patch: Partial<FlowBlock>) => {
    setFlow((blocks) => updateFlowBlock(blocks, index, patch));
    if (index === currentIndex && patch.minutes && !running) {
      setSeconds(secondsForBlock(patch.minutes));
    }
  };

  const deleteBlock = (index: number) => {
    const next = removeFlowBlock(flow, index);
    setFlow(next);
    const nextIndex = Math.min(currentIndex, next.length - 1);
    setCurrentIndex(Math.max(0, nextIndex));
  };

  const shiftBlock = (index: number, direction: -1 | 1) => {
    const next = moveFlowBlock(flow, index, direction);
    setFlow(next);
    if (currentIndex === index) setCurrentIndex(index + direction);
    else if (currentIndex === index + direction) setCurrentIndex(index);
  };

  const patchPrefs = (patch: Partial<TablePrefs>) => {
    setPrefs((value) => ({ ...value, ...patch }));
  };

  const toggleAbsent = (id: string) => {
    setAbsentIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  };

  const addRosterNames = () => {
    const names = parseStudentNames(rosterDraft);
    if (names.length === 0) return;
    setRoster((list) => addNamedStudents(list, names));
    setRosterDraft('');
  };

  const syncFromArc = () => {
    setArcLink(requestArcSync(Date.now()));
  };

  const checkOutPass = (studentId: string, kind: PassKind) => {
    if (activePass) return;
    const student = roster.find((item) => item.id === studentId);
    if (!student || absentIds.includes(student.id)) return;
    setActivePass(startPass(student, kind, Date.now()));
    setPassState('active');
  };

  const checkInPass = () => {
    if (!activePass) return;
    setPassLog((log) => [closePass(activePass, Date.now()), ...log]);
    setActivePass(null);
    setPassState('available');
  };

  const startDockCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      demoStream?.getTracks().forEach((track) => track.stop());
      setDemoVideoUrl(null);
      setDemoStream(stream);
    } catch {
      setCameraError('Camera was blocked or is not available on this machine.');
    }
  };

  const stopDemoSource = () => {
    demoStream?.getTracks().forEach((track) => track.stop());
    setDemoStream(null);
    setDemoVideoUrl(null);
  };

  const attachDemoVideo = (file: File | undefined) => {
    if (!file) return;
    demoStream?.getTracks().forEach((track) => track.stop());
    setDemoStream(null);
    setDemoVideoUrl(URL.createObjectURL(file));
  };

  const startAlarmRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      alarmChunks.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) alarmChunks.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(alarmChunks.current, { type: recorder.mimeType || 'audio/webm' });
        setCustomAlarmUrl(URL.createObjectURL(blob));
        setAlarmVoice('custom');
        setRecordingAlarm(false);
      };
      alarmRecorder.current = recorder;
      recorder.start();
      setRecordingAlarm(true);
    } catch {
      setRecordingAlarm(false);
    }
  };

  const stopAlarmRecording = () => {
    alarmRecorder.current?.stop();
  };

  const time = useMemo(() => formatTimer(seconds), [seconds]);

  const endClass = () => {
    setSeconds(DEFAULT_PERIOD_SECONDS);
    setRunning(false);
    setTool('home');
    setRoomState('live');
    setStudentBlackout(false);
    setStudentView(false);
    setPassState('available');
    setActivePass(null);
    setPickedId(null);
  };

  if (studentView && studentBlackout) {
    return (
      <main className={styles.blackout} data-mode="student" data-display={displayMode} ref={stageRef}>
        <p className={styles.visuallyHidden}>Student display is fully black.</p>
        <button
          type="button"
          className={styles.ghostOnBlack}
          onClick={() => {
            if (isStudentDisplay()) return;
            setStudentView(false);
          }}
        >
          Teacher controls
        </button>
      </main>
    );
  }

  return (
    <main
      className={styles.page}
      ref={stageRef}
      data-mode={studentView ? 'student' : 'teacher'}
      data-cleanup={cleanup}
      data-display={displayMode}
      data-high-contrast={highContrast}
      data-reduced-motion={reducedMotion}
      data-large-type={prefs.largeType}
    >
      {!studentView && settingsOpen && (
        <SettingsDialog
          displayOverride={displayOverride}
          displayMode={displayMode}
          highContrast={highContrast}
          reducedMotion={reducedMotion}
          isFullscreen={isFullscreen}
          flow={flow}
          prefs={prefs}
          settingsPane={settingsPane}
          alarmVoice={alarmVoice}
          customAlarmUrl={customAlarmUrl}
          recordingAlarm={recordingAlarm}
          cameraError={cameraError}
          demoLive={Boolean(demoStream)}
          onDisplayOverride={setDisplayOverride}
          onHighContrast={() => setHighContrastOverride(!highContrast)}
          onReducedMotion={() => setReducedMotionOverride(!reducedMotion)}
          onToggleFullscreen={toggleFullscreen}
          onPane={setSettingsPane}
          onPrefs={patchPrefs}
          onPatchBlock={patchBlock}
          onMinutes={setBlockMinutes}
          onAddBlock={addBlock}
          onDeleteBlock={deleteBlock}
          onMoveBlock={shiftBlock}
          onAttachMedia={attachBlockMedia}
          currentIndex={currentIndex}
          onAlarmVoice={setAlarmVoice}
          onPlayAlarm={() => void playAlarm()}
          onStartAlarmRecording={() => void startAlarmRecording()}
          onStopAlarmRecording={stopAlarmRecording}
          onAlarmFile={(file) => {
            if (!file) return;
            setCustomAlarmUrl(URL.createObjectURL(file));
            setAlarmVoice('custom');
          }}
          onStartCamera={() => void startDockCamera()}
          onDemoVideo={attachDemoVideo}
          onStopDemo={stopDemoSource}
          roster={roster}
          rosterDraft={rosterDraft}
          arcLink={arcLink}
          onRosterDraft={setRosterDraft}
          onAddRoster={addRosterNames}
          onRemoveStudent={(id) => setRoster((list) => removeStudentById(list, id))}
          onSyncArc={syncFromArc}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <div className={styles.bezel}>
        {studentView ? (
          <StudentDisplay
            time={time}
            now={now}
            cleanup={cleanup}
            progress={progress}
            roomState={roomState}
            isFullscreen={isFullscreen}
            current={current}
            upcoming={upcoming}
            demoStream={demoStream}
            demoVideoUrl={demoVideoUrl}
            prefs={prefs}
            roster={roster}
            activePass={activePass}
            passElapsed={passElapsed}
            absentIds={absentIds}
            onExit={() => {
              if (isStudentDisplay()) return;
              setStudentView(false);
            }}
            onConnected={() => setRoomState('live')}
            onToggleFullscreen={toggleFullscreen}
            onCheckOut={checkOutPass}
            onCheckIn={checkInPass}
          />
        ) : (
          <TeacherDisplay
            time={time}
            now={now}
            running={running}
            cleanup={cleanup}
            progress={progress}
            tool={tool}
            setTool={setTool}
            passState={passState}
            setPassState={setPassState}
            outCount={outCount}
            pickedId={pickedId}
            onPick={() => setPickedId(pickStudent(passState, pickedId ?? undefined, absentIds, roster, activePass)?.id ?? null)}
            note={note}
            setNote={setNote}
            studentBlackout={studentBlackout}
            roomState={roomState}
            onPreview={() => {
              if (isStudentDisplay()) return;
              openStudentBoard();
            }}
            onHold={() => {
              setStudentBlackout(false);
              setRoomState(roomState === 'live' ? 'hold' : 'live');
            }}
            onBlackout={() => {
              if (studentBlackout) {
                setStudentBlackout(false);
                setRoomState('live');
              } else {
                setStudentBlackout(true);
                setRoomState('live');
              }
            }}
            onReconnect={() => {
              setStudentBlackout(false);
              setRoomState('reconnecting');
              setTool('more');
            }}
            onConnected={() => setRoomState('live')}
            onToggleRun={() => setRunning((value) => !value)}
            onCleanup={() => {
              const cleanupIndex = flow.findIndex((block) => block.kind === 'cleanup');
              if (cleanupIndex >= 0) {
                const block = flow[cleanupIndex];
                setCurrentIndex(cleanupIndex);
                if (block) setSeconds(secondsForBlock(block.minutes));
              } else {
                setSeconds(CLEANUP_SECONDS);
              }
              setRunning(true);
            }}
            onEndClass={endClass}
            onOpenSettings={() => setSettingsOpen(true)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            flow={flow}
            currentIndex={currentIndex}
            current={current}
            upcoming={upcoming}
            onSelectBlock={selectBlock}
            onMinutes={setBlockMinutes}
            onPatchBlock={patchBlock}
            onAddBlock={addBlock}
            onDeleteBlock={deleteBlock}
            onMoveBlock={shiftBlock}
            onAttachMedia={attachBlockMedia}
            demoStream={demoStream}
            demoVideoUrl={demoVideoUrl}
            cameraError={cameraError}
            onStartCamera={() => void startDockCamera()}
            onDemoVideo={attachDemoVideo}
            onStopDemo={stopDemoSource}
            prefs={prefs}
            absentIds={absentIds}
            onToggleAbsent={toggleAbsent}
            roster={roster}
            activePass={activePass}
            passLog={passLog}
            passOverdue={passOverdue}
            passElapsed={passElapsed}
            onCheckOut={checkOutPass}
            onCheckIn={checkInPass}
            onOpenRoster={() => {
              setSettingsPane('roster');
              setSettingsOpen(true);
            }}
          />
        )}
      </div>
    </main>
  );
}

function TeacherDisplay({
  time,
  now,
  running,
  cleanup,
  progress,
  tool,
  setTool,
  passState,
  setPassState,
  outCount,
  pickedId,
  onPick,
  note,
  setNote,
  studentBlackout,
  roomState,
  onPreview,
  onHold,
  onBlackout,
  onReconnect,
  onConnected,
  onToggleRun,
  onCleanup,
  onEndClass,
  onOpenSettings,
  isFullscreen,
  onToggleFullscreen,
  flow,
  currentIndex,
  current,
  upcoming,
  onSelectBlock,
  onMinutes,
  onPatchBlock,
  onAddBlock,
  onDeleteBlock,
  onMoveBlock,
  onAttachMedia,
  demoStream,
  demoVideoUrl,
  cameraError,
  onStartCamera,
  onDemoVideo,
  onStopDemo,
  prefs,
  absentIds,
  onToggleAbsent,
  roster,
  activePass,
  passLog,
  passOverdue,
  passElapsed,
  onCheckOut,
  onCheckIn,
  onOpenRoster,
}: {

  time: string;
  now: Date;
  running: boolean;
  cleanup: boolean;
  progress: number;
  tool: ToolView;
  setTool: (view: ToolView) => void;
  passState: PassState;
  setPassState: (state: PassState) => void;
  outCount: number;
  pickedId: string | null;
  onPick: () => void;
  note: string;
  setNote: (value: string) => void;
  studentBlackout: boolean;
  roomState: RoomState;
  onPreview: () => void;
  onHold: () => void;
  onBlackout: () => void;
  onReconnect: () => void;
  onConnected: () => void;
  onToggleRun: () => void;
  onCleanup: () => void;
  onEndClass: () => void;
  onOpenSettings: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  flow: FlowBlock[];
  currentIndex: number;
  current: FlowBlock;
  upcoming: FlowBlock | null;
  onSelectBlock: (index: number) => void;
  onMinutes: (index: number, minutes: number) => void;
  onPatchBlock: (index: number, patch: Partial<FlowBlock>) => void;
  onAddBlock: () => void;
  onDeleteBlock: (index: number) => void;
  onMoveBlock: (index: number, direction: -1 | 1) => void;
  onAttachMedia: (index: number, file: File | undefined) => void;
  demoStream: MediaStream | null;
  demoVideoUrl: string | null;
  cameraError: string | null;
  onStartCamera: () => void;
  onDemoVideo: (file: File | undefined) => void;
  onStopDemo: () => void;
  prefs: TablePrefs;
  absentIds: string[];
  onToggleAbsent: (id: string) => void;
  roster: ClassroomStudent[];
  activePass: PassRecord | null;
  passLog: PassRecord[];
  passOverdue: boolean;
  passElapsed: number;
  onCheckOut: (studentId: string, kind: PassKind) => void;
  onCheckIn: () => void;
  onOpenRoster: () => void;
}) {
  return (
    <section className={styles.teacher}>
      <span className={styles.teacherAccent} aria-hidden="true" />
      <header className={styles.teacherHeader}>
        {roomState === 'reconnecting' && (
          <div className={styles.liveBanner} role="status">
            <span>Testing the student connection. You are not stuck. Escape also exits.</span>
            <button type="button" className={styles.primaryButton} onClick={onConnected}>
              Display connected
            </button>
          </div>
        )}
        {passOverdue && activePass && (
          <div className={styles.passAlert} role="alert">
            <span>{activePass.studentName} has been out {formatElapsed(passElapsed)} ({activePass.kind}). Over {prefs.passAlertMinutes} minutes.</span>
            <button type="button" className={styles.primaryButton} onClick={onCheckIn}>Mark returned</button>
          </div>
        )}
        <div className={styles.headerBar}>
        <Lockup />
        <div className={styles.dateNav}>
          <button type="button" className={styles.iconButton} aria-label="Previous day">
            <Chevron direction="left" />
          </button>
          <time dateTime={now.toISOString()}>{formatSessionDate(now)}</time>
          <button type="button" className={styles.iconButton} aria-label="Next day">
            <Chevron direction="right" />
          </button>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.liveClock}>{formatClock(now)}</span>
          <button type="button" className={styles.iconButton} aria-label="Preview student display" onClick={onPreview}>
            <BoardIcon />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
            onClick={onToggleFullscreen}
          >
            <FullscreenIcon expanded={isFullscreen} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Open settings" onClick={onOpenSettings}>
            <SettingsIcon />
          </button>
        </div>
        </div>
      </header>

      <div className={styles.teacherBody}>
        <aside className={styles.today}>
          <p className={styles.kicker}>Today</p>
          <ol className={styles.flowList}>
            {flow.map((block, index) => {
              const state = index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming';
              return (
                <li key={block.id} data-state={state}>
                  <button type="button" className={styles.flowButton} onClick={() => onSelectBlock(index)}>
                    <span className={styles.flowIndex}>{index + 1}</span>
                    <span>
                      <strong>{block.title}</strong>
                      <small>{durationLabel(block.minutes)}</small>
                    </span>
                  </button>
                  {index === currentIndex && (
                    <div className={styles.blockEditor}>
                      <label>
                        Name
                        <input
                          value={block.title}
                          onChange={(event) => onPatchBlock(index, { title: event.target.value })}
                        />
                      </label>
                      <label className={styles.minutesField}>
                        Minutes
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={block.minutes}
                          onChange={(event) => onMinutes(index, Number(event.target.value))}
                        />
                      </label>
                      <label>
                        Type
                        <select
                          value={block.kind}
                          onChange={(event) => onPatchBlock(index, { kind: event.target.value as FlowKind })}
                        >
                          <option value="block">Class block</option>
                          <option value="demo">Demo</option>
                          <option value="cleanup">Cleanup</option>
                        </select>
                      </label>
                      <label>
                        Prompt
                        <input
                          value={block.prompt}
                          onChange={(event) => onPatchBlock(index, { prompt: event.target.value })}
                          placeholder="What should students be doing?"
                        />
                      </label>
                      <label className={styles.fileButton}>
                        {block.media ? `Replace ${block.media.name}` : 'Attach slides or media'}
                        <input type="file" onChange={(event) => onAttachMedia(index, event.target.files?.[0])} />
                      </label>
                      {block.media && (
                        <button type="button" className={styles.textButton} onClick={() => onPatchBlock(index, { media: null })}>
                          Remove media
                        </button>
                      )}
                      <div className={styles.blockEditorActions}>
                        <button type="button" className={styles.textButton} onClick={() => onMoveBlock(index, -1)}>Up</button>
                        <button type="button" className={styles.textButton} onClick={() => onMoveBlock(index, 1)}>Down</button>
                        <button type="button" className={styles.textButton} onClick={() => onDeleteBlock(index)}>Remove</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          <button type="button" className={`${styles.primaryButton} ${styles.todayAdd}`} onClick={onAddBlock}>
            + Add to Flow
          </button>
        </aside>

        <div className={styles.current}>
          <p className={styles.kicker}>Current</p>
          <h1>{current.title}</h1>
          <div className={styles.timerRow}>
            <p className={styles.timer} data-cleanup={cleanup}>{time}</p>
            <button
              type="button"
              className={styles.pause}
              onClick={onToggleRun}
              aria-label={running ? 'Pause timer' : 'Start timer'}
            >
              {running ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>
          <div className={styles.progressTrack} aria-label="Lesson progress">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.prompt}>{current.prompt}</p>
          {current.media && <BlockMediaView media={current.media} />}
          {current.kind === 'demo' && (
            <DemoStage
              stream={demoStream}
              videoUrl={demoVideoUrl}
              cameraError={cameraError}
              onStartCamera={onStartCamera}
              onDemoVideo={onDemoVideo}
              onStopDemo={onStopDemo}
            />
          )}
          <label className={styles.classNotes}>
            Class notes
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              placeholder="What needs to carry back into Arc after class?"
            />
          </label>
        </div>

        <aside className={styles.side}>
          <div className={styles.nextCard}>
            <p className={styles.kicker}>Next</p>
            <div className={styles.nextRow}>
              <div>
                <strong>{upcoming?.title ?? 'End of class'}</strong>
                <small>{upcoming ? durationLabel(upcoming.minutes) : '—'}</small>
              </div>
              <span className={styles.arrow} aria-hidden="true">→</span>
            </div>
          </div>

          <div className={styles.toolsCard}>
            <p className={styles.kicker}>Tools</p>
            {tool === 'home' ? (
              <div className={styles.toolGrid}>
                <ToolButton icon={<GroupsIcon />} label="Groups" onClick={() => setTool('groups')} />
                <ToolButton icon={<PickerIcon />} label="Picker" onClick={() => setTool('picker')} />
                <ToolButton icon={<PassIcon />} label="Pass" onClick={() => setTool('pass')} />
                <ToolButton icon={<NotesIcon />} label="Notes" onClick={() => setTool('notes')} />
                <ToolButton icon={<MediaIcon />} label="Media" onClick={() => setTool('media')} />
                <ToolButton icon={<MoreIcon />} label="More" onClick={() => setTool('more')} />
              </div>
            ) : (
              <ToolDetail
                tool={tool}
                passState={passState}
                setPassState={setPassState}
                pickedId={pickedId}
                onPick={onPick}
                note={note}
                setNote={setNote}
                onBack={() => setTool('home')}
                onReconnect={onReconnect}
                onHold={onHold}
                onBlackout={onBlackout}
                onConnected={onConnected}
                onCleanup={onCleanup}
                studentBlackout={studentBlackout}
                roomState={roomState}
                absentIds={absentIds}
                onToggleAbsent={onToggleAbsent}
                current={current}
                currentIndex={currentIndex}
                onAttachMedia={onAttachMedia}
                roster={roster}
                activePass={activePass}
                passLog={passLog}
                passElapsed={passElapsed}
                passOverdue={passOverdue}
                onCheckOut={onCheckOut}
                onCheckIn={onCheckIn}
                onOpenRoster={onOpenRoster}
                prefs={prefs}
              />
            )}
          </div>
        </aside>
      </div>

      <footer className={styles.teacherFooter}>
        <div className={styles.classSelect}>
          <span>Class</span>
          <strong>{prefs.className}</strong>
          <small>{prefs.periodName} · {prefs.roomName}</small>
        </div>
        <button type="button" className={styles.footerAction} onClick={() => setTool('pass')}>
          <PassIcon />
          Out of Room
          <strong>
            {activePass
              ? `${activePass.studentName} · ${formatElapsed(passElapsed)}${passOverdue ? ' overdue' : ''}`
              : `${outCount} student`}
          </strong>
        </button>
        <output className={styles.roomStatus} aria-live="polite">
          Student screen: {roomStatusLabel(studentBlackout, roomState)}
        </output>
        {roomState === 'reconnecting' && (
          <button type="button" className={styles.footerAction} onClick={onConnected}>
            Display connected
          </button>
        )}
        <button type="button" className={styles.footerAction} onClick={onEndClass}>
          End Class
        </button>
      </footer>
    </section>
  );
}

function ToolDetail({
  tool,
  pickedId,
  onPick,
  note,
  setNote,
  onBack,
  onReconnect,
  onHold,
  onBlackout,
  onConnected,
  onCleanup,
  studentBlackout,
  roomState,
  absentIds,
  onToggleAbsent,
  current,
  currentIndex,
  onAttachMedia,
  roster,
  activePass,
  passLog,
  passElapsed,
  passOverdue,
  onCheckOut,
  onCheckIn,
  onOpenRoster,
  prefs,
}: {
  tool: ToolView;
  passState: PassState;
  setPassState: (state: PassState) => void;
  pickedId: string | null;
  onPick: () => void;
  note: string;
  setNote: (value: string) => void;
  onBack: () => void;
  onReconnect: () => void;
  onHold: () => void;
  onBlackout: () => void;
  onConnected: () => void;
  onCleanup: () => void;
  studentBlackout: boolean;
  roomState: RoomState;
  absentIds: string[];
  onToggleAbsent: (id: string) => void;
  current: FlowBlock;
  currentIndex: number;
  onAttachMedia: (index: number, file: File | undefined) => void;
  roster: ClassroomStudent[];
  activePass: PassRecord | null;
  passLog: PassRecord[];
  passElapsed: number;
  passOverdue: boolean;
  onCheckOut: (studentId: string, kind: PassKind) => void;
  onCheckIn: () => void;
  onOpenRoster: () => void;
  prefs: TablePrefs;
}) {
  const picked = roster.find((student) => student.id === pickedId);
  const passKinds = enabledPassKinds(prefs);

  return (
    <div className={styles.toolDetail}>
      {tool === 'groups' && (
        <ul className={styles.plainList}>
          {GROUPS.map((group) => (
            <li key={group.id}>
              <strong>{group.name}</strong>
              <span>{roster.filter((student) => student.group === group.id).length}</span>
            </li>
          ))}
        </ul>
      )}
      {tool === 'picker' && (
        <>
          <p className={styles.detailCopy}>Cross out anyone who is not here. Pass holders and absences stay out of the pool. Add names in Settings → Roster, or sync from Arc when that link exists.</p>
          <button type="button" className={styles.textButton} onClick={onOpenRoster}>Edit student list</button>
          <ul className={styles.rosterList}>
            {roster.map((student) => {
              const absent = absentIds.includes(student.id);
              return (
                <li key={student.id} data-absent={absent}>
                  <button type="button" className={styles.textButton} onClick={() => onToggleAbsent(student.id)}>
                    {absent ? `Restore ${student.name}` : `Cross out ${student.name}`}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className={styles.picked}>{picked ? picked.name : 'No student picked yet.'}</p>
          <button type="button" className={styles.primaryButton} onClick={onPick}>Pick a student</button>
        </>
      )}
      {tool === 'pass' && (
        <PassDesk
          roster={roster}
          absentIds={absentIds}
          activePass={activePass}
          passLog={passLog}
          passElapsed={passElapsed}
          passOverdue={passOverdue}
          kinds={passKinds}
          onCheckOut={onCheckOut}
          onCheckIn={onCheckIn}
        />
      )}
      {tool === 'notes' && (
        <textarea
          className={styles.noteField}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={6}
          placeholder="What needs to carry back into planning?"
        />
      )}
      {tool === 'media' && (
        <>
          <p className={styles.detailCopy}>
            {current.media
              ? `${current.media.name} is on this block.`
              : 'No resource linked. Attach slides, a still, or a clip to this block.'}
          </p>
          <label className={styles.fileButton}>
            Attach media
            <input type="file" onChange={(event) => onAttachMedia(currentIndex, event.target.files?.[0])} />
          </label>
        </>
      )}
      {tool === 'more' && (
        <div className={styles.moreActions}>
          <button type="button" className={styles.secondaryButton} onClick={onHold}>
            {roomState === 'hold' ? 'Return live' : 'Hold display'}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={onBlackout}>
            {studentBlackout ? 'Resume display' : 'Blackout'}
          </button>
          {roomState === 'reconnecting' ? (
            <button type="button" className={styles.secondaryButton} onClick={onConnected}>Display connected — exit test</button>
          ) : (
            <button type="button" className={styles.secondaryButton} onClick={onReconnect}>Test connection</button>
          )}
          <button type="button" className={styles.secondaryButton} onClick={onCleanup}>Jump to cleanup</button>
        </div>
      )}
      <button type="button" className={styles.textButton} onClick={onBack}>Back to tools</button>
    </div>
  );
}

function PassDesk({
  roster,
  absentIds,
  activePass,
  passLog,
  passElapsed,
  passOverdue,
  kinds,
  onCheckOut,
  onCheckIn,
}: {
  roster: ClassroomStudent[];
  absentIds: string[];
  activePass: PassRecord | null;
  passLog: PassRecord[];
  passElapsed: number;
  passOverdue: boolean;
  kinds: PassKind[];
  onCheckOut: (studentId: string, kind: PassKind) => void;
  onCheckIn: () => void;
}) {
  const [kind, setKind] = useState<PassKind>(kinds[0] ?? 'bathroom');
  const available = roster.filter((student) => !absentIds.includes(student.id) && student.id !== activePass?.studentId);

  return (
    <>
      {activePass ? (
        <>
          <p className={styles.detailCopy}>
            {activePass.studentName} · {activePass.kind} · {formatElapsed(passElapsed)}
            {passOverdue ? ' · overdue' : ''}
          </p>
          <button type="button" className={styles.primaryButton} onClick={onCheckIn}>Mark returned</button>
        </>
      ) : (
        <>
          <p className={styles.detailCopy}>Issue the hall pass from here, or students sign out on the board by name.</p>
          <label className={styles.settingsField}>
            Destination
            <select value={kind} onChange={(event) => setKind(event.target.value as PassKind)}>
              {kinds.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <ul className={styles.rosterList}>
            {available.map((student) => (
              <li key={student.id}>
                <button type="button" className={styles.textButton} onClick={() => onCheckOut(student.id, kind)}>
                  Send {student.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {passLog.length > 0 && (
        <>
          <p className={styles.kicker}>Recorded today</p>
          <ul className={styles.plainList}>
            {passLog.slice(0, 8).map((trip) => (
              <li key={trip.id}>
                <strong>{trip.studentName}</strong>
                <span>
                  {trip.kind} · {formatElapsed(elapsedSeconds(trip.outAt, trip.inAt ?? trip.outAt))}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function StudentDisplay({
  time,
  now,
  cleanup,
  progress,
  roomState,
  isFullscreen,
  current,
  upcoming,
  demoStream,
  demoVideoUrl,
  prefs,
  roster,
  activePass,
  passElapsed,
  absentIds,
  onExit,
  onConnected,
  onToggleFullscreen,
  onCheckOut,
  onCheckIn,
}: {
  time: string;
  now: Date;
  cleanup: boolean;
  progress: number;
  roomState: RoomState;
  isFullscreen: boolean;
  current: FlowBlock;
  upcoming: FlowBlock | null;
  demoStream: MediaStream | null;
  demoVideoUrl: string | null;
  prefs: TablePrefs;
  roster: ClassroomStudent[];
  activePass: PassRecord | null;
  passElapsed: number;
  absentIds: string[];
  onExit: () => void;
  onConnected: () => void;
  onToggleFullscreen: () => void;
  onCheckOut: (studentId: string, kind: PassKind) => void;
  onCheckIn: () => void;
}) {
  const passKinds = enabledPassKinds(prefs);
  const [passKind, setPassKind] = useState<PassKind | null>(null);
  const hasMaterials = Boolean(current.media || demoStream || demoVideoUrl);

  return (
    <section className={styles.student}>
      <span className={`${styles.shape} ${styles.shapeMustard}`} aria-hidden="true" />
      <span className={`${styles.shape} ${styles.shapeClay}`} aria-hidden="true" />
      <span className={`${styles.shape} ${styles.shapeSlate}`} aria-hidden="true" />
      <header className={styles.studentHeader}>
        <Lockup />
        <p>
          {prefs.className}
          {prefs.teacherName ? ` · ${prefs.teacherName}` : ''}
          <span aria-hidden="true"> • </span>
          {prefs.periodName}
          <span aria-hidden="true"> • </span>
          <time dateTime={now.toISOString()}>{formatSessionDate(now)}</time>
        </p>
        <button type="button" className={styles.textButton} onClick={onExit}>Teacher controls</button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          onClick={onToggleFullscreen}
        >
          <FullscreenIcon expanded={isFullscreen} />
        </button>
      </header>
      <div className={styles.studentMain}>
        <div className={styles.studentStage}>
          {hasMaterials && (
            <div className={styles.studentMaterials}>
              {demoStream || demoVideoUrl ? (
                <DemoStage stream={demoStream} videoUrl={demoVideoUrl} preview />
              ) : current.media ? (
                <BlockMediaView media={current.media} />
              ) : null}
            </div>
          )}
          <h1>{current.title}</h1>
          {prefs.showPrompt && <p>{current.prompt}</p>}
          {prefs.showTimer && <p className={styles.studentTimer} data-cleanup={cleanup}>{time}</p>}
          <div className={styles.progressTrack} aria-label="Lesson progress">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <footer className={styles.studentFooter}>
        {prefs.showNext && (
        <div className={styles.footerCard}>
          <p className={styles.kicker}>Up Next</p>
          <strong>{upcoming?.title ?? 'End of class'}</strong>
        </div>
        )}
        {prefs.studentGroups && (
        <div className={styles.footerCard}>
          <p className={styles.kicker}>Groups</p>
          <strong>
            {prefs.studentMembers
              ? GROUPS.map((group) => `${group.name} (${roster.filter((student) => student.group === group.id).map((student) => student.name.split(' ')[0]).join(', ')})`).join(' · ')
              : GROUPS.map((group) => group.name).join(' · ')}
          </strong>
        </div>
        )}
        {prefs.showCleanup && (
        <div className={styles.footerCard}>
          <p className={styles.kicker}>Clean Up</p>
          <strong>{cleanup ? 'Now' : upcoming?.kind === 'cleanup' ? durationLabel(upcoming.minutes) : 'After this block'}</strong>
        </div>
        )}
        {prefs.studentClock && (
        <div className={styles.footerCard}>
          <p className={styles.kicker}>Clock</p>
          <strong>{formatClock(now)}</strong>
        </div>
        )}
        {prefs.studentPass && (
        <div className={styles.studentPassPlate}>
          <p className={styles.kicker}>Hall pass</p>
          {activePass ? (
            <>
              <strong>{activePass.studentName} · {activePass.kind} · {formatElapsed(passElapsed)}</strong>
              <button type="button" className={styles.primaryButton} onClick={onCheckIn}>I am back</button>
            </>
          ) : passKind ? (
            <>
              <strong>Who is going to the {passKind}?</strong>
              <ul className={styles.rosterList}>
                {roster.filter((student) => !absentIds.includes(student.id)).map((student) => (
                  <li key={student.id}>
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={() => {
                        onCheckOut(student.id, passKind);
                        setPassKind(null);
                      }}
                    >
                      {student.name}
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className={styles.textButton} onClick={() => setPassKind(null)}>Cancel</button>
            </>
          ) : (
            <>
              <strong>Sign out with your name</strong>
              <div className={styles.blockEditorActions}>
                {passKinds.map((kind) => (
                  <button key={kind} type="button" className={styles.secondaryButton} onClick={() => setPassKind(kind)}>
                    {kind}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        )}
      </footer>
      {roomState === 'hold' && (
        <div className={styles.hold}>
          <p>Hold</p>
          <button type="button" className={styles.secondaryButton} onClick={onExit}>Teacher controls</button>
        </div>
      )}
      {roomState === 'reconnecting' && (
        <div className={styles.hold}>
          <p className={styles.holdTitle}>Reconnecting</p>
          <p className={styles.settingsHint}>This is a connection test. Leave it with Display connected, Teacher controls, or Escape.</p>
          <button type="button" className={styles.primaryButton} onClick={onConnected}>Display connected</button>
          <button type="button" className={styles.secondaryButton} onClick={onExit}>Teacher controls</button>
        </div>
      )}
    </section>
  );
}

function Lockup() {
  return (
    <button type="button" className={styles.lockup} onClick={() => returnToPlanner()} aria-label="Back to the planner">
      <span className={styles.arcWord}>
        ar<span className={styles.arcC}>c</span>
      </span>
      <span className={styles.lockupRule} aria-hidden="true" />
      <span className={styles.tableWord}>TABLE</span>
    </button>
  );
}

function ToolButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.toolButton} onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}

function iconProps(props: SVGProps<SVGSVGElement> = {}) {
  return {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  };
}

function GroupsIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="9" cy="8" r="2.4" />
      <circle cx="16" cy="8" r="2.4" />
      <path d="M4.5 18c.4-2.6 2.5-4 4.6-4s4.2 1.4 4.6 4M12.8 18c.3-2 1.8-3.2 3.4-3.2 1.7 0 3.2 1.2 3.6 3.2" />
    </svg>
  );
}

function PickerIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20" />
    </svg>
  );
}

function PassIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );
}

function NotesIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M7 4h8l4 4v12H7z" />
      <path d="M15 4v4h4M9 12h6M9 16h4" />
    </svg>
  );
}

function MediaIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M10 10l5 2.5-5 2.5z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BoardIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="5" width="18" height="13" rx="2" />
      <path d="M8 21h8" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg {...iconProps({ width: 16, height: 16 })}>
      <path d="M9 7l7 5-7 5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg {...iconProps({ width: 16, height: 16 })}>
      <path d="M9 8h2v8H9zM14 8h2v8h-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg {...iconProps({ width: 16, height: 16 })}>
      {direction === 'left' ? <path d="M14 5l-6 7 6 7" /> : <path d="M10 5l6 7-6 7" />}
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4.5v1.6M12 17.9v1.6M4.5 12h1.6M17.9 12h1.6M6.7 6.7l1.1 1.1M16.2 16.2l1.1 1.1M17.3 6.7l-1.1 1.1M7.8 16.2l-1.1 1.1" />
    </svg>
  );
}

function FullscreenIcon({ expanded }: { expanded: boolean }) {
  return expanded ? (
    <svg {...iconProps()}>
      <path d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5" />
    </svg>
  ) : (
    <svg {...iconProps()}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );
}


function BlockMediaView({ media }: { media: NonNullable<FlowBlock['media']> }) {
  if (media.kind === 'image') {
    return <img className={styles.demoVideo} src={media.url} alt={media.name} />;
  }
  if (media.kind === 'video') {
    return <video className={styles.demoVideo} src={media.url} controls playsInline />;
  }
  return <p className={styles.detailCopy}>{media.name} is attached to this block.</p>;
}

function DemoStage({
  stream,
  videoUrl,
  cameraError,
  preview,
  onStartCamera,
  onDemoVideo,
  onStopDemo,
}: {
  stream: MediaStream | null;
  videoUrl: string | null;
  cameraError?: string | null;
  preview?: boolean;
  onStartCamera?: () => void;
  onDemoVideo?: (file: File | undefined) => void;
  onStopDemo?: () => void;
}) {
  return (
    <div className={styles.demoStage}>
      {stream ? <CameraVideo stream={stream} /> : null}
      {videoUrl ? <video className={styles.demoVideo} src={videoUrl} controls playsInline /> : null}
      {!preview && (
        <div className={styles.demoControls}>
          <button type="button" className={styles.secondaryButton} onClick={onStartCamera}>Dock camera</button>
          <label className={styles.fileButton}>
            Upload video
            <input type="file" accept="video/*" onChange={(event) => onDemoVideo?.(event.target.files?.[0])} />
          </label>
          <button type="button" className={styles.textButton} onClick={onStopDemo}>Clear</button>
        </div>
      )}
      {cameraError ? <p className={styles.settingsHint}>{cameraError}</p> : null}
    </div>
  );
}

function CameraVideo({ stream }: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    node.srcObject = stream;
    return () => {
      node.srcObject = null;
    };
  }, [stream]);
  return <video ref={videoRef} className={styles.demoVideo} autoPlay muted playsInline />;
}
