// src/components/admin/SubmitButton.tsx

"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {pending ? "Saving..." : text}
    </button>
  );
}