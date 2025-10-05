// src/components/ProfileIdCard.tsx

"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import type { User } from "next-auth"; // Import the User type from next-auth

// A helper function to get user initials
const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

interface ProfileIdCardProps {
  user: Partial<User>; // Use Partial<User> to handle potentially missing fields
}

export default function ProfileIdCard({ user }: ProfileIdCardProps) {
  // Framer Motion hooks for the 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-200, 200], [-15, 15]);
  const rotateY = useTransform(mouseX, [-200, 200], [15, -15]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left - rect.width / 2);
    mouseY.set(event.clientY - rect.top - rect.height / 2);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
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
      className="md:col-span-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg"
    >
      <div style={{ transform: "translateZ(50px)" }} className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 border-2 border-primary/50">
        <span className="text-4xl font-bold text-primary-foreground">
          {user.name ? getInitials(user.name) : '??'}
        </span>
      </div>
      <h2 style={{ transform: "translateZ(40px)" }} className="text-2xl font-bold text-foreground truncate max-w-full">
        {user.name || "CampusKit User"}
      </h2>
      <p style={{ transform: "translateZ(30px)" }} className="text-sm text-muted-foreground">
        @{user.username || "username"}
      </p>
      <p style={{ transform: "translateZ(20px)" }} className="mt-2 text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
        {user.education || "Student"}
      </p>
    </motion.div>
  );
}