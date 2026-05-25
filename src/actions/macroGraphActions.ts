// src/actions/macroGraphActions.ts
// Admin Forge — Macro DAG Generator: generate an entire roadmap graph from a single prompt
// CRITICAL: LLM call is OUTSIDE the Prisma $transaction to avoid timeout.
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { aiProvider } from '@/lib/ai-provider';

// ─── Auth Guard ───────────────────────────────────────────────────────────────
async function requireAdmin() {
  const session = await auth();
  const user = session?.user;
  const roleHierarchy: Record<string, number> = {
    VIEWER: 0, CONTRIBUTOR: 1, EDITOR: 2, ADMIN: 3, SUPER_ADMIN: 4,
  };
  const userLevel = roleHierarchy[user?.role ?? 'VIEWER'] ?? 0;
  if (!user || userLevel < roleHierarchy['ADMIN']) {
    throw new Error('Unauthorized: Admin access required.');
  }
  return user;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface RawNode {
  tempId: string;
  title: string;
  type: 'concept' | 'practice' | 'milestone';
  x: number;
  y: number;
}

interface RawEdge {
  source: string;
  target: string;
}

interface MacroGraphPayload {
  nodes: RawNode[];
  edges: RawEdge[];
}

// ─── Server Action ────────────────────────────────────────────────────────────
export async function generateMacroGraphAction(
  userPrompt: string,
  roadmapId: string,
  slug: string,
) {
  await requireAdmin();

  if (!userPrompt.trim()) {
    return { success: false, error: 'Prompt is required.' };
  }

  // ── STEP A: Fetch roadmap metadata for AI context ─────────────────────────
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    select: {
      title: true,
      targetAudience: true,
      prerequisiteText: true,
      outcomes: true,
    },
  });

  if (!roadmap) {
    return { success: false, error: 'Roadmap not found.' };
  }

  // ── STEP B: Call Gemini — OUTSIDE the transaction ─────────────────────────
  const contextBlock = [
    roadmap.targetAudience ? `Target Audience: ${roadmap.targetAudience}` : null,
    roadmap.prerequisiteText ? `Prerequisites: ${roadmap.prerequisiteText}` : null,
    roadmap.outcomes ? `Desired Outcomes: ${roadmap.outcomes}` : null,
  ].filter(Boolean).join('\n');

  const systemPrompt = `You are a Curriculum Architect AI. Your ONLY job is to output a strict JSON object with no markdown wrapping, no prose, no explanation — JUST raw JSON.

You are building a learning roadmap called: "${roadmap.title}"
User's specific request: "${userPrompt.trim()}"
${contextBlock ? `\nRoadmap Context:\n${contextBlock}` : ''}

Generate a Directed Acyclic Graph (DAG) of learning nodes. Rules:
1. Each node has a unique tempId like "n1", "n2", etc.
2. "type" must be exactly one of: "concept", "practice", "milestone"
3. Nodes flow LEFT TO RIGHT: increment X by 300 per column.
4. Branches flow TOP TO BOTTOM: increment Y by 200 per branch.
5. Edges represent prerequisites: source must be completed before target unlocks.
6. No cycles (this is a DAG).
7. Generate 8–15 nodes maximum.
8. Node titles must be concise (3–6 words).
9. Align the content to the target audience and outcomes above.

CRITICAL TOPOLOGY RULE: You are building a Directed Acyclic Graph (DAG). You MUST assign every node a chronological 'tier' (e.g., Tier 1, Tier 2). Edges can ONLY point from a lower tier to a higher tier (e.g., Tier 1 -> Tier 2). NEVER create an edge that points backward. NEVER create a cycle (A->B->A). Nodes in the same tier MUST have different Y values. The first tier nodes have x=0, second tier x=300, third x=600, etc.

Return ONLY this JSON shape, nothing else:
{
  "nodes": [
    { "tempId": "n1", "title": "string", "type": "concept|practice|milestone", "x": 0, "y": 0 }
  ],
  "edges": [
    { "source": "n1", "target": "n2" }
  ]
}`;

  let payload: MacroGraphPayload;
  try {
    const raw = await aiProvider.runWithFallback(systemPrompt);
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    payload = JSON.parse(cleaned) as MacroGraphPayload;
    if (!Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) {
      throw new Error('Invalid graph shape returned by AI.');
    }
  } catch (err: any) {
    console.error('[MacroGraph] AI generation error:', err);
    return { success: false, error: `AI failed: ${err.message ?? 'Unknown error'}` };
  }

  // ── STEP C: Map tempIds → real UUIDs (before opening transaction) ─────────
  const tempIdToRealId = new Map<string, string>();
  for (const n of payload.nodes) {
    tempIdToRealId.set(n.tempId, crypto.randomUUID());
  }

  // ── STEP D: Only NOW open transaction — no async LLM calls inside ─────────
  // Prisma interactive transactions with a 15-second timeout.
  try {
    await prisma.$transaction(
      async (tx) => {
        // Bulk insert nodes
        for (const n of payload.nodes) {
          await tx.learningNode.create({
            data: {
              id: tempIdToRealId.get(n.tempId)!,
              roadmapId,
              title: n.title,
              briefing: '',
              type: n.type,
              positionX: n.x,
              positionY: n.y,
            },
          });
        }

        // Bulk insert valid edges
        const validEdges = payload.edges.filter(
          (e) => tempIdToRealId.has(e.source) && tempIdToRealId.has(e.target)
        );
        for (const e of validEdges) {
          await tx.learningEdge.create({
            data: {
              roadmapId,
              sourceNodeId: tempIdToRealId.get(e.source)!,
              targetNodeId: tempIdToRealId.get(e.target)!,
            },
          });
        }
      },
      { timeout: 15000 } // 15s — plenty of time for pure DB writes with no LLM
    );
  } catch (err: any) {
    console.error('[MacroGraph] DB insert error:', err);
    return { success: false, error: `Database error: ${err.message ?? 'Unknown error'}` };
  }

  // ── Revalidate and return ──────────────────────────────────────────────────
  revalidatePath(`/admin/forge/${slug}`);
  revalidatePath(`/roadmaps/${slug}`);

  return {
    success: true,
    nodeCount: payload.nodes.length,
    edgeCount: payload.edges.filter(
      (e) => tempIdToRealId.has(e.source) && tempIdToRealId.has(e.target)
    ).length,
  };
}
