"use client";

import React, { useEffect, useRef } from "react";

import {
  CanvasProps,
  setupGridWidthHeightAndScale,
} from "../utils/canvas_utils";

const LINE_CUT = 3; // Must be 2 or greater. This affects when a new line is created.
// The larger the value the more often a new line will be added.
const DEFAULT_FONT_SIZE = 64; // In pixels. Font is scaled to fit so that font size remains constant
const MAX_SCALE = 2; // Max font scale used
const DEFAULT_FONT_HEIGHT = DEFAULT_FONT_SIZE * 1.2;

/**
 * From [Mike Bostock's Tutorial](https://observablehq.com/@mbostock/fit-text-to-circle).
 *
 * Related to [Issue #433 on React Force Graph](https://github.com/vasturiano/react-force-graph/issues/433#issuecomment-1810210106).
 *
 * Answer supplied by [this answer](https://stackoverflow.com/q/77579242/4756173)
 */
export function TextInCircle({
  width,
  height,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function getContext() {
    const canvas = canvasRef.current!;
    return canvas.getContext("2d")!;
  }

  const RADIUS = width * 0.45;
  const INSET = width * 0.015;
  const CENTER_X = width * 0.5;
  const CENTER_Y = width * 0.5;

  useEffect(() => {
    const canvas = canvasRef.current!;
    setupGridWidthHeightAndScale(width, height, canvas);
  }, [height, width]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const ctx = getContext();

    const text = e.target.value; // This gives out an error

    fitCircleText(
      ctx,
      CENTER_X,
      CENTER_Y,
      RADIUS,
      INSET,
      text
    );
  }

  function fillWord(
    ctx: CanvasRenderingContext2D,
    word: any,
    x: number,
    y: number
  ) {
    // render a word
    ctx.fillText(word.text, x, y);
    return x + word.width;
  }

  function fillLine(
    ctx: CanvasRenderingContext2D,
    words: any,
    line: any
  ) {
    // render a line
    var idx = line.from;
    var x = line.x;
    while (idx < line.to) {
      const word = words[idx++];
      x = fillWord(ctx, word, x, line.y);
      x += word.space;
    }
  }

  function getCharWidth(
    words: any,
    fromIdx: any,
    toIdx: any
  ) {
    // in characters
    var width = 0;
    while (fromIdx < toIdx) {
      width +=
        words[fromIdx].text.length +
        (fromIdx++ < toIdx ? 1 : 0);
    }
    return width;
  }

  function getWordsWidth(words: any, line: any) {
    // in pixels
    var width = 0;
    var idx = line.from;
    while (idx < line.to) {
      width +=
        words[idx].width +
        (idx++ < line.to ? words[idx - 1].space : 0);
    }
    return width;
  }

  function fitCircleText(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    inset = 20,
    text = "",
    font = "arial",
    circleColor = "#C45",
    fontColor = "#EEE"
  ) {
    let scale, line;
    ctx.fillStyle = circleColor;
    // Trying to fix the first frame
    // ctx.clearRect(0, 0, width * window.devicePixelRatio, height * window.devicePixelRatio)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    text = (text?.toString?.() ?? "").trim();

    if (text) {
      ctx.fillStyle = fontColor;
      ctx.font = DEFAULT_FONT_SIZE + "px " + font;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      const spaceWidth = ctx.measureText(" ").width;
      const words = text
        .split(" ")
        .map((text, i, words) => ({
          width: ctx.measureText(text).width,
          text,
          space: i < words.length - 1 ? spaceWidth : 0,
        }));
      const lines = [];
      const totalWidth = ctx.measureText(text).width;
      const circleWidth = (radius - inset) * 2;
      scale = Math.min(MAX_SCALE, circleWidth / totalWidth);
      const wordCount = words.length;

      // If single line can not fit
      if (scale < MAX_SCALE && words.length > 1) {
        // split lines and get bounding radius
        let lineCount = Math.ceil(Math.sqrt(words.length));
        let lineIdx = 0;
        let fromWord = 0;
        let toWord = 1;

        // get a set of lines approx the same character count
        while (fromWord < wordCount) {
          let lineCharCount = getCharWidth(
            words,
            fromWord,
            toWord
          );
          while (
            toWord < wordCount &&
            lineCharCount <
              text.length / (lineCount + LINE_CUT)
          ) {
            lineCharCount = getCharWidth(
              words,
              fromWord,
              toWord++
            );
          }
          lines.push(
            (line = {
              x: 0,
              y: 0,
              idx: lineIdx++,
              from: fromWord,
              to: toWord,
            })
          );
          fromWord = toWord;
          toWord = fromWord + 1;
        }

        // find the bounding circle radius of lines
        let boundRadius = -Infinity;
        lineIdx = 0;
        for (const line of lines) {
          const lineWidth =
            getWordsWidth(words, line) * 0.5;
          const lineHeight =
            (-(lineCount - 1) * 0.5 + lineIdx) *
            DEFAULT_FONT_HEIGHT; // to middle of line
          const lineTop =
            lineHeight - DEFAULT_FONT_HEIGHT * 0.5;
          const lineBottom =
            lineHeight + DEFAULT_FONT_HEIGHT * 0.5;
          boundRadius = Math.max(
            Math.hypot(lineWidth, lineTop),
            Math.hypot(lineWidth, lineBottom),
            boundRadius
          );
          lineIdx++;
        }

        // use bounding radius to scale and then fit each line
        scale = (radius - inset) / (boundRadius + inset);
        lineIdx = 0;
        for (const line of lines) {
          line.y =
            (-(lines.length - 1) * 0.5 + lineIdx) *
            DEFAULT_FONT_HEIGHT;
          line.x = -getWordsWidth(words, line) * 0.5;
          lineIdx++;
        }
      } else {
        lines.push({
          x: 0,
          y: 0,
          from: 0,
          to: words.length,
        });
        lines[0].x = -getWordsWidth(words, lines[0]) * 0.5;
      }

      // Scale and render all lines
      ctx.setTransform(scale, 0, 0, scale, cx, cy);
      lines.forEach((line) => {
        fillLine(ctx, words, line);
      });

      // restore default
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  return (
    <>
      <input type="text" onChange={handleChange} />

      <canvas ref={canvasRef}></canvas>
    </>
  );
}
