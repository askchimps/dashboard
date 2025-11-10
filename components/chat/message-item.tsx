/* eslint-disable import/order */
"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AttachmentRenderer, type MessageAttachment } from "./attachment-renderer";
import { cn } from "@/lib/utils";

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'GIF';

// Use the same interface as the backend
export interface EnhancedMessage {
  id: number;
  role: 'user' | 'assistant' | 'bot';
  content?: string;
  message_type?: MessageType;
  attachments?: MessageAttachment[];
  created_at: string;
  updated_at?: string;
  agent?: {
    id: number;
    name: string;
  };
}

interface MessageItemProps {
  message: EnhancedMessage;
  className?: string;
}

export function MessageItem({ message, className }: MessageItemProps) {
  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const isUser = message.role === 'user';
  const isBot = message.role === 'assistant' || message.role === 'bot';

  return (
    <div className={cn(
      "flex gap-4",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      {/* Avatar for non-user messages */}
      {isBot && (
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-green-100 text-sm font-medium text-green-700">
            AI
          </AvatarFallback>
        </Avatar>
      )}

      <div className="max-w-[80%] space-y-2">
        {/* Message bubble */}
        <div
          className={cn(
            "rounded-xl px-5 py-4 shadow-sm",
            isUser
              ? "bg-green-600 text-white"
              : "border border-gray-100 bg-gray-50 text-gray-900"
          )}
        >
          {/* Text content */}
          {message.content && (
            <div className="break-words whitespace-pre-wrap font-medium leading-relaxed mb-3">
              {message.content}
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              {message.attachments.map((attachment, index) => (
                <AttachmentRenderer
                  key={attachment.id || index}
                  attachment={attachment}
                  messageId={message.id}
                  className={cn(
                    isUser && "border-white/20"
                  )}
                />
              ))}
            </div>
          )}

          {/* Message metadata */}
          <div className={cn(
            "mt-2.5 text-xs font-medium opacity-70",
            isUser ? "text-white/80" : "text-gray-500"
          )}>
            {formatTimeAgo(message.created_at)}
            {/* {message.agent && (
              <span className="ml-2">• {message.agent.name}</span>
            )} */}
          </div>
        </div>
      </div>

      {/* Avatar for user messages */}
      {isUser && (
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-blue-100 font-medium text-blue-700">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}