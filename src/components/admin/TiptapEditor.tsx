// /src/components/admin/TiptapEditor.tsx - FIXED VERSION
"use client";

import {
  useEditor,
  EditorContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link as LinkIcon,
  List, ListOrdered, Pilcrow, Heading1, Heading2, Heading3,
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Table as TableIcon, DollarSign, Upload,
  Plus, Minus, Trash2,
  Move
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

// NEW: Import affiliate link type
type AffiliateLink = {
  id: string;
  name: string;
  url: string;
  slug: string;
  partner: {
    name: string;
  };
};

interface TiptapEditorProps {
  initialContent?: string;
  onChange: (htmlContent: string) => void;
  isSubmitting?: boolean;
  affiliateLinks?: AffiliateLink[];
}

const TiptapEditor = ({ 
  initialContent = "", 
  onChange, 
  isSubmitting = false,
  affiliateLinks = []
}: TiptapEditorProps) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isAffiliateDialogOpen, setIsAffiliateDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [isImageSettingsDialogOpen, setIsImageSettingsDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [selectedImageProps, setSelectedImageProps] = useState({
    src: "",
    width: "",
    align: "center"
  });
  
  // Use ref to avoid the circular dependency
  const editorRef = useRef<any>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({}),
      Underline,
      Link.configure({ 
        openOnClick: false, 
        autolink: true,
        HTMLAttributes: {
          class: 'affiliate-link',
        },
      }),
      Image.configure({ 
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'blog-image inline-image',
        },
      }),
      TextAlign.configure({ 
        types: ['heading', 'paragraph', 'image'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      TableRow,
      TableHeader,
      TableCell,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'blog-table',
        },
      }),
    ],
    content: initialContent,
    editable: !isSubmitting,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      onChange(content);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert focus:outline-none p-4 min-h-[300px] max-w-full border border-input rounded-b-md border-t-0',
      },
      handlePaste: (view, event) => {
        // Handle image paste
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf('image') !== -1) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              handleImageUpload(file);
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        // Handle image drop
        const files = Array.from(event.dataTransfer?.files || []);
        for (const file of files) {
          if (file.type.indexOf('image') !== -1) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Update the ref when editor changes
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Enhanced image upload function
  const handleImageUpload = useCallback((file: File) => {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image size must be less than 5MB'));
        return;
      }

      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result;
        if (base64 && editorRef.current) {
          editorRef.current.chain().focus().setImage({ 
            src: base64 as string
          }).run();
          resolve(base64);
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Add image via URL
  const addImageByUrl = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ 
        src: imageUrl
      }).run();
      setImageUrl("");
      setIsImageDialogOpen(false);
      toast.success("Image inserted successfully");
    }
  };

  // Enhanced image settings functions
  const openImageSettings = () => {
    if (editor && editor.isActive('image')) {
      const attrs = editor.getAttributes('image');
      const style = attrs.style || '';
      
      // Parse current style to get width and alignment
      const widthMatch = style.match(/width:\s*([^;]+)/);
      const width = widthMatch ? widthMatch[1] : "auto";
      
      let align = "center";
      if (style.includes('float: left')) align = "left";
      else if (style.includes('float: right')) align = "right";
      else if (style.includes('margin: 0 auto')) align = "center";

      setSelectedImageProps({
        src: attrs.src || "",
        width: width,
        align: align
      });
      setIsImageSettingsDialogOpen(true);
    }
  };

  const updateImageSettings = () => {
    if (editor && editor.isActive('image')) {
      const { width, align } = selectedImageProps;
      
      // Build style string properly
      let style = `max-width: 100%; height: auto; `;
      
      // Add width if specified
      if (width && width !== "auto") {
        style += `width: ${width}; `;
      }
      
      // Add alignment
      switch (align) {
        case 'left':
          style += 'float: left; margin: 0 1rem 1rem 0;';
          break;
        case 'right':
          style += 'float: right; margin: 0 0 1rem 1rem;';
          break;
        case 'center':
          style += 'display: block; margin: 0 auto;';
          break;
      }

      // Use command to update image attributes
      editor.chain().focus().updateAttributes('image', { style }).run();
      setIsImageSettingsDialogOpen(false);
      toast.success("Image settings updated");
    }
  };

  // Enhanced quick image alignment functions
  const alignImageLeft = () => {
    if (editor && editor.isActive('image')) {
      const attrs = editor.getAttributes('image');
      const currentStyle = attrs.style || '';
      
      // Preserve width if exists, otherwise use auto
      const widthMatch = currentStyle.match(/width:\s*([^;]+)/);
      const width = widthMatch ? widthMatch[1] : "auto";
      
      const style = `max-width: 100%; height: auto; ${width !== "auto" ? `width: ${width}; ` : ''}float: left; margin: 0 1rem 1rem 0;`;
      
      editor.chain().focus().updateAttributes('image', { style }).run();
      toast.success("Image aligned left");
    }
  };

  const alignImageCenter = () => {
    if (editor && editor.isActive('image')) {
      const attrs = editor.getAttributes('image');
      const currentStyle = attrs.style || '';
      
      // Preserve width if exists, otherwise use auto
      const widthMatch = currentStyle.match(/width:\s*([^;]+)/);
      const width = widthMatch ? widthMatch[1] : "auto";
      
      const style = `max-width: 100%; height: auto; ${width !== "auto" ? `width: ${width}; ` : ''}display: block; margin: 0 auto;`;
      
      editor.chain().focus().updateAttributes('image', { style }).run();
      toast.success("Image aligned center");
    }
  };

  const alignImageRight = () => {
    if (editor && editor.isActive('image')) {
      const attrs = editor.getAttributes('image');
      const currentStyle = attrs.style || '';
      
      // Preserve width if exists, otherwise use auto
      const widthMatch = currentStyle.match(/width:\s*([^;]+)/);
      const width = widthMatch ? widthMatch[1] : "auto";
      
      const style = `max-width: 100%; height: auto; ${width !== "auto" ? `width: ${width}; ` : ''}float: right; margin: 0 0 1rem 1rem;`;
      
      editor.chain().focus().updateAttributes('image', { style }).run();
      toast.success("Image aligned right");
    }
  };

  // NEW: Image resize functions
  const resizeImage = (width: string) => {
    if (editor && editor.isActive('image')) {
      const attrs = editor.getAttributes('image');
      const currentStyle = attrs.style || '';
      
      // Parse current alignment
      let alignStyle = 'display: block; margin: 0 auto;';
      if (currentStyle.includes('float: left')) alignStyle = 'float: left; margin: 0 1rem 1rem 0;';
      else if (currentStyle.includes('float: right')) alignStyle = 'float: right; margin: 0 0 1rem 1rem;';
      
      const style = `max-width: 100%; height: auto; width: ${width}; ${alignStyle}`;
      
      editor.chain().focus().updateAttributes('image', { style }).run();
      toast.success(`Image resized to ${width}`);
    }
  };

  // Insert affiliate link
  const insertAffiliateLink = (affiliateLink: AffiliateLink) => {
    if (editor) {
      editor.chain().focus().setLink({ href: affiliateLink.url }).run();
      setIsAffiliateDialogOpen(false);
      toast.success("Affiliate link inserted");
    }
  };

  // Handle file upload from dialog
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file)
        .then(() => {
          toast.success("Image uploaded successfully");
          setIsImageDialogOpen(false);
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
  };

  // Enhanced table functions
  const addCustomTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ 
        rows: Math.max(1, tableRows), 
        cols: Math.max(1, tableCols), 
        withHeaderRow: true 
      }).run();
      setIsTableDialogOpen(false);
      toast.success(`Table created with ${tableRows} rows and ${tableCols} columns`);
    }
  };

  const addRowBefore = () => {
    if (editor) {
      editor.chain().focus().addRowBefore().run();
      toast.success("Row added above");
    }
  };

  const addRowAfter = () => {
    if (editor) {
      editor.chain().focus().addRowAfter().run();
      toast.success("Row added below");
    }
  };

  const deleteRow = () => {
    if (editor) {
      editor.chain().focus().deleteRow().run();
      toast.success("Row deleted");
    }
  };

  const addColumnBefore = () => {
    if (editor) {
      editor.chain().focus().addColumnBefore().run();
      toast.success("Column added before");
    }
  };

  const addColumnAfter = () => {
    if (editor) {
      editor.chain().focus().addColumnAfter().run();
      toast.success("Column added after");
    }
  };

  const deleteColumn = () => {
    if (editor) {
      editor.chain().focus().deleteColumn().run();
      toast.success("Column deleted");
    }
  };

  const deleteTable = () => {
    if (editor) {
      editor.chain().focus().deleteTable().run();
      toast.success("Table deleted");
    }
  };

  // Text alignment commands
  const alignTextLeft = () => {
    if (editor) {
      editor.chain().focus().setTextAlign('left').run();
    }
  };

  const alignTextCenter = () => {
    if (editor) {
      editor.chain().focus().setTextAlign('center').run();
    }
  };

  const alignTextRight = () => {
    if (editor) {
      editor.chain().focus().setTextAlign('right').run();
    }
  };

  const alignJustify = () => {
    if (editor) {
      editor.chain().focus().setTextAlign('justify').run();
    }
  };

  // Cleanup Effect
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const MenuBar = ({ editor }: { editor: any | null }) => {
    if (!editor) {
      return null;
    }

    const setLink = useCallback(() => {
      const previousUrl = editor.getAttributes('link').href;
      const url = window.prompt('URL', previousUrl);

      if (url === null) return;

      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }

      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
      setIsImageDialogOpen(true);
    }, []);

    const ToggleBtn = ({ action, icon, label, isActive = false, disabled = false }: { 
      action: () => void, 
      icon: React.ReactNode, 
      label: string, 
      isActive?: boolean,
      disabled?: boolean 
    }) => (
      <Button 
        variant={isActive ? "secondary" : "ghost"} 
        size="sm" 
        onClick={action} 
        title={label} 
        type="button"
        disabled={disabled}
      >
        {icon}
      </Button>
    );

    return (
      <div className="flex flex-wrap items-center gap-1 border border-input bg-transparent rounded-t-md p-2 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        {/* Text Formatting */}
        <ToggleBtn action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={<Bold size={16} />} label="Bold" />
        <ToggleBtn action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={<Italic size={16} />} label="Italic" />
        <ToggleBtn action={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={<UnderlineIcon size={16} />} label="Underline" />
        <ToggleBtn action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={<Strikethrough size={16} />} label="Strikethrough" />
        
        {/* Headings */}
        <ToggleBtn action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={<Heading1 size={16} />} label="H1" />
        <ToggleBtn action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={<Heading2 size={16} />} label="H2" />
        <ToggleBtn action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} icon={<Heading3 size={16} />} label="H3" />
        
        {/* Lists */}
        <ToggleBtn action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={<List size={16} />} label="Bullet List" />
        <ToggleBtn action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={<ListOrdered size={16} />} label="Ordered List" />
        
        <ToggleBtn action={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')} icon={<Pilcrow size={16} />} label="Paragraph" />
        
        {/* Text Alignment */}
        <ToggleBtn action={alignTextLeft} isActive={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft size={16} />} label="Align Left" />
        <ToggleBtn action={alignTextCenter} isActive={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter size={16} />} label="Align Center" />
        <ToggleBtn action={alignTextRight} isActive={editor.isActive({ textAlign: 'right' })} icon={<AlignRight size={16} />} label="Align Right" />
        <ToggleBtn action={alignJustify} isActive={editor.isActive({ textAlign: 'justify' })} icon={<AlignJustify size={16} />} label="Justify" />
        
        <ToggleBtn action={setLink} isActive={editor.isActive('link')} icon={<LinkIcon size={16} />} label="Set Link" />
        <ToggleBtn action={addImage} icon={<ImageIcon size={16} />} label="Add Image" />
        
        {/* FIXED: Image Controls - Only show when image is selected */}
        {editor.isActive('image') && (
          <>
            <div className="h-6 w-px bg-border mx-1" />
            <span className="text-xs text-muted-foreground px-2">Image:</span>
            <ToggleBtn action={alignImageLeft} icon={<AlignLeft size={16} />} label="Align Left" />
            <ToggleBtn action={alignImageCenter} icon={<AlignCenter size={16} />} label="Align Center" />
            <ToggleBtn action={alignImageRight} icon={<AlignRight size={16} />} label="Align Right" />
            
            {/* NEW: Quick resize buttons */}
            <div className="h-6 w-px bg-border mx-1" />
            <ToggleBtn action={() => resizeImage('25%')} icon={<Minus size={16} />} label="Small" />
            <ToggleBtn action={() => resizeImage('50%')} icon={<Move size={16} />} label="Medium" />
            <ToggleBtn action={() => resizeImage('75%')} icon={<Plus size={16} />} label="Large" />
            <ToggleBtn action={() => resizeImage('100%')} icon={<ImageIcon size={16} />} label="Full Width" />
            
            {/* Image Settings Dialog Trigger */}
            <ToggleBtn action={openImageSettings} icon={<Move size={16} />} label="More Settings" />
          </>
        )}
        
        {/* Enhanced Table Controls */}
        <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" title="Insert Table" type="button">
              <TableIcon size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Table</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border rounded-md mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border rounded-md mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsTableDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addCustomTable}>
                  Insert Table
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Table Operations - Only show when in a table */}
        {editor.isActive('table') && (
          <>
            <div className="h-6 w-px bg-border mx-1" />
            <ToggleBtn action={addRowBefore} icon={<Plus size={16} />} label="Add Row Above" />
            <ToggleBtn action={addRowAfter} icon={<Plus size={16} />} label="Add Row Below" />
            <ToggleBtn action={deleteRow} icon={<Minus size={16} />} label="Delete Row" />
            <ToggleBtn action={addColumnBefore} icon={<Plus size={16} />} label="Add Column Before" />
            <ToggleBtn action={addColumnAfter} icon={<Plus size={16} />} label="Add Column After" />
            <ToggleBtn action={deleteColumn} icon={<Minus size={16} />} label="Delete Column" />
            <ToggleBtn action={deleteTable} icon={<Trash2 size={16} />} label="Delete Table" />
          </>
        )}
        
        {/* Affiliate Link Button */}
        {affiliateLinks.length > 0 && (
          <Dialog open={isAffiliateDialogOpen} onOpenChange={setIsAffiliateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" title="Insert Affiliate Link" type="button">
                <DollarSign size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Insert Affiliate Link</DialogTitle>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {affiliateLinks.map((link) => (
                    <div 
                      key={link.id} 
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => insertAffiliateLink(link)}
                    >
                      <div className="font-medium">{link.name}</div>
                      <div className="text-sm text-muted-foreground">{link.partner.name}</div>
                      <div className="text-xs text-blue-600 truncate">{link.url}</div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <MenuBar editor={editor} />
      
      {/* Image Insert Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full p-2 border rounded-md mt-1"
              />
            </div>
            
            {/* File Upload Option */}
            <div>
              <label className="text-sm font-medium">Upload Image</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="flex-1 p-2 border rounded-md"
                />
                <Upload size={16} className="text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF, WebP.
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>💡 You can also:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Copy and paste an image directly into the editor</li>
                <li>Drag and drop an image file into the editor</li>
                <li><strong>After inserting, click on the image to reveal editing options in the toolbar</strong></li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addImageByUrl} disabled={!imageUrl}>
                Insert Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FIXED: Image Settings Dialog */}
      <Dialog open={isImageSettingsDialogOpen} onOpenChange={setIsImageSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image Preview */}
            {selectedImageProps.src && (
              <div className="flex justify-center">
                <img 
                  src={selectedImageProps.src} 
                  alt="Preview" 
                  className="max-h-40 rounded-lg border"
                  style={{ 
                    width: selectedImageProps.width === "auto" ? "auto" : selectedImageProps.width,
                    float: selectedImageProps.align as any,
                    margin: selectedImageProps.align === 'center' ? '0 auto' : 
                           selectedImageProps.align === 'left' ? '0 1rem 1rem 0' : '0 0 1rem 1rem'
                  }}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Width</label>
              <input
                type="text"
                value={selectedImageProps.width}
                onChange={(e) => setSelectedImageProps({...selectedImageProps, width: e.target.value})}
                placeholder="e.g., 300px, 50%, auto"
                className="w-full p-2 border rounded-md mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter width in pixels (300px), percentage (50%), or "auto"
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Alignment</label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={selectedImageProps.align === 'left' ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedImageProps({...selectedImageProps, align: 'left'})}
                  className="flex-1"
                >
                  <AlignLeft size={16} className="mr-2" />
                  Left
                </Button>
                <Button
                  variant={selectedImageProps.align === 'center' ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedImageProps({...selectedImageProps, align: 'center'})}
                  className="flex-1"
                >
                  <AlignCenter size={16} className="mr-2" />
                  Center
                </Button>
                <Button
                  variant={selectedImageProps.align === 'right' ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedImageProps({...selectedImageProps, align: 'right'})}
                  className="flex-1"
                >
                  <AlignRight size={16} className="mr-2" />
                  Right
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsImageSettingsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateImageSettings}>
                Apply Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditorContent editor={editor} />
      
      {/* FIXED: Stats Display - No Character Limit */}
      <div className="text-xs text-muted-foreground mt-2 text-right space-y-1">
        <div>
          Characters: {editor?.getText().length || 0} • 
          Words: {editor?.getText().split(/\s+/).filter(word => word.length > 0).length || 0}
        </div>
        <div className="text-green-600 font-medium">
          ✓ No character limit - Write as much as you need!
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;