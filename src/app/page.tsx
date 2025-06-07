'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/Logo';
import { useAuth } from '@/contexts/FirebaseContext';
import { BookOpen, GraduationCap, UserCheck } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Logo className="h-16 w-auto mb-8" />
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (user) {
     // Should be redirected by useEffect, this is a fallback.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
         <p className="text-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <Logo className="h-10 w-auto" />
        <div className="space-x-2">
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center text-center p-8 pt-24">
        <h1 className="text-5xl font-headline font-bold mb-6 text-primary">
          Unlock Your Learning Potential
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          LearnFlow offers personalized learning paths and powerful tools for students and instructors to achieve their educational goals.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mb-12">
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md">
            <GraduationCap size={48} className="text-primary mb-4" />
            <h2 className="text-2xl font-headline font-semibold mb-2">For Students</h2>
            <p className="text-muted-foreground">Discover courses, track your progress, and follow AI-powered personalized learning paths.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md">
            <UserCheck size={48} className="text-primary mb-4" />
            <h2 className="text-2xl font-headline font-semibold mb-2">For Instructors</h2>
            <p className="text-muted-foreground">Create engaging courses, manage content, and support your students effectively.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md">
            <BookOpen size={48} className="text-primary mb-4" />
            <h2 className="text-2xl font-headline font-semibold mb-2">Personalized Paths</h2>
            <p className="text-muted-foreground">Our AI analyzes your performance to craft a unique learning journey just for you.</p>
          </div>
        </div>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/signup">Get Started Now</Link>
        </Button>
      </main>
      
      <section className="w-full py-16 bg-secondary mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-headline font-bold mb-8 text-primary">Why Choose LearnFlow?</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="LearnFlow platform screenshot" 
                width={600} 
                height={400}
                className="rounded-lg shadow-lg mx-auto"
                data-ai-hint="education technology"
              />
            </div>
            <ul className="space-y-4 text-left text-lg text-muted-foreground">
              <li className="flex items-start"><CheckCircleIcon className="w-6 h-6 text-accent mr-2 mt-1 flex-shrink-0" /> AI-driven personalized learning plans.</li>
              <li className="flex items-start"><CheckCircleIcon className="w-6 h-6 text-accent mr-2 mt-1 flex-shrink-0" /> Easy course creation and management for instructors.</li>
              <li className="flex items-start"><CheckCircleIcon className="w-6 h-6 text-accent mr-2 mt-1 flex-shrink-0" /> Seamless document uploads (PDFs) for learning materials.</li>
              <li className="flex items-start"><CheckCircleIcon className="w-6 h-6 text-accent mr-2 mt-1 flex-shrink-0" /> Secure authentication and user profile management.</li>
              <li className="flex items-start"><CheckCircleIcon className="w-6 h-6 text-accent mr-2 mt-1 flex-shrink-0" /> Clean, intuitive, and accessible design.</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 text-center text-muted-foreground border-t border-border mt-12">
        <p>&copy; {new Date().getFullYear()} LearnFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
