// src/app/contact/page.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom"; // UPDATED: Import useFormState from react-dom
import { useFormStatus } from "react-dom";
import { sendContactMessage } from "@/actions";
import { motion } from "framer-motion";
import {
  Youtube,
  Twitter,
  Facebook,
  Instagram,
  Send,
  Linkedin,
  Mail,
  ArrowRight,
} from "lucide-react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Sending..." : "Send Message"}
    </button>
  );
}

export default function ContactPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [init, setInit] = useState(false);

  const initialState = { message: "", success: false };
  // UPDATED: Changed useActionState to useFormState
  const [state, formAction] = useFormState(sendContactMessage, initialState);

  const formRef = useRef<HTMLFormElement>(null);
  const [displayMessage, setDisplayMessage] = useState({
    text: "",
    success: false,
  });

  useEffect(() => {
    if (state.message) {
      setDisplayMessage({ text: state.message, success: state.success });

      if (state.success) {
        formRef.current?.reset();
      }

      const timer = setTimeout(() => {
        setDisplayMessage({ text: "", success: false });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [state]);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // You can add logic here if needed
  };

  const socialIcons = [
    { icon: <Youtube />, href: "#", name: "YouTube" },
    { icon: <Twitter />, href: "#", name: "Twitter/X" },
    { icon: <Linkedin />, href: "#", name: "LinkedIn" },
    { icon: <Instagram />, href: "#", name: "Instagram" },
    { icon: <Facebook />, href: "#", name: "Facebook" },
    { icon: <Send />, href: "#", name: "Telegram" },
  ];

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden p-4">
      {init && (
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: "transparent" } }, // Ensures it uses the body background
            fpsLimit: 120,
            interactivity: {
              events: { onHover: { enable: true, mode: "repulse" } },
              modes: { repulse: { distance: 100, duration: 0.4 } },
            },
            particles: {
              color: { value: "hsl(var(--muted-foreground))" },
              links: {
                color: "hsl(var(--muted-foreground))",
                distance: 150,
                enable: true,
                opacity: 0.2,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "bounce" },
                random: false,
                speed: 1,
                straight: false,
              },
              number: { density: { enable: true }, value: 80 },
              opacity: { value: 0.3 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
        />
      )}

      <div
        style={{ perspective: "1200px" }}
        className="w-full max-w-lg h-[550px]"
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Front: Contact Form */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute w-full h-full bg-background/80 backdrop-blur-lg border border-muted rounded-2xl p-8 shadow-2xl"
          >
            <h2 className="text-3xl font-bold text-foreground mb-1">
              Get in Touch
            </h2>
            <p className="text-muted-foreground mb-6">
              Send us a message and we'll get back to you.
            </p>
            <form ref={formRef} action={formAction} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Your Name"
                required
                className="w-full p-3 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <input
                name="email"
                type="email"
                placeholder="Your Email"
                required
                className="w-full p-3 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                required
                className="w-full p-3 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
              />
              <SubmitButton />
              {displayMessage.text && (
                <p
                  className={`text-sm text-center ${
                    displayMessage.success ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {displayMessage.text}
                </p>
              )}
            </form>
            <button
              onClick={() => setIsFlipped(true)}
              className="text-sm text-muted-foreground hover:text-primary mt-4 flex items-center mx-auto"
            >
              Prefer direct contact or socials?{" "}
              <ArrowRight className="ml-1 w-4 h-4" />
            </button>
          </div>

          {/* Back: Social Links */}
          <div
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            className="absolute w-full h-full bg-background/80 backdrop-blur-lg border border-muted rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Connect With Us
            </h2>
            <div className="flex items-center space-x-2 text-muted-foreground mb-8">
              <Mail className="w-5 h-5" />
              <span>hello@campuskit.dev</span>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full">
              {socialIcons.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  {social.icon}
                  <span className="text-xs mt-2 text-muted-foreground">
                    {social.name}
                  </span>
                </motion.a>
              ))}
            </div>
            <button
              onClick={() => setIsFlipped(false)}
              className="text-sm text-muted-foreground hover:text-primary mt-8"
            >
              &larr; Back to form
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}