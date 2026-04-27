'use client';

import {
  type DropResult,
  DragDropContext,
  Draggable,
  Droppable,
} from '@hello-pangea/dnd';
import {
  ChevronDown,
  FileText,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import {
  ApiError,
  createChapter,
  deleteActivity,
  deleteChapter,
  updateActivity,
  updateChapter,
} from '@/lib/api';
import { cn } from '@/lib/utils';

import { ActivityCreationModal } from '@/components/admin/ActivityCreationModal';
import { Badge } from '@/components/ui/badge';

import type { Course, CourseContentItem } from '@/types';

interface AdminCourseSidebarProps {
  course: Course;
  contentItems: CourseContentItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onContentChanged: () => void;
}

export const AdminCourseSidebar = ({
  course,
  contentItems,
  activeTab,
  onTabChange,
  onContentChanged,
}: AdminCourseSidebarProps) => {
  const [adding, setAdding] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddChapter = async () => {
    try {
      setAdding(true);
      setError(null);
      const nextOrder =
        contentItems.length > 0
          ? Math.max(...contentItems.map((item) => item.position || 0)) + 1
          : 1;

      const newChapter = await createChapter(course.id, {
        title: 'Bab Baru',
        content: '',
        videoUrl: '',
        order: nextOrder,
      });
      onContentChanged();
      onTabChange(`chapter:${newChapter.id}`);
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
      if (activeTab === `chapter:${chapterId}` || activeTab === chapterId) {
        onTabChange('info');
      }
      onContentChanged();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menghapus bab.');
      }
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Yakin ingin menghapus aktivitas ini?')) return;
    try {
      setError(null);
      await deleteActivity(course.id, activityId);
      if (activeTab === `activity:${activityId}`) {
        onTabChange('info');
      }
      onContentChanged();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menghapus aktivitas.');
      }
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const srcIdx = result.source.index;
    const destIdx = result.destination.index;
    if (srcIdx === destIdx) return;

    const reordered = Array.from(contentItems);
    const [moved] = reordered.splice(srcIdx, 1);
    reordered.splice(destIdx, 0, moved);

    try {
      setError(null);
      const changedPositions = reordered
        .map((item, idx) => ({
          item,
          nextPosition: idx + 1,
        }))
        .filter(
          ({ item, nextPosition }) => (item.position || 0) !== nextPosition,
        );

      if (changedPositions.length === 0) {
        return;
      }

      await Promise.all(
        changedPositions.map(({ item, nextPosition }) => {
          if (item.itemType === 'chapter') {
            return updateChapter(course.id, item.id, { order: nextPosition });
          }
          return updateActivity(course.id, item.id, { position: nextPosition });
        }),
      );
      onContentChanged();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal mengurutkan ulang bab.');
      }
      onContentChanged(); // refetch to restore
    }
  };

  return (
    <div className='flex h-full flex-col overflow-y-auto border-r border-slate-200 bg-ivory shadow-elevated-1'>
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
            'bg-primary-50 text-primary-700 border-r-2 border-primary-700',
        )}
      >
        <FileText size={18} />
        Info Kursus
      </button>

      {/* Content list with DnD */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId='content-items'>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className='flex flex-col'
            >
              {contentItems.map((item, index) => (
                <Draggable
                  key={`${item.itemType}:${item.id}`}
                  draggableId={`${item.itemType}:${item.id}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        'flex items-center text-sm text-slate-600 transition-all hover:bg-slate-100 group',
                        activeTab === `${item.itemType}:${item.id}` &&
                          'bg-primary-50 text-primary-700 border-r-2 border-primary-700',
                        snapshot.isDragging && 'bg-slate-200 shadow-md',
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
                        onClick={() =>
                          onTabChange(`${item.itemType}:${item.id}`)
                        }
                        className='flex-1 text-left py-4 pl-1 pr-2 font-medium truncate'
                      >
                        {item.title}
                      </button>

                      {/* Delete button */}
                      {item.itemType === 'chapter' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(item.id);
                          }}
                          className='p-2 mr-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition'
                          title='Hapus bab'
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {item.itemType === 'activity' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteActivity(item.id);
                          }}
                          className='p-2 mr-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition'
                          title='Hapus aktivitas'
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
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
      <div className='relative'>
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className='w-full flex items-center justify-between gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 pl-6 pr-4 py-4 transition hover:bg-slate-50'
        >
          <span className='flex items-center gap-2'>
            <Plus size={16} />
            Tambah Konten
          </span>
          <ChevronDown
            size={16}
            className={cn(
              'transition-transform',
              isDropdownOpen && 'rotate-180',
            )}
          />
        </button>

        {isDropdownOpen && (
          <div className='absolute left-6 right-4 bottom-14 z-20 overflow-hidden rounded-md border bg-white shadow-lg'>
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                void handleAddChapter();
              }}
              disabled={adding}
              className='w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50'
            >
              {adding ? 'Menambahkan...' : 'Bab (Chapter)'}
            </button>
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setIsActivityModalOpen(true);
              }}
              className='w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 border-t'
            >
              Aktivitas
            </button>
          </div>
        )}
      </div>

      <ActivityCreationModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        courseId={course.id}
        onActivityCreated={onContentChanged}
      />
    </div>
  );
};
