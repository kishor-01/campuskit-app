// src/app/resources/page.tsx
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import ResourceList from '@/components/ResourceList';
import React from 'react';

export default async function ResourcesPage() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // Fetch initial data
    const [resources, savedResources] = await Promise.all([
      prisma.resource.findMany({
        where: { status: 'APPROVED' },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      userId ? prisma.savedResource.findMany({ where: { userId } }) : [],
    ]);

    const savedResourceIds = new Set(savedResources.map((s) => s.resourceId));
    const allResources = resources.map((resource) => ({
      ...resource,
      isInitiallySaved: savedResourceIds.has(resource.id),
    }));

    return <ResourceList resources={allResources} />;
  } catch (err) {
    console.error('ResourcesPage server error:', err);
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-6 w-28 h-28 rounded-full flex items-center justify-center animate-spin-slow" style={{ border: '6px solid rgba(0,0,0,0.06)', borderTopColor: 'hsl(var(--primary))' }} />
          <h2 className="text-2xl font-bold mb-2">Hang tight — we’re fetching resources</h2>
          <p className="text-muted-foreground max-w-md mx-auto">We hit a small snag loading resources. Our systems are looking into it; try refreshing in a bit.</p>
        </div>
        <style>{`.animate-spin-slow { animation: spin 1.6s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
}
