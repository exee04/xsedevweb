"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker must be configured in the same file as Document/Page
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function MobilePdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError() {
    setError(true);
    setLoading(false);
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

  return (
    <div className="flex flex-col gap-4">
      {/* Page render */}
      <div className="w-full border border-primary/20 overflow-hidden flex items-center justify-center bg-background">
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
            // Fill the panel width minus padding (px-4 = 16px each side)
            width={
              typeof window !== "undefined"
                ? Math.min(window.innerWidth - 64, 480)
                : 320
            }
            renderAnnotationLayer={false}
            renderTextLayer={false}
            loading=""
          />
        </Document>
      </div>

      {/* Pagination controls — only show once loaded */}
      {!loading && numPages > 0 && (
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

      {/* Download fallback */}
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
