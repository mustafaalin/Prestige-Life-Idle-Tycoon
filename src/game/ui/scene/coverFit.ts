import { useLayoutEffect, useState, type RefObject } from 'react';

// Where a 9:16 picture drawn with object-cover lands inside its box. Tall phones crop the sides,
// so scene and story positions are kept as fractions of the picture and mapped here.

export interface CoverFit {
  width: number;
  height: number;
  /** Picture x (0–1) → px from the box's left edge. */
  x(fraction: number): number;
  /** Picture y (0–1) → px from the box's top edge. */
  y(fraction: number): number;
  /** A length given as a share of the picture's height, in px. */
  h(fraction: number): number;
}

export function coverFit(width: number, height: number, aspect = 9 / 16): CoverFit {
  const pictureHeight = Math.max(height, width / aspect);
  const pictureWidth = pictureHeight * aspect;
  const left = (width - pictureWidth) / 2;
  const top = (height - pictureHeight) / 2;
  return {
    width,
    height,
    x: (fraction) => left + fraction * pictureWidth,
    y: (fraction) => top + fraction * pictureHeight,
    h: (fraction) => fraction * pictureHeight,
  };
}

/** Measures the box before the first paint, then follows resizes (rotation, split screen). */
export function useCoverFit(ref: RefObject<HTMLElement>, aspect = 9 / 16): CoverFit {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return coverFit(size.width, size.height, aspect);
}
