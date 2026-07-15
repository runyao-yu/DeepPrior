"use client";

import { useEffect, useRef } from "react";

export function CommitteeScroller({
  children,
  direction,
  speed = 30,
}: {
  children: React.ReactNode;
  direction: "down" | "up";
  speed?: number;
}) {
  const windowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const loopHeightRef = useRef(0);
  const manualScrollRef = useRef(false);
  const positionRef = useRef(0);
  const targetPositionRef = useRef(0);

  useEffect(() => {
    const scrollWindow = windowRef.current;
    const track = trackRef.current;

    if (!scrollWindow || !track) {
      return;
    }

    const firstStack = track.firstElementChild as HTMLElement | null;
    let initialized = false;
    let animationFrame = 0;
    let previousTime = window.performance.now();
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    function wrapPosition(position: number, loopHeight: number) {
      return ((position % loopHeight) + loopHeight) % loopHeight;
    }

    function measureLoop() {
      if (!firstStack || !scrollWindow) {
        return;
      }

      const previousHeight = loopHeightRef.current;
      const nextHeight = firstStack.offsetHeight;
      loopHeightRef.current = nextHeight;

      if (!initialized && nextHeight > 0) {
        positionRef.current = direction === "down" ? nextHeight : 0;
        targetPositionRef.current = positionRef.current;
        scrollWindow.scrollTop = positionRef.current;
        initialized = true;
      } else if (previousHeight > 0 && nextHeight > 0) {
        const previousPosition = positionRef.current;
        const targetOffset = targetPositionRef.current - previousPosition;
        const phase = wrapPosition(previousPosition, previousHeight) / previousHeight;
        positionRef.current = phase * nextHeight;
        targetPositionRef.current =
          positionRef.current + targetOffset * (nextHeight / previousHeight);
        scrollWindow.scrollTop = positionRef.current;
      }
    }

    function animate(currentTime: number) {
      if (!scrollWindow) {
        return;
      }

      const elapsed = Math.min(currentTime - previousTime, 100);
      previousTime = currentTime;
      const loopHeight = loopHeightRef.current;

      if (loopHeight > 0) {
        if (manualScrollRef.current) {
          const distanceToTarget =
            targetPositionRef.current - positionRef.current;
          const easing = 1 - Math.exp(-elapsed / 145);

          positionRef.current =
            Math.abs(distanceToTarget) < 0.05
              ? targetPositionRef.current
              : positionRef.current + distanceToTarget * easing;
        } else if (!motionPreference.matches) {
          const distance = speed * (elapsed / 1000);
          positionRef.current += direction === "up" ? distance : -distance;
          targetPositionRef.current = positionRef.current;
        }

        scrollWindow.scrollTop = wrapPosition(
          positionRef.current,
          loopHeight,
        );
      }

      animationFrame = window.requestAnimationFrame(animate);
    }

    function handleWheel(event: WheelEvent) {
      const loopHeight = loopHeightRef.current;

      if (!scrollWindow || loopHeight <= 0) {
        return;
      }

      event.preventDefault();

      if (!manualScrollRef.current) {
        targetPositionRef.current = positionRef.current;
      }
      manualScrollRef.current = true;

      const deltaUnit =
        event.deltaMode === 1
          ? 28
          : event.deltaMode === 2
            ? scrollWindow.clientHeight
            : 1;
      const rawDelta = event.deltaY * deltaUnit;
      const maximumDelta = scrollWindow.clientHeight * 0.8;
      const smoothDelta =
        Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), maximumDelta);

      targetPositionRef.current += smoothDelta;
    }

    measureLoop();
    const resizeObserver = new ResizeObserver(measureLoop);
    resizeObserver.observe(scrollWindow);
    if (firstStack) {
      resizeObserver.observe(firstStack);
    }
    scrollWindow.addEventListener("wheel", handleWheel, { passive: false });
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      scrollWindow.removeEventListener("wheel", handleWheel);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [direction, speed]);

  return (
    <div
      ref={windowRef}
      className="committee-column-window"
      onMouseLeave={() => {
        manualScrollRef.current = false;
        targetPositionRef.current = positionRef.current;
      }}
    >
      <div ref={trackRef} className="committee-column-track" aria-live="off">
        {children}
      </div>
    </div>
  );
}
