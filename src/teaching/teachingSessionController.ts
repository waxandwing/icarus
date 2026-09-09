import {
  liveSessionTransport,
  type LiveSession,
  type PassEvent,
  type RoomProjection,
  type RosterStudent,
} from './liveSessionTransport';

export type TeachingControllerState = {
  session: LiveSession | null;
  roster: RosterStudent[];
  activePasses: PassEvent[];
};

export type StartTeachingInput = {
  accessToken: string;
  sectionId: string;
  lessonTitle: string;
  teacherState: Record<string, unknown>;
  roomProjection: RoomProjection;
};

/**
 * Thin orchestration layer for the authenticated teacher client.
 *
 * Important privacy rule: roster/student identity stays in this controller.
 * The room display receives only RoomProjection, whose pass state contains a
 * public label and timestamp, never a student name or roster object.
 */
export class TeachingSessionController {
  private accessToken: string;
  private sectionId: string;
  private state: TeachingControllerState = { session: null, roster: [], activePasses: [] };

  constructor(accessToken: string, sectionId: string) {
    this.accessToken = accessToken;
    this.sectionId = sectionId;
  }

  snapshot(): TeachingControllerState {
    return {
      session: this.state.session,
      roster: [...this.state.roster],
      activePasses: [...this.state.activePasses],
    };
  }

  async start(input: Omit<StartTeachingInput, 'accessToken' | 'sectionId'>) {
    const result = await liveSessionTransport.start({
      accessToken: this.accessToken,
      sectionId: this.sectionId,
      lessonTitle: input.lessonTitle,
      teacherState: input.teacherState,
      roomProjection: input.roomProjection,
    });
    this.state.session = result.session;
    await this.refreshRosterAndPasses();
    return this.snapshot();
  }

  async resume() {
    const session = await liveSessionTransport.resume(this.accessToken);
    if (!session) {
      this.state = { session: null, roster: [], activePasses: [] };
      return this.snapshot();
    }
    this.state.session = session;
    await this.refreshRosterAndPasses();
    return this.snapshot();
  }

  async refreshRosterAndPasses() {
    const [{ roster }, passes] = await Promise.all([
      liveSessionTransport.roster({ accessToken: this.accessToken, sectionId: this.sectionId }),
      liveSessionTransport.activePasses({ accessToken: this.accessToken, sectionId: this.sectionId }),
    ]);
    this.state.roster = roster;
    this.state.activePasses = passes;
    return this.snapshot();
  }

  async update(teacherState: Record<string, unknown>, roomProjection: RoomProjection) {
    if (!this.state.session) throw new Error('session_not_started');
    this.state.session = await liveSessionTransport.update({
      accessToken: this.accessToken,
      sessionId: this.state.session.id,
      teacherState,
      roomProjection,
    });
    return this.snapshot();
  }

  async sendStudent(studentId: string) {
    if (!this.state.session) throw new Error('session_not_started');
    const pass = await liveSessionTransport.startPass({
      accessToken: this.accessToken,
      sessionId: this.state.session.id,
      studentId,
    });
    this.state.activePasses = [...this.state.activePasses, pass];
    return pass;
  }

  async markReturned(passId: string) {
    const returned = await liveSessionTransport.returnPass({
      accessToken: this.accessToken,
      passId,
    });
    this.state.activePasses = this.state.activePasses.filter((pass) => pass.id !== passId);
    return returned;
  }

  async end() {
    if (!this.state.session) return;
    await liveSessionTransport.end(this.accessToken, this.state.session.id);
    this.state = { session: null, roster: [], activePasses: [] };
  }
}
