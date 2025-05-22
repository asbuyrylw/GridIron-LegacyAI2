import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { apiRequest } from '@/lib/query-client';
import { Loader2, Upload, FileText, FileImage, X, DownloadCloud } from 'lucide-react';
import { AiOutlineFilePdf } from 'react-icons/ai';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { queryClient } from '@/lib/query-client';

interface DocumentUpload {
  id: number;
  athleteId: number;
  title: string;
  filename: string;
  fileType: string;
  uploadDate: string;
  fileSize: number;
  url: string;
  category: string;
}

interface DocumentUploadsTabProps {
  athleteId: number;
}

export default function DocumentUploadsTab({ athleteId }: DocumentUploadsTabProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingCategory, setUploadingCategory] = useState('transcript');
  
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['/api/documents', athleteId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/documents?athleteId=${athleteId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
      }
    },
    enabled: !!athleteId,
  });
  
  // Mock documents for development
  const mockDocuments: DocumentUpload[] = [
    {
      id: 1,
      athleteId,
      title: 'Official Transcript',
      filename: 'official_transcript_2025.pdf',
      fileType: 'application/pdf',
      uploadDate: '2024-10-15',
      fileSize: 1240000,
      url: '/documents/transcript.pdf',
      category: 'transcript'
    },
    {
      id: 2,
      athleteId,
      title: 'SAT Score Report',
      filename: 'sat_scores_2024.pdf',
      fileType: 'application/pdf',
      uploadDate: '2024-09-28',
      fileSize: 890000,
      url: '/documents/sat.pdf',
      category: 'test_scores'
    },
    {
      id: 3,
      athleteId,
      title: 'Letter of Recommendation - Coach Johnson',
      filename: 'recommendation_coach_johnson.pdf',
      fileType: 'application/pdf',
      uploadDate: '2024-11-05',
      fileSize: 560000,
      url: '/documents/recommendation1.pdf',
      category: 'recommendations'
    }
  ];

  const documentsList = documents && documents.length > 0 ? documents : mockDocuments;

  const uploadDocument = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/documents', formData);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to upload document');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Document uploaded',
        description: 'Your document has been successfully uploaded',
      });
      setSelectedFile(null);
      setUploadProgress(0);
      // Invalidate the documents query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/documents', athleteId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
      setUploadProgress(0);
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest('DELETE', `/api/documents/${documentId}`, null);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete document');
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Document deleted',
        description: 'Document has been removed successfully',
      });
      // Invalidate the documents query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/documents', athleteId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 300);
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('athleteId', athleteId.toString());
    formData.append('title', selectedFile.name.split('.')[0]);
    formData.append('category', uploadingCategory);
    
    try {
      await uploadDocument.mutateAsync(formData);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument.mutate(id);
    }
  };

  const getDocumentIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <AiOutlineFilePdf className="h-10 w-10 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileImage className="h-10 w-10 text-blue-500" />;
    } else {
      return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'transcript':
        return { label: 'Transcript', color: 'bg-blue-100 text-blue-800' };
      case 'test_scores':
        return { label: 'Test Scores', color: 'bg-purple-100 text-purple-800' };
      case 'recommendations':
        return { label: 'Recommendation', color: 'bg-amber-100 text-amber-800' };
      case 'essay':
        return { label: 'Essay', color: 'bg-green-100 text-green-800' };
      case 'activities':
        return { label: 'Activities', color: 'bg-pink-100 text-pink-800' };
      default:
        return { label: 'Document', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyPlaceholder
        title="Failed to load documents"
        description="There was an error loading your documents. Please try again later."
        icon={<FileText className="h-12 w-12 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="document-category">Document Type</Label>
                <select 
                  id="document-category"
                  className="w-full p-2 border rounded"
                  value={uploadingCategory}
                  onChange={(e) => setUploadingCategory(e.target.value)}
                >
                  <option value="transcript">Transcript</option>
                  <option value="test_scores">Test Scores (SAT/ACT)</option>
                  <option value="recommendations">Letter of Recommendation</option>
                  <option value="essay">College Essay</option>
                  <option value="activities">Activities Resume</option>
                  <option value="other">Other Document</option>
                </select>
              </div>
              <div>
                <Label htmlFor="document-file">File</Label>
                <Input 
                  id="document-file" 
                  type="file" 
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>
            </div>
            
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm font-medium">Selected file: {selectedFile.name}</p>
                {uploadProgress > 0 && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-right mt-1">{uploadProgress}% complete</p>
                  </div>
                )}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={!selectedFile || uploadDocument.isPending}
            >
              {uploadDocument.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Your Documents</h3>
        {documentsList.length === 0 ? (
          <EmptyPlaceholder
            title="No documents uploaded"
            description="Upload your first document to get started with your college applications."
            icon={<AiOutlineFilePdf className="h-12 w-12 text-muted-foreground" />}
          >
            <Button className="mt-4" onClick={() => document.getElementById('document-file')?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </EmptyPlaceholder>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documentsList.map((doc: DocumentUpload) => {
              const { label, color } = getCategoryLabel(doc.category);
              return (
                <Card key={doc.id} className="overflow-hidden group relative">
                  <button 
                    className="absolute right-2 top-2 p-1 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(doc.id)}
                    aria-label="Delete document"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="mb-4 mt-4">
                      {getDocumentIcon(doc.fileType)}
                    </div>
                    <h4 className="font-medium text-center mb-1 line-clamp-1">{doc.title}</h4>
                    <p className="text-xs text-muted-foreground text-center mb-2">
                      {formatFileSize(doc.fileSize)} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                    <Badge className={color}>{label}</Badge>
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <DownloadCloud className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}