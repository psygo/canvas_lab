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
  const defaultDelta = 0.5;

  const [delta, setDelta] = useState<Delta>({
    x: defaultDelta,
    y: 0,
  });

  const tick = useCallback(() => {
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

    if (currentPos.x > 300 - 2 * sphereRadius) {
      setDelta((d) => ({ ...d, x: -defaultDelta }));
    } else if (currentPos.x < 0) {
      setDelta((d) => ({ ...d, x: defaultDelta }));
    }

    requestIdRef.current = requestAnimationFrame(tick);
  }, [currentPos, delta.x]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    setupGridWidthHeightAndScale(400, 400, canvas);

    requestIdRef.current = requestAnimationFrame(tick);

    return () =>
      cancelAnimationFrame(requestIdRef.current!);
  }, [height, width, tick]);

  return (
    <main>
      <canvas ref={canvasRef}></canvas>
    </main>
  );
}
