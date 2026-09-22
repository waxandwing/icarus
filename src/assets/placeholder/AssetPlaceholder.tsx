import styles from './AssetPlaceholder.module.css';

type PlaceholderKind = 'paper' | 'binding' | 'fridge' | 'settings' | 'taskbar' | 'accent';

interface AssetPlaceholderProps {
  kind: PlaceholderKind;
  label: string;
  className?: string;
}

export function AssetPlaceholder({ kind, label, className }: AssetPlaceholderProps) {
  return (
    <span
      className={[styles.placeholder, styles[kind], className].filter(Boolean).join(' ')}
      data-arc-placeholder={label}
      aria-hidden="true"
    />
  );
}
