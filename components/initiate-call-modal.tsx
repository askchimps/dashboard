"use client";

import { Phone } from "lucide-react";

import InitiateCallForm from "@/components/form/initiate-call";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InitiateCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InitiateCallModal({
  isOpen,
  onClose,
}: InitiateCallModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Initiate Call</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your details to receive a call from our team
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div>
          <InitiateCallForm onSuccess={onClose} onCancel={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
