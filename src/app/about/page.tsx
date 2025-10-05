// src/app/about/page.tsx

"use client";

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import React, { useState, useEffect } from 'react';

const FounderCard = ({ name, title, bio, isAI }: { name: string, title: string, bio: string, isAI?: boolean }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.5 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.5 });

  const rotateX = useTransform(mouseY, [-150, 150], [15, -15]);
  const rotateY = useTransform(mouseX, [-150, 150], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative w-full max-w-sm h-72 rounded-xl bg-muted/50 border border-muted p-8 flex flex-col justify-center items-center"
    >
      <div style={{ transform: "translateZ(50px)" }}>
        <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center ${isAI ? 'bg-primary/20' : 'bg-muted'}`}>
          <span className="text-3xl font-bold text-primary">{isAI ? 'G' : 'K'}</span>
        </div>
        <h3 className="text-2xl font-bold text-foreground text-center">{name}</h3>
        <p className="text-primary text-center font-medium">{title}</p>
        <p className="text-muted-foreground text-center mt-2 text-sm">{bio}</p>
      </div>
    </motion.div>
  );
};


export default function AboutPage() {
  const cyclingWords = ["mentor", "guide", "pro senior"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % cyclingWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const missionText = "To be the go-to online platform for college students, acting as the 'clever senior' every student wishes they had.";
  const missionWords = missionText.split(" ");

  const timelineItems = [
    { problem: "Information Overload", solution: "Expert Curation" },
    { problem: "Wasted Time & Money", solution: "Time & Cost Savings" },
    { problem: "Missed Opportunities", solution: "Skill Building Pathways" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {/* FIX: Changed bg-white to bg-background */}
      <div className="text-center py-28 px-4 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-baseline justify-center flex-wrap"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">
            Every student deserves a...
          </h1>
          <div className="relative w-64 md:w-80 h-16 md:h-20 text-left ml-3">
            <h1 className="absolute inset-0 text-4xl md:text-5xl font-extrabold text-primary top-10">
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute"
              >
                {cyclingWords[index]}.
              </motion.span>
            </h1>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 max-w-2xl mx-auto text-lg text-muted-foreground"
        >
          We built CampusKit to be that senior for you. Here's our story.
        </motion.p>
      </div>

      {/* Mission Section */}
      <div className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
          <motion.p 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.8 }}
            transition={{ staggerChildren: 0.05 }}
            className="text-3xl md:text-4xl font-medium leading-tight text-muted-foreground"
          >
            {missionWords.map((word, i) => (
              <motion.span
                key={i}
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                className="inline-block mr-2 md:mr-3"
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        </div>
      </div>
      
      {/* Timeline Section */}
      {/* FIX: Changed bg-white to bg-background */}
      <div className="py-24 px-4 bg-background border-y border-muted">
        <div className="max-w-4xl mx-auto">
          {timelineItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 my-12"
            >
              <div className="text-right font-bold text-xl text-muted-foreground">{item.problem}</div>
              <div className="flex justify-center">
                <div className="w-4 h-4 rounded-full bg-primary"></div>
              </div>
              <div className="font-bold text-xl text-foreground">{item.solution}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">The Team</h2>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-12">
          <FounderCard name="Kishor" title="CEO & Lead Developer" bio="The visionary behind the project, ensuring we stay true to the mission." />
          <FounderCard name="Gemini Gem" title="Co-founder & Technical Partner" bio="The strategic assistant, translating vision into robust and scalable code." isAI={true} />
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 px-4 bg-muted/50 text-center">
         <h2 className="text-3xl font-extrabold text-foreground">Ready to Build Your Future?</h2>
         <motion.a
            href="/resources"
            className="inline-block mt-8 bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
          Explore All Resources
        </motion.a>
      </div>
    </div>
  );
}