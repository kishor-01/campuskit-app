import prisma from "@/lib/prisma";
import Link from "next/link";
import { Check, X, ExternalLink, Clock } from "lucide-react";
import { approveSubmission, rejectSubmission } from "@/actions/submissionActions";

export default async function AdminSubmissionsPage() {
  const submissions = await prisma.resourceSubmission.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: { name: true, email: true, username: true }
      },
      category: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Submissions Queue</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Community Submissions</h1>
        <p className="text-muted-foreground mt-1">
          Review resources submitted by the community. Approving a submission migrates it to the official resources table and updates the contributor's heatmap.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">All caught up!</h3>
            <p className="text-muted-foreground">There are no pending submissions in the queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-6 flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {sub.category.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{sub.title}</h3>
                    <a 
                      href={sub.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-1"
                    >
                      {sub.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg text-sm text-foreground">
                    {sub.description}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Submitted by: <span className="font-medium text-foreground">{sub.user.name || sub.user.username || sub.user.email}</span>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-3 lg:w-48 shrink-0">
                  <form action={async () => {
                    'use server';
                    await approveSubmission(sub.id);
                  }} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white border border-green-500/20 rounded-lg transition-colors font-medium">
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  </form>
                  
                  <form action={async () => {
                    'use server';
                    await rejectSubmission(sub.id);
                  }} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg transition-colors font-medium">
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
