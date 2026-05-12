"use client";

import { assetPath } from "@/lib/asset-path";
import { heroVideo } from "@/lib/content";
import { useEffect, useRef } from "react";

type HeroBackgroundVideoProps = {
  onLoadProgress?: (progress: number) => void;
  onReady?: () => void;
  shouldPlay?: boolean;
};

function inferredVideoType(src: string) {
  if (src.endsWith(".webm")) {
    return "video/webm";
  }

  if (src.endsWith(".ogg") || src.endsWith(".ogv")) {
    return "video/ogg";
  }

  return heroVideo.type;
}

export function HeroBackgroundVideo({
  onLoadProgress,
  onReady,
  shouldPlay = true,
}: HeroBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const replayTimerRef = useRef<number | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    return () => {
      if (replayTimerRef.current !== null) {
        window.clearTimeout(replayTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (shouldPlay) {
      video.currentTime = 0;
      void video.play();
      return;
    }

    video.pause();
  }, [shouldPlay]);

  if (!heroVideo.src) {
    return null;
  }

  const videoSrc = assetPath(heroVideo.src);
  const posterSrc = heroVideo.poster ? assetPath(heroVideo.poster) : undefined;

  function reportProgress(fallbackProgress = 0) {
    const video = videoRef.current;

    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      onLoadProgress?.(fallbackProgress);
      return fallbackProgress;
    }

    let bufferedEnd = 0;

    for (let index = 0; index < video.buffered.length; index += 1) {
      bufferedEnd = Math.max(bufferedEnd, video.buffered.end(index));
    }

    const progress = Math.max(
      fallbackProgress,
      Math.min(99, Math.round((bufferedEnd / video.duration) * 100)),
    );
    onLoadProgress?.(progress);
    return progress;
  }

  function markReady() {
    if (readyRef.current) {
      return;
    }

    readyRef.current = true;
    onLoadProgress?.(100);
    onReady?.();
  }

  function handleProgress() {
    const progress = reportProgress(20);

    if (progress >= 98) {
      markReady();
    }
  }

  function handleEnded() {
    if (replayTimerRef.current !== null) {
      window.clearTimeout(replayTimerRef.current);
    }

    replayTimerRef.current = window.setTimeout(() => {
      const video = videoRef.current;

      if (!video) {
        return;
      }

      video.currentTime = 0;
      void video.play();
      replayTimerRef.current = null;
    }, 2000);
  }

  return (
    <video
      ref={videoRef}
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      muted
      onCanPlayThrough={markReady}
      onEnded={handleEnded}
      onError={markReady}
      onLoadedData={() => {
        reportProgress(45);

        const video = videoRef.current;

        if (video?.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
          markReady();
        }
      }}
      onLoadedMetadata={() => reportProgress(12)}
      onLoadStart={() => onLoadProgress?.(6)}
      onProgress={handleProgress}
      playsInline
      preload="auto"
      poster={posterSrc}
      aria-hidden="true"
      style={{
        objectFit: heroVideo.fit,
        objectPosition: heroVideo.position,
        opacity: heroVideo.opacity,
        filter: "grayscale(1) contrast(0.92) brightness(1.08)",
      }}
    >
      <source src={videoSrc} type={inferredVideoType(heroVideo.src)} />
    </video>
  );
}
