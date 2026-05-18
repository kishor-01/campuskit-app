// src/app/contact/page.tsx
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendContactMessage } from "@/actions";
import { motion } from "framer-motion";
import { Youtube, Twitter, Linkedin, Instagram, Mail, Send } from "lucide-react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { toast } from "react-hot-toast"; // Added toast import

// Framer Motion Variants for staggered animations
const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

// Main Component
export default function ContactPage() {
  const [init, setInit] = useState(false);

  // --- Form State ---
  const [state, formAction] = useActionState<any, any>(sendContactMessage as any, { message: null, success: false, errors: null });
  const formRef = useRef<HTMLFormElement>(null);
  
  // Effect to show toast messages based on form state
  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (!state.success && state.message && !state.errors) {
      toast.error(state.message);
    }
  }, [state]);


  // --- Particle Background ---
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const socialIcons = [
    { icon: <Twitter />, href: "#", name: "Twitter / X" },
    { icon: <Linkedin />, href: "#", name: "LinkedIn" },
    { icon: <Youtube />, href: "#", name: "YouTube" },
    { icon: <Instagram />, href: "#", name: "Instagram" },
  ];

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden p-4">
      {init && (
        <Particles
          id="tsparticles"
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 120,
            interactivity: {
              events: { onHover: { enable: true, mode: "repulse" } },
              modes: { repulse: { distance: 80, duration: 0.4 } },
            },
            particles: {
              color: { value: "hsl(var(--muted-foreground))" },
              links: { color: "hsl(var(--muted-foreground))", distance: 150, enable: true, opacity: 0.1, width: 1 },
              move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 0.5, straight: false },
              number: { density: { enable: true }, value: 60 },
              opacity: { value: 0.2 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 2 } },
            },
            detectRetina: true,
          }}
        />
      )}
      
      {/* Container for the two cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        
        {/* Left Card: Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full bg-card/60 backdrop-blur-lg border border-border rounded-2xl shadow-2xl p-8 md:p-10"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-foreground mb-2">Get in Touch</motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-8">Send us a message and we'll get back to you.</motion.p>
          <form ref={formRef} action={formAction} className="space-y-4">
            <motion.div variants={itemVariants}>
              <input name="name" type="text" placeholder="Your Name" required className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" />
              {state.errors?.name && <p className="text-xs text-destructive mt-1">{state.errors.name[0]}</p>}
            </motion.div>
            <motion.div variants={itemVariants}>
              <input name="email" type="email" placeholder="Your Email" required className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" />
              {state.errors?.email && <p className="text-xs text-destructive mt-1">{state.errors.email[0]}</p>}
            </motion.div>
            <motion.div variants={itemVariants}>
              <textarea name="message" placeholder="Your Message" rows={5} required className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none transition-shadow" />
              {state.errors?.message && <p className="text-xs text-destructive mt-1">{state.errors.message[0]}</p>}
            </motion.div>
            <motion.div variants={itemVariants}>
              <SubmitButton text="Send Message" />
            </motion.div>
          </form>
        </motion.div>

        {/* Right Card: Socials */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full bg-card/60 backdrop-blur-lg border border-border rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col justify-center"
        >
          <motion.h3 variants={itemVariants} className="text-3xl font-bold text-foreground mb-4">Connect With Us</motion.h3>
          <motion.div variants={itemVariants} className="flex items-center space-x-3 text-muted-foreground mb-8">
            <Mail className="w-5 h-5" />
            <span>hello@campuskit.dev</span>
          </motion.div>
          {/* FIX: Changed div to motion.div to match closing tag */}
          <motion.div variants={itemVariants} className="space-y-4">
            {socialIcons.map((social) => (
              <motion.a 
                key={social.name} 
                href={social.href} 
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors group"
                variants={itemVariants}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-background rounded-md text-muted-foreground group-hover:text-primary transition-colors">
                  {social.icon}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{social.name}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

