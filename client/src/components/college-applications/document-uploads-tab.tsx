import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/query-client';
import { Loader2, PlusCircle, FileText, Download, Eye, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/query-client';
import { format } from 'date-fns';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const documentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  documentType: z.enum(['Transcript', 'Letter of Recommendation', 'Resume', 'Essay', 'Test Score', 'Application Form', 'Financial Aid', 'Other']),
  description: z.string().optional(),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Must be a valid URL').optional(),
  version: z.string().optional(),
  notes: z.string().optional(),
});

type Document = z.infer<typeof documentSchema> & {
  id: number;
  athleteId: number;
  createdAt: string;
  updatedAt: string;
};

interface DocumentUploadsTabProps {
  athleteId: number;
}

export default function DocumentUploadsTab({ athleteId }: DocumentUploadsTabProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ['/api/college-applications/documents', athleteId],
    enabled: !!athleteId,
  });

  const createDocumentMutation = useMutation({
    mutationFn: (values: z.infer<typeof documentSchema>) => 
      apiRequest('/api/college-applications/documents', {
        method: 'POST',
        body: {
          ...values,
          athleteId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-applications/documents', athleteId] });
      setIsCreateDialogOpen(false);
      setFileToUpload(null);
      toast({
        title: 'Success',
        description: 'Document uploaded successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to upload document.',
        variant: 'destructive',
      });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: (values: Document) => 
      apiRequest(`/api/college-applications/documents/${values.id}`, {
        method: 'PATCH',
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-applications/documents', athleteId] });
      setIsEditDialogOpen(false);
      setSelectedDocument(null);
      setFileToUpload(null);
      toast({
        title: 'Success',
        description: 'Document updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update document.',
        variant: 'destructive',
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/college-applications/documents/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-applications/documents', athleteId] });
      toast({
        title: 'Success',
        description: 'Document deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete document.',
        variant: 'destructive',
      });
    },
  });

  const createForm = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      documentType: 'Other',
      description: '',
      fileName: '',
      fileUrl: '',
      version: '1.0',
      notes: '',
    },
  });

  const editForm = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      documentType: 'Other',
      description: '',
      fileName: '',
      fileUrl: '',
      version: '1.0',
      notes: '',
    },
  });

  function onCreateSubmit(values: z.infer<typeof documentSchema>) {
    // In a real app, we would upload the file first, then create the document record
    // For now, we'll just create the document record with the file name and mock URL
    if (fileToUpload) {
      const mockFileUrl = `/mock-uploads/${fileToUpload.name}`;
      createDocumentMutation.mutate({
        ...values,
        fileName: fileToUpload.name,
        fileUrl: mockFileUrl,
      });
    } else {
      createDocumentMutation.mutate(values);
    }
  }

  function onEditSubmit(values: z.infer<typeof documentSchema>) {
    if (selectedDocument) {
      let updatedValues = { ...values };
      
      // If a new file was uploaded, update the fileName and fileUrl
      if (fileToUpload) {
        const mockFileUrl = `/mock-uploads/${fileToUpload.name}`;
        updatedValues = {
          ...updatedValues,
          fileName: fileToUpload.name,
          fileUrl: mockFileUrl,
        };
      }
      
      updateDocumentMutation.mutate({
        ...selectedDocument,
        ...updatedValues,
      });
    }
  }

  function handleEdit(document: Document) {
    setSelectedDocument(document);
    editForm.reset({
      title: document.title,
      documentType: document.documentType,
      description: document.description || '',
      fileName: document.fileName,
      fileUrl: document.fileUrl || '',
      version: document.version || '1.0',
      notes: document.notes || '',
    });
    setIsEditDialogOpen(true);
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(id);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, formType: 'create' | 'edit') {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileToUpload(files[0]);
      
      // Update the form with the file name
      if (formType === 'create') {
        createForm.setValue('fileName', files[0].name);
      } else {
        editForm.setValue('fileName', files[0].name);
      }
    }
  }

  function getDocumentTypeIcon(type: string) {
    switch (type) {
      case 'Transcript':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'Letter of Recommendation':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'Resume':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'Essay':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      case 'Test Score':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'Application Form':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'Financial Aid':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyPlaceholder
        title="Failed to load data"
        description="There was an error loading your documents. Please try again."
        icon={<FileText className="h-12 w-12 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Document Uploads</h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {documents && documents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc: Document) => (
            <Card key={doc.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getDocumentTypeIcon(doc.documentType)}
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                  </div>
                  <Badge>{doc.documentType}</Badge>
                </div>
                {doc.description && (
                  <CardDescription>{doc.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  File: {doc.fileName}
                </div>
                {doc.version && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Version: {doc.version}
                  </div>
                )}
                {doc.notes && (
                  <div className="mt-2 text-sm">{doc.notes}</div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  Uploaded: {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 pt-2">
                <div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => alert("View document functionality would be implemented in a real app")}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => alert("Download functionality would be implemented in a real app")}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
                <div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(doc)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyPlaceholder
          title="No documents uploaded yet"
          description="Upload your first document for your college applications."
          icon={<FileText className="h-12 w-12 text-muted-foreground" />}
          action={
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Upload Your First Document
            </Button>
          }
        />
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
            <DialogDescription>
              Upload a document for your college applications
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., My College Transcript" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Transcript">Transcript</SelectItem>
                        <SelectItem value="Letter of Recommendation">Letter of Recommendation</SelectItem>
                        <SelectItem value="Resume">Resume</SelectItem>
                        <SelectItem value="Essay">Essay</SelectItem>
                        <SelectItem value="Test Score">Test Score</SelectItem>
                        <SelectItem value="Application Form">Application Form</SelectItem>
                        <SelectItem value="Financial Aid">Financial Aid</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a description for this document..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'create')}
                  />
                </FormControl>
                <FormDescription>
                  Upload your document file (PDF, Word, etc.)
                </FormDescription>
                <FormMessage />
              </FormItem>

              <FormField
                control={createForm.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createDocumentMutation.isPending}>
                  {createDocumentMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Upload Document
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update this document's information
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., My College Transcript" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Transcript">Transcript</SelectItem>
                        <SelectItem value="Letter of Recommendation">Letter of Recommendation</SelectItem>
                        <SelectItem value="Resume">Resume</SelectItem>
                        <SelectItem value="Essay">Essay</SelectItem>
                        <SelectItem value="Test Score">Test Score</SelectItem>
                        <SelectItem value="Application Form">Application Form</SelectItem>
                        <SelectItem value="Financial Aid">Financial Aid</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a description for this document..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>File</FormLabel>
                <FormDescription>
                  Current file: {editForm.getValues('fileName')}
                </FormDescription>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'edit')}
                  />
                </FormControl>
                <FormDescription>
                  Upload a new file to replace the current one (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>

              <FormField
                control={editForm.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateDocumentMutation.isPending}>
                  {updateDocumentMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Document
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}