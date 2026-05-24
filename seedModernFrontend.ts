import prisma from "./src/lib/prisma";

export const modernFrontendDAG = {
  roadmapTitle: "Modern Frontend Engineering (React & Next.js)",
  nodes: [
    {
      id: "node_1_internals",
      title: "React Fiber & Rendering Internals",
      briefing: "Move beyond 'setState'. To engineer high-performance UIs, you must understand the React Fiber architecture, the reconciliation algorithm, and how the virtual DOM diffing actually maps to browser repaints. Master useMemo and useCallback not as syntax, but as bailout mechanisms.",
      type: "concept",
      positionX: 0,
      positionY: 200,
    },
    {
      id: "node_2_state",
      title: "Atomic & Proxy State Management",
      briefing: "Redux is often overkill. Explore modern state paradigms. Master atomic state with Jotai or Recoil, and proxy-based mutable state with Zustand or Valtio. Understand how to isolate re-renders to strictly the components that subscribe to specific state slices.",
      type: "practice",
      positionX: 300,
      positionY: 100,
    },
    {
      id: "node_3_rsc",
      title: "React Server Components (RSC)",
      briefing: "The paradigm shift. Understand the fundamental difference between SSR (Server-Side Rendering) and RSCs. Learn how to stream serialized UI from the server, reduce client JavaScript bundles to zero for static content, and interleave Client and Server components safely.",
      type: "concept",
      positionX: 300,
      positionY: 300,
    },
    {
      id: "node_4_hydration",
      title: "Streaming & Suspense Boundaries",
      briefing: "Do not block the main thread. Master the use of React.Suspense to stream HTML in chunks. Understand hydration strategies, selective hydration, and how to prevent layout shifts while asynchronous data is resolving on the server.",
      type: "practice",
      positionX: 600,
      positionY: 300,
    },
    {
      id: "node_5_perf",
      title: "Core Web Vitals & Edge Caching",
      briefing: "Code doesn't matter if it's slow. Learn to audit INP (Interaction to Next Paint), LCP (Largest Contentful Paint), and CLS (Cumulative Layout Shift). Master stale-while-revalidate (SWR) caching strategies and deploying middleware to edge networks like Vercel or Cloudflare.",
      type: "concept",
      positionX: 600,
      positionY: 100,
    },
    {
      id: "node_6_architecture",
      title: "Production Architecture & Monorepos",
      briefing: "The final test. Architect a scalable frontend monorepo using Turborepo or Nx. Implement shared UI packages, enforce strict ESLint boundaries, configure CI/CD pipelines for preview deployments, and establish a design system that scales across multiple applications.",
      type: "milestone",
      positionX: 900,
      positionY: 200,
    }
  ],
  edges: [
    { sourceId: "node_1_internals", targetId: "node_2_state" },      // Branch Up
    { sourceId: "node_1_internals", targetId: "node_3_rsc" },        // Branch Down
    { sourceId: "node_3_rsc", targetId: "node_4_hydration" },        // Continue Down
    { sourceId: "node_2_state", targetId: "node_5_perf" },           // Continue Up
    { sourceId: "node_4_hydration", targetId: "node_6_architecture" }, // Merge to End
    { sourceId: "node_5_perf", targetId: "node_6_architecture" }       // Merge to End
  ]
};

async function main() {
  // Find the roadmap by title
  const roadmap = await prisma.roadmap.findUnique({
    where: { title: modernFrontendDAG.roadmapTitle },
  });

  if (!roadmap) {
    console.error(`Roadmap "${modernFrontendDAG.roadmapTitle}" not found!`);
    return;
  }

  console.log(`Found roadmap: ${roadmap.title} (ID: ${roadmap.id})`);

  // To prevent unique constraint issues and keep it clean, clear existing nodes/edges first
  await prisma.learningEdge.deleteMany({
    where: { roadmapId: roadmap.id }
  });
  await prisma.learningNode.deleteMany({
    where: { roadmapId: roadmap.id }
  });

  // Prefix IDs to ensure uniqueness across roadmaps (optional, but good practice)
  const idPrefix = 'modern_frontend_';

  console.log("Creating nodes...");
  const createdNodes = await Promise.all(modernFrontendDAG.nodes.map(node => 
    prisma.learningNode.create({
      data: {
        id: idPrefix + node.id,
        roadmapId: roadmap.id,
        title: node.title,
        briefing: node.briefing,
        type: node.type,
        positionX: node.positionX,
        positionY: node.positionY,
      }
    })
  ));
  console.log(`Created ${createdNodes.length} nodes.`);

  console.log("Creating edges...");
  const createdEdges = await Promise.all(modernFrontendDAG.edges.map(edge => 
    prisma.learningEdge.create({
      data: {
        roadmapId: roadmap.id,
        sourceNodeId: idPrefix + edge.sourceId,
        targetNodeId: idPrefix + edge.targetId,
      }
    })
  ));
  console.log(`Created ${createdEdges.length} edges.`);

  console.log("Successfully seeded Modern Frontend DAG.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
