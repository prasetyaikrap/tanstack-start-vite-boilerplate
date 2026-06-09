import { useState, useEffect, useRef, useCallback } from "react";

// Type-safe representation of the spatial data we want to track
export type ResizeDimensions = Pick<
  DOMRectReadOnly,
  "width" | "height" | "top" | "right" | "bottom" | "left"
>;

/**
 * useResizeObserver Type-Safe Multi-Element Custom Hook
 * @template K Union string literal type representing the element keys (e.g., 'canvas' | 'sidebar')
 */
export const useResizeObserver = <K extends string>() => {
  // Store full dimension records for each unique identifier key
  const [dimensions, setDimensions] = useState<
    Partial<Record<K, ResizeDimensions>>
  >({});

  const elementsRef = useRef<Map<K, HTMLElement>>(new Map());
  const elementKeyRef = useRef<WeakMap<HTMLElement, K>>(new WeakMap());
  const callbackRef = useRef<Map<K, (node: HTMLElement | null) => void>>(
    new Map(),
  );
  const observerRef = useRef<ResizeObserver | null>(null);

  // Type-safe callback ref factory
  const trackElement = useCallback((key: K) => {
    const existingCallback = callbackRef.current.get(key);
    if (existingCallback) {
      return existingCallback;
    }

    const callback = (node: HTMLElement | null) => {
      const existingNode = elementsRef.current.get(key);

      if (existingNode && existingNode !== node) {
        if (observerRef.current) {
          observerRef.current.unobserve(existingNode);
        }
        elementsRef.current.delete(key);
      }

      if (node) {
        elementsRef.current.set(key, node);
        elementKeyRef.current.set(node, key);
        if (observerRef.current) {
          observerRef.current.observe(node);
        }
      } else {
        if (existingNode && observerRef.current) {
          observerRef.current.unobserve(existingNode);
        }
        elementsRef.current.delete(key);
      }
    };

    callbackRef.current.set(key, callback);
    return callback;
  }, []);

  useEffect(() => {
    observerRef.current = new ResizeObserver((entries) => {
      setDimensions((prevDimensions) => {
        const nextDimensions = { ...prevDimensions } as Record<
          K,
          ResizeDimensions
        >;
        let hasChanged = false;

        for (const entry of entries) {
          const key = elementKeyRef.current.get(entry.target as HTMLElement);
          if (!key) {
            continue;
          }

          const { width, height, top, right, bottom, left } = entry.contentRect;

          // Deep compare to prevent unnecessary re-renders
          const current = prevDimensions[key];
          const dimensionsMatch =
            current &&
            current.width === width &&
            current.height === height &&
            current.top === top &&
            current.right === right &&
            current.bottom === bottom &&
            current.left === left;

          if (!dimensionsMatch) {
            nextDimensions[key] = {
              width,
              height,
              top,
              right,
              bottom,
              left,
            };
            hasChanged = true;
          }
        }
        return hasChanged ? nextDimensions : prevDimensions;
      });
    });

    // Begin observing all pre-registered elements
    elementsRef.current.forEach((node) => {
      if (observerRef.current) {
        observerRef.current.observe(node);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { dimensions, trackElement };
};
