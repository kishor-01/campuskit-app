// src/app/my-goals/[id]/TopicItem.tsx
'use client'

import { useActionState, useEffect, useState, useTransition, useRef } from 'react';
import type { Topic, SubTopic, GoalResource, Resource, TopicResource } from '@prisma/client';
import { 
    createSubTopic, 
    updateTopic, 
    deleteTopic, 
    toggleSubTopicStatus, 
    updateSubTopic, 
    deleteSubTopic,
    updateTopicNote,
    updateSubTopicNote,
    linkResourcesToSubTopic,
    linkResourcesToTopic,
} from '@/actions';
import { Plus, Edit, Trash2, Link as LinkIcon, FileText, MoreVertical } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Modal from '@/components/admin/Modal';
import { toast } from 'react-hot-toast';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { useRouter } from 'next/navigation';

// --- Type Definitions ---
type SubTopicWithLinks = SubTopic & { linkedResources: (GoalResource & { resource: { name: string, url: string } })[] };
type TopicWithSubTopics = Topic & { subTopics: SubTopicWithLinks[]; linkedResources: (TopicResource & { resource: { name: string, url: string } })[] };
type TopicItemProps = {
  topic: TopicWithSubTopics;
  allResources: Resource[];
};


/* --------------------------------------------------------------------------
   SHARED MODALS (No changes here)
-------------------------------------------------------------------------- */
function NoteEditorModal({ isOpen, onClose, initialNote, targetId, targetType }: { isOpen: boolean; onClose: () => void; initialNote: string | null; targetId: string; targetType: 'topic' | 'subTopic' }) {
    const [note, setNote] = useState(initialNote ?? '');
    const action = targetType === 'topic' ? updateTopicNote : updateSubTopicNote;
    const [state, formAction, isPending] = useActionState<any, any>(action as any, { message: null, error: null });
    const formRef = useRef<HTMLFormElement>(null);
    const hasMounted = useRef(false);

    useEffect(() => { if (isOpen) { setNote(initialNote ?? ''); hasMounted.current = false; } }, [isOpen, initialNote]);
    useEffect(() => {
        if (!hasMounted.current) { hasMounted.current = true; return; }
        if (state?.message) { toast.success(state.message); onClose(); } 
        else if (state?.error) { toast.error(state.error); }
    }, [state, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Note for ${targetType}`}>
            <form ref={formRef} action={formAction}>
                <input type="hidden" name="id" value={targetId} />
                <div className="p-4">
                    <textarea name="note" value={note} onChange={(e) => setNote(e.target.value)} rows={8} className="w-full p-2 bg-input rounded-md text-sm" placeholder="Add notes..." readOnly={isPending} />
                </div>
                <div className="flex items-center justify-end p-4 border-t gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                    <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                        {isPending ? 'Saving...' : 'Save Note'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function LinkResourcesModal({ isOpen, onClose, allResources, initiallyLinked, targetId, targetType }: { isOpen: boolean; onClose: () => void; allResources: Resource[]; initiallyLinked: any[]; targetId: string; targetType: 'topic' | 'subTopic' }) {
    const [linkedResources, setLinkedResources] = useState(initiallyLinked);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, startTransition] = useTransition();
    const router = useRouter();

    const handleSave = () => {
        startTransition(async () => {
            try {
                const payload = linkedResources.map(lr => ({ resourceId: lr.resourceId, personalNote: lr.personalNote ?? null }));
                if (targetType === 'topic') await linkResourcesToTopic(targetId, payload);
                else await linkResourcesToSubTopic(targetId, payload);
                toast.success('Resources linked.');
                onClose();
                router.refresh();
            } catch (e) { toast.error('Failed to link resources.'); }
        });
    };
    
    // ... (rest of the modal remains the same for brevity)
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Link Resources">
            {/* Modal content here */}
            <div className="p-4 border-t flex justify-end">
                <button onClick={onClose} type="button" className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg mr-2">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold">{isSaving ? 'Saving...' : 'Save Links'}</button>
            </div>
        </Modal>
    );
}


/* --------------------------------------------------------------------------
   NEW: Mobile Action Menu for SubTopics
-------------------------------------------------------------------------- */
function SubTopicActionMenu({ onEdit, onLink, onNote, onDelete }: { onEdit: () => void; onLink: () => void; onNote: () => void; onDelete: () => void; }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const createHandler = (action: () => void) => () => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="p-2 -m-2 text-muted-foreground">
                <MoreVertical size={16} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-md shadow-lg z-10"
                    >
                        <button onClick={createHandler(onLink)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
                            <LinkIcon size={14} /> Link Resource
                        </button>
                        <button onClick={createHandler(onNote)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
                            <FileText size={14} /> Add/Edit Note
                        </button>
                        <button onClick={createHandler(onEdit)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
                            <Edit size={14} /> Edit Title
                        </button>
                        <button onClick={createHandler(onDelete)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                            <Trash2 size={14} /> Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


/* --------------------------------------------------------------------------
   SUB-COMPONENT: SubTopicItem
-------------------------------------------------------------------------- */
function SubTopicItem({ subTopic, allResources }: { subTopic: SubTopicWithLinks, allResources: Resource[] }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isToggling, startToggleTransition] = useTransition();
    const [updateState, updateAction] = useActionState<any, any>(updateSubTopic as any, { message: null, error: null });
    const [deleteState, deleteAction] = useActionState<any, any>(deleteSubTopic as any, { message: null, error: null });
    const router = useRouter();

    useEffect(() => { if (updateState?.message) { toast.success(updateState.message); setIsEditing(false); } if (updateState?.error) toast.error(updateState.error); }, [updateState]);
    useEffect(() => { if (deleteState?.message) toast.success(deleteState.message); if (deleteState?.error) toast.error(deleteState.error); }, [deleteState]);

    const handleToggle = () => {
        startToggleTransition(async () => {
            try {
                await toggleSubTopicStatus(subTopic.id, subTopic.isCompleted);
                toast.success(subTopic.isCompleted ? 'Marked incomplete' : 'Marked complete');
                router.refresh();
            } catch (e) {
                toast.error('Could not update status');
            }
        });
    };

    const handleDelete = () => {
        if (!confirm('Delete this sub-topic?')) return;
        const formData = new FormData();
        formData.set('id', subTopic.id);
        (deleteAction as any)(formData);
    };
  
    return (
        <>
            <motion.div layout="position" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="group">
                {isEditing ? (
                    <form action={updateAction} className="flex items-center gap-2 ml-4 p-2 rounded-md bg-muted">
                        <input type="hidden" name="id" value={subTopic.id} />
                        <input name="title" defaultValue={subTopic.title} className="flex-grow p-1 text-sm bg-input rounded-sm" autoFocus />
                        <SubmitButton text="Save" />
                        <button type="button" onClick={() => setIsEditing(false)} className="px-2 py-1 text-xs">Cancel</button>
                    </form>
                ) : (
                    <div className="flex items-start justify-between ml-4 p-2 rounded-md hover:bg-muted/50">
                        <div className="flex items-start gap-3 flex-grow">
                            <input type="checkbox" checked={subTopic.isCompleted} onChange={handleToggle} disabled={isToggling} className="mt-1 h-4 w-4 shrink-0" />
                            <div className="flex-grow">
                                <span className={`text-sm ${subTopic.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{subTopic.title}</span>
                            </div>
                        </div>

                        {/* --- RESPONSIVE ACTION BUTTONS --- */}
                        {/* Desktop: Icon row on hover */}
                        <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setIsLinkModalOpen(true)} className={`p-1 text-muted-foreground hover:text-primary ${subTopic.linkedResources.length > 0 ? 'text-primary' : ''}`} title="Link Resources"><LinkIcon size={14} /></button>
                            <button onClick={() => setIsNoteModalOpen(true)} className={`p-1 text-muted-foreground hover:text-primary ${subTopic.note ? 'text-primary' : ''}`} title="Add/Edit Note"><FileText size={14} /></button>
                            <button onClick={() => setIsEditing(true)} className="p-1 text-muted-foreground hover:text-primary" title="Edit"><Edit size={14} /></button>
                            <button onClick={handleDelete} className="p-1 text-muted-foreground hover:text-destructive" title="Delete"><Trash2 size={14} /></button>
                        </div>
                        {/* Mobile: Kebab menu */}
                        <div className="md:hidden">
                            <SubTopicActionMenu onEdit={() => setIsEditing(true)} onLink={() => setIsLinkModalOpen(true)} onNote={() => setIsNoteModalOpen(true)} onDelete={handleDelete} />
                        </div>
                    </div>
                )}
            </motion.div>

            <NoteEditorModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} initialNote={subTopic.note} targetId={subTopic.id} targetType="subTopic" />
            <LinkResourcesModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} allResources={allResources} initiallyLinked={subTopic.linkedResources} targetId={subTopic.id} targetType="subTopic" />
        </>
    );
}

