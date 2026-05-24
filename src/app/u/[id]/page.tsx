// src/app/u/[id]/page.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { Github, Link as LinkIcon, Flame, Trophy, Award, Calendar, Shield, Crown, Edit3, Eye, UserCheck, Flag, Hexagon, Zap } from 'lucide-react';
import Image from 'next/image';
import { Role } from '@prisma/client';
import { BADGES } from '@/lib/gamificationRules';

// --- Helper functions (mirrors PassportCard logic for server rendering) ---

const getInitials = (name: string) => {
  const names = name.split(' ');
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

const getRoleLabel = (role: Role) => {
  const config: Record<string, { label: string; className: string; icon: string }> = {
    SUPER_ADMIN: { label: 'SUPER ADMIN', className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50', icon: 'Crown' },
    ADMIN: { label: 'ADMIN', className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/50', icon: 'Shield' },
    EDITOR: { label: 'EDITOR', className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50', icon: 'Edit3' },
    CONTRIBUTOR: { label: 'CONTRIBUTOR', className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800/50', icon: 'UserCheck' },
    VIEWER: { label: 'VIEWER', className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/50', icon: 'Eye' },
  };
  return config[role] || config.VIEWER;
};

const getRoleIcon = (role: Role) => {
  switch (role) {
    case Role.SUPER_ADMIN: return <Crown className="w-3 h-3" />;
    case Role.ADMIN: return <Shield className="w-3 h-3" />;
    case Role.EDITOR: return <Edit3 className="w-3 h-3" />;
    case Role.CONTRIBUTOR: return <UserCheck className="w-3 h-3" />;
    case Role.VIEWER: return <Eye className="w-3 h-3" />;
    default: return <UserCheck className="w-3 h-3" />;
  }
};

const getTitleStyle = (title: string) => {
  switch (title) {
    case "Initiate": return "text-muted-foreground";
    case "Junior Engineer": return "text-foreground/80";
    case "Senior Developer": return "text-primary";
    case "System Architect": return "bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground";
    default: return "text-muted-foreground";
  }
};

const badgeIconMap: Record<string, React.ComponentType<any>> = {
  Flag,
  Flame,
  Hexagon,
  Zap,
};

// --- Metadata generation ---

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, developerTitle: true, isPublicProfile: true },
  });

  if (!user || !user.isPublicProfile) {
    return { title: 'Profile — Seniofy' };
  }

  return {
    title: `${user.name || 'Developer'} — ${user.developerTitle} | Seniofy`,
    description: `Check out ${user.name || 'this developer'}'s Developer Passport on Seniofy. Currently ranked as ${user.developerTitle}.`,
    openGraph: {
      title: `${user.name || 'Developer'} — ${user.developerTitle}`,
      description: `Developer Passport on Seniofy`,
      type: 'profile',
    },
  };
}

// --- Page Component ---

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      education: true,
      developerTitle: true,
      badges: true,
      currentStreak: true,
      longestStreak: true,
      githubUrl: true,
      portfolioUrl: true,
      createdAt: true,
      isPublicProfile: true,
      role: true,
    },
  });

  if (!user) {
    notFound();
  }

  // Respect privacy setting
  if (!user.isPublicProfile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Private Profile</h1>
          <p className="text-muted-foreground">
            This developer has chosen to keep their profile private.
          </p>
        </div>
      </div>
    );
  }

  // Fetch contribution count for the public stats
  const totalContributions = await prisma.analyticsEvent.count({ where: { userId: user.id } });
  const savedCount = await prisma.savedResource.count({ where: { userId: user.id } });
  const submittedCount = await prisma.resource.count({ where: { submittedById: user.id } });

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  const roleConfig = getRoleLabel(user.role);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero gradient backdrop */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute -top-[40%] -right-[10%] w-[60%] h-[200%] bg-gradient-to-l from-primary/8 to-transparent blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          {/* Passport Card — Premium Read-Only */}
          <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

            <div className="p-8 md:p-10 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mb-5 border-2 border-primary/50 shadow-lg overflow-hidden">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {user.name ? getInitials(user.name) : 'SU'}
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {user.name || 'Seniofy User'}
              </h1>

              {/* Developer Title */}
              <p className={`text-lg font-semibold mb-3 ${getTitleStyle(user.developerTitle)}`}>
                {user.developerTitle}
              </p>

              {/* Role Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${roleConfig.className}`}>
                {getRoleIcon(user.role)}
                {user.role.replace('_', ' ')}
              </div>

              {/* Education */}
              <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full mb-5">
                {user.education || 'Continuous Learner'}
              </p>

              {/* Links */}
              {(user.githubUrl || user.portfolioUrl) && (
                <div className="flex gap-3 mb-6">
                  {user.githubUrl && (
                    <a
                      href={user.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-full text-sm font-medium transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {user.portfolioUrl && (
                    <a
                      href={user.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-full text-sm font-medium transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Portfolio
                    </a>
                  )}
                </div>
              )}

              {/* Badges */}
              {user.badges && user.badges.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2.5 mb-6">
                  {user.badges.map((badgeId) => {
                    const badge = BADGES.find((b) => b.id === badgeId);
                    if (!badge) return null;
                    const IconComponent = badgeIconMap[badge.icon] || Flag;
                    return (
                      <div key={badgeId} className="relative group flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-secondary/40 backdrop-blur-sm border border-border/60 flex items-center justify-center text-foreground hover:scale-110 hover:bg-secondary/70 transition-all duration-200 cursor-pointer shadow-sm">
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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 w-full border-t border-border/50 pt-6 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{savedCount}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{submittedCount}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Contributed</div>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Passport Issued: {memberSince}
              </div>
            </div>
          </div>

          {/* Stats Row — Streak & Contributions */}
          <div className="mt-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-border/40">
              {/* Current Streak */}
              <div className="flex flex-col items-center justify-center text-center p-2">
                <div className="flex items-center justify-center gap-2.5 mb-2">
                  <span className="text-4xl font-semibold tracking-tighter text-foreground">
                    {user.currentStreak}
                  </span>
                  <Flame className={`w-8 h-8 ${user.currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground/30'}`} />
                </div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                  Current Streak
                </span>
              </div>

              {/* Longest Streak */}
              <div className="flex flex-col items-center justify-center text-center p-2">
                <div className="flex items-center justify-center gap-2.5 mb-2">
                  <span className="text-4xl font-semibold tracking-tighter text-foreground">
                    {user.longestStreak}
                  </span>
                  <Trophy className="w-7 h-7 text-amber-500/80" />
                </div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                  Longest Streak
                </span>
              </div>

              {/* Total Contributions */}
              <div className="flex flex-col items-center justify-center text-center p-2">
                <div className="flex items-center justify-center gap-2.5 mb-2">
                  <span className="text-4xl font-semibold tracking-tighter text-foreground">
                    {totalContributions}
                  </span>
                  <Award className="w-7 h-7 text-indigo-500/80" />
                </div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                  Contributions
                </span>
              </div>
            </div>
          </div>

          {/* Branding footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Developer Passport powered by{' '}
              <span className="font-semibold text-primary">Seniofy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
