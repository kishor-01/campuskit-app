// src/app/page.tsx

"use client";

import { Clock, PiggyBank, Rocket, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const categories = ["Career", "Programming", "Productivity", "Scholarships", "Financial"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      {/* Hero Section */}
      {/* FIX: Changed bg-white to bg-background */}
      <header className="bg-background py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            CampusKit: Curated resources, by students for students.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground"
          >
            Curated resources, tools, and opportunities to help you save time, save money, and build valuable skills. Your digital senior is here.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <a
              href="/resources"
              className="inline-block bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-300"
            >
              Explore All Resources
            </a>
          </motion.div>
        </div>
      </header>

      {/* Value Proposition Section */}
      <section className="py-16 sm:py-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* FIX: Changed bg-white to bg-background */}
            <motion.div variants={itemVariants} className="text-center p-6 bg-background rounded-lg border border-muted">
              <Clock className="w-10 h-10 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Save Time</h3>
              <p className="mt-2 text-muted-foreground">Stop endless searching. We find and vet the best free tools and guides for you.</p>
            </motion.div>
            {/* FIX: Changed bg-white to bg-background */}
            <motion.div variants={itemVariants} className="text-center p-6 bg-background rounded-lg border border-muted">
              <PiggyBank className="w-10 h-10 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Save Money</h3>
              <p className="mt-2 text-muted-foreground">Access a library of free courses, software, and deals to reduce student expenses.</p>
            </motion.div>
            {/* FIX: Changed bg-white to bg-background */}
            <motion.div variants={itemVariants} className="text-center p-6 bg-background rounded-lg border border-muted">
              <Rocket className="w-10 h-10 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Build Skills</h3>
              <p className="mt-2 text-muted-foreground">Find top-tier resources to learn in-demand skills and prepare for your future career.</p>
            </motion.div>
            {/* FIX: Changed bg-white to bg-background */}
            <motion.div variants={itemVariants} className="text-center p-6 bg-background rounded-lg border border-muted">
              <Compass className="w-10 h-10 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Explore Unknown</h3>
              <p className="mt-2 text-muted-foreground">Discover new fields and opportunities you might not have found otherwise.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Featured Categories Section */}
       {/* FIX: Changed bg-white to bg-background */}
      <section id="resources" className="bg-background py-16 sm:py-20 border-t border-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Start Exploring</h2>
          </div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-5 lg:max-w-none"
          >
            {categories.map((category) => (
              <motion.a variants={itemVariants} key={category} href="/resources" className="block p-8 bg-muted/50 rounded-xl shadow-sm hover:shadow-lg hover:bg-primary/10 transition duration-300">
                <h3 className="text-xl font-semibold text-foreground text-center">{category}</h3>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-foreground">Ready to Level Up Your Learning Experience?</h2>
          <div className="mt-8">
            <a
              href="/resources"
              className="inline-block bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-300"
            >
              Browse Resources
            </a>
          </div>
        </div>
      </section>
    </>
  );
}