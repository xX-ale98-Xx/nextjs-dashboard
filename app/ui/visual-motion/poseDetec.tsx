'use client';

import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

type VideoConstraints = {
  width: number;
  height: number;
  aspectRatio: number;
  facingMode: string;
};

export default function PoseDetector() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoConstraints, setVideoConstraints] = useState<VideoConstraints | null>(null);

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        const aspectRatio = width / height;
        console.log(containerRef)

        setVideoConstraints({
          facingMode: 'user',
          aspectRatio: aspectRatio,
          width: width,
          height: height,
        });
      }
    };

    // Usa ResizeObserver per aggiornare dinamicamente
    const resizeObserver = new ResizeObserver(() => {
      updateConstraints();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateConstraints();
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className='overflow-hidden relative flex justify-center items-center rounded-lg w-full h-full'
    >
      {videoConstraints && (
        <Webcam
          className='w-full h-full object-cover'
          mirrored={true}
          muted={true}
          audio={false}
          videoConstraints={videoConstraints}
        />
      )}

      {/* Qui puoi aggiungere un <canvas> sovrapposto se ti serve */}
    </div>
  );
}
