'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/FirebaseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, db } from '@/lib/firebase/config';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'; // For updating course with new content URL
import { Loader2, FileUp, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function UploadContentPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [topicName, setTopicName] = useState(''); // Optional: associate file with a specific topic

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a PDF file." });
        setFile(null);
        event.target.value = ""; // Reset file input
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: "destructive", title: "File Too Large", description: "PDF file size should not exceed 5MB." });
        setFile(null);
        event.target.value = ""; // Reset file input
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !courseId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Missing file, user, or course ID.' });
      return;
    }
    if (!topicName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide a topic name for this content.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `courses/${courseId}/content/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Update Firestore: Add this URL to the course's topics array or a dedicated content array.
        // This example assumes adding to a 'topics' array within the course document.
        // You might need to adjust this based on your actual Course data structure.
        try {
          const courseDocRef = doc(db, 'courses', courseId);
          // This is a simplified update. You might want to update a specific topic or add a new one.
          // For this example, we'll assume adding a new topic object.
          await updateDoc(courseDocRef, {
            topics: arrayUnion({
              topicName: topicName.trim(), // Or select an existing topic to update its contentUrl
              contentUrl: downloadURL,
              fileName: file.name,
              uploadedAt: new Date(),
            }),
          });
          
          toast({ title: 'Success', description: 'File uploaded and course updated!' });
          router.push(`/courses/${courseId}`); // Or instructor's course management page
        } catch (dbError: any) {
          console.error('Firestore update failed:', dbError);
          toast({ variant: 'destructive', title: 'Database Update Failed', description: 'File uploaded, but failed to link to course. ' + dbError.message });
        } finally {
          setIsUploading(false);
          setFile(null);
          setTopicName('');
        }
      }
    );
  };

  if (userProfile?.role !== 'instructor') {
    return (
        <div className="p-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to upload content for this course.</AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Upload Content for Course: {courseId}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload PDF Material</CardTitle>
          <CardDescription>
            Add PDF files to your course. Maximum file size: 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topicName">Topic Name</Label>
            <Input 
              id="topicName" 
              placeholder="e.g., Chapter 1: Introduction" 
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">Enter a name for the topic this content belongs to.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file-upload">Choose PDF File</Label>
            <Input id="file-upload" type="file" accept="application/pdf" onChange={handleFileChange} disabled={isUploading} />
          </div>
          {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full h-3" />
              <p className="text-sm text-primary">Uploading: {Math.round(uploadProgress)}%</p>
            </div>
          )}
          <Button onClick={handleUpload} disabled={!file || isUploading || !topicName.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
            Upload File
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
