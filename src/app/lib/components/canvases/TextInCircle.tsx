"use client";

import React, { useEffect, useRef, useState } from "react";

import {
  TwoPI,
  setupGridWidthHeightAndScale,
} from "./canvas_utils";

type CanvasProps = {
  width: number;
  height: number;
};

export function TextInCircle({
  width,
  height,
}: CanvasProps) {
  const [text, setText] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  function getContext() {
    const canvas = canvasRef.current!;
    return canvas.getContext("2d")!;
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    setupGridWidthHeightAndScale(width, height, canvas);

    const ctx = getContext();

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // Circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 100, 0, TwoPI);

    // Fill the Circle
    ctx.fillStyle = "white";
    ctx.fill();
  }, [width, height]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const newText = e.target.value;
    setText(newText);

    // Split Words
    const words = text.split(/\s+/g); // To hyphenate: /\s+|(?<=-)/
    if (!words[words.length - 1]) words.pop();
    if (!words[0]) words.shift();

    const lineHeight = 12;
    const targetWidth = Math.sqrt(
      measureWidth(text.trim()) * lineHeight
    );
  }

  function measureWidth(s: string) {
    const ctx = getContext();
    return ctx.measureText(s).width;
  }

  function splitLines() {}

  return (
    <>
      <input type="text" onChange={handleChange} />

      <canvas ref={canvasRef}></canvas>
    </>
  );
}
