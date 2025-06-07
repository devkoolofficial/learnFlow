'use client';

import { BarChart3, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/FirebaseContext';
import Image from 'next/image';

export default function AnalyticsPage() {
  const { userProfile } = useAuth();

  if (userProfile?.role !== 'instructor') {
     return (
        <div className="p-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to view analytics.</AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold flex items-center">
        <BarChart3 size={28} className="mr-3 text-primary" />
        Course Analytics
      </h1>
      <p className="text-muted-foreground">
        Track student engagement, completion rates, and overall course performance.
      </p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Analytics Dashboard</CardTitle>
          <CardDescription>This feature is currently under development.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center min-h-[300px] py-12">
          <Image 
            src="https://placehold.co/400x300.png" 
            alt="Analytics placeholder" 
            width={400} 
            height={300}
            className="rounded-lg mb-8 opacity-70"
            data-ai-hint="data chart"
          />
          <p className="text-lg font-medium text-muted-foreground">
            Detailed analytics and reports will be available here soon.
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            You'll be able to see insights into student progress, popular topics, quiz performance, and more to help you improve your courses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
