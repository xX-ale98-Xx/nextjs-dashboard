'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs';
import { colors } from '@/theme/colors'; // Adjust the import path as needed

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

type Pose = {
  keypoints: Keypoint[];
};

// MoveNet skeleton connections (keypoint indices)
const SKELETON_CONNECTIONS = [
  // Head connections
  [0, 1],   // nose to left_eye
  [0, 2],   // nose to right_eye
  [1, 3],   // left_eye to left_ear
  [2, 4],   // right_eye to right_ear
  
  // Torso connections
  [5, 6],   // left_shoulder to right_shoulder
  [5, 11],  // left_shoulder to left_hip
  [6, 12],  // right_shoulder to right_hip
  [11, 12], // left_hip to right_hip
  
  // Left arm
  [5, 7],   // left_shoulder to left_elbow
  [7, 9],   // left_elbow to left_wrist
  
  // Right arm
  [6, 8],   // right_shoulder to right_elbow
  [8, 10],  // right_elbow to right_wrist
  
  // Left leg
  [11, 13], // left_hip to left_knee
  [13, 15], // left_knee to left_ankle
  
  // Right leg
  [12, 14], // right_hip to right_knee
  [14, 16], // right_knee to right_ankle
];

// Teal-500 color definition
const TEAL_500 = colors.teal[500]; // Fallback to default if not defined

