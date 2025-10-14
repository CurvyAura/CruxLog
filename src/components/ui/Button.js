"use client";

export default function Button({ children, className = "", variant = "default", ...props }) {
  const base = "btn inline-flex items-center justify-center text-sm font-medium transition-colors focus:outline-none";
  const variants = {
    default: "btn-primary",
    ghost: "btn-ghost",
    destructive: "btn-destructive",
  };
  const cls = `${base} ${variants[variant] || variants.default} ${className}`;
  return (
    <button className={`${cls} fade-in-up`} {...props}>
      {children}
    </button>
  );
}
