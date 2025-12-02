import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
  resetTrigger?: number;
}

export const Timer = ({ isRunning, onTimeUpdate, resetTrigger }: TimerProps) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
  }, [resetTrigger]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const newValue = prev + 1;
        onTimeUpdate?.(newValue);
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-primary">
      <Clock className="w-6 h-6 md:w-8 md:h-8" />
      <span className="font-mono">{formatTime(seconds)}</span>
    </div>
  );
};
