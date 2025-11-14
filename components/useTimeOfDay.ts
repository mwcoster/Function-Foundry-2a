
import { useState, useEffect } from 'react';
import { TimeOfDay } from '../hooks/types';

export const useTimeOfDay = (): TimeOfDay => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay());

  function getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return 'day';
    } else if (hour >= 18 && hour < 20) {
      return 'dusk';
    } else {
      return 'night';
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return timeOfDay;
};