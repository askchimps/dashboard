'use client';

import { Pause, Play, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CallDetail } from '@/lib/types';
import { formatDuration } from './format';

interface Props {
  call: CallDetail;
}

export function TranscriptTab({ call }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const duration = call.durationSec && call.durationSec > 0 ? call.durationSec : 0;
  const hasRecording = !!call.recordingUrl;

  useEffect(() => {
    setPlaying(false);
    setPos(0);
  }, [call.id]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a || !hasRecording) {
      // No real audio — just simulate position so the seekbar reacts.
      setPlaying((p) => !p);
      return;
    }
    if (a.paused) {
      void a.play();
    } else {
      a.pause();
    }
  };

  // Simulated tick when there's no real audio source.
  useEffect(() => {
    if (!playing || hasRecording) return;
    const id = setInterval(() => {
      setPos((p) => {
        if (duration <= 0) return 0;
        const next = p + 1;
        if (next >= duration) {
          setPlaying(false);
          return duration;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, hasRecording, duration]);

  const pct = duration > 0 ? Math.min(100, (pos / duration) * 100) : 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-gray-200 px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            aria-pressed={playing}
            disabled={duration <= 0}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {playing ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4 translate-x-[1px]" aria-hidden="true" />
            )}
          </button>
          <div className="flex flex-1 items-center gap-2">
            <span className="font-mono text-xs tabular-nums text-gray-700">
              {formatDuration(pos)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={1}
              value={pos}
              disabled={duration <= 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPos(v);
                if (audioRef.current && hasRecording) {
                  audioRef.current.currentTime = v;
                }
              }}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-gray-900 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #111827 ${pct}%, #e5e7eb ${pct}%)`,
              }}
              aria-label="Seek"
            />
            <span className="font-mono text-xs tabular-nums text-gray-500">
              {formatDuration(duration)}
            </span>
          </div>
          <Volume2 className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
        {hasRecording ? (
          <audio
            ref={audioRef}
            src={call.recordingUrl ?? undefined}
            onTimeUpdate={(e) =>
              setPos(Math.floor(e.currentTarget.currentTime))
            }
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
        ) : (
          <p className="mt-2 text-[10px] uppercase tracking-wide text-gray-400">
            Recording not stored yet — seekbar is a preview.
          </p>
        )}
      </div>
      <div className="flex-1 overflow-auto px-5 py-4">
        {call.transcript && call.transcript.length > 0 ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-gray-800">
            {call.transcript}
          </pre>
        ) : (
          <p className="text-sm italic text-gray-400">
            No transcript captured for this attempt.
          </p>
        )}
      </div>
    </div>
  );
}
