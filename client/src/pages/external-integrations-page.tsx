import { IntegrationStatus } from "@/components/external-integrations/integration-status";
import { MainLayout } from "@/components/layout/main-layout";

export default function ExternalIntegrationsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-8">Platform Integrations</h1>
        <IntegrationStatus />
      </div>
    </MainLayout>
  );
}