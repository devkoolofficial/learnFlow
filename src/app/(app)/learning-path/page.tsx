'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/FirebaseContext';
import { generatePersonalizedLearningPath, type GeneratePersonalizedLearningPathInput, type GeneratePersonalizedLearningPathOutput } from '@/ai/flows/generate-personalized-learning-path';
import type { CourseHistoryItem, LearningPathItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Zap, BookOpen, Lightbulb, CheckSquare } from 'lucide-react';
import Image from 'next/image';

// Mock student performance data for the AI - replace with actual data
const MOCK_COURSE_HISTORY: CourseHistoryItem[] = [
  {
    courseName: 'Mathematics Basics',
    grade: 65,
    topics: [
      { topicName: 'Algebra Fundamentals', score: 70 },
      { topicName: 'Geometry Shapes', score: 55 },
      { topicName: 'Basic Calculus Concepts', score: 60 },
    ],
  },
  {
    courseName: 'Introduction to Computer Science',
    grade: 78,
    topics: [
      { topicName: 'Programming Logic', score: 85 },
      { topicName: 'Data Structures Overview', score: 65 },
      { topicName: 'Algorithm Design Principles', score: 72 },
    ],
  },
];

export default function LearningPathPage() {
  const { user } = useAuth();
  const [learningPath, setLearningPath] = useState<LearningPathItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLearningPath = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const input: GeneratePersonalizedLearningPathInput = {
        studentId: user.uid,
        courseHistory: MOCK_COURSE_HISTORY, // Replace with actual, comprehensive student performance data
      };
      const result: GeneratePersonalizedLearningPathOutput = await generatePersonalizedLearningPath(input);
      // Ensure the output structure matches LearningPathItem if direct casting is used
      setLearningPath(result.learningPath as LearningPathItem[]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate learning path.');
      console.error("Error generating learning path:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningPath();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Re-fetch if user changes, though typically user is stable on this page

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-headline font-semibold flex items-center">
            <Zap size={28} className="mr-3 text-accent" />
            My Personalized Learning Path
            </h1>
            <p className="text-muted-foreground mt-1">AI-generated recommendations to guide your studies and help you succeed.</p>
        </div>
        <Button onClick={fetchLearningPath} disabled={isLoading} variant="outline">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          {learningPath ? 'Refresh Path' : 'Generate My Path'}
        </Button>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating your personalized learning journey...</p>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Generating Path</AlertTitle>
          <AlertDescription>{error} Please try again.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && !learningPath && (
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Ready to discover your unique learning roadmap?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
             <Image src="https://placehold.co/300x200.png" alt="Learning Path Illustration" width={300} height={200} className="mb-6 rounded-md" data-ai-hint="learning path" />
            <p className="text-muted-foreground mb-6 max-w-md">
              Click the "Generate My Path" button to get started. Our AI will analyze your learning history and suggest topics tailored for you.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && learningPath && learningPath.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center min-h-[200px] flex flex-col items-center justify-center">
             <BookOpen size={48} className="text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No specific recommendations at this time.</p>
            <p className="text-sm text-muted-foreground">This could be because there's not enough data or you're on track!</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && learningPath && learningPath.length > 0 && (
        <div className="space-y-4">
          {learningPath.map((item, index) => (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center">
                  <span className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm`}>
                    {index + 1}
                  </span>
                  {item.topicName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 mb-3">{item.reason}</p>
                {/* Placeholder for potential resources linked to this learning path item */}
                {item.resources && item.resources.length > 0 && (
                  <>
                    <h4 className="font-semibold text-sm mb-1 mt-3">Suggested Resources:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {item.resources.map((res, rIndex) => (
                        <li key={rIndex}>
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {res.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
              <CardFooter>
                  <Button variant="outline" size="sm">
                    <CheckSquare className="mr-2 h-4 w-4" /> Mark as Studied (Future Feature)
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
