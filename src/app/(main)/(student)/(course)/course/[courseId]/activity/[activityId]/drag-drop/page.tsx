import { DragDropPlayer } from '@/components/activity/DragDropPlayer';

type Params = Promise<{ courseId: string; activityId: string }>;

export default function DragDropActivityPage({ params }: { params: Params }) {
  return <DragDropPlayer params={params} />;
}
