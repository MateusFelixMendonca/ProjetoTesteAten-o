declare module '@mediapipe/face_mesh' {
  export interface NormalizedLandmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }

  export interface Results {
    multiFaceLandmarks?: NormalizedLandmark[][];
    image: HTMLCanvasElement | HTMLVideoElement | ImageData;
  }

  export interface FaceMeshOptions {
    locateFile?: (path: string, prefix?: string) => string;
    maxNumFaces?: number;
    refineLandmarks?: boolean;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
  }

  export class FaceMesh {
    constructor(options?: { locateFile?: (path: string, prefix?: string) => string });
    setOptions(options: FaceMeshOptions): void;
    onResults(callback: (results: Results) => void): void;
    send(inputs: { image: HTMLVideoElement | HTMLCanvasElement }): Promise<void>;
    close(): Promise<void>;
  }
}

declare module '@mediapipe/camera_utils' {
  export interface CameraOptions {
    onFrame: () => Promise<void> | void;
    width?: number;
    height?: number;
    facingMode?: 'user' | 'environment';
  }

  export class Camera {
    constructor(videoElement: HTMLVideoElement, options: CameraOptions);
    start(): Promise<void>;
    stop(): Promise<void>;
  }
}
