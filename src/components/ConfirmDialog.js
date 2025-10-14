"use client";

import { Dialog } from "./ui/Dialog";
import Button from "./ui/Button";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>Delete</Button>
      </div>
    </Dialog>
  );
}
