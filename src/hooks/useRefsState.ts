import { useCallback, useRef, useState } from "react";

export type RefsStateRecord<K extends string, T extends HTMLElement> = Partial<
  Record<K, T | null>
>;

/**
 * Stores multiple callback refs in React state so changes are observable.
 *
 * Example:
 * const { refs, createRef } = useRefState<"tabs" | "content", HTMLDivElement>();
 * <div ref={createRef("tabs")} />
 */
export const useRefsState = <K extends string, T extends HTMLElement>() => {
  const [refs, setRefs] = useState<RefsStateRecord<K, T>>({});
  const nodeMapRef = useRef<Map<K, T | null>>(new Map());
  const callbackMapRef = useRef<Map<K, (node: T | null) => void>>(new Map());

  const createRef = useCallback((key: K) => {
    const existingCallback = callbackMapRef.current.get(key);
    if (existingCallback) {
      return existingCallback;
    }

    const callback = (node: T | null) => {
      const previousNode = nodeMapRef.current.get(key) ?? null;
      if (previousNode === node) {
        return;
      }

      nodeMapRef.current.set(key, node);

      setRefs((previousRefs) => {
        const previousValue = previousRefs[key] ?? null;
        if (previousValue === node) {
          return previousRefs;
        }

        return {
          ...previousRefs,
          [key]: node,
        };
      });
    };

    callbackMapRef.current.set(key, callback);
    return callback;
  }, []);

  const getRef = useCallback((key: K) => refs[key] ?? null, [refs]);

  const getCurrentRef = useCallback(
    (key: K) => nodeMapRef.current.get(key) ?? null,
    [],
  );

  const refresh = useCallback((key?: K) => {
    if (typeof key !== "undefined") {
      const currentNode = nodeMapRef.current.get(key) ?? null;
      setRefs((previousRefs) => ({
        ...previousRefs,
        [key]: currentNode,
      }));
      return;
    }

    setRefs((previousRefs) => {
      const nextRefs = { ...previousRefs };
      nodeMapRef.current.forEach((node, mapKey) => {
        nextRefs[mapKey] = node;
      });
      return nextRefs;
    });
  }, []);

  return {
    refs,
    createRef,
    getRef,
    getCurrentRef,
    refresh,
  };
};
