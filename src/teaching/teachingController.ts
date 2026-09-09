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
    return liveSessionTransport.start({
      accessToken: await token(),
      classId: input.classId,
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

  async roster(sessionId: string): Promise<RosterStudent[]> {
    return liveSessionTransport.roster(await token(), sessionId);
  },

  async startPass(sessionId: string, studentId: string) {
    return liveSessionTransport.startPass(await token(), sessionId, studentId);
  },

  async returnPass(sessionId: string, passEventId: string) {
    return liveSessionTransport.returnPass(await token(), sessionId, passEventId);
  },

  async activePasses(sessionId: string) {
    return liveSessionTransport.activePasses(await token(), sessionId);
  },

  async end(sessionId: string) {
    return liveSessionTransport.end(await token(), sessionId);
  },
};
