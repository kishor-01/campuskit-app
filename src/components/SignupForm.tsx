
//src/components/SignupForm.tsx

"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, BookText, Mail, Lock } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { ease: "easeOut" } },
};

export default function SignupForm() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Create an Account</h1>
        <p className="text-muted-foreground">Join EduLink to get started.</p>
      </motion.div>

      <motion.form variants={itemVariants} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input name="name" type="text" placeholder="Full Name" required className="w-full p-3 pl-10 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
        </div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input name="username" type="text" placeholder="Username" required className="w-full p-3 pl-10 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
        </div>
        <div className="relative">
          <BookText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input name="education" type="text" placeholder="Education (e.g., B.Tech CSE)" required className="w-full p-3 pl-10 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input name="email" type="email" placeholder="Email" required className="w-full p-3 pl-10 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input name="password" type="password" placeholder="Password" required className="w-full p-3 pl-10 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
        </div>
        <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors">Create Account</button>
      </motion.form>

      <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Log In</Link>
      </motion.p>
    </motion.div>
  );
}