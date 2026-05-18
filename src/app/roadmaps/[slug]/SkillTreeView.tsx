// src/app/roadmaps/[slug]/SkillTreeView.tsx
'use client';

import MermaidRenderer from '@/components/MermaidRenderer';

type Branch = {
  id: string;
  title: string;
  color?: string | null;
  order: number;
};

type Step = {
  id: string;
  title: string;
  order: number;
  branchId?: string | null;
};

type SkillTreeViewProps = {
  roadmapTitle: string;
  branches: Branch[];
  steps: Step[];
};

/**
 * Dynamically generates a Mermaid graph TD definition from branches & steps.
 * Groups steps by branch for a clear visual hierarchy.
 * Steps without a branch appear as a linear "Core" path.
 */
export default function SkillTreeView({ roadmapTitle, branches, steps }: SkillTreeViewProps) {
  const chart = generateMermaidChart(roadmapTitle, branches, steps);

  if (!chart) return null;

  return (
    <div className="skill-tree-container mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-8 bg-primary rounded-full" />
        <h2 className="text-xl font-bold text-foreground">Skill Tree</h2>
      </div>
      <MermaidRenderer chart={chart} />

      {/* Branch legend */}
      {branches.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border text-sm"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: branch.color || 'hsl(var(--primary))' }}
              />
              <span className="font-medium text-foreground">{branch.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function sanitizeLabel(label: string): string {
  // Remove characters that break Mermaid syntax
  return label
    .replace(/"/g, "'")
    .replace(/[[\](){}]/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

function generateMermaidChart(
  roadmapTitle: string,
  branches: Branch[],
  steps: Step[]
): string {
  if (steps.length === 0) return '';

  const lines: string[] = ['graph TD'];

  // Root node
  const rootId = 'ROOT';
  lines.push(`  ${rootId}["🎯 ${sanitizeLabel(roadmapTitle)}"]`);

  // Sort branches
  const sortedBranches = [...branches].sort((a, b) => a.order - b.order);

  // Steps grouped by branch
  const branchStepsMap = new Map<string, Step[]>();
  const coreSteps: Step[] = [];

  for (const step of steps) {
    if (step.branchId) {
      const arr = branchStepsMap.get(step.branchId) || [];
      arr.push(step);
      branchStepsMap.set(step.branchId, arr);
    } else {
      coreSteps.push(step);
    }
  }

  // Core path (no branch) — linear chain from root
  const sortedCore = [...coreSteps].sort((a, b) => a.order - b.order);
  if (sortedCore.length > 0) {
    let prevId = rootId;
    for (const step of sortedCore) {
      const stepId = `S${step.order}`;
      lines.push(`  ${stepId}["${step.order}. ${sanitizeLabel(step.title)}"]`);
      lines.push(`  ${prevId} --> ${stepId}`);
      prevId = stepId;
    }

    // If there are branches, they fork from the last core step
    if (sortedBranches.length > 0) {
      for (const branch of sortedBranches) {
        const branchId = `B${branch.order}`;
        lines.push(`  ${branchId}{{"🔀 ${sanitizeLabel(branch.title)}"}}`);
        lines.push(`  ${prevId} --> ${branchId}`);

        // Branch steps
        const branchSteps = (branchStepsMap.get(branch.id) || []).sort(
          (a, b) => a.order - b.order
        );
        let bPrevId = branchId;
        for (const step of branchSteps) {
          const stepId = `B${branch.order}S${step.order}`;
          lines.push(`  ${stepId}["${step.order}. ${sanitizeLabel(step.title)}"]`);
          lines.push(`  ${bPrevId} --> ${stepId}`);
          bPrevId = stepId;
        }
      }
    }
  } else {
    // No core steps — all steps are branched
    if (sortedBranches.length > 0) {
      for (const branch of sortedBranches) {
        const branchId = `B${branch.order}`;
        lines.push(`  ${branchId}{{"🔀 ${sanitizeLabel(branch.title)}"}}`);
        lines.push(`  ${rootId} --> ${branchId}`);

        const branchSteps = (branchStepsMap.get(branch.id) || []).sort(
          (a, b) => a.order - b.order
        );
        let bPrevId = branchId;
        for (const step of branchSteps) {
          const stepId = `B${branch.order}S${step.order}`;
          lines.push(`  ${stepId}["${step.order}. ${sanitizeLabel(step.title)}"]`);
          lines.push(`  ${bPrevId} --> ${stepId}`);
          bPrevId = stepId;
        }
      }
    } else {
      // All steps are unbranched — simple linear from root
      let prevId = rootId;
      const sorted = [...steps].sort((a, b) => a.order - b.order);
      for (const step of sorted) {
        const stepId = `S${step.order}`;
        lines.push(`  ${stepId}["${step.order}. ${sanitizeLabel(step.title)}"]`);
        lines.push(`  ${prevId} --> ${stepId}`);
        prevId = stepId;
      }
    }
  }

  // Styling — use accent color for root so it works in both light/dark themes
  lines.push('');
  lines.push(`  style ${rootId} fill:#6366f1,stroke:#6366f1,color:#fff,stroke-width:2px`);

  // Color branch nodes
  for (const branch of sortedBranches) {
    const branchId = `B${branch.order}`;
    const color = branch.color || '#6366f1';
    lines.push(`  style ${branchId} fill:${color},stroke:${color},color:#fff,stroke-width:2px`);
  }

  return lines.join('\n');
}
