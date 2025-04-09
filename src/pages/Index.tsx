
import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import URLInput from '@/components/URLInput';
import FormatSelector, { 
  FormatType, 
  VideoQuality, 
  AudioQuality 
} from '@/components/FormatSelector';
import VideoPreview from '@/components/VideoPreview';
import ConversionProcess from '@/components/ConversionProcess';
import EducationalInfo from '@/components/EducationalInfo';
import {
  fetchVideoInfo,
  startConversion,
  checkConversionProgress,
  completeConversion,
  getDownloadUrl
} from '@/services/youtubeService';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';

const Index = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [format, setFormat] = useState<FormatType>('mp3');
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('720p');
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('128kbps');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast: uiToast } = useToast();

  // Reset conversion state when format or quality changes
  useEffect(() => {
    if (isReady) {
      setIsReady(false);
    }
  }, [format, videoQuality, audioQuality]);
  
  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handleFetch = async () => {
    if (!url) return;

    setIsLoading(true);
    setVideoData(null);
    setIsReady(false);

    try {
      const data = await fetchVideoInfo(url);
      if (data) {
        setVideoData(data);
        toast('Video information fetched successfully!');
      } else {
        uiToast({
          title: "Error",
          description: "Could not fetch video information. Please check the URL.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching video:", error);
      uiToast({
        title: "Error",
        description: "An error occurred while fetching the video.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!videoData) return;

    setIsConverting(true);
    setProgress(0);
    setIsReady(false);

    try {
      const quality = format === 'mp4' ? videoQuality : audioQuality;
      // Start conversion on the backend
      const success = await startConversion(videoData.id, format, quality, videoData.title);

      if (!success) {
        throw new Error("Failed to start conversion");
      }

      // Clear any existing interval
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      // Set up progress checker
      progressInterval.current = setInterval(async () => {
        const currentProgress = await checkConversionProgress(videoData.id, format, quality);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
          }
          
          setIsConverting(false);
          setIsReady(true);
          
          uiToast({
            title: "Ready for Download",
            description: `Your ${format.toUpperCase()} file is ready for download!`,
          });
        }
      }, 1000); // Check every second
    } catch (error) {
      console.error("Error converting:", error);
      uiToast({
        title: "Conversion Failed",
        description: "An error occurred during conversion.",
        variant: "destructive",
      });
      setIsConverting(false);
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }
  };

  const handleDownload = async () => {
    if (!videoData || !isReady) return;

    const quality = format === 'mp4' ? videoQuality : audioQuality;
    try {
      const downloadUrl = await getDownloadUrl(videoData.id, format, quality);
      
      if (!downloadUrl) {
        throw new Error("Download URL not available");
      }
      
      // Create an invisible anchor element to trigger the download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${videoData.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast('Download started!');
    } catch (error) {
      console.error("Download error:", error);
      uiToast({
        title: "Download Failed",
        description: "Could not initiate download. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <div className="bg-gradient text-white py-8">
        <div className="container px-4 mx-auto">
          <Header />
        </div>
      </div>

      <div className="container px-4 mx-auto mt-8">
        <div className="flex flex-col items-center space-y-8">
          <URLInput
            url={url}
            setUrl={setUrl}
            onFetch={handleFetch}
            isLoading={isLoading}
          />

          {videoData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <VideoPreview metadata={videoData} isLoading={isLoading} />
                <div className="flex flex-col space-y-4">
                  <FormatSelector
                    selectedFormat={format}
                    setSelectedFormat={setFormat}
                    videoQuality={videoQuality}
                    setVideoQuality={setVideoQuality}
                    audioQuality={audioQuality}
                    setAudioQuality={setAudioQuality}
                  />
                  <ConversionProcess
                    isConverting={isConverting}
                    progress={progress}
                    onConvert={handleConvert}
                    format={format}
                    quality={format === 'mp4' ? videoQuality : audioQuality}
                    onDownload={handleDownload}
                    isReady={isReady}
                  />
                </div>
              </div>

              <Separator className="w-full max-w-2xl my-6" />
              
              <EducationalInfo />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
