import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: string;
  imageUrl: string | null;
  diagramData: any | null;
  videoUrl: string | null;
  options: {
    id: string;
    text: string;
  }[];
  points: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string | null;
  position: string;
  difficulty: string;
  category: string;
  passingScore: number;
  timeLimit: number | null;
  questions: QuizQuestion[];
}

interface Answer {
  questionId: number;
  selectedOptionId: string;
  timeSpent?: number;
}

const FootballIqQuizPage: React.FC = () => {
  // Extract quiz ID and attempt ID from URL
  const [, navigate] = useLocation();
  const path = window.location.pathname;
  const match = path.match(/\/football-iq\/quiz\/(\d+)\/attempt\/(\d+)/);
  
  const quizId = match ? parseInt(match[1]) : null;
  const attemptId = match ? parseInt(match[2]) : null;
  
  const { athlete } = useAuth();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  
  // Fetch the quiz
  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ['/api/football-iq/quizzes', quizId, 'for-taking'],
    queryFn: async () => {
      if (!quizId) throw new Error('Quiz ID is required');
      const response = await fetch(`/api/football-iq/quizzes/${quizId}?for_taking=true`);
      if (!response.ok) throw new Error('Failed to fetch quiz');
      return response.json();
    },
    enabled: !!quizId && !!attemptId,
  });
  
  // Set up the timer if needed
  useEffect(() => {
    if (quiz?.timeLimit) {
      const timeInMs = quiz.timeLimit * 60 * 1000;
      setRemainingTime(timeInMs);
      
      const interval = window.setInterval(() => {
        setRemainingTime(prev => {
          if (prev === null) return null;
          const newTime = prev - 1000;
          if (newTime <= 0) {
            // Time's up, submit the quiz
            clearInterval(interval);
            submitQuiz();
            return 0;
          }
          return newTime;
        });
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [quiz]);
  
  // Initialize start time
  useEffect(() => {
    if (quiz) {
      setStartTime(new Date());
      setQuestionStartTime(new Date());
    }
  }, [quiz]);
  
  // Update time spent on current question when changing questions
  const updateTimeSpent = () => {
    if (!quiz?.questions) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    const now = new Date();
    const timeSpentOnQuestion = now.getTime() - questionStartTime.getTime();
    
    setTimeSpent(prev => ({
      ...prev,
      [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeSpentOnQuestion,
    }));
    
    setQuestionStartTime(now);
  };
  
  // Handle going to the next question
  const handleNextQuestion = () => {
    if (!quiz?.questions) return;
    
    updateTimeSpent();
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Handle going to the previous question
  const handlePrevQuestion = () => {
    if (!quiz?.questions) return;
    
    updateTimeSpent();
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Handle selecting an answer
  const handleSelectAnswer = (questionId: number, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };
  
  // Handle submitting the quiz
  const submitQuiz = async () => {
    if (isSubmitting || !quiz || !athlete || !attemptId) return;
    
    // Update time spent on current question
    updateTimeSpent();
    
    // Calculate total time spent
    const now = new Date();
    const totalTime = now.getTime() - startTime.getTime();
    setTotalTimeSpent(totalTime);
    
    // Prepare the answers for submission
    const answersArray: Answer[] = Object.keys(answers).map(questionId => {
      const qId = parseInt(questionId);
      return {
        questionId: qId,
        selectedOptionId: answers[qId],
        timeSpent: timeSpent[qId] || 0,
      };
    });
    
    // Check if all questions have been answered
    if (answersArray.length < quiz.questions.length) {
      if (!confirmSubmit) {
        setConfirmSubmit(true);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Clear any timer interval
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      
      // Submit the quiz
      const response = await fetch(
        `/api/athlete/${athlete.id}/football-iq/attempts/${attemptId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers: answersArray,
            timeSpent: Math.floor(totalTime / 1000), // Convert to seconds
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      
      const result = await response.json();
      
      // Navigate to the results page
      navigate(`/football-iq/results/${attemptId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit quiz. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };
  
  // Format remaining time as MM:SS
  const formatTime = (timeInMs: number) => {
    const minutes = Math.floor(timeInMs / (60 * 1000));
    const seconds = Math.floor((timeInMs % (60 * 1000)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle exit quiz
  const handleExitQuiz = () => {
    navigate('/football-iq');
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-screen-lg py-10">
        <div className="text-center">
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }
  
  if (isError || !quiz) {
    return (
      <div className="container max-w-screen-lg py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was a problem loading the quiz. Please try again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/football-iq')}>
              Return to Football IQ Page
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;
  
  return (
    <div className="container max-w-screen-lg py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <div className="flex items-center gap-4">
          {remainingTime !== null && (
            <div className="text-md font-semibold">
              <span className={remainingTime < 60000 ? 'text-red-500' : ''}>
                Time: {formatTime(remainingTime)}
              </span>
            </div>
          )}
          <AlertDialog open={showConfirmExit} onOpenChange={setShowConfirmExit}>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Exit Quiz</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Exit Quiz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your progress will not be saved. Are you sure you want to exit?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleExitQuiz}>Exit</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <span>{answeredQuestions} answered</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="mb-2">
                {quiz.position}
              </Badge>
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1}
              </CardTitle>
            </div>
            {currentQuestion.points > 1 && (
              <Badge className="bg-blue-500">
                {currentQuestion.points} points
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{currentQuestion.questionText}</p>
          
          {currentQuestion.imageUrl && (
            <div className="mb-4">
              <img 
                src={currentQuestion.imageUrl} 
                alt="Question illustration" 
                className="rounded-md max-h-64 mx-auto"
              />
            </div>
          )}
          
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent"
                >
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="ml-2"
                  />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer py-2">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleNextQuestion}>
              Next
            </Button>
          ) : (
            <AlertDialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
              <AlertDialogTrigger asChild>
                <Button>Submit Quiz</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {answeredQuestions < totalQuestions ? (
                      <>
                        You have only answered {answeredQuestions} out of {totalQuestions} questions. 
                        Unanswered questions will be marked as incorrect.
                      </>
                    ) : (
                      <>
                        You have answered all {totalQuestions} questions. Are you ready to submit?
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction disabled={isSubmitting} onClick={submitQuiz}>
                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>
      
      <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
        {quiz.questions.map((question, index) => (
          <Button
            key={question.id}
            variant={answers[question.id] ? 'default' : 'outline'}
            size="sm"
            className={`w-full ${currentQuestionIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            onClick={() => {
              updateTimeSpent();
              setCurrentQuestionIndex(index);
            }}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FootballIqQuizPage;