"use client";

export function Dialog({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="dialog-content max-w-sm w-full scale-in">
        {children}
      </div>
    </div>
  );
}

