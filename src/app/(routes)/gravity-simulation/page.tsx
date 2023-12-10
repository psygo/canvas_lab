"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CanvasProps,
  setupGridWidthHeightAndScale,
} from "@components/utils/canvas_utils";

type Position = {
  x: number;
  y: number;
};
type Delta = Position;

export default function GravitySimulation({
  width,
  height,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number>();

  const [currentPos, setCurrentPos] = useState<Position>({
    x: 0,
    y: 0,
  });

  const sphereRadius = 10;

  const tick = useCallback(
    (delta: Delta = { x: 0.1, y: 0 }) => {
      setCurrentPos((p) => ({ x: p.x + delta.x, y: p.y }));

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.arc(
        currentPos.x,
        currentPos.y,
        sphereRadius,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "orange";
      ctx.fill();

      const nextDelta = { x: 0, y: 0 };
      if (currentPos.x > canvas.width - 2 * sphereRadius) {
        nextDelta.x = -0.1;
      } else {
        nextDelta.x = 0.1;
      }
      if (currentPos.y > canvas.height - 2 * sphereRadius) {
        nextDelta.y = -0.1;
      } else {
        nextDelta.y = 0.1;
      }

      requestIdRef.current = requestAnimationFrame(() =>
        tick(nextDelta)
      );
    },
    [currentPos]
  );

  useEffect(() => {
    const canvas = canvasRef.current!;
    setupGridWidthHeightAndScale(400, 400, canvas);

    requestIdRef.current = requestAnimationFrame(() =>
      tick()
    );

    return () =>
      cancelAnimationFrame(requestIdRef.current!);
  }, [height, width, tick]);

  return (
    <main>
      <canvas ref={canvasRef}></canvas>
    </main>
  );
}
