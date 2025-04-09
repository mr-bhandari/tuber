
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen } from 'lucide-react';

const EducationalInfo = () => {
  return (
    <Card className="w-full max-w-2xl border-2">
      <CardHeader className="flex flex-row items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <div>
          <CardTitle>Educational Purpose Only</CardTitle>
          <CardDescription>
            This tool is created for learning about media processing
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This application demonstrates the concepts behind media conversion for educational purposes only.
          In a real implementation, the following would be important considerations:
        </p>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="font-medium">Proper Use Cases:</h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Using YouTube's official API for allowed interactions</li>
            <li>Working with freely licensed content</li>
            <li>Creating a tool that processes locally stored media files</li>
            <li>Understanding the technical aspects of media conversion</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Implementation Notes:</h3>
          <p className="text-sm text-muted-foreground">
            A full implementation would require a Java backend using libraries like <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">youtube-dl</span> or 
            <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">yt-dlp</span> for fetching metadata and converting media.
            The frontend would communicate via RESTful APIs to the backend for processing requests.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationalInfo;
