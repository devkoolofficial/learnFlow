'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Filter } from 'lucide-react';
import type { Course, StudentCourseProgress } from '@/lib/types';
import { useAuth } from '@/contexts/FirebaseContext';
// Mock data - replace with actual data fetching
const MOCK_ALL_COURSES: Course[] = [
  { id: 'course1', title: 'Introduction to Web Development', description: 'Learn HTML, CSS, and JavaScript basics.', instructorName: 'Dr. Code', instructorId: 'instr1', topics: [], coverImage: 'https://placehold.co/600x400.png?text=Web+Dev', createdAt: new Date(), updatedAt: new Date() },
  { id: 'course2', title: 'Advanced React Patterns', description: 'Deep dive into React best practices.', instructorName: 'Prof. Component', instructorId: 'instr2', topics: [], coverImage: 'https://placehold.co/600x400.png?text=React+Adv', createdAt: new Date(), updatedAt: new Date() },
  { id: 'course3', title: 'Data Structures & Algorithms', description: 'Master essential CS concepts.', instructorName: 'Dr. Logic', instructorId: 'instr3', topics: [], coverImage: 'https://placehold.co/600x400.png?text=DSA', createdAt: new Date(), updatedAt: new Date() },
  { id: 'course4', title: 'Python for Data Science', description: 'Unlock the power of Python for data.', instructorName: 'Dr. Py', instructorId: 'instr4', topics: [], coverImage: 'https://placehold.co/600x400.png?text=Python+DS', createdAt: new Date(), updatedAt: new Date() },
  { id: 'course5', title: 'Machine Learning Foundations', description: 'Understand the basics of ML.', instructorName: 'AI Sensei', instructorId: 'instr5', topics: [], coverImage: 'https://placehold.co/600x400.png?text=ML+Foundations', createdAt: new Date(), updatedAt: new Date() },
];

const MOCK_MY_ENROLLED_COURSES_IDS = ['course1', 'course3']; // IDs of courses student is enrolled in

const MOCK_PROGRESS: StudentCourseProgress[] = [
  { courseId: 'course1', studentId: 'student1', completedTopics: [], overallProgress: 33, lastAccessed: new Date() },
  { courseId: 'course3', studentId: 'student1', completedTopics: [], overallProgress: 75, lastAccessed: new Date() },
];

export default function CoursesPage() {
  const { user } = useAuth(); // Assuming student role for this page
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [exploreCourses, setExploreCourses] = useState<Course[]>([]);

  // In a real app, fetch courses from Firestore
  useEffect(() => {
    // Mock fetching and filtering
    const allCourses = MOCK_ALL_COURSES;
    const enrolled = allCourses.filter(c => MOCK_MY_ENROLLED_COURSES_IDS.includes(c.id));
    const notEnrolled = allCourses.filter(c => !MOCK_MY_ENROLLED_COURSES_IDS.includes(c.id));
    
    setMyCourses(enrolled);
    setExploreCourses(notEnrolled);
    setFilteredCourses(allCourses); // Initially show all
  }, []);

  useEffect(() => {
    const combined = [...myCourses, ...exploreCourses];
    if (!searchTerm) {
      setFilteredCourses(combined);
      return;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = combined.filter(course =>
      course.title.toLowerCase().includes(lowercasedFilter) ||
      course.description.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredCourses(filtered);
  }, [searchTerm, myCourses, exploreCourses]);

  const getProgressForCourse = (courseId: string) => {
    return MOCK_PROGRESS.find(p => p.courseId === courseId)?.overallProgress || 0;
  };

  const CourseCard = ({ course, isEnrolled }: { course: Course, isEnrolled: boolean }) => (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        {course.coverImage && (
          <Image src={course.coverImage} alt={course.title} width={600} height={300} className="w-full h-48 object-cover" data-ai-hint="course cover"/>
        )}
        <div className="p-4">
          <CardTitle className="text-lg font-headline">{course.title}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">By {course.instructorName}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <p className="text-sm text-foreground/80 mb-3 line-clamp-2">{course.description}</p>
        {isEnrolled && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{getProgressForCourse(course.id)}%</span>
            </div>
            <Progress value={getProgressForCourse(course.id)} aria-label={`${course.title} progress`} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={`/courses/${course.id}`}>
            {isEnrolled ? 'Continue Learning' : 'View Course'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold">Courses</h1>
        <p className="text-muted-foreground">Manage your enrolled courses or discover new ones.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" disabled> {/* Placeholder for future filter functionality */}
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {myCourses.length > 0 && (
        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4">My Enrolled Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myCourses
              .filter(course => filteredCourses.some(fc => fc.id === course.id))
              .map((course) => <CourseCard key={course.id} course={course} isEnrolled={true} />
            )}
          </div>
        </section>
      )}
      
      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Explore Courses</h2>
        {exploreCourses.filter(course => filteredCourses.some(fc => fc.id === course.id)).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exploreCourses
              .filter(course => filteredCourses.some(fc => fc.id === course.id))
              .map((course) => <CourseCard key={course.id} course={course} isEnrolled={false} />
            )}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No other courses found matching your criteria.</p>
              {searchTerm && <p className="text-sm">Try adjusting your search or filter.</p>}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
