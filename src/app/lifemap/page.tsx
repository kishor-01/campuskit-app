// src/app/lifemap/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import LifemapCanvas from "./LifemapCanvas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Lifemap — Seniofy",
  description: "An infinite, chronological spatial timeline to map your journey and goals.",
};

export default async function LifemapPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch nodes and edges in parallel
  let dbNodes: any[] = [];
  let dbEdges: any[] = [];
  try {
    const [fetchedNodes, fetchedEdges] = await Promise.all([
      prisma.lifemapNode.findMany({
        where: { userId },
        orderBy: { targetDate: "asc" },
      }),
      prisma.lifemapEdge.findMany({
        where: { userId },
      }),
    ]);
    dbNodes = fetchedNodes;
    dbEdges = fetchedEdges;
  } catch (error) {
    console.error("Failed to fetch lifemap data:", error);
    dbNodes = [];
    dbEdges = [];
  }

  // Serialize dates and objects for Client Component boundaries
  const initialNodes = dbNodes.map((node) => ({
    id: node.id,
    title: node.title,
    description: node.description || "",
    targetDate: node.targetDate.toISOString(),
    tags: node.tags,
    colorTheme: node.colorTheme,
    createdAt: node.createdAt.toISOString(),
    updatedAt: node.updatedAt.toISOString(),
  }));

  const initialEdges = dbEdges.map((edge) => ({
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
  }));

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative overflow-hidden bg-slate-950 text-slate-100">
      <LifemapCanvas
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        sessionUserId={userId}
      />
    </div>
  );
}
