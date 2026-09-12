import { ArcMark } from '../assets/ArcMark';
import styles from './EntryFlow.module.css';

export function EntryEyebrow({ children }: { children: string }) {
  return <p className={styles.eyebrow}>{children}</p>;
}

export function EntryMark({ size, knockPlate = false }: { size: number; knockPlate?: boolean }) {
  const height = Math.round(size * (280 / 256));
  return (
    <div className={styles.mark} style={{ width: size, background: 'transparent' }}>
      {knockPlate ? (
        <img
          src="/assets/arc/arc-mark-alpha.png"
          width={size}
          height={height}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{ display: 'block', background: 'transparent' }}
        />
      ) : (
        <ArcMark size={size} />
      )}
    </div>
  );
}
