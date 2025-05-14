import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  footballPositions, 
  quizDifficultyLevels,
  quizCategories,
  iqLevels
} from '@/../../shared/football-iq-schema';

// Define types for our page
interface FootballIqQuiz {
  id: number;
  title: string;
  description: string | null;
  position: string;
  difficulty: string;
  category: string;
  questionCount: number;
  passingScore: number;
  isActive: boolean;
  timeLimit: number | null;
  createdAt: string;
}

interface FootballIqProgress {
  id: number;
  athleteId: number;
  position: string;
  score: number;
  level: string;
  quizzesCompleted: number;
  quizzesPassed: number;
  lastQuizId: number | null;
  lastQuizScore: number | null;
  lastUpdated: string;
  recommendations: string[] | null;
  strengthAreas: string[] | null;
  weaknessAreas: string[] | null;
  scoreHistory: {
    date: string;
    score: number;
    quizId: number;
  }[] | null;
}

interface FootballIqAttempt {
  id: number;
  athleteId: number;
  quizId: number;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  isPassed: boolean | null;
  timeSpent: number | null;
  quizTitle: string;
  quizPosition: string;
  quizDifficulty: string;
}

const FootballIqPage: React.FC = () => {
  const { user, athlete } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Fetch athlete's progress
  const { data: progressData, isLoading: progressLoading, isError: progressError } = useQuery({
    queryKey: ['/api/athlete', athlete?.id, 'football-iq/progress'],
    queryFn: async () => {
      try {
        if (!athlete?.id) return [];
        const response = await fetch(`/api/athlete/${athlete.id}/football-iq/progress`);
        if (!response.ok) {
          console.error('Error response from progress API:', response.status, response.statusText);
          throw new Error('Failed to fetch progress');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching football IQ progress:', error);
        throw error;
      }
    },
    enabled: !!athlete?.id,
    retries: 2,
  });

  // Fetch quizzes for the library
  const { data: quizzes, isLoading: quizzesLoading, isError: quizzesError } = useQuery({
    queryKey: ['/api/football-iq/quizzes', positionFilter, difficultyFilter, categoryFilter],
    queryFn: async () => {
      try {
        let url = '/api/football-iq/quizzes?';
        if (positionFilter) url += `position=${encodeURIComponent(positionFilter)}&`;
        if (difficultyFilter) url += `difficulty=${encodeURIComponent(difficultyFilter)}&`;
        if (categoryFilter) url += `category=${encodeURIComponent(categoryFilter)}&`;
        url += 'isActive=true';
        
        const response = await fetch(url);
        if (!response.ok) {
          console.error('Error response from quizzes API:', response.status, response.statusText);
          throw new Error('Failed to fetch quizzes');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching football IQ quizzes:', error);
        throw error;
      }
    },
    retries: 2,
  });

  // Fetch recent quiz attempts
  const { data: attempts, isLoading: attemptsLoading, isError: attemptsError } = useQuery({
    queryKey: ['/api/athlete', athlete?.id, 'football-iq/attempts'],
    queryFn: async () => {
      try {
        if (!athlete?.id) return [];
        const response = await fetch(`/api/athlete/${athlete.id}/football-iq/attempts?limit=5`);
        if (!response.ok) {
          console.error('Error response from attempts API:', response.status, response.statusText);
          throw new Error('Failed to fetch attempts');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching football IQ attempts:', error);
        throw error;
      }
    },
    enabled: !!athlete?.id,
    retries: 2,
  });

  // Function to start a quiz attempt
  const startQuiz = async (quizId: number) => {
    if (!athlete?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to take a quiz',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/athlete/${athlete.id}/football-iq/quizzes/${quizId}/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start quiz');
      }

      const attempt = await response.json();
      
      // Redirect to quiz page
      window.location.href = `/football-iq/quiz/${quizId}/attempt/${attempt.id}`;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start the quiz. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Function to view quiz results
  const viewResults = (attemptId: number) => {
    if (!athlete?.id) return;
    window.location.href = `/football-iq/results/${attemptId}`;
  };

  // Calculate overall IQ level if multiple position data exists
  const calculateOverallLevel = (progress: FootballIqProgress[]): string => {
    if (!progress || progress.length === 0) return 'novice';
    
    // If only one position, return that level
    if (progress.length === 1) return progress[0].level;
    
    // Average the scores across positions
    const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
    const averageScore = totalScore / progress.length;
    
    // Map to IQ level
    if (averageScore <= 30) return 'novice';
    if (averageScore <= 50) return 'developing';
    if (averageScore <= 70) return 'competent';
    if (averageScore <= 85) return 'proficient';
    if (averageScore <= 95) return 'expert';
    return 'master';
  };

  const getLevelColor = (level: string): string => {
    switch(level) {
      case 'novice': return 'bg-slate-400';
      case 'developing': return 'bg-blue-400';
      case 'competent': return 'bg-green-400';
      case 'proficient': return 'bg-yellow-400';
      case 'expert': return 'bg-orange-500';
      case 'master': return 'bg-purple-600';
      default: return 'bg-slate-400';
    }
  };

  // Render the Dashboard tab content
  const renderDashboard = () => {
    if (progressLoading || !progressData) {
      return <div className="text-center py-10">Loading progress...</div>;
    }

    const overallLevel = calculateOverallLevel(progressData);
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Football IQ Overview</CardTitle>
            <CardDescription>
              Your current knowledge level across all football positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold capitalize">
                  {overallLevel} 
                  <span className="text-sm font-normal ml-2 text-muted-foreground">
                    Level
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {progressData.length} position{progressData.length !== 1 ? 's' : ''} assessed
                </p>
              </div>
              <div>
                <Badge className={`${getLevelColor(overallLevel)} text-white px-3 py-1`}>
                  {overallLevel.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-lg font-semibold mt-6">Position Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progressData.map((progress) => (
            <Card key={progress.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{progress.position}</CardTitle>
                <CardDescription>
                  {progress.quizzesCompleted} quiz{progress.quizzesCompleted !== 1 ? 'zes' : ''} completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium capitalize">{progress.level}</span>
                    <span className="text-sm font-medium">{progress.score}%</span>
                  </div>
                  <Progress
                    value={progress.score}
                    max={100}
                    className={`h-2 ${getLevelColor(progress.level)}`}
                  />
                </div>
                {progress.strengthAreas && progress.strengthAreas.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-1">Strengths:</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {progress.strengthAreas.slice(0, 2).map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <h3 className="text-lg font-semibold mt-6">Recent Attempts</h3>
        {attemptsLoading ? (
          <div className="text-center py-4">Loading attempts...</div>
        ) : attempts && attempts.length > 0 ? (
          <div className="space-y-3">
            {attempts.map((attempt: FootballIqAttempt) => (
              <Card key={attempt.id}>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{attempt.quizTitle}</CardTitle>
                      <CardDescription>
                        {attempt.quizPosition} • {new Date(attempt.startedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {attempt.completedAt && (
                      <Badge className={attempt.isPassed ? 'bg-green-500' : 'bg-red-500'}>
                        {attempt.isPassed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardFooter className="pt-0 pb-3">
                  {attempt.completedAt ? (
                    <div className="flex w-full justify-between items-center">
                      <div className="text-sm">
                        Score: <span className="font-medium">{attempt.score}%</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewResults(attempt.id)}
                      >
                        View Results
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                        In Progress
                      </Badge>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              You haven't attempted any quizzes yet. 
              <br />
              Start by taking a quiz from the library.
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render the Quiz Library tab content
  const renderQuizLibrary = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
          <div className="flex-1">
            <Select
              value={positionFilter}
              onValueChange={setPositionFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Positions</SelectItem>
                {footballPositions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                {quizDifficultyLevels.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {quizCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-4" />

        {quizzesLoading ? (
          <div className="text-center py-10">Loading quizzes...</div>
        ) : quizzes && quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz: FootballIqQuiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{quiz.title}</CardTitle>
                    <Badge className={`capitalize bg-${
                      quiz.difficulty === 'beginner' ? 'green' : 
                      quiz.difficulty === 'intermediate' ? 'blue' :
                      quiz.difficulty === 'advanced' ? 'orange' : 'purple'
                    }-500`}>
                      {quiz.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>
                    {quiz.position} • {
                      quiz.category.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {quiz.description || "Test your football knowledge with this quiz."}
                  </p>
                  <div className="flex items-center mt-3 text-sm text-muted-foreground">
                    <div className="flex-1">
                      <p>{quiz.questionCount} questions</p>
                      <p>Passing: {quiz.passingScore}%</p>
                    </div>
                    <div className="flex-1">
                      {quiz.timeLimit ? (
                        <p>Time limit: {quiz.timeLimit} min</p>
                      ) : (
                        <p>No time limit</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => startQuiz(quiz.id)}
                  >
                    Start Quiz
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No quizzes found matching the selected filters.
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="container max-w-screen-lg py-6">
      <h1 className="text-3xl font-bold mb-6">Football IQ</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz Library</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-0">
          {renderDashboard()}
        </TabsContent>
        
        <TabsContent value="quizzes" className="mt-0">
          {renderQuizLibrary()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FootballIqPage;