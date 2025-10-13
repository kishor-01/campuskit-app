// src/components/admin/Modal.tsx
'use client'

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

function findFocusable(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // store previous focus and lock scroll
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
    const bodyStyle = document.body.style;
    bodyStyle.top = `-${window.scrollY}px`;
    bodyStyle.position = 'fixed';
    bodyStyle.left = '0';
    bodyStyle.right = '0';

    // focus first focusable element (close button)
    const focusable = findFocusable(panelRef.current);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else if (panelRef.current) {
      panelRef.current.focus();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableEls = findFocusable(panelRef.current);
        if (focusableEls.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        const current = document.activeElement as HTMLElement | null;

        if (!e.shiftKey && current === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && current === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // restore scroll position
      const top = Math.abs(parseInt(bodyStyle.top || '0', 10));
      bodyStyle.position = '';
      bodyStyle.top = '';
      window.scrollTo(0, top);
      // restore previous focus
      if (previouslyFocused.current) previouslyFocused.current.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-background rounded-lg shadow-xl w-full max-w-2xl outline-none"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            ref={panelRef}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
            aria-label={title}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">{title}</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted" aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
