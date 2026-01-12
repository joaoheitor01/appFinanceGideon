// src/hooks/useChartResize.js
import { useRef, useState, useEffect, useCallback } from 'react';
import throttle from 'lodash.throttle'; // Assuming lodash is available or I'll add a simple throttle

// If lodash is not available, a simple throttle implementation:
const simpleThrottle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};


const useChartResize = (throttleTime = 200) => {
  const ref = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const updateDimensions = useCallback(
    simpleThrottle((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    }, throttleTime),
    [throttleTime]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(element);

    // Initial dimensions
    setDimensions({ width: element.offsetWidth, height: element.offsetHeight });

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [updateDimensions]);

  return [ref, dimensions];
};

export default useChartResize;