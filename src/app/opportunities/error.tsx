// src/app/opportunities/error.tsx
'use client'; 

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
        <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
          <Briefcase className="w-12 h-12 text-destructive" />
        </div>
      </motion.div>
      <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-4xl font-extrabold mb-4">
        Could Not Load Opportunities
      </motion.h1>
      <motion.p initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-lg text-muted-foreground max-w-xl mx-auto">
        There was an issue fetching the opportunities board. Our team is on it! Please try refreshing.
      </motion.p>
      <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} onClick={() => reset()} className="mt-8 px-8 py-3 bg-primary text-primary-foreground rounded-md font-semibold">
        Try Again
      </motion.button>
    </div>
  );
}
