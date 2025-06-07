'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/FirebaseContext';
import { generatePersonalizedLearningPath, type GeneratePersonalizedLearningPathInput, type GeneratePersonalizedLearningPathOutput } from '@/ai/flows/generate-personalized-learning-path';
import type { Course, CourseHistoryItem, LearningPathItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Zap, Loader2, AlertTriangle, FileText, ExternalLink, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data - replace with actual data fetching from Firestore
const MOCK_COURSE_DETAILS: Course = {
  id: 'course1',
  title: 'Introduction to Web Development',
  description: 'This course covers the fundamental concepts of web development, including HTML, CSS, and JavaScript. You will learn to build responsive and interactive websites from scratch.',
  instructorName: 'Dr. Code',
  instructorId: 'instr1',
  coverImage: 'https://placehold.co/800x400.png?text=Web+Dev+Course',
  topics: [
    { topicName: 'HTML Basics', contentUrl: '#' },
    { topicName: 'CSS Fundamentals', contentUrl: '#' },
    { topicName: 'JavaScript Essentials', contentUrl: '#' },
    { topicName: 'Responsive Design', contentUrl: '#' },
    { topicName: 'DOM Manipulation', contentUrl: '#' },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock student performance data for the AI
const MOCK_COURSE_HISTORY: CourseHistoryItem[] = [
  {
    courseName: 'Pre-Algebra',
    grade: 75,
    topics: [
      { topicName: 'Basic Operations', score: 80 },
      { topicName: 'Fractions', score: 60 },
      { topicName: 'Decimals', score: 70 },
    ],
  },
  {
    courseName: 'Intro to Programming',
    grade: 82,
    topics: [
      { topicName: 'Variables', score: 90 },
      { topicName: 'Loops', score: 70 },
      { topicName: 'Functions', score: 75 },
    ],
  },
];


export default function CoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user, userProfile } = useAuth();

  const [course, setCourse] = useState<Course | null>(MOCK_COURSE_DETAILS); // Replace with actual fetch
  const [learningPath, setLearningPath] = useState<LearningPathItem[] | null>(null);
  const [isLoadingPath, setIsLoadingPath] = useState(false);
  const [errorPath, setErrorPath] = useState<string | null>(null);
  const [currentProgress] = useState(40); // Mock progress

  // Fetch actual course details based on courseId
  useEffect(() => {
    // Example: fetchCourseDetails(courseId).then(setCourse);
    // For now, using mock that matches common IDs
    if (courseId !== MOCK_COURSE_DETAILS.id) {
        const dynamicMockCourse = {
            ...MOCK_COURSE_DETAILS,
            id: courseId,
            title: `Details for Course ${courseId}`,
            coverImage: `https://placehold.co/800x400.png?text=Course+${courseId}`,
        }
        setCourse(dynamicMockCourse);
    } else {
        setCourse(MOCK_COURSE_DETAILS);
    }
  }, [courseId]);

  const handleGenerateLearningPath = async () => {
    if (!user) return;
    setIsLoadingPath(true);
    setErrorPath(null);
    try {
      const input: GeneratePersonalizedLearningPathInput = {
        studentId: user.uid,
        courseHistory: MOCK_COURSE_HISTORY, // Replace with actual student performance data
      };
      const result: GeneratePersonalizedLearningPathOutput = await generatePersonalizedLearningPath(input);
      setLearningPath(result.learningPath as LearningPathItem[]); // Cast needed if schema slightly differs
    } catch (error: any) {
      setErrorPath(error.message || 'Failed to generate learning path.');
      console.error("Error generating learning path:", error);
    } finally {
      setIsLoadingPath(false);
    }
  };

  if (!course) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading course details...</div>;
  }

  const isStudent = userProfile?.role === 'student';

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="p-0 relative">
          {course.coverImage && (
            <Image
              src={course.coverImage}
              alt={course.title}
              width={800}
              height={300}
              className="w-full h-64 object-cover"
              data-ai-hint="education course"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="p-6 absolute bottom-0 left-0 text-primary-foreground">
            <h1 className="text-4xl font-headline font-bold ">{course.title}</h1>
            <p className="text-lg ">By {course.instructorName}</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-foreground/80 mb-6">{course.description}</p>

          {isStudent && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Your Progress</h3>
              <Progress value={currentProgress} className="w-full h-3 mb-1" />
              <p className="text-sm text-muted-foreground">{currentProgress}% completed</p>
            </div>
          )}

          <h2 className="text-2xl font-headline font-semibold mb-4">Course Content</h2>
          <Accordion type="single" collapsible className="w-full">
            {course.topics.map((topic, index) => (
              <AccordionItem value={`item-${index}`} key={topic.topicName}>
                <AccordionTrigger className="text-lg hover:no-underline">
                  <div className="flex items-center">
                    { currentProgress > (index * (100/course.topics.length)) ? <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> : <FileText className="h-5 w-5 mr-2 text-primary/70" />}
                    {topic.topicName}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8">
                  <p className="text-foreground/70 mb-2">Detailed content for {topic.topicName} will appear here.</p>
                  {topic.contentUrl && topic.contentUrl !== '#' && (
                    <Button variant="link" asChild className="p-0 h-auto text-primary">
                      <a href={topic.contentUrl} target="_blank" rel="noopener noreferrer">
                        View Material <ExternalLink className="ml-1 h-3 w-3"/>
                      </a>
                    </Button>
                  )}
                   {topic.contentUrl === '#' && (
                    <Badge variant="outline">Material Coming Soon</Badge>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {isStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <Zap size={24} className="mr-2 text-accent" />
              Personalized Learning Path
            </CardTitle>
            <CardDescription>
              Get AI-powered recommendations based on your learning history to master this course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!learningPath && !isLoadingPath && !errorPath && (
              <Button onClick={handleGenerateLearningPath} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Lightbulb className="mr-2 h-4 w-4" /> Generate My Path
              </Button>
            )}
            {isLoadingPath && (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating your personalized path...
              </div>
            )}
            {errorPath && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorPath}</AlertDescription>
              </Alert>
            )}
            {learningPath && (
              <div className="space-y-4 mt-4">
                <h3 className="text-xl font-semibold">Recommended Focus Areas:</h3>
                <ul className="list-disc pl-5 space-y-3">
                  {learningPath.map((item, index) => (
                    <li key={index} className="text-foreground">
                      <strong className="font-medium">{item.topicName}</strong>
                      <p className="text-sm text-muted-foreground ml-2">{item.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          {learningPath && (
            <CardFooter>
               <Button onClick={handleGenerateLearningPath} variant="outline" disabled={isLoadingPath}>
                {isLoadingPath && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Regenerate Path
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
