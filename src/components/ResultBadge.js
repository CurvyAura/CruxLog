"use client";

import Badge from "./ui/Badge";

export default function ResultBadge({ result }) {
  if (result === "send") return <Badge tone="success">Send</Badge>;
  // any non-send result is treated as an Attempt
  return <Badge tone="muted">Attempt</Badge>;
}
