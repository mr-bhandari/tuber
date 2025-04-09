
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

const JavaCodeExample = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    setTimeout(() => setCopied(null), 2000);
  };

  const extractorCode = `package com.example.youtubeconverter.service;

import com.github.kiulian.downloader.YoutubeDownloader;
import com.github.kiulian.downloader.downloader.request.RequestVideoInfo;
import com.github.kiulian.downloader.downloader.response.Response;
import com.github.kiulian.downloader.model.videos.VideoInfo;
import org.springframework.stereotype.Service;

@Service
public class YoutubeExtractorService {
    private final YoutubeDownloader downloader;

    public YoutubeExtractorService() {
        this.downloader = new YoutubeDownloader();
    }

    /**
     * Extract video information from YouTube video ID
     * @param videoId The YouTube video ID
     * @return VideoInfo object containing metadata
     */
    public VideoInfo extractVideoInfo(String videoId) {
        RequestVideoInfo request = new RequestVideoInfo(videoId);
        Response<VideoInfo> response = downloader.getVideoInfo(request);
        
        if (response.data() != null) {
            return response.data();
        } else {
            throw new RuntimeException("Failed to extract video info: " + response.error().message());
        }
    }
}`;

  const converterCode = `package com.example.youtubeconverter.service;

import com.github.kiulian.downloader.YoutubeDownloader;
import com.github.kiulian.downloader.downloader.request.RequestVideoFileDownload;
import com.github.kiulian.downloader.downloader.response.Response;
import com.github.kiulian.downloader.model.videos.VideoInfo;
import com.github.kiulian.downloader.model.videos.formats.Format;
import com.github.kiulian.downloader.model.videos.formats.VideoFormat;
import com.github.kiulian.downloader.model.videos.formats.AudioFormat;
import org.springframework.stereotype.Service;
import ws.schild.jave.Encoder;
import ws.schild.jave.MultimediaObject;
import ws.schild.jave.encode.AudioAttributes;
import ws.schild.jave.encode.EncodingAttributes;

import java.io.File;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ConversionService {
    private final YoutubeDownloader downloader;
    private final ConcurrentHashMap<String, AtomicInteger> progressMap = new ConcurrentHashMap<>();
    
    public ConversionService() {
        this.downloader = new YoutubeDownloader();
    }
    
    /**
     * Convert YouTube video to MP4 format
     * @param videoId The YouTube video ID
     * @param quality The desired quality (720p or 1080p)
     * @return File object pointing to the converted file
     */
    public File convertToMp4(String videoId, String quality) throws Exception {
        VideoInfo videoInfo = getVideoInfo(videoId);
        
        // Track progress for this conversion
        String jobId = videoId + "-mp4-" + quality;
        progressMap.put(jobId, new AtomicInteger(0));
        
        // Find appropriate format based on quality
        List<VideoFormat> videoFormats = videoInfo.videoFormats();
        VideoFormat selectedFormat = videoFormats.stream()
            .filter(format -> {
                if ("720p".equals(quality) && format.height() == 720) return true;
                if ("1080p".equals(quality) && format.height() == 1080) return true;
                return false;
            })
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No format found for quality: " + quality));
        
        // Download the video
        RequestVideoFileDownload request = new RequestVideoFileDownload(selectedFormat)
            .saveTo(new File("./downloads"))
            .renameTo("video-" + videoId)
            .callback(progress -> {
                progressMap.get(jobId).set((int) progress);
            });
            
        Response<File> response = downloader.downloadVideoFile(request);
        
        if (response.data() != null) {
            // Mark as complete
            progressMap.get(jobId).set(100);
            return response.data();
        } else {
            throw new RuntimeException("Failed to download: " + response.error().message());
        }
    }
    
    /**
     * Convert YouTube video to MP3 format
     * @param videoId The YouTube video ID
     * @param bitrate The desired bitrate (64kbps, 128kbps, 192kbps, 256kbps, 320kbps)
     * @return File object pointing to the converted file
     */
    public File convertToMp3(String videoId, String bitrate) throws Exception {
        VideoInfo videoInfo = getVideoInfo(videoId);
        
        // Track progress for this conversion
        String jobId = videoId + "-mp3-" + bitrate;
        progressMap.put(jobId, new AtomicInteger(0));
        
        // First download the audio format
        List<AudioFormat> audioFormats = videoInfo.audioFormats();
        AudioFormat bestAudioFormat = audioFormats.get(0); // Best quality audio
        
        // Download the audio
        RequestVideoFileDownload request = new RequestVideoFileDownload(bestAudioFormat)
            .saveTo(new File("./downloads"))
            .renameTo("audio-" + videoId)
            .callback(progress -> {
                // Up to 60% is download progress
                progressMap.get(jobId).set((int) (progress * 0.6));
            });
            
        Response<File> response = downloader.downloadVideoFile(request);
        
        if (response.data() != null) {
            // Now convert to MP3 with specific bitrate
            File sourceFile = response.data();
            File targetFile = new File("./downloads/converted-" + videoId + ".mp3");
            
            // Parse bitrate (remove "kbps")
            int bitrateValue = Integer.parseInt(bitrate.replaceAll("kbps", ""));
            
            // Set audio attributes
            AudioAttributes audio = new AudioAttributes();
            audio.setCodec("libmp3lame");
            audio.setBitRate(bitrateValue * 1000);
            audio.setChannels(2);
            audio.setSamplingRate(44100);
            
            // Set encoding attributes
            EncodingAttributes attrs = new EncodingAttributes();
            attrs.setOutputFormat("mp3");
            attrs.setAudioAttributes(audio);
            
            // Encode
            Encoder encoder = new Encoder();
            encoder.encode(new MultimediaObject(sourceFile), targetFile, attrs, (info) -> {
                // Remaining 40% is conversion progress
                int conversionProgress = (int) (info.getProgress() * 0.4);
                progressMap.get(jobId).set(60 + conversionProgress);
            });
            
            // Mark as complete
            progressMap.get(jobId).set(100);
            
            // Delete original audio file
            sourceFile.delete();
            
            return targetFile;
        } else {
            throw new RuntimeException("Failed to download: " + response.error().message());
        }
    }
    
    /**
     * Get conversion progress
     * @param jobId The job identifier
     * @return Integer representing progress percentage (0-100)
     */
    public int getProgress(String jobId) {
        AtomicInteger progress = progressMap.get(jobId);
        return progress != null ? progress.get() : 0;
    }
    
    private VideoInfo getVideoInfo(String videoId) {
        RequestVideoInfo request = new RequestVideoInfo(videoId);
        Response<VideoInfo> response = downloader.getVideoInfo(request);
        
        if (response.data() != null) {
            return response.data();
        } else {
            throw new RuntimeException("Failed to extract video info: " + response.error().message());
        }
    }
}`;

  const controllerCode = `package com.example.youtubeconverter.controller;

import com.example.youtubeconverter.model.ConversionRequest;
import com.example.youtubeconverter.model.VideoMetadata;
import com.example.youtubeconverter.service.ConversionService;
import com.example.youtubeconverter.service.YoutubeExtractorService;
import com.github.kiulian.downloader.model.videos.VideoInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/converter")
@CrossOrigin(origins = "*")  // For educational purposes only
public class ConverterController {

    private final YoutubeExtractorService extractorService;
    private final ConversionService conversionService;
    private final ConcurrentHashMap<String, File> convertedFiles = new ConcurrentHashMap<>();

    @Autowired
    public ConverterController(YoutubeExtractorService extractorService, 
                              ConversionService conversionService) {
        this.extractorService = extractorService;
        this.conversionService = conversionService;
    }

    @GetMapping("/info")
    public ResponseEntity<VideoMetadata> getVideoInfo(@RequestParam String videoId) {
        try {
            VideoInfo info = extractorService.extractVideoInfo(videoId);
            
            VideoMetadata metadata = new VideoMetadata();
            metadata.setVideoId(videoId);
            metadata.setTitle(info.details().title());
            metadata.setAuthor(info.details().author());
            metadata.setLengthSeconds(info.details().lengthSeconds());
            metadata.setThumbnailUrl(info.details().thumbnails().get(0).url());
            
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/convert")
    public ResponseEntity<String> startConversion(@RequestBody ConversionRequest request) {
        try {
            // Generate conversion ID
            String conversionId = UUID.randomUUID().toString();
            
            // Start conversion in a separate thread
            new Thread(() -> {
                try {
                    File convertedFile;
                    
                    if ("mp4".equals(request.getFormat())) {
                        convertedFile = conversionService.convertToMp4(
                            request.getVideoId(), 
                            request.getQuality()
                        );
                    } else {
                        convertedFile = conversionService.convertToMp3(
                            request.getVideoId(), 
                            request.getQuality()
                        );
                    }
                    
                    // Store converted file for later download
                    convertedFiles.put(conversionId, convertedFile);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();
            
            return ResponseEntity.ok(conversionId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/progress/{conversionId}")
    public ResponseEntity<Integer> getProgress(
            @PathVariable String conversionId,
            @RequestParam String videoId,
            @RequestParam String format,
            @RequestParam String quality) {
        
        try {
            String jobId = videoId + "-" + format + "-" + quality;
            int progress = conversionService.getProgress(jobId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/download/{conversionId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String conversionId) {
        try {
            File file = convertedFiles.get(conversionId);
            
            if (file != null && file.exists()) {
                Resource resource = new FileSystemResource(file);
                
                String contentType;
                String filename;
                
                if (file.getName().endsWith(".mp3")) {
                    contentType = "audio/mpeg";
                    filename = "audio.mp3";
                } else {
                    contentType = "video/mp4";
                    filename = "video.mp4";
                }
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment; filename=\"" + filename + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}`;

  return (
    <Card className="w-full max-w-2xl border-2">
      <CardHeader>
        <CardTitle>Java Backend Implementation (Educational)</CardTitle>
        <CardDescription>
          Example Java code for understanding the backend processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="extractor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="extractor">Extractor Service</TabsTrigger>
            <TabsTrigger value="converter">Converter Service</TabsTrigger>
            <TabsTrigger value="controller">REST Controller</TabsTrigger>
          </TabsList>
          <TabsContent value="extractor" className="mt-4">
            <div className="relative">
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-xs">
                <code>{extractorCode}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(extractorCode, 'extractor')}
              >
                {copied === 'extractor' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="converter" className="mt-4">
            <div className="relative">
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-xs">
                <code>{converterCode}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(converterCode, 'converter')}
              >
                {copied === 'converter' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="controller" className="mt-4">
            <div className="relative">
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-xs">
                <code>{controllerCode}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(controllerCode, 'controller')}
              >
                {copied === 'controller' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JavaCodeExample;
