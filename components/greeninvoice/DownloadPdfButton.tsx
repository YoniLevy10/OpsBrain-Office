"use client";

import { FileDown } from "lucide-react";

export function DownloadPdfButton({
  documentId,
  pdfUrl,
  className,
}: {
  documentId?: string;
  pdfUrl?: string;
  className?: string;
}) {
  async function openPdf() {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
      return;
    }
    if (!documentId) return;
    const res = await fetch(`/api/greeninvoice/documents/${documentId}/download`);
    const data = await res.json();
    if (data.ok && data.pdfUrl) {
      window.open(data.pdfUrl, "_blank");
    }
  }

  if (!documentId && !pdfUrl) return null;

  return (
    <button
      type="button"
      onClick={openPdf}
      title="הורד PDF"
      className={
        className ??
        "p-1.5 rounded-lg text-text-tertiary hover:text-blue hover:bg-blue/5 transition-colors"
      }
    >
      <FileDown className="w-4 h-4" />
    </button>
  );
}
