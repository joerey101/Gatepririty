'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const frameCount = 901;

const currentFrame = (index: number) =>
  `/footage/GatePriority_${index.toString().padStart(3, '0')}.jpeg`;

export default function SequencePlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedFrames, setLoadedFrames] = useState(0);

  // function to scale image to cover canvas
  const drawCoverImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvas: HTMLCanvasElement
  ) => {
    if (!ctx || !img || !canvas) return;
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let x = 0;
    let y = 0;
    
    if (canvasRatio > imgRatio) {
      drawHeight = canvas.width / imgRatio;
      y = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgRatio;
      x = (canvas.width - drawWidth) / 2;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  };

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new window.Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loaded++;
        setLoadedFrames(loaded);
        if (loaded === 1 && canvasRef.current && img.src.includes('000')) {
           // draw the first frame initially when it loads (just as placeholder while others load)
           const canvas = canvasRef.current;
           canvas.width = window.innerWidth;
           canvas.height = window.innerHeight;
           const ctx = canvas.getContext('2d');
           if (ctx) drawCoverImage(ctx, loadedImages[0], canvas);
        }
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
    
    // Resize handler
    const handleResize = () => {
       if (canvasRef.current) {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
          // Redraw current frame if possible
          if (images.length > 0) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) drawCoverImage(ctx, images[0], canvasRef.current);
          }
       }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useGSAP(() => {
    if (loadedFrames < frameCount || !canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    
    // update initial size before anim
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const playhead = { frame: 0 };
    
    const render = () => {
      const ctx = canvas.getContext('2d');
      if (ctx && images[playhead.frame]) {
        drawCoverImage(ctx, images[playhead.frame], canvas);
      }
    };

    render(); // Initial render

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=8000', // adjust this for scrub length (8000px scroll)
      pin: true,
      scrub: 0.5, // 0.5s smoothing
      animation: gsap.to(playhead, {
        frame: frameCount - 1,
        snap: 'frame',
        ease: 'none',
        onUpdate: render,
      }),
    });

  }, { dependencies: [loadedFrames], scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">
      {loadedFrames < frameCount && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 pointer-events-none">
          <h2 className="text-3xl mb-6 font-semibold text-white">Preparando animacion Drone...</h2>
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(loadedFrames / frameCount) * 100}%` }}
            />
          </div>
          <p className="mt-4 text-gray-400 font-mono">
            {loadedFrames} / {frameCount} frames
          </p>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
      />
    </div>
  );
}
