'use client';

import { useEffect, useRef, useState } from 'react';

interface QuizTimerProps {
  totalSeconds: number;
  onExpire: () => void;
}

export const QuizTimer = ({ totalSeconds, onExpire }: QuizTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (totalSeconds <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0 && !expiredRef.current) {
          expiredRef.current = true;
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const colorClass =
    secondsLeft <= 30
      ? 'text-red-600'
      : secondsLeft <= 60
        ? 'text-amber-600'
        : 'text-slate-700';

  return (
    <div
      className={`text-sm font-mono font-semibold tabular-nums ${colorClass}`}
    >
      {display}
    </div>
  );
};
