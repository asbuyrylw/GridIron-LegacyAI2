import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { PlusCircle, Pencil, Trash2, Eye, FileText } from 'lucide-react';
import {
  footballPositions,
  quizDifficultyLevels,
  quizCategories,
  questionTypes
} from '@/../../shared/football-iq-schema';

// Define types
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
  createdBy: number;
  tags: string[] | null;
}

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface FootballIqQuestion {
  id: number;
  quizId: number;
  questionText: string;
  questionType: string;
  options: QuizOption[];
  imageUrl: string | null;
  diagramData: any | null;
  videoUrl: string | null;
  explanation: string | null;
  orderIndex: number;
  points: number;
  difficulty?: string;
}

const FootballIqAdminPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('all-quizzes');
  const [selectedQuiz, setSelectedQuiz] = useState<FootballIqQuiz | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<FootballIqQuestion | null>(null);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    position: '',
    difficulty: '',
    category: '',
    passingScore: 70,
    timeLimit: 0,
    isActive: true,
    tags: '',
  });
  const [questionFormData, setQuestionFormData] = useState({
    questionText: '',
    questionType: 'multiple-choice',
    imageUrl: '',
    explanation: '',
    orderIndex: 0,
    points: 1,
    options: [
      { id: '1', text: '', isCorrect: true },
      { id: '2', text: '', isCorrect: false },
      { id: '3', text: '', isCorrect: false },
      { id: '4', text: '', isCorrect: false }
    ]
  });
  const [positionFilter, setPositionFilter] = useState('');
  const [deletingQuizId, setDeletingQuizId] = useState<number | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  
  // Check if user has coach access
  const isCoach = user?.userType === 'coach' || user?.userType === 'admin';
  
  // Fetch all quizzes
  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ['/api/football-iq/quizzes', positionFilter],
    queryFn: async () => {
      let url = '/api/football-iq/quizzes';
      if (positionFilter) {
        url += `?position=${encodeURIComponent(positionFilter)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      return response.json();
    },
  });
  
  // Fetch questions for the selected quiz
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['/api/football-iq/quizzes', selectedQuiz?.id, 'questions'],
    queryFn: async () => {
      if (!selectedQuiz) return [];
      const response = await fetch(`/api/football-iq/quizzes/${selectedQuiz.id}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    },
    enabled: !!selectedQuiz,
  });
  
  // Create quiz mutation
  const createQuizMutation = useMutation({
    mutationFn: async (quizData: any) => {
      const response = await fetch('/api/football-iq/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create quiz');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/football-iq/quizzes'] });
      toast({ title: 'Success', description: 'Quiz created successfully' });
      setShowQuizDialog(false);
      resetQuizForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
  
  // Update quiz mutation
  const updateQuizMutation = useMutation({
    mutationFn: async ({ id, quizData }: { id: number; quizData: any }) => {
      const response = await fetch(`/api/football-iq/quizzes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update quiz');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/football-iq/quizzes'] });
      toast({ title: 'Success', description: 'Quiz updated successfully' });
      setShowQuizDialog(false);
      setSelectedQuiz(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
  
  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/football-iq/quizzes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete quiz');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/football-iq/quizzes'] });
      toast({ title: 'Success', description: 'Quiz deleted successfully' });
      setDeletingQuizId(null);
      if (selectedQuiz?.id === deletingQuizId) {
        setSelectedQuiz(null);
        setActiveTab('all-quizzes');
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setDeletingQuizId(null);
    },
  });
  
  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      if (!selectedQuiz) throw new Error('No quiz selected');
      
      const response = await fetch(`/api/football-iq/quizzes/${selectedQuiz.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/football-iq/quizzes', selectedQuiz?.id, 'questions'] 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/football-iq/quizzes'] });
      toast({ title: 'Success', description: 'Question created successfully' });
      setShowQuestionDialog(false);
      resetQuestionForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
  
  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, questionData }: { id: number; questionData: any }) => {
      const response = await fetch(`/api/football-iq/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/football-iq/quizzes', selectedQuiz?.id, 'questions'] 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/football-iq/quizzes'] });
      toast({ title: 'Success', description: 'Question updated successfully' });
      setShowQuestionDialog(false);
      setSelectedQuestion(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
  
  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/football-iq/questions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/football-iq/quizzes', selectedQuiz?.id, 'questions'] 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/football-iq/quizzes'] });
      toast({ title: 'Success', description: 'Question deleted successfully' });
      setDeletingQuestionId(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setDeletingQuestionId(null);
    },
  });
  
  // Reset quiz form
  const resetQuizForm = () => {
    setQuizFormData({
      title: '',
      description: '',
      position: '',
      difficulty: '',
      category: '',
      passingScore: 70,
      timeLimit: 0,
      isActive: true,
      tags: '',
    });
    setSelectedQuiz(null);
  };
  
  // Reset question form
  const resetQuestionForm = () => {
    setQuestionFormData({
      questionText: '',
      questionType: 'multiple-choice',
      imageUrl: '',
      explanation: '',
      orderIndex: 0,
      points: 1,
      options: [
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false }
      ]
    });
    setSelectedQuestion(null);
  };
  
  // Handle edit quiz
  const handleEditQuiz = (quiz: FootballIqQuiz) => {
    setSelectedQuiz(quiz);
    setQuizFormData({
      title: quiz.title,
      description: quiz.description || '',
      position: quiz.position,
      difficulty: quiz.difficulty,
      category: quiz.category,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit || 0,
      isActive: quiz.isActive,
      tags: quiz.tags?.join(', ') || '',
    });
    setShowQuizDialog(true);
  };
  
  // Handle create or update quiz
  const handleSubmitQuiz = () => {
    const formData = {
      title: quizFormData.title,
      description: quizFormData.description || null,
      position: quizFormData.position,
      difficulty: quizFormData.difficulty,
      category: quizFormData.category,
      passingScore: Number(quizFormData.passingScore),
      timeLimit: quizFormData.timeLimit ? Number(quizFormData.timeLimit) : null,
      isActive: quizFormData.isActive,
      tags: quizFormData.tags ? quizFormData.tags.split(',').map(tag => tag.trim()) : null,
    };
    
    if (selectedQuiz) {
      updateQuizMutation.mutate({ id: selectedQuiz.id, quizData: formData });
    } else {
      createQuizMutation.mutate(formData);
    }
  };
  
  // Handle quiz form changes
  const handleQuizFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuizFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch changes
  const handleSwitchChange = (checked: boolean) => {
    setQuizFormData(prev => ({ ...prev, isActive: checked }));
  };
  
  // Handle edit question
  const handleEditQuestion = (question: FootballIqQuestion) => {
    setSelectedQuestion(question);
    setQuestionFormData({
      questionText: question.questionText,
      questionType: question.questionType,
      imageUrl: question.imageUrl || '',
      explanation: question.explanation || '',
      orderIndex: question.orderIndex,
      points: question.points,
      options: question.options.map(option => ({
        id: option.id,
        text: option.text,
        isCorrect: option.isCorrect,
      }))
    });
    setShowQuestionDialog(true);
  };
  
  // Handle question form changes
  const handleQuestionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuestionFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle option change
  const handleOptionChange = (index: number, field: string, value: string | boolean) => {
    const updatedOptions = [...questionFormData.options];
    updatedOptions[index] = { 
      ...updatedOptions[index], 
      [field]: value 
    };
    setQuestionFormData(prev => ({ ...prev, options: updatedOptions }));
  };
  
  // Handle correct answer change
  const handleCorrectAnswerChange = (index: number) => {
    const updatedOptions = questionFormData.options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    setQuestionFormData(prev => ({ ...prev, options: updatedOptions }));
  };
  
  // Handle create or update question
  const handleSubmitQuestion = () => {
    // Validate at least one option is marked as correct
    const hasCorrectOption = questionFormData.options.some(option => option.isCorrect);
    if (!hasCorrectOption) {
      toast({ 
        title: 'Validation Error', 
        description: 'At least one option must be marked as correct',
        variant: 'destructive'
      });
      return;
    }
    
    const formData = {
      questionText: questionFormData.questionText,
      questionType: questionFormData.questionType,
      imageUrl: questionFormData.imageUrl || null,
      explanation: questionFormData.explanation || null,
      orderIndex: Number(questionFormData.orderIndex),
      points: Number(questionFormData.points),
      options: questionFormData.options.filter(option => option.text.trim() !== '')
    };
    
    if (selectedQuestion) {
      updateQuestionMutation.mutate({ id: selectedQuestion.id, questionData: formData });
    } else {
      createQuestionMutation.mutate(formData);
    }
  };
  
  // Handle changing to quiz editor tab
  const handleQuizEditorTab = (quiz: FootballIqQuiz) => {
    setSelectedQuiz(quiz);
    setActiveTab('quiz-editor');
  };
  
  // Render the All Quizzes tab
  const renderAllQuizzes = () => {
    if (quizzesLoading) {
      return <div className="text-center py-8">Loading quizzes...</div>;
    }
    
    if (!quizzes || quizzes.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="mb-4 text-muted-foreground">No quizzes found</p>
          <Button onClick={() => { resetQuizForm(); setShowQuizDialog(true); }}>
            Create Your First Quiz
          </Button>
        </div>
      );
    }
    
    return (
      <>
        <div className="mb-6 flex justify-between items-center">
          <div className="w-72">
            <Select 
              value={positionFilter} 
              onValueChange={setPositionFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Positions</SelectItem>
                {footballPositions.map(position => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => { resetQuizForm(); setShowQuizDialog(true); }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Quiz
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz: FootballIqQuiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">
                    {quiz.title}
                  </TableCell>
                  <TableCell>{quiz.position}</TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${
                      quiz.difficulty === 'beginner' ? 'bg-green-500' : 
                      quiz.difficulty === 'intermediate' ? 'bg-blue-500' :
                      quiz.difficulty === 'advanced' ? 'bg-orange-500' : 'bg-purple-500'
                    }`}>
                      {quiz.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>{quiz.questionCount}</TableCell>
                  <TableCell>
                    <Badge variant={quiz.isActive ? 'default' : 'outline'}>
                      {quiz.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuizEditorTab(quiz)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditQuiz(quiz)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setDeletingQuizId(quiz.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the quiz "{quiz.title}" and all of its questions. 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeletingQuizId(null)}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteQuizMutation.mutate(quiz.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );
  };
  
  // Render the Quiz Editor tab
  const renderQuizEditor = () => {
    if (!selectedQuiz) {
      return (
        <div className="text-center py-8">
          <p>No quiz selected. Please select a quiz from the list.</p>
          <Button 
            className="mt-4"
            onClick={() => setActiveTab('all-quizzes')}
          >
            Back to All Quizzes
          </Button>
        </div>
      );
    }
    
    if (questionsLoading) {
      return <div className="text-center py-8">Loading questions...</div>;
    }
    
    return (
      <>
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('all-quizzes')}
            className="mb-4"
          >
            Back to All Quizzes
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedQuiz.title}</CardTitle>
                  <CardDescription>
                    {selectedQuiz.position} • {selectedQuiz.category.replace(/-/g, ' ')} • {selectedQuiz.difficulty}
                  </CardDescription>
                </div>
                <Badge variant={selectedQuiz.isActive ? 'default' : 'outline'}>
                  {selectedQuiz.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-lg font-semibold">{selectedQuiz.questionCount}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Passing Score</p>
                  <p className="text-lg font-semibold">{selectedQuiz.passingScore}%</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Time Limit</p>
                  <p className="text-lg font-semibold">
                    {selectedQuiz.timeLimit ? `${selectedQuiz.timeLimit} minutes` : 'No time limit'}
                  </p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">
                {selectedQuiz.description || 'No description provided.'}
              </p>
            </CardContent>
            <CardFooter className="justify-between">
              <Button 
                variant="outline" 
                onClick={() => handleEditQuiz(selectedQuiz)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Quiz
              </Button>
              <Button 
                onClick={() => { resetQuestionForm(); setShowQuestionDialog(true); }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <h3 className="text-lg font-semibold mb-4">Questions</h3>
        
        {questions && questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question: FootballIqQuestion, index: number) => (
              <Card key={question.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">
                      Question {index + 1} {question.points > 1 && <span className="text-sm font-normal text-muted-foreground">({question.points} points)</span>}
                    </CardTitle>
                    <Badge variant="outline">{question.questionType.replace(/-/g, ' ')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3">{question.questionText}</p>
                  
                  {question.imageUrl && (
                    <div className="mb-3">
                      <img 
                        src={question.imageUrl} 
                        alt="Question illustration" 
                        className="rounded-md max-h-32 object-contain" 
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={option.id}
                        className={`p-2 border rounded-md ${
                          option.isCorrect ? 'border-green-500 bg-green-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>
                            {String.fromCharCode(65 + optIndex)}. {option.text}
                          </span>
                          {option.isCorrect && (
                            <Badge className="bg-green-500">Correct</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium">Explanation:</p>
                      <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDeletingQuestionId(question.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this question. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingQuestionId(null)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteQuestionMutation.mutate(question.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">
                No questions found for this quiz. Start by adding a question.
              </p>
              <Button 
                onClick={() => { resetQuestionForm(); setShowQuestionDialog(true); }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Question
              </Button>
            </CardContent>
          </Card>
        )}
      </>
    );
  };
  
  if (!isCoach) {
    return (
      <div className="container max-w-screen-lg py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page. 
              Only coaches and administrators can manage Football IQ quizzes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-screen-lg py-6">
      <h1 className="text-3xl font-bold mb-6">Football IQ Admin</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="all-quizzes">All Quizzes</TabsTrigger>
          <TabsTrigger value="quiz-editor" disabled={!selectedQuiz}>
            Quiz Editor
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-quizzes" className="mt-0">
          {renderAllQuizzes()}
        </TabsContent>
        
        <TabsContent value="quiz-editor" className="mt-0">
          {renderQuizEditor()}
        </TabsContent>
      </Tabs>
      
      {/* Quiz dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedQuiz ? 'Edit Quiz' : 'Create New Quiz'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {selectedQuiz ? 'update' : 'create'} a Football IQ quiz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={quizFormData.title}
                onChange={handleQuizFormChange}
                placeholder="Quiz title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={quizFormData.description}
                onChange={handleQuizFormChange}
                placeholder="Brief description of the quiz"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  value={quizFormData.position}
                  onValueChange={(value) => setQuizFormData(prev => ({ ...prev, position: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {footballPositions.map(position => (
                      <SelectItem key={position} value={position}>{position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={quizFormData.difficulty}
                  onValueChange={(value) => setQuizFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizDifficultyLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={quizFormData.category}
                onValueChange={(value) => setQuizFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {quizCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  name="passingScore"
                  type="number"
                  min="1"
                  max="100"
                  value={quizFormData.passingScore}
                  onChange={handleQuizFormChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (min, 0 for none)</Label>
                <Input
                  id="timeLimit"
                  name="timeLimit"
                  type="number"
                  min="0"
                  value={quizFormData.timeLimit}
                  onChange={handleQuizFormChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={quizFormData.tags}
                onChange={handleQuizFormChange}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={quizFormData.isActive}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isActive">Quiz is active and visible to athletes</Label>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSubmitQuiz}
              disabled={
                !quizFormData.title || 
                !quizFormData.position || 
                !quizFormData.difficulty ||
                !quizFormData.category ||
                createQuizMutation.isPending ||
                updateQuizMutation.isPending
              }
            >
              {createQuizMutation.isPending || updateQuizMutation.isPending
                ? 'Saving...'
                : selectedQuiz ? 'Update Quiz' : 'Create Quiz'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Question dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {selectedQuestion ? 'update' : 'create'} a question.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="questionText">Question Text</Label>
              <Textarea
                id="questionText"
                name="questionText"
                value={questionFormData.questionText}
                onChange={handleQuestionFormChange}
                placeholder="Enter your question"
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type</Label>
                <Select
                  value={questionFormData.questionType}
                  onValueChange={(value) => setQuestionFormData(prev => ({ ...prev, questionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  min="1"
                  max="10"
                  value={questionFormData.points}
                  onChange={handleQuestionFormChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={questionFormData.imageUrl}
                onChange={handleQuestionFormChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Answer Options</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Select one option as the correct answer.
              </p>
              
              {questionFormData.options.map((option, index) => (
                <div key={option.id} className="flex items-start space-x-2 mb-3">
                  <div className="flex-1">
                    <Input
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className={option.isCorrect ? 'border-green-500' : ''}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="radio"
                      id={`correct-${option.id}`}
                      checked={option.isCorrect}
                      onChange={() => handleCorrectAnswerChange(index)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`correct-${option.id}`} className="text-sm cursor-pointer">
                      Correct
                    </Label>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation (optional)</Label>
              <Textarea
                id="explanation"
                name="explanation"
                value={questionFormData.explanation}
                onChange={handleQuestionFormChange}
                placeholder="Explain why the correct answer is correct"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSubmitQuestion}
              disabled={
                !questionFormData.questionText || 
                !questionFormData.options.some(opt => opt.text.trim() !== '') ||
                createQuestionMutation.isPending ||
                updateQuestionMutation.isPending
              }
            >
              {createQuestionMutation.isPending || updateQuestionMutation.isPending
                ? 'Saving...'
                : selectedQuestion ? 'Update Question' : 'Add Question'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FootballIqAdminPage;