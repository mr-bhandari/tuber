
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface URLInputProps {
  url: string;
  setUrl: (url: string) => void;
  onFetch: () => void;
  isLoading: boolean;
}

const URLInput = ({ url, setUrl, onFetch, isLoading }: URLInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast("Please enter a YouTube URL");
      return;
    }
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      toast("Please enter a valid YouTube URL");
      return;
    }
    
    onFetch();
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && (clipboardText.includes('youtube.com') || clipboardText.includes('youtu.be'))) {
        setUrl(clipboardText);
      } else if (clipboardText) {
        toast("Clipboard content is not a YouTube URL");
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      toast('Failed to read clipboard. Please paste manually.');
    }
  };

  // Example URLs for educational purposes
  const exampleUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/yPYZpwSpKmA',
    'https://www.youtube.com/watch?v=jNQXAC9IVRw'
  ];

  const useExampleUrl = () => {
    const randomUrl = exampleUrls[Math.floor(Math.random() * exampleUrls.length)];
    setUrl(randomUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex w-full items-center space-x-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10 flex-1"
            disabled={isLoading}
          />
          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button type="button" variant="outline" onClick={handlePaste} disabled={isLoading}>
          Paste
        </Button>
        <Button type="button" variant="outline" onClick={useExampleUrl} disabled={isLoading} title="Use an example URL">
          Example
        </Button>
        <Button type="submit" disabled={!url || isLoading}>
          {isLoading ? (
            <div className="flex items-center">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Fetching
            </div>
          ) : (
            <div className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Fetch
            </div>
          )}
        </Button>
      </div>
      <div className="mt-2 text-xs text-center text-muted-foreground">
        <p>Enter a YouTube URL to convert it to MP3 or MP4</p>
      </div>
    </form>
  );
};

export default URLInput;
