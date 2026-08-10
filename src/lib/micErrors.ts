import { toast } from "sonner";

/** True when the app runs inside an iframe (e.g. the Lovable preview panel). */
export function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/** Human-friendly explanation for a getUserMedia failure. */
export function micErrorMessage(err: unknown): string {
  const name = (err as { name?: string } | null)?.name;

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No microphone found on this device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The microphone is already in use by another app. Close it and try again.";
  }
  if (name === "NotAllowedError" || name === "SecurityError" || !name) {
    return isEmbedded()
      ? "Microphone is blocked inside the preview window. Open the app in a full browser tab (uniqueapp.fun) and allow the microphone."
      : "Microphone access denied. Allow the microphone in your browser settings (lock icon in the address bar) and try again.";
  }
  return "Could not start recording. Please try again.";
}

/** Show a toast describing why recording could not start. */
export function toastMicError(err: unknown) {
  toast.error(micErrorMessage(err));
}

/**
 * Request microphone access with clear diagnostics.
 * Throws the original error after showing a toast.
 */
export async function requestMicStream(
  constraints: MediaStreamConstraints = { audio: true },
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    toast.error("This browser does not support audio recording.");
    throw new Error("getUserMedia unsupported");
  }
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    toastMicError(err);
    throw err;
  }
}
