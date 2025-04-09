
// This service connects to our Java backend
import { toast } from "sonner";

export interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
}

// Extracts the video ID from a YouTube URL
export const extractVideoId = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(`http://localhost:8081/api/extract-id?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error('Failed to extract video ID');
    }
    return await response.text();
  } catch (error) {
    console.error("Error extracting video ID:", error);
    return null;
  }
};

// Map to store conversion IDs
const conversionMap = new Map<string, string>();

// Function to fetch video info from backend
export const fetchVideoInfo = async (url: string): Promise<VideoData | null> => {
  try {
    // Make API call to our Java backend
    const response = await fetch(`http://localhost:8081/api/video-info?url=${encodeURIComponent(url)}`);
    console.log(response);
    console.log("biiiibiii")
    if (!response.ok) {
      toast('Failed to fetch video info');
      return null;
    }
    
    const data = await response.json();
    
    return {
      id: data.videoId,
      title: data.title,
      thumbnail: data.thumbnailUrl || `https://i.ytimg.com/vi/${data.videoId}/maxresdefault.jpg`,
      duration: data.duration,
      channel: data.channel || data.author
    };
  } catch (error) {
    console.error("Failed to fetch video info:", error);
    toast('Error fetching video info');
    return null;
  }
};

// Function to start conversion
export const startConversion = async (
  videoId: string,
  format: string,
  quality: string,
  title: string
): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8081/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId,
        format,
        quality,
        title
      }),
    });
    
    if (!response.ok) {
      toast('Failed to start conversion');
      return false;
    }
    
    const conversionId = await response.text();
    
    // Store the conversion ID for later use
    conversionMap.set(`${videoId}-${format}-${quality}`, conversionId);
    
    return true;
  } catch (error) {
    console.error("Error starting conversion:", error);
    toast('Error starting conversion');
    return false;
  }
};

// Function to check conversion progress
export const checkConversionProgress = async (
  videoId: string,
  format: string,
  quality: string
): Promise<number> => {
  try {
    const conversionId = conversionMap.get(`${videoId}-${format}-${quality}`);
    
    if (!conversionId) {
      console.error("No conversion ID found");
      return 0;
    }
    
    const response = await fetch(`http://localhost:8081/api/progress?conversionId=${conversionId}&videoId=${videoId}&format=${format}&quality=${quality}`);
    
    if (!response.ok) {
      console.error("Failed to check progress");
      return 0;
    }
    
    const data = await response.json();
    return data.progress;
  } catch (error) {
    console.error("Error checking progress:", error);
    return 0;
  }
};

// Set conversion to complete
export const completeConversion = (
  videoId: string,
  format: string,
  quality: string
): void => {
  // This is handled by the backend now
  console.log(`Conversion complete: ${videoId}-${format}-${quality}`);
};

// Generate a download URL
export const getDownloadUrl = async (
  videoId: string,
  format: string,
  quality: string
): Promise<string | null> => {
  try {
    const conversionId = conversionMap.get(`${videoId}-${format}-${quality}`);
    
    if (!conversionId) {
      console.error("No conversion ID found");
      return null;
    }
    
    const response = await fetch(`http://localhost:8081/api/progress?conversionId=${conversionId}&videoId=${videoId}&format=${format}&quality=${quality}`);
    
    if (!response.ok) {
      console.error("Failed to get download URL");
      return null;
    }
    
    const data = await response.json();
    
    if (data.completed && data.downloadUrl) {
      return `http://localhost:8081${data.downloadUrl}`;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting download URL:", error);
    return null;
  }
};

// Check if backend is online
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8081/api/status');
    return response.ok;
  } catch (error) {
    console.error("Backend status check failed:", error);
    return false;
  }
};
