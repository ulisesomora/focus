import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabel?: string;
  maxWidthClass?: string;
};

export function BottomSheet({
  open,
  onClose,
  children,
  ariaLabel = "Modal",
  maxWidthClass = "max-w-lg",
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousSheetState = document.body.dataset.bottomSheetOpen;

    document.body.style.overflow = "hidden";
    document.body.dataset.bottomSheetOpen = "true";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousSheetState) {
        document.body.dataset.bottomSheetOpen = previousSheetState;
      } else {
        delete document.body.dataset.bottomSheetOpen;
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`relative z-10 w-full ${maxWidthClass} overflow-y-auto overscroll-contain rounded-[24px] bg-white px-5 py-5 shadow-2xl sm:px-6 sm:py-6`}
        style={{
          maxHeight: "min(86dvh, 760px)",
          paddingBottom: "max(20px, env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </section>
    </div>,
    document.body,
  );
}
