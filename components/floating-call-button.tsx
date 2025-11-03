"use client";

import { Phone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import InitiateCallModal from "./initiate-call-modal";

interface FloatingCallButtonProps {
  className?: string;
}

export default function FloatingCallButton({
  className,
}: FloatingCallButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Call Button */}
      <div
        className={cn(
          "fixed right-6 bottom-6 z-50",
          "transition-all duration-300 ease-in-out",
          "hover:scale-110 hover:shadow-2xl",
          className
        )}
      >
        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className={cn(
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "h-14 w-14 rounded-full shadow-lg",
            "ring-offset-background focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
            "transition-all duration-200",
            "group"
          )}
          aria-label="Initiate Call"
        >
          <Phone className="h-6 w-6 transition-transform group-hover:scale-110" />
        </Button>
      </div>

      {/* Call Initiation Modal */}
      <InitiateCallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
