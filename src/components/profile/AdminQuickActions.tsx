// src/components/profile/AdminQuickActions.tsx
'use client';

import Link from "next/link";
import { AlertCircle, Users, FileText, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

interface AdminStats {
  pendingResources: number;
  pendingOpportunities: number;
  totalUsers: number;
}

interface AdminQuickActionsProps {
  stats: AdminStats;
}

export default function AdminQuickActions({ stats }: AdminQuickActionsProps) {
  const quickActions = [
    {
      label: "Pending Resources",
      count: stats.pendingResources,
      href: "/admin/resources?tab=PENDING",
      icon: FileText,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      label: "Pending Opportunities",
      count: stats.pendingOpportunities,
      href: "/admin/opportunities?tab=PENDING",
      icon: Briefcase,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      label: "Total Users",
      count: stats.totalUsers,
      href: "/admin/users",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Admin Quick Actions</h3>
        </div>
        <Link 
          href="/admin"
          className="text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
        >
          Go to Admin Dashboard →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={action.href}
              className={`block p-4 rounded-lg border ${action.borderColor} ${action.bgColor} hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {action.label}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {action.count}
                    </div>
                  </div>
                </div>
                {action.count > 0 && (
                  <div className={`w-2 h-2 rounded-full ${action.color.replace('text-', 'bg-')}`} />
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}