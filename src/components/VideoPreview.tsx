
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoMetadata {
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
}

interface VideoPreviewProps {
  metadata: VideoMetadata | null;
  isLoading: boolean;
}

const VideoPreview = ({ metadata, isLoading }: VideoPreviewProps) => {
  if (isLoading) {
    return (
      <Card className="w-full max-w-md overflow-hidden border-2">
        <CardContent className="p-0">
          <Skeleton className="h-44 w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metadata) return null;

  return (
    <Card className="w-full max-w-md overflow-hidden border-2">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={metadata.thumbnail}
            alt={metadata.title}
            className="w-full h-44 object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
            {metadata.duration}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2">{metadata.title}</h3>
          <p className="text-muted-foreground text-sm mt-1">{metadata.channel}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPreview;
