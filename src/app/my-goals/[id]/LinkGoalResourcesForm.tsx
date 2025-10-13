// src/app/my-goals/[id]/LinkGoalResourcesForm.tsx
'use client'

import { useState } from 'react';
import { Resource } from '@prisma/client';
import { linkResourcesToSubTopic, linkResourcesToTopic } from '@/actions/goalActions';
import toast from 'react-hot-toast';

type LinkedResource = {
  id?: string; // goal/topic resource id from DB
  resourceId: string;
  personalNote: string | null;
  resource: { id?: string; name: string; url?: string };
};

type Props = {
  // Backwards-compatible: supply subTopicId for subtopic links OR topicId for topic links.
  subTopicId?: string;
  topicId?: string;
  allResources: Resource[];
  initiallyLinked: LinkedResource[];
  onClose: () => void;
};

export default function LinkGoalResourcesForm({ subTopicId, topicId, allResources, initiallyLinked, onClose }: Props) {
  const [linkedResources, setLinkedResources] = useState<LinkedResource[]>(initiallyLinked ?? []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Helper: find resource metadata from allResources by id
  const findResourceMeta = (rid: string) => {
    return allResources.find(r => r.id === rid) ?? null;
  };

  const handleAddResource = (resource: Resource) => {
    // Avoid adding duplicates
    if (linkedResources.some(lr => lr.resourceId === resource.id)) {
      toast('Resource already added', { icon: 'ℹ️' });
      return;
    }

    // Add optimistically (no DB id yet)
    setLinkedResources(prev => [
      ...prev,
      {
        resourceId: resource.id,
        personalNote: '',
        resource: { id: resource.id, name: resource.name, url: resource.url ?? undefined }
      }
    ]);
  };

  const handleRemoveResource = (resourceId: string) => {
    setLinkedResources(prev => prev.filter(lr => lr.resourceId !== resourceId));
  };
  
  const handleNoteChange = (resourceId: string, note: string) => {
    setLinkedResources(prev => prev.map(lr => lr.resourceId === resourceId ? { ...lr, personalNote: note } : lr));
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!subTopicId && !topicId) {
      toast.error('No target specified for linking resources.');
      return;
    }
    setIsSaving(true);

    try {
      // Client-side dedupe by resourceId, keep last note provided
      const dedupedMap: Record<string, { resourceId: string; personalNote: string | null }> = {};
      for (const lr of linkedResources) {
        dedupedMap[lr.resourceId] = { resourceId: lr.resourceId, personalNote: lr.personalNote ?? null };
      }
      const payload = Object.values(dedupedMap);

      // Call server action based on target
      const results = subTopicId
        ? await linkResourcesToSubTopic(subTopicId, payload)
        : await linkResourcesToTopic(topicId as string, payload);

      // Map server-returned rows to local linkedResources format (with resource meta from allResources)
      const mapped: LinkedResource[] = (results ?? []).map((r: any) => {
        const meta = findResourceMeta(r.resourceId);
        return {
          id: r.id,
          resourceId: r.resourceId,
          personalNote: r.personalNote ?? null,
          resource: {
            id: meta?.id ?? r.resourceId,
            name: meta?.name ?? (r.resourceId ?? 'Unknown resource'),
            url: meta?.url ?? undefined
          }
        };
      });

      // Update local state to exactly match server state
      setLinkedResources(mapped);
      toast.success(`Saved ${mapped.length} link${mapped.length !== 1 ? 's' : ''}`);
      // Keep modal open per your requirement so the user can verify
    } catch (err) {
      console.error('Failed to link resources', err);
      toast.error('Failed to save links. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredResources = allResources.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) && !linkedResources.some(lr => lr.resourceId === r.id)
  );

  return (
    <div>
        {/* Linked Resources Section */}
        <div className="p-4 space-y-2 border-b">
            {linkedResources.length > 0 ? linkedResources.map(lr => (
                <div key={lr.resourceId} className="space-y-1">
                    <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold">{lr.resource.name}</p>
                          {lr.resource.url && <a href={lr.resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline">{lr.resource.url}</a>}
                        </div>
                        <button onClick={() => handleRemoveResource(lr.resourceId)} className="text-xs text-red-500">Remove</button>
                    </div>
                    <input 
                        type="text"
                        placeholder="Add a personal note..."
                        value={lr.personalNote ?? ''}
                        onChange={(e) => handleNoteChange(lr.resourceId, e.target.value)}
                        className="w-full p-1 text-xs bg-input rounded-md"
                    />
                </div>
            )) : <p className="text-sm text-center text-muted-foreground">No resources linked yet.</p>}
        </div>

        {/* Search and Add Section */}
        <div className="p-4 border-b">
            <input 
            type="text" 
            placeholder="Search resources to add..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 bg-input rounded-md"
            />
        </div>
        <div className="p-4 max-h-60 overflow-y-auto">
            <div className="space-y-2">
            {filteredResources.map(resource => (
                <div key={resource.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <div className="truncate">
                      <p className="text-sm truncate">{resource.name}</p>
                      {resource.url && <p className="text-xs text-muted-foreground truncate">{resource.url}</p>}
                    </div>
                    <button onClick={() => handleAddResource(resource)} className="text-sm font-semibold text-primary">Add</button>
                </div>
            ))}
            {filteredResources.length === 0 && (
              <p className="text-sm text-muted-foreground">No resources match your search.</p>
            )}
            </div>
        </div>

      <div className="flex items-center justify-end p-4 border-t gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Close</button>
        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold disabled:opacity-50">
          {isSaving ? 'Saving...' : `Save (${linkedResources.length}) Links`}
        </button>
      </div>
    </div>
  );
}
