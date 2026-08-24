/** Extract the first frame of a video as a JPEG Blob. */
export function extractVideoFirstFrame(videoUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    const cleanup = () => {
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      try { video.pause(); } catch {}
      video.src = "";
      video.load();
    };

    const onLoadedData = () => {
      try {
        video.currentTime = 0.1;
      } catch (e) {
        reject(e);
        cleanup();
      }
    };

    const onSeeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          cleanup();
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Could not create blob"));
            cleanup();
          },
          "image/jpeg",
          0.92
        );
      } catch (e) {
        reject(e);
        cleanup();
      }
    };

    const onError = () => {
      reject(new Error("Failed to load video"));
      cleanup();
    };

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.load();
  });
}
