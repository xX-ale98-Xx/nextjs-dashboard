'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { colors } from '@/theme/colors';

type VideoConstraints = {
  width: number;
  height: number;
  aspectRatio: number;
  facingMode: string;
};

type Keypoint = {
  x: number;
  y: number;
  confidence: number;
  id: number;
};

{/*type Pose = {
  keypoints: Keypoint[];
};
*/}

const SKELETON_CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4],
  [5, 6], [5, 11], [6, 12], [11, 12],
  [5, 7], [7, 9],
  [6, 8], [8, 10],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
];

export default function PoseDetector() {
  const containerRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [videoConstraints, setVideoConstraints] = useState<VideoConstraints | null>(null);
  const [detector, setDetector] = useState<object | null>(null);
  const [tfInstance, setTfInstance] = useState<object | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  // const [poses, setPoses] = useState<Pose[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [keypointHistory, setKeypointHistory] = useState<Keypoint[][]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const calculateMovingAverage = useCallback((newKeypoints: Keypoint[]): Keypoint[] => {
    const updatedHistory = [...keypointHistory, newKeypoints];
    if (updatedHistory.length > 3) updatedHistory.shift();
    setKeypointHistory(updatedHistory);

    if (updatedHistory.length === 1) return newKeypoints;

    const averagedKeypoints: Keypoint[] = [];
    for (let i = 0; i < 17; i++) {
      let sumX = 0, sumY = 0, sumConfidence = 0, validFrames = 0;
      for (const frame of updatedHistory) {
        if (frame[i] && frame[i].confidence > 0.1) {
          sumX += frame[i].x;
          sumY += frame[i].y;
          sumConfidence += frame[i].confidence;
          validFrames++;
        }
      }
      if (validFrames > 0) {
        averagedKeypoints.push({
          x: sumX / validFrames,
          y: sumY / validFrames,
          confidence: sumConfidence / validFrames,
          id: i,
        });
      } else {
        averagedKeypoints.push(newKeypoints[i]);
      }
    }
    return averagedKeypoints;
  }, [keypointHistory]);

  const drawSkeleton = useCallback((ctx: CanvasRenderingContext2D, keypoints: Keypoint[]) => {
    ctx.strokeStyle = colors.teal[500];
    ctx.lineWidth = 2;

    SKELETON_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const startPoint = keypoints[startIdx];
      const endPoint = keypoints[endIdx];
      if (startPoint.confidence > 0.3 && endPoint.confidence > 0.3) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    });
  }, []);

  const detectPoses = useCallback(async () => {
    if (!detector || !webcamRef.current?.video || !canvasRef.current || !tfInstance) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) return;

    try {
      const imageTensor = tfInstance.browser.fromPixels(video);
      const resized = tfInstance.image.resizeBilinear(imageTensor, [256, 256]);
      const int32Tensor = tfInstance.cast(resized, 'int32');
      const batched = int32Tensor.expandDims(0);

      const outputs = detector.predict(batched) as unknown;
      const keypointsData = await outputs.data();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rawKeypoints: Keypoint[] = [];
      for (let i = 0; i < 17; i++) {
        const y = keypointsData[i * 3] * video.videoHeight;
        const x = keypointsData[i * 3 + 1] * video.videoWidth;
        const confidence = keypointsData[i * 3 + 2];
        rawKeypoints.push({ x, y, confidence, id: i });
      }

      const smoothedKeypoints = calculateMovingAverage(rawKeypoints);
      drawSkeleton(ctx, smoothedKeypoints);

      ctx.fillStyle = colors.teal[500];
      ctx.lineWidth = 2;
      smoothedKeypoints.forEach((keypoint, i) => {
        if (keypoint.confidence > 0.2) {
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.fillText(i.toString(), keypoint.x + 7, keypoint.y - 7);
          ctx.fillStyle = colors.teal[500];
        }
      });

      // setPoses([{ keypoints: smoothedKeypoints }]);

      imageTensor.dispose();
      resized.dispose();
      int32Tensor.dispose();
      batched.dispose();
      outputs.dispose();
    } catch (error) {
      console.error('Error detecting poses:', error);
    }
  }, [detector, tfInstance]);

  const startApp = async () => {
    try {
      setHasStarted(true);
      setIsModelLoading(true);

      const tf = await import('@tensorflow/tfjs');
      await import('@tensorflow/tfjs-backend-webgl');
      await tf.setBackend('webgl');
      await tf.ready();

      const modelUrl = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/thunder/4';
      const model = await tf.loadGraphModel(modelUrl, { fromTFHub: true });

      setTfInstance(tf);
      setDetector(model);
      setIsModelLoading(false);
    } catch (error) {
      console.error('Error loading model:', error);
      setModelError(error instanceof Error ? error.message : 'Unknown error');
      console.log(modelError)
      setIsModelLoading(false);
    }
  };

  useEffect(() => {
    if (detector && !isModelLoading && hasStarted && webcamRef.current?.video) {
      const video = webcamRef.current.video;
      const handleVideoLoad = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setIsDetecting(true);
        }
      };
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        handleVideoLoad();
      } else {
        video.addEventListener('loadedmetadata', handleVideoLoad);
        video.addEventListener('canplay', handleVideoLoad);
        return () => {
          video.removeEventListener('loadedmetadata', handleVideoLoad);
          video.removeEventListener('canplay', handleVideoLoad);
        };
      }
    }
  }, [detector, isModelLoading, hasStarted]);

  useEffect(() => {
    let animationFrame: number;
    const runDetection = async () => {
      if (isDetecting) {
        await detectPoses();
        animationFrame = requestAnimationFrame(runDetection);
      }
    };

    if (isDetecting && detector) {
      const timeoutId = setTimeout(() => runDetection(), 100);
      return () => {
        clearTimeout(timeoutId);
        cancelAnimationFrame(animationFrame);
      };
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isDetecting, detector, detectPoses]);

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        const aspectRatio = width / height;
        setVideoConstraints({
          facingMode: 'user',
          aspectRatio,
          width,
          height,
        });
      }
    };

    const resizeObserver = new ResizeObserver(updateConstraints);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateConstraints();
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div
        ref={containerRef}
        className="overflow-hidden relative flex justify-center items-center rounded-lg w-full flex-1 bg-black"
      >
        {!hasStarted ? (
          <button
            onClick={startApp}
            className="px-6 py-3 text-white bg-brand-main hover:bg-brand-600 rounded-lg text-lg shadow-lg"
          >
            Avvia VisualMotion+
          </button>
        ) : (
          videoConstraints && (
            <>
              <Webcam
                ref={webcamRef}
                className="w-full h-full object-cover"
                mirrored
                muted
                audio={false}
                videoConstraints={videoConstraints}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ transform: 'scaleX(-1)' }}
              />
            </>
          )
        )}
      </div>
    </div>
  );
}
