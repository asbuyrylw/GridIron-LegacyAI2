import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, File, FileText, FileImage, X, Download, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DocumentUpload {
  id: number;
  athleteId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  category: string;
  description?: string;
  url: string;
}

interface DocumentUploadsTabProps {
  athleteId: number;
}

export default function DocumentUploadsTab({ athleteId }: DocumentUploadsTabProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState('transcript');
  const [fileDescription, setFileDescription] = useState('');

  // Fetch document uploads
  const { data: documents, isLoading, error, refetch } = useQuery({ 
    queryKey: ['/api/college-applications/documents', athleteId],
    queryFn: async () => {
      const response = await apiRequest(
        'GET', 
        `/api/college-applications/documents/${athleteId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch document uploads');
      }
      
      return response.json();
    },
    enabled: !!athleteId
  });

  // Sample documents to display if none exist yet
  const sampleDocuments = [
    {
      id: 1,
      athleteId,
      fileName: 'Official_Transcript.pdf',
      fileSize: 1500000,
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString(),
      category: 'transcript',
      description: 'Official high school transcript',
      url: '#'
    },
    {
      id: 2,
      athleteId,
      fileName: 'SAT_Score_Report.pdf',
      fileSize: 850000,
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString(),
      category: 'test-scores',
      description: 'SAT score report from May 2024',
      url: '#'
    },
    {
      id: 3,
      athleteId,
      fileName: 'Personal_Statement.docx',
      fileSize: 350000,
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadDate: new Date().toISOString(),
      category: 'essay',
      description: 'Common App personal statement',
      url: '#'
    }
  ];

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(
        'DELETE',
        `/api/college-applications/documents/${id}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      return id;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: 'Document deleted',
        description: 'Your document has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-8 w-8 text-indigo-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'transcript':
        return 'Transcript';
      case 'test-scores':
        return 'Test Scores';
      case 'essay':
        return 'Essay';
      case 'recommendation':
        return 'Recommendation';
      case 'financial':
        return 'Financial';
      case 'athletic':
        return 'Athletic Profile';
      default:
        return 'Other';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transcript':
        return 'bg-blue-100 text-blue-800';
      case 'test-scores':
        return 'bg-purple-100 text-purple-800';
      case 'essay':
        return 'bg-amber-100 text-amber-800';
      case 'recommendation':
        return 'bg-green-100 text-green-800';
      case 'financial':
        return 'bg-red-100 text-red-800';
      case 'athletic':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyPlaceholder
        title="Error Loading Documents"
        description="There was a problem loading your document uploads."
        icon={<Loader2 className="h-12 w-12 text-muted-foreground" />}
      >
        <Button onClick={() => refetch()}>Try Again</Button>
      </EmptyPlaceholder>
    );
  }

  const documentsToDisplay = documents && documents.length > 0 ? documents : sampleDocuments;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Document Uploads</h2>
          <p className="text-muted-foreground">
            Upload and manage your application documents.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documentsToDisplay.map((doc: DocumentUpload) => (
          <Card key={doc.id} className="overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-start">
                <Badge className={`${getCategoryColor(doc.category)}`}>
                  {getCategoryLabel(doc.category)}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteDocumentMutation.mutate(doc.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center gap-4 mb-4">
                {getFileIcon(doc.fileType)}
                <div className="flex-1 truncate">
                  <h3 className="font-medium truncate">{doc.fileName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(doc.fileSize)} • {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {doc.description && (
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              )}
            </CardContent>
            <CardFooter className="flex gap-2 pt-0">
              <Button variant="outline" size="sm" className="flex items-center gap-1 flex-1">
                <Eye className="h-3 w-3" />
                Preview
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 flex-1">
                <Download className="h-3 w-3" />
                Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {documentsToDisplay.length === 0 && (
        <EmptyPlaceholder
          title="No Documents Uploaded"
          description="Upload your application documents to get started."
          icon={<File className="h-12 w-12 text-muted-foreground" />}
        >
          <Button 
            onClick={() => setShowUploadForm(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload First Document
          </Button>
        </EmptyPlaceholder>
      )}
    </div>
  );
}