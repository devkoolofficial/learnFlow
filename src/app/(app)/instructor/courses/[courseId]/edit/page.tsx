'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/FirebaseContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, AlertTriangle, Save, PlusCircle, Trash2, FileUp } from 'lucide-react';
import type { Course, CourseTopic } from '@/lib/types';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const topicSchema = z.object({
  topicName: z.string().min(3, "Topic name must be at least 3 characters."),
  contentUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

const courseEditFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(100, { message: "Title cannot exceed 100 characters."}),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }).max(500, { message: "Description cannot exceed 500 characters."}),
  // coverImage: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  topics: z.array(topicSchema),
});

type CourseEditFormValues = z.infer<typeof courseEditFormSchema>;

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseEditFormValues>({
    resolver: zodResolver(courseEditFormSchema),
    defaultValues: {
      title: '',
      description: '',
      // coverImage: '',
      topics: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "topics",
  });

  useEffect(() => {
    if (!courseId) return;
    setIsLoadingCourse(true);
    const fetchCourse = async () => {
      const courseDocRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseDocRef);
      if (courseSnap.exists()) {
        const courseData = { id: courseSnap.id, ...courseSnap.data() } as Course;
        setCourse(courseData);
        form.reset({
          title: courseData.title,
          description: courseData.description,
          // coverImage: courseData.coverImage || '',
          topics: courseData.topics || [],
        });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Course not found.' });
        router.push('/instructor/courses');
      }
      setIsLoadingCourse(false);
    };
    fetchCourse();
  }, [courseId, form, router, toast]);

  async function onSubmit(data: CourseEditFormValues) {
    if (!user || !course || user.uid !== course.instructorId) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not authorized to edit this course.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const courseDocRef = doc(db, 'courses', courseId);
      await updateDoc(courseDocRef, {
        ...data,
        // coverImage: data.coverImage || `https://placehold.co/600x300.png?text=${encodeURIComponent(data.title)}`,
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Success', description: 'Course updated successfully!' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (authLoading || isLoadingCourse) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!userProfile || userProfile.role !== 'instructor' || (course && user.uid !== course.instructorId)) {
     return (
        <div className="p-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to edit this course.</AlertDescription>
            </Alert>
        </div>
    );
  }
  
  if (!course) {
      return <div className="p-4"><Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>Course data could not be loaded.</AlertDescription></Alert></div>;
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-semibold">Edit Course: {course.title}</h1>
        <Button variant="outline" asChild>
            <Link href={`/courses/${courseId}/upload`}>
                <FileUp className="mr-2 h-4 w-4" /> Manage Uploaded Content
            </Link>
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
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
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Topics</CardTitle>
              <CardDescription>Manage the topics for this course. Link to PDF content from the 'Manage Uploaded Content' section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 space-y-3 bg-secondary/50">
                   <FormField
                    control={form.control}
                    name={`topics.${index}.topicName`}
                    render={({ field: topicField }) => (
                      <FormItem>
                        <FormLabel>Topic Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Introduction to HTML" {...topicField} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`topics.${index}.contentUrl`}
                    render={({ field: urlField }) => (
                      <FormItem>
                        <FormLabel>Content URL (Optional PDF Link)</FormLabel>
                        <FormControl><Input placeholder="Link to PDF or external resource" {...urlField} /></FormControl>
                        <FormMessage />
                         <p className="text-xs text-muted-foreground">You can get this link after uploading content via "Manage Uploaded Content".</p>
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                    <Trash2 className="mr-2 h-3 w-3" />Remove Topic
                  </Button>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ topicName: '', contentUrl: '' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Topic
              </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
