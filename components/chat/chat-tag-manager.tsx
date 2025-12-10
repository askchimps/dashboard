"use client";

import React, { useState } from "react";
import { X, Plus, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addChatTagsAction, removeChatTagsAction } from "@/lib/api/actions/chat/manage-chat-tags";
import type { OrganisationTag } from "@/lib/api/actions/organisation/get-organisation-tags";
import type { ChatTag } from "@/lib/api/actions/chat/get-chats";

interface ChatTagManagerProps {
  chatId: string | number;
  orgSlug: string;
  currentTags: ChatTag[];
  availableTags: OrganisationTag[];
  onTagsUpdated: () => void;
}

export function ChatTagManager({
  chatId,
  orgSlug,
  currentTags,
  availableTags,
  onTagsUpdated,
}: ChatTagManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentTagIds = currentTags.map((tag) => tag.id);
  const availableTagsToAdd = availableTags.filter(
    (tag) => !currentTagIds.includes(tag.id)
  );

  const handleAddTag = async (tagId: number) => {
    setIsUpdating(true);
    try {
      await addChatTagsAction(chatId, orgSlug, [tagId]);
      onTagsUpdated();
      if (availableTagsToAdd.length === 1) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    setIsUpdating(true);
    try {
      await removeChatTagsAction(chatId, orgSlug, [tagId]);
      onTagsUpdated();
    } catch (error) {
      console.error("Error removing tag:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Tags</h4>
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={isUpdating || availableTagsToAdd.length === 0}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <div className="space-y-1">
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold text-muted-foreground">
                  Available Tags
                </p>
              </div>
              {availableTagsToAdd.length === 0 ? (
                <div className="px-2 py-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    All tags have been added
                  </p>
                </div>
              ) : (
                <div className="max-h-64 space-y-0.5 overflow-y-auto">
                  {availableTagsToAdd.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddTag(tag.id)}
                      disabled={isUpdating}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="flex-1 text-xs font-medium">
                        {tag.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {currentTags.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No tags added yet. Click &quot;Add Tag&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {currentTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="group flex items-center gap-1.5 bg-purple-50 pr-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100"
            >
              <span>{tag.name}</span>
              <button
                onClick={() => handleRemoveTag(tag.id)}
                disabled={isUpdating}
                className="rounded-sm p-0.5 transition-colors hover:bg-purple-200 disabled:opacity-50"
                aria-label={`Remove ${tag.name} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
