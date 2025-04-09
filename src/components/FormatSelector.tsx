
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Music, Video } from 'lucide-react';

export type VideoQuality = '720p' | '1080p';
export type AudioQuality = '64kbps' | '128kbps' | '192kbps' | '256kbps' | '320kbps';
export type FormatType = 'mp3' | 'mp4';

interface FormatSelectorProps {
  selectedFormat: FormatType;
  setSelectedFormat: (format: FormatType) => void;
  videoQuality: VideoQuality;
  setVideoQuality: (quality: VideoQuality) => void;
  audioQuality: AudioQuality;
  setAudioQuality: (quality: AudioQuality) => void;
}

const FormatSelector = ({
  selectedFormat,
  setSelectedFormat,
  videoQuality,
  setVideoQuality,
  audioQuality,
  setAudioQuality,
}: FormatSelectorProps) => {
  return (
    <Card className="w-full max-w-md border-2">
      <CardContent className="pt-6">
        <Tabs defaultValue={selectedFormat} onValueChange={(value) => setSelectedFormat(value as FormatType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mp3" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              MP3 Audio
            </TabsTrigger>
            <TabsTrigger value="mp4" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              MP4 Video
            </TabsTrigger>
          </TabsList>
          <TabsContent value="mp3" className="pt-4">
            <div className="space-y-2">
              <Label>Audio Quality</Label>
              <RadioGroup
                value={audioQuality}
                onValueChange={(value) => setAudioQuality(value as AudioQuality)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="320kbps" id="320kbps" />
                  <Label htmlFor="320kbps">320kbps (Best)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="256kbps" id="256kbps" />
                  <Label htmlFor="256kbps">256kbps (High)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="192kbps" id="192kbps" />
                  <Label htmlFor="192kbps">192kbps (Medium)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="128kbps" id="128kbps" />
                  <Label htmlFor="128kbps">128kbps (Low)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="64kbps" id="64kbps" />
                  <Label htmlFor="64kbps">64kbps (Lowest)</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
          <TabsContent value="mp4" className="pt-4">
            <div className="space-y-2">
              <Label>Video Quality</Label>
              <RadioGroup
                value={videoQuality}
                onValueChange={(value) => setVideoQuality(value as VideoQuality)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1080p" id="1080p" />
                  <Label htmlFor="1080p">1080p (HD)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="720p" id="720p" />
                  <Label htmlFor="720p">720p (SD)</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FormatSelector;
