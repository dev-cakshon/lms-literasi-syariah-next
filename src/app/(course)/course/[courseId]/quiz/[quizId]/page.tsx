"use client";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { getQuizDetail, getQuizzesByCourse } from "@/lib/firestore";

import Button from "@/components/buttons/Button";
import { IconBadge } from "@/components/IconBadge"
import { type Question, MultipleAnswer} from "@/components/quiz/MultipleAnswer";

interface QuizPageProps {
    params: Promise<{ courseId: string; quizId: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
    const [courseId, setCourseId] = useState<string | null>(null);
    const [quizId, setQuizId] = useState<string | null>(null);
    const [quizTitle, setQuizTitle] = useState<string>("Quiz");
    const [quizData, setQuizData] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

    // Update selectedAnswers when quizData changes
    useEffect(() => {
        setSelectedAnswers(new Array(quizData.length).fill(-1));
    }, [quizData]);
    const [showResult, setShowResult] = useState(false);

    // Fetch courseId and quizId from params
    useEffect(() => {
        params.then((p) => {
            setCourseId(p.courseId);
            setQuizId(p.quizId);
        });
    }, [params]);

    // Fetch quiz data from Firestore
    useEffect(() => {
        if (!courseId || !quizId) return;

        async function fetchQuizData() {
            if (!courseId || !quizId) return;

            try {
                const quizDetail = await getQuizDetail(courseId, quizId);
                
                if (quizDetail) {
                    const quiz = quizDetail as {
                        title?: string;
                        questions?: Array<{
                            type: string;
                            questionText: string;
                            options: string[];
                            correctAnswerIndex: number;
                            correctAnswerText: string;
                            points: number;
                        }>;
                    };

                    if (quiz.title) {
                        setQuizTitle(quiz.title);
                    }

                    if (quiz.questions && Array.isArray(quiz.questions)) {
                        // Map API response to Question format
                        const mappedQuestions: Question[] = quiz.questions
                            .filter((q) => q.type === "multipleChoice")
                            .map((q, index) => ({
                                id: index + 1,
                                question: q.questionText,
                                options: q.options,
                                correctAnswer: q.correctAnswerIndex,
                                points: q.points,
                            }));
                        
                        if (mappedQuestions.length > 0) {
                            setQuizData(mappedQuestions);
                        }
                    }
                }
            } catch (error) {
                // Use dummy data as fallback
            } finally {
                setLoading(false);
            }
        }

        fetchQuizData();
    }, [courseId, quizId]);

    const handleStartQuiz = () => {
        setQuizStarted(true);
    };

    const handleSelectAnswer = (answerIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestion] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < quizData.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = () => {
        setShowResult(true);
    };

    const calculateScore = () => {
        let correct = 0;
        selectedAnswers.forEach((answer, index) => {
            if (answer === quizData[index].correctAnswer) {
                correct++;
            }
        });
        return correct;
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">Memuat quiz...</p>
            </div>
        );
    }

    // Konfirmasi Start Quiz
    if (!quizStarted) {
        const totalPoints = quizData.reduce((sum, q) => sum + q.points, 0);
        
        return (
            <div className="flex flex-col items-center justify-center max-w-6xl mx-auto p-6">
                <div className="max-w-md w-full text-center">
                    <div className="rounded-md flex justify-center items-center p-3">
                        <IconBadge icon={Trophy} variant="success" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">{quizTitle}</h1>
                    <p className="text-gray-600 mb-6">
                        {quizData.length} Soal - {totalPoints} Poin
                    </p>
                    <Button onClick={handleStartQuiz}>Mulai Kuis</Button>
                </div>
            </div>
        );
    }

    // Hasil Quiz
    if (showResult) {
        const score = calculateScore();
        const percentage = Math.round((score / quizData.length) * 100);

        return (
            <div className="flex flex-col items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold mb-6 text-center">Hasil Quiz</h1>
                    <div className="text-center mb-8">
                        <p className="text-6xl font-bold text-blue-600 mb-2">
                            {percentage}%
                        </p>
                        <p className="text-xl text-gray-600">
                            Anda menjawab benar {score} dari {quizData.length} soal
                        </p>
                    </div>

                    <div className="space-y-4">
                        {quizData.map((question, index) => {
                            const isCorrect =
                                selectedAnswers[index] === question.correctAnswer;
                            return (
                                <div
                                    key={question.id}
                                    className={`p-4 rounded-lg border-2 ${isCorrect
                                        ? "border-green-500 bg-green-50"
                                        : "border-red-500 bg-red-50"
                                        }`}
                                >
                                    <p className="font-semibold mb-2">
                                        {index + 1}. {question.question}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Jawaban Anda:{" "}
                                        {selectedAnswers[index] >= 0
                                            ? question.options[selectedAnswers[index]]
                                            : "Tidak dijawab"}
                                    </p>
                                    {!isCorrect && (
                                        <p className="text-sm text-green-600 font-medium">
                                            Jawaban benar:{" "}
                                            {question.options[question.correctAnswer]}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 text-center">
                        <Button
                            onClick={() => {
                                setQuizStarted(false);
                                setCurrentQuestion(0);
                                setSelectedAnswers(new Array(quizData.length).fill(-1));
                                setShowResult(false);
                            }}
                        >
                            Ulangi Quiz
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Questions
    const question = quizData[currentQuestion];
    const isLastQuestion = currentQuestion === quizData.length - 1;
    const answeredCount = selectedAnswers.filter((a) => a !== -1).length;

    return (
        <MultipleAnswer
            question={question}
            currentQuestion={currentQuestion}
            totalQuestions={quizData.length}
            selectedAnswer={selectedAnswers[currentQuestion]}
            onSelectAnswer={handleSelectAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            isLastQuestion={isLastQuestion}
            answeredCount={answeredCount}
        />
    );
}