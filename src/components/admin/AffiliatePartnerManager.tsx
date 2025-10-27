// /src/components/admin/AffiliatePartnerManager.tsx

'use client'

import { useActionState, useEffect, useState, useRef } from 'react';
import { AffiliatePartner } from '@prisma/client';
import { createAffiliatePartner, updateAffiliatePartner, deleteAffiliatePartner } from '@/actions';
import { Trash2, Edit, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormStatus } from 'react-dom';

type FormState = {
  message?: string | null;
  error?: string | Record<string, string[]> | null;
  success?: boolean;
};

function PartnerSubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "Saving..." : text}
    </Button>
  );
}

function PartnerDeleteButton({ partnerId }: { partnerId: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      title="Delete Partner"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm('Are you sure you want to delete this partner?')) {
          e.preventDefault();
        }
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
    </Button>
  );
}

export default function AffiliatePartnerManager({ partners }: { partners: AffiliatePartner[] }) {
  const [editingPartner, setEditingPartner] = useState<AffiliatePartner | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [createState, createAction] = useActionState<FormState, FormData>(createAffiliatePartner, { message: null, error: null });
  const [updateState, updateAction] = useActionState<FormState, FormData>(updateAffiliatePartner, { message: null, error: null });
  const [deleteState, deleteActionHook] = useActionState<FormState, FormData>(deleteAffiliatePartner, { message: null, error: null });

  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      formRef.current?.reset();
      setEditingPartner(null);
    }
    if (createState?.error) {
      const errorMessages = typeof createState.error === 'string'
        ? [createState.error]
        : createState.error && typeof createState.error === 'object'
        ? Object.values(createState.error).flat()
        : ["Failed to create partner."];
      toast.error(errorMessages.join('\n'));
    }
  }, [createState]);

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setEditingPartner(null);
    }
    if (updateState?.error) {
      const errorMessages = typeof updateState.error === 'string'
        ? [updateState.error]
        : updateState.error && typeof updateState.error === 'object'
        ? Object.values(updateState.error).flat()
        : ["Failed to update partner."];
      toast.error(errorMessages.join('\n'));
    }
  }, [updateState]);

  useEffect(() => {
    if (deleteState?.message && !deleteState.error) {
      toast.success(deleteState.message);
    }
    if (deleteState?.error) {
      toast.error(typeof deleteState.error === 'string' ? deleteState.error : "Failed to delete partner.");
    }
  }, [deleteState]);

  const isCreating = !editingPartner;

  const handleEditClick = (partner: AffiliatePartner) => {
    setEditingPartner(partner);
    setTimeout(() => {
      const nameInput = formRef.current?.querySelector('input[name="name"]') as HTMLInputElement | null;
      nameInput?.focus();
    }, 50);
  }

  const handleCancelEdit = () => {
    setEditingPartner(null);
    formRef.current?.reset();
  }

  const getFieldError = (fieldName: keyof AffiliatePartner | 'form'): string | undefined => {
    const state = isCreating ? createState : updateState;
    if (state?.error && typeof state.error === 'object' && state.error[fieldName]) {
      const fieldErrors = state.error[fieldName];
      return Array.isArray(fieldErrors) ? fieldErrors[0] : undefined;
    }
    return undefined;
  }

  return (
    <div className="bg-muted/50 p-6 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{isCreating ? 'Add New Partner' : `Editing: ${editingPartner.name}`}</h2>
        {!isCreating && (
          <Button variant="ghost" size="icon" onClick={handleCancelEdit} title="Cancel edit">
            <X size={20} />
          </Button>
        )}
      </div>

      <form
        key={editingPartner?.id ?? 'new'}
        ref={formRef}
        action={isCreating ? createAction : updateAction}
        className="space-y-4 mb-8"
      >
        {!isCreating && <input type="hidden" name="id" value={editingPartner.id} />}

        <div>
          <Input
            name="name"
            placeholder="Partner Name (e.g., Coursera)"
            required
            defaultValue={editingPartner?.name ?? ''}
            className="bg-background border-muted focus-visible:ring-primary"
            aria-invalid={!!getFieldError('name')}
            aria-describedby="name-error"
          />
          {getFieldError('name') && (
            <p id="name-error" className="text-xs text-destructive mt-1">{getFieldError('name')}</p>
          )}
        </div>

        <div>
          <Input
            name="website"
            type="url"
            placeholder="https://coursera.org"
            required
            defaultValue={editingPartner?.website ?? ''}
            className="bg-background border-muted focus-visible:ring-primary"
            aria-invalid={!!getFieldError('website')}
            aria-describedby="website-error"
          />
          {getFieldError('website') && (
            <p id="website-error" className="text-xs text-destructive mt-1">{getFieldError('website')}</p>
          )}
        </div>

        <div>
          <Textarea
            name="description"
            placeholder="Brief description of the partner (optional)."
            rows={3}
            defaultValue={editingPartner?.description ?? ''}
            className="bg-background border-muted focus-visible:ring-primary"
            aria-invalid={!!getFieldError('description')}
            aria-describedby="description-error"
          />
          {getFieldError('description') && (
            <p id="description-error" className="text-xs text-destructive mt-1">{getFieldError('description')}</p>
          )}
        </div>

        <PartnerSubmitButton text={isCreating ? 'Add New Partner' : 'Update Partner'} />

        {(() => {
          const state = isCreating ? createState : updateState;
          if (state?.error && typeof state.error === 'string') {
            return (
              <p className="text-sm text-destructive mt-2 text-center">
                {state.error}
              </p>
            );
          }
          return null;
        })()}
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-2">Existing Partners</h3>
        {partners.length > 0 ? (
          <ul className="space-y-2">
            {partners.map((partner) => (
              <li
                key={partner.id}
                className="flex items-center justify-between p-2 bg-background rounded-md text-sm group border border-border"
              >
                <span>{partner.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(partner)} title="Edit Partner">
                    <Edit size={16} />
                  </Button>
                  <form action={deleteActionHook}>
                    <input type="hidden" name="id" value={partner.id} />
                    <PartnerDeleteButton partnerId={partner.id}/>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No partners added yet.</p>
        )}
      </div>
    </div>
  )
}