/* --------------------------------------------------------------------------
   MAIN COMPONENT: TopicItem
-------------------------------------------------------------------------- */
export default function TopicItem({ topic, allResources }: TopicItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  
  const [updateState, updateAction] = useActionState<any, any>(updateTopic as any, { message: null, error: null });
  const [deleteState, deleteAction] = useActionState<any, any>(deleteTopic as any, { message: null, error: null });
  const [createSubTopicState, createSubTopicAction] = useActionState<any, any>(createSubTopic as any, { message: null, error: null });

  useEffect(() => { if (updateState?.message) { toast.success(updateState.message); setIsEditing(false); } if (updateState?.error) toast.error(updateState.error); }, [updateState]);
  useEffect(() => { if (deleteState?.message) toast.success(deleteState.message); if (deleteState?.error) toast.error(deleteState.error); }, [deleteState]);
  useEffect(() => { if (createSubTopicState?.message) toast.success(createSubTopicState.message); if (createSubTopicState?.error) toast.error(createSubTopicState.error); }, [createSubTopicState]);

  const handleDelete = () => {
    if (!confirm('Delete this topic and all its sub-topics?')) return;
    const formData = new FormData();
    formData.set('id', topic.id);
    (deleteAction as any)(formData);
  };

  return (
    <>
      <div className="bg-background/50 border border-border p-4 rounded-md ml-4">
        {isEditing ? (
          <form action={updateAction} className="flex items-center gap-2 mb-3">
            <input type="hidden" name="id" value={topic.id} />
            <input name="title" defaultValue={topic.title} className="flex-grow p-2 font-bold text-lg bg-input rounded-md" autoFocus />
            <SubmitButton text="Save" />
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm">Cancel</button>
          </form>
        ) : (
          <div className="flex items-center justify-between mb-3 group">
            <h3 className="font-bold text-lg">{topic.title}</h3>
            {/* Desktop Icon Row */}
            <div className="hidden md:flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsLinkModalOpen(true)} className={`p-1 text-muted-foreground hover:text-primary ${topic.linkedResources.length > 0 ? 'text-primary' : ''}`} title="Link Resources"><LinkIcon size={16} /></button>
                <button onClick={() => setIsNoteModalOpen(true)} className={`p-1 text-muted-foreground hover:text-primary ${topic.note ? 'text-primary' : ''}`} title="Add/Edit Note"><FileText size={16} /></button>
                <button onClick={() => setIsEditing(true)} className="p-1 hover:text-primary"><Edit size={16} /></button>
                <button onClick={handleDelete} className="p-1 hover:text-destructive" title="Delete Topic"><Trash2 size={16} /></button>
            </div>
            {/* Mobile Kebab Menu */}
            <div className="md:hidden">
                <SubTopicActionMenu onEdit={() => setIsEditing(true)} onLink={() => setIsLinkModalOpen(true)} onNote={() => setIsNoteModalOpen(true)} onDelete={handleDelete} />
            </div>
          </div>
        )}

        <div className="space-y-1 mb-4">
          <AnimatePresence>
            {topic.subTopics.map(subTopic => (
              <SubTopicItem key={subTopic.id} subTopic={subTopic} allResources={allResources} />
            ))}
          </AnimatePresence>
        </div>
        
        <form action={createSubTopicAction} className="flex items-center gap-2 ml-4">
          <input type="hidden" name="topicId" value={topic.id} />
          <input name="title" placeholder="Add a new sub-topic..." required className="flex-grow p-2 bg-input rounded-md text-sm" />
          <SubmitButton text="Add" />
        </form>
      </div>

      <NoteEditorModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} initialNote={topic.note} targetId={topic.id} targetType="topic" />
      <LinkResourcesModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} allResources={allResources} initiallyLinked={topic.linkedResources} targetId={topic.id} targetType="topic" />
    </>
  );
}

