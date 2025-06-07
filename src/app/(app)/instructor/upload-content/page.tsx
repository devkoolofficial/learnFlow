'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/FirebaseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, db } from '@/lib/firebase/config';
// import { doc, updateDoc, arrayUnion } from 'firebase/firestore'; // If linking to a general content library
import { Loader2, FileUp, AlertTriangle, UploadCloud } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image';

export default function GeneralUploadContentPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contentName, setContentName] = useState(''); 
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDownloadUrl(null); // Reset previous URL
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a PDF file." });
        setFile(null);
        event.target.value = "";
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit for general uploads
        toast({ variant: "destructive", title: "File Too Large", description: "PDF file size should not exceed 10MB." });
        setFile(null);
        event.target.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Missing file or user information.' });
      return;
    }
    if (!contentName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide a name for this content.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setDownloadUrl(null);

    // Generic path for instructor's content library
    const storageRef = ref(storage, `instructorContent/${user.uid}/${Date.now()}_${file.name}`);
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
        const generatedDownloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setDownloadUrl(generatedDownloadURL);
        
        // Here, you might save `contentName` and `generatedDownloadURL` to a "contentLibrary" collection in Firestore
        // associated with the instructor's user.uid.
        // Example: await addDoc(collection(db, 'instructorContentLibrary'), { instructorId: user.uid, name: contentName, url: generatedDownloadURL, fileName: file.name, uploadedAt: serverTimestamp() });
        
        toast({ title: 'Success', description: `${file.name} uploaded successfully! You can now copy the URL.` });
        setIsUploading(false);
        // Do not reset file or contentName, so user can see the URL and copy it.
      }
    );
  };

  if (userProfile?.role !== 'instructor') {
    return (
        <div className="p-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to upload content.</AlertDescription>
            </Alert>
        </div>
    );
  }

  const copyToClipboard = () => {
    if(downloadUrl) {
      navigator.clipboard.writeText(downloadUrl);
      toast({title: "Copied!", description: "Download URL copied to clipboard."});
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Upload Course Content</h1>
       <p className="text-muted-foreground">
        Upload PDF materials here. After uploading, you'll get a URL that you can use when editing your course topics.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UploadCloud className="mr-2 text-primary"/>Upload PDF Material</CardTitle>
          <CardDescription>
            Add PDF files to your content library. Maximum file size: 10MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contentName">Content Name / Description</Label>
            <Input 
              id="contentName" 
              placeholder="e.g., Chapter 1 Slides, Syllabus Fall 2024" 
              value={contentName}
              onChange={(e) => setContentName(e.target.value)}
              disabled={isUploading}
            />
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
          <Button onClick={handleUpload} disabled={!file || isUploading || !contentName.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
            Upload File
          </Button>

          {downloadUrl && !isUploading && (
            <Card className="mt-6 bg-secondary/30">
              <CardHeader>
                <CardTitle className="text-base">File Uploaded Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Your file <span className="font-medium">{file?.name}</span> is ready.</p>
                <Label htmlFor="downloadUrl">Download URL (copy this to use in your course topics):</Label>
                <div className="flex gap-2">
                    <Input id="downloadUrl" type="text" value={downloadUrl} readOnly className="bg-background"/>
                    <Button onClick={copyToClipboard} variant="outline">Copy</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>How to use uploaded content?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Upload your PDF file using the form above.</p>
            <p>2. Once uploaded, a "Download URL" will be provided.</p>
            <p>3. Copy this URL.</p>
            <p>4. Go to "Manage Courses", select a course to edit, and find the topic you want to link this PDF to.</p>
            <p>5. Paste the copied URL into the "Content URL" field for that topic.</p>
        </CardContent>
      </Card>
    </div>
  );
}

