"use client";

import Badge from "./ui/Badge";

export default function ResultBadge({ result }) {
  if (result === "send") return <Badge tone="success">Send</Badge>;
  if (result === "fail") return <Badge tone="danger">Fail</Badge>;
  return <Badge tone="muted">Attempt</Badge>;
}
