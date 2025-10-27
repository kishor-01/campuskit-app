// src/app/about/page.tsx
"use client";

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

// --- Reusable Animated Components ---

const ValuePropCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div 
        className="bg-card/50 border border-border p-6 rounded-lg text-center"
        variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
        }}
    >
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </motion.div>
);

const StudentCommunityVisual = () => {
    const svgVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.5, delayChildren: 0.3 } }
    };
    const pathVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: { 
            pathLength: 1, 
            opacity: 1, 
            transition: { 
                duration: 2.5 
            } 
        }
    };
    const circleVariants: Variants = {
        hidden: { scale: 0, opacity: 0 },
        visible: (i: number) => ({ 
            scale: 1, 
            opacity: 1,
            transition: { duration: 0.5, type: 'spring', stiffness: 150, delay: i * 0.15 } 
        })
    };

    return (
        <motion.div 
            className="relative w-full max-w-sm mx-auto aspect-square"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.8 }}
        >
            <motion.svg width="100%" height="100%" viewBox="0 0 200 200" variants={svgVariants}>
                <motion.path d="M 40 160 L 160 40" stroke="hsl(var(--border))" strokeWidth="0.5" variants={pathVariants} />
                <motion.path d="M 100 20 L 100 180" stroke="hsl(var(--border))" strokeWidth="0.5" variants={pathVariants} />
                <motion.path d="M 40 40 L 160 160" stroke="hsl(var(--primary))" strokeWidth="1" variants={pathVariants} />
                <motion.path d="M 160 40 L 40 40" stroke="hsl(var(--primary))" strokeWidth="1" variants={pathVariants} />
                <motion.circle cx="40" cy="40" r="10" fill="hsl(var(--primary))" custom={0} variants={circleVariants} />
                <motion.circle cx="160" cy="40" r="6" fill="hsl(var(--primary))" custom={1} variants={circleVariants} />
                <motion.circle cx="160" cy="160" r="12" fill="hsl(var(--primary))" custom={2} variants={circleVariants} />
                <motion.circle cx="40" cy="160" r="8" fill="hsl(var(--primary))" custom={3} variants={circleVariants} />
                <motion.circle 
                    cx="100" 
                    cy="100" 
                    r="5" 
                    fill="hsl(var(--card))" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth="1.5" 
                    custom={4} 
                    variants={circleVariants}
                    animate={{
                        scale: [1, 1.2, 1],
                        transition: {
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }
                    }}
                />
            </motion.svg>
        </motion.div>
    );
};

// --- Main Page Component ---
export default function AboutPage() {
  const cyclingWords = ["mentor", "guide", "senior"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % cyclingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [cyclingWords.length]);

  const missionText = "To be the go-to online platform for college students, acting as the 'clever senior' every student wishes they had.";
  const missionWords = missionText.split(" ");
  
  const valueProps = [
    { icon: <Search size={24} />, title: "Curated Content", description: "We cut through the noise, providing only the best, vetted resources so you don't have to." },
    { icon: <Clock size={24} />, title: "Save Time & Money", description: "Our focus on high-quality free content means you can learn more without breaking the bank." },
    { icon: <Zap size={24} />, title: "Build Real Skills", description: "Follow our curated roadmaps and use top-tier tools to build a portfolio that stands out." }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-28 px-4 bg-background overflow-hidden">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-extrabold text-foreground"
        >
          Every student deserves a great
        </motion.h1>

        <div className="relative h-20 md:h-28 mt-2">
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-0 text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-cyan-500 to-orange-500 animate-[aurora-text_3s_ease-in-out_infinite]"
                >
                    {cyclingWords[index]}.
                </motion.span>
            </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground"
        >
          We built this platform to be that for you. Here's our story.
        </motion.p>
      </div>

      {/* Mission Section */}
      <div className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ staggerChildren: 0.03 }}
            className="text-3xl md:text-4xl font-medium leading-tight text-foreground"
          >
            {missionWords.map((word, i) => (
              <motion.span
                key={i}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                className="inline-block mr-2 md:mr-3"
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        </div>
      </div>
      
      {/* Value Proposition Section */}
      <div className="py-24 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ staggerChildren: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {valueProps.map((prop) => (
                  <ValuePropCard key={prop.title} {...prop} />
              ))}
            </motion.div>
        </div>
      </div>

      {/* "For Students, By Students" Section */}
      <div className="py-24 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* FIX: The container for text is now properly constrained and animated. */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            >
                <h2 className="text-3xl font-bold text-foreground leading-snug">For Students, By Students.</h2>
                {/* FIX: Removed the typing animation and replaced with simple animated paragraphs. */}
                <motion.p 
                  className="text-muted-foreground mt-4 leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                    This platform was created to solve common college navigation challenges by centralizing trusted, quality knowledge. Our mission is to be the definitive student hub for essential tools and advice.
                </motion.p>
                <motion.p 
                  className="text-muted-foreground mt-4 leading-relaxed font-semibold"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                    We prioritize quality over quantity.
                </motion.p>
            </motion.div>
            <StudentCommunityVisual />
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 px-4 bg-muted/30 text-center border-t border-border">
         <h2 className="text-3xl font-extrabold text-foreground">Ready to Build Your Future?</h2>
         <p className="text-muted-foreground mt-2 mb-8">Start exploring our curated collection of resources today.</p>
         <motion.div
            animate={{ scale: [1, 1.03, 1], boxShadow: [ "0 0 0 0px hsl(var(--primary) / 0.3)", "0 0 0 10px hsl(var(--primary) / 0)", "0 0 0 0px hsl(var(--primary) / 0)", ], }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block rounded-lg"
        >
            <Link href="/resources" className="inline-block bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-primary/90 transition-colors">
              Explore All Resources
            </Link>
        </motion.div>
      </div>

      {/* Keyframes for the new text animation */}
      <style jsx global>{`
        @keyframes aurora-text {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-\\[aurora-text_3s_ease-in-out_infinite\\] {
            background-size: 200% 200%;
        }
      `}</style>
    </div>
  );
}

