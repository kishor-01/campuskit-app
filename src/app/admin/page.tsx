import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Map, 
  Briefcase, 
  FileText, 
  Shield, 
  BarChart3, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  BookOpen,
  Layers3,
  Link2,
  Inbox,
  FolderGit2,
  FlagTriangleRight,
} from 'lucide-react';
import { checkPermission, isUserAtLeast, getCurrentUser } from '@/lib/auth-utils';
import { Permission, Role } from '@prisma/client';
import { getAdminKpisAction, getNodeBottlenecksAction } from '@/actions/analyticsActions';
import BottleneckChart from '@/components/admin/BottleneckChart';

export const metadata = {
  title: 'Admin Command Center | Seniofy',
};

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  const isAdmin = await isUserAtLeast(Role.ADMIN);
  
  if (!currentUser || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-500 font-medium">Unauthorized Access</p>
      </div>
    );
  }

  // Fetch KPI & Bottleneck data
  const [kpis, bottlenecks] = await Promise.all([
    getAdminKpisAction().catch(() => ({ totalUsers: 0, newSignups: 0, activeMissions: 0 })),
    getNodeBottlenecksAction().catch(() => []),
  ]);

  const canManageUsers = await checkPermission(Permission.USER_MANAGE);
  const canManageBlog = await checkPermission(Permission.BLOG_WRITE);

  return (
    <div className="min-h-screen bg-[#020817] p-4 sm:p-8">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">Command Center</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            SaaS Analytics & Workspace Management
          </p>
        </div>
        
        {currentUser.role === Role.SUPER_ADMIN && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Shield className="w-3 h-3" />
            Super Admin
          </div>
        )}
      </div>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl">
        
        {/* ── Top Row: KPIs ── */}
        <div className="md:col-span-1 bg-slate-900/50 border border-slate-800/60 rounded-3xl p-5 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Users</p>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="text-4xl font-black text-slate-100">{kpis.totalUsers.toLocaleString()}</p>
          </div>
        </div>

        <div className="md:col-span-1 bg-slate-900/50 border border-slate-800/60 rounded-3xl p-5 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">30-Day Signups</p>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-4xl font-black text-slate-100">{kpis.newSignups.toLocaleString()}</p>
            <p className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Active Growth
            </p>
          </div>
        </div>

        <div className="md:col-span-1 lg:col-span-2 bg-slate-900/50 border border-slate-800/60 rounded-3xl p-5 flex flex-col justify-between hover:border-indigo-500/30 transition-all relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Missions</p>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black text-slate-100">{kpis.activeMissions.toLocaleString()}</p>
            <p className="text-xs font-bold text-slate-500 mt-2">
              Learners actively traversing the graph
            </p>
          </div>
        </div>

        {/* ── Middle Row: Bottlenecks Chart ── */}
        <div className="md:col-span-3 lg:col-span-4 bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Learning Node Bottlenecks</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Nodes with the highest ratio of attempts to successful completions.
              </p>
            </div>
            <div className="px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Top 5 Blocks
            </div>
          </div>
          <BottleneckChart data={bottlenecks} />
        </div>

        {/* ── Bottom Row: SaaS Navigation ── */}
        <div className="md:col-span-3 lg:col-span-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          
          <Link href="/admin" className="group p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all">
            <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center mb-3 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">Analytics</p>
            <p className="text-[10px] text-slate-500 mt-1">Dashboard</p>
          </Link>

          {canManageUsers && (
            <Link href="/admin/users" className="group p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all">
              <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center mb-3 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-200">Users</p>
              <p className="text-[10px] text-slate-500 mt-1">Manage accounts</p>
            </Link>
          )}

          <Link href="/admin/roadmaps" className="group p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all">
            <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center mb-3 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
              <Map className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">Roadmaps</p>
            <p className="text-[10px] text-slate-500 mt-1">V2 Graph Forge</p>
          </Link>

          <Link href="/admin/resources" className="group p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all">
            <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center mb-3 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">Resources</p>
            <p className="text-[10px] text-slate-500 mt-1">Library & moderation</p>
          </Link>

          <Link href="/admin/opportunities" className="group p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all">
            <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center mb-3 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
              <Briefcase className="w-4 h-4 text-pink-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">Opportunities</p>
            <p className="text-[10px] text-slate-500 mt-1">Jobs & gigs</p>
          </Link>

          {canManageBlog && (
            <Link href="/admin/blog" className="group p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all">
              <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center mb-3 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                <FileText className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-sm font-bold text-slate-200">Blog</p>
              <p className="text-[10px] text-slate-500 mt-1">Content engine</p>
            </Link>
          )}

          <Link href="/admin/categories" className="group p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all">
            <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center mb-3 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
              <Layers3 className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">Categories</p>
            <p className="text-[10px] text-slate-500 mt-1">Taxonomy</p>
          </Link>

          <Link href="/admin/submissions" className="group p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all">
            <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center mb-3 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
              <Inbox className="w-4 h-4 text-lime-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">Submissions</p>
            <p className="text-[10px] text-slate-500 mt-1">Community queue</p>
          </Link>

          <Link href="/admin/affiliates" className="group p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all">
            <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center mb-3 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
              <Link2 className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">Affiliates</p>
            <p className="text-[10px] text-slate-500 mt-1">Partner links</p>
          </Link>

          <Link href="/admin/moderation" className="group p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl hover:bg-slate-800 hover:border-red-900/40 transition-all">
            <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center mb-3 border border-slate-800 group-hover:border-red-500/40 transition-colors">
              <FlagTriangleRight className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">Reports</p>
            <p className="text-[10px] text-slate-500 mt-1">Moderation queue</p>
          </Link>

        </div>

      </div>
    </div>
  );
}