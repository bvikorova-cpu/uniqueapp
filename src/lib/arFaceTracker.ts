import type { FaceLandmarker } from "@mediapipe/tasks-vision";

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

/** Lazily loads the MediaPipe face landmarker (WASM + model from CDN). */
export function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await import("@mediapipe/tasks-vision");
      const fileset = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm",
      );
      return vision.FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 2,
      });
    })().catch((err) => {
      landmarkerPromise = null;
      throw err;
    });
  }
  return landmarkerPromise;
}

export interface FaceAnchors {
  eyeLeft: { x: number; y: number };
  eyeRight: { x: number; y: number };
  nose: { x: number; y: number };
  mouth: { x: number; y: number };
  forehead: { x: number; y: number };
  eyeDistance: number;
  angle: number;
}

/** Converts normalized landmarks into pixel anchors used to place overlays. */
export function anchorsFromLandmarks(
  landmarks: { x: number; y: number }[],
  width: number,
  height: number,
): FaceAnchors | null {
  if (!landmarks || landmarks.length < 400) return null;
  const px = (i: number) => ({ x: landmarks[i].x * width, y: landmarks[i].y * height });
  const eyeRight = px(33);
  const eyeLeft = px(263);
  const nose = px(1);
  const mouth = px(13);
  const forehead = px(10);
  const dx = eyeLeft.x - eyeRight.x;
  const dy = eyeLeft.y - eyeRight.y;
  const eyeDistance = Math.hypot(dx, dy);
  if (!eyeDistance) return null;
  return { eyeLeft, eyeRight, nose, mouth, forehead, eyeDistance, angle: Math.atan2(dy, dx) };
}
