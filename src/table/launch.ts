export const TABLE_TEACHER_PATH = '/table';
export const TABLE_STUDENT_PATH = '/table?display=student';

export function isStudentDisplay(): boolean {
  return new URLSearchParams(window.location.search).get('display') === 'student';
}

/** Teacher table in this window; student board in a second browser window when allowed. */
export function startMyDay() {
  const origin = window.location.origin;
  window.open(`${origin}${TABLE_STUDENT_PATH}`, 'arctable-board');
  window.location.assign(`${origin}${TABLE_TEACHER_PATH}`);
}

export function openStudentBoard() {
  window.open(`${window.location.origin}${TABLE_STUDENT_PATH}`, 'arctable-board');
}

export function returnToPlanner() {
  window.location.assign('/');
}
