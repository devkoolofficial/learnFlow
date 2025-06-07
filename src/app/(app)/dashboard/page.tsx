'use client';

import { useAuth } from '@/contexts/FirebaseContext';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import InstructorDashboard from '@/components/dashboard/InstructorDashboard';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Not Found</CardTitle>
                <CardDescription>Your user profile could not be loaded. Please try logging out and back in, or contact support.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>If the issue persists, please ensure your account setup was completed correctly.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">
        Welcome, {userProfile.displayName || 'User'}!
      </h1>
      {userProfile.role === 'student' && <StudentDashboard />}
      {userProfile.role === 'instructor' && <InstructorDashboard />}
    </div>
  );
}
