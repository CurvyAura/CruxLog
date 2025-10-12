"use client";

/**
 * Reusable confirmation dialog used for destructive actions.
 * Props:
 * - open: boolean whether to show the dialog
 * - title: dialog title
 * - message: explanatory message
 * - onConfirm: callback invoked when user confirms
 * - onCancel: callback invoked when user cancels
 */
export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background text-foreground p-6 rounded shadow max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
        </div>
      </div>
    </div>
  );
}
