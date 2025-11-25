"use client";

import Button from "@/components/buttons/Button";

import { QuizOption } from "./QuizOption";

export interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
}

interface MultipleAnswerProps {
    question: Question;
    currentQuestion: number;
    totalQuestions: number;
    selectedAnswer: number;
    onSelectAnswer: (answerIndex: number) => void;
    onNext: () => void;
    onPrevious: () => void;
    onSubmit: () => void;
    isLastQuestion: boolean;
    answeredCount: number;
    isSubmitting?: boolean;
}

export const MultipleAnswer = ({
    question,
    currentQuestion,
    totalQuestions,
    selectedAnswer,
    onSelectAnswer,
    onNext,
    onPrevious,
    onSubmit,
    isLastQuestion,
    answeredCount,
    isSubmitting = false,
}: MultipleAnswerProps) => {
    const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full p-8">
                {/* Progress */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span className="font-bold">
                            Question {currentQuestion + 1}/{totalQuestions}
                        </span>
                        <span>{answeredCount} terjawab</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary-500 h-2 rounded-full transition-all"
                            style={{
                                width: `${progressPercentage}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Question */}
                <h2 className="text-2xl font-bold mb-8 text-primary-900">
                    {question.question}
                </h2>

                {/* Options */}
                <div className="space-y-3 mb-8">
                    {question.options.map((option, index) => (
                        <QuizOption
                            key={index}
                            option={option}
                            index={index}
                            isSelected={selectedAnswer === index}
                            onSelect={() => onSelectAnswer(index)}
                        />
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <Button
                        onClick={onPrevious}
                        disabled={currentQuestion === 0}
                        variant="outline"
                    >
                        Sebelumnya
                    </Button>

                    {isLastQuestion ? (
                        <Button
                            onClick={onSubmit}
                            disabled={isSubmitting}
                            variant="primary"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Quiz"}
                        </Button>
                    ) : (
                        <Button onClick={onNext} variant="primary">
                            Next Question
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
