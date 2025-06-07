'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, PlusCircle, Users, BarChartHorizontalBig } from 'lucide-react';
import type { Course } from '@/lib/types';
import { useAuth } from '@/contexts/FirebaseContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Mock data - replace with actual data fetching
const MOCK_INSTRUCTOR_COURSES: Course[] = [
  { id: 'course1', title: 'Introduction to Web Development', description: 'Learn HTML, CSS, and JavaScript basics.', instructorName: 'You', instructorId: 'instr1', topics: [{topicName: 'HTML'}, {topicName: 'CSS'}, {topicName: 'JS'}], coverImage: 'https://placehold.co/600x400.png?text=Web+Dev', enrolledStudents: ['s1', 's2', 's3'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'course4', title: 'Python for Data Science', description: 'Master Python for data analysis and visualization.', instructorName: 'You', instructorId: 'instr1', topics: [{topicName: 'Pandas'}, {topicName: 'Numpy'}, {topicName: 'Matplotlib'}], coverImage: 'https://placehold.co/600x400.png?text=Python+DS', enrolledStudents: ['s4', 's5'], createdAt: new Date(), updatedAt: new Date() },
];

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch courses where instructorId === user.uid
    /*
    if (user) {
      const fetchInstructorCourses = async () => {
        const q = query(collection(db, 'courses'), where('instructorId', '==', user.uid), limit(10));
        const courseSnap = await getDocs(q);
        setMyCourses(courseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
        setLoading(false);
      };
      fetchInstructorCourses();
    }
    */
    setMyCourses(MOCK_INSTRUCTOR_COURSES);
    setLoading(false);
  }, [user]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-headline font-semibold">My Courses</h2>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/instructor/courses/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
            </Link>
          </Button>
        </div>
        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                 <CardHeader className="p-0">
                  {course.coverImage && (
                     <Image 
                        src={course.coverImage} 
                        alt={course.title} 
                        width={600} 
                        height={300} 
                        className="w-full h-48 object-cover"
                        data-ai-hint="online course"
                      />
                  )}
                   <div className="p-6">
                    <CardTitle className="text-xl font-headline">{course.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-2 flex items-center">
                      <Users className="mr-2 h-4 w-4" /> {course.enrolledStudents?.length || 0} Students Enrolled
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-6 pt-0">
                   <p className="text-sm text-foreground mb-4 line-clamp-3">{course.description}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0 border-t mt-auto">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/instructor/courses/${course.id}/edit`}>
                      <Edit3 className="mr-2 h-4 w-4" /> Manage Course
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
             <CardContent>
                <Edit3 size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">You haven&apos;t created any courses yet.</p>
                <Button asChild variant="link" className="mt-2 text-primary">
                  <Link href="/instructor/courses/new">Create Your First Course</Link>
                </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center"><FileUp size={20} className="mr-2 text-primary"/>Upload Content</CardTitle>
              <CardDescription>Quickly upload PDF documents or other learning materials.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="secondary">
                <Link href="/instructor/upload-content">Upload Files</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center"><BarChartHorizontalBig size={20} className="mr-2 text-primary"/>View Analytics</CardTitle>
              <CardDescription>Check student progress and course engagement.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="secondary">
                <Link href="/instructor/analytics">Go to Analytics</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
