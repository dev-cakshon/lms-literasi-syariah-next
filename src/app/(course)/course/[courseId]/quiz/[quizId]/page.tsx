import { redirect } from 'next/navigation';

interface QuizPageProps {
  params: Promise<{ courseId: string; quizId: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { courseId } = await params;
  redirect(`/course/${courseId}`);
}
