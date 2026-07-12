"use client";

import { ArrowRight, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  previewBase64: string | null;
  title?: string;
};

export function DocumentPreviewModal({
  open,
  onClose,
  previewBase64,
  title = "תצוגה מקדימה",
}: Props) {
  return (
    <Modal open={open} onClose={onClose} align="top" panelClassName="max-w-4xl">
      <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[min(90dvh,820px)]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border-soft shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </button>
          <h3 className="text-[14px] font-bold text-text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="p-2 rounded-xl text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-bg">
          {previewBase64 ? (
            <iframe
              title={title}
              src={`data:application/pdf;base64,${previewBase64}`}
              className="w-full h-[min(75dvh,700px)] border-0"
            />
          ) : (
            <div className="flex items-center justify-center h-[min(75dvh,700px)] text-[13px] text-text-tertiary">
              אין תצוגה מקדימה
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border-soft shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-[13px] font-semibold text-text-primary hover:bg-surface-hover transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה לטופס
          </button>
        </div>
      </div>
    </Modal>
  );
}
