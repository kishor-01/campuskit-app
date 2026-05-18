// src/components/admin/tiptap/AffiliateSuggestion.tsx
// Tiptap Suggestion extension for /affiliate slash command
'use client';

import { Extension } from '@tiptap/react';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
} from 'react';

// Affiliate link type
export type AffiliateLinkItem = {
  id: string;
  name: string;
  url: string;
  slug: string;
  partner: {
    name: string;
  };
};

// --- Popover List Component ---
interface AffiliateSuggestionListProps {
  items: AffiliateLinkItem[];
  command: (item: AffiliateLinkItem) => void;
}

interface AffiliateSuggestionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const AffiliateSuggestionList = forwardRef<AffiliateSuggestionListRef, AffiliateSuggestionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [items, command]
    );

    useEffect(() => setSelectedIndex(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-sm text-muted-foreground">
          No affiliate links found
        </div>
      );
    }

    return (
      <div className="bg-popover border border-border rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto min-w-[280px]">
        <div className="px-3 py-2 border-b border-border bg-muted/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Affiliate Links
          </p>
        </div>
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => selectItem(index)}
            className={`
              w-full text-left px-3 py-2.5 flex flex-col gap-0.5 transition-colors border-b border-border/50 last:border-b-0
              ${index === selectedIndex
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted/50 text-foreground'
              }
            `}
          >
            <span className="text-sm font-medium">{item.name}</span>
            <span className="text-[11px] text-muted-foreground">{item.partner.name}</span>
          </button>
        ))}
      </div>
    );
  }
);

AffiliateSuggestionList.displayName = 'AffiliateSuggestionList';

// --- Create the Extension ---
export function createAffiliateSlashCommand(affiliateLinks: AffiliateLinkItem[]) {
  return Extension.create({
    name: 'affiliateSlashCommand',

    addOptions() {
      return {
        suggestion: {
          char: '/',
          startOfLine: false,
          command: ({ editor, range, props }: any) => {
            const link = props as AffiliateLinkItem;

            // Delete the /affiliate trigger text
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .run();

            // Insert a styled affiliate deal card as HTML
            const cardHtml = `
              <a href="${link.url}" target="_blank" rel="noopener noreferrer sponsored" class="affiliate-link" style="display: inline-block; text-decoration: none;">
                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); font-size: 14px;">
                  <span style="font-weight: 600;">💰 ${link.name}</span>
                  <span style="color: #6b7280; font-size: 12px;">via ${link.partner.name}</span>
                </span>
              </a>
            `.trim();

            editor.chain().focus().insertContent(cardHtml).run();
          },
          items: ({ query }: { query: string }) => {
            // Only activate for "affiliate" trigger
            if (!query && affiliateLinks.length > 0) return [];
            
            const trigger = 'affiliate';
            const typedSoFar = query.toLowerCase();

            // User must be typing "affiliate" for the menu to appear
            if (!trigger.startsWith(typedSoFar) && typedSoFar !== trigger) {
              return [];
            }

            // Once they've typed enough of "affiliate", show the links
            if (typedSoFar.length >= 3 || typedSoFar === trigger) {
              return affiliateLinks.filter(
                (link) =>
                  link.name.toLowerCase().includes('') || true
              );
            }

            return [];
          },
          render: () => {
            let component: ReactRenderer<AffiliateSuggestionListRef> | null = null;
            let popup: HTMLElement | null = null;

            return {
              onStart: (props: any) => {
                component = new ReactRenderer(AffiliateSuggestionList, {
                  props,
                  editor: props.editor,
                });

                popup = document.createElement('div');
                popup.style.position = 'absolute';
                popup.style.zIndex = '9999';

                if (component.element) {
                  popup.appendChild(component.element);
                }

                document.body.appendChild(popup);

                // Position near the cursor
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect && popup) {
                    popup.style.left = `${rect.left}px`;
                    popup.style.top = `${rect.bottom + 4}px`;
                  }
                }
              },

              onUpdate: (props: any) => {
                component?.updateProps(props);

                const { clientRect } = props;
                if (clientRect && popup) {
                  const rect = clientRect();
                  if (rect) {
                    popup.style.left = `${rect.left}px`;
                    popup.style.top = `${rect.bottom + 4}px`;
                  }
                }
              },

              onKeyDown: (props: any) => {
                if (props.event.key === 'Escape') {
                  popup?.remove();
                  component?.destroy();
                  return true;
                }

                return component?.ref?.onKeyDown(props) ?? false;
              },

              onExit: () => {
                popup?.remove();
                component?.destroy();
              },
            };
          },
        } as Partial<SuggestionOptions>,
      };
    },

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,
        }),
      ];
    },
  });
}
