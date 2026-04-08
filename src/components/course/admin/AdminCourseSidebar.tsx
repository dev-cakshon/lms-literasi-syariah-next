'use client';

import {
  type DropResult,
  DragDropContext,
  Draggable,
  Droppable,
} from '@hello-pangea/dnd';
import { FileText, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
  ApiError,
  createChapter,
  deleteChapter,
  updateChapter,
} from '@/lib/api';
import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';

import type { Chapter, Course } from '@/types';

interface AdminCourseSidebarProps {
  course: Course;
  chapters: Chapter[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onChaptersChanged: () => void;
}

export const AdminCourseSidebar = ({
  course,
  chapters,
  activeTab,
  onTabChange,
  onChaptersChanged,
}: AdminCourseSidebarProps) => {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddChapter = async () => {
    try {
      setAdding(true);
      setError(null);
      const nextOrder =
        chapters.length > 0
          ? Math.max(...chapters.map((chapter) => chapter.order || 0)) + 1
          : 1;

      const newChapter = await createChapter(course.id, {
        title: 'Bab Baru',
        content: '',
        videoUrl: '',
        order: nextOrder,
      });
      onChaptersChanged();
      onTabChange(newChapter.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal membuat bab baru.');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Yakin ingin menghapus bab ini?')) return;
    try {
      setError(null);
      await deleteChapter(course.id, chapterId);
      if (activeTab === chapterId) {
        onTabChange('info');
      }
      onChaptersChanged();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menghapus bab.');
      }
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const srcIdx = result.source.index;
    const destIdx = result.destination.index;
    if (srcIdx === destIdx) return;

    const reordered = Array.from(chapters);
    const [moved] = reordered.splice(srcIdx, 1);
    reordered.splice(destIdx, 0, moved);

    try {
      setError(null);
      const changedOrders = reordered
        .map((chapter, idx) => ({
          chapter,
          nextOrder: idx + 1,
        }))
        .filter(({ chapter, nextOrder }) => (chapter.order || 0) !== nextOrder);

      if (changedOrders.length === 0) {
        return;
      }

      await Promise.all(
        changedOrders.map(({ chapter, nextOrder }) =>
          updateChapter(course.id, chapter.id, { order: nextOrder })
        )
      );
      onChaptersChanged();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal mengurutkan ulang bab.');
      }
      onChaptersChanged(); // refetch to restore
    }
  };

  return (
    <div className='h-full border-r flex flex-col overflow-y-auto shadow-sm'>
      {/* Course header */}
      <div className='p-6 border-b space-y-2'>
        <div className='flex items-center gap-2'>
          <h2 className='font-semibold text-sm line-clamp-2 flex-1'>
            {course.title}
          </h2>
          <Badge variant={course.isPublished ? 'default' : 'secondary'}>
            {course.isPublished ? 'Diterbitkan' : 'Draft'}
          </Badge>
        </div>
        {error && <p className='text-sm text-red-600'>{error}</p>}
      </div>

      {/* Info tab */}
      <button
        onClick={() => onTabChange('info')}
        className={cn(
          'flex items-center gap-x-2 text-sm font-medium pl-6 pr-4 py-4 transition-all hover:bg-slate-100 text-slate-600',
          activeTab === 'info' &&
            'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
        )}
      >
        <FileText size={18} />
        Info Kursus
      </button>

      {/* Chapter list with DnD */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId='chapters'>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className='flex flex-col'
            >
              {chapters.map((chapter, index) => (
                <Draggable
                  key={chapter.id}
                  draggableId={chapter.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        'flex items-center text-sm text-slate-600 transition-all hover:bg-slate-100 group',
                        activeTab === chapter.id &&
                          'bg-primary-50 text-primary-700 border-r-2 border-primary-700',
                        snapshot.isDragging && 'bg-slate-200 shadow-md'
                      )}
                    >
                      {/* Drag handle */}
                      <div
                        {...provided.dragHandleProps}
                        className='pl-2 py-4 cursor-grab active:cursor-grabbing'
                      >
                        <GripVertical size={16} className='text-slate-400' />
                      </div>

                      {/* Chapter label */}
                      <button
                        onClick={() => onTabChange(chapter.id)}
                        className='flex-1 text-left py-4 pl-1 pr-2 font-medium truncate'
                      >
                        {chapter.title}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChapter(chapter.id);
                        }}
                        className='p-2 mr-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition'
                        title='Hapus bab'
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add chapter button */}
      <button
        onClick={handleAddChapter}
        disabled={adding}
        className='flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 pl-6 py-4 transition hover:bg-slate-50 disabled:opacity-50'
      >
        <Plus size={16} />
        {adding ? 'Menambahkan...' : 'Tambah Bab'}
      </button>
    </div>
  );
};
