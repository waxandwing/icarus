import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ArcMark } from '../assets/ArcMark';
import styles from './App.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Arc must never leave a teacher stuck on a stuck/blank screen with no way
 * forward (Canonical Brand System \u00a710: releases are judged by trust). If a
 * render error slips through, this shows a plain recovery path instead of an
 * indefinite splash or a blank white page. Local data itself is untouched \u2014
 * this only resets the view, not IndexedDB.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Arc: unrecoverable render error.', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.splash} role="alert">
          <ArcMark size={56} />
          <p>Something went sideways loading Arc.</p>
          <p style={{ fontSize: 13, opacity: 0.75 }}>
            Your saved plan is untouched {'\u2014'} reloading should fix this.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--arc-ink)',
              background: 'var(--arc-ink)',
              color: 'var(--arc-paper-white)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Reload Arc
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
