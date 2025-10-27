// src/components/profile/ProfileIdCard.tsx
'use client';

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Role } from "@prisma/client";
import { Shield, Crown, Edit3, Eye, UserCheck } from "lucide-react";

interface User {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  education?: string | null;
  role: Role;
  image?: string | null;
  createdAt: Date;
}

interface ProfileIdCardProps {
  user: User;
  savedCount: number;
  submittedCount: number;
}

const getInitials = (name: string) => {
  const names = name.split(' ');
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

const getRoleIcon = (role: Role) => {
  switch (role) {
    case Role.SUPER_ADMIN:
      return <Crown className="w-3 h-3" />;
    case Role.ADMIN:
      return <Shield className="w-3 h-3" />;
    case Role.EDITOR:
      return <Edit3 className="w-3 h-3" />;
    case Role.CONTRIBUTOR:
      return <UserCheck className="w-3 h-3" />;
    case Role.VIEWER:
      return <Eye className="w-3 h-3" />;
    default:
      return <UserCheck className="w-3 h-3" />;
  }
};

const getRoleColor = (role: Role) => {
  switch (role) {
    case Role.SUPER_ADMIN:
      return "from-purple-500 to-purple-600";
    case Role.ADMIN:
      return "from-red-500 to-red-600";
    case Role.EDITOR:
      return "from-blue-500 to-blue-600";
    case Role.CONTRIBUTOR:
      return "from-green-500 to-green-600";
    case Role.VIEWER:
      return "from-gray-500 to-gray-600";
    default:
      return "from-gray-500 to-gray-600";
  }
};

export default function ProfileIdCard({ user, savedCount, submittedCount }: ProfileIdCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-150, 150], [10, -10]);
  const rotateY = useTransform(mouseX, [-150, 150], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 flex flex-col items-center text-center shadow-lg h-full"
    >
      {/* Role Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getRoleColor(user.role)} opacity-5 rounded-xl`} />
      
      <div
        style={{ transform: "translateZ(50px)" }}
        className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mb-4 border-2 border-primary/50 shadow-lg"
      >
        {user.image ? (
          <img 
            src={user.image} 
            alt={user.name || "User"} 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-primary-foreground">
            {user.name ? getInitials(user.name) : 'CK'}
          </span>
        )}
      </div>

      <h2
        style={{ transform: "translateZ(40px)" }}
        className="text-2xl font-bold text-foreground truncate max-w-full mb-1"
      >
        {user.name || "EduLink User"}
      </h2>
      
      <p style={{ transform: "translateZ(30px)" }} className="text-sm text-muted-foreground mb-2">
        @{user.username || "username"}
      </p>

      {/* Role Badge */}
      <div
        style={{ transform: "translateZ(35px)" }}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
          user.role === Role.SUPER_ADMIN ? 'bg-purple-100 text-purple-800 border border-purple-200' :
          user.role === Role.ADMIN ? 'bg-red-100 text-red-800 border border-red-200' :
          user.role === Role.EDITOR ? 'bg-blue-100 text-blue-800 border border-blue-200' :
          user.role === Role.CONTRIBUTOR ? 'bg-green-100 text-green-800 border border-green-200' :
          'bg-gray-100 text-gray-800 border border-gray-200'
        }`}
      >
        {getRoleIcon(user.role)}
        {user.role.replace('_', ' ')}
      </div>

      <p
        style={{ transform: "translateZ(20px)" }}
        className="text-xs bg-muted/50 text-muted-foreground font-medium px-3 py-1 rounded-full mb-4"
      >
        {user.education || "Student"}
      </p>

      {/* Stats */}
      <div style={{ transform: "translateZ(25px)" }} className="grid grid-cols-2 gap-4 w-full mt-2">
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{savedCount}</div>
          <div className="text-xs text-muted-foreground">Saved</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{submittedCount}</div>
          <div className="text-xs text-muted-foreground">Submitted</div>
        </div>
      </div>

      {/* Member Since */}
      <div style={{ transform: "translateZ(15px)" }} className="mt-4 text-xs text-muted-foreground">
        Member since {memberSince}
      </div>
    </motion.div>
  );
}