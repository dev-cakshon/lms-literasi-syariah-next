'use client';

import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo,
  Undo,
} from 'lucide-react';
import { marked } from 'marked';
import { useEffect, useRef } from 'react';
import TurndownService from 'turndown';

import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string; // Markdown
  onChange: (markdown: string) => void;
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

function markdownToHtml(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

function htmlToMarkdown(html: string): string {
  return turndown.turndown(html);
}

export const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary-600 underline' },
      }),
    ],
    content: markdownToHtml(value),
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const md = htmlToMarkdown(editor.getHTML());
      onChange(md);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none',
      },
    },
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const currentMd = htmlToMarkdown(editor.getHTML());
    if (currentMd !== value) {
      editor.commands.setContent(markdownToHtml(value));
    }
  }, [value, editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type='button'
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded hover:bg-slate-200 transition',
        isActive && 'bg-slate-200 text-primary-700'
      )}
    >
      {children}
    </button>
  );

  const handleLink = () => {
    const url = prompt('Masukkan URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
  };

  return (
    <div className='rounded-md border bg-white'>
      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5'>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title='Bold'
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title='Italic'
        >
          <Italic size={16} />
        </ToolbarButton>
        <div className='w-px h-5 bg-slate-300 mx-1' />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
          title='Heading 2'
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive('heading', { level: 3 })}
          title='Heading 3'
        >
          <Heading3 size={16} />
        </ToolbarButton>
        <div className='w-px h-5 bg-slate-300 mx-1' />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title='Bullet List'
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title='Ordered List'
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <div className='w-px h-5 bg-slate-300 mx-1' />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title='Code Block'
        >
          <Code size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleLink}
          isActive={editor.isActive('link')}
          title='Link'
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        <div className='w-px h-5 bg-slate-300 mx-1' />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title='Undo'
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title='Redo'
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};
