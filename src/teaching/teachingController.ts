import { getArcAccessToken } from '../auth/arcAuth';
import {
  liveSessionTransport,
  type LiveSession,
  type RoomProjection,
  type RosterStudent,
} from './liveSessionTransport';

export type TeacherPrivateState = {
  sectionId: string;
  lessonId: string;
  classId?: string;
  quickNote: string;
  passStudentId?: string | null;
  passStudentName?: string | null;
};

async function token() {
  const accessToken = await getArcAccessToken();
  if (!accessToken) throw new Error('Sign in to Arc before starting Teaching Mode.');
  return accessToken;
}

export const teachingController = {
  async start(input: {
    sectionId: string;
    lessonId: string;
    classId?: string;
    lessonTitle: string;
    roomProjection: RoomProjection;
  }): Promise<LiveSession> {
    const result = await liveSessionTransport.start({
      accessToken: await token(),
      classId: input.classId,
      sectionId: input.sectionId,
      lessonTitle: input.lessonTitle,
      teacherState: {
        sectionId: input.sectionId,
        lessonId: input.lessonId,
        classId: input.classId,
        quickNote: '',
        passStudentId: null,
        passStudentName: null,
      },
      roomProjection: input.roomProjection,
    });
    return result.session;
  },

  async resume() {
    return liveSessionTransport.resume(await token());
  },

  async update(sessionId: string, teacherState: TeacherPrivateState, roomProjection: RoomProjection) {
    return liveSessionTransport.update({
      accessToken: await token(),
      sessionId,
      teacherState,
      roomProjection,
    });
  },

  async roster(input: { classId?: string; sectionId?: string }): Promise<RosterStudent[]> {
    const result = await liveSessionTransport.roster({ accessToken: await token(), ...input });
    return result.roster;
  },

  async startPass(sessionId: string, studentId: string) {
    return liveSessionTransport.startPass({ accessToken: await token(), sessionId, studentId });
  },

  async returnPass(passId: string) {
    return liveSessionTransport.returnPass({ accessToken: await token(), passId });
  },

  async activePasses(input: { classId?: string; sectionId?: string }) {
    return liveSessionTransport.activePasses({ accessToken: await token(), ...input });
  },

  async end(sessionId: string) {
    return liveSessionTransport.end(await token(), sessionId);
  },
};
