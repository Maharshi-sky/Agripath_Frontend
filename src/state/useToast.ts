import { useCallback, useRef, useState } from 'react';

export function useToast(durationMs = 3000) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const showToast = useCallback(
    (msg: string) => {
      setMessage(msg);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setMessage(null), durationMs);
    },
    [durationMs],
  );

  const dismiss = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setMessage(null);
  }, []);

  return { message, showToast, dismiss };
}
