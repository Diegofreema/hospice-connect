import { useCallback, useEffect, useState } from 'react';

export const useTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const startTimer = useCallback(() => {
    setTimeLeft(60); // Reset to 60 seconds
  }, []);
  useEffect(() => {
    if (timeLeft <= 0) return; // Stop if timer reaches 0

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId); // Clear interval when timer reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Update every second

    // Cleanup interval on unmount or when timeLeft changes
    return () => clearInterval(intervalId);
  }, [timeLeft]);
  return {
    timeLeft,
    startTimer,
  };
};
