// src/app/my-goals/[id]/MilestoneItem.tsx
'use client'

import { useActionState, useEffect, useState, useTransition, useRef } from 'react';
import { Milestone, Topic, SubTopic, Resource, GoalResource, TopicResource } from '@prisma/client';
import { createTopic, updateMilestone } from '@/actions';
import { Plus, Edit, Trash2, ChevronDown } from 'lucide-react';
import TopicItem from './TopicItem';
import ProgressBar from '@/components/ProgressBar';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Define the complex nested types for props
type SubTopicWithLinks = SubTopic & { linkedResources: (GoalResource & { resource: { name: string, url: string } })[]; note?: string | null };
type TopicWithSubTopics = Topic & { subTopics: SubTopicWithLinks[]; linkedResources: (TopicResource & { resource: { name: string, url: string } })[]; note?: string | null };
type MilestoneWithTopics = Milestone & { topics: TopicWithSubTopics[] };

export default function MilestoneItem({ 
  milestone, 
  allResources,
  deleteAction
}: { 
  milestone: MilestoneWithTopics, 
  allResources: Resource[],
  deleteAction: (payload: FormData) => void 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [updateState, updateAction] = useActionState<any, any>(updateMilestone as any, { message: null, error: null });
  const [createTopicState, createTopicAction] = useActionState<any, any>(createTopic as any, { message: null, error: null });

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setIsEditing(false);
      startTransition(() => router.refresh());
    }
    if (updateState?.error) toast.error(updateState.error);
  }, [updateState, router]);
  
  useEffect(() => {
    if (createTopicState?.message) {
      toast.success(createTopicState.message);
      formRef.current?.reset();
      startTransition(() => router.refresh());
    }
    if (createTopicState?.error) toast.error(createTopicState.error);
  }, [createTopicState, router]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const { totalSubTopics, completedSubTopics } = (() => {
    let total = 0, completed = 0;
    for (const t of milestone.topics) {
      for (const s of t.subTopics) {
        total++;
        if (s.isCompleted) completed++;
      }
    }
    return { totalSubTopics: total, completedSubTopics: completed };
  })();
  const percent = totalSubTopics === 0 ? 0 : Math.round((completedSubTopics / totalSubTopics) * 100);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Milestone Header */}
      <div className="flex items-center p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <ChevronDown className={`w-5 h-5 text-muted-foreground mr-3 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
        <div className="flex-grow">
          {isEditing ? (
            <form action={updateAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={milestone.id} />
              <input
                ref={inputRef}
                name="title"
                defaultValue={milestone.title}
                className="flex-grow p-1 text-xl font-bold bg-input rounded-md"
                onClick={(e) => e.stopPropagation()}
                required
              />
              <motion.button type="submit" whileTap={{ scale: 0.95 }} className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md font-semibold">Save</motion.button>
              <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm bg-muted rounded-md">Cancel</motion.button>
            </form>
          ) : (
            <h2 className="text-xl font-bold">{milestone.title}</h2>
          )}
          <div className="mt-2 max-w-md">
            <ProgressBar percent={percent} label={`${completedSubTopics}/${totalSubTopics} sub-topics`} />
          </div>
        </div>
        {!isEditing && (
            <div className="flex items-center gap-2 ml-4">
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(true);}} className="p-2 rounded-md hover:bg-muted" title="Edit milestone"><Edit size={16} /></button>
                <form action={deleteAction}>
                    <input type="hidden" name="id" value={milestone.id} />
                    <button type="submit" className="p-2 rounded-md hover:bg-destructive/10 hover:text-destructive" title="Delete milestone" onClick={(e) => { e.stopPropagation(); if (!confirm('Delete this milestone and all its topics?')) e.preventDefault();}}>
                        <Trash2 size={16} />
                    </button>
                </form>
            </div>
        )}
      </div>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 space-y-4">
              <AnimatePresence>
                {milestone.topics.map(topic => (
                  <motion.div key={topic.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <TopicItem topic={topic} allResources={allResources} />
                  </motion.div>
                ))}
              </AnimatePresence>

              <form ref={formRef} action={createTopicAction} className="flex items-center gap-2 pl-4 pt-4 border-t border-border">
                <input type="hidden" name="milestoneId" value={milestone.id} />
                <Plus size={16} className="text-muted-foreground"/>
                <input name="title" placeholder="Add a new topic..." required className="flex-grow p-2 bg-input rounded-md text-sm" />
                <motion.button type="submit" whileTap={{ scale: 0.95 }} className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold">Add Topic</motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

