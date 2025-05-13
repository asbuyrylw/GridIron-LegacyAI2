import React from 'react';
import { Helmet } from 'react-helmet';
import { EmailTestForm } from '../components/email-test-form';

export default function EmailTestPage() {
  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Email Test | GridIron LegacyAI</title>
      </Helmet>
      
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Email Testing Center</h1>
        <p className="text-muted-foreground mt-2">
          Test the SendGrid email integration for parent notifications
        </p>
      </div>
      
      <EmailTestForm />
    </div>
  );
}