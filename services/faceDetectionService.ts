
import * as faceapi from '@vladmandic/face-api';
import { FaceDetectionResult } from '../types';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

let modelsLoaded = false;

export const loadFaceModels = async () => {
  if (modelsLoaded) return;
  
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log('Face detection models loaded successfully');
  } catch (error) {
    console.error('Error loading face detection models:', error);
    throw new Error('Failed to load face detection models');
  }
};

export const detectFaces = async (
  imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  timeoutMs: number = 10000
): Promise<FaceDetectionResult[]> => {
  if (!modelsLoaded) {
    await loadFaceModels();
  }

  const detectionPromise = (async () => {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 });
    const detections = await faceapi.detectAllFaces(imageElement, options);
    
    return detections.map(det => ({
      box: {
        x: det.box.x,
        y: det.box.y,
        width: det.box.width,
        height: det.box.height,
      },
      score: det.score,
    }));
  })();

  const timeoutPromise = new Promise<FaceDetectionResult[]>((_, reject) =>
    setTimeout(() => reject(new Error('Face detection timed out')), timeoutMs)
  );

  return Promise.race([detectionPromise, timeoutPromise]);
};
