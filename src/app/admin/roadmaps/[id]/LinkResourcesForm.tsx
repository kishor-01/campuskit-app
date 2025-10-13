'use client'

import { useState, useTransition } from 'react';
import { Resource } from '@prisma/client';
import { linkResourcesToStep } from '@/actions/roadmapActions';

type LinkResourcesFormProps = {
  stepId: string;
  allResources: Resource[];
  linkedResourceIds: string[];
  onClose: () => void;
};

export default function LinkResourcesForm({ stepId, allResources, linkedResourceIds, onClose }: LinkResourcesFormProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(linkedResourceIds));
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleCheckboxChange = (resourceId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        // Create FormData to match the server action signature
        const formData = new FormData();
        formData.append('stepId', stepId);
        
        // Add each selected resource ID
        Array.from(selectedIds).forEach(id => {
          formData.append('resourceIds', id);
        });
        
        await linkResourcesToStep(formData);
        onClose();
      } catch (error) {
        console.error('Failed to link resources:', error);
        // You might want to show an error toast here
      }
    });
  };

  const filteredResources = allResources.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="p-4 border-b">
        <input 
          type="text" 
          placeholder="Search resources by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 bg-input rounded-md"
        />
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {filteredResources.map(resource => (
            <div key={resource.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <input 
                type="checkbox"
                id={`res-${resource.id}`}
                checked={selectedIds.has(resource.id)}
                onChange={() => handleCheckboxChange(resource.id)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor={`res-${resource.id}`} className="flex-1 cursor-pointer">
                <div className="text-sm font-medium">{resource.name}</div>
                <div className="text-xs text-muted-foreground">
                  {resource.description.substring(0, 100)}{resource.description.length > 100 ? '...' : ''}
                </div>
                <div className="text-xs text-blue-600 truncate">{resource.url}</div>
              </label>
            </div>
          ))}
          {filteredResources.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              {searchTerm ? 'No resources found matching your search' : 'No resources available'}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
          {selectedIds.size} resource{selectedIds.size !== 1 ? 's' : ''} selected
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onClose} 
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isPending}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Links'}
          </button>
        </div>
      </div>
    </div>
  );
}