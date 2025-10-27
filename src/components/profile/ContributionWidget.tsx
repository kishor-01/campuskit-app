// src/components/profile/ContributionWidget.tsx
'use client';

import Link from "next/link";
import { ArrowRight, PlusCircle, Star, TrendingUp } from "lucide-react";
import { Role } from "@prisma/client";

interface ContributionWidgetProps {
  submissionCount: number;
  userRole: Role;
}

const getRoleBasedMessage = (submissionCount: number, role: Role) => {
  if (submissionCount > 0) {
    const baseMessage = `You've submitted ${submissionCount} resource${submissionCount > 1 ? 's' : ''}.`;
    
    switch (role) {
      case Role.SUPER_ADMIN:
        return `${baseMessage} Your leadership helps maintain quality!`;
      case Role.ADMIN:
        return `${baseMessage} Thank you for moderating and contributing!`;
      case Role.EDITOR:
        return `${baseMessage} Your editorial contributions are valued!`;
      case Role.CONTRIBUTOR:
        return `${baseMessage} Keep up the great contributions!`;
      case Role.VIEWER:
        return `${baseMessage} Consider becoming a regular contributor!`;
      default:
        return baseMessage;
    }
  } else {
    switch (role) {
      case Role.SUPER_ADMIN:
      case Role.ADMIN:
        return "Lead by example and share valuable resources with the community.";
      case Role.EDITOR:
        return "Your editorial expertise can help curate amazing resources.";
      case Role.CONTRIBUTOR:
        return "Start your contribution journey by sharing helpful resources.";
      case Role.VIEWER:
        return "Help the community by sharing useful resources you discover.";
      default:
        return "Help the community by sharing useful resources.";
    }
  }
};

const getRoleIcon = (role: Role) => {
  switch (role) {
    case Role.SUPER_ADMIN:
    case Role.ADMIN:
      return <Star className="w-6 h-6" />;
    case Role.EDITOR:
    case Role.CONTRIBUTOR:
      return <TrendingUp className="w-6 h-6" />;
    default:
      return <PlusCircle className="w-6 h-6" />;
  }
};

export default function ContributionWidget({ submissionCount, userRole }: ContributionWidgetProps) {
  const canSubmitResources = userRole !== Role.VIEWER;
  const message = getRoleBasedMessage(submissionCount, userRole);
  const IconComponent = getRoleIcon(userRole);

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
          {IconComponent}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {submissionCount > 0 ? "Your Contributions" : "Community Impact"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {message}
          </p>
        </div>
      </div>
      
      {canSubmitResources ? (
        <Link 
          href={submissionCount > 0 ? "/my-submissions" : "/submit-resource"}
          className="inline-flex items-center bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors w-full md:w-auto justify-center"
        >
          {submissionCount > 0 ? "View Submissions" : "Submit a Resource"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      ) : (
        <div className="text-xs text-muted-foreground text-center md:text-right">
          Upgrade to Contributor role to submit resources
        </div>
      )}
    </div>
  );
}