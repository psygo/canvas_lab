"use client";

import React, { useEffect, useRef, useState } from "react";

import {
  TwoPI,
  setupGridWidthHeightAndScale,
} from "../utils/canvas_utils";

type CanvasProps = {
  width: number;
  height: number;
};
/**
 * From [Mike Bostock's Tutorial](https://observablehq.com/@mbostock/fit-text-to-circle).
 *
 * Related to [Issue #433 on React Force Graph](https://github.com/vasturiano/react-force-graph/issues/433#issuecomment-1810210106).
 */
export function TextInCircle({
  width,
  height,
}: CanvasProps) {
  const [typedText, setTypedText] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  function getContext() {
    const canvas = canvasRef.current!;
    return canvas.getContext("2d")!;
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    setupGridWidthHeightAndScale(width, height, canvas);

    // const ctx = getContext();

    // // Background
    // ctx.fillStyle = "black";
    // ctx.fillRect(0, 0, width, height);

    // // Circle
    // ctx.beginPath();
    // ctx.arc(width / 2, height / 2, 100, 0, TwoPI);
    // ctx.closePath();

    // // Fill the Circle
    // ctx.fillStyle = "white";
    // ctx.fill();
  }, [width, height]);

  const textHeight = 15;
  const lineHeight = textHeight + 5;
  const cx = 150;
  const cy = 150;
  const r = 100;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const ctx = getContext();

    const text = e.target.value; // This gives out an error
    // "'Twas the night before Christmas, when all through the house,  Not a creature was stirring, not even a mouse.  And so begins the story of the day of";

    const lines = initLines();
    wrapText(text, lines);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.strokeStyle = "skyblue";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // pre-calculate width of each horizontal chord of the circle
  // This is the max width allowed for text

  function initLines() {
    const lines: any[] = [];

    for (let y = r * 0.9; y > -r; y -= lineHeight) {
      let h = Math.abs(r - y);

      if (y - lineHeight < 0) {
        h += 20;
      }

      let length = 2 * Math.sqrt(h * (2 * r - h));

      if (length && length > 10) {
        lines.push({
          y: y,
          maxLength: length,
        });
      }
    }

    return lines;
  }

  // draw text on each line of the circle

  function wrapText(text: string, lines: any[]) {
    const ctx = getContext();

    let i = 0;
    let words = text.split(" ");

    while (i < lines.length && words.length > 0) {
      let line = lines[i++];

      let lineData = calcAllowableWords(
        line.maxLength,
        words
      );

      ctx.fillText(
        lineData!.text,
        cx - lineData!.width / 2,
        cy - line.y + textHeight
      );

      words.splice(0, lineData!.count);
    }
  }

  // calculate how many words will fit on a line

  function calcAllowableWords(
    maxWidth: number,
    words: any[]
  ) {
    const ctx = getContext();

    let wordCount = 0;
    let testLine = "";
    let spacer = "";
    let fittedWidth = 0;
    let fittedText = "";

    const font = "12pt verdana";
    ctx.font = font;

    for (let i = 0; i < words.length; i++) {
      testLine += spacer + words[i];
      spacer = " ";

      let width = ctx.measureText(testLine).width;

      if (width > maxWidth) {
        return {
          count: i,
          width: fittedWidth,
          text: fittedText,
        };
      }

      fittedWidth = width;
      fittedText = testLine;
    }
  }
  // function handleChange(
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) {
  //   const newText = e.target.value;
  //   setText(newText);

  //   // Split Words
  //   const words = text.split(/\s+/g); // To hyphenate: /\s+|(?<=-)/
  //   if (!words[words.length - 1]) words.pop();
  //   if (!words[0]) words.shift();

  //   // Get Width
  //   const lineHeight = 12;
  //   const targetWidth = Math.sqrt(
  //     measureWidth(text.trim()) * lineHeight
  //   );

  //   // Split Lines accordingly
  //   const lines = splitLines(targetWidth, words);

  //   console.log(targetWidth);
  //   console.log(lines);

  //   // Get radius so we can scale
  //   const radius = getRadius(lines, lineHeight);

  //   // Draw Text
  //   const ctx = getContext();

  //   ctx.textAlign = "center";
  //   ctx.fillStyle = "black";
  //   for (const [i, l] of lines.entries()) {
  //     ctx.fillText(
  //       l.text,
  //       width / 2 - l.width / 2,
  //       height / 2 + i * lineHeight
  //     );
  //   }
  // }

  // function measureWidth(s: string) {
  //   const ctx = getContext();
  //   return ctx.measureText(s).width;
  // }

  // function splitLines(
  //   targetWidth: number,
  //   words: string[]
  // ) {
  //   let line;
  //   let lineWidth0 = Infinity;
  //   const lines = [];

  //   for (let i = 0, n = words.length; i < n; ++i) {
  //     let lineText1 =
  //       (line ? line.text + " " : "") + words[i];

  //     let lineWidth1 = measureWidth(lineText1);

  //     if ((lineWidth0 + lineWidth1) / 2 < targetWidth) {
  //       line!.width = lineWidth0 = lineWidth1;
  //       line!.text = lineText1;
  //     } else {
  //       lineWidth0 = measureWidth(words[i]);
  //       line = { width: lineWidth0, text: words[i] };
  //       lines.push(line);
  //     }
  //   }
  //   return lines;
  // }

  // function getRadius(
  //   lines: { width: number; text: string }[],
  //   lineHeight: number
  // ) {
  //   let radius = 0;

  //   for (let i = 0, n = lines.length; i < n; ++i) {
  //     const dy =
  //       (Math.abs(i - n / 2 + 0.5) + 0.5) * lineHeight;

  //     const dx = lines[i].width / 2;

  //     radius = Math.max(
  //       radius,
  //       Math.sqrt(dx ** 2 + dy ** 2)
  //     );
  //   }

  //   return radius;
  // }

  return (
    <>
      <input type="text" onChange={handleChange} />

      <canvas ref={canvasRef}></canvas>
    </>
  );
}
