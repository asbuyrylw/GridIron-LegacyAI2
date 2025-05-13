import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';

interface QuizQuestion {
  id: number;
  questionText: string;
  options: {
    id: string;
    text: string;
    isCorrect?: boolean;
  }[];
  selectedOptionId?: string;
  isCorrect: boolean;
  timeSpent?: number;
}

interface QuizAttempt {
  id: number;
  athleteId: number;
  quizId: number;
  startedAt: string;
  completedAt: string;
  score: number;
  isPassed: boolean;
  timeSpent: number;
  quiz: {
    id: number;
    title: string;
    description: string | null;
    position: string;
    difficulty: string;
    category: string;
    passingScore: number;
  };
  questions: QuizQuestion[];
}

const FootballIqResultsPage: React.FC = () => {
  // Extract attempt ID from URL
  const [, navigate] = useLocation();
  const path = window.location.pathname;
  const match = path.match(/\/football-iq\/results\/(\d+)/);
  
  const attemptId = match ? parseInt(match[1]) : null;
  
  const { athlete } = useAuth();
  
  // Fetch the quiz attempt with results
  const { data: attempt, isLoading, isError } = useQuery({
    queryKey: ['/api/athlete', athlete?.id, 'football-iq/attempts', attemptId],
    queryFn: async () => {
      if (!athlete?.id || !attemptId) throw new Error('Required parameters missing');
      const response = await fetch(`/api/athlete/${athlete.id}/football-iq/attempts/${attemptId}`);
      if (!response.ok) throw new Error('Failed to fetch quiz attempt');
      return response.json();
    },
    enabled: !!athlete?.id && !!attemptId,
  });
  
  // Format time spent in minutes and seconds
  const formatTimeSpent = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-screen-lg py-10">
        <div className="text-center">
          <p>Loading quiz results...</p>
        </div>
      </div>
    );
  }
  
  if (isError || !attempt) {
    return (
      <div className="container max-w-screen-lg py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was a problem loading the quiz results. Please try again.
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
  
  const correctAnswers = attempt.questions.filter(q => q.isCorrect).length;
  const totalQuestions = attempt.questions.length;
  
  return (
    <div className="container max-w-screen-lg py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{attempt.quiz.title}</h1>
          <p className="text-muted-foreground">
            {attempt.quiz.position} • {attempt.quiz.category.replace(/-/g, ' ')}
          </p>
        </div>
        <div className="mt-2 md:mt-0">
          <Badge className={attempt.isPassed ? 'bg-green-500' : 'bg-red-500'} size="lg">
            {attempt.isPassed ? 'PASSED' : 'FAILED'}
          </Badge>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quiz Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col items-center p-4 border rounded-md">
              <span className="text-3xl font-bold text-primary">{attempt.score}%</span>
              <span className="text-sm text-muted-foreground">Score</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md">
              <span className="text-3xl font-bold">{correctAnswers}/{totalQuestions}</span>
              <span className="text-sm text-muted-foreground">Correct Answers</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md">
              <span className="text-3xl font-bold">{formatTimeSpent(attempt.timeSpent)}</span>
              <span className="text-sm text-muted-foreground">Time Spent</span>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Your Score</span>
              <span className="text-sm font-medium">{attempt.score}%</span>
            </div>
            <Progress
              value={attempt.score}
              max={100}
              className={`h-2 ${attempt.isPassed ? 'bg-green-500' : 'bg-amber-500'}`}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Passing Score</span>
              <span className="text-sm font-medium">{attempt.quiz.passingScore}%</span>
            </div>
            <Progress value={attempt.quiz.passingScore} max={100} className="h-2 bg-blue-500" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Completed on {new Date(attempt.completedAt).toLocaleDateString()} at {new Date(attempt.completedAt).toLocaleTimeString()}
            </span>
          </div>
          
          {!attempt.isPassed && (
            <div className="flex items-start gap-2 mt-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
              <p className="text-sm">
                You didn't pass this quiz. Review the questions below and consider retaking the quiz to improve your Football IQ score.
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
      
      <h2 className="text-xl font-bold mb-4">Question Review</h2>
      
      <div className="space-y-6">
        {attempt.questions.map((question, index) => {
          const selectedOption = question.options.find(o => o.id === question.selectedOptionId);
          const correctOption = question.options.find(o => o.isCorrect);
          
          return (
            <Card key={question.id} className={question.isCorrect ? 'border-green-200' : 'border-red-200'}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Question {index + 1}</CardTitle>
                  {question.isCorrect ? (
                    <Badge className="bg-green-500">Correct</Badge>
                  ) : (
                    <Badge className="bg-red-500">Incorrect</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{question.questionText}</p>
                
                <div className="space-y-2">
                  {question.options.map(option => (
                    <div 
                      key={option.id}
                      className={`p-3 rounded-md flex items-center
                        ${option.id === question.selectedOptionId && option.isCorrect ? 'bg-green-50 border border-green-200' : ''}
                        ${option.id === question.selectedOptionId && !option.isCorrect ? 'bg-red-50 border border-red-200' : ''}
                        ${option.id !== question.selectedOptionId && option.isCorrect ? 'bg-blue-50 border border-blue-200' : ''}
                        ${option.id !== question.selectedOptionId && !option.isCorrect ? 'border' : ''}
                      `}
                    >
                      <div className="flex-1">{option.text}</div>
                      <div className="flex items-center gap-1">
                        {option.id === question.selectedOptionId && (
                          <Badge 
                            variant="outline" 
                            className={option.isCorrect ? 'text-green-500 border-green-500' : 'text-red-500 border-red-500'}
                          >
                            Your answer
                          </Badge>
                        )}
                        {option.isCorrect && (
                          <Check className="h-5 w-5 text-green-500 ml-2" />
                        )}
                        {option.id === question.selectedOptionId && !option.isCorrect && (
                          <X className="h-5 w-5 text-red-500 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {question.timeSpent && (
                  <div className="mt-3 text-sm text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Time spent: {Math.floor(question.timeSpent / 1000)}s
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-10 flex justify-between">
        <Button variant="outline" onClick={() => navigate('/football-iq')}>
          Back to Football IQ Dashboard
        </Button>
        
        <Button onClick={() => navigate('/football-iq?tab=quizzes')}>
          Take Another Quiz
        </Button>
      </div>
    </div>
  );
};

export default FootballIqResultsPage;