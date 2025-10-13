// src/app/submit-resource/thank-you/page.tsx
'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function ThankYouPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45 }} className="mx-auto mb-6 w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-primary" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Thanks — your resource was submitted!</h1>
        <p className="text-lg text-muted-foreground mb-6">We’ll review it soon. If approved, it’ll appear in the resources list and the community will be able to use it.</p>

        <motion.div whileHover={{ scale: 1.03 }} className="inline-block">
          <Link href="/resources" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors">
            Back to Resources
          </Link>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-foreground">What happens next?</h3>
            <p className="text-sm text-muted-foreground mt-2">Our moderators will review your submission. If it meets our quality guidelines, we’ll publish it for the community.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-foreground">Want to contribute more?</h3>
            <p className="text-sm text-muted-foreground mt-2">Create a roadmap or suggest resources that pair well with this one — we love practical, curated suggestions.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
