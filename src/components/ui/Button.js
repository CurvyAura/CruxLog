"use client";

export default function Button({ children, className = "", variant = "default", size = "md", ...props }) {
  const base = "btn inline-flex items-center justify-center text-sm font-medium transition-colors focus:outline-none";
  const variants = {
    default: "btn-primary",
    ghost: "btn-ghost",
    destructive: "btn-destructive",
  };
  const sizes = { sm: "btn-sm", md: "" };
  const cls = `${base} ${variants[variant] || variants.default} ${sizes[size] || ""} ${className}`.trim();
  return (
    <button className={`${cls} fade-in-up`} {...props}>
      {children}
    </button>
  );
}
