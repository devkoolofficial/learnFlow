'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Zap } from 'lucide-react';
import type { Course, StudentCourseProgress } from '@/lib/types'; // Assuming types are defined
import { useAuth } from '@/contexts/FirebaseContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Mock data for courses and progress - replace with actual data fetching
const MOCK_COURSES: Course[] = [
  { id: 'course1', title: 'Introduction to Web Development', description: 'Learn HTML, CSS, and JavaScript basics.', instructorName: 'Dr. Code', instructorId: 'instr1', topics: [{topicName: 'HTML'}, {topicName: 'CSS'}, {topicName: 'JS'}], coverImage: 'https://placehold.co/600x400.png?text=Web+Dev', createdAt: new Date(), updatedAt: new Date() },
  { id: 'course2', title: 'Advanced React Patterns', description: 'Deep dive into React best practices.', instructorName: 'Prof. Component', instructorId: 'instr2', topics: [{topicName: 'Hooks'}, {topicName: 'State Management'}, {topicName: 'Performance'}], coverImage: 'https://placehold.co/600x400.png?text=React+Adv', createdAt: new Date(), updatedAt: new Date() },
  { id: 'course3', title: 'Data Structures & Algorithms', description: 'Master essential CS concepts.', instructorName: 'Dr. Logic', instructorId: 'instr3', topics: [{topicName: 'Arrays'}, {topicName: 'Trees'}, {topicName: 'Graphs'}], coverImage: 'https://placehold.co/600x400.png?text=DSA', createdAt: new Date(), updatedAt: new Date() },
];

const MOCK_PROGRESS: StudentCourseProgress[] = [
  { courseId: 'course1', studentId: 'student1', completedTopics: ['HTML'], overallProgress: 33, lastAccessed: new Date() },
  { courseId: 'course2', studentId: 'student1', completedTopics: ['Hooks', 'State Management'], overallProgress: 66, lastAccessed: new Date() },
];


export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<StudentCourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch enrolledCourses and courseProgress based on user.uid
    // For now, using mock data
    // Example of fetching (needs firestore rules and actual data structure):
    /*
    if (user) {
      const fetchStudentData = async () => {
        // Fetch courses student is enrolled in
        // Fetch progress for those courses
        // This is simplified, actual logic would be more complex
        const q = query(collection(db, 'courses'), where('enrolledStudents', 'array-contains', user.uid), limit(5));
        const courseSnap = await getDocs(q);
        setEnrolledCourses(courseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
        
        // Fetch progress - this also needs a proper structure
        // const progressQuery = query(collection(db, 'studentProgress'), where('studentId', '==', user.uid));
        // ...
        setLoading(false);
      };
      fetchStudentData();
    }
    */
    setEnrolledCourses(MOCK_COURSES);
    setCourseProgress(MOCK_PROGRESS);
    setLoading(false);
  }, [user]);

  if (loading) return <p>Loading dashboard...</p>;

  const getProgressForCourse = (courseId: string) => {
    return courseProgress.find(p => p.courseId === courseId)?.overallProgress || 0;
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">My Courses</h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                  {course.coverImage && (
                     <Image 
                        src={course.coverImage} 
                        alt={course.title} 
                        width={600} 
                        height={300} 
                        className="w-full h-48 object-cover"
                        data-ai-hint="education learning"
                      />
                  )}
                  <div className="p-6">
                    <CardTitle className="text-xl font-headline">{course.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      By {course.instructorName}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-6 pt-0">
                  <p className="text-sm text-foreground mb-4 line-clamp-3">{course.description}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{getProgressForCourse(course.id)}%</span>
                    </div>
                    <Progress value={getProgressForCourse(course.id)} aria-label={`${course.title} progress`} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 border-t mt-auto">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href={`/courses/${course.id}`}>
                      Continue Learning <TrendingUp className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">You are not enrolled in any courses yet.</p>
              <Button asChild variant="link" className="mt-2 text-primary">
                <Link href="/courses/explore">Explore Courses</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Recommended For You</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap size={24} className="mr-2 text-accent" />
              Personalized Learning Path
            </CardTitle>
            <CardDescription>
              Based on your progress, here are some topics we recommend focusing on.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for learning path summary. Full path on /learning-path */}
            <p className="text-muted-foreground">Your personalized learning path helps you focus on areas for improvement. View your full path for detailed recommendations.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/learning-path">View My Learning Path</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
