import { useEffect, useState } from "react";

export const useAnimatedProgress = (
  isActive: boolean,
  from: number,
  to: number,
  duration = 4000,
) => {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!isActive) {
      setValue(from);
      return;
    }

    setValue(from);
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      // Ease-out: fast start, slowing down as it approaches `to`
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + eased * (to - from)));

      if (t < 1) requestAnimationFrame(tick);
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [isActive, from, to, duration]);

  return value;
};
