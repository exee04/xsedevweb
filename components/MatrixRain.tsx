"use client";
import { useEffect, useRef } from "react";

const WORD_LIST = [
  "xsedev",
  "whitemonster",
  "purple",
  "pocket",
  "deadlock",
  "fih",
  "flutter",
  "manifestingjob",
  "gurt",
];

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const PRIMARY = "#8758ff";
    const fontSize = 14;
    const colWidth = fontSize;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Drop = {
      word: string; // the word being repeated
      y: number; // current head position (in rows)
      length: number; // total raindrop length in chars
      speed: number; // rows per frame
      frameAcc: number; // frame accumulator for speed control
    };

    const randomWord = () =>
      WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

    const makeDrop = (): Drop => {
      const word = randomWord();
      const minLen = word.length * 2;
      const length = minLen + Math.floor(Math.random() * word.length * 3);
      return {
        word,
        y: -length - Math.floor(Math.random() * 40),
        length,
        speed: 1,
        frameAcc: 0,
      };
    };

    // one drop per column
    const numCols = () => Math.floor(canvas.width / colWidth);
    let drops: Drop[] = Array.from({ length: numCols() }, makeDrop);

    // parse primary hex → rgb for alpha blending
    const hex = PRIMARY.replace("#", "");
    const pr = parseInt(hex.substring(0, 2), 16);
    const pg = parseInt(hex.substring(2, 4), 16);
    const pb = parseInt(hex.substring(4, 6), 16);

    const draw = () => {
      // fade trail
      ctx.fillStyle = "rgba(24, 24, 24, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      const cols = numCols();
      // adjust drops array if window resized
      while (drops.length < cols) drops.push(makeDrop());
      if (drops.length > cols) drops.length = cols;

      drops.forEach((drop, col) => {
        drop.frameAcc++;
        if (drop.frameAcc < drop.speed) return;
        drop.frameAcc = 0;

        const x = col * colWidth;

        // draw each visible character of the raindrop
        for (let row = 0; row < drop.length; row++) {
          const charY = drop.y - row;
          if (charY < 0 || charY * fontSize > canvas.height) continue;

          // position within word (repeating)
          const charIndex = charY % drop.word.length;
          const char = drop.word[Math.abs(charIndex)];

          // alpha: head is brightest, tail fades out
          const alpha = Math.pow(1 - row / drop.length, 1.8);

          if (row === 0) {
            // head: bright white flash
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          } else {
            ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${alpha})`;
          }

          ctx.fillText(char, x, charY * fontSize);
        }

        drop.y++;

        // reset when fully off screen
        if ((drop.y - drop.length) * fontSize > canvas.height) {
          drops[col] = makeDrop();
        }
      });
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full opacity-30"
      style={{ pointerEvents: "none" }}
    />
  );
}
