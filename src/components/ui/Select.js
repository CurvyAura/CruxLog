"use client";

export default function Select({ className = "", children, ...props }) {
  return (
    <select className={`control select ${className} fade-in-up`} {...props}>
      {children}
    </select>
  );
}

