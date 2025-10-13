'use client'

import { useState } from 'react';
import { Milestone, Topic, SubTopic, Resource } from '@prisma/client';
import { createTopic, updateMilestone, deleteMilestone } from '@/actions/goalActions';
import { createTopicTyped, deleteMilestoneTyped } from '@/actions/goalActions';
import { Plus, Edit, Trash2 } from 'lucide-react';
import TopicItem from './TopicItem';
import ProgressBar from '@/components/ProgressBar';
import toast from 'react-hot-toast';

type SubTopicWithLinks = SubTopic & { linkedResources?: any[], note?: string | null };
type TopicWithSubTopics = Topic & { subTopics: SubTopicWithLinks[], linkedResources?: any[], note?: string | null };
type MilestoneWithTopics = Milestone & { topics: TopicWithSubTopics[] };

export default function MilestoneItem({ milestone, allResources }: { milestone: MilestoneWithTopics, allResources: Resource[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localTopics, setLocalTopics] = useState<TopicWithSubTopics[]>((milestone.topics ?? []).map(t => ({ ...t, subTopics: t.subTopics ?? [], linkedResources: t.linkedResources ?? [], note: t.note ?? null })));
  const [isCreating, setIsCreating] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  // Compute milestone progress
  const { totalSubTopics, completedSubTopics } = (() => {
    let total = 0;
    let completed = 0;
    for (const t of localTopics) {
      const subs = Array.isArray(t.subTopics) ? t.subTopics : [];
      total += subs.length;
      completed += subs.filter(s => s.isCompleted).length;
    }
    return { totalSubTopics: total, completedSubTopics: completed };
  })();

  const percent = totalSubTopics === 0 ? 0 : Math.round((completedSubTopics / totalSubTopics) * 100);

  // Optimistic create topic
  const handleCreateTopic = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const title = titleValue.trim();
    if (!title) {
      toast.error('Topic title cannot be empty');
      return;
    }
    const tmpId = `tmp-topic-${Date.now()}`;
    const optimisticTopic: TopicWithSubTopics = { id: tmpId, title, order: (localTopics.length ? Math.max(...localTopics.map(t=>t.order)) + 1 : 1), milestoneId: milestone.id, subTopics: [], linkedResources: [], note: null };
    setLocalTopics(prev => [...prev, optimisticTopic]);
    setTitleValue('');
    setIsCreating(true);

    try {
      const created: any = await createTopicTyped(milestone.id, title);
      // normalize server result to include subTopics, linkedResources and note
      const normalized = { ...created, subTopics: created.subTopics ?? [], linkedResources: created.linkedResources ?? [], note: created.note ?? null } as TopicWithSubTopics;
      setLocalTopics(prev => prev.map(t => t.id === tmpId ? normalized : t));
      toast.success('Topic created');
    } catch (err) {
      console.error('createTopicTyped failed', err);
      setLocalTopics(prev => prev.filter(t => t.id !== tmpId));
      toast.error('Failed to create topic');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteMilestone = async (ev?: React.MouseEvent) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await deleteMilestoneTyped(milestone.id);
      toast.success('Milestone deleted');
    } catch (err) {
      console.error('deleteMilestoneTyped failed', err);
      toast.error('Failed to delete milestone');
    }
  };

  return (
    <div className="bg-muted/50 p-6 rounded-lg">
      {isEditing ? (
        <form
          action={async (formData) => {
            await updateMilestone(formData);
            setIsEditing(false);
            toast.success('Milestone updated');
          }}
          className="flex items-center gap-2 mb-4"
        >
          <input type="hidden" name="id" value={milestone.id} />
          <input
            name="title"
            defaultValue={milestone.title}
            className="flex-grow p-2 text-2xl font-bold bg-input rounded-md"
            autoFocus
            required
          />
          <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90">
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm bg-muted-foreground/20 rounded-md hover:bg-muted-foreground/30"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{milestone.title}</h2>
            <div className="mt-3 max-w-2xl">
              <ProgressBar percent={percent} label={totalSubTopics === 0 ? 'No sub-topics yet' : `${completedSubTopics}/${totalSubTopics} subtopics completed`} />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:text-blue-500 transition-colors"
              title="Edit milestone"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDeleteMilestone}
              className="p-1 hover:text-destructive transition-colors"
              title="Delete milestone"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* List of Topics using the new component */}
      <div className="space-y-3 mb-6">
        {localTopics.map(topic => (
          <TopicItem key={topic.id} topic={topic} allResources={allResources} />
        ))}
      </div>

      {/* Add New Topic Form */}
      <form onSubmit={handleCreateTopic} className="flex items-center gap-2 ml-4">
        <input type="hidden" name="milestoneId" value={milestone.id} />
        <input
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          name="title"
          placeholder="Add a new topic..."
          required
          className="flex-grow p-2 bg-input rounded-md text-sm"
        />
        <button
          type="submit"
          disabled={isCreating}
          className="flex-shrink-0 p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          title="Add Topic"
        >
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
}
