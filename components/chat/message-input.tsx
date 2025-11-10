/* eslint-disable import/order */
/* eslint-disable prefer-template */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useRef, useCallback } from "react";
import { Send, Paperclip, Mic, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/textfield";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { sendMessageWithFilesAction } from "@/lib/api/actions/chat/send-message";

export interface MessageAttachment {
  id?: number;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
}

export interface MessageData {
  content?: string;
  files?: File[];
  messageType: MessageType;
  attachments?: MessageAttachment[];
}

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'GIF';

interface MessageInputProps {
  chatId: string;
  onMessageSent?: () => void; // Callback after successful message send
  disabled?: boolean;
  placeholder?: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
}

export function MessageInput({
  chatId,
  onMessageSent,
  disabled = false,
  placeholder = "Type a message...",
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const determineMessageType = (content: string, files: File[]): MessageType => {
    if (files.length === 0) return 'TEXT';

    const file = files[0]; // Use first file to determine type
    if (file.type.startsWith('image/')) {
      return file.type === 'image/gif' ? 'GIF' : 'IMAGE';
    }
    if (file.type.startsWith('video/')) return 'VIDEO';
    if (file.type.startsWith('audio/')) return 'AUDIO';
    return 'FILE';
  };

  const validateFile = (file: File): boolean => {
    if (file.size > maxFileSize) {
      toast.error(`File "${file.name}" is too large. Maximum size is ${formatFileSize(maxFileSize)}`);
      return false;
    }

    const allowedTypes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Videos  
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm',
      // Documents
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(`File type "${file.type}" is not supported`);
      return false;
    }

    return true;
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter(validateFile);

    if (attachedFiles.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setAttachedFiles(prev => [...prev, ...validFiles]);

    // Reset input
    event.target.value = '';
  }, [attachedFiles.length, maxFiles]);

  const removeFile = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        setAttachedFiles(prev => [...prev, audioFile]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Could not access microphone');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [content, attachedFiles]);

  const handleSend = useCallback(async () => {
    if ((!content.trim() && attachedFiles.length === 0) || isSending) return;

    setIsSending(true);

    try {
      const result = await sendMessageWithFilesAction(
        chatId,
        content.trim(),
        attachedFiles
      );

      if (!result.success) {
        throw new Error(result.message || 'Failed to send message');
      }

      // Reset state on success
      setContent('');
      setAttachedFiles([]);

      // Call callback if provided
      if (onMessageSent) {
        onMessageSent();
      }

      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [content, attachedFiles, chatId, onMessageSent, isSending]);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="border-t bg-white p-4 pb-1">
      {/* File attachments preview */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2 text-sm"
            >
              <span className="truncate max-w-[200px]">{file.name}</span>
              <span className="text-gray-500 text-xs">({formatFileSize(file.size)})</span>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative items-center flex">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "resize-none pr-24 min-h-[44px] max-h-36 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
              "focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            rows={1}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
          />

          {/* Inline actions */}
          <div className="absolute right-2 flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isSending}
              className="h-8 w-8 p-0"
              title="Attach files"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled || isSending}
              className={cn(
                "h-8 w-8 p-0",
                isRecording && "text-red-500 bg-red-50"
              )}
              title={isRecording ? "Stop recording" : "Record voice message"}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={(!content.trim() && attachedFiles.length === 0) || disabled || isSending}
          size="sm"
          className="h-11"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}