export default function PoseDetector() {
  const containerRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [videoConstraints, setVideoConstraints] = useState<VideoConstraints | null>(null);
  const [detector, setDetector] = useState<tf.GraphModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [poses, setPoses] = useState<Pose[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [keypointHistory, setKeypointHistory] = useState<Keypoint[][]>([]);

  // Function to calculate moving average of keypoints
  const calculateMovingAverage = useCallback((newKeypoints: Keypoint[]): Keypoint[] => {
    const updatedHistory = [...keypointHistory, newKeypoints];
    
    // Keep only the last 3 frames
    if (updatedHistory.length > 3) {
      updatedHistory.shift();
    }
    
    setKeypointHistory(updatedHistory);
    
    // If we don't have enough history, return the current keypoints
    if (updatedHistory.length === 1) {
      return newKeypoints;
    }
    
    // Calculate average for each keypoint
    const averagedKeypoints: Keypoint[] = [];
    for (let i = 0; i < 17; i++) {
      let sumX = 0, sumY = 0, sumConfidence = 0;
      let validFrames = 0;
      
      for (const frame of updatedHistory) {
        if (frame[i] && frame[i].confidence > 0.1) { // Only include keypoints with some confidence
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
          id: i
        });
      } else {
        // If no valid frames, use the latest keypoint
        averagedKeypoints.push(newKeypoints[i]);
      }
    }
    
    return averagedKeypoints;
  }, [keypointHistory]);

  // Function to draw skeleton connections
  const drawSkeleton = useCallback((ctx: CanvasRenderingContext2D, keypoints: Keypoint[]) => {
    ctx.strokeStyle = TEAL_500;
    ctx.lineWidth = 2;
    
    SKELETON_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const startPoint = keypoints[startIdx];
      const endPoint = keypoints[endIdx];
      
      // Only draw connection if both keypoints have reasonable confidence
      if (startPoint.confidence > 0.3 && endPoint.confidence > 0.3) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    });
  }, []);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        console.log('Loading TensorFlow.js...');
        
        // Wait for TensorFlow to be ready (it's already imported)
        await tf.ready();
        console.log('TensorFlow.js is ready');
        
        // Load MoveNet model from TensorFlow Hub
        console.log('Loading MoveNet model...');
        const modelUrl = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/thunder/4';
        const model = await tf.loadGraphModel(modelUrl, { fromTFHub: true });
        
        setDetector(model);
        setIsModelLoading(false);
        console.log('MoveNet model loaded successfully!');
      } catch (error) {
        console.error('Error loading model:', error);
        setModelError(error instanceof Error ? error.message : 'Failed to load model');
        setIsModelLoading(false);
      }
    };
    
    loadModel();
  }, []);

  // Unified pose detection function
  const detectPoses = useCallback(async () => {
    if (!detector || !webcamRef.current?.video || !canvasRef.current) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Check if video is ready and has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
      console.log('Video not ready yet, skipping frame...');
      return;
    }

    try {
      // Prepare the image tensor (following MoveNet requirements)
      console.log('Processing frame...');
      
      // Get image from video
      const imageTensor = tf.browser.fromPixels(video);
      
      // Resize to 192x192 (MoveNet input requirement)
      const resized = tf.image.resizeBilinear(imageTensor, [256, 256]);
      
      // Convert to int32 and normalize to 0-255 range
      const int32Tensor = tf.cast(resized, 'int32');
      
      // Add batch dimension [1, 192, 192, 3]
      const batched = int32Tensor.expandDims(0);
      
      console.log('Input tensor shape:', batched.shape);

      // Run the model
      const outputs = detector.predict(batched) as tf.Tensor;
      console.log('Model output shape:', outputs.shape);
      
      // Get the keypoints data
      const keypointsData = await outputs.data();
      console.log('Keypoints data length:', keypointsData.length);
      
      // Parse keypoints (17 keypoints × 3 coordinates = 51 values)
      // Output format: [batch, person, keypoint, coordinate] = [1, 1, 17, 3]
      // Each keypoint has [y, x, confidence] (normalized 0-1)
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const rawKeypoints: Keypoint[] = [];
      for (let i = 0; i < 17; i++) {
        // Extract coordinates (they're normalized 0-1, so we scale to video size)
        const y = (keypointsData as Float32Array)[i * 3] * video.videoHeight;     // y coordinate
        const x = (keypointsData as Float32Array)[i * 3 + 1] * video.videoWidth;  // x coordinate  
        const confidence = (keypointsData as Float32Array)[i * 3 + 2];            // confidence score
        
        rawKeypoints.push({ x, y, confidence, id: i });
      }
      
      // Apply moving average smoothing
      const smoothedKeypoints = calculateMovingAverage(rawKeypoints);
      
      // Draw skeleton connections first (so they appear behind keypoints)
      drawSkeleton(ctx, smoothedKeypoints);
      
      // Draw keypoints
      ctx.fillStyle = TEAL_500;
      ctx.strokeStyle = TEAL_500;
      ctx.lineWidth = 2;
      
      smoothedKeypoints.forEach((keypoint, i) => {
        // Draw keypoint if confidence is high enough
        if (keypoint.confidence > 0.3) {
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          
          // Optional: Draw keypoint number
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.fillText(i.toString(), keypoint.x + 7, keypoint.y - 7);
          ctx.fillStyle = TEAL_500;
        }
      });
      
      // Update poses state with smoothed keypoints
      setPoses([{ keypoints: smoothedKeypoints }]);
      
      console.log(`Detected ${smoothedKeypoints.filter(kp => kp.confidence > 0.3).length} confident keypoints`);
      
      
      // Clean up tensors (IMPORTANT: prevents memory leaks)
      imageTensor.dispose();
      resized.dispose();
      int32Tensor.dispose();
      batched.dispose();
      outputs.dispose();
      
    } catch (error) {
      console.error('Error detecting poses:', error);
    }
  }, [detector]);

  // Start/stop detection
  const toggleDetection = () => {
    setIsDetecting(!isDetecting);
  };

  // Detection loop
  useEffect(() => {
    let animationFrame: number;
    
    const runDetection = async () => {
      if (isDetecting) {
        await detectPoses();
        animationFrame = requestAnimationFrame(runDetection);
      }
    };
    
    if (isDetecting && detector) {
      // Add a small delay to ensure video is ready
      const timeoutId = setTimeout(() => {
        runDetection();
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isDetecting, detector, detectPoses]);

  // Auto-start detection when model loads
  useEffect(() => {
    // Start detection automatically when model is ready and video is loaded
    if (detector && !isModelLoading && webcamRef.current?.video) {
      const video = webcamRef.current.video;
      
      const handleVideoLoad = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          console.log('Video ready, starting detection...');
          setIsDetecting(true);
        }
      };
      
      // Check if video is already loaded
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        handleVideoLoad();
      } else {
        // Wait for video to load
        video.addEventListener('loadedmetadata', handleVideoLoad);
        video.addEventListener('canplay', handleVideoLoad);
        
        return () => {
          video.removeEventListener('loadedmetadata', handleVideoLoad);
          video.removeEventListener('canplay', handleVideoLoad);
        };
      }
    }
  }, [detector, isModelLoading]);

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        const aspectRatio = width / height;

        setVideoConstraints({
          facingMode: 'user',
          aspectRatio: aspectRatio,
          width: width,
          height: height,
        });
      }
    };

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
    <div className="w-full h-full flex flex-col">
      {/* Status bar */}
      <div className="mb-4 p-2 bg-gray-100 rounded">
        {isModelLoading && (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm">Loading MoveNet model...</span>
          </div>
        )}
        {modelError && (
          <div className="text-red-600 text-sm">
            Error: {modelError}
          </div>
        )}
        {detector && !isModelLoading && (
          <div className="flex items-center gap-4">
            <div className="text-green-600 text-sm">
              ✓ MoveNet model loaded successfully
            </div>
            <button
              onClick={toggleDetection}
              className={`px-3 py-1 rounded text-sm ${
                isDetecting 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isDetecting ? 'Stop Detection' : 'Start Detection'}
            </button>
            {poses.length > 0 && (
              <div className="text-sm text-gray-600">
                Keypoints detected: {poses[0]?.keypoints?.length || 0}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video container */}
      <div
        ref={containerRef}
        className='overflow-hidden relative flex justify-center items-center rounded-lg w-full flex-1'
      >
        {videoConstraints && (
          <>
            <Webcam
              ref={webcamRef}
              className='w-full h-full object-cover'
              mirrored={true}
              muted={true}
              audio={false}
              videoConstraints={videoConstraints}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ transform: 'scaleX(-1)' }}
            />
          </>
        )}
      </div>

      {/* Debug info */}
      {poses.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
          <h3 className="font-bold mb-2">Pose Debug Info:</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p>Total keypoints: {poses[0]?.keypoints?.length || 0}</p>
              <p>Confident keypoints: {poses[0]?.keypoints?.filter((kp: Keypoint) => kp.confidence > 0.3).length || 0}</p>
            </div>
            <div>
              <p>Input size: 256x256</p>
              <p>Output format: [1,1,17,3]</p>
            </div>
            <div>
              <p>Model: MoveNet Lightning</p>
              <p>Detection: {isDetecting ? 'Active' : 'Stopped'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}