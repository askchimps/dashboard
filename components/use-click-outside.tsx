import { RefObject, useEffect, useCallback } from "react";

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  callback: () => void
) => {
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        memoizedCallback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [ref, memoizedCallback]);
};
