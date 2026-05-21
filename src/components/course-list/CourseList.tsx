import { CourseCard } from './CourseCard';

interface CourseItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string | null;
  chaptersLength: number;
  isPublished?: boolean;
  category?: string;
  activities?: number;
  author?: string;
  points?: number;
  originalPoints?: number;
  progress?: number;
  editUrl?: string;
}

interface CourseListProps {
  items: CourseItem[];
}

export const CourseList = ({ items }: CourseListProps) => {
  return (
    <>
      <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4'>
        {items.map((item) => (
          <CourseCard
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            imageUrl={item.imageUrl}
            chaptersLength={item.chaptersLength}
            isPublished={item.isPublished}
            category={item.category}
            activities={item.activities}
            author={item.author}
            points={item.points}
            originalPoints={item.originalPoints}
            progress={item.progress}
            editUrl={item.editUrl}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className='text-center py-16 space-y-2'>
          <div className='text-4xl'>🔍</div>
          <p className='text-sm text-muted-foreground font-medium'>
            Tidak ada kursus ditemukan
          </p>
        </div>
      )}
    </>
  );
};
