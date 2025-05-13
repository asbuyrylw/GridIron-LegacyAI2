import { IntegrationStatus } from "@/components/external-integrations/integration-status";
import { Helmet } from "react-helmet";

export default function ExternalIntegrationsPage() {
  return (
    <div className="container py-6 max-w-7xl">
      <Helmet>
        <title>External Integrations | GridIron Legacy</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Integrations</h1>
        <p className="text-muted-foreground mb-6">
          Connect your external platform accounts to enhance your profile with stats, videos, and social media updates.
        </p>
      </div>
      
      <IntegrationStatus />
    </div>
  );
}