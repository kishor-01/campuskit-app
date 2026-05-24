/**
 * graphEngine.ts — Constellation Engine DAG Utility
 *
 * Pure function that computes the lock/unlock/completion status of every
 * LearningNode based on the DAG edge structure and the user's progress.
 *
 * Rules:
 *  - A node with NO incoming edges is always UNLOCKED (root node).
 *  - A node with incoming edges is UNLOCKED only if ALL prerequisite
 *    source nodes are COMPLETED by the user.
 *  - If a node's id is in the completedNodeIds set, its status is COMPLETED
 *    (regardless — you can't un-complete something that's done).
 *  - Otherwise the node is LOCKED.
 */

export type NodeStatus = 'LOCKED' | 'UNLOCKED' | 'COMPLETED';

export interface GraphNode {
  id: string;
}

export interface GraphEdge {
  sourceNodeId: string;
  targetNodeId: string;
}

/**
 * computeNodeStatuses
 *
 * @param nodes          - All LearningNodes for the roadmap
 * @param edges          - All LearningEdges for the roadmap
 * @param completedIds   - Set of nodeIds the current user has COMPLETED
 * @returns              - Map<nodeId, NodeStatus>
 */
export function computeNodeStatuses(
  nodes: GraphNode[],
  edges: GraphEdge[],
  completedIds: Set<string>
): Map<string, NodeStatus> {
  // Build an adjacency map: targetNodeId -> [sourceNodeIds] (incoming edges)
  const prerequisiteMap = new Map<string, string[]>();

  for (const node of nodes) {
    prerequisiteMap.set(node.id, []);
  }

  for (const edge of edges) {
    const prereqs = prerequisiteMap.get(edge.targetNodeId) ?? [];
    prereqs.push(edge.sourceNodeId);
    prerequisiteMap.set(edge.targetNodeId, prereqs);
  }

  const statusMap = new Map<string, NodeStatus>();

  for (const node of nodes) {
    const prereqs = prerequisiteMap.get(node.id) ?? [];

    if (completedIds.has(node.id)) {
      // Always mark as COMPLETED if the user has completed it
      statusMap.set(node.id, 'COMPLETED');
    } else if (prereqs.length === 0) {
      // Root node — no prerequisites, always UNLOCKED
      statusMap.set(node.id, 'UNLOCKED');
    } else {
      // UNLOCKED only if every prerequisite is COMPLETED
      const allPrereqsCompleted = prereqs.every((srcId) => completedIds.has(srcId));
      statusMap.set(node.id, allPrereqsCompleted ? 'UNLOCKED' : 'LOCKED');
    }
  }

  return statusMap;
}

/**
 * topologicallySortNodes
 *
 * Groups nodes into an array of "Tiers" or "Phases" based on their edge depth.
 * Nodes with no incoming edges are Tier 0. Nodes that only depend on Tier 0 are Tier 1, etc.
 * Uses Kahn's algorithm for topological sorting, processed level by level.
 *
 * @param nodes - Array of nodes (must at least have an id)
 * @param edges - Array of edges connecting the nodes
 * @returns     - Array of arrays, where each inner array is a tier/phase of nodes
 */
export function topologicallySortNodes<T extends GraphNode>(
  nodes: T[],
  edges: GraphEdge[]
): T[][] {
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();
  const nodeMap = new Map<string, T>();

  // Initialize maps
  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
    nodeMap.set(node.id, node);
  }

  // Build graph and calculate in-degrees
  for (const edge of edges) {
    if (inDegree.has(edge.targetNodeId)) {
      inDegree.set(edge.targetNodeId, (inDegree.get(edge.targetNodeId) || 0) + 1);
    }
    if (adjList.has(edge.sourceNodeId)) {
      adjList.get(edge.sourceNodeId)!.push(edge.targetNodeId);
    }
  }

  const tiers: T[][] = [];
  let currentQueue: string[] = [];

  // Find all nodes with in-degree 0 (Tier 0)
  for (const [nodeId, degree] of inDegree.entries()) {
    if (degree === 0) {
      currentQueue.push(nodeId);
    }
  }

  // Process level by level
  while (currentQueue.length > 0) {
    const nextQueue: string[] = [];
    const currentTier: T[] = [];

    for (const nodeId of currentQueue) {
      currentTier.push(nodeMap.get(nodeId)!);

      const neighbors = adjList.get(nodeId) || [];
      for (const neighborId of neighbors) {
        const currentDegree = inDegree.get(neighborId)! - 1;
        inDegree.set(neighborId, currentDegree);

        if (currentDegree === 0) {
          nextQueue.push(neighborId);
        }
      }
    }

    // Add current tier to results
    if (currentTier.length > 0) {
      tiers.push(currentTier);
    }

    // Move to next tier
    currentQueue = nextQueue;
  }

  // If there's a cycle, some nodes will be left out. 
  // For a valid DAG, all nodes are returned.
  return tiers;
}

