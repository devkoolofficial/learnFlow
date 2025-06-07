'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit3, Users, Trash2, Eye, AlertTriangle } from 'lucide-react';
import type { Course } from '@/lib/types';
import { useAuth } from '@/contexts/FirebaseContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with actual data fetching from Firestore
const MOCK_INSTRUCTOR_COURSES: Course[] = [
  { id: 'course1', title: 'Introduction to Web Development', description: 'Learn HTML, CSS, and JavaScript basics.', instructorName: 'You', instructorId: 'instr1', topics: [], coverImage: 'https://placehold.co/600x400.png?text=Web+Dev', enrolledStudents: ['s1', 's2', 's3'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'course4', title: 'Python for Data Science', description: 'Master Python for data analysis and visualization.', instructorName: 'You', instructorId: 'instr1', topics: [], coverImage: 'https://placehold.co/600x400.png?text=Python+DS', enrolledStudents: ['s4', 's5'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'course6', title: 'Advanced Cloud Architectures', description: 'Design and implement scalable cloud solutions.', instructorName: 'You', instructorId: 'instr1', topics: [], coverImage: 'https://placehold.co/600x400.png?text=Cloud+Arch', enrolledStudents: ['s6', 's7', 's8', 's9'], createdAt: new Date(), updatedAt: new Date() },
];

export default function ManageCoursesPage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, fetch courses where instructorId === user.uid
  useEffect(() => {
    // Example: if (user) { fetchInstructorCourses(user.uid).then(setMyCourses); }
    setMyCourses(MOCK_INSTRUCTOR_COURSES);
    setLoading(false);
  }, [user]);

  const handleDeleteCourse = async (courseId: string) => {
    // TODO: Implement actual course deletion logic (update Firestore, delete storage files, etc.)
    // For now, simulate deletion and show a toast
    console.log(`Attempting to delete course ${courseId}`);
    setMyCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
    toast({
      title: "Course Deleted (Simulated)",
      description: `Course "${myCourses.find(c => c.id === courseId)?.title}" has been removed.`,
    });
  };


  if (userProfile?.role !== 'instructor') {
    return (
        <div className="p-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to manage courses.</AlertDescription>
            </Alert>
        </div>
    );
  }

  if (loading) return <p>Loading your courses...</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-headline font-semibold">Manage Your Courses</h1>
            <p className="text-muted-foreground">Oversee, edit, and create new educational content.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/instructor/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
          </Link>
        </Button>
      </div>

      {myCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                 {course.coverImage && (
                    <Image src={course.coverImage} alt={course.title} width={600} height={300} className="w-full h-48 object-cover" data-ai-hint="course management"/>
                  )}
                <div className="p-4">
                    <CardTitle className="text-lg font-headline">{course.title}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center">
                    <Users className="mr-1.5 h-3 w-3" /> {course.enrolledStudents?.length || 0} Students
                    </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <p className="text-sm text-foreground/80 line-clamp-3">{course.description}</p>
              </CardContent>
              <CardFooter className="p-4 border-t mt-auto grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/instructor/courses/${course.id}/edit`}>
                    <Edit3 className="mr-2 h-3 w-3" /> Edit
                  </Link>
                </Button>
                 <Button asChild variant="ghost" size="sm">
                  <Link href={`/courses/${course.id}`}>
                    <Eye className="mr-2 h-3 w-3" /> View
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="col-span-2">
                  <Link href={`/courses/${course.id}/upload`}>
                    <PlusCircle className="mr-2 h-3 w-3" /> Add Content
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="col-span-2">
                      <Trash2 className="mr-2 h-3 w-3" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the course
                        "{course.title}" and all its associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">No Courses Yet!</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Edit3 size={60} className="text-muted-foreground mb-6" />
            <p className="text-muted-foreground mb-6 max-w-sm">
              It looks like you haven&apos;t created any courses. Start by creating your first course and share your knowledge.
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/instructor/courses/new">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
