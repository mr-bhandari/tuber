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
    const response = await fetch(
      `https://hg2rfqhj.cdpad.io/api/extract-id?url=${encodeURIComponent(url)}`
    );
    if (!response.ok) {
      throw new Error("Failed to extract video ID");
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
export const fetchVideoInfo = async (
  url: string
): Promise<VideoData | null> => {
  try {
    // // Make API call to our Java backend
    // const response = await fetch(`https://hg2rfqhj.cdpad.io/api/video-info?url=${encodeURIComponent(url)}`);
    // Use an absolute URL with http://localhost:8081 for direct server access
    const apiUrl = `https://hg2rfqhj.cdpad.io/api/video-info?url=${encodeURIComponent(
      url
    )}`;
    console.log("Fetching video info from:", apiUrl);

    const response = await fetch(apiUrl);
    console.log(response);
    console.log("biiiibiii");
    if (!response.ok) {
      toast("Failed to fetch video info");
      return null;
    }

    const data = await response.json();

    return {
      id: data.videoId,
      title: data.title,
      thumbnail:
        data.thumbnailUrl ||
        `https://i.ytimg.com/vi/${data.videoId}/maxresdefault.jpg`,
      duration: data.duration,
      channel: data.channel || data.author,
    };
  } catch (error) {
    console.error("Failed to fetch video info:", error);
    toast("Error fetching video info");
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
    const response = await fetch("https://hg2rfqhj.cdpad.io/api/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId,
        format,
        quality,
        title,
      }),
    });

    if (!response.ok) {
      toast("Failed to start conversion");
      return false;
    }

    const conversionId = await response.text();

    // Store the conversion ID for later use
    conversionMap.set(`${videoId}-${format}-${quality}`, conversionId);
    console.log(
      `Starting conversion: ${videoId}-${format}-${quality} with ID: ${conversionId}`
    );

    return true;
  } catch (error) {
    console.error("Error starting conversion:", error);
    toast("Error starting conversion");
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

    const jobId = `${videoId}-${format}-${quality}`;
    console.log(
      `Checking progress for: ${jobId} with conversion ID: ${conversionId}`
    );

    const response = await fetch(
      `https://hg2rfqhj.cdpad.io/api/progress?conversionId=${conversionId}&videoId=${videoId}&format=${format}&quality=${quality}`
    );

    if (!response.ok) {
      console.error("Failed to check progress");
      return 0;
    }

    const data = await response.json();
    console.log(`Progress for ${jobId}: ${data.progress}%`);
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
    const jobId = `${videoId}-${format}-${quality}`;

    if (!conversionId) {
      // console.error("No conversion ID found");
      console.error("No conversion ID found for download");
      return null;
    }
    console.log(
      `Getting download URL for: ${jobId} with conversion ID: ${conversionId}`
    );

    const response = await fetch(
      `https://hg2rfqhj.cdpad.io/api/progress?conversionId=${conversionId}&videoId=${videoId}&format=${format}&quality=${quality}`
    );

    if (!response.ok) {
      console.error("Failed to get download URL");
      return null;
    }

    const data = await response.json();

    console.log(
      `Download status for ${jobId}: completed=${
        data.completed
      }, hasDownloadUrl=${!!data.downloadUrl}`
    );

    if (data.completed && data.downloadUrl) {
      // return `http://localhost:8081${data.downloadUrl}`;
      // Make sure the URL starts with http or https
      // let url = data.downloadUrl;
      // if (!url.startsWith("http://") && !url.startsWith("https://")) {
      //   url =
      //     "https://hg2rfqhj.cdpad.io" + (url.startsWith("/") ? "" : "/") + url;
      // }
      // // console.log("Download URL:", url);
      // // Add a timestamp parameter to prevent caching issues
      // url =
      //   url + (url.includes("?") ? "&" : "?") + "_t=" + new Date().getTime();

      // console.log("Download URL:", url);
      // return url;
      return data.downloadUrl;
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
    const response = await fetch("https://hg2rfqhj.cdpad.io/api/status");
    return response.ok;
  } catch (error) {
    console.error("Backend status check failed:", error);
    return false;
  }
};
