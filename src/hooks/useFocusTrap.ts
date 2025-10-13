// src/hooks/useFocusTrap.ts
"use client";

import { useEffect } from "react";

/**
 * Simple focus trap for a container element.
 * - focuses first focusable element when open
 * - keeps tab focus inside the container
 * - restores focus is left to the consumer
 */
export default function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean
) {
  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (el) => !el.hasAttribute("disabled") && (el.offsetParent !== null || el.getClientRects().length)
    );

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (first) {
      first.focus();
    } else {
      // fallback to container if nothing focusable
      container.setAttribute("tabindex", "-1");
      container.focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab") {
        // shift + tab
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // restore focus
      try {
        previouslyFocused?.focus();
      } catch {
        // ignore focus errors
      }
    };
  }, [containerRef, isActive]);
}
