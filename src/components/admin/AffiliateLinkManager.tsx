// /src/components/admin/AffiliateLinkManager.tsx

'use client'

import { useActionState, useEffect, useState, useRef } from 'react';
import { AffiliateLink, AffiliatePartner } from '@prisma/client';
import { createAffiliateLink, updateAffiliateLink, deleteAffiliateLink } from '@/actions';
import { Trash2, Edit, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormStatus } from 'react-dom';

type LinkWithPartner = AffiliateLink & { partner: AffiliatePartner };

type FormState = {
  message?: string | null;
  error?: string | Record<string, string[]> | null;
  success?: boolean;
};

function LinkSubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "Saving..." : text}
    </Button>
  );
}

function LinkDeleteButton({ linkId }: { linkId: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
      title="Delete Link"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm('Are you sure you want to delete this link?')) {
          e.preventDefault();
        }
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
    </Button>
  );
}

export default function AffiliateLinkManager({ links, partners }: { links: LinkWithPartner[]; partners: AffiliatePartner[] }) {
  const [editingLink, setEditingLink] = useState<LinkWithPartner | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");

  const [createState, createAction] = useActionState<FormState, FormData>(createAffiliateLink, { message: null, error: null });
  const [updateState, updateAction] = useActionState<FormState, FormData>(updateAffiliateLink, { message: null, error: null });
  const [deleteState, deleteActionHook] = useActionState<FormState, FormData>(deleteAffiliateLink, { message: null, error: null });

  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      formRef.current?.reset();
      setEditingLink(null);
      setSelectedPartnerId("");
    }
    if (createState?.error) {
      const errorMessages = typeof createState.error === 'string'
        ? [createState.error]
        : createState.error && typeof createState.error === 'object'
        ? Object.values(createState.error).flat()
        : ["Failed to create link."];
      toast.error(errorMessages.join('\n'));
    }
  }, [createState]);

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setEditingLink(null);
      setSelectedPartnerId("");
    }
    if (updateState?.error) {
      const errorMessages = typeof updateState.error === 'string'
        ? [updateState.error]
        : updateState.error && typeof updateState.error === 'object'
        ? Object.values(updateState.error).flat()
        : ["Failed to update link."];
      toast.error(errorMessages.join('\n'));
    }
  }, [updateState]);

  useEffect(() => {
    if (deleteState?.message && !deleteState.error) {
      toast.success(deleteState.message);
    }
    if (deleteState?.error) {
      toast.error(typeof deleteState.error === 'string' ? deleteState.error : "Failed to delete link.");
    }
  }, [deleteState]);

  useEffect(() => {
    setSelectedPartnerId(editingLink?.partnerId ?? "");
    if (editingLink) {
      setTimeout(() => {
        const nameInput = formRef.current?.querySelector('input[name="name"]') as HTMLInputElement | null;
        nameInput?.focus();
      }, 50);
    }
  }, [editingLink]);

  const isCreating = !editingLink;

  const getFieldError = (fieldName: keyof AffiliateLink | 'form'): string | undefined => {
    const state = isCreating ? createState : updateState;
    if (state?.error && typeof state.error === 'object' && fieldName in state.error && state.error[fieldName]) {
      const fieldErrors = state.error[fieldName];
      return Array.isArray(fieldErrors) ? fieldErrors[0] : undefined;
    }
    return undefined;
  }

  const handleCancelEdit = () => {
    setEditingLink(null);
    formRef.current?.reset();
    setSelectedPartnerId("");
  }

  return (
    <div className="bg-muted/50 p-6 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{isCreating ? 'Add New Link' : `Editing Link`}</h2>
        {!isCreating && (
          <Button variant="ghost" size="icon" onClick={handleCancelEdit} title="Cancel edit">
            <X size={20} />
          </Button>
        )}
      </div>

      <form
        key={editingLink?.id ?? 'new'}
        ref={formRef}
        action={isCreating ? createAction : updateAction}
        className="space-y-4 mb-8"
      >
        {!isCreating && <input type="hidden" name="id" value={editingLink.id} />}

        <div>
          <Select
            name="partnerId"
            required
            value={selectedPartnerId}
            onValueChange={setSelectedPartnerId}
          >
            <SelectTrigger className="w-full bg-background border-muted focus:ring-primary">
              <SelectValue placeholder="Select a Partner" />
            </SelectTrigger>
            <SelectContent>
              {partners.length === 0 && <SelectItem value="" disabled>No partners available</SelectItem>}
              {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {getFieldError('partnerId') && (
            <p className="text-xs text-destructive mt-1">{getFieldError('partnerId')}</p>
          )}
        </div>

        <div>
          <Input
            name="name"
            placeholder="Link Name (e.g., Data Science Course)"
            required
            defaultValue={editingLink?.name ?? ''}
            className="w-full bg-background border-muted focus-visible:ring-primary"
            aria-invalid={!!getFieldError('name')}
            aria-describedby="link-name-error"
          />
          {getFieldError('name') && (
            <p id="link-name-error" className="text-xs text-destructive mt-1">{getFieldError('name')}</p>
          )}
        </div>

        <div>
          <Input
            name="slug"
            placeholder="Short Slug (e.g., coursera-data)"
            required
            defaultValue={editingLink?.slug ?? ''}
            className="w-full bg-background border-muted focus-visible:ring-primary"
            aria-invalid={!!getFieldError('slug')}
            aria-describedby="link-slug-error"
          />
          {getFieldError('slug') && (
            <p id="link-slug-error" className="text-xs text-destructive mt-1">{getFieldError('slug')}</p>
          )}
        </div>

        <div>
          <Textarea
            name="url"
            placeholder="Full Affiliate URL (https://...)"
            rows={3}
            required
            defaultValue={editingLink?.url ?? ''}
            className="w-full bg-background border-muted focus-visible:ring-primary"
            aria-invalid={!!getFieldError('url')}
            aria-describedby="link-url-error"
          />
          {getFieldError('url') && (
            <p id="link-url-error" className="text-xs text-destructive mt-1">{getFieldError('url')}</p>
          )}
        </div>

        <LinkSubmitButton text={isCreating ? 'Add New Link' : 'Update Link'} />

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

      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2">Existing Links</h3>
        {links.length > 0 ? (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="p-2 font-medium">Name</th>
                <th className="p-2 font-medium">Partner</th>
                <th className="p-2 font-medium">Slug</th>
                <th className="p-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-muted hover:bg-muted/50 group">
                  <td className="p-2 font-medium">{link.name}</td>
                  <td className="p-2 text-muted-foreground">{link.partner.name}</td>
                  <td className="p-2 font-mono text-xs bg-muted/50 rounded-sm">{link.slug}</td>
                  <td className="p-2 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingLink(link)} title="Edit Link">
                        <Edit size={16} />
                      </Button>
                      <form action={deleteActionHook}>
                        <input type="hidden" name="id" value={link.id} />
                        <LinkDeleteButton linkId={link.id}/>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No affiliate links created yet.</p>
        )}
      </div>
    </div>
  )
}