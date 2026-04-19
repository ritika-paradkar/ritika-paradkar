// Client-side media preparation for image/video deepfake analysis
// - Images: read EXIF-free base64 + basic metadata
// - Videos: extract N frames as base64 JPEGs at evenly spaced timestamps

export interface MediaFrame {
  /** base64 (no data: prefix) */
  base64: string;
  mimeType: string;
  /** seconds into the video (0 for image) */
  timestamp: number;
}

export interface MediaPayload {
  kind: "image" | "video";
  /** All frames to send to AI. For images, exactly 1. For video, 8-20. */
  frames: MediaFrame[];
  /** Original file metadata */
  meta: {
    name: string;
    sizeBytes: number;
    mimeType: string;
    width?: number;
    height?: number;
    durationSec?: number;
    frameCount?: number;
  };
}

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
const VIDEO_EXTS = ["mp4", "mov", "avi", "mkv", "webm"];

export function detectMediaKind(file: File): "image" | "video" | null {
  const ext = file.name.toLowerCase().split(".").pop() || "";
  if (IMAGE_EXTS.includes(ext) || file.type.startsWith("image/")) return "image";
  if (VIDEO_EXTS.includes(ext) || file.type.startsWith("video/")) return "video";
  return null;
}

/** Downscale a source (image or video frame) to max dimension and return JPEG base64. */
function drawToBase64(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  maxDim = 768,
  quality = 0.82,
): { base64: string; w: number; h: number } {
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(source, 0, 0, w, h);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { base64: dataUrl.split(",")[1] || "", w, h };
}

export async function prepareImage(file: File): Promise<MediaPayload> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Failed to load image"));
      el.src = url;
    });
    const { base64, w, h } = drawToBase64(img, img.naturalWidth, img.naturalHeight, 768, 0.85);
    return {
      kind: "image",
      frames: [{ base64, mimeType: "image/jpeg", timestamp: 0 }],
      meta: { name: file.name, sizeBytes: file.size, mimeType: file.type || "image/jpeg", width: w, height: h },
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareVideo(
  file: File,
  onProgress?: (msg: string, pct?: number) => void,
  targetFrames = 12,
): Promise<MediaPayload> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.src = url;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video metadata"));
    });

    const duration = isFinite(video.duration) ? video.duration : 0;
    if (!duration || duration < 0.3) throw new Error("Video too short or duration unknown");

    // Sample every ~1-2 seconds, capped at targetFrames
    const desired = Math.min(targetFrames, Math.max(4, Math.round(duration / 1.5)));
    const timestamps: number[] = [];
    for (let i = 0; i < desired; i++) {
      timestamps.push(((i + 0.5) * duration) / desired);
    }

    const frames: MediaFrame[] = [];
    let i = 0;
    for (const t of timestamps) {
      onProgress?.(`Extracting frames (${i + 1}/${timestamps.length})...`, Math.round(((i + 1) / timestamps.length) * 100));
      await new Promise<void>((resolve, reject) => {
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          try {
            const { base64 } = drawToBase64(video, video.videoWidth, video.videoHeight, 640, 0.78);
            frames.push({ base64, mimeType: "image/jpeg", timestamp: t });
            resolve();
          } catch (e) {
            reject(e);
          }
        };
        video.addEventListener("seeked", onSeeked, { once: true });
        try {
          video.currentTime = Math.min(t, Math.max(0, duration - 0.05));
        } catch (e) {
          reject(e as Error);
        }
      });
      i++;
    }

    return {
      kind: "video",
      frames,
      meta: {
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type || "video/mp4",
        width: video.videoWidth,
        height: video.videoHeight,
        durationSec: Math.round(duration * 10) / 10,
        frameCount: frames.length,
      },
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareMedia(
  file: File,
  onProgress?: (msg: string, pct?: number) => void,
): Promise<MediaPayload> {
  const kind = detectMediaKind(file);
  if (!kind) throw new Error("Unsupported media type");
  if (kind === "image") {
    onProgress?.("Preparing image...");
    return prepareImage(file);
  }
  onProgress?.("Loading video...");
  return prepareVideo(file, onProgress);
}
