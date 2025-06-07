'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/FirebaseContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, AlertTriangle, PlusCircle } from 'lucide-react';
import type { Course } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const courseFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(100, { message: "Title cannot exceed 100 characters."}),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }).max(500, { message: "Description cannot exceed 500 characters."}),
  // coverImage: z.string().url({ message: "Please enter a valid URL for the cover image." }).optional().or(z.literal('')), // Optional for now
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function CreateCoursePage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      // coverImage: '',
    },
  });

  async function onSubmit(data: CourseFormValues) {
    if (!user || !userProfile || userProfile.role !== 'instructor') {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not authorized to create courses.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const newCourseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'enrolledStudents' | 'topics' | 'coverImage'> & { createdAt: any, updatedAt: any, topics: any[], coverImage?: string } = {
        title: data.title,
        description: data.description,
        instructorId: user.uid,
        instructorName: userProfile.displayName || user.email || 'Unknown Instructor',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        topics: [], // Initialize with empty topics
        // coverImage: data.coverImage || `https://placehold.co/600x300.png?text=${encodeURIComponent(data.title)}`,
        coverImage: `https://placehold.co/600x300.png?text=${encodeURIComponent(data.title)}`,
      };

      const docRef = await addDoc(collection(db, 'courses'), newCourseData);
      toast({ title: 'Success', description: 'Course created successfully!' });
      router.push(`/instructor/courses/${docRef.id}/edit`); // Redirect to edit page to add topics/content
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Course Creation Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (userProfile?.role !== 'instructor') {
     return (
        <div className="p-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to create courses.</AlertDescription>
            </Alert>
        </div>
    );
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Create a New Course</h1>
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Fill in the information below to set up your new course.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Introduction to Quantum Physics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief overview of your course, what students will learn, and any prerequisites."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/your-course-image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              */}
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Create Course
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
