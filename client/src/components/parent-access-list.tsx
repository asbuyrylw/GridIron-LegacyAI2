import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Mail, Trash2, AlertCircle, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ParentAccess {
  id: number;
  email: string;
  name: string;
  relationship: string;
  createdAt: string;
  lastEmailSent: string | null;
  receiveUpdates: boolean;
  receiveNutritionInfo: boolean;
  active: boolean;
}

interface ParentAccessListProps {
  athleteId: number;
}

export function ParentAccessList({ athleteId }: ParentAccessListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch parent accesses
  const { data: parentAccesses, isLoading, error } = useQuery<ParentAccess[]>({
    queryKey: ["/api/athlete", athleteId, "parent-access"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/athlete/${athleteId}/parent-access`);
      return response.json();
    }
  });

  // Update parent access
  const updateAccessMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<ParentAccess> }) => {
      const response = await apiRequest(
        "PATCH", 
        `/api/athlete/${athleteId}/parent-access/${id}`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/athlete", athleteId, "parent-access"] });
      toast({
        title: "Settings updated",
        description: "Parent access settings have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Deactivate parent access
  const deactivateAccessMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(
        "DELETE", 
        `/api/athlete/${athleteId}/parent-access/${id}`
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/athlete", athleteId, "parent-access"] });
      toast({
        title: "Access revoked",
        description: "Parent access has been revoked.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to revoke access",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle notification setting
  const handleToggleUpdate = (access: ParentAccess, type: 'receiveUpdates' | 'receiveNutritionInfo') => {
    updateAccessMutation.mutate({
      id: access.id,
      data: {
        [type]: !access[type]
      }
    });
  };

  // Deactivate access
  const handleDeactivate = (id: number) => {
    deactivateAccessMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="py-6 text-center text-muted-foreground">Loading parent access information...</div>;
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 mb-2 text-destructive" />
        <p className="text-destructive">Error loading parent access information.</p>
      </div>
    );
  }

  if (!parentAccesses || parentAccesses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parent Access</CardTitle>
          <CardDescription>No parents have been given access yet.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="mb-2">You can invite parents to receive your progress updates via email.</p>
          <p className="text-sm text-muted-foreground">
            They'll receive performance updates and statistics directly in their inbox - no login required.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parent Access</CardTitle>
        <CardDescription>
          {parentAccesses.length} {parentAccesses.length === 1 ? 'parent' : 'parents'} have been given access to receive your progress updates via email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email/Access</TableHead>
              <TableHead>Notifications</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parentAccesses.map((access) => (
              <TableRow key={access.id}>
                <TableCell className="font-medium">
                  <div>{access.name}</div>
                  <div className="text-xs text-muted-foreground">{access.relationship}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{access.email}</div>
                  <div className="mt-1">
                    {access.active ? (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                        <Check className="h-3 w-3 mr-1" />
                        Access Enabled
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        <X className="h-3 w-3 mr-1" />
                        Access Revoked
                      </Badge>
                    )}
                  </div>
                  {access.lastEmailSent && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Last email: {formatDistanceToNow(new Date(access.lastEmailSent), { addSuffix: true })}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Performance Updates</span>
                      <Switch 
                        checked={access.receiveUpdates} 
                        onCheckedChange={() => handleToggleUpdate(access, "receiveUpdates")}
                        disabled={!access.active || updateAccessMutation.isPending}
                        className="h-4 w-7"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Nutrition Lists</span>
                      <Switch 
                        checked={access.receiveNutritionInfo} 
                        onCheckedChange={() => handleToggleUpdate(access, "receiveNutritionInfo")}
                        disabled={!access.active || updateAccessMutation.isPending}
                        className="h-4 w-7"
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {access.active ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Parent Access?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {access.name} will no longer receive email updates about your performance and nutrition.
                            This action can be reversed by sending a new invitation.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeactivate(access.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Revoke Access
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateAccessMutation.mutate({
                        id: access.id,
                        data: { active: true }
                      })}
                      disabled={updateAccessMutation.isPending}
                    >
                      Restore
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}