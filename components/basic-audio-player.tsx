"use client";

import { useRef, useEffect } from "react";

import { useAudio } from "@/components/provider/audio-provider";

interface BasicAudioPlayerProps {
  src: string;
  callId: number;
}

export function BasicAudioPlayer({ src, callId }: BasicAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentAudioRef, stopCurrentAudio } = useAudio();

  useEffect(() => {
    const handlePlay = () => {
      // Stop any currently playing audio
      if (
        currentAudioRef.current &&
        currentAudioRef.current !== audioRef.current
      ) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }

      // Set this audio as the current one
      currentAudioRef.current = audioRef.current;
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener("play", handlePlay);

      return () => {
        audioElement.removeEventListener("play", handlePlay);
      };
    }
  }, [currentAudioRef]);

  return (
    <div className="w-full min-w-0">
      <audio
        ref={audioRef}
        controls
        className="border-border bg-background h-10 w-full min-w-[250px] rounded-md border"
        key={`call-${callId}`}
      >
        <source src={src} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
