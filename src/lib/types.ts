export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: 'student' | 'instructor' | 'admin'; // Example roles
  // Add other profile fields as needed
}

export interface CourseTopic {
  topicName: string;
  score?: number; // Student's score on this topic
  contentUrl?: string; // URL to PDF or other learning material
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  enrolledStudents?: string[]; // Array of student UIDs
  topics: CourseTopic[];
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentCourseProgress {
  courseId: string;
  studentId: string;
  completedTopics: string[]; // Array of topicName
  overallProgress: number; // Percentage 0-100
  lastAccessed: Date;
}

export interface LearningPathItem {
  topicName: string;
  reason: string;
  resources?: { title: string; url: string }[];
}

// From GenAI schema
export interface CourseHistoryItem {
  courseName: string;
  grade: number;
  topics: Array<{
    topicName: string;
    score: number;
  }>;
}
