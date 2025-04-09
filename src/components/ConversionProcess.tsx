
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Loader2 } from 'lucide-react';
import { FormatType, VideoQuality, AudioQuality } from './FormatSelector';
import { useToast } from '@/components/ui/use-toast';

interface ConversionProcessProps {
  isConverting: boolean;
  progress: number;
  onConvert: () => void;
  format: FormatType;
  quality: VideoQuality | AudioQuality;
  onDownload: () => void;
  isReady: boolean;
}

const ConversionProcess = ({
  isConverting,
  progress,
  onConvert,
  format,
  quality,
  onDownload,
  isReady,
}: ConversionProcessProps) => {
  const { toast } = useToast();
  
  const handleDownload = () => {
    toast({
      title: "Download started",
      description: `Your ${format.toUpperCase()} file is being downloaded.`,
    });
    onDownload();
  };

  const formatProgress = (progress: number): number => {
    // Ensure progress is always a valid number between 0-100
    return Math.max(0, Math.min(100, Math.round(progress)));
  };

  const displayProgress = formatProgress(progress);

  return (
    <Card className="w-full max-w-md border-2">
      <CardContent className="pt-6 space-y-4">
        {isConverting ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">
                  Converting to {format.toUpperCase()} {quality}
                </span>
                <span className="text-sm font-medium">{displayProgress}%</span>
              </div>
              <Progress 
                value={displayProgress} 
                className="h-3 transition-all duration-300"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Please wait while we convert your file...
            </p>
          </>
        ) : (
          <>
            {isReady ? (
              <Button onClick={handleDownload} className="w-full bg-green-600 hover:bg-green-700">
                <Download className="mr-2 h-4 w-4" />
                Download {format.toUpperCase()} {quality}
              </Button>
            ) : (
              <Button onClick={onConvert} className="w-full">
                Convert to {format.toUpperCase()} {quality}
              </Button>
            )}
            <p className="text-xs text-center text-muted-foreground">
              {isReady
                ? "Your file is ready for download!"
                : "Click to start the conversion process"}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversionProcess;
