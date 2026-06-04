import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

interface QrModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function QrModal({ url, title, onClose }: QrModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Sheet / dialog */}
      <div
        className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-6 pb-10 pt-6 sm:rounded-3xl sm:pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag pill (mobile) */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-sm font-semibold text-gray-900">Scan to open</p>
            <p className="mt-0.5 text-xs text-gray-400 truncate max-w-[200px]">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* QR Code */}
        <div className="mt-6 flex justify-center">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={url}
              size={220}
              bgColor="#ffffff"
              fgColor="#111111"
              level="M"
              imageSettings={{
                src: "/favicon.ico",
                x: undefined,
                y: undefined,
                height: 28,
                width: 28,
                excavate: true,
              }}
            />
          </div>
        </div>

        {/* URL label */}
        <p className="mt-4 text-center font-mono text-[11px] text-gray-400 break-all px-2">
          {url}
        </p>
      </div>
    </div>
  );
}
