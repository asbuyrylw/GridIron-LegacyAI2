import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Redirect, Route } from "wouter";
import { PageContainer } from "@/components/layout/page-container";

export function ProtectedRoute({
  path,
  component: Component,
  children,
}: {
  path: string;
  component?: () => React.JSX.Element;
  children?: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="min-h-screen">
          <LoadingSpinner centered size="md" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <PageContainer>
        {Component && <Component />}
        {children}
      </PageContainer>
    </Route>
  );
}
