"use client";
import { useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ── Pinch-zoom + pan hook ────────────────────────────────────────────────────
function usePinchPan(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const lastDist = useRef<number | null>(null);
  const lastMid = useRef<{ x: number; y: number } | null>(null);
  const lastSingle = useRef<{ x: number; y: number } | null>(null);

  // How far the pdf can travel at a given scale:
  // the "extra" pixels beyond the container size = (scale - 1) * containerSize / 2
  function clamp(val: number, s: number, axis: "x" | "y") {
    const el = containerRef.current;
    if (!el) return val;
    const size = axis === "x" ? el.clientWidth : el.clientHeight;
    const max = ((s - 1) * size) / 2;
    return Math.min(max, Math.max(-max, val));
  }

  function dist(t: React.TouchList) {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function mid(t: React.TouchList) {
    return {
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    };
  }

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      lastDist.current = dist(e.touches);
      lastMid.current = mid(e.touches);
      lastSingle.current = null;
    } else if (e.touches.length === 1 && scaleRef.current > 1) {
      lastSingle.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault();

    if (
      e.touches.length === 2 &&
      lastDist.current !== null &&
      lastMid.current !== null
    ) {
      const newDist = dist(e.touches);
      const newMid = mid(e.touches);
      const ratio = newDist / lastDist.current;
      const newScale = Math.min(5, Math.max(1, scaleRef.current * ratio));

      const dx = newMid.x - lastMid.current.x;
      const dy = newMid.y - lastMid.current.y;
      const newTranslate = {
        x: clamp(translateRef.current.x + dx, newScale, "x"),
        y: clamp(translateRef.current.y + dy, newScale, "y"),
      };

      scaleRef.current = newScale;
      translateRef.current = newTranslate;
      lastDist.current = newDist;
      lastMid.current = newMid;

      setScale(newScale);
      setTranslate({ ...newTranslate });
    } else if (
      e.touches.length === 1 &&
      lastSingle.current !== null &&
      scaleRef.current > 1
    ) {
      const dx = e.touches[0].clientX - lastSingle.current.x;
      const dy = e.touches[0].clientY - lastSingle.current.y;
      const newTranslate = {
        x: clamp(translateRef.current.x + dx, scaleRef.current, "x"),
        y: clamp(translateRef.current.y + dy, scaleRef.current, "y"),
      };

      translateRef.current = newTranslate;
      lastSingle.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      setTranslate({ ...newTranslate });
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) {
      lastDist.current = null;
      lastMid.current = null;
    }
    if (e.touches.length === 0) {
      lastSingle.current = null;
      if (scaleRef.current <= 1) {
        scaleRef.current = 1;
        translateRef.current = { x: 0, y: 0 };
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
    }
  }

  function reset() {
    scaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }

  return { scale, translate, onTouchStart, onTouchMove, onTouchEnd, reset };
}

// ── Component ────────────────────────────────────────────────────────────────
export function MobilePdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoom = usePinchPan(containerRef);

  const previewWidth =
    typeof window !== "undefined" ? window.innerWidth - 64 : 300;
  const fullscreenWidth =
    typeof window !== "undefined" ? window.innerWidth : 390;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }
  function onDocumentLoadError() {
    setError(true);
    setLoading(false);
  }
  function exitFullscreen() {
    zoom.reset();
    setFullscreen(false);
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-xs text-red-500">failed to load pdf.</p>
        <a
          href={url}
          download
          className="inline-block text-xs border border-primary px-4 py-2 text-primary hover:bg-primary hover:text-background transition-colors"
        >
          ↓ download resume.pdf
        </a>
      </div>
    );
  }

  // ── Fullscreen overlay ─────────────────────────────────────────────────────
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[60] bg-background flex flex-col">
        <div className="bg-primary text-background px-4 py-2 flex items-center justify-between shrink-0 font-mono text-sm">
          <span>RESUME</span>
          <div className="flex items-center gap-4">
            {zoom.scale > 1 && (
              <button
                onClick={zoom.reset}
                className="text-xs opacity-70 hover:opacity-100 transition-opacity font-mono"
              >
                reset
              </button>
            )}
            <button
              onClick={exitFullscreen}
              className="hover:opacity-70 transition-opacity text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex-1 overflow-hidden flex items-center justify-center bg-background select-none"
          style={{ touchAction: "none", userSelect: "none" }}
          onTouchStart={zoom.onTouchStart}
          onTouchMove={zoom.onTouchMove}
          onTouchEnd={zoom.onTouchEnd}
        >
          <div
            style={{
              transform: `translate(${zoom.translate.x}px, ${zoom.translate.y}px) scale(${zoom.scale})`,
              transformOrigin: "center center",
              transition: zoom.scale === 1 ? "transform 0.2s ease" : "none",
              willChange: "transform",
            }}
          >
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <Page
                pageNumber={currentPage}
                width={fullscreenWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                loading=""
              />
            </Document>
          </div>
        </div>

        <div className="text-center py-1 text-[10px] text-foreground/30 font-mono shrink-0">
          pinch to zoom · drag to pan
        </div>

        {numPages > 0 && (
          <div
            className="flex items-center justify-between font-mono text-xs text-primary px-4 py-3 border-t border-primary/20 shrink-0 bg-background"
            style={{ touchAction: "manipulation" }}
          >
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                zoom.reset();
              }}
              disabled={currentPage <= 1}
              className="px-3 py-1 border border-primary disabled:opacity-30"
            >
              ← prev
            </button>
            <span className="text-foreground/40">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(numPages, p + 1));
                zoom.reset();
              }}
              disabled={currentPage >= numPages}
              className="px-3 py-1 border border-primary disabled:opacity-30"
            >
              next →
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Normal preview ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <div
        className="w-full border border-primary/20 overflow-hidden flex items-center justify-center bg-background relative cursor-pointer"
        onClick={() => setFullscreen(true)}
      >
        {loading && (
          <p className="text-xs text-foreground/40 py-8">loading pdf...</p>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
        >
          <Page
            pageNumber={currentPage}
            width={previewWidth}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            loading=""
          />
        </Document>
        {!loading && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
            <span className="bg-black/60 text-white font-mono text-[10px] px-2 py-1">
              tap to expand + zoom
            </span>
          </div>
        )}
      </div>

      {!loading && numPages > 1 && (
        <div className="flex items-center justify-between font-mono text-xs text-primary">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1 border border-primary disabled:opacity-30 hover:bg-primary hover:text-background transition-colors"
          >
            ← prev
          </button>
          <span className="text-foreground/40">
            {currentPage} / {numPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
            className="px-3 py-1 border border-primary disabled:opacity-30 hover:bg-primary hover:text-background transition-colors"
          >
            next →
          </button>
        </div>
      )}

      <a
        href={url}
        download
        className="text-xs text-foreground/40 hover:text-primary transition-colors underline underline-offset-4"
      >
        ↓ download resume.pdf
      </a>
    </div>
  );
}
