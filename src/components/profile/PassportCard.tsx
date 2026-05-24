'use client';

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Role } from "@prisma/client";
import { Shield, Crown, Edit3, Eye, UserCheck, MapPin, Link as LinkIcon, Github, Flag, Flame, Hexagon, Zap, Share2 } from "lucide-react";
import Image from "next/image";
import { BADGES } from "@/lib/gamificationRules";
import toast from "react-hot-toast";

// Inline share button — glassmorphic, absolute-positioned
function SharePassportButton({ userId }: { userId: string }) {
  const handleShare = async () => {
    const url = `${window.location.origin}/u/${userId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Passport link copied!');
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Passport link copied!');
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Share your Developer Passport"
      className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md bg-foreground/5 border border-foreground/10 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 cursor-pointer shadow-sm"
    >
      <Share2 className="w-4 h-4" />
    </button>
  );
}

interface User {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  education?: string | null;
  role: Role;
  image?: string | null;
  createdAt: Date;
  developerTitle: string;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  badges: string[];
}

interface PassportCardProps {
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

const getTitleStyle = (title: string) => {
  switch (title) {
    case "Initiate":
      return "text-muted-foreground font-semibold";
    case "Junior Engineer":
      return "text-foreground/80 font-semibold";
    case "Senior Developer":
      return "text-primary font-bold";
    case "System Architect":
      return "bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground font-extrabold tracking-wide drop-shadow-sm";
    default:
      return "text-muted-foreground font-semibold";
  }
};

const badgeIconMap: Record<string, React.ComponentType<any>> = {
  Flag,
  Flame,
  Hexagon,
  Zap,
};

export default function PassportCard({ user, savedCount, submittedCount }: PassportCardProps) {
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
    month: 'short'
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
      {/* Share Button — absolute top-right */}
      <SharePassportButton userId={user.id} />

      {/* Role Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getRoleColor(user.role)} opacity-5 rounded-xl`} />
      
      <div
        style={{ transform: "translateZ(50px)" }}
        className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mb-4 border-2 border-primary/50 shadow-lg overflow-hidden"
      >
        {user.image ? (
          <Image 
            src={user.image} 
            alt={user.name || "User"} 
            fill
            className="object-cover"
            sizes="96px"
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
        {user.name || "Seniofy User"}
      </h2>
      
      <p style={{ transform: "translateZ(30px)" }} className={`text-sm mb-2 ${getTitleStyle(user.developerTitle)}`}>
        {user.developerTitle}
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
        {user.education || "Continuous Learner"}
      </p>
      
      {/* Links */}
      <div style={{ transform: "translateZ(25px)" }} className="flex gap-3 mb-4">
        {user.githubUrl && (
          <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Github className="w-5 h-5" />
          </a>
        )}
        {user.portfolioUrl && (
          <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <LinkIcon className="w-5 h-5" />
          </a>
        )}
      </div>

      {/* Badges Section */}
      {user.badges && user.badges.length > 0 && (
        <div style={{ transform: "translateZ(25px)" }} className="flex flex-wrap justify-center gap-2 mb-4">
          {user.badges.map((badgeId) => {
            const badge = BADGES.find((b) => b.id === badgeId);
            if (!badge) return null;
            const IconComponent = badgeIconMap[badge.icon] || Flag;
            return (
              <div key={badgeId} className="relative group flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-secondary/40 backdrop-blur-sm border border-border/60 flex items-center justify-center text-foreground hover:scale-110 hover:bg-secondary/70 transition-all duration-200 cursor-pointer shadow-sm">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full mb-2.5 z-50 flex flex-col items-center w-48 transition-all duration-200 scale-95 group-hover:scale-100 origin-bottom">
                  <div className="bg-popover text-popover-foreground text-xs rounded-lg p-2.5 shadow-xl border border-border flex flex-col gap-1 text-center font-normal">
                    <span className="font-bold text-foreground">{badge.name}</span>
                    <span className="text-[10px] text-muted-foreground">{badge.description}</span>
                  </div>
                  <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 -mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div style={{ transform: "translateZ(25px)" }} className="grid grid-cols-2 gap-4 w-full mt-2 border-t border-border/50 pt-4">
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{savedCount}</div>
          <div className="text-xs text-muted-foreground">Saved</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{submittedCount}</div>
          <div className="text-xs text-muted-foreground">Contributed</div>
        </div>
      </div>

      {/* Member Since */}
      <div style={{ transform: "translateZ(15px)" }} className="mt-4 text-xs text-muted-foreground">
        Passport Issued: {memberSince}
      </div>
    </motion.div>
  );
}
