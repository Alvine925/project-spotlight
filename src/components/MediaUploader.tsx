import { useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, ImagePlus, Video, Link2, Loader2, AlertCircle } from "lucide-react";

const BUCKET = "project-media";
const ACCEPTED = "image/*,video/*";

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url);
}

async function ensureBucket() {
  await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 104857600 });
}

async function uploadFile(file: File, userId: string, onProgress?: (pct: number) => void): Promise<string> {
  await ensureBucket().catch(() => {});
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  onProgress?.(100);
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return publicUrl;
}

function MediaThumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-gray-100 bg-gray-100 group">
      {isVideo(url) ? (
        <video src={url} className="h-full w-full object-cover" muted playsInline />
      ) : (
        <img src={url} alt="" className="h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
      {isVideo(url) && (
        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-medium text-white flex items-center gap-0.5">
          <Video className="h-2.5 w-2.5" /> Video
        </span>
      )}
    </div>
  );
}

function DropZone({
  onFiles, uploading, multiple = false, compact = false,
}: {
  onFiles: (files: File[]) => void;
  uploading: boolean;
  multiple?: boolean;
  compact?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (files: FileList | null) => {
    if (!files || uploading) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (valid.length) onFiles(multiple ? valid : [valid[0]]);
  };

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors
        ${compact ? "py-4" : "py-8"}
        ${dragging ? "border-[#ff6600] bg-[#ff6600]/5" : "border-gray-200 bg-gray-50 hover:border-[#ff6600]/50 hover:bg-[#ff6600]/5"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => handle(e.target.files)}
      />
      {uploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
      ) : (
        <Upload className={`text-gray-400 ${compact ? "h-5 w-5" : "h-7 w-7"}`} />
      )}
      <div className="text-center">
        <p className={`font-medium text-gray-600 ${compact ? "text-xs" : "text-sm"}`}>
          {uploading ? "Uploading…" : "Drop files here or click to browse"}
        </p>
        <p className="text-[11px] text-gray-400">
          {multiple ? "Images & videos · select multiple" : "Image or video · max 100 MB"}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COVER UPLOADER  (single image or video)
───────────────────────────────────────────── */
export function CoverUploader({
  value, onChange, userId,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  userId: string;
}) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value ?? "");

  const upload = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setErr(null);
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadFile(files[0], userId, setProgress);
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [userId, onChange]);

  return (
    <div className="space-y-2">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs">
        <button type="button" onClick={() => setTab("upload")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 font-semibold transition-colors ${tab === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}>
          <ImagePlus className="h-3.5 w-3.5" /> Upload file
        </button>
        <button type="button" onClick={() => setTab("url")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 font-semibold transition-colors ${tab === "url" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}>
          <Link2 className="h-3.5 w-3.5" /> Paste URL
        </button>
      </div>

      {tab === "upload" ? (
        <>
          {value ? (
            <div className="relative">
              <div className="overflow-hidden rounded-xl border border-gray-100">
                {isVideo(value) ? (
                  <video src={value} className="aspect-video w-full object-cover" controls muted />
                ) : (
                  <img src={value} alt="cover" className="aspect-video w-full object-cover" />
                )}
              </div>
              <button type="button" onClick={() => onChange(null)}
                className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-semibold text-white hover:bg-black/80">
                <X className="h-3 w-3" /> Remove
              </button>
            </div>
          ) : (
            <DropZone onFiles={upload} uploading={uploading} />
          )}
          {uploading && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-[#ff6600] transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]/20"
          />
          <button type="button" onClick={() => onChange(urlInput || null)}
            className="rounded-lg bg-[#ff6600] px-3 py-2 text-sm font-semibold text-white hover:bg-[#e55a00]">
            Set
          </button>
        </div>
      )}

      {err && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {err}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   GALLERY UPLOADER  (multiple images/videos)
───────────────────────────────────────────── */
export function GalleryUploader({
  values, onChange, userId,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
  userId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const upload = useCallback(async (files: File[]) => {
    setErr(null);
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadFile(f, userId)));
      onChange([...values, ...urls]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [userId, values, onChange]);

  const remove = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {values.map((url, i) => (
            <MediaThumb key={url + i} url={url} onRemove={() => remove(i)} />
          ))}
        </div>
      )}
      <DropZone onFiles={upload} uploading={uploading} multiple compact={values.length > 0} />
      {err && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {err}
        </p>
      )}
      {values.length > 0 && (
        <p className="text-[11px] text-gray-400">{values.length} file{values.length !== 1 ? "s" : ""} · hover a thumbnail to remove</p>
      )}
    </div>
  );
}
