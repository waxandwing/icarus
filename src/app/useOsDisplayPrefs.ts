import { useEffect, useState } from 'react';

/** OS contrast/motion are capabilities, not teacher opt-outs. */
export function useOsDisplayPrefs() {
  const [osHighContrast, setOsHighContrast] = useState(false);
  const [osReducedMotion, setOsReducedMotion] = useState(false);

  useEffect(() => {
    const contrast = window.matchMedia('(prefers-contrast: more)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setOsHighContrast(contrast.matches);
      setOsReducedMotion(motion.matches);
    };
    sync();
    contrast.addEventListener('change', sync);
    motion.addEventListener('change', sync);
    return () => {
      contrast.removeEventListener('change', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);

  return { osHighContrast, osReducedMotion };
}
