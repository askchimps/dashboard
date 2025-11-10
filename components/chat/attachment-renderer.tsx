/* eslint-disable import/order */
/* eslint-disable prefer-template */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Download, 
  FileText, 
  File, 
  PlayCircle, 
  PauseCircle, 
  Volume2,
  Maximize2,
  Eye 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MessageAttachment {
  id: number;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
}

interface AttachmentRendererProps {
  attachment: MessageAttachment;
  messageId: number;
  className?: string;
}

export function AttachmentRenderer({ attachment, messageId, className }: AttachmentRendererProps) {
  const getAttachmentType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const type = getAttachmentType(attachment.file_type);

  switch (type) {
    case 'image':
      return <ImageAttachment attachment={attachment} className={className} />;
    case 'video':
      return <VideoAttachment attachment={attachment} className={className} />;
    case 'audio':
      return <AudioAttachment attachment={attachment} className={className} />;
    case 'document':
      return <DocumentAttachment attachment={attachment} className={className} />;
    default:
      return <GenericFileAttachment attachment={attachment} className={className} />;
  }
}

interface AttachmentProps {
  attachment: MessageAttachment;
  className?: string;
}

function ImageAttachment({ attachment, className }: AttachmentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (imageError) {
    return <GenericFileAttachment attachment={attachment} className={className} />;
  }

  return (
    <>
      <div className={cn("relative max-w-sm rounded-lg overflow-hidden bg-gray-100", className)}>
        <Image
          src={attachment.file_url}
          alt={attachment.file_name}
          width={attachment.width || 300}
          height={attachment.height || 200}
          className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
          loading="lazy"
          onClick={() => setIsModalOpen(true)}
          onError={() => setImageError(true)}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>

        {/* File info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
          <div className="text-white text-xs font-medium truncate">
            {attachment.file_name}
          </div>
          <div className="text-white/80 text-xs">
            {formatFileSize(attachment.file_size)}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={attachment.file_url}
              alt={attachment.file_name}
              width={attachment.width || 800}
              height={attachment.height || 600}
              className="object-contain max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function VideoAttachment({ attachment, className }: AttachmentProps) {
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn("relative max-w-md rounded-lg overflow-hidden bg-gray-100", className)}>
      <video
        controls
        poster={attachment.thumbnail_url}
        className="w-full h-auto"
        preload="metadata"
      >
        <source src={attachment.file_url} type={attachment.file_type} />
        Your browser does not support the video tag.
      </video>
      
      {/* Video metadata */}
      <div className="p-2 bg-gray-50 border-t">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium truncate flex-1">{attachment.file_name}</span>
          <div className="flex items-center gap-2 text-gray-500 text-xs ml-2">
            {attachment.duration && (
              <span>{formatDuration(attachment.duration)}</span>
            )}
            <span>•</span>
            <span>{formatFileSize(attachment.file_size)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AudioAttachment({ attachment, className }: AttachmentProps) {
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-gray-50 rounded-lg min-w-96", className)}>
      {/* <div className="text-blue-600">
        <Volume2 className="h-5 w-5" />
      </div> */}
      
      <div className="flex-1 w-36">
        <div className="font-medium text-sm truncate">{attachment.file_name}</div>
        <audio controls className="w-full mt-2">
          <source src={attachment.file_url} type={attachment.file_type} />
          Your browser does not support the audio element.
        </audio>
        {/* <div className="flex justify-between text-xs text-gray-500 mt-1">
          {attachment.duration && <span>{formatDuration(attachment.duration)}</span>}
          <span>{formatFileSize(attachment.file_size)}</span>
        </div> */}
      </div>
    </div>
  );
}

function DocumentAttachment({ attachment, className }: AttachmentProps) {
  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    if (mimeType.includes('word')) return <FileText className="h-8 w-8 text-blue-500" />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileText className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = () => {
    window.open(attachment.file_url, '_blank');
  };

  return (
    <div className={cn("flex items-center gap-3 p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors", className)}>
      <div className="flex-shrink-0">
        {getFileIcon(attachment.file_type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{attachment.file_name}</div>
        <div className="text-xs text-gray-500">
          {formatFileSize(attachment.file_size)} • {attachment.file_type}
        </div>
      </div>
      
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={handleView} title="View file">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDownload} title="Download file">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function GenericFileAttachment({ attachment, className }: AttachmentProps) {
  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("flex items-center gap-3 p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors", className)}>
      <div className="flex-shrink-0">
        <File className="h-8 w-8 text-gray-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{attachment.file_name}</div>
        <div className="text-xs text-gray-500">
          {formatFileSize(attachment.file_size)} • {attachment.file_type}
        </div>
      </div>
      
      <Button variant="ghost" size="sm" onClick={handleDownload} title="Download file">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}