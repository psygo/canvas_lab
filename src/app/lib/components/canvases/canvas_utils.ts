export const TwoPI = 2 * Math.PI;

export function setupGridWidthHeightAndScale(
  width: number,
  height: number,
  canvas: HTMLCanvasElement
) {
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  // Otherwise we get blurry lines
  // Referenece: [Stack Overflow - Canvas drawings, like lines, are blurry](https://stackoverflow.com/a/59143499/4756173)
  const scale = window.devicePixelRatio;

  canvas.width = width * scale;
  canvas.height = height * scale;

  const canvasCtx = canvas.getContext("2d")!;

  canvasCtx.scale(scale, scale);
}
