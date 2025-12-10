"use client";

import React, { useState } from "react";
import { X, Plus, Tag as TagIcon } from "lucide-react";
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

interface InlineChatTagsProps {
  chatId: string | number;
  orgSlug: string;
  currentTags: ChatTag[];
  availableTags: OrganisationTag[];
  onTagsUpdated: () => void;
}

export function InlineChatTags({
  chatId,
  orgSlug,
  currentTags,
  availableTags,
  onTagsUpdated,
}: InlineChatTagsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [addingTagIds, setAddingTagIds] = useState<Set<number>>(new Set());

  // Debug logging
  React.useEffect(() => {
    console.log('InlineChatTags - currentTags:', currentTags);
    console.log('InlineChatTags - availableTags:', availableTags);
  }, [currentTags, availableTags]);

  const currentTagIds = currentTags.map((tag) => tag.id);
  const availableTagsToAdd = availableTags.filter(
    (tag) => !currentTagIds.includes(tag.id) && !addingTagIds.has(tag.id)
  );

  const handleAddTag = async (tagId: number) => {
    // Add to loading set immediately
    setAddingTagIds((prev) => new Set(prev).add(tagId));
    setIsUpdating(true);
    try {
      await addChatTagsAction(chatId, orgSlug, [tagId]);
      await onTagsUpdated();
      // Remove from loading set after successful update
      setAddingTagIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tagId);
        return newSet;
      });
    } catch (error) {
      console.error("Error adding tag:", error);
      // Remove from loading set on error too
      setAddingTagIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tagId);
        return newSet;
      });
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
    <div className="flex items-center gap-2">
      {currentTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {currentTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="flex items-center gap-1 bg-purple-50 pr-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100"
            >
              <span>{tag.name}</span>
              <button
                onClick={() => handleRemoveTag(tag.id)}
                disabled={isUpdating}
                className="cursor-pointer rounded-sm p-0.5 transition-colors hover:bg-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Remove ${tag.name} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            disabled={isUpdating || availableTagsToAdd.length === 0}
          >
            <Plus className="h-3 w-3" />
            <TagIcon className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end">
          <div className="space-y-1">
            <div className="px-2 py-1.5">
              <p className="text-xs font-semibold text-muted-foreground">
                Add Tags
              </p>
            </div>
            {availableTagsToAdd.length === 0 ? (
              <div className="px-2 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                  All tags added
                </p>
              </div>
            ) : (
              <div className="max-h-64 space-y-0.5 overflow-y-auto">
                {availableTagsToAdd.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    disabled={isUpdating}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <TagIcon className="h-3 w-3 text-muted-foreground" />
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
  );
}
