
import React, { useState, useEffect } from 'react';
import { Music, Video, Download } from 'lucide-react';
import { checkBackendStatus } from '@/services/youtubeService';

const Header = () => {
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true);
      const status = await checkBackendStatus();
      setIsBackendOnline(status);
      setIsLoading(false);
    };

    checkStatus();
    // Set up polling for backend status every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full py-6 flex flex-col items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="bg-gradient p-2 rounded-lg">
          <Download className="h-6 w-6 text-white" />
        </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
          YouTube Converter
        </h1>
        <div className="bg-gradient p-2 rounded-lg">
          <Video className="h-6 w-6 text-white" />
        </div>
      </div>
      <p className="text-muted-foreground mt-2 text-center max-w-md">
        Convert YouTube links to MP3 and MP4 formats for direct client-side download
      </p>
      <div className="flex items-center gap-2 mt-3">
        <div className="px-2 py-1 bg-black/10 rounded text-xs">MP4: 720p, 1080p</div>
        <div className="px-2 py-1 bg-black/10 rounded text-xs">MP3: 64kbps - 320kbps</div>
      </div>
      <div className="mt-2 text-xs text-center text-muted-foreground">
        {isLoading ? (
          <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
            Checking Server Status...
          </span>
        ) : isBackendOnline ? (
          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full">
            Server Status: Online
          </span>
        ) : (
          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full">
            Server Status: Offline
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
