'use client'

import { useState, useTransition, useRef } from 'react';
import { Topic, SubTopic, GoalResource, Resource } from '@prisma/client';
import {
  createSubTopic, updateTopic, deleteTopic, toggleSubTopicStatus, updateSubTopic, deleteSubTopic,
  createSubTopicTyped, deleteSubTopicTyped, updateTopicNote, updateSubTopicNote
} from '@/actions/goalActions';
import { Plus, Edit, Trash2, Link, FileText } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import LinkGoalResourcesForm from './LinkGoalResourcesForm';
import toast from 'react-hot-toast';

type LinkedResourceRow = {
  id?: string;
  resourceId: string;
  personalNote: string | null;
  resource: { id?: string; name: string; url?: string };
};

type SubTopicWithLinks = SubTopic & { linkedResources: (GoalResource & { resource: { name: string, url: string } })[]; note?: string | null };
type TopicWithSubTopics = Topic & { subTopics: SubTopicWithLinks[]; linkedResources?: LinkedResourceRow[]; note?: string | null };
type TopicItemProps = {
  topic: TopicWithSubTopics;
  allResources: Resource[];
};

function SubTopicItemLocal({
  subTopic,
  allResources,
  onDeleted,
  onNoteUpdated
}: {
  subTopic: SubTopicWithLinks;
  allResources: Resource[];
  onDeleted: (id: string) => void;
  onNoteUpdated?: (id: string, note: string | null) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingToggle, setIsSavingToggle] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteLocal, setNoteLocal] = useState<string | null>(subTopic.note ?? null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isCompletedLocal, setIsCompletedLocal] = useState<boolean>(subTopic.isCompleted);
  const [, startTransition] = useTransition();

  const handleToggle = async () => {
    const previous = isCompletedLocal;
    setIsCompletedLocal(!previous);
    setIsSavingToggle(true);
    try {
      await toggleSubTopicStatus(subTopic.id, previous);
      toast.success(!previous ? 'Marked complete' : 'Marked incomplete');
    } catch (err) {
      setIsCompletedLocal(previous);
      console.error('toggle failed', err);
      toast.error('Could not update sub-topic');
    } finally {
      setIsSavingToggle(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this sub-topic?')) return;
    setIsDeleting(true);
    try {
      await deleteSubTopicTyped(subTopic.id);
      toast.success('Sub-topic deleted');
      onDeleted(subTopic.id);
    } catch (err) {
      console.error('Failed to delete sub-topic', err);
      toast.error('Could not delete sub-topic');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      await updateSubTopicNote(subTopic.id, noteLocal ?? null);
      toast.success('Note saved');
      onNoteUpdated?.(subTopic.id, noteLocal ?? null);
      setIsEditingNote(false);
    } catch (err) {
      console.error('Failed to save subtopic note', err);
      toast.error('Failed to save note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!confirm('Remove note for this sub-topic?')) return;
    setIsSavingNote(true);
    try {
      await updateSubTopicNote(subTopic.id, null);
      setNoteLocal(null);
      onNoteUpdated?.(subTopic.id, null);
      toast.success('Note removed');
      setIsEditingNote(false);
    } catch (err) {
      console.error('Failed to delete subtopic note', err);
      toast.error('Failed to remove note');
    } finally {
      setIsSavingNote(false);
    }
  };

  if (isEditing) {
    return (
      <form action={(formData) => { updateSubTopic(formData); setIsEditing(false); toast.success('Sub-topic updated'); }} className="flex items-center gap-2 ml-4 p-2 rounded-md bg-muted">
        <input type="hidden" name="id" value={subTopic.id} />
        <input name="title" defaultValue={subTopic.title} className="flex-grow p-1 text-sm bg-input rounded-sm" autoFocus />
        <button type="submit" className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-sm">Save</button>
        <button type="button" onClick={() => setIsEditing(false)} className="px-2 py-1 text-xs">Cancel</button>
      </form>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 ml-4 p-2 rounded-md hover:bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <input type="checkbox" id={subTopic.id} checked={isCompletedLocal} onChange={handleToggle} className="h-4 w-4 mt-1" disabled={isSavingToggle} />
            <div>
              <label htmlFor={subTopic.id} className={`text-sm ${isCompletedLocal ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{subTopic.title}</label>
              {/* show a short note preview */}
              {noteLocal && !isEditingNote && (
                <div className="text-xs text-muted-foreground mt-1 max-w-prose">
                  {noteLocal.length > 250 ? noteLocal.slice(0, 250) + '…' : noteLocal}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsModalOpen(true)} className="p-1 text-muted-foreground hover:text-blue-500" title="Link Resources"><Link size={14} /></button>
            <button onClick={() => setIsEditing(true)} className="p-1 text-muted-foreground hover:text-blue-500" title="Edit sub-topic"><Edit size={14} /></button>
            <button onClick={handleDelete} className="p-1 text-muted-foreground hover:text-destructive" title="Delete sub-topic"><Trash2 size={14} /></button>
            <button onClick={() => setIsEditingNote(prev => !prev)} className="p-1 text-muted-foreground hover:text-blue-500" title="Edit note"><FileText size={14} /></button>
          </div>
        </div>

        {/* Note editor */}
        {isEditingNote && (
          <div className="ml-7 mt-2">
            <textarea value={noteLocal ?? ''} onChange={(e) => setNoteLocal(e.target.value)} className="w-full p-2 bg-input rounded-md text-sm" rows={4} />
            <div className="flex gap-2 mt-2">
              <button onClick={handleSaveNote} disabled={isSavingNote} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">
                {isSavingNote ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setNoteLocal(subTopic.note ?? null); setIsEditingNote(false); }} className="px-3 py-1 text-sm bg-muted rounded-md">Cancel</button>
              {noteLocal && (
                <button onClick={handleDeleteNote} className="px-3 py-1 text-sm text-red-600">Delete</button>
              )}
            </div>
          </div>
        )}

        {/* Linked resources (defensive check) */}
        {Array.isArray(subTopic.linkedResources) && subTopic.linkedResources.length > 0 && (
          <div className="ml-7 pl-1 border-l-2 border-muted-foreground/20 space-y-1 mt-2">
            {subTopic.linkedResources.map(lr => (
              <div key={lr.id} className="text-xs">
                <a href={lr.resource.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{lr.resource.name}</a>
                {lr.personalNote && <p className="flex items-center gap-1 text-muted-foreground"><FileText size={12}/> {lr.personalNote}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Resources for: ${subTopic.title}`}>
        <LinkGoalResourcesForm 
          subTopicId={subTopic.id}
          allResources={allResources}
          initiallyLinked={(Array.isArray(subTopic.linkedResources) ? subTopic.linkedResources : []).map(lr => ({
            id: lr.id,
            resourceId: lr.resourceId,
            personalNote: lr.personalNote ?? null,
            resource: { id: lr.resourceId, name: lr.resource.name, url: lr.resource.url }
          }))}
          onClose={() => { setIsModalOpen(false); toast.success('Resources updated'); }}
        />
      </Modal>
    </>
  );
}

export default function TopicItem({ topic, allResources }: TopicItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localSubTopics, setLocalSubTopics] = useState<SubTopicWithLinks[]>((topic.subTopics ?? []).map(s => ({ ...s, linkedResources: s.linkedResources ?? [], note: s.note ?? null })));
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteLocal, setNoteLocal] = useState<string | null>(topic.note ?? null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [, startTransition] = useTransition();

  // Optimistic create sub-topic
  const handleCreateSubTopic = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const title = inputRef.current?.value?.trim();
    if (!title) {
      toast.error('Sub-topic title cannot be empty');
      return;
    }
    const tmpId = `tmp-sub-${Date.now()}`;
    const optimistic = { id: tmpId, title, order: (localSubTopics.length ? Math.max(...localSubTopics.map(s=>s.order)) + 1 : 1), isCompleted: false, topicId: topic.id, linkedResources: [], note: null } as SubTopicWithLinks;
    setLocalSubTopics(prev => [...prev, optimistic]);
    inputRef.current!.value = '';
    setIsCreating(true);

    startTransition(async () => {
      try {
        const created: any = await createSubTopicTyped(topic.id, title);
        // normalize created object to always have linkedResources and note
        const normalized = { ...created, linkedResources: created.linkedResources ?? [], note: created.note ?? null } as SubTopicWithLinks;
        setLocalSubTopics(prev => prev.map(s => s.id === tmpId ? normalized : s));
        toast.success('Sub-topic created');
      } catch (err) {
        console.error('createSubTopicTyped failed', err);
        setLocalSubTopics(prev => prev.filter(s => s.id !== tmpId));
        toast.error('Failed to create sub-topic');
      } finally {
        setIsCreating(false);
      }
    });
  };

  // Optimistic delete topic
  const handleDeleteTopic = async () => {
    if (!confirm('Delete this topic?')) return;
    try {
      await deleteTopicTyped(topic.id);
      toast.success('Topic deleted');
      // parent page will revalidate
    } catch (err) {
      console.error('Failed to delete topic', err);
      toast.error('Could not delete topic');
    }
  };

  const handleSubTopicDeletedLocally = (id: string) => {
    setLocalSubTopics(prev => prev.filter(s => s.id !== id));
  };

  const handleTopicNoteSave = async () => {
    setIsSavingNote(true);
    try {
      await updateTopicNote(topic.id, noteLocal ?? null);
      toast.success('Topic note saved');
      setIsEditingNote(false);
    } catch (err) {
      console.error('Failed to save topic note', err);
      toast.error('Failed to save topic note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleTopicNoteDelete = async () => {
    if (!confirm('Remove note for this topic?')) return;
    setIsSavingNote(true);
    try {
      await updateTopicNote(topic.id, null);
      setNoteLocal(null);
      toast.success('Topic note removed');
      setIsEditingNote(false);
    } catch (err) {
      console.error('Failed to delete topic note', err);
      toast.error('Failed to remove topic note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSubTopicNoteUpdated = (id: string, note: string | null) => {
    // also update localSubTopics to reflect new note
    setLocalSubTopics(prev => prev.map(s => s.id === id ? { ...s, note } : s));
  };

  return (
    <div className="bg-background p-4 rounded-md ml-4">
      {isEditing ? (
        <form action={(formData) => { updateTopic(formData); setIsEditing(false); toast.success('Topic updated'); }} className="flex items-center gap-2 mb-3">
            <input type="hidden" name="id" value={topic.id} />
            <input name="title" defaultValue={topic.title} className="flex-grow p-2 font-bold text-lg bg-input rounded-md" autoFocus />
            <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm">Cancel</button>
        </form>
      ) : (
        <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-lg">{topic.title}</p>
              {noteLocal && !isEditingNote && (
                <div className="text-sm text-muted-foreground mt-1 max-w-prose">
                  {noteLocal.length > 300 ? noteLocal.slice(0, 300) + '…' : noteLocal}
                </div>
              )}
            </div>
            <div className="flex items-center">
                <button onClick={() => setIsEditing(true)} className="p-1 hover:text-blue-500"><Edit size={16} /></button>
                <button onClick={handleDeleteTopic} className="p-1 hover:text-destructive"><Trash2 size={16} /></button>
                <button onClick={() => setIsTopicModalOpen(true)} className="p-1 hover:text-blue-500" title="Link resources"><Link size={16} /></button>
                <button onClick={() => setIsEditingNote(prev => !prev)} className="p-1 hover:text-blue-500" title="Edit note"><FileText size={16} /></button>
            </div>
        </div>
      )}

      {/* Topic Note editor */}
      {isEditingNote && (
        <div className="mb-4">
          <textarea value={noteLocal ?? ''} onChange={(e) => setNoteLocal(e.target.value)} className="w-full p-2 bg-input rounded-md text-sm" rows={5} />
          <div className="flex gap-2 mt-2">
            <button onClick={handleTopicNoteSave} disabled={isSavingNote} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">
              {isSavingNote ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setNoteLocal(topic.note ?? null); setIsEditingNote(false); }} className="px-3 py-1 text-sm bg-muted rounded-md">Cancel</button>
            {noteLocal && (
              <button onClick={handleTopicNoteDelete} className="px-3 py-1 text-sm text-red-600">Delete</button>
            )}
          </div>
        </div>
      )}

      {/* Topic's linked resources (if any) */}
      {Array.isArray(topic.linkedResources) && topic.linkedResources.length > 0 && (
        <div className="mb-4 ml-2 pl-2 border-l-2 border-muted-foreground/20">
          {topic.linkedResources.map(lr => (
            <div key={lr.id ?? lr.resourceId} className="text-xs mb-1">
              <a href={lr.resource.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{lr.resource.name}</a>
              {lr.personalNote && <p className="text-muted-foreground text-xs"><FileText size={12}/> {lr.personalNote}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 mb-4">
        {localSubTopics.map(subTopic => (
          <SubTopicItemLocal key={subTopic.id} subTopic={subTopic} allResources={allResources} onDeleted={handleSubTopicDeletedLocally} onNoteUpdated={handleSubTopicNoteUpdated} />
        ))}
      </div>

      <form onSubmit={handleCreateSubTopic} className="flex items-center gap-2 ml-4">
        <input type="hidden" name="topicId" value={topic.id} />
        <input
          ref={inputRef}
          name="title"
          placeholder="Add a new sub-topic..."
          required
          className="flex-grow p-2 bg-input rounded-md text-sm"
        />
        <button type="submit" disabled={isCreating} className="flex-shrink-0 p-2 bg-primary/80 text-primary-foreground rounded-md hover:bg-primary" title="Add Sub-Topic">
          <Plus size={16} />
        </button>
      </form>

      <Modal isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)} title={`Resources for: ${topic.title}`}>
        <LinkGoalResourcesForm
          topicId={topic.id}
          allResources={allResources}
          initiallyLinked={((topic.linkedResources ?? []) as any[]).map((lr: any) => ({
            id: lr.id,
            resourceId: lr.resourceId,
            personalNote: lr.personalNote ?? null,
            resource: { id: lr.resourceId, name: lr.resource.name ?? 'Resource', url: lr.resource.url ?? undefined }
          }))}
          onClose={() => { setIsTopicModalOpen(false); toast.success('Resources updated'); }}
        />
      </Modal>
    </div>
  );
}
